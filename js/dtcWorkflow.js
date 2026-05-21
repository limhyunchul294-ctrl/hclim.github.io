/**
 * DTC 인터랙티브 진단·수리 워크플로우 (개요 → 부위 → 배선 → 완료)
 */

import { DTC_META, parseActionSteps, DTC_STORAGE_BUCKET } from './dtcMapping.js';
import { resolveImageSlices, indicesForPhase } from './dtcImageLayout.js';
import { createWatermarkedDataUrl, renderWatermarkedImage } from './imageWatermark.js';
import { fetchDtcCrossRefs, renderDtcCrossRefsHtml, bindDtcCrossRefLinks } from './dtcCrossRefs.js';
import { printDtcRepairReport } from './dtcRepairReport.js';
import { getWorkVehicle } from './workVehicleContext.js';

const HV_SAFETY_ITEMS = [
    '고전압 차단(서비스 플러그·퓨즈) 상태 확인',
    '잔류 전압·커패시터 방전 절차 완료',
    '절연 장갑·절연 신발·보안경 등 PPE 착용',
    '고전압 작업 경고 표지 부착',
];

const WORKFLOW_VERSION = 4;
const PHASES = [
    { id: 'overview', label: '개요' },
    { id: 'parts', label: '부위' },
    { id: 'wiring', label: '배선' },
    { id: 'complete', label: '완료' },
];

function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function storageKey(codeDisplay) {
    return `gsw-dtc-workflow-v${WORKFLOW_VERSION}-${codeDisplay}`;
}

export function loadWorkflowState(entry) {
    try {
        const raw = localStorage.getItem(storageKey(entry.codeDisplay));
        if (!raw) return createDefaultState(entry);
        return normalizeState(entry, JSON.parse(raw));
    } catch {
        return createDefaultState(entry);
    }
}

function createDefaultState(entry) {
    const partsLen = entry.suspected_parts?.length || 0;
    const wiringLen = entry.wiring_steps?.length || 0;
    return {
        version: WORKFLOW_VERSION,
        phase: 'overview',
        wiringIndex: 0,
        partsChecked: Array(partsLen).fill(false),
        wiringResults: Array(wiringLen)
            .fill(null)
            .map(() => ({ status: null, measured: '', note: '' })),
        repairNotes: '',
        imageSlideIndex: 0,
        updatedAt: null,
        hvSafetyChecks: HV_SAFETY_ITEMS.map(() => false),
        hvSafetyAck: false,
    };
}

function normalizeState(entry, parsed) {
    const base = createDefaultState(entry);
    const partsLen = base.partsChecked.length;
    const wiringLen = base.wiringResults.length;

    const partsChecked = Array.isArray(parsed.partsChecked)
        ? parsed.partsChecked.slice(0, partsLen)
        : [...base.partsChecked];
    while (partsChecked.length < partsLen) partsChecked.push(false);

    const wiringResults = Array.isArray(parsed.wiringResults)
        ? parsed.wiringResults.slice(0, wiringLen).map((r) => ({
              status: r?.status ?? null,
              measured: r?.measured ?? '',
              note: r?.note ?? '',
          }))
        : [...base.wiringResults];
    while (wiringResults.length < wiringLen) {
        wiringResults.push({ status: null, measured: '', note: '' });
    }

    let phase = PHASES.some((p) => p.id === parsed.phase) ? parsed.phase : 'overview';
    if (phase === 'diagrams') phase = 'complete';
    const wiringIndex = Math.min(Math.max(0, parsed.wiringIndex ?? 0), Math.max(0, wiringLen - 1));
    const slide =
        parsed.imageSlideIndex ?? parsed.diagramSlideIndex ?? 0;

    const hvSafetyChecks = Array.isArray(parsed.hvSafetyChecks)
        ? HV_SAFETY_ITEMS.map((_, i) => !!parsed.hvSafetyChecks[i])
        : HV_SAFETY_ITEMS.map(() => false);
    const hvSafetyAck =
        parsed.hvSafetyAck === true || hvSafetyChecks.every(Boolean);

    return {
        version: WORKFLOW_VERSION,
        phase,
        wiringIndex,
        partsChecked,
        wiringResults,
        repairNotes: parsed.repairNotes ?? '',
        imageSlideIndex: Math.max(0, slide),
        updatedAt: parsed.updatedAt ?? null,
        hvSafetyChecks,
        hvSafetyAck,
    };
}

