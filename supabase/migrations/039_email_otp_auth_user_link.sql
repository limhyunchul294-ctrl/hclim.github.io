-- 이메일 OTP 로그인: auth.users 생성 시 public.users.auth_user_id를 이메일로도 연결
-- (기존 트리거는 전화번호만 매칭 → 이메일-only 계정은 auth_user_id가 비어 OTP 실패)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_phone TEXT;
    normalized_phone TEXT;
    linked_count INTEGER := 0;
BEGIN
    user_phone := NEW.phone;
    IF user_phone IS NOT NULL THEN
        IF user_phone LIKE '+82%' THEN
            normalized_phone := '0' || SUBSTRING(user_phone FROM 4);
        ELSIF user_phone LIKE '82%' THEN
            normalized_phone := '0' || SUBSTRING(user_phone FROM 3);
        ELSE
            normalized_phone := user_phone;
        END IF;
        normalized_phone := REPLACE(normalized_phone, '-', '');
    ELSE
        normalized_phone := NULL;
    END IF;

    IF normalized_phone IS NOT NULL THEN
        UPDATE public.users
        SET auth_user_id = NEW.id
        WHERE REPLACE(phone, '-', '') = normalized_phone
          AND (auth_user_id IS NULL OR auth_user_id <> NEW.id);
        GET DIAGNOSTICS linked_count = ROW_COUNT;
    END IF;

    IF linked_count = 0 AND NEW.email IS NOT NULL THEN
        UPDATE public.users
        SET auth_user_id = NEW.id
        WHERE LOWER(TRIM(email)) = LOWER(TRIM(NEW.email))
          AND (auth_user_id IS NULL OR auth_user_id <> NEW.id);
    END IF;

    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS
  'auth.users INSERT 시 public.users.auth_user_id를 전화번호 또는 이메일로 연결';

-- 기존 auth.users ↔ public.users 이메일 매칭 백필
UPDATE public.users u
SET auth_user_id = au.id
FROM auth.users au
WHERE u.auth_user_id IS NULL
  AND u.email IS NOT NULL
  AND TRIM(u.email) <> ''
  AND LOWER(TRIM(u.email)) = LOWER(TRIM(au.email));
