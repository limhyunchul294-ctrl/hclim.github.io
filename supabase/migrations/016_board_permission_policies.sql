-- 게시판 권한 정책 업데이트
-- 공지사항: 관리자만 작성/수정/삭제, 모든 인증 사용자 조회
-- 커뮤니티: 등급별 권한 (Blue: 조회/댓글, Silver: 조회/댓글/게시글, Black: 조회/댓글/게시글, 관리자: 모든 권한)

-- ============================================
-- 0. 필요한 테이블 생성 (없는 경우)
-- ============================================

-- updated_at 자동 업데이트 함수 (없으면 생성)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- notices 테이블 생성 (없으면)
CREATE TABLE IF NOT EXISTS notices (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) DEFAULT '일반',
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name VARCHAR(100),
  views INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- notices 테이블에 컬럼 추가 (이미 있으면 무시)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='notices' AND column_name='attachments') THEN
    ALTER TABLE notices ADD COLUMN attachments JSONB DEFAULT '[]'::jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='notices' AND column_name='is_pinned') THEN
    ALTER TABLE notices ADD COLUMN is_pinned BOOLEAN DEFAULT false;
  END IF;
END $$;

-- notices 인덱스 생성 (없으면)
CREATE INDEX IF NOT EXISTS idx_notices_created_at ON notices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notices_category ON notices(category);
CREATE INDEX IF NOT EXISTS idx_notices_is_pinned ON notices(is_pinned);

-- notices 트리거 생성 (없으면)
DROP TRIGGER IF EXISTS update_notices_updated_at ON notices;
CREATE TRIGGER update_notices_updated_at
    BEFORE UPDATE ON notices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- notices RLS 활성화
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- community_posts 테이블 생성 (없으면)
CREATE TABLE IF NOT EXISTS community_posts (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) DEFAULT '질문',
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name VARCHAR(100),
  author_affiliation VARCHAR(100),
  views INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  attachments JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_solved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- community_comments 테이블 생성 (없으면)
CREATE TABLE IF NOT EXISTS community_comments (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name VARCHAR(100),
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성 (없으면)
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_category ON community_posts(category);
CREATE INDEX IF NOT EXISTS idx_community_posts_likes_count ON community_posts(likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_tags ON community_posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON community_comments(created_at);

-- 트리거 생성 (없으면)
DROP TRIGGER IF EXISTS update_community_posts_updated_at ON community_posts;
CREATE TRIGGER update_community_posts_updated_at
    BEFORE UPDATE ON community_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON community_comments;
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON community_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS 활성화
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 1. 공지사항 (notices) 권한 정책 업데이트
-- ============================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Anyone can view notices" ON notices;
DROP POLICY IF EXISTS "Admins can insert notices" ON notices;
DROP POLICY IF EXISTS "Authors or admins can update notices" ON notices;
DROP POLICY IF EXISTS "Authors or admins can delete notices" ON notices;
DROP POLICY IF EXISTS "공지사항 작성은 관리자 또는 본사 소속만 가능" ON notices;
DROP POLICY IF EXISTS "공지사항 수정은 관리자 또는 본사 소속만 가능" ON notices;
DROP POLICY IF EXISTS "공지사항 삭제는 관리자 또는 본사 소속만 가능" ON notices;
DROP POLICY IF EXISTS "Authenticated users can view notices" ON notices;
DROP POLICY IF EXISTS "Only admins can insert notices" ON notices;
DROP POLICY IF EXISTS "Only admins can update notices" ON notices;
DROP POLICY IF EXISTS "Only admins can delete notices" ON notices;

-- 조회: 모든 인증된 사용자 (authenticated users)
CREATE POLICY "Authenticated users can view notices"
  ON notices FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 작성: 관리자만 (role = 'admin')
CREATE POLICY "Only admins can insert notices"
  ON notices FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.auth_user_id = auth.uid()
      AND public.users.role = 'admin'
    )
  );

-- 수정: 관리자만
CREATE POLICY "Only admins can update notices"
  ON notices FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.auth_user_id = auth.uid()
      AND public.users.role = 'admin'
    )
  );

