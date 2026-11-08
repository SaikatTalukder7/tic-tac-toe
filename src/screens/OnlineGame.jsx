import { useEffect, useRef, useState } from 'react'
import Peer from 'peerjs'
import Match from '../components/Match'
import { progress } from '../game/logic'
import { usePersistedGame, readSession, writeSession, rand } from '../game/session'

export default function OnlineGame({ name, room, onExit }) {
  const isHost = !room
  const me = isHost ? 'X' : 'O'
  const [state, dispatch] = usePersistedGame()
  const [saved] = useState(readSession)

  // These stay the same after a reload, so the invite link keeps working
  const [ids] = useState(() => ({
    host: saved.hostId || `xo-${rand()}${rand()}`,
    token: saved.token || `${rand()}${rand()}`,
  }))
  const resumed = !!saved.token

  const [status, setStatus] = useState('connecting') // connecting | waiting | playing | left | quit | error
  const [link, setLink] = useState('')
  const [opp, setOpp] = useState(saved.opp || 'Friend')
  const [copied, setCopied] = useState(false)

  const connRef = useRef(null)
  const guestRef = useRef(saved.guest || null)
  const stateRef = useRef(state)
  const quitRef = useRef(false)
  const playedRef = useRef(false)
  stateRef.current = state

  useEffect(() => {
    writeSession({ hostId: isHost ? ids.host : null, token: ids.token })
  }, [])

  useEffect(() => {
    writeSession({ opp })
  }, [opp])

  useEffect(() => {
    let dead = false
    let peer = null
    let timer = null
    let idTries = 0

    const hello = () => ({ type: 'hello', name, token: ids.token, state: stateRef.current })

    const wire = (conn) => {
      conn.on('data', (m) => {
        if (m.type === 'hello') {
          if (isHost) {
            const cur = connRef.current
            const same = guestRef.current && guestRef.current === m.token
            // a stranger cannot take a seat that is already taken
            if (cur && cur !== conn && cur.open && !same) { conn.close(); return }
            if (cur && cur !== conn) cur.close()
            guestRef.current = m.token
            writeSession({ guest: m.token })
          }
          connRef.current = conn
          quitRef.current = false
          playedRef.current = true
          setOpp(m.name || 'Friend')
          setStatus('playing')
          if (m.state && progress(m.state) > progress(stateRef.current)) {
            dispatch({ type: 'load', state: m.state })
          }
          if (isHost) conn.send(hello())
          return
        }
        if (conn !== connRef.current) return
        if (m.type === 'move') dispatch({ type: 'move', i: m.i, mark: m.mark })
        if (m.type === 'reset') dispatch({ type: 'reset', round: m.round })
        if (m.type === 'quit') { quitRef.current = true; setStatus('quit') }
      })

      conn.on('close', () => {
        if (dead || conn !== connRef.current || quitRef.current) return
        setStatus('left')
        if (!isHost) retryJoin()
      })
    }

    const joinHost = () => {
      if (dead || !peer) return
      const conn = peer.connect(room, { reliable: true })
      conn.on('open', () => {
        connRef.current = conn
        conn.send(hello())
      })
      wire(conn)
    }

    const retryJoin = () => {
      clearTimeout(timer)
      timer = setTimeout(joinHost, 2000)
    }

    const start = () => {
      if (dead) return
      const p = new Peer(isHost ? ids.host : undefined)
      peer = p

      p.on('open', () => {
        if (dead) return
        if (isHost) {
          setLink(`${location.origin}${location.pathname}?room=${ids.host}`)
          setStatus((s) => (s === 'connecting' ? (guestRef.current ? 'left' : 'waiting') : s))
        } else {
          joinHost()
        }
      })

      if (isHost) p.on('connection', wire)

      p.on('disconnected', () => {
        if (!dead && !p.destroyed) p.reconnect()
      })

      p.on('error', (err) => {
        if (dead) return
        // after a reload the old tab may not have released the id yet
        if (err.type === 'unavailable-id' && idTries < 12) {
          idTries += 1
          p.destroy()
          timer = setTimeout(start, 1500)
          return
        }
        // the host is probably reloading: keep trying
        if (err.type === 'peer-unavailable' && !isHost && (resumed || playedRef.current)) {
          retryJoin()
          return
        }
        setStatus((s) => (s === 'connecting' ? 'error' : s))
      })
    }

    start()

    return () => {
      dead = true
      clearTimeout(timer)
      if (peer) peer.destroy()
    }
  }, [])

  const send = (msg) => {
    const c = connRef.current
    if (c && c.open) c.send(msg)
  }

  const play = (i) => {
    if (status !== 'playing' || state.turn !== me || state.board[i] || state.result) return
    dispatch({ type: 'move', i, mark: me })
    send({ type: 'move', i, mark: me })
  }

  const again = () => {
    const round = state.round + 1
    dispatch({ type: 'reset', round })
    send({ type: 'reset', round })
  }

  const leave = () => {
    const c = connRef.current
    if (c && c.open) {
      send({ type: 'quit' })
      setTimeout(onExit, 150)
    } else {
      onExit()
    }
  }

  const copy = async () => {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (status === 'connecting') {
    return (
      <div className="stack">
        <p className="status">{resumed ? 'Reconnecting...' : 'Connecting...'}</p>
        <button className="btn ghost" onClick={leave}>Quit</button>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="stack">
        <p className="status bad">Could not connect. Check that the link is correct and the host still has the game open.</p>
        <button className="btn ghost" onClick={leave}>Back</button>
      </div>
    )
  }

  if (status === 'waiting') {
    return (
      <div className="stack">
        <p className="status">Send this link to your friend</p>
        <input className="input" readOnly value={link} onFocus={(e) => e.target.select()} />
        <button className="btn o" onClick={copy}>{copied ? 'Copied!' : 'Copy link'}</button>
        <p className="hint">The game starts as soon as your friend joins. Keep this tab open.</p>
        <button className="btn ghost" onClick={leave}>Cancel</button>
      </div>
    )
  }

  let note = ''
  if (status === 'left') note = `${opp} disconnected. Waiting for them to rejoin...`
  if (status === 'quit') note = `${opp} has left the game`

  return (
    <Match
      state={state}
      me={me}
      names={{ X: isHost ? name : opp, O: isHost ? opp : name }}
      onPlay={play}
      onAgain={again}
      onExit={leave}
      locked={status !== 'playing'}
      note={note}
    />
  )
}