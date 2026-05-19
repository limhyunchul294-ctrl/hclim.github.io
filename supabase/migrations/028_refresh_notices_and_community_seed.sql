-- ============================================
-- 공지사항 교체 + 커뮤니티 시드 (타임라인형 · 임의일)
-- 기간: 2025-06-03 ~ 2026-05-19 (KST)
-- Supabase Dashboard > SQL Editor에서 실행
-- 주의: 기존 notices·community_posts·댓글·좋아요 데이터가 삭제됩니다.
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'post_likes') THEN
    DELETE FROM post_likes;
  END IF;
END $$;
DELETE FROM community_comments;
DELETE FROM community_posts;
DELETE FROM notices;

ALTER SEQUENCE notices_id_seq RESTART WITH 1;
ALTER SEQUENCE community_posts_id_seq RESTART WITH 1;

-- ============================================
-- 공지사항 N01 ~ N12
-- ============================================

-- N01: 2025-06-03 포털 오픈 (고정)
INSERT INTO notices (title, content, category, is_pinned, created_at)
VALUES (
    'EVKMC A/S 정비 포털 오픈',
    $$EVKMC A/S **정비 기술 포털**이 오픈했습니다.

협력 정비사·A/S 네트워크가 필요한 **정비지침서**, **전장회로도(ETM)** 등을 한곳에서 열람할 수 있습니다.

**이용 순서**
1. 관리자에게 등록된 **사용자 계정**으로 로그인합니다.
2. 상단 메뉴에서 **정비지침서** 또는 **전장회로도**를 선택합니다.
3. **차종**을 선택한 뒤 목차에서 문서를 엽니다.

**안내**
- 계정·등급에 따라 일부 메뉴가 제한될 수 있습니다.
- 기술문서는 **내부 업무용**이며 무단 복제·배포를 금합니다.

문의는 EVKMC A/S 담당자에게 연락해 주세요.$$,
    '중요',
    true,
    '2025-06-03 10:47:00+09'::timestamptz
);

-- N02: 2025-07-15 전장회로도·ETM
INSERT INTO notices (title, content, category, is_pinned, created_at)
VALUES (
    '전장회로도·ETM 자료 이용 안내',
    $$**전장회로도(ETM)** 메뉴가 정비 포털에 통합되었습니다.

**이용 방법**
1. 로그인 후 **전장회로도** 메뉴 선택
2. **차종** 선택
3. 목차에서 회로도·관련 PDF 선택

**정비지침서와의 차이**
- **정비지침서**: 정비 절차·사양 중심
- **전장회로도**: 배선·커넥터·회로 참조

PC에서는 포털 화면에서 PDF를 바로 열람할 수 있습니다. 현장에서는 Wi‑Fi 환경을 확인해 주세요.$$,
    '업데이트',
    false,
    '2025-07-15 14:23:00+09'::timestamptz
);

-- N03: 2025-08-20 워터마크
INSERT INTO notices (title, content, category, is_pinned, created_at)
VALUES (
    '기술문서 워터마크 및 보안 유의',
    $$기술문서·이미지 열람 시 **사용자 식별 워터마크**가 표시됩니다.

**목적**
- 문서 유출 추적 및 내부 보안 강화

**협력사·정비사께서 지켜 주실 사항**
- 촬영·캡처·외부 전송 금지
- 개인 저장·SNS·메신저 공유 금지
- 열람은 **업무 목적**으로만 이용

위반 시 계정 제한 및 법적 조치가 있을 수 있습니다. 협조 부탁드립니다.$$,
    '공지',
    false,
    '2025-08-20 09:18:00+09'::timestamptz
);

-- N04: 2025-09-10 와이어링 커넥터
INSERT INTO notices (title, content, category, is_pinned, created_at)
VALUES (
    '와이어링 커넥터 자료 추가',
    $$전장회로도 메뉴에 **와이어링 커넥터** 이미지 자료가 추가되었습니다.

**포함 항목 (차종별 상이)**
- 메인 와이어링
- 섀시·도어 관련 커넥터
- 루프·루프 익스텐션 등

**이용 방법**
1. **전장회로도** → 차종 선택
2. 목차에서 **와이어링 커넥터** 항목 선택
3. 이미지 확대·다운로드 시 워터마크가 적용됩니다

이미지가 보이지 않으면 브라우저 새로고침 후 다시 시도해 주세요.$$,
    '업데이트',
    false,
    '2025-09-10 16:52:00+09'::timestamptz
);

