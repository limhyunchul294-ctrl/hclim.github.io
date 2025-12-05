# Supabase Edge Function 로그 확인 방법

## 500 에러 해결을 위한 필수 단계

500 에러가 발생하면 **반드시** Supabase Dashboard의 Logs를 확인해야 정확한 원인을 파악할 수 있습니다.

## 로그 확인 방법

### 1단계: Supabase Dashboard 접속
1. https://supabase.com 접속
2. 프로젝트 선택 (EVKMC A/S Repair portal)

### 2단계: Edge Functions 메뉴로 이동
1. 왼쪽 사이드바에서 **"Edge Functions"** 메뉴 클릭
2. 또는 상단 메뉴에서 **"Edge Functions"** 선택

### 3단계: 함수 선택
1. 함수 목록에서 **`send-grade-upgrade-email`** 함수 클릭

### 4단계: Logs 탭 확인
1. 함수 상세 페이지에서 **"Logs"** 탭 클릭
2. 최근 에러 로그 확인

## 로그에서 확인할 내용

### ✅ 정상적인 경우
```
📧 이메일 전송 시도: { to: 'admin@evkmc.com', subject: '...' }
✅ 이메일 전송 성공: re_xxxxxxxxxxxxx
```

### ❌ Resend API 키 미설정
```
❌ RESEND_API_KEY가 설정되지 않았습니다.
```

**해결 방법:**
1. 함수 상세 페이지에서 **"Settings"** 탭 클릭
2. **"Secrets"** 섹션에서 **"Add secret"** 클릭
3. Name: `RESEND_API_KEY`
4. Value: Resend.com에서 발급받은 API 키 입력
5. **"Save"** 클릭
6. 함수 재배포

### ❌ Resend API 키 오류
```
❌ Resend API 오류: { status: 401, statusText: 'Unauthorized', error: 'Invalid API key' }
```

**해결 방법:**
1. Resend.com Dashboard 접속
2. API Keys 메뉴에서 API 키 상태 확인
3. 새 API 키 생성 (필요시)
4. Supabase Dashboard > Edge Functions > Settings > Secrets에서 `RESEND_API_KEY` 업데이트
5. 함수 재배포

### ❌ 도메인 미인증 (현재는 발생하지 않아야 함)
```
❌ Resend API 오류: { status: 403, error: 'Domain not verified' }
```

**참고:** 현재 코드는 `onboarding@resend.dev`를 사용하므로 도메인 인증이 필요 없습니다.

### ❌ 기타 에러
로그에 표시된 에러 메시지를 확인하고, 해당 내용을 공유해주시면 정확한 해결 방법을 제시하겠습니다.

## 로그 필터링

Logs 탭에서:
- **레벨 필터**: Error, Warning, Info 등 선택 가능
- **시간 범위**: 최근 1시간, 24시간, 7일 등 선택 가능
- **검색**: 특정 키워드로 로그 검색 가능

## 스크린샷 가이드

### 1. Edge Functions 목록
```
Supabase Dashboard
  └─ Edge Functions (왼쪽 사이드바)
      └─ send-grade-upgrade-email (함수 클릭)
```

### 2. Logs 탭 위치
```
함수 상세 페이지
  ├─ Code (코드 편집)
  ├─ Invoke (함수 테스트)
  ├─ Logs ← 여기 클릭!
  ├─ Settings (설정)
  └─ ...
```

### 3. 로그 예시
```
[2024-01-15 10:30:45] ERROR: ❌ RESEND_API_KEY가 설정되지 않았습니다.
[2024-01-15 10:30:45] ERROR: ❌ Resend API 오류: { status: 401, ... }
[2024-01-15 10:30:45] INFO: 📧 이메일 전송 시도: { to: 'admin@evkmc.com', ... }
```

## 빠른 체크리스트

500 에러 발생 시 확인할 사항:

- [ ] Supabase Dashboard > Edge Functions > Logs에서 에러 메시지 확인
- [ ] Resend API 키가 설정되어 있는지 확인 (Settings > Secrets)
- [ ] Resend API 키가 유효한지 확인 (Resend.com Dashboard)
- [ ] Edge Function 코드가 최신 버전인지 확인 (Code 탭)
- [ ] Edge Function이 재배포되었는지 확인

## 로그 확인 후 다음 단계

로그에서 확인한 에러 메시지를 알려주시면:
1. 정확한 원인 파악
2. 구체적인 해결 방법 제시
3. 필요한 코드 수정

**중요:** 로그 없이는 정확한 원인 파악이 어렵습니다. 반드시 로그를 확인해주세요!

