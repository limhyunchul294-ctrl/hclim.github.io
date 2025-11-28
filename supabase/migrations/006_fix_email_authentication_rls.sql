-- 이메일 인증 문제 해결: RLS 정책 확인 및 수정
-- 실행 방법: Supabase Dashboard > SQL Editor에서 실행

-- ============================================
-- 1. 현재 RLS 정책 확인
-- ============================================
-- 이 쿼리로 현재 users 테이블의 RLS 정책을 확인하세요
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'users'
AND schemaname = 'public';

-- ============================================
-- 2. users 테이블 RLS 활성화 확인
-- ============================================
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'users';

-- ============================================
-- 3. 이메일로 조회 가능하도록 RLS 정책 추가/수정
-- ============================================
-- 기존 정책 삭제 (필요시)
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view users" ON public.users;
DROP POLICY IF EXISTS "Public read access for email lookup" ON public.users;

-- 이메일 조회를 위한 RLS 정책 추가
-- 인증된 사용자는 이메일로 사용자 정보를 조회할 수 있음
CREATE POLICY "Authenticated users can view users by email"
ON public.users
FOR SELECT
TO authenticated
USING (true);

-- 또는 더 제한적인 정책 (자신의 정보만 조회)
-- CREATE POLICY "Users can view their own data"
-- ON public.users
-- FOR SELECT
-- TO authenticated
-- USING (auth.uid()::text = auth_user_id::text OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- ============================================
-- 4. RLS 활성화 확인 및 활성화
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. 테스트 쿼리
-- ============================================
-- 아래 쿼리로 이메일 조회가 가능한지 테스트하세요
-- (Supabase Dashboard > SQL Editor에서 실행)
-- SELECT email, name, phone FROM public.users WHERE email = 'hclim@evkmc.com' LIMIT 1;

