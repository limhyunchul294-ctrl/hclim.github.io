# Resend.com 설정 가이드

## 전체 과정 개요

1. Resend 계정 생성
2. API 키 발급
3. 도메인 인증 (선택사항, 권장)
4. Supabase Edge Function에 API 키 설정

---

## 1단계: Resend 계정 생성

### 1.1 Resend 웹사이트 접속
- https://resend.com 접속
- 우측 상단의 **"Sign Up"** 또는 **"Get Started"** 버튼 클릭

### 1.2 계정 생성 방법 선택
- **GitHub 계정으로 가입** (권장) 또는
- **이메일로 가입**
  - 이메일 주소 입력
  - 비밀번호 설정
  - 이메일 인증 완료

### 1.3 무료 플랜 선택
- Resend는 무료 플랜 제공 (월 3,000개 이메일, 100개/일)
- **"Free"** 플랜 선택
- 필요시 나중에 유료 플랜으로 업그레이드 가능

---

## 2단계: API 키 발급

### 2.1 API Keys 페이지 접속
1. 로그인 후 Dashboard 접속
2. 좌측 메뉴에서 **"API Keys"** 클릭
3. 또는 상단 메뉴에서 **"API Keys"** 선택

### 2.2 API 키 생성
1. **"Create API Key"** 버튼 클릭
2. API 키 이름 입력 (예: `supabase-edge-function`)
3. 권한 선택:
   - **"Full Access"** (권장) - 모든 권한
   - 또는 **"Sending Access"** - 이메일 전송만
4. **"Add"** 또는 **"Create"** 버튼 클릭

### 2.3 API 키 복사
⚠️ **중요**: API 키는 생성 직후에만 표시됩니다. 나중에 다시 볼 수 없으므로 반드시 복사해두세요!

1. 생성된 API 키가 화면에 표시됨
2. **"Copy"** 버튼 클릭하여 클립보드에 복사
3. 안전한 곳에 저장 (예: 메모장, 비밀번호 관리자)

**API 키 형식 예시:**
```
re_1234567890abcdefghijklmnopqrstuvwxyz
```

---

## 3단계: 도메인 인증 (선택사항, 권장)

도메인을 인증하면:
- ✅ 스팸 필터 통과율 향상
- ✅ 인증된 도메인으로 이메일 발송 가능
- ✅ 더 높은 신뢰도

### 3.1 도메인 추가
1. Resend Dashboard에서 **"Domains"** 메뉴 클릭
2. **"Add Domain"** 버튼 클릭
3. 도메인 입력 (예: `evkmc.com`)
4. **"Add"** 클릭

### 3.2 DNS 레코드 추가
Resend가 제공하는 DNS 레코드를 도메인 관리자(DNS 제공자)에 추가해야 합니다.

#### 필요한 DNS 레코드:
1. **SPF 레코드** (TXT)
   ```
   v=spf1 include:_spf.resend.com ~all
   ```

2. **DKIM 레코드** (TXT)
   - Resend가 자동으로 생성한 값 사용
   - 예: `resend._domainkey` → `p=...` (긴 문자열)

3. **DMARC 레코드** (TXT, 선택사항)
   ```
   v=DMARC1; p=none; rua=mailto:dmarc@evkmc.com
   ```

#### DNS 레코드 추가 방법:
1. 도메인 관리자(예: 가비아, 후이즈, Cloudflare 등)에 로그인
2. DNS 설정 페이지로 이동
3. Resend에서 제공한 레코드를 복사하여 추가
4. 레코드 타입: TXT
5. 호스트/이름: Resend가 지정한 값 (예: `@`, `resend._domainkey`)
6. 값: Resend가 제공한 값
7. 저장

### 3.3 도메인 인증 확인
1. DNS 레코드 추가 후 몇 분~최대 24시간 대기
2. Resend Dashboard > Domains에서 상태 확인
3. **"Verify"** 버튼 클릭하여 수동 확인
4. 모든 레코드가 인증되면 **"Verified"** 상태로 변경됨

### 3.4 인증되지 않은 도메인 사용 시
- Resend의 기본 도메인 사용 가능: `onboarding@resend.dev`
- 또는 Resend가 제공하는 임시 도메인 사용
- 단, 스팸 필터에 걸릴 가능성이 높음

---

## 4단계: Supabase Edge Function에 API 키 설정

