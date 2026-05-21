/** 통합 검색 인덱스 (DTC·TSB·SM 트리 라벨) */

import { DTC_ENTRIES, searchDtc } from './dtcMapping.js';
import { maintenanceManualTreeData } from './maintenanceManualMapping.js';
import { qqMaintenanceManualTreeData } from './maintenanceManualMappingQQ.js';
import { etmTreeData } from './etmMapping.js';
import { fetchTsbBulletins } from './tsbBulletins.js';

function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/** @param {object[]} nodes @param {string} prefix */
function flattenTree(nodes, prefix, kind, hrefBase) {
    const out = [];
    for (const n of nodes || []) {
        const label = prefix ? `${prefix} › ${n.label}` : n.label;
        if (n.type === 'pdf' || n.type === 'folder') {
            if (n.type === 'pdf') {
                out.push({
                    kind,
                    label: n.label,
                    path: label,
                    href: `${hrefBase}${hrefBase.includes('?') ? '&' : '?'}doc=${encodeURIComponent(n.id)}`,
                    nodeId: n.id,
                });
            }
            if (n.children?.length) {
                out.push(...flattenTree(n.children, label, kind, hrefBase));
            }
        }
    }
    return out;
}

let cachedIndex = null;

export function buildUnifiedSearchIndex() {
    if (cachedIndex) return cachedIndex;
    const items = [];

    for (const entry of DTC_ENTRIES) {
        items.push({
            kind: 'dtc',
            label: `${entry.codeDisplay} ${entry.title}`,
            path: entry.category || 'DTC',
            href: `#/dtc/${encodeURIComponent(entry.id)}`,
            nodeId: entry.id,
            searchText: `${entry.codeDisplay} ${entry.title} ${entry.category || ''}`.toLowerCase(),
        });
    }

    flattenTree(maintenanceManualTreeData, '', 'sm', '#/shop').forEach((x) => {
        items.push({ ...x, searchText: `${x.label} ${x.path}`.toLowerCase() });
    });
    flattenTree(qqMaintenanceManualTreeData, 'QQ', 'sm', '#/shop?model=masada-qq').forEach((x) => {
        items.push({ ...x, searchText: `${x.label} ${x.path}`.toLowerCase() });
    });
    flattenTree(etmTreeData, '', 'etm', '#/etm').forEach((x) => {
        items.push({ ...x, searchText: `${x.label} ${x.path}`.toLowerCase() });
    });

    cachedIndex = items;
    return items;
}

/**
 * @param {string} query
 * @param {number} [limit]
 */
export function searchUnifiedIndex(query, limit = 20) {
    const q = (query || '').trim().toLowerCase();
    if (!q) return [];
    const dtcIds = new Set(searchDtc(q));
    const index = buildUnifiedSearchIndex();
    const scored = [];

    for (const item of index) {
        let score = 0;
        if (item.kind === 'dtc' && dtcIds.has(item.nodeId)) score = 100;
        else if (item.searchText.includes(q)) score = 50;
        else if (item.label.toLowerCase().includes(q)) score = 40;
        if (score > 0) scored.push({ ...item, score });
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
}

const KIND_LABEL = { dtc: 'DTC', sm: '정비지침서', etm: 'ETM', tsb: 'TSB', wiring: '와이어링' };

export function renderUnifiedSearchResultsHtml(results) {
    if (!results.length) {
        return '<p class="text-sm text-gray-500 p-3">검색 결과가 없습니다.</p>';
    }
    return `<ul class="divide-y divide-gray-100">${results
        .map(
            (r) => `<li>
                <a href="${escapeHtml(r.href)}" class="unified-search-hit block px-4 py-3 hover:bg-sky-50 text-left" data-href="${escapeHtml(r.href)}">
                    <span class="text-[10px] font-bold uppercase text-sky-700">${escapeHtml(KIND_LABEL[r.kind] || r.kind)}</span>
                    <p class="text-sm font-medium text-gray-900">${escapeHtml(r.label)}</p>
                    <p class="text-xs text-gray-500 truncate">${escapeHtml(r.path || '')}</p>
                </a>
            </li>`,
        )
        .join('')}</ul>`;
}

async function searchTsbHits(q, limit = 5) {
    if (!window.supabaseClient) return [];
    try {
        const rows = await fetchTsbBulletins(window.supabaseClient, { q });
        return rows.slice(0, limit).map((b) => ({
            kind: 'tsb',
            label: `${b.bulletin_no} ${b.title}`,
            path: b.summary || '',
            href: b.tree_node_id ? `#/tsb?doc=${encodeURIComponent(b.tree_node_id)}` : '#/tsb',
            score: 45,
        }));
    } catch {
        return [];
    }
}

export function mountUnifiedSearchHome(root) {
    const input = root?.querySelector('#unified-search-input');
    const resultsEl = root?.querySelector('#unified-search-results');
    if (!input || !resultsEl) return;

    let timer = null;
    const run = async () => {
        const q = input.value.trim();
        if (q.length < 2) {
            resultsEl.classList.add('hidden');
            resultsEl.innerHTML = '';
            return;
        }
        const hits = searchUnifiedIndex(q, 12);
        const tsbHits = await searchTsbHits(q, 5);
        const merged = [...hits, ...tsbHits.filter((t) => !hits.some((h) => h.href === t.href))].slice(0, 18);
        resultsEl.innerHTML = renderUnifiedSearchResultsHtml(merged);
        resultsEl.classList.remove('hidden');
        resultsEl.querySelectorAll('.unified-search-hit').forEach((a) => {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                const href = a.getAttribute('data-href') || '';
                if (href) window.location.hash = href.replace(/^#/, '');
                resultsEl.classList.add('hidden');
            });
        });
    };

    input.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(() => void run(), 200);
    });
}
