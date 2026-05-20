-- 포털 활동 로그 (B2B 관행 수준: 인증·주요 문서 접근·관리자 작업 요약)

-- ============================================
-- 1. 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS public.portal_activity_log (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actor_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    resource_category TEXT,
    resource_key TEXT,
    payload JSONB NOT NULL DEFAULT '{}'::JSONB,
    CONSTRAINT portal_activity_log_event_type_chk CHECK (
        event_type IN (
            'session_start',
            'route_view',
            'manual_open',
            'manual_download',
            'dtc_select',
            'admin_user_update'
        )
    )
);

COMMENT ON TABLE public.portal_activity_log IS '포털 이용 요약 로그 — 변조 방지 위해 actor는 INSERT 트리거로 auth.uid() 고정';

-- ============================================
-- 2. actor_user_id 고정 트리거 (클라이언트 무시)
-- ============================================
CREATE OR REPLACE FUNCTION public.portal_activity_log_set_actor()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.actor_user_id := auth.uid();
    IF NEW.actor_user_id IS NULL THEN
        RAISE EXCEPTION 'portal_activity_log: authentication required';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_portal_activity_log_set_actor ON public.portal_activity_log;
CREATE TRIGGER trg_portal_activity_log_set_actor
    BEFORE INSERT ON public.portal_activity_log
    FOR EACH ROW
    EXECUTE FUNCTION public.portal_activity_log_set_actor();

-- ============================================
-- 3. RLS
-- ============================================
ALTER TABLE public.portal_activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS portal_activity_log_insert_own ON public.portal_activity_log;
CREATE POLICY portal_activity_log_insert_own
ON public.portal_activity_log
FOR INSERT
TO authenticated
WITH CHECK (actor_user_id = auth.uid());

DROP POLICY IF EXISTS portal_activity_log_select_admin ON public.portal_activity_log;
CREATE POLICY portal_activity_log_select_admin
ON public.portal_activity_log
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS portal_activity_log_delete_admin ON public.portal_activity_log;
CREATE POLICY portal_activity_log_delete_admin
ON public.portal_activity_log
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- ============================================
-- 4. 인덱스
-- ============================================
CREATE INDEX IF NOT EXISTS idx_portal_activity_log_created_at
ON public.portal_activity_log (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_portal_activity_log_actor_created_at
ON public.portal_activity_log (actor_user_id, created_at DESC);

-- ============================================
-- 5. API 역할 부여 (RLS 적용 후에도 접근 허용)
-- ============================================
GRANT SELECT, INSERT, DELETE ON public.portal_activity_log TO authenticated;
