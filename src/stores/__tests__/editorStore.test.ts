/**
 * editorStore tests
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useEditorStore } from '../editorStore'

describe('editorStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useEditorStore.setState({
      currentSlideId: null,
      selectedObjectIds: [],
      activeTool: 'select',
      zoom: 1,
      isDarkMode: false,
      isSlideListOpen: true,
      isPropertyPanelOpen: true,
    })
  })

  describe('初期状態', () => {
    it('isDarkModeがfalseで初期化される', () => {
      const { isDarkMode } = useEditorStore.getState()
      expect(isDarkMode).toBe(false)
    })

    it('activeToolがselectで初期化される', () => {
      const { activeTool } = useEditorStore.getState()
      expect(activeTool).toBe('select')
    })

    it('zoomが1で初期化される', () => {
      const { zoom } = useEditorStore.getState()
      expect(zoom).toBe(1)
    })

    it('両方のパネルが開いた状態で初期化される', () => {
      const { isSlideListOpen, isPropertyPanelOpen } = useEditorStore.getState()
      expect(isSlideListOpen).toBe(true)
      expect(isPropertyPanelOpen).toBe(true)
    })
  })

  describe('setDarkMode', () => {
    it('setDarkMode(true)でisDarkModeがtrueになる', () => {
      const { setDarkMode } = useEditorStore.getState()

      setDarkMode(true)

      const { isDarkMode } = useEditorStore.getState()
      expect(isDarkMode).toBe(true)
    })

    it('setDarkMode(false)でisDarkModeがfalseになる', () => {
      const { setDarkMode } = useEditorStore.getState()

      setDarkMode(true)
      expect(useEditorStore.getState().isDarkMode).toBe(true)

      setDarkMode(false)
      expect(useEditorStore.getState().isDarkMode).toBe(false)
    })

    it('複数回の切り替えが正しく動作する', () => {
      const { setDarkMode } = useEditorStore.getState()

      setDarkMode(true)
      expect(useEditorStore.getState().isDarkMode).toBe(true)

      setDarkMode(false)
      expect(useEditorStore.getState().isDarkMode).toBe(false)

      setDarkMode(true)
      expect(useEditorStore.getState().isDarkMode).toBe(true)

      setDarkMode(false)
      expect(useEditorStore.getState().isDarkMode).toBe(false)
    })
  })

  describe('setCurrentSlide', () => {
    it('setCurrentSlideでslideIdが設定される', () => {
      const { setCurrentSlide } = useEditorStore.getState()

      setCurrentSlide('slide-123')

      const { currentSlideId } = useEditorStore.getState()
      expect(currentSlideId).toBe('slide-123')
    })

    it('setCurrentSlide(null)でslideIdがクリアされる', () => {
      const { setCurrentSlide } = useEditorStore.getState()

      setCurrentSlide('slide-123')
      expect(useEditorStore.getState().currentSlideId).toBe('slide-123')

      setCurrentSlide(null)
      expect(useEditorStore.getState().currentSlideId).toBeNull()
    })
  })

  describe('setActiveTool', () => {
    it('setActiveToolでツールが切り替わる', () => {
      const { setActiveTool } = useEditorStore.getState()

      setActiveTool('rect')
      expect(useEditorStore.getState().activeTool).toBe('rect')

      setActiveTool('circle')
      expect(useEditorStore.getState().activeTool).toBe('circle')

      setActiveTool('text')
      expect(useEditorStore.getState().activeTool).toBe('text')
    })
  })

  describe('setZoom', () => {
    it('setZoomでzoom値が設定される', () => {
      const { setZoom } = useEditorStore.getState()

      setZoom(1.5)
      expect(useEditorStore.getState().zoom).toBe(1.5)

      setZoom(2.0)
      expect(useEditorStore.getState().zoom).toBe(2.0)

      setZoom(0.5)
      expect(useEditorStore.getState().zoom).toBe(0.5)
    })
  })

  describe('toggleSlideList', () => {
    it('toggleSlideListでパネル状態が反転する', () => {
      const { toggleSlideList } = useEditorStore.getState()

      expect(useEditorStore.getState().isSlideListOpen).toBe(true)

      toggleSlideList()
      expect(useEditorStore.getState().isSlideListOpen).toBe(false)

      toggleSlideList()
      expect(useEditorStore.getState().isSlideListOpen).toBe(true)
    })
  })

  describe('togglePropertyPanel', () => {
    it('togglePropertyPanelでパネル状態が反転する', () => {
      const { togglePropertyPanel } = useEditorStore.getState()

      expect(useEditorStore.getState().isPropertyPanelOpen).toBe(true)

      togglePropertyPanel()
      expect(useEditorStore.getState().isPropertyPanelOpen).toBe(false)

      togglePropertyPanel()
      expect(useEditorStore.getState().isPropertyPanelOpen).toBe(true)
    })
  })

  describe('setSelectedObjects', () => {
    it('setSelectedObjectsで選択オブジェクトが設定される', () => {
      const { setSelectedObjects } = useEditorStore.getState()

      setSelectedObjects(['obj-1', 'obj-2'])

      const { selectedObjectIds } = useEditorStore.getState()
      expect(selectedObjectIds).toEqual(['obj-1', 'obj-2'])
    })

    it('setSelectedObjects([])で選択がクリアされる', () => {
      const { setSelectedObjects } = useEditorStore.getState()

      setSelectedObjects(['obj-1', 'obj-2'])
      expect(useEditorStore.getState().selectedObjectIds).toEqual(['obj-1', 'obj-2'])

      setSelectedObjects([])
      expect(useEditorStore.getState().selectedObjectIds).toEqual([])
    })
  })
})
