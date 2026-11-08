export default function Piece({ mark, style }) {
  return <span className={`piece ${mark.toLowerCase()}`} style={style} />
}