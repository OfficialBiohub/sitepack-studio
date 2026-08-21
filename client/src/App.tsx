/* Design direction: Paper Utility — warm editorial utility, black ink, highlighter yellow, and visible process. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import ArchiveHistory from "./pages/ArchiveHistory";
import CreatorContact from "./pages/CreatorContact";
import Home from "./pages/Home";
import HowItWorks from "./pages/HowItWorks";
import NotFound from "./pages/NotFound";

function App() {
  const pathname = window.location.pathname;
  const Page = pathname === "/" ? Home
    : pathname === "/how-it-works" ? HowItWorks
      : pathname === "/archive-history" ? ArchiveHistory
        : pathname === "/creator-contact" ? CreatorContact
          : NotFound;

  return (
    <ErrorBoundary>
      <TooltipProvider>
        <Toaster position="bottom-right" />
        <Page />
      </TooltipProvider>
    </ErrorBoundary>
  );
}

export default App;
