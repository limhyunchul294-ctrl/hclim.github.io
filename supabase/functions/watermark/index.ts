// Edge Function: watermark/index.ts (CORS 헤더 추가 버전)

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { PDFDocument, rgb } from 'https://esm.sh/pdf-lib@1.17.1'; 

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''; 
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? ''; 

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS, HEAD, PUT, DELETE",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey, Accept",
  "Access-Control-Max-Age": "3600",
  "Access-Control-Allow-Credentials": "false",
};

serve(async (req) => {
    // OPTIONS 요청 처리 (CORS preflight)
    if (req.method === "OPTIONS") {
        console.log("✅ OPTIONS request received (CORS preflight)");
        return new Response(null, { 
            status: 200, 
            headers: corsHeaders 
        });
    }

    const url = new URL(req.url);
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'Unauthorized: Missing token' }), { 
            status: 401,
            headers: {
                ...corsHeaders,
                "Content-Type": "application/json"
            }
        });
    }
    const token = authHeader.substring('Bearer '.length);

    // 사용자 인증 (클라이언트 토큰 사용)
    const supabaseClientAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { 
        global: { headers: { Authorization: `Bearer ${token}` } } 
    });

    const { data: { user } } = await supabaseClientAuth.auth.getUser(token);
    if (!user) {
        return new Response(JSON.stringify({ error: 'Forbidden: Invalid user session' }), { 
            status: 403,
            headers: {
                ...corsHeaders,
                "Content-Type": "application/json"
            }
        });
    }
    
    // Storage 접근 클라이언트 (Service Role Key 사용)
    const supabaseClientStorage = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` } }
    });

    const bucket = url.searchParams.get('bucket');
    const file = url.searchParams.get('file');
    const watermarkText = url.searchParams.get('watermark');
    const startPage = parseInt(url.searchParams.get('start') || '1');
    const endPage = parseInt(url.searchParams.get('end') || '9999'); 

    if (!bucket || !file || !watermarkText) {
        return new Response(JSON.stringify({ error: 'Bad Request: Missing bucket, file, or watermark' }), { 
            status: 400,
            headers: {
                ...corsHeaders,
                "Content-Type": "application/json"
            }
        });
    }

    try {
        // Storage에서 PDF 파일 다운로드
        const { data: fileData, error: storageError } = await supabaseClientStorage.storage.from(bucket).download(file);
        
        if (storageError || !fileData) {
            console.error('Storage Download Error:', storageError?.message);
            return new Response(JSON.stringify({ error: 'File Not Found or Access Denied' }), { 
                status: 404,
                headers: {
                    ...corsHeaders,
                    "Content-Type": "application/json"
                }
            });
        }
        
        const arrayBuffer = await fileData.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        
        // 페이지 추출 및 워터마크 삽입
        const newPdfDoc = await PDFDocument.create();
        const totalPages = pdfDoc.getPageCount();
        const actualEndPage = Math.min(endPage, totalPages);
        
        if (startPage > actualEndPage || startPage < 1) {
            return new Response(JSON.stringify({ error: 'Bad Request: Invalid page range' }), { 
                status: 400,
                headers: {
                    ...corsHeaders,
                    "Content-Type": "application/json"
                }
            });
        }
        
        const pagesToExtract = [];
        for (let i = startPage - 1; i < actualEndPage; i++) {
            pagesToExtract.push(i);
        }
        
        const copiedPages = await newPdfDoc.copyPages(pdfDoc, pagesToExtract);
        
        for (const page of copiedPages) {
            newPdfDoc.addPage(page);
            
            // 워터마크 로직
            const { width, height } = page;
            page.drawText(watermarkText, {
                x: width / 2 - 150,
                y: height / 2,
                size: 20,
                color: rgb(0.5, 0.5, 0.5),
                opacity: 0.2,
                rotate: { x: width / 2, y: height / 2, angle: Math.PI / 4 }
            });
        }
        
        const pdfBytes = await newPdfDoc.save();
        
        return new Response(pdfBytes, {
            status: 200,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${file.split('/').pop()}"`
            },
        });

    } catch (e) {
        console.error('Edge Function Internal Error:', e);
        const errorMessage = e instanceof Error ? e.message : String(e);
        return new Response(JSON.stringify({ 
            error: 'Internal Server Error during PDF processing',
            details: errorMessage
        }), { 
            status: 500,
            headers: {
                ...corsHeaders,
                "Content-Type": "application/json"
            }
        });
    }
});
