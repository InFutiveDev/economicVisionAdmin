export type Category = {
  id: string
  name: string
  slug: string
  description: string
  parentId: string | null
  order: number
  showInNav: boolean
}

export type CategoryGroup = Category & { children: Category[] }

export function groupCategories(categories: Category[]): CategoryGroup[] {
  const mains = categories.filter((category) => !category.parentId)
  return mains.map((main) => ({
    ...main,
    children: categories.filter((category) => category.parentId === main.id),
  }))
}

export const DEFAULT_MENU: { name: string; children?: string[] }[] = [
  { name: 'Economy', children: ['GDP', 'Inflation', 'GST', 'Jobs', 'Trade'] },
  { name: 'Markets' },
  { name: 'Business', children: ['Corporate', 'Startups', 'MSME', 'Real Estate', 'Auto'] },
  { name: 'Money', children: ['Tax', 'SIP', 'Mutual Funds', 'Insurance', 'Loans', 'Retirement'] },
  { name: 'Investing' },
  { name: 'Policy' },
  { name: 'Global' },
  { name: 'Opinion' },
]

export type HomeSectionKey =
  | 'hero'
  | 'top-stories'
  | 'latest-news'
  | 'exclusive'
  | 'why-it-matters'
  | 'opinion'

export type HomeSectionItem = {
  articleId: string
  title: string
  category: string
  author: string
  status: string
  coverImage: string
  label: string
  note: string
}

export type HomeSections = Record<HomeSectionKey, HomeSectionItem[]>

type SectionField = {
  label: string
  placeholder?: string
  options?: string[]
}

export type HomeSectionConfig = {
  key: HomeSectionKey
  title: string
  description: string
  limit: number
  labelField?: SectionField
  noteField?: SectionField
}

export const HOME_SECTIONS: HomeSectionConfig[] = [
  {
    key: 'hero',
    title: 'Hero slider',
    description: 'Large rotating stories at the top of the homepage.',
    limit: 5,
    labelField: { label: 'Badge', placeholder: 'e.g. Featured, Analysis' },
  },
  {
    key: 'top-stories',
    title: 'Top Stories',
    description: 'Stories listed beside the hero slider.',
    limit: 8,
  },
  {
    key: 'latest-news',
    title: 'Latest News',
    description: 'Position 1 is the featured story; the rest are timed updates.',
    limit: 6,
  },
  {
    key: 'exclusive',
    title: 'The Economic Vision Exclusive',
    description: 'Original reporting cards with a type badge.',
    limit: 3,
    labelField: { label: 'Type', options: ['EXCLUSIVE', 'EXPLAINER', 'ANALYSIS'] },
  },
  {
    key: 'why-it-matters',
    title: 'Why it matters',
    description: 'Impact cards linking to the story that explains them.',
    limit: 4,
    labelField: { label: 'Impact', options: ['People', 'Investor', 'Business', 'Economy'] },
    noteField: { label: 'Headline question', placeholder: 'e.g. Markets और investments पर क्या असर?' },
  },
  {
    key: 'opinion',
    title: 'Opinion',
    description: 'Position 1 is the featured column; the rest are listed beside it.',
    limit: 4,
    labelField: { label: 'Author role', placeholder: 'e.g. Consulting Editor' },
  },
]

export type MediaType = 'video' | 'podcast' | 'story'

export type MediaItem = {
  id: string
  type: MediaType
  title: string
  summary: string
  image: string
  url: string
  duration: string
  category: string
  subCategory: string
  order: number
  published: boolean
}

export const MEDIA_TABS: { type: MediaType; title: string; urlLabel: string }[] = [
  { type: 'video', title: 'Videos', urlLabel: 'YouTube link' },
  { type: 'podcast', title: 'Podcasts', urlLabel: 'YouTube link or episode URL' },
  { type: 'story', title: 'Stories', urlLabel: 'Story link' },
]
