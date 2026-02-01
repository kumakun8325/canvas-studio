import { useEffect, useRef, useCallback } from "react";
import * as fabric from "fabric";
import { useEditorStore } from "../stores/editorStore";
import { useSlideStore } from "../stores/slideStore";
import { useHistory } from "./useHistory";

export function useCanvas(canvasId: string) {
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const previousSlideIdRef = useRef<string | null>(null);
  const currentSlideIdRef = useRef<string | null>(null);
  // 内部更新中かどうかを判定するフラグ（イベントループ防止）
  const isInternalUpdateRef = useRef(false);

  const { setSelectedObjects } = useEditorStore();
  const { slides, updateSlide, getTemplateConfig } = useSlideStore();
  const currentSlideId = useEditorStore((s) => s.currentSlideId);
  const { recordAction } = useHistory();

  // currentSlideId の最新値を ref に保持
  useEffect(() => {
    currentSlideIdRef.current = currentSlideId;
  }, [currentSlideId]);

  // 操作前のキャンバス状態を保持（履歴用）
  const previousStateRef = useRef<string | null>(null);

  // Save current canvas state to slide store
  const saveCanvasToSlide = useCallback(
    (slideId: string, recordHistory: boolean = true) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Use toJSON to save the canvas state
      const json = JSON.stringify(canvas.toJSON());

      // 履歴を記録（recordHistory が true の場合）
      if (recordHistory && previousStateRef.current !== null) {
        const previousJson = previousStateRef.current;

        // 状態が実際に変更された場合のみ履歴に記録
        if (previousJson !== json) {
          recordAction({
            type: "canvas:modified",
            description: "キャンバス操作",
            undo: () => {
              isInternalUpdateRef.current = true;
              updateSlide(slideId, previousJson);
              // キャンバスに反映
              const canvas = canvasRef.current;
              if (canvas) {
                canvas.loadFromJSON(JSON.parse(previousJson)).then(() => {
                  canvas.renderAll();
                  previousStateRef.current = previousJson;
                  isInternalUpdateRef.current = false;
                });
              }
            },
            redo: () => {
              isInternalUpdateRef.current = true;
              updateSlide(slideId, json);
              // キャンバスに反映
              const canvas = canvasRef.current;
              if (canvas) {
                canvas.loadFromJSON(JSON.parse(json)).then(() => {
                  canvas.renderAll();
                  previousStateRef.current = json;
                  isInternalUpdateRef.current = false;
                });
              }
            },
          });
        }
      }

      // 現在の状態を保存
      updateSlide(slideId, json);
      previousStateRef.current = json;
    },
    [updateSlide, recordAction],
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

      // 内部更新開始
      isInternalUpdateRef.current = true;

      // If there is saved JSON, load it
      if (slide.canvasJson && slide.canvasJson !== "{}") {
        try {
          const json = JSON.parse(slide.canvasJson);
          canvas.loadFromJSON(json).then(() => {
            canvas.renderAll();
            isInternalUpdateRef.current = false;
          });
        } catch (e) {
          console.error("Failed to load canvas state:", e);
          canvas.renderAll();
          isInternalUpdateRef.current = false;
        }
      } else {
        // Empty canvas (default background)
        canvas.renderAll();
        isInternalUpdateRef.current = false;
      }

      // 読み込んだ状態を記録（履歴用のベースライン）
      previousStateRef.current = slide.canvasJson;
    },
    [slides],
  );

  // Handle slide switching
  useEffect(() => {
    if (!currentSlideId) return;

    // 1. Save state of the previous slide before switching (履歴記録なし)
    if (
      previousSlideIdRef.current &&
      previousSlideIdRef.current !== currentSlideId
    ) {
      saveCanvasToSlide(previousSlideIdRef.current, false);
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

    const config = getTemplateConfig();

    const canvas = new fabric.Canvas(canvasElement, {
      width: config.width,
      height: config.height,
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
      // 内部更新中は保存しない
      if (isInternalUpdateRef.current) return;

      const slideId = currentSlideIdRef.current;
      if (slideId) {
        saveCanvasToSlide(slideId, true);
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

  // ResizeObserver for container tracking (responsive support)
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let rafId: number | null = null;

    const resizeCanvas = () => {
      if (!canvas) return;

      // requestAnimationFrame で描画負荷を抑制
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(() => {
        const containerWidth = container.clientWidth - 32; // p-4 (16px * 2)
        const containerHeight = container.clientHeight - 32;

        const config = getTemplateConfig();
        const canvasAspect = config.width / config.height;
        const containerAspect = containerWidth / containerHeight;

        let newWidth: number;
        let newHeight: number;

        if (containerAspect > canvasAspect) {
          // コンテナが横長なので高さ基準
          newHeight = containerHeight;
          newWidth = newHeight * canvasAspect;
        } else {
          // コンテナが縦長なので幅基準
          newWidth = containerWidth;
          newHeight = newWidth / canvasAspect;
        }

        // Canvas のサイズを更新（Fabric.js のキャンバス要素自体のサイズ）
        if (canvas.width !== newWidth || canvas.height !== newHeight) {
          canvas.setDimensions({ width: newWidth, height: newHeight });
          canvas.renderAll();
        }

        rafId = null;
      });
    };

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [containerRef]);

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

  // Add image from file
  const addImage = useCallback((file: File) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      fabric.FabricImage.fromURL(dataUrl).then((img) => {
        img.set({
          id: crypto.randomUUID(),
          left: 100,
          top: 100,
        });
        img.scaleToWidth(200);
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      });
    };
    reader.readAsDataURL(file);
  }, []);

  // ヘルパー関数: レイヤー操作の履歴記録とスライド更新
  const executeLayerOperation = useCallback(
    (
      operation: (canvas: fabric.Canvas, active: fabric.Object) => void,
      actionType: string,
      description: string,
    ) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const active = canvas.getActiveObject();
      if (!active) return;

      const slideId = currentSlideIdRef.current;
      if (!slideId) return;

      // 操作前の状態を保存
      const beforeJson = JSON.stringify(canvas.toJSON());

      // 操作を実行
      operation(canvas, active);

      // 操作後の状態を保存
      const afterJson = JSON.stringify(canvas.toJSON());

      // 履歴を記録
      recordAction({
        type: actionType,
        description,
        undo: () => {
          isInternalUpdateRef.current = true;
          updateSlide(slideId, beforeJson);
          canvas.loadFromJSON(JSON.parse(beforeJson)).then(() => {
            canvas.renderAll();
            isInternalUpdateRef.current = false;
          });
        },
        redo: () => {
          isInternalUpdateRef.current = true;
          updateSlide(slideId, afterJson);
          canvas.loadFromJSON(JSON.parse(afterJson)).then(() => {
            canvas.renderAll();
            isInternalUpdateRef.current = false;
          });
        },
      });

      // スライドを更新
      updateSlide(slideId, afterJson);
      previousStateRef.current = afterJson;
    },
    [updateSlide, recordAction],
  );

  // Layer operations
  const bringToFront = useCallback(() => {
    executeLayerOperation(
      (canvas, active) => {
        canvas.remove(active);
        canvas.add(active);
        canvas.setActiveObject(active);
        canvas.renderAll();
      },
      "layer:bringToFront",
      "最前面に移動",
    );
  }, [executeLayerOperation]);

  const sendToBack = useCallback(() => {
    executeLayerOperation(
      (canvas, active) => {
        canvas.remove(active);
        canvas.insertAt(0, active);
        canvas.setActiveObject(active);
        canvas.renderAll();
      },
      "layer:sendToBack",
      "最背面に移動",
    );
  }, [executeLayerOperation]);

  const bringForward = useCallback(() => {
    executeLayerOperation(
      (canvas, active) => {
        const objects = canvas.getObjects();
        const index = objects.indexOf(active);
        if (index < objects.length - 1) {
          canvas.remove(active);
          canvas.insertAt(index + 1, active);
          canvas.setActiveObject(active);
          canvas.renderAll();
        }
      },
      "layer:bringForward",
      "1つ前面に移動",
    );
  }, [executeLayerOperation]);

  const sendBackwards = useCallback(() => {
    executeLayerOperation(
      (canvas, active) => {
        const objects = canvas.getObjects();
        const index = objects.indexOf(active);
        if (index > 0) {
          canvas.remove(active);
          canvas.insertAt(index - 1, active);
          canvas.setActiveObject(active);
          canvas.renderAll();
        }
      },
      "layer:sendBackwards",
      "1つ背面に移動",
    );
  }, [executeLayerOperation]);

  return {
    canvasRef,
    containerRef,
    addRect,
    addCircle,
    addText,
    deleteSelected,
    addImage,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackwards,
  };
}
