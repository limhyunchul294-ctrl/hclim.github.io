-- 관리자: public.users ID(username)·이메일 수정 + auth.users 이메일 동기화

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
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION '관리자만 사용할 수 있습니다.';
  END IF;

  IF p_profile_id IS NULL THEN
    RAISE EXCEPTION 'profile_id가 필요합니다.';
  END IF;

  v_clean_email := NULLIF(LOWER(TRIM(p_email)), '');
  v_clean_username := NULLIF(TRIM(p_username), '');

  IF v_clean_email IS NOT NULL AND v_clean_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION '올바른 이메일 형식이 아닙니다.';
  END IF;

  SELECT auth_user_id INTO v_auth_id
  FROM public.users
  WHERE profile_id = p_profile_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION '사용자를 찾을 수 없습니다.';
  END IF;

  IF v_clean_email IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.users
    WHERE LOWER(TRIM(email)) = v_clean_email
      AND profile_id <> p_profile_id
  ) THEN
    RAISE EXCEPTION '이미 사용 중인 이메일입니다.';
  END IF;

  IF v_clean_username IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.users
    WHERE LOWER(TRIM(username)) = LOWER(v_clean_username)
      AND profile_id <> p_profile_id
  ) THEN
    RAISE EXCEPTION '이미 사용 중인 ID입니다.';
  END IF;

  UPDATE public.users
  SET
    username = COALESCE(v_clean_username, username),
    email = COALESCE(v_clean_email, email),
    role = COALESCE(NULLIF(TRIM(p_role), ''), role),
    grade = COALESCE(NULLIF(TRIM(p_grade), ''), grade),
    updated_at = NOW()
  WHERE profile_id = p_profile_id;

  IF v_auth_id IS NOT NULL AND v_clean_email IS NOT NULL THEN
    UPDATE auth.users
    SET email = v_clean_email
    WHERE id = v_auth_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'profile_id', p_profile_id,
    'username', (SELECT username FROM public.users WHERE profile_id = p_profile_id),
    'email', (SELECT email FROM public.users WHERE profile_id = p_profile_id)
  );
END;
$$;

COMMENT ON FUNCTION public.admin_update_user_identity IS
  '관리자 전용: 사용자 ID(username), 이메일, 역할, 등급 수정 (auth.users 이메일 동기화)';

GRANT EXECUTE ON FUNCTION public.admin_update_user_identity TO authenticated;
