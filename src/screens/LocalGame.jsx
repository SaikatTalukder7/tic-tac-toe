import Match from '../components/Match'
import { usePersistedGame } from '../game/session'

export default function LocalGame({ players, onExit }) {
  const [state, dispatch] = usePersistedGame()

  return (
    <Match
      local
      state={state}
      me="X"
      names={{ X: players.p1, O: players.p2 }}
      onPlay={(i) => dispatch({ type: 'move', i, mark: state.turn })}
      onAgain={() => dispatch({ type: 'reset', round: state.round + 1 })}
      onExit={onExit}
    />
  )
}