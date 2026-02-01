/**
 * Home page - Shows login button or project selection/creation
 * Flow: Login → Project list → Select existing or create new → Editor
 */
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useSlideStore } from '../stores/slideStore'
import { TemplateSelector } from '../components/templates/TemplateSelector'
import { listProjects, deleteProject } from '../services/projectService'
import type { Project, TemplateType, TemplateConfig } from '../types'

export function Home() {
  const { user, loading, signInWithGoogle, signOut, error } = useAuth()
  const { setProject, createProject } = useSlideStore()

  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [projectError, setProjectError] = useState<string | null>(null)

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

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('このプロジェクトを削除しますか？')) return

    try {
      await deleteProject(projectId)
      setProjects(projects.filter(p => p.id !== projectId))
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Failed to delete project:', err)
      }
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Canvas Studio</h1>
          <p className="text-gray-600 mb-8">Create beautiful presentations with ease</p>
          <button
            onClick={signInWithGoogle}
            className="inline-flex items-center gap-3 bg-white border border-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-sm"
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
          <p className="text-sm text-gray-500 mt-4">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    )
  }

  // Logged in - show project list
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Canvas Studio</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <button
              onClick={signOut}
              className="text-sm text-gray-500 hover:text-gray-700"
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
            className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新規プロジェクト作成
          </button>
        </div>

        {/* Error message */}
        {projectError && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
            {projectError}
          </div>
        )}

        {/* Loading projects */}
        {loadingProjects ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">プロジェクトを読み込み中...</p>
          </div>
        ) : projects.length === 0 ? (
          /* No projects */
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-gray-600 mb-2">プロジェクトがありません</p>
            <p className="text-sm text-gray-500">
              「新規プロジェクト作成」ボタンから始めましょう
            </p>
          </div>
        ) : (
          /* Project list */
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">マイプロジェクト</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => handleSelectProject(project)}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                >
                  {/* Thumbnail placeholder */}
                  <div className="h-32 bg-gray-100 rounded-t-lg flex items-center justify-center">
                    <div className="text-gray-400">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  {/* Project info */}
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-800 truncate">{project.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {project.slides.length} スライド · {project.template}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          最終更新: {formatDate(project.updatedAt)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteProject(project.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                        title="削除"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
    </div>
  )
}