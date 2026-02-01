import { useEffect, useRef, RefObject } from "react";

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

/**
 * CanvasView component
 * レスポンシブ対応: ResizeObserverでコンテナサイズの変化を監視し、
 * パネル開閉時のレイアウト変更に追従する
 */
export function CanvasView({ canvasActions }: CanvasViewProps) {
  const { containerRef, deleteSelected, copy, paste, cut } = canvasActions;
  const resizeTimeoutRef = useRef<number | null>(null);

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

  // ResizeObserver to handle panel open/close and window resize
  // パネル開閉時にキャンバスが正しく表示されるようにサイズ変更を監視
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((_entries) => {
      // requestAnimationFrame で描画負荷を抑制
      if (resizeTimeoutRef.current !== null) {
        cancelAnimationFrame(resizeTimeoutRef.current);
      }

      resizeTimeoutRef.current = requestAnimationFrame(() => {
        // キャンバス要素を取得してサイズ変更イベントを発火
        const canvasElement = container.querySelector('canvas');
        if (canvasElement) {
          // Fabric.jsのキャンバスが自動的にリサイズされるようにイベントを発火
          const canvasEvent = new Event('resize');
          window.dispatchEvent(canvasEvent);
        }
      });
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (resizeTimeoutRef.current !== null) {
        cancelAnimationFrame(resizeTimeoutRef.current);
      }
    };
  }, [containerRef]);

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-gray-100 flex items-center justify-center p-2 lg:p-4"
    >
      <div className="shadow-lg">
        <canvas id="main-canvas" />
      </div>
    </div>
  );
}
