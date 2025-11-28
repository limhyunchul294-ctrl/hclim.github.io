-- 임시 해결책: 문제가 있는 트리거 비활성화
-- 주의: 이 방법은 임시 해결책이며, 근본 원인을 찾아 수정해야 합니다

-- 1. auth.users에 INSERT 트리거 확인
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'auth'
AND event_object_table = 'users'
AND event_manipulation = 'INSERT';

-- 2. 문제가 있는 트리거가 있다면 비활성화 (임시)
-- ALTER TABLE auth.users DISABLE TRIGGER [트리거명];

-- 3. 또는 트리거 삭제 (영구)
-- DROP TRIGGER IF EXISTS [트리거명] ON auth.users;

-- 주의: auth 스키마는 직접 수정할 수 없을 수 있습니다.
-- Supabase Dashboard → Database → Functions/Triggers에서 확인하세요.

