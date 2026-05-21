/**
 * VAN / QQ 제품 계통(product line) — 라우트 prefix, 테마, 네비 프로필
 */

export const LINE_VAN = 'van';
export const LINE_QQ = 'qq';

const STORAGE_KEY = 'gsw-product-line-v1';

const VAN_DOC_PATHS = ['/shop', '/etm', '/dtc', '/wiring', '/tsb'];
const QQ_DOC_PATHS = ['/shop'];
const QQ_BLOCKED_DOC_PATHS = ['/etm', '/dtc', '/wiring', '/tsb'];

export const PRODUCT_LINES = {
    [LINE_VAN]: {
        id: LINE_VAN,
        label: 'MASADA VAN',
        headerTitle: 'EVKMC A/S',
        homeSubtitle: '정비 기술 문서 및 서비스 정보에 오신 것을 환영합니다.',
        splashUrl: 'assets/splash.jpg',
        logoUrl: 'assets/evkmc-logo.png',
        themeColor: '#374151',
        defaultHash: '#/home',
        maintenanceModel: null,
    },
    [LINE_QQ]: {
        id: LINE_QQ,
        label: 'MASADA QQ',
        headerTitle: 'MASADA QQ',
        homeSubtitle: 'MASADA QQ 정비 기술 문서 포털',
        splashUrl: 'assets/qq/splash.jpg',
        logoUrl: 'assets/evkmc-logo.png',
        themeColor: '#0369a1',
        defaultHash: '#/qq/home',
        maintenanceModel: 'masada-qq',
    },
};

const NAV_ICON_SHOP =
    '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
const NAV_ICON_ETM =
    '<path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z" stroke="currentColor" stroke-width="2"/><path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z" stroke="currentColor" stroke-width="2"/><path d="M12 3c0 1-1 2-2 2s-2-1-2-2 1-2 2-2 2 1 2 2z" stroke="currentColor" stroke-width="2"/><path d="M12 21c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2z" stroke="currentColor" stroke-width="2"/>';
const NAV_ICON_DTC =
    '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
const NAV_ICON_WIRING =
    '<path d="M14 18v-2a2 2 0 1 0 -4 0v2" stroke="currentColor" stroke-width="2" /><path d="M7 8h10" stroke="currentColor" stroke-width="2" /><path d="M10 11v-3a2 2 0 1 1 4 0v3" stroke="currentColor" stroke-width="2" /><path d="M17 8v5a2 2 0 0 1 -2 2h-6a2 2 0 0 1 -2 -2v-5" stroke="currentColor" stroke-width="2" />';
const NAV_ICON_TSB =
    '<rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="9" r="2" stroke="currentColor" stroke-width="2"/><path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
const NAV_ICON_BOARD =
    '<path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" stroke="currentColor" stroke-width="2"/>';
const NAV_ICON_ACCOUNT =
    '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>';
const NAV_ICON_ADMIN =
    '<path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';

function boardDropdown(hashPrefix) {
    const p = hashPrefix || '#';
    return {
        type: 'dropdown',
        label: '게시판',
        icon: NAV_ICON_BOARD,
        items: [
            { href: `${p}/notices`, label: '공지사항', icon: NAV_ICON_BOARD },
            {
                href: `${p}/community`,
                label: '커뮤니티',
                icon: '<path d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
            },
        ],
    };
}

/** @param {'van'|'qq'} line */
export function getNavLinksForLine(line) {
    const p = line === LINE_QQ ? '#/qq' : '#';
    const links = [
        { href: `${p}/shop`, label: '정비지침서', icon: NAV_ICON_SHOP },
    ];
    if (line === LINE_VAN) {
        links.push(
            { href: '#/etm', label: '전장회로도', icon: NAV_ICON_ETM },
            { href: '#/dtc', label: 'DTC 매뉴얼', icon: NAV_ICON_DTC },
            { href: '#/wiring', label: '와이어링 커넥터', icon: NAV_ICON_WIRING },
            { href: '#/tsb', label: 'TSB', icon: NAV_ICON_TSB },
        );
    }
    links.push(boardDropdown(line === LINE_QQ ? '#/qq' : '#'));
    links.push(
        { href: `${p}/account`, label: '내 정보', icon: NAV_ICON_ACCOUNT },
        { href: `${p}/admin`, label: '관리자', icon: NAV_ICON_ADMIN, adminOnly: true },
    );
    return links;
}

/** @returns {'van'|'qq'|null} */
export function getProductLine() {
    const v = sessionStorage.getItem(STORAGE_KEY);
    return v === LINE_QQ || v === LINE_VAN ? v : null;
}

/** @param {'van'|'qq'} line */
export function setProductLine(line) {
    if (line !== LINE_VAN && line !== LINE_QQ) return;
    sessionStorage.setItem(STORAGE_KEY, line);
    window.dispatchEvent(new CustomEvent('gsw-product-line-changed', { detail: { line } }));
}

