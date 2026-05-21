-- 관리자(role): 웹에서 등급만 변경. 수퍼바이저(EK0V029): ID·이메일·역할·등급 전체 변경.
-- 수퍼바이저 표시 등급: black (권한은 username EK0V029로 판별)

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
        AND UPPER(TRIM(username)) = 'EK0V029'
    );
$$;

UPDATE public.users
SET grade = 'black',
    updated_at = NOW()
WHERE UPPER(TRIM(username)) = 'EK0V029';

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
  v_clean_email TEXT;
  v_clean_username TEXT;
  v_new_grade TEXT;
  v_target_username TEXT;
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

  -- 수퍼바이저(EK0V029): ID·이메일·역할·등급
  IF public.is_portal_supervisor(auth.uid()) THEN
    v_clean_email := NULLIF(LOWER(TRIM(p_email)), '');
    v_clean_username := NULLIF(TRIM(p_username), '');
    v_new_grade := NULLIF(LOWER(TRIM(p_grade)), '');

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

  -- 일반 관리자(role): 등급만
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
     OR NULLIF(TRIM(p_role), '') IS NOT NULL THEN
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
