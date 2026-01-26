import React, { useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { TrendingUp, TrendingDown, BarChart3, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

// Mock data for chart if no real data is available
const MOCK_SCORE_HISTORY = [
  { date: '2023-01-01', score: 620 },
  { date: '2023-02-01', score: 625 },
  { date: '2023-03-01', score: 635 },
  { date: '2023-04-01', score: 640 },
  { date: '2023-05-01', score: 655 },
  { date: '2023-06-01', score: 660 },
];

interface ScoreEntry {
  date: string;
  score: number;
}

export default function ScoreTracker() {
  // Fetch historical score data
  const { data: scoreHistory = [], isLoading } = trpc.scoreHistory.list.useQuery();
  
  const dataToDisplay: ScoreEntry[] = useMemo(() => {
    if (scoreHistory.length > 0) {
      // Assuming scoreHistory is an array of { date: Date, score: number }
      return scoreHistory.map(item => ({
        date: format(new Date(item.date), 'MMM dd'),
        score: item.score,
      }));
    }
    return MOCK_SCORE_HISTORY.map(item => ({
      ...item,
      date: format(new Date(item.date), 'MMM dd'),
    }));
  }, [scoreHistory]);

  const latestScore = dataToDisplay[dataToDisplay.length - 1]?.score || 0;
  const initialScore = dataToDisplay[0]?.score || 0;
  const scoreChange = latestScore - initialScore;

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Score Tracker</h1>
        <p className="text-muted-foreground">Monitor your credit score progress over time.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Latest Score</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{latestScore || '---'}</div>
              <p className="text-xs text-muted-foreground">
                As of {dataToDisplay.length > 0 ? dataToDisplay[dataToDisplay.length - 1].date : 'N/A'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Change</CardTitle>
              {scoreChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${scoreChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {scoreChange > 0 ? '+' : ''}{scoreChange} Points
              </div>
              <p className="text-xs text-muted-foreground">
                Since {dataToDisplay.length > 0 ? dataToDisplay[0].date : 'N/A'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Update</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">~30 Days</div>
              <p className="text-xs text-muted-foreground">
                After each dispute round completion
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Score History Chart</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-80 flex items-center justify-center text-gray-500">Loading chart data...</div>
            ) : (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dataToDisplay}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis domain={['auto', 850]} stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
                      labelFormatter={(label) => `Date: ${label}`}
                      formatter={(value: number) => [`Score: ${value}`, 'Score']}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#3b82f6" 
                      strokeWidth={2} 
                      dot={{ r: 4 }} 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
