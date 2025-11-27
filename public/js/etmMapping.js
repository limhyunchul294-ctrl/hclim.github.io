/**
 * 전장회로도(ETM) 매핑 데이터
 * etm.csv 파일을 기반으로 생성
 */

// 페이지 범위 문자열 파싱 (예: "4-6" → [4, 6], "7" → [7, 7])
function parsePageRange(pageStr) {
    if (!pageStr || pageStr.trim() === '') return null;
    const parts = pageStr.toString().split('-').map(p => parseInt(p.trim()));
    if (parts.length === 1) {
        return [parts[0], parts[0]];
    }
    return [parts[0], parts[1]];
}

// ETM 트리 데이터
const etmTreeData = [
    {
        id: 'etm-1',
        label: '■1. 고전압 시스템',
        type: 'folder',
        children: [
            { id: 'etm-1-1', label: '1.1 BMS (Battery Management System)', type: 'pdf' },
            { id: 'etm-1-2', label: '1.2 고전압 배터리', type: 'pdf' },
            { id: 'etm-1-3', label: '1.3 OBC+DC/DC컨버터', type: 'pdf' },
            { id: 'etm-1-4', label: '1.4 PDU (Power Distribution Unit)', type: 'pdf' },
            { id: 'etm-1-5', label: '1.5 충전 플러그', type: 'pdf' },
            { id: 'etm-1-6', label: '1.6 EVCC (Electric Vehicle Communication Controller)', type: 'pdf' }
        ]
    },
    {
        id: 'etm-2',
        label: '■2. 구동 및 제어 시스템',
        type: 'folder',
        children: [
            { id: 'etm-2-1', label: '2.1 MCU (Motor Control Unit)', type: 'pdf' },
            { id: 'etm-2-2', label: '2.2 VCU (Vehicle Control Unit)', type: 'pdf' },
            { id: 'etm-2-3', label: '2.3 점화 스위치 (Ignition Switch)', type: 'pdf' },
            { id: 'etm-2-4', label: '2.4 가속 페달', type: 'pdf' },
            { id: 'etm-2-5', label: '2.5 변속 다이얼', type: 'pdf' },
            { id: 'etm-2-6', label: '2.6 보조 배터리', type: 'pdf' },
            { id: 'etm-2-7', label: '2.7 흡기 압력 온도 센서', type: 'pdf' },
            { id: 'etm-2-8', label: '2.8 워터 펌프', type: 'pdf' }
        ]
    },
    {
        id: 'etm-3',
        label: '■3. 조향 및 제동 시스템',
        type: 'folder',
        children: [
            { id: 'etm-3-1', label: '3.1 스티어링 컬럼 샤프트(EPS)', type: 'pdf' },
            { id: 'etm-3-2', label: '3.2 ABS 하이드로릭 유닛 (ABS/ESC)', type: 'pdf' },
            { id: 'etm-3-3', label: '3.3 진공 펌프 (Vacuum Pump)', type: 'pdf' },
            { id: 'etm-3-4', label: '3.4 브레이크 스위치 (Brake Switch)', type: 'pdf' },
            { id: 'etm-3-5', label: '3.4 휠 스피드 센서', type: 'pdf' },
            { id: 'etm-3-6', label: '3.5 주차 브레이크 / 브레이크 액 레벨 스위치', type: 'pdf' },
            { id: 'etm-3-7', label: '3.6 TPMS(Tire Pressure Monitoring System)', type: 'pdf' }
        ]
    },
    {
        id: 'etm-4',
        label: '■4. 냉난방 공조 시스템(HVAC)',
        type: 'folder',
        children: [
            { id: 'etm-4-1', label: '4.1 A/C 컴프레서', type: 'pdf' },
            { id: 'etm-4-2', label: '4.2 블로어 / 블로어 레지스터', type: 'pdf' },
            { id: 'etm-4-3', label: '4.3 PTC 히터', type: 'pdf' },
            { id: 'etm-4-4', label: '4.4 공조 컨트롤 패널 (HVAC Control swtich)', type: 'pdf' },
            { id: 'etm-4-5', label: '4.5 에바포레이터 온도 센서, A/C 압력 스위치', type: 'pdf' }
        ]
    },
    {
        id: 'etm-5',
        label: '■5. 차체 전장 시스템',
        type: 'folder',
        children: [
            { id: 'etm-5-1', label: '5.1 계기판 (CLU)', type: 'pdf' },
            { id: 'etm-5-2', label: '5.2 에어백 (Airbag)', type: 'pdf' },
            { id: 'etm-5-3', label: '5.3 클락 스프링 (Clock Spring)', type: 'pdf' },
            { id: 'etm-5-4', label: '5.4 AVAS (Acoustic Vehicle Alerting System) / 경음기', type: 'pdf' },
            { id: 'etm-5-5', label: '5.5 중앙 잠금 장치 (Central Lock) / 도어 잠금 장치', type: 'pdf' },
            { id: 'etm-5-6', label: '5.6 파워 윈도우 (Power Window)', type: 'pdf' },
            { id: 'etm-5-7', label: '5.7 Front 시트 센서 / 시트 벨트 스위치', type: 'pdf' },
            { id: 'etm-5-8', label: '5.8 Rear 시트 센서 / 시트 벨트 스위치', type: 'pdf' },
            { id: 'etm-5-9', label: '5.9 멀티미디어 오디오, 스피커, 안테나, 후방 카메라', type: 'pdf' },
            { id: 'etm-5-10', label: '5.10 시가잭', type: 'pdf' },
            { id: 'etm-5-11', label: '5.11 와이퍼 (Wiper) / 워셔 (Washer)', type: 'pdf' }
        ]
    },
    {
        id: 'etm-6',
        label: '■6. 등화(Lamp) 시스템',
        type: 'folder',
        children: [
            { id: 'etm-6-1', label: '6.1 오토 라이트 컨트롤 모듈 / 오토 라이트 스위치', type: 'pdf' },
            { id: 'etm-6-2', label: '6.2 포토 센서', type: 'pdf' },
            { id: 'etm-6-3', label: '6.3 다기능 스위치 / 전조등', type: 'pdf' },
            { id: 'etm-6-4', label: '6.4 비상등', type: 'pdf' },
            { id: 'etm-6-5', label: '6.5 DRL (Daytime Running Light)', type: 'pdf' },
            { id: 'etm-6-6', label: '6.6 안개등(Fog Lamp)', type: 'pdf' },
            { id: 'etm-6-7', label: '6.7 후진등(Reversing Lamp)', type: 'pdf' },
            { id: 'etm-6-8', label: '6.8 천장등 (Dome Lamp)', type: 'pdf' }
        ]
    },
    {
        id: 'etm-7',
        label: '■7. 통신 및 진단 시스템',
        type: 'folder',
        children: [
            { id: 'etm-7-1', label: '7.1 통합 CAN', type: 'pdf' },
            { id: 'etm-7-2', label: '7.2 CAN0 계통도', type: 'pdf' },
            { id: 'etm-7-3', label: '7.3 CAN1 계통도', type: 'pdf' },
            { id: 'etm-7-4', label: '7.4 CAN2 계통도', type: 'pdf' },
            { id: 'etm-7-5', label: '7.5 CAN3 계통도', type: 'pdf' },
            { id: 'etm-7-6', label: '7.6 K-Line 계통도', type: 'pdf' },
            { id: 'etm-7-7', label: '7.7 진단 인터페이스', type: 'pdf' }
        ]
    },
    {
        id: 'etm-8',
        label: '■8. 전원 및 접지 시스템',
        type: 'folder',
        children: [
            { id: 'etm-8-1', label: '8.1 퓨즈 및 릴레이', type: 'pdf' },
            { id: 'etm-8-2', label: '8.2 전원 회로도_1', type: 'pdf' },
            { id: 'etm-8-3', label: '8.3 전원 회로도_2', type: 'pdf' },
            { id: 'etm-8-4', label: '8.4 전원 회로도_3', type: 'pdf' },
            { id: 'etm-8-5', label: '8.5 전원 회로도_4', type: 'pdf' },
            { id: 'etm-8-6', label: '8.6 전원 회로도_5', type: 'pdf' },
            { id: 'etm-8-7', label: '8.7 접지 회로도_1', type: 'pdf' },
            { id: 'etm-8-8', label: '8.8 접지 회로도_2', type: 'pdf' }
        ]
    }
];

