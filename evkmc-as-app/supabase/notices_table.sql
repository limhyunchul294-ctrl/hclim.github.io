-- 공지사항 테이블 생성 SQL
-- Supabase SQL Editor에서 실행하세요

-- 1. notices 테이블 생성
CREATE TABLE IF NOT EXISTS public.notices (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT '일반' CHECK (category IN ('일반', '중요', '업데이트', '공지')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_notices_created_at ON public.notices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notices_category ON public.notices(category);

-- 3. updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. updated_at 트리거 생성
DROP TRIGGER IF EXISTS update_notices_updated_at ON public.notices;
CREATE TRIGGER update_notices_updated_at
    BEFORE UPDATE ON public.notices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. RLS (Row Level Security) 활성화
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

-- 6. 권한 확인 함수 생성 (SECURITY DEFINER로 users 테이블 접근 가능)
CREATE OR REPLACE FUNCTION public.can_manage_notices()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE users.auth_user_id = auth.uid()
        AND (users.role = 'admin' OR users.affiliation = '본사')
    );
END;
$$;

-- 7. RLS 정책 생성
-- 모든 인증된 사용자는 공지사항 조회 가능
CREATE POLICY "공지사항 조회는 모든 인증된 사용자 가능"
    ON public.notices
    FOR SELECT
    TO authenticated
    USING (true);

-- 관리자(role='admin') 또는 본사 소속(affiliation='본사')만 작성 가능
CREATE POLICY "공지사항 작성은 관리자 또는 본사 소속만 가능"
    ON public.notices
    FOR INSERT
    TO authenticated
    WITH CHECK (public.can_manage_notices());

-- 관리자(role='admin') 또는 본사 소속(affiliation='본사')만 수정 가능
CREATE POLICY "공지사항 수정은 관리자 또는 본사 소속만 가능"
    ON public.notices
    FOR UPDATE
    TO authenticated
    USING (public.can_manage_notices())
    WITH CHECK (public.can_manage_notices());

-- 관리자(role='admin') 또는 본사 소속(affiliation='본사')만 삭제 가능
CREATE POLICY "공지사항 삭제는 관리자 또는 본사 소속만 가능"
    ON public.notices
    FOR DELETE
    TO authenticated
    USING (public.can_manage_notices());

-- 8. 함수 주석 추가
COMMENT ON FUNCTION public.can_manage_notices() IS '공지사항 관리 권한 확인 함수 (관리자 또는 본사 소속)';

-- 9. 테이블 주석 추가
COMMENT ON TABLE public.notices IS '공지사항 테이블';
COMMENT ON COLUMN public.notices.id IS '공지사항 ID (자동 증가)';
COMMENT ON COLUMN public.notices.title IS '공지사항 제목';
COMMENT ON COLUMN public.notices.content IS '공지사항 내용';
COMMENT ON COLUMN public.notices.category IS '카테고리 (일반, 중요, 업데이트, 공지)';
COMMENT ON COLUMN public.notices.created_at IS '생성일시';
COMMENT ON COLUMN public.notices.updated_at IS '수정일시';

