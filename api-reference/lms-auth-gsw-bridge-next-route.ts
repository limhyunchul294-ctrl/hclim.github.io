/**
 * Next.js App Router — app/api/auth/gsw-bridge/route.ts
 * npm install jose
 *
 * env: GSW_BRIDGE_SECRET (포털과 동일)
 */

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';

const DASHBOARD_PATH = process.env.LMS_DASHBOARD_PATH || '/dashboard';
const SESSION_COOKIE = process.env.LMS_SESSION_COOKIE_NAME || 'lms_gsw_session';

function getSecretKey() {
    const secret = process.env.GSW_BRIDGE_SECRET;
    if (!secret || secret.length < 16) {
        throw new Error('GSW_BRIDGE_SECRET is not configured');
    }
    return new TextEncoder().encode(secret);
}

async function verifyGswBridgeToken(token: string) {
    const { payload } = await jwtVerify(token, getSecretKey(), { algorithms: ['HS256'] });
    const email = String(payload.email || '').trim().toLowerCase();
    const gsw_user_id = String(payload.gsw_user_id ?? '').trim();
    const name = String(payload.name || '').trim();
    if (!email || !gsw_user_id || !name) throw new Error('Invalid bridge token payload');
    return {
        email,
        gsw_user_id,
        name,
        department: payload.department ? String(payload.department) : undefined,
    };
}

/** TODO: LMS 사용자 DB 연동 후 실제 세션 발급 */
async function createLmsSessionForGswUser(user: {
    email: string;
    gsw_user_id: string;
    name: string;
    department?: string;
}) {
    return new SignJWT({ sub: user.gsw_user_id, email: user.email, name: user.name, src: 'gsw-bridge' })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .sign(getSecretKey());
}

export async function GET(req: NextRequest) {
    const token = req.nextUrl.searchParams.get('token');
    const origin = req.nextUrl.origin;

    if (!token) {
        return NextResponse.redirect(new URL('/login?error=missing_token', origin));
    }

    try {
        const profile = await verifyGswBridgeToken(token);
        const sessionToken = await createLmsSessionForGswUser(profile);
        const res = NextResponse.redirect(new URL(DASHBOARD_PATH, origin));
        res.cookies.set(SESSION_COOKIE, sessionToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        });
        return res;
    } catch (e) {
        console.error('gsw-bridge', e);
        return NextResponse.redirect(new URL('/login?error=invalid_bridge', origin));
    }
}
