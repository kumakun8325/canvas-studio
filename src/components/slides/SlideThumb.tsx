interface SlideThumbProps {
  slideId: string
  index: number
  isActive: boolean
  thumbnail?: string
  onSelect: () => void
  onDelete: () => void
}

/**
 * サムネイルURLのバリデーション (XSS対策)
 * 許可されるプロトコル: http, https, data (image/* のみ)
 */
function isValidThumbnailUrl(url: string): boolean {
  if (!url) return false

  try {
    const parsed = new URL(url)
    const protocol = parsed.protocol.toLowerCase()

    // 許可されるプロトコル: http:, https:
    const allowedProtocols = ['http:', 'https:']
    if (allowedProtocols.includes(protocol)) {
      return true
    }

    // data: URL の場合、画像フォーマットのみ許可
    if (protocol === 'data:') {
      // data: URL全体をチェック（pathnameは先頭の'data:'を含まない）
      const dataString = url.toLowerCase()
      const allowedDataTypes = [
        'data:image/png',
        'data:image/jpeg',
        'data:image/jpg',
        'data:image/gif',
        'data:image/webp',
        'data:image/svg+xml',
        'data:image/bmp',
      ]
      return allowedDataTypes.some(type => dataString.startsWith(type))
    }

    return false
  } catch {
    // URLパースに失敗した場合は無効
    return false
  }
}

/**
 * スライドのサムネイルコンポーネント
 * スライド一覧サイドバーに表示される各スライドのサムネイルを描画
 */
export function SlideThumb({
  index,
  isActive,
  thumbnail,
  onSelect,
  onDelete,
}: SlideThumbProps) {
  const isValidThumbnail = thumbnail && isValidThumbnailUrl(thumbnail)

  return (
    <div
      onClick={onSelect}
      className={`relative cursor-pointer group ${
        isActive ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      {/* スライド番号 */}
      <div className="absolute top-1 left-1 text-xs bg-black/50 text-white px-1 rounded">
        {index + 1}
      </div>

      {/* サムネイルまたはプレースホルダー */}
      <div className="w-44 h-24 bg-white border rounded shadow-sm flex items-center justify-center">
        {isValidThumbnail ? (
          <img
            src={thumbnail}
            alt={`Slide ${index + 1}`}
            className="w-full h-full object-cover rounded"
          />
        ) : (
          <span className="text-gray-400 text-xs">Slide {index + 1}</span>
        )}
      </div>

      {/* 削除ボタン */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="スライドを削除"
      >
        ×
      </button>
    </div>
  )
}
