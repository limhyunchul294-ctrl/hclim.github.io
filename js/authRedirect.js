/**
 * PWA·매직링크: 로그인 페이지 ↔ 앱(index) 전환
 */

export function isAuthCallbackHash() {
    const raw = window.location.hash?.substring(1) || '';
    if (!raw) return false;
    const params = new URLSearchParams(raw);
    return params.has('access_token') || params.has('error');
}

/** index 등에서 매직링크 hash → login.html로 넘겨 동일 플로우 처리 */
export function redirectAuthHashToLoginIfNeeded() {
    if (!isAuthCallbackHash()) return false;
    const path = window.location.pathname || '';
    if (path.endsWith('/login.html') || path.endsWith('login.html') || path === '/login') {
        return false;
    }
    window.location.replace(`${window.location.origin}/login.html${window.location.hash}`);
    return true;
}

export function getLoginRedirectUrl() {
    return `${window.location.origin}/login.html`;
}

export function goToAppHome() {
    window.location.replace(`${window.location.origin}/index.html#/home`);
}

/** 이미 로그인된 경우 앱 홈으로 (매직링크 콜백 hash 있을 때는 제외) */
export async function redirectToAppHomeIfLoggedIn(supabaseClient) {
    if (isAuthCallbackHash()) return false;
    if (!supabaseClient) return false;

    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) return false;

    if (window.authSession) {
        window.authSession._sessionCache = session;
        window.authSession._lastFetchTime = Date.now();
    }
    goToAppHome();
    return true;
}
