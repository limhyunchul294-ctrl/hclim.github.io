# Vercel Root Directory 오류 해결

## 문제
```
npm error enoent Could not read package.json: Error: ENOENT: no such file or directory, open '/vercel/path0/package.json'
```

## 원인
Vercel이 저장소의 루트에서 `package.json`을 찾지 못하고 있습니다.
GitHub 저장소의 구조에 따라 Root Directory 설정이 필요합니다.

## 해결 방법

### 방법 1: Root Directory 설정 (권장)

Vercel 대시보드에서:

1. **프로젝트 설정으로 이동**
   - Vercel 대시보드 → 프로젝트 선택 → Settings → General

2. **Root Directory 설정**
   - "Root Directory" 섹션 찾기
   - "Edit" 클릭
   - 입력: `evkmc-as-app`
   - "Save" 클릭

3. **재배포**
   - Deployments 탭에서 "Redeploy" 클릭

### 방법 2: GitHub 저장소 구조 확인

GitHub 저장소 구조에 따라:

**케이스 A: 저장소 루트가 `evkmc-as-app`인 경우**
```
hclim.github.io/
├── package.json
├── index.html
├── js/
└── ...
```
→ Root Directory: `.` (기본값)

**케이스 B: 저장소 루트가 상위 폴더인 경우**
```
hclim.github.io/
├── evkmc-as-app/
│   ├── package.json
│   ├── index.html
│   └── ...
└── other-files/
```
→ Root Directory: `evkmc-as-app` (필수!)

### 방법 3: 저장소 구조 변경

GitHub 저장소의 루트를 `evkmc-as-app` 폴더로 만드는 방법:

1. GitHub 저장소에 새 브랜치 생성 또는 기존 브랜치 수정
2. `evkmc-as-app` 폴더의 모든 파일을 저장소 루트로 이동
3. Root Directory를 `.`로 설정

## 현재 설정 확인

Vercel 대시보드에서 다음을 확인하세요:

1. **Settings → General → Root Directory**
   - 현재 값이 무엇인지 확인
   - `evkmc-as-app`으로 설정되어 있는지 확인

2. **Build & Development Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

## 빠른 해결

가장 빠른 방법은 **Root Directory를 `evkmc-as-app`으로 설정**하는 것입니다:

1. Vercel 대시보드 → 프로젝트 → Settings
2. Root Directory: `evkmc-as-app` 입력
3. 저장 후 재배포

