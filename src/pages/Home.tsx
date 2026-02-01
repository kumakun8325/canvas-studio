/**
 * Home page - Shows login button or project selection/creation
 * Flow: Login → Project list → Select existing or create new → Editor
 */
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useSlideStore } from '../stores/slideStore'
import { useToast } from '../hooks/useToast'
import { TemplateSelector } from '../components/templates/TemplateSelector'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Spinner } from '../components/ui/Spinner'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import { listProjects, deleteProject } from '../services/projectService'
import type { Project, TemplateType, TemplateConfig } from '../types'

export function Home() {
  const { user, loading, signInWithGoogle, signOut, error } = useAuth()
  const { setProject, createProject } = useSlideStore()
  const { error: showError } = useToast()

  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [projectError, setProjectError] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    projectId: string | null
  }>({ isOpen: false, projectId: null })

  // Load user's projects when logged in
  useEffect(() => {
    if (!user) {
      setProjects([])
      return
    }

    const loadProjects = async () => {
      setLoadingProjects(true)
      setProjectError(null)
      try {
        const userProjects = await listProjects(user.uid)
        // Sort by updatedAt descending (use spread to avoid mutation)
        const sorted = [...userProjects].sort((a, b) => b.updatedAt - a.updatedAt)
        setProjects(sorted)
      } catch (err) {
        setProjectError('プロジェクトの読み込みに失敗しました')
        if (import.meta.env.DEV) {
          console.error('Failed to load projects:', err)
        }
      } finally {
        setLoadingProjects(false)
      }
    }

    loadProjects()
  }, [user])

  const handleSelectProject = (project: Project) => {
    setProject(project)
  }

  const handleCreateProject = (template: TemplateType, config: TemplateConfig) => {
    if (!user) return
    createProject('新規プロジェクト', template, config, user.uid)
    setShowTemplateSelector(false)
  }

  const handleDeleteClick = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setConfirmDialog({ isOpen: true, projectId })
  }

  const handleDeleteConfirm = async () => {
    const projectId = confirmDialog.projectId
    if (!projectId) return

    try {
      await deleteProject(projectId)
      setProjects(projects.filter((p) => p.id !== projectId))
    } catch (err) {
      showError('プロジェクトの削除に失敗しました')
      if (import.meta.env.DEV) {
        console.error('Failed to delete project:', err)
      }
    } finally {
      setConfirmDialog({ isOpen: false, projectId: null })
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Loading state
  if (loading) {
    return <Spinner message="Loading..." />
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold">Error</p>
          <p className="mt-2">{error.message}</p>
        </div>
      </div>
    )
  }

  // Not logged in - show login button
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        {/* テーマ切り替えボタン（右上固定） */}
        <div className="fixed top-4 right-4 z-10">
          <ThemeToggle className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm" />
        </div>

        <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md dark:shadow-gray-900/50 text-center max-w-md">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">Canvas Studio</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">Create beautiful presentations with ease</p>
          <button
            onClick={signInWithGoogle}
            className="inline-flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    )
  }

  // Logged in - show project list
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm dark:shadow-gray-900/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Canvas Studio</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-300">{user.email}</span>
            <ThemeToggle className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700" />
            <button
              onClick={signOut}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Create new project button */}
        <div className="mb-8">
          <button
            onClick={() => setShowTemplateSelector(true)}
            className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors shadow-sm dark:shadow-gray-900/50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新規プロジェクト作成
          </button>
        </div>

        {/* Error message */}
        {projectError && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-lg">
            {projectError}
          </div>
        )}

        {/* Loading projects */}
        {loadingProjects ? (
          <Spinner message="プロジェクトを読み込み中..." className="py-12" />
        ) : projects.length === 0 ? (
          /* No projects */
          <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg shadow-sm dark:shadow-gray-900/50">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-2">プロジェクトがありません</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              「新規プロジェクト作成」ボタンから始めましょう
            </p>
          </div>
        ) : (
          /* Project list */
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">マイプロジェクト</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => handleSelectProject(project)}
                  className="bg-white dark:bg-gray-900 rounded-lg shadow-sm dark:shadow-gray-900/50 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow cursor-pointer group"
                >
                  {/* Thumbnail placeholder */}
                  <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-t-lg flex items-center justify-center">
                    <div className="text-gray-400 dark:text-gray-500">
                      <svg
                        className="w-12 h-12"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                  {/* Project info */}
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-800 dark:text-gray-100 truncate">{project.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {project.slides.length} スライド · {project.template}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          最終更新: {formatDate(project.updatedAt)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteClick(project.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-all"
                        title="削除"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Template selector modal */}
      {showTemplateSelector && (
        <TemplateSelector
          onSelect={handleCreateProject}
          onCancel={() => setShowTemplateSelector(false)}
          showCustomOption={true}
        />
      )}

      {/* Confirm dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="プロジェクトの削除"
        message="このプロジェクトを削除しますか？この操作は取り消せません。"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDialog({ isOpen: false, projectId: null })}
        confirmLabel="削除"
        isDanger={true}
      />
    </div>
  )
}
