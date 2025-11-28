-- 이메일 매칭 문제 즉시 해결
-- 실행 방법: Supabase Dashboard > SQL Editor에서 실행

-- ============================================
-- 1. auth.users와 public.users 이메일 매칭 확인
-- ============================================
-- 이 쿼리로 이메일 기반 매칭 상태를 확인합니다
SELECT 
    au.id as auth_user_id,
    au.email as auth_email,
    au.created_at as auth_created_at,
    pu.profile_id,
    pu.name,
    pu.email as public_email,
    pu.auth_user_id as current_auth_user_id,
    CASE 
        WHEN pu.profile_id IS NULL THEN 'public.users에 없음'
        WHEN pu.auth_user_id IS NULL THEN 'auth_user_id 연결 안됨'
        WHEN pu.auth_user_id = au.id THEN '정상 연결됨'
        ELSE '다른 auth_user_id와 연결됨'
    END as connection_status
FROM auth.users au
LEFT JOIN public.users pu ON LOWER(TRIM(pu.email)) = LOWER(TRIM(au.email))
WHERE au.email = 'hclim@evkmc.com'
LIMIT 10;

-- ============================================
-- 2. 이메일 기반으로 auth_user_id 업데이트
-- ============================================
-- auth.users의 이메일과 public.users의 이메일이 일치하면
-- public.users의 auth_user_id를 auth.users의 id로 업데이트합니다
UPDATE public.users pu
SET auth_user_id = au.id
FROM auth.users au
WHERE LOWER(TRIM(pu.email)) = LOWER(TRIM(au.email))
AND pu.auth_user_id IS NULL
AND au.email IS NOT NULL
AND au.email != ''
AND pu.email IS NOT NULL
AND TRIM(pu.email) != '';

-- ============================================
-- 3. 특정 이메일 수동 연결 (hclim@evkmc.com)
-- ============================================
-- 위의 자동 업데이트가 작동하지 않으면 이 쿼리를 실행하세요
UPDATE public.users
SET auth_user_id = (
    SELECT id 
    FROM auth.users 
    WHERE LOWER(TRIM(email)) = LOWER(TRIM('hclim@evkmc.com'))
    LIMIT 1
)
WHERE LOWER(TRIM(email)) = LOWER(TRIM('hclim@evkmc.com'))
AND (auth_user_id IS NULL OR auth_user_id != (
    SELECT id 
    FROM auth.users 
    WHERE LOWER(TRIM(email)) = LOWER(TRIM('hclim@evkmc.com'))
    LIMIT 1
));

-- ============================================
-- 4. 최종 확인: 이메일로 조회 테스트
-- ============================================
-- 이제 이 쿼리가 정상적으로 작동해야 합니다
SELECT 
    pu.profile_id,
    pu.name,
    pu.email,
    pu.phone,
    pu.auth_user_id,
    au.email as auth_email,
    CASE 
        WHEN pu.auth_user_id = au.id THEN '✅ 정상 연결됨'
        ELSE '❌ 연결 안됨'
    END as connection_status
FROM public.users pu
LEFT JOIN auth.users au ON pu.auth_user_id = au.id
WHERE LOWER(TRIM(pu.email)) = LOWER(TRIM('hclim@evkmc.com'))
LIMIT 5;

