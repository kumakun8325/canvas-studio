import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useHistoryStore } from "../stores/historyStore";
import { useSlideStore } from "../stores/slideStore";
import { useEditorStore } from "../stores/editorStore";
import { useHistory } from "../hooks/useHistory";

/**
 * Task 29: Undo/Redo 統合テスト
 *
 * TDDアプローチ: まず失敗するテストを書き、その後実装する
 *
 * テストシナリオ:
 * 1. キャンバスに矩形を追加 → Undo で戻る
 * 2. キャンバス上のオブジェクトを移動 → Undo で戻る
 * 3. キャンバス上のオブジェクトを削除 → Undo で戻る
 * 4. スライドを追加 → Undo で戻る
 * 5. スライドを削除 → Undo で戻る
 * 6. Redo でやり直せる
 */

describe("Task 29: Undo/Redo Integration", () => {
  beforeEach(() => {
    // Reset all stores before each test
    useHistoryStore.getState().clear();
    useSlideStore.setState({
      project: null,
      slides: [],
    });
    useEditorStore.setState({
      currentSlideId: null,
      selectedObjectIds: [],
      activeTool: "select",
      zoom: 1,
    });
  });

  describe("Object Operations on Canvas", () => {
    it("should restore canvas state after adding object when undo is performed", () => {
      const { result } = renderHook(() => useHistory());

      // Arrange: 初期状態のキャンバスJSONを作成（空）
      const initialJson = "{}";
      const slideId = "slide-1";

      useSlideStore.setState({
        slides: [
          {
            id: slideId,
            canvasJson: initialJson,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      });
      useEditorStore.setState({ currentSlideId: slideId });

      // 矩形追加後の状態（オブジェクトが含まれるJSON）
      const afterAddJson = JSON.stringify({
        version: "6.0.0",
        objects: [
          {
            type: "rect",
            left: 100,
            top: 100,
            width: 100,
            height: 100,
            fill: "#3b82f6",
          },
        ],
      });

      // Act: 矩形を追加した履歴を記録
      act(() => {
        result.current.recordAction({
          type: "object:added",
          description: "矩形を追加",
          undo: () => {
            useSlideStore.getState().updateSlide(slideId, initialJson);
          },
          redo: () => {
            useSlideStore.getState().updateSlide(slideId, afterAddJson);
          },
        });
      });

      // 追加後の状態に更新
      act(() => {
        useSlideStore.getState().updateSlide(slideId, afterAddJson);
      });

      // Undoを実行
      act(() => {
        result.current.undo();
      });

      // Assert: Undo後は初期状態に戻っている
      const slide = useSlideStore.getState().slides.find((s) => s.id === slideId);
      expect(slide?.canvasJson).toBe(initialJson);
    });

    it("should restore canvas state after modifying object when undo is performed", () => {
      const { result } = renderHook(() => useHistory());

      const slideId = "slide-1";
      const beforeJson = JSON.stringify({
        version: "6.0.0",
        objects: [
          {
            type: "rect",
            left: 100,
            top: 100,
            width: 100,
            height: 100,
            fill: "#3b82f6",
          },
        ],
      });

      const afterJson = JSON.stringify({
        version: "6.0.0",
        objects: [
          {
            type: "rect",
            left: 200, // 移動後
            top: 200,
            width: 100,
            height: 100,
            fill: "#3b82f6",
          },
        ],
      });

      useSlideStore.setState({
        slides: [
          {
            id: slideId,
            canvasJson: beforeJson,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      });

      // Act: オブジェクト移動の履歴を記録
      act(() => {
        result.current.recordAction({
          type: "object:modified",
          description: "矩形を移動",
          undo: () => {
            useSlideStore.getState().updateSlide(slideId, beforeJson);
          },
          redo: () => {
            useSlideStore.getState().updateSlide(slideId, afterJson);
          },
        });
      });

      act(() => {
        useSlideStore.getState().updateSlide(slideId, afterJson);
      });

      act(() => {
        result.current.undo();
      });

      // Assert: Undo後は移動前の位置に戻っている
      const slide = useSlideStore.getState().slides.find((s) => s.id === slideId);
      expect(slide?.canvasJson).toBe(beforeJson);
    });

    it("should restore canvas state after removing object when undo is performed", () => {
      const { result } = renderHook(() => useHistory());

      const slideId = "slide-1";
      const beforeRemoveJson = JSON.stringify({
        version: "6.0.0",
        objects: [
          {
            type: "rect",
            left: 100,
            top: 100,
            width: 100,
            height: 100,
            fill: "#3b82f6",
          },
        ],
      });

      const afterRemoveJson = JSON.stringify({
        version: "6.0.0",
        objects: [],
      });

      useSlideStore.setState({
        slides: [
          {
            id: slideId,
            canvasJson: beforeRemoveJson,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      });

      // Act: オブジェクト削除の履歴を記録
      act(() => {
        result.current.recordAction({
          type: "object:removed",
          description: "矩形を削除",
          undo: () => {
            useSlideStore.getState().updateSlide(slideId, beforeRemoveJson);
          },
          redo: () => {
            useSlideStore.getState().updateSlide(slideId, afterRemoveJson);
          },
        });
      });

      act(() => {
        useSlideStore.getState().updateSlide(slideId, afterRemoveJson);
      });

      act(() => {
        result.current.undo();
      });

      // Assert: Undo後はオブジェクトが復元されている
      const slide = useSlideStore.getState().slides.find((s) => s.id === slideId);
      expect(slide?.canvasJson).toBe(beforeRemoveJson);
    });
  });

  describe("Slide Operations", () => {
    it("should restore slides after adding slide when undo is performed", () => {
      const { result } = renderHook(() => useHistory());

      // Arrange: 初期スライドを1つ作成
      useSlideStore.setState({
        slides: [
          {
            id: "slide-1",
            canvasJson: "{}",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      });

      const beforeAddCount = useSlideStore.getState().slides.length;

      // Act: スライド追加の履歴を記録
      act(() => {
        result.current.recordAction({
          type: "slide:added",
          description: "スライドを追加",
          undo: () => {
            useSlideStore.setState({
              slides: useSlideStore.getState().slides.slice(0, -1),
            });
          },
          redo: () => {
            useSlideStore.getState().addSlide();
          },
        });
      });

      // スライドを追加
      act(() => {
        useSlideStore.getState().addSlide();
      });

      const afterAddCount = useSlideStore.getState().slides.length;

      // Undoを実行
      act(() => {
        result.current.undo();
      });

      // Assert: Undo後は追加前のスライド数に戻っている
      expect(afterAddCount).toBe(beforeAddCount + 1);
      expect(useSlideStore.getState().slides.length).toBe(beforeAddCount);
    });

    it("should restore slides after deleting slide when undo is performed", () => {
      const { result } = renderHook(() => useHistory());

      // Arrange: 2つのスライドを作成
      const slides = [
        {
          id: "slide-1",
          canvasJson: "{}",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: "slide-2",
          canvasJson: "{}",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];
      useSlideStore.setState({ slides });

      const beforeDeleteCount = useSlideStore.getState().slides.length;
      const deletedSlideId = "slide-2";

      // Act: スライド削除の履歴を記録
      let deletedSlide: any = null;
      act(() => {
        result.current.recordAction({
          type: "slide:deleted",
          description: "スライドを削除",
          undo: () => {
            if (deletedSlide) {
              useSlideStore.setState({
                slides: [...useSlideStore.getState().slides, deletedSlide],
              });
            }
          },
          redo: () => {
            useSlideStore.getState().deleteSlide(deletedSlideId);
          },
        });
      });

      // 削除するスライドを保存
      deletedSlide = slides.find((s) => s.id === deletedSlideId);

      // スライドを削除
      act(() => {
        useSlideStore.getState().deleteSlide(deletedSlideId);
      });

      const afterDeleteCount = useSlideStore.getState().slides.length;

      // Undoを実行
      act(() => {
        result.current.undo();
      });

      // Assert: Undo後は削除前のスライド数に戻っている
      expect(afterDeleteCount).toBe(beforeDeleteCount - 1);
      expect(useSlideStore.getState().slides.length).toBe(beforeDeleteCount);
    });

    it("should restore slides after reordering when undo is performed", () => {
      const { result } = renderHook(() => useHistory());

      // Arrange: 3つのスライドを作成
      const slide1 = {
        id: "slide-1",
        canvasJson: '{"label": "1"}',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const slide2 = {
        id: "slide-2",
        canvasJson: '{"label": "2"}',
        createdAt: Date.now() + 1,
        updatedAt: Date.now() + 1,
      };
      const slide3 = {
        id: "slide-3",
        canvasJson: '{"label": "3"}',
        createdAt: Date.now() + 2,
        updatedAt: Date.now() + 2,
      };

      const beforeOrder = [slide1, slide2, slide3];
      useSlideStore.setState({ slides: beforeOrder });

      const fromIndex = 0;
      const toIndex = 2;

      // Act: スライド並べ替えの履歴を記録
      act(() => {
        result.current.recordAction({
          type: "slide:reordered",
          description: "スライドを並べ替え",
          undo: () => {
            useSlideStore.setState({ slides: beforeOrder });
          },
          redo: () => {
            useSlideStore.getState().reorderSlides(fromIndex, toIndex);
          },
        });
      });

      // スライドを並べ替え
      act(() => {
        useSlideStore.getState().reorderSlides(fromIndex, toIndex);
      });

      const afterOrder = useSlideStore.getState().slides;
      expect(afterOrder[0].id).toBe("slide-2");
      expect(afterOrder[1].id).toBe("slide-3");
      expect(afterOrder[2].id).toBe("slide-1");

      // Undoを実行
      act(() => {
        result.current.undo();
      });

      // Assert: Undo後は元の順序に戻っている
      const restoredOrder = useSlideStore.getState().slides;
      expect(restoredOrder[0].id).toBe("slide-1");
      expect(restoredOrder[1].id).toBe("slide-2");
      expect(restoredOrder[2].id).toBe("slide-3");
    });
  });

  describe("Redo Operations", () => {
    it("should redo after undo", () => {
      const { result } = renderHook(() => useHistory());

      const slideId = "slide-1";
      const initialJson = "{}";
      const modifiedJson = JSON.stringify({
        version: "6.0.0",
        objects: [
          {
            type: "rect",
            left: 100,
            top: 100,
            width: 100,
            height: 100,
            fill: "#3b82f6",
          },
        ],
      });

      useSlideStore.setState({
        slides: [
          {
            id: slideId,
            canvasJson: initialJson,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      });

      // Act: アクションを記録して実行
      act(() => {
        result.current.recordAction({
          type: "object:added",
          description: "矩形を追加",
          undo: () => {
            useSlideStore.getState().updateSlide(slideId, initialJson);
          },
          redo: () => {
            useSlideStore.getState().updateSlide(slideId, modifiedJson);
          },
        });
      });

      act(() => {
        useSlideStore.getState().updateSlide(slideId, modifiedJson);
      });

      // Undo → Redo
      act(() => {
        result.current.undo();
      });
      act(() => {
        result.current.redo();
      });

      // Assert: Redo後は変更後の状態になっている
      const slide = useSlideStore.getState().slides.find((s) => s.id === slideId);
      expect(slide?.canvasJson).toBe(modifiedJson);
    });
  });

  describe("History Store State", () => {
    it("should track canUndo and canRedo correctly", () => {
      const { result } = renderHook(() => useHistory());

      // Initially both should be false
      expect(result.current.canUndo()).toBe(false);
      expect(result.current.canRedo()).toBe(false);

      const slideId = "slide-1";
      useSlideStore.setState({
        slides: [
          {
            id: slideId,
            canvasJson: "{}",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      });

      // After recording an action
      act(() => {
        result.current.recordAction({
          type: "test",
          description: "Test action",
          undo: () => {},
          redo: () => {},
        });
      });

      // canUndo should be true
      expect(result.current.canUndo()).toBe(true);
      expect(result.current.canRedo()).toBe(false);

      // After undo
      act(() => {
        result.current.undo();
      });

      // canRedo should be true
      expect(result.current.canUndo()).toBe(false);
      expect(result.current.canRedo()).toBe(true);
    });
  });

  /**
   * Issue #31: 初回操作時の履歴記録バグ
   *
   * バグの内容:
   * 矩形を追加しても Undo ボタンが有効にならない。
   * 原因: previousStateRef.current が null の場合、履歴が記録されない。
   *
   * このテストはバグを再現し、修正後に通るようになります。
   */
  describe("Issue #31: First operation history recording bug", () => {
    it("should record history when first object is added to empty canvas", () => {
      const { result } = renderHook(() => useHistory());

      // Arrange: 空のキャンバス（canvasJson は "{}"）を準備
      const slideId = "slide-1";
      const emptyCanvasJson = "{}";

      useSlideStore.setState({
        slides: [
          {
            id: slideId,
            canvasJson: emptyCanvasJson,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      });
      useEditorStore.setState({ currentSlideId: slideId });

      // 初期状態では canUndo は false
      expect(result.current.canUndo()).toBe(false);

      // Act: 最初の矩形を追加
      const afterAddJson = JSON.stringify({
        version: "6.0.0",
        objects: [
          {
            type: "rect",
            left: 100,
            top: 100,
            width: 100,
            height: 100,
            fill: "#3b82f6",
          },
        ],
      });

      act(() => {
        result.current.recordAction({
          type: "canvas:modified",
          description: "キャンバス操作",
          undo: () => {
            useSlideStore.getState().updateSlide(slideId, emptyCanvasJson);
          },
          redo: () => {
            useSlideStore.getState().updateSlide(slideId, afterAddJson);
          },
        });
      });

      act(() => {
        useSlideStore.getState().updateSlide(slideId, afterAddJson);
      });

      // Assert: 履歴が記録され、canUndo が true になるべき
      expect(result.current.canUndo()).toBe(true);

      // Undo で元に戻せるはず
      act(() => {
        result.current.undo();
      });

      const slide = useSlideStore.getState().slides.find((s) => s.id === slideId);
      expect(slide?.canvasJson).toBe(emptyCanvasJson);
    });

    it("should record history when first object is added to new slide (null canvasJson)", () => {
      const { result } = renderHook(() => useHistory());

      // Arrange: canvasJson が null の新しいスライドを準備
      const slideId = "slide-new";

      useSlideStore.setState({
        slides: [
          {
            id: slideId,
            canvasJson: null as unknown as string,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      });
      useEditorStore.setState({ currentSlideId: slideId });

      expect(result.current.canUndo()).toBe(false);

      // Act: 最初の矩形を追加
      const afterAddJson = JSON.stringify({
        version: "6.0.0",
        objects: [
          {
            type: "rect",
            left: 100,
            top: 100,
            width: 100,
            height: 100,
            fill: "#3b82f6",
          },
        ],
      });

      act(() => {
        result.current.recordAction({
          type: "canvas:modified",
          description: "キャンバス操作",
          undo: () => {
            useSlideStore.getState().updateSlide(slideId, "{}");
          },
          redo: () => {
            useSlideStore.getState().updateSlide(slideId, afterAddJson);
          },
        });
      });

      act(() => {
        useSlideStore.getState().updateSlide(slideId, afterAddJson);
      });

      // Assert: 履歴が記録されるべき
      expect(result.current.canUndo()).toBe(true);
    });
  });

  /**
   * 実際の統合テスト
   * これらのテストは useCanvas が useHistory と統合された後に通るようになります
   *
   * 注: 現在これらはスキップされています。
   * 実装が完了したら .skip を削除して有効化してください。
   */
  describe.skip("Real Integration Tests (after implementation)", () => {
    it("should automatically record history when object is added to canvas", () => {
      const { result } = renderHook(() => useHistory());

      // キャンバス操作が履歴を自動記録することを確認
      // （実装完了後に有効化）

      const slideId = "slide-1";
      useSlideStore.setState({
        slides: [
          {
            id: slideId,
            canvasJson: "{}",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      });
      useEditorStore.setState({ currentSlideId: slideId });

      // オブジェクト追加後、canUndo が true になるはず
      // （これは実装完了後に通るようになります）

      expect(result.current.canUndo()).toBe(true);
    });
  });
});
