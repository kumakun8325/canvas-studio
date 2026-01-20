import { useCanvas } from '../../hooks/useCanvas'
import { useEditorStore } from '../../stores/editorStore'
import type { ToolType } from '../../types'

export function Toolbar() {
  const { addRect, addCircle, addText } = useCanvas('main-canvas')
  const { activeTool, setActiveTool } = useEditorStore()

  const tools: { id: ToolType; label: string; icon: string }[] = [
    { id: 'select', label: 'Select', icon: '↖' },
    { id: 'rect', label: 'Rectangle', icon: '▢' },
    { id: 'circle', label: 'Circle', icon: '○' },
    { id: 'text', label: 'Text', icon: 'T' },
  ]

  const handleToolClick = (tool: ToolType) => {
    setActiveTool(tool)
    if (tool === 'rect') addRect()
    if (tool === 'circle') addCircle()
    if (tool === 'text') addText()
  }

  return (
    <div className="bg-white border-b px-4 py-2 flex gap-2">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => handleToolClick(tool.id)}
          className={`px-3 py-2 rounded transition-colors ${
            activeTool === tool.id
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
          title={tool.label}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  )
}
