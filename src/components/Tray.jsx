import Piece from './Piece'

const ROT = [-18, 14, -8, 22, -12]
const DY = [0, 6, -4, 5, -2]

// Pieces that are not on the board yet, lying beside it
export default function Tray({ state }) {
  const { board, round } = state
  const starter = round % 2 === 0 ? 'X' : 'O'
  const left = (m) => Math.max(0, (m === starter ? 5 : 4) - board.filter((v) => v === m).length)
  const pieces = (m) =>
    Array.from({ length: left(m) }, (_, i) => (
      <Piece
        key={i}
        mark={m}
        style={{ transform: `rotate(${ROT[i % 5]}deg) translateY(${DY[i % 5]}px)` }}
      />
    ))

  return (
    <div className="tray">
      <div className="tray-group">{pieces('X')}</div>
      <div className="tray-group right">{pieces('O')}</div>
    </div>
  )
}