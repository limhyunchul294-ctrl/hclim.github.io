-- EVKMCAS 사용자 수동 업데이트
-- 전화번호: 01030209866 (public.users) = 821030209866 (auth.users)

-- 1. 직접 UUID 업데이트 (EVKMCAS)
UPDATE public.users
SET auth_user_id = '5fd5e395-42af-4372-bdd0-03ee0ea81656'::uuid
WHERE username = 'EVKMCAS'
AND phone = '01030209866';

-- 2. 확인
SELECT 
    username,
    phone,
    auth_user_id,
    CASE 
        WHEN auth_user_id IS NOT NULL THEN '✅ 연결됨'
        ELSE '❌ 연결 안됨'
    END AS status
FROM public.users
WHERE username = 'EVKMCAS';

-- 3. 다른 사용자도 일괄 업데이트 (전화번호로 매칭)
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

-- 4. 업데이트 결과 확인
SELECT 
    username,
    phone,
    auth_user_id,
    CASE 
        WHEN auth_user_id IS NOT NULL AND auth_user_id::text LIKE '%-%-%-%-%' THEN '✅ 연결됨'
        ELSE '❌ 연결 안됨'
    END AS status
FROM public.users
ORDER BY username;

