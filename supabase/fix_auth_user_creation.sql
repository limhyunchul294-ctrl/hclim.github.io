-- Supabase Auth 사용자 생성 오류 해결
-- "Database error saving new user" 오류 해결용

-- 문제 원인:
-- 1. auth.users에 새 사용자를 생성할 때 트리거나 제약 조건 위반
-- 2. auth.users와 public.users를 연결하는 트리거 오류
-- 3. RLS 정책 문제

-- 해결 방법 1: Supabase Dashboard에서 확인
-- Authentication → Users에서 해당 전화번호로 사용자가 이미 존재하는지 확인
-- 이미 존재한다면 문제없이 OTP 발송 가능
-- 새로 생성하려고 할 때만 오류 발생

-- 해결 방법 2: auth.users에서 문제 있는 사용자 삭제
-- 주의: 프로덕션에서는 신중하게 실행하세요
-- Supabase Dashboard → Authentication → Users에서
-- 해당 전화번호 사용자를 찾아서 삭제 후 재시도

-- 해결 방법 3: 트리거 확인 및 수정
-- 아래 쿼리로 트리거 확인
SELECT 
    t.trigger_name,
    t.event_manipulation,
    t.event_object_table,
    t.action_statement
FROM information_schema.triggers t
WHERE t.trigger_schema = 'public'
AND (
    t.action_statement LIKE '%auth.users%'
    OR t.action_statement LIKE '%auth_user_id%'
    OR t.event_object_table = 'users'
);

-- 해결 방법 4: RLS 정책 확인
-- users 테이블의 RLS가 auth.users 생성 시 문제를 일으킬 수 있음
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'users';

-- 해결 방법 5: 임시 해결책
-- login.js에서 shouldCreateUser: false 옵션 사용
-- 이미 코드에 추가되어 있음

-- 해결 방법 6: 수동으로 auth.users에 사용자 생성
-- Supabase Dashboard → Authentication → Users → Add User
-- Phone: +821030209866 (예시)
-- Auto Confirm: true로 설정하여 OTP 없이 로그인 가능하게

