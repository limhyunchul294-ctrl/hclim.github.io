-- users 테이블 RLS 정책 강화
-- 기존: 모든 인증 사용자가 전체 users 테이블 조회 가능
-- 변경: 자기 레코드만 조회 가능 + 관리자는 전체 조회 가능

-- ============================================
-- 1. 기존 정책 삭제
-- ============================================
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.users;

-- ============================================
-- 2. 일반 사용자: 자기 레코드만 조회 가능
-- ============================================
CREATE POLICY "Users can view their own data"
ON public.users
FOR SELECT
TO authenticated
USING (
    auth_user_id = auth.uid()
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- ============================================
-- 3. 관리자: 전체 사용자 조회 가능
-- ============================================
CREATE POLICY "Admins can view all users"
ON public.users
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.auth_user_id = auth.uid()
        AND u.role = 'admin'
    )
);

-- ============================================
-- 4. RLS 활성화 확인
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
