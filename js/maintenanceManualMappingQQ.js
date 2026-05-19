/**
 * MASADA QQ 정비지침서 매핑
 * QQ_SM 폴더의 챕터별 PDF 1파일 = 목차 1항목 (전체 페이지 표시)
 * Storage 경로: manual 버킷 / MASADA-QQ/{storageKey} (ASCII만 사용)
 */

const QQ_SM_STORAGE_PREFIX = 'MASADA-QQ';

/** @type {{ num: string, file: string, storageKey: string, label: string }[]} */
const QQ_CHAPTERS = [
    { num: '01', file: '01_서문.pdf', storageKey: 'qq-01.pdf', label: '1 – 서문' },
    { num: '02', file: '02_소개.pdf', storageKey: 'qq-02.pdf', label: '2 – 소개' },
    { num: '03', file: '03_유지보수.pdf', storageKey: 'qq-03.pdf', label: '3 – 유지보수' },
    { num: '04', file: '04_VCU.pdf', storageKey: 'qq-04.pdf', label: '4 – 차량 제어 유닛 (VCU)' },
    { num: '05', file: '05_CDU.pdf', storageKey: 'qq-05.pdf', label: '5 – 전력 변환·분배 유닛 (CDU)' },
    { num: '06', file: '06_MCU.pdf', storageKey: 'qq-06.pdf', label: '6 – 모터 컨트롤러 (MCU)' },
    { num: '07', file: '07_구동모터.pdf', storageKey: 'qq-07.pdf', label: '7 – 구동 모터' },
    { num: '08', file: '08_메인배터리.pdf', storageKey: 'qq-08.pdf', label: '8 – 전력 배터리' },
    { num: '09', file: '09_AC완속충전.pdf', storageKey: 'qq-09.pdf', label: '9 – AC 완속 충전' },
    { num: '10', file: '10_전자식변속다이얼.pdf', storageKey: 'qq-10.pdf', label: '10 – 전자식 변속기' },
    { num: '11', file: '11_조향컬럼.pdf', storageKey: 'qq-11.pdf', label: '11 – 조향 컬럼' },
    { num: '12', file: '12_EPS.pdf', storageKey: 'qq-12.pdf', label: '12 – EPS (전동식 파워스티어링)' },
    { num: '13', file: '13_섀시액슬.pdf', storageKey: 'qq-13.pdf', label: '13 – 섀시 액슬' },
    { num: '14', file: '14_서스펜션.pdf', storageKey: 'qq-14.pdf', label: '14 – 서스펜션' },
    { num: '15', file: '15_타이어휠.pdf', storageKey: 'qq-15.pdf', label: '15 – 타이어 및 휠' },
    { num: '16', file: '16_브레이크.pdf', storageKey: 'qq-16.pdf', label: '16 – 브레이크 및 ABS' },
    { num: '17', file: '17_제동장치.pdf', storageKey: 'qq-17.pdf', label: '17 – 제동 장치' },
    { num: '18', file: '18_주차브레이크.pdf', storageKey: 'qq-18.pdf', label: '18 – 주차 브레이크' },
    { num: '19', file: '19_HVAC.pdf', storageKey: 'qq-19.pdf', label: '19 – HVAC (냉난방 공조)' },
    { num: '20', file: '20_SRS.pdf', storageKey: 'qq-20.pdf', label: '20 – SRS (에어백)' },
    { num: '21', file: '21_차체전기장치.pdf', storageKey: 'qq-21.pdf', label: '21 – 차체 전기 장치' },
    { num: '22', file: '22_계기제어시스템.pdf', storageKey: 'qq-22.pdf', label: '22 – 계기 제어 시스템' },
    { num: '23', file: '23_조명시스템.pdf', storageKey: 'qq-23.pdf', label: '23 – 조명 시스템' },
    { num: '24', file: '24_윈드실드및창유리.pdf', storageKey: 'qq-24.pdf', label: '24 – 윈드실드 및 창유리' },
    { num: '25', file: '25_보행자경고시스템.pdf', storageKey: 'qq-25.pdf', label: '25 – 보행자 경고 시스템' },
    { num: '26', file: '26_와이퍼및세척장치.pdf', storageKey: 'qq-26.pdf', label: '26 – 와이퍼 및 세척 장치' },
    { num: '27', file: '27_경음기.pdf', storageKey: 'qq-27.pdf', label: '27 – 경음기' },
    { num: '28', file: '28_보조전원공급.pdf', storageKey: 'qq-28.pdf', label: '28 – 보조 전원 공급' },
    { num: '29', file: '29_주차레이더시스템.pdf', storageKey: 'qq-29.pdf', label: '29 – 주차 레이더 시스템' },
    { num: '30', file: '30_T-BOX.pdf', storageKey: 'qq-30.pdf', label: '30 – T-BOX (텔레매틱스)' },
    { num: '31', file: '31_미러.pdf', storageKey: 'qq-31.pdf', label: '31 – 미러' },
    // 32장(보닛 및 도어) PDF 미제공
    { num: '33', file: '33_도어락시스템.pdf', storageKey: 'qq-33.pdf', label: '33 – 도어락 시스템' },
    { num: '34', file: '34_인테리어.pdf', storageKey: 'qq-34.pdf', label: '34 – 인테리어' },
    { num: '35', file: '35_익스테리어.pdf', storageKey: 'qq-35.pdf', label: '35 – 익스테리어' },
    { num: '36', file: '36_대시보드.pdf', storageKey: 'qq-36.pdf', label: '36 – 대시보드' },
    { num: '37', file: '37_시트.pdf', storageKey: 'qq-37.pdf', label: '37 – 시트' },
];

