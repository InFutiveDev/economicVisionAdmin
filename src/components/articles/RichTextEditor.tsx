import { useEffect, useRef } from 'react'
import { Bold, Italic, Link2, Underline } from 'lucide-react'
import { normalizeEditorHtml, plainToHtml } from '../../utils/html'

type RichTextEditorProps = {
  id?: string
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
  minHeight?: number
  singleLine?: boolean
  'aria-invalid'?: boolean
}

function runCommand(command: string, value?: string) {
  document.execCommand(command, false, value)
}

export function RichTextEditor({
  id,
  value,
  onChange,
  placeholder = '',
  className = '',
  minHeight = 120,
  singleLine = false,
  'aria-invalid': ariaInvalid,
}: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null)
  const lastEmitted = useRef(value)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const next = plainToHtml(value)
    if (next === lastEmitted.current) return
    if (el.innerHTML !== next) {
      el.innerHTML = next
      lastEmitted.current = next
    }
  }, [value])

  const emit = () => {
    const el = ref.current
    if (!el) return
    const html = normalizeEditorHtml(el.innerHTML)
    lastEmitted.current = html
    onChange(html)
  }

  const format = (command: string) => {
    ref.current?.focus()
    runCommand(command)
    emit()
  }

  const addLink = () => {
    const url = window.prompt('Link URL', 'https://')
    if (!url) return
    ref.current?.focus()
    runCommand('createLink', url)
    emit()
  }

  return (
    <div
      className={`rich-editor ${singleLine ? 'is-single' : ''} ${className}`.trim()}
      data-invalid={ariaInvalid ? 'true' : undefined}
    >
      <div className="rich-editor-toolbar" role="toolbar" aria-label="Text formatting">
        <button type="button" className="rich-editor-btn" title="Bold" onMouseDown={(e) => e.preventDefault()} onClick={() => format('bold')}>
          <Bold size={14} />
        </button>
        <button type="button" className="rich-editor-btn" title="Italic" onMouseDown={(e) => e.preventDefault()} onClick={() => format('italic')}>
          <Italic size={14} />
        </button>
        <button type="button" className="rich-editor-btn" title="Underline" onMouseDown={(e) => e.preventDefault()} onClick={() => format('underline')}>
          <Underline size={14} />
        </button>
        <button type="button" className="rich-editor-btn" title="Link" onMouseDown={(e) => e.preventDefault()} onClick={addLink}>
          <Link2 size={14} />
        </button>
      </div>
      <div
        id={id}
        ref={ref}
        className="rich-editor-surface"
        contentEditable
        role="textbox"
        aria-multiline={!singleLine}
        aria-invalid={ariaInvalid}
        data-placeholder={placeholder}
        style={{ minHeight }}
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        onKeyDown={(event) => {
          if (singleLine && event.key === 'Enter') {
            event.preventDefault()
          }
        }}
        onPaste={(event) => {
          event.preventDefault()
          const text = event.clipboardData.getData('text/plain')
          if (singleLine) {
            runCommand('insertText', text.replace(/\s+/g, ' ').trim())
          } else {
            runCommand('insertText', text)
          }
          emit()
        }}
      />
    </div>
  )
}
