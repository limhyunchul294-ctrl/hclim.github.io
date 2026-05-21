-- INSERT RLS: 클라이언트는 actor_user_id를 보내지 않음(트리거가 auth.uid()로 설정).
-- WITH CHECK (actor_user_id = auth.uid())는 일부 경로에서 트리거 전 검사로 거절될 수 있어 완화.

DROP POLICY IF EXISTS portal_activity_log_insert_own ON public.portal_activity_log;
CREATE POLICY portal_activity_log_insert_own
ON public.portal_activity_log
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);
