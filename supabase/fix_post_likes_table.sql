-- ============================================
-- post_likes 테이블 생성 및 설정
-- ============================================
-- 이 파일을 Supabase Dashboard > SQL Editor에서 실행하세요
-- 좋아요 기능을 위한 post_likes 테이블 생성

-- ============================================
-- 1. post_likes 테이블 생성
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

-- ============================================
-- 2. 인덱스 생성
-- ============================================
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);

-- ============================================
-- 3. 좋아요 수 자동 업데이트 함수
-- ============================================
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

-- ============================================
-- 4. 좋아요 수 업데이트 트리거
-- ============================================
DROP TRIGGER IF EXISTS trigger_update_post_likes_count ON post_likes;
CREATE TRIGGER trigger_update_post_likes_count
    AFTER INSERT OR DELETE ON post_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_post_likes_count();

-- ============================================
-- 5. RLS 정책 설정
-- ============================================
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Anyone can view likes" ON post_likes;
DROP POLICY IF EXISTS "Authenticated users can like posts" ON post_likes;
DROP POLICY IF EXISTS "Users can unlike their own likes" ON post_likes;

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
-- 6. 테이블 생성 확인
-- ============================================
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'post_likes'
  AND table_schema = 'public'
ORDER BY ordinal_position;

