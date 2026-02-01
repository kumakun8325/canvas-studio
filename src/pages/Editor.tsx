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
import { useMediaQuery } from "../hooks/useMediaQuery";

const MOBILE_BREAKPOINT = "(max-width: 767px)";

/**
 * Mobile view - shows message that mobile is not supported
 */
function MobileUnsupportedMessage() {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
        <div className="text-6xl mb-4">📱💻</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          モバイルではご利用いただけません
        </h2>
        <p className="text-gray-600">
          Canvas Studioはタブレット以上の画面サイズでご利用ください。
        </p>
        <p className="text-sm text-gray-500 mt-4">
          推奨環境: 幅768px以上のデバイス
        </p>
      </div>
    </div>
  );
}

/**
 * Editor content - contains canvas and is only rendered on desktop/tablet
 * This separation prevents useCanvas from being called on mobile devices
 */
function EditorContent({
  canvasActions,
  clipboard,
  isSaving,
  lastSaved,
  saveError,
}: {
  canvasActions: ReturnType<typeof useCanvas>;
  clipboard: ReturnType<typeof useClipboard>;
  isSaving: boolean;
  lastSaved: Date | null;
  saveError: Error | null;
}) {
  const { currentSlideId } = useEditorStore();

  return (
    <div className="h-screen flex flex-col">
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

/**
 * Editor page - routes to mobile message or desktop content based on screen size
 */
export function Editor() {
  const { project, slides } = useSlideStore();
  const { currentSlideId, setCurrentSlide } = useEditorStore();

  // Detect mobile screen size
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT);

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

  // Mobile: show unsupported message
  if (isMobile) {
    return <MobileUnsupportedMessage />;
  }

  // Desktop/Tablet: show editor content
  return (
    <EditorContent
      canvasActions={canvasActions}
      clipboard={clipboard}
      isSaving={isSaving}
      lastSaved={lastSaved}
      saveError={saveError}
    />
  );
}