import {
  BLOCK_META,
  type Block,
  type ButtonBlock,
  type CalloutBlock,
  type CodeBlock,
  type GalleryBlock,
  type HeadingBlock,
  type ImageBlock,
  type ListBlock,
  type ParagraphBlock,
  type QuoteBlock,
  type StatsBlock,
  type TableBlock,
} from '../../types/block'
import { BlockTypeIcon } from './BlockPalette'
import { ImageUploadField } from './ImageUploadField'

type BlockEditorProps = {
  block: Block
  isFirst: boolean
  isLast: boolean
  onChange: (block: Block) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDuplicate: () => void
  onRemove: () => void
}

export function BlockEditor({
  block,
  isFirst,
  isLast,
  onChange,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onRemove,
}: BlockEditorProps) {
  return (
    <article className="block-card">
      <header className="block-card-header">
        <div className="block-card-meta">
          <span className="block-card-icon">
            <BlockTypeIcon type={block.type} />
          </span>
          <span className="block-badge">{BLOCK_META[block.type].label}</span>
          <span className="block-card-desc">{BLOCK_META[block.type].description}</span>
        </div>
        <div className="block-card-controls">
          <button
            type="button"
            className="btn icon-btn"
            onClick={onMoveUp}
            disabled={isFirst}
            aria-label="Move up"
          >
            ↑
          </button>
          <button
            type="button"
            className="btn icon-btn"
            onClick={onMoveDown}
            disabled={isLast}
            aria-label="Move down"
          >
            ↓
          </button>
          <button type="button" className="btn" onClick={onDuplicate}>
            Duplicate
          </button>
          <button type="button" className="btn danger-btn" onClick={onRemove}>
            Remove
          </button>
        </div>
      </header>
      <div className="block-card-body">{renderForm(block, onChange)}</div>
    </article>
  )
}

function renderForm(block: Block, onChange: (block: Block) => void) {
  switch (block.type) {
    case 'heading':
      return (
        <HeadingForm
          block={block}
          onChange={(data) => onChange({ ...block, data })}
        />
      )
    case 'paragraph':
      return (
        <ParagraphForm
          block={block}
          onChange={(data) => onChange({ ...block, data })}
        />
      )
    case 'image':
      return (
        <ImageForm
          block={block}
          onChange={(data) => onChange({ ...block, data })}
        />
      )
    case 'quote':
      return (
        <QuoteForm
          block={block}
          onChange={(data) => onChange({ ...block, data })}
        />
      )
    case 'list':
      return (
        <ListForm
          block={block}
          onChange={(data) => onChange({ ...block, data })}
        />
      )
    case 'divider':
      return <div className="divider-preview" />
    case 'callout':
      return (
        <CalloutForm
          block={block}
          onChange={(data) => onChange({ ...block, data })}
        />
      )
    case 'stats':
      return (
        <StatsForm
          block={block}
          onChange={(data) => onChange({ ...block, data })}
        />
      )
    case 'table':
      return (
        <TableForm
          block={block}
          onChange={(data) => onChange({ ...block, data })}
        />
      )
    case 'gallery':
      return (
        <GalleryForm
          block={block}
          onChange={(data) => onChange({ ...block, data })}
        />
      )
    case 'code':
      return (
        <CodeForm
          block={block}
          onChange={(data) => onChange({ ...block, data })}
        />
      )
    case 'button':
      return (
        <ButtonForm
          block={block}
          onChange={(data) => onChange({ ...block, data })}
        />
      )
  }
}

