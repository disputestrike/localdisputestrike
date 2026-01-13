import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, ArrowRight, ArrowLeft, Shield, TrendingUp, Zap, AlertTriangle, Star, Crown, Sparkles, Clock, FileText, Target, Award, Lock, Check, X } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

// Toast functionality - using simple alerts for now
const toast = ({ title, description, variant }: { title: string; description?: string; variant?: string }) => {
  if (variant === "destructive") {
    console.error(title, description);
  } else {
    console.log(title, description);
  }
};

type QuizData = {
  creditScoreRange: string;
  negativeItemsCount: string;
  bureaus: string[];
  email: string;
  zipCode: string;
  marketingConsent: boolean;
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
    marketingConsent: true, // Default checked
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
    const itemsCount = parseInt(quizData.negativeItemsCount.split("-")[0] || "5");
    const bureauCount = quizData.bureaus.length || 3;
    const minDeletions = Math.floor(itemsCount * 0.7 * bureauCount);
    const maxDeletions = Math.ceil(itemsCount * 0.85 * bureauCount);
    const minScoreIncrease = minDeletions * 10;
    const maxScoreIncrease = maxDeletions * 15;
    
    return { 
      minDeletions: Math.max(minDeletions, 3), 
      maxDeletions: Math.max(maxDeletions, 7), 
      minScoreIncrease: Math.max(minScoreIncrease, 30), 
      maxScoreIncrease: Math.max(maxScoreIncrease, 85),
      itemsCount,
      bureauCount
    };
  };

  const getCreditScoreLabel = () => {
    const ranges: Record<string, { label: string; color: string; risk: string }> = {
      "300-549": { label: "Poor", color: "text-red-500", risk: "High Risk" },
      "550-619": { label: "Fair", color: "text-orange-500", risk: "Medium-High Risk" },
      "620-679": { label: "Good", color: "text-yellow-500", risk: "Medium Risk" },
      "680-739": { label: "Very Good", color: "text-blue-500", risk: "Low Risk" },
      "740-850": { label: "Excellent", color: "text-green-500", risk: "Very Low Risk" },
      "unknown": { label: "Unknown", color: "text-gray-500", risk: "Unknown Risk" },
    };
    return ranges[quizData.creditScoreRange] || ranges["unknown"];
  };

  const getRecommendedPackage = () => {
    const itemsCount = parseInt(quizData.negativeItemsCount.split("-")[0] || "5");
    if (itemsCount >= 8) return "professional";
    if (itemsCount >= 4) return "standard";
    return "starter";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
      <div className="container max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img loading="lazy" src="/logo.webp" alt="DisputeStrike AI" className="h-10 w-10" />
            <span className="font-bold text-2xl">DisputeStrike AI</span>
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
                    { value: "4-7", label: "4-7 items", desc: "Several accounts to dispute" },
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

            {/* Step 5: Email Capture with Marketing Consent */}
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
                
                {/* Marketing Consent Checkbox */}
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="marketing-consent"
                      checked={quizData.marketingConsent}
                      onCheckedChange={(checked) => setQuizData({ ...quizData, marketingConsent: checked as boolean })}
                      className="mt-1"
                    />
                    <Label htmlFor="marketing-consent" className="text-sm leading-relaxed cursor-pointer">
                      Yes, I want to receive exclusive credit tips, special offers, and personalized recommendations from DisputeStrike. I understand I can unsubscribe at any time.
                    </Label>
                  </div>
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

                {/* Fine Print */}
                <p className="text-xs text-muted-foreground leading-relaxed">
                  By clicking "Get My Free Analysis", you agree to our <a href="/terms" className="underline hover:text-foreground">Terms of Service</a> and <a href="/privacy" className="underline hover:text-foreground">Privacy Policy</a>. 
                  Your email will be used to create your account and deliver your analysis. 
                  {quizData.marketingConsent && " You've opted in to receive marketing communications, which you can opt out of at any time."}
                  {!quizData.marketingConsent && " You've opted out of marketing communications, but we may still send transactional emails related to your account."}
                  {" "}We will never sell your personal information to third parties.
                </p>
              </div>
            )}

            {/* Step 6: INSTANT ANALYSIS RESULTS */}
            {step === 6 && (
              <div className="space-y-8">
                {/* Success Header */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 mb-4 shadow-lg shadow-green-500/30">
                    <CheckCircle2 className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Your Instant Analysis is Ready!
                  </h2>
                  <p className="text-muted-foreground">Based on your answers, here's your personalized credit assessment:</p>
                </div>

                {/* Credit Score Status */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-400 uppercase tracking-wider">Current Score Range</p>
                      <p className={`text-2xl font-bold ${getCreditScoreLabel().color}`}>
                        {quizData.creditScoreRange === "unknown" ? "Unknown" : quizData.creditScoreRange}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400 uppercase tracking-wider">Risk Level</p>
                      <p className={`text-lg font-semibold ${getCreditScoreLabel().color}`}>
                        {getCreditScoreLabel().risk}
                      </p>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full"
                      style={{ width: quizData.creditScoreRange === "unknown" ? "50%" : `${((parseInt(quizData.creditScoreRange.split("-")[0]) - 300) / 550) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>300</span>
                    <span>550</span>
                    <span>700</span>
                    <span>850</span>
                  </div>
                </div>

                {/* Key Findings */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="border-2 border-orange-500/50 bg-orange-500/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        Negative Items Found
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold text-orange-500">
                        {quizData.negativeItemsCount === "unknown" ? "5-10" : quizData.negativeItemsCount}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Items affecting your score</p>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-blue-500/50 bg-blue-500/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Target className="h-5 w-5 text-blue-500" />
                        Bureaus Affected
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold text-blue-500">
                        {quizData.bureaus.includes("All") ? 3 : quizData.bureaus.length || 3}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Credit bureaus with issues</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Potential Results */}
                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-2 border-green-500/30 rounded-2xl p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-green-500" />
                    Your Potential Results with DisputeStrike
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="text-center p-4 bg-white/50 dark:bg-white/5 rounded-xl">
                      <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <div className="text-3xl font-bold text-green-600">
                        {getEstimatedResults().minDeletions}-{getEstimatedResults().maxDeletions}
                      </div>
                      <p className="text-sm font-medium">Items Could Be Removed</p>
                      <p className="text-xs text-muted-foreground">From your credit reports</p>
                    </div>
                    <div className="text-center p-4 bg-white/50 dark:bg-white/5 rounded-xl">
                      <Zap className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <div className="text-3xl font-bold text-green-600">
                        +{getEstimatedResults().minScoreIncrease}-{getEstimatedResults().maxScoreIncrease}
                      </div>
                      <p className="text-sm font-medium">Point Increase Potential</p>
                      <p className="text-xs text-muted-foreground">Estimated score improvement</p>
                    </div>
                  </div>
                </div>

                {/* Recommended Package Section */}
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">🎯 Your Recommended Package</h3>
                    <p className="text-muted-foreground">Based on your credit situation, we recommend:</p>
                  </div>

                  {/* Package Cards */}
                  <div className="space-y-4">
                    {/* Starter Package */}
                    <Card className={`border-2 transition-all ${getRecommendedPackage() === "starter" ? "border-primary ring-2 ring-primary/20" : "border-muted"}`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Star className="h-5 w-5 text-yellow-500" />
                              <h4 className="text-xl font-bold">Starter Package</h4>
                              {getRecommendedPackage() === "starter" && (
                                <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">RECOMMENDED</span>
                              )}
                            </div>
                            <p className="text-muted-foreground text-sm mb-3">Perfect for 1-3 negative items</p>
                            <ul className="space-y-1 text-sm">
                              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> 1 Bureau Dispute Letters</li>
                              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Round 1 Disputes</li>
                              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Email Support</li>
                            </ul>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold">$29</div>
                            <div className="text-sm text-muted-foreground">one-time</div>
                          </div>
                        </div>
                        <Button 
                          className="w-full mt-4" 
                          variant={getRecommendedPackage() === "starter" ? "default" : "outline"}
                          onClick={() => setLocation("/pricing?package=starter")}
                        >
                          Get Started <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Standard Package */}
                    <Card className={`border-2 transition-all ${getRecommendedPackage() === "standard" ? "border-primary ring-2 ring-primary/20" : "border-muted"}`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Crown className="h-5 w-5 text-purple-500" />
                              <h4 className="text-xl font-bold">Standard Package</h4>
                              {getRecommendedPackage() === "standard" && (
                                <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">RECOMMENDED</span>
                              )}
                              <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">POPULAR</span>
                            </div>
                            <p className="text-muted-foreground text-sm mb-3">Best for 4-7 negative items</p>
                            <ul className="space-y-1 text-sm">
                              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> All 3 Bureau Dispute Letters</li>
                              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Round 1-2 Disputes</li>
                              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Priority Support</li>
                              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Progress Tracking</li>
                            </ul>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold">$79</div>
                            <div className="text-sm text-muted-foreground">one-time</div>
                          </div>
                        </div>
                        <Button 
                          className="w-full mt-4" 
                          variant={getRecommendedPackage() === "standard" ? "default" : "outline"}
                          onClick={() => setLocation("/pricing?package=standard")}
                        >
                          Get Started <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Professional Package */}
                    <Card className={`border-2 transition-all ${getRecommendedPackage() === "professional" ? "border-primary ring-2 ring-primary/20" : "border-muted"}`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Award className="h-5 w-5 text-amber-500" />
                              <h4 className="text-xl font-bold">Professional Package</h4>
                              {getRecommendedPackage() === "professional" && (
                                <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">RECOMMENDED</span>
                              )}
                              <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full">BEST VALUE</span>
                            </div>
                            <p className="text-muted-foreground text-sm mb-3">Ideal for 8+ negative items</p>
                            <ul className="space-y-1 text-sm">
                              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> All 3 Bureau Dispute Letters</li>
                              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Round 1-2-3 Disputes</li>
                              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Creditor Direct Disputes</li>
                              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> 24/7 Priority Support</li>
                              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Unlimited Letters</li>
                            </ul>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold">$39.99</div>
                            <div className="text-sm text-muted-foreground">/month</div>
                          </div>
                        </div>
                        <Button 
                          className="w-full mt-4" 
                          variant={getRecommendedPackage() === "professional" ? "default" : "outline"}
                          onClick={() => setLocation("/pricing?package=professional")}
                        >
                          Get Started <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Email Confirmation */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
                  <p className="font-semibold mb-1 flex items-center justify-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    Detailed Analysis Sent!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    We've sent your complete analysis to <span className="font-medium text-foreground">{quizData.email}</span>
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <Button 
                    size="lg" 
                    className="w-full text-lg h-14 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700" 
                    onClick={() => setLocation("/pricing")}
                  >
                    View All Packages & Sign Up <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full" 
                    onClick={() => setLocation("/")}
                  >
                    Maybe Later
                  </Button>
                </div>

                {/* Trust Signals */}
                <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    <span>Secure Checkout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>110% Money Back</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>FCRA Compliant</span>
                  </div>
                </div>
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
              Join 16,628 users striking with precision and defending with decisive action
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
