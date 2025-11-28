-- 이메일 데이터 확인 및 디버깅
-- 실행 방법: Supabase Dashboard > SQL Editor에서 실행

-- ============================================
-- 1. public.users 테이블의 모든 이메일 데이터 확인
-- ============================================
SELECT 
    profile_id,
    name,
    username,
    email,
    phone,
    auth_user_id,
    LENGTH(email) as email_length,
    CASE 
        WHEN email IS NULL THEN 'NULL'
        WHEN email = '' THEN '빈 문자열'
        WHEN TRIM(email) = '' THEN '공백만'
        ELSE '값 있음'
    END as email_status
FROM public.users
ORDER BY profile_id
LIMIT 50;

-- ============================================
-- 2. 특정 이메일 패턴으로 검색 (대소문자 무시, 공백 제거)
-- ============================================
-- 아래 쿼리에서 'hclim@evkmc.com'을 실제 입력한 이메일로 변경해서 테스트하세요
SELECT 
    profile_id,
    name,
    username,
    email,
    phone,
    auth_user_id,
    LOWER(TRIM(email)) as normalized_email
FROM public.users
WHERE LOWER(TRIM(email)) = LOWER(TRIM('hclim@evkmc.com'))
LIMIT 10;

-- ============================================
-- 3. 이메일이 있는 모든 사용자 확인
-- ============================================
SELECT 
    COUNT(*) as total_users,
    COUNT(email) as users_with_email,
    COUNT(CASE WHEN email IS NOT NULL AND TRIM(email) != '' THEN 1 END) as users_with_valid_email
FROM public.users;

-- ============================================
-- 4. 이메일 형식 검증 (간단한 @ 포함 여부)
-- ============================================
SELECT 
    profile_id,
    name,
    email,
    CASE 
        WHEN email LIKE '%@%' THEN '이메일 형식'
        ELSE '이메일 형식 아님'
    END as email_format_check
FROM public.users
WHERE email IS NOT NULL
AND TRIM(email) != ''
ORDER BY profile_id
LIMIT 20;

-- ============================================
-- 5. auth.users와 public.users 이메일 매칭 확인
-- ============================================
SELECT 
    au.id as auth_user_id,
    au.email as auth_email,
    pu.profile_id,
    pu.name,
    pu.email as public_email,
    pu.auth_user_id,
    CASE 
        WHEN pu.email IS NULL THEN 'public.users에 이메일 없음'
        WHEN LOWER(TRIM(au.email)) = LOWER(TRIM(pu.email)) THEN '이메일 일치'
        ELSE '이메일 불일치'
    END as match_status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.auth_user_id
WHERE au.email = 'hclim@evkmc.com'
LIMIT 10;

