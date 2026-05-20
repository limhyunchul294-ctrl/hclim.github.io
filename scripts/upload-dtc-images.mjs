/**
 * DTC 도면 이미지 → Supabase Storage (dtc/E-0420/...)
 * 사용: npm run upload:dtc
 * 옵션: --code E-0420  단일 코드 | --dry-run
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { normalizeStorageKey, formatDtcCode } from './build-dtc-data.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const MAPPINGS_JSON = path.join(ROOT, 'DTC', 'images', 'dtc', 'mappings.json');
const IMAGES_ROOT = path.join(ROOT, 'DTC', 'images');
const BUCKET = 'dtc';
const PROJECT_URL = process.env.SUPABASE_URL || 'https://sesedcotooihnpjklqzs.supabase.co';

function getServiceRoleKey() {
    const flag = process.argv.indexOf('--key');
    if (flag !== -1 && process.argv[flag + 1]) {
        return process.argv[flag + 1];
    }
    return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY;
}

function isDryRun() {
    return process.argv.includes('--dry-run');
}

function getFilterCode() {
    const idx = process.argv.indexOf('--code');
    if (idx === -1 || !process.argv[idx + 1]) return null;
    return formatDtcCode(process.argv[idx + 1]);
}

function mimeForExt(ext) {
    const e = ext.toLowerCase();
    if (e === '.png') return 'image/png';
    if (e === '.jpg' || e === '.jpeg') return 'image/jpeg';
    return 'application/octet-stream';
}

/** 로컬 파일 경로 (대소문자 무시 탐색) */
function resolveLocalFile(relativePath) {
    const normalized = relativePath.replace(/\\/g, '/');
    const candidates = [
        path.join(ROOT, normalized),
        path.join(ROOT, 'DTC', normalized),
    ];

    for (const direct of candidates) {
        if (fs.existsSync(direct)) return direct;

        const dir = path.dirname(direct);
        const base = path.basename(direct);
        if (!fs.existsSync(dir)) continue;

        const entries = fs.readdirSync(dir);
        const found = entries.find((f) => f.toLowerCase() === base.toLowerCase());
        if (found) return path.join(dir, found);
    }
    return null;
}

function collectUploadJobs() {
    if (!fs.existsSync(MAPPINGS_JSON)) {
        console.error('❌ mappings.json 없음:', MAPPINGS_JSON);
        process.exit(1);
    }

    const raw = JSON.parse(fs.readFileSync(MAPPINGS_JSON, 'utf8'));
    const filterCode = getFilterCode();
    const jobs = [];

    for (const [codeDisplay, paths] of Object.entries(raw)) {
        if (filterCode && codeDisplay !== filterCode) continue;
        if (!Array.isArray(paths)) continue;

        for (const rel of paths) {
            const storageKey = normalizeStorageKey(rel);
            const localPath = resolveLocalFile(rel);
            if (!localPath) {
                console.warn(`⚠️ 로컬 파일 없음: ${rel}`);
                continue;
            }
            jobs.push({ storageKey, localPath, codeDisplay });
        }
    }

    return jobs;
}

async function main() {
    const key = getServiceRoleKey();
    const dryRun = isDryRun();

    const jobs = collectUploadJobs();
    if (jobs.length === 0) {
        console.error('❌ 업로드할 파일이 없습니다.');
        process.exit(1);
    }

    console.log(`📤 ${jobs.length}개 → ${BUCKET}/ (${dryRun ? 'dry-run' : 'live'})`);

    if (dryRun) {
        jobs.slice(0, 5).forEach((j) => console.log(`  ${j.storageKey} ← ${path.relative(ROOT, j.localPath)}`));
        if (jobs.length > 5) console.log(`  ... 외 ${jobs.length - 5}건`);
        return;
    }

    if (!key) {
        console.error('❌ SUPABASE_SERVICE_ROLE_KEY 또는 --key 가 필요합니다.');
        process.exit(1);
    }

    const supabase = createClient(PROJECT_URL, key);
    let ok = 0;
    let fail = 0;

    for (const job of jobs) {
        const body = fs.readFileSync(job.localPath);
        const ext = path.extname(job.localPath);
        const { error } = await supabase.storage.from(BUCKET).upload(job.storageKey, body, {
            contentType: mimeForExt(ext),
            upsert: true,
        });

        if (error) {
            console.error(`❌ ${job.storageKey}:`, error.message);
            fail += 1;
        } else {
            ok += 1;
            if (ok % 50 === 0 || ok === 1) {
                console.log(`✅ ${ok}/${jobs.length} ${job.storageKey}`);
            }
        }
    }

    console.log(`\n완료: 성공 ${ok}, 실패 ${fail}`);
    process.exit(fail > 0 ? 1 : 0);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
