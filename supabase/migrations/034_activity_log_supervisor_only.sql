-- 이용 로그 조회/삭제: 수퍼바이저(EK0V029)만. 일반 관리자(role=admin)는 제외.

CREATE OR REPLACE FUNCTION public.can_view_portal_activity_log(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT public.is_portal_supervisor(check_user_id);
$$;
