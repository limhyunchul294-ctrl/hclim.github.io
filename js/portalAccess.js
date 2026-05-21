/** 포털 운영 권한 — 관리자(role) vs 수퍼바이저(EK0V029) */

const SUPERVISOR_USERNAME = 'EK0V029';

/** @param {{ role?: string, grade?: string, username?: string } | null | undefined} userInfo */
export function isSupervisorAccount(userInfo) {
    const uname = String(userInfo?.username || '').toUpperCase().trim();
    return uname === SUPERVISOR_USERNAME || String(userInfo?.grade || '').toLowerCase() === 'supervisor';
}

/** @param {{ role?: string } | null | undefined} userInfo */
export function isPortalAdminRole(userInfo) {
    return userInfo?.role === 'admin';
}

/** 관리자 대시보드·운영 메뉴 */
export function canAccessAdminPortal(userInfo) {
    return isPortalAdminRole(userInfo) || isSupervisorAccount(userInfo);
}

/** role=admin 이고 수퍼바이저가 아닌 계정: 등급만 변경 */
export function canManageUserGradesOnWeb(userInfo) {
    return isPortalAdminRole(userInfo) && !isSupervisorAccount(userInfo);
}

/** EK0V029 수퍼바이저만: ID·이메일·역할·등급 (등급값 supervisor는 권한 판별에 사용하지 않음) */
export function canManageUserIdentityOnWeb(userInfo) {
    return String(userInfo?.username || '').toUpperCase().trim() === SUPERVISOR_USERNAME;
}

/** 이용 로그 탭·조회: 수퍼바이저(EK0V029)만 */
export function canViewPortalActivityLogOnWeb(userInfo) {
    return canManageUserIdentityOnWeb(userInfo);
}

/** @param {string | null | undefined} grade */
export function formatUserGradeLabel(grade) {
    const g = String(grade || '').toLowerCase();
    if (g === 'black') return '⚫ 블랙';
    if (g === 'silver') return '⚪ 실버';
    if (g === 'blue') return '🔵 블루';
    if (g === 'supervisor') return '⚫ 블랙';
    return '등급 없음';
}

/** UI 등급 선택지 */
export const ADMIN_EDITABLE_GRADES = ['blue', 'silver', 'black'];

export { SUPERVISOR_USERNAME };
