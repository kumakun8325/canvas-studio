export interface CMYKColor {
  cyan: number
  magenta: number
  yellow: number
  key: number
}

export interface RGBColor {
  r: number
  g: number
  b: number
}

export function rgbToCmyk(rgb: RGBColor): CMYKColor {
  const { r, g, b } = rgb

  const rNorm = r / 255
  const gNorm = g / 255
  const bNorm = b / 255

  const k = 1 - Math.max(rNorm, gNorm, bNorm)

  if (k === 1) {
    return { cyan: 0, magenta: 0, yellow: 0, key: 100 }
  }

  const c = (1 - rNorm - k) / (1 - k)
  const m = (1 - gNorm - k) / (1 - k)
  const y = (1 - bNorm - k) / (1 - k)

  return {
    cyan: Math.round(c * 100),
    magenta: Math.round(m * 100),
    yellow: Math.round(y * 100),
    key: Math.round(k * 100),
  }
}

export function cmykToRgb(cmyk: CMYKColor): RGBColor {
  const { cyan, magenta, yellow, key } = cmyk

  const c = cyan / 100
  const m = magenta / 100
  const y = yellow / 100
  const k = key / 100

  const r = Math.round(255 * (1 - c) * (1 - k))
  const g = Math.round(255 * (1 - m) * (1 - k))
  const b = Math.round(255 * (1 - y) * (1 - k))

  return { r, g, b }
}

export function hexToRgb(hex: string): RGBColor {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) {
    return { r: 0, g: 0, b: 0 }
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  }
}

export function rgbToHex(rgb: RGBColor): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0')
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`
}

export function formatCmyk(cmyk: CMYKColor): string {
  return `C${cmyk.cyan} M${cmyk.magenta} Y${cmyk.yellow} K${cmyk.key}`
}
