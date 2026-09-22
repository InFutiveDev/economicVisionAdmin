export const BLOCK_TYPES = [
  'heading',
  'paragraph',
  'image',
  'quote',
  'list',
  'divider',
  'callout',
  'stats',
  'table',
  'gallery',
  'code',
  'button',
] as const

export type BlockType = (typeof BLOCK_TYPES)[number]

export const ARTICLE_CATEGORIES = [
  'Economy',
  'Markets',
  'Policy',
  'Energy',
  'Currency',
  'Commodities',
  'Real Estate',
] as const

export type HeadingBlock = {
  id: string
  type: 'heading'
  data: { text: string; level: 2 | 3 | 4 }
}

export type ParagraphBlock = {
  id: string
  type: 'paragraph'
  data: { text: string }
}

export type ImageBlock = {
  id: string
  type: 'image'
  data: { url: string; alt: string; caption: string }
}

export type QuoteBlock = {
  id: string
  type: 'quote'
  data: { text: string; citation: string }
}

export type ListBlock = {
  id: string
  type: 'list'
  data: { style: 'ul' | 'ol'; items: string[] }
}

export type DividerBlock = {
  id: string
  type: 'divider'
  data: Record<string, never>
}

export type CalloutBlock = {
  id: string
  type: 'callout'
  data: { title: string; text: string; tone: 'info' | 'warning' | 'success' }
}

export type StatsBlock = {
  id: string
  type: 'stats'
  data: {
    items: Array<{ value: string; label: string; change: string }>
  }
}

export type TableBlock = {
  id: string
  type: 'table'
  data: { headers: string[]; rows: string[][] }
}

export type GalleryBlock = {
  id: string
  type: 'gallery'
  data: { images: Array<{ url: string; caption: string }> }
}

export type CodeBlock = {
  id: string
  type: 'code'
  data: { language: string; code: string }
}

export type ButtonBlock = {
  id: string
  type: 'button'
  data: { label: string; url: string; style: 'primary' | 'secondary' }
}

export type Block =
  | HeadingBlock
  | ParagraphBlock
  | ImageBlock
  | QuoteBlock
  | ListBlock
  | DividerBlock
  | CalloutBlock
  | StatsBlock
  | TableBlock
  | GalleryBlock
  | CodeBlock
  | ButtonBlock

export type PagePayload = {
  title: string
  slug: string
  kicker: string
  excerpt: string
  category: string
  tags: string[]
  coverImage: string
  featured: boolean
  author: string
  status: 'draft' | 'published'
  blocks: Block[]
}

export type PageResponse = PagePayload & {
  id: string
}

export const BLOCK_META: Record<
  BlockType,
  { label: string; description: string; group: 'Text' | 'Media' | 'Data' | 'Layout' }
> = {
  heading: { label: 'Heading', description: 'Section title', group: 'Text' },
  paragraph: { label: 'Paragraph', description: 'Body copy', group: 'Text' },
  quote: { label: 'Quote', description: 'Pull quote', group: 'Text' },
  list: { label: 'List', description: 'Bullets or numbers', group: 'Text' },
  callout: { label: 'Callout', description: 'Highlighted note', group: 'Text' },
  code: { label: 'Code', description: 'Snippet or data note', group: 'Text' },
  image: { label: 'Image', description: 'Photo or figure', group: 'Media' },
  gallery: { label: 'Gallery', description: 'Multiple images', group: 'Media' },
  stats: { label: 'Stats', description: 'Key figures', group: 'Data' },
  table: { label: 'Table', description: 'Rows and columns', group: 'Data' },
  divider: { label: 'Divider', description: 'Visual break', group: 'Layout' },
  button: { label: 'Button', description: 'Call to action', group: 'Layout' },
}
