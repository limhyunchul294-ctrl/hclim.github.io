/** LMS 브릿지 수신 URL (프로덕션 포털에서 localhost 설정 오류 방지) */

export const LMS_BRIDGE_URL_PRODUCTION =
    'https://lms-youtube-testbed.vercel.app/auth/gsw';

export function isLocalHostname(hostname = window.location.hostname) {
    return (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.endsWith('.localhost')
    );
}

export function isLocalLmsBridgeUrl(url) {
    return /localhost|127\.0\.0\.1/i.test(url);
}

/**
 * @param {string} [configured] APP_CONFIG.GSW_LMS_BRIDGE_URL 등
 */
export function resolveLmsBridgeUrl(configured) {
    const raw = (configured || '').trim().replace(/\/$/, '');
    const fallback = LMS_BRIDGE_URL_PRODUCTION;

    if (!raw) return fallback;

    const onProdPortal = !isLocalHostname();
    if (onProdPortal && isLocalLmsBridgeUrl(raw)) {
        console.warn(
            '[GSW] LMS bridge URL points to localhost on production portal; using',
            fallback
        );
        return fallback;
    }

    return raw;
}
