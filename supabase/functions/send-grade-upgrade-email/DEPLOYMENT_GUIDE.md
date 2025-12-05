# Edge Function 배포 가이드 (Supabase Dashboard 방법)

## 방법 1: Supabase Dashboard에서 직접 배포 (가장 간단)

### 1단계: Edge Function 생성

1. Supabase Dashboard 접속: https://supabase.com/dashboard
2. 프로젝트 선택
3. 좌측 메뉴에서 **"Edge Functions"** 클릭
4. **"Create a new function"** 버튼 클릭
5. Function 이름 입력: `send-grade-upgrade-email`
6. **"Create function"** 클릭

### 2단계: 코드 복사 및 붙여넣기

1. 생성된 함수의 코드 에디터가 열립니다
2. `supabase/functions/send-grade-upgrade-email/index.ts` 파일의 전체 내용을 복사
3. 에디터에 붙여넣기
4. **"Deploy"** 버튼 클릭

### 3단계: 환경변수 설정 (Resend API 키)

1. Edge Functions 페이지로 돌아가기
2. `send-grade-upgrade-email` 함수 선택
3. **"Settings"** 탭 클릭
4. **"Secrets"** 섹션에서 **"Add secret"** 클릭
5. Secret 이름: `RESEND_API_KEY`
6. Secret 값: Resend에서 발급받은 API 키 입력
7. **"Save"** 클릭

### 4단계: Resend 계정 설정 (이메일 서비스)

#### Resend 계정 생성
1. https://resend.com 접속
2. 계정 생성 (무료 플랜 사용 가능)
3. **"API Keys"** 메뉴에서 API 키 발급
4. 발급받은 API 키를 Supabase Secrets에 등록

#### 도메인 인증 (선택사항, 권장)
- 인증된 도메인을 사용하면 스팸 필터를 통과하기 쉬움
- Resend Dashboard > Domains에서 도메인 추가 및 DNS 설정

### 5단계: 발신자 이메일 주소 수정

`index.ts` 파일의 29번째 줄을 실제 사용할 이메일 주소로 변경:
```typescript
from: 'EVKMC A/S Portal <noreply@evkmc.com>', // 실제 이메일 주소로 변경
```

도메인을 인증했다면 해당 도메인의 이메일 주소를 사용하세요.

## 방법 2: Supabase CLI 사용 (고급)

### 전제 조건
- Node.js 설치
- Supabase CLI 설치: `npm install -g supabase`

### 배포 명령어

```bash
# 1. Supabase 프로젝트 연결
supabase link --project-ref your-project-ref
# 프로젝트 ref는 Supabase Dashboard > Settings > General에서 확인 가능

# 2. Edge Function 배포
supabase functions deploy send-grade-upgrade-email

# 3. 환경변수 설정
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
```

## 테스트 방법

### 브라우저 콘솔에서 테스트

```javascript
// 브라우저 개발자 도구 콘솔에서 실행
const { data, error } = await window.supabaseClient.functions.invoke('send-grade-upgrade-email', {
    body: {
        to: 'your-email@example.com', // 테스트용 이메일 주소
        subject: '테스트 이메일',
        html: '<h1>테스트</h1><p>이메일 전송이 정상적으로 작동합니다.</p>'
    }
});

console.log('결과:', data);
console.log('에러:', error);
```

### Supabase Dashboard에서 테스트

1. Edge Functions > `send-grade-upgrade-email` 선택
2. **"Invoke"** 탭 클릭
3. 다음 JSON 입력:
```json
{
  "to": "your-email@example.com",
  "subject": "테스트 이메일",
  "html": "<h1>테스트</h1><p>이메일 전송 테스트입니다.</p>"
}
```
4. **"Invoke function"** 클릭

## 문제 해결

### 에러: "Function not found"
- Edge Function이 배포되지 않았습니다
- Dashboard에서 함수가 생성되고 Deploy되었는지 확인

### 에러: "Invalid API key"
- Resend API 키가 잘못되었거나 Secrets에 등록되지 않았습니다
- Edge Functions > Settings > Secrets에서 확인

### 에러: "Domain not verified"
- 발신자 이메일 도메인이 Resend에서 인증되지 않았습니다
- Resend Dashboard > Domains에서 도메인 인증 또는
- 인증된 도메인으로 발신자 주소 변경

### 이메일이 스팸함에 들어감
- 도메인 인증을 완료하세요
- SPF, DKIM 레코드를 DNS에 추가하세요

## 대안: 다른 이메일 서비스 사용

Resend 대신 다른 서비스를 사용하려면 `index.ts` 파일의 이메일 전송 부분만 수정하면 됩니다.

### SendGrid 사용
- 무료 플랜: 100개/일
- API 키 발급 후 `SENDGRID_API_KEY`로 변경

### Mailgun 사용
- 무료 플랜: 5,000개/월
- 도메인 인증 필요



