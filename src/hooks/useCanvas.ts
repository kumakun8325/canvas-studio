import { useEffect, useRef, useCallback } from "react";
import * as fabric from "fabric";
import { useEditorStore } from "../stores/editorStore";
import { useSlideStore } from "../stores/slideStore";

export function useCanvas(canvasId: string) {
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const previousSlideIdRef = useRef<string | null>(null);

  const { setSelectedObjects } = useEditorStore();
  const { slides, updateSlide } = useSlideStore();
  const currentSlideId = useEditorStore((s) => s.currentSlideId);

  // Save current canvas state to slide store
  const saveCanvasToSlide = useCallback(
    (slideId: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Use toJSON to save the canvas state
      const json = JSON.stringify(canvas.toJSON());
      updateSlide(slideId, json);
    },
    [updateSlide],
  );

  // Load canvas state from slide store
  const loadCanvasFromSlide = useCallback(
    (slideId: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const slide = slides.find((s) => s.id === slideId);
      if (!slide) return;

      // Clear canvas first
      canvas.clear();
      canvas.backgroundColor = "#ffffff";

      // If there is saved JSON, load it
      if (slide.canvasJson && slide.canvasJson !== "{}") {
        try {
          const json = JSON.parse(slide.canvasJson);
          canvas.loadFromJSON(json).then(() => {
            canvas.renderAll();
          });
        } catch (e) {
          console.error("Failed to load canvas state:", e);
          canvas.renderAll();
        }
      } else {
        // Empty canvas (default background)
        canvas.renderAll();
      }
    },
    [slides],
  );

  // Handle slide switching
  useEffect(() => {
    if (!currentSlideId) return;

    // 1. Save state of the previous slide before switching
    if (
      previousSlideIdRef.current &&
      previousSlideIdRef.current !== currentSlideId
    ) {
      saveCanvasToSlide(previousSlideIdRef.current);
    }

    // 2. Load state of the new slide
    loadCanvasFromSlide(currentSlideId);

    // 3. Update previous ID
    previousSlideIdRef.current = currentSlideId;
  }, [currentSlideId]); // Dependencies intentionally limited to avoid loops on save

  // Initialize canvas
  useEffect(() => {
    const canvasElement = document.getElementById(
      canvasId,
    ) as HTMLCanvasElement;
    if (!canvasElement) return;

    if (canvasElement.parentElement?.classList.contains("canvas-container")) {
      return;
    }

    const canvas = new fabric.Canvas(canvasElement, {
      width: 800,
      height: 600,
      backgroundColor: "#ffffff",
      selection: true,
    });

    canvasRef.current = canvas;

    // Initialize previousSlideIdRef
    if (currentSlideId) {
      previousSlideIdRef.current = currentSlideId;
      // Also try to load initial state if available
      loadCanvasFromSlide(currentSlideId);
    }

    // Selection event
    canvas.on("selection:created", (e) => {
      const ids = e.selected
        ?.map((obj: fabric.FabricObject & { id?: string }) => obj.id)
        .filter(Boolean) as string[];
      setSelectedObjects(ids);
    });

    canvas.on("selection:cleared", () => {
      setSelectedObjects([]);
    });

    // Auto-save events
    const handleSave = () => {
      if (currentSlideId) {
        saveCanvasToSlide(currentSlideId);
      }
    };

    canvas.on("object:modified", handleSave);
    canvas.on("object:added", handleSave);
    canvas.on("object:removed", handleSave);

    return () => {
      canvas.dispose();
      canvasRef.current = null;
    };
  }, [canvasId, setSelectedObjects]); // Removed currentSlideId from deps to allow manual handling in the other useEffect

  // Add rectangle
  const addRect = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 100,
      height: 100,
      fill: "#3b82f6",
    });

    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
  }, []);

  // Add circle
  const addCircle = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const circle = new fabric.Circle({
      left: 150,
      top: 150,
      radius: 50,
      fill: "#10b981",
    });

    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.renderAll();
  }, []);

  // Add text
  const addText = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const text = new fabric.IText("Click to edit", {
      left: 100,
      top: 100,
      fontSize: 24,
      fill: "#1f2937",
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  }, []);

  // Delete selected
  const deleteSelected = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const activeObjects = canvas.getActiveObjects();
    activeObjects.forEach((obj: fabric.FabricObject) => canvas.remove(obj));
    canvas.discardActiveObject();
    canvas.renderAll();
  }, []);

  return {
    canvasRef,
    containerRef,
    addRect,
    addCircle,
    addText,
    deleteSelected,
  };
}
