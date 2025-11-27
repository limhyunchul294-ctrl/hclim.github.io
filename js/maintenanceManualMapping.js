/**
 * 정비지침서 매핑 데이터
 * MASADA SM 파일이 3개로 분할됨:
 * - MASADA SM-1: 페이지 1-295
 * - MASADA SM-2: 페이지 296-590
 * - MASADA SM-3: 페이지 591-885
 */

// 페이지 범위를 파일명과 페이지 번호로 변환하는 함수
function getFileAndPages(originalPageStart, originalPageEnd) {
    if (originalPageStart <= 295) {
        // MASADA SM-1
        return {
            fileName: 'MASADA SM-1.pdf',
            pageRange: [originalPageStart, Math.min(originalPageEnd, 295)]
        };
    } else if (originalPageStart <= 590) {
        // MASADA SM-2 (페이지 번호 변환: 원본 페이지 - 295)
        const start = originalPageStart - 295;
        const end = originalPageEnd - 295;
        return {
            fileName: 'MASADA SM-2.pdf',
            pageRange: [start, Math.min(end, 295)]
        };
    } else {
        // MASADA SM-3 (페이지 번호 변환: 원본 페이지 - 590)
        const start = originalPageStart - 590;
        const end = originalPageEnd - 590;
        return {
            fileName: 'MASADA SM-3.pdf',
            pageRange: [start, Math.min(end, 295)]
        };
    }
}

// 페이지 범위 문자열 파싱 (예: "7-10" → [7, 10], "6" → [6, 6])
function parsePageRange(pageStr) {
    if (!pageStr) return [0, 0];
    const parts = pageStr.toString().split('-').map(p => parseInt(p.trim()));
    if (parts.length === 1) {
        return [parts[0], parts[0]];
    }
    return [parts[0], parts[1]];
}

