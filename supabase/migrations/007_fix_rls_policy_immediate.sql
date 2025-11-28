-- 이메일 인증 문제 즉시 해결: RLS 정책 수정
-- 실행 방법: Supabase Dashboard > SQL Editor에서 실행

-- ============================================
-- 1. 기존 정책 모두 삭제 (깔끔하게 시작)
-- ============================================
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view users" ON public.users;
DROP POLICY IF EXISTS "Public read access for email lookup" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view users by email" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.users;

-- ============================================
-- 2. 인증된 사용자는 모든 사용자 정보 조회 가능 (이메일 포함)
-- ============================================
CREATE POLICY "Enable read access for all authenticated users"
ON public.users
FOR SELECT
TO authenticated
USING (true);

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
    qual
FROM pg_policies
WHERE tablename = 'users'
AND schemaname = 'public';

-- ============================================
-- 5. 테스트 쿼리 (실제 이메일로 테스트)
-- ============================================
-- 아래 쿼리를 실행해서 이메일 조회가 가능한지 확인하세요
-- SELECT email, name, phone FROM public.users WHERE email = 'hclim@evkmc.com' LIMIT 1;