function renderHvSafetyGate(state) {
    if (state.hvSafetyAck) return '';
    const items = HV_SAFETY_ITEMS.map(
        (label, i) =>
            `<label class="flex items-start gap-2 py-1.5 cursor-pointer">
                <input type="checkbox" class="dtc-hv-check mt-0.5 rounded" data-hv-idx="${i}" ${state.hvSafetyChecks[i] ? 'checked' : ''}>
                <span class="text-sm text-gray-800">${escapeHtml(label)}</span>
            </label>`,
    ).join('');
    return `<div class="rounded-xl border-2 border-red-300 bg-red-50 p-4 mb-4" id="dtc-hv-gate">
        <h3 class="text-sm font-bold text-red-900 mb-2">고전압 안전 확인 (필수)</h3>
        <p class="text-xs text-red-800 mb-3">전기차 고전압 계통 점검·수리 전 반드시 확인하세요. 미확인 시 다음 단계로 진행할 수 없습니다.</p>
        <div class="space-y-0">${items}</div>
        <button type="button" id="dtc-hv-confirm" class="mt-3 w-full py-2.5 rounded-lg bg-red-800 text-white text-sm font-semibold disabled:opacity-40" disabled>전항목 확인 후 진단 시작</button>
    </div>`;
}

function syncHvGateUi(root, state) {
    const all = state.hvSafetyChecks.every(Boolean);
    const btn = root.querySelector('#dtc-hv-confirm');
    if (btn) {
        btn.disabled = !all;
        btn.classList.toggle('opacity-40', !all);
    }
}

function currentPhaseImageIndices(entry, state) {
    const slices = resolveImageSlices(entry);
    return indicesForPhase(slices, state.phase, { wiringIndex: state.wiringIndex });
}

/** 단계별 참고 이미지 뷰어(캐러셀) 마크업 */
function renderPhaseImagesShell(entry, state, phaseId) {
    const indices = indicesForPhase(resolveImageSlices(entry), phaseId, {
        wiringIndex: state.wiringIndex,
    });
    if (!indices.length) return '';
    const count = indices.length;
    const showNav = count > 1;
    return `<div class="dtc-phase-images" data-phase-images="${phaseId}">
        <div class="flex items-center justify-between mb-2 gap-2">
            <h4 class="text-sm font-semibold text-gray-800">참고 이미지</h4>
            ${showNav ? `<span id="dtc-phase-img-counter" class="text-xs text-gray-500 shrink-0">1 / ${count}</span>` : ''}
        </div>
        <div id="dtc-phase-image-view" class="rounded-xl border border-gray-200 bg-white min-h-[180px] flex items-center justify-center overflow-hidden cursor-zoom-in">
            <p class="text-sm text-gray-400 p-4 text-center">워터마크 처리 중…</p>
        </div>
        <div class="flex gap-2 mt-2 justify-center items-center ${showNav ? '' : 'hidden'}" id="dtc-phase-image-nav">
            <button type="button" id="dtc-phase-img-prev" class="px-3 py-2 text-xs border border-gray-300 rounded-lg min-h-[40px]">←</button>
            <button type="button" id="dtc-phase-img-next" class="px-3 py-2 text-xs border border-gray-300 rounded-lg min-h-[40px]">→</button>
        </div>
    </div>`;
}

function renderCompleteImagesGridShell(entry) {
    const indices = resolveImageSlices(entry).complete;
    if (!indices.length) return '';
    return `<div class="dtc-phase-images" data-phase-images="complete">
        <h4 class="text-sm font-semibold text-gray-800 mb-2">참고 이미지</h4>
        <div id="dtc-complete-images-grid" class="grid grid-cols-2 sm:grid-cols-3 gap-2 min-h-[4rem]">
            <p class="text-sm text-gray-400 col-span-full text-center py-4">이미지 로드 중…</p>
        </div>
    </div>`;
}

export function saveWorkflowState(entry, state) {
    state.updatedAt = new Date().toISOString();
    localStorage.setItem(storageKey(entry.codeDisplay), JSON.stringify(state));
}

export function enrichWiringSteps(steps) {
    let lastCondition = '';
    let lastTarget = '';
    return (steps || []).map((s, index) => {
        if (s.condition) lastCondition = s.condition;
        if (s.target) lastTarget = s.target;
        return {
            ...s,
            index,
            displayCondition: s.condition || lastCondition,
            displayTarget: s.target || lastTarget,
        };
    });
}

export function calcWorkflowProgress(entry, state) {
    const partsTotal = entry.suspected_parts?.length || 0;
    const wiringTotal = entry.wiring_steps?.length || 0;
    const partsDone = state.partsChecked.filter(Boolean).length;
    const wiringDone = state.wiringResults.filter((r) => r?.status).length;
    const partsPct = partsTotal ? partsDone / partsTotal : 1;
    const wiringPct = wiringTotal ? wiringDone / wiringTotal : 1;
    const phaseIdx = PHASES.findIndex((p) => p.id === state.phase);
    const phasePct = (phaseIdx + 1) / PHASES.length;
    const overall = Math.round(((partsPct + wiringPct + phasePct) / 3) * 100);
    const ngCount = state.wiringResults.filter((r) => r?.status === 'ng').length;
    return { partsDone, partsTotal, wiringDone, wiringTotal, overall, ngCount };
}

function statusLabel(status) {
    if (status === 'ok') return '정상';
    if (status === 'ng') return '이상';
    if (status === 'skip') return '생략';
    return '미점검';
}

