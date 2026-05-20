# GSW 웹사이트 지속 관리 가이드

EVKMC A/S 정비 포털(GSW) 운영·배포·보안을 정기적으로 점검하기 위한 체크리스트입니다.

## 1. 배포·릴리스

| 항목 | 관리 |
|------|------|
| Production 브랜치 | `master` → Vercel 자동 배포 |
| 개발 브랜치 | `develop` |
| 배포 후 스모크 | 로그인(이메일 OTP), 정비지침서 PDF, `#/dtc` 배선표·도면, 공지/커뮤니티, PWA 홈 화면 |
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
| DTC 매뉴얼 데이터 | `DTC/dtc_data.json`(XLSX 시트 구조) 수정 후 `npm run build:dtc` → `js/dtcData.js` 커밋. 웹 UI는 [`js/dtcWorkflow.js`](../../js/dtcWorkflow.js) 단계별 진단(개요→부위→배선→도면→완료), `localStorage` 세션 저장 |
| DTC 도면 매핑 | `DTC/images/dtc/mappings.json` (원본 PNG/JPG는 Git 제외, `DTC/images/dtc/**`) |
| DTC Storage 업로드 | 마이그레이션 `029` 적용 후 `SUPABASE_SERVICE_ROLE_KEY` 설정 → `npm run upload:dtc` (버킷 `dtc`, 경로 `dtc/E-0420/...`) |
| Storage 경로 | `manual/MASADA-QQ/qq-NN.pdf` ([`js/maintenanceManualMappingQQ.js`](../../js/maintenanceManualMappingQQ.js)) |
| RLS·게시판 | 마이그레이션 `016`~`029` 및 Dashboard 정책 |
| 활동 로그 | 마이그레이션 `030` (`portal_activity_log`) — 사용자는 본인 행만 INSERT, 관리자만 SELECT/파기용 DELETE |

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

## 6. 포털 이용 로그 (활동 요약)

| 항목 | 내용 |
|------|------|
| 테이블 | `public.portal_activity_log` (마이그레이션 `030_portal_activity_log.sql`) |
| 저장 항목 | 이벤트 유형(`session_start`, `route_view`, `manual_open`, `manual_download`, `dtc_select`, `admin_user_update`), 카테고리·리소스 키 요약, JSON payload(버킷·파일명 등 비식별 범위) |
| 행위자 | 트리거로 `actor_user_id = auth.uid()` 고정(클라이언트 입력 무시) |
| 관리 화면 | 관리자 대시보드 **이용 로그** 탭(기본 최근 7일, 최대 200건) |
| 보관 기간 권장 | **12~24개월**(내부 보안·분쟁 대응 관행 참고 후 확정). 법무·처리방침과 불일치 시 기간 단축·항목 최소화 |
| 분기별 삭제 예시 | Supabase SQL Editor에서 관리자 계정으로 실행(또는 스케줄 작업 전제): `DELETE FROM public.portal_activity_log WHERE created_at < NOW() - INTERVAL '730 days';` (보관 24개월 가정 시 — 운영에서 확정한 개월수로 교체) |
| 법무 | 개인정보 처리방침·보안서약에 **접속·이용 행태 로그의 목적·수집 항목·보관 기간**을 반영(문구는 법무 주도 검토가 전제). 자동 크론(pg_cron 등)은 2차로 선택 가능 |

## 7. 관련 문서

- 이메일 OTP 상세: [`EMAIL-MAGIC-LINK-SETUP.md`](EMAIL-MAGIC-LINK-SETUP.md)
- Vercel 배포: [`../deployment/README-VERCEL.md`](../deployment/README-VERCEL.md)
- 게시판 시드: [`../../supabase/migrations/028_refresh_notices_and_community_seed.sql`](../../supabase/migrations/028_refresh_notices_and_community_seed.sql)
