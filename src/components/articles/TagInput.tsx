import { useState, type ClipboardEvent, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'

type TagInputProps = {
  id: string
  value: string[]
  onChange: (tags: string[]) => void
  suggestions?: string[]
  placeholder?: string
}

const MAX_TAG_LENGTH = 40

function splitTags(text: string) {
  return text
    .split(/[,\n]/)
    .map((tag) => tag.trim().replace(/\s+/g, ' ').slice(0, MAX_TAG_LENGTH))
    .filter(Boolean)
}

export function TagInput({ id, value, onChange, suggestions = [], placeholder }: TagInputProps) {
  const [draft, setDraft] = useState('')

  const addTags = (text: string) => {
    const known = new Set(value.map((tag) => tag.toLowerCase()))
    const next = [...value]
    for (const tag of splitTags(text)) {
      if (known.has(tag.toLowerCase())) continue
      known.add(tag.toLowerCase())
      next.push(tag)
    }
    if (next.length !== value.length) onChange(next)
    setDraft('')
  }

  const removeTag = (index: number) => onChange(value.filter((_, i) => i !== index))

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',' || event.key === 'Tab') {
      if (!draft.trim()) return
      event.preventDefault()
      addTags(draft)
    } else if (event.key === 'Backspace' && !draft && value.length) {
      removeTag(value.length - 1)
    }
  }

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const text = event.clipboardData.getData('text')
    if (!/[,\n]/.test(text)) return
    event.preventDefault()
    addTags(`${draft},${text}`)
  }

  const listId = `${id}-suggestions`
  const available = suggestions.filter(
    (tag) => !value.some((existing) => existing.toLowerCase() === tag.toLowerCase()),
  )

  return (
    <div className="tag-input" onClick={() => document.getElementById(id)?.focus()}>
      {value.map((tag, index) => (
        <span className="tag-chip" key={tag.toLowerCase()}>
          {tag}
          <button
            type="button"
            aria-label={`Remove tag ${tag}`}
            onClick={(event) => {
              event.stopPropagation()
              removeTag(index)
            }}
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        list={available.length ? listId : undefined}
        placeholder={value.length ? 'Add another…' : placeholder}
        onChange={(event) => {
          const text = event.target.value
          if (text.includes(',')) addTags(text)
          else setDraft(text)
        }}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={() => draft.trim() && addTags(draft)}
      />
      {available.length ? (
        <datalist id={listId}>
          {available.map((tag) => (
            <option key={tag} value={tag} />
          ))}
        </datalist>
      ) : null}
    </div>
  )
}
