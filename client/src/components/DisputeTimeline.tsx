import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle2, AlertCircle, Mail, FileText } from "lucide-react";

interface DisputeTimelineProps {
  letter: {
    id: number;
    bureau: string;
    status: string;
    mailedAt: Date | null;
    responseDeadline: Date | null;
    responseReceivedAt: Date | null;
    createdAt: Date;
  };
}

export default function DisputeTimeline({ letter }: DisputeTimelineProps) {
  const now = Date.now();
  const mailedDate = letter.mailedAt ? new Date(letter.mailedAt).getTime() : null;
  const deadlineDate = letter.responseDeadline ? new Date(letter.responseDeadline).getTime() : null;
  
  // Calculate days since mailed
  const daysSinceMailed = mailedDate ? Math.floor((now - mailedDate) / (1000 * 60 * 60 * 24)) : 0;
  
  // Calculate days until deadline
  const daysUntilDeadline = deadlineDate ? Math.floor((deadlineDate - now) / (1000 * 60 * 60 * 24)) : 30;
  
  // Calculate progress percentage
  const progressPercentage = mailedDate && deadlineDate 
    ? Math.min(100, Math.max(0, ((now - mailedDate) / (deadlineDate - mailedDate)) * 100))
    : 0;
  
  // Determine status
  const isOverdue = deadlineDate && now > deadlineDate;
  const isComplete = letter.status === "response_received" || letter.status === "resolved";
  const isMailed = letter.mailedAt !== null;
  
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg capitalize">{letter.bureau}</h3>
          <p className="text-sm text-gray-500">
            {isMailed ? `Mailed ${daysSinceMailed} days ago` : "Not mailed yet"}
          </p>
        </div>
        <Badge variant={isComplete ? "default" : isOverdue ? "destructive" : "secondary"}>
          {isComplete ? "Complete" : isOverdue ? "Overdue" : "In Progress"}
        </Badge>
      </div>
      
      {isMailed && (
        <>
          <Progress value={progressPercentage} className="mb-4" />
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Letter Mailed</p>
                <p className="text-sm text-gray-500">
                  {letter.mailedAt ? new Date(letter.mailedAt).toLocaleDateString() : "Unknown"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                daysSinceMailed >= 5 ? "bg-green-100" : "bg-gray-100"
              }`}>
                <Mail className={`w-5 h-5 ${daysSinceMailed >= 5 ? "text-green-600" : "text-gray-400"}`} />
              </div>
              <div className="flex-1">
                <p className="font-medium">Bureau Received</p>
                <p className="text-sm text-gray-500">
                  {daysSinceMailed >= 5 ? "Estimated delivery complete" : "In transit (3-5 days)"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                isComplete ? "bg-green-100" : "bg-blue-100"
              }`}>
                {isComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <Clock className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">Investigation Period</p>
                <p className="text-sm text-gray-500">
                  {isComplete 
                    ? "Investigation complete" 
                    : `${daysUntilDeadline} days remaining`
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                isComplete ? "bg-green-100" : isOverdue ? "bg-red-100" : "bg-gray-100"
              }`}>
                {isComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : isOverdue ? (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                ) : (
                  <FileText className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">Response Due</p>
                <p className="text-sm text-gray-500">
                  {deadlineDate 
                    ? new Date(deadlineDate).toLocaleDateString()
                    : "30 days from mailing"
                  }
                </p>
              </div>
            </div>
          </div>
          
          {isOverdue && !isComplete && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Bureau missed the 30-day deadline!</strong> This is an FCRA violation. 
                You can file a CFPB complaint and demand immediate deletion under FCRA § 1681i(a)(1).
              </p>
            </div>
          )}
          
          {!isComplete && !isOverdue && daysUntilDeadline <= 5 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Response due soon!</strong> Check your mail daily for bureau response letters. 
                Results typically arrive 25-30 days after mailing.
              </p>
            </div>
          )}
        </>
      )}
      
      {!isMailed && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Next step:</strong> Download your letters, print them, and mail via Certified Mail with Return Receipt. 
            Then update the status to "Mailed" and enter your tracking number.
          </p>
        </div>
      )}
    </Card>
  );
}
