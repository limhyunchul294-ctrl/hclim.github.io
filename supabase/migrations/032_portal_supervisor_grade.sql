-- 수퍼바이저(히든 등급): EK0V029 전용, 이용 로그·운영 권한. 웹에서는 blue/silver/black만 변경.

-- ============================================
-- 1. 수퍼바이저 판별
-- ============================================
CREATE OR REPLACE FUNCTION public.is_portal_supervisor(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users
        WHERE auth_user_id = check_user_id
        AND LOWER(TRIM(grade)) = 'supervisor'
    );
$$;

CREATE OR REPLACE FUNCTION public.can_view_portal_activity_log(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT public.is_admin(check_user_id) OR public.is_portal_supervisor(check_user_id);
$$;

-- ============================================
-- 2. 이용 로그 RLS (관리자 + 수퍼바이저)
-- ============================================
DROP POLICY IF EXISTS portal_activity_log_select_admin ON public.portal_activity_log;
CREATE POLICY portal_activity_log_select_admin
ON public.portal_activity_log
FOR SELECT
TO authenticated
USING (public.can_view_portal_activity_log(auth.uid()));

DROP POLICY IF EXISTS portal_activity_log_delete_admin ON public.portal_activity_log;
CREATE POLICY portal_activity_log_delete_admin
ON public.portal_activity_log
FOR DELETE
TO authenticated
USING (public.can_view_portal_activity_log(auth.uid()));

-- ============================================
-- 3. 관리자 웹: 등급만 변경 (supervisor 지정 금지)
-- ============================================
CREATE OR REPLACE FUNCTION public.admin_update_user_identity(
  p_profile_id BIGINT,
  p_username TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_role TEXT DEFAULT NULL,
  p_grade TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_auth_id UUID;
  v_new_grade TEXT;
  v_target_username TEXT;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION '관리자만 사용할 수 있습니다.';
  END IF;

  IF p_profile_id IS NULL THEN
    RAISE EXCEPTION 'profile_id가 필요합니다.';
  END IF;

  v_new_grade := NULLIF(LOWER(TRIM(p_grade)), '');

  IF v_new_grade = 'supervisor' THEN
    RAISE EXCEPTION '수퍼바이저 등급은 웹에서 지정할 수 없습니다.';
  END IF;

  IF v_new_grade IS NOT NULL AND v_new_grade NOT IN ('blue', 'silver', 'black') THEN
    RAISE EXCEPTION '허용되지 않는 등급입니다. (blue, silver, black만 가능)';
  END IF;

  SELECT username INTO v_target_username
  FROM public.users
  WHERE profile_id = p_profile_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION '사용자를 찾을 수 없습니다.';
  END IF;

  IF LOWER(TRIM(v_target_username)) = 'ek0v029' AND v_new_grade IS NOT NULL AND v_new_grade <> 'supervisor' THEN
    RAISE EXCEPTION 'EK0V029 계정의 수퍼바이저 등급은 웹에서 변경할 수 없습니다.';
  END IF;

  IF NULLIF(TRIM(p_username), '') IS NOT NULL
     OR NULLIF(TRIM(p_email), '') IS NOT NULL
     OR NULLIF(TRIM(p_role), '') IS NOT NULL THEN
    RAISE EXCEPTION '웹 관리 화면에서는 등급만 변경할 수 있습니다. 계정 추가·ID/이메일/역할 변경은 별도 절차를 사용하세요.';
  END IF;

  UPDATE public.users
  SET
    grade = COALESCE(v_new_grade, grade),
    updated_at = NOW()
  WHERE profile_id = p_profile_id;

  RETURN jsonb_build_object(
    'success', true,
    'profile_id', p_profile_id,
    'grade', (SELECT grade FROM public.users WHERE profile_id = p_profile_id)
  );
END;
$$;

-- ============================================
-- 4. EK0V029 수퍼바이저 지정 (히든 등급)
-- ============================================
UPDATE public.users
SET grade = 'supervisor',
    updated_at = NOW()
WHERE UPPER(TRIM(username)) = 'EK0V029';

-- ============================================
-- 5. DB 직접 수정 시 supervisor 오용 방지
-- ============================================
CREATE OR REPLACE FUNCTION public.users_guard_supervisor_grade()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.grade IS NOT NULL AND LOWER(TRIM(NEW.grade)) = 'supervisor' THEN
    IF UPPER(TRIM(COALESCE(NEW.username, ''))) <> 'EK0V029' THEN
      RAISE EXCEPTION 'supervisor 등급은 EK0V029 계정에만 지정할 수 있습니다.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_users_guard_supervisor_grade ON public.users;
CREATE TRIGGER trg_users_guard_supervisor_grade
  BEFORE INSERT OR UPDATE OF grade, username ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.users_guard_supervisor_grade();
