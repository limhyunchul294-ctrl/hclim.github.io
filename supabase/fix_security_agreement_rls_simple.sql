-- ============================================
-- 보안서약서 동의 저장 문제 간단 해결 (사용자 제안 방식)
-- ============================================
-- 이 파일을 Supabase Dashboard > SQL Editor에서 실행하세요
-- 실행 후 브라우저를 완전히 새로고침(Ctrl+F5)하고 다시 시도하세요
--
-- 사용자 제안: auth.uid() = id 방식
-- 실제 적용: auth.uid() = auth_user_id (public.users 테이블의 실제 컬럼명)

-- ============================================
-- 1. 기존 UPDATE 정책 모두 삭제
-- ============================================
DROP POLICY IF EXISTS "Users can update their own security agreement" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can update users" ON public.users;
DROP POLICY IF EXISTS "Users can update security agreement" ON public.users;
DROP POLICY IF EXISTS "Allow users to update security agreement" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

-- ============================================
-- 2. 간단한 보안서약서 업데이트 정책 생성 (사용자 제안 방식)
-- ============================================
-- 방법 1: auth_user_id가 직접 auth.uid()와 일치하는 경우 (가장 간단)
CREATE POLICY "Users can update their own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = auth_user_id)
WITH CHECK (auth.uid() = auth_user_id);

-- ============================================
-- 3. RLS 활성화 확인
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. 정책 확인
-- ============================================
SELECT 
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'users'
  AND schemaname = 'public'
  AND cmd = 'UPDATE'
ORDER BY policyname;

-- ============================================
-- 5. auth_user_id 동기화 확인 (필요시)
-- ============================================
-- 만약 auth_user_id가 NULL이거나 잘못된 경우, 아래 SQL로 동기화하세요
-- (실제 이메일로 변경 필요)
-- 
-- UPDATE public.users
-- SET auth_user_id = (SELECT id FROM auth.users WHERE email = 'hclim@evkmc.com')
-- WHERE email = 'hclim@evkmc.com'
--   AND (auth_user_id IS NULL OR auth_user_id != (SELECT id FROM auth.users WHERE email = 'hclim@evkmc.com'))
-- RETURNING profile_id, email, auth_user_id;

-- ============================================
-- 참고: auth_user_id가 NULL인 경우를 위한 대안 정책
-- ============================================
-- 만약 위 정책이 작동하지 않고 auth_user_id가 NULL인 경우가 많다면,
-- 아래 정책을 사용하세요 (기존 정책을 삭제하고 아래 주석을 해제)
--
-- DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
--
-- CREATE POLICY "Users can update their own profile"
-- ON public.users
-- FOR UPDATE
-- TO authenticated
-- USING (
--     auth.uid() = auth_user_id
--     OR
--     (auth_user_id IS NULL AND email = (SELECT email FROM auth.users WHERE id = auth.uid()))
-- )
-- WITH CHECK (
--     auth.uid() = auth_user_id
--     OR
--     (auth_user_id IS NULL AND email = (SELECT email FROM auth.users WHERE id = auth.uid()))
-- );

