import { useCallback } from "react";
import { useSlideStore } from "../stores/slideStore";
import { useHistory } from "./useHistory";

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
    recordAction({
      type: "slide:added",
      description: "スライドを追加",
      undo: () => {
        useSlideStore.setState({
          slides: useSlideStore.getState().slides.slice(0, -1),
        });
      },
      redo: () => {
        useSlideStore.setState({
          slides: [...useSlideStore.getState().slides, addedSlide],
        });
      },
    });
  }, [recordAction]);

  const deleteSlide = useCallback(
    (slideId: string) => {
      const slideToDelete = slides.find((s) => s.id === slideId);
      if (!slideToDelete) return;

      const index = slides.findIndex((s) => s.id === slideId);

      // 履歴を記録（削除前に現在の状態を保存）
      recordAction({
        type: "slide:deleted",
        description: "スライドを削除",
        undo: () => {
          const currentSlides = useSlideStore.getState().slides;
          useSlideStore.setState({
            slides: [
              ...currentSlides.slice(0, index),
              slideToDelete,
              ...currentSlides.slice(index),
            ],
          });
        },
        redo: () => {
          useSlideStore.setState({
            slides: useSlideStore.getState().slides.filter((s) => s.id !== slideId),
          });
        },
      });

      // スライドを削除
      useSlideStore.setState({
        slides: slides.filter((s) => s.id !== slideId),
      });
    },
    [slides, recordAction],
  );

  const reorderSlides = useCallback(
    (fromIndex: number, toIndex: number) => {
      // 履歴を記録
      recordAction({
        type: "slide:reordered",
        description: "スライドを並べ替え",
        undo: () => {
          useSlideStore.setState({ slides });
        },
        redo: () => {
          const currentSlides = useSlideStore.getState().slides;
          const newSlides = [...currentSlides];
          const [removed] = newSlides.splice(fromIndex, 1);
          newSlides.splice(toIndex, 0, removed);
          useSlideStore.setState({ slides: newSlides });
        },
      });

      // スライドを並べ替え
      const newSlides = [...slides];
      const [removed] = newSlides.splice(fromIndex, 1);
      newSlides.splice(toIndex, 0, removed);
      useSlideStore.setState({ slides: newSlides });
    },
    [slides, recordAction],
  );

  return {
    addSlide,
    deleteSlide,
    reorderSlides,
  };
}
