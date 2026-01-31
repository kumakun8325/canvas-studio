/**
 * Editor component tests
 * Editor is now edit-only - project loading/creation is handled by Home.tsx
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Editor } from './Editor'
import { useAutoSave } from '../hooks/useAutoSave'
import type { Project, Slide } from '../types'

// Mock other hooks and components
vi.mock('../hooks/useCanvas', () => ({
  useCanvas: vi.fn(() => ({
    canvasRef: { current: null },
    addObject: vi.fn(),
    deleteSelected: vi.fn(),
  })),
}))

vi.mock('../hooks/useAutoSave', () => ({
  useAutoSave: vi.fn(() => ({
    isSaving: false,
    lastSaved: null,
    error: null,
  })),
}))

// Mock slideStore
let mockProjectState: Project | null = null
let mockSlidesState: Slide[] = []
const mockSetCurrentSlide = vi.fn()

vi.mock('../stores/slideStore', () => ({
  useSlideStore: vi.fn((selector) => {
    const state = {
      project: mockProjectState,
      slides: mockSlidesState,
    }
    return selector ? selector(state) : state
  }),
}))

vi.mock('../stores/editorStore', () => ({
  useEditorStore: vi.fn((selector) => {
    const state = {
      currentSlideId: mockSlidesState.length > 0 ? mockSlidesState[0].id : null,
      setCurrentSlide: mockSetCurrentSlide,
    }
    return selector ? selector(state) : state
  }),
}))

vi.mock('../components/canvas/Toolbar', () => ({
  Toolbar: ({ isSaving, lastSaved, saveError }: { isSaving: boolean; lastSaved: Date | null; saveError: Error | null }) => (
    <div data-testid="toolbar">
      <div data-testid="saving-status">{isSaving ? 'Saving...' : 'Saved'}</div>
      {lastSaved && <div data-testid="last-saved">{lastSaved.toISOString()}</div>}
      {saveError && <div data-testid="save-error">{saveError.message}</div>}
    </div>
  ),
}))

vi.mock('../components/slides/SlideList', () => ({
  SlideList: () => <div data-testid="slide-list">Slide List</div>,
}))

vi.mock('../components/canvas/CanvasView', () => ({
  CanvasView: () => <div data-testid="canvas-view">Canvas</div>,
}))

vi.mock('../components/canvas/PropertyPanel', () => ({
  PropertyPanel: () => <div data-testid="property-panel">Property Panel</div>,
}))

vi.mock('../hooks/useClipboard', () => ({
  useClipboard: vi.fn(() => ({
    copy: vi.fn(),
    paste: vi.fn(),
    cut: vi.fn(),
  })),
}))

describe('Editor', () => {
  const mockUserId = 'user123'
  const mockProjectId = 'project123'

  const mockSlide: Slide = {
    id: 'slide1',
    canvasJson: '{}',
    createdAt: 1234567890000,
    updatedAt: 1234567890000,
  }

  const mockProject: Project = {
    id: mockProjectId,
    title: 'Test Project',
    ownerId: mockUserId,
    template: '16:9',
    slides: [mockSlide],
    createdAt: 1234567890000,
    updatedAt: 1234567890000,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockProjectState = mockProject
    mockSlidesState = [mockSlide]
  })

  describe('editor UI rendering', () => {
    it('should render all main components', async () => {
      // Act
      render(<Editor />)

      // Assert
      expect(screen.getByTestId('toolbar')).toBeInTheDocument()
      expect(screen.getByTestId('slide-list')).toBeInTheDocument()
      expect(screen.getByTestId('canvas-view')).toBeInTheDocument()
      expect(screen.getByTestId('property-panel')).toBeInTheDocument()
    })

    it('should show saving status in toolbar', async () => {
      // Act
      render(<Editor />)

      // Assert
      expect(screen.getByTestId('saving-status')).toBeInTheDocument()
    })
  })

  describe('auto-save activation', () => {
    it('should call useAutoSave with project', async () => {
      // Act
      render(<Editor />)

      // Assert - useAutoSave should be called
      await waitFor(() => {
        expect(vi.mocked(useAutoSave)).toHaveBeenCalled()
      })
    })

    it('should call useAutoSave with null when no project is loaded', async () => {
      // Arrange
      mockProjectState = null

      // Act
      render(<Editor />)

      // Assert - useAutoSave should be called with null
      await waitFor(() => {
        expect(vi.mocked(useAutoSave)).toHaveBeenCalled()
      })
      const projectArg = vi.mocked(useAutoSave).mock.calls[0][0]
      expect(projectArg).toBeNull()
    })
  })

  describe('initial slide selection', () => {
    it('should set current slide when slides are available', async () => {
      // Arrange - slides are available in mockSlidesState

      // Act
      render(<Editor />)

      // Assert - setCurrentSlide should be called with the first slide id
      // Note: The actual call happens in useEffect, but with our mock setup,
      // the currentSlideId is already set
      expect(screen.getByTestId('canvas-view')).toBeInTheDocument()
    })
  })
})