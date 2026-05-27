/**
 * LMS Vercel Serverless — GSW 브릿지 수신 (참고 구현)
 * 경로 예: api/auth/gsw-bridge.js → /api/auth/gsw-bridge
 *
 * 환경 변수: GSW_BRIDGE_SECRET (포털과 동일)
 * 선택: LMS_SESSION_COOKIE_NAME, LMS_DASHBOARD_PATH=/dashboard
 */

import { SignJWT, jwtVerify } from 'jose';

const DASHBOARD_PATH = process.env.LMS_DASHBOARD_PATH || '/dashboard';
const SESSION_COOKIE = process.env.LMS_SESSION_COOKIE_NAME || 'lms_gsw_session';

function getSecretKey() {
    const secret = process.env.GSW_BRIDGE_SECRET;
    if (!secret || secret.length < 16) throw new Error('GSW_BRIDGE_SECRET is not configured');
    return new TextEncoder().encode(secret);
}

async function verifyGswBridgeToken(token) {
    const { payload } = await jwtVerify(token, getSecretKey(), { algorithms: ['HS256'] });
    const email = String(payload.email || '').trim().toLowerCase();
    const gswUserId = String(payload.gsw_user_id ?? '').trim();
    const name = String(payload.name || '').trim();
    if (!email || !gswUserId || !name) throw new Error('Invalid bridge token payload');
    return {
        email,
        gsw_user_id: gswUserId,
        name,
        department: payload.department ? String(payload.department) : undefined,
    };
}

/**
 * TODO: LMS DB/Supabase에 맞게 사용자 upsert 및 세션 쿠키 발급
 * @param {{ email: string, gsw_user_id: string, name: string, department?: string }} user
 */
async function createLmsSessionForGswUser(user) {
    // 예: 기존 LMS 사용자 조회 → 없으면 생성 → 세션 토큰 반환
    const sessionValue = await new SignJWT({
        sub: user.gsw_user_id,
        email: user.email,
        name: user.name,
        src: 'gsw-bridge',
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .sign(getSecretKey());

    return sessionValue;
}

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.statusCode = 405;
        res.end('Method not allowed');
        return;
    }

    const url = new URL(req.url, `https://${req.headers.host || 'localhost'}`);
    const token = url.searchParams.get('token');
    if (!token) {
        res.statusCode = 302;
        res.setHeader('Location', `/login?error=missing_token`);
        res.end();
        return;
    }

    try {
        const profile = await verifyGswBridgeToken(token);
        const sessionToken = await createLmsSessionForGswUser(profile);

        res.statusCode = 302;
        res.setHeader(
            'Set-Cookie',
            `${SESSION_COOKIE}=${encodeURIComponent(sessionToken)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`,
        );
        res.setHeader('Location', DASHBOARD_PATH);
        res.end();
    } catch (err) {
        console.error('LMS gsw-bridge error:', err);
        res.statusCode = 302;
        res.setHeader('Location', `/login?error=invalid_bridge`);
        res.end();
    }
}
