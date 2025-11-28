# Vercel Production 브랜치 변경 가이드

## 문제 상황
- 현재 Vercel Production이 `evkmc-as-app` 브랜치를 가리키고 있음
- 최신 커밋은 `master` 브랜치에 있음
- 이메일 로그인 기능이 Production에 반영되지 않음

## 해결 방법

### 1. Vercel에서 Production 브랜치 변경

1. Vercel 대시보드 접속: https://vercel.com
2. 프로젝트 선택: `evkmc-as-app`
3. **Settings** 탭 클릭
4. **Git** 섹션으로 이동
5. **Production Branch** 설정 찾기
6. `evkmc-as-app` → `master`로 변경
7. **Save** 클릭

### 2. GitHub에서 기본 브랜치 변경 및 evkmc-as-app 브랜치 삭제

#### 2.1 기본 브랜치 변경
1. GitHub 저장소 접속: https://github.com/limhyunchul294-ctrl/hclim.github.io
2. **Settings** 탭 클릭
3. 왼쪽 메뉴에서 **Branches** 클릭
4. **Default branch** 섹션에서 **Switch to another branch** 클릭
5. `master` 브랜치 선택
6. **Update** 클릭
7. 확인 메시지에서 **I understand, update the default branch** 클릭

#### 2.2 evkmc-as-app 브랜치 삭제
1. GitHub 저장소에서 **Code** 탭 클릭
2. 브랜치 드롭다운에서 `evkmc-as-app` 선택
3. 브랜치 페이지에서 **Delete branch** 버튼 클릭
4. 확인 메시지에서 **Delete** 클릭

또는 터미널에서:
```bash
git push origin --delete evkmc-as-app
```

### 3. Vercel 재배포 확인

1. Vercel 대시보드에서 **Deployments** 탭 확인
2. `master` 브랜치의 최신 커밋이 Production으로 배포되는지 확인
3. 배포가 완료되면 Production URL에서 이메일 로그인 기능 확인

## 참고사항

- 기본 브랜치를 변경하면 Vercel이 자동으로 Production 배포를 `master` 브랜치로 전환합니다
- `evkmc-as-app` 브랜치를 삭제해도 커밋 히스토리는 유지됩니다
- Production 배포가 완료되면 이메일 로그인 기능이 정상 작동합니다

