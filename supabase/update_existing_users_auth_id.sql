-- 기존 사용자들의 auth_user_id 업데이트
-- auth.users에 있는 사용자들의 UUID를 public.users의 auth_user_id에 연결

-- 1. auth.users와 public.users를 전화번호로 매칭하여 auth_user_id 업데이트
UPDATE public.users u
SET auth_user_id = au.id::uuid
FROM auth.users au
WHERE 
    -- 전화번호 매칭 (여러 형식 지원)
    REPLACE(u.phone, '-', '') = REPLACE(
        CASE 
            -- 형식 1: +8210... -> 010...
            WHEN au.phone LIKE '+82%' THEN '0' || SUBSTRING(au.phone FROM 4)
            -- 형식 2: 8210... -> 010... (앞에 + 없이 82로 시작)
            WHEN au.phone LIKE '82%' THEN '0' || SUBSTRING(au.phone FROM 3)
            -- 형식 3: 그 외
            ELSE au.phone
        END,
        '-', ''
    )
    -- auth_user_id가 NULL이거나 잘못된 값일 때만 업데이트
    AND (u.auth_user_id IS NULL OR u.auth_user_id::text NOT LIKE '%-%-%-%-%');

-- 2. 업데이트 결과 확인
SELECT 
    u.username,
    u.phone,
    u.auth_user_id,
    au.id AS auth_users_id,
    CASE 
        WHEN u.auth_user_id = au.id THEN '✅ 연결됨'
        ELSE '❌ 연결 안됨'
    END AS status
FROM public.users u
LEFT JOIN auth.users au ON REPLACE(u.phone, '-', '') = REPLACE(
    CASE 
        WHEN au.phone LIKE '+82%' THEN '0' || SUBSTRING(au.phone FROM 4)
        WHEN au.phone LIKE '82%' THEN '0' || SUBSTRING(au.phone FROM 3)
        ELSE au.phone
    END,
    '-', ''
)
ORDER BY u.username;

-- 3. EVKMCAS 사용자 특별 확인
SELECT 
    u.username,
    u.phone,
    u.auth_user_id,
    au.id AS auth_users_id,
    au.phone AS auth_phone,
    au.created_at AS auth_created_at
FROM public.users u
LEFT JOIN auth.users au ON REPLACE(u.phone, '-', '') = REPLACE(
    CASE 
        WHEN au.phone LIKE '+82%' THEN '0' || SUBSTRING(au.phone FROM 4)
        WHEN au.phone LIKE '82%' THEN '0' || SUBSTRING(au.phone FROM 3)
        ELSE au.phone
    END,
    '-', ''
)
WHERE u.username = 'EVKMCAS';

