/** 현장 기술 노트 KB */

function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/** @param {import('@supabase/supabase-js').SupabaseClient} supabase */
export async function fetchFieldTechNotes(supabase, { q = '', includePending = false } = {}) {
    let query = supabase.from('field_tech_notes').select('*').order('created_at', { ascending: false }).limit(50);
    const { data, error } = await query;
    if (error) throw error;
    let rows = data || [];
    if (!includePending) rows = rows.filter((r) => r.status === 'approved');
    const term = (q || '').trim().toLowerCase();
    if (term) {
        rows = rows.filter((r) => `${r.title} ${r.body} ${r.dtc_code || ''}`.toLowerCase().includes(term));
    }
    return rows;
}

export function renderFieldTechNotesPageHtml() {
    return `
        <div class="max-w-4xl mx-auto p-6">
            <a href="#/home" class="text-sm text-gray-500 hover:text-gray-800 mb-4 inline-flex items-center gap-1">← 홈</a>
            <h1 class="text-2xl font-bold text-gray-900 mb-2">현장 기술 노트</h1>
            <p class="text-sm text-gray-600 mb-6">증상·DTC·조치를 공유합니다. 승인된 노트만 전체에 공개됩니다.</p>
            <div class="bg-white rounded-xl shadow-soft p-4 mb-6">
                <h2 class="font-semibold text-gray-900 mb-3">노트 등록</h2>
                <input id="ftn-title" class="w-full mb-2 px-3 py-2 border rounded-lg text-sm" placeholder="제목" maxlength="120">
                <textarea id="ftn-body" rows="4" class="w-full mb-2 px-3 py-2 border rounded-lg text-sm" placeholder="증상·조치·주의사항"></textarea>
                <div class="grid grid-cols-2 gap-2 mb-2">
                    <input id="ftn-dtc" class="px-3 py-2 border rounded-lg text-sm font-mono" placeholder="DTC (선택)">
                    <input id="ftn-vin-masked" class="px-3 py-2 border rounded-lg text-sm" placeholder="VIN 뒤 4자리 (선택)">
                </div>
                <button type="button" id="ftn-submit" class="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg">제출 (승인 대기)</button>
                <p id="ftn-status" class="text-xs text-gray-500 mt-2"></p>
            </div>
            <div class="mb-3 flex gap-2">
                <input id="ftn-search" type="search" placeholder="검색" class="flex-1 px-3 py-2 border rounded-lg text-sm">
            </div>
            <div id="ftn-list" class="space-y-3 text-sm text-gray-500">불러오는 중…</div>
        </div>`;
}

/**
 * @param {HTMLElement} listEl
 * @param {object[]} notes
 * @param {{ isAdmin?: boolean, onApprove?: (id: number) => void }} ctx
 */
export function renderFieldTechNotesList(listEl, notes, ctx = {}) {
    if (!listEl) return;
    if (!notes.length) {
        listEl.innerHTML = '<p class="text-gray-500">등록된 노트가 없습니다.</p>';
        return;
    }
    listEl.innerHTML = notes
        .map((n) => {
            const statusBadge =
                n.status === 'approved'
                    ? '<span class="text-green-700 text-xs">승인</span>'
                    : n.status === 'rejected'
                      ? '<span class="text-red-600 text-xs">반려</span>'
                      : '<span class="text-amber-700 text-xs">대기</span>';
            const approveBtn =
                ctx.isAdmin && n.status === 'pending'
                    ? `<button type="button" class="ftn-approve px-2 py-1 text-xs bg-green-600 text-white rounded" data-id="${n.id}">승인</button>`
                    : '';
            return `<article class="bg-white border border-gray-100 rounded-xl p-4 shadow-soft">
                <div class="flex justify-between gap-2 mb-1">
                    <h3 class="font-semibold text-gray-900">${escapeHtml(n.title)}</h3>
                    ${statusBadge}
                </div>
                <p class="text-gray-700 whitespace-pre-wrap">${escapeHtml(n.body)}</p>
                <p class="text-xs text-gray-400 mt-2">${escapeHtml(n.dtc_code || '')} ${escapeHtml(n.vin_masked || '')} · ${new Date(n.created_at).toLocaleDateString('ko-KR')}</p>
                ${approveBtn}
            </article>`;
        })
        .join('');

    listEl.querySelectorAll('.ftn-approve').forEach((btn) => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-id'), 10);
            if (ctx.onApprove) ctx.onApprove(id);
        });
    });
}
