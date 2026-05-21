-- 보증 마스터 CSV보내기 활동 로그 이벤트
ALTER TABLE public.portal_activity_log DROP CONSTRAINT IF EXISTS portal_activity_log_event_type_chk;
ALTER TABLE public.portal_activity_log ADD CONSTRAINT portal_activity_log_event_type_chk CHECK (
    event_type IN (
        'session_start',
        'route_view',
        'manual_open',
        'manual_download',
        'dtc_select',
        'admin_user_update',
        'admin_user_create',
        'admin_user_delete',
        'warranty_master_export'
    )
);
