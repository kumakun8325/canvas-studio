import { Editor } from "./pages/Editor";
import { ErrorBoundary } from "./components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <Editor />
    </ErrorBoundary>
  );
}

export default App;
