import { useRef, useMemo, useCallback } from "react";
import { useEditorStore } from "../../stores/editorStore";
import { UndoRedoButtons } from "../ui/UndoRedoButtons";
import { validateImageFile } from "../../lib/validation";
import type { ToolType } from "../../types";

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

  // パフォーマンス改善: tools 配列をメモ化
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

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // セキュリティ: 画像ファイルのバリデーション
    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error || "画像のアップロードに失敗しました");
      e.target.value = "";
      return;
    }

    addImage(file);
    // Reset input value to allow selecting the same file again
    e.target.value = "";
  }, [addImage]);

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

  const saveStatus = useMemo(() => getSaveStatus(), [getSaveStatus]);

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

      {/* 保存ステータス */}
      {saveStatus.text && (
        <div className={`text-sm ${saveStatus.color} font-medium`}>
          {saveStatus.text}
        </div>
      )}
    </div>
  );
}
