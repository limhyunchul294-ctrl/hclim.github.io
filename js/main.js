import './config.js';
import './authSession.js';
import './authService.js';
import './dataService.js';
import './fileUploadService.js';
import './securityAgreement.js';
import { maintenanceManualTreeData, maintenanceManualMapping } from './maintenanceManualMapping.js';
import { etmTreeData, etmMapping } from './etmMapping.js';

// js/main.js (Final Version)
// ✅ 수정사항: localStorage 완전 제거, authSession 사용으로 변경

if (window.__APP_INIT__) {
    console.warn('앱이 이미 초기화됨 - 중복 실행 방지');
} else {
    window.__APP_INIT__ = true;
    
    (function(){
        // ---- 1. 앱의 핵심 요소 ----
        const app = document.getElementById('app');
        const mainContent = document.getElementById('main-content');
        const authContainer = document.getElementById('auth-container');
        const desktopNav = document.getElementById('desktop-nav');
        const splashScreen = document.getElementById('splash-screen');
        const { PDFDocument } = PDFLib;

        // ---- 2. 네비게이션 링크 ----
        const NAV_LINKS = [
          { href: '#/shop', label: '정비지침서', icon: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' },
          { href: '#/etm', label: '전장회로도', icon: '<path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z" stroke="currentColor" stroke-width="2"/><path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z" stroke="currentColor" stroke-width="2"/><path d="M12 3c0 1-1 2-2 2s-2-1-2-2 1-2 2-2 2 1 2 2z" stroke="currentColor" stroke-width="2"/><path d="M12 21c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2z" stroke="currentColor" stroke-width="2"/>' },
          { href: '#/dtc', label: 'DTC 매뉴얼', icon: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' },
          { href: '#/wiring', label: '와이어링 커넥터', icon: '<path d="M14 18v-2a2 2 0 1 0 -4 0v2" stroke="currentColor" stroke-width="2" /><path d="M7 8h10" stroke="currentColor" stroke-width="2" /><path d="M10 11v-3a2 2 0 1 1 4 0v3" stroke="currentColor" stroke-width="2" /><path d="M17 8v5a2 2 0 0 1 -2 2h-6a2 2 0 0 1 -2 -2v-5" stroke="currentColor" stroke-width="2" />' },
          { href: '#/tsb', label: 'TSB', icon: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="9" r="2" stroke="currentColor" stroke-width="2"/><path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' },
          { 
            type: 'dropdown',
            label: '게시판',
            icon: '<path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" stroke="currentColor" stroke-width="2"/>',
            items: [
              { href: '#/notices', label: '공지사항', icon: '<path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" stroke="currentColor" stroke-width="2"/>' },
              { href: '#/community', label: '커뮤니티', icon: '<path d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' }
            ]
          },
          { href: '#/account', label: '내 정보', icon: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>' },
          { href: '#/admin', label: '관리자', icon: '<path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>', adminOnly: true },
        ];

        const MODELS = [
          { value: 'masada-2van', label: 'MASADA 2VAN' },
          { value: 'masada-4van', label: 'MASADA 4VAN' },
          { value: 'masada-cargo', label: 'MASADA Cargo(Pick-up)' },
        ];

        // PDF 매핑 데이터
        const PDF_MAPPING = {
            'tsb-1': { fileName: 'TSB_EVKMC_001_221109.pdf', bucket: 'tsb_documents', title: 'TSB_EVKMC_001', type: 'pdf' },
            'tsb-2': { fileName: 'TSB_EVKMC_002_231019.pdf', bucket: 'tsb_documents', title: 'TSB_EVKMC_002', type: 'pdf' },
            'tsb-3': { fileName: 'TSB_EVKMC_003_220822.pdf', bucket: 'tsb_documents', title: 'TSB_EVKMC_003', type: 'pdf' },
            'tsb-4': { fileName: 'TSB_EVKMC_004_230420.pdf', bucket: 'tsb_documents', title: 'TSB_EVKMC_004', type: 'pdf' },
            'tsb-5': { fileName: 'TSB_EVKMC_005_230427.pdf', bucket: 'tsb_documents', title: 'TSB_EVKMC_005', type: 'pdf' },
            'tsb-6': { fileName: 'TSB_EVKMC_006_230427.pdf', bucket: 'tsb_documents', title: 'TSB_EVKMC_006', type: 'pdf' },
            'tsb-7': { fileName: 'TSB_EVKMC_007_230427.pdf', bucket: 'tsb_documents', title: 'TSB_EVKMC_007', type: 'pdf' },
            'tsb-8': { fileName: 'TSB_EVKMC_008_230428.pdf', bucket: 'tsb_documents', title: 'TSB_EVKMC_008', type: 'pdf' },
            'tsb-9': { fileName: 'TSB_EVKMC_009_230428.pdf', bucket: 'tsb_documents', title: 'TSB_EVKMC_009', type: 'pdf' },
            'tsb-10': { fileName: 'TSB_EVKMC_010_230503.pdf', bucket: 'tsb_documents', title: 'TSB_EVKMC_010', type: 'pdf' },
            'tsb-11': { fileName: 'TSB_EVKMC_011_230504.pdf', bucket: 'tsb_documents', title: 'TSB_EVKMC_011', type: 'pdf' },
            'tsb-12': { fileName: 'TSB_EVKMC_012_230509.pdf', bucket: 'tsb_documents', title: 'TSB_EVKMC_012', type: 'pdf' },
            'tsb-13': { fileName: 'TSB_EVKMC_013_230509.pdf', bucket: 'tsb_documents', title: 'TSB_EVKMC_013', type: 'pdf' },
            'tsb-14': { fileName: 'TSB_EVKMC_014_230525.pdf', bucket: 'tsb_documents', title: 'TSB_EVKMC_014', type: 'pdf' },
            'tsb-15': { fileName: 'TSB_EVKMC_015_230525.pdf', bucket: 'tsb_documents', title: 'TSB_EVKMC_015', type: 'pdf' },
            'tsb-16': { fileName: 'TSB_EVKMC_016_230623.pdf', bucket: 'tsb_documents', title: 'TSB_EVKMC_016', type: 'pdf' },
            'tsb-17': { fileName: 'TSB_EVKMC_017_230623.pdf', bucket: 'tsb_documents', title: 'TSB_EVKMC_017', type: 'pdf' },
            'tsb-18': { fileName: 'TSB_EVKMC_018_230628.pdf', bucket: 'tsb_documents', title: 'TSB_EVKMC_018', type: 'pdf' },
            'tsb-19': { fileName: 'TSB_EVKMC_019_230707.pdf', bucket: 'tsb_documents', title: 'TSB_EVKMC_019', type: 'pdf' },
            'tsb-20': { fileName: 'TSB_EVKMC_020_230728.pdf', bucket: 'tsb_documents', title: 'TSB_EVKMC_020', type: 'pdf' },
            'tsb-21': { fileName: 'TSB_EVKMC_021_230901.pdf', bucket: 'tsb_documents', title: 'TSB_EVKMC_021', type: 'pdf' },
            'tsb-22': { fileName: 'TSB_EVKMC_022_230901.pdf', bucket: 'tsb_documents', title: 'TSB_EVKMC_022', type: 'pdf' },
            'tsb-23': { fileName: 'TSB_EVKMC_023_230912.pdf', bucket: 'tsb_documents', title: 'TSB_EVKMC_023', type: 'pdf' },
            'tsb-24': { fileName: 'TSB_EVKMC_024_230912.pdf', bucket: 'tsb_documents', title: 'TSB_EVKMC_024', type: 'pdf' },
            'tsb-25': { fileName: 'TSB_EVKMC_025_231020.pdf', bucket: 'tsb_documents', title: 'TSB_EVKMC_025', type: 'pdf' },
            'tsb-26': { fileName: 'TSB_EVKMC_026_231020.pdf', bucket: 'tsb_documents', title: 'TSB_EVKMC_026', type: 'pdf' },
            'tsb-27': { fileName: 'TSB_EVKMC_027_221005.pdf', bucket: 'tsb_documents', title: 'TSB_EVKMC_027', type: 'pdf' },
            'tsb-28': { fileName: 'TSB_EVKMC_028_231030.pdf', bucket: 'tsb_documents', title: 'TSB_EVKMC_028', type: 'pdf' },
            'tsb-29': { fileName: 'TSB_EVKMC_029_231102.pdf', bucket: 'tsb_documents', title: 'TSB_EVKMC_029', type: 'pdf' },
            'tsb-30': { fileName: 'TSB_EVKMC_030_231102.pdf', bucket: 'tsb_documents', title: 'TSB_EVKMC_030', type: 'pdf' },
            'wiring-1-1': { fileName: 'Main wiring.jpeg', bucket: 'wiring_diagrams', title: '메인 와이어링', type: 'image' },
            'wiring-1-2': { fileName: 'Chassis wiring.jpeg', bucket: 'wiring_diagrams', title: '섀시 와이어링', type: 'image' },
            'wiring-1-3': { fileName: 'Door wiring.jpeg', bucket: 'wiring_diagrams', title: '도어 와이어링', type: 'image' },
            'wiring-1-4': { fileName: 'Sliding Door wiring.jpeg', bucket: 'wiring_diagrams', title: '슬라이딩 도어 와이어링', type: 'image' },
            'wiring-1-5': { fileName: 'Roof wiring.jpeg', bucket: 'wiring_diagrams', title: '루프 와이어링', type: 'image' },
            'wiring-1-6': { fileName: 'Roof Extention wiring.jpeg', bucket: 'wiring_diagrams', title: '루프 익스텐션 와이어링', type: 'image' },
            'wiring-1-7': { fileName: 'Tailgate wiring.jpeg', bucket: 'wiring_diagrams', title: '테일게이트 와이어링', type: 'image' },
        };
        
        // 정비지침서 매핑 병합
        if (maintenanceManualMapping) {
            Object.assign(PDF_MAPPING, maintenanceManualMapping);
        }
        
        // ETM 매핑 병합
        if (etmMapping) {
            Object.assign(PDF_MAPPING, etmMapping);
        }

        // ---- 3. 트리 데이터 ----
        function getTreeDataByTitle(title) {
            const dataMap = {
                '정비지침서': maintenanceManualTreeData || [
                        {
                            id: 'sm-0',
                            label: '▪ 일반 사항',
                            type: 'folder',
                            children: [
                                { id: 'sm-0-1', label: '사전 주의사항', type: 'pdf' },
                                { id: 'sm-0-2', label: '작업자 보호 장비', type: 'pdf' }
                            ]
                        },
                        {
                            id: 'sm-1',
                            label: '▪ 1장 동력 시스템',
                            type: 'folder',
                            children: [
                                { id: 'sm-1-1', label: '고전압 배터리 (HVB)', type: 'pdf' },
                                { id: 'sm-1-2', label: '모터 컨트롤러 (MCU)', type: 'pdf' }
                            ]
                        }
                    ],
                '전장회로도': etmTreeData || [
                        {
                            id: 'etm-1',
                            label: '▪ 1. 고전압 시스템',
                            type: 'folder',
                            children: [
                                { id: 'etm-1-1', label: '1.1 BMS (Battery Management System)', type: 'pdf' },
                                { id: 'etm-1-2', label: '1.2 고전압 배터리', type: 'pdf' }
                            ]
                        },
                        {
                            id: 'etm-2',
                            label: '▪ 2. 구동 및 제어 시스템',
                            type: 'folder',
                            children: [
                                { id: 'etm-2-1', label: '2.1 MCU (Motor Control Unit)', type: 'pdf' }
                            ]
                        }
                    ],
                'DTC 매뉴얼': [
                    {
                        id: 'dtc-1',
                        label: '400번대 - 구동 계통',
                        type: 'folder',
                        children: [
                            { id: 'dtc-1-1', label: 'E-0420_모터 컨트롤러(MCU) 이상', type: 'file' },
                            { id: 'dtc-1-2', label: 'E-0421_모터 이상', type: 'file' }
                        ]
                    }
                ],
                'TSB': [
                    { id: 'tsb-1', label: 'TSB_EVKMC_001 (22.11.09)', type: 'pdf' },
                    { id: 'tsb-2', label: 'TSB_EVKMC_002 (23.10.19)', type: 'pdf' },
                    { id: 'tsb-3', label: 'TSB_EVKMC_003 (22.08.22)', type: 'pdf' },
                    { id: 'tsb-4', label: 'TSB_EVKMC_004 (23.04.20)', type: 'pdf' },
                    { id: 'tsb-5', label: 'TSB_EVKMC_005 (23.04.27)', type: 'pdf' },
                    { id: 'tsb-6', label: 'TSB_EVKMC_006 (23.04.27)', type: 'pdf' },
                    { id: 'tsb-7', label: 'TSB_EVKMC_007 (23.04.27)', type: 'pdf' },
                    { id: 'tsb-8', label: 'TSB_EVKMC_008 (23.04.28)', type: 'pdf' },
                    { id: 'tsb-9', label: 'TSB_EVKMC_009 (23.04.28)', type: 'pdf' },
                    { id: 'tsb-10', label: 'TSB_EVKMC_010 (23.05.03)', type: 'pdf' },
                    { id: 'tsb-11', label: 'TSB_EVKMC_011 (23.05.04)', type: 'pdf' },
                    { id: 'tsb-12', label: 'TSB_EVKMC_012 (23.05.09)', type: 'pdf' },
                    { id: 'tsb-13', label: 'TSB_EVKMC_013 (23.05.09)', type: 'pdf' },
                    { id: 'tsb-14', label: 'TSB_EVKMC_014 (23.05.25)', type: 'pdf' },
                    { id: 'tsb-15', label: 'TSB_EVKMC_015 (23.05.25)', type: 'pdf' },
                    { id: 'tsb-16', label: 'TSB_EVKMC_016 (23.06.23)', type: 'pdf' },
                    { id: 'tsb-17', label: 'TSB_EVKMC_017 (23.06.23)', type: 'pdf' },
                    { id: 'tsb-18', label: 'TSB_EVKMC_018 (23.06.28)', type: 'pdf' },
                    { id: 'tsb-19', label: 'TSB_EVKMC_019 (23.07.07)', type: 'pdf' },
                    { id: 'tsb-20', label: 'TSB_EVKMC_020 (23.07.28)', type: 'pdf' },
                    { id: 'tsb-21', label: 'TSB_EVKMC_021 (23.09.01)', type: 'pdf' },
                    { id: 'tsb-22', label: 'TSB_EVKMC_022 (23.09.01)', type: 'pdf' },
                    { id: 'tsb-23', label: 'TSB_EVKMC_023 (23.09.12)', type: 'pdf' },
                    { id: 'tsb-24', label: 'TSB_EVKMC_024 (23.09.12)', type: 'pdf' },
                    { id: 'tsb-25', label: 'TSB_EVKMC_025 (23.10.20)', type: 'pdf' },
                    { id: 'tsb-26', label: 'TSB_EVKMC_026 (23.10.20)', type: 'pdf' },
                    { id: 'tsb-27', label: 'TSB_EVKMC_027 (22.10.05)', type: 'pdf' },
                    { id: 'tsb-28', label: 'TSB_EVKMC_028 (23.10.30)', type: 'pdf' },
                    { id: 'tsb-29', label: 'TSB_EVKMC_029 (23.11.02)', type: 'pdf' },
                    { id: 'tsb-30', label: 'TSB_EVKMC_030 (23.11.02)', type: 'pdf' }
                ],
                '와이어링 커넥터': [
                    {
                        id: 'wiring-1',
                        label: '▪ 와이어링',
                        type: 'folder',
                        children: [
                            { id: 'wiring-1-1', label: '메인 와이어링', type: 'image' },
                            { id: 'wiring-1-2', label: '섀시 와이어링', type: 'image' },
                            { id: 'wiring-1-3', label: '도어 와이어링', type: 'image' },
                            { id: 'wiring-1-4', label: '슬라이딩 도어 와이어링', type: 'image' },
                            { id: 'wiring-1-5', label: '루프 와이어링', type: 'image' },
                            { id: 'wiring-1-6', label: '루프 익스텐션 와이어링', type: 'image' },
                            { id: 'wiring-1-7', label: '테일게이트 와이어링', type: 'image' }
                        ]
                    }
                ]
            };
            return dataMap[title] || [];
        }

        // ---- 4. 유틸리티 함수 ----
        /**
         * 토스트 알림 표시
         * @param {string} message - 메시지
         * @param {string} type - 타입 (success, error, info)
         * @param {number} duration - 표시 시간 (ms)
         * @param {Object} options - 추가 옵션 (retryCallback: 재시도 함수, details: 상세 정보)
         */
        function showToast(message, type = 'info', duration = 3000, options = {}) {
            const container = document.querySelector('.toast-container') || createToastContainer();
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
            toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
            
            const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ⓘ';
            
            let actionButton = '';
            if (options.retryCallback && type === 'error') {
                actionButton = `
                    <button 
                        onclick="(() => { ${options.retryCallback.toString()}(); this.closest('.toast').remove(); })()"
                        class="ml-2 px-2 py-1 text-xs bg-white bg-opacity-20 hover:bg-opacity-30 rounded transition-colors"
                        aria-label="재시도">
                        재시도
                    </button>
                `;
            }
            
            let detailsSection = '';
            if (options.details) {
                detailsSection = `
                    <div class="mt-2 text-xs opacity-90">
                        ${options.details}
                    </div>
                `;
            }
            
            toast.innerHTML = `
                <span class="text-lg">${icon}</span>
                <div class="flex-1">
                    <span>${message}</span>
                    ${detailsSection}
                </div>
                ${actionButton}
            `;
            
            container.appendChild(toast);
            setTimeout(() => toast.classList.add('show'), 100);
            
            const hideTimeout = setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    if (toast.parentElement) {
                        container.removeChild(toast);
                    }
                }, 300);
            }, duration);
            
            // 재시도 버튼이 있으면 토스트를 더 오래 표시
            if (options.retryCallback) {
                clearTimeout(hideTimeout);
                setTimeout(() => {
                    if (toast.parentElement) {
                        toast.classList.remove('show');
                        setTimeout(() => {
                            if (toast.parentElement) {
                                container.removeChild(toast);
                            }
                        }, 300);
                    }
                }, 10000); // 10초로 연장
            }
        }

        function createToastContainer() {
            const container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
            return container;
        }

        function skeletonLoadingHTML() {
            return `
                <div class="space-y-4">
                    ${Array(5).fill(0).map(() => `
                        <div class="skeleton skeleton-text w-full"></div>
                        <div class="skeleton skeleton-text w-3/4"></div>
                        <div class="skeleton skeleton-button"></div>
                    `).join('')}
                </div>
            `;
        }

        function getTreeIcon(type) {
            const icons = {
                folder: '📁',
                pdf: '📄',
                image: '🖼️',
                file: '📋'
            };
            return icons[type] || '📄';
        }

        function hideSplashScreen() {
            if (splashScreen) {
                splashScreen.style.opacity = '0';
                setTimeout(() => {
                    splashScreen.style.display = 'none';
                }, 500);
            }
        }

        // ---- 5. 핵심 함수 ----

/**
 * ✅ 로그아웃 (캐시 초기화 추가)
 */
async function handleLogout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        try {
            console.log('🔄 로그아웃 시작...');
            
            // 1. 캐시 초기화
            window.authService?.clearCache();
            console.log('✅ 캐시 초기화 완료');
            
            // 2. 세션 초기화
            window.authSession._sessionCache = null;
            console.log('✅ 세션 캐시 초기화 완료');
            
            // 3. 세션 타이머 중지
            stopSessionTimer();
            
            // 4. 로그인 시간 초기화
            localStorage.removeItem('session_login_time');
            
            // 5. Supabase 로그아웃
            await window.authSession.logout();
            // authSession.logout()에서 자동으로 login.html로 리다이렉트됨
            } catch (error) {
                console.error('❌ 로그아웃 오류:', error);
                const errorDetails = error.message || '세션 정보를 초기화하는 중 오류가 발생했습니다.';
                showToast(
                    '로그아웃 중 오류가 발생했습니다.', 
                    'error',
                    5000,
                    { details: errorDetails }
                );
            }
    }
}

        /**
         * ✅ 세션 갱신 (레거시 호환성 유지)
         */
        async function refreshSession() {
            await refreshSessionManually();
        }

        /**
         * ✅ 사용자 정보 UI 업데이트
         */
        // 세션 타이머 관리
        let sessionTimerInterval = null;
        let sessionWarningShown = false;
        
        // IP 주소 저장
        let currentIpAddress = null;

        /**
         * 세션 남은 시간 계산 및 표시
         * 세션 시간은 30분으로 제한 (실제 Supabase 세션과 무관하게 클라이언트에서 강제)
         */
        async function updateSessionTimer() {
            try {
                const session = await window.authSession?.getSession();
                if (!session || !session.expires_at) {
                    return { minutes: 0, seconds: 0, isExpired: true };
                }

                // 로그인 시간 추적 (localStorage 사용)
                const loginTimeKey = 'session_login_time';
                let loginTime = localStorage.getItem(loginTimeKey);
                
                // 로그인 시간이 없으면 현재 시간 저장 (새 로그인)
                if (!loginTime) {
                    loginTime = Date.now().toString();
                    localStorage.setItem(loginTimeKey, loginTime);
                    console.log('✅ 세션 타이머 시작:', new Date(parseInt(loginTime)).toLocaleTimeString('ko-KR'));
                }

                const now = Date.now();
                const loginTimestamp = parseInt(loginTime);
                const sessionDuration = 30 * 60 * 1000; // 30분
                const elapsedTime = now - loginTimestamp;
                const remainingTime = sessionDuration - elapsedTime;

                // 디버깅: 매 10초마다 로그 출력 (실제 카운트다운 확인)
                const secondsRemaining = Math.floor(remainingTime / 1000);
                if (secondsRemaining % 10 === 0 && secondsRemaining > 0) {
                    const minutes = Math.floor(remainingTime / 60000);
                    const secs = Math.floor((remainingTime % 60000) / 1000);
                    console.log(`⏰ 세션 타이머: ${minutes}분 ${secs}초 남음 (경과: ${Math.floor(elapsedTime / 1000)}초)`);
                }

                // 30분 경과 시 자동 로그아웃
                if (remainingTime <= 0) {
                    console.log('⚠️ 세션 만료 - 자동 로그아웃 실행');
                    localStorage.removeItem(loginTimeKey);
                    showToast('세션이 만료되어 자동으로 로그아웃됩니다.', 'error');
                    setTimeout(async () => {
                        await window.authSession?.logout();
                        window.location.href = 'login.html';
                    }, 2000);
                    return { minutes: 0, seconds: 0, isExpired: true };
                }

                const minutes = Math.floor(remainingTime / 60000);
                const seconds = Math.floor((remainingTime % 60000) / 1000);

                // 5분 남을 때 토스트 경고 표시 (10분 경고는 유지)
                if (minutes === 5 && seconds === 0 && !sessionWarningShown) {
                    console.log(`⚠️ 세션 만료 5분 전 경고: ${minutes}분 남음`);
                    showSessionWarningToast(minutes, seconds);
                }
                
                // 10분 남을 때 팝업 표시
                if (minutes <= 10 && minutes > 5 && !sessionWarningShown) {
                    console.log(`⚠️ 세션 만료 경고: ${minutes}분 ${seconds}초 남음`);
                    showSessionWarning(minutes, seconds);
                    sessionWarningShown = true;
                }

                return { minutes, seconds, isExpired: false };
            } catch (error) {
                console.error('세션 타이머 업데이트 오류:', error);
                return { minutes: 0, seconds: 0, isExpired: true };
            }
        }

        /**
         * 세션 만료 5분 전 토스트 경고
         */
        function showSessionWarningToast(minutes, seconds) {
            showToast(
                `세션이 ${minutes}분 후 만료됩니다.`,
                'error',
                8000,
                {
                    details: '세션을 갱신하여 작업을 계속하세요.',
                    retryCallback: async () => {
                        await refreshSessionManually();
                    }
                }
            );
        }

        /**
         * 세션 경고 팝업 표시 (10분 전)
         */
        function showSessionWarning(minutes, seconds) {
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
            modal.id = 'session-warning-modal';
            
            modal.innerHTML = `
                <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                    <div class="flex items-center gap-3 mb-4">
                        <svg class="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                        <h3 class="text-xl font-bold text-gray-900">세션 만료 경고</h3>
                    </div>
                    <p class="text-gray-700 mb-6">
                        세션이 곧 만료됩니다. (<strong id="session-warning-time">${minutes}분 ${seconds}초</strong> 남음)<br>
                        세션을 갱신하여 작업을 계속하세요.
                    </p>
                    <div class="flex gap-3">
                        <button 
                            onclick="refreshSessionFromWarning()" 
                            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            tabindex="0"
                            aria-label="세션 갱신">
                            세션 갱신
                        </button>
                        <button 
                            onclick="closeSessionWarning()" 
                            class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            tabindex="0"
                            aria-label="나중에">
                            나중에
                        </button>
                    </div>
                    <p class="text-xs text-gray-500 mt-3 text-center">
                        세션이 만료되면 자동으로 로그아웃됩니다.
                    </p>
                </div>
            `;

            document.body.appendChild(modal);

            // 경고 시간 업데이트
            const warningTimeEl = document.getElementById('session-warning-time');
            const warningInterval = setInterval(() => {
                updateSessionTimer().then(result => {
                    if (result.isExpired || !result.minutes) {
                        clearInterval(warningInterval);
                        closeSessionWarning();
                        return;
                    }
                    if (warningTimeEl) {
                        warningTimeEl.textContent = `${result.minutes}분 ${result.seconds}초`;
                    }
                });
            }, 1000);
        }

        /**
         * 세션 경고 팝업 닫기
         */
        function closeSessionWarning() {
            const modal = document.getElementById('session-warning-modal');
            if (modal) {
                modal.remove();
            }
            sessionWarningShown = false;
        }

        /**
         * 경고 팝업에서 세션 갱신
         */
        async function refreshSessionFromWarning() {
            await refreshSessionManually();
            closeSessionWarning();
        }

        // 전역 함수로 등록
        window.closeSessionWarning = closeSessionWarning;
        window.refreshSessionFromWarning = refreshSessionFromWarning;

        /**
         * 세션 타이머 시작
         */
        function startSessionTimer() {
            // 기존 타이머 정리
            if (sessionTimerInterval) {
                clearInterval(sessionTimerInterval);
            }

            // 1초마다 업데이트
            sessionTimerInterval = setInterval(async () => {
                await updateSessionTimer();
                await updateAuthUI(); // UI도 함께 업데이트
            }, 1000);
        }

        /**
         * 세션 타이머 중지
         */
        function stopSessionTimer() {
            if (sessionTimerInterval) {
                clearInterval(sessionTimerInterval);
                sessionTimerInterval = null;
            }
        }

        async function updateAuthUI() {
            if (!authContainer) return;
            
            try {
                const userInfo = await window.authService?.getUserInfo();
                
                if (userInfo) {
                    // 세션 정보 가져오기
                    const session = await window.authSession?.getSession();
                    const sessionInfo = await updateSessionTimer();
                    
                    // 세션이 만료되었으면 로그아웃 처리
                    if (sessionInfo.isExpired) {
                        return;
                    }

                    // 시간 포맷팅
                    const timeStr = `${String(sessionInfo.minutes).padStart(2, '0')}:${String(sessionInfo.seconds).padStart(2, '0')}`;
                    const timeColor = sessionInfo.minutes <= 10 ? 'text-red-600' : 'text-blue-600';
                    
                    // IP 주소 가져오기
                    const ipAddress = await getIpAddress();

                    authContainer.innerHTML = `
                        <div class="flex items-center gap-4">
                            <div class="flex flex-col items-end gap-0.5">
                                <div class="flex items-center gap-2">
                                    <span class="text-xs text-gray-600 leading-tight whitespace-nowrap">
                                        <span class="font-semibold">${userInfo.name || '사용자'}</span>님
                                    </span>
                                    <span class="text-xs ${timeColor} font-mono font-semibold leading-tight" id="session-timer">${timeStr}</span>
                                </div>
                                <span class="text-xs text-gray-500 leading-tight whitespace-nowrap" title="IP 주소">${ipAddress}</span>
                            </div>
                            <div class="flex flex-col gap-1">
                                <button onclick="refreshSessionManually()" class="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
                                    세션 갱신
                                </button>
                                <button onclick="handleLogout()" class="px-3 py-1.5 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap">로그아웃</button>
                            </div>
                        </div>
                    `;
                } else {
                    stopSessionTimer();
                    authContainer.innerHTML = '<a href="login.html" class="text-sm text-blue-600">로그인</a>';
                }
            } catch (error) {
                console.error('Auth UI 업데이트 오류:', error);
                stopSessionTimer();
                authContainer.innerHTML = '<a href="login.html" class="text-sm text-blue-600">로그인</a>';
            }
        }

        /**
         * 수동 세션 갱신
         */
        async function refreshSessionManually() {
            try {
                showToast('세션 갱신 중...', 'info');
                
                // Supabase 세션 갱신
                const newSession = await window.authSession?.refreshSession();
                if (!newSession) {
                    showToast(
                        '세션 갱신에 실패했습니다.', 
                        'error',
                        5000,
                        { 
                            details: '인증 토큰이 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.',
                            retryCallback: async () => {
                                window.location.href = 'login.html';
                            }
                        }
                    );
                    return;
                }

                // 로그인 시간 초기화 (30분 타이머 리셋)
                const loginTimeKey = 'session_login_time';
                const newLoginTime = Date.now().toString();
                localStorage.setItem(loginTimeKey, newLoginTime);
                console.log('✅ 세션 갱신 완료 - 타이머 리셋:', new Date(parseInt(newLoginTime)).toLocaleTimeString('ko-KR'));
                
                showToast('세션이 갱신되었습니다. (30분 타이머 리셋)', 'success');
                sessionWarningShown = false; // 경고 상태 초기화
                await updateAuthUI();
            } catch (error) {
                console.error('세션 갱신 오류:', error);
                const errorDetails = error.message || '인증 서버와 통신하는 중 오류가 발생했습니다.';
                showToast(
                    '세션 갱신에 실패했습니다.', 
                    'error',
                    5000,
                    { 
                        details: errorDetails,
                        retryCallback: async () => {
                            await refreshSessionManually();
                        }
                    }
                );
            }
        }

        // 전역 함수로 등록
        window.refreshSessionManually = refreshSessionManually;

        /**
         * IP 주소 가져오기
         */
        async function getIpAddress() {
            if (currentIpAddress) {
                return currentIpAddress;
            }

            try {
                // 여러 API를 시도 (하나가 실패하면 다른 것으로)
                const apis = [
                    { url: 'https://api.ipify.org?format=json', extract: (data) => data.ip },
                    { url: 'https://api64.ipify.org?format=json', extract: (data) => data.ip },
                    { url: 'https://ipapi.co/json/', extract: (data) => data.ip || data.query }
                ];

                for (const api of apis) {
                    try {
                        // 타임아웃 처리
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 5000);
                        
                        const response = await fetch(api.url, { 
                            method: 'GET',
                            headers: { 'Accept': 'application/json' },
                            cache: 'no-cache',
                            signal: controller.signal
                        });
                        
                        clearTimeout(timeoutId);
                        
                        if (response.ok) {
                            const data = await response.json();
                            const ip = api.extract(data);
                            if (ip && typeof ip === 'string' && ip.match(/^\d+\.\d+\.\d+\.\d+$/)) {
                                currentIpAddress = ip;
                                console.log('✅ IP 주소 확인:', ip);
                                // localStorage에 저장 (세션 동안 재사용)
                                localStorage.setItem('current_ip_address', ip);
                                return ip;
                            }
                        }
                    } catch (err) {
                        console.warn('IP 주소 가져오기 실패 (API):', api.url, err);
                        continue;
                    }
                }

                // 모든 API 실패 시 localStorage에서 가져오기
                const savedIp = localStorage.getItem('current_ip_address');
                if (savedIp) {
                    currentIpAddress = savedIp;
                    console.log('✅ IP 주소 (캐시):', savedIp);
                    return savedIp;
                }

                return 'IP 주소 확인 중...';
            } catch (error) {
                console.error('IP 주소 가져오기 오류:', error);
                return 'IP 주소 확인 실패';
            }
        }

        /**
         * ✅ 워터마크 설정
         */
        async function setupWatermark() {
            const watermark = document.getElementById('watermark-overlay');
            if (!watermark) return;

            try {
                const userInfo = await window.authService?.getUserInfo();
                const ipAddress = await getIpAddress();
                
                let watermarkText = '';
                if (userInfo) {
                    const dateStr = new Date().toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    });
                    watermarkText = `${userInfo.affiliation || '사용자'} - ${userInfo.name || '사용자'} - ${ipAddress} - ${dateStr}`;
                } else {
                    watermarkText = `CONFIDENTIAL - ${ipAddress} - ${new Date().toLocaleDateString()}`;
                }
                
                watermark.innerHTML = '';
                
                const containerWidth = window.innerWidth;
                const containerHeight = window.innerHeight;
                const textWidth = 300;
                const textHeight = 100;
                
                const cols = Math.ceil(containerWidth / textWidth);
                const rows = Math.ceil(containerHeight / textHeight);
                const totalElements = cols * rows;
                
                for (let i = 0; i < totalElements; i++) {
                    const span = document.createElement('span');
                    span.textContent = watermarkText;
                    span.style.position = 'absolute';
                    span.style.color = 'rgba(0, 0, 0, 0.06)';
                    span.style.fontSize = '14px';
                    span.style.fontWeight = '600';
                    span.style.transform = 'rotate(-30deg)';
                    span.style.whiteSpace = 'nowrap';
                    span.style.pointerEvents = 'none';
                    span.style.userSelect = 'none';
                    
                    const col = i % cols;
                    const row = Math.floor(i / cols);
                    span.style.left = `${col * textWidth + 50}px`;
                    span.style.top = `${row * textHeight + 50}px`;
                    
                    watermark.appendChild(span);
                }
            } catch (error) {
                console.error('워터마크 설정 오류:', error);
            }
        }

