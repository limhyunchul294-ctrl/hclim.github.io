# 보안서약서 동의 저장 실패 문제 해결 가이드

## 문제 상황
SQL로 컬럼을 추가했는데도 보안서약서 동의 저장이 실패하는 경우, RLS (Row Level Security) 정책 문제일 가능성이 높습니다.

## 증상
- 콘솔에 "업데이트된 레코드가 없습니다" 에러
- `auth_user_id`로 업데이트 실패
- 이메일로 업데이트도 실패

## 해결 방법

### 1단계: RLS UPDATE 정책 추가

Supabase Dashboard > SQL Editor에서 다음 SQL을 실행하세요:

```sql
-- 기존 UPDATE 정책이 있는지 확인하고 삭제 (중복 방지)
DROP POLICY IF EXISTS "Users can update their own security agreement" ON public.users;

-- 사용자가 자신의 보안서약서 동의 정보를 업데이트할 수 있는 정책 추가
CREATE POLICY "Users can update their own security agreement"
ON public.users
FOR UPDATE
USING (
    -- auth_user_id로 자신의 레코드인지 확인
    auth_user_id = auth.uid()
    OR
    -- 이메일로 자신의 레코드인지 확인 (auth_user_id가 없는 경우 대비)
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
)
WITH CHECK (
    -- 업데이트할 때도 동일한 조건 확인
    auth_user_id = auth.uid()
    OR
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
);
```

### 2단계: RLS 정책 확인

현재 users 테이블의 RLS 정책을 확인하세요:

```sql
-- users 테이블의 모든 정책 확인
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
WHERE tablename = 'users'
ORDER BY policyname;
```

### 3단계: 테스트

RLS 정책 추가 후 다음을 확인하세요:

1. **브라우저 콘솔 확인**
   - 보안서약서 동의 버튼 클릭
   - 콘솔에 "✅ 보안서약서 동의 저장 성공" 메시지 확인

2. **데이터베이스 확인**
   ```sql
   SELECT 
       profile_id,
       auth_user_id,
       email,
       security_agreement_accepted,
       security_agreement_date,
       security_agreement_company,
       security_agreement_name
   FROM public.users
   WHERE security_agreement_accepted = true
   ORDER BY security_agreement_date DESC
   LIMIT 10;
   ```

## 문제 해결 체크리스트

- [ ] 컬럼이 추가되었는가? (`security_agreement_accepted`, `security_agreement_date`, `security_agreement_company`, `security_agreement_name`)
- [ ] RLS가 활성화되어 있는가? (`ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;`)
- [ ] UPDATE 정책이 추가되었는가? (`Users can update their own security agreement`)
- [ ] `auth_user_id`가 users 테이블에 올바르게 설정되어 있는가?
- [ ] 이메일이 users 테이블과 auth.users 테이블에서 일치하는가?

## 추가 디버깅

### auth_user_id 확인
```sql
-- 현재 로그인한 사용자의 auth_user_id 확인
SELECT 
    u.profile_id,
    u.auth_user_id,
    u.email,
    au.id as auth_users_id,
    au.email as auth_users_email
FROM public.users u
LEFT JOIN auth.users au ON u.auth_user_id = au.id
WHERE u.email = 'your-email@example.com';
```

### RLS 정책 테스트
```sql
-- 현재 사용자로 업데이트 가능한지 테스트
SET ROLE authenticated;
UPDATE public.users 
SET security_agreement_accepted = true 
WHERE auth_user_id = auth.uid()
RETURNING *;
```

## 참고 파일

- 마이그레이션 파일: `supabase/migrations/019_add_security_agreement_update_policy.sql`
- 컬럼 추가 SQL: `supabase/apply_security_agreement_migration.sql`

