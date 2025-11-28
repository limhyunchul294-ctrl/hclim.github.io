# Twilio SMS 알림 연동 가이드

로그인 시 Twilio로 발송된 SMS 내용을 다른 무료 서비스를 통해 휴대폰으로 전송하는 방법입니다.

## 📋 지원하는 알림 채널

### 1. **Telegram Bot** (추천 ⭐)
- ✅ 완전 무료
- ✅ 실시간 알림
- ✅ 모바일 앱 지원
- ✅ 설정 간단

### 2. **Discord Webhook**
- ✅ 완전 무료
- ✅ 실시간 알림
- ✅ 서버 관리자에게 알림

### 3. **이메일 알림**
- ✅ 완전 무료
- ✅ 기록 보관 용이
- ⚠️ 실시간성 낮음

### 4. **알리고 SMS** (국내 서비스)
- 💰 유료 (월 무료 제공량 있음)
- ✅ 국내 번호로 SMS 발송
- ✅ 안정적

### 5. **쿨SMS** (국내 서비스)
- 💰 유료 (월 무료 제공량 있음)
- ✅ 국내 번호로 SMS 발송
- ✅ API 제공

## 🚀 설정 방법

### 1. Telegram Bot 설정 (무료)

#### 1-1. 봇 생성
1. Telegram 앱에서 `@BotFather` 검색
2. `/newbot` 명령어 전송
3. 봇 이름 입력 (예: "EVKMC SMS 알림봇")
4. 봇 사용자명 입력 (예: "evkmc_sms_bot")
5. 받은 **Bot Token** 복사 (예: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

#### 1-2. 채팅방 ID 확인
1. 봇과 1:1 채팅 시작 (Telegram에서 봇 검색 후 대화 시작)
2. 다음 URL로 채팅방 ID 확인:
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   ```
3. 응답에서 `"chat":{"id":123456789}` 형태의 숫자를 찾아 복사

#### 1-3. .env 파일 설정
```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789
```

### 2. Discord Webhook 설정 (무료)

#### 2-1. 웹후크 생성
1. Discord 서버 설정 열기
2. **통합** → **웹후크** 선택
3. **새 웹후크** 클릭
4. 웹후크 이름 설정 (예: "EVKMC SMS 알림")
5. **웹후크 URL 복사** 클릭

#### 2-2. .env 파일 설정
```env
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/123456789/ABCdefGHIjklMNOpqrsTUVwxyz
```

### 3. 이메일 알림 설정 (무료)

#### 3-1. 패키지 설치
```bash
npm install nodemailer
```

#### 3-2. .env 파일 설정 (Gmail 예시)
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password  # 앱 비밀번호 생성 필요
EMAIL_TO=recipient@example.com
```

**Gmail 앱 비밀번호 생성:**
1. Google 계정 설정 → 보안
2. 2단계 인증 활성화
3. 앱 비밀번호 생성

### 4. 알리고 SMS 설정 (국내, 유료)

#### 4-1. 가입 및 설정
1. 알리고 가입: https://www.aligo.in
2. API 키 발급
3. 발신번호 등록

#### 4-2. .env 파일 설정
```env
ALIGO_API_KEY=your_api_key
ALIGO_USER_ID=your_user_id
ALIGO_SENDER=발신번호  # 예: 01012345678
```

### 5. 쿨SMS 설정 (국내, 유료)

#### 5-1. 가입 및 설정
1. 쿨SMS 가입: https://www.coolsms.co.kr
2. API Key 및 Secret 발급
3. 발신번호 등록

#### 5-2. .env 파일 설정
```env
COOLSMS_API_KEY=your_api_key
COOLSMS_API_SECRET=your_api_secret
COOLSMS_SENDER=발신번호
```

## 📱 사용 방법

### 방법 1: 스크립트 직접 실행

```bash
cd evkmc-as-app

# Telegram으로 전송
node scripts/notification-service.js --channel telegram --phone +821012345678

# Discord로 전송
node scripts/notification-service.js --channel discord --phone +821012345678

# 이메일로 전송
node scripts/notification-service.js --channel email --phone +821012345678

# 알리고 SMS로 전송
node scripts/notification-service.js --channel aligo --phone +821012345678

# 쿨SMS로 전송
node scripts/notification-service.js --channel coolsms --phone +821012345678
```

### 방법 2: Supabase Edge Function으로 자동화

로그인 시 자동으로 SMS 내용을 조회하고 알림을 보내도록 설정할 수 있습니다.

**`supabase/functions/send-sms-notification/index.ts`** 파일 생성:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID')

serve(async (req) => {
  try {
    const { phone } = await req.json()
    
    // Twilio에서 최신 SMS 조회
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    
    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json?To=${phone}&PageSize=1`,
      {
        headers: {
          'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`
        }
      }
    )
    
    const twilioData = await twilioResponse.json()
    const latestMessage = twilioData.messages?.[0]
    
    if (!latestMessage) {
      return new Response(JSON.stringify({ error: '메시지를 찾을 수 없습니다' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Telegram으로 전송
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: `📱 Twilio SMS 알림\n\n전화번호: ${phone}\n메시지: ${latestMessage.body}`
        })
      }
    )
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
```

## 🔄 로그인 프로세스에 통합

`js/login.js` 파일에서 OTP 발송 후 자동으로 알림을 보내도록 설정할 수 있습니다:

```javascript
// OTP 발송 성공 후
if (otpData && !otpError) {
    // Supabase Edge Function 호출
    const { data: notificationResult, error: notificationError } = 
        await window.supabaseClient.functions.invoke('send-sms-notification', {
            body: { phone: formattedPhone }
        });
    
    if (notificationError) {
        console.warn('알림 전송 실패:', notificationError);
    }
}
```

## 💡 추천 구성

### 무료 구성 (추천)
- **주 알림**: Telegram Bot
- **백업 알림**: Discord Webhook
- **장기 기록**: 이메일

### 유료 구성
- **주 알림**: 알리고 SMS 또는 쿨SMS
- **백업**: Telegram Bot

## ⚠️ 주의사항

1. **.env 파일 보안**: `.env` 파일은 절대 Git에 커밋하지 마세요
2. **API 키 관리**: 환경 변수에 저장하고 공유하지 마세요
3. **무료 서비스 제한**: Telegram과 Discord는 무료지만, 과도한 요청 시 제한될 수 있습니다
4. **국내 SMS 서비스**: 알리고, 쿨SMS는 무료 제공량이 있지만 초과 시 비용이 발생합니다

## 📚 참고 자료

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Discord Webhooks](https://discord.com/developers/docs/resources/webhook)
- [알리고 API](https://docs.aligo.in)
- [쿨SMS API](https://www.coolsms.co.kr/api)


