/** TSB bulletin DB 조회·필터·UI */

import { canAccessByGrade, gradeRequirementLabel } from './documentAccess.js';

function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/** @param {import('@supabase/supabase-js').SupabaseClient} supabase */
export async function fetchTsbBulletins(supabase, { modelKey = null, q = '' } = {}) {
    let query = supabase
        .from('tsb_bulletins')
        .select('*')
        .eq('is_active', true)
        .order('published_at', { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    let rows = data || [];
    if (modelKey) {
        rows = rows.filter((r) => !r.models?.length || r.models.includes(modelKey));
    }
    const term = (q || '').trim().toLowerCase();
    if (term) {
        rows = rows.filter((r) => {
            const hay = [r.title, r.summary, r.bulletin_no, ...(r.symptoms || []), ...(r.related_dtc_codes || [])]
                .join(' ')
                .toLowerCase();
            return hay.includes(term);
        });
    }
    return rows;
}

/** @param {import('@supabase/supabase-js').SupabaseClient} supabase */
export async function fetchUnreadMustReadCount(supabase, userId, modelKey) {
    if (!userId) return 0;
    const bulletins = await fetchTsbBulletins(supabase, { modelKey });
    const must = bulletins.filter((b) => b.must_read_before_repair);
    if (!must.length) return 0;
    const ids = must.map((b) => b.id);
    const { data: acks } = await supabase
        .from('tsb_read_ack')
        .select('bulletin_id')
        .eq('user_id', userId)
        .in('bulletin_id', ids);
    const readSet = new Set((acks || []).map((a) => a.bulletin_id));
    return must.filter((b) => !readSet.has(b.id)).length;
}

/** @param {import('@supabase/supabase-js').SupabaseClient} supabase */
export async function ackTsbRead(supabase, bulletinId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) return;
    await supabase.from('tsb_read_ack').upsert({ user_id: user.id, bulletin_id: bulletinId });
}

/**
 * TSB 탭 상단 패널 HTML
 * @param {{ userGrade?: string, modelKey?: string }} opts
 */
export function renderTsbBulletinPanelHtml(opts = {}) {
    const modelKey = opts.modelKey || '';
    return `
        <div id="tsb-bulletin-panel" class="mb-4 p-4 bg-white rounded-xl border border-gray-200 shadow-soft">
            <div class="flex flex-wrap items-end gap-3 mb-3">
                <div class="flex-1 min-w-[200px]">
                    <label class="block text-xs font-medium text-gray-600 mb-1">TSB 검색</label>
                    <input type="search" id="tsb-filter-q" placeholder="제목·번호·증상·DTC" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">적용 차종</label>
                    <select id="tsb-filter-model" class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                        <option value="">전체</option>
                        <option value="masada-2van"${modelKey === 'masada-2van' ? ' selected' : ''}>2VAN</option>
                        <option value="masada-4van"${modelKey === 'masada-4van' ? ' selected' : ''}>4VAN</option>
                        <option value="masada-cargo"${modelKey === 'masada-cargo' ? ' selected' : ''}>Cargo</option>
                        <option value="masada-qq"${modelKey === 'masada-qq' ? ' selected' : ''}>QQ</option>
                    </select>
                </div>
                <button type="button" id="tsb-filter-apply" class="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg">필터</button>
            </div>
            <div id="tsb-bulletin-list" class="text-sm text-gray-500">TSB 목록 불러오는 중…</div>
        </div>`;
}

/**
 * @param {HTMLElement} container
 * @param {{ bulletins: object[], userGrade?: string, onOpenTreeNode?: (treeNodeId: string) => void }} ctx
 */
export function renderTsbBulletinList(container, { bulletins, userGrade, onOpenTreeNode }) {
    if (!container) return;
    if (!bulletins.length) {
        container.innerHTML = '<p class="text-gray-500">조건에 맞는 TSB가 없습니다.</p>';
        return;
    }
    container.innerHTML = bulletins
        .map((b) => {
            const allowed = canAccessByGrade(userGrade, b.min_grade);
            const must = b.must_read_before_repair
                ? '<span class="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-red-100 text-red-800 rounded">수리 전 필독</span>'
                : '';
            const models = (b.models || []).join(', ') || '전체';
            return `<div class="border border-gray-100 rounded-lg p-3 mb-2 hover:bg-gray-50 ${allowed ? '' : 'opacity-60'}">
                <div class="flex flex-wrap items-start justify-between gap-2">
                    <div>
                        <span class="font-mono text-xs text-gray-500">${escapeHtml(b.bulletin_no)}</span>${must}
                        <h4 class="font-semibold text-gray-900 mt-0.5">${escapeHtml(b.title)}</h4>
                        <p class="text-xs text-gray-600 mt-1">${escapeHtml(b.summary || '')}</p>
                        <p class="text-[11px] text-gray-400 mt-1">발행 ${escapeHtml(b.published_at || '—')} · ${escapeHtml(models)}</p>
                    </div>
                    ${
                        allowed
                            ? `<button type="button" class="tsb-open-pdf shrink-0 px-3 py-1.5 text-xs bg-sky-600 text-white rounded-lg" data-tree-id="${escapeHtml(b.tree_node_id || '')}" data-bulletin-id="${b.id}">PDF 열기</button>`
                            : `<span class="text-xs text-amber-700">${escapeHtml(gradeRequirementLabel(b.min_grade))}</span>`
                    }
                </div>
            </div>`;
        })
        .join('');

    container.querySelectorAll('.tsb-open-pdf').forEach((btn) => {
        btn.addEventListener('click', async () => {
            const treeId = btn.getAttribute('data-tree-id');
            const bulletinId = btn.getAttribute('data-bulletin-id');
            if (bulletinId && window.supabaseClient) {
                await ackTsbRead(window.supabaseClient, parseInt(bulletinId, 10));
            }
            if (treeId && onOpenTreeNode) onOpenTreeNode(treeId);
        });
    });
}
