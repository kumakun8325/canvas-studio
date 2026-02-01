import { Editor } from './pages/Editor'
import { Home } from './pages/Home'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Toast } from './components/ui/Toast'
import { Spinner } from './components/ui/Spinner'
import { useAuth } from './hooks/useAuth'
import { useSlideStore } from './stores/slideStore'
import { useTheme } from './hooks/useTheme'

function App() {
  const { user, loading } = useAuth()
  const { project } = useSlideStore()

  // Initialize theme (syncs dark class on <html>, listens to OS changes)
  useTheme()

  // Show loading state while checking authentication
  if (loading) {
    return <Spinner message="Loading..." />
  }

  // Route based on authentication state and project selection
  // - Not logged in: Home (login page)
  // - Logged in but no project: Home (project selection page)
  // - Logged in with project: Editor
  return (
    <ErrorBoundary>
      {user && project ? <Editor /> : <Home />}
      <Toast />
    </ErrorBoundary>
  )
}

export default App
