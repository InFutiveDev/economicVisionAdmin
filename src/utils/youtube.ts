const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/

export function getYouTubeId(input: string): string | null {
  const value = input.trim()
  if (!value) return null
  if (YOUTUBE_ID.test(value)) return value

  let url: URL
  try {
    url = new URL(value.startsWith('http') ? value : `https://${value}`)
  } catch {
    return null
  }

  const host = url.hostname.replace(/^(www\.|m\.|music\.)/, '')
  let id: string | null = null
  if (host === 'youtu.be') {
    id = url.pathname.split('/')[1] ?? null
  } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (url.pathname === '/watch') {
      id = url.searchParams.get('v')
    } else {
      const [, kind, rest] = url.pathname.split('/')
      if (['embed', 'shorts', 'live', 'v'].includes(kind)) id = rest ?? null
    }
  }
  return id && YOUTUBE_ID.test(id) ? id : null
}

export const youTubeThumbnail = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`

export const youTubeEmbed = (id: string) => `https://www.youtube-nocookie.com/embed/${id}`

export const isYouTubeThumbnail = (url: string) => url.startsWith('https://i.ytimg.com/vi/')
