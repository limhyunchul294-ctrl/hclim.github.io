-- RLS 무한 재귀 오류 수정
-- 문제: "Admins can view all users" 정책이 users 테이블을 자기 참조하여 무한 루프 발생
-- 해결: SECURITY DEFINER 함수를 사용하여 RLS를 우회한 관리자 확인

-- ============================================
-- 1. 관리자 확인 함수 생성 (SECURITY DEFINER로 RLS 우회)
-- ============================================
CREATE OR REPLACE FUNCTION is_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users
        WHERE auth_user_id = check_user_id
        AND role = 'admin'
    );
$$;

-- ============================================
-- 2. 기존 문제 정책 삭제
-- ============================================
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update any user" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.users;

-- ============================================
-- 3. 수정된 SELECT 정책
-- ============================================
-- 일반 사용자: 자기 레코드만 조회
CREATE POLICY "Users can view their own data"
ON public.users
FOR SELECT
TO authenticated
USING (
    auth_user_id = auth.uid()
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR is_admin(auth.uid())
);

-- ============================================
-- 4. 수정된 UPDATE 정책
-- ============================================
-- 관리자: 모든 사용자 수정 가능
CREATE POLICY "Admins can update any user"
ON public.users
FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- 일반 사용자: 자기 프로필만 수정 가능
CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());

-- ============================================
-- 5. RLS 활성화 확인
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
