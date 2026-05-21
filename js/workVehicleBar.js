/** 작업 차량 상단 바 UI */

import { getWorkVehicle, clearWorkVehicle, inferMaintenanceModel } from './workVehicleContext.js';

function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

export function renderWorkVehicleBarHtml(vehicle) {
    if (!vehicle?.vin) {
        return `<div id="work-vehicle-bar" class="border-b border-dashed border-sky-200 bg-sky-50/60">
            <div class="mx-auto max-w-7xl px-4 py-2 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <span class="font-medium text-gray-800">작업 차량</span>
                <span class="text-gray-500">미지정 —</span>
                <a href="#/warranty" class="text-sky-700 font-medium hover:underline">보증 조회에서 VIN 설정</a>
            </div>
        </div>`;
    }
    const modelLabel = vehicle.model || inferMaintenanceModel(vehicle.model, vehicle.year);
    return `<div id="work-vehicle-bar" class="border-b border-sky-200 bg-sky-50">
        <div class="mx-auto max-w-7xl px-4 py-2 flex flex-wrap items-center gap-2 text-sm">
            <span class="font-semibold text-gray-900">작업 차량</span>
            <span class="font-mono text-sky-800">${escapeHtml(vehicle.vin)}</span>
            <span class="text-gray-600">${escapeHtml(modelLabel)} ${vehicle.year ? escapeHtml(String(vehicle.year)) : ''}</span>
            ${vehicle.warrantyOverall ? `<span class="px-2 py-0.5 rounded-full text-xs font-bold ${vehicle.warrantyOverall === '보증중' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}">${escapeHtml(vehicle.warrantyOverall)}</span>` : ''}
            <span class="flex-1"></span>
            <button type="button" id="wv-open-sm" class="px-2 py-1 text-xs border border-sky-300 rounded-lg hover:bg-white">정비지침서</button>
            <button type="button" id="wv-open-dtc" class="px-2 py-1 text-xs border border-sky-300 rounded-lg hover:bg-white">DTC</button>
            <button type="button" id="wv-open-tsb" class="px-2 py-1 text-xs border border-sky-300 rounded-lg hover:bg-white">TSB</button>
            <button type="button" id="wv-clear" class="px-2 py-1 text-xs text-gray-500 hover:text-red-600" title="작업 차량 해제">✕</button>
        </div>
    </div>`;
}

/** @param {HTMLElement} wrap */
export function mountWorkVehicleBar(wrap) {
    if (!wrap) return;
    const refresh = () => {
        wrap.innerHTML = renderWorkVehicleBarHtml(getWorkVehicle());
        bindWorkVehicleBar(wrap);
    };
    refresh();
    window.addEventListener('gsw-work-vehicle-changed', refresh);
}

function bindWorkVehicleBar(wrap) {
    const v = getWorkVehicle();
    wrap.querySelector('#wv-clear')?.addEventListener('click', () => clearWorkVehicle());
    wrap.querySelector('#wv-open-sm')?.addEventListener('click', () => {
        const m = v?.maintenanceModel || 'masada-2van';
        window.location.hash = `#/shop?model=${encodeURIComponent(m)}`;
    });
    wrap.querySelector('#wv-open-dtc')?.addEventListener('click', () => {
        window.location.hash = '#/dtc';
    });
    wrap.querySelector('#wv-open-tsb')?.addEventListener('click', () => {
        window.location.hash = '#/tsb';
    });
}

/** 보증 조회 성공 후 CTA HTML */
export function renderWarrantyVehicleCtaHtml(vehicle) {
    if (!vehicle?.vin) return '';
    const m = vehicle.maintenanceModel || 'masada-2van';
    return `<div id="w-vehicle-cta" class="mt-4 p-4 bg-sky-50 border border-sky-200 rounded-xl">
        <p class="text-sm font-semibold text-gray-900 mb-2">이 차량을 작업 차량으로 설정했습니다</p>
        <div class="flex flex-wrap gap-2">
            <button type="button" id="w-cta-sm" class="px-4 py-2 text-sm bg-gray-800 text-white rounded-lg">정비지침서 열기</button>
            <button type="button" id="w-cta-dtc" class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white">DTC 매뉴얼</button>
            <button type="button" id="w-cta-tsb" class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white">TSB</button>
        </div>
    </div>`;
}

export function bindWarrantyVehicleCta(vehicle) {
    document.getElementById('w-cta-sm')?.addEventListener('click', () => {
        const m = vehicle?.maintenanceModel || 'masada-2van';
        window.location.hash = `#/shop?model=${encodeURIComponent(m)}`;
    });
    document.getElementById('w-cta-dtc')?.addEventListener('click', () => {
        window.location.hash = '#/dtc';
    });
    document.getElementById('w-cta-tsb')?.addEventListener('click', () => {
        window.location.hash = '#/tsb';
    });
}
