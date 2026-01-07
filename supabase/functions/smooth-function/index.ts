import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import { PDFDocument, rgb } from "https://esm.sh/pdf-lib@1.17.1";
import { decode as base64Decode } from "https://deno.land/std@0.208.0/encoding/base64.ts";
import { Image, encode } from "https://deno.land/x/imagescript@1.2.15/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS, HEAD, PUT, DELETE",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey, Accept",
  "Access-Control-Max-Age": "3600",
  "Access-Control-Allow-Credentials": "false",
};

console.log("✅ smooth-function initialized");

serve(async (req: Request) => {
  // OPTIONS 요청 처리 (CORS preflight) - 가장 먼저 처리
  // 이 부분은 함수 실행 전에 처리되어야 함
  if (req.method === "OPTIONS") {
    console.log("✅ OPTIONS request received (CORS preflight)");
    return new Response(null, { 
      status: 200, 
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS, HEAD, PUT, DELETE",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey, Accept",
        "Access-Control-Max-Age": "3600",
        "Access-Control-Allow-Credentials": "false",
      }
    });
  }
  
  try {
    // 모든 요청 처리
    const response = await handleRequest(req);
    
    // CORS 헤더 추가 (모든 응답에)
    // Response 객체를 복제하고 헤더 추가
    const newResponse = response.clone();
    
    // 모든 CORS 헤더를 새 Response에 추가
    Object.entries(corsHeaders).forEach(([key, value]) => {
      newResponse.headers.set(key, value);
    });
    
    return newResponse;
  } catch (error) {
    console.error("❌ Unhandled error in serve:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error details:", errorMessage);
    
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        details: errorMessage
      }),
      { 
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  }
});

