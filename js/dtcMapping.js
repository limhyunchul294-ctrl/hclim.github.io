/**
 * DTC 매뉴얼 — 목차·조회 (데이터: dtcData.js)
 */

import { DTC_ENTRIES, DTC_META, DTC_STORAGE_BUCKET } from './dtcData.js';

/**
 * @typedef {Object} DtcWiringStep
 * @property {string} condition
 * @property {string} target
 * @property {string} terminal_1
 * @property {string} terminal_2
 * @property {string} normal
 */

/**
 * @typedef {Object} DtcEntry
 * @property {string} code
 * @property {string} codeDisplay
 * @property {string} title
 * @property {string} category
 * @property {string} explanation
 * @property {string[]} suspected_parts
 * @property {DtcWiringStep[]} wiring_steps
 * @property {{ cause: string, action: string }[] | null} causes
 * @property {string[]} imageKeys
 */

export function formatDtcCode(raw) {
    const digits = String(raw ?? '').replace(/\D/g, '');
    if (!digits) return '';
    return `E-${digits.padStart(4, '0')}`;
}

function entryToLeaf(entry) {
    const shortTitle = entry.title.length > 42 ? `${entry.title.slice(0, 42)}…` : entry.title;
    return {
        id: `dtc-${entry.code}`,
        label: `${entry.codeDisplay} ${shortTitle}`,
        type: 'dtc',
    };
}

function buildDtcTreeData() {
    const categories = [...new Set(DTC_ENTRIES.map((e) => e.category).filter(Boolean))];
    const order = [
        '구동 시스템 (MCU & 모터)',
        '고전압 배터리 시스템 (HVB & BMS)',
        '충전 및 전력 변환 시스템 (OBC & DC-DC)',
        '차량 제어 및 편의/샤시 시스템 (VCU, 브레이크, 조향 등)',
        '기타',
    ];
    categories.sort((a, b) => {
        const ia = order.indexOf(a);
        const ib = order.indexOf(b);
        if (ia === -1 && ib === -1) return a.localeCompare(b, 'ko');
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
    });

    return categories.map((cat, idx) => ({
        id: `dtc-cat-${idx}`,
        label: `■ ${cat}`,
        type: 'folder',
        children: DTC_ENTRIES.filter((e) => e.category === cat)
            .sort((a, b) => Number(a.code) - Number(b.code))
            .map(entryToLeaf),
    })).filter((g) => g.children.length > 0);
}

function buildDtcById() {
    /** @type {Record<string, DtcEntry & { id: string }>} */
    const map = {};
    for (const entry of DTC_ENTRIES) {
        map[`dtc-${entry.code}`] = { ...entry, id: `dtc-${entry.code}` };
    }
    return map;
}

const dtcTreeData = buildDtcTreeData();
const dtcById = buildDtcById();

/**
 * @param {string} id - 예: dtc-420
 * @returns {(DtcEntry & { id: string }) | null}
 */
function getDtcEntry(id) {
    return dtcById[id] || null;
}

function entrySearchText(entry) {
    const parts = [
        entry.code,
        entry.codeDisplay,
        entry.title,
        entry.category,
        entry.explanation,
        ...(entry.suspected_parts || []),
    ];
    if (entry.wiring_steps?.length) {
        for (const w of entry.wiring_steps) {
            parts.push(w.condition, w.target, w.terminal_1, w.terminal_2, w.normal);
        }
    }
    if (entry.causes?.length) {
        for (const c of entry.causes) {
            parts.push(c.cause, c.action);
        }
    }
    return parts.filter(Boolean).join(' ').toLowerCase();
}

/**
 * @param {string} query
 * @returns {string[]} dtc id 목록
 */
function searchDtc(query) {
    const q = (query || '').trim().toLowerCase();
    if (!q) return [];
    const qDigits = q.replace(/\D/g, '');
    const results = [];

    for (const entry of DTC_ENTRIES) {
        const id = `dtc-${entry.code}`;
        const haystack = entrySearchText(entry);

        const codeMatch =
            qDigits &&
            (entry.code.includes(qDigits) || entry.codeDisplay.toLowerCase().includes(q));

        if (codeMatch || haystack.includes(q)) {
            results.push(id);
        }
    }
    return results;
}

/**
 * 조치 문자열의 ">" 를 단계 배열로 분리
 * @param {string} action
 * @returns {string[]}
 */
function parseActionSteps(action) {
    if (!action || action === '—') return [];
    return action
        .split(/\s*>\s*/)
        .map((s) => s.trim())
        .filter(Boolean);
}

export {
    DTC_META,
    DTC_ENTRIES,
    DTC_STORAGE_BUCKET,
    dtcTreeData,
    dtcById,
    getDtcEntry,
    searchDtc,
    parseActionSteps,
};

if (typeof window !== 'undefined') {
    window.dtcTreeData = dtcTreeData;
    window.dtcById = dtcById;
}
