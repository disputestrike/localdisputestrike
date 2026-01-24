import React from 'react';
import { trpc } from '../lib/trpc';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Target, 
  Award, 
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Shield,
  AlertTriangle,
  FileText,
  Scale
} from 'lucide-react';

// Category colors for charts
const CATEGORY_COLORS: Record<string, string> = {
  date_timeline: '#3B82F6',      // Blue
  balance_payment: '#10B981',    // Green
  creditor_ownership: '#F59E0B', // Amber
  status_classification: '#8B5CF6', // Purple
  account_identification: '#EC4899', // Pink
  legal_procedural: '#EF4444',   // Red
  statistical_pattern: '#06B6D4', // Cyan
};

// Category display names
const CATEGORY_NAMES: Record<string, string> = {
  date_timeline: 'Date & Timeline',
  balance_payment: 'Balance & Payment',
  creditor_ownership: 'Creditor & Ownership',
  status_classification: 'Status & Classification',
  account_identification: 'Account Identification',
  legal_procedural: 'Legal & Procedural',
  statistical_pattern: 'Statistical & Pattern',
};

// Method names for the 43 methods
const METHOD_NAMES: Record<number, string> = {
  1: 'Date Opened Discrepancy',
  2: 'Last Activity Date Conflict',
  3: 'Last Payment Date Mismatch',
  4: 'Date Reported Inconsistency',
  5: 'Account Age Discrepancy',
  6: 'Delinquency Date Conflict',
  7: 'Charge-off Date Mismatch',
  8: 'Collection Date Discrepancy',
  9: 'Statute of Limitations Expired',
  10: 'Re-aging Detection',
  11: 'Impossible Timeline',
  12: 'Future Date Reporting',
  13: 'Retroactive Reporting',
  14: 'Date Sequence Violation',
  15: 'Reporting Period Exceeded',
  16: 'Balance Discrepancy',
  17: 'High Credit Mismatch',
  18: 'Credit Limit Conflict',
  19: 'Past Due Amount Discrepancy',
  20: 'Payment Amount Mismatch',
  21: 'Payment History Conflict',
  22: 'Balance Increase After Charge-off',
  23: 'Phantom Balance',
  24: 'Creditor Name Mismatch',
  25: 'Original Creditor Conflict',
  26: 'Account Ownership Dispute',
  27: 'Debt Buyer Chain Break',
  28: 'Unauthorized Account Transfer',
  29: 'Account Status Conflict',
  30: 'Payment Status Mismatch',
  31: 'Account Type Discrepancy',
  32: 'Dispute Status Conflict',
  33: 'Closed Account Reporting Active',
  34: 'Paid Account Showing Balance',
  35: 'Account Number Mismatch',
  36: 'Duplicate Account Detection',
  37: 'FCRA Violation Detection',
  38: 'FDCPA Violation Detection',
  39: 'Statistical Outlier Detection',
  40: 'Pattern Recognition Anomaly',
  41: 'Cross-Bureau Conflict Score',
  42: 'Deletion Probability Analysis',
  43: 'Metro 2 Format Violation',
};

export function MethodsAnalyticsDashboard() {
  const { data, isLoading, error } = trpc.admin.getMethodAnalytics.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error loading analytics: {error.message}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data Yet</h3>
        <p className="text-gray-500">
          Analytics will appear here once users start generating dispute letters.
        </p>
      </div>
    );
  }

  const { stats, byCategory, topMethods, trends, summary } = data;

  // Prepare pie chart data for categories
  const categoryPieData = byCategory.map(cat => ({
    name: CATEGORY_NAMES[cat.category] || cat.category,
    value: cat.triggerCount,
    color: CATEGORY_COLORS[cat.category] || '#6B7280',
  }));

  // Prepare bar chart data for top methods
  const topMethodsBarData = topMethods.map(m => ({
    name: METHOD_NAMES[m.methodNumber] || `Method ${m.methodNumber}`,
    triggers: m.triggerCount,
    successRate: m.successRate,
    methodNumber: m.methodNumber,
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Triggers</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalTriggers.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Deletions Achieved</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalDeletions.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <Target className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{summary.overallSuccessRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Methods Used</p>
              <p className="text-2xl font-bold text-gray-900">{summary.uniqueMethods} / 43</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Methods Bar Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Triggered Methods</h3>
          {topMethodsBarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topMethodsBarData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={150}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'triggers' ? `${value} triggers` : `${value}%`,
                    name === 'triggers' ? 'Triggers' : 'Success Rate'
                  ]}
                />
                <Bar dataKey="triggers" fill="#3B82F6" name="triggers" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No method triggers recorded yet
            </div>
          )}
        </div>

        {/* Category Distribution Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Triggers by Category</h3>
          {categoryPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value} triggers`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No category data yet
            </div>
          )}
        </div>
      </div>

      {/* Trends Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Method Triggers Over Time (Last 30 Days)</h3>
        {trends.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="triggerCount" 
                stroke="#3B82F6" 
                name="Total Triggers"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="deletionCount" 
                stroke="#10B981" 
                name="Deletions"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            No trend data available yet
          </div>
        )}
      </div>

      {/* Methods Summary (IP Protected) */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detection Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Triggers</p>
            <p className="text-2xl font-bold text-blue-600">{stats.reduce((sum, s) => sum + (s.triggerCount || 0), 0)}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Successful Deletions</p>
            <p className="text-2xl font-bold text-green-600">{stats.reduce((sum, s) => sum + (s.deletionCount || 0), 0)}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Average Success Rate</p>
            <p className="text-2xl font-bold text-purple-600">{stats.length > 0 ? Math.round(stats.reduce((sum, s) => sum + (s.successRate || 0), 0) / stats.length) : 0}%</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4">Detailed method information is proprietary and not displayed for security reasons.</p>
      </div>

      {/* Category Legend */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Reference</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(CATEGORY_NAMES).map(([key, name]) => (
            <div key={key} className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: CATEGORY_COLORS[key] }}
              />
              <div>
                <p className="text-sm font-medium text-gray-900">{name}</p>
                <p className="text-xs text-gray-500">
                  Methods {getCategoryMethodRange(key)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper function to get default category based on method number
function getDefaultCategory(methodNum: number): string {
  if (methodNum <= 15) return 'date_timeline';
  if (methodNum <= 23) return 'balance_payment';
  if (methodNum <= 28) return 'creditor_ownership';
  if (methodNum <= 34) return 'status_classification';
  if (methodNum <= 36) return 'account_identification';
  if (methodNum <= 38) return 'legal_procedural';
  return 'statistical_pattern';
}

// Helper function to get method range for each category
function getCategoryMethodRange(category: string): string {
  switch (category) {
    case 'date_timeline': return '1-15';
    case 'balance_payment': return '16-23';
    case 'creditor_ownership': return '24-28';
    case 'status_classification': return '29-34';
    case 'account_identification': return '35-36';
    case 'legal_procedural': return '37-38';
    case 'statistical_pattern': return '39-43';
    default: return '';
  }
}

export default MethodsAnalyticsDashboard;
