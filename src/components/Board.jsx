import Piece from './Piece'

export default function Board({ board, line, blocked, onPlay }) {
  return (
    <div className="board">
      {board.map((v, i) => (
        <button
          key={i}
          className={`cell ${line.includes(i) ? 'win' : ''}`}
          disabled={!!v || blocked}
          onClick={() => onPlay(i)}
        >
          {v ? <Piece mark={v} /> : <span className="num">{i + 1}</span>}
        </button>
      ))}
    </div>
  )
}