import { useEffect, useState } from 'react'
import {
  fetchOEmbed,
  getYouTubeApiKey,
  loadYtHistory,
  parseYouTubeId,
  pushYtHistory,
  searchYouTube,
  type YtVideoMeta,
} from '../lib/youtube'

type Props = {
  activeId: string | null
  onSelect: (meta: YtVideoMeta) => void
}

export function YoutubePicker({ activeId, onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [history, setHistory] = useState<YtVideoMeta[]>(() => loadYtHistory())
  const [results, setResults] = useState<YtVideoMeta[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const apiKey = getYouTubeApiKey()

  useEffect(() => {
    setHistory(loadYtHistory())
  }, [activeId])

  const playFromInput = async () => {
    setError(null)
    const id = parseYouTubeId(query)
    if (!id) {
      if (apiKey && query.trim()) {
        await runSearch()
        return
      }
      setError('유튜브 주소 또는 영상 ID를 입력해 주세요.')
      return
    }
    setBusy(true)
    try {
      const meta = await fetchOEmbed(id)
      const next = pushYtHistory(meta)
      setHistory(next)
      onSelect(meta)
    } catch {
      setError('영상을 불러오지 못했습니다.')
    } finally {
      setBusy(false)
    }
  }

  const runSearch = async () => {
    if (!apiKey) {
      setError(
        '검색에는 VITE_YOUTUBE_API_KEY가 필요합니다. 주소/ID 붙여넣기는 키 없이 가능합니다.',
      )
      return
    }
    const q = query.trim()
    if (!q) {
      setError('검색어를 입력해 주세요.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const items = await searchYouTube(q, apiKey)
      setResults(items)
      if (items.length === 0) setError('검색 결과가 없습니다.')
    } catch (e) {
      setError(e instanceof Error ? e.message : '검색에 실패했습니다.')
      setResults([])
    } finally {
      setBusy(false)
    }
  }

  const pick = (meta: YtVideoMeta) => {
    const next = pushYtHistory(meta)
    setHistory(next)
    onSelect(meta)
  }

  return (
    <section className="yt-picker" aria-label="유튜브 영상 고르기">
      <h3>유튜브 보기</h3>
      <p className="yt-picker-hint">
        {apiKey
          ? '검색하거나 주소를 붙여넣으세요'
          : '주소를 붙여넣으세요 (검색은 API 키 설정 후 가능)'}
      </p>

      <div className="yt-search-row">
        <input
          className="yt-search-input"
          type="search"
          enterKeyHint="search"
          placeholder="유튜브 주소, ID, 또는 검색어"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void playFromInput()
          }}
        />
        <button
          type="button"
          className="btn primary"
          disabled={busy}
          onClick={() => void playFromInput()}
        >
          {busy ? '…' : apiKey ? '검색/재생' : '재생'}
        </button>
      </div>

      {apiKey && (
        <button
          type="button"
          className="btn yt-search-only"
          disabled={busy}
          onClick={() => void runSearch()}
        >
          검색만 하기
        </button>
      )}

      {!apiKey && (
        <p className="yt-key-note">
          검색을 켜려면 빌드 환경에{' '}
          <code>VITE_YOUTUBE_API_KEY</code> 를 넣고 다시 배포하세요.
        </p>
      )}

      {error && (
        <p className="yt-error" role="alert">
          {error}
        </p>
      )}

      {results.length > 0 && (
        <div className="yt-grid">
          <h4>검색 결과</h4>
          <ul className="yt-list">
            {results.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`yt-card ${activeId === item.id ? 'active' : ''}`}
                  onClick={() => pick(item)}
                >
                  <img src={item.thumbnailUrl} alt="" loading="lazy" />
                  <span className="yt-card-title">{item.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {history.length > 0 && (
        <div className="yt-grid">
          <h4>최근 본 영상</h4>
          <ul className="yt-list">
            {history.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`yt-card ${activeId === item.id ? 'active' : ''}`}
                  onClick={() => pick(item)}
                >
                  <img src={item.thumbnailUrl} alt="" loading="lazy" />
                  <span className="yt-card-title">{item.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
