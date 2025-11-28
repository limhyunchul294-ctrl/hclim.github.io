-- 이메일 매칭 문제 수동 해결
-- 실행 방법: Supabase Dashboard > SQL Editor에서 실행

-- ============================================
-- 1. public.users에서 hclim@evkmc.com 검색 (모든 방법)
-- ============================================
-- 이 쿼리로 public.users에 실제로 어떤 이메일이 있는지 확인합니다
SELECT 
    profile_id,
    name,
    username,
    email,
    phone,
    auth_user_id,
    LENGTH(email) as email_length,
    LOWER(TRIM(email)) as normalized_email
FROM public.users
WHERE email ILIKE '%hclim%'
   OR email ILIKE '%evkmc%'
   OR LOWER(TRIM(email)) LIKE '%hclim%'
ORDER BY profile_id
LIMIT 20;

-- ============================================
-- 2. auth.users에서 hclim@evkmc.com 확인
-- ============================================
SELECT 
    id as auth_user_id,
    email as auth_email,
    phone as auth_phone,
    created_at,
    updated_at
FROM auth.users
WHERE LOWER(TRIM(email)) = LOWER(TRIM('hclim@evkmc.com'))
LIMIT 5;

-- ============================================
-- 3. public.users의 모든 이메일 확인 (profile_id 3 주변)
-- ============================================
-- 이전 이미지에서 profile_id 3에 hclim@evkmc.com이 있었다고 했으므로 확인
SELECT 
    profile_id,
    name,
    username,
    email,
    phone,
    auth_user_id
FROM public.users
WHERE profile_id BETWEEN 1 AND 10
ORDER BY profile_id;

-- ============================================
-- 4. 이메일이 정확히 일치하는 경우 수동 연결
-- ============================================
-- 위 쿼리 결과를 보고 실제 이메일이 확인되면 아래 쿼리를 실행하세요
-- (이메일이 정확히 'hclim@evkmc.com'인 경우)
UPDATE public.users
SET auth_user_id = (
    SELECT id 
    FROM auth.users 
    WHERE LOWER(TRIM(email)) = LOWER(TRIM('hclim@evkmc.com'))
    LIMIT 1
)
WHERE LOWER(TRIM(email)) = LOWER(TRIM('hclim@evkmc.com'));

-- ============================================
-- 5. profile_id로 직접 연결 (이메일이 다른 경우)
-- ============================================
-- 만약 profile_id 3이 hclim 사용자라면, 아래 쿼리로 직접 연결
-- (실제 profile_id를 확인한 후 수정해서 실행)
-- UPDATE public.users
-- SET auth_user_id = (
--     SELECT id 
--     FROM auth.users 
--     WHERE LOWER(TRIM(email)) = LOWER(TRIM('hclim@evkmc.com'))
--     LIMIT 1
-- )
-- WHERE profile_id = 3;  -- 실제 profile_id로 변경

-- ============================================
-- 6. public.users에 이메일이 없으면 auth.users 정보로 생성
-- ============================================
-- 만약 public.users에 hclim@evkmc.com이 아예 없다면
-- auth.users의 정보를 기반으로 새 레코드 생성
INSERT INTO public.users (auth_user_id, email, name, username, role)
SELECT 
    au.id,
    au.email,
    COALESCE(SPLIT_PART(au.email, '@', 1), 'hclim') as name,
    COALESCE(SPLIT_PART(au.email, '@', 1), 'hclim') as username,
    'user' as role
FROM auth.users au
WHERE LOWER(TRIM(au.email)) = LOWER(TRIM('hclim@evkmc.com'))
AND NOT EXISTS (
    SELECT 1 FROM public.users pu 
    WHERE pu.auth_user_id = au.id 
    OR LOWER(TRIM(pu.email)) = LOWER(TRIM(au.email))
)
RETURNING profile_id, name, email, auth_user_id;

-- ============================================
-- 7. 최종 확인
-- ============================================
SELECT 
    pu.profile_id,
    pu.name,
    pu.email,
    pu.auth_user_id,
    au.email as auth_email,
    au.id as auth_id,
    CASE 
        WHEN pu.auth_user_id = au.id THEN '✅ 정상 연결됨'
        WHEN pu.auth_user_id IS NULL THEN '❌ auth_user_id 없음'
        WHEN au.id IS NULL THEN '❌ auth.users에 없음'
        ELSE '❌ 연결 안됨'
    END as connection_status
FROM public.users pu
FULL OUTER JOIN auth.users au ON (
    pu.auth_user_id = au.id 
    OR LOWER(TRIM(pu.email)) = LOWER(TRIM(au.email))
)
WHERE LOWER(TRIM(COALESCE(pu.email, au.email))) = LOWER(TRIM('hclim@evkmc.com'))
LIMIT 5;

