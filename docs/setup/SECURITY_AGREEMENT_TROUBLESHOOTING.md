# 보안서약서 동의 저장 문제 해결 가이드

## 문제 증상
- 콘솔에 **"permission denied for table users"** (403 Forbidden) 에러
- `auth_user_id`로 업데이트 실패
- 이메일로 업데이트도 실패
- "업데이트된 레코드가 없습니다" 에러

## 단계별 해결 방법

### 1단계: RLS UPDATE 정책 추가 (필수)

Supabase Dashboard > SQL Editor에서 `supabase/fix_security_agreement_rls_immediate.sql` 파일 내용을 실행하세요.

**또는 아래 SQL을 직접 실행:**

```sql
-- 기존 UPDATE 정책 삭제
DROP POLICY IF EXISTS "Users can update their own security agreement" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can update users" ON public.users;

-- 보안서약서 동의 정보 업데이트 정책 추가
CREATE POLICY "Users can update their own security agreement"
ON public.users
FOR UPDATE
TO authenticated
USING (
    (auth_user_id IS NOT NULL AND auth_user_id::text = auth.uid()::text)
    OR
    (email IS NOT NULL AND LOWER(TRIM(email)) = LOWER(TRIM((SELECT email FROM auth.users WHERE id = auth.uid()))))
)
WITH CHECK (
    (auth_user_id IS NOT NULL AND auth_user_id::text = auth.uid()::text)
    OR
    (email IS NOT NULL AND LOWER(TRIM(email)) = LOWER(TRIM((SELECT email FROM auth.users WHERE id = auth.uid()))))
);

-- RLS 활성화 확인
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
```

### 2단계: 정책 확인

정책이 제대로 추가되었는지 확인:

```sql
SELECT 
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'users'
  AND schemaname = 'public'
  AND cmd = 'UPDATE';
```

**예상 결과:**
- `policyname`: "Users can update their own security agreement"
- `cmd`: "UPDATE"
- `roles`: "{authenticated}"

### 3단계: 사용자 레코드 확인

현재 로그인한 사용자의 레코드가 올바르게 설정되어 있는지 확인:

```sql
-- 이메일로 확인 (실제 이메일로 변경)
SELECT 
    profile_id,
    auth_user_id,
    email,
    security_agreement_accepted,
    security_agreement_date
FROM public.users
WHERE email = 'hclim@evkmc.com';
```

**확인 사항:**
- [ ] 레코드가 존재하는가?
- [ ] `auth_user_id`가 설정되어 있는가?
- [ ] `email`이 auth.users의 이메일과 일치하는가?

### 4단계: auth_user_id 동기화 (필요시)

만약 `auth_user_id`가 NULL이거나 잘못된 경우:

```sql
-- 이메일로 auth_user_id 업데이트 (실제 이메일로 변경)
UPDATE public.users
SET auth_user_id = (SELECT id FROM auth.users WHERE email = 'hclim@evkmc.com')
WHERE email = 'hclim@evkmc.com'
  AND (auth_user_id IS NULL OR auth_user_id != (SELECT id FROM auth.users WHERE email = 'hclim@evkmc.com'));
```

### 5단계: 테스트

브라우저에서:
1. 페이지 새로고침 (Ctrl+F5 또는 Cmd+Shift+R)
2. 보안서약서 동의 버튼 클릭
3. 콘솔에서 "✅ 보안서약서 동의 저장 성공" 메시지 확인

## 문제 해결 체크리스트

### 데이터베이스 확인
- [ ] 컬럼이 추가되었는가? (`security_agreement_accepted`, `security_agreement_date`, `security_agreement_company`, `security_agreement_name`)
- [ ] RLS가 활성화되어 있는가?
- [ ] UPDATE 정책이 추가되었는가?
- [ ] `auth_user_id`가 users 테이블에 올바르게 설정되어 있는가?
- [ ] 이메일이 users 테이블과 auth.users 테이블에서 일치하는가?

### 애플리케이션 확인
- [ ] 브라우저를 완전히 새로고침했는가?
- [ ] 로그인이 정상적으로 되어 있는가?
- [ ] 콘솔에 다른 에러가 없는가?

## 추가 디버깅

### 현재 사용자 정보 확인
브라우저 콘솔에서 다음을 실행:

```javascript
// 현재 세션 확인
const session = await window.authSession?.getSession();
console.log('세션:', session);

// 사용자 정보 확인
const userInfo = await window.authService?.getUserInfo();
console.log('사용자 정보:', userInfo);

// Supabase 클라이언트 확인
console.log('Supabase 클라이언트:', window.supabaseClient);
```

### RLS 정책 테스트
Supabase Dashboard > SQL Editor에서:

```sql
-- 현재 사용자로 업데이트 테스트
-- (실제 이메일로 변경)
UPDATE public.users 
SET security_agreement_accepted = true,
    security_agreement_date = NOW(),
    security_agreement_company = '테스트',
    security_agreement_name = '테스트'
WHERE email = 'hclim@evkmc.com'
RETURNING profile_id, email, security_agreement_accepted;
```

## 일반적인 문제와 해결책

### 문제 1: "permission denied for table users"
**원인:** RLS UPDATE 정책이 없거나 조건이 맞지 않음
**해결:** 1단계의 SQL 실행

### 문제 2: "업데이트된 레코드가 없습니다"
**원인:** 
- `auth_user_id`가 NULL이거나 불일치
- 이메일이 일치하지 않음
**해결:** 4단계의 SQL로 `auth_user_id` 동기화

### 문제 3: 정책은 추가했는데 여전히 실패
**원인:** 
- 브라우저 캐시 문제
- 세션 문제
**해결:** 
- 브라우저 완전 새로고침 (Ctrl+F5)
- 로그아웃 후 다시 로그인

## 참고 파일

- 즉시 해결 SQL: `supabase/fix_security_agreement_rls_immediate.sql`
- 마이그레이션 파일: `supabase/migrations/019_add_security_agreement_update_policy.sql`
- 컬럼 추가 SQL: `supabase/apply_security_agreement_migration.sql`

