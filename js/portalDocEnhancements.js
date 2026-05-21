/** 문서 페이지·TSB·DTC 트리 검색 등 포털 확장 마운트 */

import { searchDtc } from './dtcMapping.js';
import {
    fetchTsbBulletins,
    renderTsbBulletinPanelHtml,
    renderTsbBulletinList,
} from './tsbBulletins.js';
import { fetchManualDocumentMeta, renderManualVersionBannerHtml, resolveManualDocKey } from './manualVersions.js';
import { fetchEtmAnchors, etmAnchorsUi } from './etmAnchors.js';
import { getWorkVehicle } from './workVehicleContext.js';

/**
 * @param {string} docTitle
 * @param {string} path
 * @param {string|null} param
 * @param {{ getMaintenanceModel: () => string, handleDocumentSelection: (item: Element, id: string) => void, handleDtcSelection: (item: Element, id: string) => void }} hooks
 */
export async function enhanceDocPageAfterRender(docTitle, path, param, hooks) {
    const userInfo = await window.authService?.getUserInfo();
    const userGrade = userInfo?.grade;
    const work = getWorkVehicle();

    const bannerSlot = document.getElementById('doc-version-banner-slot');
    if (bannerSlot) {
        const docKey = resolveManualDocKey(docTitle, hooks.getMaintenanceModel?.());
        if (docKey && window.supabaseClient) {
            const meta = await fetchManualDocumentMeta(window.supabaseClient, docKey);
            bannerSlot.innerHTML = renderManualVersionBannerHtml(meta, userGrade);
        }
    }

    if (docTitle === 'TSB' && window.supabaseClient) {
        const panel = document.getElementById('tsb-bulletin-panel-wrap');
        if (panel) {
            const modelKey = work?.maintenanceModel || '';
            try {
                const bulletins = await fetchTsbBulletins(window.supabaseClient, { modelKey });
                const listEl = document.getElementById('tsb-bulletin-list');
                renderTsbBulletinList(listEl, {
                    bulletins,
                    userGrade,
                    onOpenTreeNode: (treeId) => {
                        const item = document.querySelector(`.tree-item[data-id="${treeId}"]`);
                        if (item) hooks.handleDocumentSelection(item, treeId);
                    },
                });
            } catch (e) {
                const listEl = document.getElementById('tsb-bulletin-list');
                if (listEl) listEl.innerHTML = `<p class="text-red-600 text-sm">${e.message || 'TSB 목록 오류'}</p>`;
            }

            const applyFilter = async () => {
                const q = document.getElementById('tsb-filter-q')?.value || '';
                const m = document.getElementById('tsb-filter-model')?.value || '';
                const bulletins = await fetchTsbBulletins(window.supabaseClient, { modelKey: m || null, q });
                renderTsbBulletinList(document.getElementById('tsb-bulletin-list'), {
                    bulletins,
                    userGrade,
                    onOpenTreeNode: (treeId) => {
                        const item = document.querySelector(`.tree-item[data-id="${treeId}"]`);
                        if (item) hooks.handleDocumentSelection(item, treeId);
                    },
                });
            };
            document.getElementById('tsb-filter-apply')?.addEventListener('click', () => void applyFilter());
            document.getElementById('tsb-filter-q')?.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') void applyFilter();
            });
        }
    }

    if (docTitle === 'DTC 매뉴얼') {
        wireDtcTreeSearch();
        if (param && param.startsWith('dtc-')) {
            setTimeout(() => {
                const item = document.querySelector(`.tree-item[data-id="${param}"]`);
                if (item) hooks.handleDtcSelection(item, param);
            }, 450);
        }
    }
}

export function wireDtcTreeSearch() {
    const input = document.querySelector('.doc-page[data-doc-kind="dtc"] .tree-search input');
    if (!input || input.dataset.dtcSearchWired === '1') return;
    input.dataset.dtcSearchWired = '1';

    input.addEventListener('input', () => {
        const q = input.value.trim();
        const treeItems = document.querySelectorAll('.doc-page[data-doc-kind="dtc"] .tree-item');
        if (!q) {
            treeItems.forEach((item) => {
                item.style.display = '';
            });
            return;
        }
        const matchIds = new Set(searchDtc(q));
        treeItems.forEach((item) => {
            const id = item.getAttribute('data-id') || '';
            const label = item.querySelector('.tree-label')?.textContent?.toLowerCase() || '';
            const show = matchIds.has(id) || label.includes(q.toLowerCase());
            item.style.display = show ? '' : 'none';
            if (show && item.closest('.tree-children')) {
                let p = item.parentElement;
                while (p) {
                    if (p.classList?.contains('tree-children')) {
                        p.classList.remove('collapsed');
                        p.classList.add('expanded');
                        const parentItem = p.previousElementSibling;
                        parentItem?.querySelector('.tree-toggle')?.classList.add('expanded');
                    }
                    p = p.parentElement;
                }
            }
        });
    });
}

/**
 * ETM PDF 뷰어에 앵커 바 삽입
 * @param {string} docNodeId
 * @param {number} initialPage
 */
export async function injectEtmAnchorBar(docNodeId, goToPageFn) {
    if (!window.supabaseClient || !docNodeId?.startsWith('etm-')) return;
    const anchors = await fetchEtmAnchors(window.supabaseClient, docNodeId);
    const { panelHtml, initialPage } = etmAnchorsUi(anchors);
    if (!panelHtml) return;
    const viewer = document.getElementById('document-viewer');
    const slot = viewer?.querySelector('.pdf-viewer-container') || viewer;
    if (!slot || document.getElementById('etm-anchor-bar')) return;
    const wrap = document.createElement('div');
    wrap.innerHTML = panelHtml;
    slot.insertBefore(wrap.firstElementChild, slot.firstChild);
    if (typeof goToPageFn === 'function' && initialPage > 1) {
        goToPageFn(initialPage);
    }
    document.querySelectorAll('.etm-goto-page').forEach((btn) => {
        btn.addEventListener('click', () => {
            const page = parseInt(btn.getAttribute('data-page'), 10);
            if (typeof goToPageFn === 'function') goToPageFn(page);
        });
    });
}