-- N05: 2025-10-07 등급 안내
INSERT INTO notices (title, content, category, is_pinned, created_at)
VALUES (
    '계정 등급(Blue / Silver / Black) 안내',
    $$포털 메뉴는 계정 **등급(Label)** 에 따라 달라집니다.

| 등급 | 대표 권한 |
|------|-----------|
| **Blue Label** | 기본 기술문서 열람, 커뮤니티 댓글 |
| **Silver Label** | 확대 열람, 커뮤니티 글 작성 |
| **Black Label** | 전체 메뉴·고급 자료 |

**등급 상향**
- 현장·소속·업무 범위에 따라 관리자가 조정합니다.
- 상향 요청은 담당 관리자에게 **사용자 ID·소속**과 함께 문의해 주세요.

메뉴가 보이지 않으면 등록·등급을 먼저 확인해 주세요.$$,
    '중요',
    false,
    '2025-10-07 11:06:00+09'::timestamptz
);

-- N06: 2025-11-12 이메일 로그인
INSERT INTO notices (title, content, category, is_pinned, created_at)
VALUES (
    '이메일 로그인(매직링크) 안내',
    $$로그인 방식이 **이메일 매직링크**로 안정화되었습니다.

**로그인 방법**
1. 로그인 화면에서 **사용자 계정(ID)** 입력
2. 등록된 **이메일** 입력
3. 이메일로 수신한 **로그인 링크** 클릭

**유의사항**
- 사전에 관리자가 등록한 계정·이메일만 사용 가능합니다.
- 링크는 일정 시간 후 만료됩니다. 만료 시 다시 요청해 주세요.
- 스팸함·프로모션함도 확인해 주세요.

계정·이메일 불일치 시 관리자에게 문의해 주세요.$$,
    '업데이트',
    false,
    '2025-11-12 15:34:00+09'::timestamptz
);

-- N07: 2025-12-05 게시판 오픈
INSERT INTO notices (title, content, category, is_pinned, created_at)
VALUES (
    '공지·커뮤니티 게시판 오픈',
    $$**공지사항**과 **커뮤니티** 게시판을 이용하실 수 있습니다.

**공지사항**
- EVKMC 공식 안내·업데이트

**커뮤니티**
- 현장 질문·정비 팁·사례 공유
- **글 작성**: Silver Label 이상
- **댓글**: Blue Label 이상
- 카테고리: 질문 · 정비팁 · 문제해결 · 자료공유

등록되지 않은 계정은 게시판 열람이 제한될 수 있습니다. 유용한 현장 정보를 공유해 주시면 감사하겠습니다.$$,
    '업데이트',
    false,
    '2025-12-05 10:11:00+09'::timestamptz
);

-- N08: 2026-01-08 PDF 모바일
INSERT INTO notices (title, content, category, is_pinned, created_at)
VALUES (
    '모바일에서 PDF 보는 방법',
    $$모바일 브라우저는 보안상 PDF를 화면 안(iframe)에 바로 띄우지 않는 경우가 많습니다.

**권장 방법**
1. **새 창에서 열기** — 브라우저 또는 PDF 뷰어로 열림
2. **PDF 다운로드** — 저장 후 **파일** 앱에서 열기 (Wi‑Fi가 약할 때 유용)

**PC**
- 데스크톱에서는 포털 내 PDF 뷰어로 바로 열람할 수 있습니다.

**메뉴가 보이지 않을 때**
- 계정 **등급(Blue / Silver / Black)** 또는 미등록 계정일 수 있습니다. 관리자에게 문의하세요.$$,
    '공지',
    false,
    '2026-01-08 13:27:00+09'::timestamptz
);

-- N09: 2026-02-14 MASADA QQ (고정)
INSERT INTO notices (title, content, category, is_pinned, created_at)
VALUES (
    'MASADA QQ 정비지침서 등록',
    $$**MASADA QQ** 차종 정비지침서가 포털에 등록되었습니다.

**열기 방법**
1. 메뉴 **정비지침서** 이동
2. 상단 **차종**에서 **MASADA QQ** 선택
3. 목차에서 챕터(서문·VCU·배터리 등) 선택

**구성**
- 챕터별 PDF 1파일 = 목차 1항목 (총 36개 챕터)
- 32장(보닛 및 도어) PDF는 현재 미제공입니다.

**모바일**
- **새 창에서 열기** 또는 **다운로드** 후 파일 앱에서 열어 주세요.

**바로가기**
- `#/shop?model=masada-qq` — QQ 정비지침서로 이동$$,
    '업데이트',
    true,
    '2026-02-14 10:38:00+09'::timestamptz
);

