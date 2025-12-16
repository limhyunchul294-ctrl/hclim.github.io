# 보안서약서 동의 컬럼 추가 가이드

## 문제 상황
보안서약서 동의 저장 시 다음 오류가 발생합니다:
```
Could not find the 'security_agreement_accepted' column of 'users' in the Bohema cache
```

이는 Supabase 데이터베이스의 `users` 테이블에 보안서약서 관련 컬럼이 없기 때문입니다.

## 해결 방법

### 방법 1: Supabase Dashboard에서 직접 실행 (권장)

1. **Supabase Dashboard 접속**
   - https://app.supabase.com 접속
   - 프로젝트 선택

2. **SQL Editor 열기**
   - 왼쪽 메뉴에서 "SQL Editor" 클릭
   - "New query" 클릭

3. **마이그레이션 SQL 실행**
   - 아래 SQL을 복사하여 붙여넣기
   - "Run" 버튼 클릭

```sql
-- Migration: Add security agreement fields to users table
-- Description: 보안서약서 동의 관련 컬럼 추가

-- users 테이블에 보안서약서 관련 컬럼 추가
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS security_agreement_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS security_agreement_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS security_agreement_company TEXT,
ADD COLUMN IF NOT EXISTS security_agreement_name TEXT;

-- 기존 사용자들의 기본값 설정 (동의하지 않은 것으로 설정)
UPDATE public.users
SET security_agreement_accepted = FALSE
WHERE security_agreement_accepted IS NULL;

-- 인덱스 추가 (동의 상태 조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_users_security_agreement_accepted 
ON public.users(security_agreement_accepted);

-- 코멘트 추가
COMMENT ON COLUMN public.users.security_agreement_accepted IS '보안서약서 동의 여부';
COMMENT ON COLUMN public.users.security_agreement_date IS '보안서약서 동의 일시';
COMMENT ON COLUMN public.users.security_agreement_company IS '보안서약서 동의 시 입력한 회사명';
COMMENT ON COLUMN public.users.security_agreement_name IS '보안서약서 동의 시 입력한 담당자 이름';
```

4. **실행 결과 확인**
   - "Success. No rows returned" 메시지가 표시되면 성공
   - 에러가 발생하면 에러 메시지를 확인하고 수정

### 방법 2: Supabase CLI 사용 (선택사항)

```bash
# Supabase CLI로 마이그레이션 실행
supabase db push
```

## 추가된 컬럼

다음 4개의 컬럼이 `users` 테이블에 추가됩니다:

1. **security_agreement_accepted** (BOOLEAN)
   - 보안서약서 동의 여부
   - 기본값: `FALSE`

2. **security_agreement_date** (TIMESTAMP WITH TIME ZONE)
   - 보안서약서 동의 일시
   - NULL 가능

3. **security_agreement_company** (TEXT)
   - 보안서약서 동의 시 입력한 회사명
   - NULL 가능

4. **security_agreement_name** (TEXT)
   - 보안서약서 동의 시 입력한 담당자 이름
   - NULL 가능

## 확인 방법

마이그레이션 실행 후 다음 SQL로 확인할 수 있습니다:

```sql
-- 컬럼 확인
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
  AND column_name LIKE 'security_agreement%';

-- 인덱스 확인
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'users'
  AND indexname LIKE '%security_agreement%';
```

## 문제 해결

### 에러: "column already exists"
- 이미 컬럼이 존재하는 경우입니다. 무시하고 진행해도 됩니다.
- `IF NOT EXISTS` 구문으로 인해 안전하게 처리됩니다.

### 에러: "permission denied"
- RLS 정책 문제일 수 있습니다.
- Supabase Dashboard에서 관리자 권한으로 실행해야 합니다.

### 에러: "relation does not exist"
- `users` 테이블이 없는 경우입니다.
- 먼저 users 테이블을 생성해야 합니다.

## 참고

- 마이그레이션 파일 위치: `supabase/migrations/018_add_security_agreement_fields.sql`
- 마이그레이션 실행 후 앱을 새로고침하면 보안서약서 동의 기능이 정상 작동합니다.

