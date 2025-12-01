-- 이메일 컬럼의 줄바꿈 및 공백 문자 제거
-- 실행 방법: Supabase Dashboard > SQL Editor에서 실행
-- 목적: 수기 입력 시 포함된 줄바꿈, 탭, 기타 공백 문자 제거

-- ============================================
-- 1. 줄바꿈이 포함된 이메일 확인
-- ============================================
-- 이 쿼리로 줄바꿈, 탭, 캐리지 리턴 등이 포함된 이메일을 찾습니다
SELECT 
    profile_id,
    name,
    email,
    LENGTH(email) as email_length,
    -- 줄바꿈 문자 확인
    CASE 
        WHEN email ~ E'[\n\r\t]' THEN '⚠️ 줄바꿈/탭 포함'
        WHEN email != TRIM(email) THEN '⚠️ 앞뒤 공백'
        ELSE '✅ 정상'
    END as issue_status,
    -- 16진수로 표시 (디버깅용)
    encode(email::bytea, 'hex') as email_hex,
    -- 정리된 이메일 미리보기
    TRIM(REGEXP_REPLACE(email, E'[\\n\\r\\t]+', '', 'g')) as cleaned_email
FROM public.users
WHERE email IS NOT NULL
  AND (
    email ~ E'[\n\r\t]'  -- 줄바꿈, 캐리지 리턴, 탭 포함
    OR email != TRIM(email)  -- 앞뒤 공백
  )
ORDER BY profile_id;

-- ============================================
-- 2. 이메일 정리 (줄바꿈, 탭, 앞뒤 공백 제거)
-- ============================================
-- 주의: 이 쿼리는 기존 데이터를 수정합니다.
-- 실행 전에 위의 1단계 쿼리로 확인하세요.
UPDATE public.users
SET email = TRIM(REGEXP_REPLACE(email, E'[\\n\\r\\t]+', '', 'g'))
WHERE email IS NOT NULL
  AND (
    email ~ E'[\n\r\t]'  -- 줄바꿈, 캐리지 리턴, 탭 포함
    OR email != TRIM(email)  -- 앞뒤 공백
  );

-- ============================================
-- 3. 정리 결과 확인
-- ============================================
SELECT 
    COUNT(*) as cleaned_count,
    '정리된 이메일 개수' as description
FROM public.users
WHERE email IS NOT NULL
  AND email = TRIM(REGEXP_REPLACE(email, E'[\\n\\r\\t]+', '', 'g'));

-- ============================================
-- 4. 특정 이메일 (hclim@evkmc.com) 확인
-- ============================================
SELECT 
    profile_id,
    name,
    email,
    LENGTH(email) as email_length,
    LOWER(TRIM(email)) as normalized_email,
    CASE 
        WHEN LOWER(TRIM(email)) = 'hclim@evkmc.com' THEN '✅ 정확히 일치'
        WHEN LOWER(TRIM(email)) LIKE '%hclim@evkmc.com%' THEN '⚠️ 부분 일치 (여전히 문제 있음)'
        ELSE '❌ 불일치'
    END as match_status
FROM public.users
WHERE email IS NOT NULL
  AND (
    LOWER(TRIM(REGEXP_REPLACE(email, E'[\\n\\r\\t]+', '', 'g'))) = 'hclim@evkmc.com'
    OR email ILIKE '%hclim%'
  )
ORDER BY profile_id;

-- ============================================
-- 5. 정리 후 auth.users와 재연결
-- ============================================
-- 이메일이 정리된 후, auth.users와 다시 연결합니다.
UPDATE public.users pu
SET auth_user_id = au.id
FROM auth.users au
WHERE LOWER(TRIM(REGEXP_REPLACE(pu.email, E'[\\n\\r\\t]+', '', 'g'))) = LOWER(TRIM(au.email))
  AND pu.email IS NOT NULL
  AND au.email IS NOT NULL
  AND (pu.auth_user_id IS NULL OR pu.auth_user_id != au.id);

-- ============================================
-- 6. 최종 확인: hclim@evkmc.com 연결 상태
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
    OR LOWER(TRIM(REGEXP_REPLACE(pu.email, E'[\\n\\r\\t]+', '', 'g'))) = LOWER(TRIM(au.email))
)
WHERE LOWER(TRIM(REGEXP_REPLACE(COALESCE(pu.email, ''), E'[\\n\\r\\t]+', '', 'g'))) = 'hclim@evkmc.com'
   OR LOWER(TRIM(COALESCE(au.email, ''))) = 'hclim@evkmc.com'
LIMIT 5;