/**
 * ✅ 텍스트를 PNG 이미지로 변환 (한글 폰트 지원)
 * 클라이언트에서 NanumSquareR 폰트를 사용하여 한글 워터마크 생성
 * @param {string} text - 워터마크 텍스트 (한글 가능)
 * @param {string} username - 사용자명 (영문 ID)
 * @param {object} userInfo - 사용자 정보 객체 (선택사항)
 */
async function createWatermarkImage(text, username = null, userInfo = null) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const fontSize = 24;
        // 한글 폰트 사용 (NanumSquareR)
        const fontFamily = 'NanumSquareR, "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
        let finalText = text;
        
        // 폰트 로드 대기
        const font = new FontFace('NanumSquareR', 'url(assets/NanumSquareR.ttf)');
        
        font.load().then((loadedFont) => {
            document.fonts.add(loadedFont);
            return new Promise(resolve => setTimeout(resolve, 100)); // 폰트 적용 대기
        }).then(() => {
            // 한글 워터마크 텍스트 생성
            // text에 이미 IP 주소가 포함되어 있으므로 그대로 사용
            if (text && text.trim()) {
                // 전달된 텍스트 사용 (IP 주소 포함)
                finalText = text;
                console.log('📝 Using provided watermark text (may include IP):', finalText);
            } else if (userInfo && username && username !== 'USER') {
                // 텍스트가 없으면 한글 워터마크 생성 (IP는 호출부에서 추가됨)
                const dateString = new Date().toLocaleDateString('ko-KR');
                const timeString = new Date().toLocaleTimeString('ko-KR');
                finalText = `${userInfo.name || username} - ${userInfo.affiliation || '소속'} - ${dateString} ${timeString}`;
                console.log('📝 Creating Korean watermark with text:', finalText);
            } else if (username && username !== 'USER') {
                // 폴백: 영문 워터마크
                const now = new Date();
                const dateStr = now.toISOString().split('T')[0];
                const timeStr = now.toTimeString().split(' ')[0];
                finalText = `${username} - ${dateStr} ${timeStr}`;
                console.log('📝 Creating English watermark with text:', finalText);
            } else {
                // 최종 폴백
                finalText = 'CONFIDENTIAL';
                console.log('📝 Using default watermark text:', finalText);
            }
            
            ctx.font = `${fontSize}px ${fontFamily}`;
            
            // 텍스트 크기 측정 (한글 포함)
            const textMetrics = ctx.measureText(finalText);
            const textWidth = textMetrics.width;
            const textHeight = fontSize * 1.5;
            
            const angle = 0;
            const padding = 40;
            
            canvas.width = textWidth + padding;
            canvas.height = textHeight + padding;

            // 다시 폰트 설정 (canvas 크기 변경 후)
            ctx.font = `${fontSize}px ${fontFamily}`;
            ctx.fillStyle = 'rgba(128, 128, 128, 0.7)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            
            // 회전 (0도이므로 생략 가능하지만 일관성을 위해 유지)
            ctx.translate(centerX, centerY);
            ctx.rotate(angle * Math.PI / 180);
            ctx.translate(-centerX, -centerY);

            ctx.fillText(finalText, centerX, centerY);

            const dataUrl = canvas.toDataURL('image/png');
            console.log('✅ Watermark image created (한글 지원), text:', finalText, 'size:', dataUrl.length);
            resolve(dataUrl);
        }).catch((error) => {
            console.warn('⚠️ Font loading failed, using fallback:', error);
            // 폰트 로드 실패 시 영문으로 폴백
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0];
            const timeStr = now.toTimeString().split(' ')[0];
            finalText = username ? `${username} - ${dateStr} ${timeStr}` : text;
            
            ctx.font = `${fontSize}px Arial, sans-serif`;
            const textMetrics = ctx.measureText(finalText);
            const padding = 40;
            
            canvas.width = textMetrics.width + padding;
            canvas.height = fontSize * 1.5 + padding;
            
            ctx.font = `${fontSize}px Arial, sans-serif`;
            ctx.fillStyle = 'rgba(128, 128, 128, 0.7)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            ctx.fillText(finalText, canvas.width / 2, canvas.height / 2);
            
            const dataUrl = canvas.toDataURL('image/png');
            console.log('✅ Watermark image created (영문 폴백), text:', finalText);
            resolve(dataUrl);
        });
    });
}

/**
 * ✅ Watermark가 적용된 파일 URL 조회
 * config.js에서 Supabase URL을 가져와 Edge Function 호출
 */
