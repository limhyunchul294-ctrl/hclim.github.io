# 🔒 보안 설정 가이드

이 문서는 보안 강화 작업 후 필요한 설정 방법을 안내합니다.

## 1. 환경 변수 설정

Supabase API 키를 환경 변수로 이동했습니다. 다음 단계를 따라 설정하세요.

### 1-1. .env.local 파일 생성

프로젝트 루트(`evkmc-as-app/`)에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
VITE_SUPABASE_URL=https://sesedcotooihnpjklqzs.supabase.co
VITE_SUPABASE_ANON_KEY=실제_Supabase_ANON_KEY_값_입력
```

**중요**: 
- `.env.local` 파일은 Git에 커밋되지 않습니다 (`.gitignore`에 포함됨)
- 실제 ANON_KEY 값은 Supabase Dashboard > Settings > API에서 확인할 수 있습니다

### 1-2. 개발 서버 재시작

환경 변수를 변경한 후에는 개발 서버를 재시작해야 합니다:

```bash
# 개발 서버 중지 (Ctrl+C)
# 개발 서버 재시작
npm run dev
```

### 1-3. 빌드 시 환경 변수 확인

프로덕션 빌드 시에도 환경 변수가 제대로 주입되는지 확인하세요:

```bash
npm run build
```

---

## 2. 보안 개선 사항

### ✅ XSS 방지
- DOMPurify 라이브러리로 사용자 입력 정화
- 모든 사용자 생성 콘텐츠(제목, 내용, 댓글) 이스케이프 처리
- Markdown 콘텐츠 파싱 후 HTML 정화

### ✅ 입력 검증
- 게시글 제목: 최대 255자
- 게시글 내용: 최대 10,000자
- 댓글 내용: 최대 2,000자
- 카테고리 검증 (허용된 값만 허용)

### ✅ API 키 보안
- 환경 변수로 API 키 분리
- 소스코드에서 하드코딩된 키 제거
- 프로덕션 환경에서 환경 변수 없을 시 에러 발생

---

## 3. 파일 구조

보안 관련 파일:

```
evkmc-as-app/
├── js/
│   ├── config.js              # 환경 변수 로드
│   ├── securityUtils.js       # 보안 유틸리티 (이스케이프, 정화, 검증)
│   └── main.js                # XSS 방지 적용
├── .env.local                  # 환경 변수 (Git에 커밋되지 않음)
└── .env.local.template         # 환경 변수 템플릿
```

---

## 4. 문제 해결

### 환경 변수가 적용되지 않는 경우

1. `.env.local` 파일이 올바른 위치에 있는지 확인 (`evkmc-as-app/.env.local`)
2. 파일 이름이 정확한지 확인 (`.env.local` - 점으로 시작)
3. 개발 서버를 재시작했는지 확인
4. Vite를 사용하는 경우 `VITE_` 접두사가 있는지 확인

### 빌드 시 환경 변수 오류

프로덕션 빌드 시 환경 변수가 없으면 에러가 발생합니다. 배포 플랫폼(Vercel, Netlify 등)에서 환경 변수를 설정해야 합니다.

**Vercel 예시**:
1. Vercel Dashboard > Project > Settings > Environment Variables
2. `VITE_SUPABASE_URL` 추가
3. `VITE_SUPABASE_ANON_KEY` 추가
4. 배포 재실행

---

## 5. 추가 보안 권장 사항

현재 구현된 보안 조치 외에도 다음을 고려하세요:

1. **CSP (Content Security Policy) 헤더 추가** (중간 우선순위)
2. **서버 측 입력 검증 강화** (Supabase RLS 정책 확인)
3. **파일 업로드 서버 측 검증** (파일 내용 검증)
4. **정기적인 보안 감사** (3개월마다)

자세한 내용은 `SECURITY-AUDIT-REPORT.md` 파일을 참고하세요.

---

**작성일**: 2024년 12월 19일  
**업데이트**: 보안 강화 작업 완료

