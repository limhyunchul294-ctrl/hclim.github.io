-- 이메일 인식 문제 심층 진단
-- 실행 방법: Supabase Dashboard > SQL Editor에서 실행
-- 목적: 왜 이메일이 인식되지 않는지 정확히 파악

-- ============================================
-- 1. public.users의 모든 이메일 확인 (상세)
-- ============================================
-- 이 쿼리로 public.users에 실제로 어떤 이메일이 저장되어 있는지 확인합니다
SELECT 
    profile_id,
    name,
    username,
    email,
    phone,
    auth_user_id,
    LENGTH(email) as email_length,
    LOWER(TRIM(email)) as normalized_email,
    CASE 
        WHEN email IS NULL THEN 'NULL'
        WHEN email = '' THEN '빈 문자열'
        WHEN TRIM(email) = '' THEN '공백만'
        ELSE '값 있음'
    END as email_status,
    -- 이메일 형식 검증
    CASE 
        WHEN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$' THEN '✅ 유효한 형식'
        ELSE '❌ 형식 오류'
    END as email_format_check
FROM public.users
WHERE email IS NOT NULL
ORDER BY profile_id
LIMIT 100;

-- ============================================
-- 2. hclim 또는 evkmc가 포함된 모든 레코드 검색
-- ============================================
-- 대소문자, 공백 등과 관계없이 검색
SELECT 
    profile_id,
    name,
    username,
    email,
    phone,
    auth_user_id,
    'public.users' as source_table
FROM public.users
WHERE 
    LOWER(COALESCE(email, '')) LIKE '%hclim%'
    OR LOWER(COALESCE(email, '')) LIKE '%evkmc%'
    OR LOWER(COALESCE(name, '')) LIKE '%hclim%'
    OR LOWER(COALESCE(username, '')) LIKE '%hclim%'
ORDER BY profile_id;

-- ============================================
-- 3. auth.users에서 hclim@evkmc.com 확인
-- ============================================
SELECT 
    id as auth_user_id,
    email as auth_email,
    phone as auth_phone,
    created_at,
    updated_at,
    raw_user_meta_data,
    'auth.users' as source_table
FROM auth.users
WHERE 
    LOWER(TRIM(COALESCE(email, ''))) LIKE '%hclim%'
    OR LOWER(TRIM(COALESCE(email, ''))) LIKE '%evkmc%'
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- 4. 정확한 이메일 매칭 시도 (모든 변형)
-- ============================================
-- 다양한 형식으로 매칭 시도
SELECT 
    'public.users' as table_name,
    profile_id,
    email,
    LOWER(TRIM(email)) as normalized,
    CASE 
        WHEN LOWER(TRIM(email)) = 'hclim@evkmc.com' THEN '✅ 정확히 일치'
        WHEN LOWER(TRIM(email)) LIKE '%hclim@evkmc.com%' THEN '⚠️ 부분 일치'
        ELSE '❌ 불일치'
    END as match_status
FROM public.users
WHERE email IS NOT NULL
  AND (
    LOWER(TRIM(email)) = 'hclim@evkmc.com'
    OR LOWER(TRIM(email)) LIKE '%hclim@evkmc.com%'
  )
UNION ALL
SELECT 
    'auth.users' as table_name,
    id::text as profile_id,
    email,
    LOWER(TRIM(email)) as normalized,
    CASE 
        WHEN LOWER(TRIM(email)) = 'hclim@evkmc.com' THEN '✅ 정확히 일치'
        WHEN LOWER(TRIM(email)) LIKE '%hclim@evkmc.com%' THEN '⚠️ 부분 일치'
        ELSE '❌ 불일치'
    END as match_status
FROM auth.users
WHERE email IS NOT NULL
  AND (
    LOWER(TRIM(email)) = 'hclim@evkmc.com'
    OR LOWER(TRIM(email)) LIKE '%hclim@evkmc.com%'
  );

-- ============================================
-- 5. auth.users와 public.users 간 연결 상태 확인
-- ============================================
-- LEFT JOIN으로 양쪽 테이블 모두 확인
SELECT 
    COALESCE(pu.profile_id::text, 'N/A') as profile_id,
    COALESCE(pu.name, 'N/A') as name,
    COALESCE(pu.email, 'N/A') as public_email,
    COALESCE(au.email, 'N/A') as auth_email,
    COALESCE(pu.auth_user_id::text, 'NULL') as public_auth_user_id,
    COALESCE(au.id::text, 'NULL') as auth_id,
    CASE 
        WHEN pu.profile_id IS NULL AND au.id IS NOT NULL THEN '❌ public.users에 없음 (auth.users에만 있음)'
        WHEN pu.profile_id IS NOT NULL AND au.id IS NULL THEN '❌ auth.users에 없음 (public.users에만 있음)'
        WHEN pu.auth_user_id = au.id THEN '✅ 정상 연결됨'
        WHEN pu.auth_user_id IS NULL THEN '❌ auth_user_id 없음'
        WHEN LOWER(TRIM(COALESCE(pu.email, ''))) = LOWER(TRIM(COALESCE(au.email, ''))) THEN '⚠️ 이메일은 일치하지만 auth_user_id 불일치'
        ELSE '❌ 연결 안됨'
    END as connection_status
FROM auth.users au
FULL OUTER JOIN public.users pu ON (
    pu.auth_user_id = au.id 
    OR LOWER(TRIM(COALESCE(pu.email, ''))) = LOWER(TRIM(COALESCE(au.email, '')))
)
WHERE 
    LOWER(TRIM(COALESCE(pu.email, ''))) LIKE '%hclim%'
    OR LOWER(TRIM(COALESCE(au.email, ''))) LIKE '%hclim%'
    OR LOWER(TRIM(COALESCE(pu.email, ''))) LIKE '%evkmc%'
    OR LOWER(TRIM(COALESCE(au.email, ''))) LIKE '%evkmc%'
LIMIT 20;

-- ============================================
-- 6. profile_id 70 확인 (새로 생성된 레코드)
-- ============================================
SELECT 
    profile_id,
    name,
    username,
    email,
    phone,
    auth_user_id,
    created_at,
    updated_at
FROM public.users
WHERE profile_id = 70;

-- ============================================
-- 7. 모든 profile_id와 이메일 목록 (간단 버전)
-- ============================================
SELECT 
    profile_id,
    name,
    email,
    auth_user_id
FROM public.users
WHERE email IS NOT NULL
  AND TRIM(email) != ''
ORDER BY profile_id;

