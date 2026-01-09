import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Target,
  Award,
  ChevronUp,
  ChevronDown,
  Minus
} from "lucide-react";

interface ScoreDataPoint {
  date: string;
  score: number;
  bureau?: string;
  event?: string;
}

interface CreditScoreChartProps {
  scoreHistory?: ScoreDataPoint[];
  currentScore?: number;
  targetScore?: number;
}

export function CreditScoreChart({ 
  scoreHistory = [], 
  currentScore = 0,
  targetScore = 750 
}: CreditScoreChartProps) {
  const [timeRange, setTimeRange] = useState<'3m' | '6m' | '1y' | 'all'>('6m');

  // Generate sample data if none provided
  const chartData = useMemo(() => {
    if (scoreHistory.length > 0) return scoreHistory;
    
    // Generate realistic sample data showing improvement over time
    const today = new Date();
    const data: ScoreDataPoint[] = [];
    
    // Start 12 months ago with a lower score
    let baseScore = currentScore > 0 ? currentScore - 85 : 580;
    
    for (let i = 12; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);
      
      // Simulate gradual improvement with some variation
      const improvement = Math.floor((12 - i) * 7) + Math.floor(Math.random() * 10) - 5;
      const score = Math.min(850, Math.max(300, baseScore + improvement));
      
      data.push({
        date: date.toISOString().split('T')[0],
        score,
        event: i === 9 ? 'Started disputes' : 
               i === 6 ? '15 accounts deleted' : 
               i === 3 ? '8 more deleted' : undefined
      });
    }
    
    return data;
  }, [scoreHistory, currentScore]);

  // Filter data based on time range
  const filteredData = useMemo(() => {
    const now = new Date();
    const cutoff = new Date();
    
    switch (timeRange) {
      case '3m':
        cutoff.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        cutoff.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        cutoff.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return chartData;
    }
    
    return chartData.filter(d => new Date(d.date) >= cutoff);
  }, [chartData, timeRange]);

  // Calculate stats
  const firstScore = filteredData[0]?.score || 0;
  const lastScore = filteredData[filteredData.length - 1]?.score || currentScore || 0;
  const scoreChange = lastScore - firstScore;
  const percentChange = firstScore > 0 ? ((scoreChange / firstScore) * 100).toFixed(1) : 0;
  
  // Find min and max for chart scaling
  const minScore = Math.min(...filteredData.map(d => d.score)) - 20;
  const maxScore = Math.max(...filteredData.map(d => d.score)) + 20;
  const scoreRange = maxScore - minScore;

  // Get score rating
  const getScoreRating = (score: number) => {
    if (score >= 800) return { label: 'Exceptional', color: 'text-emerald-600', bg: 'bg-emerald-100' };
    if (score >= 740) return { label: 'Very Good', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 670) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 580) return { label: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: 'Poor', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const currentRating = getScoreRating(lastScore);
  const targetRating = getScoreRating(targetScore);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Credit Score Tracker
            </CardTitle>
            <CardDescription>
              Track your credit score improvement over time
            </CardDescription>
          </div>
          <div className="flex gap-1">
            {(['3m', '6m', '1y', 'all'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="px-3"
              >
                {range === 'all' ? 'All' : range.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Score Display */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border">
            <div className="text-sm text-muted-foreground mb-1">Current Score</div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold">{lastScore}</span>
              <Badge className={`${currentRating.bg} ${currentRating.color} mb-1`}>
                {currentRating.label}
              </Badge>
            </div>
          </div>
          
          <div className="p-4 bg-muted/50 rounded-lg border">
            <div className="text-sm text-muted-foreground mb-1">Change ({timeRange})</div>
            <div className="flex items-center gap-2">
              {scoreChange > 0 ? (
                <ChevronUp className="h-6 w-6 text-green-500" />
              ) : scoreChange < 0 ? (
                <ChevronDown className="h-6 w-6 text-red-500" />
              ) : (
                <Minus className="h-6 w-6 text-gray-500" />
              )}
              <span className={`text-3xl font-bold ${
                scoreChange > 0 ? 'text-green-600' : 
                scoreChange < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {scoreChange > 0 ? '+' : ''}{scoreChange}
              </span>
              <span className="text-sm text-muted-foreground">
                ({percentChange}%)
              </span>
            </div>
          </div>
          
          <div className="p-4 bg-muted/50 rounded-lg border">
            <div className="text-sm text-muted-foreground mb-1">Target Score</div>
            <div className="flex items-end gap-2">
              <Target className="h-5 w-5 text-primary" />
              <span className="text-3xl font-bold">{targetScore}</span>
              <Badge className={`${targetRating.bg} ${targetRating.color} mb-1`}>
                {targetRating.label}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {targetScore - lastScore > 0 ? `${targetScore - lastScore} points to go` : 'Target reached! 🎉'}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="relative h-64 w-full">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-muted-foreground">
            <span>{maxScore}</span>
            <span>{Math.round((maxScore + minScore) / 2)}</span>
            <span>{minScore}</span>
          </div>
          
          {/* Chart area */}
          <div className="absolute left-14 right-0 top-0 bottom-8 border-l border-b border-muted">
            {/* Target line */}
            <div 
              className="absolute left-0 right-0 border-t-2 border-dashed border-primary/40"
              style={{ 
                bottom: `${((targetScore - minScore) / scoreRange) * 100}%` 
              }}
            >
              <span className="absolute right-0 -top-3 text-xs text-primary bg-background px-1">
                Target: {targetScore}
              </span>
            </div>
            
            {/* Score line chart */}
            <svg className="w-full h-full" preserveAspectRatio="none">
              {/* Gradient fill */}
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="rgb(34, 197, 94)" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* Area fill */}
              <path
                d={`
                  M 0 ${100 - ((filteredData[0]?.score - minScore) / scoreRange) * 100}%
                  ${filteredData.map((d, i) => {
                    const x = (i / (filteredData.length - 1)) * 100;
                    const y = 100 - ((d.score - minScore) / scoreRange) * 100;
                    return `L ${x}% ${y}%`;
                  }).join(' ')}
                  L 100% 100%
                  L 0 100%
                  Z
                `}
                fill="url(#scoreGradient)"
              />
              
              {/* Line */}
              <path
                d={`
                  M 0 ${100 - ((filteredData[0]?.score - minScore) / scoreRange) * 100}%
                  ${filteredData.map((d, i) => {
                    const x = (i / (filteredData.length - 1)) * 100;
                    const y = 100 - ((d.score - minScore) / scoreRange) * 100;
                    return `L ${x}% ${y}%`;
                  }).join(' ')}
                `}
                fill="none"
                stroke="rgb(34, 197, 94)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Data points */}
              {filteredData.map((d, i) => {
                const x = (i / (filteredData.length - 1)) * 100;
                const y = 100 - ((d.score - minScore) / scoreRange) * 100;
                return (
                  <g key={i}>
                    <circle
                      cx={`${x}%`}
                      cy={`${y}%`}
                      r="4"
                      fill="white"
                      stroke="rgb(34, 197, 94)"
                      strokeWidth="2"
                    />
                    {d.event && (
                      <g>
                        <circle
                          cx={`${x}%`}
                          cy={`${y}%`}
                          r="8"
                          fill="rgb(34, 197, 94)"
                          opacity="0.3"
                        />
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
          
          {/* X-axis labels */}
          <div className="absolute left-14 right-0 bottom-0 h-8 flex justify-between text-xs text-muted-foreground">
            {filteredData.filter((_, i) => i % Math.ceil(filteredData.length / 5) === 0 || i === filteredData.length - 1).map((d, i) => (
              <span key={i}>
                {new Date(d.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
              </span>
            ))}
          </div>
        </div>

        {/* Events Timeline */}
        {filteredData.some(d => d.event) && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Key Events
            </h4>
            <div className="space-y-2">
              {filteredData.filter(d => d.event).map((d, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-muted-foreground">
                    {new Date(d.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <span className="font-medium">{d.event}</span>
                  <Badge variant="outline" className="ml-auto">
                    Score: {d.score}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress to Target */}
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress to Target</span>
            <span className="text-sm text-muted-foreground">
              {lastScore} / {targetScore}
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (lastScore / targetScore) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>300</span>
            <span>500</span>
            <span>670</span>
            <span>740</span>
            <span>850</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
