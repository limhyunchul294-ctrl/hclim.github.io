-- 이메일 매직링크 로그인을 위한 데이터베이스 설정
-- 실행 방법: Supabase Dashboard > SQL Editor에서 실행

-- ============================================
-- 1. email 컬럼 인덱스 추가 (조회 성능 향상)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email) 
WHERE email IS NOT NULL;

-- ============================================
-- 2. 이메일로 사용자 정보 확인 RPC 함수
-- ============================================
-- ⚠️ 주의: public.users 테이블에 username 컬럼이 없으면 name 컬럼을 사용합니다
CREATE OR REPLACE FUNCTION check_user_email(
    in_username VARCHAR,
    in_email VARCHAR
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- name 컬럼을 사용하여 사용자 확인 (username 컬럼이 없는 경우)
    RETURN EXISTS (
        SELECT 1 
        FROM public.users
        WHERE name = in_username
        AND email = in_email
        AND email IS NOT NULL
    );
END;
$$;

COMMENT ON FUNCTION check_user_email IS '사용자명(name)과 이메일로 사용자 존재 여부 확인 (매직링크 로그인용)';

-- ============================================
-- 3. 이메일로 사용자 정보 조회 함수 (선택사항)
-- ============================================
CREATE OR REPLACE FUNCTION get_user_by_email(
    in_email VARCHAR
)
RETURNS TABLE (
    id BIGINT,
    username VARCHAR,
    email VARCHAR,
    phone VARCHAR,
    role VARCHAR,
    affiliation VARCHAR
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.username,
        u.email,
        u.phone,
        u.role,
        u.affiliation
    FROM public.users u
    WHERE u.email = in_email
    AND u.email IS NOT NULL
    LIMIT 1;
END;
$$;

COMMENT ON FUNCTION get_user_by_email IS '이메일로 사용자 정보 조회';



