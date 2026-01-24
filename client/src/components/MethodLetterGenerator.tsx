import React, { useState } from 'react';
import { trpc } from '../lib/trpc';
import { 
  FileText, 
  Download, 
  AlertTriangle, 
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Zap,
  Scale,
  Shield
} from 'lucide-react';

// Category colors
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  date_timeline: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  balance_payment: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  creditor_ownership: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  status_classification: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  account_identification: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  legal_procedural: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  statistical_pattern: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
};

// Category names
const CATEGORY_NAMES: Record<string, string> = {
  date_timeline: 'Date & Timeline',
  balance_payment: 'Balance & Payment',
  creditor_ownership: 'Creditor & Ownership',
  status_classification: 'Status & Classification',
  account_identification: 'Account Identification',
  legal_procedural: 'Legal & Procedural',
  statistical_pattern: 'Statistical & Pattern',
};

// Severity badges
const SEVERITY_BADGES: Record<string, { bg: string; text: string }> = {
  critical: { bg: 'bg-red-100', text: 'text-red-800' },
  high: { bg: 'bg-orange-100', text: 'text-orange-800' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  low: { bg: 'bg-gray-100', text: 'text-gray-800' },
};

interface MethodLetterGeneratorProps {
  accountId?: number;
  accountName?: string;
  bureau?: 'transunion' | 'equifax' | 'experian';
  preSelectedMethod?: number;
  onLetterGenerated?: (letterId: number) => void;
}

export function MethodLetterGenerator({
  accountId,
  accountName,
  bureau = 'transunion',
  preSelectedMethod,
  onLetterGenerated,
}: MethodLetterGeneratorProps) {
  const [selectedMethod, setSelectedMethod] = useState<number | null>(preSelectedMethod || null);
  const [selectedBureau, setSelectedBureau] = useState(bureau);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [accountData, setAccountData] = useState<Record<string, string>>({});
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);
  
  // Fetch all method templates
  const { data: templates, isLoading } = trpc.disputeLetters.getMethodTemplates.useQuery();
  
  // Generate letter mutation
  const generateMutation = trpc.disputeLetters.generateMethodSpecificLetter.useMutation({
    onSuccess: (data) => {
      setGeneratedLetter(`Letter generated successfully! Method: ${data.methodName}`);
      if (onLetterGenerated) {
        onLetterGenerated(data.letterId);
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Group templates by category
  const templatesByCategory = templates?.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, typeof templates>);

  const selectedTemplate = templates?.find(t => t.methodNumber === selectedMethod);

  const handleGenerate = () => {
    if (!selectedMethod || !selectedTemplate) return;
    
    generateMutation.mutate({
      methodNumber: selectedMethod,
      bureau: selectedBureau,
      accountId,
      accountData: {
        accountName: accountName || 'Unknown Account',
        ...accountData,
      },
      userAddress: accountData.userAddress || '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-6 text-white">
        <div className="flex items-center space-x-3">
          <Zap className="h-8 w-8" />
          <div>
            <h2 className="text-2xl font-bold">Method-Specific Letter Generator</h2>
            <p className="text-orange-100">
              Generate specialized dispute letters based on your credit violations
            </p>
          </div>
        </div>
      </div>

      {/* Bureau Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Bureau</h3>
        <div className="grid grid-cols-3 gap-4">
          {(['transunion', 'equifax', 'experian'] as const).map((b) => (
            <button
              key={b}
              onClick={() => setSelectedBureau(b)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedBureau === b
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="font-medium capitalize">{b}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Method Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Detection Method</h3>
        <p className="text-sm text-gray-500 mb-4">
          Choose the specific violation type to generate a specialized dispute letter
        </p>
        
        <div className="space-y-4">
          {templatesByCategory && Object.entries(templatesByCategory).map(([category, methods]) => (
            <div key={category} className={`border rounded-lg ${CATEGORY_COLORS[category]?.border || 'border-gray-200'}`}>
              <button
                onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                className={`w-full p-4 flex items-center justify-between ${CATEGORY_COLORS[category]?.bg || 'bg-gray-50'} rounded-t-lg`}
              >
                <div className="flex items-center space-x-3">
                  <span className={`font-semibold ${CATEGORY_COLORS[category]?.text || 'text-gray-700'}`}>
                    {CATEGORY_NAMES[category] || category}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({methods?.length || 0} methods)
                  </span>
                </div>
                {expandedCategory === category ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
              
              {expandedCategory === category && (
                <div className="p-4 space-y-2">
                  {methods?.map((method) => (
                    <button
                      key={method.methodNumber}
                      onClick={() => setSelectedMethod(method.methodNumber)}
                      className={`w-full p-4 rounded-lg border text-left transition-all ${
                        selectedMethod === method.methodNumber
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">
                              #{method.methodNumber}: {method.methodName}
                            </span>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              SEVERITY_BADGES[method.severity]?.bg || 'bg-gray-100'
                            } ${SEVERITY_BADGES[method.severity]?.text || 'text-gray-800'}`}>
                              {method.severity.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            FCRA {method.fcraViolation}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {method.deletionProbability}%
                          </div>
                          <div className="text-xs text-gray-500">deletion rate</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Method Details */}
      {selectedTemplate && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Selected: #{selectedTemplate.methodNumber} - {selectedTemplate.methodName}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Legal Basis</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                {selectedTemplate.legalBasis}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Demand Language</h4>
              <p className="text-sm text-gray-600 bg-orange-50 p-3 rounded font-medium">
                {selectedTemplate.demandLanguage}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Evidence Required</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {selectedTemplate.evidenceRequired.map((evidence, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{evidence}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Escalation Path</h4>
              <p className="text-sm text-gray-600 bg-red-50 p-3 rounded">
                <AlertTriangle className="h-4 w-4 text-red-500 inline mr-2" />
                {selectedTemplate.escalationPath}
              </p>
            </div>
          </div>

          {/* Account Data Input */}
          <div className="mt-6">
            <h4 className="font-medium text-gray-700 mb-3">Account Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Address
                </label>
                <input
                  type="text"
                  value={accountData.userAddress || ''}
                  onChange={(e) => setAccountData({ ...accountData, userAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  placeholder="123 Main St, City, State ZIP"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  value={accountData.accountName || accountName || ''}
                  onChange={(e) => setAccountData({ ...accountData, accountName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Creditor/Collection Agency Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bureau 1 Value
                </label>
                <input
                  type="text"
                  value={accountData.date1 || ''}
                  onChange={(e) => setAccountData({ ...accountData, date1: e.target.value, bureau1: 'TransUnion' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Value from TransUnion"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bureau 2 Value
                </label>
                <input
                  type="text"
                  value={accountData.date2 || ''}
                  onChange={(e) => setAccountData({ ...accountData, date2: e.target.value, bureau2: 'Equifax' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Value from Equifax"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bureau 3 Value
                </label>
                <input
                  type="text"
                  value={accountData.date3 || ''}
                  onChange={(e) => setAccountData({ ...accountData, date3: e.target.value, bureau3: 'Experian' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Value from Experian"
                />
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={generateMutation.isPending || !accountData.userAddress}
              className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {generateMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5" />
                  <span>Generate Specialized Letter</span>
                </>
              )}
            </button>
          </div>

          {/* Success Message */}
          {generatedLetter && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-700 font-medium">{generatedLetter}</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {generateMutation.isError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="text-red-700">
                  Error: {generateMutation.error?.message || 'Failed to generate letter'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Method Quick Reference */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Reference: Top 10 Most Effective Methods</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deletion Rate</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {templates
                ?.sort((a, b) => b.deletionProbability - a.deletionProbability)
                .slice(0, 10)
                .map((method) => (
                  <tr 
                    key={method.methodNumber} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedMethod(method.methodNumber);
                      setExpandedCategory(method.category);
                    }}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {method.methodNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {method.methodName}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${method.deletionProbability}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-green-600">
                          {method.deletionProbability}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        SEVERITY_BADGES[method.severity]?.bg || 'bg-gray-100'
                      } ${SEVERITY_BADGES[method.severity]?.text || 'text-gray-800'}`}>
                        {method.severity.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default MethodLetterGenerator;
