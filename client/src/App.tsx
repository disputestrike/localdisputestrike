import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import Dashboard from "@/pages/Dashboard";
import AIAssistant from "@/pages/AIAssistant";
import LetterView from "@/pages/LetterView";
import AdminEnhanced from "@/pages/AdminEnhanced";
import MailingInstructions from "@/pages/MailingInstructions";
import Pricing from "./pages/Pricing";
import Features from "./pages/Features";
import HowItWorks from "./pages/HowItWorks";
import FAQ from "./pages/FAQ";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import Guarantee from "./pages/Guarantee";
import WhatToExpect from "./pages/WhatToExpect";
import SuccessStories from "./pages/SuccessStories";
import { HybridParserAdmin } from "./pages/HybridParserAdmin";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/features" component={Features} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/faq" component={FAQ} />
      <Route path="/about" component={About} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/contact" component={Contact} />
      <Route path="/guarantee" component={Guarantee} />
      <Route path="/what-to-expect" component={WhatToExpect} />
      <Route path="/success-stories" component={SuccessStories} />
      <Route path="/quiz" component={Quiz} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/ai-assistant" component={AIAssistant} />
      <Route path="/admin" component={AdminEnhanced} />
      <Route path="/admin/parser" component={HybridParserAdmin} />
      <Route path="/mailing-instructions" component={MailingInstructions} />
      <Route path="/letter/:letterId" component={LetterView} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
