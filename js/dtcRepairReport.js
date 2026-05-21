/** DTC 수리 완료 인쇄 리포트 */

import { calcWorkflowProgress, enrichWiringSteps } from './dtcWorkflow.js';

function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/**
 * @param {object} entry
 * @param {object} state
 * @param {{ userInfo?: object, workVin?: string }} ctx
 */
export function printDtcRepairReport(entry, state, ctx = {}) {
    const progress = calcWorkflowProgress(entry, state);
    const steps = enrichWiringSteps(entry.wiring_steps);
    const user = ctx.userInfo || {};
    const now = new Date().toLocaleString('ko-KR');

    const wiringRows = steps
        .map((s, i) => {
            const r = state.wiringResults[i] || {};
            const st = r.status === 'ok' ? '정상' : r.status === 'ng' ? '이상' : r.status === 'skip' ? '생략' : '—';
            return `<tr><td>${i + 1}</td><td>${escapeHtml(s.terminal_1)}</td><td>${escapeHtml(s.normal)}</td><td>${st}</td><td>${escapeHtml(r.measured || '')}</td><td>${escapeHtml(r.note || '')}</td></tr>`;
        })
        .join('');

    const partsRows = (entry.suspected_parts || [])
        .map((p, i) => `<tr><td>${escapeHtml(p)}</td><td>${state.partsChecked[i] ? '✓' : '—'}</td></tr>`)
        .join('');

    const html = `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><title>DTC 수리 리포트 ${escapeHtml(entry.codeDisplay)}</title>
    <style>body{font-family:Malgun Gothic,sans-serif;padding:24px;font-size:12px}h1{font-size:18px}table{width:100%;border-collapse:collapse;margin:12px 0}th,td{border:1px solid #ccc;padding:6px;text-align:left}th{background:#f3f4f6}</style></head><body>
    <h1>DTC 진단·수리 완료 리포트</h1>
    <p><strong>코드</strong> ${escapeHtml(entry.codeDisplay)} · ${escapeHtml(entry.title)}</p>
    <p><strong>출력</strong> ${escapeHtml(now)} · <strong>기술자</strong> ${escapeHtml(user.name || '')} (${escapeHtml(user.username || '')}) · ${escapeHtml(user.affiliation || '')}</p>
    ${ctx.workVin ? `<p><strong>작업 VIN</strong> ${escapeHtml(ctx.workVin)}</p>` : ''}
    <p><strong>진행률</strong> ${progress.overall}% · 배선 ${progress.wiringDone}/${progress.wiringTotal} · 이상 ${progress.ngCount}건</p>
    <h2>예상 부위</h2><table><tr><th>부위</th><th>확인</th></tr>${partsRows || '<tr><td colspan="2">—</td></tr>'}</table>
    <h2>배선 점검</h2><table><tr><th>#</th><th>단자</th><th>기준</th><th>결과</th><th>측정</th><th>비고</th></tr>${wiringRows || '<tr><td colspan="6">—</td></tr>'}</table>
    <h2>수리·조치 기록</h2><p>${escapeHtml(state.repairNotes || '(없음)')}</p>
    <p style="margin-top:24px;font-size:10px;color:#666">EVKMC A/S 포털 — 내부 기록용. 무단 복제·외부 제공 금지.</p>
    </body></html>`;

    const w = window.open('', '_blank', 'width=800,height=900');
    if (!w) {
        alert('팝업이 차단되었습니다. 팝업 허용 후 다시 시도하세요.');
        return;
    }
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
}
