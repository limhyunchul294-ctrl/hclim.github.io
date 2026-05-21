-- 수퍼바이저: 계정 생성·삭제, 프로필(이름·소속) 수정 확장

-- ============================================
-- 1. admin_update_user_identity — 이름·소속·연락처 추가
-- ============================================
CREATE OR REPLACE FUNCTION public.admin_update_user_identity(
  p_profile_id BIGINT,
  p_username TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_role TEXT DEFAULT NULL,
  p_grade TEXT DEFAULT NULL,
  p_name TEXT DEFAULT NULL,
  p_affiliation TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_auth_id UUID;
  v_clean_email TEXT;
  v_clean_username TEXT;
  v_new_grade TEXT;
  v_target_username TEXT;
  v_clean_name TEXT;
  v_clean_affiliation TEXT;
  v_clean_phone TEXT;
BEGIN
  IF p_profile_id IS NULL THEN
    RAISE EXCEPTION 'profile_id가 필요합니다.';
  END IF;

  SELECT username INTO v_target_username
  FROM public.users
  WHERE profile_id = p_profile_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION '사용자를 찾을 수 없습니다.';
  END IF;

  IF public.is_portal_supervisor(auth.uid()) THEN
    v_clean_email := NULLIF(LOWER(TRIM(p_email)), '');
    v_clean_username := NULLIF(TRIM(p_username), '');
    v_new_grade := NULLIF(LOWER(TRIM(p_grade)), '');
    v_clean_name := NULLIF(TRIM(p_name), '');
    v_clean_affiliation := NULLIF(TRIM(p_affiliation), '');
    v_clean_phone := NULLIF(TRIM(p_phone), '');

    IF v_clean_email IS NOT NULL AND v_clean_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
      RAISE EXCEPTION '올바른 이메일 형식이 아닙니다.';
    END IF;

    IF v_new_grade = 'supervisor' THEN
      RAISE EXCEPTION '수퍼바이저 등급 값은 사용할 수 없습니다.';
    END IF;

    IF v_new_grade IS NOT NULL AND v_new_grade NOT IN ('blue', 'silver', 'black') THEN
      RAISE EXCEPTION '허용되지 않는 등급입니다. (blue, silver, black만 가능)';
    END IF;

    IF v_clean_email IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.users
      WHERE LOWER(TRIM(email)) = v_clean_email AND profile_id <> p_profile_id
    ) THEN
      RAISE EXCEPTION '이미 사용 중인 이메일입니다.';
    END IF;

    IF v_clean_username IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.users
      WHERE LOWER(TRIM(username)) = LOWER(v_clean_username) AND profile_id <> p_profile_id
    ) THEN
      RAISE EXCEPTION '이미 사용 중인 ID입니다.';
    END IF;

    IF LOWER(TRIM(v_target_username)) = 'ek0v029'
       AND v_clean_username IS NOT NULL
       AND LOWER(TRIM(v_clean_username)) <> 'ek0v029' THEN
      RAISE EXCEPTION '수퍼바이저 계정(EK0V029)의 ID는 변경할 수 없습니다.';
    END IF;

    SELECT auth_user_id INTO v_auth_id FROM public.users WHERE profile_id = p_profile_id;

    UPDATE public.users
    SET
      username = COALESCE(v_clean_username, username),
      email = COALESCE(v_clean_email, email),
      role = COALESCE(NULLIF(TRIM(p_role), ''), role),
      grade = COALESCE(v_new_grade, grade),
      name = COALESCE(v_clean_name, name),
      affiliation = COALESCE(v_clean_affiliation, affiliation),
      phone = COALESCE(v_clean_phone, phone),
      updated_at = NOW()
    WHERE profile_id = p_profile_id;

    IF v_auth_id IS NOT NULL AND v_clean_email IS NOT NULL THEN
      UPDATE auth.users SET email = v_clean_email WHERE id = v_auth_id;
    END IF;

    RETURN jsonb_build_object(
      'success', true,
      'profile_id', p_profile_id,
      'mode', 'supervisor_full'
    );
  END IF;

  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION '권한이 없습니다.';
  END IF;

  v_new_grade := NULLIF(LOWER(TRIM(p_grade)), '');

  IF v_new_grade = 'supervisor' THEN
    RAISE EXCEPTION '수퍼바이저 등급은 웹에서 지정할 수 없습니다.';
  END IF;

  IF v_new_grade IS NOT NULL AND v_new_grade NOT IN ('blue', 'silver', 'black') THEN
    RAISE EXCEPTION '허용되지 않는 등급입니다. (blue, silver, black만 가능)';
  END IF;

  IF NULLIF(TRIM(p_username), '') IS NOT NULL
     OR NULLIF(TRIM(p_email), '') IS NOT NULL
     OR NULLIF(TRIM(p_role), '') IS NOT NULL
     OR NULLIF(TRIM(p_name), '') IS NOT NULL
     OR NULLIF(TRIM(p_affiliation), '') IS NOT NULL
     OR NULLIF(TRIM(p_phone), '') IS NOT NULL THEN
    RAISE EXCEPTION '관리자 계정은 등급만 변경할 수 있습니다.';
  END IF;

  UPDATE public.users
  SET grade = COALESCE(v_new_grade, grade), updated_at = NOW()
  WHERE profile_id = p_profile_id;

  RETURN jsonb_build_object(
    'success', true,
    'profile_id', p_profile_id,
    'mode', 'admin_grade_only',
    'grade', (SELECT grade FROM public.users WHERE profile_id = p_profile_id)
  );
