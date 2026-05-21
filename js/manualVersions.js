/** 정비지침서·ETM 개정 버전 배너 */

import { canAccessByGrade, gradeRequirementLabel } from './documentAccess.js';

function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/** @param {import('@supabase/supabase-js').SupabaseClient} supabase */
export async function fetchManualDocumentMeta(supabase, docKey) {
    const { data, error } = await supabase
        .from('manual_documents')
        .select('*')
        .eq('doc_key', docKey)
        .eq('is_current', true)
        .maybeSingle();
    if (error) {
        console.warn('[manual_documents]', error.message);
        return null;
    }
    return data;
}

/**
 * @param {object|null} doc
 * @param {string} [userGrade]
 */
export function renderManualVersionBannerHtml(doc, userGrade) {
    if (!doc) return '';
    const allowed = canAccessByGrade(userGrade, doc.min_grade);
    const warn = doc.supersedes_label
        ? `<p class="text-xs text-amber-800 mt-1">이전 개정 ${escapeHtml(doc.supersedes_label)} 대체</p>`
        : '';
    if (!allowed) {
        return `<div class="manual-version-banner mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
            <strong>${escapeHtml(doc.title)}</strong> — ${escapeHtml(gradeRequirementLabel(doc.min_grade))} 필요
        </div>`;
    }
    return `<div class="manual-version-banner mb-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-indigo-900">
        <span class="font-semibold">${escapeHtml(doc.version_label)}</span>
        <span class="text-indigo-700"> · 시행 ${escapeHtml(doc.effective_date || '—')}</span>
        ${doc.change_summary ? `<p class="text-xs mt-1 text-indigo-800">${escapeHtml(doc.change_summary)}</p>` : ''}
        ${warn}
    </div>`;
}

/** doc page title + model → doc_key */
export function resolveManualDocKey(docTitle, modelKey) {
    if (docTitle === '정비지침서' && modelKey) return `sm:${modelKey}`;
    if (docTitle === '전장회로도') return 'etm:hv-system';
    return null;
}
