export default function Scores({ names, scores, me, local }) {
  return (
    <div className="scores">
      <div className="score x"><span>{names.X}{!local && me === 'X' ? ' (you)' : ''}</span><b>{scores.X}</b></div>
      <div className="score tie"><span>Ties</span><b>{scores.tie}</b></div>
      <div className="score o"><span>{names.O}{!local && me === 'O' ? ' (you)' : ''}</span><b>{scores.O}</b></div>
    </div>
  )
}