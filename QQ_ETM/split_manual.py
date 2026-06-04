# -*- coding: utf-8 -*-
"""MASADA QQ 2Van 전장 회로도 매뉴얼 분할 스크립트.

목차(인쇄 페이지 = PDF 페이지 - 2) 기준으로 대분류 8개 챕터를 분할하되,
'차량 개략도(08)'는 14개 서브시스템 회로도로 세분화한다.
"""
import os
import re
from pypdf import PdfReader, PdfWriter

SRC = r"D:\GSW\QQ_ETM\[수정본 1027]EN-KO_JH11 EV （电路图）Electrical Wiring Diagram20220228_전장회로도.pdf"
OUT_DIR = r"D:\GSW\QQ_ETM\split"

# (출력 파일명 prefix, 제목, 시작 PDF 페이지, 끝 PDF 페이지)  -- 1-based, inclusive
SECTIONS = [
    ("00", "표지·개정·목차·사양표", 1, 7),
    ("01", "본 매뉴얼 사용법", 8, 12),
    ("02", "문제해결", 13, 15),
    ("03", "퓨즈 및 릴레이 정보", 16, 20),
    ("04", "배전", 21, 24),
    ("05", "제어 모듈 위치 및 단자 정의", 25, 29),
    ("06", "접지 지점 배치도", 30, 35),
    ("07", "와이어 하니스 위치도", 36, 55),
    # 08 차량 개략도 — 14개 서브시스템 세분화
    ("08-01", "고전압 전원 공급장치 시스템", 56, 56),
    ("08-02", "고전압 인터록 시스템·시동 스위치", 57, 57),
    ("08-03", "전원 시동·Three-in-one·완속 충전·전원 배터리(BMS) 시스템", 58, 58),
    ("08-04", "백업 전원·EPS 시스템·ETC·USB", 59, 59),
    ("08-05", "모터 컨트롤러(MCU)·구동 모터·컴프레서 컨트롤러", 60, 60),
    ("08-06", "차량 컨트롤러(VCU)", 61, 62),
    ("08-07", "ABS 시스템", 63, 63),
    ("08-08", "BCM", 64, 73),
    ("08-09", "A/C 시스템", 74, 74),
    ("08-10", "계기판·보행자 알림", 75, 75),
    ("08-11", "멀티미디어 시스템·T-박스", 76, 76),
    ("08-12", "에어백 시스템", 77, 77),
    ("08-13", "후진 레이더 시스템·진단 인터페이스", 78, 78),
    ("08-14", "네트워크 토폴로지 다이어그램", 79, 80),
]


def sanitize(name: str) -> str:
    # 파일명에 쓸 수 없는 문자 치환
    return re.sub(r'[\\/:*?"<>|]', "_", name)


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    reader = PdfReader(SRC)
    total = len(reader.pages)
    print(f"원본 페이지 수: {total}")

    made = []
    for prefix, title, start, end in SECTIONS:
        if start > total:
            print(f"[건너뜀] {prefix} {title}: 시작 {start} > 총 {total}")
            continue
        end = min(end, total)
        writer = PdfWriter()
        for p in range(start - 1, end):  # 0-based
            writer.add_page(reader.pages[p])
        fname = f"{prefix}_{sanitize(title)}.pdf"
        fpath = os.path.join(OUT_DIR, fname)
        with open(fpath, "wb") as f:
            writer.write(f)
        made.append((fname, end - start + 1, start, end))
        print(f"생성: {fname}  ({end - start + 1}p, PDF {start}-{end})")

    covered = sum(n for _, n, _, _ in made)
    print(f"\n파일 {len(made)}개 생성, 커버 페이지 합계 {covered}/{total}")


if __name__ == "__main__":
    main()
