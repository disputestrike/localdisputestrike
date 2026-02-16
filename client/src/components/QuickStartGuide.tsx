
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  Search, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickStartGuideProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const steps = [
  {
    title: "Upload Your Report",
    description: "Start by uploading your credit reports from TransUnion, Equifax, and Experian. Our AI supports PDF and text formats.",
    icon: Upload,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Review AI Violations",
    description: "Our AI scans for legal violations like impossible timelines and cross-bureau conflicts that the bureaus are required to fix.",
    icon: Search,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    title: "Mail Your Disputes",
    description: "Generate your litigation-grade letters, print them, and mail them via Certified Mail. We provide the addresses and checklist.",
    icon: Mail,
    color: "text-green-600",
    bgColor: "bg-green-50",
  }
];

export default function QuickStartGuide({ open, onOpenChange }: QuickStartGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onOpenChange(false);
      localStorage.setItem("hasSeenQuickStart", "true");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white relative">
          <div className="absolute top-4 right-4 opacity-10">
            <Zap size={120} />
          </div>
          <div className="relative z-10">
            <Badge className="bg-orange-600 text-white mb-4 border-none px-3 py-1">Quick Start Guide</Badge>
            <h2 className="text-3xl font-black tracking-tight mb-2">Master Your Credit</h2>
            <p className="text-slate-300 text-sm">Follow these 3 steps to start striking back at errors.</p>
          </div>
        </div>

        <div className="p-8 bg-white">
          <div className="flex justify-between mb-8">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "h-1.5 flex-1 mx-1 rounded-full transition-all duration-500",
                  i <= currentStep ? "bg-orange-600" : "bg-gray-100"
                )}
              />
            ))}
          </div>

          <div className="flex flex-col items-center text-center space-y-6 py-4">
            <div className={cn("p-5 rounded-3xl", steps[currentStep].bgColor)}>
              {React.createElement(steps[currentStep].icon, { 
                className: cn("w-12 h-12", steps[currentStep].color) 
              })}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900">{steps[currentStep].title}</h3>
              <p className="text-gray-500 leading-relaxed">
                {steps[currentStep].description}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 bg-gray-50 border-t flex items-center justify-between sm:justify-between">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className={cn("font-bold text-gray-500", currentStep === 0 && "invisible")}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          
          <Button 
            onClick={handleNext}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8"
          >
            {currentStep === steps.length - 1 ? "Get Started" : "Next Step"}
            {currentStep !== steps.length - 1 && <ChevronRight className="ml-2 h-4 w-4" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", className)}>
      {children}
    </span>
  );
}
