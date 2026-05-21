/** 포털 계통 선택 (#/portal) */

import {
    LINE_VAN,
    LINE_QQ,
    PRODUCT_LINES,
    setProductLine,
    getDefaultHomeHash,
} from './productLine.js';
import { showEntrySplashForLine } from './lineSplash.js';

function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

export function renderPortalPickerPageHtml() {
    return `
        <div class="max-w-3xl mx-auto p-4 md:p-8" id="portal-picker-root">
            <div class="text-center mb-8">
                <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2">포털 선택</h1>
                <p class="text-gray-600">작업 중인 차량 계통에 맞는 포털을 선택하세요.</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <button type="button" id="portal-pick-van" class="portal-pick-card text-left p-6 md:p-8 bg-white rounded-2xl border-2 border-slate-200 hover:border-slate-800 shadow-soft transition-all">
                    <p class="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">MASADA VAN</p>
                    <h2 class="text-xl font-bold text-gray-900 mb-2">${escapeHtml(PRODUCT_LINES[LINE_VAN].label)}</h2>
                    <p class="text-sm text-gray-600 mb-4">2VAN · 4VAN · Cargo(Pick-up)<br>정비지침서 · ETM · DTC · TSB · 와이어링</p>
                    <span class="inline-block px-3 py-1.5 rounded-lg bg-slate-800 text-white text-sm font-medium">VAN 포털 입장 →</span>
                </button>
                <button type="button" id="portal-pick-qq" class="portal-pick-card text-left p-6 md:p-8 bg-white rounded-2xl border-2 border-sky-200 hover:border-sky-600 shadow-soft transition-all">
                    <p class="text-xs font-bold uppercase tracking-wide text-sky-600 mb-2">MASADA QQ</p>
                    <h2 class="text-xl font-bold text-sky-900 mb-2">${escapeHtml(PRODUCT_LINES[LINE_QQ].label)}</h2>
                    <p class="text-sm text-gray-600 mb-4">QQ 전용 정비지침서<br>보증 · 공지 · 커뮤니티 · 현장 노트</p>
                    <span class="inline-block px-3 py-1.5 rounded-lg bg-sky-600 text-white text-sm font-medium">QQ 포털 입장 →</span>
                </button>
            </div>
            <p class="text-center text-xs text-gray-500 mt-6">언제든 상단 메뉴의 「다른 포털」에서 변경할 수 있습니다.</p>
        </div>
    `;
}

/** @param {'van'|'qq'} line */
export function enterPortalLine(line) {
    if (line !== LINE_VAN && line !== LINE_QQ) return;

    const vanBtn = document.getElementById('portal-pick-van');
    const qqBtn = document.getElementById('portal-pick-qq');
    vanBtn?.setAttribute('disabled', 'true');
    qqBtn?.setAttribute('disabled', 'true');

    setProductLine(line);
    showEntrySplashForLine(line, () => {
        window.location.hash = getDefaultHomeHash(line);
    });
}

export function mountPortalPickerPage() {
    document.getElementById('portal-pick-van')?.addEventListener('click', () => enterPortalLine(LINE_VAN));
    document.getElementById('portal-pick-qq')?.addEventListener('click', () => enterPortalLine(LINE_QQ));
}

/** main-content 위임 클릭 (라우터 렌더 지연 대비) */
export function handlePortalPickerClick(event) {
    if (event.target.closest('#portal-pick-van')) {
        event.preventDefault();
        enterPortalLine(LINE_VAN);
        return true;
    }
    if (event.target.closest('#portal-pick-qq')) {
        event.preventDefault();
        enterPortalLine(LINE_QQ);
        return true;
    }
    return false;
}
