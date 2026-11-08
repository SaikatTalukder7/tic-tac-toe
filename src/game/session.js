import { useEffect, useReducer } from 'react'
import { initState, reducer } from './logic'

// Everything lives in sessionStorage: it survives a reload, but is wiped
// when the tab is closed or when the player presses Quit.
const KEY = 'xo-session'

export function readSession() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY)) || {}
  } catch {
    return {}
  }
}

export function writeSession(patch) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ ...readSession(), ...patch }))
  } catch {
    /* storage unavailable: the game still works, it just will not survive a reload */
  }
}

export function saveSession(all) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(all))
  } catch {
    /* ignore */
  }
}

export const rand = () => Math.random().toString(36).slice(2, 8)

// Accepts a full invite link or just the room code (xo-abc123)
export function parseRoom(text) {
  const t = text.trim()
  const m = t.match(/[?&]room=([A-Za-z0-9_-]+)/)
  if (m) return m[1]
  if (/^xo-[A-Za-z0-9]+$/i.test(t)) return t.toLowerCase()
  return null
}

// Game state that is restored after a reload
export function usePersistedGame() {
  const [state, dispatch] = useReducer(reducer, null, () => readSession().game ?? initState())
  useEffect(() => {
    writeSession({ game: state })
  }, [state])
  return [state, dispatch]
}