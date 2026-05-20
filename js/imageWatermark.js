/**
 * 이미지 대각선 워터마크 (매뉴얼 imageViewerHTML과 동일 패턴)
 */

const watermarkDataUrlCache = new Map();
let cachedIp = null;
let cachedWatermarkText = null;
let cachedWatermarkTextAt = 0;
const WM_TEXT_TTL_MS = 5 * 60 * 1000;

async function fetchIpAddress() {
    if (cachedIp) return cachedIp;
    const apis = [
        { url: 'https://api.ipify.org?format=json', extract: (d) => d.ip },
        { url: 'https://api64.ipify.org?format=json', extract: (d) => d.ip },
    ];
    for (const api of apis) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            const res = await fetch(api.url, {
                signal: controller.signal,
                headers: { Accept: 'application/json' },
                cache: 'no-cache',
            });
            clearTimeout(timeoutId);
            if (!res.ok) continue;
            const data = await res.json();
            const ip = api.extract(data);
            if (ip) {
                cachedIp = ip;
                return ip;
            }
        } catch {
            /* try next */
        }
    }
    cachedIp = 'IP-unknown';
    return cachedIp;
}

/** @returns {Promise<string>} */
export async function getWatermarkText() {
    const now = Date.now();
    if (cachedWatermarkText && now - cachedWatermarkTextAt < WM_TEXT_TTL_MS) {
        return cachedWatermarkText;
    }
    const userInfo = (await window.authService?.getUserInfo?.()) || {};
    const ipAddress = await fetchIpAddress();
    const dateStr = new Date().toLocaleDateString('ko-KR');
    const wmName = userInfo.name || userInfo.username || 'USER';
    const wmAffil = userInfo.affiliation || '';
    cachedWatermarkText = `${wmName} - ${wmAffil} - ${ipAddress} - ${dateStr}`;
    cachedWatermarkTextAt = now;
    return cachedWatermarkText;
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width
 * @param {number} height
 * @param {string} wmText
 */
export function drawDiagonalWatermark(ctx, width, height, wmText) {
    ctx.save();
    const fontSize = Math.max(14, Math.min(width, height) * 0.025);
    ctx.font = `${fontSize}px NanumSquareR, "Malgun Gothic", "Apple SD Gothic Neo", sans-serif`;
    ctx.fillStyle = 'rgba(200, 0, 0, 0.18)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const diagonal = Math.sqrt(width ** 2 + height ** 2);
    const angle = -Math.atan2(height, width);
    const spacing = fontSize * 6;
    const stepX = ctx.measureText(wmText).width + spacing;

    for (let y = -diagonal; y < diagonal * 2; y += spacing) {
        for (let x = -diagonal; x < diagonal * 2; x += stepX) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.fillText(wmText, 0, 0);
            ctx.restore();
        }
    }
    ctx.restore();
}

/**
 * @param {string} imageUrl
 * @param {string} [wmText]
 * @returns {Promise<string>} data URL (JPEG)
 */
export async function createWatermarkedDataUrl(imageUrl, wmText) {
    if (watermarkDataUrlCache.has(imageUrl)) {
        return watermarkDataUrlCache.get(imageUrl);
    }
    const text = wmText || (await getWatermarkText());

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('canvas context unavailable'));
                    return;
                }
                ctx.drawImage(img, 0, 0);
                drawDiagonalWatermark(ctx, canvas.width, canvas.height, text);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
                watermarkDataUrlCache.set(imageUrl, dataUrl);
                resolve(dataUrl);
            } catch (e) {
                reject(e);
            }
        };
        img.onerror = () => reject(new Error('image load failed'));
        img.src = imageUrl;
    });
}

/**
 * @param {HTMLElement} container
 * @param {string} imageUrl
 * @param {{ className?: string, alt?: string, loadingHtml?: string }} [opts]
 * @returns {Promise<string|null>} watermarked data URL or null on failure
 */
export async function renderWatermarkedImage(container, imageUrl, opts = {}) {
    if (!container) return null;
    container.innerHTML =
        opts.loadingHtml ||
        '<p class="text-sm text-gray-400 p-4 text-center">워터마크 처리 중…</p>';
    try {
        const dataUrl = await createWatermarkedDataUrl(imageUrl);
        const img = document.createElement('img');
        img.src = dataUrl;
        img.className = opts.className || 'max-w-full max-h-full object-contain';
        img.alt = opts.alt || '';
        img.draggable = false;
        container.innerHTML = '';
        container.appendChild(img);
        return dataUrl;
    } catch (e) {
        console.error('워터마크 적용 실패:', e);
        const fallback = document.createElement('img');
        fallback.src = imageUrl;
        fallback.className = opts.className || 'max-w-full max-h-full object-contain';
        fallback.alt = opts.alt || '';
        container.innerHTML = '';
        container.appendChild(fallback);
        return null;
    }
}
