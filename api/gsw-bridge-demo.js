import { buildLmsBridgeRedirectUrl, signGswBridgeToken } from './lib/gswBridgeToken.js';

export default async function handler(req, res) {
    if (process.env.GSW_BRIDGE_ALLOW_DEV !== 'true') {
        res.statusCode = 404;
        res.end('Not found');
        return;
    }

    if (req.method !== 'GET' && req.method !== 'POST') {
        res.statusCode = 405;
        res.end('Method not allowed');
        return;
    }

    try {
        const payload = {
            email: (process.env.GSW_BRIDGE_DEV_EMAIL || 'bridge-demo@evkmc.local').trim().toLowerCase(),
            gsw_user_id: process.env.GSW_BRIDGE_DEV_USER_ID || '0',
            name: process.env.GSW_BRIDGE_DEV_NAME || 'GSW 브릿지 데모',
            department: process.env.GSW_BRIDGE_DEV_DEPARTMENT || 'EVKMC A/S',
        };

        const { token } = await signGswBridgeToken(payload);
        const redirectUrl = buildLmsBridgeRedirectUrl(token);
        res.statusCode = 302;
        res.setHeader('Location', redirectUrl);
        res.end();
    } catch (err) {
        console.error('gsw-bridge-demo error:', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end(err?.message || 'Bridge demo failed');
    }
}