function statusClass(status) {
    if (status === 'ok') return 'bg-green-100 text-green-800 border-green-200';
    if (status === 'ng') return 'bg-red-100 text-red-800 border-red-200';
    if (status === 'skip') return 'bg-gray-100 text-gray-600 border-gray-200';
    return 'bg-amber-50 text-amber-800 border-amber-200';
}

export function renderDtcWorkflowHtml(entry) {
    const state = loadWorkflowState(entry);
    const progress = calcWorkflowProgress(entry, state);

    const phaseNav = PHASES.map((p) => {
        const active = p.id === state.phase;
        return `<button type="button" class="dtc-phase-btn flex-1 min-w-[3.5rem] px-2 py-2.5 text-xs sm:text-sm font-medium rounded-lg border transition-colors ${
            active ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
        }" data-phase="${p.id}">${escapeHtml(p.label)}</button>`;
    }).join('');

    return `
        <article class="dtc-workflow-root w-full max-w-4xl mx-auto text-left" data-dtc-id="${escapeHtml(entry.id)}">
            <header class="mb-4 pb-4 border-b border-gray-200">
                <div class="flex flex-wrap items-start justify-between gap-2 mb-3">
                    <div>
                        <p class="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-sm font-mono font-bold">${escapeHtml(entry.codeDisplay)}</p>
                        ${entry.category ? `<p class="text-xs text-gray-500 mt-2">${escapeHtml(entry.category)}</p>` : ''}
                        <h2 class="text-lg md:text-2xl font-bold text-gray-900 mt-1 leading-snug">${escapeHtml(entry.title)}</h2>
                    </div>
                    <button type="button" id="dtc-workflow-reset" class="text-xs text-gray-500 underline hover:text-gray-800 shrink-0">진단 초기화</button>
                </div>
                <div class="space-y-1">
                    <div class="flex justify-between text-xs text-gray-600">
                        <span>진단 진행률</span>
                        <span id="dtc-progress-label">${progress.overall}% · 배선 ${progress.wiringDone}/${progress.wiringTotal}</span>
                    </div>
                    <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div id="dtc-progress-bar" class="h-full bg-brand transition-all duration-300" style="width:${progress.overall}%"></div>
                    </div>
                </div>
            </header>
            <nav class="flex gap-1 mb-4 overflow-x-auto pb-1" aria-label="진단 단계">${phaseNav}</nav>
            <div id="dtc-phase-panels">${renderPhasePanel(entry, state)}</div>
            <p class="text-xs text-gray-400 mt-6 pt-4 border-t border-gray-100">DTC 진단 가이드 · ${DTC_META.count}건</p>
        </article>`;
}

function renderPhasePanel(entry, state) {
    switch (state.phase) {
        case 'parts':
            return renderPartsPhase(entry, state);
        case 'wiring':
            return renderWiringPhase(entry, state);
        case 'complete':
            return renderCompletePhase(entry, state);
        default:
            return renderOverviewPhase(entry, state);
    }
}

function renderOverviewPhase(entry, state) {
    const causes = entry.causes?.filter((c) => c && (c.cause !== '—' || c.action !== '—'));
    const causesHtml = causes?.length
        ? `<section class="mt-4 border-t border-gray-100 pt-4">
            <h3 class="text-sm font-semibold text-gray-700 mb-2">보조 조치</h3>
            ${causes
                .map((row) => {
                    const steps = parseActionSteps(row.action);
                    const action =
                        steps.length > 1
                            ? `<ol class="list-decimal list-inside text-sm space-y-1">${steps.map((s) => `<li>${escapeHtml(s)}</li>`).join('')}</ol>`
                            : `<p class="text-sm text-gray-800">${escapeHtml(row.action || '—')}</p>`;
                    return `<div class="rounded-lg border border-gray-200 p-3 mb-2 bg-gray-50/50">
                        <p class="text-sm font-medium">${escapeHtml(row.cause || '—')}</p>
                        <div class="mt-2">${action}</div>
                    </div>`;
                })
                .join('')}
           </section>`
        : '';

    return `<section class="dtc-phase-panel space-y-4" data-phase="overview">
        ${renderHvSafetyGate(state)}
        <div class="rounded-xl border border-amber-200 bg-amber-50/80 p-4 ${state.hvSafetyAck ? '' : 'opacity-50 pointer-events-none'}">
            <h3 class="text-sm font-semibold text-gray-800 mb-2">고장 코드 설명</h3>
            <p class="text-sm text-gray-800 leading-relaxed">${escapeHtml(entry.explanation || '설명 없음')}</p>
        </div>
        ${renderPhaseImagesShell(entry, state, 'overview')}
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 ${state.hvSafetyAck ? '' : 'hidden'}">
            ${PHASES.filter((p) => p.id !== 'overview' && p.id !== 'complete')
                .map(
                    (p) => `<button type="button" class="dtc-goto-phase px-3 py-3 rounded-lg border border-gray-200 bg-white text-sm font-medium hover:border-gray-900" data-phase="${p.id}">${escapeHtml(p.label)} 시작 →</button>`
                )
                .join('')}
        </div>
        ${causesHtml}
        <div class="flex justify-end pt-2 ${state.hvSafetyAck ? '' : 'hidden'}">
            <button type="button" class="dtc-goto-phase px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium" data-phase="parts">다음: 예상 부위 →</button>
        </div>
    </section>`;
}

