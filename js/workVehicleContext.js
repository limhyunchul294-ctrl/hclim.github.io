/** 작업 차량(VIN) 세션 컨텍스트 */

const STORAGE_KEY = 'gsw-work-vehicle-v1';

/**
 * @typedef {{
 *   vin: string,
 *   model?: string,
 *   year?: string,
 *   releaseDate?: string,
 *   maintenanceModel?: string,
 *   odometer?: number|null,
 *   warrantyOverall?: string,
 *   queriedAt?: string,
 * }} WorkVehicle
 */

/** @returns {WorkVehicle|null} */
export function getWorkVehicle() {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

/** @param {WorkVehicle|null} data */
export function setWorkVehicle(data) {
    if (!data?.vin) {
        sessionStorage.removeItem(STORAGE_KEY);
        window.dispatchEvent(new CustomEvent('gsw-work-vehicle-changed'));
        return;
    }
    sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
            ...data,
            vin: String(data.vin).replace(/[\s-]/g, '').toUpperCase(),
            queriedAt: data.queriedAt || new Date().toISOString(),
        }),
    );
    window.dispatchEvent(new CustomEvent('gsw-work-vehicle-changed'));
}

export function clearWorkVehicle() {
    sessionStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('gsw-work-vehicle-changed'));
}

/**
 * 보증 DB model 문자열 → 정비지침서 model key
 * @param {string} [modelStr]
 * @param {string|number} [year]
 */
export function inferMaintenanceModel(modelStr, year) {
    const m = String(modelStr || '').toUpperCase();
    if (m.includes('QQ')) return 'masada-qq';
    if (m.includes('4') && (m.includes('VAN') || m.includes('4VAN'))) return 'masada-4van';
    if (m.includes('CARGO') || m.includes('PICK') || m.includes('픽업')) return 'masada-cargo';
    if (m.includes('2') && m.includes('VAN')) return 'masada-2van';
    if (year && Number(year) >= 2024) return 'masada-qq';
    return 'masada-2van';
}

/**
 * @param {object} warrantyRow
 * @param {number|null} [odometer]
 */
export function workVehicleFromWarrantyRow(warrantyRow, odometer = null) {
    if (!warrantyRow?.vin) return null;
    const maintenanceModel = inferMaintenanceModel(warrantyRow.model, warrantyRow.year);
    return {
        vin: warrantyRow.vin,
        model: warrantyRow.model || '',
        year: warrantyRow.year != null ? String(warrantyRow.year) : '',
        releaseDate: warrantyRow.release_date || '',
        maintenanceModel,
        odometer,
        queriedAt: new Date().toISOString(),
    };
}