export function clearProductLineForPicker() {
    sessionStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('gsw-product-line-changed', { detail: { line: null } }));
}

/** @param {'van'|'qq'} line */
export function getLineConfig(line) {
    return PRODUCT_LINES[line] || PRODUCT_LINES[LINE_VAN];
}

/**
 * @returns {{
 *   line: 'van'|'qq'|null,
 *   path: string,
 *   param: string|null,
 *   query: Record<string,string>,
 *   fullPath: string,
 *   hashForNav: string,
 * }}
 */
export function parseRouteFromHash(hashInput) {
    let raw = (hashInput || window.location.hash || '').replace(/^#/, '') || '/home';
    const query = {};
    const qIdx = raw.indexOf('?');
    if (qIdx !== -1) {
        const qs = raw.slice(qIdx + 1);
        raw = raw.slice(0, qIdx);
        new URLSearchParams(qs).forEach((v, k) => {
            query[k] = v;
        });
    }

    const segments = raw.split('/').filter(Boolean);
    let line = LINE_VAN;
    let path = '/home';
    let param = null;

    if (segments[0] === 'qq') {
        line = LINE_QQ;
        path = segments[1] ? `/${segments[1]}` : '/home';
        param = segments.length > 2 ? segments.slice(2).join('/') : null;
    } else if (segments[0] === 'portal') {
        line = null;
        path = '/portal';
    } else {
        path = segments[0] ? `/${segments[0]}` : '/home';
        param = segments.length > 1 ? segments.slice(1).join('/') : null;
    }

    const hashForNav =
        line === LINE_QQ
            ? `#/qq${path === '/home' && !segments[1] ? '/home' : path}${param ? `/${param}` : ''}`
            : `#${path}${param ? `/${param}` : ''}`;

    return { line, path, param, query, fullPath: raw, hashForNav };
}

/** @param {string} path @param {'van'|'qq'} [line] */
export function toAppHash(path, line = getProductLine() || LINE_VAN, query = {}) {
    const base = line === LINE_QQ ? `#/qq${path.startsWith('/') ? path : `/${path}`}` : `#${path.startsWith('/') ? path : `/${path}`}`;
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
        if (v != null && v !== '') params.set(k, v);
    });
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
}

/** @param {'van'|'qq'} line */
export function getDocRoutePathsForLine(line) {
    return line === LINE_QQ ? QQ_DOC_PATHS : VAN_DOC_PATHS;
}

/** @param {string} path @param {'van'|'qq'} line */
export function isDocPathAllowedForLine(path, line) {
    return getDocRoutePathsForLine(line).includes(path);
}

/** @param {string} path @param {'van'|'qq'} line */
export function isVanOnlyDocPath(path, line) {
    return line === LINE_QQ && QQ_BLOCKED_DOC_PATHS.includes(path);
}

/**
 * 레거시 북마크 호환
 * @returns {string|null} redirect hash
 */
export function resolveLegacyHashRedirect() {
    const { path, query, line } = parseRouteFromHash(window.location.hash);
    if (path === '/shop' && query.model === 'masada-qq' && line !== LINE_QQ) {
        const next = { doc: query.doc };
        return toAppHash('/shop', LINE_QQ, next);
    }
    if (getProductLine() === LINE_VAN && localStorage.getItem('evkmc-maintenance-model') === 'masada-qq') {
        localStorage.setItem('evkmc-maintenance-model', 'masada-2van');
    }
    return null;
}

/** @param {'van'|'qq'} line */
export function applyProductLineTheme(line) {
    const cfg = getLineConfig(line);
    document.documentElement.setAttribute('data-product-line', line);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', cfg.themeColor);

    const vanSplash = document.getElementById('splash-screen-van');
    const qqSplash = document.getElementById('splash-screen-qq');
    if (vanSplash && qqSplash) {
        vanSplash.classList.toggle('hidden', line !== LINE_VAN);
        qqSplash.classList.toggle('hidden', line !== LINE_QQ);
    }

    const headerLink = document.getElementById('header-brand-link');
    const headerTitle = document.getElementById('header-brand-title');
    if (headerLink) headerLink.href = line === LINE_QQ ? '#/qq/home' : '#/home';
    if (headerTitle) {
        headerTitle.textContent = cfg.headerTitle;
        headerTitle.classList.toggle('text-sky-800', line === LINE_QQ);
    }

    const portalSwitch = document.getElementById('header-portal-switch');
    if (portalSwitch) portalSwitch.classList.remove('hidden');

    if (window.__BRAND__) {
        window.__BRAND__.splashUrl = cfg.splashUrl;
        window.__BRAND__.logoUrl = cfg.logoUrl;
        window.__BRAND__.name = cfg.headerTitle;
    }
}

export function getDefaultHomeHash(line) {
    return getLineConfig(line).defaultHash;
}