function renderPartsPhase(entry, state) {
    const parts = entry.suspected_parts || [];
    if (parts.length === 0) {
        return `<section class="dtc-phase-panel space-y-4" data-phase="parts">
            <p class="text-sm text-gray-500">등록된 예상 고장 부위가 없습니다.</p>
            ${renderPhaseImagesShell(entry, state, 'parts')}
            <button type="button" class="dtc-goto-phase mt-4 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm" data-phase="wiring">배선 점검으로 →</button>
        </section>`;
    }

    const list = parts
        .map((part, i) => {
            const checked = state.partsChecked[i];
            return `<label class="flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${checked ? 'border-green-300 bg-green-50/80 ring-1 ring-green-200' : 'border-gray-200 bg-white hover:bg-gray-50'}">
                <input type="checkbox" class="dtc-part-check mt-1 w-5 h-5 rounded border-gray-300" data-part-idx="${i}" ${checked ? 'checked' : ''} />
                <span class="text-sm text-gray-900 flex-1">${escapeHtml(part)}</span>
            </label>`;
        })
        .join('');

    const allChecked = state.partsChecked.every(Boolean);

    return `<section class="dtc-phase-panel space-y-3" data-phase="parts">
        <h3 class="text-sm font-semibold text-gray-800">고장 예상 부위 점검</h3>
        <p class="text-xs text-gray-500">확인한 부위에 체크하세요. (${state.partsChecked.filter(Boolean).length}/${parts.length})</p>
        <div class="space-y-2">${list}</div>
        <label class="flex items-center gap-2 text-xs text-gray-600">
            <input type="checkbox" id="dtc-parts-select-all" ${allChecked ? 'checked' : ''} /> 전체 확인 완료
        </label>
        ${renderPhaseImagesShell(entry, state, 'parts')}
        <div class="flex flex-wrap gap-2 justify-between pt-2">
            <button type="button" class="dtc-goto-phase px-3 py-2 rounded-lg border text-sm" data-phase="overview">← 개요</button>
            <button type="button" class="dtc-goto-phase px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium" data-phase="wiring">배선 점검 →</button>
        </div>
    </section>`;
}

