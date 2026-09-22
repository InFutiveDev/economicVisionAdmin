import type { Block, BlockType } from '../types/block'

export function createBlock(type: BlockType): Block {
  const id = crypto.randomUUID()

  switch (type) {
    case 'heading':
      return { id, type, data: { text: '', level: 2 } }
    case 'paragraph':
      return { id, type, data: { text: '' } }
    case 'image':
      return { id, type, data: { url: '', alt: '', caption: '' } }
    case 'quote':
      return { id, type, data: { text: '', citation: '' } }
    case 'list':
      return { id, type, data: { style: 'ul', items: [''] } }
    case 'divider':
      return { id, type, data: {} as Record<string, never> }
    case 'callout':
      return { id, type, data: { title: '', text: '', tone: 'info' } }
    case 'stats':
      return {
        id,
        type,
        data: {
          items: [
            { value: '', label: '', change: '' },
            { value: '', label: '', change: '' },
          ],
        },
      }
    case 'table':
      return {
        id,
        type,
        data: {
          headers: ['Metric', 'Now', 'Prior'],
          rows: [
            ['', '', ''],
            ['', '', ''],
          ],
        },
      }
    case 'gallery':
      return {
        id,
        type,
        data: { images: [{ url: '', caption: '' }, { url: '', caption: '' }] },
      }
    case 'code':
      return { id, type, data: { language: 'text', code: '' } }
    case 'button':
      return { id, type, data: { label: 'Read more', url: '', style: 'primary' } }
  }
}
