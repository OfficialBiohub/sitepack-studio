/* Design direction: Paper Utility — warm editorial utility, black ink, highlighter yellow, and visible process. */
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";

function App() {
  return (
    <ErrorBoundary>
      <Toaster position="bottom-right" />
      <Home />
    </ErrorBoundary>
  );
}

export default App;
