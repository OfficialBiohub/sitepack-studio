/* Design direction: Paper Utility — warm editorial utility, black ink, highlighter yellow, and visible process. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";

function App() {
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <Toaster position="bottom-right" />
        <Home />
      </TooltipProvider>
    </ErrorBoundary>
  );
}

export default App;
