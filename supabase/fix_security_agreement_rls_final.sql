-- ============================================
-- 보안서약서 동의 저장 문제 최종 해결
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

-- ============================================
-- 2. 보안서약서 동의 정보 업데이트 정책 추가
-- ============================================
-- 방법 1: 인증된 사용자가 자신의 레코드를 업데이트할 수 있도록 허용
-- (auth_user_id 또는 email로 매칭, 더 관대한 조건)

CREATE POLICY "Users can update their own security agreement"
ON public.users
FOR UPDATE
TO authenticated
USING (
    -- 조건 1: auth_user_id가 일치하는 경우 (UUID 타입 비교)
    (auth_user_id IS NOT NULL AND auth_user_id::text = auth.uid()::text)
    OR
    -- 조건 2: 이메일이 일치하는 경우 (대소문자 무시, 공백 제거)
    (
        email IS NOT NULL 
        AND LOWER(TRIM(email)) = LOWER(TRIM(COALESCE((SELECT email FROM auth.users WHERE id = auth.uid()), '')))
    )
)
WITH CHECK (
    -- 업데이트할 때도 동일한 조건 확인
    (auth_user_id IS NOT NULL AND auth_user_id::text = auth.uid()::text)
    OR
    (
        email IS NOT NULL 
        AND LOWER(TRIM(email)) = LOWER(TRIM(COALESCE((SELECT email FROM auth.users WHERE id = auth.uid()), '')))
    )
);

-- ============================================
-- 3. RLS 활성화 확인
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. 정책 확인
-- ============================================
-- 다음 쿼리로 정책이 제대로 추가되었는지 확인하세요
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
-- 5. 현재 사용자 레코드 확인 (디버깅용)
-- ============================================
-- 아래 쿼리로 현재 사용자의 레코드가 올바르게 설정되어 있는지 확인하세요
-- (실제 이메일로 변경 필요)
-- 
-- SELECT 
--     profile_id,
--     auth_user_id,
--     email,
--     security_agreement_accepted,
--     security_agreement_date,
--     (SELECT id FROM auth.users WHERE email = 'hclim@evkmc.com') as auth_users_id
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

-- ============================================
-- 7. 테스트 (선택사항)
-- ============================================
-- 현재 로그인한 사용자로 업데이트가 가능한지 테스트하려면
-- 아래 쿼리를 실행하세요 (실제 이메일로 변경 필요)
-- 
-- UPDATE public.users 
-- SET security_agreement_accepted = true,
--     security_agreement_date = NOW(),
--     security_agreement_company = '테스트',
--     security_agreement_name = '테스트'
-- WHERE email = 'hclim@evkmc.com'
-- RETURNING profile_id, email, security_agreement_accepted, security_agreement_date;

