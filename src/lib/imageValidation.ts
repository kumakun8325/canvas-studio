/**
 * 画像URLのバリデーション utility
 * Issue #87: XSS保護のための画像URL検証
 */

/**
 * 安全な画像MIMEタイプ
 */
const SAFE_IMAGE_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
  'image/x-icon',
]

/**
 * 許可されたプロトコル
 */
const ALLOWED_PROTOCOLS = [
  'http:',
  'https:',
  'data:',
]

/**
 * ブロックする危険なプロトコル
 */
const BLOCKED_PROTOCOLS = [
  'javascript:',
  'vbscript:',
  'data:text/html',
  'data:text/javascript',
  'data:application/javascript',
  'file:',
]

/**
 * Base64文字列が有効かチェック
 */
function isValidBase64(str: string): boolean {
  // Base64の正規表現パターン
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
  return base64Regex.test(str) && str.length % 4 === 0
}

/**
 * 画像URLが安全かどうかを検証
 * @param url - 検証するURL
 * @returns 安全な場合はtrue、そうでない場合はfalse
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false
  }

  try {
    // 危険なプロトコルをチェック
    for (const blocked of BLOCKED_PROTOCOLS) {
      if (url.toLowerCase().startsWith(blocked)) {
        return false
      }
    }

    // URLをパース
    let parsed: URL
    try {
      parsed = new URL(url)
    } catch {
      // URLパースに失敗した場合、相対URLまたは無効なURL
      return false
    }

    // プロトコルチェック
    if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
      return false
    }

    // http/httpsの場合は許可
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return true
    }

    // data URIの場合は追加チェック
    if (parsed.protocol === 'data:') {
      // data:[<mediatype>][;base64],<data>
      const dataUriMatch = url.match(/^data:([^,]*),(.+)$/)
      if (!dataUriMatch) {
        return false
      }

      const [, mediatype, data] = dataUriMatch

      // MIMEタイプが省略されている場合は拒否
      if (!mediatype || mediatype === '') {
        return false
      }

      // MIMEタイプをチェック
      const [mimeType] = mediatype.split(';')
      if (!SAFE_IMAGE_MIME_TYPES.includes(mimeType.toLowerCase())) {
        return false
      }

      // SVGの場合は追加のチェック（scriptタグ等をブロック）
      if (mimeType.toLowerCase() === 'image/svg+xml') {
        const decodedData = decodeURIComponent(data)
        if (
          decodedData.toLowerCase().includes('<script') ||
          decodedData.toLowerCase().includes('javascript:') ||
          decodedData.toLowerCase().includes('vbscript:') ||
          decodedData.toLowerCase().includes('onload=') ||
          decodedData.toLowerCase().includes('onerror=')
        ) {
          return false
        }
      }

      // base64エンコードの場合は形式チェック
      if (mediatype.includes('base64')) {
        return isValidBase64(data)
      }

      return true
    }

    return false
  } catch {
    // 予期しないエラーの場合は安全のため拒否
    return false
  }
}
