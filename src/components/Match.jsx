import Scores from './Scores'
import Tray from './Tray'
import Board from './Board'

export default function Match({ state, me, names, onPlay, onAgain, onExit, locked = false, note = '', local = false }) {
  const { board, turn, result, scores } = state
  const line = result ? result.line : []

  let text
  if (result) {
    if (result.mark === 'tie') text = "It's a tie!"
    else if (local) text = `${names[result.mark]} won!`
    else text = result.mark === me ? 'You won!' : `${names[result.mark]} won`
  } else {
    text = local || turn !== me ? `${names[turn]}'s turn` : 'Your turn'
  }

  const blocked = !!result || locked || (!local && turn !== me)

  return (
    <>
      <Scores names={names} scores={scores} me={me} local={local} />
      <p className="status">{note || text}</p>
      <Tray state={state} />
      <Board board={board} line={line} blocked={blocked} onPlay={onPlay} />
      <div className="actions">
        {result && !locked && <button className="btn o" onClick={onAgain}>Play again</button>}
        <button className="btn ghost" onClick={onExit}>Quit</button>
      </div>
    </>
  )
}