-- 삭제: 관리자만
CREATE POLICY "Only admins can delete notices"
  ON notices FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.auth_user_id = auth.uid()
      AND public.users.role = 'admin'
    )
  );

-- ============================================
-- 2. 커뮤니티 게시글 (community_posts) 권한 정책 업데이트
-- ============================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Anyone can view community posts" ON community_posts;
DROP POLICY IF EXISTS "Authenticated users can insert posts" ON community_posts;
DROP POLICY IF EXISTS "Authors can update their posts" ON community_posts;
DROP POLICY IF EXISTS "Authors or admins can delete posts" ON community_posts;
DROP POLICY IF EXISTS "Authenticated users can view community posts" ON community_posts;
DROP POLICY IF EXISTS "Silver label or above can insert community posts" ON community_posts;
DROP POLICY IF EXISTS "Authors or admins can update community posts" ON community_posts;
DROP POLICY IF EXISTS "Authors or admins can delete community posts" ON community_posts;

-- 조회: 모든 인증된 사용자
CREATE POLICY "Authenticated users can view community posts"
  ON community_posts FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 작성: Silver Label 이상 또는 관리자
-- grade: 'silver' 또는 'black' 또는 role: 'admin'
CREATE POLICY "Silver label or above can insert community posts"
  ON community_posts FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (
        SELECT 1 FROM public.users
        WHERE public.users.auth_user_id = auth.uid()
        AND (
          public.users.role = 'admin'
          OR public.users.grade IN ('silver', 'black')
        )
      )
    )
  );

-- 수정: 작성자 본인 또는 관리자
CREATE POLICY "Authors or admins can update community posts"
  ON community_posts FOR UPDATE
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.auth_user_id = auth.uid()
      AND public.users.role = 'admin'
    )
  );

-- 삭제: 작성자 본인 또는 관리자
CREATE POLICY "Authors or admins can delete community posts"
  ON community_posts FOR DELETE
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.auth_user_id = auth.uid()
      AND public.users.role = 'admin'
    )
  );

-- ============================================
-- 3. 커뮤니티 댓글 (community_comments) 권한 정책 업데이트
-- ============================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Anyone can view comments" ON community_comments;
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON community_comments;
DROP POLICY IF EXISTS "Authors can update their comments" ON community_comments;
DROP POLICY IF EXISTS "Authors or admins can delete comments" ON community_comments;
DROP POLICY IF EXISTS "Authenticated users can view comments" ON community_comments;
DROP POLICY IF EXISTS "Blue label or above can insert comments" ON community_comments;
DROP POLICY IF EXISTS "Authors or admins can update comments" ON community_comments;
DROP POLICY IF EXISTS "Authors or admins can delete comments" ON community_comments;

-- 조회: 모든 인증된 사용자
CREATE POLICY "Authenticated users can view comments"
  ON community_comments FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 작성: Blue Label 이상 (모든 등급)
-- grade: 'blue', 'silver', 'black' 또는 role: 'admin'
CREATE POLICY "Blue label or above can insert comments"
  ON community_comments FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (
        SELECT 1 FROM public.users
        WHERE public.users.auth_user_id = auth.uid()
        AND (
          public.users.role = 'admin'
          OR public.users.grade IN ('blue', 'silver', 'black')
        )
      )
    )
  );

-- 수정: 작성자 본인 또는 관리자
CREATE POLICY "Authors or admins can update comments"
  ON community_comments FOR UPDATE
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.auth_user_id = auth.uid()
      AND public.users.role = 'admin'
    )
  );

-- 삭제: 작성자 본인 또는 관리자
CREATE POLICY "Authors or admins can delete comments"
  ON community_comments FOR DELETE
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.auth_user_id = auth.uid()
      AND public.users.role = 'admin'
    )
  );

-- ============================================
-- 완료
-- ============================================
-- 공지사항: 관리자만 작성/수정/삭제, 모든 인증 사용자 조회
-- 커뮤니티 게시글: Silver Label 이상 작성 가능, 작성자/관리자 수정/삭제 가능
-- 커뮤니티 댓글: Blue Label 이상 작성 가능, 작성자/관리자 수정/삭제 가능



