import { useEffect, useState } from 'react'
import Home from './screens/Home'
import CpuGame from './screens/CpuGame'
import LocalGame from './screens/LocalGame'
import OnlineGame from './screens/OnlineGame'
import { readSession, writeSession, saveSession } from './game/session'

const THEME_IDS = ['noir', 'wood', 'pop']

// Decide whether to continue a match that was running before a reload
function boot() {
  const urlRoom = new URLSearchParams(location.search).get('room')
  const s = readSession()
  const resume = !!s.screen && s.screen !== 'home' && (!urlRoom || s.room === urlRoom)
  if (!resume) saveSession({})
  return { s, urlRoom, resume }
}

export default function App() {
  const [b] = useState(boot)
  const [screen, setScreen] = useState(b.resume ? b.s.screen : 'home')
  const [room, setRoom] = useState(b.resume ? b.s.room || null : b.urlRoom)
  const [name, setName] = useState(b.resume ? b.s.name || '' : '')
  const [players, setPlayers] = useState(
    b.resume && b.s.players ? b.s.players : { p1: 'Player 1', p2: 'Player 2' }
  )
  // The theme is only remembered while a match is running. On the home page a reload goes back to Noir.
  const [theme, setTheme] = useState(b.resume && THEME_IDS.includes(b.s.theme) ? b.s.theme : 'noir')

  useEffect(() => {
    writeSession({ theme })
  }, [theme])

  const exit = () => {
    saveSession({})
    setScreen('home')
    setName('')
    if (room) {
      setRoom(null)
      history.replaceState(null, '', location.pathname)
    }
  }

  const start = (mode, value) => {
    const fresh = { game: null, hostId: null, token: null, guest: null, opp: null, theme }
    if (mode === 'local') {
      setPlayers(value)
      saveSession({ ...fresh, screen: 'local', room, players: value })
      setScreen('local')
    } else if (mode === 'join') {
      setName(value.name)
      setRoom(value.room)
      saveSession({ ...fresh, screen: 'online', room: value.room, name: value.name })
      setScreen('online')
    } else {
      setName(value)
      saveSession({ ...fresh, screen: mode, room, name: value })
      setScreen(mode)
    }
  }

  return (
    <div className="app" data-theme={theme}>
      <div className="phone">
        <span className="island" />
        <span className="home-bar" />
        <div className="card">
          {screen !== 'home' && (
            <h1><span className="x">X</span> <span className="o">O</span> Tic Tac Toe</h1>
          )}
          {screen === 'home' && <Home room={room} theme={theme} onTheme={setTheme} onStart={start} />}
          {screen === 'cpu' && <CpuGame name={name} onExit={exit} />}
          {screen === 'local' && <LocalGame players={players} onExit={exit} />}
          {screen === 'online' && <OnlineGame name={name} room={room} onExit={exit} />}
        </div>
      </div>
    </div>
  )
}