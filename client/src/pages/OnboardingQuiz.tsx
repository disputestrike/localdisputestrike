import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, Shield, Target, TrendingUp, AlertCircle, HelpCircle, CheckCircle2, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

type QuizData = {
  creditConcern: string;
  creditGoal: string;
};

const creditConcernOptions = [
  {
    value: "collections",
    label: "Collections",
    description: "I have collection accounts reporting",
    icon: AlertCircle,
  },
  {
    value: "late_payments",
    label: "Late Payments",
    description: "I have late payment marks",
    icon: AlertCircle,
  },
  {
    value: "charge_offs",
    label: "Charge-Offs",
    description: "I have accounts charged off",
    icon: AlertCircle,
  },
  {
    value: "inaccuracies",
    label: "Inaccuracies",
    description: "I see errors or wrong information",
    icon: HelpCircle,
  },
  {
    value: "all_of_above",
    label: "All of the Above",
    description: "I have multiple issues",
    icon: AlertCircle,
  },
  {
    value: "not_sure",
    label: "Not Sure Yet",
    description: "I want to see what the AI finds",
    icon: HelpCircle,
  },
];

const creditGoalOptions = [
  {
    value: "600_650",
    label: "600-650 (Fair Credit)",
    description: "I want to qualify for better loans",
    icon: Target,
  },
  {
    value: "650_700",
    label: "650-700 (Good Credit)",
    description: "I want lower interest rates",
    icon: TrendingUp,
  },
  {
    value: "700_plus",
    label: "700+ (Excellent Credit)",
    description: "I want the best possible rates",
    icon: Sparkles,
  },
  {
    value: "clean_reports",
    label: "Just Want Clean Reports",
    description: "I want inaccuracies removed",
    icon: CheckCircle2,
  },
];

export default function OnboardingQuiz() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [quizData, setQuizData] = useState<QuizData>({
    creditConcern: "",
    creditGoal: "",
  });

  const totalSteps = 6; // Total steps in the full onboarding flow
  const progress = (step / totalSteps) * 100;

  // Save quiz answers mutation
  const saveQuizAnswers = trpc.users.updateQuizAnswers.useMutation({
    onSuccess: () => {
      // Navigate to account creation (Step 3)
      setLocation("/register?from=quiz");
    },
    onError: (error) => {
      console.error("Error saving quiz answers:", error);
      // Still navigate even if save fails - we'll save again later
      setLocation("/register?from=quiz");
    },
  });

  const handleSelectConcern = (value: string) => {
    setQuizData({ ...quizData, creditConcern: value });
    // Auto-advance after selection
    setTimeout(() => setStep(2), 300);
  };

  const handleSelectGoal = (value: string) => {
    setQuizData({ ...quizData, creditGoal: value });
    // Save to localStorage for persistence before account creation
    localStorage.setItem("onboardingQuiz", JSON.stringify({ ...quizData, creditGoal: value }));
    // Navigate to account creation
    setTimeout(() => setLocation("/register?from=quiz"), 300);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
      <div className="container max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img loading="lazy" src="/logo.webp" alt="DisputeStrike" className="h-10 w-10" />
            <span className="font-bold text-2xl">DisputeStrike</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Start Your Free Credit Analysis
          </h1>
          <p className="text-muted-foreground">
            Answer 2 quick questions to personalize your experience
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Step {step} of {totalSteps}</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span className={step >= 1 ? "text-primary font-medium" : ""}>Concern</span>
            <span className={step >= 2 ? "text-primary font-medium" : ""}>Goal</span>
            <span>Account</span>
            <span>Profile</span>
            <span>Reports</span>
            <span>Analysis</span>
          </div>
        </div>

        {/* Quiz Steps */}
        <Card className="border-2">
          <CardContent className="pt-6">
            {/* Step 1: Credit Concern */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">What's your biggest credit concern?</h2>
                  <p className="text-muted-foreground">
                    This helps us personalize your analysis and recommendations
                  </p>
                </div>
                
                <div className="space-y-3">
                  {creditConcernOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = quizData.creditConcern === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleSelectConcern(option.value)}
                        className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left
                          ${isSelected 
                            ? "border-primary bg-primary/5" 
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                          }`}
                      >
                        <div className={`p-2 rounded-full ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-muted-foreground">{option.description}</div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center pt-4">
                  <Shield className="h-4 w-4" />
                  <span>Your information is secure and private</span>
                </div>
              </div>
            )}

            {/* Step 2: Credit Goal */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">What's your credit score goal?</h2>
                  <p className="text-muted-foreground">
                    Knowing your target helps us show you relevant strategies
                  </p>
                </div>
                
                <div className="space-y-3">
                  {creditGoalOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = quizData.creditGoal === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleSelectGoal(option.value)}
                        className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left
                          ${isSelected 
                            ? "border-primary bg-primary/5" 
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                          }`}
                      >
                        <div className={`p-2 rounded-full ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-muted-foreground">{option.description}</div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Back Button */}
                <div className="flex justify-between pt-4">
                  <Button variant="ghost" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
                  <TrendingUp className="h-4 w-4" />
                  <span>Average user sees +30-50 point increase after disputes</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trust Badges */}
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-500" />
            <span>Bank-Level Encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>No Credit Card Required</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-green-500" />
            <span>AI-Powered Violation Detection</span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 text-center text-xs text-muted-foreground max-w-lg mx-auto">
          <p>
            DisputeStrike is a software tool, not a credit repair organization. 
            You control the dispute process. Results not guaranteed. 
            You can dispute credit errors for free on your own by contacting bureaus directly.
          </p>
        </div>
      </div>
    </div>
  );
}