function HeadingForm({
  block,
  onChange,
}: {
  block: HeadingBlock
  onChange: (data: HeadingBlock['data']) => void
}) {
  return (
    <div className="field-row">
      <div>
        <label className="field-label" htmlFor={`${block.id}-text`}>
          Text
        </label>
        <input
          id={`${block.id}-text`}
          className="field"
          value={block.data.text}
          placeholder="Section heading"
          onChange={(event) =>
            onChange({ ...block.data, text: event.target.value })
          }
        />
      </div>
      <div>
        <label className="field-label" htmlFor={`${block.id}-level`}>
          Level
        </label>
        <select
          id={`${block.id}-level`}
          className="field"
          value={block.data.level}
          onChange={(event) =>
            onChange({
              ...block.data,
              level: Number(event.target.value) as 2 | 3 | 4,
            })
          }
        >
          <option value={2}>H2</option>
          <option value={3}>H3</option>
          <option value={4}>H4</option>
        </select>
      </div>
    </div>
  )
}

function ParagraphForm({
  block,
  onChange,
}: {
  block: ParagraphBlock
  onChange: (data: ParagraphBlock['data']) => void
}) {
  return (
    <div>
      <label className="field-label" htmlFor={`${block.id}-text`}>
        Body
      </label>
      <textarea
        id={`${block.id}-text`}
        className="field"
        value={block.data.text}
        placeholder="Write the paragraph"
        onChange={(event) =>
          onChange({ ...block.data, text: event.target.value })
        }
      />
    </div>
  )
}

function ImageForm({
  block,
  onChange,
}: {
  block: ImageBlock
  onChange: (data: ImageBlock['data']) => void
}) {
  return (
    <div className="field-stack">
      <div>
        <p className="field-label">Image</p>
        <ImageUploadField
          id={`${block.id}-upload`}
          value={block.data.url}
          onChange={(url) => onChange({ ...block.data, url })}
        />
      </div>
      <div>
        <label className="field-label" htmlFor={`${block.id}-alt`}>
          Alt text
        </label>
        <input
          id={`${block.id}-alt`}
          className="field"
          value={block.data.alt}
          placeholder="Describe the image"
          onChange={(event) =>
            onChange({ ...block.data, alt: event.target.value })
          }
        />
      </div>
      <div>
        <label className="field-label" htmlFor={`${block.id}-caption`}>
          Caption
        </label>
        <input
          id={`${block.id}-caption`}
          className="field"
          value={block.data.caption}
          placeholder="Optional caption"
          onChange={(event) =>
            onChange({ ...block.data, caption: event.target.value })
          }
        />
      </div>
    </div>
  )
}

function QuoteForm({
  block,
  onChange,
}: {
  block: QuoteBlock
  onChange: (data: QuoteBlock['data']) => void
}) {
  return (
    <div className="field-stack">
      <div>
        <label className="field-label" htmlFor={`${block.id}-text`}>
          Quote
        </label>
        <textarea
          id={`${block.id}-text`}
          className="field"
          value={block.data.text}
          placeholder="Quoted text"
          onChange={(event) =>
            onChange({ ...block.data, text: event.target.value })
          }
        />
      </div>
      <div>
        <label className="field-label" htmlFor={`${block.id}-citation`}>
          Citation
        </label>
        <input
          id={`${block.id}-citation`}
          className="field"
          value={block.data.citation}
          placeholder="Speaker or source"
          onChange={(event) =>
            onChange({ ...block.data, citation: event.target.value })
          }
        />
      </div>
    </div>
  )
}

