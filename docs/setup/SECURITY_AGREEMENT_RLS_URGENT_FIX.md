# 보안서약서 동의 저장 문제 긴급 해결 가이드

## ⚠️ 문제 상황

보안서약서 동의 저장 시 403 Forbidden 오류가 발생합니다.

**에러 메시지:**
```
permission denied for table users
```

**원인:**
- RLS (Row Level Security) 정책이 존재하지만, 정책의 조건이 실제 사용자 데이터와 맞지 않음
- `auth_user_id`, `email`, `profile_id` 중 어떤 것도 정확히 매칭되지 않음

## ✅ 즉시 해결 방법

### 1. Supabase Dashboard에서 SQL 실행

1. **Supabase Dashboard 접속**
   - https://app.supabase.com
   - 프로젝트 선택

2. **SQL Editor 열기**
   - 왼쪽 메뉴 → "SQL Editor"
   - "New query" 클릭

3. **SQL 파일 내용 복사하여 실행**
   - `supabase/fix_security_agreement_rls_urgent.sql` 파일 내용을 복사
   - SQL Editor에 붙여넣기
   - "Run" 버튼 클릭 (또는 `Ctrl + Enter`)

4. **실행 결과 확인**
   - "Success" 메시지 확인
   - 정책이 제대로 추가되었는지 확인 (쿼리 결과 확인)

### 2. 브라우저 완전 새로고침

- Windows: `Ctrl + F5`
- Mac: `Cmd + Shift + R`

### 3. 다시 테스트

1. 보안서약서 팝업에서 동의 버튼 클릭
2. 콘솔에서 "✅ 보안서약서 동의 저장 완료" 확인

## 🔍 문제 진단

### 현재 정책 확인

Supabase Dashboard > SQL Editor에서 다음 쿼리 실행:

```sql
SELECT 
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'users'
  AND schemaname = 'public'
  AND cmd = 'UPDATE'
ORDER BY policyname;
```

### 사용자 정보 확인

실제 이메일로 변경하여 실행:

```sql
SELECT 
    profile_id,
    auth_user_id,
    email,
    security_agreement_accepted,
    security_agreement_date,
    (SELECT id FROM auth.users WHERE email = 'hclim@evkmc.com') as auth_users_id,
    (SELECT email FROM auth.users WHERE id = (SELECT id FROM auth.users WHERE email = 'hclim@evkmc.com')) as auth_email
FROM public.users
WHERE email = 'hclim@evkmc.com'
   OR auth_user_id = (SELECT id FROM auth.users WHERE email = 'hclim@evkmc.com');
```

### auth_user_id 동기화 (필요시)

만약 `auth_user_id`가 NULL이거나 잘못된 경우:

```sql
UPDATE public.users
SET auth_user_id = (SELECT id FROM auth.users WHERE email = 'hclim@evkmc.com')
WHERE email = 'hclim@evkmc.com'
  AND (auth_user_id IS NULL OR auth_user_id != (SELECT id FROM auth.users WHERE email = 'hclim@evkmc.com'))
RETURNING profile_id, email, auth_user_id;
```

## 📝 변경 사항

### 새로운 정책의 특징

1. **더 관대한 조건**: `auth_user_id`, `email`, `profile_id` 중 하나라도 일치하면 업데이트 허용
2. **이메일 정규화**: `LOWER(TRIM(COALESCE(...)))`로 대소문자 및 공백 무시
3. **NULL 안전**: `COALESCE`로 NULL 값 처리

### 정책 조건

**USING (읽기 조건):**
- `auth_user_id`가 `auth.uid()`와 일치
- 또는 `email`이 `auth.users`의 이메일과 일치 (대소문자 무시)
- 또는 `profile_id`가 있고 `email`이 일치

**WITH CHECK (쓰기 조건):**
- USING과 동일한 조건

## 🚨 여전히 문제가 있다면

1. **Supabase Dashboard에서 직접 테스트**
   ```sql
   -- 실제 이메일로 변경
   UPDATE public.users 
   SET security_agreement_accepted = true,
       security_agreement_date = NOW(),
       security_agreement_company = '테스트',
       security_agreement_name = '테스트'
   WHERE email = 'hclim@evkmc.com'
   RETURNING profile_id, email, security_agreement_accepted;
   ```

2. **RLS 정책 일시 비활성화 (테스트용)**
   ```sql
   -- ⚠️ 주의: 프로덕션에서는 사용하지 마세요!
   ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
   ```

3. **관리자에게 문의**
   - 사용자 정보 확인 요청
   - `auth_user_id` 동기화 요청

## 📚 관련 문서

- [SECURITY_AGREEMENT_RLS_FIX.md](./SECURITY_AGREEMENT_RLS_FIX.md): 상세 해결 방법
- [SECURITY_AGREEMENT_MIGRATION.md](./SECURITY_AGREEMENT_MIGRATION.md): 마이그레이션 가이드

