import { Editor } from "./pages/Editor";
import { Home } from "./pages/Home";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useAuth } from "./hooks/useAuth";

function App() {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Route based on authentication state
  return (
    <ErrorBoundary>
      {user ? <Editor /> : <Home />}
    </ErrorBoundary>
  );
}

export default App;
