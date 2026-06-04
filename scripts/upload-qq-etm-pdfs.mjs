/**
 * QQ_ETM/split 분할 PDF → Supabase Storage (manual/MASADA-QQ-ETM/)
 * 로컬 한글 파일명 → Storage ASCII 키(qq-etm-00.pdf 등)로 업로드
 *
 * 사용법:
 *   SUPABASE_SERVICE_ROLE_KEY=... node scripts/upload-qq-etm-pdfs.mjs
 *   node scripts/upload-qq-etm-pdfs.mjs --key <service_role_key>
 *   node scripts/upload-qq-etm-pdfs.mjs --id qq-etm-08-08   (특정 항목만)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { QQ_ETM_ITEMS, QQ_ETM_STORAGE_PREFIX } from '../js/etmMappingQQ.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ETM_DIR = path.join(ROOT, 'QQ_ETM', 'split');
const BUCKET = 'manual';
const PROJECT_URL = process.env.SUPABASE_URL || 'https://sesedcotooihnpjklqzs.supabase.co';

function getServiceRoleKey() {
    const flag = process.argv.indexOf('--key');
    if (flag !== -1 && process.argv[flag + 1]) {
        return process.argv[flag + 1];
    }
    return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY;
}

function getItemsToUpload() {
    const onlyIdx = process.argv.indexOf('--id');
    if (onlyIdx === -1 || !process.argv[onlyIdx + 1]) {
        return QQ_ETM_ITEMS;
    }
    const id = process.argv[onlyIdx + 1];
    const filtered = QQ_ETM_ITEMS.filter((it) => it.id === id);
    if (filtered.length === 0) {
        console.error(`❌ 항목 ID 없음: ${id}`);
        process.exit(1);
    }
    return filtered;
}

async function main() {
    const key = getServiceRoleKey();
    if (!key) {
        console.error('❌ SUPABASE_SERVICE_ROLE_KEY 환경 변수 또는 --key 인수가 필요합니다.');
        process.exit(1);
    }

    if (!fs.existsSync(ETM_DIR)) {
        console.error('❌ QQ_ETM/split 폴더 없음:', ETM_DIR);
        process.exit(1);
    }

    const items = getItemsToUpload();
    const supabase = createClient(PROJECT_URL, key);
    console.log(`📤 ${items.length}개 → ${BUCKET}/${QQ_ETM_STORAGE_PREFIX}/`);

    let ok = 0;
    let fail = 0;

    for (const it of items) {
        const localPath = path.join(ETM_DIR, it.file);
        if (!fs.existsSync(localPath)) {
            console.error(`❌ 로컬 파일 없음: ${it.file}`);
            fail += 1;
            continue;
        }

        const storagePath = `${QQ_ETM_STORAGE_PREFIX}/${it.storageKey}`;
        const body = fs.readFileSync(localPath);

        const { error } = await supabase.storage.from(BUCKET).upload(storagePath, body, {
            contentType: 'application/pdf',
            upsert: true,
        });

        if (error) {
            console.error(`❌ ${it.file} → ${storagePath}:`, error.message);
            fail += 1;
        } else {
            console.log(`✅ ${storagePath} (${(body.length / 1024 / 1024).toFixed(2)} MB) ← ${it.file}`);
            ok += 1;
        }
    }

    console.log(`\n완료: 성공 ${ok}, 실패 ${fail}`);
    process.exit(fail > 0 ? 1 : 0);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
