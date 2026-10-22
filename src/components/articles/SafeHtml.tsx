import { plainToHtml } from '../../utils/html'

type SafeHtmlProps = {
  html: string
  as?: keyof HTMLElementTagNameMap
  className?: string
}

export function SafeHtml({ html, as: Tag = 'div', className }: SafeHtmlProps) {
  if (!html) return null
  return (
    <Tag
      className={className}
      dangerouslySetInnerHTML={{ __html: plainToHtml(html) }}
    />
  )
}
