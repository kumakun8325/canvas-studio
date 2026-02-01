import { useRef } from "react";
import { useEditorStore } from "../../stores/editorStore";
import { useSlideStore } from "../../stores/slideStore";
import { UndoRedoButtons } from "../ui/UndoRedoButtons";
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
  const toggleSlideList = useEditorStore((state) => state.toggleSlideList);
  const togglePropertyPanel = useEditorStore((state) => state.togglePropertyPanel);
  const { project, clearProject } = useSlideStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackToHome = () => {
    setCurrentSlide(null);
    clearProject();
  };

  const tools: { id: ToolType; label: string; icon: string }[] = [
    { id: "select", label: "選択", icon: "↖" },
    { id: "rect", label: "四角", icon: "▢" },
    { id: "circle", label: "円", icon: "○" },
    { id: "text", label: "テキスト", icon: "T" },
    { id: "image", label: "画像", icon: "🖼" },
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
      <div className="bg-white border-b px-2 lg:px-4 py-2 flex gap-1 lg:gap-2 items-center justify-between">
        <div className="flex gap-1 lg:gap-2 items-center">
          {/* ホームに戻る */}
          <button
            onClick={handleBackToHome}
            className="p-2 lg:px-3 lg:py-2 rounded bg-gray-100 hover:bg-gray-200 flex items-center gap-1"
            title="プロジェクト一覧に戻る"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="hidden xl:inline text-sm">ホーム</span>
          </button>

          {/* プロジェクト名 - hide on smaller screens */}
          {project && (
            <span className="text-sm font-medium text-gray-700 hidden md:inline ml-2">
              {project.title}
            </span>
          )}

          <div className="w-px h-6 bg-gray-300 mx-1 lg:mx-2 hidden md:block" />

          {/* 元に戻す/やり直し */}
          <div className="hidden md:block">
            <UndoRedoButtons />
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1 lg:mx-2 hidden md:block" />

          {/* ツール - icon only on tablet, icon+text on desktop */}
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              className={`p-2 lg:px-3 lg:py-2 rounded transition-colors ${
                activeTool === tool.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              title={tool.label}
            >
              <span className="text-sm">{tool.icon}</span>
              <span className="hidden xl:inline ml-1">{tool.label}</span>
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

          <div className="w-px h-6 bg-gray-300 mx-1 lg:mx-2 hidden md:block" />

          {/* レイヤー操作 */}
          <button
            onClick={bringToFront}
            className="p-2 lg:px-3 lg:py-2 rounded bg-gray-100 hover:bg-gray-200 text-sm hidden md:block"
            title="最前面に移動"
            aria-label="選択したオブジェクトを最前面に移動"
          >
            ⏫
          </button>
          <button
            onClick={sendToBack}
            className="p-2 lg:px-3 lg:py-2 rounded bg-gray-100 hover:bg-gray-200 text-sm hidden md:block"
            title="最背面に移動"
            aria-label="選択したオブジェクトを最背面に移動"
          >
            ⏬
          </button>

          {/* パネルトグルボタン - tablet only */}
          <div className="w-px h-6 bg-gray-300 mx-1 lg:mx-2 hidden lg:block xl:hidden" />
          <button
            onClick={toggleSlideList}
            className="p-2 rounded bg-gray-100 hover:bg-gray-200 hidden lg:block xl:hidden"
            title="スライド一覧を切り替え"
          >
            📋
          </button>
          <button
            onClick={togglePropertyPanel}
            className="p-2 rounded bg-gray-100 hover:bg-gray-200 hidden lg:block xl:hidden"
            title="プロパティパネルを切り替え"
          >
            ⚙️
          </button>
        </div>

        {/* 保存ステータス - hide on mobile */}
        {saveStatus.text && (
          <div className={`text-sm ${saveStatus.color} font-medium hidden md:block`}>
            {saveStatus.text}
          </div>
        )}
      </div>
    </form>
  );
}
