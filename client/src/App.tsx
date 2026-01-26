import { Toaster } from "@/components/ui/sonner";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ScrollToTop } from "./components/ScrollToTop";
import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import Dashboard from "@/pages/Dashboard";
import MyLiveReport from "@/pages/MyLiveReport";
import DisputeManager from "@/pages/DisputeManager";
import Letters from "@/pages/Letters";
import MailingTracker from "@/pages/MailingTracker";
import ScoreTracker from "@/pages/ScoreTracker";
import PreviewResults from "@/pages/PreviewResults";
import PreviewResultsPage from "@/pages/PreviewResultsPage";
import AIAssistant from "@/pages/AIAssistant";
import LetterView from "@/pages/LetterView";
import AdminEnhanced from "@/pages/AdminEnhanced";
import AdminPanel from "@/pages/AdminPanel";
import AdminLogin from "@/pages/AdminLogin";
import AdminUserDetails from "@/pages/AdminUserDetails";
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
import DisputeTracking from "./pages/DisputeTracking";
import ScoreSimulator from "./pages/ScoreSimulator";
import CertificateView from "./pages/CertificateView";
import AgencyDashboard from "./pages/AgencyDashboard";
import AgencyClientDetail from "./pages/AgencyClientDetail";
import AgencyPricing from "./pages/AgencyPricing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import { CookieConsent } from "./components/CookieConsent";

// V2 - New Flow Pages
import CreditAnalysis from "./pages/CreditAnalysis";
import OnboardingWizard from "./pages/OnboardingWizard";
import ResponseUpload from "./pages/ResponseUpload";
import DashboardHomeV2 from "./pages/DashboardHomeV2";
import Checkout from "./pages/Checkout";
import OnboardingQuiz from "./pages/OnboardingQuiz";
import CompleteProfile from "./pages/CompleteProfile";
import GetReports from "./pages/GetReports";
import FCRARights from "./pages/FCRARights";

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
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/quiz" component={Quiz} />
      
      {/* V3 - New Free Onboarding Flow */}
      <Route path="/start" component={OnboardingQuiz} />

      <Route path="/complete-profile" component={CompleteProfile} />
      <Route path="/get-reports" component={GetReports} />
      <Route path="/fcra-rights" component={FCRARights} />

      
      {/* V2 - Flow Routes */}
      <Route path="/preview-results" component={PreviewResultsPage} />
      <Route path="/trial-checkout">{() => { window.location.href = '/pricing'; return null; }}</Route>
      <Route path="/checkout" component={Checkout} />

      <Route path="/credit-analysis" component={CreditAnalysis} />
      <Route path="/onboarding" component={OnboardingWizard} />
      <Route path="/responses/:roundId" component={ResponseUpload} />
      
      {/* Dashboard Routes */}
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/dashboard/preview" component={PreviewResultsPage} />
      <Route path="/dashboard/home" component={DashboardHome} />
      <Route path="/dashboard/v2" component={DashboardHomeV2} />
      
      {/* Dashboard Sidebar Routes - Pointing to dedicated components */}
      <Route path="/dashboard/report" component={MyLiveReport} />
      <Route path="/dashboard/dispute-manager" component={DisputeManager} />
      <Route path="/dashboard/letters" component={Letters} />
      <Route path="/dashboard/mailing-tracker" component={MailingTracker} />
      <Route path="/dashboard/score-tracker" component={ScoreTracker} />
      

      
      {/* Dedicated Dashboard Pages */}
      <Route path="/dashboard/cfpb" component={CFPBComplaints} />
      <Route path="/dashboard/inquiries" component={InquiryRemoval} />
      <Route path="/dashboard/debt-validation" component={DebtValidation} />
      <Route path="/dashboard/profile" component={ProfileOptimizer} />
      <Route path="/dashboard/credit-building" component={CreditBuilding} />
      <Route path="/dashboard/marketplace" component={Marketplace} />
      <Route path="/dashboard/referrals" component={ReferralProgram} />
      <Route path="/dashboard/settings" component={DashboardSettings} />
      <Route path="/dashboard/support" component={DashboardSupport} />
      <Route path="/dashboard/tracking" component={DisputeTracking} />
      <Route path="/dashboard/simulator" component={ScoreSimulator} />
      <Route path="/dashboard/education" component={CreditEducation} />
      <Route path="/dashboard/ai-assistant" component={AIAssistant} />

      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/admin/user/:id" component={AdminUserDetails} />
      <Route path="/admin/legacy" component={AdminEnhanced} />
      <Route path="/admin/parser" component={HybridParserAdmin} />
      <Route path="/mailing-instructions" component={MailingInstructions} />
      <Route path="/letter/:letterId" component={LetterView} />
      <Route path="/certificate/:id" component={CertificateView} />
      <Route path="/agency" component={AgencyDashboard} />
      <Route path="/agency/client/:clientId" component={AgencyClientDetail} />
      <Route path="/agency-pricing" component={AgencyPricing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/verify-email" component={VerifyEmail} />
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
          <ScrollToTop />
          <Router />
          <CookieConsent />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
