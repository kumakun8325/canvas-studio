import { useHistoryStore } from '../../stores/historyStore'

export function UndoRedoButtons() {
  const { undo, redo, canUndo, canRedo } = useHistoryStore()

  return (
    <div className="flex gap-1">
      <button
        onClick={undo}
        disabled={!canUndo()}
        className={`px-3 py-2 rounded transition-colors ${
          canUndo()
            ? 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
        }`}
        title="元に戻す (Ctrl+Z)"
      >
        ↶
      </button>
      <button
        onClick={redo}
        disabled={!canRedo()}
        className={`px-3 py-2 rounded transition-colors ${
          canRedo()
            ? 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
        }`}
        title="やり直し (Ctrl+Y)"
      >
        ↷
      </button>
    </div>
  )
}
