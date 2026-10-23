export type YtVideoMeta = {
  id: string
  title: string
  thumbnailUrl: string
  channelTitle?: string
}

const HISTORY_KEY = 'meal-controller-yt-history-v1'
const MAX_HISTORY = 12

/** Extract 11-char video id from URL or raw id. */
export function parseYouTubeId(input: string): string | null {
  const raw = input.trim()
  if (!raw) return null
  if (/^[\w-]{11}$/.test(raw)) return raw

  try {
    const url = new URL(raw)
    const host = url.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0]
      return id && /^[\w-]{11}$/.test(id) ? id : null
    }
    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      const v = url.searchParams.get('v')
      if (v && /^[\w-]{11}$/.test(v)) return v
      const parts = url.pathname.split('/').filter(Boolean)
      // /embed/ID /shorts/ID /live/ID
      const idx = parts.findIndex((p) =>
        ['embed', 'shorts', 'live', 'v'].includes(p),
      )
      if (idx >= 0 && parts[idx + 1] && /^[\w-]{11}$/.test(parts[idx + 1])) {
        return parts[idx + 1]
      }
    }
  } catch {
    /* not a URL */
  }
  return null
}

export function loadYtHistory(): YtVideoMeta[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const list = JSON.parse(raw) as YtVideoMeta[]
    return Array.isArray(list) ? list.slice(0, MAX_HISTORY) : []
  } catch {
    return []
  }
}

export function pushYtHistory(item: YtVideoMeta): YtVideoMeta[] {
  const prev = loadYtHistory().filter((x) => x.id !== item.id)
  const next = [item, ...prev].slice(0, MAX_HISTORY)
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
  } catch {
    /* ignore */
  }
  return next
}

/** oEmbed — no API key; title + thumbnail for a known URL. */
export async function fetchOEmbed(videoId: string): Promise<YtVideoMeta> {
  const watch = `https://www.youtube.com/watch?v=${videoId}`
  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(watch)}&format=json`
  const res = await fetch(endpoint)
  if (!res.ok) {
    return {
      id: videoId,
      title: `YouTube ${videoId}`,
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    }
  }
  const data = (await res.json()) as {
    title?: string
    thumbnail_url?: string
    author_name?: string
  }
  return {
    id: videoId,
    title: data.title ?? `YouTube ${videoId}`,
    thumbnailUrl:
      data.thumbnail_url ??
      `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    channelTitle: data.author_name,
  }
}

export function getYouTubeApiKey(): string | undefined {
  const key = import.meta.env.VITE_YOUTUBE_API_KEY
  return typeof key === 'string' && key.trim() ? key.trim() : undefined
}

export async function searchYouTube(
  query: string,
  apiKey: string,
  maxResults = 8,
): Promise<YtVideoMeta[]> {
  const params = new URLSearchParams({
    part: 'snippet',
    type: 'video',
    maxResults: String(maxResults),
    q: query,
    key: apiKey,
    safeSearch: 'strict',
    relevanceLanguage: 'ko',
  })
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${params}`,
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(
      res.status === 403
        ? 'YouTube API 키가 거부되었습니다. 키·할당량·API 활성화를 확인하세요.'
        : `검색 실패 (${res.status}): ${text.slice(0, 120)}`,
    )
  }
  const data = (await res.json()) as {
    items?: Array<{
      id?: { videoId?: string }
      snippet?: {
        title?: string
        channelTitle?: string
        thumbnails?: { medium?: { url?: string }; default?: { url?: string } }
      }
    }>
  }
  const out: YtVideoMeta[] = []
  for (const item of data.items ?? []) {
    const id = item.id?.videoId
    if (!id) continue
    out.push({
      id,
      title: item.snippet?.title ?? id,
      channelTitle: item.snippet?.channelTitle,
      thumbnailUrl:
        item.snippet?.thumbnails?.medium?.url ??
        item.snippet?.thumbnails?.default?.url ??
        `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    })
  }
  return out
}
