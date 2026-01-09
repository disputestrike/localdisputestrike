import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Mail, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Zap,
  TrendingUp,
  Timer,
  CalendarDays,
  Send,
  Sparkles
} from "lucide-react";
import { format, addDays, isWeekend, startOfWeek, endOfWeek, isSameDay } from "date-fns";

interface DisputeLetter {
  id: number;
  bureau: string;
  status: string;
  createdAt: string;
  mailedAt?: string;
  responseDeadline?: string;
}

interface SmartLetterSchedulerProps {
  letters: DisputeLetter[];
  onScheduleMail?: (letterId: number, date: Date) => void;
}

interface ScheduleRecommendation {
  date: Date;
  score: number;
  reasons: string[];
  isOptimal: boolean;
}

export function SmartLetterScheduler({ letters, onScheduleMail }: SmartLetterSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedLetterId, setSelectedLetterId] = useState<number | null>(null);

  // Get pending letters (not yet mailed)
  const pendingLetters = useMemo(() => {
    return letters.filter(l => l.status === 'generated' || l.status === 'downloaded');
  }, [letters]);

  // Calculate optimal mailing dates
  const recommendations = useMemo(() => {
    const today = new Date();
    const recs: ScheduleRecommendation[] = [];

    // Analyze next 14 days
    for (let i = 1; i <= 14; i++) {
      const date = addDays(today, i);
      const { score, reasons } = calculateDateScore(date, letters);
      recs.push({
        date,
        score,
        reasons,
        isOptimal: score >= 85
      });
    }

    return recs.sort((a, b) => b.score - a.score);
  }, [letters]);

  // Best dates (top 3)
  const bestDates = recommendations.slice(0, 3);

  // Get mailed letters with deadlines
  const activeDisputes = useMemo(() => {
    return letters
      .filter(l => l.mailedAt && l.responseDeadline)
      .map(l => ({
        ...l,
        daysRemaining: Math.ceil(
          (new Date(l.responseDeadline!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
      }))
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [letters]);

  // Bureau-specific insights
  const bureauInsights = useMemo(() => {
    const bureaus = ['transunion', 'equifax', 'experian'];
    return bureaus.map(bureau => {
      const bureauLetters = letters.filter(l => l.bureau === bureau);
      const mailed = bureauLetters.filter(l => l.mailedAt);
      const pending = bureauLetters.filter(l => !l.mailedAt);
      
      return {
        bureau,
        totalLetters: bureauLetters.length,
        mailed: mailed.length,
        pending: pending.length,
        lastMailed: mailed.length > 0 
          ? new Date(Math.max(...mailed.map(l => new Date(l.mailedAt!).getTime())))
          : null
      };
    });
  }, [letters]);

  const handleSchedule = (letterId: number, date: Date) => {
    onScheduleMail?.(letterId, date);
    setSelectedLetterId(null);
    setSelectedDate(undefined);
  };

  if (letters.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Generate dispute letters to see smart scheduling recommendations</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Scheduler Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Smart Letter Scheduler
              </CardTitle>
              <CardDescription>
                AI-optimized mailing dates for maximum dispute success
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50">
              {pendingLetters.length} pending
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Optimal Dates */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Recommended Mailing Dates
            </h3>
            <div className="grid md:grid-cols-3 gap-3">
              {bestDates.map((rec, idx) => (
                <div
                  key={idx}
                  className={`
                    p-4 rounded-lg border cursor-pointer transition-all
                    ${idx === 0 
                      ? 'bg-green-50 border-green-200 hover:border-green-400' 
                      : 'bg-muted/50 hover:border-primary/50'
                    }
                    ${selectedDate && isSameDay(selectedDate, rec.date) ? 'ring-2 ring-primary' : ''}
                  `}
                  onClick={() => setSelectedDate(rec.date)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">
                      {format(rec.date, 'EEE, MMM d')}
                    </span>
                    {idx === 0 && (
                      <Badge className="bg-green-500">Best</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${idx === 0 ? 'bg-green-500' : 'bg-primary'}`}
                        style={{ width: `${rec.score}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{rec.score}%</span>
                  </div>
                  <div className="space-y-1">
                    {rec.reasons.slice(0, 2).map((reason, i) => (
                      <div key={i} className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        {reason}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Letters */}
          {pendingLetters.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Letters Ready to Mail
              </h3>
              <div className="space-y-2">
                {pendingLetters.map(letter => (
                  <div
                    key={letter.id}
                    className={`
                      flex items-center justify-between p-3 rounded-lg border
                      ${selectedLetterId === letter.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`
                        h-10 w-10 rounded-full flex items-center justify-center
                        ${letter.bureau === 'transunion' ? 'bg-blue-100 text-blue-600' :
                          letter.bureau === 'equifax' ? 'bg-red-100 text-red-600' :
                          'bg-purple-100 text-purple-600'
                        }
                      `}>
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium capitalize">{letter.bureau}</div>
                        <div className="text-xs text-muted-foreground">
                          Created {format(new Date(letter.createdAt), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            Schedule
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => {
                              if (date) {
                                handleSchedule(letter.id, date);
                              }
                            }}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {selectedDate && (
                        <Button 
                          size="sm"
                          onClick={() => handleSchedule(letter.id, selectedDate)}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Mail on {format(selectedDate, 'MMM d')}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Disputes Timeline */}
          {activeDisputes.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Timer className="h-4 w-4" />
                Response Deadlines
              </h3>
              <div className="space-y-2">
                {activeDisputes.map(dispute => (
                  <div
                    key={dispute.id}
                    className={`
                      flex items-center justify-between p-3 rounded-lg
                      ${dispute.daysRemaining <= 7 
                        ? 'bg-red-50 border border-red-200' 
                        : dispute.daysRemaining <= 14
                        ? 'bg-yellow-50 border border-yellow-200'
                        : 'bg-green-50 border border-green-200'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`
                        h-10 w-10 rounded-full flex items-center justify-center font-bold
                        ${dispute.daysRemaining <= 7 
                          ? 'bg-red-100 text-red-600' 
                          : dispute.daysRemaining <= 14
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-green-100 text-green-600'
                        }
                      `}>
                        {dispute.daysRemaining}
                      </div>
                      <div>
                        <div className="font-medium capitalize">{dispute.bureau}</div>
                        <div className="text-xs text-muted-foreground">
                          Deadline: {format(new Date(dispute.responseDeadline!), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                    <Badge variant={
                      dispute.daysRemaining <= 7 ? 'destructive' :
                      dispute.daysRemaining <= 14 ? 'secondary' : 'default'
                    }>
                      {dispute.daysRemaining} days left
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bureau Status */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Bureau Status
            </h3>
            <div className="grid md:grid-cols-3 gap-3">
              {bureauInsights.map(insight => (
                <div
                  key={insight.bureau}
                  className={`
                    p-3 rounded-lg border
                    ${insight.bureau === 'transunion' ? 'bg-blue-50/50 border-blue-200' :
                      insight.bureau === 'equifax' ? 'bg-red-50/50 border-red-200' :
                      'bg-purple-50/50 border-purple-200'
                    }
                  `}
                >
                  <div className="font-medium capitalize mb-2">{insight.bureau}</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-muted-foreground">Mailed</div>
                      <div className="font-medium">{insight.mailed}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Pending</div>
                      <div className="font-medium">{insight.pending}</div>
                    </div>
                  </div>
                  {insight.lastMailed && (
                    <div className="text-xs text-muted-foreground mt-2">
                      Last mailed: {format(insight.lastMailed, 'MMM d')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4" />
            Smart Scheduling Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="font-medium">Mail Early in the Week</div>
                <div className="text-muted-foreground">
                  Tuesday-Wednesday arrivals get processed faster than weekend mail
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="font-medium">Avoid Month-End</div>
                <div className="text-muted-foreground">
                  Bureau staff are busiest at month-end; mid-month gets more attention
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <div className="font-medium">Stagger Bureau Letters</div>
                <div className="text-muted-foreground">
                  Send to different bureaus 2-3 days apart for better tracking
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <div className="font-medium">Track the 30-Day Clock</div>
                <div className="text-muted-foreground">
                  Bureaus must respond within 30 days - mark your calendar!
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Calculate a score for a potential mailing date
 */
function calculateDateScore(date: Date, existingLetters: DisputeLetter[]): { score: number; reasons: string[] } {
  let score = 70; // Base score
  const reasons: string[] = [];

  // Factor 1: Day of week (Tuesday-Thursday best)
  const dayOfWeek = date.getDay();
  if (dayOfWeek >= 2 && dayOfWeek <= 4) {
    score += 15;
    reasons.push('Optimal day of week');
  } else if (isWeekend(date)) {
    score -= 20;
    reasons.push('Weekend - slower processing');
  } else {
    score += 5;
    reasons.push('Acceptable day');
  }

  // Factor 2: Time of month (mid-month best)
  const dayOfMonth = date.getDate();
  if (dayOfMonth >= 10 && dayOfMonth <= 20) {
    score += 10;
    reasons.push('Mid-month timing');
  } else if (dayOfMonth >= 25 || dayOfMonth <= 5) {
    score -= 5;
    reasons.push('Month boundary');
  }

  // Factor 3: Not too close to existing mailings
  const recentMailings = existingLetters.filter(l => {
    if (!l.mailedAt) return false;
    const mailedDate = new Date(l.mailedAt);
    const daysDiff = Math.abs((date.getTime() - mailedDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff < 3;
  });

  if (recentMailings.length === 0) {
    score += 5;
    reasons.push('Good spacing from other letters');
  } else {
    score -= 10;
    reasons.push('Close to other mailings');
  }

  // Factor 4: Lead time (not too soon, not too far)
  const daysFromNow = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (daysFromNow >= 2 && daysFromNow <= 5) {
    score += 5;
    reasons.push('Good preparation time');
  }

  return { score: Math.max(0, Math.min(100, score)), reasons };
}
