import { useState } from 'react'
import { parseRoom } from '../game/session'

const TITLES = {
  local: '2 Players',
  online: 'Play with Friend',
  cpu: 'Play vs Computer',
  join: 'Join via Link',
}

const fieldStyle = { display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }

export default function NameModal({ mode, onSubmit, onClose }) {
  const isLocal = mode === 'local'
  const isJoin = mode === 'join'
  const [name, setName] = useState('')
  const [p1, setP1] = useState('')
  const [p2, setP2] = useState('')
  const [link, setLink] = useState('')

  const a = p1.trim()
  const b = p2.trim()
  const mixed = isLocal && !a !== !b
  const roomId = isJoin ? parseRoom(link) : null
  const badLink = isJoin && link.trim() !== '' && !roomId

  let canSubmit
  if (isLocal) canSubmit = !mixed
  else if (isJoin) canSubmit = !!roomId && name.trim().length > 0
  else if (mode === 'cpu') canSubmit = true
  else canSubmit = name.trim().length > 0

  const submit = () => {
    if (!canSubmit) return
    if (isLocal) onSubmit({ p1: a || 'Player 1', p2: b || 'Player 2' })
    else if (isJoin) onSubmit({ name: name.trim(), room: roomId })
    else onSubmit(name.trim() || 'Player 1')
  }
  const onEnter = (e) => e.key === 'Enter' && submit()

  let heading = 'Enter your name'
  if (isLocal) heading = 'Enter player names'
  if (isJoin) heading = 'Join a friend'

  let hint = <p className="hint">{TITLES[mode]}</p>
  if (mixed) {
    hint = (
      <p className="hint" style={{ color: 'var(--danger)' }}>
        Enter both names, or leave both empty to use Player 1 and Player 2.
      </p>
    )
  } else if (badLink) {
    hint = (
      <p className="hint" style={{ color: 'var(--danger)' }}>
        That does not look like a valid invite link.
      </p>
    )
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{heading}</h2>
        {hint}

        {isLocal && (
          <>
            <div style={fieldStyle}>
              <label className="hint" htmlFor="p1">Player 1</label>
              <input
                id="p1"
                autoFocus
                className="input"
                placeholder="Player 1"
                maxLength={10}
                value={p1}
                onChange={(e) => setP1(e.target.value)}
                onKeyDown={onEnter}
              />
            </div>
            <div style={fieldStyle}>
              <label className="hint" htmlFor="p2">Player 2</label>
              <input
                id="p2"
                className="input"
                placeholder="Player 2"
                maxLength={10}
                value={p2}
                onChange={(e) => setP2(e.target.value)}
                onKeyDown={onEnter}
              />
            </div>
          </>
        )}

        {isJoin && (
          <>
            <div style={fieldStyle}>
              <label className="hint" htmlFor="link">Invite link</label>
              <input
                id="link"
                autoFocus
                className="input"
                placeholder="Paste the invite link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                onKeyDown={onEnter}
              />
            </div>
            <div style={fieldStyle}>
              <label className="hint" htmlFor="jname">Your name</label>
              <input
                id="jname"
                className="input"
                placeholder="Your name"
                maxLength={10}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={onEnter}
              />
            </div>
          </>
        )}

        {!isLocal && !isJoin && (
          <input
            autoFocus
            className="input"
            placeholder={mode === 'cpu' ? 'Player 1' : 'Your name'}
            maxLength={10}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={onEnter}
          />
        )}

        <div className="actions">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn o" disabled={!canSubmit} onClick={submit}>Continue</button>
        </div>
      </div>
    </div>
  )
}