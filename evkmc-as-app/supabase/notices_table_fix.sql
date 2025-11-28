-- 공지사항 RLS 정책 수정 SQL
-- 기존 정책이 작동하지 않는 경우 이 SQL을 실행하세요

-- 1. 기존 정책 삭제
DROP POLICY IF EXISTS "공지사항 조회는 모든 인증된 사용자 가능" ON public.notices;
DROP POLICY IF EXISTS "공지사항 작성은 관리자 또는 본사 소속만 가능" ON public.notices;
DROP POLICY IF EXISTS "공지사항 수정은 관리자 또는 본사 소속만 가능" ON public.notices;
DROP POLICY IF EXISTS "공지사항 삭제는 관리자 또는 본사 소속만 가능" ON public.notices;

-- 2. 권한 확인 함수 생성 (SECURITY DEFINER로 users 테이블 접근 가능)
CREATE OR REPLACE FUNCTION public.can_manage_notices()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- auth.uid()가 NULL이면 false 반환
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- users 테이블에서 권한 확인
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE users.auth_user_id = auth.uid()
        AND (users.role = 'admin' OR users.affiliation = '본사')
    );
END;
$$;

-- 3. 함수 주석 추가
COMMENT ON FUNCTION public.can_manage_notices() IS '공지사항 관리 권한 확인 함수 (관리자 또는 본사 소속)';

-- 4. RLS 정책 재생성
-- 모든 인증된 사용자는 공지사항 조회 가능
CREATE POLICY "공지사항 조회는 모든 인증된 사용자 가능"
    ON public.notices
    FOR SELECT
    TO authenticated
    USING (true);

-- 관리자(role='admin') 또는 본사 소속(affiliation='본사')만 작성 가능
CREATE POLICY "공지사항 작성은 관리자 또는 본사 소속만 가능"
    ON public.notices
    FOR INSERT
    TO authenticated
    WITH CHECK (public.can_manage_notices());

-- 관리자(role='admin') 또는 본사 소속(affiliation='본사')만 수정 가능
CREATE POLICY "공지사항 수정은 관리자 또는 본사 소속만 가능"
    ON public.notices
    FOR UPDATE
    TO authenticated
    USING (public.can_manage_notices())
    WITH CHECK (public.can_manage_notices());

-- 관리자(role='admin') 또는 본사 소속(affiliation='본사')만 삭제 가능
CREATE POLICY "공지사항 삭제는 관리자 또는 본사 소속만 가능"
    ON public.notices
    FOR DELETE
    TO authenticated
    USING (public.can_manage_notices());

-- 5. 함수 권한 부여
GRANT EXECUTE ON FUNCTION public.can_manage_notices() TO authenticated;

