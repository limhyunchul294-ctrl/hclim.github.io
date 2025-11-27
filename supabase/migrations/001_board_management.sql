-- 게시판 관리 기능을 위한 데이터베이스 스키마
-- 실행 방법: Supabase Dashboard > SQL Editor에서 실행

-- ============================================
-- 1. notices 테이블 확장 (이미 존재할 수 있음)
-- ============================================

-- notices 테이블이 없으면 생성
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

-- 기존 notices 테이블에 컬럼 추가 (이미 있으면 무시)
DO $$ 
BEGIN
  -- attachments 컬럼 추가
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='notices' AND column_name='attachments') THEN
    ALTER TABLE notices ADD COLUMN attachments JSONB DEFAULT '[]'::jsonb;
  END IF;
  
  -- is_pinned 컬럼 추가
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='notices' AND column_name='is_pinned') THEN
    ALTER TABLE notices ADD COLUMN is_pinned BOOLEAN DEFAULT false;
  END IF;
END $$;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_notices_created_at ON notices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notices_category ON notices(category);
CREATE INDEX IF NOT EXISTS idx_notices_is_pinned ON notices(is_pinned);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_notices_updated_at ON notices;
CREATE TRIGGER update_notices_updated_at
    BEFORE UPDATE ON notices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) 정책
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (재생성)
DROP POLICY IF EXISTS "Anyone can view notices" ON notices;
DROP POLICY IF EXISTS "Admins can insert notices" ON notices;
DROP POLICY IF EXISTS "Authors or admins can update notices" ON notices;
DROP POLICY IF EXISTS "Authors or admins can delete notices" ON notices;

-- 모든 사용자는 조회 가능
CREATE POLICY "Anyone can view notices"
  ON notices FOR SELECT
  USING (true);

-- 관리자 또는 본사 소속만 작성 가능
CREATE POLICY "Admins can insert notices"
  ON notices FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND (user_profiles.role = 'admin' OR user_profiles.affiliation = '본사')
    )
  );

-- 작성자 또는 관리자만 수정 가능
CREATE POLICY "Authors or admins can update notices"
  ON notices FOR UPDATE
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- 작성자 또는 관리자만 삭제 가능
CREATE POLICY "Authors or admins can delete notices"
  ON notices FOR DELETE
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- ============================================
-- 2. community_posts 테이블 (커뮤니티 게시글)
-- ============================================

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

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_category ON community_posts(category);
CREATE INDEX IF NOT EXISTS idx_community_posts_likes_count ON community_posts(likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_tags ON community_posts USING GIN(tags);

-- updated_at 자동 업데이트 트리거
DROP TRIGGER IF EXISTS update_community_posts_updated_at ON community_posts;
CREATE TRIGGER update_community_posts_updated_at
    BEFORE UPDATE ON community_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS 정책
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- 모든 사용자는 조회 가능
CREATE POLICY "Anyone can view community posts"
  ON community_posts FOR SELECT
  USING (true);

-- 로그인한 사용자는 작성 가능
CREATE POLICY "Authenticated users can insert posts"
  ON community_posts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 작성자만 수정 가능
CREATE POLICY "Authors can update their posts"
  ON community_posts FOR UPDATE
  USING (author_id = auth.uid());

-- 작성자 또는 관리자만 삭제 가능
CREATE POLICY "Authors or admins can delete posts"
  ON community_posts FOR DELETE
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- ============================================
-- 3. community_comments 테이블 (댓글)
-- ============================================

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

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON community_comments(created_at);

-- updated_at 자동 업데이트 트리거
DROP TRIGGER IF EXISTS update_comments_updated_at ON community_comments;
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON community_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 댓글 수 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE community_posts 
        SET comments_count = comments_count + 1 
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE community_posts 
        SET comments_count = GREATEST(comments_count - 1, 0) 
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- 댓글 수 업데이트 트리거
DROP TRIGGER IF EXISTS trigger_update_post_comments_count ON community_comments;
CREATE TRIGGER trigger_update_post_comments_count
    AFTER INSERT OR DELETE ON community_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_post_comments_count();

-- RLS 정책
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;

-- 모든 사용자는 조회 가능
CREATE POLICY "Anyone can view comments"
  ON community_comments FOR SELECT
  USING (true);

-- 로그인한 사용자는 작성 가능
CREATE POLICY "Authenticated users can insert comments"
  ON community_comments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 작성자만 수정 가능
CREATE POLICY "Authors can update their comments"
  ON community_comments FOR UPDATE
  USING (author_id = auth.uid());

-- 작성자 또는 관리자만 삭제 가능
CREATE POLICY "Authors or admins can delete comments"
  ON community_comments FOR DELETE
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- ============================================
-- 4. post_likes 테이블 (좋아요 - 사용자 추천 목록)
-- ============================================

CREATE TABLE IF NOT EXISTS post_likes (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name VARCHAR(100),
  user_affiliation VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);

-- 좋아요 수 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE community_posts 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE community_posts 
        SET likes_count = GREATEST(likes_count - 1, 0) 
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- 좋아요 수 업데이트 트리거
DROP TRIGGER IF EXISTS trigger_update_post_likes_count ON post_likes;
CREATE TRIGGER trigger_update_post_likes_count
    AFTER INSERT OR DELETE ON post_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_post_likes_count();

-- RLS 정책
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- 모든 사용자는 조회 가능 (누가 좋아요를 눌렀는지 확인)
CREATE POLICY "Anyone can view likes"
  ON post_likes FOR SELECT
  USING (true);

-- 로그인한 사용자는 좋아요 가능
CREATE POLICY "Authenticated users can like posts"
  ON post_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 본인만 좋아요 취소 가능
CREATE POLICY "Users can unlike their own likes"
  ON post_likes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 5. comment_likes 테이블 (댓글 좋아요)
-- ============================================

CREATE TABLE IF NOT EXISTS comment_likes (
  id BIGSERIAL PRIMARY KEY,
  comment_id BIGINT REFERENCES community_comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);

-- 댓글 좋아요 수 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE community_comments 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.comment_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE community_comments 
        SET likes_count = GREATEST(likes_count - 1, 0) 
        WHERE id = OLD.comment_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- 댓글 좋아요 수 업데이트 트리거
DROP TRIGGER IF EXISTS trigger_update_comment_likes_count ON comment_likes;
CREATE TRIGGER trigger_update_comment_likes_count
    AFTER INSERT OR DELETE ON comment_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_comment_likes_count();

-- RLS 정책
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- 모든 사용자는 조회 가능
CREATE POLICY "Anyone can view comment likes"
  ON comment_likes FOR SELECT
  USING (true);

-- 로그인한 사용자는 좋아요 가능
CREATE POLICY "Authenticated users can like comments"
  ON comment_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 본인만 좋아요 취소 가능
CREATE POLICY "Users can unlike their own comment likes"
  ON comment_likes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 완료
-- ============================================
-- 모든 테이블과 정책이 생성되었습니다.
-- Supabase Dashboard > Storage에서 다음 버킷을 생성하세요:
-- - notices (공지사항 첨부파일)
-- - community (커뮤니티 첨부파일)

