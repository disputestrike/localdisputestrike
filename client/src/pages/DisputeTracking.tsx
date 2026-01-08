import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  FileText,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Upload,
  Eye,
  Loader2,
  Timer,
  TrendingUp,
  Mail,
  RefreshCw,
  Send,
} from "lucide-react";

export default function DisputeTracking() {
  const [selectedLetter, setSelectedLetter] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [showMailedModal, setShowMailedModal] = useState(false);
  const [mailedData, setMailedData] = useState({
    trackingNumber: '',
    mailedDate: new Date().toISOString().split('T')[0],
  });
  const [outcomeData, setOutcomeData] = useState({
    outcome: 'pending' as 'deleted' | 'verified' | 'updated' | 'no_response' | 'pending',
    notes: '',
  });

  // Fetch letters and outcomes
  const { data: letters, isLoading: lettersLoading, refetch: refetchLetters } = trpc.disputeLetters.list.useQuery();
  const { data: outcomes, refetch: refetchOutcomes } = trpc.disputeOutcomes.list.useQuery();
  
  const createOutcomeMutation = trpc.disputeOutcomes.create.useMutation({
    onSuccess: () => {
      toast.success("Dispute outcome recorded");
      refetchOutcomes();
      setShowOutcomeModal(false);
    },
  });

  const updateStatusMutation = trpc.disputeLetters.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Letter marked as mailed! 30-day countdown started.");
      refetchLetters();
      setShowMailedModal(false);
      setMailedData({ trackingNumber: '', mailedDate: new Date().toISOString().split('T')[0] });
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  // Calculate stats
  const totalDisputes = letters?.length || 0;
  const pendingDisputes = letters?.filter(l => l.status === 'mailed')?.length || 0;
  const deletedCount = outcomes?.filter(o => o.outcome === 'deleted')?.length || 0;
  const verifiedCount = outcomes?.filter(o => o.outcome === 'verified')?.length || 0;
  const successRate = totalDisputes > 0 ? Math.round((deletedCount / totalDisputes) * 100) : 0;

  // Calculate days since mailed
  const getDaysSinceMailed = (mailedAt: string | Date | null) => {
    if (!mailedAt) return null;
    const mailed = new Date(mailedAt);
    const now = new Date();
    return Math.floor((now.getTime() - mailed.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Get status badge
  const getStatusBadge = (status: string, daysSinceMailed: number | null) => {
    if (status === 'resolved') {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Resolved</Badge>;
    }
    if (status === 'response_received') {
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Response Received</Badge>;
    }
    if (status === 'mailed') {
      if (daysSinceMailed && daysSinceMailed > 30) {
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Overdue ({daysSinceMailed} days)</Badge>;
      }
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Waiting ({daysSinceMailed || 0} days)</Badge>;
    }
    if (status === 'generated') {
      return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">Ready to Mail</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  // Get outcome badge
  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case 'deleted':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Deleted</Badge>;
      case 'verified':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Verified</Badge>;
      case 'updated':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Updated</Badge>;
      case 'no_response':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">No Response</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const handleMarkAsMailed = (letterId: number) => {
    setSelectedLetter(letterId);
    setShowMailedModal(true);
  };

  const submitMailed = () => {
    if (!selectedLetter) return;
    updateStatusMutation.mutate({
      id: selectedLetter,
      status: 'mailed',
      mailedAt: mailedData.mailedDate,
      trackingNumber: mailedData.trackingNumber || undefined,
    });
  };

  const handleRecordOutcome = (letterId: number) => {
    setSelectedLetter(letterId);
    setShowOutcomeModal(true);
  };

  const submitOutcome = () => {
    if (!selectedLetter) return;
    createOutcomeMutation.mutate({
      disputeLetterId: selectedLetter,
      outcome: outcomeData.outcome,
      responseNotes: outcomeData.notes,
    });
  };

  if (lettersLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Dispute Tracking</h1>
          <p className="text-slate-400 mt-1">
            Monitor your dispute progress and record outcomes
          </p>
        </div>

        {/* Deadline Warning Alert */}
        {letters && letters.some(l => {
          const days = getDaysSinceMailed(l.mailedAt);
          return days !== null && days >= 25 && days <= 30 && l.status === 'mailed';
        }) && (
          <Card className="bg-orange-500/10 border-orange-500/30">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <p className="font-semibold text-orange-400">Deadline Approaching!</p>
                  <p className="text-sm text-slate-300 mt-1">
                    {letters.filter(l => {
                      const days = getDaysSinceMailed(l.mailedAt);
                      return days !== null && days >= 25 && days <= 30 && l.status === 'mailed';
                    }).length} dispute(s) are approaching the 30-day deadline. 
                    If the bureau doesn't respond within 30 days, the item must be deleted under FCRA § 611.
                  </p>
                  <p className="text-xs text-orange-400 mt-2">
                    💡 Tip: If no response by day 30, you can escalate with a "Failure to Respond" letter citing FCRA violations.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overdue Alert */}
        {letters && letters.some(l => {
          const days = getDaysSinceMailed(l.mailedAt);
          return days !== null && days > 30 && l.status === 'mailed';
        }) && (
          <Card className="bg-red-500/10 border-red-500/30">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="font-semibold text-red-400">FCRA Violation - Bureau Overdue!</p>
                  <p className="text-sm text-slate-300 mt-1">
                    {letters.filter(l => {
                      const days = getDaysSinceMailed(l.mailedAt);
                      return days !== null && days > 30 && l.status === 'mailed';
                    }).length} dispute(s) have exceeded the 30-day deadline without response. 
                    Under FCRA § 611(a)(1), the bureau must delete unverified information.
                  </p>
                  <p className="text-xs text-red-400 mt-2">
                    🔥 Action: Send a "Failure to Respond" escalation letter demanding immediate deletion.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Mail className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{totalDisputes}</p>
                  <p className="text-xs text-slate-400">Total Disputes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{pendingDisputes}</p>
                  <p className="text-xs text-slate-400">Awaiting Response</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{deletedCount}</p>
                  <p className="text-xs text-slate-400">Items Deleted</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{successRate}%</p>
                  <p className="text-xs text-slate-400">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Disputes */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Active Disputes</CardTitle>
            <CardDescription className="text-slate-400">
              Track your mailed disputes and record outcomes when you receive responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {letters && letters.length > 0 ? (
              <div className="space-y-4">
                {letters.map((letter) => {
                  const daysSinceMailed = letter.mailedAt ? getDaysSinceMailed(letter.mailedAt) : null;
                  const outcome = outcomes?.find(o => o.disputeLetterId === letter.id);
                  const daysRemaining = daysSinceMailed !== null ? Math.max(0, 30 - daysSinceMailed) : 30;
                  const progressPercent = daysSinceMailed !== null ? Math.min(100, (daysSinceMailed / 30) * 100) : 0;

                  return (
                    <div
                      key={letter.id}
                      className="p-4 rounded-lg border bg-slate-800/50 border-slate-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4 text-cyan-400" />
                            <span className="font-medium text-white">
                              {letter.bureau.charAt(0).toUpperCase() + letter.bureau.slice(1)} Dispute Letter
                            </span>
                            {getStatusBadge(letter.status, daysSinceMailed)}
                            {outcome && getOutcomeBadge(outcome.outcome)}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Generated: {new Date(letter.createdAt).toLocaleDateString()}
                            </span>
                            {letter.mailedAt && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                Mailed: {new Date(letter.mailedAt).toLocaleDateString()}
                              </span>
                            )}
                            {letter.trackingNumber && (
                              <span className="flex items-center gap-1 text-cyan-400">
                                Tracking: {letter.trackingNumber}
                              </span>
                            )}
                            <span>Round {letter.round} • {letter.letterType}</span>
                          </div>

                          {/* 30-day countdown - only show when mailed and no outcome yet */}
                          {letter.status === 'mailed' && !outcome && (
                            <div className="mb-3">
                              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                                <span>30-Day Investigation Period</span>
                                <span className={daysRemaining <= 5 ? 'text-red-400 font-bold' : daysRemaining <= 10 ? 'text-yellow-400' : ''}>
                                  {daysRemaining} days remaining
                                </span>
                              </div>
                              <Progress 
                                value={progressPercent} 
                                className="h-2 bg-slate-700"
                              />
                              {daysRemaining === 0 && (
                                <p className="text-xs text-red-400 mt-1">
                                  ⚠️ 30-day deadline passed! If no response, file CFPB complaint.
                                </p>
                              )}
                            </div>
                          )}

                          {/* Outcome notes */}
                          {outcome?.responseNotes && (
                            <p className="text-sm text-slate-400 bg-slate-800 p-2 rounded mt-2">
                              {outcome.responseNotes}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-slate-700 text-slate-300 hover:bg-slate-800"
                            onClick={() => window.open(`/letter/${letter.id}`, '_blank')}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          
                          {/* Mark as Mailed button - show only for generated letters */}
                          {letter.status === 'generated' && (
                            <Button
                              size="sm"
                              className="bg-orange-600 hover:bg-orange-700 text-white"
                              onClick={() => handleMarkAsMailed(letter.id)}
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Mark as Mailed
                            </Button>
                          )}
                          
                          {/* Record Outcome button - show only for mailed letters without outcome */}
                          {letter.status === 'mailed' && !outcome && (
                            <Button
                              size="sm"
                              className="bg-cyan-600 hover:bg-cyan-700 text-white"
                              onClick={() => handleRecordOutcome(letter.id)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Record Outcome
                            </Button>
                          )}

                          {/* Round 2 button - show for verified outcomes */}
                          {outcome?.outcome === 'verified' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                            >
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Round 2
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No disputes yet</h3>
                <p className="text-slate-400 mb-4">
                  Generate dispute letters to start tracking your progress
                </p>
                <Button className="bg-cyan-600 hover:bg-cyan-700">
                  Generate Letters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mark as Mailed Modal */}
        {showMailedModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-slate-900 border-slate-800 w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Send className="h-5 w-5 text-orange-400" />
                  Mark as Mailed
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Enter the mailing details to start the 30-day countdown
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Date Mailed *
                  </label>
                  <input
                    type="date"
                    value={mailedData.mailedDate}
                    onChange={(e) => setMailedData({ ...mailedData, mailedDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    USPS Tracking Number (optional)
                  </label>
                  <input
                    type="text"
                    value={mailedData.trackingNumber}
                    onChange={(e) => setMailedData({ ...mailedData, trackingNumber: e.target.value })}
                    placeholder="9400 1234 5678 9012 3456 78"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Certified Mail tracking numbers start with 9407 or 9400
                  </p>
                </div>

                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                  <p className="text-sm text-orange-300">
                    <strong>Important:</strong> Once marked as mailed, the 30-day countdown begins. 
                    Credit bureaus must respond within 30 days under FCRA § 1681i(a)(1).
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-slate-700 text-slate-300"
                    onClick={() => {
                      setShowMailedModal(false);
                      setMailedData({ trackingNumber: '', mailedDate: new Date().toISOString().split('T')[0] });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                    onClick={submitMailed}
                    disabled={updateStatusMutation.isPending || !mailedData.mailedDate}
                  >
                    {updateStatusMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Start 30-Day Countdown
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Outcome Modal */}
        {showOutcomeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-slate-900 border-slate-800 w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="text-white">Record Dispute Outcome</CardTitle>
                <CardDescription className="text-slate-400">
                  What was the result of this dispute?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'deleted', label: 'Deleted', icon: CheckCircle2, color: 'green', desc: 'Item removed from report' },
                    { value: 'verified', label: 'Verified', icon: XCircle, color: 'red', desc: 'Bureau confirmed accuracy' },
                    { value: 'updated', label: 'Updated', icon: RefreshCw, color: 'blue', desc: 'Information was corrected' },
                    { value: 'no_response', label: 'No Response', icon: AlertTriangle, color: 'yellow', desc: 'No reply after 30 days' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setOutcomeData({ ...outcomeData, outcome: option.value as any })}
                      className={`p-4 rounded-lg border transition-colors text-left ${
                        outcomeData.outcome === option.value
                          ? `bg-${option.color}-500/20 border-${option.color}-500/50`
                          : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <option.icon className={`h-6 w-6 mb-2 text-${option.color}-400`} />
                      <span className="text-sm font-medium text-white block">{option.label}</span>
                      <span className="text-xs text-slate-400">{option.desc}</span>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    value={outcomeData.notes}
                    onChange={(e) => setOutcomeData({ ...outcomeData, notes: e.target.value })}
                    placeholder="Any additional details about the response..."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-slate-700 text-slate-300"
                    onClick={() => setShowOutcomeModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                    onClick={submitOutcome}
                    disabled={createOutcomeMutation.isPending}
                  >
                    {createOutcomeMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Save Outcome
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tips Card */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              Tracking Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-400">
              <div className="flex items-start gap-2">
                <Timer className="h-4 w-4 text-cyan-400 mt-0.5" />
                <p>Credit bureaus must respond within 30 days. If they don't, the item must be deleted.</p>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-cyan-400 mt-0.5" />
                <p>Always send disputes via Certified Mail with Return Receipt for proof of delivery.</p>
              </div>
              <div className="flex items-start gap-2">
                <RefreshCw className="h-4 w-4 text-cyan-400 mt-0.5" />
                <p>If an item is "verified," send a Round 2 letter with more aggressive language.</p>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-cyan-400 mt-0.5" />
                <p>Upload bureau response letters to keep a complete record of your dispute history.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
