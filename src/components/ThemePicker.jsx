const THEMES = [
  { id: 'noir', label: 'Noir Board', dots: ['#3a3a3f', '#cf2430'] },
  { id: 'wood', label: 'Wooden Board', dots: ['#a8433c', '#26262a'] },
  { id: 'pop', label: 'Pop Board', dots: ['#7fe8f2', '#ffa6e1'] },
]

export default function ThemePicker({ theme, onChange }) {
  return (
    <div className="themes">
      {THEMES.map((t) => (
        <button
          key={t.id}
          className={`theme-btn ${theme === t.id ? 'active' : ''}`}
          onClick={() => onChange(t.id)}
        >
          <span className="dots">
            <i style={{ background: t.dots[0] }} />
            <i style={{ background: t.dots[1] }} />
          </span>
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  )
}