import { useCallback } from "react";
import { useSlideStore } from "../stores/slideStore";
import { createHistoryAction, useHistory } from "./useHistory";

/**
 * スライド操作（追加・削除・並べ替え）の履歴記録を担当するフック
 * useSlideStore の操作をラップして、履歴を自動記録する
 */
export function useSlideHistory() {
  const { slides } = useSlideStore();
  const { recordAction } = useHistory();

  const addSlide = useCallback(() => {
    const { addSlide: addSlideToStore } = useSlideStore.getState();

    // 新しいスライドを追加
    addSlideToStore();

    // 追加されたスライドを取得
    const newSlides = useSlideStore.getState().slides;
    const addedSlide = newSlides[newSlides.length - 1];

    // 履歴を記録
    recordAction(
      createHistoryAction(
        "slide:added",
        "スライドを追加",
        () => {
          useSlideStore.setState({
            slides: useSlideStore.getState().slides.slice(0, -1),
          });
        },
        () => {
          useSlideStore.setState({
            slides: [...useSlideStore.getState().slides, addedSlide],
          });
        },
      ),
    );
  }, [recordAction]);

  const deleteSlide = useCallback(
    (slideId: string) => {
      const { deleteSlide: deleteSlideFromStore } = useSlideStore.getState();
      const slideToDelete = slides.find((s) => s.id === slideId);
      if (!slideToDelete) return;

      const index = slides.findIndex((s) => s.id === slideId);

      // 履歴を記録（削除前に現在の状態を保存）
      recordAction(
        createHistoryAction(
          "slide:deleted",
          "スライドを削除",
          () => {
            const currentSlides = useSlideStore.getState().slides;
            const safeIndex = Math.min(index, currentSlides.length);
            useSlideStore.setState({
              slides: [
                ...currentSlides.slice(0, safeIndex),
                slideToDelete,
                ...currentSlides.slice(safeIndex),
              ],
            });
          },
          () => {
            useSlideStore.setState({
              slides: useSlideStore.getState().slides.filter((s) => s.id !== slideId),
            });
          },
        ),
      );

      // スライドを削除
      deleteSlideFromStore(slideId);
    },
    [slides, recordAction],
  );

  const reorderSlides = useCallback(
    (fromIndex: number, toIndex: number) => {
      const { reorderSlides: reorderSlidesFromStore } = useSlideStore.getState();
      // アクション時点のスライド状態をスナップショット
      const slidesSnapshot = [...useSlideStore.getState().slides];
      // 履歴を記録
      recordAction(
        createHistoryAction(
          "slide:reordered",
          "スライドを並べ替え",
          () => {
            useSlideStore.setState({ slides: slidesSnapshot });
          },
          () => {
            const currentSlides = useSlideStore.getState().slides;
            const newSlides = [...currentSlides];
            const [removed] = newSlides.splice(fromIndex, 1);
            newSlides.splice(toIndex, 0, removed);
            useSlideStore.setState({ slides: newSlides });
          },
        ),
      );

      // スライドを並べ替え
      reorderSlidesFromStore(fromIndex, toIndex);
    },
    [recordAction],
  );

  return {
    addSlide,
    deleteSlide,
    reorderSlides,
  };
}
