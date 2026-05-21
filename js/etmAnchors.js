/** ETM PDF 페이지 앵커(딥링크) */

function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/** @param {import('@supabase/supabase-js').SupabaseClient} supabase @param {string} etmNodeId */
export async function fetchEtmAnchors(supabase, etmNodeId) {
    const { data, error } = await supabase
        .from('etm_page_anchors')
        .select('*')
        .eq('etm_node_id', etmNodeId)
        .order('sort_order', { ascending: true });
    if (error) {
        console.warn('[etm_page_anchors]', error.message);
        return [];
    }
    return data || [];
}

/**
 * @param {object[]} anchors
 * @returns {{ initialPage: number, panelHtml: string }}
 */
export function etmAnchorsUi(anchors) {
    if (!anchors?.length) return { initialPage: 1, panelHtml: '' };
    const initialPage = anchors[0].page_number || 1;
    const panelHtml = `<div id="etm-anchor-bar" class="mb-3 p-3 bg-violet-50 border border-violet-100 rounded-lg">
        <p class="text-xs font-semibold text-violet-900 mb-2">회로도 바로가기</p>
        <div class="flex flex-wrap gap-2">
            ${anchors
                .map(
                    (a) =>
                        `<button type="button" class="etm-goto-page px-2 py-1 text-xs bg-white border border-violet-200 rounded-lg hover:bg-violet-100" data-page="${a.page_number}" title="${escapeHtml(a.connector_code || '')}">
                            ${escapeHtml(a.anchor_label)} (p.${a.page_number})
                        </button>`,
                )
                .join('')}
        </div>
    </div>`;
    return { initialPage, panelHtml };
}
