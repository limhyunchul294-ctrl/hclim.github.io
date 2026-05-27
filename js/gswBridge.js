/**
 * GSW 포털 → LMS 교육 센터 브릿지 (서명 토큰 발급 후 redirect)
 */

function bridgeConfig() {
    const cfg = window.APP_CONFIG || {};
    return {
        lmsBridgeUrl: (cfg.GSW_LMS_BRIDGE_URL || '').replace(/\/$/, ''),
        allowDev: cfg.GSW_BRIDGE_ALLOW_DEV === true || cfg.GSW_BRIDGE_ALLOW_DEV === 'true',
        bridgeOnly: cfg.GSW_BRIDGE_ONLY === true || cfg.GSW_BRIDGE_ONLY === 'true',
    };
}

function buildRedirectUrl(baseUrl, token) {
    const sep = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${sep}token=${encodeURIComponent(token)}`;
}

/**
 * 로그인 사용자 → LMS bridge URL로 이동
 */
export async function redirectToLmsEducationCenter() {
    const { lmsBridgeUrl } = bridgeConfig();
    if (!lmsBridgeUrl) {
        window.showToast?.('LMS 브릿지 URL이 설정되지 않았습니다. (VITE_GSW_LMS_BRIDGE_URL)', 'error');
        return;
    }

    const session = await window.authSession?.getSession();
    const accessToken = session?.access_token;
    if (!accessToken) {
        window.showToast?.('로그인이 필요합니다.', 'error');
        window.location.href = 'login.html';
        return;
    }

    let res;
    try {
        res = await fetch('/api/gsw-bridge-token', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
    } catch (err) {
        console.error('LMS bridge fetch failed:', err);
        window.showToast?.('교육 센터 연결에 실패했습니다. 네트워크를 확인해 주세요.', 'error');
        return;
    }

    const contentType = res.headers.get('content-type') || '';
    const body = contentType.includes('application/json')
        ? await res.json().catch(() => ({}))
        : {};
    if (!res.ok) {
        let msg = body?.error || `브릿지 토큰 발급 실패 (${res.status})`;
        if (res.status === 500 && msg.includes('GSW_BRIDGE_SECRET')) {
            msg = '교육 센터 연동 미설정(GSW_BRIDGE_SECRET). Vercel 환경 변수를 확인해 주세요.';
        } else if (res.status === 403) {
            msg = '포털 계정에 이메일이 없어 LMS로 연결할 수 없습니다. 관리자에게 문의하세요.';
        } else if (!contentType.includes('application/json')) {
            msg = '교육 센터 API에 연결할 수 없습니다. (로컬 개발 시 npm run dev:vercel 사용)';
        }
        console.error('LMS bridge token error:', res.status, body);
        window.showToast?.(msg, 'error');
        return;
    }

    if (!body?.token) {
        window.showToast?.('브릿지 토큰을 받지 못했습니다.', 'error');
        return;
    }

    window.location.href = buildRedirectUrl(lmsBridgeUrl, body.token);
}

export function isGswBridgeAllowDev() {
    return bridgeConfig().allowDev;
}

export function isGswBridgeOnlyLogin() {
    return bridgeConfig().bridgeOnly;
}

export function mountGswBridgeLoginUi(container) {
    if (!container) return;

    const { allowDev, bridgeOnly } = bridgeConfig();

    if (bridgeOnly) {
        const emailBtn = document.getElementById('email-login-btn');
        const phoneBlock = document.querySelector('#login-container .bg-gray-50.border');
        const divider = document.querySelector('#login-container .relative.my-6');
        emailBtn?.classList.add('hidden');
        phoneBlock?.classList.add('hidden');
        divider?.classList.add('hidden');

        let banner = document.getElementById('gsw-bridge-only-banner');
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'gsw-bridge-only-banner';
            banner.className = 'mb-4 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900';
            banner.innerHTML =
                '<p class="font-semibold mb-1">포털 전용 로그인</p><p>이 환경에서는 GSW 포털을 통해서만 접속할 수 있습니다. 포털에서 「교육 센터」로 이동해 주세요.</p>';
            container.insertBefore(banner, container.firstChild?.nextSibling || container.firstChild);
        }
    }

    if (allowDev) {
        let demo = document.getElementById('gsw-bridge-demo-btn');
        if (!demo) {
            demo = document.createElement('a');
            demo.id = 'gsw-bridge-demo-btn';
            demo.href = '/api/gsw-bridge-demo';
            demo.className =
                'mt-4 block w-full py-3 rounded-xl border-2 border-dashed border-amber-400 bg-amber-50 text-amber-900 hover:bg-amber-100 transition-colors font-medium text-center';
            demo.textContent = 'GSW 브릿지 데모 (개발)';
            demo.setAttribute('aria-label', 'GSW 브릿지 데모 — LMS 테스트용');
            const footer = container.querySelector('footer');
            if (footer) {
                container.insertBefore(demo, footer);
            } else {
                container.appendChild(demo);
            }
        }
    }
}
