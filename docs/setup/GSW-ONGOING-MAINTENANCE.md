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
| CLI로 원격 반영 | `supabase link --project-ref sesedcotooihnpjklqzs`(최초 1회). 적용: **`.\scripts\supabase-db-push.ps1`** — `$env:SUPABASE_DB_PASSWORD`(Pooler) 또는 Pooler에서 `28P01`이면 Dashboard **Database → Connection string → Direct(URI)** 전체를 `$env:SUPABASE_DB_PUSH_URL`로 설정. 비밀번호는 채팅·로그에 남기지 말 것 |
| QQ 정비지침 PDF | `QQ_SM/*.pdf` 수정 후 `.\scripts\upload-qq-sm-pdfs.ps1 -Chapter NN` |
| DTC 매뉴얼 데이터 | `DTC/dtc_data.json`(XLSX 시트 구조) 수정 후 `npm run build:dtc` → `js/dtcData.js` 커밋. 웹 UI는 [`js/dtcWorkflow.js`](../../js/dtcWorkflow.js) 단계별 진단(개요→부위→배선→도면→완료), `localStorage` 세션 저장 |
| DTC 도면 매핑 | `DTC/images/dtc/mappings.json` (원본 PNG/JPG는 Git 제외, `DTC/images/dtc/**`) |
| DTC Storage 업로드 | 마이그레이션 `029` 적용 후 `SUPABASE_SERVICE_ROLE_KEY` 설정 → `npm run upload:dtc` (버킷 `dtc`, 경로 `dtc/E-0420/...`) |
| Storage 경로 | `manual/MASADA-QQ/qq-NN.pdf` ([`js/maintenanceManualMappingQQ.js`](../../js/maintenanceManualMappingQQ.js)) |
| RLS·게시판 | 마이그레이션 `016`~`029` 및 Dashboard 정책 |
| 활동 로그 | 마이그레이션 `030` (`portal_activity_log`) — 사용자는 본인 행만 INSERT, 관리자만 SELECT/파기용 DELETE |

### Supabase CLI로 마이그레이션 원격 적용 (`db push`)

1. **CLI 설치 확인**: `supabase --version` (미설치 시 [Supabase CLI 설치 가이드](https://supabase.com/docs/guides/cli/getting-started))
2. **프로젝트 루트로 이동**: 저장소 최상단 (예: `D:\GSW`)
3. **프로젝트 연결(최초 1회)**:  
   `supabase link --project-ref sesedcotooihnpjklqzs`  
   프롬프트가 나오면 Dashboard 계정 로그인·프로젝트 선택 등 안내 따름
4. **DB 접속 정보 설정** — 둘 중 **하나만** 선택:
   - **방법 A (일반)**  
     Dashboard → **Database** → **Database password**(또는 방금 리셋한 비밀번호)  
     PowerShell:  
     `$env:SUPABASE_DB_PASSWORD = '비밀번호'`  
     같은 창에서 `.\scripts\supabase-db-push.ps1` (또는 `npm run supabase:db:push`)
   - **방법 B (Pooler 오류 `28P01` 등)**  
     Dashboard → **Database** → **Connection string** → **Direct** 또는 **URI** → 전체 문자열 복사  
     PowerShell:  
     `$env:SUPABASE_DB_PUSH_URL = 'postgresql://postgres:...@db.<ref>.supabase.co:5432/postgres'`  
     같은 창에서 `.\scripts\supabase-db-push.ps1` (Pooler/`28P01` 회피에 유리)
5. **성공 확인**: 터미널에 마이그레이션 적용 완료 메시지. Dashboard **SQL Editor**에서 `select to_regclass('public.portal_activity_log');` 결과가 비어 있지 않으면 테이블 생성됨  
6. **보안**: DB 비밀번호·연결 문자열은 **Git·채팅에 넣지 말 것**. 적용 후 `Remove-Item Env:SUPABASE_DB_PASSWORD, Env:SUPABASE_DB_PUSH_URL -ErrorAction SilentlyContinue`

내부적으로는 [`scripts/supabase-db-push.ps1`](../../scripts/supabase-db-push.ps1) 가 `supabase db push ... --yes` 를 호출합니다 (`SUPABASE_DB_PUSH_URL`이 있으면 `--db-url` 우선).

### PowerShell에서 반복되는 오류·점검

- **환경 변수는 같은 창에서** 설정한 직후 **같은 창에서** 실행하세요(`$env:`는 세션별). Cursor/터미널 탭마다 초기화됩니다.
- `28P01`이면 방법 B(Direct URI) 우선.**Pooler 문자열**(호스트가 `*.pooler.supabase.com`, 사용자명이 `postgres.xxx`)은 쓰지 말고, Dashboard의 **직접(Direct)** 문자열만 사용합니다.
- **비밀번호에 `@ # % ?` 등**이 들어 있으면 URI 안의 비밀번호 부분만 [URL 인코딩](https://developer.mozilla.org/en-US/docs/Glossary/Percent-encoding)(예: `@`→`%40`)해야 합니다. 그렇지 않으면 파싱이 깨져 `28P01`처럼 보일 수 있습니다.
- `SUPABASE_DB_PUSH_URL`과 `SUPABASE_DB_PASSWORD`를 **동시에** 두지 않거나, 우선 PUSH URL만 두고 테스트해 보세요(스크립트는 PUSH URL 우선).

**실행 순서 예시**(Direct URI 방식):

```powershell
cd D:\GSW
$env:SUPABASE_DB_PUSH_URL = '<Dashboard에서 복사한 postgres Direct URI 한 줄>'
# npm을 거치지 않고 같은 세션에서 직접 호출(VS Code 작업 등에서 환경이 비는 경우 줄어듭니다)
.\scripts\supabase-db-push.ps1
```

여전히 실패하면 터미널 **`supabase`** 오류 줄만 붙여서 내부에 비밀번호·호스트 포함 여부 확인 후 검토하면 됩니다(비밀값은 채팅에 넣지 말 것).

### CLI 없이 적용(SQL Editor 대안)

Pooler/CLI 비밀이 계속 막히면 **Supabase Dashboard → SQL Editor**에서 [`supabase/migrations/030_portal_activity_log.sql`](../../supabase/migrations/030_portal_activity_log.sql) 전체를 붙여넣고 **한 번에 실행**해도 동일한 DDL·RLS가 적용됩니다(브라우저 로그인 세션만 있으면 됨).

적용 확인: `select to_regclass('public.portal_activity_log');`  
수동 적용 후에도 원격 마이그레이션 이력이 CLI와 안 맞을 수 있습니다. 나중에 `db push`를 다시 쓸 때 같은 파일이 “미적용”으로 보이면 [migration repair](https://supabase.com/docs/reference/cli/supabase-migration-repair)로 해당 버전을 `applied`로 맞추거나, 일정 기간 동안 DDL은 SQL Editor만 쓰는 방식으로 통일하면 됩니다.

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
