/**
 * DTC 코드 데이터 (자동 생성 — 수정하지 마세요)
 * 생성: 2026-05-20T05:11:00.604Z
 * 원본: DTC/dtc_data.json + DTC코드.xlsx(보조)
 * 건수: 114 (마이그레이션 109 + xlsx 보조 5)
 *
 * 재생성: npm run build:dtc
 */

/** @type {import('./dtcMapping.js').DtcEntry[]} */
export const DTC_ENTRIES = [
  {
    "code": "420",
    "codeDisplay": "E-0420",
    "title": "모터 컨트롤러(MCU) 이상",
    "category": "구동 시스템 (MCU & 모터)",
    "explanation": "모터 컨트롤러(MCU) 내부 이상이 발생한 경우 고장코드 E-0420이 표출된다.",
    "suspected_parts": [
      "모터 컨트롤러(MCU)"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "모터 컨트롤러(MCU)",
        "terminal_1": "웨이크업 릴레이 87 (11)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "접지선 (4)",
        "terminal_2": "차체 접지",
        "normal": "약 0V"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0420/image_1.jpg",
      "dtc/E-0420/image_2.jpg",
      "dtc/E-0420/image_3.jpg",
      "dtc/E-0420/image_4.jpg",
      "dtc/E-0420/image_5.jpg",
      "dtc/E-0420/image_6.jpg",
      "dtc/E-0420/image_7.jpg",
      "dtc/E-0420/image_8.jpg",
      "dtc/E-0420/image_9.jpg",
      "dtc/E-0420/image_10.jpg",
      "dtc/E-0420/image_11.png",
      "dtc/E-0420/image_12.png"
    ]
  },
  {
    "code": "421",
    "codeDisplay": "E-0421",
    "title": "모터 이상",
    "category": "구동 시스템 (MCU & 모터)",
    "explanation": "모터 이상이 발생한 경우 고장코드 E-0421이 표출된다.",
    "suspected_parts": [
      "모터 컨트롤러(MCU)",
      "● 모터 불량"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "모터 컨트롤러(MCU)",
        "terminal_1": "웨이크업 릴레이 87 (11)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "접지선 (4)",
        "terminal_2": "차체 접지",
        "normal": "약 0V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "모터 온도 센서 신호 (20)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "모터 온도 센서 접지선 (5)",
        "terminal_2": "차체 접지",
        "normal": "약 0V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "Sin+ 포지티브",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0421/image_1.jpg",
      "dtc/E-0421/image_2.jpg",
      "dtc/E-0421/image_3.jpg",
      "dtc/E-0421/image_4.jpg",
      "dtc/E-0421/image_5.jpg",
      "dtc/E-0421/image_6.jpg",
      "dtc/E-0421/image_7.jpg",
      "dtc/E-0421/image_8.jpg",
      "dtc/E-0421/image_9.jpg",
      "dtc/E-0421/image_10.jpg",
      "dtc/E-0421/image_11.jpg",
      "dtc/E-0421/image_12.jpg",
      "dtc/E-0421/image_13.jpg",
      "dtc/E-0421/image_14.png",
      "dtc/E-0421/image_15.png"
    ]
  },
  {
    "code": "422",
    "codeDisplay": "E-0422",
    "title": "모터 과열",
    "category": "구동 시스템 (MCU & 모터)",
    "explanation": "모터 과열이 발생한 경우 고장코드 E-0422가 표출된다.",
    "suspected_parts": [
      "냉각 시스템 고장",
      "● 냉각수 통로 막힘",
      "● 냉각수 부족",
      "● 워터펌프 고장",
      "● 라디에이터 팬 고장",
      "● 모터 온도센서 고장",
      "● 차량 컨트롤러(VCU) 고장",
      "● 모터 컨트롤러(MCU) 고장"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "워터펌프",
        "terminal_1": "워터펌프 전원 (1)",
        "terminal_2": "워터펌프 접지 (2)",
        "normal": "무한대 (저항)"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "VCU 신호선 (40)",
        "terminal_2": "VCU 신호선 (81)",
        "normal": "80 ~ 100 (저항) 통전 (전압)"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0422/image_1.jpg",
      "dtc/E-0422/image_2.jpg",
      "dtc/E-0422/image_3.jpg",
      "dtc/E-0422/image_4.jpg",
      "dtc/E-0422/image_5.jpg",
      "dtc/E-0422/image_6.jpg",
      "dtc/E-0422/image_7.jpg",
      "dtc/E-0422/image_8.jpg",
      "dtc/E-0422/image_9.png",
      "dtc/E-0422/image_10.jpg",
      "dtc/E-0422/image_11.jpg",
      "dtc/E-0422/image_12.jpg",
      "dtc/E-0422/image_13.jpg",
      "dtc/E-0422/image_14.jpg",
      "dtc/E-0422/image_15.jpg",
      "dtc/E-0422/image_16.jpg",
      "dtc/E-0422/image_17.jpg",
      "dtc/E-0422/image_18.jpg",
      "dtc/E-0422/image_19.png",
      "dtc/E-0422/image_20.png",
      "dtc/E-0422/image_21.jpg",
      "dtc/E-0422/image_22.png",
      "dtc/E-0422/image_23.jpg",
      "dtc/E-0422/image_24.png"
    ]
  },
  {
    "code": "423",
    "codeDisplay": "E-0423",
    "title": "모터 과열",
    "category": "구동 시스템 (MCU & 모터)",
    "explanation": "모터 과열이 발생한 경우 고장코드 E-0423이 표출된다.",
    "suspected_parts": [
      "냉각 시스템 고장",
      "● 냉각수 통로 막힘",
      "● 냉각수 부족",
      "● 워터펌프 고장",
      "● 라디에이터 팬 고장",
      "● 모터 온도센서 고장",
      "● 차량 컨트롤러(VCU) 고장",
      "● 모터 컨트롤러(MCU) 고장"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "워터펌프",
        "terminal_1": "워터펌프 전원 (1)",
        "terminal_2": "워터펌프 접지 (2)",
        "normal": "무한대 (저항)"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "VCU 신호선 (40)",
        "terminal_2": "VCU 신호선 (81)",
        "normal": "80 ~ 100 (저항) 통전 (전압)"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0423/image_1.jpg",
      "dtc/E-0423/image_2.jpg",
      "dtc/E-0423/image_3.jpg",
      "dtc/E-0423/image_4.jpg",
      "dtc/E-0423/image_5.jpg",
      "dtc/E-0423/image_6.jpg",
      "dtc/E-0423/image_7.png",
      "dtc/E-0423/image_8.jpg",
      "dtc/E-0423/image_9.jpg",
      "dtc/E-0423/image_10.jpg",
      "dtc/E-0423/image_11.jpg",
      "dtc/E-0423/image_12.jpg",
      "dtc/E-0423/image_13.jpg",
      "dtc/E-0423/image_14.jpg",
      "dtc/E-0423/image_15.jpg",
      "dtc/E-0423/image_16.png",
      "dtc/E-0423/image_17.png",
      "dtc/E-0423/image_18.jpg",
      "dtc/E-0423/image_19.png",
      "dtc/E-0423/image_20.jpg",
      "dtc/E-0423/image_21.jpg",
      "dtc/E-0423/image_22.jpg",
      "dtc/E-0423/image_23.jpg",
      "dtc/E-0423/image_24.png"
    ]
  },
  {
    "code": "425",
    "codeDisplay": "E-0425",
    "title": "모터 과열",
    "category": "구동 시스템 (MCU & 모터)",
    "explanation": "모터 과열이 발생한 경우 고장코드 E-0425가 표출된다.",
    "suspected_parts": [
      "냉각 시스템 고장",
      "● 냉각수 통로 막힘",
      "● 냉각수 부족",
      "● 워터펌프 고장",
      "● 라디에이터 팬 고장",
      "● 모터 온도센서 고장",
      "● 차량 컨트롤러(VCU) 고장",
      "● 모터 컨트롤러(MCU) 고장"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "워터펌프",
        "terminal_1": "워터펌프 전원 (1)",
        "terminal_2": "워터펌프 접지 (2)",
        "normal": "무한대 (저항)"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "VCU 신호선 (40)",
        "terminal_2": "VCU 신호선 (81)",
        "normal": "80 ~ 100 (저항) 통전 (전압)"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0425/image_1.jpg",
      "dtc/E-0425/image_2.jpg",
      "dtc/E-0425/image_3.jpg",
      "dtc/E-0425/image_4.jpg",
      "dtc/E-0425/image_5.jpg",
      "dtc/E-0425/image_6.jpg",
      "dtc/E-0425/image_7.jpg",
      "dtc/E-0425/image_8.jpg",
      "dtc/E-0425/image_9.png",
      "dtc/E-0425/image_10.jpg",
      "dtc/E-0425/image_11.jpg",
      "dtc/E-0425/image_12.jpg",
      "dtc/E-0425/image_13.jpg",
      "dtc/E-0425/image_14.jpg",
      "dtc/E-0425/image_15.jpg",
      "dtc/E-0425/image_16.jpg",
      "dtc/E-0425/image_17.jpg",
      "dtc/E-0425/image_18.png",
      "dtc/E-0425/image_19.png",
      "dtc/E-0425/image_20.jpg",
      "dtc/E-0425/image_21.png",
      "dtc/E-0425/image_22.jpg",
      "dtc/E-0425/image_23.jpg",
      "dtc/E-0425/image_24.png"
    ]
  },
  {
    "code": "426",
    "codeDisplay": "E-0426",
    "title": "모터 과전류 이상",
    "category": "구동 시스템 (MCU & 모터)",
    "explanation": "모터 컨트롤러(MCU)에서 모터로 전달되는 전류에 이상이 발생한 경우 고장코드 E-0426이 표출된다.",
    "suspected_parts": [
      "모터 컨트롤러(MCU)",
      "● 모터 절연 불량",
      "● 모터 위치 센서 이상",
      "● 모터 3상 케이블 단락"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "모터 컨트롤러(MCU)",
        "terminal_1": "웨이크업 릴레이 87 (11)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "접지선 (4)",
        "terminal_2": "차체 접지",
        "normal": "약 0V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "모터 온도 센서 신호 (20)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "모터 온도 센서 접지선 (5)",
        "terminal_2": "차체 접지",
        "normal": "약 0V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "Sin+ 포지티브",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0426/image_1.jpg",
      "dtc/E-0426/image_2.jpg",
      "dtc/E-0426/image_3.jpg",
      "dtc/E-0426/image_4.jpg",
      "dtc/E-0426/image_5.jpg",
      "dtc/E-0426/image_6.jpg",
      "dtc/E-0426/image_7.jpg",
      "dtc/E-0426/image_8.jpg",
      "dtc/E-0426/image_9.jpg",
      "dtc/E-0426/image_10.jpg",
      "dtc/E-0426/image_11.jpg",
      "dtc/E-0426/image_12.jpg",
      "dtc/E-0426/image_13.jpg",
      "dtc/E-0426/image_14.png",
      "dtc/E-0426/image_15.png"
    ]
  },
  {
    "code": "427",
    "codeDisplay": "E-0427",
    "title": "모터 과전류 이상",
    "category": "구동 시스템 (MCU & 모터)",
    "explanation": "모터 컨트롤러(MCU)에서 모터로 전달되는 전류에 이상이 발생한 경우 고장코드 E-0427이 표출된다.",
    "suspected_parts": [
      "모터 컨트롤러(MCU)",
      "● 모터 절연 불량",
      "● 모터 위치 센서 이상",
      "● 모터 3상 케이블 단락"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "모터 컨트롤러(MCU)",
        "terminal_1": "웨이크업 릴레이 87 (11)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "접지선 (4)",
        "terminal_2": "차체 접지",
        "normal": "약 0V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "모터 온도 센서 신호 (20)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "모터 온도 센서 접지선 (5)",
        "terminal_2": "차체 접지",
        "normal": "약 0V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "Sin+ 포지티브",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0427/image_1.jpg",
      "dtc/E-0427/image_2.jpg",
      "dtc/E-0427/image_3.jpg",
      "dtc/E-0427/image_4.jpg",
      "dtc/E-0427/image_5.jpg",
      "dtc/E-0427/image_6.jpg",
      "dtc/E-0427/image_7.jpg",
      "dtc/E-0427/image_8.jpg",
      "dtc/E-0427/image_9.jpg",
      "dtc/E-0427/image_10.jpg",
      "dtc/E-0427/image_11.jpg",
      "dtc/E-0427/image_12.jpg",
      "dtc/E-0427/image_13.jpg",
      "dtc/E-0427/image_14.png",
      "dtc/E-0427/image_15.png"
    ]
  },
  {
    "code": "428",
    "codeDisplay": "E-0428",
    "title": "모터 컨트롤러(MCU)내부 이상",
    "category": "구동 시스템 (MCU & 모터)",
    "explanation": "모터 컨트롤러(MCU) 내부 이상이 발생한 경우 고장코드 E-0428이 표출된다.",
    "suspected_parts": [
      "모터 컨트롤러(MCU)"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "모터 컨트롤러(MCU)",
        "terminal_1": "웨이크업 릴레이 87 (11)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "접지선 (4)",
        "terminal_2": "차체 접지",
        "normal": "약 0V"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0428/image_1.jpg",
      "dtc/E-0428/image_2.jpg",
      "dtc/E-0428/image_3.jpg",
      "dtc/E-0428/image_4.jpg",
      "dtc/E-0428/image_5.jpg",
      "dtc/E-0428/image_6.jpg",
      "dtc/E-0428/image_7.jpg",
      "dtc/E-0428/image_8.jpg",
      "dtc/E-0428/image_9.jpg",
      "dtc/E-0428/image_10.png",
      "dtc/E-0428/image_11.png"
    ]
  },
  {
    "code": "429",
    "codeDisplay": "E-0429",
    "title": "모터 컨트롤러(MCU)내부 이상",
    "category": "구동 시스템 (MCU & 모터)",
    "explanation": "모터 컨트롤러(MCU) 내부 이상이 발생한 경우 고장코드 E-0429가 표출된다.",
    "suspected_parts": [
      "모터 컨트롤러(MCU)"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "모터 컨트롤러(MCU)",
        "terminal_1": "웨이크업 릴레이 87 (11)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "접지선 (4)",
        "terminal_2": "차체 접지",
        "normal": "약 0V"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0429/image_1.jpg",
      "dtc/E-0429/image_2.jpg",
      "dtc/E-0429/image_3.jpg",
      "dtc/E-0429/image_4.jpg",
      "dtc/E-0429/image_5.jpg",
      "dtc/E-0429/image_6.jpg",
      "dtc/E-0429/image_7.jpg",
      "dtc/E-0429/image_8.jpg",
      "dtc/E-0429/image_9.jpg",
      "dtc/E-0429/image_10.png",
      "dtc/E-0429/image_11.png"
    ]
  },
  {
    "code": "430",
    "codeDisplay": "E-0430",
    "title": "모터 이상 - 단락",
    "category": "구동 시스템 (MCU & 모터)",
    "explanation": "모터 이상 - 단락 이 발생한 경우 고장코드 E-0430이 표출된다.",
    "suspected_parts": [
      "커넥터 접촉 불량",
      "● 모터 회로 단선 또는 단락",
      "● 모터 컨트롤러(MCU)",
      "● 모터 불량"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "모터 컨트롤러(MCU)",
        "terminal_1": "웨이크업 릴레이 87 (11)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "접지선 (4)",
        "terminal_2": "차체 접지",
        "normal": "약 0V"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0430/image_1.jpg",
      "dtc/E-0430/image_2.jpg",
      "dtc/E-0430/image_3.jpg",
      "dtc/E-0430/image_4.jpg",
      "dtc/E-0430/image_5.jpg",
      "dtc/E-0430/image_6.jpg",
      "dtc/E-0430/image_7.jpg",
      "dtc/E-0430/image_8.jpg",
      "dtc/E-0430/image_9.jpg",
      "dtc/E-0430/image_10.jpg",
      "dtc/E-0430/image_11.png",
      "dtc/E-0430/image_12.png"
    ]
  },
  {
    "code": "431",
    "codeDisplay": "E-0431",
    "title": "모터 이상 - 단락",
    "category": "구동 시스템 (MCU & 모터)",
    "explanation": "모터 이상 - 단락 이 발생한 경우 고장코드 E-0431이 표출된다.",
    "suspected_parts": [
      "커넥터 접촉 불량",
      "● 모터 회로 단선 또는 단락",
      "● 모터 컨트롤러(MCU)",
      "● 모터 불량"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "모터 컨트롤러(MCU)",
        "terminal_1": "웨이크업 릴레이 87 (11)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "접지선 (4)",
        "terminal_2": "차체 접지",
        "normal": "약 0V"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0431/image_1.jpg",
      "dtc/E-0431/image_2.jpg",
      "dtc/E-0431/image_3.jpg",
      "dtc/E-0431/image_4.jpg",
      "dtc/E-0431/image_5.jpg",
      "dtc/E-0431/image_6.jpg",
      "dtc/E-0431/image_7.jpg",
      "dtc/E-0431/image_8.jpg",
      "dtc/E-0431/image_9.jpg",
      "dtc/E-0431/image_10.jpg",
      "dtc/E-0431/image_11.png",
      "dtc/E-0431/image_12.png"
    ]
  },
  {
    "code": "432",
    "codeDisplay": "E-0432",
    "title": "모터 컨트롤러(MCU) 과열",
    "category": "구동 시스템 (MCU & 모터)",
    "explanation": "모터 컨트롤러(MCU) 과열이 발생한 경우 고장코드 E-0432가 표출된다.",
    "suspected_parts": [
      "모터 컨트롤러(MCU)"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "모터 컨트롤러(MCU)",
        "terminal_1": "웨이크업 릴레이 87 (11)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "접지선 (4)",
        "terminal_2": "차체 접지",
        "normal": "약 0V"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0432/image_1.jpg",
      "dtc/E-0432/image_2.jpg",
      "dtc/E-0432/image_3.jpg",
      "dtc/E-0432/image_4.jpg",
      "dtc/E-0432/image_5.jpg",
      "dtc/E-0432/image_6.jpg",
      "dtc/E-0432/image_7.jpg",
      "dtc/E-0432/image_8.jpg",
      "dtc/E-0432/image_9.jpg",
      "dtc/E-0432/image_10.png",
      "dtc/E-0432/image_11.png"
    ]
  },
  {
    "code": "433",
    "codeDisplay": "E-0433",
    "title": "모터 컨트롤러(MCU) 과열",
    "category": "구동 시스템 (MCU & 모터)",
    "explanation": "모터 컨트롤러(MCU) 과열이 발생한 경우 고장코드 E-0433이 표출된다.",
    "suspected_parts": [
      "모터 컨트롤러(MCU)"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "모터 컨트롤러(MCU)",
        "terminal_1": "웨이크업 릴레이 87 (11)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "접지선 (4)",
        "terminal_2": "차체 접지",
        "normal": "약 0V"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0433/image_1.jpg",
      "dtc/E-0433/image_2.jpg",
      "dtc/E-0433/image_3.jpg",
      "dtc/E-0433/image_4.jpg",
      "dtc/E-0433/image_5.jpg",
      "dtc/E-0433/image_6.jpg",
      "dtc/E-0433/image_7.jpg",
      "dtc/E-0433/image_8.jpg",
      "dtc/E-0433/image_9.jpg",
      "dtc/E-0433/image_10.png",
      "dtc/E-0433/image_11.png"
    ]
  },
  {
    "code": "434",
    "codeDisplay": "E-0434",
    "title": "모터 컨트롤러(MCU) 과열",
    "category": "구동 시스템 (MCU & 모터)",
    "explanation": "모터 컨트롤러(MCU) 과열이 발생한 경우 고장코드 E-0434가 표출된다.",
    "suspected_parts": [
      "모터 컨트롤러(MCU)"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "모터 컨트롤러(MCU)",
        "terminal_1": "웨이크업 릴레이 87 (11)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "접지선 (4)",
        "terminal_2": "차체 접지",
        "normal": "약 0V"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0434/image_1.jpg",
      "dtc/E-0434/image_2.jpg",
      "dtc/E-0434/image_3.jpg",
      "dtc/E-0434/image_4.jpg",
      "dtc/E-0434/image_5.jpg",
      "dtc/E-0434/image_6.jpg",
      "dtc/E-0434/image_7.jpg",
      "dtc/E-0434/image_8.jpg",
      "dtc/E-0434/image_9.jpg",
      "dtc/E-0434/image_10.png",
      "dtc/E-0434/image_11.png"
    ]
  },
  {
    "code": "435",
    "codeDisplay": "E-0435",
    "title": "모터 컨트롤러(MCU)내부 기판이상",
    "category": "구동 시스템 (MCU & 모터)",
    "explanation": "모터 컨트롤러(MCU) 내부 기판 이상이 발생한 경우 고장코드 E-0435가 표출된다.",
    "suspected_parts": [
      "모터 컨트롤러(MCU)"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "모터 컨트롤러(MCU)",
        "terminal_1": "웨이크업 릴레이 87 (11)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "접지선 (4)",
        "terminal_2": "차체 접지",
        "normal": "약 0V"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0435/image_1.jpg",
      "dtc/E-0435/image_2.jpg",
      "dtc/E-0435/image_3.jpg",
      "dtc/E-0435/image_4.jpg",
      "dtc/E-0435/image_5.jpg",
      "dtc/E-0435/image_6.jpg",
      "dtc/E-0435/image_7.jpg",
      "dtc/E-0435/image_8.jpg",
      "dtc/E-0435/image_9.jpg",
      "dtc/E-0435/image_10.png",
      "dtc/E-0435/image_11.png"
    ]
  },
  {
    "code": "436",
    "codeDisplay": "E-0436",
    "title": "모터 컨트롤러(MCU)내부 기판과열",
    "category": "구동 시스템 (MCU & 모터)",
    "explanation": "모터 컨트롤러(MCU)내부 기판 과열이 발생한 경우 고장코드 E-0436이 표출된다.",
    "suspected_parts": [
      "냉각 시스템 고장",
      "● 냉각수 통로 막힘",
      "● 냉각수 부족",
      "● 워터펌프 고장",
      "● 라디에이터 팬 고장",
      "● 차량 컨트롤러(VCU) 고장",
      "● 모터 컨트롤러(MCU) 고장"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "워터펌프",
        "terminal_1": "워터펌프 전원 (1)",
        "terminal_2": "워터펌프 접지 (2)",
        "normal": "무한대 (저항)"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "VCU 신호선 (40)",
        "terminal_2": "VCU 신호선 (81)",
        "normal": "80 ~ 100 (저항) 통전 (전압)"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0436/image_1.jpg",
      "dtc/E-0436/image_2.jpg",
      "dtc/E-0436/image_3.jpg",
      "dtc/E-0436/image_4.jpg",
      "dtc/E-0436/image_5.jpg",
      "dtc/E-0436/image_6.jpg",
      "dtc/E-0436/image_7.jpg",
      "dtc/E-0436/image_8.png",
      "dtc/E-0436/image_9.jpg",
      "dtc/E-0436/image_10.jpg",
      "dtc/E-0436/image_11.jpg",
      "dtc/E-0436/image_12.jpg",
      "dtc/E-0436/image_13.jpg",
      "dtc/E-0436/image_14.jpg",
      "dtc/E-0436/image_15.jpg",
      "dtc/E-0436/image_16.jpg",
      "dtc/E-0436/image_17.png",
      "dtc/E-0436/image_18.png",
      "dtc/E-0436/image_19.jpg",
      "dtc/E-0436/image_20.png",
      "dtc/E-0436/image_21.jpg",
      "dtc/E-0436/image_22.jpg",
      "dtc/E-0436/image_23.png"
    ]
  },
  {
    "code": "437",
    "codeDisplay": "E-0437",
    "title": "모터 컨트롤러(MCU)내부 기판과열",
    "category": "구동 시스템 (MCU & 모터)",
    "explanation": "모터 컨트롤러(MCU)내부 기판 과열이 발생한 경우 고장코드 E-0437이 표출된다.",
    "suspected_parts": [
      "냉각 시스템 고장",
      "● 냉각수 통로 막힘",
      "● 냉각수 부족",
      "● 워터펌프 고장",
      "● 라디에이터 팬 고장",
      "● 차량 컨트롤러(VCU) 고장",
      "● 모터 컨트롤러(MCU) 고장"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "워터펌프",
        "terminal_1": "워터펌프 전원 (1)",
        "terminal_2": "워터펌프 접지 (2)",
        "normal": "무한대 (저항)"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "VCU 신호선 (40)",
        "terminal_2": "VCU 신호선 (81)",
        "normal": "80 ~ 100 (저항) 통전 (전압)"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0437/image_1.jpg",
      "dtc/E-0437/image_2.jpg",
      "dtc/E-0437/image_3.jpg",
      "dtc/E-0437/image_4.jpg",
      "dtc/E-0437/image_5.jpg",
      "dtc/E-0437/image_6.jpg",
      "dtc/E-0437/image_7.jpg",
      "dtc/E-0437/image_8.png",
      "dtc/E-0437/image_9.jpg",
      "dtc/E-0437/image_10.jpg",
      "dtc/E-0437/image_11.jpg",
      "dtc/E-0437/image_12.jpg",
      "dtc/E-0437/image_13.jpg",
      "dtc/E-0437/image_14.jpg",
      "dtc/E-0437/image_15.jpg",
      "dtc/E-0437/image_16.jpg",
      "dtc/E-0437/image_17.png",
      "dtc/E-0437/image_18.png",
      "dtc/E-0437/image_19.jpg",
      "dtc/E-0437/image_20.png",
      "dtc/E-0437/image_21.jpg",
      "dtc/E-0437/image_22.jpg",
      "dtc/E-0437/image_23.png"
    ]
  },
  {
    "code": "438",
    "codeDisplay": "E-0438",
    "title": "모터 컨트롤러(MCU) - 과전류",
    "category": "구동 시스템 (MCU & 모터)",
    "explanation": "모터 컨트롤러(MCU)  - 과전류 가 발생한 경우 고장코드 E-0438이 표출된다.",
    "suspected_parts": [
      "모터 컨트롤러(MCU)"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "모터 컨트롤러(MCU)",
        "terminal_1": "웨이크업 릴레이 87 (11)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "접지선 (4)",
        "terminal_2": "차체 접지",
        "normal": "약 0V"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0438/image_1.jpg",
      "dtc/E-0438/image_2.jpg",
      "dtc/E-0438/image_3.jpg",
      "dtc/E-0438/image_4.jpg",
      "dtc/E-0438/image_5.jpg",
      "dtc/E-0438/image_6.jpg",
      "dtc/E-0438/image_7.jpg",
      "dtc/E-0438/image_8.jpg",
      "dtc/E-0438/image_9.jpg",
      "dtc/E-0438/image_10.png",
      "dtc/E-0438/image_11.png"
    ]
  },
  {
    "code": "439",
    "codeDisplay": "E-0439",
    "title": "모터 컨트롤러(MCU) - 과전류",
    "category": "구동 시스템 (MCU & 모터)",
    "explanation": "모터 컨트롤러(MCU)  - 과전류 가 발생한 경우 고장코드 E-0439가 표출된다.",
    "suspected_parts": [
      "모터 컨트롤러(MCU)"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "모터 컨트롤러(MCU)",
        "terminal_1": "웨이크업 릴레이 87 (11)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "접지선 (4)",
        "terminal_2": "차체 접지",
        "normal": "약 0V"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0439/image_1.jpg",
      "dtc/E-0439/image_2.jpg",
      "dtc/E-0439/image_3.jpg",
      "dtc/E-0439/image_4.jpg",
      "dtc/E-0439/image_5.jpg",
      "dtc/E-0439/image_6.jpg",
      "dtc/E-0439/image_7.jpg",
      "dtc/E-0439/image_8.jpg",
      "dtc/E-0439/image_9.jpg",
      "dtc/E-0439/image_10.png",
      "dtc/E-0439/image_11.png"
    ]
  },
  {
    "code": "440",
    "codeDisplay": "E-0440",
    "title": "모터 컨트롤러(MCU) - 과전압",
    "category": "구동 시스템 (MCU & 모터)",
    "explanation": "모터 컨트롤러(MCU)  - 과전압 이 발생한 경우 고장코드 E-0440이 표출된다.",
    "suspected_parts": [
      "모터 컨트롤러(MCU)"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0440/image_1.jpg",
      "dtc/E-0440/image_2.jpg",
      "dtc/E-0440/image_3.jpg",
      "dtc/E-0440/image_4.jpg",
      "dtc/E-0440/image_5.jpg",
      "dtc/E-0440/image_6.jpg",
      "dtc/E-0440/image_7.jpg",
      "dtc/E-0440/image_8.jpg",
      "dtc/E-0440/image_9.jpg",
      "dtc/E-0440/image_10.jpg",
      "dtc/E-0440/image_11.jpg",
      "dtc/E-0440/image_12.jpg",
      "dtc/E-0440/image_13.png",
      "dtc/E-0440/image_14.png",
      "dtc/E-0440/image_15.png",
      "dtc/E-0440/image_16.png"
    ]
  },
  {
    "code": "441",
    "codeDisplay": "E-0441",
    "title": "모터 컨트롤러(MCU) - 저전압",
    "category": "구동 시스템 (MCU & 모터)",
    "explanation": "모터 컨트롤러(MCU)  - 저전압 이 발생한 경우 고장코드 E-0441이 표출된다.",
    "suspected_parts": [
      "모터 컨트롤러(MCU)"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0441/image_1.jpg",
      "dtc/E-0441/image_2.jpg",
      "dtc/E-0441/image_3.jpg",
      "dtc/E-0441/image_4.jpg",
      "dtc/E-0441/image_5.jpg",
      "dtc/E-0441/image_6.jpg",
      "dtc/E-0441/image_7.jpg",
      "dtc/E-0441/image_8.jpg",
      "dtc/E-0441/image_9.jpg",
      "dtc/E-0441/image_10.jpg",
      "dtc/E-0441/image_11.jpg",
      "dtc/E-0441/image_12.jpg",
      "dtc/E-0441/image_13.png",
      "dtc/E-0441/image_14.png",
      "dtc/E-0441/image_15.png",
      "dtc/E-0441/image_16.png"
    ]
  },
  {
    "code": "442",
    "codeDisplay": "E-0442",
    "title": "모터 컨트롤러(MCU)내부 기판이상",
    "category": "구동 시스템 (MCU & 모터)",
    "explanation": "모터 컨트롤러(MCU) 내부 기판 이상이 발생한 경우 고장코드 E-0442가 표출된다.",
    "suspected_parts": [
      "모터 컨트롤러(MCU)"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "모터 컨트롤러(MCU)",
        "terminal_1": "웨이크업 릴레이 87 (11)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "접지선 (4)",
        "terminal_2": "차체 접지",
        "normal": "약 0V"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0442/image_1.jpg",
      "dtc/E-0442/image_2.jpg",
      "dtc/E-0442/image_3.jpg",
      "dtc/E-0442/image_4.jpg",
      "dtc/E-0442/image_5.jpg",
      "dtc/E-0442/image_6.jpg",
      "dtc/E-0442/image_7.jpg",
      "dtc/E-0442/image_8.jpg",
      "dtc/E-0442/image_9.jpg",
      "dtc/E-0442/image_10.png",
      "dtc/E-0442/image_11.png"
    ]
  },
  {
    "code": "443",
    "codeDisplay": "E-0443",
    "title": "모터 온도센서 이상",
    "category": "구동 시스템 (MCU & 모터)",
    "explanation": "모터 온도센서 이상이 발생한 경우 고장코드 E-0443이 표출된다.",
    "suspected_parts": [
      "모터 온도센서 고장",
      "● 모터 컨트롤러(MCU) 고장"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "모터 컨트롤러(MCU)",
        "terminal_1": "웨이크업 릴레이 87 (11)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "접지선 (4)",
        "terminal_2": "차체 접지",
        "normal": "약 0V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "모터 온도 센서 신호 (20)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "모터 온도 센서 접지선 (5)",
        "terminal_2": "차체 접지",
        "normal": "약 0V"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0443/image_1.jpg",
      "dtc/E-0443/image_2.jpg",
      "dtc/E-0443/image_3.jpg",
      "dtc/E-0443/image_4.jpg",
      "dtc/E-0443/image_5.jpg",
      "dtc/E-0443/image_6.jpg",
      "dtc/E-0443/image_7.jpg",
      "dtc/E-0443/image_8.jpg",
      "dtc/E-0443/image_9.jpg",
      "dtc/E-0443/image_10.jpg",
      "dtc/E-0443/image_11.png",
      "dtc/E-0443/image_12.png"
    ]
  },
  {
    "code": "444",
    "codeDisplay": "E-0444",
    "title": "모터 온도센서 이상",
    "category": "구동 시스템 (MCU & 모터)",
    "explanation": "모터 온도센서 이상이 발생한 경우 고장코드 E-0444가 표출된다.",
    "suspected_parts": [
      "모터 온도센서 고장",
      "● 모터 컨트롤러(MCU) 고장"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "모터 컨트롤러(MCU)",
        "terminal_1": "웨이크업 릴레이 87 (11)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "접지선 (4)",
        "terminal_2": "차체 접지",
        "normal": "약 0V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "모터 온도 센서 신호 (20)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "모터 온도 센서 접지선 (5)",
        "terminal_2": "차체 접지",
        "normal": "약 0V"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0444/image_1.jpg",
      "dtc/E-0444/image_2.jpg",
      "dtc/E-0444/image_3.jpg",
      "dtc/E-0444/image_4.jpg",
      "dtc/E-0444/image_5.jpg",
      "dtc/E-0444/image_6.jpg",
      "dtc/E-0444/image_7.jpg",
      "dtc/E-0444/image_8.jpg",
      "dtc/E-0444/image_9.jpg",
      "dtc/E-0444/image_10.jpg",
      "dtc/E-0444/image_11.png",
      "dtc/E-0444/image_12.png"
    ]
  },
  {
    "code": "445",
    "codeDisplay": "E-0445",
    "title": "모터 컨트롤러(MCU)내부 이상",
    "category": "구동 시스템 (MCU & 모터)",
    "explanation": "모터 컨트롤러(MCU) 내부 이상이 발생한 경우 고장코드 E-0445가 표출된다.",
    "suspected_parts": [
      "모터 컨트롤러(MCU)"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "모터 컨트롤러(MCU)",
        "terminal_1": "웨이크업 릴레이 87 (11)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "접지선 (4)",
        "terminal_2": "차체 접지",
        "normal": "약 0V"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0445/image_1.jpg",
      "dtc/E-0445/image_2.jpg",
      "dtc/E-0445/image_3.jpg",
      "dtc/E-0445/image_4.jpg",
      "dtc/E-0445/image_5.jpg",
      "dtc/E-0445/image_6.jpg",
      "dtc/E-0445/image_7.jpg",
      "dtc/E-0445/image_8.jpg",
      "dtc/E-0445/image_9.jpg",
      "dtc/E-0445/image_10.png",
      "dtc/E-0445/image_11.png"
    ]
  },
  {
    "code": "446",
    "codeDisplay": "E-0446",
    "title": "모터 컨트롤러(MCU)내부 이상",
    "category": "구동 시스템 (MCU & 모터)",
    "explanation": "모터 컨트롤러(MCU) 내부 이상이 발생한 경우 고장코드 E-0446이 표출된다.",
    "suspected_parts": [
      "모터 컨트롤러(MCU)"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "모터 컨트롤러(MCU)",
        "terminal_1": "웨이크업 릴레이 87 (11)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "접지선 (4)",
        "terminal_2": "차체 접지",
        "normal": "약 0V"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0446/image_1.jpg",
      "dtc/E-0446/image_2.jpg",
      "dtc/E-0446/image_3.jpg",
      "dtc/E-0446/image_4.jpg",
      "dtc/E-0446/image_5.jpg",
      "dtc/E-0446/image_6.jpg",
      "dtc/E-0446/image_7.jpg",
      "dtc/E-0446/image_8.jpg",
      "dtc/E-0446/image_9.jpg",
      "dtc/E-0446/image_10.png",
      "dtc/E-0446/image_11.png"
    ]
  },
  {
    "code": "447",
    "codeDisplay": "E-0447",
    "title": "모터 컨트롤러(MCU)내부 이상",
    "category": "구동 시스템 (MCU & 모터)",
    "explanation": "모터 컨트롤러(MCU) 내부 이상이 발생한 경우 고장코드 E-0447이 표출된다.",
    "suspected_parts": [
      "모터 컨트롤러(MCU)"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "모터 컨트롤러(MCU)",
        "terminal_1": "웨이크업 릴레이 87 (11)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "접지선 (4)",
        "terminal_2": "차체 접지",
        "normal": "약 0V"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0447/image_1.jpg",
      "dtc/E-0447/image_2.jpg",
      "dtc/E-0447/image_3.jpg",
      "dtc/E-0447/image_4.jpg",
      "dtc/E-0447/image_5.jpg",
      "dtc/E-0447/image_6.jpg",
      "dtc/E-0447/image_7.jpg",
      "dtc/E-0447/image_8.jpg",
      "dtc/E-0447/image_9.jpg",
      "dtc/E-0447/image_10.png",
      "dtc/E-0447/image_11.png"
    ]
  },
  {
    "code": "448",
    "codeDisplay": "E-0448",
    "title": "모터 저전압 플러그 이상",
    "category": "구동 시스템 (MCU & 모터)",
    "explanation": "모터 저전압 플러그 이상이 발생한 경우 고장코드 E-0448이 표출된다.",
    "suspected_parts": [
      "모터 컨트롤러(MCU)",
      "● 모터 불량"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "모터 컨트롤러(MCU)",
        "terminal_1": "웨이크업 릴레이 87 (11)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "접지선 (4)",
        "terminal_2": "차체 접지",
        "normal": "약 0V"
      },
      {
        "condition": "점검 조건",
        "target": "측정부",
        "terminal_1": "단자",
        "terminal_2": "단자",
        "normal": "정상값"
      },
      {
        "condition": "EV ON",
        "target": "모터 저전압 플러그",
        "terminal_1": "Sin 위치 L",
        "terminal_2": "Sin 위치 H",
        "normal": "무한대 (저항)"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "Cos 위치 L",
        "terminal_2": "Cos 위치 H",
        "normal": "무한대 (저항)"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0448/image_1.jpg",
      "dtc/E-0448/image_2.jpg",
      "dtc/E-0448/image_3.jpg",
      "dtc/E-0448/image_4.jpg",
      "dtc/E-0448/image_5.jpg",
      "dtc/E-0448/image_6.jpg",
      "dtc/E-0448/image_7.jpg",
      "dtc/E-0448/image_8.jpg",
      "dtc/E-0448/image_9.jpg",
      "dtc/E-0448/image_10.jpg",
      "dtc/E-0448/image_11.jpg",
      "dtc/E-0448/image_12.jpg",
      "dtc/E-0448/image_13.jpg",
      "dtc/E-0448/image_14.png",
      "dtc/E-0448/image_15.png"
    ]
  },
  {
    "code": "449",
    "codeDisplay": "E-0449",
    "title": "모터 - 단선",
    "category": "구동 시스템 (MCU & 모터)",
    "explanation": "모터 - 단선이 발생한 경우 고장코드 E-0449가 표출된다.",
    "suspected_parts": [
      "모터 컨트롤러(MCU)"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0449/image_1.jpg",
      "dtc/E-0449/image_2.jpg",
      "dtc/E-0449/image_3.jpg",
      "dtc/E-0449/image_4.jpg",
      "dtc/E-0449/image_5.jpg",
      "dtc/E-0449/image_6.jpg",
      "dtc/E-0449/image_7.jpg",
      "dtc/E-0449/image_8.jpg",
      "dtc/E-0449/image_9.jpg",
      "dtc/E-0449/image_10.jpg",
      "dtc/E-0449/image_11.jpg",
      "dtc/E-0449/image_12.jpg",
      "dtc/E-0449/image_13.png",
      "dtc/E-0449/image_14.png",
      "dtc/E-0449/image_15.png",
      "dtc/E-0449/image_16.png"
    ]
  },
  {
    "code": "450",
    "codeDisplay": "E-0450",
    "title": "모터 - 단선",
    "category": "구동 시스템 (MCU & 모터)",
    "explanation": "모터 - 단선이 발생한 경우 고장코드 E-0450이 표출된다.",
    "suspected_parts": [
      "모터 컨트롤러(MCU)"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0450/image_1.jpg",
      "dtc/E-0450/image_2.jpg",
      "dtc/E-0450/image_3.jpg",
      "dtc/E-0450/image_4.jpg",
      "dtc/E-0450/image_5.jpg",
      "dtc/E-0450/image_6.jpg",
      "dtc/E-0450/image_7.jpg",
      "dtc/E-0450/image_8.jpg",
      "dtc/E-0450/image_9.jpg",
      "dtc/E-0450/image_10.jpg",
      "dtc/E-0450/image_11.jpg",
      "dtc/E-0450/image_12.jpg",
      "dtc/E-0450/image_13.png",
      "dtc/E-0450/image_14.png",
      "dtc/E-0450/image_15.png",
      "dtc/E-0450/image_16.png"
    ]
  },
  {
    "code": "451",
    "codeDisplay": "E-0451",
    "title": "모터 컨트롤러(MCU) - 통신이상",
    "category": "구동 시스템 (MCU & 모터)",
    "explanation": "모터 컨트롤러(MCU) - 통신이상 이 발생한 경우 고장코드 E-0451이 표출된다.",
    "suspected_parts": [
      "커넥터 접촉 불량",
      "● 캔라인 단선/단락",
      "● 차량 컨트롤러(VCU) 고장",
      "● 모터 컨트롤러(MCU) 고장"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "차량 컨트롤러(VCU)",
        "terminal_1": "12V 릴레이 제어 (23)",
        "terminal_2": "차체 접지",
        "normal": "약 12V (배터리 전압)"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "전원 전압 제어 (45)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "IG OFF (배터리 분리)",
        "target": "",
        "terminal_1": "차량 캔 - 하이 (54)",
        "terminal_2": "차량 캔 - 로우 (73)",
        "normal": "약 60Ω (저항측정)"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0451/image_1.jpg",
      "dtc/E-0451/image_2.jpg",
      "dtc/E-0451/image_3.jpg",
      "dtc/E-0451/image_4.jpg",
      "dtc/E-0451/image_5.jpg",
      "dtc/E-0451/image_6.png",
      "dtc/E-0451/image_7.jpg",
      "dtc/E-0451/image_8.jpg",
      "dtc/E-0451/image_9.jpg",
      "dtc/E-0451/image_10.jpg",
      "dtc/E-0451/image_11.jpg",
      "dtc/E-0451/image_12.jpg",
      "dtc/E-0451/image_13.jpg",
      "dtc/E-0451/image_14.jpg",
      "dtc/E-0451/image_15.png",
      "dtc/E-0451/image_16.png",
      "dtc/E-0451/image_17.jpg",
      "dtc/E-0451/image_18.png"
    ]
  },
  {
    "code": "452",
    "codeDisplay": "E-0452",
    "title": "모터 위치센서 이상",
    "category": "구동 시스템 (MCU & 모터)",
    "explanation": "모터 위치센서 이상이 발생한 경우 고장코드 E-0452가 표출된다.",
    "suspected_parts": [
      "모터 컨트롤러(MCU)",
      "● 모터 불량"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "모터 컨트롤러(MCU)",
        "terminal_1": "웨이크업 릴레이 87 (11)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "접지선 (4)",
        "terminal_2": "차체 접지",
        "normal": "약 0V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "Sin+ 포지티브",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "Sin- 네거티브",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "Cos+ 포지티브",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0452/image_1.jpg",
      "dtc/E-0452/image_2.jpg",
      "dtc/E-0452/image_3.jpg",
      "dtc/E-0452/image_4.jpg",
      "dtc/E-0452/image_5.jpg",
      "dtc/E-0452/image_6.jpg",
      "dtc/E-0452/image_7.jpg",
      "dtc/E-0452/image_8.jpg",
      "dtc/E-0452/image_9.jpg",
      "dtc/E-0452/image_10.jpg",
      "dtc/E-0452/image_11.jpg",
      "dtc/E-0452/image_12.jpg",
      "dtc/E-0452/image_13.jpg",
      "dtc/E-0452/image_14.png",
      "dtc/E-0452/image_15.png"
    ]
  },
  {
    "code": "453",
    "codeDisplay": "E-0453",
    "title": "모터 컨트롤러(MCU)내부 이상",
    "category": "구동 시스템 (MCU & 모터)",
    "explanation": "모터 컨트롤러(MCU) 내부 이상이 발생한 경우 고장코드 E-0453이 표출된다.",
    "suspected_parts": [
      "모터 컨트롤러(MCU)"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "모터 컨트롤러(MCU)",
        "terminal_1": "웨이크업 릴레이 87 (11)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "접지선 (4)",
        "terminal_2": "차체 접지",
        "normal": "약 0V"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0453/image_1.jpg",
      "dtc/E-0453/image_2.jpg",
      "dtc/E-0453/image_3.jpg",
      "dtc/E-0453/image_4.jpg",
      "dtc/E-0453/image_5.jpg",
      "dtc/E-0453/image_6.jpg",
      "dtc/E-0453/image_7.jpg",
      "dtc/E-0453/image_8.jpg",
      "dtc/E-0453/image_9.jpg",
      "dtc/E-0453/image_10.png",
      "dtc/E-0453/image_11.png"
    ]
  },
  {
    "code": "454",
    "codeDisplay": "E-0454",
    "title": "고전압 플러그 이상",
    "category": "구동 시스템 (MCU & 모터)",
    "explanation": "고전앞 플러그 이상이 발생한 경우 고장코드 E-0454가 표출된다.",
    "suspected_parts": [
      "고전압 플러그"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0454/image_1.jpg",
      "dtc/E-0454/image_2.jpg",
      "dtc/E-0454/image_3.jpg",
      "dtc/E-0454/image_4.jpg",
      "dtc/E-0454/image_5.jpg",
      "dtc/E-0454/image_6.jpg",
      "dtc/E-0454/image_7.jpg",
      "dtc/E-0454/image_8.jpg",
      "dtc/E-0454/image_9.jpg",
      "dtc/E-0454/image_10.png",
      "dtc/E-0454/image_11.png"
    ]
  },
  {
    "code": "455",
    "codeDisplay": "E-0455",
    "title": "모터 컨트롤러(MCU) - 과전압",
    "category": "구동 시스템 (MCU & 모터)",
    "explanation": "모터 컨트롤러(MCU)  - 과전압 이 발생한 경우 고장코드 E-0455가 표출된다.",
    "suspected_parts": [
      "모터 컨트롤러(MCU)"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0455/image_1.jpg",
      "dtc/E-0455/image_2.jpg",
      "dtc/E-0455/image_3.jpg",
      "dtc/E-0455/image_4.jpg",
      "dtc/E-0455/image_5.jpg",
      "dtc/E-0455/image_6.jpg",
      "dtc/E-0455/image_7.jpg",
      "dtc/E-0455/image_8.jpg",
      "dtc/E-0455/image_9.jpg",
      "dtc/E-0455/image_10.jpg",
      "dtc/E-0455/image_11.jpg",
      "dtc/E-0455/image_12.jpg",
      "dtc/E-0455/image_13.png",
      "dtc/E-0455/image_14.png",
      "dtc/E-0455/image_15.png",
      "dtc/E-0455/image_16.png"
    ]
  },
  {
    "code": "456",
    "codeDisplay": "E-0456",
    "title": "전류 감지 실패",
    "category": "구동 시스템 (MCU & 모터)",
    "explanation": "",
    "suspected_parts": [],
    "wiring_steps": [],
    "causes": [
      {
        "cause": "—",
        "action": "—"
      }
    ],
    "imageKeys": []
  },
  {
    "code": "457",
    "codeDisplay": "E-0457",
    "title": "저전압 부족 전압 오류",
    "category": "구동 시스템 (MCU & 모터)",
    "explanation": "",
    "suspected_parts": [],
    "wiring_steps": [],
    "causes": [
      {
        "cause": "",
        "action": "12V 배터리 리셋, DCDC 교체"
      }
    ],
    "imageKeys": []
  },
  {
    "code": "458",
    "codeDisplay": "E-0458",
    "title": "컨트롤러 과부하 오류",
    "category": "구동 시스템 (MCU & 모터)",
    "explanation": "",
    "suspected_parts": [],
    "wiring_steps": [],
    "causes": [
      {
        "cause": "—",
        "action": "—"
      }
    ],
    "imageKeys": []
  },
  {
    "code": "520",
    "codeDisplay": "E-0520",
    "title": "고전압 하네스 - 단락",
    "category": "고전압 배터리 시스템 (HVB & BMS)",
    "explanation": "고전압 하네스 - 단락 이 발생한 경우 고장코드 E-0520이 표출된다.",
    "suspected_parts": [
      "고전압 하네스"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0520/image_1.jpg",
      "dtc/E-0520/image_2.jpg",
      "dtc/E-0520/image_3.jpg",
      "dtc/E-0520/image_4.jpg",
      "dtc/E-0520/image_5.jpg",
      "dtc/E-0520/image_6.jpg",
      "dtc/E-0520/image_7.jpg",
      "dtc/E-0520/image_8.jpg",
      "dtc/E-0520/image_9.jpg",
      "dtc/E-0520/image_10.jpg",
      "dtc/E-0520/image_11.jpg",
      "dtc/E-0520/image_12.png",
      "dtc/E-0520/image_13.jpg"
    ]
  },
  {
    "code": "521",
    "codeDisplay": "E-0521",
    "title": "고전압 하네스 - 단락",
    "category": "고전압 배터리 시스템 (HVB & BMS)",
    "explanation": "고전압 하네스 - 단락 이 발생한 경우 고장코드 E-0521이 표출된다.",
    "suspected_parts": [
      "고전압 하네스"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0521/image_1.jpg",
      "dtc/E-0521/image_2.jpg",
      "dtc/E-0521/image_3.jpg",
      "dtc/E-0521/image_4.jpg",
      "dtc/E-0521/image_5.jpg",
      "dtc/E-0521/image_6.jpg",
      "dtc/E-0521/image_7.jpg",
      "dtc/E-0521/image_8.jpg",
      "dtc/E-0521/image_9.jpg",
      "dtc/E-0521/image_10.jpg",
      "dtc/E-0521/image_11.jpg",
      "dtc/E-0521/image_12.png",
      "dtc/E-0521/image_13.jpg"
    ]
  },
  {
    "code": "522",
    "codeDisplay": "E-0522",
    "title": "- 고전압 배터리(HVB)내부 이상",
    "category": "고전압 배터리 시스템 (HVB & BMS)",
    "explanation": "고전압 배터리(HVB)내부 이상이 발생한 경우 고장코드 E-0522가 표출된다.",
    "suspected_parts": [
      "고전압 배터리(HVB)"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0522/image_1.jpg",
      "dtc/E-0522/image_2.jpg",
      "dtc/E-0522/image_3.jpg",
      "dtc/E-0522/image_4.jpg",
      "dtc/E-0522/image_5.jpg",
      "dtc/E-0522/image_6.jpg",
      "dtc/E-0522/image_7.jpg"
    ]
  },
  {
    "code": "523",
    "codeDisplay": "E-0523",
    "title": "- 고전압 배터리(HVB)내부 이상",
    "category": "고전압 배터리 시스템 (HVB & BMS)",
    "explanation": "고전압 배터리(HVB)내부 이상이 발생한 경우 고장코드 E-0523이 표출된다.",
    "suspected_parts": [
      "고전압 배터리(HVB)"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0523/image_1.jpg",
      "dtc/E-0523/image_2.jpg",
      "dtc/E-0523/image_3.jpg",
      "dtc/E-0523/image_4.jpg",
      "dtc/E-0523/image_5.jpg",
      "dtc/E-0523/image_6.jpg",
      "dtc/E-0523/image_7.jpg"
    ]
  },
  {
    "code": "524",
    "codeDisplay": "E-0524",
    "title": "- 고전압 배터리(HVB)내부 이상",
    "category": "고전압 배터리 시스템 (HVB & BMS)",
    "explanation": "고전압 배터리(HVB)내부 이상이 발생한 경우 고장코드 E-0524가 표출된다.",
    "suspected_parts": [
      "고전압 배터리(HVB)"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0524/image_1.jpg",
      "dtc/E-0524/image_2.jpg",
      "dtc/E-0524/image_3.jpg",
      "dtc/E-0524/image_4.jpg",
      "dtc/E-0524/image_5.jpg",
      "dtc/E-0524/image_6.jpg",
      "dtc/E-0524/image_7.jpg"
    ]
  },
  {
    "code": "525",
    "codeDisplay": "E-0525",
    "title": "- 고전압 배터리(HVB)내부 이상",
    "category": "고전압 배터리 시스템 (HVB & BMS)",
    "explanation": "고전압 배터리(HVB)내부 이상이 발생한 경우 고장코드 E-0525가 표출된다.",
    "suspected_parts": [
      "고전압 배터리(HVB)"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0525/image_1.jpg",
      "dtc/E-0525/image_2.jpg",
      "dtc/E-0525/image_3.jpg",
      "dtc/E-0525/image_4.jpg",
      "dtc/E-0525/image_5.jpg",
      "dtc/E-0525/image_6.jpg",
      "dtc/E-0525/image_7.jpg"
    ]
  },
  {
    "code": "526",
    "codeDisplay": "E-0526",
    "title": "- 고전압 배터리(HVB)내부 이상",
    "category": "고전압 배터리 시스템 (HVB & BMS)",
    "explanation": "고전압 배터리(HVB)내부 이상이 발생한 경우 고장코드 E-0526이 표출된다.",
    "suspected_parts": [
      "고전압 배터리(HVB)"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0526/image_1.jpg",
      "dtc/E-0526/image_2.jpg",
      "dtc/E-0526/image_3.jpg",
      "dtc/E-0526/image_4.jpg",
      "dtc/E-0526/image_5.jpg",
      "dtc/E-0526/image_6.jpg",
      "dtc/E-0526/image_7.jpg"
    ]
  },
  {
    "code": "527",
    "codeDisplay": "E-0527",
    "title": "- 고전압 배터리(HVB) - 저온 감지",
    "category": "고전압 배터리 시스템 (HVB & BMS)",
    "explanation": "고전압 배터리(HVB) - 저온 감지가 발생한 경우 고장코드 E-0527이 표출된다.",
    "suspected_parts": [
      "고전압 배터리(HVB)"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0527/image_1.jpg",
      "dtc/E-0527/image_2.jpg",
      "dtc/E-0527/image_3.jpg",
      "dtc/E-0527/image_4.jpg",
      "dtc/E-0527/image_5.jpg",
      "dtc/E-0527/image_6.jpg",
      "dtc/E-0527/image_7.jpg"
    ]
  },
  {
    "code": "528",
    "codeDisplay": "E-0528",
    "title": "- 고전압 배터리(HVB) - 저온 감지",
    "category": "고전압 배터리 시스템 (HVB & BMS)",
    "explanation": "고전압 배터리(HVB) - 저온 감지가 발생한 경우 고장코드 E-0528이 표출된다.",
    "suspected_parts": [
      "고전압 배터리(HVB)"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0528/image_1.jpg",
      "dtc/E-0528/image_2.jpg",
      "dtc/E-0528/image_3.jpg",
      "dtc/E-0528/image_4.jpg",
      "dtc/E-0528/image_5.jpg",
      "dtc/E-0528/image_6.jpg",
      "dtc/E-0528/image_7.jpg"
    ]
  },
  {
    "code": "529",
    "codeDisplay": "E-0529",
    "title": "- 고전압 배터리(HVB) - 저온 감지",
    "category": "고전압 배터리 시스템 (HVB & BMS)",
    "explanation": "고전압 배터리(HVB) - 저온 감지가 발생한 경우 고장코드 E-0529가 표출된다.",
    "suspected_parts": [
      "고전압 배터리(HVB)"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0529/image_1.jpg",
      "dtc/E-0529/image_2.jpg",
      "dtc/E-0529/image_3.jpg",
      "dtc/E-0529/image_4.jpg",
      "dtc/E-0529/image_5.jpg",
      "dtc/E-0529/image_6.jpg",
      "dtc/E-0529/image_7.jpg"
    ]
  },
  {
    "code": "530",
    "codeDisplay": "E-0530",
    "title": "- 고전압 배터리(HVB) - 고온 감지",
    "category": "고전압 배터리 시스템 (HVB & BMS)",
    "explanation": "고전압 배터리(HVB) - 고온 감지가 발생한 경우 고장코드 E-0530이 표출된다.",
    "suspected_parts": [
      "고전압 배터리(HVB)"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0530/image_1.jpg",
      "dtc/E-0530/image_2.jpg",
      "dtc/E-0530/image_3.jpg",
      "dtc/E-0530/image_4.jpg",
      "dtc/E-0530/image_5.jpg",
      "dtc/E-0530/image_6.jpg",
      "dtc/E-0530/image_7.jpg"
    ]
  },
  {
    "code": "531",
    "codeDisplay": "E-0531",
    "title": "- 고전압 배터리(HVB) - 고온 감지",
    "category": "고전압 배터리 시스템 (HVB & BMS)",
    "explanation": "고전압 배터리(HVB) - 고온 감지가 발생한 경우 고장코드 E-0531이 표출된다.",
    "suspected_parts": [
      "고전압 배터리(HVB)"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0531/image_1.jpg",
      "dtc/E-0531/image_2.jpg",
      "dtc/E-0531/image_3.jpg",
      "dtc/E-0531/image_4.jpg",
      "dtc/E-0531/image_5.jpg",
      "dtc/E-0531/image_6.jpg",
      "dtc/E-0531/image_7.jpg"
    ]
  },
  {
    "code": "532",
    "codeDisplay": "E-0532",
    "title": "- 고전압 배터리(HVB) - 고온 감지",
    "category": "고전압 배터리 시스템 (HVB & BMS)",
    "explanation": "고전압 배터리(HVB) - 고온 감지가 발생한 경우 고장코드 E-0532가 표출된다.",
    "suspected_parts": [
      "고전압 배터리(HVB)"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0532/image_1.jpg",
      "dtc/E-0532/image_2.jpg",
      "dtc/E-0532/image_3.jpg",
      "dtc/E-0532/image_4.jpg",
      "dtc/E-0532/image_5.jpg",
      "dtc/E-0532/image_6.jpg",
      "dtc/E-0532/image_7.jpg"
    ]
  },
  {
    "code": "533",
    "codeDisplay": "E-0533",
    "title": "- 고전압 배터리(HVB) - 고온 감지",
    "category": "고전압 배터리 시스템 (HVB & BMS)",
    "explanation": "고전압 배터리(HVB) - 고온 감지가 발생한 경우 고장코드 E-0533이 표출된다.",
    "suspected_parts": [
      "고전압 배터리(HVB)"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0533/image_1.jpg",
      "dtc/E-0533/image_2.jpg",
      "dtc/E-0533/image_3.jpg",
      "dtc/E-0533/image_4.jpg",
      "dtc/E-0533/image_5.jpg",
      "dtc/E-0533/image_6.jpg",
      "dtc/E-0533/image_7.jpg"
    ]
  },
  {
    "code": "534",
    "codeDisplay": "E-0534",
    "title": "- 고전압 배터리(HVB) - 고온 감지",
    "category": "고전압 배터리 시스템 (HVB & BMS)",
    "explanation": "고전압 배터리(HVB) - 고온 감지가 발생한 경우 고장코드 E-0534가 표출된다.",
    "suspected_parts": [
      "고전압 배터리(HVB)"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0534/image_1.jpg",
      "dtc/E-0534/image_2.jpg",
      "dtc/E-0534/image_3.jpg",
      "dtc/E-0534/image_4.jpg",
      "dtc/E-0534/image_5.jpg",
      "dtc/E-0534/image_6.jpg",
      "dtc/E-0534/image_7.jpg"
    ]
  },
  {
    "code": "535",
    "codeDisplay": "E-0535",
    "title": "고전압 배터리(HVB) - 전류 과다",
    "category": "고전압 배터리 시스템 (HVB & BMS)",
    "explanation": "고전압 배터리(HVB) - 전류 과다가 발생한 경우 고장코드 E-0535가 표출된다.",
    "suspected_parts": [
      "고전압 하네스",
      "● 고전압 배터리(HVB)"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0535/image_1.jpg",
      "dtc/E-0535/image_2.jpg",
      "dtc/E-0535/image_3.jpg",
      "dtc/E-0535/image_4.jpg",
      "dtc/E-0535/image_5.jpg",
      "dtc/E-0535/image_6.jpg",
      "dtc/E-0535/image_7.jpg",
      "dtc/E-0535/image_8.jpg",
      "dtc/E-0535/image_9.jpg",
      "dtc/E-0535/image_10.jpg",
      "dtc/E-0535/image_11.jpg",
      "dtc/E-0535/image_12.png",
      "dtc/E-0535/image_13.jpg",
      "dtc/E-0535/image_14.jpg",
      "dtc/E-0535/image_15.png"
    ]
  },
  {
    "code": "536",
    "codeDisplay": "E-0536",
    "title": "고전압 배터리(HVB) - 전류 과다",
    "category": "고전압 배터리 시스템 (HVB & BMS)",
    "explanation": "고전압 배터리(HVB) - 전류 과다가 발생한 경우 고장코드 E-0536이 표출된다.",
    "suspected_parts": [
      "고전압 하네스",
      "● 고전압 배터리(HVB)"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0536/image_1.jpg",
      "dtc/E-0536/image_2.jpg",
      "dtc/E-0536/image_3.jpg",
      "dtc/E-0536/image_4.jpg",
      "dtc/E-0536/image_5.jpg",
      "dtc/E-0536/image_6.jpg",
      "dtc/E-0536/image_7.jpg",
      "dtc/E-0536/image_8.jpg",
      "dtc/E-0536/image_9.jpg",
      "dtc/E-0536/image_10.jpg",
      "dtc/E-0536/image_11.jpg",
      "dtc/E-0536/image_12.png",
      "dtc/E-0536/image_13.jpg",
      "dtc/E-0536/image_14.jpg",
      "dtc/E-0536/image_15.png"
    ]
  },
  {
    "code": "537",
    "codeDisplay": "E-0537",
    "title": "고전압 배터리(HVB) - 전류 과다",
    "category": "고전압 배터리 시스템 (HVB & BMS)",
    "explanation": "고전압 배터리(HVB) - 전류 과다가 발생한 경우 고장코드 E-0537이 표출된다.",
    "suspected_parts": [
      "고전압 하네스",
      "● 고전압 배터리(HVB)"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0537/image_1.jpg",
      "dtc/E-0537/image_2.jpg",
      "dtc/E-0537/image_3.jpg",
      "dtc/E-0537/image_4.jpg",
      "dtc/E-0537/image_5.jpg",
      "dtc/E-0537/image_6.jpg",
      "dtc/E-0537/image_7.jpg",
      "dtc/E-0537/image_8.jpg",
      "dtc/E-0537/image_9.jpg",
      "dtc/E-0537/image_10.jpg",
      "dtc/E-0537/image_11.jpg",
      "dtc/E-0537/image_12.jpg",
      "dtc/E-0537/image_13.png",
      "dtc/E-0537/image_14.jpg",
      "dtc/E-0537/image_15.png"
    ]
  },
  {
    "code": "538",
    "codeDisplay": "E-0538",
    "title": "- 고전압 배터리(HVB)내부 이상",
    "category": "고전압 배터리 시스템 (HVB & BMS)",
    "explanation": "고전압 배터리(HVB)내부 이상이 발생한 경우 고장코드 E-0538이 표출된다.",
    "suspected_parts": [
      "고전압 배터리(HVB)"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0538/image_1.jpg",
      "dtc/E-0538/image_2.jpg",
      "dtc/E-0538/image_3.jpg",
      "dtc/E-0538/image_4.jpg",
      "dtc/E-0538/image_5.jpg",
      "dtc/E-0538/image_6.jpg",
      "dtc/E-0538/image_7.jpg"
    ]
  },
  {
    "code": "539",
    "codeDisplay": "E-0539",
    "title": "- 고전압 배터리(HVB)내부 이상",
    "category": "고전압 배터리 시스템 (HVB & BMS)",
    "explanation": "고전압 배터리(HVB)내부 이상이 발생한 경우 고장코드 E-0539가 표출된다.",
    "suspected_parts": [
      "고전압 배터리(HVB)"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0539/image_1.jpg",
      "dtc/E-0539/image_2.jpg",
      "dtc/E-0539/image_3.jpg",
      "dtc/E-0539/image_4.jpg",
      "dtc/E-0539/image_5.jpg",
      "dtc/E-0539/image_6.jpg",
      "dtc/E-0539/image_7.jpg"
    ]
  },
  {
    "code": "540",
    "codeDisplay": "E-0540",
    "title": "- 고전압 배터리(HVB)내부 이상",
    "category": "고전압 배터리 시스템 (HVB & BMS)",
    "explanation": "고전압 배터리(HVB)내부 이상이 발생한 경우 고장코드 E-0540이 표출된다.",
    "suspected_parts": [
      "고전압 배터리(HVB)"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0540/image_1.jpg",
      "dtc/E-0540/image_2.jpg",
      "dtc/E-0540/image_3.jpg",
      "dtc/E-0540/image_4.jpg",
      "dtc/E-0540/image_5.jpg",
      "dtc/E-0540/image_6.jpg",
      "dtc/E-0540/image_7.jpg"
    ]
  },
  {
    "code": "541",
    "codeDisplay": "E-0541",
    "title": "- 고전압 배터리(HVB) - 셀 전압차 이상",
    "category": "고전압 배터리 시스템 (HVB & BMS)",
    "explanation": "고전압 배터리(HVB) - 셀 전압차 이상이 발생한 경우 고장코드 E-0541이 표출된다.",
    "suspected_parts": [
      "고전압 배터리(HVB)"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0541/image_1.jpg",
      "dtc/E-0541/image_2.jpg",
      "dtc/E-0541/image_3.jpg",
      "dtc/E-0541/image_4.jpg",
      "dtc/E-0541/image_5.jpg",
      "dtc/E-0541/image_6.jpg",
      "dtc/E-0541/image_7.jpg"
    ]
  },
  {
    "code": "542",
    "codeDisplay": "E-0542",
    "title": "- 고전압 배터리(HVB) - 셀 전압차 이상",
    "category": "고전압 배터리 시스템 (HVB & BMS)",
    "explanation": "고전압 배터리(HVB) - 셀 전압차 이상이 발생한 경우 고장코드 E-0542가 표출된다.",
    "suspected_parts": [
      "고전압 배터리(HVB)"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0542/image_1.jpg",
      "dtc/E-0542/image_2.jpg",
      "dtc/E-0542/image_3.jpg",
      "dtc/E-0542/image_4.jpg",
      "dtc/E-0542/image_5.jpg",
      "dtc/E-0542/image_6.jpg",
      "dtc/E-0542/image_7.jpg"
    ]
  },
  {
    "code": "543",
    "codeDisplay": "E-0543",
    "title": "- 고전압 배터리(HVB) - 셀 전압차 이상",
    "category": "고전압 배터리 시스템 (HVB & BMS)",
    "explanation": "고전압 배터리(HVB) - 셀 전압차 이상이 발생한 경우 고장코드 E-0543이 표출된다.",
    "suspected_parts": [
      "고전압 배터리(HVB)"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0543/image_1.jpg",
      "dtc/E-0543/image_2.jpg",
      "dtc/E-0543/image_3.jpg",
      "dtc/E-0543/image_4.jpg",
      "dtc/E-0543/image_5.jpg",
      "dtc/E-0543/image_6.jpg",
      "dtc/E-0543/image_7.jpg"
    ]
  },
  {
    "code": "544",
    "codeDisplay": "E-0544",
    "title": "- 고전압 배터리(HVB) - 셀 전압차 이상",
    "category": "고전압 배터리 시스템 (HVB & BMS)",
    "explanation": "고전압 배터리(HVB) - 셀 전압차 이상이 발생한 경우 고장코드 E-0544가 표출된다.",
    "suspected_parts": [
      "고전압 배터리(HVB)"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0544/image_1.jpg",
      "dtc/E-0544/image_2.jpg",
      "dtc/E-0544/image_3.jpg",
      "dtc/E-0544/image_4.jpg",
      "dtc/E-0544/image_5.jpg",
      "dtc/E-0544/image_6.jpg",
      "dtc/E-0544/image_7.jpg"
    ]
  },
  {
    "code": "545",
    "codeDisplay": "E-0545",
    "title": "- 고전압 배터리(HVB)내부 이상",
    "category": "고전압 배터리 시스템 (HVB & BMS)",
    "explanation": "고전압 배터리(HVB)내부 이상이 발생한 경우 고장코드 E-0545가 표출된다.",
    "suspected_parts": [
      "고전압 배터리(HVB)"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0545/image_1.jpg",
      "dtc/E-0545/image_2.jpg",
      "dtc/E-0545/image_3.jpg",
      "dtc/E-0545/image_4.jpg",
      "dtc/E-0545/image_5.jpg",
      "dtc/E-0545/image_6.jpg",
      "dtc/E-0545/image_7.jpg"
    ]
  },
  {
    "code": "546",
    "codeDisplay": "E-0546",
    "title": "고전압 배터리(HVB) - 전압 낮음",
    "category": "고전압 배터리 시스템 (HVB & BMS)",
    "explanation": "고전압 배터리(HVB) - 전압값이 낮을 경우 고장코드 E-0546이 표출된다.",
    "suspected_parts": [],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0546/image_1.jpg",
      "dtc/E-0546/image_2.jpg",
      "dtc/E-0546/image_3.png",
      "dtc/E-0546/image_4.jpg"
    ]
  },
  {
    "code": "548",
    "codeDisplay": "E-0548",
    "title": "고전압 배터리(HVB)내부 이상",
    "category": "고전압 배터리 시스템 (HVB & BMS)",
    "explanation": "고전압 배터리(HVB)내부 이상이 발생한 경우 고장코드 E-0548이 표출된다.",
    "suspected_parts": [
      "차량 컨트롤러(VCU)",
      "● 고전압 배터리(HVB)"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "차량 컨트롤러(VCU)",
        "terminal_1": "12V 릴레이 제어 (23)",
        "terminal_2": "차체 접지",
        "normal": "약 12V (배터리 전압)"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "전원 전압 제어 (45)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0548/image_1.jpg",
      "dtc/E-0548/image_2.jpg",
      "dtc/E-0548/image_3.jpg",
      "dtc/E-0548/image_4.jpg",
      "dtc/E-0548/image_5.jpg",
      "dtc/E-0548/image_6.jpg",
      "dtc/E-0548/image_7.jpg",
      "dtc/E-0548/image_8.png",
      "dtc/E-0548/image_9.jpg",
      "dtc/E-0548/image_10.jpg",
      "dtc/E-0548/image_11.jpg",
      "dtc/E-0548/image_12.jpg",
      "dtc/E-0548/image_13.png",
      "dtc/E-0548/image_14.jpg"
    ]
  },
  {
    "code": "549",
    "codeDisplay": "E-0549",
    "title": "고전압 배터리(HVB) - OBC+DC/DC 컨버터 통신 이상",
    "category": "고전압 배터리 시스템 (HVB & BMS)",
    "explanation": "고전압 배터리(HVB) - OBC+DC/DC 컨버터 통신 이상이 발생한 경우 고장코드 E-0549가 표출된다.",
    "suspected_parts": [
      "OBC+DC/DC 컨버터",
      "● 고전압 배터리(HVB)"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "OBC+DC/DC 컨버터",
        "terminal_1": "DC/DC 활성화 (B6)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "접지선 (G4)",
        "terminal_2": "차체 접지",
        "normal": "약 0V"
      },
      {
        "condition": "IG OFF (배터리 분리)",
        "target": "",
        "terminal_1": "차량 캔 - 하이 (B2)",
        "terminal_2": "차량 캔 - 로우 (B11)",
        "normal": "약 60Ω (저항측정)"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0549/image_1.png",
      "dtc/E-0549/image_2.jpg",
      "dtc/E-0549/image_3.jpg",
      "dtc/E-0549/image_4.jpg",
      "dtc/E-0549/image_5.jpg",
      "dtc/E-0549/image_6.jpg",
      "dtc/E-0549/image_7.jpg",
      "dtc/E-0549/image_8.jpg",
      "dtc/E-0549/image_9.jpg",
      "dtc/E-0549/image_10.png",
      "dtc/E-0549/image_11.jpg",
      "dtc/E-0549/image_12.jpg"
    ]
  },
  {
    "code": "550",
    "codeDisplay": "E-0550",
    "title": "- 고전압 배터리(HVB)내부 이상",
    "category": "고전압 배터리 시스템 (HVB & BMS)",
    "explanation": "고전압 배터리(HVB)내부 이상이 발생한 경우 고장코드 E-0550이 표출된다.",
    "suspected_parts": [
      "고전압 배터리(HVB)"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0550/image_1.jpg",
      "dtc/E-0550/image_2.jpg",
      "dtc/E-0550/image_3.jpg",
      "dtc/E-0550/image_4.jpg",
      "dtc/E-0550/image_5.jpg",
      "dtc/E-0550/image_6.jpg",
      "dtc/E-0550/image_7.jpg"
    ]
  },
  {
    "code": "551",
    "codeDisplay": "E-0551",
    "title": "- 고전압 배터리(HVB)내부 이상",
    "category": "고전압 배터리 시스템 (HVB & BMS)",
    "explanation": "고전압 배터리(HVB)내부 이상이 발생한 경우 고장코드 E-0551이 표출된다.",
    "suspected_parts": [
      "고전압 배터리(HVB)"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0551/image_1.jpg",
      "dtc/E-0551/image_2.jpg",
      "dtc/E-0551/image_3.jpg",
      "dtc/E-0551/image_4.jpg",
      "dtc/E-0551/image_5.jpg",
      "dtc/E-0551/image_6.jpg",
      "dtc/E-0551/image_7.jpg"
    ]
  },
  {
    "code": "552",
    "codeDisplay": "E-0552",
    "title": "- 고전압 배터리(HVB)내부 이상",
    "category": "고전압 배터리 시스템 (HVB & BMS)",
    "explanation": "고전압 배터리(HVB)내부 이상이 발생한 경우 고장코드 E-0552가 표출된다.",
    "suspected_parts": [
      "고전압 배터리(HVB)"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0552/image_1.jpg",
      "dtc/E-0552/image_2.jpg",
      "dtc/E-0552/image_3.jpg",
      "dtc/E-0552/image_4.jpg",
      "dtc/E-0552/image_5.jpg",
      "dtc/E-0552/image_6.jpg",
      "dtc/E-0552/image_7.jpg"
    ]
  },
  {
    "code": "553",
    "codeDisplay": "E-0553",
    "title": "- 고전압 배터리(HVB)내부 이상",
    "category": "고전압 배터리 시스템 (HVB & BMS)",
    "explanation": "고전압 배터리(HVB)내부 이상이 발생한 경우 고장코드 E-0553이 표출된다.",
    "suspected_parts": [
      "고전압 배터리(HVB)"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0553/image_1.jpg",
      "dtc/E-0553/image_2.jpg",
      "dtc/E-0553/image_3.jpg",
      "dtc/E-0553/image_4.jpg",
      "dtc/E-0553/image_5.jpg",
      "dtc/E-0553/image_6.jpg",
      "dtc/E-0553/image_7.jpg"
    ]
  },
  {
    "code": "554",
    "codeDisplay": "E-0554",
    "title": "- 고전압 배터리(HVB)내부 이상",
    "category": "고전압 배터리 시스템 (HVB & BMS)",
    "explanation": "고전압 배터리(HVB)내부 이상이 발생한 경우 고장코드 E-0554가 표출된다.",
    "suspected_parts": [
      "고전압 배터리(HVB)"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0554/image_1.jpg",
      "dtc/E-0554/image_2.jpg",
      "dtc/E-0554/image_3.jpg",
      "dtc/E-0554/image_4.jpg",
      "dtc/E-0554/image_5.jpg",
      "dtc/E-0554/image_6.jpg",
      "dtc/E-0554/image_7.jpg"
    ]
  },
  {
    "code": "555",
    "codeDisplay": "E-0555",
    "title": "- 고전압 배터리(HVB)내부 이상",
    "category": "고전압 배터리 시스템 (HVB & BMS)",
    "explanation": "고전압 배터리(HVB)내부 이상이 발생한 경우 고장코드 E-0555가 표출된다.",
    "suspected_parts": [
      "고전압 배터리(HVB)"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0555/image_1.jpg",
      "dtc/E-0555/image_2.jpg",
      "dtc/E-0555/image_3.jpg",
      "dtc/E-0555/image_4.jpg",
      "dtc/E-0555/image_5.jpg",
      "dtc/E-0555/image_6.jpg",
      "dtc/E-0555/image_7.jpg"
    ]
  },
  {
    "code": "556",
    "codeDisplay": "E-0556",
    "title": "- 고전압 배터리(HVB)내부 이상",
    "category": "고전압 배터리 시스템 (HVB & BMS)",
    "explanation": "고전압 배터리(HVB)내부 이상이 발생한 경우 고장코드 E-0556이 표출된다.",
    "suspected_parts": [
      "고전압 배터리(HVB)"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0556/image_1.jpg",
      "dtc/E-0556/image_2.jpg",
      "dtc/E-0556/image_3.jpg",
      "dtc/E-0556/image_4.jpg",
      "dtc/E-0556/image_5.jpg",
      "dtc/E-0556/image_6.jpg",
      "dtc/E-0556/image_7.jpg"
    ]
  },
  {
    "code": "557",
    "codeDisplay": "E-0557",
    "title": "- 고전압 차단 스위치 이상",
    "category": "고전압 배터리 시스템 (HVB & BMS)",
    "explanation": "고전압 차단 스위치 이상이 발생한 경우 고장코드 E-0557이 표출된다.",
    "suspected_parts": [
      "고전압 차단 스위치"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0557/image_1.jpg"
    ]
  },
  {
    "code": "558",
    "codeDisplay": "E-0558",
    "title": "배터리 팩 커버 스위치",
    "category": "고전압 배터리 시스템 (HVB & BMS)",
    "explanation": "",
    "suspected_parts": [],
    "wiring_steps": [],
    "causes": [
      {
        "cause": "—",
        "action": "—"
      }
    ],
    "imageKeys": []
  },
  {
    "code": "559",
    "codeDisplay": "E-0559",
    "title": "차량 컨트롤러(VCU) - 충전 통신 컨트롤러(EVCC) 통신 이상",
    "category": "고전압 배터리 시스템 (HVB & BMS)",
    "explanation": "차량 컨트롤러(VCU) - 충전 통신 컨트롤러(EVCC) 통신 이상이 발생한 경우 고장코드 E-0559가 표출된다.",
    "suspected_parts": [
      "차량 컨트롤러(VCU) 고장",
      "● 충전 통신 컨트롤러(EVCC) 고장"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "차량 컨트롤러(VCU)",
        "terminal_1": "12V 릴레이 제어 (23)",
        "terminal_2": "차체 접지",
        "normal": "약 12V (배터리 전압)"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "전원 전압 제어 (45)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0559/image_1.jpg",
      "dtc/E-0559/image_2.jpg",
      "dtc/E-0559/image_3.png",
      "dtc/E-0559/image_4.jpg",
      "dtc/E-0559/image_5.jpg",
      "dtc/E-0559/image_6.jpg",
      "dtc/E-0559/image_7.jpg",
      "dtc/E-0559/image_8.jpg",
      "dtc/E-0559/image_9.jpg",
      "dtc/E-0559/image_10.jpg",
      "dtc/E-0559/image_11.jpg",
      "dtc/E-0559/image_12.png",
      "dtc/E-0559/image_13.jpg",
      "dtc/E-0559/image_14.jpg",
      "dtc/E-0559/image_15.jpg",
      "dtc/E-0559/image_16.jpg"
    ]
  },
  {
    "code": "564",
    "codeDisplay": "E-0564",
    "title": "가열 접촉기 결함",
    "category": "고전압 배터리 시스템 (HVB & BMS)",
    "explanation": "",
    "suspected_parts": [],
    "wiring_steps": [],
    "causes": [
      {
        "cause": "손상된 가열 접촉기",
        "action": "접촉기를 교체하십시오"
      }
    ],
    "imageKeys": []
  },
  {
    "code": "565",
    "codeDisplay": "E-0565",
    "title": "- 고전압 배터리(HVB) 비정상 과열",
    "category": "고전압 배터리 시스템 (HVB & BMS)",
    "explanation": "",
    "suspected_parts": [],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": []
  },
  {
    "code": "620",
    "codeDisplay": "E-0620",
    "title": "OBC+DC/DC 컨버터 이상",
    "category": "충전 및 전력 변환 시스템 (OBC & DC-DC)",
    "explanation": "OBC+DC/DC 컨버터 이상이 발생한 경우 고장코드 E-0620이 표출된다.",
    "suspected_parts": [
      "OBC+DC/DC 컨버터"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "OBC+DC/DC 컨버터",
        "terminal_1": "DC/DC 활성화 (B6)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "접지선 (G4)",
        "terminal_2": "차체 접지",
        "normal": "약 0V"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0620/image_1.jpg",
      "dtc/E-0620/image_2.png",
      "dtc/E-0620/image_3.jpg",
      "dtc/E-0620/image_4.jpg",
      "dtc/E-0620/image_5.png",
      "dtc/E-0620/image_6.jpg",
      "dtc/E-0620/image_7.jpg",
      "dtc/E-0620/image_8.jpg",
      "dtc/E-0620/image_9.jpg",
      "dtc/E-0620/image_10.jpg",
      "dtc/E-0620/image_11.jpg"
    ]
  },
  {
    "code": "621",
    "codeDisplay": "E-0621",
    "title": "OBC+DC/DC 컨버터 온도 이상",
    "category": "충전 및 전력 변환 시스템 (OBC & DC-DC)",
    "explanation": "OBC+DC/DC 컨버터 온도 이상이 발생한 경우 고장코드 E-0621이 표출된다.",
    "suspected_parts": [
      "OBC+DC/DC 컨버터",
      "● 냉각 시스템 고장",
      "● 냉각수 통로 막힘",
      "● 냉각수 부족",
      "● 워터펌프 고장",
      "● 라디에이터 팬 고장"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "OBC+DC/DC 컨버터",
        "terminal_1": "DC/DC 활성화 (B6)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "접지선 (G4)",
        "terminal_2": "차체 접지",
        "normal": "약 0V"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0621/image_1.jpg",
      "dtc/E-0621/image_2.jpg",
      "dtc/E-0621/image_3.jpg",
      "dtc/E-0621/image_4.png",
      "dtc/E-0621/image_5.png",
      "dtc/E-0621/image_6.jpg",
      "dtc/E-0621/image_7.jpg",
      "dtc/E-0621/image_8.jpg",
      "dtc/E-0621/image_9.jpg",
      "dtc/E-0621/image_10.jpg",
      "dtc/E-0621/image_11.jpg",
      "dtc/E-0621/image_12.jpg",
      "dtc/E-0621/image_13.jpg",
      "dtc/E-0621/image_14.png",
      "dtc/E-0621/image_15.jpg",
      "dtc/E-0621/image_16.jpg",
      "dtc/E-0621/image_17.jpg",
      "dtc/E-0621/image_18.jpg",
      "dtc/E-0621/image_19.png",
      "dtc/E-0621/image_20.jpg"
    ]
  },
  {
    "code": "622",
    "codeDisplay": "E-0622",
    "title": "OBC+DC/DC 컨버터 - 전압 이상",
    "category": "충전 및 전력 변환 시스템 (OBC & DC-DC)",
    "explanation": "OBC+DC/DC 컨버터 - 전압 이상이 발생한 경우 고장코드 E-0622가 표출된다.",
    "suspected_parts": [
      "OBC+DC/DC 컨버터"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "OBC+DC/DC 컨버터",
        "terminal_1": "DC/DC 활성화 (B6)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "접지선 (G4)",
        "terminal_2": "차체 접지",
        "normal": "약 0V"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0622/image_1.jpg",
      "dtc/E-0622/image_2.png",
      "dtc/E-0622/image_3.jpg",
      "dtc/E-0622/image_4.jpg",
      "dtc/E-0622/image_5.png",
      "dtc/E-0622/image_6.jpg",
      "dtc/E-0622/image_7.jpg",
      "dtc/E-0622/image_8.jpg",
      "dtc/E-0622/image_9.jpg",
      "dtc/E-0622/image_10.jpg",
      "dtc/E-0622/image_11.jpg",
      "dtc/E-0622/image_12.jpg",
      "dtc/E-0622/image_13.jpg",
      "dtc/E-0622/image_14.png",
      "dtc/E-0622/image_15.jpg",
      "dtc/E-0622/image_16.jpg",
      "dtc/E-0622/image_17.png",
      "dtc/E-0622/image_18.jpg"
    ]
  },
  {
    "code": "624",
    "codeDisplay": "E-0624",
    "title": "OBC+DC/DC 컨버터 - 통신이상",
    "category": "충전 및 전력 변환 시스템 (OBC & DC-DC)",
    "explanation": "OBC+DC/DC 컨버터 - 통신 이상이 발생한 경우 고장코드 E-0624가 표출된다.",
    "suspected_parts": [
      "OBC+DC/DC 컨버터"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "OBC+DC/DC 컨버터",
        "terminal_1": "DC/DC 활성화 (B6)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "접지선 (G4)",
        "terminal_2": "차체 접지",
        "normal": "약 0V"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0624/image_1.jpg",
      "dtc/E-0624/image_2.png",
      "dtc/E-0624/image_3.jpg",
      "dtc/E-0624/image_4.jpg",
      "dtc/E-0624/image_5.png",
      "dtc/E-0624/image_6.jpg",
      "dtc/E-0624/image_7.jpg",
      "dtc/E-0624/image_8.jpg",
      "dtc/E-0624/image_9.jpg",
      "dtc/E-0624/image_10.jpg",
      "dtc/E-0624/image_11.jpg",
      "dtc/E-0624/image_12.jpg",
      "dtc/E-0624/image_13.jpg",
      "dtc/E-0624/image_14.png",
      "dtc/E-0624/image_15.jpg"
    ]
  },
  {
    "code": "625",
    "codeDisplay": "E-0625",
    "title": "충전건 이상",
    "category": "충전 및 전력 변환 시스템 (OBC & DC-DC)",
    "explanation": "충전건 이상이 발생한 경우 고장코드 E-0625가 표출된다.",
    "suspected_parts": [
      "충전 플러그 & 인렛 와이어링 하네스",
      "● 충전기 & 충전건"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0625/image_1.jpg",
      "dtc/E-0625/image_2.jpg",
      "dtc/E-0625/image_3.jpg",
      "dtc/E-0625/image_4.jpg",
      "dtc/E-0625/image_5.jpg",
      "dtc/E-0625/image_6.jpg",
      "dtc/E-0625/image_7.jpg",
      "dtc/E-0625/image_8.png",
      "dtc/E-0625/image_9.jpg",
      "dtc/E-0625/image_10.jpg",
      "dtc/E-0625/image_11.png",
      "dtc/E-0625/image_12.jpg"
    ]
  },
  {
    "code": "626",
    "codeDisplay": "E-0626",
    "title": "충전건 이상",
    "category": "충전 및 전력 변환 시스템 (OBC & DC-DC)",
    "explanation": "충전건 이상이 발생한 경우 고장코드 E-0626이 표출된다.",
    "suspected_parts": [
      "충전 플러그 & 인렛 와이어링 하네스",
      "● 충전기 & 충전건"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0626/image_1.jpg",
      "dtc/E-0626/image_2.jpg",
      "dtc/E-0626/image_3.jpg",
      "dtc/E-0626/image_4.jpg",
      "dtc/E-0626/image_5.jpg",
      "dtc/E-0626/image_6.jpg",
      "dtc/E-0626/image_7.jpg",
      "dtc/E-0626/image_8.png",
      "dtc/E-0626/image_9.jpg",
      "dtc/E-0626/image_10.jpg",
      "dtc/E-0626/image_11.png",
      "dtc/E-0626/image_12.jpg"
    ]
  },
  {
    "code": "627",
    "codeDisplay": "E-0627",
    "title": "OBC+DC/DC 컨버터 이상",
    "category": "충전 및 전력 변환 시스템 (OBC & DC-DC)",
    "explanation": "OBC+DC/DC 컨버터 이상이 발생한 경우 고장코드 E-0627이 표출된다.",
    "suspected_parts": [
      "OBC+DC/DC 컨버터"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "OBC+DC/DC 컨버터",
        "terminal_1": "DC/DC 활성화 (B6)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "접지선 (G4)",
        "terminal_2": "차체 접지",
        "normal": "약 0V"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0627/image_1.jpg",
      "dtc/E-0627/image_2.png",
      "dtc/E-0627/image_3.jpg",
      "dtc/E-0627/image_4.jpg",
      "dtc/E-0627/image_5.png",
      "dtc/E-0627/image_6.jpg",
      "dtc/E-0627/image_7.jpg",
      "dtc/E-0627/image_8.jpg",
      "dtc/E-0627/image_9.jpg",
      "dtc/E-0627/image_10.jpg",
      "dtc/E-0627/image_11.jpg"
    ]
  },
  {
    "code": "628",
    "codeDisplay": "E-0628",
    "title": "OBC+DC/DC 컨버터 온도 이상",
    "category": "충전 및 전력 변환 시스템 (OBC & DC-DC)",
    "explanation": "OBC+DC/DC 컨버터 온도 이상이 발생한 경우 고장코드 E-0628이 표출된다.",
    "suspected_parts": [
      "OBC+DC/DC 컨버터",
      "● 냉각 시스템 고장",
      "● 냉각수 통로 막힘",
      "● 냉각수 부족",
      "● 워터펌프 고장",
      "● 라디에이터 팬 고장"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "OBC+DC/DC 컨버터",
        "terminal_1": "DC/DC 활성화 (B6)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "접지선 (G4)",
        "terminal_2": "차체 접지",
        "normal": "약 0V"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0628/image_1.jpg",
      "dtc/E-0628/image_2.jpg",
      "dtc/E-0628/image_3.jpg",
      "dtc/E-0628/image_4.png",
      "dtc/E-0628/image_5.png",
      "dtc/E-0628/image_6.jpg",
      "dtc/E-0628/image_7.jpg",
      "dtc/E-0628/image_8.jpg",
      "dtc/E-0628/image_9.jpg",
      "dtc/E-0628/image_10.jpg",
      "dtc/E-0628/image_11.jpg",
      "dtc/E-0628/image_12.jpg",
      "dtc/E-0628/image_13.jpg",
      "dtc/E-0628/image_14.png",
      "dtc/E-0628/image_15.jpg",
      "dtc/E-0628/image_16.jpg",
      "dtc/E-0628/image_17.jpg",
      "dtc/E-0628/image_18.jpg",
      "dtc/E-0628/image_19.png",
      "dtc/E-0628/image_20.jpg"
    ]
  },
  {
    "code": "629",
    "codeDisplay": "E-0629",
    "title": "OBC+DC/DC 컨버터 - 전압 이상",
    "category": "충전 및 전력 변환 시스템 (OBC & DC-DC)",
    "explanation": "OBC+DC/DC 컨버터 - 전압 이상이 발생한 경우 고장코드 E-0629가 표출된다.",
    "suspected_parts": [
      "OBC+DC/DC 컨버터"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "OBC+DC/DC 컨버터",
        "terminal_1": "DC/DC 활성화 (B6)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "접지선 (G4)",
        "terminal_2": "차체 접지",
        "normal": "약 0V"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0629/image_1.jpg",
      "dtc/E-0629/image_2.png",
      "dtc/E-0629/image_3.jpg",
      "dtc/E-0629/image_4.jpg",
      "dtc/E-0629/image_5.png",
      "dtc/E-0629/image_6.jpg",
      "dtc/E-0629/image_7.jpg",
      "dtc/E-0629/image_8.jpg",
      "dtc/E-0629/image_9.jpg",
      "dtc/E-0629/image_10.jpg",
      "dtc/E-0629/image_11.jpg",
      "dtc/E-0629/image_12.jpg",
      "dtc/E-0629/image_13.png",
      "dtc/E-0629/image_14.jpg",
      "dtc/E-0629/image_15.jpg"
    ]
  },
  {
    "code": "720",
    "codeDisplay": "E-0720",
    "title": "가속 페달 센서 신호1 이상",
    "category": "차량 제어 및 편의/샤시 시스템 (VCU, 브레이크, 조향 등)",
    "explanation": "가속 페달 센서 신호1 이상이 발생한 경우 고장코드 E-0720이 표출된다.",
    "suspected_parts": [
      "가속 페달 고장",
      "● 커넥터 접촉 불량",
      "● 배선 단선",
      "● 차량 컨트롤러(VCU) 고장"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "차량 컨트롤러(VCU)",
        "terminal_1": "12V 릴레이 제어 (23)",
        "terminal_2": "차체 접지",
        "normal": "약 12V (배터리 전압)"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "전원 전압 제어 (45)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0720/image_1.png",
      "dtc/E-0720/image_2.jpg",
      "dtc/E-0720/image_3.jpg",
      "dtc/E-0720/image_4.jpg",
      "dtc/E-0720/image_5.jpg",
      "dtc/E-0720/image_6.jpg",
      "dtc/E-0720/image_7.jpg",
      "dtc/E-0720/image_8.jpg",
      "dtc/E-0720/image_9.jpg",
      "dtc/E-0720/image_10.jpg",
      "dtc/E-0720/image_11.jpg",
      "dtc/E-0720/image_12.png",
      "dtc/E-0720/image_13.jpg",
      "dtc/E-0720/image_14.png",
      "dtc/E-0720/image_15.jpg",
      "dtc/E-0720/image_16.jpg",
      "dtc/E-0720/image_17.jpg"
    ]
  },
  {
    "code": "721",
    "codeDisplay": "E-0721",
    "title": "가속 페달 센서 신호1 이상",
    "category": "차량 제어 및 편의/샤시 시스템 (VCU, 브레이크, 조향 등)",
    "explanation": "가속 페달 센서 신호1 이상이 발생한 경우 고장코드 E-0721이 표출된다.",
    "suspected_parts": [
      "가속 페달 고장",
      "● 커넥터 접촉 불량",
      "● 배선 단선",
      "● 차량 컨트롤러(VCU) 고장"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "차량 컨트롤러(VCU)",
        "terminal_1": "12V 릴레이 제어 (23)",
        "terminal_2": "차체 접지",
        "normal": "약 12V (배터리 전압)"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "전원 전압 제어 (45)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0721/image_1.png",
      "dtc/E-0721/image_2.jpg",
      "dtc/E-0721/image_3.jpg",
      "dtc/E-0721/image_4.jpg",
      "dtc/E-0721/image_5.jpg",
      "dtc/E-0721/image_6.jpg",
      "dtc/E-0721/image_7.jpg",
      "dtc/E-0721/image_8.jpg",
      "dtc/E-0721/image_9.jpg",
      "dtc/E-0721/image_10.jpg",
      "dtc/E-0721/image_11.jpg",
      "dtc/E-0721/image_12.png",
      "dtc/E-0721/image_13.jpg",
      "dtc/E-0721/image_14.png",
      "dtc/E-0721/image_15.jpg",
      "dtc/E-0721/image_16.jpg",
      "dtc/E-0721/image_17.jpg"
    ]
  },
  {
    "code": "722",
    "codeDisplay": "E-0722",
    "title": "가속 페달 센서 신호2 이상",
    "category": "차량 제어 및 편의/샤시 시스템 (VCU, 브레이크, 조향 등)",
    "explanation": "가속 페달 센서 신호2 이상이 발생한 경우 고장코드 E-0722가 표출된다.",
    "suspected_parts": [
      "가속 페달 고장",
      "● 커넥터 접촉 불량",
      "● 배선 단선",
      "● 차량 컨트롤러(VCU) 고장"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "차량 컨트롤러(VCU)",
        "terminal_1": "12V 릴레이 제어 (23)",
        "terminal_2": "차체 접지",
        "normal": "약 12V (배터리 전압)"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "전원 전압 제어 (45)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0722/image_1.png",
      "dtc/E-0722/image_2.jpg",
      "dtc/E-0722/image_3.jpg",
      "dtc/E-0722/image_4.jpg",
      "dtc/E-0722/image_5.jpg",
      "dtc/E-0722/image_6.jpg",
      "dtc/E-0722/image_7.jpg",
      "dtc/E-0722/image_8.jpg",
      "dtc/E-0722/image_9.jpg",
      "dtc/E-0722/image_10.jpg",
      "dtc/E-0722/image_11.jpg",
      "dtc/E-0722/image_12.png",
      "dtc/E-0722/image_13.jpg",
      "dtc/E-0722/image_14.png",
      "dtc/E-0722/image_15.jpg",
      "dtc/E-0722/image_16.jpg",
      "dtc/E-0722/image_17.jpg"
    ]
  },
  {
    "code": "723",
    "codeDisplay": "E-0723",
    "title": "가속 페달 센서 신호2 이상",
    "category": "차량 제어 및 편의/샤시 시스템 (VCU, 브레이크, 조향 등)",
    "explanation": "가속 페달 센서 신호2 이상이 발생한 경우 고장코드 E-0723이 표출된다.",
    "suspected_parts": [
      "가속 페달 고장",
      "● 커넥터 접촉 불량",
      "● 배선 단선",
      "● 차량 컨트롤러(VCU) 고장"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "차량 컨트롤러(VCU)",
        "terminal_1": "12V 릴레이 제어 (23)",
        "terminal_2": "차체 접지",
        "normal": "약 12V (배터리 전압)"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "전원 전압 제어 (45)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0723/image_1.png",
      "dtc/E-0723/image_2.jpg",
      "dtc/E-0723/image_3.jpg",
      "dtc/E-0723/image_4.jpg",
      "dtc/E-0723/image_5.jpg",
      "dtc/E-0723/image_6.jpg",
      "dtc/E-0723/image_7.jpg",
      "dtc/E-0723/image_8.jpg",
      "dtc/E-0723/image_9.jpg",
      "dtc/E-0723/image_10.jpg",
      "dtc/E-0723/image_11.jpg",
      "dtc/E-0723/image_12.png",
      "dtc/E-0723/image_13.jpg",
      "dtc/E-0723/image_14.png",
      "dtc/E-0723/image_15.jpg",
      "dtc/E-0723/image_16.jpg",
      "dtc/E-0723/image_17.jpg"
    ]
  },
  {
    "code": "724",
    "codeDisplay": "E-0724",
    "title": "가속 페달 센서 이상",
    "category": "차량 제어 및 편의/샤시 시스템 (VCU, 브레이크, 조향 등)",
    "explanation": "가속 페달 센서 이상이 발생한 경우 고장코드 E-0724가 표출된다.",
    "suspected_parts": [
      "가속 페달 고장",
      "● 커넥터 접촉 불량",
      "● 배선 단선",
      "● 차량 컨트롤러(VCU) 고장"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "차량 컨트롤러(VCU)",
        "terminal_1": "12V 릴레이 제어 (23)",
        "terminal_2": "차체 접지",
        "normal": "약 12V (배터리 전압)"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "전원 전압 제어 (45)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0724/image_1.png",
      "dtc/E-0724/image_2.jpg",
      "dtc/E-0724/image_3.jpg",
      "dtc/E-0724/image_4.jpg",
      "dtc/E-0724/image_5.jpg",
      "dtc/E-0724/image_6.jpg",
      "dtc/E-0724/image_7.jpg",
      "dtc/E-0724/image_8.jpg",
      "dtc/E-0724/image_9.jpg",
      "dtc/E-0724/image_10.jpg",
      "dtc/E-0724/image_11.jpg",
      "dtc/E-0724/image_12.png",
      "dtc/E-0724/image_13.jpg",
      "dtc/E-0724/image_14.png",
      "dtc/E-0724/image_15.jpg",
      "dtc/E-0724/image_16.jpg",
      "dtc/E-0724/image_17.jpg"
    ]
  },
  {
    "code": "725",
    "codeDisplay": "E-0725",
    "title": "진공 압렵 센서 이상",
    "category": "차량 제어 및 편의/샤시 시스템 (VCU, 브레이크, 조향 등)",
    "explanation": "진공 압력 센서 이상이 발생한 경우 고장코드 E-0725가 표출된다.",
    "suspected_parts": [
      "커넥터 접촉 불량",
      "● 진공 압력 센서 이상",
      "● 차량 컨트롤러(VCU) 고장"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "진공 압력 센서",
        "terminal_1": "진공 압력 센서 / 브레이크 페달 센서 전원 공급 장치 (3)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "진공 압력 센서 접지 (1)",
        "terminal_2": "차체 접지",
        "normal": "약 0V"
      },
      {
        "condition": "",
        "target": "차량 컨트롤러(VCU) 진공 압력 센서",
        "terminal_1": "진공 압력 센서 / 브레이크 페달 센서 전원 공급 장치 (29)",
        "terminal_2": "진공 압력 센서 / 브레이크 페달 센서 전원 공급 장치 (3)",
        "normal": "약 1Ω 이하"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "진공 압력 센서 접지 (67)",
        "terminal_2": "진공 압력 센서 접지 (1)",
        "normal": "약 1Ω 이하"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "외기 온도 센서 신호 (32)",
        "terminal_2": "외기 온도 센서 신호 (2)",
        "normal": "약 1Ω 이하"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "진공 압력 센서 신호 (12)",
        "terminal_2": "진공 압력 센서 신호 (4)",
        "normal": "약 1Ω 이하"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0725/image_1.jpg",
      "dtc/E-0725/image_2.jpg",
      "dtc/E-0725/image_3.jpg",
      "dtc/E-0725/image_4.jpg",
      "dtc/E-0725/image_5.jpg",
      "dtc/E-0725/image_6.jpg",
      "dtc/E-0725/image_7.jpg",
      "dtc/E-0725/image_8.jpg",
      "dtc/E-0725/image_9.png",
      "dtc/E-0725/image_10.jpg",
      "dtc/E-0725/image_11.png",
      "dtc/E-0725/image_12.png",
      "dtc/E-0725/image_13.jpg",
      "dtc/E-0725/image_14.jpg",
      "dtc/E-0725/image_15.png",
      "dtc/E-0725/image_16.jpg"
    ]
  },
  {
    "code": "726",
    "codeDisplay": "E-0726",
    "title": "진공 압렵 센서 이상",
    "category": "차량 제어 및 편의/샤시 시스템 (VCU, 브레이크, 조향 등)",
    "explanation": "진공 압력 센서 이상이 발생한 경우 고장코드 E-0726이 표출된다.",
    "suspected_parts": [
      "커넥터 접촉 불량",
      "● 진공 압력 센서 이상",
      "● 진공 호스 이상",
      "● 차량 컨트롤러(VCU) 고장"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "진공 압력 센서",
        "terminal_1": "진공 압력 센서 / 브레이크 페달 센서 전원 공급 장치 (3)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "진공 압력 센서 접지 (1)",
        "terminal_2": "차체 접지",
        "normal": "약 0V"
      },
      {
        "condition": "",
        "target": "차량 컨트롤러(VCU) 진공 압력 센서",
        "terminal_1": "진공 압력 센서 / 브레이크 페달 센서 전원 공급 장치 (29)",
        "terminal_2": "진공 압력 센서 / 브레이크 페달 센서 전원 공급 장치 (3)",
        "normal": "약 1Ω 이하"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "진공 압력 센서 접지 (67)",
        "terminal_2": "진공 압력 센서 접지 (1)",
        "normal": "약 1Ω 이하"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "외기 온도 센서 신호 (32)",
        "terminal_2": "외기 온도 센서 신호 (2)",
        "normal": "약 1Ω 이하"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "진공 압력 센서 신호 (12)",
        "terminal_2": "진공 압력 센서 신호 (4)",
        "normal": "약 1Ω 이하"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0726/image_1.jpg",
      "dtc/E-0726/image_2.jpg",
      "dtc/E-0726/image_3.jpg",
      "dtc/E-0726/image_4.jpg",
      "dtc/E-0726/image_5.jpg",
      "dtc/E-0726/image_6.jpg",
      "dtc/E-0726/image_7.jpg",
      "dtc/E-0726/image_8.jpg",
      "dtc/E-0726/image_9.png",
      "dtc/E-0726/image_10.jpg",
      "dtc/E-0726/image_11.png",
      "dtc/E-0726/image_12.png",
      "dtc/E-0726/image_13.png",
      "dtc/E-0726/image_14.jpg",
      "dtc/E-0726/image_15.jpg",
      "dtc/E-0726/image_16.jpg"
    ]
  },
  {
    "code": "727",
    "codeDisplay": "E-0727",
    "title": "진공 펌프 이상",
    "category": "차량 제어 및 편의/샤시 시스템 (VCU, 브레이크, 조향 등)",
    "explanation": "진공 펌프 이상이 발생한 경우 고장코드 E-0727이 표출된다.",
    "suspected_parts": [
      "커넥터 접촉 불량",
      "● 진공 펌프 이상"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0727/image_1.jpg",
      "dtc/E-0727/image_2.jpg",
      "dtc/E-0727/image_3.jpg",
      "dtc/E-0727/image_4.jpg",
      "dtc/E-0727/image_5.jpg",
      "dtc/E-0727/image_6.jpg",
      "dtc/E-0727/image_7.jpg",
      "dtc/E-0727/image_8.jpg",
      "dtc/E-0727/image_9.png"
    ]
  },
  {
    "code": "728",
    "codeDisplay": "E-0728",
    "title": "스티어링 컬럼 샤프트(MDPS) 이상",
    "category": "차량 제어 및 편의/샤시 시스템 (VCU, 브레이크, 조향 등)",
    "explanation": "스티어링 컬럼 샤프트(MDPS) 이상이 발생한 경우 고장코드 E-0728이 표출된다.",
    "suspected_parts": [
      "커넥터 접촉 불량",
      "● 스티어링 컬럼 샤프트(MDPS)"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0728/image_1.png",
      "dtc/E-0728/image_2.jpg",
      "dtc/E-0728/image_3.jpg",
      "dtc/E-0728/image_4.jpg",
      "dtc/E-0728/image_5.jpg",
      "dtc/E-0728/image_6.jpg",
      "dtc/E-0728/image_7.jpg",
      "dtc/E-0728/image_8.jpg",
      "dtc/E-0728/image_9.jpg"
    ]
  },
  {
    "code": "729",
    "codeDisplay": "E-0729",
    "title": "스티어링 컬럼 샤프트(MDPS) 이상",
    "category": "차량 제어 및 편의/샤시 시스템 (VCU, 브레이크, 조향 등)",
    "explanation": "스티어링 컬럼 샤프트(MDPS) 이상이 발생한 경우 고장코드 E-0729가 표출된다.",
    "suspected_parts": [
      "커넥터 접촉 불량",
      "● 스티어링 컬럼 샤프트(MDPS)"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0729/image_1.png",
      "dtc/E-0729/image_2.jpg",
      "dtc/E-0729/image_3.jpg",
      "dtc/E-0729/image_4.jpg",
      "dtc/E-0729/image_5.jpg",
      "dtc/E-0729/image_6.jpg",
      "dtc/E-0729/image_7.jpg",
      "dtc/E-0729/image_8.jpg",
      "dtc/E-0729/image_9.jpg"
    ]
  },
  {
    "code": "730",
    "codeDisplay": "E-0730",
    "title": "고전압 배전기(PDU) - 단선",
    "category": "차량 제어 및 편의/샤시 시스템 (VCU, 브레이크, 조향 등)",
    "explanation": "고전압 배전기(PDU) 단선이 발생한 경우 고장코드 E-0730이 표출된다.",
    "suspected_parts": [
      "고전압 배전기(PDU)",
      "● 고전압 배전기(PDU) 릴레이",
      "● 고전압 배전기(PDU) 퓨즈"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0730/image_1.jpg",
      "dtc/E-0730/image_2.jpg",
      "dtc/E-0730/image_3.jpg",
      "dtc/E-0730/image_4.jpg",
      "dtc/E-0730/image_5.jpg",
      "dtc/E-0730/image_6.jpg",
      "dtc/E-0730/image_7.jpg",
      "dtc/E-0730/image_8.jpg",
      "dtc/E-0730/image_9.jpg",
      "dtc/E-0730/image_10.jpg",
      "dtc/E-0730/image_11.jpg"
    ]
  },
  {
    "code": "731",
    "codeDisplay": "E-0731",
    "title": "모터 컨트롤러(MCU) 이상",
    "category": "차량 제어 및 편의/샤시 시스템 (VCU, 브레이크, 조향 등)",
    "explanation": "모터 컨트롤러(MCU) 내부 이상이 발생한 경우 고장코드 E-0731이 표출된다.",
    "suspected_parts": [
      "모터 컨트롤러(MCU)"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "모터 컨트롤러(MCU)",
        "terminal_1": "웨이크업 릴레이 87 (11)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "접지선 (4)",
        "terminal_2": "차체 접지",
        "normal": "약 0V"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0731/image_1.jpg",
      "dtc/E-0731/image_2.jpg",
      "dtc/E-0731/image_3.jpg",
      "dtc/E-0731/image_4.jpg",
      "dtc/E-0731/image_5.jpg",
      "dtc/E-0731/image_6.jpg",
      "dtc/E-0731/image_7.jpg",
      "dtc/E-0731/image_8.jpg",
      "dtc/E-0731/image_9.jpg",
      "dtc/E-0731/image_10.jpg",
      "dtc/E-0731/image_11.png"
    ]
  },
  {
    "code": "732",
    "codeDisplay": "E-0732",
    "title": "차량 컨트롤러(VCU)내부 이상",
    "category": "차량 제어 및 편의/샤시 시스템 (VCU, 브레이크, 조향 등)",
    "explanation": "차량 컨트롤러(VCU)내부 이상이 발생한 경우 고장코드 E-0732가 표출된다.",
    "suspected_parts": [
      "차량 컨트롤러(VCU) 고장"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "차량 컨트롤러(VCU)",
        "terminal_1": "12V 릴레이 제어 (23)",
        "terminal_2": "차체 접지",
        "normal": "약 12V (배터리 전압)"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "전원 전압 제어 (45)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0732/image_1.jpg",
      "dtc/E-0732/image_2.jpg",
      "dtc/E-0732/image_3.jpg",
      "dtc/E-0732/image_4.jpg",
      "dtc/E-0732/image_5.jpg",
      "dtc/E-0732/image_6.jpg",
      "dtc/E-0732/image_7.jpg",
      "dtc/E-0732/image_8.jpg",
      "dtc/E-0732/image_9.jpg",
      "dtc/E-0732/image_10.png",
      "dtc/E-0732/image_11.jpg",
      "dtc/E-0732/image_12.png",
      "dtc/E-0732/image_13.jpg"
    ]
  },
  {
    "code": "733",
    "codeDisplay": "E-0733",
    "title": "차량 컨트롤러(VCU)내부 이상",
    "category": "차량 제어 및 편의/샤시 시스템 (VCU, 브레이크, 조향 등)",
    "explanation": "차량 컨트롤러(VCU)내부 이상이 발생한 경우 고장코드 E-0733이 표출된다.",
    "suspected_parts": [
      "차량 컨트롤러(VCU) 고장"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "차량 컨트롤러(VCU)",
        "terminal_1": "12V 릴레이 제어 (23)",
        "terminal_2": "차체 접지",
        "normal": "약 12V (배터리 전압)"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "전원 전압 제어 (45)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0733/image_1.jpg",
      "dtc/E-0733/image_2.jpg",
      "dtc/E-0733/image_3.jpg",
      "dtc/E-0733/image_4.jpg",
      "dtc/E-0733/image_5.jpg",
      "dtc/E-0733/image_6.jpg",
      "dtc/E-0733/image_7.jpg",
      "dtc/E-0733/image_8.jpg",
      "dtc/E-0733/image_9.jpg",
      "dtc/E-0733/image_10.png",
      "dtc/E-0733/image_11.jpg",
      "dtc/E-0733/image_12.png",
      "dtc/E-0733/image_13.jpg"
    ]
  },
  {
    "code": "734",
    "codeDisplay": "E-0734",
    "title": "보조 배터리(12V) - 전압 이상",
    "category": "차량 제어 및 편의/샤시 시스템 (VCU, 브레이크, 조향 등)",
    "explanation": "보조 배터리(12V) - 전압 이상이 발생한 경우 고장코드 E-0734가 표출된다.",
    "suspected_parts": [
      "보조 배터리(12V)"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0734/image_1.jpg",
      "dtc/E-0734/image_2.jpg",
      "dtc/E-0734/image_3.jpg",
      "dtc/E-0734/image_4.jpg",
      "dtc/E-0734/image_5.jpg"
    ]
  },
  {
    "code": "735",
    "codeDisplay": "E-0735",
    "title": "냉각수 없음",
    "category": "차량 제어 및 편의/샤시 시스템 (VCU, 브레이크, 조향 등)",
    "explanation": "냉각수 없음 혹은 부족할 경우 고장코드 E-0735가 표출된다.",
    "suspected_parts": [],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0735/image_1.jpg",
      "dtc/E-0735/image_2.png",
      "dtc/E-0735/image_3.jpg",
      "dtc/E-0735/image_4.jpg"
    ]
  },
  {
    "code": "736",
    "codeDisplay": "E-0736",
    "title": "워터펌프 이상",
    "category": "차량 제어 및 편의/샤시 시스템 (VCU, 브레이크, 조향 등)",
    "explanation": "워터펌프 이상이 발생한 경우 고장코드 E-0736이 표출된다.",
    "suspected_parts": [
      "워터펌프 고장"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "워터펌프",
        "terminal_1": "워터펌프 전원 (1)",
        "terminal_2": "워터펌프 접지 (2)",
        "normal": "무한대 (저항)"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "VCU 신호선 (40)",
        "terminal_2": "VCU 신호선 (81)",
        "normal": "80 ~ 100 (저항) 통전 (전압)"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0736/image_1.jpg",
      "dtc/E-0736/image_2.png",
      "dtc/E-0736/image_3.jpg",
      "dtc/E-0736/image_4.jpg",
      "dtc/E-0736/image_5.jpg",
      "dtc/E-0736/image_6.jpg"
    ]
  },
  {
    "code": "737",
    "codeDisplay": "E-0737",
    "title": "차량 가상 사운드(AVAS) 이상",
    "category": "차량 제어 및 편의/샤시 시스템 (VCU, 브레이크, 조향 등)",
    "explanation": "차량 가상 사운드(AVAS) 이상이 발생한 경우 고장코드 E-0737이 표출된다.",
    "suspected_parts": [
      "차량 가상 사운드(AVAS) 고장",
      "● 차량 컨트롤러(VCU) 고장"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "차량 가상 사운드(AVAS)",
        "terminal_1": "웨이크업 전원 12V(+) (9)",
        "terminal_2": "차체 접지",
        "normal": "약 12V (배터리 전압)"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "접지 (6)",
        "terminal_2": "차체 접지",
        "normal": "약 0V"
      },
      {
        "condition": "IG OFF (배터리 분리)",
        "target": "",
        "terminal_1": "차량 캔 - 하이 (11)",
        "terminal_2": "차량 캔 - 로우 (12)",
        "normal": "약 60Ω (저항측정)"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0737/image_1.jpg",
      "dtc/E-0737/image_2.png",
      "dtc/E-0737/image_3.jpg",
      "dtc/E-0737/image_4.jpg",
      "dtc/E-0737/image_5.jpg",
      "dtc/E-0737/image_6.jpg",
      "dtc/E-0737/image_7.jpg",
      "dtc/E-0737/image_8.png",
      "dtc/E-0737/image_9.jpg",
      "dtc/E-0737/image_10.png",
      "dtc/E-0737/image_11.jpg",
      "dtc/E-0737/image_12.jpg"
    ]
  },
  {
    "code": "738",
    "codeDisplay": "E-0738",
    "title": "OBC+DC/DC 컨버터 이상",
    "category": "차량 제어 및 편의/샤시 시스템 (VCU, 브레이크, 조향 등)",
    "explanation": "OBC+DC/DC 컨버터 이상이 발생한 경우 고장코드 E-0738이 표출된다.",
    "suspected_parts": [
      "OBC+DC/DC 컨버터"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "OBC+DC/DC 컨버터",
        "terminal_1": "DC/DC 활성화 (B6)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "접지선 (G4)",
        "terminal_2": "차체 접지",
        "normal": "약 0V"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0738/image_1.jpg",
      "dtc/E-0738/image_2.png",
      "dtc/E-0738/image_3.jpg",
      "dtc/E-0738/image_4.jpg",
      "dtc/E-0738/image_5.png",
      "dtc/E-0738/image_6.jpg",
      "dtc/E-0738/image_7.jpg",
      "dtc/E-0738/image_8.jpg",
      "dtc/E-0738/image_9.jpg",
      "dtc/E-0738/image_10.jpg",
      "dtc/E-0738/image_11.jpg"
    ]
  },
  {
    "code": "739",
    "codeDisplay": "E-0739",
    "title": "OBC+DC/DC 컨버터 이상",
    "category": "차량 제어 및 편의/샤시 시스템 (VCU, 브레이크, 조향 등)",
    "explanation": "OBC+DC/DC 컨버터 이상이 발생한 경우 고장코드 E-0739가 표출된다.",
    "suspected_parts": [
      "OBC+DC/DC 컨버터"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "OBC+DC/DC 컨버터",
        "terminal_1": "DC/DC 활성화 (B6)",
        "terminal_2": "차체 접지",
        "normal": "약 5V"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "접지선 (G4)",
        "terminal_2": "차체 접지",
        "normal": "약 0V"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0739/image_1.jpg",
      "dtc/E-0739/image_2.png",
      "dtc/E-0739/image_3.jpg",
      "dtc/E-0739/image_4.jpg",
      "dtc/E-0739/image_5.png",
      "dtc/E-0739/image_6.jpg",
      "dtc/E-0739/image_7.jpg",
      "dtc/E-0739/image_8.jpg",
      "dtc/E-0739/image_9.jpg",
      "dtc/E-0739/image_10.jpg",
      "dtc/E-0739/image_11.jpg"
    ]
  },
  {
    "code": "740",
    "codeDisplay": "E-0740",
    "title": "메인 릴레이 이상",
    "category": "차량 제어 및 편의/샤시 시스템 (VCU, 브레이크, 조향 등)",
    "explanation": "",
    "suspected_parts": [],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0740/image_1.jpg"
    ]
  },
  {
    "code": "741",
    "codeDisplay": "E-0741",
    "title": "ESC 모듈 이상",
    "category": "차량 제어 및 편의/샤시 시스템 (VCU, 브레이크, 조향 등)",
    "explanation": "ESC 모듈 이상이 발생한 경우 고장코드 E-0741이 표출된다.",
    "suspected_parts": [
      "ABS 하이드로릭 유닛 + ESC 모듈",
      "● 차량 컨트롤러(VCU) 고장"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "ABS 하이드로릭 유닛 + ESC 모듈",
        "terminal_1": "모터 전원 B+ (25)",
        "terminal_2": "차체 접지",
        "normal": "약 12V (배터리 전압)"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "솔레노이드 전원 B+ (9)",
        "terminal_2": "차체 접지",
        "normal": "약 12V (배터리 전압)"
      },
      {
        "condition": "IG OFF (배터리 분리)",
        "target": "",
        "terminal_1": "차량 캔 - 하이 (11)",
        "terminal_2": "차량 캔 - 로우 (10)",
        "normal": "약 60Ω (저항측정)"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0741/image_1.jpg",
      "dtc/E-0741/image_2.png",
      "dtc/E-0741/image_3.jpg",
      "dtc/E-0741/image_4.jpg",
      "dtc/E-0741/image_5.jpg",
      "dtc/E-0741/image_6.jpg",
      "dtc/E-0741/image_7.jpg",
      "dtc/E-0741/image_8.jpg",
      "dtc/E-0741/image_9.png",
      "dtc/E-0741/image_10.png",
      "dtc/E-0741/image_11.jpg",
      "dtc/E-0741/image_12.jpg",
      "dtc/E-0741/image_13.jpg",
      "dtc/E-0741/image_14.png",
      "dtc/E-0741/image_15.jpg",
      "dtc/E-0741/image_16.png",
      "dtc/E-0741/image_17.jpg",
      "dtc/E-0741/image_18.jpg",
      "dtc/E-0741/image_19.jpg"
    ]
  },
  {
    "code": "742",
    "codeDisplay": "E-0742",
    "title": "ABS 하이드로릭 유닛 이상",
    "category": "차량 제어 및 편의/샤시 시스템 (VCU, 브레이크, 조향 등)",
    "explanation": "ABS 하이드로릭 유닛 이상이 발생한 경우 고장코드 E-0742가 표출된다.",
    "suspected_parts": [
      "ABS 하이드로릭 유닛 + ESC 모듈",
      "● 차량 컨트롤러(VCU) 고장"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "ABS 하이드로릭 유닛 + ESC 모듈",
        "terminal_1": "모터 전원 B+ (25)",
        "terminal_2": "차체 접지",
        "normal": "약 12V (배터리 전압)"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "솔레노이드 전원 B+ (9)",
        "terminal_2": "차체 접지",
        "normal": "약 12V (배터리 전압)"
      },
      {
        "condition": "IG OFF (배터리 분리)",
        "target": "",
        "terminal_1": "차량 캔 - 하이 (11)",
        "terminal_2": "차량 캔 - 로우 (10)",
        "normal": "약 60Ω (저항측정)"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0742/image_1.jpg",
      "dtc/E-0742/image_2.png",
      "dtc/E-0742/image_3.jpg",
      "dtc/E-0742/image_4.jpg",
      "dtc/E-0742/image_5.jpg",
      "dtc/E-0742/image_6.jpg",
      "dtc/E-0742/image_7.jpg",
      "dtc/E-0742/image_8.jpg",
      "dtc/E-0742/image_9.png",
      "dtc/E-0742/image_10.png",
      "dtc/E-0742/image_11.jpg",
      "dtc/E-0742/image_12.jpg",
      "dtc/E-0742/image_13.jpg",
      "dtc/E-0742/image_14.png",
      "dtc/E-0742/image_15.jpg",
      "dtc/E-0742/image_16.png",
      "dtc/E-0742/image_17.jpg",
      "dtc/E-0742/image_18.jpg",
      "dtc/E-0742/image_19.jpg"
    ]
  },
  {
    "code": "743",
    "codeDisplay": "E-0743",
    "title": "ABS 하이드로릭 유닛 - 통신 이상",
    "category": "차량 제어 및 편의/샤시 시스템 (VCU, 브레이크, 조향 등)",
    "explanation": "ABS 하이드로릭 유닛 - 통신 이상이 발생한 경우 고장코드 E-0743이 표출된다.",
    "suspected_parts": [
      "ABS 하이드로릭 유닛 + ESC 모듈",
      "● 차량 컨트롤러(VCU) 고장"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "ABS 하이드로릭 유닛 + ESC 모듈",
        "terminal_1": "모터 전원 B+ (25)",
        "terminal_2": "차체 접지",
        "normal": "약 12V (배터리 전압)"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "솔레노이드 전원 B+ (9)",
        "terminal_2": "차체 접지",
        "normal": "약 12V (배터리 전압)"
      },
      {
        "condition": "IG OFF (배터리 분리)",
        "target": "",
        "terminal_1": "차량 캔 - 하이 (11)",
        "terminal_2": "차량 캔 - 로우 (10)",
        "normal": "약 60Ω (저항측정)"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0743/image_1.jpg",
      "dtc/E-0743/image_2.png",
      "dtc/E-0743/image_3.jpg",
      "dtc/E-0743/image_4.jpg",
      "dtc/E-0743/image_5.jpg",
      "dtc/E-0743/image_6.jpg",
      "dtc/E-0743/image_7.jpg",
      "dtc/E-0743/image_8.jpg",
      "dtc/E-0743/image_9.png",
      "dtc/E-0743/image_10.png",
      "dtc/E-0743/image_11.jpg",
      "dtc/E-0743/image_12.jpg",
      "dtc/E-0743/image_13.jpg",
      "dtc/E-0743/image_14.png",
      "dtc/E-0743/image_15.jpg",
      "dtc/E-0743/image_16.png",
      "dtc/E-0743/image_17.jpg",
      "dtc/E-0743/image_18.jpg",
      "dtc/E-0743/image_19.jpg"
    ]
  },
  {
    "code": "744",
    "codeDisplay": "E-0744",
    "title": "- 고전압 차단 스위치 이상",
    "category": "차량 제어 및 편의/샤시 시스템 (VCU, 브레이크, 조향 등)",
    "explanation": "고전압 차단 스위치 이상이 발생한 경우 고장코드 E-0744가 표출된다.",
    "suspected_parts": [
      "고전압 차단 스위치"
    ],
    "wiring_steps": [],
    "causes": null,
    "imageKeys": [
      "dtc/E-0744/image_1.jpg"
    ]
  },
  {
    "code": "745",
    "codeDisplay": "E-0745",
    "title": "ESC 모듈 이상",
    "category": "차량 제어 및 편의/샤시 시스템 (VCU, 브레이크, 조향 등)",
    "explanation": "ESC 모듈 이상이 발생한 경우 고장코드 E-0745가 표출된다.",
    "suspected_parts": [
      "ABS 하이드로릭 유닛 + ESC 모듈",
      "● 차량 컨트롤러(VCU) 고장"
    ],
    "wiring_steps": [
      {
        "condition": "EV ON",
        "target": "ABS 하이드로릭 유닛 + ESC 모듈",
        "terminal_1": "모터 전원 B+ (25)",
        "terminal_2": "차체 접지",
        "normal": "약 12V (배터리 전압)"
      },
      {
        "condition": "",
        "target": "",
        "terminal_1": "솔레노이드 전원 B+ (9)",
        "terminal_2": "차체 접지",
        "normal": "약 12V (배터리 전압)"
      },
      {
        "condition": "IG OFF (배터리 분리)",
        "target": "",
        "terminal_1": "차량 캔 - 하이 (11)",
        "terminal_2": "차량 캔 - 로우 (10)",
        "normal": "약 60Ω (저항측정)"
      }
    ],
    "causes": null,
    "imageKeys": [
      "dtc/E-0745/image_1.jpg",
      "dtc/E-0745/image_2.png",
      "dtc/E-0745/image_3.jpg",
      "dtc/E-0745/image_4.jpg",
      "dtc/E-0745/image_5.jpg",
      "dtc/E-0745/image_6.jpg",
      "dtc/E-0745/image_7.jpg",
      "dtc/E-0745/image_8.jpg",
      "dtc/E-0745/image_9.png",
      "dtc/E-0745/image_10.png",
      "dtc/E-0745/image_11.jpg",
      "dtc/E-0745/image_12.jpg",
      "dtc/E-0745/image_13.jpg",
      "dtc/E-0745/image_14.png",
      "dtc/E-0745/image_15.jpg",
      "dtc/E-0745/image_16.png",
      "dtc/E-0745/image_17.jpg",
      "dtc/E-0745/image_18.jpg",
      "dtc/E-0745/image_19.jpg"
    ]
  }
];

export const DTC_META = {
  "builtAt": "2026-05-20T05:11:00.604Z",
  "source": "DTC/dtc_data.json + DTC코드.xlsx(보조)",
  "migratedCount": 109,
  "xlsxOnlyCount": 5,
  "count": 114,
  "withImagesCount": 108,
  "storageBucket": "dtc"
};

export const DTC_STORAGE_BUCKET = "dtc";