END;
$$;

-- ============================================
-- 2. 수퍼바이저 계정 생성 (public.users, auth 미연결·첫 로그인 시 연결)
-- ============================================
CREATE OR REPLACE FUNCTION public.supervisor_create_portal_user(
  p_username TEXT,
  p_email TEXT,
  p_name TEXT DEFAULT NULL,
  p_affiliation TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_role TEXT DEFAULT 'user',
  p_grade TEXT DEFAULT 'blue'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clean_username TEXT;
  v_clean_email TEXT;
  v_clean_grade TEXT;
  v_clean_role TEXT;
  v_profile_id BIGINT;
BEGIN
  IF NOT public.is_portal_supervisor(auth.uid()) THEN
    RAISE EXCEPTION '수퍼바이저만 계정을 생성할 수 있습니다.';
  END IF;

  v_clean_username := NULLIF(TRIM(p_username), '');
  v_clean_email := NULLIF(LOWER(TRIM(p_email)), '');

  IF v_clean_username IS NULL OR v_clean_email IS NULL THEN
    RAISE EXCEPTION 'ID(사번)와 이메일은 필수입니다.';
  END IF;

  IF v_clean_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION '올바른 이메일 형식이 아닙니다.';
  END IF;

  IF LOWER(v_clean_username) = 'ek0v029' THEN
    RAISE EXCEPTION '수퍼바이저 ID는 웹에서 생성할 수 없습니다.';
  END IF;

  v_clean_grade := COALESCE(NULLIF(LOWER(TRIM(p_grade)), ''), 'blue');
  IF v_clean_grade NOT IN ('blue', 'silver', 'black') THEN
    RAISE EXCEPTION '허용되지 않는 등급입니다.';
  END IF;

  v_clean_role := COALESCE(NULLIF(LOWER(TRIM(p_role)), ''), 'user');
  IF v_clean_role NOT IN ('user', 'admin') THEN
    RAISE EXCEPTION '역할은 user 또는 admin만 가능합니다.';
  END IF;

  IF EXISTS (SELECT 1 FROM public.users WHERE LOWER(TRIM(username)) = LOWER(v_clean_username)) THEN
    RAISE EXCEPTION '이미 사용 중인 ID입니다.';
  END IF;

  IF EXISTS (SELECT 1 FROM public.users WHERE LOWER(TRIM(email)) = v_clean_email) THEN
    RAISE EXCEPTION '이미 사용 중인 이메일입니다.';
  END IF;

  INSERT INTO public.users (
    username, email, name, affiliation, phone, role, grade, auth_user_id
  ) VALUES (
    v_clean_username,
    v_clean_email,
    NULLIF(TRIM(p_name), ''),
    NULLIF(TRIM(p_affiliation), ''),
    NULLIF(TRIM(p_phone), ''),
    v_clean_role,
    v_clean_grade,
    NULL
  )
  RETURNING profile_id INTO v_profile_id;

  RETURN jsonb_build_object(
    'success', true,
    'profile_id', v_profile_id,
    'username', v_clean_username,
    'email', v_clean_email
  );
END;
$$;

-- ============================================
-- 3. 수퍼바이저 계정 삭제
-- ============================================
CREATE OR REPLACE FUNCTION public.supervisor_delete_portal_user(p_profile_id BIGINT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_auth_id UUID;
  v_username TEXT;
BEGIN
  IF NOT public.is_portal_supervisor(auth.uid()) THEN
    RAISE EXCEPTION '수퍼바이저만 계정을 삭제할 수 있습니다.';
  END IF;

  IF p_profile_id IS NULL THEN
    RAISE EXCEPTION 'profile_id가 필요합니다.';
  END IF;

  SELECT auth_user_id, username INTO v_auth_id, v_username
  FROM public.users
  WHERE profile_id = p_profile_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION '사용자를 찾을 수 없습니다.';
  END IF;

  IF UPPER(TRIM(v_username)) = 'EK0V029' THEN
    RAISE EXCEPTION '수퍼바이저 계정은 삭제할 수 없습니다.';
  END IF;

  DELETE FROM public.users WHERE profile_id = p_profile_id;

  IF v_auth_id IS NOT NULL THEN
    DELETE FROM auth.users WHERE id = v_auth_id;
  END IF;

  RETURN jsonb_build_object('success', true, 'profile_id', p_profile_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.supervisor_create_portal_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.supervisor_delete_portal_user TO authenticated;

-- 활동 로그 이벤트 유형 확장
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
        'admin_user_delete'
    )
);
