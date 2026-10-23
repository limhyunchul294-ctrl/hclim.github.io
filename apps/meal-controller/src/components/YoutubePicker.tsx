import { useEffect, useRef, useState } from 'react'
import {
  fetchOEmbed,
  loadYtHistory,
  parseYouTubeId,
  pushYtHistory,
  watchUrl,
  youtubeHomeUrl,
  youtubeResultsUrl,
  type YtVideoMeta,
} from '../lib/youtube'

type Props = {
  activeId: string | null
  onSelect: (meta: YtVideoMeta) => void
}

export function YoutubePicker({ activeId, onSelect }: Props) {
  const [paste, setPaste] = useState('')
  const [keywords, setKeywords] = useState('')
  const [history, setHistory] = useState<YtVideoMeta[]>(() => loadYtHistory())
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setHistory(loadYtHistory())
  }, [activeId])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 2200)
    return () => window.clearTimeout(t)
  }, [toast])

  const playFromText = async (text: string) => {
    setError(null)
    const id = parseYouTubeId(text)
    if (!id) {
      setError('유튜브 주소(또는 영상 ID)를 붙여넣어 주세요.')
      inputRef.current?.focus()
      return
    }
    setBusy(true)
    try {
      const meta = await fetchOEmbed(id)
      setHistory(pushYtHistory(meta))
      setPaste(watchUrl(id))
      onSelect(meta)
      setToast('재생 준비 완료!')
    } catch {
      setError('영상을 불러오지 못했습니다. 주소를 다시 확인해 주세요.')
    } finally {
      setBusy(false)
    }
  }

  const openYouTube = () => {
    window.open(youtubeHomeUrl(), '_blank', 'noopener,noreferrer')
  }

  const openYouTubeSearch = () => {
    window.open(
      youtubeResultsUrl(keywords || paste),
      '_blank',
      'noopener,noreferrer',
    )
  }

  const pasteFromClipboard = async () => {
    setError(null)
    try {
      if (!navigator.clipboard?.readText) {
        setError('이 브라우저에서는 클립보드 읽기를 지원하지 않습니다. 직접 붙여넣어 주세요.')
        inputRef.current?.focus()
        return
      }
      const text = await navigator.clipboard.readText()
      if (!text.trim()) {
        setError('클립보드가 비어 있어요. 유튜브에서 주소를 복사한 뒤 다시 눌러 주세요.')
        return
      }
      setPaste(text.trim())
      await playFromText(text)
    } catch {
      setError(
        '클립보드를 읽지 못했어요. 권한을 허용하거나, 입력칸에 직접 붙여넣어 주세요.',
      )
      inputRef.current?.focus()
    }
  }

  const copyCurrent = async () => {
    if (!activeId) {
      setError('먼저 재생할 영상을 선택해 주세요.')
      return
    }
    const url = watchUrl(activeId)
    try {
      await navigator.clipboard.writeText(url)
      setToast('주소를 복사했어요')
      setError(null)
    } catch {
      setError('복사에 실패했습니다. 주소를 길게 눌러 복사해 주세요.')
      setPaste(url)
    }
  }

  const pick = (meta: YtVideoMeta) => {
    setHistory(pushYtHistory(meta))
    setPaste(watchUrl(meta.id))
    onSelect(meta)
  }

  return (
    <section className="yt-picker" aria-label="유튜브 영상 고르기">
      <h3>유튜브 고르기</h3>
      <ol className="yt-steps">
        <li>유튜브에서 고르고 주소를 복사해요</li>
        <li>붙여넣고 「재생」을 눌러요</li>
      </ol>

      <div className="yt-action-grid">
        <button type="button" className="btn primary yt-big-btn" onClick={openYouTube}>
          유튜브 열기
        </button>
        <button
          type="button"
          className="btn yt-big-btn"
          onClick={() => void pasteFromClipboard()}
          disabled={busy}
        >
          붙여넣기
        </button>
      </div>

      <label className="yt-field-label" htmlFor="yt-paste-input">
        주소
      </label>
      <div className="yt-search-row">
        <input
          id="yt-paste-input"
          ref={inputRef}
          className="yt-search-input"
          type="url"
          inputMode="url"
          autoComplete="off"
          enterKeyHint="go"
          placeholder="https://youtu.be/… 또는 youtube.com/watch?v=…"
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void playFromText(paste)
          }}
        />
        <button
          type="button"
          className="btn primary"
          disabled={busy}
          onClick={() => void playFromText(paste)}
        >
          {busy ? '…' : '재생'}
        </button>
      </div>

      <div className="yt-secondary-row">
        <button
          type="button"
          className="btn"
          disabled={!activeId}
          onClick={() => void copyCurrent()}
        >
          지금 영상 주소 복사
        </button>
      </div>

      <div className="yt-keyword-block">
        <label className="yt-field-label" htmlFor="yt-keywords">
          키워드로 유튜브 검색 열기 (선택)
        </label>
        <div className="yt-search-row">
          <input
            id="yt-keywords"
            className="yt-search-input"
            type="search"
            placeholder="예: 동요, 공룡"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') openYouTubeSearch()
            }}
          />
          <button type="button" className="btn" onClick={openYouTubeSearch}>
            유튜브 검색
          </button>
        </div>
        <p className="yt-picker-hint">
          새 탭에서 고른 뒤 주소를 복사 → 「클립보드에서 붙여넣기」 또는 위에
          붙여넣기
        </p>
      </div>

      {error && (
        <p className="yt-error" role="alert">
          {error}
        </p>
      )}
      {toast && (
        <p className="yt-toast" role="status">
          {toast}
        </p>
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
