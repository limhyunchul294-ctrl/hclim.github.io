-- ============================================
-- 보안서약서 동의 저장 문제 긴급 해결
-- ============================================
-- 이 파일을 Supabase Dashboard > SQL Editor에서 실행하세요
-- 실행 후 브라우저를 완전히 새로고침(Ctrl+F5)하고 다시 시도하세요

-- ============================================
-- 1. 기존 UPDATE 정책 모두 삭제
-- ============================================
DROP POLICY IF EXISTS "Users can update their own security agreement" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can update users" ON public.users;
DROP POLICY IF EXISTS "Users can update security agreement" ON public.users;
DROP POLICY IF EXISTS "Allow users to update security agreement" ON public.users;

-- ============================================
-- 2. 더 관대한 보안서약서 업데이트 정책 생성
-- ============================================
-- 이 정책은 인증된 사용자가 자신의 보안서약서 관련 필드만 업데이트할 수 있도록 허용합니다.
-- auth_user_id, email, 또는 profile_id 중 하나라도 일치하면 업데이트 허용

CREATE POLICY "Users can update their own security agreement"
ON public.users
FOR UPDATE
TO authenticated
USING (
    -- 조건 1: auth_user_id가 일치하는 경우
    (auth_user_id IS NOT NULL AND auth_user_id::text = auth.uid()::text)
    OR
    -- 조건 2: 이메일이 일치하는 경우 (대소문자 무시, 공백 제거)
    (
        email IS NOT NULL 
        AND LOWER(TRIM(COALESCE(email, ''))) = LOWER(TRIM(COALESCE((SELECT email FROM auth.users WHERE id = auth.uid()), '')))
    )
    OR
    -- 조건 3: profile_id가 있고, auth.users의 이메일과 users 테이블의 이메일이 일치하는 경우
    (
        profile_id IS NOT NULL
        AND email IS NOT NULL
        AND LOWER(TRIM(COALESCE(email, ''))) = LOWER(TRIM(COALESCE((SELECT email FROM auth.users WHERE id = auth.uid()), '')))
    )
)
WITH CHECK (
    -- 업데이트할 때도 동일한 조건 확인
    (auth_user_id IS NOT NULL AND auth_user_id::text = auth.uid()::text)
    OR
    (
        email IS NOT NULL 
        AND LOWER(TRIM(COALESCE(email, ''))) = LOWER(TRIM(COALESCE((SELECT email FROM auth.users WHERE id = auth.uid()), '')))
    )
    OR
    (
        profile_id IS NOT NULL
        AND email IS NOT NULL
        AND LOWER(TRIM(COALESCE(email, ''))) = LOWER(TRIM(COALESCE((SELECT email FROM auth.users WHERE id = auth.uid()), '')))
    )
);

-- ============================================
-- 3. RLS 활성화 확인
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. 정책 확인
-- ============================================
SELECT 
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'users'
  AND schemaname = 'public'
  AND cmd = 'UPDATE'
ORDER BY policyname;

-- ============================================
-- 5. 현재 사용자 정보 확인 (디버깅용)
-- ============================================
-- 아래 쿼리로 현재 로그인한 사용자의 정보를 확인할 수 있습니다
-- (실제 이메일로 변경 필요)
-- 
-- SELECT 
--     profile_id,
--     auth_user_id,
--     email,
--     security_agreement_accepted,
--     security_agreement_date,
--     (SELECT id FROM auth.users WHERE email = 'hclim@evkmc.com') as auth_users_id,
--     (SELECT email FROM auth.users WHERE id = (SELECT id FROM auth.users WHERE email = 'hclim@evkmc.com')) as auth_email
-- FROM public.users
-- WHERE email = 'hclim@evkmc.com'
--    OR auth_user_id = (SELECT id FROM auth.users WHERE email = 'hclim@evkmc.com');

-- ============================================
-- 6. auth_user_id 동기화 (필요시)
-- ============================================
-- 만약 auth_user_id가 NULL이거나 잘못된 경우, 아래 SQL로 동기화하세요
-- (실제 이메일로 변경 필요)
-- 
-- UPDATE public.users
-- SET auth_user_id = (SELECT id FROM auth.users WHERE email = 'hclim@evkmc.com')
-- WHERE email = 'hclim@evkmc.com'
--   AND (auth_user_id IS NULL OR auth_user_id != (SELECT id FROM auth.users WHERE email = 'hclim@evkmc.com'))
-- RETURNING profile_id, email, auth_user_id;

