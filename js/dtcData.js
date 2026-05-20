/**
 * DTC 코드 데이터 (자동 생성 — 수정하지 마세요)
 * 생성: 2026-05-20T03:24:31.940Z
 * 원본: data/source/DTC코드.xlsx
 * 건수: 114
 *
 * 재생성: npm run build:dtc
 */

/** @type {import('./dtcMapping.js').DtcEntry[]} */
export const DTC_ENTRIES = [
  {
    "code": "420",
    "codeDisplay": "E-0420",
    "title": "모터 과속 오류",
    "causes": [
      {
        "cause": "모터 리졸버 오류",
        "action": "리졸버 하니스 연결 확인 > 일시적인 장애, (-)단자 탈거후 재시동요망"
      },
      {
        "cause": "모터 컨트롤러 고장",
        "action": "차량을 재시동하고 해결되지 않으면 모터 컨트롤러 교체"
      }
    ]
  },
  {
    "code": "421",
    "codeDisplay": "E-0421",
    "title": "모터 스톨 고장",
    "causes": [
      {
        "cause": "—",
        "action": "—"
      }
    ]
  },
  {
    "code": "422",
    "codeDisplay": "E-0422",
    "title": "모터 과열 오류",
    "causes": [
      {
        "cause": "—",
        "action": "—"
      }
    ]
  },
  {
    "code": "423",
    "codeDisplay": "E-0423",
    "title": "모터 과열 오류",
    "causes": [
      {
        "cause": "냉각 팬 고장",
        "action": "워터 펌프와 팬의 배선 하니스 연결 상태가 양호한지 확인"
      },
      {
        "cause": "냉각수 펌프 고장",
        "action": "워터 펌프 또는 팬 교체"
      },
      {
        "cause": "냉각수 라인 막힘",
        "action": "냉각수 회로가 막히지 않았는지 확인 > -10도 냉간시 온도오류풀로 2.0V"
      },
      {
        "cause": "차량 컨트롤러 고장",
        "action": "차량 컨트롤러 교체"
      }
    ]
  },
  {
    "code": "425",
    "codeDisplay": "E-0425",
    "title": "모터 컨트롤러 고장",
    "causes": [
      {
        "cause": "모터 컨트롤러 고장",
        "action": "모터 컨트롤러 교체 > MCU 펌웨어 업데이트 혹은 교체"
      }
    ]
  },
  {
    "code": "426",
    "codeDisplay": "E-0426",
    "title": "모터 과전류 오류",
    "causes": [
      {
        "cause": "—",
        "action": "—"
      }
    ]
  },
  {
    "code": "427",
    "codeDisplay": "E-0427",
    "title": "DTC E-0427",
    "causes": [
      {
        "cause": "—",
        "action": "—"
      }
    ]
  },
  {
    "code": "428",
    "codeDisplay": "E-0428",
    "title": "모터 컨트롤러 하드웨어 오류",
    "causes": [
      {
        "cause": "—",
        "action": "—"
      }
    ]
  },
  {
    "code": "429",
    "codeDisplay": "E-0429",
    "title": "모터 컨트롤러 하드웨어 오류",
    "causes": [
      {
        "cause": "모터 컨트롤러 하드웨어 오류",
        "action": "모터 컨트롤러 교체"
      }
    ]
  },
  {
    "code": "430",
    "codeDisplay": "E-0430",
    "title": "접지에 대한 모터의 AC 측 단락",
    "causes": [
      {
        "cause": "—",
        "action": "—"
      }
    ]
  },
  {
    "code": "431",
    "codeDisplay": "E-0431",
    "title": "DTC E-0431",
    "causes": [
      {
        "cause": "—",
        "action": "—"
      }
    ]
  },
  {
    "code": "432",
    "codeDisplay": "E-0432",
    "title": "모터 컨트롤러 과열 오류",
    "causes": [
      {
        "cause": "—",
        "action": "—"
      }
    ]
  },
  {
    "code": "433",
    "codeDisplay": "E-0433",
    "title": "DTC E-0433",
    "causes": [
      {
        "cause": "—",
        "action": "—"
      }
    ]
  },
  {
    "code": "434",
    "codeDisplay": "E-0434",
    "title": "DTC E-0434",
    "causes": [
      {
        "cause": "—",
        "action": "—"
      }
    ]
  },
  {
    "code": "435",
    "codeDisplay": "E-0435",
    "title": "모터 컨트롤러 IGBT 모듈 오류",
    "causes": [
      {
        "cause": "모터 컨트롤러 IGBT 모듈 오류",
        "action": "전원을 끄고 다시 시작하고, 그럼에도 오류 코드가 사라지지 않으면 모터 컨트롤러를 교체 > 리졸버센서 커넥터 점검, MCU 교체"
      }
    ]
  },
  {
    "code": "436",
    "codeDisplay": "E-0436",
    "title": "모터 컨트롤러 IGBT 과열 오류",
    "causes": [
      {
        "cause": "DCDC 과열, 냉각 팬 고장",
        "action": "워터 펌프와 팬의 배선 하니스 연결 상태가 양호한지 확인"
      },
      {
        "cause": "냉각수 펌프 고장",
        "action": "워터 펌프 또는 팬 교체 > 모터온도 135℃출력제한, 150℃시스템다운"
      },
      {
        "cause": "냉각수 라인 막힘",
        "action": "냉각수 회로가 막히지 않았는지 확인"
      },
      {
        "cause": "차량 컨트롤러 고장",
        "action": "차량 컨트롤러 교체"
      }
    ]
  },
  {
    "code": "437",
    "codeDisplay": "E-0437",
    "title": "모터 컨트롤러 고장",
    "causes": [
      {
        "cause": "모터 컨트롤러 고장",
        "action": "모터 컨트롤러 교체, DCDC 교체"
      }
    ]
  },
  {
    "code": "438",
    "codeDisplay": "E-0438",
    "title": "모터 컨트롤러 IGBT 과전류 오류",
    "causes": [
      {
        "cause": "—",
        "action": "—"
      }
    ]
  },
  {
    "code": "439",
    "codeDisplay": "E-0439",
    "title": "모터 컨트롤러 IGBT 과전류 오류",
    "causes": [
      {
        "cause": "전력선 단락",
        "action": "모터 및 모터 컨트롤러의 전원 배선 확인"
      },
      {
        "cause": "전류 센서 고장",
        "action": "모터 컨트롤러 교체"
      }
    ]
  },
  {
    "code": "440",
    "codeDisplay": "E-0440",
    "title": "모터 컨트롤러 버스 저전압 오류",
    "causes": [
      {
        "cause": "전원 배터리 전압이 너무 낮음",
        "action": "전원 배터리 충전"
      },
      {
        "cause": "모터 컨트롤러 고전압 입력 하니스 플러그가 느슨함",
        "action": "플러그를 확인하고 플러그에 문제가 없으면 플러그를 조이고 플러그에 문제가 있으면 배선 하니스를 교체"
      },
      {
        "cause": "프리차지 회로 고장",
        "action": "사전 충전 저항 또는 사전 충전 접촉기를 교체 > 충전건, 충전기 오류"
      }
    ]
  },
  {
    "code": "441",
    "codeDisplay": "E-0441",
    "title": "모터 컨트롤러 버스 저전압 오류",
    "causes": [
      {
        "cause": "전원 배터리 전압이 너무 낮음",
        "action": "전원 배터리 충전"
      },
      {
        "cause": "모터 컨트롤러 고전압 입력 하니스 플러그가 느슨함",
        "action": "플러그를 확인하고 플러그에 문제가 없으면 플러그를 조이고 플러그에 문제가 있으면 배선 하니스를 교체"
      }
    ]
  },
  {
    "code": "442",
    "codeDisplay": "E-0442",
    "title": "모터 컨트롤러 IGBT 온도 센서 오류",
    "causes": [
      {
        "cause": "모터 컨트롤러 IGBT 온도 센서 오류",
        "action": "모터 컨트롤러 교체"
      }
    ]
  },
  {
    "code": "443",
    "codeDisplay": "E-0443",
    "title": "모터 온도 센서 고장",
    "causes": [
      {
        "cause": "모터 온도 센서 배선 하니스 결함",
        "action": "라인 수리"
      },
      {
        "cause": "모터 온도 센서 고장",
        "action": ""
      },
      {
        "cause": "",
        "action": "모터 교체"
      }
    ]
  },
  {
    "code": "444",
    "codeDisplay": "E-0444",
    "title": "모터 컨트롤러 온도 센서 고장",
    "causes": [
      {
        "cause": "—",
        "action": "—"
      }
    ]
  },
  {
    "code": "445",
    "codeDisplay": "E-0445",
    "title": "모터 컨트롤러 버스 전압 센서 오류",
    "causes": [
      {
        "cause": "—",
        "action": "—"
      }
    ]
  },
  {
    "code": "446",
    "codeDisplay": "E-0446",
    "title": "모터 컨트롤러 버스 전류 센서 오류",
    "causes": [
      {
        "cause": "—",
        "action": "—"
      }
    ]
  },
  {
    "code": "447",
    "codeDisplay": "E-0447",
    "title": "모터 컨트롤러 버스 전류 센서 고장",
    "causes": [
      {
        "cause": "—",
        "action": "—"
      }
    ]
  },
  {
    "code": "448",
    "codeDisplay": "E-0448",
    "title": "모터 리졸버 오류",
    "causes": [
      {
        "cause": "모터 리졸버 배선 하니스 결함",
        "action": "라인 수리 > 리졸버 케이블 수리"
      },
      {
        "cause": "모터 리졸버 오류",
        "action": "모터 교체"
      },
      {
        "cause": "모터 컨트롤러 고장",
        "action": "모터 컨트롤러 교체"
      }
    ]
  },
  {
    "code": "449",
    "codeDisplay": "E-0449",
    "title": "모터 단선 오류",
    "causes": [
      {
        "cause": "—",
        "action": "—"
      }
    ]
  },
  {
    "code": "450",
    "codeDisplay": "E-0450",
    "title": "DTC E-0450",
    "causes": [
      {
        "cause": "—",
        "action": "—"
      }
    ]
  },
  {
    "code": "451",
    "codeDisplay": "E-0451",
    "title": "모터 컨트롤러 CAN 오류",
    "causes": [
      {
        "cause": "VCU 오류",
        "action": "VCU 교체"
      },
      {
        "cause": "통신 하네스 오류",
        "action": "배선 하니스 고장 수리"
      },
      {
        "cause": "모터 컨트롤러 고장",
        "action": "모터 컨트롤러 변경"
      }
    ]
  },
  {
    "code": "452",
    "codeDisplay": "E-0452",
    "title": "홀 센서 고장",
    "causes": [
      {
        "cause": "홀 센서 고장",
        "action": "홀 센서 교체"
      }
    ]
  },
  {
    "code": "453",
    "codeDisplay": "E-0453",
    "title": "활성 방전 오류",
    "causes": [
      {
        "cause": "모터 컨트롤러 고장",
        "action": "모터 컨트롤러 교체"
      }
    ]
  },
  {
    "code": "454",
    "codeDisplay": "E-0454",
    "title": "출력 위상 오류",
    "causes": [
      {
        "cause": "3상 라인 플러그인의 접촉 불량",
        "action": "3상 전선 커넥터 확인"
      }
    ]
  },
  {
    "code": "455",
    "codeDisplay": "E-0455",
    "title": "모터 컨트롤러 버스 과전압 오류",
    "causes": [
      {
        "cause": "—",
        "action": "—"
      }
    ]
  },
  {
    "code": "456",
    "codeDisplay": "E-0456",
    "title": "전류 감지 실패",
    "causes": [
      {
        "cause": "—",
        "action": "—"
      }
    ]
  },
  {
    "code": "457",
    "codeDisplay": "E-0457",
    "title": "저전압 부족 전압 오류",
    "causes": [
      {
        "cause": "",
        "action": "12V 배터리 리셋, DCDC 교체"
      }
    ]
  },
  {
    "code": "458",
    "codeDisplay": "E-0458",
    "title": "컨트롤러 과부하 오류",
    "causes": [
      {
        "cause": "—",
        "action": "—"
      }
    ]
  },
  {
    "code": "520",
    "codeDisplay": "E-0520",
    "title": "절연 불량",
    "causes": [
      {
        "cause": "하네스 단락",
        "action": "전원 하니스를 확인하거나 하니스를 교체 , 배터리팩 누액"
      }
    ]
  },
  {
    "code": "521",
    "codeDisplay": "E-0521",
    "title": "배터리 박스 또는 고전압 박스에 물이 들어가 절연 손상 (수분유입)",
    "causes": [
      {
        "cause": "배터리 박스 또는 고전압 박스에 물이 들어가 절연 손상 (수분유입)",
        "action": "절연 펌웨어 또는 고압선 점검 및 교체, 전원 차단 후 물 제거"
      }
    ]
  },
  {
    "code": "522",
    "codeDisplay": "E-0522",
    "title": "사전 충전 실패",
    "causes": [
      {
        "cause": "손상된 프리차지 저항",
        "action": "프리차지 저항 교체"
      },
      {
        "cause": "손상된 프리차지 릴레이",
        "action": "프리차지 릴레이 교체"
      },
      {
        "cause": "배터리 전원 장치 고장",
        "action": "전원 하니스와 커넥터가 제대로 꽂혀 있는지 확인"
      }
    ]
  },
  {
    "code": "523",
    "codeDisplay": "E-0523",
    "title": "총 포지티브 접촉기 고장",
    "causes": [
      {
        "cause": "총 포지티브 접촉기 손상됨",
        "action": "메인 포지티브 컨택터 교체"
      }
    ]
  },
  {
    "code": "524",
    "codeDisplay": "E-0524",
    "title": "총 네거티브 접촉기 고장",
    "causes": [
      {
        "cause": "총 네거티브의 접촉기 손상됨",
        "action": "메인 포지티브 컨택터 교체"
      }
    ]
  },
  {
    "code": "525",
    "codeDisplay": "E-0525",
    "title": "사전 충전 접촉기 오류",
    "causes": [
      {
        "cause": "손상된 사전 충전 접촉기",
        "action": "프리차지 컨택터 교체"
      }
    ]
  },
  {
    "code": "526",
    "codeDisplay": "E-0526",
    "title": "충전기 접촉기 결함",
    "causes": [
      {
        "cause": "손상된 충전기 접촉기",
        "action": "충전기 컨택터 교체 > BMS 릴레이 작동오류"
      }
    ]
  },
  {
    "code": "527",
    "codeDisplay": "E-0527",
    "title": "저온 결함",
    "causes": [
      {
        "cause": "주변 온도가 너무 낮음",
        "action": "온도 범위 내의 환경으로 차를 이동"
      }
    ]
  },
  {
    "code": "528",
    "codeDisplay": "E-0528",
    "title": "온도 센서 고장",
    "causes": [
      {
        "cause": "온도 센서 고장",
        "action": "전문 수리 또는 배터리 상자 교체 필요"
      }
    ]
  },
  {
    "code": "529",
    "codeDisplay": "E-0529",
    "title": "DTC E-0529",
    "causes": [
      {
        "cause": "—",
        "action": "—"
      }
    ]
  },
  {
    "code": "530",
    "codeDisplay": "E-0530",
    "title": "과열 결함",
    "causes": [
      {
        "cause": "주변 온도가 너무 높고 작동 시간이 너무 지속됨",
        "action": "그늘진 곳에 주차"
      }
    ]
  },
  {
    "code": "531",
    "codeDisplay": "E-0531",
    "title": "온도 센서 고장",
    "causes": [
      {
        "cause": "온도 센서 고장",
        "action": "과도한 전압, 전류 등 사용 중 배터리 전압 및 전류가 정상인지 확인"
      }
    ]
  },
  {
    "code": "532",
    "codeDisplay": "E-0532",
    "title": "배터리 고장",
    "causes": [
      {
        "cause": "배터리 고장",
        "action": "관련 전기 부품을 확인하거나 배터리 상자를 교체"
      }
    ]
  },
  {
    "code": "533",
    "codeDisplay": "E-0533",
    "title": "온도차 결함",
    "causes": [
      {
        "cause": "고출력 실행 시간이 너무 지속됨",
        "action": "일정 시간 동안 작업을 중지한 다음 다시 전원을 가동"
      }
    ]
  },
  {
    "code": "534",
    "codeDisplay": "E-0534",
    "title": "손상된 배터리",
    "causes": [
      {
        "cause": "손상된 배터리",
        "action": "제 시간에 유지 관리를 위해 전문가에게 문의"
      }
    ]
  },
  {
    "code": "535",
    "codeDisplay": "E-0535",
    "title": "충전 과전류 오류",
    "causes": [
      {
        "cause": "손상된 충전기",
        "action": "유지보수 장비 > BMS 교체, 계기판 충전전류 -25A~ -35A"
      }
    ]
  },
  {
    "code": "536",
    "codeDisplay": "E-0536",
    "title": "배터리 팩 단락",
    "causes": [
      {
        "cause": "배터리 팩 단락",
        "action": "배선 확인"
      }
    ]
  },
  {
    "code": "537",
    "codeDisplay": "E-0537",
    "title": "DTC E-0537",
    "causes": [
      {
        "cause": "",
        "action": "(운행불가),"
      }
    ]
  },
  {
    "code": "538",
    "codeDisplay": "E-0538",
    "title": "방전 과전류 오류",
    "causes": [
      {
        "cause": "배터리 관리 시스템 매개변수 설정이 비합리적",
        "action": "전문가에게 문의"
      }
    ]
  },
  {
    "code": "539",
    "codeDisplay": "E-0539",
    "title": "DTC E-0539",
    "causes": [
      {
        "cause": "—",
        "action": "—"
      }
    ]
  },
  {
    "code": "540",
    "codeDisplay": "E-0540",
    "title": "DTC E-0540",
    "causes": [
      {
        "cause": "—",
        "action": "—"
      }
    ]
  },
  {
    "code": "541",
    "codeDisplay": "E-0541",
    "title": "셀 전압차 오류",
    "causes": [
      {
        "cause": "배터리 충전 및 방전 불균일",
        "action": "즉시 충전을 중지하고 배터리 팩이 자동으로 전압을 균등화할 때까지 기다림 > 메인 배터리 교체"
      }
    ]
  },
  {
    "code": "542",
    "codeDisplay": "E-0542",
    "title": "셀 전압차 오류",
    "causes": [
      {
        "cause": "배터리 충전 및 방전 불균일",
        "action": "배터리 팩이 자동으로 전압을 균등화할 때까지 기다림"
      },
      {
        "cause": "손상된 셀",
        "action": "전문가에게 문의"
      }
    ]
  },
  {
    "code": "543",
    "codeDisplay": "E-0543",
    "title": "셀 전압차 고장",
    "causes": [
      {
        "cause": "셀 전압차 오류",
        "action": "메인 배터리 교체"
      }
    ]
  },
  {
    "code": "544",
    "codeDisplay": "E-0544",
    "title": "DTC E-0544",
    "causes": [
      {
        "cause": "—",
        "action": "—"
      }
    ]
  },
  {
    "code": "545",
    "codeDisplay": "E-0545",
    "title": "배터리 팩 과전압 오류",
    "causes": [
      {
        "cause": "배터리 관리 시스템 오류",
        "action": "전문가에게 문의"
      }
    ]
  },
  {
    "code": "546",
    "codeDisplay": "E-0546",
    "title": "배터리 팩 저전압 오류",
    "causes": [
      {
        "cause": "과방전",
        "action": "충전"
      }
    ]
  },
  {
    "code": "548",
    "codeDisplay": "E-0548",
    "title": "도터 보드 CAN 통신 실패 (BMS)",
    "causes": [
      {
        "cause": "라인 실패",
        "action": "유지 보수 라인 > BMS, 12V 배터리"
      },
      {
        "cause": "손상된 커넥터",
        "action": "커넥터 확인 및 교체"
      },
      {
        "cause": "도터 보드 손상됨",
        "action": "도터 보드 교체"
      }
    ]
  },
  {
    "code": "549",
    "codeDisplay": "E-0549",
    "title": "충전기와의 CAN 통신 실패",
    "causes": [
      {
        "cause": "라인 실패",
        "action": "유지 보수 라인 > BMS, 12V 배터리"
      },
      {
        "cause": "손상된 커넥터",
        "action": "커넥터 확인 및 교체, 충전잭 손상"
      },
      {
        "cause": "손상된 충전기",
        "action": "충전기 교체 > BMS 수분유입 / 커넥터영향"
      }
    ]
  },
  {
    "code": "550",
    "codeDisplay": "E-0550",
    "title": "배터리 냉각 시스템 오류",
    "causes": [
      {
        "cause": "—",
        "action": "—"
      }
    ]
  },
  {
    "code": "551",
    "codeDisplay": "E-0551",
    "title": "배터리 가열 시스템 오류",
    "causes": [
      {
        "cause": "—",
        "action": "—"
      }
    ]
  },
  {
    "code": "552",
    "codeDisplay": "E-0552",
    "title": "단일 전압 센서 고장",
    "causes": [
      {
        "cause": "—",
        "action": "—"
      }
    ]
  },
  {
    "code": "553",
    "codeDisplay": "E-0553",
    "title": "전류 센서 고장",
    "causes": [
      {
        "cause": "라인 실패",
        "action": "유지 보수 라인"
      },
      {
        "cause": "손상된 전류 센서",
        "action": "전류 센서 확인 및 교체"
      }
    ]
  },
  {
    "code": "554",
    "codeDisplay": "E-0554",
    "title": "온도 센서 고장",
    "causes": [
      {
        "cause": "라인 실패",
        "action": "유지 보수 라인"
      },
      {
        "cause": "온도 센서 손상",
        "action": "온도 센서 점검 및 교체"
      }
    ]
  },
  {
    "code": "555",
    "codeDisplay": "E-0555",
    "title": "총 전압 센서 고장",
    "causes": [
      {
        "cause": "—",
        "action": "—"
      }
    ]
  },
  {
    "code": "556",
    "codeDisplay": "E-0556",
    "title": "습도 센서 고장",
    "causes": [
      {
        "cause": "—",
        "action": "—"
      }
    ]
  },
  {
    "code": "557",
    "codeDisplay": "E-0557",
    "title": "고전압 인터록 고장",
    "causes": [
      {
        "cause": "수리 스위치 접촉 불량 또는 화상",
        "action": "유지보수 스위치의 접촉 불량 확인"
      },
      {
        "cause": "",
        "action": "서비스 스위치 교체"
      }
    ]
  },
  {
    "code": "558",
    "codeDisplay": "E-0558",
    "title": "배터리 팩 커버 스위치",
    "causes": [
      {
        "cause": "—",
        "action": "—"
      }
    ]
  },
  {
    "code": "559",
    "codeDisplay": "E-0559",
    "title": "VCU와의 통신 실패",
    "causes": [
      {
        "cause": "차량 컨트롤러 고장",
        "action": "차량 컨트롤러 교체 > 12V 배터리 전압확인 (과방전)"
      },
      {
        "cause": "CAN 라인 고장, BMS 수분유입",
        "action": "CAN 와이어 확인 또는 배선 하니스 교체"
      },
      {
        "cause": "배터리 통신 모듈이 손상",
        "action": "배터리 통신 모듈 교체"
      }
    ]
  },
  {
    "code": "564",
    "codeDisplay": "E-0564",
    "title": "가열 접촉기 결함",
    "causes": [
      {
        "cause": "손상된 가열 접촉기",
        "action": "접촉기를 교체하십시오"
      }
    ]
  },
  {
    "code": "565",
    "codeDisplay": "E-0565",
    "title": "배터리 시스템 열 폭주 오류",
    "causes": [
      {
        "cause": "배터리가 화재의 위험이 있음",
        "action": "즉시 차에서 내려 전문가에게 문의"
      }
    ]
  },
  {
    "code": "620",
    "codeDisplay": "E-0620",
    "title": "OBC 하드웨어 오류",
    "causes": [
      {
        "cause": "손상된 충전기",
        "action": "차량 장착 충전기 교체"
      }
    ]
  },
  {
    "code": "621",
    "codeDisplay": "E-0621",
    "title": "OBC 온도 오류",
    "causes": [
      {
        "cause": "너무 오랫동안 충전 시도됨",
        "action": "충전 중지"
      },
      {
        "cause": "손상된 냉각 팬",
        "action": "차량 장착 충전기 교체"
      }
    ]
  },
  {
    "code": "622",
    "codeDisplay": "E-0622",
    "title": "OBC 입력 전압 오류",
    "causes": [
      {
        "cause": "충전 플러그가 제대로 꽂혀 있지 않거나 손상",
        "action": "충전 플러그 확인 및 교체"
      },
      {
        "cause": "손상된 충전 라인",
        "action": "충전 케이블 교체"
      }
    ]
  },
  {
    "code": "624",
    "codeDisplay": "E-0624",
    "title": "OBC 통신 상태",
    "causes": [
      {
        "cause": "커넥터 접촉 불량",
        "action": "커넥터 확인, 커넥터 교체"
      },
      {
        "cause": "통신 도터 보드가 손상",
        "action": "차량 장착 충전기 교체"
      }
    ]
  },
  {
    "code": "625",
    "codeDisplay": "E-0625",
    "title": "충전 건/시트 과열",
    "causes": [
      {
        "cause": "충전 건 실패",
        "action": "배선 점검, 충전 건 또는 소켓 교체"
      }
    ]
  },
  {
    "code": "626",
    "codeDisplay": "E-0626",
    "title": "충전 소켓 불량",
    "causes": [
      {
        "cause": "충전 소켓 불량",
        "action": ""
      }
    ]
  },
  {
    "code": "627",
    "codeDisplay": "E-0627",
    "title": "인버터 하드웨어 고장",
    "causes": [
      {
        "cause": "인버터 손상",
        "action": "인버터 교체"
      }
    ]
  },
  {
    "code": "628",
    "codeDisplay": "E-0628",
    "title": "인버터 온도 오류",
    "causes": [
      {
        "cause": "냉각수가 없거나 보충되지 않음",
        "action": "냉각수 보충"
      },
      {
        "cause": "펌프 고장",
        "action": "워터펌프 점검 및 교체"
      }
    ]
  },
  {
    "code": "629",
    "codeDisplay": "E-0629",
    "title": "인버터 입력 전압 오류",
    "causes": [
      {
        "cause": "회선 접촉 불량",
        "action": "수리 하네스 확인"
      }
    ]
  },
  {
    "code": "720",
    "codeDisplay": "E-0720",
    "title": "가속 페달 신호 1이 상한을 초과함",
    "causes": [
      {
        "cause": "손상된 가속 페달",
        "action": "가속 페달을 교체"
      },
      {
        "cause": "배선 불량 또는 개방 회로",
        "action": "라인 수리"
      }
    ]
  },
  {
    "code": "721",
    "codeDisplay": "E-0721",
    "title": "가속 페달 신호 1이 하한을 초과함",
    "causes": [
      {
        "cause": "손상된 가속 페달",
        "action": "가속 페달을 교체"
      },
      {
        "cause": "배선 불량 또는 개방 회로",
        "action": "라인 수리"
      }
    ]
  },
  {
    "code": "722",
    "codeDisplay": "E-0722",
    "title": "가속 페달 신호 2가 상한을 초과함",
    "causes": [
      {
        "cause": "손상된 가속 페달",
        "action": "가속 페달을 교체"
      },
      {
        "cause": "배선 불량 또는 개방 회로",
        "action": "라인 수리"
      }
    ]
  },
  {
    "code": "723",
    "codeDisplay": "E-0723",
    "title": "가속 페달 신호 2가 하한을 초과함",
    "causes": [
      {
        "cause": "손상된 가속 페달",
        "action": "가속 페달을 교체하"
      },
      {
        "cause": "배선 불량 또는 개방 회로",
        "action": "라인 수리"
      }
    ]
  },
  {
    "code": "724",
    "codeDisplay": "E-0724",
    "title": "가속 페달 신호 확인 실패",
    "causes": [
      {
        "cause": "손상된 가속 페달",
        "action": "가속 페달을 교체"
      },
      {
        "cause": "배선 불량 또는 개방 회로",
        "action": "라인 수리"
      }
    ]
  },
  {
    "code": "725",
    "codeDisplay": "E-0725",
    "title": "진공 압력 센서 신호가 전원 공급 장치로 단락됨",
    "causes": [
      {
        "cause": "진공 압력 센서 신호가 전원 공급 장치로 단락됨",
        "action": "배선 수리 또는 진공 압력 센서 교체"
      }
    ]
  },
  {
    "code": "726",
    "codeDisplay": "E-0726",
    "title": "진공 압력 센서 신호가 하한을 초과함",
    "causes": [
      {
        "cause": "손상된 진공 압력 센서",
        "action": "진공 압력 센서 교체"
      },
      {
        "cause": "진공 압력 신호 라인의 접촉 불량 또는 단락",
        "action": "라인 수리"
      },
      {
        "cause": "진공 펌프 릴레이 고착",
        "action": ""
      },
      {
        "cause": "",
        "action": "진공 펌프 릴레이 교체"
      }
    ]
  },
  {
    "code": "727",
    "codeDisplay": "E-0727",
    "title": "진공 펌프 고장",
    "causes": [
      {
        "cause": "진공 펌프 고장",
        "action": "진공 펌프 교체 > 진공 펌프 릴레이, 진공 펌프 교체"
      },
      {
        "cause": "공기 누출",
        "action": "오버홀 공기 회로"
      }
    ]
  },
  {
    "code": "728",
    "codeDisplay": "E-0728",
    "title": "EPB 실패",
    "causes": [
      {
        "cause": "—",
        "action": "—"
      }
    ]
  },
  {
    "code": "729",
    "codeDisplay": "E-0729",
    "title": "EPS 하드웨어 오류",
    "causes": [
      {
        "cause": "EPS 하드웨어 오류",
        "action": "EPS 하드웨어 교체"
      },
      {
        "cause": "토크 센서 고장",
        "action": "토크 센서 교체"
      },
      {
        "cause": "파워 어시스트 모터 고장",
        "action": "부스터 모터 교체"
      },
      {
        "cause": "라인 실패",
        "action": "배선 하니스를 수리"
      }
    ]
  },
  {
    "code": "730",
    "codeDisplay": "E-0730",
    "title": "고전압의 우발적 단선",
    "causes": [
      {
        "cause": "고전압 배전함 퓨즈 끊어짐",
        "action": "고전압 배전함 퓨즈 교체"
      },
      {
        "cause": "메인 포지티브 또는 메인 네거티브 릴레이가 손상됨",
        "action": "메인 포지티브 또는 메인 네거티브 릴레이 교체"
      }
    ]
  },
  {
    "code": "731",
    "codeDisplay": "E-0731",
    "title": "모터 컨트롤러 정전",
    "causes": [
      {
        "cause": "모터 컨트롤러 하드웨어 오류",
        "action": "모터 컨트롤러 교체, BMS 커넥터 점검"
      },
      {
        "cause": "차량 컨트롤러 하드웨어 오류",
        "action": "차량 컨트롤러 교체"
      }
    ]
  },
  {
    "code": "732",
    "codeDisplay": "E-0732",
    "title": "BMS 활성화 드라이버 모듈 오류",
    "causes": [
      {
        "cause": "차량 컨트롤러 하드웨어 오류",
        "action": "차량 컨트롤러 교체"
      }
    ]
  },
  {
    "code": "733",
    "codeDisplay": "E-0733",
    "title": "진공 펌프 드라이브 모듈 오류",
    "causes": [
      {
        "cause": "차량 컨트롤러 하드웨어 오류",
        "action": "차량 컨트롤러 교체"
      }
    ]
  },
  {
    "code": "734",
    "codeDisplay": "E-0734",
    "title": "보조 배터리 전압이 낮음",
    "causes": [
      {
        "cause": "DC/DC가 작동하지 않음",
        "action": "DC/DC 입력 장치 확인"
      },
      {
        "cause": "DC/DC 하니스 오류",
        "action": "DC/DC 하니스를 확인"
      },
      {
        "cause": "DC/DC 장애",
        "action": "DC/DC 컨버터 교체"
      },
      {
        "cause": "보조 배터리가 손상됨",
        "action": "보조 배터리 교체"
      },
      {
        "cause": "보조 배터리 저전압",
        "action": "보조 배터리 충전"
      }
    ]
  },
  {
    "code": "735",
    "codeDisplay": "E-0735",
    "title": "물이 없는 워터 펌프",
    "causes": [
      {
        "cause": "냉각수가 없거나 보충되지 않음",
        "action": "냉각수 보충"
      }
    ]
  },
  {
    "code": "736",
    "codeDisplay": "E-0736",
    "title": "워터펌프 본체 고장",
    "causes": [
      {
        "cause": "펌프 고장",
        "action": "워터펌프 교체"
      }
    ]
  },
  {
    "code": "737",
    "codeDisplay": "E-0737",
    "title": "차량 작동 잠김(Lock)",
    "causes": [
      {
        "cause": "원격 모니터링 모듈 오류",
        "action": "원격 모니터링 모듈 교체"
      },
      {
        "cause": "차량 컨트롤러 고장",
        "action": "차량 컨트롤러 교체"
      },
      {
        "cause": "CAN 라인 고장",
        "action": "CAN 와이어 확인 또는 배선 하니스 교체"
      }
    ]
  },
  {
    "code": "738",
    "codeDisplay": "E-0738",
    "title": "DC/DC 장애",
    "causes": [
      {
        "cause": "DC/DC 하드웨어 오류",
        "action": "DC/DC 교체 > 워터펌프, 전동팬 계속 작동됨"
      }
    ]
  },
  {
    "code": "739",
    "codeDisplay": "E-0739",
    "title": "DC/DC 온도 오류",
    "causes": [
      {
        "cause": "DC/DC 하드웨어 오류",
        "action": "DC/DC 교체 > 완속충전 안됨"
      }
    ]
  },
  {
    "code": "740",
    "codeDisplay": "E-0740",
    "title": "메인 릴레이 고장",
    "causes": [
      {
        "cause": "—",
        "action": "—"
      }
    ]
  },
  {
    "code": "741",
    "codeDisplay": "E-0741",
    "title": "EBD 실패",
    "causes": [
      {
        "cause": "ABS 하드웨어 오류",
        "action": "ABS 교체"
      },
      {
        "cause": "라인 실패",
        "action": "배선 하니스를 수리"
      }
    ]
  },
  {
    "code": "742",
    "codeDisplay": "E-0742",
    "title": "ABS 고장",
    "causes": [
      {
        "cause": "ABS 하드웨어 오류",
        "action": "ABS 교체"
      },
      {
        "cause": "라인 실패",
        "action": "배선 하니스를 수리"
      }
    ]
  },
  {
    "code": "743",
    "codeDisplay": "E-0743",
    "title": "ABS와통신실패",
    "causes": [
      {
        "cause": "—",
        "action": "—"
      }
    ]
  },
  {
    "code": "744",
    "codeDisplay": "E-0744",
    "title": "고전압인터록고장",
    "causes": [
      {
        "cause": "—",
        "action": "—"
      }
    ]
  },
  {
    "code": "745",
    "codeDisplay": "E-0745",
    "title": "ESC 고장",
    "causes": [
      {
        "cause": "—",
        "action": "—"
      }
    ]
  }
];

export const DTC_META = {
  "builtAt": "2026-05-20T03:24:31.940Z",
  "source": "data/source/DTC코드.xlsx",
  "sheet": "DTC",
  "count": 114,
  "multiCauseCount": 35
};
