import { useEffect, RefObject } from "react";

interface CanvasActions {
  containerRef: RefObject<HTMLDivElement | null>;
  deleteSelected: () => void;
  copy?: () => void;
  paste?: () => void;
  cut?: () => void;
}

interface CanvasViewProps {
  slideId?: string;
  canvasActions: CanvasActions;
}

export function CanvasView({ canvasActions }: CanvasViewProps) {
  const { containerRef, deleteSelected, copy, paste, cut } = canvasActions;

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if editing text
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      // Delete / Backspace
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteSelected();
      }

      // Ctrl+C / Cmd+C - Copy
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        e.preventDefault();
        copy?.();
      }

      // Ctrl+V / Cmd+V - Paste
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        e.preventDefault();
        paste?.();
      }

      // Ctrl+X / Cmd+X - Cut
      if ((e.ctrlKey || e.metaKey) && e.key === "x") {
        e.preventDefault();
        cut?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteSelected, copy, paste, cut]);

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-4"
    >
      <div className="shadow-lg">
        <canvas id="main-canvas" />
      </div>
    </div>
  );
}
