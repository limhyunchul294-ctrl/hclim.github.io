import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig, signGswBridgeToken } from './lib/gswBridgeToken.js';

function json(res, status, body) {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(body));
}

async function resolvePortalProfile(supabase, user) {
    const userId = user.id;
    const userEmail = user.email?.trim().toLowerCase();

    let { data: profile } = await supabase
        .from('users')
        .select('profile_id, name, email, affiliation, username, phone, role, grade')
        .eq('auth_user_id', userId)
        .maybeSingle();

    if (!profile && userEmail) {
        const byEmail = await supabase
            .from('users')
            .select('profile_id, name, email, affiliation, username, phone, role, grade')
            .ilike('email', userEmail)
            .maybeSingle();
        profile = byEmail.data;
    }

    const email = (profile?.email || userEmail || '').trim().toLowerCase();
    const gswUserId = profile?.profile_id != null ? String(profile.profile_id) : userId;
    const name = (
        profile?.name ||
        profile?.username ||
        profile?.email ||
        userEmail ||
        '사용자'
    ).trim();
    const department = profile?.affiliation?.trim() || undefined;
    const username = profile?.username?.trim() || undefined;
    const phone = profile?.phone?.trim() || undefined;
    const role = profile?.role?.trim() || undefined;
    const grade = profile?.grade?.trim() || undefined;

    return { email, gsw_user_id: gswUserId, name, department, username, phone, role, grade };
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return json(res, 405, { error: 'Method not allowed' });
    }

    const authHeader = req.headers.authorization || req.headers.Authorization || '';
    const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (!bearer) {
        return json(res, 401, { error: 'Missing Authorization Bearer token' });
    }

    const { url, anonKey } = getSupabaseConfig();

    try {
        const supabase = createClient(url, anonKey);
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser(bearer);

        if (userError || !user) {
            return json(res, 401, { error: 'Invalid or expired session' });
        }

        const userClient = createClient(url, anonKey, {
            global: { headers: { Authorization: `Bearer ${bearer}` } },
        });
        const profile = await resolvePortalProfile(userClient, user);
        if (!profile.email) {
            return json(res, 403, { error: 'Portal user email is required for LMS bridge' });
        }

        const { token, expiresIn } = await signGswBridgeToken(profile);
        return json(res, 200, { token, expiresIn });
    } catch (err) {
        console.error('gsw-bridge-token error:', err);
        const msg = err?.message?.includes('GSW_BRIDGE_SECRET')
            ? 'Bridge is not configured (GSW_BRIDGE_SECRET)'
            : 'Failed to issue bridge token';
        return json(res, 500, { error: msg });
    }
}
