/** DTC ↔ SM/TSB/ETM 교차 링크 */

import { canAccessByGrade, gradeRequirementLabel } from './documentAccess.js';

function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/** @param {import('@supabase/supabase-js').SupabaseClient} supabase @param {string} dtcCode */
export async function fetchDtcCrossRefs(supabase, dtcCode) {
    const code = String(dtcCode || '')
        .replace(/\s/g, '')
        .toUpperCase();
    if (!code) return [];
    const { data, error } = await supabase
        .from('dtc_cross_refs')
        .select('*')
        .eq('dtc_code', code)
        .order('sort_order', { ascending: true });
    if (error) {
        console.warn('[dtc_cross_refs]', error.message);
        return [];
    }
    return data || [];
}

/**
 * @param {object[]} refs
 * @param {string} [userGrade]
 */
export function renderDtcCrossRefsHtml(refs, userGrade) {
    if (!refs?.length) return '';
    const items = refs
        .map((r) => {
            const ok = canAccessByGrade(userGrade, r.min_grade);
            if (!ok) {
                return `<li class="text-xs text-amber-700">${escapeHtml(r.label)} (${escapeHtml(gradeRequirementLabel(r.min_grade))})</li>`;
            }
            return `<li><a href="${escapeHtml(r.href)}" class="dtc-cross-ref-link text-sm text-sky-700 hover:underline font-medium" data-href="${escapeHtml(r.href)}">${escapeHtml(r.label)}</a></li>`;
        })
        .join('');
    return `<section class="dtc-cross-refs mt-4 p-4 bg-sky-50 border border-sky-100 rounded-xl">
        <h3 class="text-sm font-semibold text-gray-800 mb-2">관련 기술 문서</h3>
        <ul class="space-y-1 list-disc pl-5">${items}</ul>
    </section>`;
}

export function bindDtcCrossRefLinks(root) {
    root?.querySelectorAll('.dtc-cross-ref-link').forEach((a) => {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            const href = a.getAttribute('data-href') || '';
            if (href) window.location.hash = href.replace(/^#/, '');
        });
    });
}
