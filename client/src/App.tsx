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
import BlogCreditReport from "./pages/BlogCreditReport";
import Blog3RoundStrategy from "./pages/Blog3RoundStrategy";
import BlogFCRARights from "./pages/BlogFCRARights";
import CROADisclosure from "./pages/CROADisclosure";
import Cancellation from "./pages/Cancellation";
import MoneyBackGuarantee from "./pages/MoneyBackGuarantee";
import CreditEducation from "./pages/CreditEducation";
import DashboardHome from "./pages/DashboardHome";
import CFPBComplaints from "./pages/CFPBComplaints";
import InquiryRemoval from "./pages/InquiryRemoval";
import DebtValidation from "./pages/DebtValidation";
import ProfileOptimizer from "./pages/ProfileOptimizer";
import CreditBuilding from "./pages/CreditBuilding";
import Marketplace from "./pages/Marketplace";
import ReferralProgram from "./pages/ReferralProgram";
import DashboardSettings from "./pages/DashboardSettings";
import DashboardSupport from "./pages/DashboardSupport";

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
      <Route path="/croa-disclosure" component={CROADisclosure} />
      <Route path="/cancellation" component={Cancellation} />
      <Route path="/guarantee" component={Guarantee} />
      <Route path="/money-back-guarantee" component={MoneyBackGuarantee} />
      <Route path="/what-to-expect" component={WhatToExpect} />
      <Route path="/success-stories" component={SuccessStories} />
      <Route path="/credit-education" component={CreditEducation} />
      <Route path="/blog/how-to-read-credit-report" component={BlogCreditReport} />
      <Route path="/blog/3-round-strategy" component={Blog3RoundStrategy} />
      <Route path="/blog/fcra-rights" component={BlogFCRARights} />
      <Route path="/quiz" component={Quiz} />
      <Route path="/dashboard" component={DashboardHome} />
      <Route path="/dashboard/home" component={DashboardHome} />
      <Route path="/dashboard/reports" component={Dashboard} />
      <Route path="/dashboard/disputes" component={Dashboard} />
      <Route path="/dashboard/letters" component={Dashboard} />
      <Route path="/dashboard/creditor-disputes" component={Dashboard} />
      <Route path="/dashboard/cfpb" component={CFPBComplaints} />
      <Route path="/dashboard/inquiries" component={InquiryRemoval} />
      <Route path="/dashboard/debt-validation" component={DebtValidation} />
      <Route path="/dashboard/profile" component={ProfileOptimizer} />
      <Route path="/dashboard/credit-building" component={CreditBuilding} />
      <Route path="/dashboard/marketplace" component={Marketplace} />
      <Route path="/dashboard/referrals" component={ReferralProgram} />
      <Route path="/dashboard/settings" component={DashboardSettings} />
      <Route path="/dashboard/support" component={DashboardSupport} />
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
