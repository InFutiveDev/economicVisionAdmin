import {
  BarChart3,
  Code2,
  Heading2,
  Image,
  Images,
  Info,
  List,
  Minus,
  MousePointerClick,
  Quote,
  Table,
  Type,
  type LucideIcon,
} from 'lucide-react'
import { BLOCK_META, BLOCK_TYPES, type BlockType } from '../../types/block'

const ICONS: Record<BlockType, LucideIcon> = {
  heading: Heading2,
  paragraph: Type,
  image: Image,
  quote: Quote,
  list: List,
  divider: Minus,
  callout: Info,
  stats: BarChart3,
  table: Table,
  gallery: Images,
  code: Code2,
  button: MousePointerClick,
}

const GROUPS = ['Text', 'Media', 'Data', 'Layout'] as const

type BlockPaletteProps = {
  onAdd: (type: BlockType) => void
}

export function BlockPalette({ onAdd }: BlockPaletteProps) {
  return (
    <section className="palette">
      <div className="palette-header">
        <div>
          <p className="palette-kicker">Content blocks</p>
          <h2 className="palette-title">Add a section</h2>
        </div>
        <p className="palette-hint">{BLOCK_TYPES.length} block types</p>
      </div>
      {GROUPS.map((group) => {
        const types = BLOCK_TYPES.filter((type) => BLOCK_META[type].group === group)
        return (
          <div key={group} className="palette-group">
            <p className="palette-group-label">{group}</p>
            <div className="palette-grid">
              {types.map((type) => {
                const Icon = ICONS[type]
                return (
                  <button
                    key={type}
                    type="button"
                    className="palette-tile"
                    title={BLOCK_META[type].description}
                    onClick={() => onAdd(type)}
                  >
                    <span className="palette-tile-icon">
                      <Icon size={18} />
                    </span>
                    <span className="palette-tile-label">{BLOCK_META[type].label}</span>
                    <span className="palette-tile-desc">{BLOCK_META[type].description}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </section>
  )
}

export function BlockTypeIcon({
  type,
  size = 14,
}: {
  type: BlockType
  size?: number
}) {
  const Icon = ICONS[type]
  return <Icon size={size} />
}
