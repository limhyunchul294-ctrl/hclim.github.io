/**
 * GSW_BRIDGE_SECRET 등을 Vercel 프로젝트에 등록
 * 사용: VERCEL_TOKEN=xxx node scripts/set-vercel-bridge-env.mjs
 * 토큰: https://vercel.com/account/tokens
 */
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEAM_ID = 'team_mOdjx4N6KbjbSTDbMe9sZNkm';

const PROJECTS = [
    { id: 'prj_woVkRISdDrvM6ALpEM6OxBIFd5bM', name: 'evkmc-as-app' },
    { id: 'prj_0UAK8SbpK4JBq4zGNIoUZvunc3Xc', name: 'lms-youtube-testbed' },
];

const SUPABASE_URL = 'https://sesedcotooihnpjklqzs.supabase.co';
const SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlc2VkY290b29paG5wamtscXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjA5ODAsImV4cCI6MjA3NDgzNjk4MH0.AcbNoC19S_shBKXXs6-2LOo0KSnZ_Mk1ZejZtUX1EmI';

function loadVercelToken() {
    if (process.env.VERCEL_TOKEN?.trim()) return process.env.VERCEL_TOKEN.trim();
    const tokenFile = path.join(__dirname, '.vercel-token');
    if (fs.existsSync(tokenFile)) {
        return fs.readFileSync(tokenFile, 'utf8').trim();
    }
    return null;
}

function loadOrCreateSecret() {
    const secretFile = path.join(__dirname, '.gsw-bridge-secret');
    if (fs.existsSync(secretFile)) {
        return fs.readFileSync(secretFile, 'utf8').trim();
    }
    const secret = crypto.randomBytes(32).toString('base64url');
    fs.writeFileSync(secretFile, secret, 'utf8');
    console.log('새 시크릿 생성:', secretFile);
    return secret;
}

async function api(token, method, url, body) {
    const res = await fetch(url, {
        method,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let data;
    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        data = { raw: text };
    }
    return { status: res.status, data };
}

async function upsertEnv(token, projectId, key, value, targets = ['production', 'preview', 'development']) {
    const listUrl = `https://api.vercel.com/v9/projects/${projectId}/env?teamId=${TEAM_ID}`;
    const { status, data } = await api(token, 'GET', listUrl);
    if (status !== 200) {
        throw new Error(`env list failed ${status}: ${JSON.stringify(data)}`);
    }
    const existing = (data.envs || []).find((e) => e.key === key && e.target?.every((t) => targets.includes(t)));
    if (existing) {
        const patchUrl = `https://api.vercel.com/v9/projects/${projectId}/env/${existing.id}?teamId=${TEAM_ID}`;
        const patch = await api(token, 'PATCH', patchUrl, { value, target: targets });
        if (patch.status !== 200) throw new Error(`patch ${key}: ${patch.status} ${JSON.stringify(patch.data)}`);
        return 'updated';
    }
    const createUrl = `https://api.vercel.com/v10/projects/${projectId}/env?teamId=${TEAM_ID}`;
    const created = await api(token, 'POST', createUrl, {
        key,
        value,
        type: 'encrypted',
        target: targets,
    });
    if (created.status !== 200 && created.status !== 201) {
        throw new Error(`create ${key}: ${created.status} ${JSON.stringify(created.data)}`);
    }
    return 'created';
}

async function main() {
    const token = loadVercelToken();
    if (!token) {
        console.error('VERCEL_TOKEN 환경 변수 또는 scripts/.vercel-token 파일이 필요합니다.');
        console.error('  https://vercel.com/account/tokens 에서 생성 후:');
        console.error('  $env:VERCEL_TOKEN="..." ; node scripts/set-vercel-bridge-env.mjs');
        process.exit(1);
    }

    const bridgeSecret = loadOrCreateSecret();
    const lmsBridge = 'https://lms-youtube-testbed.vercel.app/auth/gsw';
    const portalVars = {
        GSW_BRIDGE_SECRET: bridgeSecret,
        SUPABASE_URL: SUPABASE_URL,
        SUPABASE_ANON_KEY: SUPABASE_ANON_KEY,
        GSW_LMS_BRIDGE_URL: lmsBridge,
        VITE_GSW_LMS_BRIDGE_URL: lmsBridge,
    };
    const lmsVars = {
        GSW_BRIDGE_SECRET: bridgeSecret,
        NEXT_PUBLIC_GSW_PORTAL_URL: 'https://evkmc-as-app.vercel.app',
    };

    for (const p of PROJECTS) {
        console.log(`\n=== ${p.name} ===`);
        const vars = p.name === 'evkmc-as-app' ? portalVars : lmsVars;
        for (const [key, value] of Object.entries(vars)) {
            const action = await upsertEnv(token, p.id, key, value);
            console.log(`  ${key}: ${action}`);
        }
    }

    console.log('\n완료. Vercel 대시보드에서 Redeploy 하세요.');
    console.log('(자동 배포는 env 변경 후 다음 커밋/재배포 시 반영됩니다)');
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
