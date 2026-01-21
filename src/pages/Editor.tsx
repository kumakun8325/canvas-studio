import { useEffect } from "react";
import { CanvasView } from "../components/canvas/CanvasView";
import { Toolbar } from "../components/canvas/Toolbar";
import { SlideList } from "../components/slides/SlideList";
import { useSlideStore } from "../stores/slideStore";
import { useEditorStore } from "../stores/editorStore";
import { useCanvas } from "../hooks/useCanvas";
import { useAutoSave } from "../hooks/useAutoSave";

export function Editor() {
  const { project, slides } = useSlideStore();
  const { currentSlideId, setCurrentSlide } = useEditorStore();

  // Single source of truth for canvas
  const canvasActions = useCanvas("main-canvas");

  // Auto-save functionality
  const { isSaving, lastSaved, error: saveError } = useAutoSave(project);

  // Set initial slide
  useEffect(() => {
    if (slides.length > 0 && !currentSlideId) {
      setCurrentSlide(slides[0].id);
    }
  }, [slides, currentSlideId, setCurrentSlide]);

  return (
    <div className="h-screen flex flex-col">
      <Toolbar canvasActions={canvasActions} isSaving={isSaving} lastSaved={lastSaved} saveError={saveError} />
      <div className="flex-1 flex">
        <SlideList />
        <CanvasView
          slideId={currentSlideId ?? undefined}
          canvasActions={canvasActions}
        />
      </div>
    </div>
  );
}
