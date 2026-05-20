/**
 * DTC 시트 이미지 배치 — 엑셀 시트 상→하 순서(개요 → 부위 → 배선 → 완료)
 */

/**
 * @param {number} imageCount
 * @param {number} partsCount
 * @param {number} wiringStepCount
 * @returns {{ overview: number[], parts: number[], wiring: number[][], complete: number[] }}
 */
export function buildImageSlices(imageCount, partsCount, wiringStepCount) {
    const wCount = wiringStepCount || 0;
    const pCount = partsCount || 0;
    const emptyWiring = wCount > 0 ? Array.from({ length: wCount }, () => []) : [];

    if (!imageCount) {
        return { overview: [], parts: [], wiring: emptyWiring, complete: [] };
    }

    const overviewWeight = 2;
    const completeWeight = 1;
    const partsWeight = Math.max(pCount, 1);
    const wiringWeight = wCount > 0 ? wCount * 2 : 0;
    const totalWeight = overviewWeight + partsWeight + completeWeight + wiringWeight;

    const alloc = (w) => (w > 0 ? Math.max(1, Math.round((imageCount * w) / totalWeight)) : 0);

    const counts = {
        overviewN: alloc(overviewWeight),
        partsN: alloc(partsWeight),
        wiringN: alloc(wiringWeight),
        completeN: alloc(completeWeight),
    };

    let sum = counts.overviewN + counts.partsN + counts.wiringN + counts.completeN;
    const shrinkOrder = ['wiringN', 'partsN', 'completeN', 'overviewN'];
    const minFor = (key) => {
        if (key === 'wiringN') return wCount > 0 ? 1 : 0;
        if (key === 'partsN') return pCount > 0 ? 1 : 0;
        return 1;
    };

    while (sum > imageCount) {
        let reduced = false;
        for (const key of shrinkOrder) {
            if (sum <= imageCount) break;
            if (counts[key] > minFor(key)) {
                counts[key]--;
                sum--;
                reduced = true;
                break;
            }
        }
        if (!reduced) break;
    }
    while (sum < imageCount) {
        if (wCount > 0) counts.wiringN++;
        else if (pCount > 0) counts.partsN++;
        else counts.overviewN++;
        sum++;
    }

    const { overviewN, partsN, wiringN } = counts;

    let cursor = 0;
    const take = (n) => {
        const out = [];
        for (let i = 0; i < n && cursor < imageCount; i++) out.push(cursor++);
        return out;
    };

    const overview = take(overviewN);
    const parts = take(partsN);
    const wiringFlat = take(wiringN);
    const complete = [];
    while (cursor < imageCount) complete.push(cursor++);

    const wiring = [...emptyWiring];
    if (wCount > 0 && wiringFlat.length) {
        for (let i = 0; i < wiringFlat.length; i++) {
            const step = Math.min(wCount - 1, Math.floor((i * wCount) / wiringFlat.length));
            wiring[step].push(wiringFlat[i]);
        }
        for (let s = 0; s < wCount; s++) {
            if (!wiring[s].length) {
                wiring[s].push(wiringFlat[Math.min(s, wiringFlat.length - 1)]);
            }
        }
    }

    return { overview, parts, wiring, complete };
}

/**
 * @param {object} entry
 * @returns {{ overview: number[], parts: number[], wiring: number[][], complete: number[] }}
 */
export function resolveImageSlices(entry) {
    const n = entry.imageKeys?.length || 0;
    const w = entry.wiring_steps?.length || 0;
    const p = entry.suspected_parts?.length || 0;

    if (entry.imageSlices && typeof entry.imageSlices === 'object') {
        const wiring = Array.isArray(entry.imageSlices.wiring)
            ? entry.imageSlices.wiring.map((row) => (Array.isArray(row) ? [...row] : []))
            : [];
        while (wiring.length < w) wiring.push([]);
        return {
            overview: [...(entry.imageSlices.overview || [])],
            parts: [...(entry.imageSlices.parts || [])],
            wiring: wiring.slice(0, w),
            complete: [...(entry.imageSlices.complete || [])],
        };
    }

    if (entry.imagePlan?.length && w > 0) {
        const used = new Set();
        entry.imagePlan.forEach((row) => row.forEach((i) => used.add(i)));
        const wiring = entry.imagePlan.map((row) => [...row]);
        const unused = [];
        for (let i = 0; i < n; i++) if (!used.has(i)) unused.push(i);
        const split = buildImageSlices(unused.length, p, 0);
        const mapUnused = (local) => local.map((i) => unused[i]).filter((i) => i !== undefined);
        return {
            overview: mapUnused(split.overview),
            parts: mapUnused(split.parts),
            wiring,
            complete: mapUnused(split.complete),
        };
    }

    return buildImageSlices(n, p, w);
}

/**
 * @param {{ overview: number[], parts: number[], wiring: number[][], complete: number[] }} slices
 * @param {'overview'|'parts'|'wiring'|'complete'} phase
 * @param {{ wiringIndex?: number }} [opts]
 * @returns {number[]}
 */
export function indicesForPhase(slices, phase, opts = {}) {
    if (phase === 'overview') return slices.overview;
    if (phase === 'parts') return slices.parts;
    if (phase === 'complete') return slices.complete;
    if (phase === 'wiring') {
        const idx = opts.wiringIndex ?? 0;
        return slices.wiring[idx] || [];
    }
    return [];
}
