/**
 * URLバリデーション utilities
 * XSS対策とセキュリティのための入力検証
 */

/**
 * 許可するURLプロトコル
 */
const ALLOWED_PROTOCOLS = ['http:', 'https:', 'data:', 'blob:'] as const

/**
 * 許可する画像 MIMEタイプ
 */
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
] as const

/**
 * 最大画像サイズ (5MB)
 */
const MAX_IMAGE_SIZE = 5 * 1024 * 1024

/**
 * URLが安全か検証する
 * XSS対策として、javascript: や data: (特定以外) などの危険なプロトコルを拒否
 *
 * @param url - 検証するURL文字列
 * @returns URLが安全な場合は true
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ALLOWED_PROTOCOLS.includes(parsed.protocol as any)
  } catch {
    // URLのパースに失敗した場合は無効
    return false
  }
}

/**
 * 画像 URL が安全か検証する
 * より厳格なチェック for 画像用
 *
 * @param url - 検証する画像URL
 * @returns 画像URLが安全な場合は true
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false
  }

  try {
    const parsed = new URL(url)

    // http: と https: のみ許可（data: や blob: はサムネイルでは使わない）
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false
    }

    return true
  } catch {
    return false
  }
}

/**
 * ファイルが許可された画像タイプか検証する
 *
 * @param file - 検証する File オブジェクト
 * @returns 許可された画像タイプの場合は true
 */
export function isValidImageFile(file: File): boolean {
  return ALLOWED_IMAGE_TYPES.includes(file.type as any)
}

/**
 * ファイルサイズが制限内か検証する
 *
 * @param file - 検証する File オブジェクト
 * @param maxSize - 最大サイズ（デフォルト: 5MB）
 * @returns 制限内の場合は true
 */
export function isValidImageSize(file: File, maxSize: number = MAX_IMAGE_SIZE): boolean {
  return file.size <= maxSize
}

/**
 * 画像ファイルのバリデーション結果
 */
export interface ImageValidationResult {
  valid: boolean
  error?: string
}

/**
 * 画像ファイルを包括的にバリデーションする
 * MIMEタイプとファイルサイズをチェック
 *
 * @param file - 検証する File オブジェクト
 * @param maxSize - 最大サイズ（デフォルト: 5MB）
 * @returns バリデーション結果
 */
export function validateImageFile(
  file: File,
  maxSize: number = MAX_IMAGE_SIZE
): ImageValidationResult {
  if (!isValidImageFile(file)) {
    return {
      valid: false,
      error: `許可された画像形式ではありません: ${file.type || 'unknown'}`,
    }
  }

  if (!isValidImageSize(file, maxSize)) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1)
    return {
      valid: false,
      error: `画像サイズが大きすぎます（最大 ${maxSizeMB}MB）`,
    }
  }

  return { valid: true }
}