// 정비지침서 트리 데이터
const maintenanceManualTreeData = [
    {
        id: 'sm-0',
        label: '■ 일반 사항',
        type: 'folder',
        children: [
            { id: 'sm-0-1', label: '사전 주의사항', type: 'pdf', pages: '7-10' },
            { id: 'sm-0-2', label: '작업자 보호 장비', type: 'pdf', pages: '11-14' },
            { id: 'sm-0-3', label: '차량 검사', type: 'pdf', pages: '15-17' },
            { id: 'sm-0-4', label: '규정 토크', type: 'pdf', pages: '18-25' },
            { id: 'sm-0-5', label: '제원', type: 'pdf', pages: '26-32' },
            { id: 'sm-0-6', label: '식별', type: 'pdf', pages: '33-34' },
            { id: 'sm-0-7', label: '차량 구조', type: 'pdf', pages: '35-39' },
            { id: 'sm-0-8', label: '견인', type: 'pdf', pages: '40-41' },
            { id: 'sm-0-9', label: '리프팅', type: 'pdf', pages: '42-43' },
            { id: 'sm-0-10', label: '작업 공구 및 장비', type: 'pdf', pages: '44-45' },
            { id: 'sm-0-11', label: '에너지 원리', type: 'pdf', pages: '46-51' },
            { id: 'sm-0-12', label: '전원-시동 시스템', type: 'pdf', pages: '52-53' },
            { id: 'sm-0-13', label: '충전 주의사항', type: 'pdf', pages: '54-57' },
            { id: 'sm-0-14', label: '고전압 전원 차단', type: 'pdf', pages: '58-61' },
            { id: 'sm-0-15', label: '저전압 전원 차단', type: 'pdf', pages: '62-63' }
        ]
    },
    {
        id: 'sm-1',
        label: '■ 1장 동력 시스템',
        type: 'folder',
        children: [
            { id: 'sm-1-1', label: '고전압 배터리 (HVB)', type: 'pdf', pages: '65-81' },
            { id: 'sm-1-2', label: '모터 컨트롤러 (MCU)', type: 'pdf', pages: '82-96' },
            { id: 'sm-1-3', label: '모터', type: 'pdf', pages: '97-113' }
        ]
    },
    {
        id: 'sm-2',
        label: '■ 2장 충전/전원 시스템',
        type: 'folder',
        children: [
            { id: 'sm-2-1', label: 'OBC+DC/DC 컨버터', type: 'pdf', pages: '115-124' },
            { id: 'sm-2-2', label: '고전압 배전기 (PDU)', type: 'pdf', pages: '125-149' },
            { id: 'sm-2-3', label: '충전 플러그 & 인렛 하네스', type: 'pdf', pages: '150-159' },
            { id: 'sm-2-4', label: '충전 통신 컨트롤러 (EVCC)', type: 'pdf', pages: '160-164' },
            { id: 'sm-2-5', label: '차량 컨트롤러 (VCU)', type: 'pdf', pages: '165-173' },
            { id: 'sm-2-6', label: '보조 배터리 (LVB)', type: 'pdf', pages: '174-179' }
        ]
    },
    {
        id: 'sm-3',
        label: '■ 3장 냉각 시스템',
        type: 'folder',
        children: [
            { id: 'sm-3-1', label: '냉각 시스템', type: 'pdf', pages: '181-186' },
            { id: 'sm-3-2', label: '냉각수 보충-공기빼기', type: 'pdf', pages: '187-188' },
            { id: 'sm-3-3', label: '냉각수 탱크', type: 'pdf', pages: '189-191' },
            { id: 'sm-3-4', label: '라디에이터 팬', type: 'pdf', pages: '192-195' },
            { id: 'sm-3-5', label: '라디에이터', type: 'pdf', pages: '196-202' },
            { id: 'sm-3-6', label: '워터 펌프', type: 'pdf', pages: '203-206' }
        ]
    },
    {
        id: 'sm-4',
        label: '■ 4장 섀시',
        type: 'folder',
        children: [
            {
                id: 'sm-4a',
                label: '◆ 4A. 구동 장치',
                type: 'folder',
                children: [
                    { id: 'sm-4a-1', label: '구동 장치', type: 'pdf', pages: '209-214' },
                    { id: 'sm-4a-2', label: '휠 밸런스 조정', type: 'pdf', pages: '215-219' },
                    { id: 'sm-4a-3', label: '휠 얼라이먼트 점검 및 조정', type: 'pdf', pages: '220-224' },
                    { id: 'sm-4a-4', label: '타이어', type: 'pdf', pages: '225-227' },
                    { id: 'sm-4a-5', label: '휠/타이어', type: 'pdf', pages: '228-232' },
                    { id: 'sm-4a-6', label: '디프렌셜 오일', type: 'pdf', pages: '233-235' },
                    { id: 'sm-4a-7', label: '프런트 허브 캐리어', type: 'pdf', pages: '236-241' },
                    { id: 'sm-4a-8', label: '리어 액슬', type: 'pdf', pages: '242-248' }
                ]
            },
            {
                id: 'sm-4b',
                label: '◆ 4B. 현가 장치',
                type: 'folder',
                children: [
                    { id: 'sm-4b-1', label: '프런트 서스펜션 멤버', type: 'pdf', pages: '250-253' },
                    { id: 'sm-4b-2', label: '프런트 로어 암', type: 'pdf', pages: '254-257' },
                    { id: 'sm-4b-3', label: '컴프레시브 바', type: 'pdf', pages: '258-261' },
                    { id: 'sm-4b-4', label: '프런트 쇽 업소버', type: 'pdf', pages: '262-266' },
                    { id: 'sm-4b-5', label: '리어 판 스프링', type: 'pdf', pages: '267-273' },
                    { id: 'sm-4b-6', label: '리어 쇽 업소버', type: 'pdf', pages: '274-276' },
                    { id: 'sm-4b-7', label: '스테빌라이저 바', type: 'pdf', pages: '277-279' },
                    { id: 'sm-4b-8', label: '스테빌라이저 링크 로드', type: 'pdf', pages: '280-282' }
                ]
            },
            {
                id: 'sm-4c',
                label: '◆ 4C. 제동 장치',
                type: 'folder',
                children: [
                    { id: 'sm-4c-1', label: '브레이크 시스템 주의 사항', type: 'pdf', pages: '284-285' },
                    { id: 'sm-4c-2', label: '브레이크 시스템 공기빼기', type: 'pdf', pages: '286-287' },
                    { id: 'sm-4c-3', label: '브레이크 라인', type: 'pdf', pages: '288-290' },
                    { id: 'sm-4c-4', label: '프런트 브레이크 패드', type: 'pdf', pages: '291-295' },
                    { id: 'sm-4c-5', label: '프런트 브레이크 캘리퍼', type: 'pdf', pages: '296-300' },
                    { id: 'sm-4c-6', label: '프런트 브레이크 캘리퍼 서포트', type: 'pdf', pages: '301-304' },
                    { id: 'sm-4c-7', label: '프런트 브레이크 디스크', type: 'pdf', pages: '305-309' },
                    { id: 'sm-4c-8', label: '프런트 브레이크 호스', type: 'pdf', pages: '310-312' },
                    { id: 'sm-4c-9', label: '리어 브레이크 드럼', type: 'pdf', pages: '313-315' },
                    { id: 'sm-4c-10', label: '리어 브레이크 라이닝', type: 'pdf', pages: '316-319' },
                    { id: 'sm-4c-11', label: '리어 브레이크 호스', type: 'pdf', pages: '320-325' },
                    { id: 'sm-4c-12', label: 'ESC 모듈', type: 'pdf', pages: '326-329' },
                    { id: 'sm-4c-13', label: 'ABS 하이드로릭 유닛', type: 'pdf', pages: '330-333' },
                    { id: 'sm-4c-14', label: '마스터 실린더', type: 'pdf', pages: '334-336' },
                    { id: 'sm-4c-15', label: '브레이크 부스터', type: 'pdf', pages: '337-340' },
                    { id: 'sm-4c-16', label: '진공 펌프', type: 'pdf', pages: '341-344' },
                    { id: 'sm-4c-17', label: '진공 탱크', type: 'pdf', pages: '345-348' },
                    { id: 'sm-4c-18', label: '흡기 온도/압력 센서', type: 'pdf', pages: '349-351' },
                    { id: 'sm-4c-19', label: '프런트 휠 스피드 센서', type: 'pdf', pages: '352-355' },
                    { id: 'sm-4c-20', label: '리어 휠 스피드 센서', type: 'pdf', pages: '356-359' },
                    { id: 'sm-4c-21', label: '브레이크 스위치', type: 'pdf', pages: '360-363' },
                    { id: 'sm-4c-22', label: '브레이크 페달', type: 'pdf', pages: '364-371' },
                    { id: 'sm-4c-23', label: '주차 브레이크', type: 'pdf', pages: '372-373' },
                    { id: 'sm-4c-24', label: '주차 브레이크 핸들', type: 'pdf', pages: '374-376' },
                    { id: 'sm-4c-25', label: '주차 브레이크 케이블', type: 'pdf', pages: '377-382' }
                ]
            },
            {
                id: 'sm-4d',
                label: '◆ 4D. 조향 장치',
                type: 'folder',
                children: [
                    { id: 'sm-4d-1', label: '조향 장치', type: 'pdf', pages: '384-385' },
                    { id: 'sm-4d-2', label: '스티어링 휠', type: 'pdf', pages: '386-389' },
                    { id: 'sm-4d-3', label: '스티어링 컬럼 샤프트', type: 'pdf', pages: '390-393' },
                    { id: 'sm-4d-4', label: '스티어링 기어 박스', type: 'pdf', pages: '394-398' }
                ]
            }
        ]
    },
    {
        id: 'sm-5',
        label: '■ 5장 공조 시스템',
        type: 'folder',
        children: [
            { id: 'sm-5-1', label: '공조 시스템', type: 'pdf', pages: '400-410' },
            { id: 'sm-5-2', label: '에어 인테이크 모듈', type: 'pdf', pages: '411-414' },
            { id: 'sm-5-3', label: '에어컨 모듈', type: 'pdf', pages: '415-420' },
            { id: 'sm-5-4', label: '히터/블로어 모듈', type: 'pdf', pages: '421-428' },
            { id: 'sm-5-5', label: '블로어 모터', type: 'pdf', pages: '429-432' },
            { id: 'sm-5-6', label: '블로어 레지스터', type: 'pdf', pages: '433-435' },
            { id: 'sm-5-7', label: 'PTC 히터', type: 'pdf', pages: '436-440' },
            { id: 'sm-5-8', label: '에바포레이터', type: 'pdf', pages: '441-444' },
            { id: 'sm-5-9', label: '에바포레이터 온도 센서', type: 'pdf', pages: '445-448' },
            { id: 'sm-5-10', label: '팽창 밸브', type: 'pdf', pages: '449-451' },
            { id: 'sm-5-11', label: '컴프레서', type: 'pdf', pages: '452-456' },
            { id: 'sm-5-12', label: '컨덴서', type: 'pdf', pages: '457-460' },
            { id: 'sm-5-13', label: '에어컨 파이프', type: 'pdf', pages: '461-466' },
            { id: 'sm-5-14', label: '에어 덕트', type: 'pdf', pages: '467-470' }
        ]
    },
    {
        id: 'sm-6',
        label: '■ 6장 전장',
        type: 'folder',
        children: [
            {
                id: 'sm-6a',
                label: '◆ 6A. 안전',
                type: 'folder',
                children: [
                    { id: 'sm-6a-1', label: '운전석 에어백', type: 'pdf', pages: '473-476' },
                    { id: 'sm-6a-2', label: '에어백 컨트롤 유닛', type: 'pdf', pages: '477-479' },
                    { id: 'sm-6a-3', label: 'TPMS 유닛', type: 'pdf', pages: '480-482' },
                    { id: 'sm-6a-4', label: '후방 레이더 컨트롤 유닛', type: 'pdf', pages: '483-485' },
                    { id: 'sm-6a-5', label: '후방 레이더 센서', type: 'pdf', pages: '486-487' },
                    { id: 'sm-6a-6', label: '후방 레이더 센서 와이어링', type: 'pdf', pages: '488-491' },
                    { id: 'sm-6a-7', label: '후방 카메라', type: 'pdf', pages: '492-494' },
                    { id: 'sm-6a-8', label: '차량 가상 사운드 (AVAS)', type: 'pdf', pages: '495-498' }
                ]
            },
            {
                id: 'sm-6b',
                label: '◆ 6B. 잠금',
                type: 'folder',
                children: [
                    { id: 'sm-6b-1', label: '도어 락', type: 'pdf', pages: '500-512' },
                    { id: 'sm-6b-2', label: '윈도우 레귤레이터', type: 'pdf', pages: '513-517' },
                    { id: 'sm-6b-3', label: '중앙 잠금 모듈', type: 'pdf', pages: '518-521' },
                    { id: 'sm-6b-4', label: '파워 윈도우', type: 'pdf', pages: '522' },
                    { id: 'sm-6b-5', label: '윈도우 스위치', type: 'pdf', pages: '523-525' },
                    { id: 'sm-6b-6', label: '도어 스위치', type: 'pdf', pages: '526-528' }
                ]
            },
            {
                id: 'sm-6c',
                label: '◆ 6C. 조명',
                type: 'folder',
                children: [
                    { id: 'sm-6c-1', label: '조명', type: 'pdf', pages: '530-533' },
                    { id: 'sm-6c-2', label: '전조등', type: 'pdf', pages: '534-537' },
                    { id: 'sm-6c-3', label: '후미등', type: 'pdf', pages: '538-541' },
                    { id: 'sm-6c-4', label: '안개등/주간 주행등', type: 'pdf', pages: '542-544' },
                    { id: 'sm-6c-5', label: '측면 방향 지시등', type: 'pdf', pages: '545-547' },
                    { id: 'sm-6c-6', label: '보조 제동등', type: 'pdf', pages: '548-550' },
                    { id: 'sm-6c-7', label: '번호판등', type: 'pdf', pages: '551-553' },
                    { id: 'sm-6c-8', label: '앞 좌석 실내등', type: 'pdf', pages: '554-556' },
                    { id: 'sm-6c-9', label: '실내등', type: 'pdf', pages: '557-559' }
                ]
            },
            {
                id: 'sm-6d',
                label: '◆ 6D. 전장품',
                type: 'folder',
                children: [
                    { id: 'sm-6d-1', label: '계기판', type: 'pdf', pages: '561-571' },
                    { id: 'sm-6d-2', label: '컴비네이션 스위치', type: 'pdf', pages: '572-575' },
                    { id: 'sm-6d-3', label: '클락 스프링', type: 'pdf', pages: '576-578' },
                    { id: 'sm-6d-4', label: '오디오', type: 'pdf', pages: '579-582' },
                    { id: 'sm-6d-5', label: '에어컨/히터 스위치', type: 'pdf', pages: '583-585' },
                    { id: 'sm-6d-6', label: '안개등 스위치', type: 'pdf', pages: '586-589' },
                    { id: 'sm-6d-7', label: '공조 컨트롤 패널', type: 'pdf', pages: '590-593' },
                    { id: 'sm-6d-8', label: '비상등 스위치', type: 'pdf', pages: '594-595' },
                    { id: 'sm-6d-9', label: '시가 라이터', type: 'pdf', pages: '596-598' },
                    { id: 'sm-6d-10', label: '변속 다이얼', type: 'pdf', pages: '599-600' },
                    { id: 'sm-6d-11', label: '포토 센서', type: 'pdf', pages: '601-603' },
                    { id: 'sm-6d-12', label: '스피커', type: 'pdf', pages: '604-607' },
                    { id: 'sm-6d-13', label: '안테나', type: 'pdf', pages: '608-610' },
                    { id: 'sm-6d-14', label: '가속 페달', type: 'pdf', pages: '611-613' },
                    { id: 'sm-6d-15', label: '경음기', type: 'pdf', pages: '614-617' }
                ]
            },
            {
                id: 'sm-6e',
                label: '◆ 6E. 와이퍼/워셔',
                type: 'folder',
                children: [
                    { id: 'sm-6e-1', label: '와이퍼', type: 'pdf', pages: '619-622' },
                    { id: 'sm-6e-2', label: '와이퍼 모터', type: 'pdf', pages: '623-626' },
                    { id: 'sm-6e-3', label: '와이퍼 암', type: 'pdf', pages: '627-629' },
                    { id: 'sm-6e-4', label: '워셔액 탱크', type: 'pdf', pages: '630-632' },
                    { id: 'sm-6e-5', label: '워셔액 모터', type: 'pdf', pages: '633-634' },
                    { id: 'sm-6e-6', label: '워셔 노즐', type: 'pdf', pages: '635-636' }
                ]
            },
            {
                id: 'sm-6f',
                label: '◆ 6F. 와이어링',
                type: 'folder',
                children: [
                    { id: 'sm-6f-1', label: '메인 와이어링', type: 'pdf', pages: '638-649' },
                    { id: 'sm-6f-2', label: '섀시 와이어링', type: 'pdf', pages: '650-665' },
                    { id: 'sm-6f-3', label: '도어 와이어링', type: 'pdf', pages: '666-669' },
                    { id: 'sm-6f-4', label: '루프 와이어링', type: 'pdf', pages: '670-676' },
                    { id: 'sm-6f-5', label: '루프 익스텐션 와이어링', type: 'pdf', pages: '677-680' },
                    { id: 'sm-6f-6', label: '테일게이트 와이어링', type: 'pdf', pages: '681-684' },
                    { id: 'sm-6f-7', label: '슬라이딩 도어 와이어링', type: 'pdf', pages: '685-687' }
                ]
            }
        ]
    },
    {
        id: 'sm-7',
        label: '■ 7장 내장',
        type: 'folder',
        children: [
            {
                id: 'sm-7a',
                label: '◆ 7A. 트림',
                type: 'folder',
                children: [
                    { id: 'sm-7a-1', label: '센터 페시아', type: 'pdf', pages: '690-694' },
                    { id: 'sm-7a-2', label: '스티어링 컬럼 샤프트 커버', type: 'pdf', pages: '695' },
                    { id: 'sm-7a-3', label: '글로브 박스', type: 'pdf', pages: '696-697' },
                    { id: 'sm-7a-4', label: '센터 덕트 판넬', type: 'pdf', pages: '698-700' },
                    { id: 'sm-7a-5', label: '대쉬보드', type: 'pdf', pages: '701-707' },
                    { id: 'sm-7a-6', label: '대쉬보드 크로스 멤버', type: 'pdf', pages: '708-714' },
                    { id: 'sm-7a-7', label: '컵 홀더', type: 'pdf', pages: '715-717' },
                    { id: 'sm-7a-8', label: '콘솔', type: 'pdf', pages: '718-720' },
                    { id: 'sm-7a-9', label: 'A필러', type: 'pdf', pages: '721-723' },
                    { id: 'sm-7a-10', label: 'B필러 언더 트림', type: 'pdf', pages: '724-726' },
                    { id: 'sm-7a-11', label: '격벽', type: 'pdf', pages: '727-730' },
                    { id: 'sm-7a-12', label: '선바이저', type: 'pdf', pages: '731-732' },
                    { id: 'sm-7a-13', label: '스트랩', type: 'pdf', pages: '733-736' },
                    { id: 'sm-7a-14', label: '룸 미러', type: 'pdf', pages: '737-738' },
                    { id: 'sm-7a-15', label: '헤드라이닝', type: 'pdf', pages: '739-742' },
                    { id: 'sm-7a-16', label: '도어 트림', type: 'pdf', pages: '743-746' },
                    { id: 'sm-7a-17', label: '슬라이딩 도어 트림', type: 'pdf', pages: '747-748' },
                    { id: 'sm-7a-18', label: '테일게이트 트림', type: 'pdf', pages: '749-750' },
                    { id: 'sm-7a-19', label: '러기지 사이드 트림', type: 'pdf', pages: '751-754' },
                    { id: 'sm-7a-20', label: '도어 스텝', type: 'pdf', pages: '755-756' },
                    { id: 'sm-7a-21', label: '슬라이딩 도어 스텝', type: 'pdf', pages: '757-759' },
                    { id: 'sm-7a-22', label: '도어 이너 래치', type: 'pdf', pages: '760-761' },
                    { id: 'sm-7a-23', label: '슬라이딩 도어 이너 래치', type: 'pdf', pages: '762-765' }
                ]
            },
            {
                id: 'sm-7b',
                label: '◆ 7B. 시트',
                type: 'folder',
                children: [
                    { id: 'sm-7b-1', label: '프런트 시트', type: 'pdf', pages: '767-770' },
                    { id: 'sm-7b-2', label: '프런트 시트 벨트', type: 'pdf', pages: '771-773' },
                    { id: 'sm-7b-3', label: '프런트 시트 버클', type: 'pdf', pages: '774-776' },
                    { id: 'sm-7b-4', label: '리어 시트', type: 'pdf', pages: '777-780' },
                    { id: 'sm-7b-5', label: '리어 시트 벨트', type: 'pdf', pages: '781-784' },
                    { id: 'sm-7b-6', label: '리어 시트 버클', type: 'pdf', pages: '785-786' }
                ]
            }
        ]
    },
    {
        id: 'sm-8',
        label: '■ 8장 외장',
        type: 'folder',
        children: [
            { id: 'sm-8-1', label: '프런트 그릴', type: 'pdf', pages: '788-791' },
            { id: 'sm-8-2', label: '프런트 범퍼', type: 'pdf', pages: '792-795' },
            { id: 'sm-8-3', label: '프런트 휠 하우스', type: 'pdf', pages: '796-798' },
            { id: 'sm-8-4', label: '프런트 휀더', type: 'pdf', pages: '799-804' },
            { id: 'sm-8-5', label: '도어 아우터 래치', type: 'pdf', pages: '805-807' },
            { id: 'sm-8-6', label: '도어 아웃사이드 판넬', type: 'pdf', pages: '808-810' },
            { id: 'sm-8-7', label: '도어 키 실린더', type: 'pdf', pages: '811-815' },
            { id: 'sm-8-8', label: '도어 윈도우', type: 'pdf', pages: '816-819' },
            { id: 'sm-8-9', label: '사이드 미러', type: 'pdf', pages: '820-822' },
            { id: 'sm-8-10', label: '프런트 도어', type: 'pdf', pages: '823-826' },
            { id: 'sm-8-11', label: '슬라이딩 도어 아우터 래치', type: 'pdf', pages: '827-829' },
            { id: 'sm-8-12', label: '슬라이딩 도어 레일', type: 'pdf', pages: '830-834' },
            { id: 'sm-8-13', label: '슬라이딩 도어', type: 'pdf', pages: '835-838' },
            { id: 'sm-8-14', label: '테일게이트 몰딩', type: 'pdf', pages: '839-840' },
            { id: 'sm-8-15', label: '테일게이트 래치', type: 'pdf', pages: '841-843' },
            { id: 'sm-8-16', label: '테일게이트', type: 'pdf', pages: '844-848' },
            { id: 'sm-8-17', label: '테일게이트 스트럿 바', type: 'pdf', pages: '849-851' },
            { id: 'sm-8-18', label: '후드 락', type: 'pdf', pages: '852-854' },
            { id: 'sm-8-19', label: '후드 락 케이블', type: 'pdf', pages: '855-858' },
            { id: 'sm-8-20', label: '후드', type: 'pdf', pages: '859-861' },
            { id: 'sm-8-21', label: '카울 탑 커버', type: 'pdf', pages: '862-864' },
            { id: 'sm-8-22', label: '리어 범퍼', type: 'pdf', pages: '865-870' },
            { id: 'sm-8-23', label: '반사판', type: 'pdf', pages: '871-873' },
            { id: 'sm-8-24', label: '머드 가드', type: 'pdf', pages: '874-877' },
            { id: 'sm-8-25', label: '충전구 판넬', type: 'pdf', pages: '878-880' },
            { id: 'sm-8-26', label: '차체 치수', type: 'pdf', pages: '881-883' }
        ]
    }
];