function chapterLeaf(ch) {
    return {
        id: `qq-sm-${ch.num}`,
        label: ch.label,
        type: 'pdf',
        storageKey: ch.storageKey,
    };
}

const qqMaintenanceManualTreeData = [
    {
        id: 'qq-grp-general',
        label: '■ 일반',
        type: 'folder',
        children: QQ_CHAPTERS.filter((c) => ['01', '02', '03'].includes(c.num)).map(chapterLeaf),
    },
    {
        id: 'qq-grp-power',
        label: '■ 동력·충전',
        type: 'folder',
        children: QQ_CHAPTERS.filter((c) => Number(c.num) >= 4 && Number(c.num) <= 9).map(chapterLeaf),
    },
    {
        id: 'qq-grp-chassis',
        label: '■ 섀시·제동',
        type: 'folder',
        children: QQ_CHAPTERS.filter((c) => Number(c.num) >= 10 && Number(c.num) <= 18).map(chapterLeaf),
    },
    {
        id: 'qq-grp-hvac',
        label: '■ 공조·안전',
        type: 'folder',
        children: QQ_CHAPTERS.filter((c) => ['19', '20'].includes(c.num)).map(chapterLeaf),
    },
    {
        id: 'qq-grp-body-ee',
        label: '■ 차체 전장',
        type: 'folder',
        children: QQ_CHAPTERS.filter((c) => Number(c.num) >= 21 && Number(c.num) <= 28).map(chapterLeaf),
    },
    {
        id: 'qq-grp-trim',
        label: '■ 편의·차체',
        type: 'folder',
        children: QQ_CHAPTERS.filter((c) => Number(c.num) >= 29).map(chapterLeaf),
    },
];

function generateQQMaintenanceManualMapping() {
    const mapping = {};
    function processNode(node) {
        if (node.children) {
            node.children.forEach(processNode);
            return;
        }
        if (node.type === 'pdf' && node.storageKey) {
            mapping[node.id] = {
                fileName: `${QQ_SM_STORAGE_PREFIX}/${node.storageKey}`,
                bucket: 'manual',
                title: node.label,
                type: 'pdf',
            };
        }
    }
    qqMaintenanceManualTreeData.forEach(processNode);
    return mapping;
}

const qqMaintenanceManualMapping = generateQQMaintenanceManualMapping();

const QQ_MAINTENANCE_MODEL_VALUES = ['masada-qq'];

export {
    QQ_CHAPTERS,
    QQ_SM_STORAGE_PREFIX,
    qqMaintenanceManualTreeData,
    qqMaintenanceManualMapping,
    QQ_MAINTENANCE_MODEL_VALUES,
};

if (typeof window !== 'undefined') {
    window.qqMaintenanceManualTreeData = qqMaintenanceManualTreeData;
    window.qqMaintenanceManualMapping = qqMaintenanceManualMapping;
}
