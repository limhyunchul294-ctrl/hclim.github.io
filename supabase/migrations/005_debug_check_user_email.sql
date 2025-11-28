-- check_user_email 함수 디버깅 및 수정
-- 실행 방법: Supabase Dashboard > SQL Editor에서 실행

-- ============================================
-- 1. 현재 users 테이블의 이메일 데이터 확인
-- ============================================
-- 이 쿼리로 실제 등록된 이메일을 확인하세요
SELECT 
    profile_id,
    name,
    email,
    phone,
    CASE 
        WHEN email IS NULL THEN 'NULL'
        WHEN email = '' THEN '빈 문자열'
        ELSE '값 있음'
    END as email_status
FROM public.users
ORDER BY profile_id
LIMIT 20;

-- ============================================
-- 2. check_user_email 함수 수정 (대소문자 무시, 공백 제거)
-- ============================================
CREATE OR REPLACE FUNCTION check_user_email(
    in_username VARCHAR,
    in_email VARCHAR
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    -- 이메일을 소문자로 변환하고 공백 제거
    -- NULL 체크 및 빈 문자열 체크
    IF in_email IS NULL OR TRIM(in_email) = '' THEN
        RETURN FALSE;
    END IF;
    
    -- 이메일이 일치하는 사용자 수 확인 (대소문자 무시)
    SELECT COUNT(*) INTO v_count
    FROM public.users
    WHERE LOWER(TRIM(email)) = LOWER(TRIM(in_email))
    AND email IS NOT NULL
    AND TRIM(email) != '';
    
    -- 디버깅용 (실제 운영에서는 제거)
    RAISE NOTICE '이메일 검색: %, 결과: %', in_email, v_count;
    
    RETURN v_count > 0;
END;
$$;

COMMENT ON FUNCTION check_user_email IS '이메일로 사용자 존재 여부 확인 (대소문자 무시, 공백 제거)';

-- ============================================
-- 3. 테스트 쿼리 (실제 이메일로 테스트)
-- ============================================
-- 아래 쿼리에서 'hclim@evkmc.com'을 실제 등록된 이메일로 변경해서 테스트하세요
-- SELECT check_user_email('EKOV029', 'hclim@evkmc.com');