function renderWiringPhase(entry, state) {
    const steps = enrichWiringSteps(entry.wiring_steps);
    if (steps.length === 0) {
        return `<section class="dtc-phase-panel" data-phase="wiring">
            <p class="text-sm text-gray-500">배선 점검 항목이 없습니다.</p>
            ${renderPhaseImagesShell(entry, state, 'wiring')}
            <button type="button" class="dtc-goto-phase mt-4 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm" data-phase="complete">완료 요약 →</button>
        </section>`;
    }

    const idx = state.wiringIndex;
    const step = steps[idx];
    const result = state.wiringResults[idx] || { status: null, measured: '', note: '' };
    const status = result.status;

    const stepDots = steps
        .map((_, i) => {
            const r = state.wiringResults[i];
            const dotClass =
                r?.status === 'ok'
                    ? 'bg-green-500'
                    : r?.status === 'ng'
                      ? 'bg-red-500'
                      : i === idx
                        ? 'bg-gray-900 ring-2 ring-offset-1 ring-gray-400'
                        : 'bg-gray-300';
            return `<button type="button" class="dtc-wiring-dot w-2.5 h-2.5 rounded-full shrink-0 ${dotClass}" data-wiring-idx="${i}" title="단계 ${i + 1}"></button>`;
        })
        .join('');

    const wiringImages = renderPhaseImagesShell(entry, state, 'wiring');

    return `<section class="dtc-phase-panel space-y-4" data-phase="wiring">
        <div class="flex items-center justify-between gap-2">
            <h3 class="text-sm font-semibold text-gray-800">배선 점검 ${idx + 1} / ${steps.length}</h3>
            <span class="text-xs px-2 py-0.5 rounded border ${statusClass(status)}">${statusLabel(status)}</span>
        </div>
        <div class="flex gap-1 flex-wrap justify-center py-1">${stepDots}</div>
        <div class="lg:grid lg:grid-cols-2 lg:gap-4 lg:items-start">
        <div class="rounded-xl border-2 border-gray-200 bg-white p-4 shadow-sm space-y-3">
            ${step.displayCondition ? `<p class="text-xs font-semibold text-brand uppercase tracking-wide">${escapeHtml(step.displayCondition)}</p>` : ''}
            ${step.displayTarget ? `<p class="text-sm text-gray-700"><span class="text-gray-500">측정 대상</span> ${escapeHtml(step.displayTarget)}</p>` : ''}
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div class="rounded-lg bg-gray-50 p-3 border border-gray-100">
                    <p class="text-xs text-gray-500 mb-1">단자 1</p>
                    <p class="font-mono text-gray-900">${escapeHtml(step.terminal_1 || '—')}</p>
                </div>
                <div class="rounded-lg bg-gray-50 p-3 border border-gray-100">
                    <p class="text-xs text-gray-500 mb-1">단자 2</p>
                    <p class="font-mono text-gray-900">${escapeHtml(step.terminal_2 || '—')}</p>
                </div>
            </div>
            <div class="rounded-lg bg-amber-50 border border-amber-200 p-3">
                <p class="text-xs text-amber-800 font-semibold mb-1">정상 판정값</p>
                <p class="text-base font-bold text-amber-950">${escapeHtml(step.normal || '—')}</p>
            </div>
            <label class="block">
                <span class="text-xs text-gray-500">실측값 (선택)</span>
                <input type="text" id="dtc-measured-input" value="${escapeHtml(result.measured)}" placeholder="예: 4.9V, 85Ω" class="mt-1 w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-brand focus:outline-none" />
            </label>
            <div class="grid grid-cols-3 gap-2">
                <button type="button" class="dtc-wiring-status px-2 py-3 rounded-lg text-sm font-semibold border-2 ${status === 'ok' ? 'border-green-600 bg-green-50 text-green-800' : 'border-gray-200 hover:bg-green-50'}" data-status="ok">정상</button>
                <button type="button" class="dtc-wiring-status px-2 py-3 rounded-lg text-sm font-semibold border-2 ${status === 'ng' ? 'border-red-600 bg-red-50 text-red-800' : 'border-gray-200 hover:bg-red-50'}" data-status="ng">이상</button>
                <button type="button" class="dtc-wiring-status px-2 py-3 rounded-lg text-sm font-semibold border-2 ${status === 'skip' ? 'border-gray-500 bg-gray-100' : 'border-gray-200 hover:bg-gray-50'}" data-status="skip">생략</button>
            </div>
            <label class="block">
                <span class="text-xs text-gray-500">메모</span>
                <input type="text" id="dtc-wiring-note" value="${escapeHtml(result.note)}" class="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="특이사항" />
            </label>
        </div>
        <div class="mt-4 lg:mt-0 lg:sticky lg:top-2">
            ${wiringImages}
        </div>
        </div>
        <div class="flex gap-2 lg:col-span-2">
            <button type="button" id="dtc-wiring-prev" class="flex-1 py-2.5 rounded-lg border text-sm ${idx === 0 ? 'opacity-40 pointer-events-none' : ''}" ${idx === 0 ? 'disabled' : ''}>← 이전</button>
            <button type="button" id="dtc-wiring-next" class="flex-1 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium">${idx < steps.length - 1 ? '다음 단계 →' : '완료 요약 →'}</button>
        </div>
        <div class="flex justify-between pt-1 lg:col-span-2">
            <button type="button" class="dtc-goto-phase text-xs text-gray-500 underline" data-phase="parts">← 부위</button>
        </div>
    </section>`;
}

function renderCompletePhase(entry, state) {
    const progress = calcWorkflowProgress(entry, state);
    const steps = enrichWiringSteps(entry.wiring_steps);
    const ngItems = steps
        .map((s, i) => ({ s, r: state.wiringResults[i] }))
        .filter(({ r }) => r?.status === 'ng');

    const ngList =
        ngItems.length > 0
            ? `<ul class="space-y-2 text-sm">${ngItems
                  .map(
                      ({ s, r }, i) =>
                          `<li class="p-2 rounded-lg bg-red-50 border border-red-100">
                        <span class="font-mono text-red-800">단계 ${s.index + 1}</span>
                        ${escapeHtml(s.terminal_1)} — ${escapeHtml(s.normal)}
                        ${r.note ? `<p class="text-xs text-red-700 mt-1">${escapeHtml(r.note)}</p>` : ''}
                    </li>`
                  )
                  .join('')}</ul>`
            : '<p class="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">배선 점검에서 이상 항목이 없습니다.</p>';

    return `<section class="dtc-phase-panel space-y-4" data-phase="complete">
        <div class="rounded-xl border border-gray-200 p-4 bg-gray-50">
            <h3 class="text-sm font-semibold text-gray-800 mb-2">진단 요약</h3>
            <ul class="text-sm text-gray-700 space-y-1">
                <li>진행률: <strong>${progress.overall}%</strong></li>
                <li>예상 부위 확인: ${progress.partsDone} / ${progress.partsTotal}</li>
                <li>배선 점검: ${progress.wiringDone} / ${progress.wiringTotal} (이상 ${progress.ngCount}건)</li>
            </ul>
        </div>
        <div>
            <h4 class="text-xs font-semibold text-gray-600 uppercase mb-2">이상 배선 항목</h4>
            ${ngList}
        </div>
        ${renderCompleteImagesGridShell(entry)}
        <label class="block">
            <span class="text-sm font-medium text-gray-800">수리·조치 기록</span>
            <textarea id="dtc-repair-notes" rows="3" class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="교환 부품, 조치 내용, DTC 클리어 여부 등">${escapeHtml(state.repairNotes)}</textarea>
        </label>
        <div id="dtc-cross-refs-slot"></div>
        <div class="flex flex-wrap gap-2 pt-2">
            <button type="button" id="dtc-print-report" class="flex-1 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium">수리 완료 리포트 인쇄</button>
            <button type="button" class="dtc-goto-phase py-2.5 px-4 rounded-lg border text-sm" data-phase="wiring">배선 다시</button>
        </div>
    </section>`;
}

