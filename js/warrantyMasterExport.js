/** 보증 마스터 CSV보내기 — 수퍼바이저 전용·비공개 절차·보안 제한 */

import { warrantyRowsToCsvText } from './warrantyCsvImport.js';
import { requireSupervisorEmailStepUp } from './supervisorStepUp.js';

const EXPORT_COOLDOWN_KEY = 'warranty_master_export_at';
const EXPORT_COOLDOWN_MS = 30 * 60 * 1000;
const FETCH_PAGE_SIZE = 500;
const MAX_MASTER_ROWS = 50000;

export const WARRANTY_TAIL_DISPLAY_LIMIT = 10;

export function canRequestWarrantyMasterExportNow() {
    const last = parseInt(sessionStorage.getItem(EXPORT_COOLDOWN_KEY) || '0', 10);
    return !last || Date.now() - last >= EXPORT_COOLDOWN_MS;
}

export function markWarrantyMasterExportDone() {
    sessionStorage.setItem(EXPORT_COOLDOWN_KEY, String(Date.now()));
}

export function warrantyMasterExportCooldownRemainSec() {
    const last = parseInt(sessionStorage.getItem(EXPORT_COOLDOWN_KEY) || '0', 10);
    if (!last) return 0;
    const remain = EXPORT_COOLDOWN_MS - (Date.now() - last);
    return remain > 0 ? Math.ceil(remain / 1000) : 0;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 */
export async function fetchAllWarrantyMasterRows(supabase) {
    const all = [];
    let from = 0;
    while (from < MAX_MASTER_ROWS) {
        const to = from + FETCH_PAGE_SIZE - 1;
        const { data, error } = await supabase
            .from('warranty_data')
            .select(
                'vin, model, year, release_date, general_warranty_expiry, general_warranty_km, drivetrain_warranty_expiry, drivetrain_warranty_km, battery_warranty_expiry, battery_warranty_km',
            )
            .order('vin', { ascending: true })
            .range(from, to);
        if (error) throw error;
        if (!data?.length) break;
        all.push(...data);
        if (data.length < FETCH_PAGE_SIZE) break;
        from += FETCH_PAGE_SIZE;
    }
    if (from >= MAX_MASTER_ROWS) {
        throw new Error(`보증 데이터가 ${MAX_MASTER_ROWS.toLocaleString('ko-KR')}건을 초과하여보내기를 중단했습니다. 관리자에게 문의하세요.`);
    }
    return all;
}

function downloadCsvBlob(csvText, filename) {
    const blob = new Blob(['\uFEFF' + csvText], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
}

/**
 * 비공개 마스터 CSV보내기 절차 (보안 안내 → 동의 → 이메일 OTP → 다운로드)
 * @param {{ username: string, email: string, logActivity?: (payload: object) => void }} opts
 */
export function openWarrantyMasterExportGate(opts) {
    const { username, email, logActivity } = opts;
    const cooldownSec = warrantyMasterExportCooldownRemainSec();

    const overlay = document.createElement('div');
    overlay.className =
        'fixed inset-0 bg-black bg-opacity-60 z-[10000] flex items-center justify-center p-4';
    const panel = document.createElement('div');
    panel.className = 'bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto';
    panel.innerHTML = `
        <h2 class="text-lg font-bold text-gray-900 mb-2">보증 마스터 데이터보내기</h2>
        <div class="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-900 space-y-2 mb-4">
            <p class="font-semibold">보안 안내 (필수 확인)</p>
            <ul class="list-disc pl-5 space-y-1 text-red-800">
                <li>웹에서 전체 CSV를 받으면 <strong>모든 차대번호·보증 정보</strong>가 단말기에 저장됩니다. 유출·무단 공유 시 심각한 보안 사고가 됩니다.</li>
                <li>다운로드·열람 기록은 <strong>이용 로그</strong>에 남으며, 수퍼바이저 본인 이메일 <strong>재인증</strong>이 필요합니다.</li>
                <li>업무용 PC·암호화 저장만 허용합니다. 메신저·개인 메일·공용 USB 전송을 금지합니다.</li>
                <li>동일 세션에서 <strong>30분에 1회</strong>만 요청할 수 있습니다.</li>
            </ul>
        </div>
        ${cooldownSec > 0 ? `<p class="text-sm text-amber-800 mb-3">다음 요청 가능까지 약 ${Math.ceil(cooldownSec / 60)}분 남았습니다.</p>` : ''}
        <label class="flex items-start gap-2 mb-2 cursor-pointer text-sm">
            <input type="checkbox" class="warranty-export-agree-risk mt-0.5 rounded" ${cooldownSec > 0 ? 'disabled' : ''}>
            <span>유출 위험과 기록 보관 정책을 이해했습니다.</span>
        </label>
        <label class="flex items-start gap-2 mb-4 cursor-pointer text-sm">
            <input type="checkbox" class="warranty-export-agree-purpose mt-0.5 rounded" ${cooldownSec > 0 ? 'disabled' : ''}>
            <span>내부 백업·대조용으로만 사용하고 외부에 제공하지 않겠습니다.</span>
        </label>
        <p class="warranty-export-err text-xs text-red-600 hidden mb-2"></p>
        <div class="flex gap-2">
            <button type="button" class="warranty-export-proceed flex-1 px-4 py-2.5 bg-gray-800 text-white rounded-lg text-sm font-medium opacity-40 cursor-not-allowed" disabled>
                본인 이메일 인증 후 다운로드
            </button>
            <button type="button" class="warranty-export-cancel px-4 py-2.5 border border-gray-300 rounded-lg text-sm">닫기</button>
        </div>
    `;
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    const agreeRisk = panel.querySelector('.warranty-export-agree-risk');
    const agreePurpose = panel.querySelector('.warranty-export-agree-purpose');
    const proceedBtn = panel.querySelector('.warranty-export-proceed');
    const errEl = panel.querySelector('.warranty-export-err');
    const cancelBtn = panel.querySelector('.warranty-export-cancel');

    const updateProceed = () => {
        const ready =
            cooldownSec === 0 && agreeRisk?.checked && agreePurpose?.checked;
        if (proceedBtn) {
            proceedBtn.disabled = !ready;
            proceedBtn.classList.toggle('opacity-40', !ready);
            proceedBtn.classList.toggle('cursor-not-allowed', !ready);
        }
    };
    agreeRisk?.addEventListener('change', updateProceed);
    agreePurpose?.addEventListener('change', updateProceed);
    updateProceed();

    const close = () => overlay.remove();
    cancelBtn?.addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close();
    });

    proceedBtn?.addEventListener('click', async () => {
        if (proceedBtn.disabled) return;
        errEl?.classList.add('hidden');

        const ok = await requireSupervisorEmailStepUp({
            username,
            email,
            purposeLabel: '보증 마스터 CSV보내기',
        });
        if (!ok) return;

        if (
            !window.confirm(
                `전체 보증 마스터 CSV를 다운로드합니다.\n\n` +
                    `· 모든 VIN·보증 필드가 포함됩니다\n` +
                    `· 이용 로그에 기록됩니다\n` +
                    `· 파일은 업무용으로만 보관하세요\n\n` +
                    `계속하시겠습니까?`,
            )
        ) {
            return;
        }

        proceedBtn.disabled = true;
        proceedBtn.textContent = '데이터 준비 중…';
        try {
            const rows = await fetchAllWarrantyMasterRows(window.supabaseClient);
            const csv = warrantyRowsToCsvText(rows);
            const fname = `warranty-master-${new Date().toISOString().slice(0, 10)}.csv`;
            downloadCsvBlob(csv, fname);
            markWarrantyMasterExportDone();
            logActivity?.({
                eventType: 'warranty_master_export',
                resourceCategory: 'admin',
                resourceKey: 'warranty_data',
                payload: { row_count: rows.length, filename: fname },
            });
            close();
            if (typeof window.showToast === 'function') {
                window.showToast(`마스터 CSV ${rows.length.toLocaleString('ko-KR')}건 다운로드 (이용 로그 기록됨)`, 'success');
            }
        } catch (e) {
            if (errEl) {
                errEl.textContent = e.message || '보내기 실패';
                errEl.classList.remove('hidden');
            }
            proceedBtn.disabled = false;
            proceedBtn.textContent = '본인 이메일 인증 후 다운로드';
        }
    });
}
