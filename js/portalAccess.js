/** 포털 운영 권한(관리자 role / 수퍼바이저 grade) — UI·라우트에서 공통 사용 */

const SUPERVISOR_USERNAME = 'EK0V029';

/** @param {{ role?: string, grade?: string, username?: string } | null | undefined} userInfo */
export function isSupervisorGrade(userInfo) {
    return String(userInfo?.grade || '').toLowerCase() === 'supervisor';
}

/** @param {{ role?: string, grade?: string } | null | undefined} userInfo */
export function isPortalAdminRole(userInfo) {
    return userInfo?.role === 'admin';
}

/** 관리자 대시보드·운영 메뉴 접근 */
export function canAccessAdminPortal(userInfo) {
    return isPortalAdminRole(userInfo) || isSupervisorGrade(userInfo);
}

/** 웹에서 타 사용자 등급(blue/silver/black) 변경 */
export function canManageUserGradesOnWeb(userInfo) {
    return isPortalAdminRole(userInfo);
}

/** @param {string | null | undefined} grade */
export function formatUserGradeLabel(grade) {
    const g = String(grade || '').toLowerCase();
    if (g === 'supervisor') return '🔶 수퍼바이저';
    if (g === 'black') return '⚫ 블랙';
    if (g === 'silver') return '⚪ 실버';
    if (g === 'blue') return '🔵 블루';
    return '등급 없음';
}

/** UI 등급 선택지(수퍼바이저 제외) */
export const ADMIN_EDITABLE_GRADES = ['blue', 'silver', 'black'];

export { SUPERVISOR_USERNAME };
