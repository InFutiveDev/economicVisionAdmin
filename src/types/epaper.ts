export type EpaperStatus = 'published' | 'draft'

export type EpaperPageLayoutTemplate =
  | 'front-page'
  | 'business-market'
  | 'editorial'
  | 'regional'

export type PageDesignStory = {
  id: string
  kicker?: string
  headline: string
  byline?: string
  paragraphs: string[]
  image?: string
  caption?: string
}

export type CustomPageDesign = {
  template: EpaperPageLayoutTemplate
  masthead: {
    paperName: string
    englishTitle?: string
    tagline?: string
    city: string
    dateString: string
    price?: string
    issueNo?: string
    pageNo: number
    totalPages: number
  }
  topTicker?: {
    items: Array<{ label: string; value: string; change?: string }>
  }
  leadStory: PageDesignStory
  sideStories: PageDesignStory[]
  bottomStories: PageDesignStory[]
}

export type EpaperPageItem = {
  id: string
  pageNumber: number
  title: string
  image: string
  description?: string
  paragraph?: string
  customDesign?: CustomPageDesign
}

export type EpaperEdition = {
  id: string
  name: string
  title?: string
  city: string
  date: string
  dateShort: string
  slug: string
  cover: string
  paragraph?: string
  excerpt?: string
  description?: string
  paragraphs?: string[]
  pages: EpaperPageItem[]
  today: boolean
  status: EpaperStatus
  pdfUrl?: string
  createdAt?: string
  updatedAt?: string
}

export type EpaperInput = {
  id?: string
  name: string
  title?: string
  city: string
  date: string
  dateShort: string
  slug: string
  cover: string
  paragraph?: string
  excerpt?: string
  description?: string
  paragraphs?: string[]
  pages: EpaperPageItem[]
  today: boolean
  status: EpaperStatus
  pdfUrl?: string
}

export const CITIES_LIST = [
  'Indore',
  'Bhopal',
  'Ujjain',
  'Gwalior',
  'Jabalpur',
  'Raipur',
  'Delhi',
  'Mumbai',
] as const
