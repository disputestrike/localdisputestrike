/**
 * Response Upload Page
 * 
 * Allows users to upload bureau response letters
 * AI analyzes responses to determine outcomes (deleted, verified, updated, no response)
 * Uploading responses unlocks the next round early
 */

import { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  X,
  ChevronRight,
  Unlock,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface UploadedResponse {
  bureau: 'transunion' | 'equifax' | 'experian';
  file: File | null;
  status: 'pending' | 'uploading' | 'analyzing' | 'complete' | 'error';
  results?: {
    itemsDeleted: number;
    itemsVerified: number;
    itemsUpdated: number;
    itemsNoResponse: number;
    details: {
      accountName: string;
      outcome: 'deleted' | 'verified' | 'updated' | 'no_response';
      notes?: string;
    }[];
  };
  error?: string;
}

const BUREAUS = [
  { id: 'transunion', name: 'TransUnion', color: 'blue' },
  { id: 'equifax', name: 'Equifax', color: 'red' },
  { id: 'experian', name: 'Experian', color: 'purple' },
] as const;

export default function ResponseUpload() {
  const navigate = useNavigate();
  const { roundId } = useParams();
  
  const [responses, setResponses] = useState<Record<string, UploadedResponse>>({
    transunion: { bureau: 'transunion', file: null, status: 'pending' },
    equifax: { bureau: 'equifax', file: null, status: 'pending' },
    experian: { bureau: 'experian', file: null, status: 'pending' },
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // Get round info
  const { data: roundInfo } = useQuery({
    queryKey: ['round', roundId],
    queryFn: async () => {
      const response = await fetch(`/api/rounds/${roundId}`);
      if (!response.ok) throw new Error('Failed to load round');
      return response.json();
    },
  });

  // Upload and analyze mutation
  const analyzeMutation = useMutation({
    mutationFn: async (bureau: string) => {
      const file = responses[bureau].file;
      if (!file) throw new Error('No file selected');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('bureau', bureau);
      formData.append('roundId', roundId || '');

      const response = await fetch('/api/responses/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Analysis failed');
      }

      return response.json();
    },
    onSuccess: (data, bureau) => {
      setResponses(prev => ({
        ...prev,
        [bureau]: {
          ...prev[bureau],
          status: 'complete',
          results: data.results,
        },
      }));
    },
    onError: (error: Error, bureau) => {
      setResponses(prev => ({
        ...prev,
        [bureau]: {
          ...prev[bureau],
          status: 'error',
          error: error.message,
        },
      }));
    },
  });

  // Complete upload mutation (unlocks next round)
  const completeUploadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/rounds/${roundId}/complete-responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transunion: responses.transunion.results,
          equifax: responses.equifax.results,
          experian: responses.experian.results,
        }),
      });

      if (!response.ok) throw new Error('Failed to complete');
      return response.json();
    },
    onSuccess: () => {
      navigate('/dashboard');
    },
  });

  const handleFileDrop = useCallback((bureau: string, acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setResponses(prev => ({
        ...prev,
        [bureau]: {
          ...prev[bureau],
          file: acceptedFiles[0],
          status: 'pending',
        },
      }));
    }
  }, []);

  const handleRemoveFile = (bureau: string) => {
    setResponses(prev => ({
      ...prev,
      [bureau]: {
        ...prev[bureau],
        file: null,
        status: 'pending',
        results: undefined,
      },
    }));
  };

  const handleAnalyzeAll = async () => {
    setIsAnalyzing(true);

    // Analyze each bureau that has a file
    for (const bureau of BUREAUS) {
      if (responses[bureau.id].file) {
        setResponses(prev => ({
          ...prev,
          [bureau.id]: { ...prev[bureau.id], status: 'analyzing' },
        }));
        await analyzeMutation.mutateAsync(bureau.id);
      }
    }

    setIsAnalyzing(false);
    setAnalysisComplete(true);
  };

  const hasAnyFile = Object.values(responses).some(r => r.file !== null);
  const hasAnyResults = Object.values(responses).some(r => r.results !== undefined);
  const allAnalyzed = Object.values(responses).every(r => !r.file || r.status === 'complete');

  // Calculate totals
  const totals = {
    deleted: 0,
    verified: 0,
    updated: 0,
    noResponse: 0,
  };

  Object.values(responses).forEach(r => {
    if (r.results) {
      totals.deleted += r.results.itemsDeleted;
      totals.verified += r.results.itemsVerified;
      totals.updated += r.results.itemsUpdated;
      totals.noResponse += r.results.itemsNoResponse;
    }
  });

  // File dropzone component
  const BureauUpload = ({ bureau }: { bureau: typeof BUREAUS[number] }) => {
    const response = responses[bureau.id];
    
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: (files) => handleFileDrop(bureau.id, files),
      accept: {
        'application/pdf': ['.pdf'],
        'image/*': ['.jpg', '.jpeg', '.png'],
      },
      maxFiles: 1,
      disabled: response.status === 'analyzing' || response.status === 'complete',
    });

    const getStatusColor = () => {
      switch (response.status) {
        case 'complete': return 'border-emerald-500 bg-emerald-500/10';
        case 'error': return 'border-red-500 bg-red-500/10';
        case 'analyzing': return 'border-amber-500 bg-amber-500/10';
        default: return isDragActive ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-600 hover:border-slate-500';
      }
    };

    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">{bureau.name}</h3>
          {response.status === 'complete' && (
            <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs">
              Analyzed
            </span>
          )}
        </div>

        {!response.file ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${getStatusColor()}`}
          >
            <input {...getInputProps()} />
            <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragActive ? 'text-emerald-400' : 'text-slate-400'}`} />
            <p className="text-slate-300 text-sm">
              {isDragActive ? 'Drop file here' : 'Upload response letter'}
            </p>
            <p className="text-slate-500 text-xs mt-1">PDF or image</p>
          </div>
        ) : (
          <div className={`border rounded-lg p-4 ${getStatusColor()}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-slate-400" />
                <div>
                  <p className="text-white text-sm truncate max-w-[150px]">{response.file.name}</p>
                  <p className="text-slate-500 text-xs">{(response.file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              {response.status === 'pending' && (
                <button
                  onClick={() => handleRemoveFile(bureau.id)}
                  className="text-slate-400 hover:text-red-400"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              {response.status === 'analyzing' && (
                <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
              )}
              {response.status === 'complete' && (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              )}
            </div>

            {/* Results */}
            {response.results && (
              <div className="space-y-2 pt-3 border-t border-slate-700">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-300">{response.results.itemsDeleted} deleted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    <span className="text-slate-300">{response.results.itemsVerified} verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Minus className="w-4 h-4 text-amber-400" />
                    <span className="text-slate-300">{response.results.itemsUpdated} updated</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">{response.results.itemsNoResponse} no response</span>
                  </div>
                </div>
              </div>
            )}

            {response.error && (
              <p className="text-red-400 text-sm mt-2">{response.error}</p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Upload Bureau Responses</h1>
          <p className="text-slate-400">
            Upload the response letters you received from the credit bureaus
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-8 flex items-start gap-3">
          <Unlock className="w-6 h-6 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-white font-semibold">Unlock Your Next Round Early</p>
            <p className="text-slate-300 text-sm">
              Uploading your response letters will unlock Round {(roundInfo?.roundNumber || 0) + 1} immediately, 
              instead of waiting the full 30 days.
            </p>
          </div>
        </div>

        {/* Upload Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {BUREAUS.map(bureau => (
            <BureauUpload key={bureau.id} bureau={bureau} />
          ))}
        </div>

        {/* Analyze Button */}
        {hasAnyFile && !analysisComplete && (
          <div className="text-center mb-8">
            <button
              onClick={handleAnalyzeAll}
              disabled={isAnalyzing}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 mx-auto"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Analyze Responses
                </>
              )}
            </button>
          </div>
        )}

        {/* Results Summary */}
        {hasAnyResults && analysisComplete && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
            <h2 className="text-white text-xl font-semibold mb-4">Results Summary</h2>
            
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-emerald-500/10 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-emerald-400">{totals.deleted}</p>
                <p className="text-slate-400 text-sm">Deleted</p>
              </div>
              <div className="bg-red-500/10 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-red-400">{totals.verified}</p>
                <p className="text-slate-400 text-sm">Verified</p>
              </div>
              <div className="bg-amber-500/10 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-amber-400">{totals.updated}</p>
                <p className="text-slate-400 text-sm">Updated</p>
              </div>
              <div className="bg-slate-500/10 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-slate-400">{totals.noResponse}</p>
                <p className="text-slate-400 text-sm">No Response</p>
              </div>
            </div>

            {/* What's Next */}
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">What's Next?</h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                {totals.deleted > 0 && (
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    {totals.deleted} items were deleted from your credit report!
                  </li>
                )}
                {totals.verified > 0 && (
                  <li className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    {totals.verified} items were verified - we'll escalate these in Round {(roundInfo?.roundNumber || 0) + 1}
                  </li>
                )}
                {totals.noResponse > 0 && (
                  <li className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-400" />
                    {totals.noResponse} items had no response - bureaus must delete these per FCRA
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Continue Button */}
        {analysisComplete && (
          <div className="text-center">
            <button
              onClick={() => completeUploadMutation.mutate()}
              disabled={completeUploadMutation.isPending}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-2 mx-auto"
            >
              {completeUploadMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Continue to Dashboard
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
            <p className="text-slate-500 text-sm mt-3">
              Round {(roundInfo?.roundNumber || 0) + 1} will be unlocked
            </p>
          </div>
        )}

        {/* Skip Option */}
        {!analysisComplete && (
          <div className="text-center mt-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-slate-400 hover:text-white text-sm"
            >
              Skip for now - I'll upload later
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
