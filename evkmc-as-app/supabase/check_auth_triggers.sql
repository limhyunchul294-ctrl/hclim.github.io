-- auth.users와 관련된 트리거 및 함수 확인

-- 1. public 스키마의 모든 트리거 확인
SELECT 
    t.trigger_name,
    t.event_manipulation,
    t.event_object_table,
    t.action_statement,
    t.action_timing
FROM information_schema.triggers t
WHERE t.trigger_schema = 'public'
ORDER BY t.event_object_table, t.trigger_name;

-- 2. auth 스키마의 트리거 확인 (읽기 전용)
SELECT 
    t.trigger_name,
    t.event_manipulation,
    t.event_object_table,
    t.action_timing
FROM information_schema.triggers t
WHERE t.trigger_schema = 'auth'
ORDER BY t.event_object_table, t.trigger_name;

-- 3. 함수 확인
SELECT 
    p.proname AS function_name,
    pg_get_functiondef(p.oid) AS function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname LIKE '%auth%'
OR p.proname LIKE '%user%';

-- 4. users 테이블의 RLS 정책 확인
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'users';

