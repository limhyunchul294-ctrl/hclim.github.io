# 보안서약서 동의 저장 문제 간단 해결 가이드 (사용자 제안 방식)

## 💡 사용자 제안 방식

사용자가 제안한 간단한 RLS 정책 방식:

```sql
CREATE POLICY "Users can update their own profile"
ON public.users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

## ✅ 실제 적용 방법

`public.users` 테이블에는 `id` 컬럼이 없고 `auth_user_id` 컬럼이 있으므로, 다음과 같이 수정하여 적용합니다:

```sql
CREATE POLICY "Users can update their own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = auth_user_id)
WITH CHECK (auth.uid() = auth_user_id);
```

## 🚀 즉시 해결 방법

### 1. Supabase Dashboard에서 SQL 실행

1. **Supabase Dashboard 접속**
   - https://app.supabase.com
   - 프로젝트 선택

2. **SQL Editor 열기**
   - 왼쪽 메뉴 → "SQL Editor"
   - "New query" 클릭

3. **SQL 파일 내용 복사하여 실행**
   - `supabase/fix_security_agreement_rls_simple.sql` 파일 내용을 복사
   - SQL Editor에 붙여넣기
   - "Run" 버튼 클릭 (또는 `Ctrl + Enter`)

4. **실행 결과 확인**
   - "Success" 메시지 확인
   - 정책이 제대로 추가되었는지 확인

### 2. 브라우저 완전 새로고침

- Windows: `Ctrl + F5`
- Mac: `Cmd + Shift + R`

### 3. 다시 테스트

1. 보안서약서 팝업에서 동의 버튼 클릭
2. 콘솔에서 "✅ 보안서약서 동의 저장 완료" 확인

## ⚠️ 주의사항

### auth_user_id가 NULL인 경우

만약 `auth_user_id`가 NULL인 사용자가 있다면, 위 정책이 작동하지 않을 수 있습니다.

**해결 방법:**

1. **auth_user_id 동기화** (권장)
   ```sql
   -- 실제 이메일로 변경
   UPDATE public.users
   SET auth_user_id = (SELECT id FROM auth.users WHERE email = 'hclim@evkmc.com')
   WHERE email = 'hclim@evkmc.com'
     AND (auth_user_id IS NULL OR auth_user_id != (SELECT id FROM auth.users WHERE email = 'hclim@evkmc.com'))
   RETURNING profile_id, email, auth_user_id;
   ```

2. **대안 정책 사용** (임시)
   - `fix_security_agreement_rls_simple.sql` 파일 하단의 주석 처리된 대안 정책 사용
   - 이메일 매칭도 허용하는 더 관대한 정책

## 🔍 문제 진단

### 현재 정책 확인

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

```sql
SELECT 
    profile_id,
    auth_user_id,
    email,
    security_agreement_accepted,
    auth.uid() as current_auth_uid,
    CASE 
        WHEN auth_user_id = auth.uid() THEN '✅ 일치'
        WHEN auth_user_id IS NULL THEN '❌ NULL'
        ELSE '⚠️ 불일치'
    END as match_status
FROM public.users
WHERE email = 'hclim@evkmc.com'
   OR auth_user_id = auth.uid();
```

### auth_user_id 동기화 상태 확인

```sql
SELECT 
    pu.profile_id,
    pu.email,
    pu.auth_user_id,
    au.id as auth_users_id,
    CASE 
        WHEN pu.auth_user_id = au.id THEN '✅ 정상 연결됨'
        WHEN pu.auth_user_id IS NULL THEN '❌ auth_user_id 없음'
        ELSE '⚠️ 불일치'
    END as status
FROM public.users pu
LEFT JOIN auth.users au ON LOWER(TRIM(pu.email)) = LOWER(TRIM(au.email))
WHERE pu.email = 'hclim@evkmc.com';
```

## 📊 정책 비교

### 간단한 정책 (사용자 제안)
- **장점**: 매우 간단하고 명확
- **단점**: `auth_user_id`가 NULL이면 작동하지 않음
- **사용 시기**: 모든 사용자의 `auth_user_id`가 정상적으로 설정된 경우

### 관대한 정책 (이전 방식)
- **장점**: `auth_user_id`, `email`, `profile_id` 모두 허용
- **단점**: 조건이 복잡함
- **사용 시기**: `auth_user_id`가 NULL인 사용자가 있는 경우

## 🎯 권장 사항

1. **먼저 간단한 정책 시도** (`fix_security_agreement_rls_simple.sql`)
2. **작동하지 않으면 `auth_user_id` 동기화**
3. **여전히 문제가 있으면 관대한 정책 사용** (`fix_security_agreement_rls_urgent.sql`)

## 📚 관련 문서

- [SECURITY_AGREEMENT_RLS_URGENT_FIX.md](./SECURITY_AGREEMENT_RLS_URGENT_FIX.md): 관대한 정책 가이드
- [SECURITY_AGREEMENT_RLS_FIX.md](./SECURITY_AGREEMENT_RLS_FIX.md): 상세 해결 방법

