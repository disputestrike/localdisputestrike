import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { safeJsonParse } from "@/lib/utils";

export function LiveCounter() {
  const [count, setCount] = useState(1247);
  const [recentActivity, setRecentActivity] = useState<string>("");

  useEffect(() => {
    // Simulate live counter incrementing
    const counterInterval = setInterval(() => {
      setCount(prev => prev + Math.floor(Math.random() * 3));
    }, 15000); // Every 15 seconds

    // Simulate recent activity notifications (CreditFixrr style)
    const activities = [
      { name: "Sarah M.", location: "Miami, FL", action: "Started monitoring their credit", time: "3 hours ago" },
      { name: "John D.", location: "Austin, TX", action: "Generated dispute letters", time: "5 hours ago" },
      { name: "Maria G.", location: "Los Angeles, CA", action: "Joined the platform", time: "7 hours ago" },
      { name: "David R.", location: "Brooklyn, NY", action: "Started using dispute tools", time: "9 hours ago" },
      { name: "Lisa K.", location: "Tampa, FL", action: "Tracking their disputes", time: "4 hours ago" },
      { name: "Michael P.", location: "Chicago, IL", action: "Monitoring credit changes", time: "6 hours ago" },
    ];

    let activityIndex = 0;
    const activityInterval = setInterval(() => {
      const activity = activities[activityIndex % activities.length];
      setRecentActivity(JSON.stringify(activity));
      activityIndex++;
      
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
          {count.toLocaleString()} users monitoring their credit
        </span>
      </div>

      {/* Recent Activity Toast - CreditFixrr Style */}
      {recentActivity && (() => {
        const activity = safeJsonParse(recentActivity, {});
        return (
          <div className="fixed bottom-4 right-4 z-50 bg-background border-2 border-green-500 px-4 py-3 rounded-lg shadow-lg max-w-sm animate-in slide-in-from-right">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mt-1.5"></div>
              <div className="text-sm">
                <p className="font-semibold">{activity.name} <span className="text-muted-foreground font-normal">from {activity.location}</span></p>
                <p className="text-muted-foreground">{activity.action}</p>
                <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}
