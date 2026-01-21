import { useEditorStore } from "../../stores/editorStore";
import { UndoRedoButtons } from "../ui/UndoRedoButtons";
import type { ToolType } from "../../types";

interface CanvasActions {
  addRect: () => void;
  addCircle: () => void;
  addText: () => void;
}

interface ToolbarProps {
  canvasActions: CanvasActions;
  isSaving?: boolean;
  lastSaved?: Date | null;
  saveError?: Error | null;
}

export function Toolbar({ canvasActions, isSaving = false, lastSaved = null, saveError = null }: ToolbarProps) {
  const { addRect, addCircle, addText } = canvasActions;
  const { activeTool, setActiveTool } = useEditorStore();

  const tools: { id: ToolType; label: string; icon: string }[] = [
    { id: "select", label: "Select", icon: "↖" },
    { id: "rect", label: "Rectangle", icon: "▢" },
    { id: "circle", label: "Circle", icon: "○" },
    { id: "text", label: "Text", icon: "T" },
  ];

  const handleToolClick = (tool: ToolType) => {
    setActiveTool(tool);
    if (tool === "rect") addRect();
    if (tool === "circle") addCircle();
    if (tool === "text") addText();
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
