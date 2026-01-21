import { useEffect, useRef, useCallback } from "react";
import * as fabric from "fabric";
import { useEditorStore } from "../stores/editorStore";
import { useSlideStore } from "../stores/slideStore";

export function useCanvas(canvasId: string) {
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { setSelectedObjects } = useEditorStore();
  const { updateSlide } = useSlideStore();
  const currentSlideId = useEditorStore((s) => s.currentSlideId);

  // Initialize canvas
  useEffect(() => {
    const canvasElement = document.getElementById(
      canvasId,
    ) as HTMLCanvasElement;
    if (!canvasElement) return;

    // Skip if already initialized by checking parent wrapper
    // Fabric.js wraps the canvas in a div with class "canvas-container"
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

    // Save on modification
    canvas.on("object:modified", () => {
      if (currentSlideId) {
        updateSlide(currentSlideId, JSON.stringify(canvas.toJSON()));
      }
    });

    return () => {
      canvas.dispose();
      canvasRef.current = null;
    };
  }, [canvasId, currentSlideId, setSelectedObjects, updateSlide]);

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
