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
}

export function Toolbar({ canvasActions }: ToolbarProps) {
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

  return (
    <div className="bg-white border-b px-4 py-2 flex gap-2 items-center">
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
  );
}
