import { useEffect, useRef, useState } from "react";
import { CanvasView } from "../components/canvas/CanvasView";
import { Toolbar } from "../components/canvas/Toolbar";
import { PropertyPanel } from "../components/canvas/PropertyPanel";
import { SlideList } from "../components/slides/SlideList";
import { useSlideStore } from "../stores/slideStore";
import { useEditorStore } from "../stores/editorStore";
import { useCanvas } from "../hooks/useCanvas";
import { useClipboard } from "../hooks/useClipboard";
import { useAutoSave } from "../hooks/useAutoSave";

/**
 * エディタのメインコンテンツコンポーネント
 * モバイル判定の外側に配置し、Canvas 初期化を条件付きにするため分離
 */
export function EditorContent() {
  const { project, slides } = useSlideStore();
  const { currentSlideId, setCurrentSlide } = useEditorStore();

  // Track if auto-save is ready (prevents race condition on initial load)
  const [isAutoSaveReady, setIsAutoSaveReady] = useState(false);
  const hasInitialized = useRef(false);

  // Single source of truth for canvas
  const canvasActions = useCanvas("main-canvas");

  // Clipboard functionality
  const clipboard = useClipboard(canvasActions.canvasRef);

  // Auto-save functionality (disabled until canvas is ready)
  const {
    isSaving,
    lastSaved,
    error: saveError,
  } = useAutoSave(project, isAutoSaveReady);

  // Set initial slide when project loads
  useEffect(() => {
    if (slides.length > 0 && !currentSlideId) {
      setCurrentSlide(slides[0].id);
    }
  }, [slides, currentSlideId, setCurrentSlide]);

  // Enable auto-save after project and canvas are ready
  // This prevents the race condition where empty canvas data overwrites loaded data
  useEffect(() => {
    if (!hasInitialized.current && currentSlideId && project) {
      hasInitialized.current = true;
      // Delay to ensure canvas has finished loading data from slideStore
      const timer = setTimeout(() => {
        setIsAutoSaveReady(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [project, currentSlideId]);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      <Toolbar
        canvasActions={canvasActions}
        isSaving={isSaving}
        lastSaved={lastSaved}
        saveError={saveError}
      />
      <div className="flex-1 flex">
        <SlideList />
        <CanvasView
          slideId={currentSlideId ?? undefined}
          canvasActions={{
            ...canvasActions,
            copy: clipboard.copy,
            paste: clipboard.paste,
            cut: clipboard.cut,
          }}
        />
        <PropertyPanel canvas={canvasActions.canvasRef.current} />
      </div>
    </div>
  );
}
