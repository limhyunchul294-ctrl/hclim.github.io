/**
 * 계통(VAN/QQ) 입장 스플래시 — 포털 선택 직후 5초 표시
 */

import { LINE_VAN, LINE_QQ, applyProductLineTheme } from './productLine.js';

export const ENTRY_SPLASH_MS = 5000;

let entrySplashTimer = null;

function getSplashEls() {
    return {
        van: document.getElementById('splash-screen-van'),
        qq: document.getElementById('splash-screen-qq'),
    };
}

/** 포털 선택 화면: 스플래시 숨김 */
export function hideAllEntrySplashes() {
    if (entrySplashTimer) {
        clearTimeout(entrySplashTimer);
        entrySplashTimer = null;
    }
    const { van, qq } = getSplashEls();
    [van, qq].forEach((el) => {
        if (!el) return;
        el.classList.add('hidden');
        el.style.display = 'none';
        el.style.opacity = '0';
    });
}

/**
 * @param {'van'|'qq'} line
 * @param {() => void} onDone
 */
export function showEntrySplashForLine(line, onDone) {
    if (entrySplashTimer) clearTimeout(entrySplashTimer);

    const { van, qq } = getSplashEls();
    const target = line === LINE_QQ ? qq : van;
    const other = line === LINE_QQ ? van : qq;

    applyProductLineTheme(line);

    if (other) {
        other.classList.add('hidden');
        other.style.display = 'none';
        other.style.opacity = '0';
    }
    if (target) {
        target.classList.remove('hidden');
        target.style.display = 'flex';
        target.style.opacity = '1';
    }

    entrySplashTimer = setTimeout(() => {
        entrySplashTimer = null;
        if (target) {
            target.style.opacity = '0';
            setTimeout(() => {
                target.style.display = 'none';
                target.classList.add('hidden');
            }, 400);
        }
        onDone?.();
    }, ENTRY_SPLASH_MS);
}

export function isEntrySplashVisible() {
    return !!entrySplashTimer;
}
