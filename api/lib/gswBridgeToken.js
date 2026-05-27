import { createHmac } from 'crypto';

const DEFAULT_TTL_SEC = 300;

function getSecret() {
    const secret = process.env.GSW_BRIDGE_SECRET;
    if (!secret || secret.length < 16) {
        throw new Error('GSW_BRIDGE_SECRET is not configured');
    }
    return secret;
}

function getTtlSec() {
    const raw = process.env.GSW_BRIDGE_TOKEN_TTL_SEC;
    const n = raw ? parseInt(raw, 10) : DEFAULT_TTL_SEC;
    return Number.isFinite(n) && n > 0 ? Math.min(n, 900) : DEFAULT_TTL_SEC;
}

function base64UrlEncode(buf) {
    return buf
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

/**
 * LMS @/lib/gsw-bridge 와 동일: payloadB64 + '.' + HMAC-SHA256 서명
 * payload: { email, name?, gsw_user_id, department?, exp: unixSeconds }
 *
 * @param {{ email: string, gsw_user_id: string|number, name: string, department?: string|null }} payload
 */
export function signGswBridgeToken(payload) {
    const email = String(payload.email || '').trim().toLowerCase();
    const gswUserId = String(payload.gsw_user_id ?? '').trim();
    const name = String(payload.name || '').trim();
    if (!email || !gswUserId) {
        throw new Error('Bridge token requires email and gsw_user_id');
    }

    const ttlSec = getTtlSec();
    const full = {
        email,
        gsw_user_id: gswUserId,
        name: name || email.split('@')[0],
        exp: Math.floor(Date.now() / 1000) + ttlSec,
    };
    const department = payload.department != null ? String(payload.department).trim() : '';
    if (department) full.department = department;

    const payloadB64 = base64UrlEncode(Buffer.from(JSON.stringify(full), 'utf8'));
    const sig = createHmac('sha256', getSecret()).update(payloadB64).digest();
    const token = `${payloadB64}.${base64UrlEncode(sig)}`;

    return { token, expiresIn: ttlSec };
}

export function getSupabaseConfig() {
    return {
        url: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://sesedcotooihnpjklqzs.supabase.co',
        anonKey:
            process.env.SUPABASE_ANON_KEY ||
            process.env.VITE_SUPABASE_ANON_KEY ||
            '',
    };
}

/** LMS `/auth/gsw?token=...` 수신 페이지 */
export function getLmsBridgeUrl() {
    return (
        process.env.GSW_LMS_BRIDGE_URL ||
        'https://lms-youtube-testbed.vercel.app/auth/gsw'
    ).replace(/\/$/, '');
}

export function buildLmsBridgeRedirectUrl(token) {
    const base = getLmsBridgeUrl();
    const sep = base.includes('?') ? '&' : '?';
    return `${base}${sep}token=${encodeURIComponent(token)}`;
}
