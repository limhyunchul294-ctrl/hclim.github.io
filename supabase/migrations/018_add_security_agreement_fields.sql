-- Migration: Add security agreement fields to users table
-- Description: 보안서약서 동의 관련 컬럼 추가
-- Date: 2025-01-XX

-- users 테이블에 보안서약서 관련 컬럼 추가
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS security_agreement_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS security_agreement_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS security_agreement_company TEXT,
ADD COLUMN IF NOT EXISTS security_agreement_name TEXT;

-- 기존 사용자들의 기본값 설정 (동의하지 않은 것으로 설정)
UPDATE public.users
SET security_agreement_accepted = FALSE
WHERE security_agreement_accepted IS NULL;

-- 인덱스 추가 (동의 상태 조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_users_security_agreement_accepted 
ON public.users(security_agreement_accepted);

-- 코멘트 추가
COMMENT ON COLUMN public.users.security_agreement_accepted IS '보안서약서 동의 여부';
COMMENT ON COLUMN public.users.security_agreement_date IS '보안서약서 동의 일시';
COMMENT ON COLUMN public.users.security_agreement_company IS '보안서약서 동의 시 입력한 회사명';
COMMENT ON COLUMN public.users.security_agreement_name IS '보안서약서 동의 시 입력한 담당자 이름';

