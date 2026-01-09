import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  ArrowRight,
  FileText,
  Scale,
  Shield,
  Zap,
  Target,
  TrendingUp,
  Mail,
  FileWarning,
  Gavel,
  Building2,
  Sparkles,
  ChevronRight
} from "lucide-react";

interface DisputeOutcome {
  id: number;
  accountName: string;
  bureau: string;
  outcome: 'deleted' | 'verified' | 'updated' | 'no_response' | 'pending';
  responseReceivedAt?: string;
  letterMailedAt?: string;
  deadlineDate?: string;
  responseNotes?: string;
  updatedFields?: string;
}

interface BureauResponseAnalyzerProps {
  outcomes: DisputeOutcome[];
  onGenerateFollowUp?: (outcomeId: number, strategy: string) => void;
  onFileCFPB?: (bureau: string) => void;
}

interface NextStep {
  id: string;
  title: string;
  description: string;
  urgency: 'high' | 'medium' | 'low';
  type: 'followup' | 'escalation' | 'legal' | 'celebration';
  action?: () => void;
  icon: React.ReactNode;
}

export function BureauResponseAnalyzer({ 
  outcomes, 
  onGenerateFollowUp,
  onFileCFPB 
}: BureauResponseAnalyzerProps) {
  const [selectedOutcome, setSelectedOutcome] = useState<number | null>(null);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = outcomes.length;
    const deleted = outcomes.filter(o => o.outcome === 'deleted').length;
    const verified = outcomes.filter(o => o.outcome === 'verified').length;
    const updated = outcomes.filter(o => o.outcome === 'updated').length;
    const noResponse = outcomes.filter(o => o.outcome === 'no_response').length;
    const pending = outcomes.filter(o => o.outcome === 'pending').length;

    const successRate = total > 0 ? Math.round(((deleted + updated) / total) * 100) : 0;
    const deletionRate = total > 0 ? Math.round((deleted / total) * 100) : 0;

    return { total, deleted, verified, updated, noResponse, pending, successRate, deletionRate };
  }, [outcomes]);

  // Group by bureau
  const byBureau = useMemo(() => {
    const bureaus = ['transunion', 'equifax', 'experian'];
    return bureaus.map(bureau => {
      const bureauOutcomes = outcomes.filter(o => o.bureau === bureau);
      return {
        bureau,
        outcomes: bureauOutcomes,
        deleted: bureauOutcomes.filter(o => o.outcome === 'deleted').length,
        verified: bureauOutcomes.filter(o => o.outcome === 'verified').length,
        pending: bureauOutcomes.filter(o => o.outcome === 'pending').length,
        noResponse: bureauOutcomes.filter(o => o.outcome === 'no_response').length,
      };
    });
  }, [outcomes]);

  // Generate next steps based on outcomes
  const nextSteps = useMemo(() => {
    const steps: NextStep[] = [];

    // Check for no-response violations (FCRA requires 30-day response)
    const noResponseOutcomes = outcomes.filter(o => o.outcome === 'no_response');
    if (noResponseOutcomes.length > 0) {
      steps.push({
        id: 'fcra-violation',
        title: 'FCRA Violation Detected!',
        description: `${noResponseOutcomes.length} dispute(s) received no response within 30 days. This is a federal violation - you may be entitled to damages.`,
        urgency: 'high',
        type: 'legal',
        icon: <Gavel className="h-5 w-5 text-red-500" />
      });
    }

    // Check for verified accounts that need escalation
    const verifiedOutcomes = outcomes.filter(o => o.outcome === 'verified');
    if (verifiedOutcomes.length > 0) {
      steps.push({
        id: 'escalation-needed',
        title: 'Escalation Recommended',
        description: `${verifiedOutcomes.length} account(s) were verified. Generate Round 2 letters with Method of Verification (MOV) demands.`,
        urgency: 'medium',
        type: 'followup',
        icon: <ArrowRight className="h-5 w-5 text-amber-500" />
      });
    }

    // Check for pending disputes approaching deadline
    const pendingApproachingDeadline = outcomes.filter(o => {
      if (o.outcome !== 'pending' || !o.deadlineDate) return false;
      const daysLeft = Math.ceil((new Date(o.deadlineDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysLeft <= 7 && daysLeft > 0;
    });
    if (pendingApproachingDeadline.length > 0) {
      steps.push({
        id: 'deadline-approaching',
        title: 'Deadlines Approaching',
        description: `${pendingApproachingDeadline.length} dispute(s) have response deadlines within 7 days. Prepare escalation letters.`,
        urgency: 'high',
        type: 'followup',
        icon: <Clock className="h-5 w-5 text-orange-500" />
      });
    }

    // Celebrate deletions
    if (stats.deleted > 0) {
      steps.push({
        id: 'celebrate-deletions',
        title: 'Celebrate Your Wins!',
        description: `${stats.deleted} account(s) successfully deleted! Your credit score should improve within 30 days.`,
        urgency: 'low',
        type: 'celebration',
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />
      });
    }

    // CFPB complaint recommendation for stubborn bureaus
    const bureauWithHighVerified = byBureau.filter(b => b.verified >= 3);
    if (bureauWithHighVerified.length > 0) {
      bureauWithHighVerified.forEach(b => {
        steps.push({
          id: `cfpb-${b.bureau}`,
          title: `File CFPB Complaint Against ${b.bureau.charAt(0).toUpperCase() + b.bureau.slice(1)}`,
          description: `${b.verified} accounts verified without proper investigation. CFPB complaints have 90%+ resolution rate.`,
          urgency: 'medium',
          type: 'escalation',
          action: () => onFileCFPB?.(b.bureau),
          icon: <Building2 className="h-5 w-5 text-blue-500" />
        });
      });
    }

    return steps.sort((a, b) => {
      const urgencyOrder = { high: 0, medium: 1, low: 2 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });
  }, [outcomes, stats, byBureau, onFileCFPB]);

  // Get strategy recommendation for an outcome
  const getStrategyForOutcome = (outcome: DisputeOutcome): { strategy: string; description: string } => {
    switch (outcome.outcome) {
      case 'verified':
        return {
          strategy: 'mov_demand',
          description: 'Demand Method of Verification (MOV) - bureaus must prove how they verified'
        };
      case 'no_response':
        return {
          strategy: 'fcra_violation',
          description: 'FCRA violation letter citing 15 U.S.C. § 1681i(a)(1) - demand immediate deletion'
        };
      case 'updated':
        return {
          strategy: 'accuracy_dispute',
          description: 'Dispute remaining inaccuracies with specific documentation'
        };
      default:
        return {
          strategy: 'standard',
          description: 'Standard follow-up dispute'
        };
    }
  };

  if (outcomes.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No dispute responses recorded yet</p>
          <p className="text-sm mt-2">Record bureau responses to get AI-powered next-step recommendations</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Bureau Response Analyzer
              </CardTitle>
              <CardDescription>
                AI analysis of dispute outcomes with next-step recommendations
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {stats.successRate}% Success Rate
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
              <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-700">{stats.deleted}</div>
              <div className="text-xs text-green-600">Deleted</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
              <TrendingUp className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-700">{stats.updated}</div>
              <div className="text-xs text-blue-600">Updated</div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-center">
              <AlertTriangle className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-700">{stats.verified}</div>
              <div className="text-xs text-yellow-600">Verified</div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-center">
              <XCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-700">{stats.noResponse}</div>
              <div className="text-xs text-red-600">No Response</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
              <Clock className="h-6 w-6 text-gray-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-700">{stats.pending}</div>
              <div className="text-xs text-gray-600">Pending</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      {nextSteps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Recommended Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {nextSteps.map(step => (
              <Alert
                key={step.id}
                className={`
                  ${step.urgency === 'high' ? 'border-red-300 bg-red-50' :
                    step.urgency === 'medium' ? 'border-amber-300 bg-amber-50' :
                    step.type === 'celebration' ? 'border-green-300 bg-green-50' :
                    'border-blue-300 bg-blue-50'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  {step.icon}
                  <div className="flex-1">
                    <AlertTitle className="flex items-center gap-2">
                      {step.title}
                      <Badge variant={
                        step.urgency === 'high' ? 'destructive' :
                        step.urgency === 'medium' ? 'secondary' : 'default'
                      }>
                        {step.urgency}
                      </Badge>
                    </AlertTitle>
                    <AlertDescription className="mt-1">
                      {step.description}
                    </AlertDescription>
                    {step.action && (
                      <Button 
                        size="sm" 
                        className="mt-2"
                        onClick={step.action}
                      >
                        Take Action
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Detailed Outcomes by Bureau */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Results by Bureau</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={byBureau[0]?.bureau || 'transunion'}>
            <TabsList className="grid w-full grid-cols-3">
              {byBureau.map(b => (
                <TabsTrigger key={b.bureau} value={b.bureau} className="capitalize">
                  {b.bureau}
                  <Badge variant="outline" className="ml-2">
                    {b.outcomes.length}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            {byBureau.map(bureauData => (
              <TabsContent key={bureauData.bureau} value={bureauData.bureau} className="space-y-4">
                {/* Bureau Summary */}
                <div className="grid grid-cols-4 gap-2 p-4 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{bureauData.deleted}</div>
                    <div className="text-xs text-muted-foreground">Deleted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-yellow-600">{bureauData.verified}</div>
                    <div className="text-xs text-muted-foreground">Verified</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">{bureauData.noResponse}</div>
                    <div className="text-xs text-muted-foreground">No Response</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-600">{bureauData.pending}</div>
                    <div className="text-xs text-muted-foreground">Pending</div>
                  </div>
                </div>

                {/* Individual Outcomes */}
                <div className="space-y-2">
                  {bureauData.outcomes.map(outcome => {
                    const strategy = getStrategyForOutcome(outcome);
                    return (
                      <div
                        key={outcome.id}
                        className={`
                          p-4 rounded-lg border transition-all
                          ${selectedOutcome === outcome.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}
                        `}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {outcome.outcome === 'deleted' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                              {outcome.outcome === 'verified' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                              {outcome.outcome === 'updated' && <TrendingUp className="h-4 w-4 text-blue-500" />}
                              {outcome.outcome === 'no_response' && <XCircle className="h-4 w-4 text-red-500" />}
                              {outcome.outcome === 'pending' && <Clock className="h-4 w-4 text-gray-500" />}
                              <span className="font-medium">{outcome.accountName}</span>
                              <Badge variant={
                                outcome.outcome === 'deleted' ? 'default' :
                                outcome.outcome === 'verified' ? 'secondary' :
                                outcome.outcome === 'no_response' ? 'destructive' : 'outline'
                              }>
                                {outcome.outcome.replace('_', ' ')}
                              </Badge>
                            </div>

                            {outcome.responseNotes && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {outcome.responseNotes}
                              </p>
                            )}

                            {/* Strategy Recommendation */}
                            {outcome.outcome !== 'deleted' && outcome.outcome !== 'pending' && (
                              <div className="flex items-center gap-2 mt-2 p-2 bg-muted rounded">
                                <Zap className="h-4 w-4 text-amber-500" />
                                <span className="text-sm">
                                  <span className="font-medium">Recommended:</span> {strategy.description}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Action Button */}
                          {outcome.outcome !== 'deleted' && outcome.outcome !== 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onGenerateFollowUp?.(outcome.id, strategy.strategy)}
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Generate Follow-Up
                            </Button>
                          )}
                        </div>

                        {/* Timeline */}
                        {(outcome.letterMailedAt || outcome.responseReceivedAt) && (
                          <div className="flex items-center gap-4 mt-3 pt-3 border-t text-xs text-muted-foreground">
                            {outcome.letterMailedAt && (
                              <span>Mailed: {new Date(outcome.letterMailedAt).toLocaleDateString()}</span>
                            )}
                            {outcome.responseReceivedAt && (
                              <span>Response: {new Date(outcome.responseReceivedAt).toLocaleDateString()}</span>
                            )}
                            {outcome.deadlineDate && outcome.outcome === 'pending' && (
                              <span className="text-amber-600">
                                Deadline: {new Date(outcome.deadlineDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {bureauData.outcomes.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No disputes recorded for {bureauData.bureau}
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Strategy Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Escalation Strategy Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-yellow-500">Round 2</Badge>
                <span className="font-medium">Method of Verification (MOV)</span>
              </div>
              <p className="text-sm text-muted-foreground">
                When accounts are "verified", demand the MOV under 15 U.S.C. § 1681i(a)(7). 
                Bureaus must disclose how they verified the information.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-orange-500">Round 3</Badge>
                <span className="font-medium">Intent to Sue Letter</span>
              </div>
              <p className="text-sm text-muted-foreground">
                If MOV is inadequate, send an intent to sue letter citing willful noncompliance 
                under 15 U.S.C. § 1681n for statutory damages.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-500">CFPB</Badge>
                <span className="font-medium">Consumer Financial Protection Bureau</span>
              </div>
              <p className="text-sm text-muted-foreground">
                File a CFPB complaint for stubborn bureaus. CFPB complaints have 90%+ resolution 
                rates and create official records.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-red-500">Legal</Badge>
                <span className="font-medium">Small Claims / FCRA Lawsuit</span>
              </div>
              <p className="text-sm text-muted-foreground">
                For repeated violations, consider small claims court ($100-$1,000 per violation) 
                or consult an FCRA attorney for larger damages.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
