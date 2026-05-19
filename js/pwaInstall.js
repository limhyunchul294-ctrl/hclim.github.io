/**
 * PWA 설치 안내 (Android beforeinstallprompt, iOS 홈 화면 추가)
 */

const DISMISS_KEY = 'evkmc-pwa-install-dismissed';
let deferredInstallPrompt = null;

function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches
        || window.navigator.standalone === true;
}

function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function isAndroid() {
    return /Android/i.test(navigator.userAgent);
}

function dismissInstallUi() {
    try {
        localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch { /* ignore */ }
    document.getElementById('pwa-install-banner')?.remove();
    document.getElementById('pwa-ios-modal')?.remove();
    document.getElementById('pwa-generic-modal')?.remove();
}

function wasDismissedRecently() {
    try {
        const t = Number(localStorage.getItem(DISMISS_KEY) || 0);
        return t && Date.now() - t < 7 * 24 * 60 * 60 * 1000;
    } catch {
        return false;
    }
}

/** @returns {boolean} */
export function canShowPwaInstall() {
    return !isStandalone();
}

/** @returns {boolean} */
export function isPwaInstallReady() {
    return Boolean(deferredInstallPrompt);
}

function showAndroidBanner() {
    if (document.getElementById('pwa-install-banner')) return;

    const bar = document.createElement('div');
    bar.id = 'pwa-install-banner';
    bar.className = 'pwa-install-banner';
    bar.innerHTML = `
        <div class="pwa-install-banner-inner">
            <p class="pwa-install-banner-text"><strong>앱으로 설치</strong> — 홈 화면에서 바로 열기</p>
            <div class="pwa-install-banner-actions">
                <button type="button" id="pwa-install-btn" class="pwa-install-btn-primary">설치</button>
                <button type="button" id="pwa-install-dismiss" class="pwa-install-btn-ghost">나중에</button>
            </div>
        </div>
    `;
    document.body.appendChild(bar);

    document.getElementById('pwa-install-btn')?.addEventListener('click', async () => {
        await triggerNativeInstall();
    });
    document.getElementById('pwa-install-dismiss')?.addEventListener('click', dismissInstallUi);
}

function showIOSGuide() {
    if (document.getElementById('pwa-ios-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'pwa-ios-modal';
    modal.className = 'pwa-ios-modal';
    modal.innerHTML = `
        <div class="pwa-ios-modal-panel" role="dialog" aria-modal="true" aria-labelledby="pwa-ios-title">
            <div class="flex items-center gap-3 mb-4">
                <img src="/assets/icon-192.png" alt="" class="w-14 h-14 rounded-2xl shadow-md" width="56" height="56">
                <div>
                    <h2 id="pwa-ios-title" class="text-lg font-bold text-gray-900">홈 화면에 추가</h2>
                    <p class="text-xs text-gray-500 mt-0.5">EVKMC A/S 정비 포털</p>
                </div>
            </div>
            <ol class="text-sm text-gray-700 space-y-2.5 mb-4 list-decimal list-inside bg-slate-50 rounded-xl p-4">
                <li>Safari 하단 <strong>공유</strong> 버튼 탭</li>
                <li><strong>홈 화면에 추가</strong> 선택</li>
                <li>우측 상단 <strong>추가</strong> 후 아이콘으로 실행</li>
            </ol>
            <button type="button" id="pwa-ios-close" class="w-full min-h-[44px] bg-slate-800 text-white rounded-lg font-medium">확인</button>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('pwa-ios-close')?.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function showGenericGuide() {
    if (document.getElementById('pwa-generic-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'pwa-generic-modal';
    modal.className = 'pwa-ios-modal';
    modal.innerHTML = `
        <div class="pwa-ios-modal-panel" role="dialog" aria-modal="true">
            <div class="flex items-center gap-3 mb-4">
                <img src="/assets/icon-192.png" alt="" class="w-14 h-14 rounded-2xl shadow-md" width="56" height="56">
                <div>
                    <h2 class="text-lg font-bold text-gray-900">홈 화면에 추가</h2>
                    <p class="text-xs text-gray-500 mt-0.5">브라우저 메뉴에서 선택</p>
                </div>
            </div>
            <p class="text-sm text-gray-700 mb-4 leading-relaxed">
                Chrome·Edge: 주소창 옆 <strong>설치</strong> 또는 메뉴 ⋮ → <strong>앱 설치</strong> / <strong>홈 화면에 추가</strong><br>
                Samsung Internet: 메뉴 → <strong>현재 페이지 추가</strong> → <strong>홈 화면</strong>
            </p>
            <button type="button" id="pwa-generic-close" class="w-full min-h-[44px] bg-slate-800 text-white rounded-lg font-medium">확인</button>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('pwa-generic-close')?.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

/** @returns {Promise<boolean>} */
export async function triggerNativeInstall() {
    if (!deferredInstallPrompt) return false;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    dismissInstallUi();
    updateLoginPwaTileState();
    return true;
}

/**
 * 홈 화면 추가 / 앱 설치 플로우 (로그인·메인 공통)
 */
export async function openPwaInstallFlow() {
    if (isStandalone()) {
        return { handled: false, reason: 'already_installed' };
    }

    if (deferredInstallPrompt) {
        const ok = await triggerNativeInstall();
        if (ok) return { handled: true };
        showAndroidBanner();
        return { handled: true };
    }

    if (isIOS()) {
        showIOSGuide();
        return { handled: true };
    }

    showGenericGuide();
    return { handled: true };
}

async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    try {
        await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    } catch (e) {
        console.warn('SW register failed', e);
    }
}

function wireHelpButton() {
    document.getElementById('pwa-help-btn')?.addEventListener('click', () => openPwaInstallFlow());
}

function updateLoginPwaTileState() {
    const tile = document.getElementById('pwa-add-tile');
    const badge = document.getElementById('pwa-add-tile-badge');
    if (!tile) return;

    if (isStandalone()) {
        tile.hidden = true;
        return;
    }

    tile.hidden = false;
    if (!badge) return;

    if (deferredInstallPrompt) {
        badge.textContent = '탭하여 설치';
        badge.className = 'pwa-add-tile-badge pwa-add-tile-badge-ready';
    } else if (isIOS()) {
        badge.textContent = 'Safari에서 추가';
        badge.className = 'pwa-add-tile-badge';
    } else {
        badge.textContent = '바로가기 만들기';
        badge.className = 'pwa-add-tile-badge';
    }
}

/** 로그인 페이지: 아이콘 타일 */
export function initLoginPwaAddTile() {
    const tile = document.getElementById('pwa-add-tile');
    if (!tile) return;

    updateLoginPwaTileState();
    tile.addEventListener('click', () => openPwaInstallFlow());
}

/**
 * @param {{ autoAndroidBanner?: boolean, autoIosGuide?: boolean, autoIosDelayMs?: number }} [options]
 */
export function initPwaInstall(options = {}) {
    const {
        autoAndroidBanner = true,
        autoIosGuide = true,
        autoIosDelayMs = 2500,
    } = options;

    registerServiceWorker();
    wireHelpButton();
    initLoginPwaAddTile();

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredInstallPrompt = e;
        updateLoginPwaTileState();
        if (autoAndroidBanner && isAndroid() && !wasDismissedRecently()) {
            showAndroidBanner();
        }
    });

    if (isStandalone() || wasDismissedRecently()) {
        updateLoginPwaTileState();
        return;
    }

    if (autoIosGuide && isIOS() && !document.getElementById('pwa-add-tile')) {
        setTimeout(showIOSGuide, autoIosDelayMs);
    }
}