### 4.1 Supabase Dashboard 접속
1. https://supabase.com/dashboard 접속
2. 프로젝트 선택

### 4.2 Edge Function Secrets 설정
1. 좌측 메뉴에서 **"Edge Functions"** 클릭
2. `send-grade-upgrade-email` 함수 선택
3. **"Settings"** 탭 클릭
4. **"Secrets"** 섹션으로 스크롤
5. **"Add secret"** 버튼 클릭

### 4.3 Secret 추가
1. **Name**: `RESEND_API_KEY` (정확히 이 이름으로 입력)
2. **Value**: Resend에서 복사한 API 키 붙여넣기
3. **"Save"** 클릭

### 4.4 확인
- Secrets 목록에 `RESEND_API_KEY`가 표시되면 성공
- 값은 `***`로 마스킹되어 표시됨

---

## 5단계: 발신자 이메일 주소 설정

### 5.1 Edge Function 코드 수정
`index.ts` 파일의 65번째 줄을 수정:

#### 도메인을 인증한 경우:
```typescript
from: 'EVKMC A/S Portal <noreply@evkmc.com>', // 인증된 도메인 사용
```

#### 도메인을 인증하지 않은 경우:
```typescript
from: 'EVKMC A/S Portal <onboarding@resend.dev>', // Resend 기본 도메인
```

### 5.2 코드 재배포
1. 수정된 코드를 Supabase Dashboard에 붙여넣기
2. **"Deploy"** 클릭

---

## 6단계: 테스트

### 6.1 브라우저 콘솔에서 테스트
```javascript
const { data, error } = await window.supabaseClient.functions.invoke('send-grade-upgrade-email', {
    body: {
        to: 'your-email@example.com', // 본인 이메일 주소
        subject: '테스트 이메일',
        html: '<h1>테스트</h1><p>이메일 전송이 정상적으로 작동합니다.</p>'
    }
});

console.log('결과:', data);
console.log('에러:', error);
```

### 6.2 Supabase Dashboard에서 테스트
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
5. 이메일 수신 확인

---

## 문제 해결

### 문제 1: "Invalid API key" 에러
**해결 방법:**
- Resend Dashboard에서 API 키가 활성화되어 있는지 확인
- Supabase Secrets에 정확히 `RESEND_API_KEY`로 저장되었는지 확인
- API 키 앞뒤 공백이 없는지 확인

### 문제 2: "Domain not verified" 에러
**해결 방법:**
- Resend Dashboard > Domains에서 도메인 인증 상태 확인
- DNS 레코드가 올바르게 추가되었는지 확인
- DNS 전파 대기 (최대 24시간)
- 또는 `onboarding@resend.dev` 사용

### 문제 3: 이메일이 스팸함에 들어감
**해결 방법:**
- 도메인 인증 완료 (SPF, DKIM 레코드 추가)
- 발신자 이메일 주소를 인증된 도메인으로 변경
- 수신자에게 스팸함 확인 요청

### 문제 4: "Rate limit exceeded" 에러
**해결 방법:**
- 무료 플랜: 일일 100개 제한
- 월간 3,000개 제한
- 유료 플랜으로 업그레이드 고려

---

## 요약 체크리스트

- [ ] Resend 계정 생성 완료
- [ ] API 키 발급 및 복사 완료
- [ ] Supabase Edge Function에 `RESEND_API_KEY` Secret 추가 완료
- [ ] (선택) 도메인 인증 완료
- [ ] Edge Function 코드에서 발신자 이메일 주소 설정 완료
- [ ] 테스트 이메일 발송 성공 확인

---

## 추가 정보

### Resend 무료 플랜 제한사항
- 월 3,000개 이메일
- 일일 100개 이메일
- 기본 도메인 사용 가능
- 커스텀 도메인 지원

### 유료 플랜 (필요시)
- Pro 플랜: $20/월, 월 50,000개
- Business 플랜: $80/월, 월 200,000개

### 대안 이메일 서비스
- **SendGrid**: 무료 플랜 100개/일
- **Mailgun**: 무료 플랜 5,000개/월
- **Amazon SES**: 매우 저렴한 가격

---

## 다음 단계

설정이 완료되면:
1. Edge Function 재배포
2. 테스트 이메일 발송
3. 실제 등급 업그레이드 요청 테스트

문제가 발생하면 Supabase Dashboard > Edge Functions > Logs에서 에러 로그를 확인하세요.



