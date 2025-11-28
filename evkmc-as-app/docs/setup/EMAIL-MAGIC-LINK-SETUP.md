# 이메일 매직링크 로그인 설정 가이드

## 개요

비용 절감을 위해 SMS OTP 대신 이메일 매직링크를 사용한 로그인 기능입니다.

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

- **Redirect URLs**에 다음 추가:
  ```
  https://your-domain.com/index.html
  http://localhost:5173/index.html
  ```

#### 2.2 Email Provider 설정

Supabase Dashboard > Authentication > Providers > Email:

- ✅ **Enable Email provider**: 활성화
- ⚠️ **Confirm email**: 비활성화 (매직링크는 이메일 확인 불필요)
- ✅ **Secure email change**: 선택사항

#### 2.3 Email Templates (선택사항)

Supabase Dashboard > Authentication > Email Templates > Magic Link:

이메일 템플릿을 커스터마이징할 수 있습니다:
- 제목: "EVKMC A/S 로그인 링크"
- 내용: 브랜드에 맞게 수정 가능

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

1. 로그인 페이지에서 **"이메일로 로그인"** 버튼 클릭
2. 이메일 주소 입력
3. **"로그인 링크 발송"** 클릭
4. 이메일 확인 후 링크 클릭
5. 자동으로 로그인 완료

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

### 매직링크 클릭 후 로그인되지 않는 경우

1. **콘솔 로그 확인**
   - 브라우저 개발자 도구에서 에러 메시지 확인

2. **세션 확인**
   - Supabase Dashboard > Authentication > Users에서 사용자 상태 확인

3. **URL 확인**
   - 매직링크 URL에 `access_token`과 `type=magiclink` 파라미터가 있는지 확인

## 참고사항

- 이메일 매직링크는 SMS OTP와 별도로 작동합니다
- 기존 전화번호 로그인 기능은 그대로 유지됩니다
- 사용자는 전화번호 또는 이메일 중 선택하여 로그인할 수 있습니다

