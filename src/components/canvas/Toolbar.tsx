import { useRef } from "react";
import { useEditorStore } from "../../stores/editorStore";
import { useSlideStore } from "../../stores/slideStore";
import { UndoRedoButtons } from "../ui/UndoRedoButtons";
import { ThemeToggle } from "../ui/ThemeToggle";
import { useMediaQuery } from "../../hooks/useMediaQuery";
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
  const activeTool = useEditorStore((state) => state.activeTool);
  const setActiveTool = useEditorStore((state) => state.setActiveTool);
  const setCurrentSlide = useEditorStore((state) => state.setCurrentSlide);
  const { toggleSlideList, togglePropertyPanel } = useEditorStore();
  const { project, clearProject } = useSlideStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // レスポンシブ判定
  const isTablet = useMediaQuery("(max-width: 1023px)");

  const handleBackToHome = () => {
    setCurrentSlide(null);
    clearProject();
  };

  const tools: { id: ToolType; label: string; icon: string }[] = [
    { id: "select", label: "Select", icon: "↖" },
    { id: "rect", label: "Rectangle", icon: "▢" },
    { id: "circle", label: "Circle", icon: "○" },
    { id: "text", label: "Text", icon: "T" },
    { id: "image", label: "Image", icon: "🖼" },
  ];

  const handleToolClick = (tool: ToolType) => {
    setActiveTool(tool);
    if (tool === "rect") addRect();
    if (tool === "circle") addCircle();
    if (tool === "text") addText();
    if (tool === "image") fileInputRef.current?.click();
  };

  // Issue #87: form.reset()を使用したファイル入力のリセット（DOM直接操作を回避）
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      addImage(file);
      // form.reset() を使用してファイル入力をリセット
      // DOMの直接操作（e.target.value = ""）を回避
      const form = e.target.form;
      if (form) {
        form.reset();
      }
    }
  };

  // Format last saved time
  const formatLastSaved = (date: Date | null): string => {
    if (!date) return "";
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return "たった今";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分前`;
    return date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
  };

  // Get save status text and color
  const getSaveStatus = () => {
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
  };

  const saveStatus = getSaveStatus();

  return (
    <form className="contents" onSubmit={(e) => e.preventDefault()}>
      <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-700 px-2 lg:px-4 py-2 flex gap-2 items-center justify-between overflow-x-auto">
        <div className="flex gap-1 lg:gap-2 items-center">
          {/* ホームに戻る */}
          <button
            onClick={handleBackToHome}
            className="p-2 lg:px-3 lg:py-2 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-1"
            title="プロジェクト一覧に戻る"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>

          {/* プロジェクト名（タブレット以下では非表示） */}
          {project && (
            <span className="hidden lg:block text-sm font-medium text-gray-700 dark:text-gray-200 ml-2">
              {project.title}
            </span>
          )}

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />

          {/* 元に戻す/やり直し */}
          <UndoRedoButtons />

          <div className="w-px h-6 bg-gray-300 mx-2" />

          {/* ツール */}
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              className={`p-2 lg:px-3 lg:py-2 rounded transition-colors ${
                activeTool === tool.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
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

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />

          {/* レイヤー操作 */}
          <button
            onClick={bringToFront}
            className="p-2 lg:px-3 lg:py-2 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-lg"
            title="最前面に移動"
            aria-label="選択したオブジェクトを最前面に移動"
          >
            ⏫
          </button>
          <button
            onClick={sendToBack}
            className="p-2 lg:px-3 lg:py-2 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-lg"
            title="最背面に移動"
            aria-label="選択したオブジェクトを最背面に移動"
          >
            ⏬
          </button>
        </div>

        {/* テーマ切り替えボタン */}
        <ThemeToggle className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700" />

        {/* パネル開閉ボタン（タブレット以下で表示） */}
        {isTablet && (
          <div className="flex gap-2 items-center">
            <button
              onClick={toggleSlideList}
              className="p-2 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              title="スライド一覧を開閉"
              aria-label="スライド一覧を開閉"
            >
              📋
            </button>
            <button
              onClick={togglePropertyPanel}
              className="p-2 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              title="プロパティパネルを開閉"
              aria-label="プロパティパネルを開閉"
            >
              ⚙️
            </button>
          </div>
        )}

        {/* 保存ステータス */}
        {saveStatus.text && (
          <div className={`text-xs lg:text-sm ${saveStatus.color} font-medium whitespace-nowrap`}>
            {saveStatus.text}
          </div>
        )}
      </div>
    </form>
  );
}
