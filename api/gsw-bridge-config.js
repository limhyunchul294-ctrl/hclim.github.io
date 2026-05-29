import { getLmsBridgeUrl } from './lib/gswBridgeToken.js';

function json(res, status, body) {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'private, max-age=60');
    res.end(JSON.stringify(body));
}

/** 클라이언트 redirect용 LMS URL (Vercel 서버 env 기준, 빌드 시 localhost 박힘 방지) */
export default function handler(req, res) {
    if (req.method !== 'GET') {
        return json(res, 405, { error: 'Method not allowed' });
    }
    return json(res, 200, { lmsBridgeUrl: getLmsBridgeUrl() });
}
