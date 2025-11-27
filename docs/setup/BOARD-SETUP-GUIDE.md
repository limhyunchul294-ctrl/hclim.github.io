# 게시판 기능 설정 가이드

## 🔴 현재 상태 확인

커뮤니티 페이지에서 "게시글을 불러올 수 없다"는 오류가 발생하는 경우, **데이터베이스 테이블이 아직 생성되지 않았을 가능성이 높습니다.**

## ✅ 해결 방법

### 1단계: Supabase Dashboard 접속

1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택 (`sesedcotooihnpjklqzs`)

### 2단계: SQL Editor 열기

1. 왼쪽 메뉴에서 **SQL Editor** 클릭
2. **New Query** 클릭

### 3단계: SQL 마이그레이션 실행

`supabase/migrations/001_board_management.sql` 파일의 내용을 복사하여 SQL Editor에 붙여넣고 실행합니다.

**파일 위치:** `evkmc-as-app/supabase/migrations/001_board_management.sql`

### 4단계: Storage 버킷 생성

1. 왼쪽 메뉴에서 **Storage** 클릭
2. **Create a new bucket** 클릭
3. 다음 버킷들을 생성:

#### 버킷 1: `notices`
- **Name**: `notices`
- **Public bucket**: ✅ 체크 (공지사항 첨부파일)
- **File size limit**: 10 MB
- **Allowed MIME types**: 
  - `application/pdf`
  - `image/*`
  - `application/msword`
  - `application/vnd.openxmlformats-officedocument.*`
  - `application/zip`

#### 버킷 2: `community`
- **Name**: `community`
- **Public bucket**: ✅ 체크 (커뮤니티 첨부파일)
- **File size limit**: 10 MB
- **Allowed MIME types**: 위와 동일

### 5단계: RLS 정책 확인

SQL 마이그레이션에서 RLS 정책이 자동으로 생성되지만, Storage 버킷에도 RLS 정책을 설정해야 합니다.

**Storage 버킷 RLS 정책 (SQL Editor에서 실행):**

```sql
-- notices 버킷 정책
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'notices');

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'notices' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'notices' 
  AND auth.uid() IS NOT NULL
);

-- community 버킷 정책
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'community');

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'community' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'community' 
  AND auth.uid() IS NOT NULL
);
```

## 🔍 문제 해결

### 문제 1: "게시글을 불러올 수 없습니다"

**원인:**
- `community_posts` 테이블이 생성되지 않음

**해결:**
1. SQL Editor에서 `001_board_management.sql` 실행 확인
2. 테이블 생성 확인: Table Editor에서 `community_posts` 테이블 확인

### 문제 2: "Supabase 클라이언트가 초기화되지 않았습니다"

**원인:**
- `config.js` 파일의 Supabase 설정 문제

**해결:**
- `js/config.js` 파일에서 `SUPABASE_URL`과 `SUPABASE_ANON_KEY` 확인

### 문제 3: 파일 업로드 오류

**원인:**
- Storage 버킷이 생성되지 않았거나 RLS 정책 문제

**해결:**
1. Storage 버킷 생성 확인
2. RLS 정책 확인 (위의 Storage RLS 정책 참고)

### 문제 4: 권한 오류

**원인:**
- RLS 정책이 제대로 설정되지 않음

**해결:**
1. SQL Editor에서 RLS 정책 재실행
2. Table Editor에서 각 테이블의 RLS 활성화 확인

## ✅ 확인 체크리스트

- [ ] SQL 마이그레이션 실행 완료
- [ ] `notices` 테이블 존재 확인
- [ ] `community_posts` 테이블 존재 확인
- [ ] `community_comments` 테이블 존재 확인
- [ ] `post_likes` 테이블 존재 확인
- [ ] `notices` Storage 버킷 생성 확인
- [ ] `community` Storage 버킷 생성 확인
- [ ] Storage 버킷 RLS 정책 설정 확인
- [ ] 브라우저 콘솔에서 오류 메시지 확인

## 🧪 테스트

1. **공지사항 페이지 접속**
   - URL: `#/notices`
   - 예상 결과: 공지사항 목록 또는 빈 목록 표시

2. **커뮤니티 페이지 접속**
   - URL: `#/community`
   - 예상 결과: 게시글 목록 또는 "아직 게시글이 없습니다" 메시지 표시

3. **게시글 작성 테스트**
   - 커뮤니티 페이지에서 "글 작성" 버튼 클릭
   - 게시글 작성 후 저장
   - 예상 결과: 게시글이 목록에 표시됨

## 📝 참고사항

### 테이블 생성 확인 방법

1. Supabase Dashboard > **Table Editor**
2. 다음 테이블들이 보이는지 확인:
   - `notices`
   - `community_posts`
   - `community_comments`
   - `post_likes`
   - `comment_likes`

### 오류 로그 확인

브라우저 개발자 도구 (F12) > Console 탭에서 다음 오류 메시지 확인:
- `⚠️ community_posts 테이블이 존재하지 않습니다.` → SQL 마이그레이션 필요
- `❌ getCommunityPosts 오류` → 자세한 오류 메시지 확인

---

문제가 계속되면 브라우저 콘솔의 오류 메시지를 확인하고 알려주세요!

