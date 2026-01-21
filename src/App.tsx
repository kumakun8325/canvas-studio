import { Editor } from "./pages/Editor";
import { Home } from "./pages/Home";
import { ErrorBoundary } from "./components/ErrorBoundary";

function App() {
  // Simple routing based on current path
  const path = window.location.pathname;

  return (
    <ErrorBoundary>
      {path === "/editor" ? <Editor /> : <Home />}
    </ErrorBoundary>
  );
}

export default App;
