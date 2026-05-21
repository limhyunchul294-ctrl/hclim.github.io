/** 보증 데이터 CSV 파싱·VIN 정규화·파일 내 중복 제거 */

/** DB → 한글 CSV 헤더 (최말단 데이터보내기) */
export const WARRANTY_DB_TO_CSV_HEADER = {
    vin: '차대번호',
    model: '차종',
    year: '연식',
    release_date: '출고일자',
    general_warranty_expiry: '일반보증만료',
    general_warranty_km: '일반보증거리',
    drivetrain_warranty_expiry: '구동보증만료',
    drivetrain_warranty_km: '구동보증거리',
    battery_warranty_expiry: '배터리보증만료',
    battery_warranty_km: '배터리보증거리',
};

export const WARRANTY_CSV_HEADER_MAP = {
    차대번호: 'vin',
    차종: 'model',
    연식: 'year',
    출고일자: 'release_date',
    일반보증만료: 'general_warranty_expiry',
    일반보증거리: 'general_warranty_km',
    구동보증만료: 'drivetrain_warranty_expiry',
    구동보증거리: 'drivetrain_warranty_km',
    배터리보증만료: 'battery_warranty_expiry',
    배터리보증거리: 'battery_warranty_km',
};

export function normalizeWarrantyVin(vin) {
    return String(vin || '')
        .trim()
        .toUpperCase()
        .replace(/\s+/g, '');
}

/**
 * @param {string} text
 * @returns {{ rows: object[], meta: { rawLineCount: number, skippedInvalid: number, duplicateLines: number, uniqueVinCount: number } }}
 */
export function parseWarrantyCsvText(text) {
    const lines = String(text || '')
        .trim()
        .split(/\r?\n/)
        .filter((l) => l.trim());
    if (lines.length < 2) {
        return {
            rows: [],
            meta: { rawLineCount: 0, skippedInvalid: 0, duplicateLines: 0, uniqueVinCount: 0 },
        };
    }

    const headers = lines[0].split(',').map((h) => h.trim().replace(/\r/g, ''));
    const colIdx = {};
    headers.forEach((h, i) => {
        if (WARRANTY_CSV_HEADER_MAP[h]) colIdx[WARRANTY_CSV_HEADER_MAP[h]] = i;
    });
    const hasMapping = colIdx.vin !== undefined;

    const rawRows = [];
    let skippedInvalid = 0;

    for (let i = 1; i < lines.length; i++) {
        const c = lines[i].split(',');
        let row;
        if (hasMapping) {
            const g = (key) => (c[colIdx[key]] || '').trim().replace(/\r/g, '');
            const n = (key) => {
                const v = parseInt(g(key), 10);
                return Number.isNaN(v) ? null : v;
            };
            row = {
                vin: normalizeWarrantyVin(g('vin')),
                model: g('model'),
                year: g('year'),
                release_date: g('release_date') || null,
                general_warranty_expiry: g('general_warranty_expiry') || null,
                general_warranty_km: n('general_warranty_km'),
                drivetrain_warranty_expiry: g('drivetrain_warranty_expiry') || null,
                drivetrain_warranty_km: n('drivetrain_warranty_km'),
                battery_warranty_expiry: g('battery_warranty_expiry') || null,
                battery_warranty_km: n('battery_warranty_km'),
            };
        } else {
            row = {
                vin: normalizeWarrantyVin((c[0] || '').trim()),
                model: (c[1] || '').trim(),
                year: (c[2] || '').trim(),
                release_date: (c[3] || '').trim() || null,
                general_warranty_expiry: (c[4] || '').trim() || null,
                general_warranty_km: parseInt(c[5], 10) || null,
                drivetrain_warranty_expiry: (c[6] || '').trim() || null,
                drivetrain_warranty_km: parseInt(c[7], 10) || null,
                battery_warranty_expiry: (c[8] || '').trim() || null,
                battery_warranty_km: parseInt((c[9] || '').trim(), 10) || null,
            };
        }
        if (!row.vin || row.vin.length < 6) {
            skippedInvalid += 1;
            continue;
        }
        rawRows.push(row);
    }

    const byVin = new Map();
    for (const row of rawRows) {
        byVin.set(row.vin, row);
    }

    const duplicateLines = rawRows.length - byVin.size;
    const rows = [...byVin.values()].map((r) => ({
        ...r,
        updated_at: new Date().toISOString(),
    }));

    return {
        rows,
        meta: {
            rawLineCount: lines.length - 1,
            skippedInvalid,
            duplicateLines,
            uniqueVinCount: rows.length,
        },
    };
}

/**
 * DB에 이미 있는 VIN 수 추정 (배치 조회)
 * @param {string[]} vins
 */
const WARRANTY_CSV_EXPORT_KEYS = [
    'vin',
    'model',
    'year',
    'release_date',
    'general_warranty_expiry',
    'general_warranty_km',
    'drivetrain_warranty_expiry',
    'drivetrain_warranty_km',
    'battery_warranty_expiry',
    'battery_warranty_km',
];

/** @param {object[]} rows DB 행 */
export function warrantyRowsToCsvText(rows) {
    const headers = WARRANTY_CSV_EXPORT_KEYS.map((k) => WARRANTY_DB_TO_CSV_HEADER[k]);
    const lines = [headers.join(',')];
    for (const row of rows) {
        lines.push(
            WARRANTY_CSV_EXPORT_KEYS.map((k) => {
                const v = row[k];
                if (v === null || v === undefined) return '';
                return String(v).includes(',') ? `"${v}"` : String(v);
            }).join(','),
        );
    }
    return lines.join('\n');
}

export async function countExistingWarrantyVins(supabase, vins) {
    const unique = [...new Set(vins)];
    const existing = new Set();
    const chunk = 80;
    for (let i = 0; i < unique.length; i += chunk) {
        const batch = unique.slice(i, i + chunk);
        const { data, error } = await supabase.from('warranty_data').select('vin').in('vin', batch);
        if (error) throw error;
        (data || []).forEach((r) => existing.add(r.vin));
    }
    return existing.size;
}
