-- Migration: Add UPDATE policy for security agreement fields
-- Description: 보안서약서 동의 정보 업데이트를 위한 RLS 정책 추가
-- Date: 2025-01-XX

-- 기존 UPDATE 정책이 있는지 확인하고 삭제 (중복 방지)
DROP POLICY IF EXISTS "Users can update their own security agreement" ON public.users;

-- 사용자가 자신의 보안서약서 동의 정보를 업데이트할 수 있는 정책 추가
CREATE POLICY "Users can update their own security agreement"
ON public.users
FOR UPDATE
USING (
    -- auth_user_id로 자신의 레코드인지 확인
    auth_user_id = auth.uid()
    OR
    -- 이메일로 자신의 레코드인지 확인 (auth_user_id가 없는 경우 대비)
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
)
WITH CHECK (
    -- 업데이트할 때도 동일한 조건 확인
    auth_user_id = auth.uid()
    OR
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- 코멘트 추가
COMMENT ON POLICY "Users can update their own security agreement" ON public.users IS 
'사용자가 자신의 보안서약서 동의 정보(security_agreement_accepted, security_agreement_date, security_agreement_company, security_agreement_name)를 업데이트할 수 있도록 허용';

