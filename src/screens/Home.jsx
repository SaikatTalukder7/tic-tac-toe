import { useState } from 'react'
import Piece from '../components/Piece'
import ThemePicker from '../components/ThemePicker'
import NameModal from '../components/NameModal'

export default function Home({ room, theme, onTheme, onStart }) {
  const [mode, setMode] = useState(null)

  return (
    <div className="stack">
      <div className="hero">
        <div className="hero-pieces">
          <Piece mark="X" />
          <Piece mark="O" />
        </div>
        <h1 className="hero-title">
          <span className="x">Tic</span> Tac <span className="o">Toe</span>
        </h1>
      </div>

      <p className="label">Choose a board</p>
      <ThemePicker theme={theme} onChange={onTheme} />

      <p className="label">Choose a mode</p>
      {!room && (
        <button className="btn alt" onClick={() => setMode('local')}>2 Players (same device)</button>
      )}
      {room ? (
        <button className="btn x" onClick={() => setMode('online')}>Join friend's game</button>
      ) : (
        <button className="btn x" onClick={() => setMode('online')}>Play with Friend (link)</button>
      )}
      <button className="btn o" onClick={() => setMode('cpu')}>Play vs Computer</button>
      {!room && (
        <button className="btn ghost" onClick={() => setMode('join')}>Join via Link</button>
      )}

      {mode && (
        <NameModal
          mode={mode}
          onSubmit={(v) => onStart(mode, v)}
          onClose={() => setMode(null)}
        />
      )}
    </div>
  )
}