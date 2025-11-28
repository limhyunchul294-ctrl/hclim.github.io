# 📁 프로젝트 폴더 구조

이 문서는 프로젝트의 파일 구조를 설명합니다.

## 🗂️ 루트 디렉토리 구조

```
evkmc-as-app/
├── 📄 실제 사용 파일 (애플리케이션)
│   ├── index.html          # 메인 HTML 파일
│   ├── login.html          # 로그인 페이지
│   ├── package.json        # 프로젝트 설정
│   ├── vite.config.js      # Vite 빌드 설정
│   ├── vercel.json         # Vercel 배포 설정
│   ├── .gitignore          # Git 무시 파일
│   ├── .gitmessage.txt     # Git 커밋 메시지 템플릿
│   └── commit-msg.txt      # 커밋 메시지 파일
│
├── 📁 js/                   # JavaScript 소스 파일
│   ├── main.js
│   ├── login.js
│   ├── config.js
│   └── ...
│
├── 📁 assets/               # 정적 자산 파일
│   ├── evkmc-logo.png
│   └── ...
│
├── 📁 public/               # 공개 파일
│   └── ...
│
├── 📁 supabase/             # Supabase 설정 및 마이그레이션
│   ├── migrations/
│   └── functions/
│
├── 📁 docs/                 # 📚 문서 및 가이드
│   ├── README.md            # 문서 목록 및 인덱스
│   ├── MOBILE-PDF-GUIDE.md  # 모바일 PDF 가이드
│   ├── git/                 # Git 관련 문서
│   │   ├── COMMIT-MESSAGE-GUIDE.md
│   │   ├── GIT-ENCODING-FIX.md
│   │   └── ...
│   ├── setup/               # 설정 가이드
│   │   ├── BOARD-SETUP-GUIDE.md
│   │   └── ...
│   ├── deployment/          # 배포 관련
│   │   ├── README-VERCEL.md
│   │   └── ...
│   ├── troubleshooting/     # 문제 해결
│   │   ├── BUILD-FIX.md
│   │   └── ...
│   └── sms/                 # SMS 관련
│       ├── README-TWILIO-SMS.md
│       └── ...
│
├── 📁 scripts/              # 🔧 스크립트 파일
│   ├── git/                 # Git 관련 스크립트
│   │   ├── git-commit-auto-ko.ps1
│   │   └── ...
│   ├── check-build.js
│   ├── fetch-twilio-sms.js
│   └── ...
│
└── 📁 temp/                 # 📦 임시 파일
    ├── sms-logs.json
    └── user.csv
```

## 📋 폴더별 설명

### `/` (루트)
실제 애플리케이션 실행에 필요한 핵심 파일들

### `/docs`
모든 문서 및 가이드 모음
- `/docs/git`: Git 사용법, 커밋 메시지, 히스토리 관리
- `/docs/setup`: 프로젝트 설정 및 설치 가이드
- `/docs/deployment`: 배포 및 배포 환경 설정
- `/docs/troubleshooting`: 문제 해결 및 디버깅 가이드
- `/docs/sms`: SMS 서비스 설정 및 사용법

### `/scripts`
자동화 스크립트
- `/scripts/git`: Git 작업 자동화 스크립트
- 기타 유틸리티 스크립트

### `/temp`
임시 파일 및 데이터 파일
- 로그 파일
- 테스트 데이터

### `/supabase`
Supabase 관련 설정
- `/supabase/migrations`: 데이터베이스 마이그레이션 파일
- `/supabase/functions`: Edge Functions

## 🔍 빠른 찾기

### 자주 사용하는 파일
- **커밋 메시지 자동 생성**: `scripts/git/git-commit-auto-ko.ps1`
- **Git 커밋 가이드**: `docs/git/COMMIT-MESSAGE-GUIDE.md`
- **게시판 설정**: `docs/setup/BOARD-SETUP-GUIDE.md`
- **배포 가이드**: `docs/deployment/README-VERCEL.md`

### 문서 찾기
- 모든 문서 목록: `docs/README.md`
- Git 관련: `docs/git/` 폴더
- 문제 해결: `docs/troubleshooting/` 폴더

## 📝 정리 규칙

1. **실제 사용 파일**: 루트에 유지
2. **문서 파일**: `/docs` 하위로 이동
3. **스크립트 파일**: `/scripts` 하위로 이동
4. **임시 파일**: `/temp` 하위로 이동

## 🔄 파일 추가 시

새로운 파일을 추가할 때는 다음 규칙을 따르세요:

- **문서 파일** (`*.md`): 적절한 `/docs` 하위 폴더에 추가
- **스크립트 파일** (`*.ps1`, `*.sh`): `/scripts` 또는 `/scripts/git`에 추가
- **임시/로그 파일**: `/temp`에 추가
- **실제 사용 파일**: 루트에 유지

---

이 구조를 유지하여 프로젝트를 깔끔하게 관리하세요!

