-- ============================================
-- notices 테이블 updated_at 트리거 비활성화
-- ============================================
-- notices 테이블에 updated_at 컬럼이 없으므로 트리거를 비활성화합니다
-- 이 파일을 Supabase Dashboard > SQL Editor에서 실행하세요

-- updated_at 트리거 삭제
DROP TRIGGER IF EXISTS update_notices_updated_at ON notices;

-- 트리거가 삭제되었는지 확인
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'notices'
  AND event_object_schema = 'public';

