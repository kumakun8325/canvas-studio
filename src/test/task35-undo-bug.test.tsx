import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useHistoryStore } from "../stores/historyStore";
import { useSlideStore } from "../stores/slideStore";
import { useEditorStore } from "../stores/editorStore";
import { useCanvas } from "../hooks/useCanvas";
import { useHistory } from "../hooks/useHistory";

/**
 * Issue #35: Undo が動作しない (currentSlideIdRef 修正)
 *
 * バグの再現テスト:
 * - currentSlideId が初期化時に未定義で、後から設定される場合
 * - handleSave クロージャが古い currentSlideId を参照し続ける
 * - 結果として履歴が記録されず、Undo が動作しない
 *
 * 修正方針:
 * - useRef を使用して currentSlideId の最新値を常に参照できるようにする
 */

describe("Issue #35: Undo bug - currentSlideId closure capture", () => {
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

    // Clear DOM
    document.body.innerHTML = "";
  });

  /**
   * バグ再現シナリオ:
   * 1. currentSlideId が null の状態で useCanvas を初期化
   * 2. 後から currentSlideId を設定
   * 3. キャンバスにオブジェクトを追加
   * 4. 履歴が記録され、Undo が動作することを確認
   */
  it("should record history when currentSlideId is set after canvas initialization", () => {
    // Arrange: キャンバス用の要素を作成
    const canvasElement = document.createElement("canvas");
    canvasElement.id = "test-canvas";
    document.body.appendChild(canvasElement);

    const slideId = "slide-1";

    // 初期状態: currentSlideId が null
    const { result: canvasHook } = renderHook(() => useCanvas("test-canvas"));
    const { result: historyHook } = renderHook(() => useHistory());

    // 最初は履歴がない
    expect(historyHook.current.canUndo()).toBe(false);

    // Act: currentSlideId を設定（初期化後）
    act(() => {
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
    });

    // キャンバスに矩形を追加
    act(() => {
      canvasHook.current.addRect();
    });

    // Assert: 履歴が記録され、Undo が可能であるべき
    // バグが発生している場合: canUndo は false のまま（履歴が記録されていない）
    // 修正後: canUndo は true になる（履歴が記録されている）
    expect(historyHook.current.canUndo()).toBe(true);
  });

  /**
   * 追加のシナリオ: currentSlideId が最初から設定されている場合
   * このケースは正しく動作するはず（回帰テスト用）
   */
  it("should record history when currentSlideId is set before canvas initialization", () => {
    // Arrange: キャンバス用の要素を作成
    const canvasElement = document.createElement("canvas");
    canvasElement.id = "test-canvas-2";
    document.body.appendChild(canvasElement);

    const slideId = "slide-2";

    // 最初から currentSlideId を設定
    act(() => {
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
    });

    const { result: canvasHook } = renderHook(() => useCanvas("test-canvas-2"));
    const { result: historyHook } = renderHook(() => useHistory());

    // 最初は履歴がない
    expect(historyHook.current.canUndo()).toBe(false);

    // Act: キャンバスに矩形を追加
    act(() => {
      canvasHook.current.addRect();
    });

    // Assert: 履歴が記録され、Undo が可能であるべき
    expect(historyHook.current.canUndo()).toBe(true);
  });

  /**
   * スライド切り替えシナリオ:
   * 1. スライド1でオブジェクトを追加
   * 2. スライド2に切り替え
   * 3. スライド2でオブジェクトを追加
   * 4. Undo が正しく動作することを確認
   */
  it("should record history correctly when switching slides", () => {
    // Arrange: キャンバス用の要素を作成
    const canvasElement = document.createElement("canvas");
    canvasElement.id = "test-canvas-3";
    document.body.appendChild(canvasElement);

    const slide1Id = "slide-1";
    const slide2Id = "slide-2";

    act(() => {
      useSlideStore.setState({
        slides: [
          {
            id: slide1Id,
            canvasJson: "{}",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          {
            id: slide2Id,
            canvasJson: "{}",
            createdAt: Date.now() + 1,
            updatedAt: Date.now() + 1,
          },
        ],
      });
      useEditorStore.setState({ currentSlideId: slide1Id });
    });

    const { result: canvasHook } = renderHook(() => useCanvas("test-canvas-3"));
    const { result: historyHook } = renderHook(() => useHistory());

    // Act: スライド1で矩形を追加
    act(() => {
      canvasHook.current.addRect();
    });

    // スライド1のアクションが履歴に記録されている
    expect(historyHook.current.canUndo()).toBe(true);
    const historyCountAfterSlide1 = useHistoryStore.getState().undoStack.length;

    // スライド2に切り替え
    act(() => {
      useEditorStore.setState({ currentSlideId: slide2Id });
    });

    // スライド2で円を追加
    act(() => {
      canvasHook.current.addCircle();
    });

    // Assert: 両方のアクションが履歴に記録されている
    expect(useHistoryStore.getState().undoStack.length).toBeGreaterThan(historyCountAfterSlide1);
    expect(historyHook.current.canUndo()).toBe(true);

    // Undo でスライド2の変更を元に戻せる
    act(() => {
      historyHook.current.undo();
    });

    // Undo 後も canUndo は true（スライド1の変更が残っている）
    expect(historyHook.current.canUndo()).toBe(true);
  });
});
