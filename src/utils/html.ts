const ALLOWED_TAGS = new Set([
  'b',
  'strong',
  'i',
  'em',
  'u',
  'br',
  'p',
  'div',
  'span',
  'a',
])

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'title', 'target', 'rel']),
  span: new Set(['style']),
}

export function stripHtml(value: string): string {
  return String(value || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div)>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

export function isHtmlEmpty(value: string): boolean {
  return stripHtml(value).length === 0
}

export function escapeHtml(value: string): string {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Plain text with newlines → safe HTML that preserves line breaks. */
export function plainToHtml(value: string): string {
  const text = String(value || '')
  if (!text) return ''
  if (/<[a-z][\s\S]*>/i.test(text)) return sanitizeHtml(text)
  return escapeHtml(text).replace(/\r\n|\r|\n/g, '<br>')
}

export function sanitizeHtml(value: string): string {
  const input = String(value || '').trim()
  if (!input) return ''

  if (typeof DOMParser === 'undefined') {
    return input
      .replace(/<\/?(script|style|iframe|object|embed|link|meta)[^>]*>/gi, '')
      .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  }

  const doc = new DOMParser().parseFromString(`<div>${input}</div>`, 'text/html')
  const root = doc.body.firstElementChild
  if (!root) return escapeHtml(input)

  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return escapeHtml(node.textContent || '')
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return ''

    const el = node as HTMLElement
    const tag = el.tagName.toLowerCase()

    if (tag === 'br') return '<br>'

    const children = Array.from(el.childNodes).map(walk).join('')

    if (!ALLOWED_TAGS.has(tag)) return children

    if (tag === 'a') {
      const href = el.getAttribute('href') || ''
      if (!/^(https?:|mailto:|\/|#)/i.test(href)) return children
      const safeHref = href.replace(/"/g, '&quot;')
      return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">${children}</a>`
    }

    if (tag === 'span') {
      const style = el.getAttribute('style') || ''
      const allowed = style
        .split(';')
        .map((part) => part.trim())
        .filter((part) => /^(font-weight|font-style|text-decoration)\s*:/i.test(part))
        .join('; ')
      return allowed ? `<span style="${allowed}">${children}</span>` : children
    }

    const attrs = ALLOWED_ATTRS[tag]
    if (!attrs || attrs.size === 0) {
      return `<${tag}>${children}</${tag}>`
    }
    return `<${tag}>${children}</${tag}>`
  }

  return Array.from(root.childNodes).map(walk).join('').trim()
}

/** Normalize editor HTML: drop empty wrappers, keep line breaks. */
export function normalizeEditorHtml(value: string): string {
  const cleaned = sanitizeHtml(value)
    .replace(/^(<br\s*\/?>)+|(<br\s*\/?>)+$/gi, '')
    .replace(/(<div><br\s*\/?><\/div>)+$/gi, '')
    .trim()
  if (isHtmlEmpty(cleaned)) return ''
  return cleaned
}