// ETM PDF 매핑 데이터
const etmMapping = {
    'etm-1-1': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [4, 6], title: '1.1 BMS (Battery Management System)', type: 'pdf' },
    'etm-1-2': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [7, 7], title: '1.2 고전압 배터리', type: 'pdf' },
    'etm-1-3': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [8, 9], title: '1.3 OBC+DC/DC컨버터', type: 'pdf' },
    'etm-1-4': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [10, 11], title: '1.4 PDU (Power Distribution Unit)', type: 'pdf' },
    'etm-1-5': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [12, 13], title: '1.5 충전 플러그', type: 'pdf' },
    'etm-1-6': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [14, 15], title: '1.6 EVCC (Electric Vehicle Communication Controller)', type: 'pdf' },
    'etm-2-1': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [17, 18], title: '2.1 MCU (Motor Control Unit)', type: 'pdf' },
    'etm-2-2': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [19, 22], title: '2.2 VCU (Vehicle Control Unit)', type: 'pdf' },
    'etm-2-3': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [23, 24], title: '2.3 점화 스위치 (Ignition Switch)', type: 'pdf' },
    'etm-2-4': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [25, 26], title: '2.4 가속 페달', type: 'pdf' },
    'etm-2-5': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [27, 28], title: '2.5 변속 다이얼', type: 'pdf' },
    'etm-2-6': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [29, 30], title: '2.6 보조 배터리', type: 'pdf' },
    'etm-2-7': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [31, 32], title: '2.7 흡기 압력 온도 센서', type: 'pdf' },
    'etm-2-8': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [33, 34], title: '2.8 워터 펌프', type: 'pdf' },
    'etm-3-1': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [36, 37], title: '3.1 스티어링 컬럼 샤프트(EPS)', type: 'pdf' },
    'etm-3-2': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [38, 39], title: '3.2 ABS 하이드로릭 유닛 (ABS/ESC)', type: 'pdf' },
    'etm-3-3': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [40, 41], title: '3.3 진공 펌프 (Vacuum Pump)', type: 'pdf' },
    'etm-3-4': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [42, 43], title: '3.4 브레이크 스위치 (Brake Switch)', type: 'pdf' },
    'etm-3-5': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [44, 45], title: '3.4 휠 스피드 센서', type: 'pdf' },
    'etm-3-6': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [46, 47], title: '3.5 주차 브레이크 / 브레이크 액 레벨 스위치', type: 'pdf' },
    'etm-3-7': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [48, 49], title: '3.6 TPMS(Tire Pressure Monitoring System)', type: 'pdf' },
    'etm-4-1': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [51, 52], title: '4.1 A/C 컴프레서', type: 'pdf' },
    'etm-4-2': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [53, 54], title: '4.2 블로어 / 블로어 레지스터', type: 'pdf' },
    'etm-4-3': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [55, 56], title: '4.3 PTC 히터', type: 'pdf' },
    'etm-4-4': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [57, 58], title: '4.4 공조 컨트롤 패널 (HVAC Control swtich)', type: 'pdf' },
    'etm-4-5': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [59, 60], title: '4.5 에바포레이터 온도 센서, A/C 압력 스위치', type: 'pdf' },
    'etm-5-1': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [62, 65], title: '5.1 계기판 (CLU)', type: 'pdf' },
    'etm-5-2': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [66, 69], title: '5.2 에어백 (Airbag)', type: 'pdf' },
    'etm-5-3': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [70, 71], title: '5.3 클락 스프링 (Clock Spring)', type: 'pdf' },
    'etm-5-4': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [72, 73], title: '5.4 AVAS (Acoustic Vehicle Alerting System) / 경음기', type: 'pdf' },
    'etm-5-5': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [74, 75], title: '5.5 중앙 잠금 장치 (Central Lock) / 도어 잠금 장치', type: 'pdf' },
    'etm-5-6': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [76, 77], title: '5.6 파워 윈도우 (Power Window)', type: 'pdf' },
    'etm-5-7': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [78, 79], title: '5.7 Front 시트 센서 / 시트 벨트 스위치', type: 'pdf' },
    'etm-5-8': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [80, 81], title: '5.8 Rear 시트 센서 / 시트 벨트 스위치', type: 'pdf' },
    'etm-5-9': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [82, 83], title: '5.9 멀티미디어 오디오, 스피커, 안테나, 후방 카메라', type: 'pdf' },
    'etm-5-10': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [84, 85], title: '5.10 시가잭', type: 'pdf' },
    'etm-5-11': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [86, 87], title: '5.11 와이퍼 (Wiper) / 워셔 (Washer)', type: 'pdf' },
    'etm-6-1': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [89, 90], title: '6.1 오토 라이트 컨트롤 모듈 / 오토 라이트 스위치', type: 'pdf' },
    'etm-6-2': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [91, 92], title: '6.2 포토 센서', type: 'pdf' },
    'etm-6-3': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [93, 94], title: '6.3 다기능 스위치 / 전조등', type: 'pdf' },
    'etm-6-4': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [95, 96], title: '6.4 비상등', type: 'pdf' },
    'etm-6-5': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [97, 98], title: '6.5 DRL (Daytime Running Light)', type: 'pdf' },
    'etm-6-6': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [99, 100], title: '6.6 안개등(Fog Lamp)', type: 'pdf' },
    'etm-6-7': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [101, 102], title: '6.7 후진등(Reversing Lamp)', type: 'pdf' },
    'etm-6-8': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [103, 104], title: '6.8 천장등 (Dome Lamp)', type: 'pdf' },
    'etm-7-1': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [106, 106], title: '7.1 통합 CAN', type: 'pdf' },
    'etm-7-2': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [107, 108], title: '7.2 CAN0 계통도', type: 'pdf' },
    'etm-7-3': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [109, 110], title: '7.3 CAN1 계통도', type: 'pdf' },
    'etm-7-4': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [111, 112], title: '7.4 CAN2 계통도', type: 'pdf' },
    'etm-7-5': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [113, 114], title: '7.5 CAN3 계통도', type: 'pdf' },
    'etm-7-6': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [115, 116], title: '7.6 K-Line 계통도', type: 'pdf' },
    'etm-7-7': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [117, 118], title: '7.7 진단 인터페이스', type: 'pdf' },
    'etm-8-1': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [120, 120], title: '8.1 퓨즈 및 릴레이', type: 'pdf' },
    'etm-8-2': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [121, 121], title: '8.2 전원 회로도_1', type: 'pdf' },
    'etm-8-3': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [122, 122], title: '8.3 전원 회로도_2', type: 'pdf' },
    'etm-8-4': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [123, 123], title: '8.4 전원 회로도_3', type: 'pdf' },
    'etm-8-5': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [124, 124], title: '8.5 전원 회로도_4', type: 'pdf' },
    'etm-8-6': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [125, 125], title: '8.6 전원 회로도_5', type: 'pdf' },
    'etm-8-7': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [126, 126], title: '8.7 접지 회로도_1', type: 'pdf' },
    'etm-8-8': { fileName: 'ETM.pdf', bucket: 'etm', pageRange: [127, 127], title: '8.8 접지 회로도_2', type: 'pdf' }
};

