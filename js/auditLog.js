// 플래그 세션 시작·경로 변경 등 활동 로그를 Supabase에 적재합니다. 실패해도 UX를 막지 않습니다.

const ROUTE_DEBOUNCE_MS = 2000;
const SESSION_START_FLAG = 'gsw-portal-activity-session-start';

/** @param {unknown} payload */
function safePayload(payload) {
    if (payload == null) return {};
    if (typeof payload === 'object' && payload !== null && !Array.isArray(payload)) return /** @type {Record<string, unknown>} */ (payload);
    return { value: payload };
}

/** @typedef {{ eventType: string, resourceCategory?: string | null, resourceKey?: string | null, payload?: Record<string, unknown> }} PortalActivityOpts */

/** @param {PortalActivityOpts} opts */
export async function logPortalActivity({ eventType, resourceCategory = null, resourceKey = null, payload = {} }) {
    try {
        if (!window.supabaseClient?.from || !eventType) return false;

        const { data: { user }, error: userError } = await window.supabaseClient.auth.getUser();
        if (userError || !user?.id) return false;

        const row = {
            event_type: eventType,
            resource_category: resourceCategory,
            resource_key: resourceKey == null ? null : String(resourceKey).slice(0, 512),
            payload: safePayload(payload),
        };

        const { error } = await window.supabaseClient.from('portal_activity_log').insert(row);
        if (error) {
            console.warn('[portal_activity_log]', error.message || error);
            return false;
        }
        return true;
    } catch (e) {
        console.warn('[portal_activity_log]', e);
        return false;
    }
}

let lastRouteKey = '';
let lastRouteLoggedAt = 0;

/** 해시 라우트 기준 디바운스된 route_view (동일 라벨 단기 중복 무시) */
export function logRouteViewDebounced(routeFull) {
    const key = typeof routeFull === 'string' && routeFull.trim() ? routeFull.trim() : '/home';
    const now = Date.now();
    if (key === lastRouteKey && now - lastRouteLoggedAt < ROUTE_DEBOUNCE_MS) return;
    lastRouteKey = key;
    lastRouteLoggedAt = now;
    void logPortalActivity({
        eventType: 'route_view',
        resourceCategory: 'nav',
        resourceKey: key.slice(0, 512),
        payload: {},
    });
}

/** 브라우저 세션(storage)당 1회 session_start — INSERT 성공 시에만 플래그 저장 */
export function logSessionStartOnce() {
    try {
        if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(SESSION_START_FLAG)) {
            return;
        }
    } catch {
        // sessionStorage 차단 시에도 1회 시도
    }
    void logPortalActivity({
        eventType: 'session_start',
        resourceCategory: 'auth',
        payload: {},
    }).then((ok) => {
        if (!ok) return;
        try {
            if (typeof sessionStorage !== 'undefined') {
                sessionStorage.setItem(SESSION_START_FLAG, '1');
            }
        } catch {
            /* ignore */
        }
    });
}