function ListForm({
  block,
  onChange,
}: {
  block: ListBlock
  onChange: (data: ListBlock['data']) => void
}) {
  const updateItem = (index: number, value: string) => {
    onChange({
      ...block.data,
      items: block.data.items.map((item, itemIndex) =>
        itemIndex === index ? value : item,
      ),
    })
  }

  const removeItem = (index: number) => {
    const items = block.data.items.filter((_, itemIndex) => itemIndex !== index)
    onChange({ ...block.data, items: items.length > 0 ? items : [''] })
  }

  return (
    <div className="field-stack">
      <div>
        <label className="field-label" htmlFor={`${block.id}-style`}>
          Style
        </label>
        <select
          id={`${block.id}-style`}
          className="field"
          value={block.data.style}
          onChange={(event) =>
            onChange({
              ...block.data,
              style: event.target.value as ListBlock['data']['style'],
            })
          }
        >
          <option value="ul">Bulleted</option>
          <option value="ol">Numbered</option>
        </select>
      </div>
      <div>
        {block.data.items.map((item, index) => (
          <div className="list-item-row" key={`${block.id}-${index}`}>
            <input
              className="field"
              value={item}
              placeholder={`Item ${index + 1}`}
              onChange={(event) => updateItem(index, event.target.value)}
            />
            <button
              type="button"
              className="btn"
              onClick={() => removeItem(index)}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn"
          onClick={() =>
            onChange({ ...block.data, items: [...block.data.items, ''] })
          }
        >
          Add item
        </button>
      </div>
    </div>
  )
}

function CalloutForm({
  block,
  onChange,
}: {
  block: CalloutBlock
  onChange: (data: CalloutBlock['data']) => void
}) {
  return (
    <div className="field-stack">
      <div className="field-row">
        <div>
          <label className="field-label" htmlFor={`${block.id}-title`}>
            Title
          </label>
          <input
            id={`${block.id}-title`}
            className="field"
            value={block.data.title}
            placeholder="Key takeaway"
            onChange={(event) =>
              onChange({ ...block.data, title: event.target.value })
            }
          />
        </div>
        <div>
          <label className="field-label" htmlFor={`${block.id}-tone`}>
            Tone
          </label>
          <select
            id={`${block.id}-tone`}
            className="field"
            value={block.data.tone}
            onChange={(event) =>
              onChange({
                ...block.data,
                tone: event.target.value as CalloutBlock['data']['tone'],
              })
            }
          >
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="success">Success</option>
          </select>
        </div>
      </div>
      <div>
        <label className="field-label" htmlFor={`${block.id}-text`}>
          Text
        </label>
        <textarea
          id={`${block.id}-text`}
          className="field"
          value={block.data.text}
          placeholder="Supporting detail"
          onChange={(event) =>
            onChange({ ...block.data, text: event.target.value })
          }
        />
      </div>
    </div>
  )
}

function StatsForm({
  block,
  onChange,
}: {
  block: StatsBlock
  onChange: (data: StatsBlock['data']) => void
}) {
  const updateItem = (
    index: number,
    field: 'value' | 'label' | 'change',
    value: string,
  ) => {
    onChange({
      items: block.data.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    })
  }

  return (
    <div className="field-stack">
      {block.data.items.map((item, index) => (
        <div className="stats-row" key={`${block.id}-stat-${index}`}>
          <input
            className="field"
            value={item.value}
            placeholder="6.2%"
            onChange={(event) => updateItem(index, 'value', event.target.value)}
          />
          <input
            className="field"
            value={item.label}
            placeholder="Inflation"
            onChange={(event) => updateItem(index, 'label', event.target.value)}
          />
          <input
            className="field"
            value={item.change}
            placeholder="+0.2 pts"
            onChange={(event) => updateItem(index, 'change', event.target.value)}
          />
          <button
            type="button"
            className="btn"
            onClick={() =>
              onChange({
                items: block.data.items.filter((_, itemIndex) => itemIndex !== index),
              })
            }
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        className="btn"
        onClick={() =>
          onChange({
            items: [...block.data.items, { value: '', label: '', change: '' }],
          })
        }
      >
        Add figure
      </button>
    </div>
  )
}

function TableForm({
  block,
  onChange,
}: {
  block: TableBlock
  onChange: (data: TableBlock['data']) => void
}) {
  const columnCount = block.data.headers.length

  const updateHeader = (index: number, value: string) => {
    onChange({
      ...block.data,
      headers: block.data.headers.map((header, headerIndex) =>
        headerIndex === index ? value : header,
      ),
    })
  }

  const updateCell = (rowIndex: number, cellIndex: number, value: string) => {
    onChange({
      ...block.data,
      rows: block.data.rows.map((row, currentRow) =>
        currentRow === rowIndex
          ? row.map((cell, currentCell) =>
              currentCell === cellIndex ? value : cell,
            )
          : row,
      ),
    })
  }

  return (
    <div className="field-stack">
      <div className="table-grid" style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}>
        {block.data.headers.map((header, index) => (
          <input
            key={`${block.id}-h-${index}`}
            className="field"
            value={header}
            placeholder={`Header ${index + 1}`}
            onChange={(event) => updateHeader(index, event.target.value)}
          />
        ))}
        {block.data.rows.map((row, rowIndex) =>
          row.map((cell, cellIndex) => (
            <input
              key={`${block.id}-r-${rowIndex}-${cellIndex}`}
              className="field"
              value={cell}
              onChange={(event) =>
                updateCell(rowIndex, cellIndex, event.target.value)
              }
            />
          )),
        )}
      </div>
      <div className="inline-actions">
        <button
          type="button"
          className="btn"
          onClick={() =>
            onChange({
              ...block.data,
              rows: [...block.data.rows, Array.from({ length: columnCount }, () => '')],
            })
          }
        >
          Add row
        </button>
        <button
          type="button"
          className="btn"
          onClick={() =>
            onChange({
              headers: [...block.data.headers, ''],
              rows: block.data.rows.map((row) => [...row, '']),
            })
          }
        >
          Add column
        </button>
      </div>
    </div>
  )
}

function GalleryForm({
  block,
  onChange,
}: {
  block: GalleryBlock
  onChange: (data: GalleryBlock['data']) => void
}) {
  const updateImage = (
    index: number,
    field: 'url' | 'caption',
    value: string,
  ) => {
    onChange({
      images: block.data.images.map((image, imageIndex) =>
        imageIndex === index ? { ...image, [field]: value } : image,
      ),
    })
  }

  return (
    <div className="field-stack">
      {block.data.images.map((image, index) => (
        <div className="field-row" key={`${block.id}-img-${index}`}>
          <input
            className="field"
            value={image.url}
            placeholder="Image URL"
            onChange={(event) => updateImage(index, 'url', event.target.value)}
          />
          <input
            className="field"
            value={image.caption}
            placeholder="Caption"
            onChange={(event) =>
              updateImage(index, 'caption', event.target.value)
            }
          />
        </div>
      ))}
      <button
        type="button"
        className="btn"
        onClick={() =>
          onChange({
            images: [...block.data.images, { url: '', caption: '' }],
          })
        }
      >
        Add image
      </button>
    </div>
  )
}

function CodeForm({
  block,
  onChange,
}: {
  block: CodeBlock
  onChange: (data: CodeBlock['data']) => void
}) {
  return (
    <div className="field-stack">
      <div>
        <label className="field-label" htmlFor={`${block.id}-language`}>
          Language
        </label>
        <select
          id={`${block.id}-language`}
          className="field"
          value={block.data.language}
          onChange={(event) =>
            onChange({ ...block.data, language: event.target.value })
          }
        >
          <option value="text">Text</option>
          <option value="json">JSON</option>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="sql">SQL</option>
        </select>
      </div>
      <textarea
        className="field code-field"
        value={block.data.code}
        placeholder="Paste a snippet or data note"
        onChange={(event) =>
          onChange({ ...block.data, code: event.target.value })
        }
      />
    </div>
  )
}

function ButtonForm({
  block,
  onChange,
}: {
  block: ButtonBlock
  onChange: (data: ButtonBlock['data']) => void
}) {
  return (
    <div className="field-row three">
      <input
        className="field"
        value={block.data.label}
        placeholder="Button label"
        onChange={(event) =>
          onChange({ ...block.data, label: event.target.value })
        }
      />
      <input
        className="field"
        value={block.data.url}
        placeholder="https://"
        onChange={(event) =>
          onChange({ ...block.data, url: event.target.value })
        }
      />
      <select
        className="field"
        value={block.data.style}
        onChange={(event) =>
          onChange({
            ...block.data,
            style: event.target.value as ButtonBlock['data']['style'],
          })
        }
      >
        <option value="primary">Primary</option>
        <option value="secondary">Secondary</option>
      </select>
    </div>
  )
}