-- N10: 2026-02-25 보안서약서 (고정)
INSERT INTO notices (title, content, category, is_pinned, created_at)
VALUES (
    '보안서약서 동의 절차 안내',
    $$기술문서 열람 전 **보안서약서** 동의가 필요합니다.

**절차**
1. 최초 로그인(또는 갱신 시) 보안서약서 화면 표시
2. **항목별** 내용 확인 후 동의
3. 전체 동의 완료 후 포털 이용

**유의**
- 동의하지 않으면 기술문서 메뉴 이용이 제한됩니다.
- 모바일에서도 동일하게 적용됩니다.

문의는 관리자에게 연락해 주세요.$$,
    '중요',
    true,
    '2026-02-25 16:45:00+09'::timestamptz
);

-- N11: 2026-03-09 차량 보증
INSERT INTO notices (title, content, category, is_pinned, created_at)
VALUES (
    '차량 보증 조회 기능 안내',
    $$**차량 보증** 메뉴에서 보증 여부를 조회할 수 있습니다.

**이용 방법**
1. 로그인 후 **차량 보증** 메뉴 선택
2. **VIN** 입력 또는 **CSV 일괄** 업로드 (권한에 따라 제공)
3. 조회 결과 확인

**안내**
- 데이터는 EVKMC 보증 시스템 기준이며, 현장 판단은 공식 절차와 함께 확인해 주세요.
- 조회 오류 시 VIN 형식·네트워크를 확인한 뒤 관리자에게 문의하세요.$$,
    '업데이트',
    false,
    '2026-03-09 09:52:00+09'::timestamptz
);

-- N12: 2026-05-19 모바일·PWA (고정)
INSERT INTO notices (title, content, category, is_pinned, created_at)
VALUES (
    '모바일·PWA 대규모 업데이트',
    $$현장·모바일 환경 이용 편의를 대폭 개선했습니다.

**하단 탭 메뉴**
- 홈 · 정비지침서 · 차량 보증 · 내 정보를 빠르게 이동

**정비지침서 (모바일)**
- **목차** 버튼 → 챕터 목록(하단 시트)
- **전체 화면 뷰어** · **목록으로** 복귀
- **MASADA QQ**: 이전/다음 챕터, 넓은 터치 영역

**홈 화면에 추가(PWA)**
- 로그인 화면 **홈 화면에 추가** 타일 또는 헤더 **앱 설치**
- Android: 설치 안내 / iOS: Safari **공유 → 홈 화면에 추가**
- 설치 후 주소창 없이 앱처럼 실행 (오프라인 PDF 저장은 지원하지 않음)

**이어서 보기**
- 홈 **이어서 보기** 카드로 마지막 본 문서 바로 열기

보안서약서 모바일 화면도 함께 개선되었습니다. 문의는 관리자에게 연락해 주세요.$$,
    '중요',
    true,
    '2026-05-19 11:19:00+09'::timestamptz
);

-- ============================================
-- 커뮤니티 C01 ~ C06
-- ============================================

-- C01
INSERT INTO community_posts (title, content, category, author_name, author_affiliation, tags, views, created_at)
VALUES (
    '커뮤니티와 공지사항 차이 / 등급별 작성 권한',
    $$**공지사항** — EVKMC 공식 안내 (운영팀 작성)

**커뮤니티** — 정비사·협력사 간 질문·팁 공유

**작성 권한**
- 글 작성: **Silver Label** 이상
- 댓글: **Blue Label** 이상

게시판은 **등록된 계정**만 열람할 수 있습니다. 계정·등급 문의는 관리자에게 연락해 주세요.$$,
    '질문',
    'EVKMC A/S',
    '운영팀',
    ARRAY['커뮤니티', '등급']::text[],
    24,
    '2025-10-14 15:41:00+09'::timestamptz
);