async function getWatermarkedFileUrl(bucketName, fileName, pageRange = null) {
    const userInfo = await window.authService?.getUserInfo();
    
    if (!userInfo) {
        showToast(
            '사용자 인증 정보가 없습니다.', 
            'error',
            5000,
            { 
                details: '로그인 세션이 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.',
                retryCallback: () => {
                    window.location.href = 'login.html';
                }
            }
        );
        return null;
    }
    const dateString = new Date().toLocaleDateString('ko-KR');
    const timeString = new Date().toLocaleTimeString('ko-KR');
    
    // username 가져오기 (우선순위: username > name > email)
    // username이 없으면 직접 DB에서 조회 시도
    let username = userInfo.username || userInfo.name || userInfo.email?.split('@')[0] || null;
    
    console.log('👤 UserInfo:', userInfo);
    console.log('👤 Username from userInfo:', username);
    
    // username이 없으면 Supabase에서 직접 조회
    if (!username || username === 'USER') {
        try {
            const session = await window.authSession?.getSession();
            if (session && window.supabaseClient) {
                const { data: dbUser, error: dbError } = await window.supabaseClient
                    .from('users')
                    .select('username')
                    .eq('auth_user_id', session.user.id)
                    .single();
                
                if (!dbError && dbUser?.username) {
                    username = dbUser.username;
                    console.log('✅ Username fetched from database:', username);
                } else {
                    console.warn('⚠️ Could not fetch username from database:', dbError);
                }
            }
        } catch (e) {
            console.error('❌ Error fetching username:', e);
        }
    }
    
    // 최종 폴백
    if (!username || username === 'USER') {
        username = 'USER';
        console.warn('⚠️ Using default USER as username');
    }
    
    console.log('👤 Final username to use:', username);
    
    // IP 주소 가져오기
    const ipAddress = await getIpAddress();
    
    // 한글 워터마크 텍스트 생성 (IP 주소 포함)
    const watermarkText = `${userInfo.name || username} - ${userInfo.affiliation || '소속'} - ${ipAddress} - ${dateString}`;
    
    console.log('📝 Korean watermark text (with IP):', watermarkText);
    console.log('📝 Username being used:', username);
    console.log('📝 IP Address:', ipAddress);
    
    // 클라이언트에서 텍스트를 이미지로 변환 (한글 워터마크)
    let watermarkImageDataUrl;
    try {
        // createWatermarkImage 함수가 내부에서 한글 워터마크 생성
        // username과 userInfo를 전달하여 사용자 정보와 함께 한글 워터마크 생성
        // IP 주소가 포함된 watermarkText를 전달
        watermarkImageDataUrl = await createWatermarkImage(watermarkText, username, userInfo);
    } catch (error) {
        console.warn('⚠️ Watermark creation failed:', error);
        // 최종 폴백: 영문 워터마크 (IP 주소 포함)
        const now = new Date();
        const englishDateStr = now.toISOString().split('T')[0];
        const englishTimeStr = now.toTimeString().split(' ')[0];
        const fallbackText = `${username} - ${ipAddress} - ${englishDateStr} ${englishTimeStr}`;
        watermarkImageDataUrl = await createWatermarkImage(fallbackText, username, null);
    }
    
    const supabaseUrl = window.SUPABASE_URL || 'https://sesedcotooihnpjklqzs.supabase.co';
    const endpoint = `${supabaseUrl}/functions/v1/smooth-function`;
    
    try {
        const token = await window.authSession.getAccessToken();
        if (!token) {
            showToast(
                '유효한 세션 토큰이 없습니다.', 
                'error',
                5000,
                { 
                    details: '인증 토큰이 만료되었습니다. 다시 로그인해주세요.',
                    retryCallback: () => {
                        window.location.href = 'login.html';
                    }
                }
            );
            return null;
        }
        
        console.log('📤 Edge Function 호출:', endpoint);
        console.log('📦 파일:', `${bucketName}/${fileName}`);
        console.log('🔐 워터마크:', watermarkText);
        
        showToast('문서 보안 처리 중...', 'info');
        
        // POST 방식으로 변경 (base64 이미지 데이터가 크므로)
        // pageRange가 있을 때만 start, end 포함 (없으면 전체 페이지)
        const body = JSON.stringify({
            bucket: bucketName,
            file: fileName,
            watermark: watermarkText,
            watermarkImage: watermarkImageDataUrl, // base64 인코딩된 이미지
            username: username, // username 전달
            ...(pageRange && Array.isArray(pageRange) && pageRange.length === 2 ? { start: pageRange[0], end: pageRange[1] } : {})
        });
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: body
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Edge Function 오류:', errorText);
            let errorMessage = `파일 로드 실패: ${response.status}`;
            let errorHint = '';
            
            // 404 에러인 경우
            if (response.status === 404) {
                errorMessage = '파일을 찾을 수 없습니다 (404)';
                errorHint = `파일 경로: ${bucketName}/${fileName}\n\n가능한 원인:\n1. Supabase Storage에 파일이 없음\n2. Edge Function이 배포되지 않음\n3. 파일명 또는 버킷명 오류\n\n확인 방법:\n- Supabase Dashboard > Storage에서 파일 존재 확인\n- Edge Functions에서 smooth-function 배포 상태 확인`;
            }
            
            try {
                const errorJson = JSON.parse(errorText);
                if (errorJson.details) {
                    errorMessage += ` - ${errorJson.details}`;
                    console.error('❌ Error details:', errorJson.details);
                }
                if (errorJson.error) {
                    errorMessage += ` - ${errorJson.error}`;
                }
            } catch (e) {
                // JSON 파싱 실패 시 원본 텍스트 사용
                console.error('❌ Error response:', errorText);
            }
            
            showToast(
                errorMessage, 
                'error',
                8000,
                {
                    details: errorHint || `파일: ${bucketName}/${fileName}`
                }
            );
            return null;
        }
        
        console.log('✅ 파일 처리 완료');
        const fileBlob = await response.blob();
        const blobUrl = URL.createObjectURL(fileBlob);
        
        showToast('문서 로드 완료!', 'success');
        return blobUrl;
        
    } catch (e) {
        console.error("❌ Fetch 통신 오류:", e);
        
        // 네트워크 오류인지 확인
        const isNetworkError = e instanceof TypeError && e.message.includes('fetch');
        const errorDetails = isNetworkError 
            ? '인터넷 연결을 확인해주세요.'
            : e.message || '알 수 없는 오류가 발생했습니다.';
        
        // 재시도 함수
        const retryFunction = async () => {
            showToast('다시 시도 중...', 'info', 2000);
            return await getWatermarkedFileUrl(bucketName, fileName, pageRange);
        };
        
        showToast(
            '서버 통신 오류가 발생했습니다.', 
            'error', 
            5000,
            {
                retryCallback: retryFunction,
                details: errorDetails
            }
        );
        return null;
    }
}
        /**
         * ✅ 파일 다운로드
         */
        async function downloadSecureFile(fileName, bucketName, pageRange) {
            showToast('워터마크가 삽입된 파일 다운로드 준비 중...', 'info');
            
            const fileBlobUrl = await getWatermarkedFileUrl(bucketName, fileName, pageRange); 

            if (fileBlobUrl) {
                const link = document.createElement('a');
                link.href = fileBlobUrl;
                link.download = `워터마크_${fileName.split('/').pop()}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(fileBlobUrl);
                showToast('다운로드를 시작합니다.', 'success');
            } else {
                showToast('파일 다운로드에 실패했습니다.', 'error');
            }
        }

        /**
         * ✅ 트리 렌더링
         */
        function renderTree(data, level = 0) {
            return data.map(item => `
                <div class="tree-item" data-id="${item.id}" style="margin-left: ${level * 20}px;">
                    <div class="tree-content">
                        ${item.children ? `
                            <span class="tree-toggle">▶</span>
                        ` : ''}
                        <span class="tree-icon">${getTreeIcon(item.type)}</span>
                        <span class="tree-label">${item.label}</span>
                        ${item.children ? `<span class="tree-badge">${item.children.length}</span>` : ''}
                    </div>
                    ${item.children ? `
                        <div class="tree-children collapsed">
                            ${renderTree(item.children, level + 1)}
                        </div>
                    ` : ''}
                </div>
            `).join('');
        }

        /**
         * ✅ PDF/이미지 뷰어 HTML (모바일 최적화)
         */
        function pdfViewerHTML(fileBlobUrl, pageRange = null, title = '', fileName = '', bucketName = 'manual') {
            // 다운로드 버튼의 pageRange 처리: pageRange가 있으면 사용, 없으면 null 전달
            const downloadPageRange = pageRange ? `[${pageRange[0]},${pageRange[1]}]` : 'null';
            
            // 모바일 디바이스 감지 (User Agent 및 화면 크기 기준)
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
            
            // 모바일 환경: 새 창으로 열기 UI 제공
            if (isMobile) {
                return `
                    <div class="pdf-viewer-container w-full h-full flex flex-col">
                        <div class="flex items-center justify-between mb-3 px-1">
                            <h3 class="text-lg font-semibold text-gray-800">${title}</h3>
                        </div>
                        <div class="flex-1 border border-gray-300 rounded-lg overflow-auto bg-gray-50 flex items-center justify-center p-4" style="min-height: calc(100vh - 200px);">
                            <div class="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
                                <svg class="w-16 h-16 mx-auto mb-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 class="text-lg font-semibold text-gray-800 mb-2">모바일 환경 감지</h3>
                                <p class="text-gray-600 text-sm mb-6">모바일 브라우저에서는 새 창에서 열어주세요.</p>
                                <div class="flex flex-col gap-3">
                                    <button 
                                        onclick="window.open('${fileBlobUrl}', '_blank')" 
                                        class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                                        📄 새 창에서 열기
                                    </button>
                                    <button 
                                        onclick="downloadSecureFile('${fileName}', '${bucketName}', ${downloadPageRange})"
                                        class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
                                        ⬇️ PDF 다운로드
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            // 데스크톱 환경: 기존 iframe 방식 유지
            return `
                <div class="pdf-viewer-container w-full h-full flex flex-col">
                    <div class="flex items-center justify-between mb-3 px-1">
                        <h3 class="text-lg font-semibold text-gray-800">${title}</h3>
                        <div class="flex items-center gap-2">
                            <button class="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors" 
                                    onclick="downloadSecureFile('${fileName}', '${bucketName}', ${downloadPageRange})">
                                다운로드
                            </button>
                        </div>
                    </div>
                    <div class="flex-1 border border-gray-300 rounded-lg overflow-hidden bg-gray-50" style="min-height: calc(100vh - 200px);">
                        <iframe src="${fileBlobUrl}" 
                                class="w-full h-full" 
                                frameborder="0"
                                style="min-height: 800px;"
                                allowfullscreen></iframe>
                    </div>
                </div>
            `;
        }

        function imageViewerHTML(fileBlobUrl, title = '', fileName = '', bucketName = 'manual') {
            return `
                <div class="image-viewer-container w-full h-full flex flex-col">
                    <div class="flex items-center justify-between mb-3 px-1">
                        <h3 class="text-lg font-semibold text-gray-800">${title}</h3>
                        <button class="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors" 
                                onclick="downloadSecureFile('${fileName}', '${bucketName}', null)">
                            다운로드
                        </button>
                    </div>
                    <div class="flex-1 border border-gray-300 rounded-lg overflow-auto bg-gray-50 flex items-center justify-center p-4" style="min-height: calc(100vh - 200px);">
                        <img src="${fileBlobUrl}" alt="${title}" class="max-w-full max-h-full object-contain">
                    </div>
                </div>
            `;
        }

        /**
         * ✅ 문서 선택 핸들러
         */
        async function handleDocumentSelection(treeItem, id) {
            const viewer = document.getElementById('document-viewer');
            if (viewer && PDF_MAPPING[id]) {
                const doc = PDF_MAPPING[id];
                
                document.querySelectorAll('.tree-item.active').forEach(item => {
                    if (item !== treeItem) item.classList.remove('active');
                });
                treeItem.classList.add('active');

                viewer.innerHTML = skeletonLoadingHTML();
                
                const range = doc.type === 'pdf' ? doc.pageRange : null;
                const fileBlobUrl = await getWatermarkedFileUrl(doc.bucket, doc.fileName, range);
                
                if (!fileBlobUrl) {
                    viewer.innerHTML = '<p class="text-red-500 text-center py-8">파일을 로드할 권한이 없거나 오류가 발생했습니다.</p>';
                    return;
                }

                if (doc.type === 'pdf') {
                    viewer.innerHTML = pdfViewerHTML(fileBlobUrl, doc.pageRange, doc.title, doc.fileName, doc.bucket);
                } else if (doc.type === 'image') {
                    viewer.innerHTML = imageViewerHTML(fileBlobUrl, doc.title, doc.fileName, doc.bucket);
                }
            }
        }

        // ---- 6. 페이지 렌더링 함수 ----

        async function renderHomePage() {
            const homeUserInfo = await window.authService?.getUserInfo();
            const homeIsAdmin = homeUserInfo?.role === 'admin';
            const homeLinks = NAV_LINKS.filter(link => link.type !== 'dropdown' && link.href && (!link.adminOnly || homeIsAdmin));
            
            return `
                <div class="max-w-4xl mx-auto p-6">
                    <div class="mb-8">
                        <h1 class="text-3xl font-bold text-gray-900 mb-2">EVKMC A/S 포털</h1>
                        <p class="text-gray-600">정비 기술 문서 및 서비스 정보에 오신 것을 환영합니다.</p>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        ${homeLinks.map(link => `
                            <a href="${link.href}" class="block p-6 bg-white rounded-xl shadow-soft hover:shadow-lg transition-all duration-200 border border-gray-100">
                                <div class="flex items-center mb-3">
                                    <svg class="w-6 h-6 text-brand mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        ${link.icon}
                                    </svg>
                                    <h3 class="text-lg font-semibold text-gray-900">${link.label}</h3>
                                </div>
                                <p class="text-gray-600 text-sm">관련 문서 및 정보를 확인하세요</p>
                            </a>
                        `).join('')}
                        
                        <!-- 게시판 카드 (드롭다운 대신 직접 링크) -->
                        <div class="p-6 bg-white rounded-xl shadow-soft hover:shadow-lg transition-all duration-200 border border-gray-100">
                            <div class="flex items-center mb-3">
                                <svg class="w-6 h-6 text-brand mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" stroke="currentColor" stroke-width="2"/>
                                </svg>
                                <h3 class="text-lg font-semibold text-gray-900">게시판</h3>
                            </div>
                            <div class="space-y-2">
                                <a href="#/notices" class="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm text-gray-700 hover:text-blue-600">
                                    <span class="font-medium">📢 공지사항</span>
                                    <span class="text-gray-500 text-xs ml-2">중요 공지 확인</span>
                                </a>
                                <a href="#/community" class="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm text-gray-700 hover:text-blue-600">
                                    <span class="font-medium">💬 커뮤니티</span>
                                    <span class="text-gray-500 text-xs ml-2">자유로운 소통</span>
                                </a>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-xl shadow-soft p-6">
                        <h2 class="text-xl font-semibold mb-4">최근 공지사항</h2>
                        <div id="recent-notices-container">
                            ${skeletonLoadingHTML()}
                        </div>
                    </div>
                </div>
            `;
        }

        async function renderDocPage(title) {
            // 사용자 정보 확인
            const userInfo = await window.authService?.getUserInfo();
            if (!userInfo) {
                return `
                    <div class="bg-white rounded-xl shadow-soft p-6 text-center">
                        <div class="text-5xl mb-4">🚫</div>
                        <h2 class="text-xl font-bold mb-2 text-red-600">접근 제한</h2>
                        <p class="text-sm text-gray-700 mb-4">
                            기술문서 열람은 등록된 사용자만 가능합니다.
                        </p>
                        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                            <p class="text-xs text-yellow-800 font-medium mb-1">⚠️ 접근 불가</p>
                            <p class="text-xs text-yellow-700">
                                • 현재 계정은 시스템에 등록되지 않았습니다<br>
                                • 기술문서 열람이 제한됩니다<br>
                                • 관리자에게 계정 등록을 요청하세요
                            </p>
                        </div>
                        <button onclick="window.location.hash='#/home'" 
                                class="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
                            홈으로 돌아가기
                        </button>
                    </div>
                `;
            }
            
            const treeData = getTreeDataByTitle(title);
            
            return `
                <div class="max-w-6xl mx-auto p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h1 class="text-2xl font-bold text-gray-900">${title}</h1>
                        <div class="flex items-center gap-4">
                            <select id="model-select" class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand">
                                ${MODELS.map(model => `<option value="${model.value}">${model.label}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div class="lg:col-span-1">
                            <div class="bg-white rounded-xl shadow-soft p-4 sticky top-4">
                                <div class="tree-search mb-4" style="position: relative;">
                                    <input 
                                        type="text" 
                                        placeholder="검색..." 
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                                        onfocus="showSearchHistory(this)"
                                        tabindex="0"
                                        aria-label="문서 검색">
                                </div>
                                <div id="tree-container" class="max-h-[calc(100vh-200px)] overflow-y-auto">
                                    ${renderTree(treeData)}
                                </div>
                            </div>
                        </div>
                        
                        <div class="lg:col-span-3">
                            <div class="bg-white rounded-xl shadow-soft p-4" style="min-height: calc(100vh - 150px);">
                                <div id="document-viewer" class="w-full h-full flex items-center justify-center text-gray-500" style="min-height: calc(100vh - 200px);">
                                    <div class="text-center">
                                        <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                        </svg>
                                        <p>문서를 선택하세요</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        async function renderNoticesListPage() {
            try {
                // 사용자 정보 확인
                const userInfo = await window.authService?.getUserInfo();
                if (!userInfo) {
                    return `
                        <div class="bg-white rounded-xl shadow-soft p-6 text-center">
                            <div class="text-5xl mb-4">🚫</div>
                            <h2 class="text-xl font-bold mb-2 text-red-600">접근 제한</h2>
                            <p class="text-sm text-gray-700 mb-4">
                                공지사항 열람은 등록된 사용자만 가능합니다.
                            </p>
                            <button onclick="window.location.hash='#/home'" 
                                    class="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
                                홈으로 돌아가기
                            </button>
                        </div>
                    `;
                }
                
                const notices = await window.dataService?.getNotices(100) || [];
                
                // 관리 권한 확인
                const canManage = await window.dataService?.canManageNotices() || false;

                const noticesHTML = notices.map(notice => {
                    // 중요도 배지 (category에 따라)
                    const importanceBadge = notice.category === '중요' || notice.category === '긴급' 
                        ? '<span class="inline-flex items-center px-2 py-1 text-xs font-bold text-red-700 bg-red-100 rounded-full mr-2">⚠️ 중요</span>'
                        : notice.category === '업데이트'
                        ? '<span class="inline-flex items-center px-2 py-1 text-xs font-bold text-yellow-700 bg-yellow-100 rounded-full mr-2">🔄 업데이트</span>'
                        : '';
                    
                    // 조회수 (view_count 또는 views)
                    const viewCount = notice.view_count || notice.views || 0;
                    
                    // 작성자 정보
                    const authorName = notice.author_name || notice.author || '관리자';
                    const authorAffiliation = notice.author_affiliation || '';
                    
                    // 작성 시간 포맷팅
                    const createdDate = new Date(notice.created_at);
                    const isToday = createdDate.toDateString() === new Date().toDateString();
                    const dateStr = isToday 
                        ? `오늘 ${createdDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`
                        : createdDate.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
                    
                    return `
                        <div class="bg-white rounded-xl shadow-soft p-6 mb-4 border border-gray-100 hover:border-blue-200 transition-colors">
                            <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
                                <div class="flex items-center gap-2 flex-wrap">
                                    ${importanceBadge}
                                    <span class="text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">${notice.category || '일반'}</span>
                                </div>
                                <span class="text-xs text-gray-500">${dateStr}</span>
                            </div>
                            <h3 class="text-lg font-semibold text-gray-900 mb-2 cursor-pointer hover:text-blue-600 transition-colors" onclick="viewNotice(${notice.id})">
                                ${notice.title}
                            </h3>
                            <p class="text-gray-600 text-sm mb-3">${(notice.content || '내용이 없습니다.').substring(0, 150)}${(notice.content || '').length > 150 ? '...' : ''}</p>
                            <div class="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                                <div class="flex items-center gap-3">
                                    <span class="flex items-center gap-1">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                        </svg>
                                        ${authorName}${authorAffiliation ? ` (${authorAffiliation})` : ''}
                                    </span>
                                </div>
                                <div class="flex items-center gap-3">
                                    <span class="flex items-center gap-1">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                        </svg>
                                        조회 ${viewCount.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');

                const writeButton = canManage ? `
                    <button onclick="openNoticeEditor()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        공지사항 작성
                    </button>
                ` : '';

                return `
                    <div class="max-w-4xl mx-auto p-6">
                        <div class="flex items-center justify-between mb-6">
                            <h1 class="text-2xl font-bold text-gray-900">공지사항</h1>
                            ${writeButton}
                        </div>
                        <div id="notices-list">
                            ${noticesHTML || '<p class="text-gray-500 text-center py-8">공지사항이 없습니다.</p>'}
                        </div>
                    </div>
                `;
            } catch (error) {
                console.error('공지사항 로드 오류:', error);
                return `
                    <div class="max-w-4xl mx-auto p-6">
                        <h1 class="text-2xl font-bold text-gray-900 mb-6">공지사항</h1>
                        <div class="bg-white rounded-xl shadow-soft p-6">
                            <p class="text-red-500 text-center">공지사항을 불러올 수 없습니다.</p>
                        </div>
                    </div>
                `;
            }
        }

        async function renderNoticeDetailPage(id) {
            try {
                // 사용자 정보 확인
                const userInfo = await window.authService?.getUserInfo();
                if (!userInfo) {
                    return `
                        <div class="bg-white rounded-xl shadow-soft p-6 text-center">
                            <div class="text-5xl mb-4">🚫</div>
                            <h2 class="text-xl font-bold mb-2 text-red-600">접근 제한</h2>
                            <p class="text-sm text-gray-700 mb-4">
                                공지사항 열람은 등록된 사용자만 가능합니다.
                            </p>
                            <button onclick="window.location.hash='#/home'" 
                                    class="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
                                홈으로 돌아가기
                            </button>
                        </div>
                    `;
                }
                
                const notice = await window.dataService?.getNoticeById(id) || {
                    id: id,
                    title: '공지사항을 찾을 수 없습니다',
                    content: '요청하신 공지사항이 존재하지 않습니다.',
                    category: '오류',
                    created_at: new Date().toISOString()
                };

                // 관리 권한 확인
                const canManage = await window.dataService?.canManageNotices() || false;

                const manageButtons = canManage ? `
                    <div class="flex gap-2 mt-4">
                        <button onclick="openNoticeEditor(${notice.id})" class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                            수정
                        </button>
                        <button onclick="deleteNotice(${notice.id})" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                            삭제
                        </button>
                    </div>
                ` : '';

                return `
                    <div class="max-w-4xl mx-auto p-6">
                        <div class="mb-6">
                            <a href="#/notices" class="text-blue-600 hover:text-blue-800 flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                                </svg>
                                목록으로 돌아가기
                            </a>
                        </div>
                        <div class="bg-white rounded-xl shadow-soft p-8">
                            <div class="flex items-center justify-between mb-6">
                                <span class="text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">${notice.category || '일반'}</span>
                                <span class="text-sm text-gray-500">${new Date(notice.created_at).toLocaleString()}</span>
                            </div>
                            <h1 class="text-2xl font-bold text-gray-900 mb-6">${notice.title}</h1>
                            <div class="prose max-w-none">
                                <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">${notice.content || '내용이 없습니다.'}</p>
                            </div>
                            ${manageButtons}
                        </div>
                    </div>
                `;
            } catch (error) {
                console.error('공지사항 상세 로드 오류:', error);
                return `
                    <div class="max-w-4xl mx-auto p-6">
                        <div class="mb-6">
                            <a href="#/notices" class="text-blue-600 hover:text-blue-800">← 목록으로</a>
                        </div>
                        <div class="bg-white rounded-xl shadow-soft p-6">
                            <p class="text-red-500 text-center">공지사항을 불러올 수 없습니다.</p>
                        </div>
                    </div>
                `;
            }
        }

        // ---- 커뮤니티 UI ----
        
        async function renderCommunityListPage() {
            try {
                // 사용자 정보 확인
                const userInfo = await window.authService?.getUserInfo();
                if (!userInfo) {
                    return `
                        <div class="bg-white rounded-xl shadow-soft p-6 text-center">
                            <div class="text-5xl mb-4">🚫</div>
                            <h2 class="text-xl font-bold mb-2 text-red-600">접근 제한</h2>
                            <p class="text-sm text-gray-700 mb-4">
                                커뮤니티 열람은 등록된 사용자만 가능합니다.
                            </p>
                            <button onclick="window.location.hash='#/home'" 
                                    class="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
                                홈으로 돌아가기
                            </button>
                        </div>
                    `;
                }
                
                let posts = [];
                try {
                    posts = await window.dataService?.getCommunityPosts(null, 20, 0) || [];
                } catch (error) {
                    console.error('커뮤니티 게시글 로드 오류:', error);
                    // 에러가 발생해도 빈 목록으로 계속 진행
                    posts = [];
                }
                
                const postsHTML = posts.map(post => {
                    // 작성자 정보
                    const authorName = post.author_name || post.author || '익명';
                    const authorAffiliation = post.author_affiliation || '';
                    
                    // 조회수, 댓글 수
                    const viewCount = post.view_count || post.views || 0;
                    const commentCount = post.comment_count || (post.comments ? post.comments.length : 0);
                    
                    // 작성 시간 포맷팅
                    const createdDate = new Date(post.created_at);
                    const isToday = createdDate.toDateString() === new Date().toDateString();
                    const isYesterday = new Date(createdDate.getTime() + 86400000).toDateString() === new Date().toDateString();
                    let dateStr = '';
                    if (isToday) {
                        dateStr = `오늘 ${createdDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`;
                    } else if (isYesterday) {
                        dateStr = `어제 ${createdDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`;
                    } else {
                        dateStr = createdDate.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
                    }
                    
                    // 카테고리별 색상
                    const categoryColors = {
                        '질문': 'bg-blue-100 text-blue-800',
                        '정비팁': 'bg-green-100 text-green-800',
                        '문제해결': 'bg-orange-100 text-orange-800',
                        '자료공유': 'bg-purple-100 text-purple-800'
                    };
                    const categoryColor = categoryColors[post.category] || 'bg-gray-100 text-gray-800';
                    
                    return `
                        <div class="bg-white rounded-xl shadow-soft p-6 mb-4 border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all">
                            <div class="flex items-start justify-between mb-3 flex-wrap gap-2">
                                <div class="flex items-center gap-2 flex-wrap">
                                    <span class="text-xs px-3 py-1 ${categoryColor} rounded-full font-medium">
                                        ${post.category || '질문'}
                                    </span>
                                    ${post.is_solved ? '<span class="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full font-medium">✓ 해결됨</span>' : ''}
                                    ${post.is_pinned ? '<span class="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full font-medium">📌 고정</span>' : ''}
                                </div>
                                <span class="text-xs text-gray-500">${dateStr}</span>
                            </div>
                            <h3 class="text-lg font-semibold text-gray-900 mb-2 cursor-pointer hover:text-purple-600 transition-colors" onclick="viewCommunityPost(${post.id})">
                                ${post.title}
                            </h3>
                            <p class="text-gray-600 text-sm mb-4 line-clamp-2">
                                ${(post.content || '내용이 없습니다.').substring(0, 150)}${(post.content || '').length > 150 ? '...' : ''}
                            </p>
                            <div class="flex items-center justify-between pt-3 border-t border-gray-100">
                                <div class="flex items-center gap-4 text-xs text-gray-500">
                                    <span class="flex items-center gap-1">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                        </svg>
                                        ${authorName}${authorAffiliation ? ` (${authorAffiliation})` : ''}
                                    </span>
                                </div>
                                <div class="flex items-center gap-4 text-xs text-gray-500">
                                    <span class="flex items-center gap-1">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                        </svg>
                                        조회 ${viewCount.toLocaleString()}
                                    </span>
                                    <span class="flex items-center gap-1">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                    </svg>
                                    ${post.likes_count || 0}
                                </span>
                                <span class="flex items-center gap-1">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                                    </svg>
                                    ${post.comments_count || 0}
                                </span>
                            </div>
                            ${post.tags && post.tags.length > 0 ? `
                                <div class="flex items-center gap-1 flex-wrap">
                                    ${post.tags.slice(0, 3).map(tag => `
                                        <span class="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">#${tag}</span>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('');

                // 게시글 작성 권한 확인
                const canCreatePost = await window.dataService?.canCreateCommunityPost() || false;

                return `
                    <div class="max-w-5xl mx-auto p-6">
                        <div class="flex items-center justify-between mb-6">
                            <h1 class="text-2xl font-bold text-gray-900">커뮤니티</h1>
                            ${canCreatePost ? `
                            <button onclick="openCommunityEditor()" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                                글 작성
                            </button>
                            ` : `
                            <div class="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed flex items-center gap-2" title="Silver Label 이상만 게시글 작성이 가능합니다">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                                글 작성
                            </div>
                            `}
                        </div>
                        <div class="mb-4 flex gap-2">
                            <button onclick="filterCommunityPosts('all')" class="category-filter px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm" data-category="all">
                                전체
                            </button>
                            <button onclick="filterCommunityPosts('정비팁')" class="category-filter px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm" data-category="정비팁">
                                정비팁
                            </button>
                            <button onclick="filterCommunityPosts('문제해결')" class="category-filter px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm" data-category="문제해결">
                                문제해결
                            </button>
                            <button onclick="filterCommunityPosts('질문')" class="category-filter px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm" data-category="질문">
                                질문
                            </button>
                            <button onclick="filterCommunityPosts('자료공유')" class="category-filter px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm" data-category="자료공유">
                                자료공유
                            </button>
                        </div>
                        <div id="community-list">
                            ${posts.length > 0 ? postsHTML : `
                                <div class="bg-white rounded-xl shadow-soft p-12 text-center">
                                    <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"></path>
                                    </svg>
                                    <p class="text-gray-500 text-lg mb-2">아직 게시글이 없습니다</p>
                                    <p class="text-gray-400 text-sm mb-6">첫 번째 게시글을 작성해보세요!</p>
                                    ${canCreatePost ? `
                                    <button onclick="openCommunityEditor()" class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                                        첫 게시글 작성하기
                                    </button>
                                    ` : `
                                    <div class="px-6 py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed inline-block" title="Silver Label 이상만 게시글 작성이 가능합니다">
                                        첫 게시글 작성하기
                                    </div>
                                    `}
                                </div>
                            `}
                        </div>
                    </div>
                `;
            } catch (error) {
                console.error('커뮤니티 로드 오류:', error);
                return `
                    <div class="max-w-5xl mx-auto p-6">
                        <h1 class="text-2xl font-bold text-gray-900 mb-6">커뮤니티</h1>
                        <div class="bg-white rounded-xl shadow-soft p-12 text-center">
                            <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                            <p class="text-red-500 text-lg mb-2">게시글을 불러올 수 없습니다</p>
                            <p class="text-gray-500 text-sm mb-4">데이터베이스 테이블이 생성되지 않았을 수 있습니다.</p>
                            <p class="text-gray-400 text-xs">Supabase Dashboard에서 SQL 마이그레이션을 실행해주세요.</p>
                        </div>
                    </div>
                `;
            }
        }

        async function renderCommunityDetailPage(id) {
            try {
                const post = await window.dataService?.getCommunityPostById(id);
                
                if (!post) {
                    return `
                        <div class="max-w-4xl mx-auto p-6">
                            <div class="mb-6">
                                <a href="#/community" class="text-purple-600 hover:text-purple-800 flex items-center gap-2">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                                    </svg>
                                    목록으로 돌아가기
                                </a>
                            </div>
                            <div class="bg-white rounded-xl shadow-soft p-8 text-center">
                                <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                </svg>
                                <p class="text-red-500 text-lg mb-2">게시글을 찾을 수 없습니다</p>
                                <p class="text-gray-500 text-sm mb-4">데이터베이스 테이블이 생성되지 않았을 수 있습니다.</p>
                                <a href="#/community" class="text-purple-600 hover:text-purple-800 text-sm">← 목록으로 돌아가기</a>
                            </div>
                        </div>
                    `;
                }

                // 좋아요한 사용자 목록 조회
                const likes = await window.dataService?.getPostLikes(id) || [];
                const hasLiked = await window.dataService?.hasUserLikedPost(id);
                
                // 댓글 목록 조회
                const comments = await window.dataService?.getComments(id) || [];

                // 작성자 확인 (수정/삭제 권한)
                const userInfo = await window.authService?.getUserInfo();
                const session = await window.authSession?.getSession();
                const isAuthor = post.author_id === session?.user?.id;
                const isAdmin = userInfo?.role === 'admin';
                
                // 댓글 작성 권한 확인
                const canCreateComment = await window.dataService?.canCreateComment() || false;

                const manageButtons = (isAuthor || isAdmin) ? `
                    <div class="flex gap-2 mt-4">
                        <button onclick="openCommunityEditor(${post.id})" class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                            수정
                        </button>
                        <button onclick="deleteCommunityPost(${post.id})" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                            삭제
                        </button>
                    </div>
                ` : '';

                return `
                    <div class="max-w-4xl mx-auto p-6">
                        <div class="mb-6">
                            <a href="#/community" class="text-purple-600 hover:text-purple-800 flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                                </svg>
                                목록으로 돌아가기
                            </a>
                        </div>
                        <div class="bg-white rounded-xl shadow-soft p-8 mb-6">
                            <div class="flex items-center justify-between mb-6">
                                <div class="flex items-center gap-2">
                                    <span class="text-sm px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-medium">
                                        ${post.category || '질문'}
                                    </span>
                                    ${post.is_solved ? '<span class="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">✓ 해결됨</span>' : ''}
                                </div>
                                <span class="text-sm text-gray-500">${new Date(post.created_at).toLocaleString()}</span>
                            </div>
                            <h1 class="text-2xl font-bold text-gray-900 mb-6">${post.title}</h1>
                            <div class="prose max-w-none mb-6">
                                <div class="text-gray-700 leading-relaxed whitespace-pre-wrap">${post.content || '내용이 없습니다.'}</div>
                            </div>
                            
                            ${post.attachments && post.attachments.length > 0 ? `
                                <div class="mb-6">
                                    <h3 class="text-sm font-semibold text-gray-700 mb-2">첨부파일</h3>
                                    <div class="flex flex-wrap gap-2">
                                        ${post.attachments.map(file => `
                                            <a href="${file.url}" target="_blank" class="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm">
                                                ${window.fileUploadService?.getFileIcon(file.type) || ''}
                                                <span>${file.name}</span>
                                                <span class="text-xs text-gray-500">(${window.fileUploadService?.formatFileSize(file.size) || ''})</span>
                                            </a>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            
                            ${post.tags && post.tags.length > 0 ? `
                                <div class="mb-6">
                                    <div class="flex items-center gap-2 flex-wrap">
                                        ${post.tags.map(tag => `
                                            <span class="text-sm px-3 py-1 bg-purple-50 text-purple-700 rounded-full">#${tag}</span>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            
                            <div class="flex items-center justify-between pt-4 border-t border-gray-200">
                                <div class="flex items-center gap-4 text-sm text-gray-600">
                                    <span>작성자: ${post.author_name || '익명'}</span>
                                    <span>조회수: ${post.views || 0}</span>
                                </div>
                                <button 
                                    onclick="toggleCommunityLike(${post.id})" 
                                    class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${hasLiked ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}">
                                    <svg class="w-5 h-5 ${hasLiked ? 'fill-current' : ''}" fill="${hasLiked ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                    </svg>
                                    <span>좋아요 ${post.likes_count || 0}</span>
                                </button>
                            </div>
                            
                            ${likes.length > 0 ? `
                                <div class="mt-4 pt-4 border-t border-gray-200">
                                    <h3 class="text-sm font-semibold text-gray-700 mb-2">추천한 사용자 (${likes.length}명)</h3>
                                    <div class="flex flex-wrap gap-2">
                                        ${likes.map(like => `
                                            <span class="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded-full">
                                                ${like.user_name || '익명'}${like.user_affiliation ? ` (${like.user_affiliation})` : ''}
                                            </span>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            
                            ${manageButtons}
                        </div>
                        
                        <!-- 댓글 섹션 -->
                        <div class="bg-white rounded-xl shadow-soft p-6 mb-6">
                            <h2 class="text-lg font-semibold text-gray-900 mb-4">댓글 (${comments.length})</h2>
                            <div id="comments-list" class="space-y-4 mb-6">
                                ${comments.map(comment => {
                                    const isCommentAuthor = comment.author_id === session?.user?.id;
                                    const canDeleteComment = isCommentAuthor || isAdmin;
                                    return `
                                        <div class="border-b border-gray-200 pb-4 last:border-0">
                                            <div class="flex items-start justify-between">
                                                <div class="flex-1">
                                                    <div class="flex items-center gap-2 mb-2">
                                                        <span class="font-semibold text-gray-900">${comment.author_name || '익명'}</span>
                                                        <span class="text-xs text-gray-500">${new Date(comment.created_at).toLocaleString()}</span>
                                                    </div>
                                                    <p class="text-gray-700 whitespace-pre-wrap">${comment.content}</p>
                                                </div>
                                                ${canDeleteComment ? `
                                                    <button onclick="deleteComment(${comment.id}, ${post.id})" class="text-red-500 hover:text-red-700 text-sm">
                                                        삭제
                                                    </button>
                                                ` : ''}
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                            ${canCreateComment ? `
                            <div class="border-t border-gray-200 pt-4">
                                <textarea 
                                    id="comment-input" 
                                    placeholder="댓글을 입력하세요..." 
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3"
                                    rows="3"></textarea>
                                <button 
                                    onclick="addComment(${post.id})" 
                                    class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                                    댓글 작성
                                </button>
                            </div>
                            ` : `
                            <div class="border-t border-gray-200 pt-4">
                                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                                    <p class="text-sm text-yellow-800 font-medium mb-1">⚠️ 댓글 작성 권한이 없습니다</p>
                                    <p class="text-xs text-yellow-700">
                                        ${userInfo?.grade ? `현재 등급(${userInfo.grade})으로는 댓글 작성이 제한됩니다.` : '등록된 사용자만 댓글을 작성할 수 있습니다.'}
                                    </p>
                                </div>
                            </div>
                            `}
                        </div>
                    </div>
                `;
            } catch (error) {
                console.error('커뮤니티 상세 로드 오류:', error);
                return `
                    <div class="max-w-4xl mx-auto p-6">
                        <div class="mb-6">
                            <a href="#/community" class="text-purple-600 hover:text-purple-800">← 목록으로</a>
                        </div>
                        <div class="bg-white rounded-xl shadow-soft p-6">
                            <p class="text-red-500 text-center">게시글을 불러올 수 없습니다.</p>
                        </div>
                    </div>
                `;
            }
        }

async function renderAdminDashboardPage() {
    const userInfo = await window.authService?.getUserInfo();
    if (!userInfo || userInfo.role !== 'admin') {
        return `<div class="max-w-4xl mx-auto p-6">
            <div class="bg-white rounded-xl shadow-soft p-6 text-center">
                <div class="text-5xl mb-4">🚫</div>
                <h2 class="text-xl font-bold text-red-600 mb-2">접근 권한 없음</h2>
                <p class="text-gray-600">관리자만 접근할 수 있는 페이지입니다.</p>
            </div>
        </div>`;
    }

    let allUsers = [];
    let gradeRequests = [];
    let stats = { total: 0, admin: 0, user: 0, blue: 0, silver: 0, black: 0, noGrade: 0, pendingRequests: 0 };

    try {
        const { data: users, error } = await window.supabaseClient
            .from('users')
            .select('*')
            .order('profile_id', { ascending: true });
        console.log('👥 사용자 조회 결과:', { count: users?.length, error: error?.message });
        if (!error && users) {
            allUsers = users;
            stats.total = users.length;
            stats.admin = users.filter(u => u.role === 'admin').length;
            stats.user = users.filter(u => u.role !== 'admin').length;
            stats.blue = users.filter(u => u.grade === 'blue').length;
            stats.silver = users.filter(u => u.grade === 'silver').length;
            stats.black = users.filter(u => u.grade === 'black').length;
            stats.noGrade = users.filter(u => !u.grade).length;
        }
    } catch (e) { console.error('사용자 조회 오류:', e); }
    console.log('📊 통계:', stats);

    try {
        const { data: requests, error } = await window.supabaseClient
            .from('grade_upgrade_requests')
            .select('*')
            .order('created_at', { ascending: false });
        if (!error && requests) {
            gradeRequests = requests;
            stats.pendingRequests = requests.filter(r => r.status === 'pending').length;
        }
    } catch (e) { console.error('등급 요청 조회 오류:', e); }

    const gradeLabel = (g) => g === 'black' ? '⚫ 블랙' : g === 'silver' ? '⚪ 실버' : g === 'blue' ? '🔵 블루' : '-';
    const statusLabel = (s) => s === 'pending' ? '⏳ 대기' : s === 'approved' ? '✅ 승인' : s === 'rejected' ? '❌ 거부' : s === 'cancelled' ? '🚫 취소' : s;
    const statusBadge = (s) => s === 'pending' ? 'bg-yellow-100 text-yellow-800' : s === 'approved' ? 'bg-green-100 text-green-800' : s === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800';

    const html = `
        <div class="max-w-6xl mx-auto p-6">
            <h1 class="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                관리자 대시보드
            </h1>
            <p class="text-sm text-gray-500 mb-6">포털 사용자 및 등급 관리</p>

            <!-- 탭 -->
            <div class="flex border-b border-gray-200 mb-6" id="admin-tabs">
                <button class="admin-tab active px-4 py-2 text-sm font-medium border-b-2 border-gray-800 text-gray-900" data-tab="overview">개요</button>
                <button class="admin-tab px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700" data-tab="users">사용자 관리</button>
                <button class="admin-tab px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 relative" data-tab="requests">
                    등급 요청
                    ${stats.pendingRequests > 0 ? `<span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">${stats.pendingRequests}</span>` : ''}
                </button>
            </div>

            <!-- 개요 탭 -->
            <div id="admin-tab-overview" class="admin-tab-content">
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div class="bg-white rounded-xl shadow-soft p-4 text-center">
                        <p class="text-3xl font-bold text-gray-900">${stats.total}</p>
                        <p class="text-sm text-gray-500">전체 사용자</p>
                    </div>
                    <div class="bg-white rounded-xl shadow-soft p-4 text-center">
                        <p class="text-3xl font-bold text-blue-600">${stats.blue}</p>
                        <p class="text-sm text-gray-500">🔵 블루</p>
                    </div>
                    <div class="bg-white rounded-xl shadow-soft p-4 text-center">
                        <p class="text-3xl font-bold text-gray-500">${stats.silver}</p>
                        <p class="text-sm text-gray-500">⚪ 실버</p>
                    </div>
                    <div class="bg-white rounded-xl shadow-soft p-4 text-center">
                        <p class="text-3xl font-bold text-gray-900">${stats.black}</p>
                        <p class="text-sm text-gray-500">⚫ 블랙</p>
                    </div>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="bg-white rounded-xl shadow-soft p-6">
                        <h3 class="font-semibold text-gray-900 mb-4">역할 분포</h3>
                        <div class="space-y-3">
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-600">관리자</span>
                                <span class="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">${stats.admin}명</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-600">일반 사용자</span>
                                <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">${stats.user}명</span>
                            </div>
                        </div>
                    </div>
                    <div class="bg-white rounded-xl shadow-soft p-6">
                        <h3 class="font-semibold text-gray-900 mb-4">등급 업그레이드 요청</h3>
                        <div class="space-y-3">
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-600">대기 중</span>
                                <span class="px-2 py-1 ${stats.pendingRequests > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'} rounded-full text-xs font-medium">${stats.pendingRequests}건</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-600">전체 요청</span>
                                <span class="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">${gradeRequests.length}건</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 사용자 관리 탭 -->
            <div id="admin-tab-users" class="admin-tab-content hidden">
                <div class="mb-4">
                    <input type="text" id="admin-user-search" placeholder="이름, 이메일, 소속으로 검색..." class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:outline-none">
                </div>
                <div class="bg-white rounded-xl shadow-soft overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead class="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">이메일</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">소속</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">역할</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">등급</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">관리</th>
                                </tr>
                            </thead>
                            <tbody id="admin-users-tbody" class="divide-y divide-gray-100">
                                ${allUsers.map(u => `
                                    <tr class="admin-user-row hover:bg-gray-50" data-search="${(u.username||'').toLowerCase()} ${(u.name||'').toLowerCase()} ${(u.email||'').toLowerCase()} ${(u.affiliation||'').toLowerCase()}">
                                        <td class="px-4 py-3 text-gray-800 font-mono text-xs">${u.username || '-'}</td>
                                        <td class="px-4 py-3 font-medium text-gray-900">${u.name || '-'}</td>
                                        <td class="px-4 py-3 text-gray-600">${u.email || '-'}</td>
                                        <td class="px-4 py-3 text-gray-600">${u.affiliation || '-'}</td>
                                        <td class="px-4 py-3">
                                            <select class="admin-role-select text-xs border border-gray-300 rounded px-2 py-1" data-user-id="${u.profile_id}">
                                                <option value="user" ${u.role !== 'admin' ? 'selected' : ''}>사용자</option>
                                                <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>관리자</option>
                                            </select>
                                        </td>
                                        <td class="px-4 py-3">
                                            <select class="admin-grade-select text-xs border border-gray-300 rounded px-2 py-1" data-user-id="${u.profile_id}">
                                                <option value="blue" ${u.grade === 'blue' ? 'selected' : ''}>🔵 블루</option>
                                                <option value="silver" ${u.grade === 'silver' ? 'selected' : ''}>⚪ 실버</option>
                                                <option value="black" ${u.grade === 'black' ? 'selected' : ''}>⚫ 블랙</option>
                                            </select>
                                        </td>
                                        <td class="px-4 py-3 flex gap-1">
                                            <button class="admin-save-user-btn text-xs px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors" data-user-id="${u.profile_id}">저장</button>
                                            <button class="admin-detail-user-btn text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors" data-user-idx="${allUsers.indexOf(u)}">상세</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- 등급 요청 탭 -->
            <div id="admin-tab-requests" class="admin-tab-content hidden">
                ${gradeRequests.length === 0 ? `
                    <div class="bg-white rounded-xl shadow-soft p-8 text-center">
                        <p class="text-gray-500">등급 업그레이드 요청이 없습니다.</p>
                    </div>
                ` : `
                    <div class="space-y-4">
                        ${gradeRequests.map(r => `
                            <div class="bg-white rounded-xl shadow-soft p-5">
                                <div class="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 class="font-semibold text-gray-900">${r.user_name || '-'}</h3>
                                        <p class="text-sm text-gray-500">${r.user_email || ''} · ${r.user_affiliation || ''}</p>
                                    </div>
                                    <span class="px-3 py-1 ${statusBadge(r.status)} rounded-full text-xs font-medium">${statusLabel(r.status)}</span>
                                </div>
                                <div class="flex items-center gap-2 mb-3 text-sm">
                                    <span class="text-gray-600">${gradeLabel(r.current_grade)}</span>
                                    <span class="text-gray-400">→</span>
                                    <span class="font-medium text-gray-900">${gradeLabel(r.requested_grade)}</span>
                                </div>
                                <p class="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 mb-3">${r.reason || '-'}</p>
                                <div class="flex items-center justify-between">
                                    <span class="text-xs text-gray-400">${new Date(r.created_at).toLocaleDateString('ko-KR')} ${new Date(r.created_at).toLocaleTimeString('ko-KR', {hour:'2-digit', minute:'2-digit'})}</span>
                                    ${r.status === 'pending' ? `
                                        <div class="flex gap-2">
                                            <button class="admin-approve-btn text-xs px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors" data-request-id="${r.id}">승인</button>
                                            <button class="admin-reject-btn text-xs px-4 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors" data-request-id="${r.id}">거부</button>
                                        </div>
                                    ` : r.admin_notes ? `<span class="text-xs text-gray-500">메모: ${r.admin_notes}</span>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        </div>
    `;

    setTimeout(() => {
        // 탭 전환
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.admin-tab').forEach(t => {
                    t.classList.remove('active', 'border-b-2', 'border-gray-800', 'text-gray-900');
                    t.classList.add('text-gray-500');
                });
                tab.classList.add('active', 'border-b-2', 'border-gray-800', 'text-gray-900');
                tab.classList.remove('text-gray-500');
                document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.add('hidden'));
                document.getElementById(`admin-tab-${tab.dataset.tab}`)?.classList.remove('hidden');
            });
        });

        // 사용자 검색
        document.getElementById('admin-user-search')?.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase();
            document.querySelectorAll('.admin-user-row').forEach(row => {
                row.style.display = row.dataset.search.includes(q) ? '' : 'none';
            });
        });

        // 사용자 역할/등급 저장
        document.querySelectorAll('.admin-save-user-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const userId = btn.dataset.userId;
                const row = btn.closest('tr');
                const newRole = row.querySelector('.admin-role-select').value;
                const newGrade = row.querySelector('.admin-grade-select').value;
                btn.textContent = '저장 중...';
                btn.disabled = true;
                try {
                    const { error } = await window.supabaseClient
                        .from('users')
                        .update({ role: newRole, grade: newGrade })
                        .eq('profile_id', userId);
                    if (error) throw error;
                    btn.textContent = '완료!';
                    btn.classList.replace('bg-gray-800', 'bg-green-600');
                    setTimeout(() => {
                        btn.textContent = '저장';
                        btn.classList.replace('bg-green-600', 'bg-gray-800');
                        btn.disabled = false;
                    }, 1500);
                } catch (e) {
                    console.error('사용자 업데이트 오류:', e);
                    btn.textContent = '오류';
                    btn.classList.replace('bg-gray-800', 'bg-red-600');
                    setTimeout(() => {
                        btn.textContent = '저장';
                        btn.classList.replace('bg-red-600', 'bg-gray-800');
                        btn.disabled = false;
                    }, 1500);
                }
            });
        });

        // 등급 요청 승인
        document.querySelectorAll('.admin-approve-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const reqId = btn.dataset.requestId;
                btn.textContent = '처리 중...';
                btn.disabled = true;
                try {
                    const { error } = await window.supabaseClient
                        .from('grade_upgrade_requests')
                        .update({ status: 'approved', admin_notes: '관리자 승인' })
                        .eq('id', reqId);
                    if (error) throw error;
                    btn.textContent = '승인됨';
                    btn.classList.replace('bg-green-600', 'bg-gray-400');
                    btn.nextElementSibling?.remove();
                    showToast('등급 업그레이드 요청이 승인되었습니다.', 'success');
                } catch (e) {
                    console.error('승인 오류:', e);
                    btn.textContent = '오류';
                    btn.disabled = false;
                }
            });
        });

        // 등급 요청 거부
        document.querySelectorAll('.admin-reject-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const reqId = btn.dataset.requestId;
                btn.textContent = '처리 중...';
                btn.disabled = true;
                try {
                    const { error } = await window.supabaseClient
                        .from('grade_upgrade_requests')
                        .update({ status: 'rejected', admin_notes: '관리자 거부' })
                        .eq('id', reqId);
                    if (error) throw error;
                    btn.textContent = '거부됨';
                    btn.classList.replace('bg-red-600', 'bg-gray-400');
                    btn.previousElementSibling?.remove();
                    showToast('등급 업그레이드 요청이 거부되었습니다.', 'error');
                } catch (e) {
                    console.error('거부 오류:', e);
                    btn.textContent = '오류';
                    btn.disabled = false;
                }
            });
        });

        // 사용자 상세 보기
        document.querySelectorAll('.admin-detail-user-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.userIdx);
                const u = allUsers[idx];
                if (!u) return;
                const agreeStatus = u.security_agreement_accepted ? '✅ 동의 완료' : '❌ 미동의';
                const agreeDate = u.security_agreement_date ? new Date(u.security_agreement_date).toLocaleString('ko-KR') : '-';
                const agreeCompany = u.security_agreement_company || '-';
                const agreeName = u.security_agreement_name || '-';
                const lastLogin = u.last_login_at ? new Date(u.last_login_at).toLocaleString('ko-KR') : '-';
                const hasCard = u.business_card_url ? '✅ 등록됨' : '❌ 미등록';

                const overlay = document.createElement('div');
                overlay.className = 'fixed inset-0 bg-black bg-opacity-60 z-[9999] flex items-center justify-center p-4';
                const modal = document.createElement('div');
                modal.className = 'bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto';

                const headerEl = document.createElement('div');
                headerEl.className = 'bg-gray-800 text-white p-5 rounded-t-xl';
                headerEl.innerHTML = '<h2 class="text-lg font-bold">' + (u.name || '-') + ' 상세 정보</h2><p class="text-sm text-gray-300 mt-1">' + (u.username || '-') + ' · ' + (u.email || '-') + '</p>';

                const bodyEl = document.createElement('div');
                bodyEl.className = 'p-5 space-y-4';

                const section = (title, rows) => {
                    let h = '<div class="border rounded-lg overflow-hidden"><div class="bg-gray-50 px-4 py-2 font-semibold text-sm text-gray-700">' + title + '</div><div class="divide-y divide-gray-100">';
                    rows.forEach(r => { h += '<div class="flex justify-between px-4 py-2.5 text-sm"><span class="text-gray-500">' + r[0] + '</span><span class="font-medium text-gray-900">' + r[1] + '</span></div>'; });
                    h += '</div></div>';
                    return h;
                };

                let cardImageHtml = '';
                if (u.business_card_url) {
                    cardImageHtml = '<div class="border rounded-lg overflow-hidden mt-4"><div class="bg-gray-50 px-4 py-2 font-semibold text-sm text-gray-700">명함 이미지</div><div class="p-4 flex justify-center bg-white"><img src="' + u.business_card_url + '" alt="명함" class="max-w-full max-h-64 rounded-lg shadow-sm object-contain" onerror="this.parentElement.innerHTML=\'<p class=\\\'text-sm text-gray-400 text-center py-4\\\'>이미지를 불러올 수 없습니다</p>\'"></div></div>';
                }

                bodyEl.innerHTML =
                    section('계정 정보', [
                        ['ID (사번)', u.username || '-'],
                        ['이름', u.name || '-'],
                        ['이메일', u.email || '-'],
                        ['연락처', u.phone || '-'],
                        ['소속', u.affiliation || '-'],
                        ['역할', u.role === 'admin' ? '관리자' : '사용자'],
                        ['등급', u.grade === 'black' ? '⚫ 블랙' : u.grade === 'silver' ? '⚪ 실버' : '🔵 블루'],
                    ]) +
                    section('보안서약서', [
                        ['동의 여부', agreeStatus],
                        ['동의 일시', agreeDate],
                        ['소속 회사명', agreeCompany],
                        ['담당자 이름', agreeName],
                    ]) +
                    section('활동 정보', [
                        ['마지막 로그인', lastLogin],
                        ['명함 등록', hasCard],
                    ]) +
                    cardImageHtml;

                const footerEl = document.createElement('div');
                footerEl.className = 'p-4 border-t text-center';
                const closeBtn = document.createElement('button');
                closeBtn.className = 'px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium';
                closeBtn.textContent = '닫기';
                footerEl.appendChild(closeBtn);

                modal.appendChild(headerEl);
                modal.appendChild(bodyEl);
                modal.appendChild(footerEl);
                overlay.appendChild(modal);
                document.body.appendChild(overlay);

                closeBtn.addEventListener('click', () => overlay.remove());
                overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
            });
        });
    }, 100);

    return html;
}

async function renderAccountPage() {
    try {
        const userInfo = await window.authService?.getUserInfo();
        const session = await window.authSession.getSession();
        const lastLoginTime = await window.authSession.getLastLoginTime();
        
        if (!session) {
            return `
                <div class="max-w-2xl mx-auto p-6">
                    <h1 class="text-2xl font-bold text-gray-900 mb-6">내 정보</h1>
                    <div class="bg-white rounded-xl shadow-soft p-6">
                        <p class="text-red-500 text-center">세션 정보를 불러올 수 없습니다.</p>
                    </div>
                </div>
            `;
        }

        // 시간 계산 (30분 세션 기준)
        const now = Date.now();
        
        // localStorage에서 로그인 시간 가져오기
        const loginTimeKey = 'session_login_time';
        const loginTime = localStorage.getItem(loginTimeKey);
        const loginTimestamp = loginTime ? parseInt(loginTime) : now;
        
        // 30분 세션 기준으로 계산
        const sessionDuration = 30 * 60 * 1000; // 30분
        const elapsedTime = now - loginTimestamp;
        const remainingTime = sessionDuration - elapsedTime;
        
        const minutes = Math.floor(remainingTime / 60000);
        const seconds = Math.floor((remainingTime % 60000) / 1000);
        
        // 세션 시작 시간 (로그인 시간)
        const sessionStartTime = new Date(loginTimestamp);
        const expiresAt = new Date(loginTimestamp + sessionDuration);
        
        return `
            <div class="max-w-4xl mx-auto p-6">
                <h1 class="text-2xl font-bold text-gray-900 mb-6">내 정보</h1>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- 계정 정보 -->
                    <div class="bg-white rounded-xl shadow-soft p-6">
                        <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                            계정 정보
                        </h2>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">이름</label>
                                <input type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" value="${userInfo?.name || '정보 없음'}" readonly>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">소속</label>
                                <input type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" value="${userInfo?.affiliation || '정보 없음'}" readonly>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">권한</label>
                                <input type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" value="${userInfo?.role === 'admin' ? '관리자' : '사용자'}" readonly>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">연락처</label>
                                <input type="tel" class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" value="${userInfo?.phone || '정보 없음'}" readonly>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">등급 (Grade)</label>
                                <div class="flex items-center gap-2 mb-2">
                                    <span class="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-semibold ${userInfo?.grade === 'black' ? 'text-gray-900' : userInfo?.grade === 'silver' ? 'text-gray-600' : 'text-blue-600'}">
                                        ${userInfo?.grade === 'black' ? '⚫ 블랙 라벨' : userInfo?.grade === 'silver' ? '⚪ 실버 라벨' : userInfo?.grade === 'blue' ? '🔵 블루 라벨' : '등급 없음'}
                                    </span>
                                </div>
                                ${userInfo?.role === 'admin' ? `
                                <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 mb-3">
                                    <p class="font-semibold mb-2">등급별 접근 권한 (관리자 전용 정보):</p>
                                    <ul class="space-y-1 list-disc list-inside mb-2">
                                        <li><strong>블루 라벨:</strong> 정비지침서, TSB</li>
                                        <li><strong>실버 라벨:</strong> 정비지침서, 전장회로도, 와이어링 커넥터, TSB</li>
                                        <li><strong>블랙 라벨:</strong> 모든 기술문서 접근 가능</li>
                                    </ul>
                                    <div class="mt-2 pt-2 border-t border-blue-300">
                                        <p class="font-semibold mb-1">게시판 권한:</p>
                                        <ul class="space-y-1 list-disc list-inside">
                                            <li><strong>블루 라벨:</strong> 공지사항 조회, 커뮤니티 조회, 댓글 작성</li>
                                            <li><strong>실버 라벨:</strong> 공지사항 조회, 커뮤니티 조회/작성, 댓글 작성</li>
                                            <li><strong>블랙 라벨:</strong> 공지사항 조회, 커뮤니티 조회/작성, 댓글 작성</li>
                                            <li><strong>관리자:</strong> 모든 권한 (공지사항 작성/수정/삭제 포함)</li>
                                        </ul>
                                    </div>
                                </div>
                                ` : ''}
                                ${userInfo?.role !== 'admin' ? `
                                <button 
                                    onclick="openGradeUpgradeRequest()" 
                                    class="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium flex items-center justify-center gap-2 shadow-md"
                                >
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                    </svg>
                                    등급 업그레이드 요청
                                </button>
                                ` : ''}
                            </div>
                        </div>
                        <div class="mt-4 pt-4 border-t border-gray-200">
                            <p class="text-xs text-gray-500 mb-3">정보 변경은 관리자에게 문의해주세요.</p>
                            <button 
                                onclick="showSecurityAgreementView()" 
                                class="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium flex items-center justify-center gap-2"
                            >
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                보안서약서 전문 보기
                            </button>
                        </div>
                    </div>

                    <!-- 세션 정보 -->
                    <div class="space-y-6">
                        <!-- 현재 세션 상태 -->
                        <div class="bg-white rounded-xl shadow-soft p-6">
                            <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                세션 정보
                            </h2>
                            
                            <!-- 세션 남은 시간 (크게 강조) -->
                            <div class="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 mb-4">
                                <div class="text-center">
                                    <p class="text-sm text-gray-600 mb-2">세션 남은 시간</p>
                                    <div id="session-countdown" class="text-3xl font-bold text-purple-600">
                                        ${minutes}분 ${seconds}초
                                    </div>
                                </div>
                            </div>

                            <div class="space-y-3">
                                <div class="session-info-row">
                                    <span class="session-label">🔑 로그인 시간</span>
                                    <span class="session-value">${sessionStartTime.toLocaleString('ko-KR', {
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}</span>
                                </div>
                                
                                ${lastLoginTime ? `
                                <div class="session-info-row">
                                    <span class="session-label">🚪 마지막 로그인</span>
                                    <span class="session-value">${new Date(lastLoginTime).toLocaleString('ko-KR', {
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}</span>
                                </div>
                                ` : ''}
                                
                                <div class="session-info-row">
                                    <span class="session-label">⏰ 세션 만료</span>
                                    <span class="session-value">${expiresAt.toLocaleString('ko-KR', {
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}</span>
                                </div>

                                <div class="session-info-row">
                                    <span class="session-label">📅 계정 생성</span>
                                    <span class="session-value">${new Date(session.user.created_at).toLocaleDateString('ko-KR')}</span>
                                </div>
                            </div>
                        </div>

                        <!-- 명함 이미지 -->
                        <div class="bg-white rounded-xl shadow-soft p-6">
                            <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                명함 이미지
                            </h2>
                            <div class="space-y-4">
                                <!-- 미리보기 영역 (드래그 앤 드롭 지원) -->
                                <div id="business-card-preview" class="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[300px] max-h-[400px] flex items-center justify-center bg-gray-50 transition-colors cursor-pointer hover:border-purple-400 hover:bg-purple-50 overflow-hidden" 
                                     style="position: relative;">
                                    <div class="text-center text-gray-500 pointer-events-none">
                                        <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                        </svg>
                                        <p class="text-sm">명함 이미지가 없습니다</p>
                                        <p class="text-xs mt-1 text-gray-400">이미지를 드래그하여 놓거나 클릭하여 선택하세요</p>
                                    </div>
                                </div>
                                
                                <!-- 업로드 버튼 -->
                                <div>
                                    <input type="file" id="business-card-upload" accept="image/jpeg,image/png,image/webp" class="hidden">
                                    <button 
                                        type="button"
                                        onclick="document.getElementById('business-card-upload').click()"
                                        class="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
                                    >
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                        </svg>
                                        명함 이미지 업로드
                                    </button>
                                    <p class="text-xs text-gray-500 mt-2 text-center">이미지는 자동으로 1MB 미만으로 압축됩니다</p>
                                </div>
                            </div>
                        </div>

                        <!-- 계정 관리 -->
                        <div class="bg-white rounded-xl shadow-soft p-6">
                            <h2 class="text-lg font-semibold text-gray-900 mb-4">계정 관리</h2>
                            <div class="space-y-3">
                                <button class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2" onclick="refreshSession()">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                    </svg>
                                    세션 갱신
                                </button>
                                <button class="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2" onclick="handleLogout()">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                    </svg>
                                    로그아웃
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('계정 정보 로드 오류:', error);
        return `
            <div class="max-w-2xl mx-auto p-6">
                <h1 class="text-2xl font-bold text-gray-900 mb-6">내 정보</h1>
                <div class="bg-white rounded-xl shadow-soft p-6">
                    <p class="text-red-500 text-center">계정 정보를 불러올 수 없습니다.</p>
                </div>
            </div>
        `;
    }
}

// 세션 카운트다운 초기화 함수
function initSessionCountdown() {
                    const loginTimeKey = 'session_login_time';
                    const sessionDuration = 30 * 60 * 1000; // 30분
                    const countdownEl = document.getElementById('session-countdown');
                    
                    if (countdownEl) {
                        const interval = setInterval(() => {
                            const loginTime = localStorage.getItem(loginTimeKey);
                            if (!loginTime) {
                                clearInterval(interval);
                                countdownEl.textContent = '만료됨';
                                countdownEl.classList.add('text-red-600');
                                return;
                            }
                            
                            const now = Date.now();
                            const loginTimestamp = parseInt(loginTime);
                            const elapsedTime = now - loginTimestamp;
                            const remaining = sessionDuration - elapsedTime;
                            
                            if (remaining <= 0) {
                                clearInterval(interval);
                                countdownEl.textContent = '만료됨';
                                countdownEl.classList.add('text-red-600');
                                // 자동 로그아웃
                                setTimeout(() => {
                                    if (window.handleLogout) {
                                        window.handleLogout();
                                    }
                                }, 1000);
                                return;
                            }
                            
                            const minutes = Math.floor(remaining / 60000);
                            const seconds = Math.floor((remaining % 60000) / 1000);
                            
                            // 10분 이하면 빨간색으로 변경
                            if (minutes <= 10) {
                                countdownEl.classList.remove('text-purple-600');
                                countdownEl.classList.add('text-red-600');
                            } else {
                                countdownEl.classList.remove('text-red-600');
                                countdownEl.classList.add('text-purple-600');
                            }
                            
                            countdownEl.textContent = minutes + '분 ' + seconds + '초';
                        }, 1000);
                    }
}

// 명함 이미지 업로드 초기화 함수 (DOM 삽입 후 호출)
async function initBusinessCardUpload() {
    console.log('명함 이미지 업로드 초기화 시작');
    
    // DOM이 완전히 로드될 때까지 대기
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const uploadInput = document.getElementById('business-card-upload');
    const previewDiv = document.getElementById('business-card-preview');
    
    if (!uploadInput || !previewDiv) {
        console.error('명함 이미지 업로드 요소를 찾을 수 없습니다:', { uploadInput, previewDiv });
        return;
    }
    
    // Supabase 클라이언트 확인
    if (!window.supabaseClient) {
        console.error('window.supabaseClient가 초기화되지 않았습니다.');
        previewDiv.innerHTML = `
            <div class="text-center text-red-500">
                <p class="text-sm">Supabase 클라이언트 초기화 오류</p>
                <p class="text-xs mt-1">페이지를 새로고침해주세요</p>
            </div>
        `;
        return;
    }
    
    console.log('명함 이미지 업로드 모듈 초기화 완료');
    
    // 토스트 메시지 표시 함수
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white font-medium transition-all transform translate-x-0 opacity-100`;
        toast.style.backgroundColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    // 기존 명함 이미지 로드
    async function loadExistingCard() {
                        try {
                            const userInfo = await window.authService?.getUserInfo();
                            const session = await window.authSession.getSession();
                            if (userInfo && session?.user?.id) {
                                const userId = session.user.id;
                                console.log('명함 이미지 로드 시도:', userId);
                                
                                // Supabase Storage에서 명함 이미지 조회 (여러 버킷 이름 시도)
                                const bucketNames = ['business_cards', 'BUSINESS_CARDS', 'Business_Cards'];
                                let files = null;
                                let error = null;
                                let successfulBucket = null;
                                
                                for (const bucketName of bucketNames) {
                                    try {
                                        console.log(`버킷 '${bucketName}'에서 파일 목록 조회 시도...`);
                                        const result = await window.supabaseClient
                                            .storage
                                            .from(bucketName)
                                            .list(userId, {
                                                limit: 1,
                                                sortBy: { column: 'created_at', order: 'desc' }
                                            });
                                        
                                        if (!result.error && result.data) {
                                            files = result.data;
                                            error = result.error;
                                            successfulBucket = bucketName;
                                            console.log(`버킷 '${bucketName}' 조회 성공:`, files);
                                            break;
                                        } else {
                                            console.warn(`버킷 '${bucketName}' 조회 실패:`, result.error);
                                        }
                                    } catch (bucketError) {
                                        console.warn(`버킷 '${bucketName}' 조회 중 오류:`, bucketError);
                                    }
                                }
                                
                                console.log('명함 이미지 조회 결과:', { files, error, successfulBucket });
                                
                                if (!error && files && files.length > 0 && successfulBucket) {
                                    const filePath = userId + '/' + files[0].name;
                                    
                                    // Public URL 시도
                                    let imageUrl = null;
                                    try {
                                        const { data: { publicUrl } } = window.supabaseClient
                                            .storage
                                            .from(successfulBucket)
                                            .getPublicUrl(filePath);
                                        imageUrl = publicUrl;
                                        console.log(`명함 이미지 Public URL (버킷: ${successfulBucket}):`, imageUrl);
                                    } catch (urlError) {
                                        console.warn('Public URL 생성 실패, Signed URL 시도:', urlError);
                                        // Public URL이 실패하면 Signed URL 시도
                                        try {
                                            const { data: { signedUrl }, error: signedError } = await window.supabaseClient
                                                .storage
                                                .from(successfulBucket)
                                                .createSignedUrl(filePath, 3600);
                                            
                                            if (!signedError && signedUrl) {
                                                imageUrl = signedUrl;
                                                console.log(`명함 이미지 Signed URL (버킷: ${successfulBucket}):`, imageUrl);
                                            }
                                        } catch (signedUrlError) {
                                            console.error('Signed URL 생성 실패:', signedUrlError);
                                        }
                                    }
                                    
                                    if (imageUrl) {
                                        previewDiv.innerHTML = `
                                            <div class="relative w-full h-full flex items-center justify-center overflow-hidden">
                                                <img src="${imageUrl}" alt="명함 이미지" class="w-full h-full object-contain rounded-lg" id="business-card-loaded-image">
                                                <div class="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1 z-10 shadow-md">
                                                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                                                    </svg>
                                                    저장됨
                                                </div>
                                            </div>
                                        `;
                                        
                                        // 이미지 로드 이벤트 핸들러 추가
                                        const loadedImg = previewDiv.querySelector('#business-card-loaded-image');
                                        if (loadedImg) {
                                            loadedImg.onerror = function() {
                                                this.style.display = 'none';
                                                const placeholder = this.parentElement.querySelector('.image-placeholder') || document.createElement('div');
                                                placeholder.className = 'image-placeholder text-center text-gray-400';
                                                placeholder.innerHTML = '<svg class="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg><p class="text-sm">명함 이미지</p>';
                                                if (!this.parentElement.querySelector('.image-placeholder')) {
                                                    this.parentElement.appendChild(placeholder);
                                                }
                                            };
                                            loadedImg.onload = function() {
                                                console.log('이미지 로드 성공:', this.src);
                                                const placeholder = this.parentElement.querySelector('.image-placeholder');
                                                if (placeholder) placeholder.remove();
                                            };
                                        }
                                    } else {
                                        console.error('이미지 URL을 생성할 수 없습니다');
                                        previewDiv.innerHTML = `
                                            <div class="text-center text-gray-500">
                                                <p class="text-sm">이미지 URL 생성 실패</p>
                                            </div>
                                        `;
                                    }
                                } else {
                                    console.log('저장된 명함 이미지가 없습니다:', error);
                                    if (error) {
                                        console.error('파일 목록 조회 오류:', error);
                                    }
                                }
                            }
    } catch (error) {
                            console.error('명함 이미지 로드 오류:', error);
                        }
    }
    
    // 초기 로드
    await loadExistingCard();

    // 이미지 압축 함수 (1MB 미만, 해상도 유지)
    async function compressImage(file, maxSizeMB = 1) {
                        return new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                const img = new Image();
                                img.onload = () => {
                                    const canvas = document.createElement('canvas');
                                    const ctx = canvas.getContext('2d');
                                    
                                    // 원본 해상도 유지
                                    canvas.width = img.width;
                                    canvas.height = img.height;
                                    ctx.drawImage(img, 0, 0);
                                    
                                    // 품질 조절하여 압축
                                    let quality = 0.9;
                                    
                                    const compress = () => {
                                        canvas.toBlob((blob) => {
                                            if (blob.size <= maxSizeMB * 1024 * 1024 || quality <= 0.1) {
                                                resolve(blob);
                                            } else {
                                                quality -= 0.1;
                                                compress();
                                            }
                                        }, file.type, quality);
                                    };
                                    
                                    compress();
                                };
                                img.src = e.target.result;
                            };
                            reader.readAsDataURL(file);
                        });
    }

    // 파일 업로드 공통 함수
    async function handleFileUpload(file) {
                        console.log('handleFileUpload 호출됨:', { file, fileName: file?.name, fileType: file?.type, fileSize: file?.size });
                        
                        if (!file) {
                            console.error('파일이 없습니다');
                            return;
                        }

                        // 이미지 파일만 허용
                        if (!file.type.startsWith('image/')) {
                            console.warn('이미지 파일이 아닙니다:', file.type);
                            showToast('이미지 파일만 업로드 가능합니다.', 'error');
                            return;
                        }

                        // Supabase 클라이언트 재확인
                        if (!window.supabaseClient) {
                            console.error('업로드 시점에 supabaseClient가 없습니다');
                            showToast('Supabase 클라이언트 오류. 페이지를 새로고침해주세요.', 'error');
                            return;
                        }

                        try {
                            console.log('업로드 시작 - 파일 정보:', {
                                name: file.name,
                                type: file.type,
                                size: file.size,
                                lastModified: file.lastModified
                            });
                            // 로딩 표시
                            previewDiv.innerHTML = `
                                <div class="text-center py-8">
                                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                                    <p class="text-sm text-gray-600">이미지 압축 중...</p>
                                    <p class="text-xs text-gray-400 mt-1">원본 크기: ${(file.size / 1024 / 1024).toFixed(2)}MB</p>
                                </div>
                            `;

                            // 이미지 압축
                            const compressedBlob = await compressImage(file, 1);
                            const originalSize = file.size;
                            const compressedSize = compressedBlob.size;
                            const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
                            
                            console.log('이미지 압축 완료:', {
                                원본: (originalSize / 1024 / 1024).toFixed(2) + 'MB',
                                압축: (compressedSize / 1024 / 1024).toFixed(2) + 'MB',
                                압축률: compressionRatio + '%'
                            });
                            
                            // 압축된 이미지 미리보기
                            const previewUrl = URL.createObjectURL(compressedBlob);
                            previewDiv.innerHTML = `
                                <div class="relative w-full h-full flex items-center justify-center overflow-hidden">
                                    <img src="${previewUrl}" alt="명함 이미지 미리보기" class="w-full h-full object-contain rounded-lg">
                                    <div class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                                        <div class="bg-white/90 px-3 py-2 rounded-lg shadow-lg">
                                            <p class="text-xs text-gray-700 font-medium">압축 완료 (${compressionRatio}% 감소) - 업로드 중...</p>
                                        </div>
                </div>
            </div>
        `;

                            // Supabase Storage에 업로드
                            const session = await window.authSession.getSession();
                            if (!session?.user?.id) {
                                throw new Error('세션이 없습니다');
                            }

                            // 사용자 정보 가져오기 (파일명 생성용)
                            const userInfo = await window.authService?.getUserInfo();
                            const userId = session.user.id;
                            const fileExt = file.name.split('.').pop() || 'jpg';
                            
                            // 파일명 생성: 계정명.확장자 (영문/숫자/하이픈만 사용)
                            // Supabase Storage는 파일 경로에 특수문자나 인코딩된 문자를 제한하므로 영문만 사용
                            let fileName = 'business-card.' + fileExt;
                            
                            // 계정명 가져오기 (이메일 또는 사용자 ID)
                            const accountName = session?.user?.email?.split('@')[0] || 
                                                 session?.user?.id?.substring(0, 8) || 
                                                 userId.substring(0, 8);
                            
                            // 계정명을 영문/숫자/하이픈만 사용하도록 정리
                            const sanitizedAccountName = accountName
                                .replace(/[^a-zA-Z0-9\-_]/g, '') // 특수문자 제거
                                .toLowerCase(); // 소문자로 변환
                            
                            if (sanitizedAccountName) {
                                fileName = `${sanitizedAccountName}.${fileExt}`;
                            }
                            
                            // 파일 경로 생성 (인코딩 불필요 - 이미 영문/숫자/하이픈만 사용)
                            const filePath = userId + '/' + fileName;
                            
                            console.log('파일명 생성:', { fileName, filePath, userInfo: { affiliation: userInfo?.affiliation, name: userInfo?.name } });

                            console.log('Storage 업로드 시작:', { 
                                filePath, 
                                userId, 
                                fileSize: compressedBlob.size,
                                bucket: 'business_cards',
                                supabaseClient: !!window.supabaseClient
                            });

                            // Storage 버킷 존재 확인
                            try {
                                const { data: buckets, error: bucketError } = await window.supabaseClient
                                    .storage
                                    .listBuckets();
                                
                                console.log('사용 가능한 버킷 목록:', buckets);
                                
                                const businessCardsBucket = buckets?.find(b => 
                                    b.name === 'business_cards' || 
                                    b.name === 'BUSINESS_CARDS' ||
                                    b.name.toLowerCase() === 'business_cards'
                                );
                                
                                if (!businessCardsBucket) {
                                    console.error('business_cards 버킷을 찾을 수 없습니다. 사용 가능한 버킷:', buckets?.map(b => b.name));
                                    throw new Error('business_cards 버킷을 찾을 수 없습니다');
                                }
                                
                                console.log('버킷 확인 완료:', businessCardsBucket);
                            } catch (bucketCheckError) {
                                console.warn('버킷 확인 중 오류 (계속 진행):', bucketCheckError);
                            }

                            // 버킷 이름 확인 및 시도 (대소문자 문제 대응)
                            let uploadResult = null;
                            const bucketNames = ['business_cards', 'BUSINESS_CARDS', 'Business_Cards'];
                            
                            for (const bucketName of bucketNames) {
                                try {
                                    console.log(`버킷 '${bucketName}'로 업로드 시도...`);
                                    uploadResult = await window.supabaseClient
                                        .storage
                                        .from(bucketName)
                                        .upload(filePath, compressedBlob, {
                                            cacheControl: '3600',
                                            upsert: true
                                        });
                                    
                                    if (!uploadResult.error) {
                                        console.log(`업로드 성공 (버킷: ${bucketName}):`, uploadResult.data);
                                        break;
                                    } else {
                                        console.warn(`버킷 '${bucketName}' 업로드 실패:`, uploadResult.error);
                                    }
                                } catch (bucketError) {
                                    console.warn(`버킷 '${bucketName}' 시도 중 오류:`, bucketError);
                                }
                            }
                            
                            const { data: uploadData, error: uploadError } = uploadResult || { data: null, error: new Error('모든 버킷 이름 시도 실패') };

                            if (uploadError) {
                                console.error('업로드 오류 상세:', {
                                    error: uploadError,
                                    message: uploadError.message,
                                    statusCode: uploadError.statusCode,
                                    errorCode: uploadError.errorCode,
                                    filePath,
                                    userId,
                                    bucket: 'business_cards'
                                });
                                
                                // 더 자세한 에러 메시지 제공
                                let errorMessage = '업로드 실패: ';
                                if (uploadError.message) {
                                    errorMessage += uploadError.message;
                                } else if (uploadError.statusCode === 403) {
                                    errorMessage += '권한이 없습니다. Storage 버킷 권한을 확인해주세요.';
                                } else if (uploadError.statusCode === 404) {
                                    errorMessage += '버킷을 찾을 수 없습니다.';
                                } else {
                                    errorMessage += '알 수 없는 오류가 발생했습니다.';
                                }
                                
                                throw new Error(errorMessage);
                            }

                            console.log('업로드 성공:', uploadData);

                            // 업로드 후 잠시 대기 (Storage 반영 시간)
                            await new Promise(resolve => setTimeout(resolve, 1000));

                            // 이미지 URL 생성 (여러 방법 시도)
                            let finalImageUrl = null;
                            
                            // 업로드 성공한 버킷 이름 사용 (또는 기본값)
                            const successfulBucket = uploadData?.path ? 'business_cards' : 'business_cards';
                            
                            // 방법 1: Public URL 시도
                            try {
                                const { data: { publicUrl } } = window.supabaseClient
                                    .storage
                                    .from(successfulBucket)
                                    .getPublicUrl(filePath);
                                finalImageUrl = publicUrl;
                                console.log('Public URL 생성 성공:', finalImageUrl);
                            } catch (urlError) {
                                console.warn('Public URL 생성 실패, Signed URL 시도:', urlError);
                            }
                            
                            // 방법 2: Public URL이 없으면 Signed URL 시도
                            if (!finalImageUrl) {
                                try {
                                    const { data: { signedUrl }, error: signedError } = await window.supabaseClient
                                        .storage
                                        .from(successfulBucket)
                                        .createSignedUrl(filePath, 3600);
                                    
                                    if (!signedError && signedUrl) {
                                        finalImageUrl = signedUrl;
                                        console.log('Signed URL 생성 성공:', finalImageUrl);
                                    } else {
                                        console.error('Signed URL 생성 실패:', signedError);
                                    }
                                } catch (signedUrlError) {
                                    console.error('Signed URL 생성 예외:', signedUrlError);
                                }
                            }

                            // 방법 3: 파일 목록에서 다시 조회하여 URL 생성
                            if (!finalImageUrl) {
                                console.log('파일 목록에서 다시 조회 시도...');
                                const bucketNamesToTry = [successfulBucket, 'business_cards', 'BUSINESS_CARDS'];
                                
                                for (const bucketName of bucketNamesToTry) {
                                    try {
                                        const { data: files, error: listError } = await window.supabaseClient
                                            .storage
                                            .from(bucketName)
                                            .list(userId, {
                                                limit: 1,
                                                sortBy: { column: 'created_at', order: 'desc' }
                                            });
                                        
                                        if (!listError && files && files.length > 0) {
                                            const latestFilePath = userId + '/' + files[0].name;
                                            try {
                                                const { data: { publicUrl } } = window.supabaseClient
                                                    .storage
                                                    .from(bucketName)
                                                    .getPublicUrl(latestFilePath);
                                                finalImageUrl = publicUrl;
                                                console.log(`재조회 Public URL (버킷: ${bucketName}):`, finalImageUrl);
                                                break;
                                            } catch (retryError) {
                                                console.error(`재조회 URL 생성 실패 (버킷: ${bucketName}):`, retryError);
                                            }
                                        }
                                    } catch (bucketListError) {
                                        console.warn(`버킷 '${bucketName}' 목록 조회 실패:`, bucketListError);
                                    }
                                }
                            }

                            // URL 정리
                            URL.revokeObjectURL(previewUrl);

                            // 최종 미리보기 업데이트
                            if (finalImageUrl) {
                                previewDiv.innerHTML = `
                                    <div class="relative w-full h-full flex items-center justify-center overflow-hidden">
                                        <img src="${finalImageUrl}" alt="명함 이미지" class="w-full h-full object-contain rounded-lg" id="business-card-final-image">
                                        <div class="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1 z-10 shadow-md">
                                            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                                            </svg>
                                            저장됨
                                        </div>
                                    </div>
                                `;
                                
                                // 이미지 로드 이벤트 핸들러 추가
                                const finalImg = previewDiv.querySelector('#business-card-final-image');
                                if (finalImg) {
                                    finalImg.onerror = function() {
                                        this.style.display = 'none';
                                        const placeholder = this.parentElement.querySelector('.image-placeholder') || document.createElement('div');
                                        placeholder.className = 'image-placeholder text-center text-gray-400';
                                        placeholder.innerHTML = '<svg class="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg><p class="text-sm">명함 이미지</p>';
                                        if (!this.parentElement.querySelector('.image-placeholder')) {
                                            this.parentElement.appendChild(placeholder);
                                        }
                                    };
                                    finalImg.onload = function() {
                                        console.log('이미지 로드 성공:', this.src);
                                        const placeholder = this.parentElement.querySelector('.image-placeholder');
                                        if (placeholder) placeholder.remove();
                                    };
                                }
                            } else {
                                console.error('모든 URL 생성 방법 실패');
                                previewDiv.innerHTML = `
                                    <div class="text-center text-red-500">
                                        <p class="text-sm">이미지 URL 생성 실패</p>
                                        <p class="text-xs mt-1">업로드는 완료되었지만 표시할 수 없습니다.</p>
                                    </div>
                                `;
                            }

                            // 업로드 성공한 버킷 이름 찾기
                            const uploadBucket = uploadData?.path ? 'business_cards' : 'business_cards';
                            
                            // 기존 파일 삭제 (같은 사용자의 다른 명함 이미지)
                            try {
                                const bucketNamesToTry = [uploadBucket, 'business_cards', 'BUSINESS_CARDS'];
                                let oldFiles = null;
                                let deleteBucket = null;
                                
                                for (const bucketName of bucketNamesToTry) {
                                    try {
                                        const { data } = await window.supabaseClient
                                            .storage
                                            .from(bucketName)
                                            .list(userId);
                                        
                                        if (data) {
                                            oldFiles = data;
                                            deleteBucket = bucketName;
                                            break;
                                        }
                                    } catch (listError) {
                                        console.warn(`버킷 '${bucketName}' 목록 조회 실패:`, listError);
                                    }
                                }
                                
                                if (oldFiles && oldFiles.length > 1 && deleteBucket) {
                                    const filesToDelete = oldFiles
                                        .filter(f => f.name !== fileName)
                                        .map(f => userId + '/' + f.name);
                                    
                                    if (filesToDelete.length > 0) {
                                        await window.supabaseClient
                                            .storage
                                            .from(deleteBucket)
                                            .remove(filesToDelete);
                                        console.log(`기존 파일 삭제 완료 (버킷: ${deleteBucket}):`, filesToDelete);
                                    }
                                }
                            } catch (deleteError) {
                                console.warn('기존 파일 삭제 중 오류 (무시):', deleteError);
                            }

                            // 업로드 성공 후 이미지 다시 로드하여 확실히 반영
                            await new Promise(resolve => setTimeout(resolve, 500));
                            await loadExistingCard();

                            showToast('명함 이미지가 업로드되었습니다.', 'success');
                        } catch (error) {
                            console.error('명함 이미지 업로드 오류:', error);
                            console.error('에러 스택:', error.stack);
                            
                            // 에러 타입별 상세 메시지
                            let errorMessage = '알 수 없는 오류가 발생했습니다.';
                            let errorDetails = '';
                            
                            if (error.message) {
                                if (error.message.includes('413') || error.message.includes('too large')) {
                                    errorMessage = '파일 크기가 너무 큽니다.';
                                    errorDetails = '파일 크기는 1MB 이하여야 합니다. 이미지를 압축하거나 다른 이미지를 사용해주세요.';
                                } else if (error.message.includes('415') || error.message.includes('type')) {
                                    errorMessage = '지원하지 않는 파일 형식입니다.';
                                    errorDetails = 'JPEG, PNG, WebP 형식만 지원됩니다.';
                                } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
                                    errorMessage = '인증 오류가 발생했습니다.';
                                    errorDetails = '로그인 세션이 만료되었을 수 있습니다. 페이지를 새로고침해주세요.';
                                } else if (error.message.includes('network') || error.message.includes('fetch')) {
                                    errorMessage = '네트워크 오류가 발생했습니다.';
                                    errorDetails = '인터넷 연결을 확인하고 다시 시도해주세요.';
                                } else {
                                    errorMessage = error.message;
                                    errorDetails = '콘솔에서 자세한 오류를 확인하세요.';
                                }
                            }
                            
                            // 재시도 함수
                            const retryFunction = async () => {
                                const file = uploadInput.files?.[0];
                                if (file) {
                                    await handleFileUpload(file);
                                } else {
                                    showToast('파일을 다시 선택해주세요.', 'error');
                                }
                            };
                            
                            showToast(
                                '업로드 실패: ' + errorMessage,
                                'error',
                                6000,
                                {
                                    retryCallback: retryFunction,
                                    details: errorDetails
                                }
                            );
                            
                            // 에러 상세 정보를 미리보기 영역에 표시
                            previewDiv.innerHTML = `
                                <div class="text-center text-red-500 p-4">
                                    <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <p class="text-sm font-medium">업로드 실패</p>
                                    <p class="text-xs mt-1">${errorMessage}</p>
                                    ${errorDetails ? `<p class="text-xs mt-2 text-gray-400">${errorDetails}</p>` : ''}
                                    <button 
                                        onclick="document.getElementById('business-card-upload').click()"
                                        class="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                                        다시 시도
                                    </button>
                                </div>
                            `;
                            
                            // 기존 이미지 다시 로드 시도
                            try {
                                await loadExistingCard();
                            } catch (loadError) {
                                console.error('기존 이미지 로드 실패:', loadError);
                            }
                        }
    }

    // 파일 선택 시 처리
    uploadInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        await handleFileUpload(file);
        uploadInput.value = '';
    });

    // 드래그 앤 드롭 이벤트 처리
    let dragCounter = 0;
    
    // 드래그 오버 시 스타일 변경
    ['dragenter', 'dragover'].forEach(eventName => {
        previewDiv.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dragCounter++;
            previewDiv.classList.add('border-purple-500', 'bg-purple-100');
            previewDiv.classList.remove('border-gray-300', 'bg-gray-50');
        });
    });
    
    // 드래그 리브 시 스타일 복원
    ['dragleave', 'drop'].forEach(eventName => {
        previewDiv.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dragCounter--;
            if (dragCounter === 0) {
                previewDiv.classList.remove('border-purple-500', 'bg-purple-100');
                previewDiv.classList.add('border-gray-300', 'bg-gray-50');
            }
        });
    });
    
    // 드롭 시 파일 처리
    previewDiv.addEventListener('drop', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter = 0;
        previewDiv.classList.remove('border-purple-500', 'bg-purple-100');
        previewDiv.classList.add('border-gray-300', 'bg-gray-50');
        
        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
            await handleFileUpload(files[0]);
        }
    });
    
    // 클릭 시 파일 선택 다이얼로그 열기
    previewDiv.addEventListener('click', (e) => {
        // 이미지가 있으면 클릭 무시
        if (previewDiv.querySelector('img')) {
            return;
        }
        uploadInput.click();
    });
}

        // ---- 7. 라우터 ----

        const routes = {
            '/home': renderHomePage,
            '/shop': () => renderDocPage('정비지침서'),
            '/etm': () => renderDocPage('전장회로도'),
            '/dtc': () => renderDocPage('DTC 매뉴얼'),
            '/wiring': () => renderDocPage('와이어링 커넥터'),
            '/tsb': () => renderDocPage('TSB'),
            '/notices': (param) => param ? renderNoticeDetailPage(param) : renderNoticesListPage(),
            '/community': (param) => param ? renderCommunityDetailPage(param) : renderCommunityListPage(),
            '/account': renderAccountPage,
            '/admin': renderAdminDashboardPage
        };

        /**
         * grade 기반 접근 권한 확인
         * @param {string} path - 접근하려는 경로
         * @returns {Object} { allowed: boolean, requiredGrade: string, userGrade: string }
         */
        async function checkDocumentAccess(path) {
            const userInfo = await window.authService?.getUserInfo();
            if (!userInfo) {
                return { allowed: false, requiredGrade: null, userGrade: null, reason: 'no_user_info' };
            }

            const userGrade = userInfo.grade?.toLowerCase() || null;
            
            // 문서별 필요한 최소 grade
            const documentGradeMap = {
                '/shop': 'blue',      // 정비지침서: blue 이상
                '/etm': 'silver',     // 전장회로도: silver 이상
                '/dtc': 'black',      // DTC 매뉴얼: black 이상
                '/wiring': 'silver',  // 와이어링 커넥터: silver 이상 (전장회로도와 동일)
                '/tsb': 'blue'        // TSB: blue 이상 (정비지침서와 동일)
            };

            const requiredGrade = documentGradeMap[path];
            if (!requiredGrade) {
                return { allowed: true, requiredGrade: null, userGrade, reason: 'no_restriction' };
            }

            // grade 우선순위: blue < silver < black
            const gradeLevels = {
                'blue': 1,
                'silver': 2,
                'black': 3
            };

            const userLevel = userGrade ? (gradeLevels[userGrade] || 0) : 0;
            const requiredLevel = gradeLevels[requiredGrade] || 0;

            const allowed = userLevel >= requiredLevel;

            return {
                allowed,
                requiredGrade,
                userGrade,
                reason: allowed ? 'granted' : 'insufficient_grade'
            };
        }

        /**
         * 접근 제한 팝업 표시
         * @param {string} contentType - 콘텐츠 타입 (게시판, 기술문서 등)
         * @param {string} requiredGrade - 필요한 grade
         * @param {string} userGrade - 사용자 grade
         */
        function showGradeRestrictedPopup(contentType, requiredGrade, userGrade) {
            const gradeLabels = {
                'blue': '블루 라벨',
                'silver': '실버 라벨',
                'black': '블랙 라벨'
            };

            const requiredLabel = gradeLabels[requiredGrade] || requiredGrade;
            const userLabel = userGrade ? (gradeLabels[userGrade] || userGrade) : '없음';

            const warningModal = document.createElement('div');
            warningModal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
            warningModal.innerHTML = `
                <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
                    <div class="text-center mb-4">
                        <div class="text-5xl mb-4">🚫</div>
                        <h2 class="text-xl font-bold mb-2 text-red-600">접근 제한</h2>
                    </div>
                    <div class="space-y-4">
                        <p class="text-sm text-gray-700">
                            ${contentType} 열람은 <strong>${requiredLabel}</strong> 이상의 권한이 필요합니다.
                        </p>
                        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p class="text-xs text-yellow-800 font-medium mb-1">⚠️ 접근 불가</p>
                            <p class="text-xs text-yellow-700">
                                • 현재 등급: <strong>${userLabel}</strong><br>
                                • 필요 등급: <strong>${requiredLabel}</strong><br>
                                • 관리자에게 등급 업그레이드를 요청하세요
                            </p>
                        </div>
                        <button 
                            id="grade-restricted-modal-ok"
                            class="w-full py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
                        >
                            확인
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(warningModal);
            
            // 확인 버튼 클릭 시 홈으로 리다이렉트
            warningModal.querySelector('#grade-restricted-modal-ok').addEventListener('click', () => {
                warningModal.remove();
                window.location.hash = '#/home';
            });
            
            // 모달 외부 클릭 시에도 홈으로 리다이렉트
            warningModal.addEventListener('click', (e) => {
                if (e.target === warningModal) {
                    warningModal.remove();
                    window.location.hash = '#/home';
                }
            });
        }

        async function router(path, param = null) {
            try {
                // 게시판 접근 시 사용자 정보 확인
                const boardPaths = ['/notices', '/community'];
                if (boardPaths.includes(path)) {
                    const userInfo = await window.authService?.getUserInfo();
                    if (!userInfo) {
                        const contentType = '게시판';
                        console.warn(`⚠️ ${contentType} 접근 차단: 사용자 정보 없음`);
                        
                        // 경고 팝업 표시
                        const warningModal = document.createElement('div');
                        warningModal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
                        warningModal.innerHTML = `
                            <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
                                <div class="text-center mb-4">
                                    <div class="text-5xl mb-4">🚫</div>
                                    <h2 class="text-xl font-bold mb-2 text-red-600">접근 제한</h2>
                                </div>
                                <div class="space-y-4">
                                    <p class="text-sm text-gray-700">
                                        ${contentType} 열람은 등록된 사용자만 가능합니다.
                                    </p>
                                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                        <p class="text-xs text-yellow-800 font-medium mb-1">⚠️ 접근 불가</p>
                                        <p class="text-xs text-yellow-700">
                                            • 현재 계정은 시스템에 등록되지 않았습니다<br>
                                            • ${contentType} 열람이 제한됩니다<br>
                                            • 관리자에게 계정 등록을 요청하세요
                                        </p>
                                    </div>
                                    <button 
                                        id="restricted-warning-modal-ok"
                                        class="w-full py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
                                    >
                                        확인
                                    </button>
                                </div>
                            </div>
                        `;
                        document.body.appendChild(warningModal);
                        
                        // 확인 버튼 클릭 시 홈으로 리다이렉트
                        warningModal.querySelector('#restricted-warning-modal-ok').addEventListener('click', () => {
                            warningModal.remove();
                            window.location.hash = '#/home';
                        });
                        
                        // 모달 외부 클릭 시에도 홈으로 리다이렉트
                        warningModal.addEventListener('click', (e) => {
                            if (e.target === warningModal) {
                                warningModal.remove();
                                window.location.hash = '#/home';
                            }
                        });
                        
                        // 홈 페이지 렌더링
                        mainContent.innerHTML = await renderHomePage();
                        // 홈 페이지 렌더링 후 공지사항 로드
                        setTimeout(() => {
                            renderRecentNotices();
                        }, 100);
                        return;
                    }
                }

                // 기술문서 접근 시 grade 확인
                const documentPaths = ['/shop', '/etm', '/dtc', '/wiring', '/tsb'];
                if (documentPaths.includes(path)) {
                    const accessCheck = await checkDocumentAccess(path);
                    
                    if (!accessCheck.allowed) {
                        if (accessCheck.reason === 'no_user_info') {
                            // 사용자 정보가 없는 경우 (기존 로직)
                            const contentType = '기술문서';
                            console.warn(`⚠️ ${contentType} 접근 차단: 사용자 정보 없음`);
                            
                            const warningModal = document.createElement('div');
                            warningModal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
                            warningModal.innerHTML = `
                                <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
                                    <div class="text-center mb-4">
                                        <div class="text-5xl mb-4">🚫</div>
                                        <h2 class="text-xl font-bold mb-2 text-red-600">접근 제한</h2>
                                    </div>
                                    <div class="space-y-4">
                                        <p class="text-sm text-gray-700">
                                            기술문서 열람은 등록된 사용자만 가능합니다.
                                        </p>
                                        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                            <p class="text-xs text-yellow-800 font-medium mb-1">⚠️ 접근 불가</p>
                                            <p class="text-xs text-yellow-700">
                                                • 현재 계정은 시스템에 등록되지 않았습니다<br>
                                                • 기술문서 열람이 제한됩니다<br>
                                                • 관리자에게 계정 등록을 요청하세요
                                            </p>
                                        </div>
                                        <button 
                                            id="restricted-warning-modal-ok"
                                            class="w-full py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
                                        >
                                            확인
                                        </button>
                                    </div>
                                </div>
                            `;
                            document.body.appendChild(warningModal);
                            
                            warningModal.querySelector('#restricted-warning-modal-ok').addEventListener('click', () => {
                                warningModal.remove();
                                window.location.hash = '#/home';
                            });
                            
                            warningModal.addEventListener('click', (e) => {
                                if (e.target === warningModal) {
                                    warningModal.remove();
                                    window.location.hash = '#/home';
                                }
                            });
                            
                            mainContent.innerHTML = await renderHomePage();
                            return;
                        } else if (accessCheck.reason === 'insufficient_grade') {
                            // grade가 부족한 경우
                            const documentNames = {
                                '/shop': '정비지침서',
                                '/etm': '전장회로도',
                                '/dtc': 'DTC 매뉴얼',
                                '/wiring': '와이어링 커넥터',
                                '/tsb': 'TSB'
                            };
                            
                            const documentName = documentNames[path] || '기술문서';
                            console.warn(`⚠️ ${documentName} 접근 차단: grade 부족 (필요: ${accessCheck.requiredGrade}, 현재: ${accessCheck.userGrade})`);
                            
                            showGradeRestrictedPopup(documentName, accessCheck.requiredGrade, accessCheck.userGrade);
                            
                            // 홈 페이지 렌더링
                            mainContent.innerHTML = await renderHomePage();
                            // 홈 페이지 렌더링 후 공지사항 로드
                            setTimeout(() => {
                                renderRecentNotices();
                            }, 100);
                            return;
                        }
                    }
                }
                const route = routes[path];
                if (route) {
                    if (mainContent) {
                        mainContent.innerHTML = skeletonLoadingHTML();
                        setTimeout(async () => {
                            try {
                                const result = await route(param);
                                mainContent.innerHTML = result;
                                mainContent.classList.add('page-transition');
                                
                                // 홈 페이지인 경우 공지사항 로드
                                if (path === '/home' || path === '') {
                                    setTimeout(() => {
                                        renderRecentNotices();
                                    }, 100);
                                }
                                
                                // 계정 페이지인 경우 초기화 함수들 호출
                                if (path === '/account') {
                                    await initBusinessCardUpload();
                                    initSessionCountdown();
                                }
                            } catch (error) {
                                console.error('라우트 핸들러 오류:', error);
                                mainContent.innerHTML = '<p class="text-red-500">페이지 로드 중 오류가 발생했습니다.</p>';
                            }
                        }, 200);
                    }
                } else {
                    console.error('라우트를 찾을 수 없음:', path);
                    if (mainContent) {
                        mainContent.innerHTML = '<p class="text-red-500">페이지를 찾을 수 없습니다.</p>';
                    }
                }
            } catch (error) {
                console.error('라우터 오류:', error);
            }
        }

        function highlightNav(hash) {
            const normalizedHash = hash.replace('#', '');
            
            // 데스크톱 네비게이션 하이라이트
            document.querySelectorAll('.nav-link').forEach(link => {
                const href = link.getAttribute('href');
                link.classList.remove('nav-active');
                if (href && href.replace('#', '') === normalizedHash) {
                    link.classList.add('nav-active');
                }
            });
            
            // 모바일 네비게이션 하이라이트
            document.querySelectorAll('.mobile-nav-item').forEach(item => {
                const href = item.getAttribute('href');
                item.classList.remove('active');
                if (href && href.replace('#', '') === normalizedHash) {
                    item.classList.add('active');
                }
            });
            
            // 모바일 드롭다운 아이템 하이라이트
            document.querySelectorAll('.mobile-nav-dropdown-item').forEach(item => {
                const href = item.getAttribute('href');
                item.classList.remove('active');
                if (href && href.replace('#', '') === normalizedHash) {
                    item.classList.add('active');
                }
            });
        }

        async function routerHandler() {
            const isAuthenticated = await window.authSession.isAuthenticated();
            
            if (!isAuthenticated) {
                window.location.href = 'login.html';
                return;
            }

            let hash = window.location.hash.replace('#','') || '/home';
            
            let path = hash;
            let param = null;
            if (hash.includes('/')) {
                const parts = hash.split('/');
                path = `/${parts[1]}`;
                param = parts.slice(2).join('/');
            }
            
            await router(path, param);
            highlightNav(`#${path}`);
        }

        // ---- 8. 최근 공지사항 렌더링 ----

        async function renderRecentNotices() {
            const container = document.getElementById('recent-notices-container');
            if (!container) return;

            // 로딩 표시
            container.innerHTML = skeletonLoadingHTML();

            try {
                // 공지사항 가져오기 (최대 3개)
                const notices = await window.dataService?.getNotices(3) || [];

                // 로딩 완료 후 결과 표시
                if (notices && notices.length > 0) {
                    container.innerHTML = notices.map(notice => `
                        <div class="border-b border-gray-100 pb-3 mb-3 last:border-b-0">
                            <div class="flex items-center justify-between">
                                <span class="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-full">${notice.category || '일반'}</span>
                                <span class="text-xs text-gray-500">${new Date(notice.created_at).toLocaleDateString()}</span>
                            </div>
                            <h3 class="font-medium text-gray-900 mt-1 cursor-pointer hover:text-blue-600" onclick="viewNotice(${notice.id})">${notice.title}</h3>
                        </div>
                    `).join('');
                } else {
                    // 공지사항이 없을 때 로딩 애니메이션 제거하고 메시지 표시
                    container.innerHTML = '<p class="text-gray-500 text-center py-4">등록된 공지사항이 없습니다.</p>';
                }
            } catch (error) {
                console.error('공지사항 로드 오류:', error);
                // 에러 발생 시에도 로딩 애니메이션 제거
                container.innerHTML = '<p class="text-gray-500 text-center py-4">공지사항을 불러올 수 없습니다.</p>';
            }
        }

        function viewNotice(id) {
            window.location.hash = `#/notices/${id}`;
        }

        /**
         * 공지사항 에디터 열기 (작성/수정)
         */
        async function openNoticeEditor(noticeId = null) {
            try {
                // 권한 확인
                const canManage = await window.dataService?.canManageNotices();
                if (!canManage) {
                    showToast('공지사항 작성 권한이 없습니다.', 'error');
                    return;
                }

                let notice = null;
                if (noticeId) {
                    notice = await window.dataService?.getNoticeById(noticeId);
                }

                // 모달 생성
                const modal = document.createElement('div');
                modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
                modal.id = 'notice-editor-modal';
                
                modal.innerHTML = `
                    <div class="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div class="p-6 border-b">
                            <h2 class="text-2xl font-bold text-gray-900">${noticeId ? '공지사항 수정' : '공지사항 작성'}</h2>
                        </div>
                        <form id="notice-editor-form" class="p-6">
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">제목 *</label>
                                <input type="text" id="notice-title" required 
                                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                       value="${notice?.title || ''}" 
                                       placeholder="공지사항 제목을 입력하세요">
                            </div>
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">카테고리 *</label>
                                <select id="notice-category" required 
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="일반" ${notice?.category === '일반' ? 'selected' : ''}>일반</option>
                                    <option value="중요" ${notice?.category === '중요' ? 'selected' : ''}>중요</option>
                                    <option value="업데이트" ${notice?.category === '업데이트' ? 'selected' : ''}>업데이트</option>
                                    <option value="공지" ${notice?.category === '공지' ? 'selected' : ''}>공지</option>
                                </select>
                            </div>
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">내용 *</label>
                                <textarea id="notice-content" required rows="10" 
                                          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                          placeholder="공지사항 내용을 입력하세요">${notice?.content || ''}</textarea>
                            </div>
                            <div class="flex gap-2 justify-end">
                                <button type="button" onclick="closeNoticeEditor()" 
                                        class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                                    취소
                                </button>
                                <button type="submit" 
                                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                    ${noticeId ? '수정' : '작성'}
                                </button>
                            </div>
                        </form>
                    </div>
                `;

                document.body.appendChild(modal);

                // 폼 제출 처리
                const form = document.getElementById('notice-editor-form');
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    await saveNotice(noticeId);
                });

            } catch (error) {
                console.error('공지사항 에디터 열기 오류:', error);
                showToast('공지사항 에디터를 열 수 없습니다.', 'error');
            }
        }

        /**
         * 공지사항 저장 (작성/수정)
         */
        async function saveNotice(noticeId = null) {
            try {
                const title = document.getElementById('notice-title').value.trim();
                const content = document.getElementById('notice-content').value.trim();
                const category = document.getElementById('notice-category').value;

                if (!title || !content || !category) {
                    showToast('모든 필드를 입력해주세요.', 'error');
                    return;
                }

                showToast('저장 중...', 'info');

                let result;
                if (noticeId) {
                    // 수정
                    result = await window.dataService?.updateNotice(noticeId, {
                        title,
                        content,
                        category
                    });
                    showToast('공지사항이 수정되었습니다.', 'success');
                } else {
                    // 작성
                    result = await window.dataService?.createNotice({
                        title,
                        content,
                        category
                    });
                    showToast('공지사항이 작성되었습니다.', 'success');
                }

                // 모달 닫기
                closeNoticeEditor();

                // 페이지 새로고침
                if (noticeId) {
                    window.location.hash = `#/notices/${noticeId}`;
                    setTimeout(() => location.reload(), 500);
                } else {
                    window.location.hash = '#/notices';
                    setTimeout(() => location.reload(), 500);
                }

            } catch (error) {
                console.error('공지사항 저장 오류:', error);
                showToast(error.message || '공지사항 저장에 실패했습니다.', 'error');
            }
        }

        /**
         * 공지사항 에디터 닫기
         */
        function closeNoticeEditor() {
            const modal = document.getElementById('notice-editor-modal');
            if (modal) {
                modal.remove();
            }
        }

        /**
         * 공지사항 삭제
         */
        async function deleteNotice(noticeId) {
            try {
                if (!confirm('정말 이 공지사항을 삭제하시겠습니까?')) {
                    return;
                }

                showToast('삭제 중...', 'info');

                await window.dataService?.deleteNotice(noticeId);

                showToast('공지사항이 삭제되었습니다.', 'success');

                // 목록으로 이동
                window.location.hash = '#/notices';
                setTimeout(() => location.reload(), 500);

            } catch (error) {
                console.error('공지사항 삭제 오류:', error);
                showToast(error.message || '공지사항 삭제에 실패했습니다.', 'error');
            }
        }

        // 전역 함수로 등록
        window.openNoticeEditor = openNoticeEditor;
        window.closeNoticeEditor = closeNoticeEditor;
        window.saveNotice = saveNotice;
        window.deleteNotice = deleteNotice;

        // ---- 9. 이벤트 리스너 ----

        function setupEventListeners() {
            // 키보드 접근성 초기화
            setupKeyboardAccessibility();
            
            // 링크 클릭
            document.addEventListener('click', (e) => {
                const link = e.target.closest('a[href^="#"]');
                if (link) {
                    e.preventDefault();
                    const href = link.getAttribute('href');
                    window.location.hash = href.replace('#', '');
                }
            });

            // 해시 변경
            window.addEventListener('hashchange', () => {
                routerHandler();
            });

            // 트리 아이템 클릭
            document.addEventListener('click', (e) => {
                if (e.target.closest('.tree-item')) {
                    const treeItem = e.target.closest('.tree-item');
                    const id = treeItem.getAttribute('data-id');
                    const isFolder = treeItem.querySelector('.tree-toggle');
                    
                    if (isFolder) {
                        const children = treeItem.querySelector('.tree-children');
                        const toggle = treeItem.querySelector('.tree-toggle');
                        
                        if (children.classList.contains('collapsed')) {
                            children.classList.remove('collapsed');
                            children.classList.add('expanded');
                            toggle.classList.add('expanded');
                        } else {
                            children.classList.remove('expanded');
                            children.classList.add('collapsed');
                            toggle.classList.remove('expanded');
                        }
                    } else {
                        handleDocumentSelection(treeItem, id);
                    }
                }
            });

            // 검색 (검색 히스토리 포함)
            document.addEventListener('input', (e) => {
                if (e.target.matches('.tree-search input')) {
                    const query = e.target.value.toLowerCase();
                    saveSearchHistory(query);
                    showSearchHistory(e.target);
                    
                    const treeItems = document.querySelectorAll('.tree-item');
                    
                    treeItems.forEach(item => {
                        const label = item.querySelector('.tree-label').textContent.toLowerCase();
                        if (label.includes(query)) {
                            item.style.display = '';
                        } else {
                            item.style.display = 'none';
                        }
                    });
                }
            });

            // 모델 선택 변경
            document.addEventListener('change', (e) => {
                if (e.target.matches('#model-select')) {
                    showToast(`모델이 ${e.target.value}로 변경되었습니다.`, 'info');
                }
            });
        }

        // ---- 10. 앱 초기화 ----

        async function initApp() {
            try {
                console.log('🚀 앱 초기화 시작...');

                // 인증 체크 타임아웃 설정 (5초)
                const authCheckTimeout = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('인증 체크 타임아웃')), 5000);
                });

                let isAuthenticated = false;
                try {
                    isAuthenticated = await Promise.race([
                        window.authSession.isAuthenticated(),
                        authCheckTimeout
                    ]);
                } catch (error) {
                    console.error('❌ 인증 체크 오류:', error);
                    // 타임아웃이나 오류 발생 시 스플래시 숨기고 로그인 페이지로 이동
                    hideSplashScreen();
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 500);
                    return;
                }
                
                if (!isAuthenticated) {
                    console.log('❌ 인증되지 않음 - 로그인 페이지로 이동');
                    hideSplashScreen();
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 500);
                    return;
                }

                console.log('✅ 인증됨');

                // 관리자 여부 확인하여 네비게이션 필터링
                const currentUserInfo = await window.authService?.getUserInfo();
                const isAdmin = currentUserInfo?.role === 'admin';
                const visibleNavLinks = NAV_LINKS.filter(link => !link.adminOnly || isAdmin);

                if (desktopNav) {
                    desktopNav.innerHTML = visibleNavLinks.map(link => {
                        if (link.type === 'dropdown') {
                            const dropdownId = `nav-dropdown-${link.label.replace(/\s+/g, '-').toLowerCase()}`;
                            return `
                                <div class="relative nav-dropdown-container">
                                    <button 
                                        id="${dropdownId}-btn"
                                        class="nav-link text-slate-600 hover:text-slate-900 flex items-center gap-2 cursor-pointer"
                                        onclick="toggleNavDropdown('${dropdownId}')"
                                        tabindex="0"
                                        aria-expanded="false"
                                        aria-haspopup="true"
                                        aria-label="${link.label} 메뉴">
                                        <svg class="w-4 h-4 nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            ${link.icon}
                                        </svg>
                                        ${link.label}
                                        <svg class="w-3 h-3 nav-dropdown-arrow transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </button>
                                    <div 
                                        id="${dropdownId}"
                                        class="nav-dropdown-menu hidden absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[160px] z-50"
                                        role="menu">
                                        ${link.items.map(item => `
                                            <a 
                                                href="${item.href}" 
                                                class="nav-dropdown-item block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 transition-colors"
                                                role="menuitem"
                                                tabindex="0"
                                                aria-label="${item.label}">
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    ${item.icon}
                                                </svg>
                                                ${item.label}
                                            </a>
                                        `).join('')}
                                    </div>
                                </div>
                            `;
                        } else {
                            return `
                                <a 
                                    href="${link.href}" 
                                    class="nav-link text-slate-600 hover:text-slate-900 flex items-center gap-2"
                                    tabindex="0"
                                    aria-label="${link.label}">
                                    <svg class="w-4 h-4 nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        ${link.icon}
                                    </svg>
                                    ${link.label}
                                </a>
                            `;
                        }
                    }).join('');
                }

                // 모바일 네비게이션 렌더링
                const mobileNav = document.getElementById('mobile-nav');
                const mobileNavContent = mobileNav?.querySelector('div');
                if (mobileNav && mobileNavContent) {
                    mobileNavContent.innerHTML = visibleNavLinks.map(link => {
                        if (link.type === 'dropdown') {
                            const mobileDropdownId = `mobile-dropdown-${link.label.replace(/\s+/g, '-').toLowerCase()}`;
                            return `
                                <div>
                                    <button 
                                        class="mobile-nav-item w-full text-left justify-between"
                                        onclick="toggleMobileNavDropdown('${mobileDropdownId}')"
                                        tabindex="0"
                                        aria-expanded="false"
                                        aria-controls="${mobileDropdownId}"
                                        aria-label="${link.label} 메뉴">
                                        <div class="flex items-center gap-3">
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                ${link.icon}
                                            </svg>
                                            <span>${link.label}</span>
                                        </div>
                                        <svg class="w-4 h-4 mobile-dropdown-arrow transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </button>
                                    <div 
                                        id="${mobileDropdownId}"
                                        class="mobile-nav-dropdown">
                                        ${link.items.map(item => `
                                            <a 
                                                href="${item.href}" 
                                                class="mobile-nav-dropdown-item"
                                                onclick="closeMobileNav()"
                                                tabindex="0"
                                                aria-label="${item.label}">
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    ${item.icon}
                                                </svg>
                                                ${item.label}
                                            </a>
                                        `).join('')}
                                    </div>
                                </div>
                            `;
                        } else {
                            return `
                                <a 
                                    href="${link.href}" 
                                    class="mobile-nav-item"
                                    onclick="closeMobileNav()"
                                    tabindex="0"
                                    aria-label="${link.label}">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        ${link.icon}
                                    </svg>
                                    <span>${link.label}</span>
                                </a>
                            `;
                        }
                    }).join('');
                }

                await updateAuthUI();

                const yearElement = document.getElementById('year');
                if (yearElement) {
                    yearElement.textContent = new Date().getFullYear();
                }

                setupEventListeners();
                await routerHandler();
                
                // 세션 타이머 시작
                startSessionTimer();
                
                setTimeout(renderRecentNotices, 1000);
                await setupWatermark();
                
                // 스플래시 화면 숨기기 (최대 2초 후 또는 모든 준비 완료 시)
                setTimeout(() => {
                    hideSplashScreen();
                    showToast('환영합니다!', 'success');
                    
                    // 보안서약서 확인 및 표시
                    window.securityAgreement?.checkAndShow();
                    
                    // 첫 방문 온보딩 가이드 표시 (보안서약서 동의 후)
                    setTimeout(() => {
                        checkAndShowOnboarding();
                    }, 500);
                }, 1500);
                
                console.log('✅ 앱 초기화 완료');
                
            } catch (error) {
                console.error('❌ 앱 초기화 오류:', error);
                hideSplashScreen();
                // 오류 발생 시에도 로그인 페이지로 이동 시도
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1000);
            }
        }

        // ---- 11. 네비게이션 드롭다운 메뉴 ----
        
        function toggleNavDropdown(dropdownId) {
            const dropdown = document.getElementById(dropdownId);
            const container = dropdown?.closest('.nav-dropdown-container');
            const button = document.getElementById(`${dropdownId}-btn`);
            
            // 모든 드롭다운 닫기
            document.querySelectorAll('.nav-dropdown-menu').forEach(menu => {
                if (menu.id !== dropdownId) {
                    menu.classList.remove('show');
                    menu.classList.add('hidden');
                    menu.closest('.nav-dropdown-container')?.classList.remove('active');
                    const otherButton = document.getElementById(`${menu.id}-btn`);
                    if (otherButton) {
                        otherButton.setAttribute('aria-expanded', 'false');
                    }
                }
            });
            
            // 현재 드롭다운 토글
            if (dropdown && container) {
                const isHidden = dropdown.classList.contains('hidden');
                if (isHidden) {
                    dropdown.classList.remove('hidden');
                    setTimeout(() => dropdown.classList.add('show'), 10);
                    container.classList.add('active');
                    if (button) {
                        button.setAttribute('aria-expanded', 'true');
                    }
                } else {
                    dropdown.classList.remove('show');
                    setTimeout(() => {
                        dropdown.classList.add('hidden');
                        container.classList.remove('active');
                    }, 200);
                    if (button) {
                        button.setAttribute('aria-expanded', 'false');
                    }
                }
            }
        }
        
        // 드롭다운 외부 클릭 시 닫기
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-dropdown-container')) {
                document.querySelectorAll('.nav-dropdown-menu').forEach(menu => {
                    menu.classList.remove('show');
                    setTimeout(() => {
                        menu.classList.add('hidden');
                        menu.closest('.nav-dropdown-container')?.classList.remove('active');
                        const button = document.getElementById(`${menu.id}-btn`);
                        if (button) {
                            button.setAttribute('aria-expanded', 'false');
                        }
                    }, 200);
                });
            }
        });

        // ---- 11-1. 모바일 네비게이션 메뉴 ----
        
        /**
         * 모바일 메뉴 토글
         */
        function toggleMobileNav() {
            const mobileNav = document.getElementById('mobile-nav');
            const menuBtn = document.getElementById('mobile-menu-btn');
            
            if (!mobileNav || !menuBtn) return;
            
            const isOpen = mobileNav.classList.contains('open');
            
            if (isOpen) {
                closeMobileNav();
            } else {
                openMobileNav();
            }
        }
        
        /**
         * 모바일 메뉴 열기
         */
        function openMobileNav() {
            const mobileNav = document.getElementById('mobile-nav');
            const menuBtn = document.getElementById('mobile-menu-btn');
            
            if (!mobileNav || !menuBtn) return;
            
            mobileNav.classList.remove('hidden');
            mobileNav.classList.add('open');
            menuBtn.setAttribute('aria-expanded', 'true');
            menuBtn.setAttribute('aria-label', '메뉴 닫기');
            
            // 햄버거 아이콘을 X 아이콘으로 변경
            const icon = menuBtn.querySelector('svg');
            if (icon) {
                icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>';
            }
        }
        
        /**
         * 모바일 메뉴 닫기
         */
        function closeMobileNav() {
            const mobileNav = document.getElementById('mobile-nav');
            const menuBtn = document.getElementById('mobile-menu-btn');
            
            if (!mobileNav || !menuBtn) return;
            
            mobileNav.classList.remove('open');
            setTimeout(() => {
                mobileNav.classList.add('hidden');
            }, 300);
            
            menuBtn.setAttribute('aria-expanded', 'false');
            menuBtn.setAttribute('aria-label', '메뉴 열기');
            
            // X 아이콘을 햄버거 아이콘으로 변경
            const icon = menuBtn.querySelector('svg');
            if (icon) {
                icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>';
            }
            
            // 모바일 드롭다운도 모두 닫기
            document.querySelectorAll('.mobile-nav-dropdown').forEach(dropdown => {
                dropdown.classList.remove('open');
                const button = dropdown.previousElementSibling;
                if (button && button.tagName === 'BUTTON') {
                    button.setAttribute('aria-expanded', 'false');
                    const arrow = button.querySelector('.mobile-dropdown-arrow');
                    if (arrow) {
                        arrow.style.transform = 'rotate(0deg)';
                    }
                }
            });
        }
        
        /**
         * 모바일 네비게이션 드롭다운 토글
         */
        function toggleMobileNavDropdown(dropdownId) {
            const dropdown = document.getElementById(dropdownId);
            const button = dropdown?.previousElementSibling;
            
            if (!dropdown || !button) return;
            
            const isOpen = dropdown.classList.contains('open');
            
            // 다른 드롭다운 닫기
            document.querySelectorAll('.mobile-nav-dropdown').forEach(d => {
                if (d.id !== dropdownId) {
                    d.classList.remove('open');
                    const otherButton = d.previousElementSibling;
                    if (otherButton && otherButton.tagName === 'BUTTON') {
                        otherButton.setAttribute('aria-expanded', 'false');
                        const arrow = otherButton.querySelector('.mobile-dropdown-arrow');
                        if (arrow) {
                            arrow.style.transform = 'rotate(0deg)';
                        }
                    }
                }
            });
            
            // 현재 드롭다운 토글
            if (isOpen) {
                dropdown.classList.remove('open');
                button.setAttribute('aria-expanded', 'false');
                const arrow = button.querySelector('.mobile-dropdown-arrow');
                if (arrow) {
                    arrow.style.transform = 'rotate(0deg)';
                }
            } else {
                dropdown.classList.add('open');
                button.setAttribute('aria-expanded', 'true');
                const arrow = button.querySelector('.mobile-dropdown-arrow');
                if (arrow) {
                    arrow.style.transform = 'rotate(180deg)';
                }
            }
        }
        
        // 전역 함수로 등록
        window.toggleMobileNav = toggleMobileNav;
        window.closeMobileNav = closeMobileNav;
        window.toggleMobileNavDropdown = toggleMobileNavDropdown;
        
        // 모바일 메뉴 버튼 이벤트 리스너
        document.addEventListener('DOMContentLoaded', () => {
            const menuBtn = document.getElementById('mobile-menu-btn');
            if (menuBtn) {
                menuBtn.addEventListener('click', toggleMobileNav);
                // 키보드 접근성: Enter/Space로 토글
                menuBtn.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleMobileNav();
                    }
                });
            }
            
            // 모바일 메뉴 외부 클릭 시 닫기
            document.addEventListener('click', (e) => {
                const mobileNav = document.getElementById('mobile-nav');
                const menuBtn = document.getElementById('mobile-menu-btn');
                
                if (mobileNav && menuBtn && 
                    !mobileNav.contains(e.target) && 
                    !menuBtn.contains(e.target) &&
                    mobileNav.classList.contains('open')) {
                    closeMobileNav();
                }
            });
        });

        // ---- 11-2. 키보드 접근성 개선 ----
        
        /**
         * 전역 키보드 이벤트 핸들러
         */
        function setupKeyboardAccessibility() {
            // Esc 키로 모달/드롭다운 닫기
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    // 모바일 메뉴 닫기
                    const mobileNav = document.getElementById('mobile-nav');
                    if (mobileNav && mobileNav.classList.contains('open')) {
                        closeMobileNav();
                        e.preventDefault();
                        return;
                    }
                    
                    // 데스크톱 드롭다운 닫기
                    document.querySelectorAll('.nav-dropdown-menu.show').forEach(menu => {
                        menu.classList.remove('show');
                        setTimeout(() => {
                            menu.classList.add('hidden');
                            menu.closest('.nav-dropdown-container')?.classList.remove('active');
                            const button = document.getElementById(`${menu.id}-btn`);
                            if (button) {
                                button.setAttribute('aria-expanded', 'false');
                            }
                        }, 200);
                    });
                    
                    // 모바일 드롭다운 닫기
                    document.querySelectorAll('.mobile-nav-dropdown.open').forEach(dropdown => {
                        dropdown.classList.remove('open');
                        const button = dropdown.previousElementSibling;
                        if (button && button.tagName === 'BUTTON') {
                            button.setAttribute('aria-expanded', 'false');
                            const arrow = button.querySelector('.mobile-dropdown-arrow');
                            if (arrow) {
                                arrow.style.transform = 'rotate(0deg)';
                            }
                        }
                    });
                    
                    // 세션 경고 모달 닫기
                    const sessionWarning = document.getElementById('session-warning-modal');
                    if (sessionWarning) {
                        closeSessionWarning();
                    }
                }
            });
            
            // 모든 버튼에 키보드 이벤트 추가 (Enter/Space)
            document.addEventListener('keydown', (e) => {
                const target = e.target;
                
                // 버튼이 포커스되어 있고 Enter 또는 Space 키를 눌렀을 때
                if ((target.tagName === 'BUTTON' || target.getAttribute('role') === 'button') && 
                    (e.key === 'Enter' || e.key === ' ')) {
                    // 기본 동작이 이미 있는 경우 (onclick 등)는 그대로 두고,
                    // 기본 동작이 없는 경우에만 클릭 이벤트 트리거
                    if (!target.onclick && !target.getAttribute('onclick')) {
                        e.preventDefault();
                        target.click();
                    }
                }
            });
            
            // 드롭다운 버튼에 키보드 접근성 추가
            document.addEventListener('keydown', (e) => {
                const target = e.target;
                
                // 드롭다운 버튼에서 화살표 키 처리
                if (target.classList.contains('nav-link') && target.closest('.nav-dropdown-container')) {
                    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        const container = target.closest('.nav-dropdown-container');
                        const dropdownId = container.querySelector('.nav-dropdown-menu')?.id;
                        if (dropdownId) {
                            toggleNavDropdown(dropdownId);
                            // 첫 번째 메뉴 아이템에 포커스
                            setTimeout(() => {
                                const firstItem = document.querySelector(`#${dropdownId} .nav-dropdown-item`);
                                if (firstItem) {
                                    firstItem.focus();
                                }
                            }, 100);
                        }
                    }
                }
                
                // 드롭다운 메뉴 내에서 화살표 키로 네비게이션
                if (target.classList.contains('nav-dropdown-item')) {
                    const items = Array.from(target.parentElement.querySelectorAll('.nav-dropdown-item'));
                    const currentIndex = items.indexOf(target);
                    
                    if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        const nextIndex = (currentIndex + 1) % items.length;
                        items[nextIndex].focus();
                    } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        const prevIndex = (currentIndex - 1 + items.length) % items.length;
                        items[prevIndex].focus();
                    } else if (e.key === 'Escape') {
                        e.preventDefault();
                        const container = target.closest('.nav-dropdown-container');
                        const button = container.querySelector('button');
                        if (button) {
                            button.focus();
                            toggleNavDropdown(container.querySelector('.nav-dropdown-menu').id);
                        }
                    }
                }
            });
        }
        
        // 키보드 접근성 초기화 (앱 초기화 시 호출됨)

        // ---- 12. 커뮤니티 관련 전역 함수 ----
        
        function viewCommunityPost(id) {
            window.location.hash = `#/community/${id}`;
        }
        
        async function toggleCommunityLike(postId) {
            try {
                const result = await window.dataService?.togglePostLike(postId);
                showToast(result.liked ? '좋아요를 눌렀습니다.' : '좋아요를 취소했습니다.', 'success');
                setTimeout(() => window.location.reload(), 500);
            } catch (error) {
                console.error('좋아요 토글 오류:', error);
                showToast(error.message || '좋아요 처리에 실패했습니다.', 'error');
            }
        }
        
        async function addComment(postId) {
            try {
                // 댓글 작성 권한 확인 (Blue Label 이상)
                const canCreate = await window.dataService?.canCreateComment();
                if (!canCreate) {
                    const userInfo = await window.authService?.getUserInfo();
                    const grade = userInfo?.grade?.toLowerCase();
                    let message = '댓글 작성 권한이 없습니다.';
                    
                    if (!grade) {
                        message += '\n\n등록된 사용자만 댓글을 작성할 수 있습니다.';
                    } else if (grade !== 'blue' && grade !== 'silver' && grade !== 'black') {
                        message += '\n\nBlue Label 이상만 댓글을 작성할 수 있습니다.';
                    }
                    
                    showToast(message, 'error');
                    return;
                }
                
                const commentInput = document.getElementById('comment-input');
                const content = commentInput?.value?.trim();
                
                if (!content) {
                    showToast('댓글 내용을 입력해주세요.', 'error');
                    return;
                }
                
                await window.dataService?.addComment(postId, content);
                showToast('댓글이 작성되었습니다.', 'success');
                commentInput.value = '';
                setTimeout(() => window.location.reload(), 500);
            } catch (error) {
                console.error('댓글 작성 오류:', error);
                showToast(error.message || '댓글 작성에 실패했습니다.', 'error');
            }
        }
        
        async function deleteComment(commentId, postId) {
            try {
                if (!confirm('댓글을 삭제하시겠습니까?')) return;
                await window.dataService?.deleteComment(commentId);
                showToast('댓글이 삭제되었습니다.', 'success');
                setTimeout(() => window.location.reload(), 500);
            } catch (error) {
                console.error('댓글 삭제 오류:', error);
                showToast(error.message || '댓글 삭제에 실패했습니다.', 'error');
            }
        }
        
        async function filterCommunityPosts(category) {
            try {
                const posts = await window.dataService?.getCommunityPosts(
                    category === 'all' ? null : category, 20, 0
                ) || [];
                
                document.querySelectorAll('.category-filter').forEach(btn => {
                    btn.classList.toggle('bg-purple-600', btn.dataset.category === category);
                    btn.classList.toggle('text-white', btn.dataset.category === category);
                    btn.classList.toggle('bg-gray-100', btn.dataset.category !== category);
                });
                
                const listContainer = document.getElementById('community-list');
                if (listContainer) {
                    listContainer.innerHTML = posts.length === 0 
                        ? '<p class="text-gray-500 text-center py-8">게시글이 없습니다.</p>'
                        : posts.map(post => `
                            <div class="bg-white rounded-xl shadow-soft p-6 mb-4 border border-gray-100 hover:shadow-md transition-shadow">
                                <div class="flex items-start justify-between mb-3">
                                    <div class="flex items-center gap-2">
                                        <span class="text-xs px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-medium">${post.category || '질문'}</span>
                                        ${post.is_solved ? '<span class="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">✓ 해결됨</span>' : ''}
                                    </div>
                                    <span class="text-sm text-gray-500">${new Date(post.created_at).toLocaleDateString()}</span>
                                </div>
                                <h3 class="text-lg font-semibold text-gray-900 mb-2 cursor-pointer hover:text-purple-600" onclick="viewCommunityPost(${post.id})">${post.title}</h3>
                                <p class="text-gray-600 text-sm mb-4 line-clamp-2">${(post.content || '').substring(0, 150)}${(post.content || '').length > 150 ? '...' : ''}</p>
                                <div class="flex items-center gap-4 text-sm text-gray-500">
                                    <span>${post.author_name || '익명'}</span>
                                    <span>조회 ${post.views || 0}</span>
                                    <span>좋아요 ${post.likes_count || 0}</span>
                                    <span>댓글 ${post.comments_count || 0}</span>
                                </div>
                            </div>
                        `).join('');
                }
            } catch (error) {
                console.error('커뮤니티 필터 오류:', error);
                showToast('게시글을 불러올 수 없습니다.', 'error');
            }
        }
        
        async function openCommunityEditor(postId = null) {
            try {
                let post = null;
                if (postId) {
                    // 수정 모드: 작성자 확인
                    post = await window.dataService?.getCommunityPostById(postId);
                    if (!post) {
                        showToast('게시글을 찾을 수 없습니다.', 'error');
                        return;
                    }
                    
                    const session = await window.authSession?.getSession();
                    const userInfo = await window.authService?.getUserInfo();
                    const isAuthor = post.author_id === session?.user?.id;
                    const isAdmin = userInfo?.role === 'admin';
                    
                    if (!isAuthor && !isAdmin) {
                        showToast('수정 권한이 없습니다.', 'error');
                        return;
                    }
                } else {
                    // 작성 모드: Silver Label 이상 권한 확인
                    const canCreate = await window.dataService?.canCreateCommunityPost();
                    if (!canCreate) {
                        const userInfo = await window.authService?.getUserInfo();
                        const grade = userInfo?.grade?.toLowerCase();
                        let message = '게시글 작성 권한이 없습니다.';
                        
                        if (!grade || grade === 'blue') {
                            message += '\n\nSilver Label 이상만 게시글을 작성할 수 있습니다.';
                        }
                        
                        showToast(message, 'error');
                        return;
                    }
                }

                // 모달 생성
                const modal = document.createElement('div');
                modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
                modal.id = 'community-editor-modal';
                
                modal.innerHTML = `
                    <div class="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div class="p-6 border-b">
                            <h2 class="text-2xl font-bold text-gray-900">${postId ? '게시글 수정' : '게시글 작성'}</h2>
                        </div>
                        <form id="community-editor-form" class="p-6">
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">카테고리 *</label>
                                <select id="community-category" required 
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                                    <option value="질문" ${post?.category === '질문' ? 'selected' : ''}>질문</option>
                                    <option value="정비팁" ${post?.category === '정비팁' ? 'selected' : ''}>정비팁</option>
                                    <option value="문제해결" ${post?.category === '문제해결' ? 'selected' : ''}>문제해결</option>
                                    <option value="자료공유" ${post?.category === '자료공유' ? 'selected' : ''}>자료공유</option>
                                </select>
                            </div>
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">제목 *</label>
                                <input type="text" id="community-title" required 
                                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
                                       value="${post?.title || ''}" 
                                       placeholder="게시글 제목을 입력하세요">
                            </div>
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">내용 *</label>
                                <textarea id="community-content" required rows="12" 
                                          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
                                          placeholder="게시글 내용을 입력하세요">${post?.content || ''}</textarea>
                            </div>
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">태그 (쉼표로 구분)</label>
                                <input type="text" id="community-tags" 
                                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
                                       value="${post?.tags ? post.tags.join(', ') : ''}" 
                                       placeholder="예: 정비, 전기, 배터리">
                                <p class="text-xs text-gray-500 mt-1">태그를 쉼표로 구분하여 입력하세요</p>
                            </div>
                            <div class="mb-4" id="solved-checkbox-container" style="display: none;">
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" id="community-is-solved" 
                                           ${post?.is_solved ? 'checked' : ''}
                                           class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500">
                                    <span class="text-sm font-medium text-gray-700">문제가 해결되었습니다</span>
                                </label>
                            </div>
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">첨부파일</label>
                                <input type="file" id="community-files" multiple
                                       accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx,.zip"
                                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                                <p class="text-xs text-gray-500 mt-1">최대 5개 파일, 각 파일 최대 10MB</p>
                                <div id="file-list" class="mt-2 space-y-2">
                                    ${post?.attachments && post.attachments.length > 0 ? post.attachments.map(file => `
                                        <div class="flex items-center justify-between p-2 bg-gray-50 rounded border" data-file-url="${file.url}">
                                            <span class="text-sm text-gray-700">${file.name}</span>
                                            <button type="button" onclick="removeAttachedFile(this)" class="text-red-500 hover:text-red-700 text-sm">삭제</button>
                                        </div>
                                    `).join('') : ''}
                                </div>
                            </div>
                            <div class="flex gap-2 justify-end">
                                <button type="button" onclick="closeCommunityEditor()" 
                                        class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                                    취소
                                </button>
                                <button type="submit" 
                                        class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                                    ${postId ? '수정' : '작성'}
                                </button>
                            </div>
                        </form>
                    </div>
                `;

                document.body.appendChild(modal);

                // 카테고리 변경 시 해결됨 체크박스 표시/숨김
                const categorySelect = document.getElementById('community-category');
                const solvedContainer = document.getElementById('solved-checkbox-container');
                
                function toggleSolvedCheckbox() {
                    if (categorySelect.value === '질문' || categorySelect.value === '문제해결') {
                        solvedContainer.style.display = 'block';
                    } else {
                        solvedContainer.style.display = 'none';
                        document.getElementById('community-is-solved').checked = false;
                    }
                }
                
                toggleSolvedCheckbox();
                categorySelect.addEventListener('change', toggleSolvedCheckbox);

                // 폼 제출 처리
                const form = document.getElementById('community-editor-form');
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    await saveCommunityPost(postId);
                });

            } catch (error) {
                console.error('커뮤니티 에디터 열기 오류:', error);
                showToast('커뮤니티 에디터를 열 수 없습니다.', 'error');
            }
        }
        
        async function saveCommunityPost(postId = null) {
            try {
                const title = document.getElementById('community-title').value.trim();
                const content = document.getElementById('community-content').value.trim();
                const category = document.getElementById('community-category').value;
                const tagsInput = document.getElementById('community-tags').value.trim();
                const isSolved = document.getElementById('community-is-solved').checked;
                const filesInput = document.getElementById('community-files');
                
                if (!title || !content || !category) {
                    showToast('제목, 내용, 카테고리를 모두 입력해주세요.', 'error');
                    return;
                }

                // 태그 처리
                const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

                showToast('저장 중...', 'info');

                // 기존 첨부파일 목록 가져오기
                const existingFiles = Array.from(document.querySelectorAll('#file-list [data-file-url]'))
                    .map(el => ({
                        url: el.dataset.fileUrl,
                        name: el.querySelector('span').textContent
                    }));

                // 새 파일 업로드
                let newAttachments = [];
                if (filesInput.files.length > 0) {
                    if (filesInput.files.length > 5) {
                        showToast('최대 5개까지 파일을 첨부할 수 있습니다.', 'error');
                        return;
                    }

                    showToast('파일 업로드 중...', 'info');
                    const postFolder = postId || `temp-${Date.now()}`;
                    const uploadPromises = Array.from(filesInput.files).map(file => 
                        window.fileUploadService?.uploadFile(file, 'community', postFolder)
                    );
                    newAttachments = await Promise.all(uploadPromises);
                }

                // 첨부파일 목록 합치기
                const attachments = [...existingFiles, ...newAttachments];

                let result;
                if (postId) {
                    // 수정
                    result = await window.dataService?.updateCommunityPost(postId, {
                        title,
                        content,
                        category,
                        tags,
                        is_solved: category === '질문' || category === '문제해결' ? isSolved : false,
                        attachments
                    });
                    showToast('게시글이 수정되었습니다.', 'success');
                } else {
                    // 작성
                    result = await window.dataService?.createCommunityPost({
                        title,
                        content,
                        category,
                        tags,
                        is_solved: category === '질문' || category === '문제해결' ? isSolved : false,
                        attachments
                    });
                    showToast('게시글이 작성되었습니다.', 'success');
                }

                // 모달 닫기
                closeCommunityEditor();

                // 페이지 새로고침
                if (postId) {
                    window.location.hash = `#/community/${postId}`;
                    setTimeout(() => location.reload(), 500);
                } else {
                    window.location.hash = '#/community';
                    setTimeout(() => location.reload(), 500);
                }

            } catch (error) {
                console.error('커뮤니티 게시글 저장 오류:', error);
                showToast(error.message || '게시글 저장에 실패했습니다.', 'error');
            }
        }
        
        function closeCommunityEditor() {
            const modal = document.getElementById('community-editor-modal');
            if (modal) {
                modal.remove();
            }
        }
        
        function removeAttachedFile(button) {
            const fileItem = button.closest('[data-file-url]');
            if (fileItem) {
                fileItem.remove();
            }
        }
        
        async function deleteCommunityPost(id) {
            try {
                if (!confirm('게시글을 삭제하시겠습니까?')) return;
                await window.dataService?.deleteCommunityPost(id);
                showToast('게시글이 삭제되었습니다.', 'success');
                setTimeout(() => window.location.hash = '#/community', 500);
            } catch (error) {
                console.error('게시글 삭제 오류:', error);
                showToast(error.message || '게시글 삭제에 실패했습니다.', 'error');
            }
        }

        // ---- 13. 권한 업그레이드 요청 팝업 ----
        
        /**
         * 권한 업그레이드 요청 팝업 열기
         */
        async function openGradeUpgradeRequest() {
            try {
                const userInfo = await window.authService?.getUserInfo();
                const session = await window.authSession?.getSession();
                
                if (!userInfo || !session) {
                    showToast('사용자 정보를 불러올 수 없습니다.', 'error');
                    return;
                }
                
                const currentGrade = userInfo.grade?.toLowerCase() || '없음';
                const gradeOptions = {
                    '없음': { next: 'blue', label: '블루 라벨', description: '정비지침서, TSB 접근 + 커뮤니티 댓글 작성' },
                    'blue': { next: 'silver', label: '실버 라벨', description: '전장회로도, 와이어링 커넥터 접근 + 커뮤니티 게시글 작성' },
                    'silver': { next: 'black', label: '블랙 라벨', description: '모든 기술문서 접근 가능' }
                };
                
                const nextGrade = gradeOptions[currentGrade];
                if (!nextGrade) {
                    showToast('더 이상 업그레이드할 등급이 없습니다.', 'info');
                    return;
                }
                
                const modal = document.createElement('div');
                modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
                modal.id = 'grade-upgrade-modal';
                
                modal.innerHTML = `
                    <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div class="p-6 border-b">
                            <div class="flex items-center justify-between">
                                <h2 class="text-2xl font-bold text-gray-900">등급 업그레이드 요청</h2>
                                <button onclick="closeGradeUpgradeRequest()" class="text-gray-400 hover:text-gray-600 transition-colors">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <form id="grade-upgrade-form" class="p-6">
                            <div class="mb-6">
                                <div class="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-4">
                                    <div class="flex items-center gap-3 mb-2">
                                        <div class="px-3 py-1 bg-white rounded-lg border-2 border-purple-300">
                                            <span class="text-sm font-semibold text-purple-700">현재 등급</span>
                                        </div>
                                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                                        </svg>
                                        <div class="px-3 py-1 bg-purple-600 text-white rounded-lg">
                                            <span class="text-sm font-semibold">${nextGrade.label}</span>
                                        </div>
                                    </div>
                                    <p class="text-sm text-gray-700">${nextGrade.description}</p>
                                </div>
                            </div>
                            
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">요청자 정보</label>
                                <div class="space-y-2">
                                    <input type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" 
                                           value="${userInfo.name || '정보 없음'}" readonly>
                                    <input type="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" 
                                           value="${session.user.email || '정보 없음'}" readonly>
                                    <input type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" 
                                           value="${userInfo.affiliation || '정보 없음'}" readonly>
                                </div>
                            </div>
                            
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">요청 사유 *</label>
                                <textarea 
                                    id="upgrade-reason" 
                                    required 
                                    rows="5"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
                                    placeholder="등급 업그레이드가 필요한 이유를 작성해주세요.&#10;예: 정비 업무를 위해 전장회로도 접근이 필요합니다."
                                ></textarea>
                                <p class="text-xs text-gray-500 mt-1">상세한 사유를 작성하시면 승인 가능성이 높아집니다.</p>
                            </div>
                            
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">연락처 (선택사항)</label>
                                <input 
                                    type="tel" 
                                    id="upgrade-contact" 
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
                                    placeholder="010-1234-5678"
                                    value="${userInfo.phone || ''}"
                                >
                            </div>
                            
                            <div class="flex gap-2 justify-end">
                                <button 
                                    type="button" 
                                    onclick="closeGradeUpgradeRequest()" 
                                    class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    취소
                                </button>
                                <button 
                                    type="submit" 
                                    class="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium"
                                >
                                    <span class="flex items-center gap-2">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                        </svg>
                                        요청 전송
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>
                `;
                
                document.body.appendChild(modal);
                
                // 폼 제출 이벤트
                document.getElementById('grade-upgrade-form').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    await submitGradeUpgradeRequest(userInfo, session, currentGrade, nextGrade);
                });
                
            } catch (error) {
                console.error('권한 업그레이드 요청 팝업 오류:', error);
                showToast('요청 팝업을 열 수 없습니다.', 'error');
            }
        }
        
        /**
         * 권한 업그레이드 요청 팝업 닫기
         */
        function closeGradeUpgradeRequest() {
            const modal = document.getElementById('grade-upgrade-modal');
            if (modal) {
                modal.remove();
            }
        }
        
        /**
         * 권한 업그레이드 요청 제출
         */
        async function submitGradeUpgradeRequest(userInfo, session, currentGrade, nextGrade) {
            try {
                const reason = document.getElementById('upgrade-reason')?.value?.trim();
                const contact = document.getElementById('upgrade-contact')?.value?.trim();
                
                if (!reason) {
                    showToast('요청 사유를 입력해주세요.', 'error');
                    return;
                }
                
                // 요청 데이터 준비
                const requestData = {
                    user_id: session.user.id,
                    user_name: userInfo.name || '정보 없음',
                    user_email: session.user.email,
                    user_affiliation: userInfo.affiliation || '',
                    current_grade: currentGrade,
                    requested_grade: nextGrade.next,
                    reason: reason,
                    contact: contact || userInfo.phone || '',
                    status: 'pending',
                    created_at: new Date().toISOString()
                };
                
                // 데이터베이스에 저장
                if (window.supabaseClient) {
                    const { error } = await window.supabaseClient
                        .from('grade_upgrade_requests')
                        .insert([requestData]);
                    
                    if (error) {
                        // 테이블이 없으면 생성 시도
                        if (error.code === 'PGRST106' || error.message?.includes('does not exist')) {
                            showToast('요청 테이블이 없습니다. 관리자에게 문의해주세요.', 'error');
                            console.error('grade_upgrade_requests 테이블이 없습니다. SQL 마이그레이션을 실행해주세요.');
                            return;
                        }
                        throw error;
                    }
                }
                
                // 이메일 전송 (Supabase Edge Function 호출)
                let emailSent = false;
                let emailError = null;
                let errorDetails = null;
                
                try {
                    const { data, error: emailErrorResponse } = await window.supabaseClient.functions.invoke('send-grade-upgrade-email', {
                        body: {
                            to: 'admin@evkmc.com', // 관리자 이메일 (환경변수로 설정 가능)
                            subject: `[등급 업그레이드 요청] ${userInfo.name}님의 ${nextGrade.label} 요청`,
                            html: `
                                <h2>등급 업그레이드 요청</h2>
                                <p><strong>요청자:</strong> ${userInfo.name} (${session.user.email})</p>
                                <p><strong>소속:</strong> ${userInfo.affiliation || '정보 없음'}</p>
                                <p><strong>현재 등급:</strong> ${currentGrade === '없음' ? '등급 없음' : currentGrade}</p>
                                <p><strong>요청 등급:</strong> ${nextGrade.label}</p>
                                <p><strong>연락처:</strong> ${contact || userInfo.phone || '정보 없음'}</p>
                                <h3>요청 사유:</h3>
                                <p>${reason.replace(/\n/g, '<br>')}</p>
                                <hr>
                                <p><small>이 요청은 시스템에서 자동으로 생성되었습니다.</small></p>
                            `
                        }
                    });
                    
                    if (emailErrorResponse) {
                        emailError = emailErrorResponse;
                        errorDetails = emailErrorResponse;
                        
                        console.error('❌ 이메일 전송 실패:', emailErrorResponse);
                        console.error('에러 타입:', emailErrorResponse.constructor?.name);
                        console.error('에러 메시지:', emailErrorResponse.message);
                        
                        // Edge Function의 에러 응답 본문 파싱 시도
                        try {
                            // Supabase Functions 에러의 경우 context에 응답 본문이 있을 수 있음
                            if (emailErrorResponse.context?.response) {
                                const responseText = await emailErrorResponse.context.response.text();
                                try {
                                    const responseJson = JSON.parse(responseText);
                                    errorDetails = {
                                        ...errorDetails,
                                        responseBody: responseJson
                                    };
                                    console.error('📧 Edge Function 응답 본문:', responseJson);
                                } catch {
                                    errorDetails = {
                                        ...errorDetails,
                                        responseBody: responseText
                                    };
                                    console.error('📧 Edge Function 응답 본문 (텍스트):', responseText);
                                }
                            }
                        } catch (parseError) {
                            console.error('응답 본문 파싱 실패:', parseError);
                        }
                        
                        // 에러 응답 본문 확인 시도
                        if (emailErrorResponse.context) {
                            console.error('에러 컨텍스트:', emailErrorResponse.context);
                            if (!errorDetails.responseBody) {
                                errorDetails = emailErrorResponse.context;
                            }
                        }
                        
                        // Supabase Functions 에러의 경우 추가 정보 확인
                        if (emailErrorResponse.message) {
                            console.error('전체 에러 객체:', JSON.stringify(emailErrorResponse, null, 2));
                        }
                    } else if (data) {
                        emailSent = true;
                        console.log('✅ 이메일 전송 성공:', data);
                    }
                } catch (emailErrorResponse) {
                    emailError = emailErrorResponse;
                    errorDetails = emailErrorResponse;
                    console.error('❌ 이메일 전송 함수 호출 실패:', emailErrorResponse);
                    console.error('에러 타입:', emailErrorResponse.constructor?.name);
                    console.error('에러 메시지:', emailErrorResponse.message);
                    console.error('전체 에러:', emailErrorResponse);
                }
                
                // 결과 메시지 표시
                if (emailSent) {
                    showToast('등급 업그레이드 요청이 전송되었습니다. 관리자 검토 후 연락드리겠습니다.', 'success');
                } else {
                    // 이메일 전송 실패해도 요청은 저장되었으므로 성공으로 처리
                    if (emailError) {
                        console.warn('⚠️ 이메일 전송 실패 상세:', emailError);
                        console.warn('⚠️ 에러 상세 정보:', errorDetails);
                        
                        // 구체적인 에러 메시지 표시
                        let errorMessage = '요청이 저장되었습니다.';
                        let errorHint = '';
                        
                        // 에러 메시지 분석
                        const errorMsg = emailError.message || '';
                        const errorStr = JSON.stringify(emailError) || '';
                        const responseError = errorDetails?.responseBody?.error || '';
                        const responseDetails = errorDetails?.responseBody?.details || '';
                        
                        console.error('📧 이메일 전송 실패 상세 분석:', {
                            message: errorMsg,
                            responseError,
                            responseDetails,
                            fullError: emailError
                        });
                        
                        if (errorMsg.includes('RESEND_API_KEY') || errorStr.includes('RESEND_API_KEY') || responseError.includes('RESEND_API_KEY') || responseDetails.includes('RESEND_API_KEY')) {
                            errorMessage += ' (이메일 서비스 설정 필요)';
                            errorHint = 'Resend API 키가 설정되지 않았습니다.\n\n해결 방법:\n1. Supabase Dashboard 접속\n2. Edge Functions > send-grade-upgrade-email 선택\n3. Settings 탭 > Secrets 섹션\n4. RESEND_API_KEY 추가 (Resend.com에서 발급받은 키)\n5. Edge Function 재배포';
                            console.info('💡', errorHint);
                        } else if (errorMsg.includes('Function not found') || errorMsg.includes('404')) {
                            errorMessage += ' (Edge Function 배포 필요)';
                            errorHint = 'Edge Function이 배포되지 않았습니다. 배포 가이드를 참고하세요.';
                            console.info('💡', errorHint);
                        } else if (errorMsg.includes('500') || errorStr.includes('500') || responseError) {
                            errorMessage += ' (서버 오류 발생)';
                            const specificError = responseError || '알 수 없는 오류';
                            errorHint = `Edge Function에서 500 에러가 발생했습니다.\n\n에러: ${specificError}\n\n확인 방법:\n1. Supabase Dashboard > Edge Functions\n2. send-grade-upgrade-email 함수 선택\n3. Logs 탭에서 최근 에러 확인\n\n가능한 원인:\n- Resend API 키 미설정 또는 잘못됨\n- Resend 도메인 미인증\n- Edge Function 코드 오류`;
                            console.error('💡', errorHint);
                            console.error('💡 가능한 원인:');
                            console.error('   1. Resend API 키가 설정되지 않음');
                            console.error('   2. Resend API 키가 잘못됨');
                            console.error('   3. 도메인이 인증되지 않음 (현재는 onboarding@resend.dev 사용 중)');
                            console.error('   4. Edge Function 코드 오류');
                            if (responseDetails) {
                                console.error('   상세:', responseDetails);
                            }
                        } else if (errorMsg.includes('CORS') || errorStr.includes('CORS')) {
                            errorMessage += ' (CORS 오류)';
                            errorHint = 'CORS 설정 문제입니다. Edge Function 코드를 확인하세요.';
                            console.error('💡', errorHint);
                        } else {
                            errorMessage += ' (이메일 전송 실패)';
                            errorHint = 'Supabase Dashboard > Edge Functions > send-grade-upgrade-email > Logs에서 에러 로그를 확인하세요.\n\n로그 확인 방법:\n1. Supabase Dashboard 접속\n2. Edge Functions 메뉴 클릭\n3. send-grade-upgrade-email 함수 선택\n4. Logs 탭에서 최근 에러 메시지 확인';
                            console.error('💡', errorHint);
                            console.error('💡 전체 에러 정보:', {
                                message: emailError.message,
                                name: emailError.name,
                                stack: emailError.stack,
                                context: errorDetails,
                                responseBody: errorDetails?.responseBody
                            });
                        }
                        
                        showToast(errorMessage, 'info');
                    } else {
                        showToast('요청이 저장되었습니다. 관리자가 확인 후 연락드리겠습니다.', 'success');
                    }
                }
                
                closeGradeUpgradeRequest();
                
            } catch (error) {
                console.error('권한 업그레이드 요청 제출 오류:', error);
                showToast(error.message || '요청 전송에 실패했습니다.', 'error');
            }
        }

        // ---- 13. 전역 함수 등록 ----
        window.handleLogout = handleLogout;
        window.downloadSecureFile = downloadSecureFile;
        window.viewNotice = viewNotice;
        window.viewCommunityPost = viewCommunityPost;
        window.toggleCommunityLike = toggleCommunityLike;
        window.addComment = addComment;
        window.deleteComment = deleteComment;
        window.filterCommunityPosts = filterCommunityPosts;
        window.openCommunityEditor = openCommunityEditor;
        window.closeCommunityEditor = closeCommunityEditor;
        window.saveCommunityPost = saveCommunityPost;
        window.removeAttachedFile = removeAttachedFile;
        window.deleteCommunityPost = deleteCommunityPost;
        window.refreshSession = refreshSession;
        window.toggleNavDropdown = toggleNavDropdown;
        window.openGradeUpgradeRequest = openGradeUpgradeRequest;
        window.closeGradeUpgradeRequest = closeGradeUpgradeRequest;
        window.submitGradeUpgradeRequest = submitGradeUpgradeRequest;

        // ---- 11-3. 검색 히스토리 기능 ----
        
        const SEARCH_HISTORY_KEY = 'evkmc_search_history';
        const MAX_SEARCH_HISTORY = 10;
        
        /**
         * 검색 히스토리 저장
         * @param {string} query - 검색어
         */
        function saveSearchHistory(query) {
            if (!query || query.trim().length === 0) return;
            
            try {
                let history = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
                
                // 중복 제거
                history = history.filter(item => item.toLowerCase() !== query.toLowerCase());
                
                // 최신 검색어를 맨 앞에 추가
                history.unshift(query);
                
                // 최대 개수 제한
                if (history.length > MAX_SEARCH_HISTORY) {
                    history = history.slice(0, MAX_SEARCH_HISTORY);
                }
                
                localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
            } catch (error) {
                console.error('검색 히스토리 저장 오류:', error);
            }
        }
        
        /**
         * 검색 히스토리 가져오기
         * @returns {Array<string>} 검색 히스토리 배열
         */
        function getSearchHistory() {
            try {
                return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
            } catch (error) {
                console.error('검색 히스토리 로드 오류:', error);
                return [];
            }
        }
        
        /**
         * 검색 히스토리 삭제
         * @param {string} query - 삭제할 검색어 (선택사항, 없으면 전체 삭제)
         */
        function deleteSearchHistory(query = null) {
            try {
                if (query) {
                    let history = getSearchHistory();
                    history = history.filter(item => item.toLowerCase() !== query.toLowerCase());
                    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
                } else {
                    localStorage.removeItem(SEARCH_HISTORY_KEY);
                }
            } catch (error) {
                console.error('검색 히스토리 삭제 오류:', error);
            }
        }
        
        /**
         * 검색 히스토리 UI 표시
         * @param {HTMLElement} inputElement - 검색 입력 요소
         */
        function showSearchHistory(inputElement) {
            // 기존 히스토리 UI 제거
            const existingHistory = document.getElementById('search-history-dropdown');
            if (existingHistory) {
                existingHistory.remove();
            }
            
            const history = getSearchHistory();
            if (history.length === 0) return;
            
            const searchContainer = inputElement.closest('.tree-search');
            if (!searchContainer) return;
            
            // 히스토리 드롭다운 생성
            const historyDropdown = document.createElement('div');
            historyDropdown.id = 'search-history-dropdown';
            historyDropdown.className = 'absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto';
            
            historyDropdown.innerHTML = `
                <div class="p-2 border-b border-gray-200 flex items-center justify-between">
                    <span class="text-xs font-medium text-gray-700">최근 검색어</span>
                    <button 
                        id="delete-all-search-history-btn"
                        class="text-xs text-gray-500 hover:text-gray-700"
                        tabindex="0"
                        aria-label="전체 삭제">
                        전체 삭제
                    </button>
                </div>
                <div class="py-1">
                    ${history.map((item, index) => {
                        const safeItem = item.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
                        return `
                        <div class="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer group">
                            <button 
                                data-search-item="${index}"
                                class="search-history-item flex-1 text-left text-sm text-gray-700 hover:text-blue-600"
                                tabindex="0">
                                <svg class="w-4 h-4 inline-block mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                                ${safeItem}
                            </button>
                            <button 
                                data-delete-item="${index}"
                                class="delete-history-item opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-opacity"
                                tabindex="0"
                                aria-label="삭제">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                    `;
                    }).join('')}
                </div>
            `;
            
            searchContainer.style.position = 'relative';
            searchContainer.appendChild(historyDropdown);
            
            // 검색 히스토리 항목 클릭 이벤트
            historyDropdown.querySelectorAll('.search-history-item').forEach((btn, index) => {
                btn.addEventListener('click', () => {
                    selectSearchHistory(history[index]);
                });
            });
            
            // 삭제 버튼 클릭 이벤트
            historyDropdown.querySelectorAll('.delete-history-item').forEach((btn, index) => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteSearchHistoryItem(history[index]);
                });
            });
            
            // 전체 삭제 버튼 이벤트
            const deleteAllBtn = historyDropdown.querySelector('#delete-all-search-history-btn');
            if (deleteAllBtn) {
                deleteAllBtn.addEventListener('click', () => {
                    deleteAllSearchHistory();
                });
            }
            
            // 입력 필드 포커스 시 히스토리 표시
            inputElement.addEventListener('focus', () => {
                if (history.length > 0 && !document.getElementById('search-history-dropdown')) {
                    showSearchHistory(inputElement);
                }
            });
            
            // 외부 클릭 시 히스토리 숨기기
            document.addEventListener('click', (e) => {
                if (!searchContainer.contains(e.target)) {
                    const dropdown = document.getElementById('search-history-dropdown');
                    if (dropdown) {
                        dropdown.remove();
                    }
                }
            });
        }
        
        /**
         * 검색 히스토리 항목 선택
         * @param {string} query - 선택한 검색어
         */
        function selectSearchHistory(query) {
            const searchInput = document.querySelector('.tree-search input');
            if (searchInput) {
                searchInput.value = query;
                searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                searchInput.focus();
            }
            
            // 히스토리 드롭다운 제거
            const dropdown = document.getElementById('search-history-dropdown');
            if (dropdown) {
                dropdown.remove();
            }
        }
        
        /**
         * 검색 히스토리 항목 삭제
         * @param {string} query - 삭제할 검색어
         */
        function deleteSearchHistoryItem(query) {
            deleteSearchHistory(query);
            
            // UI 업데이트
            const searchInput = document.querySelector('.tree-search input');
            if (searchInput) {
                showSearchHistory(searchInput);
            }
        }
        
        /**
         * 검색 히스토리 전체 삭제
         */
        function deleteAllSearchHistory() {
            deleteSearchHistory();
            
            // UI 제거
            const dropdown = document.getElementById('search-history-dropdown');
            if (dropdown) {
                dropdown.remove();
            }
        }
        
        // 전역 함수로 등록
        window.selectSearchHistory = selectSearchHistory;
        window.deleteSearchHistoryItem = deleteSearchHistoryItem;
        window.deleteAllSearchHistory = deleteAllSearchHistory;

        // ---- 11-4. 첫 방문 온보딩 가이드 ----
        
        /**
         * 첫 방문 여부 확인 및 온보딩 가이드 표시
         */
        function checkAndShowOnboarding() {
            const onboardingCompletedKey = 'evkmc_onboarding_completed';
            const onboardingCountKey = 'evkmc_onboarding_count';
            const maxOnboardingCount = 3;
            
            const hasCompletedOnboarding = localStorage.getItem(onboardingCompletedKey) === 'true';
            const currentCount = parseInt(localStorage.getItem(onboardingCountKey) || '0', 10);
            
            // "다시 보지 않기"를 선택하지 않았고, 3회 이내인 경우에만 표시
            if (!hasCompletedOnboarding && currentCount < maxOnboardingCount) {
                // 2초 후 온보딩 시작 (페이지 로드 완료 대기)
                setTimeout(() => {
                    startOnboarding();
                }, 2000);
            }
        }
        
        /**
         * 온보딩 가이드 시작
         */
        function startOnboarding() {
            const steps = [
                {
                    target: 'header',
                    title: '환영합니다! 👋',
                    content: 'EVKMC A/S 정비 포털에 오신 것을 환영합니다. 주요 기능을 간단히 안내해드리겠습니다.',
                    position: 'bottom'
                },
                {
                    target: '#desktop-nav, #mobile-menu-btn',
                    title: '네비게이션 메뉴',
                    content: '상단 메뉴에서 정비지침서, 전장회로도, 게시판 등 다양한 기능에 접근할 수 있습니다.',
                    position: 'bottom'
                },
                {
                    target: '#main-content',
                    title: '홈 화면',
                    content: '홈 화면에서 빠르게 주요 기능에 접근하고 최근 공지사항을 확인할 수 있습니다.',
                    position: 'top'
                },
                {
                    target: '#auth-container',
                    title: '내 정보',
                    content: '우측 상단에서 세션 정보를 확인하고, 내 정보 페이지에서 계정 정보와 등급을 확인할 수 있습니다.',
                    position: 'left'
                }
            ];
            
            let currentStep = 0;
            let overlay = null;
            let tooltip = null;
            
            function showStep(stepIndex) {
                if (stepIndex >= steps.length) {
                    completeOnboarding();
                    return;
                }
                
                const step = steps[stepIndex];
                const targetElement = document.querySelector(step.target);
                
                if (!targetElement) {
                    // 요소를 찾을 수 없으면 다음 단계로
                    showStep(stepIndex + 1);
                    return;
                }
                
                // 오버레이 생성
                if (!overlay) {
                    overlay = document.createElement('div');
                    overlay.className = 'onboarding-overlay';
                    document.body.appendChild(overlay);
                }
                
                // 기존 툴팁 제거
                if (tooltip) {
                    tooltip.remove();
                }
                
                // 타겟 요소 하이라이트
                const rect = targetElement.getBoundingClientRect();
                targetElement.classList.add('onboarding-highlight');
                
                // 툴팁 생성
                tooltip = document.createElement('div');
                tooltip.className = `onboarding-tooltip ${step.position}`;
                
                const progress = Math.round(((stepIndex + 1) / steps.length) * 100);
                
                tooltip.innerHTML = `
                    <div class="mb-3">
                        <h3 class="text-lg font-bold text-gray-900 mb-1">${step.title}</h3>
                        <p class="text-sm text-gray-600">${step.content}</p>
                    </div>
                    <div class="flex items-center justify-between gap-2">
                        <div class="flex-1 bg-gray-200 rounded-full h-2">
                            <div class="bg-blue-600 h-2 rounded-full transition-all" style="width: ${progress}%"></div>
                        </div>
                        <span class="text-xs text-gray-500">${stepIndex + 1}/${steps.length}</span>
                    </div>
                    <div class="flex flex-col gap-2 mt-4">
                        <div class="flex gap-2">
                            <button 
                                id="onboarding-skip-btn"
                                class="flex-1 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                                tabindex="0">
                                건너뛰기
                            </button>
                            <button 
                                id="onboarding-next-btn"
                                class="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                tabindex="0">
                                ${stepIndex === steps.length - 1 ? '완료' : '다음'}
                            </button>
                        </div>
                        ${stepIndex === steps.length - 1 ? `
                            <button 
                                id="onboarding-dont-show-btn"
                                class="w-full px-4 py-2 text-xs text-gray-500 hover:text-gray-700 transition-colors border border-gray-200 rounded-lg hover:border-gray-300"
                                tabindex="0">
                                다시 보지 않기
                            </button>
                        ` : ''}
                    </div>
                `;
                
                // 버튼 이벤트 리스너 추가 (onclick 대신)
                const skipBtn = tooltip.querySelector('#onboarding-skip-btn');
                const nextBtn = tooltip.querySelector('#onboarding-next-btn');
                const dontShowBtn = tooltip.querySelector('#onboarding-dont-show-btn');
                
                if (skipBtn) {
                    skipBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        skip();
                    });
                }
                
                if (nextBtn) {
                    nextBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        nextStep();
                    });
                }
                
                if (dontShowBtn) {
                    dontShowBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        dontShowAgain();
                    });
                }
                
                // 툴팁 위치 설정
                const tooltipRect = tooltip.getBoundingClientRect();
                let top = 0;
                let left = 0;
                
                switch (step.position) {
                    case 'top':
                        top = rect.top - tooltipRect.height - 20;
                        left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                        break;
                    case 'bottom':
                        top = rect.bottom + 20;
                        left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                        break;
                    case 'left':
                        top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                        left = rect.left - tooltipRect.width - 20;
                        break;
                    case 'right':
                        top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                        left = rect.right + 20;
                        break;
                }
                
                // 화면 밖으로 나가지 않도록 조정
                if (left < 10) left = 10;
                if (left + tooltipRect.width > window.innerWidth - 10) {
                    left = window.innerWidth - tooltipRect.width - 10;
                }
                if (top < 10) top = 10;
                if (top + tooltipRect.height > window.innerHeight - 10) {
                    top = window.innerHeight - tooltipRect.height - 10;
                }
                
                // 툴팁을 먼저 body에 추가하여 크기 측정 가능하게 함
                document.body.appendChild(tooltip);
                
                // 위치 재계산 (DOM에 추가된 후 실제 크기 측정)
                const actualTooltipRect = tooltip.getBoundingClientRect();
                
                // 위치 재조정
                if (left < 10) left = 10;
                if (left + actualTooltipRect.width > window.innerWidth - 10) {
                    left = window.innerWidth - actualTooltipRect.width - 10;
                }
                if (top < 10) top = 10;
                if (top + actualTooltipRect.height > window.innerHeight - 10) {
                    top = window.innerHeight - actualTooltipRect.height - 10;
                }
                
                tooltip.style.top = `${top}px`;
                tooltip.style.left = `${left}px`;
                tooltip.style.zIndex = '10002';
                
                // 스크롤하여 타겟 요소가 보이도록
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            
            function nextStep() {
                // 하이라이트 제거
                document.querySelectorAll('.onboarding-highlight').forEach(el => {
                    el.classList.remove('onboarding-highlight');
                });
                currentStep++;
                
                // 마지막 단계를 완료한 경우
                if (currentStep >= steps.length) {
                    const onboardingCountKey = 'evkmc_onboarding_count';
                    const currentCount = parseInt(localStorage.getItem(onboardingCountKey) || '0', 10);
                    localStorage.setItem(onboardingCountKey, (currentCount + 1).toString());
                    completeOnboarding(false);
                } else {
                    showStep(currentStep);
                }
            }
            
            function skip() {
                // 건너뛰기: 카운트만 증가시키고 완료 처리하지 않음
                const onboardingCountKey = 'evkmc_onboarding_count';
                const currentCount = parseInt(localStorage.getItem(onboardingCountKey) || '0', 10);
                localStorage.setItem(onboardingCountKey, (currentCount + 1).toString());
                
                completeOnboarding(false);
            }
            
            function dontShowAgain() {
                // 다시 보지 않기: 완료 처리
                localStorage.setItem('evkmc_onboarding_completed', 'true');
                completeOnboarding(true);
            }
            
            function completeOnboarding(isDontShow = false) {
                // 하이라이트 제거
                document.querySelectorAll('.onboarding-highlight').forEach(el => {
                    el.classList.remove('onboarding-highlight');
                });
                
                if (overlay) overlay.remove();
                if (tooltip) tooltip.remove();
                
                if (isDontShow) {
                    showToast('온보딩 가이드를 다시 표시하지 않습니다.', 'info');
                } else {
                    const onboardingCountKey = 'evkmc_onboarding_count';
                    const currentCount = parseInt(localStorage.getItem(onboardingCountKey) || '0', 10);
                    if (currentCount >= 3) {
                        showToast('온보딩 가이드를 완료했습니다!', 'success');
                    } else {
                        showToast('온보딩 가이드를 건너뛰었습니다.', 'info');
                    }
                }
            }
            
            // 전역 함수로 등록
            window.nextOnboardingStep = nextStep;
            window.skipOnboarding = skip;
            window.restartOnboarding = () => {
                localStorage.removeItem('evkmc_onboarding_completed');
                if (overlay) overlay.remove();
                if (tooltip) tooltip.remove();
                document.querySelectorAll('.onboarding-highlight').forEach(el => {
                    el.classList.remove('onboarding-highlight');
                });
                currentStep = 0;
                showStep(0);
            };
            
            // 첫 단계 표시
            showStep(0);
        }
        
        /**
         * 온보딩 가이드 재시작 (개발자 콘솔에서 사용 가능)
         */
        window.restartOnboardingGuide = function() {
            localStorage.removeItem('evkmc_onboarding_completed');
            startOnboarding();
        };

        // ---- 12. 앱 시작 ----
        initApp();
    })();
}