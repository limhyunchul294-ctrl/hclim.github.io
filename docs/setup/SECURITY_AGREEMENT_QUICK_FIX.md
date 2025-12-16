# 보안서약서 동의 저장 문제 빠른 해결 가이드

## ⚠️ 현재 문제
- **403 Forbidden** 에러
- **"permission denied for table users"** 메시지
- 보안서약서 동의 저장 실패

## ✅ 즉시 해결 (3단계)

### 1단계: Supabase Dashboard에서 SQL 실행

1. **Supabase Dashboard 접속**
   - https://app.supabase.com
   - 프로젝트 선택

2. **SQL Editor 열기**
   - 왼쪽 메뉴 → "SQL Editor"
   - "New query" 클릭

3. **아래 SQL 복사하여 실행**

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
    (email IS NOT NULL AND LOWER(TRIM(email)) = LOWER(TRIM(COALESCE((SELECT email FROM auth.users WHERE id = auth.uid()), ''))))
)
WITH CHECK (
    (auth_user_id IS NOT NULL AND auth_user_id::text = auth.uid()::text)
    OR
    (email IS NOT NULL AND LOWER(TRIM(email)) = LOWER(TRIM(COALESCE((SELECT email FROM auth.users WHERE id = auth.uid()), ''))))
);

-- RLS 활성화 확인
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
```

4. **실행 결과 확인**
   - "Success. No rows returned" 또는 "Success" 메시지 확인

### 2단계: 정책 확인 (선택사항)

정책이 제대로 추가되었는지 확인:

```sql
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'users' AND cmd = 'UPDATE';
```

**예상 결과:**
- `policyname`: "Users can update their own security agreement"
- `cmd`: "UPDATE"
- `roles`: "{authenticated}"

### 3단계: 브라우저에서 테스트

1. **완전 새로고침**
   - Windows: `Ctrl + F5`
   - Mac: `Cmd + Shift + R`

2. **보안서약서 동의 버튼 클릭**

3. **콘솔 확인**
   - "✅ 보안서약서 동의 저장 성공" 메시지 확인
   - 에러가 없어야 함

## 🔍 여전히 실패하는 경우

### 추가 확인: auth_user_id 동기화

만약 여전히 실패한다면, `auth_user_id`가 동기화되지 않았을 수 있습니다:

```sql
-- 이메일로 auth_user_id 동기화 (실제 이메일로 변경)
UPDATE public.users
SET auth_user_id = (SELECT id FROM auth.users WHERE email = 'hclim@evkmc.com')
WHERE email = 'hclim@evkmc.com'
  AND (auth_user_id IS NULL OR auth_user_id != (SELECT id FROM auth.users WHERE email = 'hclim@evkmc.com'))
RETURNING profile_id, email, auth_user_id;
```

### 사용자 레코드 확인

현재 사용자의 레코드가 올바르게 설정되어 있는지 확인:

```sql
-- 이메일로 확인 (실제 이메일로 변경)
SELECT 
    profile_id,
    auth_user_id,
    email,
    security_agreement_accepted,
    (SELECT id FROM auth.users WHERE email = 'hclim@evkmc.com') as auth_users_id
FROM public.users
WHERE email = 'hclim@evkmc.com';
```

**확인 사항:**
- [ ] 레코드가 존재하는가?
- [ ] `auth_user_id`가 설정되어 있는가?
- [ ] `auth_users_id`와 `auth_user_id`가 일치하는가?

## 📝 참고 파일

- **즉시 해결 SQL**: `supabase/fix_security_agreement_rls_final.sql`
- **상세 가이드**: `docs/setup/SECURITY_AGREEMENT_TROUBLESHOOTING.md`
- **RLS 정책 수정**: `supabase/migrations/019_add_security_agreement_update_policy.sql`

## ⚡ 빠른 체크리스트

- [ ] SQL을 Supabase Dashboard에서 실행했는가?
- [ ] "Success" 메시지를 확인했는가?
- [ ] 브라우저를 완전히 새로고침했는가? (Ctrl+F5)
- [ ] 여전히 실패한다면 auth_user_id 동기화 SQL을 실행했는가?

