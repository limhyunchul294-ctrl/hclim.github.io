/**
 * DTC 마이그레이션 JSON + DTC코드.xlsx(보조) → js/dtcData.js
 * 사용: npm run build:dtc
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const MIGRATED_JSON = path.join(ROOT, 'DTC', 'dtc_data.json');
const DEFAULT_GUIDE_XLSX = path.join(ROOT, 'DTC', 'EC31 35 DTC GUIDE 편집본 250630 기준.xlsx');
const MAPPINGS_JSON = path.join(ROOT, 'DTC', 'images', 'dtc', 'mappings.json');
const DEFAULT_XLSX = path.join(ROOT, 'data', 'source', 'DTC코드.xlsx');
const OUT_FILE = path.join(ROOT, 'js', 'dtcData.js');

const XLSX_PATH = process.env.DTC_XLSX_PATH || DEFAULT_XLSX;

export const DTC_STORAGE_BUCKET = 'dtc';

export function formatDtcCode(raw) {
    const digits = String(raw ?? '').replace(/\D/g, '');
    if (!digits) return '';
    return `E-${digits.padStart(4, '0')}`;
}

export function normCode(raw) {
    const digits = String(raw ?? '').replace(/\D/g, '').replace(/^0+/, '');
    return digits || '0';
}

/** images/dtc/E-0420/foo.JPG → dtc/E-0420/foo.jpg */
export function normalizeStorageKey(relativePath) {
    let p = String(relativePath || '').replace(/\\/g, '/').trim();
    p = p.replace(/^images\/dtc\//i, 'dtc/');
    if (!p.startsWith('dtc/')) {
        const m = p.match(/(?:^|\/)dtc\/(E-\d{4}\/.+)$/i);
        if (m) p = `dtc/${m[1]}`;
    }
    const parts = p.split('/');
    const file = parts.pop();
    if (!file) return p;
    const ext = path.extname(file).toLowerCase() || '.jpg';
    const base = path.basename(file, path.extname(file));
    parts.push(`${base}${ext === '.jpeg' ? '.jpg' : ext}`);
    return parts.join('/');
}

function stripTitlePrefix(title, codeDisplay) {
    const t = String(title || '').trim();
    const prefix = new RegExp(`^${codeDisplay.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'i');
    return t.replace(prefix, '').trim() || t;
}

function inferCategory(code) {
    const n = parseInt(code, 10);
    if (n >= 420 && n < 520) return '구동 시스템 (MCU & 모터)';
    if (n >= 520 && n < 620) return '고전압 배터리 시스템 (HVB & BMS)';
    if (n >= 620 && n < 720) return '충전 및 전력 변환 시스템 (OBC & DC-DC)';
    if (n >= 720) return '차량 제어 및 편의/샤시 시스템 (VCU, 브레이크, 조향 등)';
    return '기타';
}

function cellStr(v) {
    if (v == null) return '';
    return String(v).trim();
}

function isCodeCell(v) {
    if (v == null) return false;
    return /^\d{3,4}$/.test(String(v).trim());
}

function findDataStartRow(rows) {
    for (let i = 0; i < Math.min(rows.length, 15); i++) {
        const row = rows[i] || [];
        const joined = row.map((c) => cellStr(c)).join('|');
        if (joined.includes('에러 코드') || joined.includes('결함 유형')) {
            return i + 1;
        }
    }
    return 3;
}

function parseXlsxSheet(rows) {
    const entries = [];
    let cur = null;
    const startRow = findDataStartRow(rows);

    for (let i = startRow; i < rows.length; i++) {
        const row = rows[i] || [];
        const colCode = row[0];
        const colTitle = row[1];
        const colCause = row[2];
        const colAction = row[3];

        if (isCodeCell(colCode)) {
            if (cur) entries.push(cur);
            const code = String(colCode).trim();
            cur = {
                code,
                codeDisplay: formatDtcCode(code),
                title: cellStr(colTitle) || null,
                causes: [],
            };
            if (cellStr(colCause) || cellStr(colAction)) {
                cur.causes.push({ cause: cellStr(colCause), action: cellStr(colAction) });
            }
        } else if (cur && (cellStr(colCause) || cellStr(colAction))) {
            cur.causes.push({ cause: cellStr(colCause), action: cellStr(colAction) });
        }
    }
    if (cur) entries.push(cur);

    for (const e of entries) {
        if (!e.title) {
            const firstCause = e.causes.find((c) => c.cause)?.cause;
            e.title = firstCause || `DTC ${e.codeDisplay}`;
        }
        if (e.causes.length === 0) {
            e.causes.push({ cause: '—', action: '—' });
        }
    }
    return entries;
}

function loadImageMap() {
    if (!fs.existsSync(MAPPINGS_JSON)) {
        console.warn('⚠️ mappings.json 없음:', MAPPINGS_JSON);
        return {};
    }
    const raw = JSON.parse(fs.readFileSync(MAPPINGS_JSON, 'utf8'));
    const out = {};
    for (const [codeDisplay, paths] of Object.entries(raw)) {
        if (!Array.isArray(paths)) continue;
        out[codeDisplay] = paths.map(normalizeStorageKey).filter(Boolean);
    }
    return out;
}

function migratedToEntry(row, imageMap) {
    const code = normCode(row.code);
    const codeDisplay = formatDtcCode(code);
    const imageKeys = imageMap[codeDisplay] || imageMap[row.code] || [];
    return {
        code,
        codeDisplay,
        title: stripTitlePrefix(row.title, codeDisplay),
        category: row.category || inferCategory(code),
        explanation: row.explanation || '',
        suspected_parts: Array.isArray(row.suspected_parts) ? row.suspected_parts : [],
        wiring_steps: Array.isArray(row.wiring_steps) ? row.wiring_steps : [],
        causes: null,
        imageKeys,
    };
}

function xlsxToEntry(row, imageMap) {
    const code = normCode(row.code);
    const codeDisplay = row.codeDisplay || formatDtcCode(code);
    return {
        code,
        codeDisplay,
        title: stripTitlePrefix(row.title, codeDisplay),
        category: inferCategory(code),
        explanation: '',
        suspected_parts: [],
        wiring_steps: [],
        causes: row.causes,
        imageKeys: imageMap[codeDisplay] || [],
    };
}

function buildJsModule(entries, meta) {
    const json = JSON.stringify(entries, null, 2);
    return `/**
 * DTC 코드 데이터 (자동 생성 — 수정하지 마세요)
 * 생성: ${meta.builtAt}
 * 원본: ${meta.source}
 * 건수: ${entries.length} (마이그레이션 ${meta.migratedCount} + xlsx 보조 ${meta.xlsxOnlyCount})
 *
 * 재생성: npm run build:dtc
 */

/** @type {import('./dtcMapping.js').DtcEntry[]} */
export const DTC_ENTRIES = ${json};

export const DTC_META = ${JSON.stringify(meta, null, 2)};

export const DTC_STORAGE_BUCKET = ${JSON.stringify(DTC_STORAGE_BUCKET)};
`;
}

function main() {
    if (!fs.existsSync(MIGRATED_JSON)) {
        console.error('❌ 마이그레이션 JSON 없음:', MIGRATED_JSON);
        process.exit(1);
    }

    const imageMap = loadImageMap();
    const migrated = JSON.parse(fs.readFileSync(MIGRATED_JSON, 'utf8'));
    const masterCodes = new Set();
    const entries = [];

    for (const row of migrated) {
        const entry = migratedToEntry(row, imageMap);
        masterCodes.add(entry.code);
        entries.push(entry);
    }

    let xlsxOnlyCount = 0;
    if (fs.existsSync(XLSX_PATH)) {
        const wb = XLSX.readFile(XLSX_PATH, { cellDates: false });
        const sheetName = wb.SheetNames.includes('DTC') ? 'DTC' : wb.SheetNames[0];
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, defval: null });
        const xlsxEntries = parseXlsxSheet(rows);

        for (const row of xlsxEntries) {
            const code = normCode(row.code);
            if (masterCodes.has(code)) continue;
            entries.push(xlsxToEntry(row, imageMap));
            xlsxOnlyCount += 1;
        }
    } else {
        console.warn('⚠️ 보조 xlsx 없음:', XLSX_PATH);
    }

    entries.sort((a, b) => Number(a.code) - Number(b.code));

    const withImages = entries.filter((e) => e.imageKeys?.length > 0).length;
    const meta = {
        builtAt: new Date().toISOString(),
        source: 'DTC/dtc_data.json (XLSX 가이드) + DTC코드.xlsx(보조)',
        guideXlsx: fs.existsSync(DEFAULT_GUIDE_XLSX)
            ? path.relative(ROOT, DEFAULT_GUIDE_XLSX).replace(/\\/g, '/')
            : null,
        migratedCount: migrated.length,
        xlsxOnlyCount,
        count: entries.length,
        withImagesCount: withImages,
        storageBucket: DTC_STORAGE_BUCKET,
    };

    fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
    fs.writeFileSync(OUT_FILE, buildJsModule(entries, meta), 'utf8');

    console.log(`✅ ${entries.length}건 → ${path.relative(ROOT, OUT_FILE)}`);
    console.log(`   마이그레이션: ${migrated.length}, xlsx 보조: ${xlsxOnlyCount}`);
    console.log(`   도면 연동: ${withImages}건`);
    console.log(`   샘플: ${entries[0].codeDisplay} ${entries[0].title}`);
}

const isMain =
    process.argv[1] &&
    path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) main();