async function handleRequest(req: Request): Promise<Response> {
  // GET/POST만 처리 (OPTIONS는 이미 serve에서 처리됨)
  if (req.method !== "GET" && req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    console.log("📨 Request received:", req.method, req.url);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 요청 본문 또는 URL 파라미터에서 데이터 추출
    let bucket: string | null = null;
    let file: string | null = null;
    let watermark = "CONFIDENTIAL";
    let watermarkImage: string | null = null;
    let start: number | null = null;
    let end: number | null = null;

    // 요청 본문 파싱 (한 번만)
    let requestBody: any = null;
    if (req.method === "POST") {
      try {
        requestBody = await req.json();
        bucket = requestBody.bucket || null;
        file = requestBody.file || null;
        watermark = requestBody.watermark || "CONFIDENTIAL";
        watermarkImage = requestBody.watermarkImage || null;
        // start와 end가 명시적으로 전달된 경우만 사용, 없으면 null (전체 페이지)
        start = requestBody.start !== undefined ? requestBody.start : null;
        end = requestBody.end !== undefined ? requestBody.end : null;
      } catch (e) {
        console.error("❌ Failed to parse request body:", e);
      }
    } else {
      // GET 요청: URL 파라미터에서 데이터 추출
      const url = new URL(req.url);
      bucket = url.searchParams.get("bucket");
      file = url.searchParams.get("file");
      watermark = url.searchParams.get("watermark") || "CONFIDENTIAL";
      watermarkImage = url.searchParams.get("watermarkImage");
      const startParam = url.searchParams.get("start");
      const endParam = url.searchParams.get("end");
      start = startParam ? parseInt(startParam) : null;
      end = endParam ? parseInt(endParam) : null;
    }

    // 사용자 인증 정보 추출
    const token = authHeader.replace("Bearer ", "");
    let displayUsername = watermark;
    let usernameFromClient = null;
    
    // POST 요청의 경우 클라이언트에서 username을 전달받을 수 있음
    if (req.method === "POST" && requestBody) {
      usernameFromClient = requestBody.username || null;
      console.log(`📥 Request body username: ${usernameFromClient}`);
      if (usernameFromClient && usernameFromClient !== 'USER') {
        console.log(`👤 Username from client: ${usernameFromClient}`);
        displayUsername = usernameFromClient;
      } else {
        console.warn(`⚠️ Username from client is invalid or default: ${usernameFromClient}`);
      }
    }
    
    // 클라이언트에서 username을 받지 못한 경우에만 데이터베이스 조회
    if (!usernameFromClient) {
      try {
        // JWT 토큰에서 사용자 정보 추출 시도
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (!authError && user) {
          // 데이터베이스에서 username 조회 (여러 방법 시도)
          let userData = null;
          let userError = null;
          
          // 방법 1: auth_user_id로 조회 (올바른 컬럼명)
          const result1 = await supabase
            .from("users")
            .select("username")
            .eq("auth_user_id", user.id)
            .single();
          
          if (!result1.error && result1.data && result1.data.username) {
            userData = result1.data;
            displayUsername = result1.data.username;
            console.log(`✅ Found username using auth_user_id: ${displayUsername}`);
          } else {
            console.warn(`⚠️ Method 1 failed (auth_user_id):`, result1.error);
            // 방법 2: email로 조회
            if (user.email) {
              const result2 = await supabase
                .from("users")
                .select("username")
                .eq("email", user.email)
                .single();
              
              if (!result2.error && result2.data && result2.data.username) {
                userData = result2.data;
                displayUsername = result2.data.username;
                console.log(`✅ Found username using email: ${displayUsername}`);
              } else {
                console.warn(`⚠️ Method 2 failed (email):`, result2.error);
                userError = result2.error;
              }
            } else {
              userError = result1.error;
            }
          }

          // userData가 설정되지 않은 경우 email 사용
          if (!displayUsername || displayUsername === watermark) {
            if (userData && userData.username) {
              displayUsername = userData.username;
              console.log(`👤 Username from database: ${displayUsername}`);
            } else {
              console.warn("⚠️ Could not fetch username from database:", userError);
              // email을 사용
              if (user.email) {
                displayUsername = user.email.split('@')[0];
                console.log(`👤 Using email prefix as username: ${displayUsername}`);
              }
            }
          }
        }
      } catch (authErr) {
        console.warn("⚠️ Auth error:", authErr);
      }
    }

    if (!bucket || !file) {
      return new Response(
        JSON.stringify({ error: "Missing bucket or file parameter" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`📥 Downloading: ${bucket}/${file}`);
    console.log(`🔐 Watermark: ${watermark}`);
    console.log(`📄 Page range: ${start}-${end}`);

    // Storage bucket에서 파일 다운로드
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucket)
      .download(file);
    
    if (downloadError || !fileData) {
      console.error("❌ Download error:", downloadError);
      console.error(`❌ Bucket: ${bucket}, File: ${file}`);
      
      // bucket이 존재하지 않는 경우를 확인하기 위해 bucket 목록 조회
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (!bucketsError && buckets) {
        const bucketNames = buckets.map(b => b.name);
        console.error(`❌ Available buckets: ${bucketNames.join(', ')}`);
        if (!bucketNames.includes(bucket)) {
          return new Response(
            JSON.stringify({
              error: "Bucket not found",
              details: `Bucket "${bucket}" does not exist. Available buckets: ${bucketNames.join(', ')}`,
            }),
            {
              status: 404,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
      }
      
      return new Response(
        JSON.stringify({
          error: "File download failed",
          details: downloadError?.message || `File "${file}" not found in bucket "${bucket}"`,
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    console.log("✅ File downloaded successfully");
    console.log(`✅ File size: ${fileData.size} bytes (${(fileData.size / 1024 / 1024).toFixed(2)} MB)`);
    
    // 파일 크기 제한 체크 (50MB)
    const maxFileSize = 50 * 1024 * 1024; // 50MB
    if (fileData.size > maxFileSize) {
      return new Response(
        JSON.stringify({
          error: "File too large",
          details: `File size ${(fileData.size / 1024 / 1024).toFixed(2)} MB exceeds maximum of ${(maxFileSize / 1024 / 1024).toFixed(2)} MB`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const isPDF = file.toLowerCase().endsWith(".pdf");
    const isImage = /\.(jpeg|jpg|png|gif|webp)$/i.test(file);
    
    // 이미지 파일 처리
    if (isImage) {
      console.log("🖼️ Processing image file...");
      try {
        const imageBytes = await fileData.arrayBuffer();
        const imageBuffer = new Uint8Array(imageBytes);
        
        // 이미지에 워터마크 추가
        const watermarkedImage = await addWatermarkToImage(
          imageBuffer,
          watermarkImage || null,
          displayUsername,
          watermark
        );
        
        console.log(`✅ Image processed successfully: ${(watermarkedImage.length / 1024 / 1024).toFixed(2)} MB`);
        
        // Content-Type 결정
        let contentType = "image/jpeg";
        if (file.toLowerCase().endsWith(".png")) contentType = "image/png";
        else if (file.toLowerCase().endsWith(".gif")) contentType = "image/gif";
        else if (file.toLowerCase().endsWith(".webp")) contentType = "image/webp";
        
        return new Response(watermarkedImage.buffer, {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": contentType,
            "Content-Disposition": `inline; filename="${file}"`,
          },
        });
      } catch (error) {
        console.error("❌ Image processing error:", error);
        // 에러 발생 시 원본 이미지 반환
        console.warn("⚠️ Returning original image due to processing error");
        const bytes = await fileData.arrayBuffer();
        return new Response(bytes, {
          headers: {
            ...corsHeaders,
            "Content-Type": fileData.type,
            "Content-Disposition": `inline; filename="${file}"`,
          },
        });
      }
    }
    
    // PDF도 이미지도 아닌 경우 그대로 반환
    if (!isPDF) {
      console.log("📄 Non-PDF/Non-Image file, returning as-is");
      const bytes = await fileData.arrayBuffer();
      return new Response(bytes, {
        headers: {
          ...corsHeaders,
          "Content-Type": fileData.type,
          "Content-Disposition": `inline; filename="${file}"`,
        },
      });
    }

    // 이미지 워터마크 추가 함수 (클라이언트에서 전달받은 워터마크 이미지 오버레이)
    async function addWatermarkToImage(
      imageBytes: Uint8Array,
      watermarkImageBase64: string | null,
      username: string,
      watermarkText: string
    ): Promise<Uint8Array> {
      try {
        // 워터마크 이미지가 없으면 원본 이미지 반환
        if (!watermarkImageBase64) {
          console.log("⚠️ No watermark image provided, returning original image");
          return imageBytes;
        }

        console.log("🖼️ Starting image watermark overlay...");
        
        // 원본 이미지 로드
        let sourceImage: Image;
        try {
          sourceImage = await Image.decode(imageBytes);
          console.log(`✅ Source image decoded: ${sourceImage.width}x${sourceImage.height}`);
        } catch (decodeError) {
          console.error("❌ Failed to decode source image:", decodeError);
          return imageBytes;
        }

        // 워터마크 이미지 디코딩
        let watermarkImage: Image;
        try {
          // base64 데이터에서 data URL prefix 제거
          const base64Data = watermarkImageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
          const watermarkBytes = base64Decode(base64Data);
          watermarkImage = await Image.decode(watermarkBytes);
          console.log(`✅ Watermark image decoded: ${watermarkImage.width}x${watermarkImage.height}`);
        } catch (decodeError) {
          console.error("❌ Failed to decode watermark image:", decodeError);
          return imageBytes;
        }

        // 워터마크 투명도 조정 (약 20% 투명도)
        watermarkImage = watermarkImage.opacity(0.2);

        // 원본 이미지 복사 (원본 유지)
        const watermarkedImage = sourceImage.clone();

        // 워터마크를 반복 패턴으로 오버레이 (격자 형태)
        const watermarkWidth = watermarkImage.width;
        const watermarkHeight = watermarkImage.height;
        const cols = Math.ceil(sourceImage.width / watermarkWidth) + 1;
        const rows = Math.ceil(sourceImage.height / watermarkHeight) + 1;

        console.log(`📐 Applying watermark pattern: ${cols}x${rows} (${cols * rows} watermarks)`);

        // 워터마크를 격자 형태로 배치
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const x = col * watermarkWidth - (watermarkWidth / 4); // 약간의 오프셋으로 자연스러운 배치
            const y = row * watermarkHeight - (watermarkHeight / 4);

            // 이미지 범위 내에 있는 경우에만 워터마크 추가
            if (x + watermarkWidth > 0 && y + watermarkHeight > 0 && 
                x < sourceImage.width && y < sourceImage.height) {
              try {
                watermarkedImage.composite(watermarkImage, x, y);
              } catch (compositeError) {
                console.warn(`⚠️ Failed to composite watermark at (${x}, ${y}):`, compositeError);
              }
            }
          }
        }

        console.log("✅ Watermark overlay completed");

        // 이미지를 JPEG 형식으로 인코딩 (JPEG는 가장 호환성이 좋음)
        const encodedImage = await encode(watermarkedImage, { format: "jpeg", quality: 90 });
        console.log(`✅ Image encoded: ${(encodedImage.length / 1024).toFixed(2)} KB`);

        return new Uint8Array(encodedImage);
      } catch (error) {
        console.error("❌ Image watermark error:", error);
        console.error("❌ Error details:", error instanceof Error ? error.stack : String(error));
        // 에러 발생 시 원본 이미지 반환
        console.warn("⚠️ Returning original image due to watermark error");
        return imageBytes;
      }
    }

    console.log("📄 Processing PDF...");
    
    // PDF 로드 시 메모리 사용량 모니터링
    let pdfBytes: ArrayBuffer;
    try {
      pdfBytes = await fileData.arrayBuffer();
      console.log(`✅ PDF loaded into memory: ${(pdfBytes.byteLength / 1024 / 1024).toFixed(2)} MB`);
    } catch (error) {
      console.error("❌ Failed to load PDF into memory:", error);
      return new Response(
        JSON.stringify({
          error: "PDF load failed",
          details: error instanceof Error ? error.message : String(error),
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // PDF 로드 (한 번만 로드하여 메모리 사용량 최소화)
    console.log("📚 Loading PDF document...");
    let pdfDoc: PDFDocument;
    try {
      // 메모리 최적화: 페이지 범위가 지정된 경우, 더 가벼운 옵션 사용
      const loadOptions = (start !== null && end !== null) 
        ? { ignoreEncryption: false, capNumbers: false, parseSpeed: 1 } // 페이지 범위가 있을 때 더 빠른 파싱
        : {}; // 전체 문서 처리 시 기본 옵션
      
      pdfDoc = await PDFDocument.load(pdfBytes, loadOptions);
      const totalPages = pdfDoc.getPages().length;
      console.log(`📄 Total pages in PDF: ${totalPages}`);
      
      // 페이지 범위 결정
      let finalStart: number;
      let finalEnd: number;
      
      if (start === null || end === null) {
        // 페이지 범위가 없으면 전체 문서 처리 (TSB 등)
        finalStart = 1;
        finalEnd = totalPages;
        console.log(`📄 No page range specified, processing entire document: 1 to ${totalPages}`);
        
        // 전체 문서 처리 시 최대 페이지 수 제한 (메모리 보호)
        const maxTotalPages = 200;
        if (totalPages > maxTotalPages) {
          return new Response(
            JSON.stringify({
              error: "Document too large",
              details: `Document has ${totalPages} pages, which exceeds the maximum of ${maxTotalPages} pages for full document processing. Please specify a page range.`,
            }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
      } else {
        // 페이지 범위가 지정된 경우
        finalStart = start;
        finalEnd = end;
        
        // 페이지 범위 유효성 검사
        if (finalStart < 1 || finalEnd > totalPages || finalStart > finalEnd) {
          return new Response(
            JSON.stringify({
              error: "Invalid page range",
              details: `Page range ${finalStart}-${finalEnd} is invalid for a PDF with ${totalPages} pages`,
            }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        
        // 페이지 범위가 지정된 경우 더 엄격한 제한
        // 파일 크기에 따라 동적으로 제한 조정 (메모리 보호)
        const fileSizeMB = pdfBytes.byteLength / 1024 / 1024;
        const maxPageRange = fileSizeMB > 20 ? 30 : 50; // 20MB 이상이면 최대 30페이지
        if (finalEnd - finalStart + 1 > maxPageRange) {
          return new Response(
            JSON.stringify({
              error: "Page range too large",
              details: `Page range ${finalEnd - finalStart + 1} exceeds maximum of ${maxPageRange} pages for specified ranges (file size: ${fileSizeMB.toFixed(2)} MB)`,
            }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        
        console.log(`📄 Processing specified page range: ${finalStart} to ${finalEnd}`);
      }
      
      console.log(`📄 Processing pages: ${finalStart} to ${finalEnd} (of ${totalPages} total)`);
      console.log(`📄 Processing ${finalEnd - finalStart + 1} pages`);
      
      // 이미 로드된 PDF 문서를 직접 사용하여 워터마크 추가
      let watermarkedPDF: Uint8Array;
      try {
        watermarkedPDF = await addWatermarkToPDFDirect(pdfDoc, displayUsername, finalStart, finalEnd, watermarkImage, displayUsername);
        console.log(`✅ PDF processed successfully: ${(watermarkedPDF.length / 1024 / 1024).toFixed(2)} MB`);
        
        // Uint8Array를 ArrayBuffer로 변환
        const pdfBuffer = watermarkedPDF.buffer instanceof ArrayBuffer 
          ? watermarkedPDF.buffer 
          : new Uint8Array(watermarkedPDF).buffer;
        
        return new Response(pdfBuffer, {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${file}"`,
          },
        });
      } catch (error) {
        console.error("❌ PDF processing error:", error);
        console.error("❌ Error details:", error instanceof Error ? error.stack : String(error));
        return new Response(
          JSON.stringify({
            error: "PDF processing failed",
            details: error instanceof Error ? error.message : String(error),
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    } catch (loadError) {
      console.error("❌ PDF load error:", loadError);
      return new Response(
        JSON.stringify({
          error: "PDF load failed",
          details: loadError instanceof Error ? loadError.message : String(loadError),
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

  } catch (error) {
    console.error("❌ Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error details:", errorMessage);
    if (error instanceof Error && error.stack) {
      console.error("❌ Stack trace:", error.stack);
    }
    return new Response(
      JSON.stringify({ 
        error: "Server error",
        details: errorMessage 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * 이미 로드된 PDF 문서에 워터마크 추가 (메모리 최적화)
 */
async function addWatermarkToPDFDirect(
  pdfDoc: PDFDocument,
  watermarkText: string,
  startPage: number,
  endPage: number,
  watermarkImage: string | null = null,
  username: string | null = null
): Promise<Uint8Array> {
  try {
    const pages = pdfDoc.getPages();
    console.log(`📄 Total pages: ${pages.length}`);

    const actualStart = Math.max(0, startPage - 1);
    const actualEnd = Math.min(pages.length, endPage);
    console.log(`✂️ Processing pages ${actualStart + 1} to ${actualEnd}`);

    const newPdfDoc = await PDFDocument.create();

    // 워터마크 텍스트를 이미지로 변환 (영문 워터마크 사용)
    console.log("🖼️ Creating watermark image from text...");
    console.log(`📝 Watermark text: "${watermarkText}"`);
    console.log(`👤 Display username for watermark: "${username || 'not provided'}"`);
    const watermarkImageBytes = await createWatermarkImage(watermarkText, watermarkImage || undefined, username || undefined);
    const embeddedWatermarkImage = await newPdfDoc.embedPng(watermarkImageBytes);
    console.log("✅ Watermark image created and embedded");

    // 페이지 처리 (배치 처리로 메모리 사용량 최적화)
    // 페이지 범위가 작을수록 더 작은 배치 크기 사용 (메모리 절약)
    const pageCount = actualEnd - actualStart;
    const batchSize = pageCount <= 10 ? 5 : 10; // 10페이지 이하면 배치 크기 5
    let processedPages = 0;
    
    for (let i = actualStart; i < actualEnd; i++) {
      try {
        const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i]);
        const page = newPdfDoc.addPage(copiedPage);
        const { width, height } = page.getSize();

        // 10페이지마다 로그 출력 (너무 많은 로그 방지)
        if (processedPages % 10 === 0 || processedPages === 0) {
          console.log(`📝 Processing page ${i + 1}/${actualEnd} (${processedPages + 1} pages processed)`);
        }

        // 워터마크 이미지를 페이지에 그리기
        await drawWatermarkImageOnPage(page, embeddedWatermarkImage, width, height);
        processedPages++;
        
        // 배치 처리 후 간단한 대기 (메모리 정리 힌트)
        if (processedPages % batchSize === 0 && i < actualEnd - 1) {
          // Deno는 자동으로 가비지 컬렉션을 수행하지만, 명시적으로 힌트 제공
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      } catch (pageError) {
        console.error(`❌ Error processing page ${i + 1}:`, pageError);
        throw new Error(`Failed to process page ${i + 1}: ${pageError instanceof Error ? pageError.message : String(pageError)}`);
      }
    }

    console.log(`💾 Saving PDF... (${processedPages} pages)`);
    let savedPdf: Uint8Array;
    try {
      savedPdf = await newPdfDoc.save();
      console.log(`✅ PDF saved successfully: ${(savedPdf.length / 1024 / 1024).toFixed(2)} MB`);
    } catch (saveError) {
      console.error("❌ PDF save error:", saveError);
      throw new Error(`Failed to save PDF: ${saveError instanceof Error ? saveError.message : String(saveError)}`);
    }

    return savedPdf;
  } catch (error) {
    console.error("❌ PDF processing error:", error);
    throw new Error(
      `PDF processing failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * PDF 바이트에서 워터마크 추가 (레거시 호환성, 사용하지 않음)
 */
async function addWatermarkToPDF(
  pdfBytes: ArrayBuffer,
  watermarkText: string,
  startPage: number,
  endPage: number,
  watermarkImage: string | null = null,
  username: string | null = null
): Promise<Uint8Array> {
  // 이 함수는 더 이상 사용되지 않지만, 호환성을 위해 유지
  const pdfDoc = await PDFDocument.load(pdfBytes);
  return addWatermarkToPDFDirect(pdfDoc, watermarkText, startPage, endPage, watermarkImage, username);
}

/**
 * 텍스트를 PNG 이미지로 변환 (영문 워터마크 사용)
 * 클라이언트에서 base64로 인코딩된 이미지를 받거나, 영문 워터마크 생성
 */
async function createWatermarkImage(text: string, imageBase64?: string, username?: string): Promise<Uint8Array> {
  try {
    // 클라이언트에서 이미지를 base64로 전달한 경우
    if (imageBase64) {
      console.log("📥 Received image from client, length:", imageBase64.length);
      try {
        // base64 디코딩
        const base64Data = imageBase64.replace(/^data:image\/png;base64,/, '');
        console.log("📦 Base64 data length:", base64Data.length);
        
        // Deno에서 안전한 base64 디코딩
        let imageBytes: Uint8Array;
        try {
          // Deno 표준 라이브러리의 base64 디코딩 사용
          imageBytes = base64Decode(base64Data);
        } catch (decodeErr) {
          console.error("❌ Base64 decode error:", decodeErr);
          // 폴백: atob 사용 (브라우저 환경 호환)
          try {
            if (typeof atob !== 'undefined') {
              const binaryString = atob(base64Data);
              imageBytes = Uint8Array.from(binaryString, c => c.charCodeAt(0));
            } else {
              throw new Error("No base64 decoder available");
            }
          } catch (fallbackErr) {
            console.error("❌ Fallback decode also failed:", fallbackErr);
            throw new Error(`Base64 decoding failed: ${decodeErr instanceof Error ? decodeErr.message : String(decodeErr)}`);
          }
        }
        
        console.log("✅ Image decoded successfully, size:", imageBytes.length);
        if (imageBytes.length === 0) {
          throw new Error("Decoded image is empty");
        }
        return imageBytes;
      } catch (decodeError) {
        console.error("❌ Image decode error:", decodeError);
        console.warn("⚠️ Falling back to English watermark with username:", username);
        // 폴백: 영문 워터마크 생성 (전달받은 username 사용)
        return await createEnglishWatermarkImage(text, username);
      }
    }
    
    // Edge Function에서 직접 생성 (폴백): 영문 워터마크 사용
    console.log("📝 Creating English watermark from Edge Function");
    return await createEnglishWatermarkImage(text, username);
    
  } catch (error) {
    console.error("❌ Watermark image creation error:", error);
    // 최종 폴백: 영문 워터마크
    return await createEnglishWatermarkImage(text, username);
  }
}

/**
 * SVG를 PNG로 변환
 * 실제 구현: 외부 API 사용 또는 클라이언트에서 변환
 * 여기서는 간단한 폴백으로 빈 이미지 반환
 */
async function convertSvgToPng(svg: string): Promise<Uint8Array> {
  try {
    // 실제 구현: 외부 SVG-to-PNG 변환 API 사용
    // 예: CloudConvert, api2pdf, 또는 다른 서비스
    
    // 임시 해결책: 간단한 PNG 이미지 생성
    // 실제 프로덕션에서는 외부 서비스 사용 권장
    console.warn("⚠️ SVG to PNG conversion not fully implemented, using fallback");
    return await createSimpleTextImageFromSvg(svg);
  } catch (error) {
    console.error("❌ SVG to PNG conversion error:", error);
    console.warn("⚠️ Falling back to simple text image");
    return await createSimpleTextImageFromSvg(svg);
  }
}

/**
 * 영문 워터마크 이미지 생성 (한글 폰트 문제 해결)
 * 사용자 계정과 날짜/시간을 영문으로 표시
 */
async function createEnglishWatermarkImage(text: string, username?: string): Promise<Uint8Array> {
  try {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = now.toTimeString().split(' ')[0]; // HH:MM:SS
    
    // 영문 워터마크 텍스트 생성
    // username이 제공되면 사용, 없으면 "USER" 사용
    const userIdentifier = username || "USER";
    const englishText = `${userIdentifier} - ${dateStr} ${timeStr}`;
    const displayText = `[${englishText}]`;
    
    console.log(`📝 Creating English watermark: "${displayText}"`);
    
    // 간단한 텍스트 이미지 생성 (영문만 사용)
    // SVG 생성
    const fontSize = 24;
    const estimatedWidth = displayText.length * 8; // 영문은 더 좁음
    const estimatedHeight = fontSize * 1.5;
    
    const svgWidth = estimatedWidth + 40;
    const svgHeight = estimatedHeight + 40;
    
    const svg = `
      <svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
        <text x="${svgWidth / 2}" y="${svgHeight / 2}" 
              font-family="Arial, sans-serif" 
              font-size="${fontSize}px" 
              fill="rgba(128, 128, 128, 0.7)" 
              text-anchor="middle" 
              dominant-baseline="middle">
          ${escapeXml(displayText)}
        </text>
      </svg>
    `.trim();
    
    return await convertSvgToPng(svg);
    
  } catch (error) {
    console.error("❌ English watermark creation error:", error);
    // 최종 폴백: 간단한 텍스트 이미지
    return await createSimpleTextImageFromSvg(`<svg width="300" height="50" xmlns="http://www.w3.org/2000/svg">
      <text x="150" y="25" font-family="Arial, sans-serif" font-size="20" fill="rgba(128,128,128,0.7)" text-anchor="middle">CONFIDENTIAL</text>
    </svg>`);
  }
}

/**
 * 간단한 텍스트 이미지 생성 (폴백)
 * SVG에서 텍스트 추출하여 간단한 이미지 생성
 * 주의: 실제 PNG 이미지 생성은 외부 서비스가 필요하므로, 
 * 여기서는 클라이언트에서 이미지를 받는 방식에 의존
 */
async function createSimpleTextImageFromSvg(svg: string): Promise<Uint8Array> {
  try {
    // SVG에서 텍스트 추출 시도
    const textMatch = svg.match(/<text[^>]*>([^<]+)<\/text>/);
    const text = textMatch ? textMatch[1] : "CONFIDENTIAL";
    
    console.log("📝 Creating simple text image from SVG:", text);
    
    // SVG를 PNG로 변환하는 것은 Deno 환경에서 복잡하므로
    // 실제로는 클라이언트에서 이미지를 받아야 함
    // 여기서는 최소한의 빈 이미지 반환 (실제로는 사용되지 않아야 함)
    console.warn("⚠️ SVG to PNG conversion not available in Deno, should use client-provided image");
    
    // 최소한의 PNG 이미지 (1x1 투명 픽셀)
    // 실제로는 클라이언트에서 이미지를 받아야 하므로 이 경로는 사용되지 않아야 함
    const minimalPng = new Uint8Array([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 image
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89,
      0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, 0x54, // IDAT chunk
      0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01,
      0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, // IEND
      0xAE, 0x42, 0x60, 0x82
    ]);
    
    return minimalPng;
  } catch (error) {
    console.error("❌ Fallback image creation error:", error);
    // 최종 폴백: 최소한의 PNG 이미지
    const minimalPng = new Uint8Array([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89,
      0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, 0x54,
      0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01,
      0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
      0xAE, 0x42, 0x60, 0x82
    ]);
    return minimalPng;
  }
}


/**
 * XML 특수 문자 이스케이프
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function drawWatermarkTextOnPage(
  page: any,
  text: string,
  width: number,
  height: number,
  font: any
) {
  const fontSize = 11;
  const cols = 3;
  const rows = 5;
  const cellWidth = width / cols;
  const cellHeight = height / rows;

  // username 또는 CONFIDENTIAL로 표시
  const displayText = `[${text}]`;

  console.log(`🎨 Drawing watermark: "${displayText}"`);

  let successCount = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * cellWidth + cellWidth / 2;
      const y = row * cellHeight + cellHeight / 2;

      try {
        const drawOptions: any = {
          x,
          y,
          size: fontSize,
          color: rgb(0, 0, 0),
          opacity: 0.07,
          rotate: { type: "degrees", angle: -30 },
        };

        if (font) {
          drawOptions.font = font;
        }

        page.drawText(displayText, drawOptions);
        successCount++;
      } catch (e) {
        console.warn(
          `⚠️ Cell (${row},${col}) failed:`,
          e instanceof Error ? e.message : String(e)
        );
      }
    }
  }

  console.log(`📊 Watermark results: ${successCount}/15 success`);
}

async function drawWatermarkImageOnPage(
  page: any,
  image: any,
  width: number,
  height: number
) {
  console.log(`🖼️ Applying watermark image - full page coverage`);
  console.log(`📐 Page dimensions: ${width}x${height}`);
  console.log(`📐 Image dimensions: ${image.width}x${image.height}`);

  // 이미지 크기 조정 (용지를 꽉 채우도록)
  const scale = 0.5;
  const imageDims = image.scale(scale);
  
  console.log(`📏 Scaled dimensions: ${imageDims.width}x${imageDims.height}`);

  // 페이지 전체를 꽉 채우도록 픽셀 단위로 반복 배치 (원래 로컬 방식)
  let successCount = 0;
  const spacing = 1; // 이미지 간 간격
  
  for (let x = 0; x < width; x += imageDims.width + spacing) {
    for (let y = 0; y < height; y += imageDims.height + spacing) {
      try {
        page.drawImage(image, {
          x: x,
          y: y,
          width: imageDims.width,
          height: imageDims.height,
          opacity: 0.15, // 적절한 투명도
          rotate: { type: "degrees", angle: 0 }, // 회전 없음 (0도 명시)
        });
        successCount++;
      } catch (e) {
        console.warn(
          `⚠️ Image draw failed at (${x},${y}):`,
          e instanceof Error ? e.message : String(e)
        );
      }
    }
  }

  console.log(`📊 Image watermark results: ${successCount} images drawn`);
}