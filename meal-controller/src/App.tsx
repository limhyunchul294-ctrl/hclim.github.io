import './App.css'

/** M0 scaffold — camera / chew / blink land in later milestones. */
function App() {
  return (
    <div className="app">
      <header className="app-header">
        <p className="brand">식사 중 영상시청 컨트롤러</p>
        <p className="tagline">저작할 때만 영상이 재생됩니다 · 온디바이스</p>
      </header>

      <main className="app-main">
        <section className="placeholder-card">
          <h1>M0 · Scaffold 완료</h1>
          <p>
            Vite + React + TypeScript 앱이 <code>meal-controller/</code> 아래에
            있습니다. 기존 GitHub Pages 사이트 루트는 그대로 둡니다.
          </p>
          <ul>
            <li>M1 — 카메라 + Face Landmarker</li>
            <li>M2 — 저작 스코어 + pause/resume</li>
            <li>M3 — 눈 깜빡임 (부가)</li>
            <li>M4 — 설정·모바일·README</li>
          </ul>
          <p className="privacy">
            카메라 영상은 기기 밖으로 나가지 않습니다. (서버 업로드 없음)
          </p>
        </section>
      </main>
    </div>
  )
}

export default App
