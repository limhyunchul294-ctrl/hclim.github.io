-- check_user_email 함수 수정: username 컬럼 대신 name 컬럼 사용
-- 실행 방법: Supabase Dashboard > SQL Editor에서 실행

-- ============================================
-- 1. check_user_email 함수 수정 (name 컬럼 사용)
-- ============================================
CREATE OR REPLACE FUNCTION check_user_email(
    in_username VARCHAR,
    in_email VARCHAR
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- name 컬럼을 사용하여 사용자 확인
    -- name 컬럼에 username 값이 저장되어 있다고 가정
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
-- 2. (선택사항) username 컬럼 추가 및 마이그레이션
-- ============================================
-- 만약 username 컬럼을 추가하고 싶다면 아래 주석을 해제하세요

-- ALTER TABLE public.users 
-- ADD COLUMN IF NOT EXISTS username VARCHAR(100);

-- -- name 컬럼의 값을 username으로 복사 (name이 username 형식인 경우)
-- -- UPDATE public.users SET username = name WHERE username IS NULL;

-- -- username에 인덱스 추가
-- CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username) 
-- WHERE username IS NOT NULL;

