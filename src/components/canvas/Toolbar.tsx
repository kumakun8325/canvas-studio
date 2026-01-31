import { useRef, useMemo, useState, useCallback } from "react";
import { useEditorStore } from "../../stores/editorStore";
import { UndoRedoButtons } from "../ui/UndoRedoButtons";
import type { ToolType } from "../../types";

// 画像アップロードの設定
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

interface CanvasActions {
  addRect: () => void;
  addCircle: () => void;
  addText: () => void;
  addImage: (file: File) => void;
  bringToFront: () => void;
  sendToBack: () => void;
}

interface ToolbarProps {
  canvasActions: CanvasActions;
  isSaving?: boolean;
  lastSaved?: Date | null;
  saveError?: Error | null;
}

export function Toolbar({ canvasActions, isSaving = false, lastSaved = null, saveError = null }: ToolbarProps) {
  const { addRect, addCircle, addText, addImage, bringToFront, sendToBack } = canvasActions;
  const { activeTool, setActiveTool } = useEditorStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // tools 配列をメモ化 (Issue #85)
  const tools: { id: ToolType; label: string; icon: string }[] = useMemo(
    () => [
      { id: "select", label: "Select", icon: "↖" },
      { id: "rect", label: "Rectangle", icon: "▢" },
      { id: "circle", label: "Circle", icon: "○" },
      { id: "text", label: "Text", icon: "T" },
      { id: "image", label: "Image", icon: "🖼" },
    ],
    []
  );

  const handleToolClick = useCallback((tool: ToolType) => {
    setActiveTool(tool);
    if (tool === "rect") addRect();
    if (tool === "circle") addCircle();
    if (tool === "text") addText();
    if (tool === "image") fileInputRef.current?.click();
  }, [setActiveTool, addRect, addCircle, addText]);

  /**
   * 画像ファイルのバリデーション (Issue #85)
   * - MIMEタイプチェック
   * - ファイルサイズチェック (10MB制限)
   */
  const validateImageFile = useCallback((file: File): { valid: boolean; error?: string } => {
    // MIMEタイプチェック
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: file.type === 'application/pdf'
          ? 'PDFはアップロードできません。画像ファイルを選択してください。'
          : '画像ファイルのみアップロードできます。',
      };
    }

    // ファイルサイズチェック
    if (file.size > MAX_IMAGE_SIZE) {
      return {
        valid: false,
        error: `ファイルサイズが大きすぎます。${(MAX_IMAGE_SIZE / 1024 / 1024).toFixed(0)}MB以下のファイルのみアップロードできます。`,
      };
    }

    return { valid: true };
  }, []);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    // エラーをリセット
    setUploadError(null);

    if (!file) {
      return;
    }

    // バリデーション
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || '画像のアップロードに失敗しました。');
      e.target.value = "";
      return;
    }

    // バリデーション成功、画像を追加
    addImage(file);
    e.target.value = "";
  }, [addImage, validateImageFile]);

  // Format last saved time
  const formatLastSaved = useCallback((date: Date | null): string => {
    if (!date) return "";
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return "たった今";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分前`;
    return date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
  }, []);

  // Get save status text and color
  const getSaveStatus = useCallback(() => {
    if (saveError) {
      return { text: "保存エラー", color: "text-red-600" };
    }
    if (isSaving) {
      return { text: "保存中...", color: "text-gray-600" };
    }
    if (lastSaved) {
      return { text: `保存済み (${formatLastSaved(lastSaved)})`, color: "text-green-600" };
    }
    return { text: "", color: "" };
  }, [saveError, isSaving, lastSaved, formatLastSaved]);

  const saveStatus = getSaveStatus();

  return (
    <div className="bg-white border-b px-4 py-2 flex gap-2 items-center justify-between">
      <div className="flex gap-2 items-center">
        {/* 元に戻す/やり直し */}
        <UndoRedoButtons />

        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* ツール */}
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => handleToolClick(tool.id)}
            className={`px-3 py-2 rounded transition-colors ${
              activeTool === tool.id
                ? "bg-blue-500 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            title={tool.label}
          >
            {tool.icon}
          </button>
        ))}

        {/* Hidden file input for image upload */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleImageChange}
        />

        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* レイヤー操作 */}
        <button
          onClick={bringToFront}
          className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-lg"
          title="最前面に移動"
          aria-label="選択したオブジェクトを最前面に移動"
        >
          ⏫
        </button>
        <button
          onClick={sendToBack}
          className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-lg"
          title="最背面に移動"
          aria-label="選択したオブジェクトを最背面に移動"
        >
          ⏬
        </button>
      </div>

      <div className="flex items-center gap-4">
        {/* アップロードエラー表示 */}
        {uploadError && (
          <div className="text-sm text-red-600 font-medium">
            {uploadError}
          </div>
        )}

        {/* 保存ステータス */}
        {saveStatus.text && (
          <div className={`text-sm ${saveStatus.color} font-medium`}>
            {saveStatus.text}
          </div>
        )}
      </div>
    </div>
  );
}
