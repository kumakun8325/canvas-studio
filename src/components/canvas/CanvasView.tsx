import { useEffect, RefObject } from "react";

interface CanvasActions {
  containerRef: RefObject<HTMLDivElement | null>;
  deleteSelected: () => void;
}

interface CanvasViewProps {
  slideId?: string;
  canvasActions: CanvasActions;
}

export function CanvasView({ canvasActions }: CanvasViewProps) {
  const { containerRef, deleteSelected } = canvasActions;

  // Delete key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        // Don't delete if editing text
        if (document.activeElement?.tagName === "TEXTAREA") return;
        e.preventDefault();
        deleteSelected();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteSelected]);

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-gray-100 flex items-center justify-center p-4"
    >
      <div className="shadow-lg">
        <canvas id="main-canvas" />
      </div>
    </div>
  );
}
