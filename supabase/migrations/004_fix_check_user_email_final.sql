-- check_user_email 함수 최종 수정
-- 실행 방법: Supabase Dashboard > SQL Editor에서 실행

-- ============================================
-- 1. 테이블 구조 확인 (실행 후 결과 확인)
-- ============================================
-- 이 쿼리를 먼저 실행해서 테이블 구조를 확인하세요
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- ============================================
-- 2. check_user_email 함수 수정 (이메일만으로 확인)
-- ============================================
-- 사용자명 매칭이 안 되는 경우, 이메일만으로 확인하는 버전
CREATE OR REPLACE FUNCTION check_user_email(
    in_username VARCHAR,
    in_email VARCHAR
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 이메일만으로 사용자 확인 (사용자명은 참고용)
    -- public.users 테이블에 email이 일치하는 사용자가 있는지 확인
    RETURN EXISTS (
        SELECT 1 
        FROM public.users
        WHERE email = in_email
        AND email IS NOT NULL
    );
END;
$$;

COMMENT ON FUNCTION check_user_email IS '이메일로 사용자 존재 여부 확인 (매직링크 로그인용) - 이메일만 확인';

-- ============================================
-- 3. (대안) name 컬럼을 사용하는 버전 (name에 username이 저장된 경우)
-- ============================================
-- 만약 name 컬럼에 username 값이 저장되어 있다면 아래 함수를 사용하세요
/*
CREATE OR REPLACE FUNCTION check_user_email(
    in_username VARCHAR,
    in_email VARCHAR
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.users
        WHERE name = in_username
        AND email = in_email
        AND email IS NOT NULL
    );
END;
$$;
*/

-- ============================================
-- 4. (대안) username 컬럼이 있는 경우를 위한 버전
-- ============================================
-- 만약 username 컬럼이 있다면 아래 함수를 사용하세요
/*
CREATE OR REPLACE FUNCTION check_user_email(
    in_username VARCHAR,
    in_email VARCHAR
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.users
        WHERE username = in_username
        AND email = in_email
        AND email IS NOT NULL
    );
END;
$$;
*/

