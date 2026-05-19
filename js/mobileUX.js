/**
 * 모바일 UX: 하단 탭, 문서 목차 드로어, 최근 문서, QQ 챕터 이동
 */

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

/** @param {{ path: string, docId?: string, title?: string, model?: string, docTitle?: string }} data */
export function saveRecentDoc(data) {
    try {
        localStorage.setItem(RECENT_DOC_KEY, JSON.stringify({ ...data, savedAt: Date.now() }));
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
    let hash = (window.location.hash || '').replace(/^#/, '') || '/home';
    const query = {};
    const qIdx = hash.indexOf('?');
    if (qIdx !== -1) {
        const qs = hash.slice(qIdx + 1);
        hash = hash.slice(0, qIdx);
        new URLSearchParams(qs).forEach((v, k) => { query[k] = v; });
    }
    return { path: hash.split('/').filter(Boolean).length ? `/${hash.split('/').filter(Boolean)[0]}` : hash, fullHash: hash, query };
}

export function initMobileBottomNav() {
    const nav = document.getElementById('mobile-bottom-nav');
    if (!nav) return;

    const syncActive = () => {
        let path = window.location.hash.replace('#', '') || '/home';
        const q = path.indexOf('?');
        if (q !== -1) path = path.slice(0, q);
        if (!path.startsWith('/')) path = `/${path}`;
        const base = path.split('/')[1] || 'home';

        nav.querySelectorAll('[data-mobile-tab]').forEach((el) => {
            const tab = el.getAttribute('data-mobile-tab');
            const active = tab === base || (tab === 'home' && (base === 'home' || path === '/'));
            el.classList.toggle('mobile-tab-active', active);
            el.setAttribute('aria-current', active ? 'page' : 'false');
        });

        document.body.classList.toggle('mobile-doc-route', ['shop', 'etm', 'dtc', 'wiring', 'tsb'].includes(base));
    };

    window.addEventListener('hashchange', syncActive);
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

    const label = recent.docTitle || recent.title || '문서';
    const modelLabel = recent.model === 'masada-qq' ? ' · MASADA QQ' : '';
    const basePath = recent.path.startsWith('/') ? recent.path : `/${recent.path}`;
    const href = recent.docId
        ? `#${basePath}?model=${encodeURIComponent(recent.model || '')}&doc=${encodeURIComponent(recent.docId)}`
        : `#${basePath}`;

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
    const m = hash.match(/[#&]doc=([^&]+)/);
    if (!m) return;
    const docId = decodeURIComponent(m[1]);
    setTimeout(() => {
        const item = document.querySelector(`.tree-item[data-id="${docId}"]`);
        if (item) item.click();
    }, 400);
}
