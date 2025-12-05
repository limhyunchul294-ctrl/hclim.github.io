# Edge Function 500 에러 해결 가이드

## 즉시 확인 사항

### 1. Supabase Dashboard에서 로그 확인

**가장 중요**: Supabase Dashboard에서 실제 에러 메시지를 확인하세요.

1. Supabase Dashboard 접속
2. **Edge Functions** > `send-grade-upgrade-email` 함수 선택
3. **"Logs"** 탭 클릭
4. 최근 에러 로그 확인

로그에서 확인할 내용:
- `RESEND_API_KEY가 설정되지 않았습니다` → API 키 설정 필요
- `Invalid API key` → API 키가 잘못됨
- `Domain not verified` → 도메인 인증 필요 또는 발신자 주소 변경 필요

### 2. Resend API 키 확인

**Supabase Dashboard에서:**
1. Edge Functions > `send-grade-upgrade-email` > **Settings**
2. **Secrets** 섹션에서 `RESEND_API_KEY` 확인
3. 없으면 추가:
   - Name: `RESEND_API_KEY` (정확히 이 이름)
   - Value: Resend에서 발급받은 API 키

**Resend Dashboard에서:**
1. https://resend.com 접속
2. **API Keys** 메뉴 클릭
3. API 키가 활성화되어 있는지 확인
4. 필요시 새 API 키 생성

### 3. 발신자 이메일 주소 확인

현재 코드는 `onboarding@resend.dev`를 사용합니다 (도메인 인증 없이 사용 가능).

도메인을 인증했다면 `index.ts` 파일의 65번째 줄을 변경:
```typescript
from: 'EVKMC A/S Portal <noreply@evkmc.com>',
```

## 단계별 해결 방법

### 방법 1: Resend API 키 설정 (가장 중요)

1. **Resend 계정 생성 및 API 키 발급**
   - https://resend.com 접속
   - 계정 생성
   - API Keys 메뉴에서 API 키 생성
   - API 키 복사

2. **Supabase에 API 키 설정**
   - Supabase Dashboard > Edge Functions > `send-grade-upgrade-email` > Settings
   - Secrets 섹션에서 "Add secret" 클릭
   - Name: `RESEND_API_KEY`
   - Value: 복사한 API 키 붙여넣기
   - Save 클릭

3. **Edge Function 재배포**
   - Edge Functions > `send-grade-upgrade-email` 함수 선택
   - 코드 에디터에서 "Deploy" 클릭

### 방법 2: 발신자 이메일 주소 변경

도메인 인증이 완료되지 않았다면, `index.ts` 파일의 발신자 주소를 확인:

**현재 설정 (도메인 인증 불필요):**
```typescript
from: 'EVKMC A/S Portal <onboarding@resend.dev>',
```

이 설정이 맞는지 확인하고, Edge Function을 재배포하세요.

### 방법 3: Edge Function 로그 확인

Supabase Dashboard에서 로그를 확인하면 정확한 에러 원인을 알 수 있습니다:

1. Edge Functions > `send-grade-upgrade-email` > **Logs**
2. 최근 에러 로그 확인
3. 에러 메시지에 따라 해결

## 테스트 방법

### 브라우저 콘솔에서 테스트

**올바른 테스트 코드:**
```javascript
const { data, error } = await window.supabaseClient.functions.invoke('send-grade-upgrade-email', {
    body: {
        to: 'your-email@example.com', // 본인 이메일 주소
        subject: '테스트 이메일',
        html: '<h1>테스트</h1><p>이메일 전송 테스트입니다.</p>'
    }
});

console.log('결과:', data);
console.log('에러:', error);
console.log('에러 상세:', JSON.stringify(error, null, 2));
```

**주의**: `console.log`를 `con.log`로 잘못 입력하지 마세요!

### Supabase Dashboard에서 테스트

1. Edge Functions > `send-grade-upgrade-email` > **Invoke** 탭
2. 다음 JSON 입력:
```json
{
  "to": "your-email@example.com",
  "subject": "테스트 이메일",
  "html": "<h1>테스트</h1><p>이메일 전송 테스트입니다.</p>"
}
```
3. **"Invoke function"** 클릭
4. 결과 확인

## 일반적인 에러와 해결 방법

### 에러: "RESEND_API_KEY가 설정되지 않았습니다"
**해결**: Supabase Dashboard > Edge Functions > Settings > Secrets에서 `RESEND_API_KEY` 추가

### 에러: "Invalid API key"
**해결**: 
- Resend Dashboard에서 API 키가 활성화되어 있는지 확인
- 새 API 키 생성 후 Supabase Secrets에 업데이트

### 에러: "Domain not verified"
**해결**: 
- 발신자 주소를 `onboarding@resend.dev`로 변경 (현재 코드에 이미 적용됨)
- 또는 Resend Dashboard에서 도메인 인증 완료

### 에러: "Rate limit exceeded"
**해결**: 
- Resend 무료 플랜: 일일 100개 제한
- 내일 다시 시도하거나 유료 플랜으로 업그레이드

## 체크리스트

500 에러 해결을 위한 체크리스트:

- [ ] Resend 계정 생성 완료
- [ ] Resend에서 API 키 발급 완료
- [ ] Supabase Dashboard > Edge Functions > Settings > Secrets에 `RESEND_API_KEY` 추가 완료
- [ ] Edge Function 코드에서 발신자 주소가 `onboarding@resend.dev`로 설정되어 있는지 확인
- [ ] Edge Function 재배포 완료
- [ ] Supabase Dashboard > Edge Functions > Logs에서 에러 로그 확인
- [ ] 테스트 이메일 발송 시도

## 다음 단계

위 체크리스트를 모두 확인했는데도 500 에러가 발생한다면:

1. **Supabase Dashboard의 Logs에서 정확한 에러 메시지 확인**
2. 에러 메시지를 복사하여 공유해주시면 정확한 해결 방법을 제시하겠습니다.

## 추가 도움

문제가 계속되면 다음 정보를 확인하세요:
- Supabase Dashboard > Edge Functions > Logs의 에러 메시지
- Resend Dashboard > API Keys에서 API 키 상태
- 브라우저 콘솔의 전체 에러 스택



