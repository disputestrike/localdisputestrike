import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";

export function LiveCounter() {
  const [count, setCount] = useState(1247);
  const [recentActivity, setRecentActivity] = useState<string>("");

  useEffect(() => {
    // Simulate live counter incrementing
    const counterInterval = setInterval(() => {
      setCount(prev => prev + Math.floor(Math.random() * 3));
    }, 15000); // Every 15 seconds

    // Simulate recent activity notifications
    const activities = [
      "Sarah from Miami just generated 3 letters",
      "John from Dallas deleted 8 accounts",
      "Maria from Phoenix got 95 point increase",
      "David from Seattle just started their dispute",
      "Lisa from Boston removed 5 collections",
      "Mike from Chicago got approved for mortgage",
    ];

    const activityInterval = setInterval(() => {
      const randomActivity = activities[Math.floor(Math.random() * activities.length)];
      setRecentActivity(randomActivity);
      
      // Clear after 5 seconds
      setTimeout(() => setRecentActivity(""), 5000);
    }, 10000); // Every 10 seconds

    return () => {
      clearInterval(counterInterval);
      clearInterval(activityInterval);
    };
  }, []);

  return (
    <>
      {/* Live Counter Badge */}
      <div className="fixed bottom-4 left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-in slide-in-from-left">
        <TrendingUp className="h-4 w-4 animate-pulse" />
        <span className="text-sm font-semibold">
          {count.toLocaleString()} items deleted this week
        </span>
      </div>

      {/* Recent Activity Toast */}
      {recentActivity && (
        <div className="fixed bottom-4 right-4 z-50 bg-background border-2 border-primary px-4 py-3 rounded-lg shadow-lg max-w-xs animate-in slide-in-from-right">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <p className="text-sm font-medium">{recentActivity}</p>
          </div>
        </div>
      )}
    </>
  );
}
