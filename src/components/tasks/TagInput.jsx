import { useState } from 'react'

export default function TagInput({ tags = [], onChange }) {
  const [input, setInput] = useState('')

  const addTag = () => {
    const tag = input.trim()
    if (tag && tags.length < 5 && !tags.includes(tag)) {
      onChange([...tags, tag])
    }
    setInput('')
  }

  const removeTag = (idx) => {
    onChange(tags.filter((_, i) => i !== idx))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <div>
      <label className="ds-label mb-2">
        Etiquetas{' '}
        <span style={{ textTransform: 'none', letterSpacing: 'normal', opacity: 0.75 }}>
          (opcional, máx. 5)
        </span>
      </label>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs"
              style={{ background: 'rgba(var(--ink-rgb),.06)', color: 'var(--fg-primary)', border: '1px solid rgba(var(--ink-rgb),.12)' }}
            >
              {tag}
              <button type="button" onClick={() => removeTag(i)} className="hover:text-terracotta transition-colors">
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {tags.length < 5 && (
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe y presiona Enter"
          className="w-full bg-transparent border-b py-2 text-sm outline-none focus:border-terracotta transition-colors"
          style={{ borderColor: 'rgba(var(--ink-rgb),.2)', color: 'var(--fg-primary)' }}
        />
      )}
    </div>
  )
}
