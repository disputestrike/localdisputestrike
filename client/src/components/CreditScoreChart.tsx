import { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Target,
  Award,
  ChevronUp,
  ChevronDown,
  Minus,
  Download,
  Plus,
  FileText
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
  scoreHistory: propScoreHistory = [], 
  currentScore: propCurrentScore = 0,
  targetScore = 750 
}: CreditScoreChartProps) {
  const [timeRange, setTimeRange] = useState<'3m' | '6m' | '1y' | 'all'>('6m');
  const [showAddScoreModal, setShowAddScoreModal] = useState(false);
  const [newScoreBureau, setNewScoreBureau] = useState<'transunion' | 'equifax' | 'experian'>('transunion');
  const [newScoreValue, setNewScoreValue] = useState('');
  const [newScoreModel, setNewScoreModel] = useState('');
  const chartRef = useRef<HTMLDivElement>(null);

  // Fetch real score history from database
  const { data: dbScoreHistory, refetch: refetchHistory } = trpc.scoreHistory.list.useQuery();
  const { data: latestScores } = trpc.scoreHistory.latest.useQuery();
  const recordScoreMutation = trpc.scoreHistory.record.useMutation({
    onSuccess: () => {
      toast.success('Credit score recorded!');
      refetchHistory();
      setShowAddScoreModal(false);
      setNewScoreValue('');
    },
    onError: (error) => {
      toast.error(`Failed to record score: ${error.message}`);
    }
  });

  // Convert database history to chart format
  const scoreHistory = useMemo(() => {
    if (dbScoreHistory && dbScoreHistory.length > 0) {
      return dbScoreHistory.map(entry => ({
        date: new Date(entry.recordedAt).toISOString().split('T')[0],
        score: entry.score,
        bureau: entry.bureau,
        event: entry.event || undefined,
      }));
    }
    return propScoreHistory;
  }, [dbScoreHistory, propScoreHistory]);

  // Get current score from latest data
  const currentScore = useMemo(() => {
    if (latestScores) {
      const scores = [
        latestScores.transunion?.score,
        latestScores.equifax?.score,
        latestScores.experian?.score,
      ].filter(Boolean) as number[];
      if (scores.length > 0) {
        return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      }
    }
    return propCurrentScore;
  }, [latestScores, propCurrentScore]);

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

  // Handle adding new score
  const handleAddScore = () => {
    const score = parseInt(newScoreValue);
    if (isNaN(score) || score < 300 || score > 850) {
      toast.error('Please enter a valid score between 300 and 850');
      return;
    }
    recordScoreMutation.mutate({
      bureau: newScoreBureau,
      score,
      scoreModel: newScoreModel || undefined,
    });
  };

  // Generate PDF report
  const generatePDFReport = () => {
    // Create printable content
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Credit Score Report - DisputeStrike</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
          h2 { color: #374151; margin-top: 30px; }
          .score-box { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .score-large { font-size: 48px; font-weight: bold; color: #1e40af; }
          .rating { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 14px; }
          .rating-good { background: #dcfce7; color: #166534; }
          .rating-fair { background: #fef9c3; color: #854d0e; }
          .rating-poor { background: #fee2e2; color: #991b1b; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #d1d5db; padding: 12px; text-align: left; }
          th { background: #f3f4f6; }
          .positive { color: #166534; }
          .negative { color: #991b1b; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #d1d5db; font-size: 12px; color: #6b7280; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>Credit Score Progress Report</h1>
        <p>Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        
        <div class="score-box">
          <div>Current Credit Score</div>
          <div class="score-large">${lastScore}</div>
          <span class="rating ${lastScore >= 670 ? 'rating-good' : lastScore >= 580 ? 'rating-fair' : 'rating-poor'}">
            ${currentRating.label}
          </span>
        </div>

        <h2>Score Summary</h2>
        <table>
          <tr>
            <th>Metric</th>
            <th>Value</th>
          </tr>
          <tr>
            <td>Starting Score</td>
            <td>${firstScore}</td>
          </tr>
          <tr>
            <td>Current Score</td>
            <td>${lastScore}</td>
          </tr>
          <tr>
            <td>Total Change</td>
            <td class="${scoreChange >= 0 ? 'positive' : 'negative'}">${scoreChange >= 0 ? '+' : ''}${scoreChange} points</td>
          </tr>
          <tr>
            <td>Percentage Change</td>
            <td class="${scoreChange >= 0 ? 'positive' : 'negative'}">${scoreChange >= 0 ? '+' : ''}${percentChange}%</td>
          </tr>
          <tr>
            <td>Target Score</td>
            <td>${targetScore}</td>
          </tr>
          <tr>
            <td>Points to Target</td>
            <td>${Math.max(0, targetScore - lastScore)}</td>
          </tr>
        </table>

        <h2>Score History</h2>
        <table>
          <tr>
            <th>Date</th>
            <th>Score</th>
            <th>Bureau</th>
            <th>Event</th>
          </tr>
          ${filteredData.map(d => `
            <tr>
              <td>${new Date(d.date).toLocaleDateString()}</td>
              <td>${d.score}</td>
              <td>${d.bureau || 'N/A'}</td>
              <td>${d.event || '-'}</td>
            </tr>
          `).join('')}
        </table>

        ${latestScores ? `
        <h2>Bureau Breakdown</h2>
        <table>
          <tr>
            <th>Bureau</th>
            <th>Score</th>
            <th>Last Updated</th>
          </tr>
          ${latestScores.transunion ? `
          <tr>
            <td>TransUnion</td>
            <td>${latestScores.transunion.score}</td>
            <td>${new Date(latestScores.transunion.recordedAt).toLocaleDateString()}</td>
          </tr>
          ` : ''}
          ${latestScores.equifax ? `
          <tr>
            <td>Equifax</td>
            <td>${latestScores.equifax.score}</td>
            <td>${new Date(latestScores.equifax.recordedAt).toLocaleDateString()}</td>
          </tr>
          ` : ''}
          ${latestScores.experian ? `
          <tr>
            <td>Experian</td>
            <td>${latestScores.experian.score}</td>
            <td>${new Date(latestScores.experian.recordedAt).toLocaleDateString()}</td>
          </tr>
          ` : ''}
        </table>
        ` : ''}

        <div class="footer">
          <p>This report was generated by DisputeStrike - Professional Credit Dispute Automation</p>
          <p>For educational purposes only. Not financial advice.</p>
        </div>
      </body>
      </html>
    `;

    // Open in new window and print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
    toast.success('PDF report generated! Use your browser\'s print dialog to save as PDF.');
  };

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
          <div className="flex gap-2">
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
            
            {/* Add Score Button */}
            <Dialog open={showAddScoreModal} onOpenChange={setShowAddScoreModal}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Score
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Credit Score</DialogTitle>
                  <DialogDescription>
                    Manually add a credit score from your credit monitoring service
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Bureau</Label>
                    <Select value={newScoreBureau} onValueChange={(v: any) => setNewScoreBureau(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="transunion">TransUnion</SelectItem>
                        <SelectItem value="equifax">Equifax</SelectItem>
                        <SelectItem value="experian">Experian</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Score (300-850)</Label>
                    <Input
                      type="number"
                      min="300"
                      max="850"
                      value={newScoreValue}
                      onChange={(e) => setNewScoreValue(e.target.value)}
                      placeholder="Enter your credit score"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Score Model (optional)</Label>
                    <Select value={newScoreModel} onValueChange={setNewScoreModel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select score model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FICO 8">FICO 8</SelectItem>
                        <SelectItem value="FICO 9">FICO 9</SelectItem>
                        <SelectItem value="VantageScore 3.0">VantageScore 3.0</SelectItem>
                        <SelectItem value="VantageScore 4.0">VantageScore 4.0</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handleAddScore} 
                    className="w-full"
                    disabled={recordScoreMutation.isPending}
                  >
                    {recordScoreMutation.isPending ? 'Saving...' : 'Save Score'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Export PDF Button */}
            <Button variant="outline" size="sm" onClick={generatePDFReport}>
              <Download className="h-4 w-4 mr-1" />
              Export PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6" ref={chartRef}>
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

        {/* Bureau Breakdown */}
        {latestScores && (latestScores.transunion || latestScores.equifax || latestScores.experian) && (
          <div className="grid md:grid-cols-3 gap-4">
            {latestScores.transunion && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-xs text-blue-600 font-medium">TransUnion</div>
                <div className="text-2xl font-bold text-blue-700">{latestScores.transunion.score}</div>
                <div className="text-xs text-blue-500">
                  {new Date(latestScores.transunion.recordedAt).toLocaleDateString()}
                </div>
              </div>
            )}
            {latestScores.equifax && (
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="text-xs text-red-600 font-medium">Equifax</div>
                <div className="text-2xl font-bold text-red-700">{latestScores.equifax.score}</div>
                <div className="text-xs text-red-500">
                  {new Date(latestScores.equifax.recordedAt).toLocaleDateString()}
                </div>
              </div>
            )}
            {latestScores.experian && (
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-xs text-purple-600 font-medium">Experian</div>
                <div className="text-2xl font-bold text-purple-700">{latestScores.experian.score}</div>
                <div className="text-xs text-purple-500">
                  {new Date(latestScores.experian.recordedAt).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        )}

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
