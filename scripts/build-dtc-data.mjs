/**
 * DTC코드.xlsx → js/dtcData.js
 * 사용: npm run build:dtc
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DEFAULT_XLSX = path.join(ROOT, 'data', 'source', 'DTC코드.xlsx');
const OUT_FILE = path.join(ROOT, 'js', 'dtcData.js');

const XLSX_PATH = process.env.DTC_XLSX_PATH || DEFAULT_XLSX;

export function formatDtcCode(raw) {
    const digits = String(raw ?? '').replace(/\D/g, '');
    if (!digits) return '';
    return `E-${digits.padStart(4, '0')}`;
}

function cellStr(v) {
    if (v == null) return '';
    return String(v).trim();
}

function isCodeCell(v) {
    if (v == null) return false;
    const s = String(v).trim();
    return /^\d{3,4}$/.test(s);
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

function parseSheet(rows) {
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

function buildJsModule(entries, meta) {
    const json = JSON.stringify(entries, null, 2);
    return `/**
 * DTC 코드 데이터 (자동 생성 — 수정하지 마세요)
 * 생성: ${meta.builtAt}
 * 원본: ${meta.source}
 * 건수: ${entries.length}
 *
 * 재생성: npm run build:dtc
 */

/** @type {import('./dtcMapping.js').DtcEntry[]} */
export const DTC_ENTRIES = ${json};

export const DTC_META = ${JSON.stringify(meta, null, 2)};
`;
}

function main() {
    if (!fs.existsSync(XLSX_PATH)) {
        console.error('❌ 엑셀 파일 없음:', XLSX_PATH);
        process.exit(1);
    }

    const wb = XLSX.readFile(XLSX_PATH, { cellDates: false });
    const sheetName = wb.SheetNames.includes('DTC') ? 'DTC' : wb.SheetNames[0];
    const sheet = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

    const entries = parseSheet(rows);
    if (entries.length === 0) {
        console.error('❌ 파싱된 DTC 항목이 없습니다.');
        process.exit(1);
    }

    const multi = entries.filter((e) => e.causes.length > 1).length;
    const meta = {
        builtAt: new Date().toISOString(),
        source: path.relative(ROOT, XLSX_PATH).replace(/\\/g, '/'),
        sheet: sheetName,
        count: entries.length,
        multiCauseCount: multi,
    };

    fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
    fs.writeFileSync(OUT_FILE, buildJsModule(entries, meta), 'utf8');

    console.log(`✅ ${entries.length}건 → ${path.relative(ROOT, OUT_FILE)}`);
    console.log(`   다중 원인: ${multi}건`);
    console.log(`   샘플: ${entries[0].codeDisplay} ${entries[0].title}`);
}

main();
