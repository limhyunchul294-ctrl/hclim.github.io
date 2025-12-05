// Supabase Edge Function: 등급 업그레이드 요청 이메일 전송
// 사용 방법: Supabase Dashboard > Edge Functions에서 배포

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''

// CORS 헤더 설정
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS preflight 요청 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Resend API 키 확인
    if (!RESEND_API_KEY || RESEND_API_KEY === '') {
      console.error('❌ RESEND_API_KEY가 설정되지 않았습니다.');
      return new Response(
        JSON.stringify({ 
          error: '이메일 서비스가 설정되지 않았습니다. 관리자에게 문의하세요.',
          details: 'RESEND_API_KEY 환경변수가 설정되지 않았습니다.'
        }),
        { 
          status: 500, 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    const { to, subject, html } = await req.json()

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: 'to, subject, html 필수입니다.' }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    console.log('📧 이메일 전송 시도:', { to, subject });

    // Resend API를 사용한 이메일 전송
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        // 도메인 인증이 완료되면 'noreply@evkmc.com'으로 변경 가능
        // 현재는 Resend 기본 도메인 사용 (도메인 인증 없이 사용 가능)
        from: 'EVKMC A/S Portal <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: html,
      }),
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text()
      console.error('❌ Resend API 오류:', {
        status: emailResponse.status,
        statusText: emailResponse.statusText,
        error: errorData
      });
      
      // 더 자세한 에러 메시지 반환
      let errorMessage = '이메일 전송에 실패했습니다.';
      try {
        const errorJson = JSON.parse(errorData);
        errorMessage = errorJson.message || errorMessage;
      } catch {
        errorMessage = errorData || errorMessage;
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          status: emailResponse.status,
          details: errorData
        }),
        { 
          status: emailResponse.status || 500, 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    const emailData = await emailResponse.json()
    console.log('✅ 이메일 전송 성공:', emailData.id);

    return new Response(
      JSON.stringify({ success: true, messageId: emailData.id }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('❌ Edge Function 오류:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || '알 수 없는 오류가 발생했습니다.',
        stack: error.stack
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})