function updateProgressUi(root, entry, state) {
    const progress = calcWorkflowProgress(entry, state);
    const label = root.querySelector('#dtc-progress-label');
    const bar = root.querySelector('#dtc-progress-bar');
    if (label) {
        label.textContent = `${progress.overall}% · 배선 ${progress.wiringDone}/${progress.wiringTotal}`;
    }
    if (bar) bar.style.width = `${progress.overall}%`;
}

function refreshPanels(root, entry, state) {
    const panels = root.querySelector('#dtc-phase-panels');
    if (panels) panels.innerHTML = renderPhasePanel(entry, state);
    root.querySelectorAll('.dtc-phase-btn').forEach((btn) => {
        const active = btn.getAttribute('data-phase') === state.phase;
        btn.classList.toggle('bg-gray-900', active);
        btn.classList.toggle('text-white', active);
        btn.classList.toggle('border-gray-900', active);
        btn.classList.toggle('bg-white', !active);
        btn.classList.toggle('text-gray-600', !active);
        btn.classList.toggle('border-gray-200', !active);
    });
    updateProgressUi(root, entry, state);
}

function closeDtcImageModal() {
    document.getElementById('dtc-image-modal')?.remove();
    document.body.classList.remove('overflow-hidden');
}

function openDtcImageModal(signedUrl, title, index, total) {
    closeDtcImageModal();
    document.body.classList.add('overflow-hidden');
    const modal = document.createElement('div');
    modal.id = 'dtc-image-modal';
    modal.className = 'fixed inset-0 z-[200] flex flex-col bg-black/80 p-4';
    modal.innerHTML = `
        <div class="flex items-center justify-between text-white mb-2 shrink-0">
            <h3 class="text-sm font-medium truncate pr-4">${escapeHtml(title)} (${index + 1}/${total})</h3>
            <button type="button" id="dtc-modal-close" class="p-2 rounded-lg hover:bg-white/10 min-w-[44px] min-h-[44px]" aria-label="닫기">✕</button>
        </div>
        <div id="dtc-modal-viewer" class="flex-1 flex items-center justify-center overflow-auto bg-gray-900/50 rounded-lg min-h-0 touch-pan-x touch-pan-y">
            <p class="text-gray-300 text-sm">로딩 중...</p>
        </div>`;
    document.body.appendChild(modal);
    modal.querySelector('#dtc-modal-close')?.addEventListener('click', closeDtcImageModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeDtcImageModal();
    });
    const viewerEl = document.getElementById('dtc-modal-viewer');
    if (viewerEl) {
        renderWatermarkedImage(viewerEl, signedUrl, {
            className: 'max-w-full max-h-full object-contain',
            alt: title,
            loadingHtml: '<p class="text-gray-300 text-sm">워터마크 처리 중…</p>',
        }).catch(() => {
            if (viewerEl) viewerEl.innerHTML = '<p class="text-red-300 text-sm">이미지 로드 실패</p>';
        });
    }
}

/** @type {{ codeDisplay: string, items: { key: string, url: string }[], ready: boolean } | null} */
let dtcImageCache = null;

async function ensureDtcImageCache(entry) {
    if (dtcImageCache?.ready && dtcImageCache.codeDisplay === entry.codeDisplay) {
        return dtcImageCache;
    }
    const keys = entry.imageKeys || [];
    dtcImageCache = { codeDisplay: entry.codeDisplay, items: [], ready: false };
    if (!keys.length || !window.supabaseClient) {
        dtcImageCache.ready = true;
        return dtcImageCache;
    }
    const items = [];
    await Promise.all(
        keys.map(async (key, i) => {
            const { data, error } = await window.supabaseClient.storage
                .from(DTC_STORAGE_BUCKET)
                .createSignedUrl(key, 3600);
            if (!error && data?.signedUrl) items.push({ key, url: data.signedUrl, index: i });
        })
    );
    items.sort((a, b) => a.index - b.index);
    dtcImageCache.items = items;
    dtcImageCache.ready = true;
    return dtcImageCache;
}

