export const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]

export function getResult(b) {
  for (const [a, c, d] of LINES) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return { mark: b[a], line: [a, c, d] }
  }
  return b.every(Boolean) ? { mark: 'tie', line: [] } : null
}

export const initState = () => ({
  board: Array(9).fill(''),
  turn: 'X',
  result: null,
  scores: { X: 0, O: 0, tie: 0 },
  round: 0,
})

// How far a game has gone. After a reload, the copy with more progress wins.
export function progress(s) {
  return s.round * 100 + s.board.filter(Boolean).length * 2 + (s.result ? 1 : 0)
}

export function reducer(s, a) {
  if (a.type === 'load') return a.state
  if (a.type === 'move') {
    if (s.result || s.board[a.i] || a.mark !== s.turn) return s
    const board = s.board.slice()
    board[a.i] = a.mark
    const result = getResult(board)
    const scores = result ? { ...s.scores, [result.mark]: s.scores[result.mark] + 1 } : s.scores
    return { ...s, board, result, scores, turn: a.mark === 'X' ? 'O' : 'X' }
  }
  if (a.type === 'reset') {
    if (a.round <= s.round) return s
    return {
      ...s,
      board: Array(9).fill(''),
      result: null,
      round: a.round,
      turn: a.round % 2 === 0 ? 'X' : 'O', // the starting player alternates every round
    }
  }
  return s
}

// CPU = O. Win if possible, otherwise block, then center > corner > random
export function cpuMove(b) {
  const empty = b.map((v, i) => (v ? null : i)).filter((i) => i !== null)
  const find = (m) =>
    empty.find((i) => {
      const t = b.slice()
      t[i] = m
      return getResult(t)?.mark === m
    })
  const pick = find('O') ?? find('X')
  if (pick !== undefined) return pick
  if (!b[4]) return 4
  const corners = [0, 2, 6, 8].filter((i) => !b[i])
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)]
  return empty[Math.floor(Math.random() * empty.length)]
}