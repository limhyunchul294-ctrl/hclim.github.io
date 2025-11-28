# 이메일 인증 문제 해결 가이드

## 문제 상황
- SQL로는 이메일 매칭이 정상 작동
- 로그인 페이지에서는 이메일 인식이 안 됨
- `public.users` 테이블 조회 시 빈 배열 반환

## 원인
**RLS (Row Level Security) 정책 문제**일 가능성이 높습니다.

Supabase의 `public.users` 테이블에 RLS가 활성화되어 있고, 적절한 정책이 없으면 클라이언트에서 조회할 수 없습니다.

## 해결 방법

### 1단계: RLS 정책 확인

Supabase Dashboard > SQL Editor에서 다음 쿼리 실행:

```sql
-- 현재 RLS 정책 확인
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
AND schemaname = 'public';
```

### 2단계: RLS 정책 추가

다음 SQL을 실행하여 이메일 조회를 허용하는 정책을 추가하세요:

```sql
-- 기존 정책 삭제 (필요시)
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view users" ON public.users;
DROP POLICY IF EXISTS "Public read access for email lookup" ON public.users;

-- 인증된 사용자는 이메일로 사용자 정보를 조회할 수 있도록 정책 추가
CREATE POLICY "Authenticated users can view users by email"
ON public.users
FOR SELECT
TO authenticated
USING (true);

-- RLS 활성화 확인
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
```

### 3단계: 테스트

1. Supabase Dashboard > SQL Editor에서 테스트 쿼리 실행:
```sql
-- 이메일로 조회 테스트
SELECT email, name, phone 
FROM public.users 
WHERE email = 'hclim@evkmc.com' 
LIMIT 1;
```

2. 브라우저 개발자 도구(F12) > Console에서 확인:
   - `authService.getUserInfo()` 호출 시 결과 확인
   - 에러 메시지 확인

### 4단계: 추가 확인 사항

#### RLS가 비활성화되어 있는 경우
```sql
-- RLS 비활성화 (개발 환경에서만, 프로덕션에서는 권장하지 않음)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
```

#### 더 제한적인 정책이 필요한 경우
```sql
-- 자신의 이메일만 조회 가능하도록 제한
CREATE POLICY "Users can view their own data"
ON public.users
FOR SELECT
TO authenticated
USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR auth.uid()::text = auth_user_id::text
);
```

## 참고 파일
- `supabase/migrations/006_fix_email_authentication_rls.sql` - 상세한 RLS 정책 설정 가이드

