-- ============================================
-- 보안서약서 동의 저장을 위한 RLS UPDATE 정책 추가
-- ============================================
-- 이 SQL을 Supabase Dashboard > SQL Editor에서 실행하세요
-- 실행 후 브라우저를 완전히 새로고침(Ctrl+F5)하고 다시 시도하세요

-- ============================================
-- 1. 기존 UPDATE 정책 삭제
-- ============================================
DROP POLICY IF EXISTS "Users can update their own security agreement" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can update users" ON public.users;
DROP POLICY IF EXISTS "Users can update security agreement" ON public.users;

-- ============================================
-- 2. 보안서약서 동의 정보 업데이트 정책 추가
-- ============================================
-- 인증된 사용자가 자신의 보안서약서 동의 정보를 업데이트할 수 있도록 허용
CREATE POLICY "Users can update their own security agreement"
ON public.users
FOR UPDATE
TO authenticated
USING (
    -- 조건 1: auth_user_id가 일치하는 경우
    (auth_user_id IS NOT NULL AND auth_user_id::text = auth.uid()::text)
    OR
    -- 조건 2: 이메일이 일치하는 경우 (auth_user_id가 없는 경우 대비)
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
-- 4. 정책 확인 (실행 후 확인)
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
-- 완료!
-- ============================================
-- 이제 브라우저를 새로고침하고 보안서약서 동의를 다시 시도하세요.

