-- auth.users와 public.users 동기화 (이메일 기반)
-- 실행 방법: Supabase Dashboard > SQL Editor에서 실행

-- ============================================
-- 1. auth.users에 있지만 public.users에 없는 사용자 확인
-- ============================================
SELECT 
    au.id as auth_user_id,
    au.email,
    au.phone,
    au.created_at as auth_created_at,
    CASE 
        WHEN pu.profile_id IS NULL THEN 'public.users에 없음'
        ELSE '이미 존재'
    END as status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.auth_user_id
WHERE au.email IS NOT NULL
AND au.email != ''
ORDER BY au.created_at DESC
LIMIT 20;

-- ============================================
-- 2. auth.users의 이메일로 public.users에 레코드 생성/업데이트
-- ============================================
-- 주의: 이 스크립트는 auth.users에 있는 사용자를 public.users에 자동으로 연결합니다.
-- 기존 레코드가 있으면 auth_user_id만 업데이트하고,
-- 없으면 새 레코드를 생성합니다.

-- 2-1. 기존 레코드의 auth_user_id 업데이트 (이메일 매칭)
UPDATE public.users pu
SET auth_user_id = au.id
FROM auth.users au
WHERE LOWER(TRIM(pu.email)) = LOWER(TRIM(au.email))
AND pu.auth_user_id IS NULL
AND au.email IS NOT NULL
AND au.email != '';

-- 2-2. public.users에 없는 auth.users 사용자를 위한 임시 레코드 생성
-- (주의: 이 부분은 실제 운영 환경에서는 신중하게 사용해야 합니다)
-- INSERT INTO public.users (auth_user_id, email, name, role)
-- SELECT 
--     au.id,
--     au.email,
--     COALESCE(au.raw_user_meta_data->>'name', SPLIT_PART(au.email, '@', 1)) as name,
--     'user' as role
-- FROM auth.users au
-- WHERE au.email IS NOT NULL
-- AND au.email != ''
-- AND NOT EXISTS (
--     SELECT 1 FROM public.users pu 
--     WHERE pu.auth_user_id = au.id 
--     OR LOWER(TRIM(pu.email)) = LOWER(TRIM(au.email))
-- );

-- ============================================
-- 3. 특정 이메일로 수동 연결 (hclim@evkmc.com 예시)
-- ============================================
-- 아래 쿼리에서 이메일과 사용자 정보를 수정해서 실행하세요
-- 
-- 방법 A: 기존 public.users 레코드에 auth_user_id 연결
-- UPDATE public.users
-- SET auth_user_id = (
--     SELECT id FROM auth.users 
--     WHERE LOWER(TRIM(email)) = LOWER(TRIM('hclim@evkmc.com'))
--     LIMIT 1
-- )
-- WHERE LOWER(TRIM(email)) = LOWER(TRIM('hclim@evkmc.com'))
-- AND auth_user_id IS NULL;
--
-- 방법 B: auth.users의 이메일을 public.users에 수동으로 입력
-- (이미 public.users에 레코드가 있는 경우)
-- UPDATE public.users
-- SET email = 'hclim@evkmc.com',
--     auth_user_id = (
--         SELECT id FROM auth.users 
--         WHERE LOWER(TRIM(email)) = LOWER(TRIM('hclim@evkmc.com'))
--         LIMIT 1
--     )
-- WHERE profile_id = [해당 사용자의 profile_id]
-- AND (email IS NULL OR email = '');

-- ============================================
-- 4. 최종 확인: 이메일로 조회 테스트
-- ============================================
SELECT 
    pu.profile_id,
    pu.name,
    pu.email,
    pu.phone,
    pu.auth_user_id,
    au.email as auth_email,
    CASE 
        WHEN pu.auth_user_id = au.id THEN '연결됨'
        ELSE '연결 안됨'
    END as connection_status
FROM public.users pu
LEFT JOIN auth.users au ON pu.auth_user_id = au.id
WHERE LOWER(TRIM(pu.email)) = LOWER(TRIM('hclim@evkmc.com'))
OR LOWER(TRIM(au.email)) = LOWER(TRIM('hclim@evkmc.com'))
LIMIT 5;

