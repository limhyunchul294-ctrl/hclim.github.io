# GSW 웹사이트 지속 관리 가이드

EVKMC A/S 정비 포털(GSW) 운영·배포·보안을 정기적으로 점검하기 위한 체크리스트입니다.

## 1. 배포·릴리스

| 항목 | 관리 |
|------|------|
| Production 브랜치 | `master` → Vercel 자동 배포 |
| 개발 브랜치 | `develop` |
| 배포 후 스모크 | 로그인(이메일 OTP), 정비지침서 PDF, 공지/커뮤니티, PWA 홈 화면 |
| 정적 캐시 | `vercel.json` — `/js/` 장기 캐시, HTML은 `must-revalidate` |

## 2. 인증·보안

| 항목 | 관리 |
|------|------|
| 이메일 OTP | [`EMAIL-MAGIC-LINK-SETUP.md`](EMAIL-MAGIC-LINK-SETUP.md) — 템플릿 `{{ .Token }}`, Redirect URL |
| 미등록 계정 차단 | `shouldCreateUser: false` + `check_user_email` + `public.users` 검증 ([`js/login.js`](../../js/login.js)). **`auth.email.enable_signup`은 true 유지** (false면 OTP 전체 차단) |
| Supabase Auth 설정 | [`supabase/config.toml`](../../supabase/config.toml) — **push 전 `site_url` 확인** |
| Supabase CLI | `supabase link --project-ref sesedcotooihnpjklqzs` (연결 완료 시 Storage 업로드·`config push` 등) |
| SMS / Twilio | **미사용** — `[auth.sms.twilio] enabled = false`. 로그인은 **이메일 OTP**만 운영. `config push` 후에도 Dashboard에서 SMS 프로바이더를 켜지 않음 |
| config push | `supabase config push --project-ref sesedcotooihnpjklqzs --yes` |
| 비밀 파일 | `.env`, `.env.bak` — Git 제외 ([`.gitignore`](../../.gitignore)) |
| HTTP 헤더 | [`vercel.json`](../../vercel.json) — `X-Frame-Options`, `nosniff` 등 |

## 3. Supabase 데이터·Storage

| 항목 | 관리 |
|------|------|
| 마이그레이션 | `supabase/migrations/` — 원격 반영 이력 유지 |
| QQ 정비지침 PDF | `QQ_SM/*.pdf` 수정 후 `.\scripts\upload-qq-sm-pdfs.ps1 -Chapter NN` |
| DTC 매뉴얼 데이터 | `DTC/dtc_data.json` 수정 후 `npm run build:dtc` → `js/dtcData.js` 커밋. 보조 5코드는 `data/source/DTC코드.xlsx` |
| DTC 도면 매핑 | `DTC/images/dtc/mappings.json` (원본 PNG/JPG는 Git 제외, `DTC/images/dtc/**`) |
| DTC Storage 업로드 | 마이그레이션 `029` 적용 후 `SUPABASE_SERVICE_ROLE_KEY` 설정 → `npm run upload:dtc` (버킷 `dtc`, 경로 `dtc/E-0420/...`) |
| Storage 경로 | `manual/MASADA-QQ/qq-NN.pdf` ([`js/maintenanceManualMappingQQ.js`](../../js/maintenanceManualMappingQQ.js)) |
| RLS·게시판 | 마이그레이션 `016`~`029` 및 Dashboard 정책 |

## 4. 사용자·콘텐츠

| 항목 | 관리 |
|------|------|
| `public.users` | 사번·이메일·등급 — OTP 로그인 전제 |
| 공지·커뮤니티 | 시드/운영 SQL (`028` 등), Markdown 렌더링 |
| 보안 서약 | [`js/securityAgreement.js`](../../js/securityAgreement.js) |

## 5. 정기 점검 (월 1회 권장)

- [ ] Production 로그인·주요 메뉴 동작
- [ ] Supabase Auth Logs (rate limit, 실패 급증)
- [ ] Redirect URL = 실제 Vercel 도메인
- [ ] 미커밋 비밀·키 파일 없음
- [ ] 의존 CDN(Tailwind, pdf.js) 로드 정상

## 6. 관련 문서

- 이메일 OTP 상세: [`EMAIL-MAGIC-LINK-SETUP.md`](EMAIL-MAGIC-LINK-SETUP.md)
- Vercel 배포: [`../deployment/README-VERCEL.md`](../deployment/README-VERCEL.md)
- 게시판 시드: [`../../supabase/migrations/028_refresh_notices_and_community_seed.sql`](../../supabase/migrations/028_refresh_notices_and_community_seed.sql)
