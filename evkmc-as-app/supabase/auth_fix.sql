-- Supabase Auth OTP 발송 오류 해결용 SQL
-- "Database error saving new user" 오류가 발생할 때 실행

-- 1. auth.users 테이블 확인 (읽기 전용이므로 직접 수정 불가)
-- 하지만 관련 트리거나 함수가 문제일 수 있음

-- 2. users 테이블과 auth.users를 연결하는 트리거가 있는지 확인
-- 만약 트리거가 있다면 오류를 발생시킬 수 있음

-- 3. 기존 사용자 확인 (이미 auth.users에 있는 사용자)
-- SELECT id, phone, email FROM auth.users WHERE phone IS NOT NULL;

-- 4. 문제 해결 방법들:

-- 방법 1: auth.users에서 사용자 삭제 후 재시도 (테스트용)
-- 주의: 이 방법은 프로덕션에서는 사용하지 마세요
-- DELETE FROM auth.users WHERE phone = '+821030209866'; -- 예시 전화번호

-- 방법 2: RLS 정책 확인 및 수정
-- auth 스키마는 직접 접근할 수 없으므로, public.users 테이블의 RLS만 확인

-- 방법 3: 사용자 생성 트리거 비활성화 (임시)
-- 만약 public.users 테이블에 auth.users 생성 시 자동으로 레코드를 만드는 트리거가 있다면
-- 그 트리거가 오류를 발생시킬 수 있습니다

-- 5. users 테이블의 RLS 정책 확인
-- SELECT * FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public';

-- 6. 트리거 확인
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table = 'users';

-- 7. auth.users 생성 시 자동으로 public.users에 레코드를 만드는 트리거가 있다면
-- 그 트리거가 문제일 수 있습니다. 해당 트리거를 확인하고 수정하세요.

-- 8. 임시 해결책: OTP 발송 시 이미 존재하는 사용자로 로그인
-- Supabase Dashboard → Authentication → Users에서 사용자가 이미 존재하는지 확인
-- 이미 존재한다면 OTP만 발송하면 되지만, 새로 생성하려고 할 때 오류가 발생할 수 있습니다

-- 9. 권장 해결 방법:
-- Supabase Dashboard → Authentication → Policies에서
-- "Allow users to sign up with phone" 정책이 활성화되어 있는지 확인
-- 그리고 "Allow users to sign in with phone" 정책도 확인

-- 10. 디버깅을 위한 로그 확인
-- Supabase Dashboard → Logs → API Logs에서 상세 오류 확인

