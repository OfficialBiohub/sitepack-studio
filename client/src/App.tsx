/* Design direction: Paper Utility — warm editorial utility, black ink, highlighter yellow, and visible process. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import ArchiveHistory from "./pages/ArchiveHistory";
import CreatorContact from "./pages/CreatorContact";
import Home from "./pages/Home";
import HowItWorks from "./pages/HowItWorks";
import NotFound from "./pages/NotFound";
import { Route, Router, Switch } from "wouter";

function App() {
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <Toaster position="bottom-right" />
        <Router>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/how-it-works" component={HowItWorks} />
            <Route path="/archive-history" component={ArchiveHistory} />
            <Route path="/creator-contact" component={CreatorContact} />
            <Route component={NotFound} />
          </Switch>
        </Router>
      </TooltipProvider>
    </ErrorBoundary>
  );
}

export default App;
