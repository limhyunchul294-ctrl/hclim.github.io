/**
 * MASADA QQ 전장 회로도(ETM) 매핑
 * QQ_ETM/split 폴더의 분할 PDF 1파일 = 목차 1항목 (전체 페이지 표시)
 * Storage 경로: manual 버킷 / MASADA-QQ-ETM/{storageKey} (ASCII 키만 사용)
 */

const QQ_ETM_STORAGE_PREFIX = 'MASADA-QQ-ETM';

/** @type {{ id: string, file: string, storageKey: string, label: string }[]} */
const QQ_ETM_ITEMS = [
    { id: 'qq-etm-00', file: '00_표지·개정·목차·사양표.pdf', storageKey: 'qq-etm-00.pdf', label: '표지·개정·목차·사양표' },
    { id: 'qq-etm-01', file: '01_본 매뉴얼 사용법.pdf', storageKey: 'qq-etm-01.pdf', label: '본 매뉴얼 사용법' },
    { id: 'qq-etm-02', file: '02_문제해결.pdf', storageKey: 'qq-etm-02.pdf', label: '문제해결' },
    { id: 'qq-etm-03', file: '03_퓨즈 및 릴레이 정보.pdf', storageKey: 'qq-etm-03.pdf', label: '퓨즈 및 릴레이 정보' },
    { id: 'qq-etm-04', file: '04_배전.pdf', storageKey: 'qq-etm-04.pdf', label: '배전' },
    { id: 'qq-etm-05', file: '05_제어 모듈 위치 및 단자 정의.pdf', storageKey: 'qq-etm-05.pdf', label: '제어 모듈 위치 및 단자 정의' },
    { id: 'qq-etm-06', file: '06_접지 지점 배치도.pdf', storageKey: 'qq-etm-06.pdf', label: '접지 지점 배치도' },
    { id: 'qq-etm-07', file: '07_와이어 하니스 위치도.pdf', storageKey: 'qq-etm-07.pdf', label: '와이어 하니스 위치도' },
    // 08 차량 개략도 — 14개 서브시스템 회로도
    { id: 'qq-etm-08-01', file: '08-01_고전압 전원 공급장치 시스템.pdf', storageKey: 'qq-etm-08-01.pdf', label: '고전압 전원 공급장치 시스템' },
    { id: 'qq-etm-08-02', file: '08-02_고전압 인터록 시스템·시동 스위치.pdf', storageKey: 'qq-etm-08-02.pdf', label: '고전압 인터록 시스템·시동 스위치' },
    { id: 'qq-etm-08-03', file: '08-03_전원 시동·Three-in-one·완속 충전·전원 배터리(BMS) 시스템.pdf', storageKey: 'qq-etm-08-03.pdf', label: '전원 시동·Three-in-one·완속 충전·전원 배터리(BMS) 시스템' },
    { id: 'qq-etm-08-04', file: '08-04_백업 전원·EPS 시스템·ETC·USB.pdf', storageKey: 'qq-etm-08-04.pdf', label: '백업 전원·EPS 시스템·ETC·USB' },
    { id: 'qq-etm-08-05', file: '08-05_모터 컨트롤러(MCU)·구동 모터·컴프레서 컨트롤러.pdf', storageKey: 'qq-etm-08-05.pdf', label: '모터 컨트롤러(MCU)·구동 모터·컴프레서 컨트롤러' },
    { id: 'qq-etm-08-06', file: '08-06_차량 컨트롤러(VCU).pdf', storageKey: 'qq-etm-08-06.pdf', label: '차량 컨트롤러(VCU)' },
    { id: 'qq-etm-08-07', file: '08-07_ABS 시스템.pdf', storageKey: 'qq-etm-08-07.pdf', label: 'ABS 시스템' },
    { id: 'qq-etm-08-08', file: '08-08_BCM.pdf', storageKey: 'qq-etm-08-08.pdf', label: 'BCM (차체 제어 모듈)' },
    { id: 'qq-etm-08-09', file: '08-09_A_C 시스템.pdf', storageKey: 'qq-etm-08-09.pdf', label: 'A/C 시스템' },
    { id: 'qq-etm-08-10', file: '08-10_계기판·보행자 알림.pdf', storageKey: 'qq-etm-08-10.pdf', label: '계기판·보행자 알림' },
    { id: 'qq-etm-08-11', file: '08-11_멀티미디어 시스템·T-박스.pdf', storageKey: 'qq-etm-08-11.pdf', label: '멀티미디어 시스템·T-박스' },
    { id: 'qq-etm-08-12', file: '08-12_에어백 시스템.pdf', storageKey: 'qq-etm-08-12.pdf', label: '에어백 시스템' },
    { id: 'qq-etm-08-13', file: '08-13_후진 레이더 시스템·진단 인터페이스.pdf', storageKey: 'qq-etm-08-13.pdf', label: '후진 레이더 시스템·진단 인터페이스' },
    { id: 'qq-etm-08-14', file: '08-14_네트워크 토폴로지 다이어그램.pdf', storageKey: 'qq-etm-08-14.pdf', label: '네트워크 토폴로지 다이어그램' },
];

function etmItemById(id) {
    const item = QQ_ETM_ITEMS.find((it) => it.id === id);
    return {
        id: item.id,
        label: item.label,
        type: 'pdf',
        storageKey: item.storageKey,
    };
}

const qqEtmTreeData = [
    {
        id: 'qq-etm-grp-guide',
        label: '■ 매뉴얼 안내',
        type: 'folder',
        children: ['qq-etm-00', 'qq-etm-01', 'qq-etm-02'].map(etmItemById),
    },
    {
        id: 'qq-etm-grp-power',
        label: '■ 전원·배전·제어',
        type: 'folder',
        children: ['qq-etm-03', 'qq-etm-04', 'qq-etm-05'].map(etmItemById),
    },
    {
        id: 'qq-etm-grp-ground',
        label: '■ 접지·와이어 하니스',
        type: 'folder',
        children: ['qq-etm-06', 'qq-etm-07'].map(etmItemById),
    },
    {
        id: 'qq-etm-grp-schematic',
        label: '■ 차량 개략도 (회로도)',
        type: 'folder',
        children: QQ_ETM_ITEMS.filter((it) => it.id.startsWith('qq-etm-08-')).map((it) => etmItemById(it.id)),
    },
];

function generateQQEtmMapping() {
    const mapping = {};
    function processNode(node) {
        if (node.children) {
            node.children.forEach(processNode);
            return;
        }
        if (node.type === 'pdf' && node.storageKey) {
            mapping[node.id] = {
                fileName: `${QQ_ETM_STORAGE_PREFIX}/${node.storageKey}`,
                bucket: 'manual',
                title: node.label,
                type: 'pdf',
            };
        }
    }
    qqEtmTreeData.forEach(processNode);
    return mapping;
}

const qqEtmMapping = generateQQEtmMapping();

export {
    QQ_ETM_ITEMS,
    QQ_ETM_STORAGE_PREFIX,
    qqEtmTreeData,
    qqEtmMapping,
};

if (typeof window !== 'undefined') {
    window.qqEtmTreeData = qqEtmTreeData;
    window.qqEtmMapping = qqEtmMapping;
}
