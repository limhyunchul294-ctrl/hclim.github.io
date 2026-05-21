/** 문서·TSB 등급(blue/silver/black) 접근 제어 */

const GRADE_RANK = { none: 0, blue: 1, silver: 2, black: 3, supervisor: 3 };

/** @param {string|null|undefined} grade */
export function gradeRank(grade) {
    const g = String(grade || 'blue').toLowerCase();
    return GRADE_RANK[g] ?? 1;
}

/**
 * @param {string|null|undefined} userGrade
 * @param {string|null|undefined} minGrade
 */
export function canAccessByGrade(userGrade, minGrade = 'blue') {
    return gradeRank(userGrade) >= gradeRank(minGrade || 'blue');
}

/** @param {string|null|undefined} minGrade */
export function gradeRequirementLabel(minGrade) {
    const g = String(minGrade || 'blue').toLowerCase();
    if (g === 'black') return '블랙 등급 이상';
    if (g === 'silver') return '실버 등급 이상';
    return '블루 등급 이상';
}
