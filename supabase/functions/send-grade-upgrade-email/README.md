# 등급 업그레이드 요청 이메일 전송 Edge Function

## 설정 방법

### 1. Resend 계정 생성 및 API 키 발급
1. [Resend](https://resend.com)에서 계정 생성
2. API 키 발급
3. 도메인 인증 (선택사항, 인증된 도메인 사용 권장)

### 2. Supabase Edge Function 배포

```bash
# Supabase CLI 설치 (필요시)
npm install -g supabase

# Supabase 프로젝트 연결
supabase link --project-ref your-project-ref

# Edge Function 배포
supabase functions deploy send-grade-upgrade-email

# 환경변수 설정 (Resend API 키)
supabase secrets set RESEND_API_KEY=your_resend_api_key
```

### 3. 대안: 다른 이메일 서비스 사용

#### SendGrid 사용 예시
```typescript
const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
  },
  body: JSON.stringify({
    personalizations: [{ to: [{ email: to }] }],
    from: { email: 'noreply@evkmc.com' },
    subject: subject,
    content: [{ type: 'text/html', value: html }],
  }),
})
```

#### Mailgun 사용 예시
```typescript
const formData = new FormData()
formData.append('from', 'EVKMC A/S Portal <noreply@evkmc.com>')
formData.append('to', to)
formData.append('subject', subject)
formData.append('html', html)

const emailResponse = await fetch(
  `https://api.mailgun.net/v3/${Deno.env.get('MAILGUN_DOMAIN')}/messages`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`api:${Deno.env.get('MAILGUN_API_KEY')}`)}`,
    },
    body: formData,
  }
)
```

### 4. 간단한 대안: Supabase Database Webhook 사용

Edge Function 대신 Supabase Database Webhook을 사용하여 외부 서비스(예: Zapier, Make.com)로 요청을 전달할 수도 있습니다.

## 테스트

```bash
# 로컬 테스트
supabase functions serve send-grade-upgrade-email

# 테스트 요청
curl -X POST http://localhost:54321/functions/v1/send-grade-upgrade-email \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "admin@evkmc.com",
    "subject": "테스트 이메일",
    "html": "<h1>테스트</h1>"
  }'
```

## 주의사항

- Edge Function이 없어도 요청은 데이터베이스에 저장됩니다
- 이메일 전송 실패 시에도 요청은 정상적으로 저장됩니다
- 관리자는 Supabase Dashboard에서 요청을 확인하고 승인/거부할 수 있습니다