async function syncPhaseCarousel(root, entry, state, cache) {
    const view = root.querySelector('#dtc-phase-image-view');
    if (!view || state.phase === 'complete') return;

    const indices = currentPhaseImageIndices(entry, state);
    const nav = root.querySelector('#dtc-phase-image-nav');
    const counter = root.querySelector('#dtc-phase-img-counter');

    if (!indices.length || !cache?.items?.length) {
        view.innerHTML = '<p class="text-sm text-gray-400 p-4 text-center">이 단계에 표시할 참고 이미지가 없습니다.</p>';
        view.onclick = null;
        if (nav) nav.classList.add('hidden');
        return;
    }

    const slide = Math.min(state.imageSlideIndex || 0, indices.length - 1);
    const globalIdx = indices[slide];
    const item = cache.items.find((x) => x.index === globalIdx);
    if (!item?.url) {
        view.innerHTML = '<p class="text-sm text-red-500 p-4">이미지 로드 실패</p>';
        return;
    }

    const phaseLabel = PHASES.find((p) => p.id === state.phase)?.label || '';
    const title = `${entry.codeDisplay} ${phaseLabel} (${globalIdx + 1})`;
    view.onclick = () => openDtcImageModal(item.url, title, globalIdx, cache.items.length);

    await renderWatermarkedImage(view, item.url, {
        className: 'max-w-full max-h-[min(50vh,420px)] object-contain',
        alt: `${phaseLabel} 참고 이미지`,
    });

    if (nav) nav.classList.toggle('hidden', indices.length <= 1);
    if (counter) counter.textContent = `${slide + 1} / ${indices.length}`;
}

async function syncCompleteImagesGrid(root, entry, cache) {
    const grid = root.querySelector('#dtc-complete-images-grid');
    if (!grid || !cache?.items?.length) return;

    const indices = resolveImageSlices(entry).complete;
    if (!indices.length) {
        grid.closest('.dtc-phase-images')?.remove();
        return;
    }

    grid.innerHTML = '<p class="text-sm text-gray-400 col-span-full text-center py-4">워터마크 처리 중…</p>';

    const cells = await Promise.all(
        indices.map(async (globalIdx) => {
            const item = cache.items.find((x) => x.index === globalIdx);
            if (!item?.url) return '';
            try {
                const wmUrl = await createWatermarkedDataUrl(item.url);
                return `<button type="button" class="dtc-complete-thumb relative aspect-[4/3] rounded-lg border overflow-hidden bg-gray-100 hover:ring-2 hover:ring-brand" data-dtc-img-idx="${globalIdx}">
                <img src="${wmUrl}" alt="" class="w-full h-full object-cover" loading="lazy" />
            </button>`;
            } catch {
                return `<button type="button" class="dtc-complete-thumb relative aspect-[4/3] rounded-lg border overflow-hidden bg-gray-100" data-dtc-img-idx="${globalIdx}">
                <img src="${item.url}" alt="" class="w-full h-full object-cover" loading="lazy" />
            </button>`;
            }
        })
    );

    grid.innerHTML = cells.filter(Boolean).join('');

    grid.querySelectorAll('.dtc-complete-thumb').forEach((btn) => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-dtc-img-idx'), 10);
            const item = cache.items.find((x) => x.index === idx);
            if (item) openDtcImageModal(item.url, `${entry.codeDisplay} 참고 ${idx + 1}`, idx, cache.items.length);
        });
    });
}

/**
 * @param {HTMLElement} root
 * @param {object} entry
 */