-- C02
INSERT INTO community_posts (title, content, category, author_name, author_affiliation, tags, views, created_at)
VALUES (
    '와이어링 커넥터 메뉴 찾는 방법',
    $$와이어링 커넥터 이미지는 **전장회로도** 메뉴에 있습니다.

1. **전장회로도** 선택
2. **차종** 선택
3. 목차에서 **와이어링 커넥터** (또는 유사 항목명) 선택

이미지에 워터마크가 표시됩니다. 촬영·외부 공유는 금지입니다.$$,
    '정비팁',
    'EVKMC A/S',
    '운영팀',
    ARRAY['와이어링', 'ETM']::text[],
    31,
    '2025-12-12 11:28:00+09'::timestamptz
);

-- C03
INSERT INTO community_posts (title, content, category, author_name, author_affiliation, tags, views, created_at)
VALUES (
    'MASADA QQ 정비지침서 여는 방법',
    $$**MASADA QQ** 정비지침서 열기:

1. 로그인 → **정비지침서**
2. **차종** → **MASADA QQ**
3. 목차에서 챕터 선택
4. 모바일: **새 창에서 열기** 또는 **다운로드** 안내 따르기

**바로가기**: `#/shop?model=masada-qq`

32장(보닛 및 도어)은 아직 PDF가 없습니다.$$,
    '정비팁',
    'EVKMC A/S',
    '운영팀',
    ARRAY['MASADA-QQ', '정비지침서']::text[],
    42,
    '2026-02-18 14:56:00+09'::timestamptz
);

-- C04
INSERT INTO community_posts (title, content, category, author_name, author_affiliation, tags, views, created_at)
VALUES (
    '차량 보증 메뉴 사용법',
    $$**차량 보증** 조회 요약:

1. 하단 탭 또는 메뉴에서 **차량 보증**
2. **VIN** 입력 후 조회
3. (권한 있는 경우) CSV로 여러 대 일괄 조회

결과는 참고용이며, 최종 판단은 EVKMC 보증 절차를 따릅니다. 오류 시 VIN·네트워크 확인 후 관리자 문의.$$,
    '정비팁',
    'EVKMC A/S',
    '운영팀',
    ARRAY['보증', 'VIN']::text[],
    19,
    '2026-03-15 10:13:00+09'::timestamptz
);

-- C05
INSERT INTO community_posts (title, content, category, author_name, author_affiliation, tags, views, created_at)
VALUES (
    '홈 화면에 추가(앱처럼 쓰기)',
    $$현장에서 자주 쓰신다면 **홈 화면에 추가**를 권장합니다.

**로그인 화면**
- **홈 화면에 추가** 카드 탭

**Android**
- **앱 설치** / **탭하여 설치** 안내

**iOS**
- Safari **공유 → 홈 화면에 추가**

설치 후 아이콘으로 실행하면 주소창 없이 포털이 열립니다. (PDF 오프라인 저장은 되지 않습니다)$$,
    '정비팁',
    'EVKMC A/S',
    '운영팀',
    ARRAY['PWA', '설치']::text[],
    11,
    '2026-05-10 16:37:00+09'::timestamptz
);

-- C06
INSERT INTO community_posts (title, content, category, author_name, author_affiliation, tags, views, created_at)
VALUES (
    '모바일에서 PDF가 안 열릴 때',
    $$PDF가 화면에 안 뜨면 **모바일 브라우저 제한**인 경우가 많습니다.

1. **새 창에서 열기**
2. **PDF 다운로드** 후 파일 앱에서 열기
3. Wi‑Fi·데이터 확인
4. Chrome / Samsung Internet / Safari 시도

**PC**에서는 포털 안에서 바로 보입니다.

**QQ**는 5월 업데이트 이후 **이전/다음 챕터**, **이어서 보기**도 이용해 보세요.$$,
    '문제해결',
    'EVKMC A/S',
    '운영팀',
    ARRAY['PDF', '모바일']::text[],
    27,
    '2026-05-18 09:24:00+09'::timestamptz
);

-- 확인
SELECT 'notices' AS tbl, COUNT(*) AS cnt FROM notices
UNION ALL
SELECT 'community_posts', COUNT(*) FROM community_posts;

SELECT id, title, category, is_pinned, created_at
FROM notices
ORDER BY is_pinned DESC, created_at DESC;

SELECT id, title, category, tags, views, created_at
FROM community_posts
ORDER BY created_at DESC;
