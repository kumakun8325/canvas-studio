import { EditorContent } from "./EditorContent";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useEditorStore } from "../stores/editorStore";

/**
 * エディタページコンポーネント
 * レスポンシブ対応: モバイル(<768px)では編集不可メッセージを表示
 */
export function Editor() {
  const { setCurrentSlide } = useEditorStore();

  // モバイル判定（< 768px）
  const isMobile = useMediaQuery("(max-width: 767px)");

  // クリーンアップ時にスライド状態をリセット
  const handleBackToHome = () => {
    setCurrentSlide(null);
    window.location.href = "/";
  };

  // モバイルでは編集不可メッセージを表示
  if (isMobile) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">📱💻</div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            このデバイスには対応していません
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Canvas Studio は、デスクトップまたはタブレット（768px以上）での使用を推奨しています。
            <br />
            モバイルデバイスでは編集機能を制限しています。
          </p>
          <button
            onClick={handleBackToHome}
            className="px-6 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  // デスクトップ/タブレットではエディタを表示
  return <EditorContent />;
}