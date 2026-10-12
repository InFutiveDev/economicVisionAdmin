export async function renderDomToImageFile(
  element: HTMLElement,
  fileName = 'epaper-page.jpg',
): Promise<File> {
  const width = element.offsetWidth || 900
  const height = element.offsetHeight || 1270

  // Serialize element styles and HTML
  const clone = element.cloneNode(true) as HTMLElement
  clone.style.transform = 'none'

  // Construct SVG foreignObject
  const html = clone.outerHTML
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width:${width}px; height:${height}px;">
          ${html}
        </div>
      </foreignObject>
    </svg>
  `

  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const svgUrl = URL.createObjectURL(svgBlob)

  try {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('Failed to rasterize newspaper layout.'))
      img.src = svgUrl
    })

    const canvas = document.createElement('canvas')
    canvas.width = width * 1.5 // 1.5x crisp density
    canvas.height = height * 1.5
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('Canvas 2D context not available.')
    }

    ctx.scale(1.5, 1.5)
    ctx.fillStyle = '#fcfbf7'
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(img, 0, 0, width, height)

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.92),
    )

    if (!blob) {
      throw new Error('Could not convert canvas to image blob.')
    }

    return new File([blob], fileName, { type: 'image/jpeg' })
  } finally {
    URL.revokeObjectURL(svgUrl)
  }
}
