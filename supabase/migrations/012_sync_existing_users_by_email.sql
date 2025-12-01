-- 기존 public.users 데이터와 auth.users 동기화 (이메일 기반)
-- 실행 방법: Supabase Dashboard > SQL Editor에서 실행
-- 목적: 새 레코드 생성 대신 기존 레코드의 auth_user_id 업데이트

-- ============================================
-- 1. 기존 public.users 레코드 확인 (이메일이 있는 모든 사용자)
-- ============================================
SELECT 
    pu.profile_id,
    pu.name,
    pu.username,
    pu.email,
    pu.phone,
    pu.auth_user_id,
    au.id as auth_id,
    au.email as auth_email,
    CASE 
        WHEN pu.auth_user_id = au.id THEN '✅ 이미 연결됨'
        WHEN pu.auth_user_id IS NULL AND au.id IS NOT NULL THEN '🔄 연결 필요'
        WHEN au.id IS NULL THEN '❌ auth.users에 없음'
        ELSE '⚠️ 다른 auth_user_id와 연결됨'
    END as sync_status
FROM public.users pu
LEFT JOIN auth.users au ON LOWER(TRIM(pu.email)) = LOWER(TRIM(au.email))
WHERE pu.email IS NOT NULL
  AND TRIM(pu.email) != ''
ORDER BY pu.profile_id
LIMIT 50;

-- ============================================
-- 2. 기존 레코드의 auth_user_id 업데이트 (이메일 매칭)
-- ============================================
-- 이 쿼리는 기존 public.users 레코드의 auth_user_id를 
-- auth.users의 이메일과 매칭하여 업데이트합니다.
UPDATE public.users pu
SET auth_user_id = au.id
FROM auth.users au
WHERE LOWER(TRIM(pu.email)) = LOWER(TRIM(au.email))
  AND pu.email IS NOT NULL
  AND TRIM(pu.email) != ''
  AND au.email IS NOT NULL
  AND au.email != ''
  AND (pu.auth_user_id IS NULL OR pu.auth_user_id != au.id);

-- ============================================
-- 3. 업데이트 결과 확인
-- ============================================
SELECT 
    COUNT(*) as updated_count,
    'auth_user_id가 업데이트된 레코드 수' as description
FROM public.users pu
INNER JOIN auth.users au ON pu.auth_user_id = au.id
WHERE pu.email IS NOT NULL
  AND TRIM(pu.email) != '';

-- ============================================
-- 4. 특정 이메일 (hclim@evkmc.com) 연결 확인
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
LEFT JOIN auth.users au ON (
    pu.auth_user_id = au.id 
    OR LOWER(TRIM(pu.email)) = LOWER(TRIM(au.email))
)
WHERE LOWER(TRIM(COALESCE(pu.email, ''))) = LOWER(TRIM('hclim@evkmc.com'))
   OR LOWER(TRIM(COALESCE(au.email, ''))) = LOWER(TRIM('hclim@evkmc.com'))
LIMIT 5;

-- ============================================
-- 5. 중복 레코드 확인 (같은 이메일이 여러 개인 경우)
-- ============================================
SELECT 
    email,
    COUNT(*) as count,
    STRING_AGG(profile_id::text, ', ') as profile_ids,
    STRING_AGG(auth_user_id::text, ', ') as auth_user_ids
FROM public.users
WHERE email IS NOT NULL
  AND TRIM(email) != ''
GROUP BY email
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- ============================================
-- 6. (선택) 새로 생성된 중복 레코드 삭제 (profile_id 70 등)
-- ============================================
-- 주의: 이 쿼리는 새로 생성된 레코드를 삭제합니다.
-- 실행 전에 위의 중복 레코드 확인 쿼리로 확인하세요.
-- 
-- 예: profile_id 70이 중복이고, profile_id 3이 원본이라면:
-- DELETE FROM public.users
-- WHERE profile_id = 70
-- AND EXISTS (
--     SELECT 1 FROM public.users pu2
--     WHERE pu2.email = public.users.email
--     AND pu2.profile_id != public.users.profile_id
--     AND pu2.profile_id < public.users.profile_id  -- 더 오래된 레코드 유지
-- );

