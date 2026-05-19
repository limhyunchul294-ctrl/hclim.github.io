# 이메일 OTP 로그인 설정 가이드

## 개요

이메일 **6자리 인증 코드(OTP)** 로 로그인합니다. 매직링크만 쓰면 메일 앱·Safari/Chrome에서 열려 **PWA(홈 화면 앱)와 세션이 분리**되므로, 코드를 **로그인 화면에 직접 입력**하는 방식을 사용합니다.

> 매직링크 콜백은 예전 메일 링크용 **폴백**으로만 남겨 두었습니다.

## 설정 단계

### 1. 데이터베이스 마이그레이션 실행

Supabase Dashboard > SQL Editor에서 다음 파일을 실행하세요:

```sql
evkmc-as-app/supabase/migrations/002_email_magic_link_setup.sql
```

이 마이그레이션은:
- `users` 테이블의 `email` 컬럼에 인덱스 추가
- `check_user_email()` RPC 함수 생성 (사용자 이메일 검증용)
- `get_user_by_email()` RPC 함수 생성 (이메일로 사용자 조회용)

### 2. Supabase Authentication 설정

#### 2.1 URL Configuration

Supabase Dashboard > Authentication > URL Configuration:

- **Site URL**: 
  - 프로덕션: `https://your-domain.com`
  - 로컬 개발: `http://localhost:5173` (또는 사용 중인 포트)

- **Redirect URLs**에 다음 추가 (매직링크 폴백용):
  ```
  https://your-domain.com/login.html
  https://your-domain.com/index.html
  http://localhost:5173/login.html
  ```

#### 2.2 Email Provider 설정

Supabase Dashboard > Authentication > Providers > Email:

- ✅ **Enable Email provider**: 활성화
- ⚠️ **Confirm email**: 비활성화 (매직링크는 이메일 확인 불필요)
- ✅ **Secure email change**: 선택사항

#### 2.3 Email Templates (필수)

Supabase Dashboard > **Authentication > Email Templates > Magic Link**

본문에 **OTP 코드**가 나오도록 `{{ .Token }}`을 넣습니다. 링크만 있으면 다른 브라우저에서 열립니다.

예시:

```html
<h2>EVKMC A/S 로그인</h2>
<p>아래 6자리 코드를 로그인 화면에 입력하세요.</p>
<p style="font-size:24px;font-weight:bold;letter-spacing:0.2em">{{ .Token }}</p>
<p>코드는 약 1시간 동안 유효합니다.</p>
```

- 제목 예: `EVKMC A/S 로그인 인증 코드`

### 3. 사용자 이메일 등록

`public.users` 테이블에 각 사용자의 이메일 주소를 등록해야 합니다:

```sql
-- 예시: 사용자 이메일 업데이트
UPDATE public.users 
SET email = 'user@example.com' 
WHERE username = '사용자명';
```

또는 Supabase Dashboard > Table Editor > users에서 직접 입력할 수 있습니다.

## 사용 방법

### 사용자 측

1. 로그인 페이지에서 **"이메일로 로그인"** 클릭
2. 사용자계정·이메일 입력 후 **"인증 코드 발송"**
3. 메일에 온 **6자리 코드**를 같은 화면(또는 PWA) 모달에 입력
4. **로그인** → 앱으로 이동

### 개발자 측

#### 이메일 검증 RPC 함수 사용

```javascript
// 사용자 이메일 확인
const { data, error } = await supabaseClient
    .rpc('check_user_email', {
        in_username: '사용자명',
        in_email: 'user@example.com'
    });

if (data) {
    // 사용자 존재
}
```

#### 이메일로 사용자 정보 조회

```javascript
// 이메일로 사용자 정보 조회
const { data, error } = await supabaseClient
    .rpc('get_user_by_email', {
        in_email: 'user@example.com'
    });

if (data && data.length > 0) {
    const user = data[0];
    console.log(user.username, user.email, user.phone);
}
```

## 보안 고려사항

1. **이메일 검증**: 매직링크 발송 전에 사용자 이메일이 등록되어 있는지 확인할 수 있습니다 (현재는 선택사항)

2. **Rate Limiting**: Supabase는 자동으로 이메일 발송 횟수를 제한합니다

3. **토큰 만료**: 매직링크 토큰은 기본적으로 1시간 후 만료됩니다

## 문제 해결

### 이메일이 발송되지 않는 경우

1. **Supabase Email 설정 확인**
   - Authentication > Providers > Email 활성화 확인
   - Email Templates 설정 확인

2. **Redirect URL 확인**
   - Site URL과 Redirect URLs가 올바르게 설정되었는지 확인

3. **스팸 폴더 확인**
   - 사용자에게 스팸 폴더도 확인하도록 안내

### PWA에서 로그인이 안 되는 경우 (다른 브라우저로 열림)

- **원인**: 메일 링크는 메일 앱·기본 브라우저에서 열리고, 홈 화면 PWA와 저장소가 다릅니다.
- **해결**: 위 OTP 템플릿 설정 후 **코드 입력**으로 로그인하세요. 링크는 쓰지 않아도 됩니다.

### 매직링크 클릭 후 로그인되지 않는 경우 (폴백)

1. **콘솔 로그 확인**
   - 브라우저 개발자 도구에서 에러 메시지 확인

2. **세션 확인**
   - Supabase Dashboard > Authentication > Users에서 사용자 상태 확인

3. **URL 확인**
   - 매직링크 URL에 `access_token`과 `type=magiclink` 파라미터가 있는지 확인

## 참고사항

- 이메일 OTP는 SMS OTP와 별도로 작동합니다
- 기존 전화번호 로그인 기능은 그대로 유지됩니다
- 사용자는 전화번호 또는 이메일 중 선택하여 로그인할 수 있습니다



