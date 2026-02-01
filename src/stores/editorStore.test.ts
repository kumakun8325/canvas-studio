import { describe, it, expect, beforeEach } from 'vitest'
import { useEditorStore } from './editorStore'

describe('editorStore - isDarkMode', () => {
  beforeEach(() => {
    // Reset store to initial state
    useEditorStore.setState({
      isDarkMode: false,
    })
  })

  it('should have isDarkMode default to false', () => {
    const state = useEditorStore.getState()
    expect(state.isDarkMode).toBe(false)
  })

  it('should update isDarkMode with setDarkMode(true)', () => {
    useEditorStore.getState().setDarkMode(true)
    expect(useEditorStore.getState().isDarkMode).toBe(true)
  })

  it('should update isDarkMode with setDarkMode(false)', () => {
    useEditorStore.getState().setDarkMode(true)
    useEditorStore.getState().setDarkMode(false)
    expect(useEditorStore.getState().isDarkMode).toBe(false)
  })

  it('should not affect other store properties when setting dark mode', () => {
    const before = useEditorStore.getState()
    useEditorStore.getState().setDarkMode(true)
    const after = useEditorStore.getState()

    expect(after.currentSlideId).toBe(before.currentSlideId)
    expect(after.selectedObjectIds).toEqual(before.selectedObjectIds)
    expect(after.activeTool).toBe(before.activeTool)
    expect(after.zoom).toBe(before.zoom)
    expect(after.isSlideListOpen).toBe(before.isSlideListOpen)
    expect(after.isPropertyPanelOpen).toBe(before.isPropertyPanelOpen)
  })
})
