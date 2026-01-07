import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, ArrowRight, ArrowLeft, Shield, TrendingUp, Zap } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
// Toast functionality - using simple alerts for now
const toast = ({ title, description, variant }: { title: string; description?: string; variant?: string }) => {
  alert(`${title}${description ? '\n' + description : ''}`);
};

type QuizData = {
  creditScoreRange: string;
  negativeItemsCount: string;
  bureaus: string[];
  email: string;
  zipCode: string;
};

export default function Quiz() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [quizData, setQuizData] = useState<QuizData>({
    creditScoreRange: "",
    negativeItemsCount: "",
    bureaus: [],
    email: "",
    zipCode: "",
  });

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const submitLead = trpc.leads.captureLead.useMutation({
    onSuccess: () => {
      setStep(6); // Show results
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    // Validation
    if (step === 1 && !quizData.zipCode) {
      toast({ title: "Please enter your ZIP code", variant: "destructive" });
      return;
    }
    if (step === 2 && !quizData.creditScoreRange) {
      toast({ title: "Please select your credit score range", variant: "destructive" });
      return;
    }
    if (step === 3 && !quizData.negativeItemsCount) {
      toast({ title: "Please select how many negative items you have", variant: "destructive" });
      return;
    }
    if (step === 4 && quizData.bureaus.length === 0) {
      toast({ title: "Please select at least one bureau", variant: "destructive" });
      return;
    }
    if (step === 5 && !quizData.email) {
      toast({ title: "Please enter your email", variant: "destructive" });
      return;
    }

    if (step === 5) {
      // Submit lead
      submitLead.mutate(quizData);
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleBureau = (bureau: string) => {
    setQuizData(prev => ({
      ...prev,
      bureaus: prev.bureaus.includes(bureau)
        ? prev.bureaus.filter(b => b !== bureau)
        : [...prev.bureaus, bureau]
    }));
  };

  const getEstimatedResults = () => {
    const itemsCount = parseInt(quizData.negativeItemsCount.split("-")[0] || "0");
    const bureauCount = quizData.bureaus.length;
    const minDeletions = Math.floor(itemsCount * 0.7 * bureauCount);
    const maxDeletions = Math.ceil(itemsCount * 0.85 * bureauCount);
    const minScoreIncrease = minDeletions * 10;
    const maxScoreIncrease = maxDeletions * 15;
    
    return { minDeletions, maxDeletions, minScoreIncrease, maxScoreIncrease };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
      <div className="container max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/logo.png" alt="DisputeForce AI" className="h-10 w-10" />
            <span className="font-bold text-2xl">DisputeForce AI</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Get Your Free Credit Monitoring Analysis
          </h1>
          <p className="text-muted-foreground">
            Answer 5 quick questions to see how many items you could delete
          </p>
        </div>

        {/* Progress Bar */}
        {step <= 5 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Step {step} of {totalSteps}</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Quiz Steps */}
        <Card className="border-2">
          <CardContent className="pt-6">
            {/* Step 1: ZIP Code */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">What's your ZIP code?</h2>
                  <p className="text-muted-foreground">We'll personalize your results for your area</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    type="tel"
                    placeholder="e.g. 90210"
                    value={quizData.zipCode}
                    onChange={(e) => setQuizData({ ...quizData, zipCode: e.target.value })}
                    className="text-lg h-14"
                    maxLength={5}
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Your data is protected and encrypted</span>
                </div>
              </div>
            )}

            {/* Step 2: Credit Score Range */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">What's your current credit score range?</h2>
                  <p className="text-muted-foreground">Don't worry, this is just an estimate</p>
                </div>
                <RadioGroup
                  value={quizData.creditScoreRange}
                  onValueChange={(value) => setQuizData({ ...quizData, creditScoreRange: value })}
                >
                  {[
                    { value: "300-549", label: "300-549 (Poor)", color: "text-red-500" },
                    { value: "550-619", label: "550-619 (Fair)", color: "text-orange-500" },
                    { value: "620-679", label: "620-679 (Good)", color: "text-yellow-500" },
                    { value: "680-739", label: "680-739 (Very Good)", color: "text-blue-500" },
                    { value: "740-850", label: "740-850 (Excellent)", color: "text-green-500" },
                    { value: "unknown", label: "I don't know", color: "text-muted-foreground" },
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className={`flex-1 cursor-pointer font-medium ${option.color}`}>
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Step 3: Negative Items Count */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">How many negative items are on your credit report?</h2>
                  <p className="text-muted-foreground">Collections, charge-offs, late payments, etc.</p>
                </div>
                <RadioGroup
                  value={quizData.negativeItemsCount}
                  onValueChange={(value) => setQuizData({ ...quizData, negativeItemsCount: value })}
                >
                  {[
                    { value: "1-3", label: "1-3 items", desc: "Just a few negative marks" },
                    { value: "4-7", label: "4-7 items", desc: "Several accounts to Attack" },
                    { value: "8-15", label: "8-15 items", desc: "Many negative accounts" },
                    { value: "16+", label: "16+ items", desc: "Significant credit damage" },
                    { value: "unknown", label: "I don't know", desc: "Haven't checked recently" },
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-muted-foreground">{option.desc}</div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Step 4: Bureaus */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Which credit bureaus show negative items?</h2>
                  <p className="text-muted-foreground">Select all that apply</p>
                </div>
                <div className="space-y-3">
                  {[
                    { value: "TransUnion", label: "TransUnion", desc: "One of the big 3 bureaus" },
                    { value: "Equifax", label: "Equifax", desc: "Major credit reporting agency" },
                    { value: "Experian", label: "Experian", desc: "Largest credit bureau" },
                    { value: "All", label: "All Three Bureaus", desc: "Items appear on all reports" },
                    { value: "Unknown", label: "I'm Not Sure", desc: "Haven't checked all three" },
                  ].map((option) => (
                    <div
                      key={option.value}
                      onClick={() => toggleBureau(option.value)}
                      className={`flex items-center space-x-3 border rounded-lg p-4 hover:bg-muted/50 cursor-pointer ${
                        quizData.bureaus.includes(option.value) ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        quizData.bureaus.includes(option.value) ? "border-primary bg-primary" : "border-muted-foreground"
                      }`}>
                        {quizData.bureaus.includes(option.value) && <CheckCircle2 className="h-4 w-4 text-primary-foreground" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-muted-foreground">{option.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Email Capture */}
            {step === 5 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Where should we send your free analysis?</h2>
                  <p className="text-muted-foreground">Get your personalized credit monitoring plan instantly</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={quizData.email}
                    onChange={(e) => setQuizData({ ...quizData, email: e.target.value })}
                    className="text-lg h-14"
                  />
                </div>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>100% free analysis</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Unsubscribe anytime</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Results */}
            {step === 6 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Your Free Analysis is Ready!</h2>
                  <p className="text-muted-foreground">Based on your answers, here's what you could achieve:</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="border-2 border-primary">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Potential Deletions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-primary">
                        {getEstimatedResults().minDeletions}-{getEstimatedResults().maxDeletions} items
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Could be removed from your credit report</p>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-primary">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        Score Increase
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-primary">
                        +{getEstimatedResults().minScoreIncrease}-{getEstimatedResults().maxScoreIncrease} points
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Estimated credit score improvement</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-primary/5 border-2 border-primary rounded-lg p-6 text-center">
                  <p className="font-semibold mb-2">✉️ Check your email!</p>
                  <p className="text-sm text-muted-foreground">
                    We've sent your detailed analysis to <span className="font-medium text-foreground">{quizData.email}</span>
                  </p>
                </div>

                <Button size="lg" className="w-full text-lg h-14" onClick={() => setLocation("/pricing")}>
                  Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  🎉 Special offer: Get 20% off your first package today!
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            {step <= 5 && (
              <div className="flex gap-4 mt-8">
                {step > 1 && (
                  <Button variant="outline" onClick={handleBack} className="flex-1">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  disabled={submitLead.isPending}
                  className={`flex-1 ${step === 1 ? "w-full" : ""}`}
                >
                  {step === 5 ? (
                    submitLead.isPending ? "Analyzing..." : "Get My Free Analysis"
                  ) : (
                    <>
                      Next <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trust Signals */}
        {step <= 5 && (
          <div className="mt-8 text-center space-y-4">
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>FCRA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span>Instant Results</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Join 10,000+ users who've improved their credit with DisputeForce AI
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