// PDF 매핑 생성 함수
function generateMaintenanceManualMapping() {
    const mapping = {};
    
    // 트리 데이터를 재귀적으로 순회하여 매핑 생성
    function processNode(node) {
        if (node.children) {
            node.children.forEach(child => processNode(child));
        } else if (node.type === 'pdf' && node.pages) {
            const [start, end] = parsePageRange(node.pages);
            const fileInfo = getFileAndPages(start, end);
            
            mapping[node.id] = {
                fileName: fileInfo.fileName,
                bucket: 'manual',
                pageRange: fileInfo.pageRange,
                title: node.label,
                type: 'pdf'
            };
        }
    }
    
    maintenanceManualTreeData.forEach(node => processNode(node));
    
    return mapping;
}

// 매핑 데이터 생성
const maintenanceManualMapping = generateMaintenanceManualMapping();

// ES6 모듈 export
export { maintenanceManualTreeData, maintenanceManualMapping, getFileAndPages, parsePageRange };

// 전역 변수로도 export (하위 호환성)
if (typeof window !== 'undefined') {
    window.maintenanceManualTreeData = maintenanceManualTreeData;
    window.maintenanceManualMapping = maintenanceManualMapping;
}

// CommonJS export (하위 호환성)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        maintenanceManualTreeData,
        maintenanceManualMapping,
        getFileAndPages,
        parsePageRange
    };
}

