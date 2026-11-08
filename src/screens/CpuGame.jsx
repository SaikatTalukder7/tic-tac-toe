import { useEffect } from 'react'
import Match from '../components/Match'
import { cpuMove } from '../game/logic'
import { usePersistedGame } from '../game/session'

export default function CpuGame({ name, onExit }) {
  const [state, dispatch] = usePersistedGame()

  useEffect(() => {
    if (state.turn === 'O' && !state.result) {
      const t = setTimeout(() => dispatch({ type: 'move', i: cpuMove(state.board), mark: 'O' }), 600)
      return () => clearTimeout(t)
    }
  }, [state.turn, state.result, state.board])

  return (
    <Match
      state={state}
      me="X"
      names={{ X: name, O: 'Computer' }}
      onPlay={(i) => dispatch({ type: 'move', i, mark: 'X' })}
      onAgain={() => dispatch({ type: 'reset', round: state.round + 1 })}
      onExit={onExit}
    />
  )
}