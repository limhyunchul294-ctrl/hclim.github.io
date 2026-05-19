/**
 * QQ_SM 챕터 PDF → Supabase Storage (manual/MASADA-QQ/)
 * 로컬 한글 파일명 → Storage ASCII 키(qq-01.pdf 등)로 업로드
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { QQ_CHAPTERS, QQ_SM_STORAGE_PREFIX } from '../js/maintenanceManualMappingQQ.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const QQ_DIR = path.join(ROOT, 'QQ_SM');
const BUCKET = 'manual';
const PROJECT_URL = process.env.SUPABASE_URL || 'https://sesedcotooihnpjklqzs.supabase.co';

function getServiceRoleKey() {
    const flag = process.argv.indexOf('--key');
    if (flag !== -1 && process.argv[flag + 1]) {
        return process.argv[flag + 1];
    }
    return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY;
}

async function main() {
    const key = getServiceRoleKey();
    if (!key) {
        console.error('❌ SUPABASE_SERVICE_ROLE_KEY 환경 변수 또는 --key 인수가 필요합니다.');
        process.exit(1);
    }

    if (!fs.existsSync(QQ_DIR)) {
        console.error('❌ QQ_SM 폴더 없음:', QQ_DIR);
        process.exit(1);
    }

    const supabase = createClient(PROJECT_URL, key);
    console.log(`📤 ${QQ_CHAPTERS.length}개 → ${BUCKET}/${QQ_SM_STORAGE_PREFIX}/`);

    let ok = 0;
    let fail = 0;

    for (const ch of QQ_CHAPTERS) {
        const localPath = path.join(QQ_DIR, ch.file);
        if (!fs.existsSync(localPath)) {
            console.error(`❌ 로컬 파일 없음: ${ch.file}`);
            fail += 1;
            continue;
        }

        const storagePath = `${QQ_SM_STORAGE_PREFIX}/${ch.storageKey}`;
        const body = fs.readFileSync(localPath);

        const { error } = await supabase.storage.from(BUCKET).upload(storagePath, body, {
            contentType: 'application/pdf',
            upsert: true,
        });

        if (error) {
            console.error(`❌ ${ch.file} → ${storagePath}:`, error.message);
            fail += 1;
        } else {
            console.log(`✅ ${storagePath} (${(body.length / 1024 / 1024).toFixed(2)} MB) ← ${ch.file}`);
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
