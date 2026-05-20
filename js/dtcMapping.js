/**
 * DTC 매뉴얼 — 목차·조회 (데이터: dtcData.js)
 */

import { DTC_ENTRIES, DTC_META } from './dtcData.js';

/** @typedef {{ code: string, codeDisplay: string, title: string, causes: { cause: string, action: string }[] }} DtcEntry */

const DTC_GROUPS = [
    { id: 'dtc-grp-4', prefix: '4', label: '400번대 - 구동·모터' },
    { id: 'dtc-grp-5', prefix: '5', label: '500번대 - 배터리·고전압' },
    { id: 'dtc-grp-6', prefix: '6', label: '600번대 - OBC·충전' },
    { id: 'dtc-grp-7', prefix: '7', label: '700번대 - 페달·차체 센서' },
];

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
    return DTC_GROUPS.map((grp) => ({
        id: grp.id,
        label: `■ ${grp.label}`,
        type: 'folder',
        children: DTC_ENTRIES.filter((e) => e.code.startsWith(grp.prefix))
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
        const haystack = [
            entry.code,
            entry.codeDisplay,
            entry.title,
            ...entry.causes.flatMap((c) => [c.cause, c.action]),
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

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
