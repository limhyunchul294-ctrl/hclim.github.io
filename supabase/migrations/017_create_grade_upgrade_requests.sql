-- 등급 업그레이드 요청 테이블 생성
-- 사용자가 등급 업그레이드를 요청하고 관리자가 승인/거부할 수 있는 시스템

CREATE TABLE IF NOT EXISTS grade_upgrade_requests (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name VARCHAR(100) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  user_affiliation VARCHAR(100),
  current_grade VARCHAR(20),
  requested_grade VARCHAR(20) NOT NULL CHECK (requested_grade IN ('blue', 'silver', 'black')),
  reason TEXT NOT NULL,
  contact VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_grade_upgrade_requests_user_id ON grade_upgrade_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_grade_upgrade_requests_status ON grade_upgrade_requests(status);
CREATE INDEX IF NOT EXISTS idx_grade_upgrade_requests_created_at ON grade_upgrade_requests(created_at DESC);

-- updated_at 자동 업데이트 트리거
DROP TRIGGER IF EXISTS update_grade_upgrade_requests_updated_at ON grade_upgrade_requests;
CREATE TRIGGER update_grade_upgrade_requests_updated_at
    BEFORE UPDATE ON grade_upgrade_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS 정책
ALTER TABLE grade_upgrade_requests ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 요청만 조회 가능
CREATE POLICY "Users can view their own requests"
  ON grade_upgrade_requests FOR SELECT
  USING (auth.uid() = user_id);

-- 사용자는 자신의 요청만 작성 가능
CREATE POLICY "Users can insert their own requests"
  ON grade_upgrade_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 pending 상태 요청만 수정/취소 가능
CREATE POLICY "Users can update their pending requests"
  ON grade_upgrade_requests FOR UPDATE
  USING (
    auth.uid() = user_id 
    AND status = 'pending'
  )
  WITH CHECK (
    auth.uid() = user_id 
    AND status = 'pending'
  );

-- 관리자는 모든 요청 조회 가능
CREATE POLICY "Admins can view all requests"
  ON grade_upgrade_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.auth_user_id = auth.uid()
      AND public.users.role = 'admin'
    )
  );

-- 관리자는 모든 요청 수정 가능 (승인/거부)
CREATE POLICY "Admins can update all requests"
  ON grade_upgrade_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.auth_user_id = auth.uid()
      AND public.users.role = 'admin'
    )
  );

-- 승인 시 자동으로 사용자 등급 업데이트하는 함수
CREATE OR REPLACE FUNCTION handle_grade_upgrade_approval()
RETURNS TRIGGER AS $$
BEGIN
    -- 상태가 'approved'로 변경되고 이전에는 'pending'이었을 때만 실행
    IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
        -- 사용자 등급 업데이트
        UPDATE public.users
        SET grade = NEW.requested_grade,
            updated_at = NOW()
        WHERE auth_user_id = NEW.user_id;
        
        -- 검토 정보 업데이트
        NEW.reviewed_by = auth.uid();
        NEW.reviewed_at = NOW();
        
        RETURN NEW;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
DROP TRIGGER IF EXISTS trigger_handle_grade_upgrade_approval ON grade_upgrade_requests;
CREATE TRIGGER trigger_handle_grade_upgrade_approval
    BEFORE UPDATE ON grade_upgrade_requests
    FOR EACH ROW
    EXECUTE FUNCTION handle_grade_upgrade_approval();

-- ============================================
-- 완료
-- ============================================
-- 사용자는 등급 업그레이드를 요청할 수 있습니다.
-- 관리자는 요청을 승인/거부할 수 있으며, 승인 시 자동으로 사용자 등급이 업데이트됩니다.

