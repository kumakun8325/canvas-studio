import { isValidImageUrl } from '../../lib/imageValidation'

interface SlideThumbProps {
  slideId: string
  index: number
  isActive: boolean
  thumbnail?: string
  onSelect: () => void
  onDelete: () => void
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
  // Issue #87: サムネイルURLのバリデーション（XSS保護）
  const isThumbnailValid = thumbnail && isValidImageUrl(thumbnail)

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
        {isThumbnailValid ? (
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
