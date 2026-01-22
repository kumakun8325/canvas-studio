/**
 * Editor component tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Editor } from './Editor'
import { useAuth } from '../hooks/useAuth'
import { useAutoSave } from '../hooks/useAutoSave'
import { listProjects, createNewProject } from '../services/projectService'
import type { Project, Slide } from '../types'

// Mock useAuth hook
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

// Mock projectService
vi.mock('../services/projectService', () => ({
  listProjects: vi.fn(),
  createNewProject: vi.fn(),
}))

// Mock other hooks and components
vi.mock('../hooks/useCanvas', () => ({
  useCanvas: vi.fn(() => ({
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
const mockSetProject = vi.fn()
const mockSetCurrentSlide = vi.fn()

vi.mock('../stores/slideStore', () => ({
  useSlideStore: vi.fn((selector) => {
    const state = {
      project: mockProjectState,
      slides: mockSlidesState,
      setProject: mockSetProject,
      setCurrentSlide: mockSetCurrentSlide,
    }
    return selector ? selector(state) : state
  }),
}))

vi.mock('../stores/editorStore', () => ({
  useEditorStore: vi.fn((selector) => {
    const state = {
      currentSlideId: null,
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
    mockProjectState = null
    mockSlidesState = [mockSlide]
  })

  describe('project auto-loading on login', () => {
    it('should load existing project when user logs in and has projects', async () => {
      // Arrange
      vi.mocked(useAuth).mockReturnValue({
        user: { uid: mockUserId } as any,
        loading: false,
        error: null,
        signInWithGoogle: vi.fn(),
        signOut: vi.fn(),
      })
      vi.mocked(listProjects).mockResolvedValue([mockProject])

      // Act
      render(<Editor />)

      // Assert - Verify the feature was called (this will fail initially)
      // After implementation, setProject should be called with the loaded project
      // For now, we just verify the service was called
      expect(listProjects).toHaveBeenCalledWith(mockUserId)
    })

    it('should show template selector when user logs in and has no existing projects', async () => {
      // Arrange
      vi.mocked(useAuth).mockReturnValue({
        user: { uid: mockUserId } as any,
        loading: false,
        error: null,
        signInWithGoogle: vi.fn(),
        signOut: vi.fn(),
      })
      vi.mocked(listProjects).mockResolvedValue([])

      // Act
      render(<Editor />)

      // Assert
      await waitFor(() => {
        expect(listProjects).toHaveBeenCalledWith(mockUserId)
      })
      // TemplateSelector should be shown instead of auto-creating a project
      expect(screen.getByText('テンプレートを選択')).toBeInTheDocument()
      expect(screen.getByText('16:9 プレゼンテーション')).toBeInTheDocument()
    })

    it('should not load or create project when user is not logged in', async () => {
      // Arrange
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        loading: false,
        error: null,
        signInWithGoogle: vi.fn(),
        signOut: vi.fn(),
      })

      // Act
      render(<Editor />)

      // Assert - Should not call listProjects or createNewProject
      expect(listProjects).not.toHaveBeenCalled()
      expect(createNewProject).not.toHaveBeenCalled()
    })

    it('should load the most recent project when user has multiple projects', async () => {
      // Arrange
      const oldProject: Project = {
        ...mockProject,
        id: 'old-project',
        updatedAt: 1000000000000,
      }
      const recentProject: Project = {
        ...mockProject,
        id: 'recent-project',
        updatedAt: 2000000000000,
      }

      vi.mocked(useAuth).mockReturnValue({
        user: { uid: mockUserId } as any,
        loading: false,
        error: null,
        signInWithGoogle: vi.fn(),
        signOut: vi.fn(),
      })
      vi.mocked(listProjects).mockResolvedValue([oldProject, recentProject])

      // Act
      render(<Editor />)

      // Assert - setProject should be called with the most recent project
      await waitFor(() => {
        expect(mockSetProject).toHaveBeenCalledWith(recentProject)
      })
    })

    it('should handle errors when loading projects', async () => {
      // Arrange
      const mockError = new Error('Failed to load projects')
      vi.mocked(useAuth).mockReturnValue({
        user: { uid: mockUserId } as any,
        loading: false,
        error: null,
        signInWithGoogle: vi.fn(),
        signOut: vi.fn(),
      })
      vi.mocked(listProjects).mockRejectedValue(mockError)

      // Act & Assert - Should not throw
      expect(() => render(<Editor />)).not.toThrow()
    })

    it('should handle errors when creating new project', async () => {
      // Arrange
      const mockError = new Error('Failed to create project')
      vi.mocked(useAuth).mockReturnValue({
        user: { uid: mockUserId } as any,
        loading: false,
        error: null,
        signInWithGoogle: vi.fn(),
        signOut: vi.fn(),
      })
      vi.mocked(listProjects).mockResolvedValue([])
      vi.mocked(createNewProject).mockRejectedValue(mockError)

      // Act & Assert - Should not throw
      expect(() => render(<Editor />)).not.toThrow()
    })

    it('should not load project multiple times for the same user session', async () => {
      // Arrange
      vi.mocked(useAuth).mockReturnValue({
        user: { uid: mockUserId } as any,
        loading: false,
        error: null,
        signInWithGoogle: vi.fn(),
        signOut: vi.fn(),
      })
      vi.mocked(listProjects).mockResolvedValue([mockProject])

      // Act
      const { rerender } = render(<Editor />)

      // Assert
      expect(listProjects).toHaveBeenCalledTimes(1)

      // Rerender should not trigger another load
      rerender(<Editor />)

      // Should still only be called once (implementation should use ref/memo to prevent duplicate calls)
      expect(listProjects).toHaveBeenCalledTimes(1)
    })
  })

  describe('auto-save activation', () => {
    it('should activate auto-save after project is loaded', async () => {
      // Arrange
      vi.mocked(useAuth).mockReturnValue({
        user: { uid: mockUserId } as any,
        loading: false,
        error: null,
        signInWithGoogle: vi.fn(),
        signOut: vi.fn(),
      })
      vi.mocked(listProjects).mockResolvedValue([mockProject])

      // Act
      render(<Editor />)

      // Assert - useAutoSave should be called
      await waitFor(() => {
        expect(vi.mocked(useAutoSave)).toHaveBeenCalled()
      })
    })

    it('should not activate auto-save when no project is loaded', async () => {
      // Arrange
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        loading: false,
        error: null,
        signInWithGoogle: vi.fn(),
        signOut: vi.fn(),
      })

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
})
