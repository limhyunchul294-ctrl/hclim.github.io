// Supabase Edge Function: 등급 업그레이드 요청 이메일 전송
// 사용 방법: Supabase Dashboard > Edge Functions에서 배포

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''

serve(async (req) => {
  try {
    const { to, subject, html } = await req.json()

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: 'to, subject, html 필수입니다.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Resend API를 사용한 이메일 전송
    // 다른 이메일 서비스(SendGrid, Mailgun 등)도 사용 가능
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'EVKMC A/S Portal <noreply@evkmc.com>', // 발신자 이메일 (도메인 인증 필요)
        to: [to],
        subject: subject,
        html: html,
      }),
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text()
      throw new Error(`이메일 전송 실패: ${errorData}`)
    }

    const emailData = await emailResponse.json()

    return new Response(
      JSON.stringify({ success: true, messageId: emailData.id }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

