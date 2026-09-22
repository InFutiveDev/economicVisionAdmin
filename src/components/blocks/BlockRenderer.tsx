import type { Block } from '../../types/block'

type BlockRendererProps = {
  block: Block
}

export function BlockRenderer({ block }: BlockRendererProps) {
  switch (block.type) {
    case 'heading': {
      const HeadingTag = `h${block.data.level}` as 'h2' | 'h3' | 'h4'
      return (
        <div className="rendered-block">
          <HeadingTag className={`rendered-heading h${block.data.level}`}>
            {block.data.text || 'Untitled heading'}
          </HeadingTag>
        </div>
      )
    }
    case 'paragraph':
      return (
        <div className="rendered-block">
          <p className="rendered-paragraph">
            {block.data.text || 'Empty paragraph'}
          </p>
        </div>
      )
    case 'image':
      return (
        <figure className="rendered-block rendered-image">
          {block.data.url ? (
            <img src={block.data.url} alt={block.data.alt || ''} />
          ) : (
            <p className="rendered-empty">No image URL yet</p>
          )}
          {block.data.caption ? (
            <figcaption className="rendered-caption">{block.data.caption}</figcaption>
          ) : null}
        </figure>
      )
    case 'quote':
      return (
        <blockquote className="rendered-block rendered-quote">
          <p>{block.data.text || 'Empty quote'}</p>
          {block.data.citation ? <footer>— {block.data.citation}</footer> : null}
        </blockquote>
      )
    case 'list': {
      const items = block.data.items.filter((item) => item.trim().length > 0)
      const ListTag = block.data.style === 'ol' ? 'ol' : 'ul'
      return (
        <div className="rendered-block">
          {items.length > 0 ? (
            <ListTag className="rendered-list">
              {items.map((item, index) => (
                <li key={`${block.id}-${index}`}>{item}</li>
              ))}
            </ListTag>
          ) : (
            <p className="rendered-empty">Empty list</p>
          )}
        </div>
      )
    }
    case 'divider':
      return <hr className="rendered-block rendered-divider" />
    case 'callout':
      return (
        <aside className={`rendered-block rendered-callout tone-${block.data.tone}`}>
          <strong>{block.data.title || 'Note'}</strong>
          <p>{block.data.text}</p>
        </aside>
      )
    case 'stats':
      return (
        <div className="rendered-block rendered-stats">
          {block.data.items.map((item, index) => (
            <article key={`${block.id}-${index}`}>
              <p className="stat-value">{item.value || '—'}</p>
              <p className="stat-label">{item.label || 'Metric'}</p>
              {item.change ? <p className="stat-change">{item.change}</p> : null}
            </article>
          ))}
        </div>
      )
    case 'table':
      return (
        <div className="rendered-block rendered-table-wrap">
          <table className="rendered-table">
            <thead>
              <tr>
                {block.data.headers.map((header, index) => (
                  <th key={`${block.id}-h-${index}`}>{header || `Col ${index + 1}`}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.data.rows.map((row, rowIndex) => (
                <tr key={`${block.id}-r-${rowIndex}`}>
                  {row.map((cell, cellIndex) => (
                    <td key={`${block.id}-c-${rowIndex}-${cellIndex}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case 'gallery':
      return (
        <div className="rendered-block rendered-gallery">
          {block.data.images.map((image, index) => (
            <figure key={`${block.id}-${index}`}>
              {image.url ? (
                <img src={image.url} alt={image.caption || ''} />
              ) : (
                <p className="rendered-empty">No image</p>
              )}
              {image.caption ? (
                <figcaption className="rendered-caption">{image.caption}</figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      )
    case 'code':
      return (
        <pre className="rendered-block rendered-code">
          <code>{block.data.code || '// empty snippet'}</code>
        </pre>
      )
    case 'button':
      return (
        <div className="rendered-block">
          <a
            className={`rendered-button ${block.data.style}`}
            href={block.data.url || '#'}
          >
            {block.data.label || 'Button'}
          </a>
        </div>
      )
  }
}
