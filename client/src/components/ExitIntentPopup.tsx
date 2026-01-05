import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Gift, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export function ExitIntentPopup() {
  const [showPopup, setShowPopup] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger when mouse leaves viewport from top
      if (e.clientY <= 0 && !hasShown) {
        setShowPopup(true);
        setHasShown(true);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [hasShown]);

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <Card className="max-w-lg border-2 border-primary shadow-2xl animate-in zoom-in">
        <CardHeader className="relative">
          <button
            onClick={() => setShowPopup(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <Gift className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">Wait! Don't Leave Empty-Handed</CardTitle>
          </div>
          <CardDescription className="text-base">
            Get your free credit repair analysis + 20% off your first package
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-primary/10 border-2 border-primary rounded-lg p-4">
            <p className="font-semibold text-lg mb-2">🎁 Special One-Time Offer:</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Free personalized credit analysis (worth $99)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>20% discount on any package</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Priority support for 30 days</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <Button size="lg" className="w-full" asChild>
              <Link href="/quiz">
                Claim My Free Analysis <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={() => setShowPopup(false)}
            >
              No thanks, I'll pay full price
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            ⏰ This offer expires in 10 minutes
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
