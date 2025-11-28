-- 빠른 해결: 모든 기존 사용자들의 auth_user_id 업데이트
-- 이 SQL을 실행하면 auth.users와 public.users가 전화번호로 자동 매칭됩니다

-- 1. 기존 사용자들의 auth_user_id 업데이트
UPDATE public.users u
SET auth_user_id = au.id
FROM auth.users au
WHERE 
    -- 전화번호 매칭 (여러 형식 지원)
    REPLACE(u.phone, '-', '') = REPLACE(
        CASE 
            -- 형식 1: +8210... -> 010...
            WHEN au.phone LIKE '+82%' THEN '0' || SUBSTRING(au.phone FROM 4)
            -- 형식 2: 8210... -> 010... (앞에 + 없이 82로 시작)
            WHEN au.phone LIKE '82%' THEN '0' || SUBSTRING(au.phone FROM 3)
            -- 형식 3: 그 외 (010... 등)
            ELSE au.phone
        END,
        '-', ''
    )
    -- auth_user_id가 없거나 다를 때만 업데이트
    AND (u.auth_user_id IS NULL OR u.auth_user_id != au.id);

-- 2. 업데이트된 행 수 확인
SELECT 
    COUNT(*) AS updated_users
FROM public.users
WHERE auth_user_id IS NOT NULL;

-- 3. EVKMCAS 사용자 확인 (전화번호 매칭 테스트)
SELECT 
    u.username,
    u.phone AS public_phone,
    au.phone AS auth_phone,
    REPLACE(u.phone, '-', '') AS normalized_public,
    REPLACE(
        CASE 
            WHEN au.phone LIKE '+82%' THEN '0' || SUBSTRING(au.phone FROM 4)
            WHEN au.phone LIKE '82%' THEN '0' || SUBSTRING(au.phone FROM 3)
            ELSE au.phone
        END,
        '-', ''
    ) AS normalized_auth,
    u.auth_user_id,
    au.id AS auth_users_id,
    CASE 
        WHEN u.auth_user_id = au.id THEN '✅ 연결 성공'
        WHEN REPLACE(u.phone, '-', '') = REPLACE(
            CASE 
                WHEN au.phone LIKE '+82%' THEN '0' || SUBSTRING(au.phone FROM 4)
                WHEN au.phone LIKE '82%' THEN '0' || SUBSTRING(au.phone FROM 3)
                ELSE au.phone
            END,
            '-', ''
        ) THEN '🔗 매칭 가능 (업데이트 필요)'
        ELSE '❌ 연결 실패'
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
WHERE u.username = 'EVKMCAS';

-- 4. 모든 사용자 연결 상태 확인
SELECT 
    u.username,
    u.phone,
    CASE 
        WHEN u.auth_user_id IS NOT NULL THEN '✅ 연결됨'
        ELSE '❌ 연결 안됨'
    END AS status
FROM public.users u
ORDER BY u.username;