export function mountDtcWorkflow(root, entry) {
    if (!root || !entry) return;

    let state = loadWorkflowState(entry);
    dtcImageCache = null;

    const persist = () => {
        saveWorkflowState(entry, state);
        updateProgressUi(root, entry, state);
    };

    const afterPanelRefresh = async () => {
        const cache = await ensureDtcImageCache(entry);
        if (state.phase === 'complete') syncCompleteImagesGrid(root, entry, cache);
        else syncPhaseCarousel(root, entry, state, cache);
    };

    const setPhase = (phaseId) => {
        if (phaseId !== 'overview' && !state.hvSafetyAck) {
            alert('고전압 안전 확인을 완료한 후 진행할 수 있습니다.');
            return;
        }
        state.phase = phaseId;
        state.imageSlideIndex = 0;
        persist();
        refreshPanels(root, entry, state);
        bindPanelEvents();
        afterPanelRefresh();
        if (phaseId === 'complete') loadCrossRefs();
    };

    const loadCrossRefs = async () => {
        const slot = root.querySelector('#dtc-cross-refs-slot');
        if (!slot || !window.supabaseClient) return;
        const grade = (await window.authService?.getUserInfo())?.grade;
        const refs = await fetchDtcCrossRefs(window.supabaseClient, entry.code);
        slot.innerHTML = renderDtcCrossRefsHtml(refs, grade);
        bindDtcCrossRefLinks(root);
    };

    const bindPanelEvents = () => {
        root.querySelectorAll('.dtc-goto-phase').forEach((btn) => {
            btn.addEventListener('click', () => setPhase(btn.getAttribute('data-phase')));
        });

        root.querySelectorAll('.dtc-part-check').forEach((cb) => {
            cb.addEventListener('change', () => {
                const i = parseInt(cb.getAttribute('data-part-idx'), 10);
                state.partsChecked[i] = cb.checked;
                persist();
                refreshPanels(root, entry, state);
                bindPanelEvents();
                afterPanelRefresh();
            });
        });

        const selectAll = root.querySelector('#dtc-parts-select-all');
        if (selectAll) {
            selectAll.addEventListener('change', () => {
                state.partsChecked = state.partsChecked.map(() => selectAll.checked);
                persist();
                refreshPanels(root, entry, state);
                bindPanelEvents();
                afterPanelRefresh();
            });
        }

        root.querySelectorAll('.dtc-wiring-dot').forEach((dot) => {
            dot.addEventListener('click', () => {
                state.wiringIndex = parseInt(dot.getAttribute('data-wiring-idx'), 10);
                state.imageSlideIndex = 0;
                persist();
                refreshPanels(root, entry, state);
                bindPanelEvents();
                afterPanelRefresh();
            });
        });

        const saveWiringFields = () => {
            const measured = root.querySelector('#dtc-measured-input');
            const note = root.querySelector('#dtc-wiring-note');
            if (!state.wiringResults[state.wiringIndex]) {
                state.wiringResults[state.wiringIndex] = { status: null, measured: '', note: '' };
            }
            if (measured) state.wiringResults[state.wiringIndex].measured = measured.value;
            if (note) state.wiringResults[state.wiringIndex].note = note.value;
        };

        root.querySelectorAll('.dtc-wiring-status').forEach((btn) => {
            btn.addEventListener('click', () => {
                saveWiringFields();
                state.wiringResults[state.wiringIndex].status = btn.getAttribute('data-status');
                persist();
                refreshPanels(root, entry, state);
                bindPanelEvents();
                afterPanelRefresh();
            });
        });

        root.querySelector('#dtc-measured-input')?.addEventListener('change', () => {
            saveWiringFields();
            persist();
        });
        root.querySelector('#dtc-wiring-note')?.addEventListener('change', () => {
            saveWiringFields();
            persist();
        });

        root.querySelector('#dtc-wiring-prev')?.addEventListener('click', () => {
            saveWiringFields();
            if (state.wiringIndex > 0) {
                state.wiringIndex -= 1;
                state.imageSlideIndex = 0;
                persist();
                refreshPanels(root, entry, state);
                bindPanelEvents();
                afterPanelRefresh();
            }
        });

        root.querySelector('#dtc-wiring-next')?.addEventListener('click', () => {
            saveWiringFields();
            const total = entry.wiring_steps?.length || 0;
            if (state.wiringIndex < total - 1) {
                state.wiringIndex += 1;
                state.imageSlideIndex = 0;
                persist();
                refreshPanels(root, entry, state);
                bindPanelEvents();
                afterPanelRefresh();
            } else {
                setPhase('complete');
            }
        });

        root.querySelector('#dtc-phase-img-prev')?.addEventListener('click', async () => {
            if (state.imageSlideIndex > 0) {
                state.imageSlideIndex -= 1;
                persist();
                const cache = await ensureDtcImageCache(entry);
                syncPhaseCarousel(root, entry, state, cache);
            }
        });

        root.querySelector('#dtc-phase-img-next')?.addEventListener('click', async () => {
            const max = currentPhaseImageIndices(entry, state).length - 1;
            if (state.imageSlideIndex < max) {
                state.imageSlideIndex += 1;
                persist();
                const cache = await ensureDtcImageCache(entry);
                syncPhaseCarousel(root, entry, state, cache);
            }
        });

        root.querySelector('#dtc-repair-notes')?.addEventListener('input', (e) => {
            state.repairNotes = e.target.value;
            persist();
        });

        root.querySelectorAll('.dtc-hv-check').forEach((cb) => {
            cb.addEventListener('change', () => {
                const i = parseInt(cb.getAttribute('data-hv-idx'), 10);
                state.hvSafetyChecks[i] = cb.checked;
                state.hvSafetyAck = state.hvSafetyChecks.every(Boolean);
                persist();
                syncHvGateUi(root, state);
            });
        });

        root.querySelector('#dtc-hv-confirm')?.addEventListener('click', () => {
            if (!state.hvSafetyChecks.every(Boolean)) return;
            state.hvSafetyAck = true;
            persist();
            refreshPanels(root, entry, state);
            bindPanelEvents();
            afterPanelRefresh();
        });

        root.querySelector('#dtc-print-report')?.addEventListener('click', async () => {
            const userInfo = await window.authService?.getUserInfo();
            printDtcRepairReport(entry, state, {
                userInfo,
                workVin: getWorkVehicle()?.vin || '',
            });
        });
    };

    root.querySelectorAll('.dtc-phase-btn').forEach((btn) => {
        btn.addEventListener('click', () => setPhase(btn.getAttribute('data-phase')));
    });

    root.querySelector('#dtc-workflow-reset')?.addEventListener('click', () => {
        if (!confirm(`${entry.codeDisplay} 진단 기록을 초기화할까요?`)) return;
        localStorage.removeItem(storageKey(entry.codeDisplay));
        dtcImageCache = null;
        state = createDefaultState(entry);
        persist();
        refreshPanels(root, entry, state);
        bindPanelEvents();
        afterPanelRefresh();
    });

    bindPanelEvents();
    syncHvGateUi(root, state);
    ensureDtcImageCache(entry).then(() => afterPanelRefresh());
    if (state.phase === 'complete') loadCrossRefs();
}


