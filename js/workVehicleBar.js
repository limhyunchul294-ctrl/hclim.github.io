/** 작업 차량 상단 바 UI */

import { getWorkVehicle, clearWorkVehicle, inferMaintenanceModel } from './workVehicleContext.js';
import { getProductLine, LINE_QQ, toAppHash } from './productLine.js';

function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function lineFromVehicle(vehicle) {
    if (vehicle?.maintenanceModel === 'masada-qq') return LINE_QQ;
    return getProductLine() || 'van';
}

export function renderWorkVehicleBarHtml(vehicle) {
    if (!vehicle?.vin) {
        const warrantyHref = toAppHash('/warranty', getProductLine() || 'van');
        return `<div id="work-vehicle-bar" class="border-b border-dashed border-sky-200 bg-sky-50/60">
            <div class="mx-auto max-w-7xl px-4 py-2 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <span class="font-medium text-gray-800">작업 차량</span>
                <span class="text-gray-500">미지정 —</span>
                <a href="${warrantyHref}" class="text-sky-700 font-medium hover:underline">보증 조회에서 VIN 설정</a>
            </div>
        </div>`;
    }
    const modelLabel = vehicle.model || inferMaintenanceModel(vehicle.model, vehicle.year);
    const line = lineFromVehicle(vehicle);
    const showDtcTsb = line !== LINE_QQ;
    return `<div id="work-vehicle-bar" class="border-b border-sky-200 bg-sky-50">
        <div class="mx-auto max-w-7xl px-4 py-2 flex flex-wrap items-center gap-2 text-sm">
            <span class="font-semibold text-gray-900">작업 차량</span>
            <span class="font-mono text-sky-800">${escapeHtml(vehicle.vin)}</span>
            <span class="text-gray-600">${escapeHtml(modelLabel)} ${vehicle.year ? escapeHtml(String(vehicle.year)) : ''}</span>
            ${vehicle.warrantyOverall ? `<span class="px-2 py-0.5 rounded-full text-xs font-bold ${vehicle.warrantyOverall === '보증중' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}">${escapeHtml(vehicle.warrantyOverall)}</span>` : ''}
            <span class="flex-1"></span>
            <button type="button" id="wv-open-sm" class="px-2 py-1 text-xs border border-sky-300 rounded-lg hover:bg-white">정비지침서</button>
            ${showDtcTsb ? `<button type="button" id="wv-open-dtc" class="px-2 py-1 text-xs border border-sky-300 rounded-lg hover:bg-white">DTC</button>
            <button type="button" id="wv-open-tsb" class="px-2 py-1 text-xs border border-sky-300 rounded-lg hover:bg-white">TSB</button>` : ''}
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
    const line = lineFromVehicle(v);
    wrap.querySelector('#wv-clear')?.addEventListener('click', () => clearWorkVehicle());
    wrap.querySelector('#wv-open-sm')?.addEventListener('click', () => {
        const m = v?.maintenanceModel || (line === LINE_QQ ? 'masada-qq' : 'masada-2van');
        const query = line === LINE_QQ ? {} : { model: m };
        window.location.hash = toAppHash('/shop', line, query);
    });
    wrap.querySelector('#wv-open-dtc')?.addEventListener('click', () => {
        window.location.hash = toAppHash('/dtc', line);
    });
    wrap.querySelector('#wv-open-tsb')?.addEventListener('click', () => {
        window.location.hash = toAppHash('/tsb', line);
    });
}

/** 보증 조회 성공 후 CTA HTML */
export function renderWarrantyVehicleCtaHtml(vehicle) {
    if (!vehicle?.vin) return '';
    const line = lineFromVehicle(vehicle);
    const m = vehicle.maintenanceModel || (line === LINE_QQ ? 'masada-qq' : 'masada-2van');
    const showDtcTsb = line !== LINE_QQ;
    return `<div id="w-vehicle-cta" class="mt-4 p-4 bg-sky-50 border border-sky-200 rounded-xl">
        <p class="text-sm font-semibold text-gray-900 mb-2">이 차량을 작업 차량으로 설정했습니다</p>
        <div class="flex flex-wrap gap-2">
            <button type="button" id="w-cta-sm" class="px-4 py-2 text-sm bg-gray-800 text-white rounded-lg">정비지침서 열기</button>
            ${showDtcTsb ? `<button type="button" id="w-cta-dtc" class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white">DTC 매뉴얼</button>
            <button type="button" id="w-cta-tsb" class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white">TSB</button>` : ''}
        </div>
    </div>`;
}

export function bindWarrantyVehicleCta(vehicle) {
    const line = lineFromVehicle(vehicle);
    document.getElementById('w-cta-sm')?.addEventListener('click', () => {
        const m = vehicle?.maintenanceModel || (line === LINE_QQ ? 'masada-qq' : 'masada-2van');
        const query = line === LINE_QQ ? {} : { model: m };
        window.location.hash = toAppHash('/shop', line, query);
    });
    document.getElementById('w-cta-dtc')?.addEventListener('click', () => {
        window.location.hash = toAppHash('/dtc', line);
    });
    document.getElementById('w-cta-tsb')?.addEventListener('click', () => {
        window.location.hash = toAppHash('/tsb', line);
    });
}
