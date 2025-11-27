-- auth.users와 public.users를 연결하는 트리거 생성/수정
-- "Database error saving new user" 오류 해결

-- 1. 기존 트리거 확인
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'auth'
AND event_object_table = 'users'
AND event_manipulation = 'INSERT';

-- 2. 기존 트리거가 있다면 삭제 (문제가 있는 경우)
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. auth.users에 새 사용자가 생성될 때 public.users의 auth_user_id를 업데이트하는 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_phone TEXT;
    normalized_phone TEXT;
BEGIN
    -- 전화번호 정규화 (여러 형식 지원)
    user_phone := NEW.phone;
    IF user_phone IS NOT NULL THEN
        -- 형식 1: +8210... -> 010...
        IF user_phone LIKE '+82%' THEN
            normalized_phone := '0' || SUBSTRING(user_phone FROM 4);
        -- 형식 2: 8210... -> 010... (앞에 + 없이 82로 시작)
        ELSIF user_phone LIKE '82%' THEN
            normalized_phone := '0' || SUBSTRING(user_phone FROM 3);
        -- 형식 3: 그 외 (010... 등)
        ELSE
            normalized_phone := user_phone;
        END IF;
        
        -- 하이픈 제거
        normalized_phone := REPLACE(normalized_phone, '-', '');
    ELSE
        normalized_phone := NULL;
    END IF;
    
    -- public.users 테이블에서 해당 전화번호로 사용자 찾기
    UPDATE public.users
    SET auth_user_id = NEW.id
    WHERE phone = normalized_phone
    AND (auth_user_id IS NULL OR auth_user_id != NEW.id);
    
    -- 업데이트된 행이 없으면 로그만 출력 (새 사용자 생성은 실패하지 않음)
    IF NOT FOUND THEN
        RAISE NOTICE '사용자 %에 대한 public.users 레코드를 찾을 수 없습니다. 전화번호: %', NEW.id, normalized_phone;
    END IF;
    
    RETURN NEW;
END;
$$;

-- 4. 트리거 생성 (auth.users에 INSERT 시 실행)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 5. 함수 권한 부여
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- 6. 기존 사용자들의 auth_user_id 업데이트 (한 번만 실행)
-- 이미 auth.users에 있는 사용자들의 auth_user_id를 public.users에 연결
UPDATE public.users u
SET auth_user_id = au.id
FROM auth.users au
WHERE 
    -- 전화번호 매칭 (하이픈 제거 후 비교)
    REPLACE(u.phone, '-', '') = REPLACE(
        CASE 
            WHEN au.phone LIKE '+82%' THEN '0' || SUBSTRING(au.phone FROM 4)
            ELSE au.phone
        END,
        '-', ''
    )
    -- auth_user_id가 없거나 다를 때만 업데이트
    AND (u.auth_user_id IS NULL OR u.auth_user_id != au.id);

COMMENT ON FUNCTION public.handle_new_user() IS 'auth.users에 새 사용자가 생성될 때 public.users의 auth_user_id를 자동으로 업데이트';

