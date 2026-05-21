/**
 * 모바일 UX: 하단 탭, 문서 목차 드로어, 최근 문서, QQ 챕터 이동
 */

import { getProductLine, LINE_QQ, LINE_VAN, toAppHash, parseRouteFromHash } from './productLine.js';

const RECENT_DOC_KEY = 'evkmc-recent-doc';
const QQ_DOC_IDS = [];

export function isMobileViewport() {
    return window.matchMedia('(max-width: 767px)').matches;
}

export function isMobileUserAgent() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function isMobileExperience() {
    return isMobileViewport() || isMobileUserAgent();
}

/** @param {{ path: string, docId?: string, title?: string, model?: string, docTitle?: string, productLine?: string }} data */
export function saveRecentDoc(data) {
    try {
        const line = data.productLine || getProductLine() || LINE_VAN;
        localStorage.setItem(
            RECENT_DOC_KEY,
            JSON.stringify({ ...data, productLine: line, savedAt: Date.now() }),
        );
    } catch (e) {
        console.warn('recent doc save failed', e);
    }
}

export function loadRecentDoc() {
    try {
        const raw = localStorage.getItem(RECENT_DOC_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function registerQQDocIds(ids) {
    QQ_DOC_IDS.length = 0;
    ids.forEach((id) => QQ_DOC_IDS.push(id));
}

export function getAdjacentQQDocId(docId, direction) {
    const idx = QQ_DOC_IDS.indexOf(docId);
    if (idx === -1) return null;
    const next = idx + (direction === 'next' ? 1 : -1);
    if (next < 0 || next >= QQ_DOC_IDS.length) return null;
    return QQ_DOC_IDS[next];
}

export function parseHashWithQuery() {
    const parsed = parseRouteFromHash(window.location.hash);
    return { path: parsed.path, fullHash: parsed.fullPath, query: parsed.query, line: parsed.line };
}

function syncMobileTabHrefs(nav) {
    const line = getProductLine() || LINE_VAN;
    const home = toAppHash('/home', line);
    const shop = toAppHash('/shop', line, line === LINE_VAN ? {} : {});
    const warranty = toAppHash('/warranty', line);
    const account = toAppHash('/account', line);
    const map = { home, shop, warranty, account };
    nav.querySelectorAll('[data-mobile-tab]').forEach((el) => {
        const tab = el.getAttribute('data-mobile-tab');
        if (map[tab]) el.setAttribute('href', map[tab]);
    });
}

export function initMobileBottomNav() {
    const nav = document.getElementById('mobile-bottom-nav');
    if (!nav) return;

    const syncActive = () => {
        syncMobileTabHrefs(nav);
        const parsed = parseRouteFromHash(window.location.hash);
        const base = parsed.path.replace(/^\//, '') || 'home';

        nav.querySelectorAll('[data-mobile-tab]').forEach((el) => {
            const tab = el.getAttribute('data-mobile-tab');
            const active =
                tab === base ||
                (tab === 'home' && (base === 'home' || parsed.path === '/portal'));
            el.classList.toggle('mobile-tab-active', active);
            el.setAttribute('aria-current', active ? 'page' : 'false');
        });

        const docBases =
            parsed.line === LINE_QQ ? ['shop'] : ['shop', 'etm', 'dtc', 'wiring', 'tsb'];
        document.body.classList.toggle('mobile-doc-route', docBases.includes(base));
    };

    window.addEventListener('hashchange', syncActive);
    window.addEventListener('gsw-product-line-changed', syncActive);
    syncActive();
}

export function initDocPageMobile() {
    const page = document.querySelector('.doc-page');
    if (!page || !isMobileViewport()) return;

    document.body.classList.remove('doc-mobile-toc-open', 'doc-mobile-viewer-mode');

    const toggleToc = document.getElementById('doc-toc-toggle');
    const closeToc = document.getElementById('doc-toc-close');
    const backdrop = document.getElementById('doc-toc-backdrop');
    const backToToc = document.getElementById('doc-back-to-toc');

    const openToc = () => {
        document.body.classList.add('doc-mobile-toc-open');
        document.body.classList.remove('doc-mobile-viewer-mode');
    };
    const closeTocPanel = () => {
        document.body.classList.remove('doc-mobile-toc-open');
    };

    toggleToc?.addEventListener('click', openToc);
    closeToc?.addEventListener('click', closeTocPanel);
    backdrop?.addEventListener('click', closeTocPanel);
    backToToc?.addEventListener('click', () => {
        document.body.classList.remove('doc-mobile-viewer-mode');
        openToc();
    });

    window.enterDocMobileViewerMode = () => {
        if (!isMobileViewport()) return;
        document.body.classList.add('doc-mobile-viewer-mode');
        document.body.classList.remove('doc-mobile-toc-open');
    };
}

export function renderResumeDocCardHtml() {
    const recent = loadRecentDoc();
    if (!recent || !recent.path) return '';

    const line = recent.productLine || (recent.model === 'masada-qq' ? LINE_QQ : LINE_VAN);
    const label = recent.docTitle || recent.title || '문서';
    const modelLabel = line === LINE_QQ ? ' · MASADA QQ' : '';
    const query = {};
    if (recent.docId) query.doc = recent.docId;
    if (recent.path === '/shop' && line === LINE_VAN && recent.model) {
        query.model = recent.model;
    }
    const href = toAppHash(recent.path, line, query);

    return `
        <a href="${href}" class="block mb-6 p-4 bg-gradient-to-r from-sky-50 to-white rounded-xl border border-sky-200 shadow-sm active:bg-sky-100">
            <p class="text-xs font-semibold text-sky-700 mb-1">이어서 보기</p>
            <p class="text-base font-semibold text-gray-900">${label}${modelLabel}</p>
            <p class="text-xs text-gray-500 mt-1">탭하여 바로 열기</p>
        </a>
    `;
}

export function tryOpenDocFromHash() {
    const hash = window.location.hash || '';
    const m = hash.match(/[#&?]doc=([^&]+)/);
    if (!m) return;
    const docId = decodeURIComponent(m[1]);
    setTimeout(() => {
        const item = document.querySelector(`.tree-item[data-id="${docId}"]`);
        if (item) item.click();
    }, 400);
}
