import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Mail, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  ChevronDown,
  ChevronUp,
  Calendar,
  Truck,
  Eye,
  Scale,
  AlertCircle,
  Gavel
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import CFPBComplaintGenerator from './CFPBComplaintGenerator';

interface DisputeLetter {
  id: number;
  bureau: string;
  status: string;
  createdAt: Date;
  mailedAt?: Date | null;
  trackingNumber?: string | null;
  responseDeadline?: Date | null;
  responseReceivedAt?: Date | null;
  accounts?: Array<{ accountName: string; status?: string }>;
}

interface DisputeTimelineListProps {
  letters: DisputeLetter[];
  onUpdateStatus?: (letterId: number, status: string) => void;
  onFileCFPB?: (letterId: number) => void;
}

export default function DisputeTimelineList({ letters, onUpdateStatus, onFileCFPB }: DisputeTimelineListProps) {
  const [expandedLetter, setExpandedLetter] = useState<number | null>(null);
  const [cfpbModalLetter, setCfpbModalLetter] = useState<DisputeLetter | null>(null);

  const getBureauColor = (bureau: string) => {
    switch (bureau.toLowerCase()) {
      case 'transunion': return 'bg-blue-500';
      case 'equifax': return 'bg-red-500';
      case 'experian': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getBureauBgColor = (bureau: string) => {
    switch (bureau.toLowerCase()) {
      case 'transunion': return 'bg-blue-50 border-blue-200';
      case 'equifax': return 'bg-red-50 border-red-200';
      case 'experian': return 'bg-purple-50 border-purple-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'generated':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Ready to Mail</Badge>;
      case 'mailed':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">In Transit</Badge>;
      case 'delivered':
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Under Investigation</Badge>;
      case 'response_received':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Response Received</Badge>;
      case 'resolved':
        return <Badge className="bg-green-500 text-white hover:bg-green-500">Resolved</Badge>;
      case 'escalated':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Escalated</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calculateProgress = (letter: DisputeLetter): number => {
    if (!letter.mailedAt) return 10;
    if (letter.status === 'resolved') return 100;
    if (letter.responseReceivedAt) return 90;
    
    const mailedDate = new Date(letter.mailedAt).getTime();
    const now = Date.now();
    const daysPassed = Math.floor((now - mailedDate) / (1000 * 60 * 60 * 24));
    
    // Progress from 20% (just mailed) to 80% (30 days)
    return Math.min(80, 20 + (daysPassed / 30) * 60);
  };

  const calculateDaysRemaining = (deadline: Date | null | undefined): number | null => {
    if (!deadline) return null;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getTimelineSteps = (letter: DisputeLetter) => {
    const daysRemaining = calculateDaysRemaining(letter.responseDeadline);
    const isOverdue = daysRemaining !== null && daysRemaining < 0;
    const isUrgent = daysRemaining !== null && daysRemaining <= 5 && daysRemaining >= 0;

    const steps = [
      {
        id: 'generated',
        title: 'Letter Generated',
        completed: true,
        current: letter.status === 'generated' && !letter.mailedAt,
        date: letter.createdAt,
        icon: FileText,
      },
      {
        id: 'mailed',
        title: 'Mailed',
        completed: !!letter.mailedAt,
        current: letter.status === 'generated' && !letter.mailedAt,
        date: letter.mailedAt,
        icon: Mail,
      },
      {
        id: 'investigation',
        title: 'Under Investigation',
        completed: letter.responseReceivedAt !== null || letter.status === 'resolved',
        current: letter.mailedAt && !letter.responseReceivedAt && letter.status !== 'resolved',
        warning: isUrgent,
        error: isOverdue,
        icon: Clock,
        extra: letter.mailedAt && !letter.responseReceivedAt && daysRemaining !== null
          ? (isOverdue ? `${Math.abs(daysRemaining)} days overdue!` : `${daysRemaining} days left`)
          : undefined,
      },
      {
        id: 'response',
        title: 'Response Received',
        completed: letter.responseReceivedAt !== null || letter.status === 'resolved',
        current: letter.responseReceivedAt !== null && letter.status !== 'resolved',
        date: letter.responseReceivedAt,
        icon: Eye,
      },
      {
        id: 'resolved',
        title: 'Resolved',
        completed: letter.status === 'resolved',
        current: false,
        icon: CheckCircle2,
      },
    ];

    return steps;
  };

  if (letters.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Disputes Yet</h3>
          <p className="text-gray-500">
            Upload a credit report and generate dispute letters to track your progress here.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group letters by status for summary
  const summary = {
    active: letters.filter(l => ['generated', 'mailed', 'delivered'].includes(l.status)).length,
    pending: letters.filter(l => l.status === 'response_received').length,
    resolved: letters.filter(l => l.status === 'resolved').length,
    overdue: letters.filter(l => {
      const days = calculateDaysRemaining(l.responseDeadline);
      return days !== null && days < 0 && l.status === 'mailed';
    }).length,
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">{summary.active}</div>
            <div className="text-sm text-blue-600">Active Disputes</div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-700">{summary.pending}</div>
            <div className="text-sm text-yellow-600">Pending Review</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-700">{summary.resolved}</div>
            <div className="text-sm text-green-600">Resolved</div>
          </CardContent>
        </Card>
        <Card className={summary.overdue > 0 ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"}>
          <CardContent className="p-4 text-center">
            <div className={`text-2xl font-bold ${summary.overdue > 0 ? 'text-red-700' : 'text-gray-400'}`}>
              {summary.overdue}
            </div>
            <div className={`text-sm ${summary.overdue > 0 ? 'text-red-600' : 'text-gray-500'}`}>
              FCRA Violations
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dispute Cards */}
      <div className="space-y-4">
        {letters.map((letter) => {
          const isExpanded = expandedLetter === letter.id;
          const steps = getTimelineSteps(letter);
          const progress = calculateProgress(letter);
          const daysRemaining = calculateDaysRemaining(letter.responseDeadline);
          const isOverdue = daysRemaining !== null && daysRemaining < 0 && letter.status === 'mailed';
          const bureauName = letter.bureau.charAt(0).toUpperCase() + letter.bureau.slice(1);

          return (
            <Card 
              key={letter.id} 
              className={`overflow-hidden transition-all ${isOverdue ? 'border-red-300 shadow-red-100' : ''}`}
            >
              <CardHeader 
                className={`cursor-pointer transition-colors ${getBureauBgColor(letter.bureau)}`}
                onClick={() => setExpandedLetter(isExpanded ? null : letter.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${getBureauColor(letter.bureau)} flex items-center justify-center text-white font-bold`}>
                      {bureauName.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {bureauName}
                        {isOverdue && <AlertCircle className="h-5 w-5 text-red-500" />}
                      </CardTitle>
                      <p className="text-sm text-gray-500">
                        Created {new Date(letter.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(letter.status)}
                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress 
                    value={progress} 
                    className={`h-2 ${isOverdue ? '[&>div]:bg-red-500' : ''}`}
                  />
                </div>

                {/* Mini Timeline */}
                <div className="flex justify-between mt-4">
                  {steps.map((step, idx) => (
                    <div key={step.id} className="flex flex-col items-center flex-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs
                        ${step.completed ? 'bg-green-500 text-white' : 
                          step.error ? 'bg-red-500 text-white' :
                          step.warning ? 'bg-yellow-500 text-white' :
                          step.current ? 'bg-blue-500 text-white' : 
                          'bg-gray-200 text-gray-400'}`}
                      >
                        {step.completed ? <CheckCircle2 className="h-4 w-4" /> :
                         step.error ? <XCircle className="h-4 w-4" /> :
                         step.warning ? <AlertTriangle className="h-4 w-4" /> :
                         <step.icon className="h-3 w-3" />}
                      </div>
                      <span className={`text-xs mt-1 text-center ${
                        step.completed || step.current ? 'text-gray-700' : 'text-gray-400'
                      }`}>
                        {step.title}
                      </span>
                      {step.extra && (
                        <span className={`text-xs ${step.error ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                          {step.extra}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-4">
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {letter.status === 'generated' && !letter.mailedAt && onUpdateStatus && (
                      <Button 
                        size="sm"
                        onClick={() => onUpdateStatus(letter.id, 'mailed')}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Mark as Mailed
                      </Button>
                    )}
                    {letter.mailedAt && !letter.responseReceivedAt && letter.status !== 'resolved' && onUpdateStatus && (
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateStatus(letter.id, 'response_received')}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Response Received
                      </Button>
                    )}
                    {letter.responseReceivedAt && letter.status !== 'resolved' && onUpdateStatus && (
                      <>
                        <Button 
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => onUpdateStatus(letter.id, 'resolved')}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Mark Deleted
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => onUpdateStatus(letter.id, 'escalated')}
                        >
                          <Scale className="h-4 w-4 mr-2" />
                          Escalate
                        </Button>
                      </>
                    )}
                    {isOverdue && (
                      <Button 
                        size="sm"
                        variant="destructive"
                        onClick={() => setCfpbModalLetter(letter)}
                      >
                        <Gavel className="h-4 w-4 mr-2" />
                        Generate CFPB Complaint
                      </Button>
                    )}
                  </div>

                  {/* Tracking Info */}
                  {letter.trackingNumber && (
                    <div className="p-3 bg-gray-50 rounded-lg mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Truck className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Tracking:</span>
                        <span className="font-mono font-medium">{letter.trackingNumber}</span>
                      </div>
                    </div>
                  )}

                  {/* Overdue Warning */}
                  {isOverdue && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-red-800">FCRA Violation Detected</h4>
                          <p className="text-sm text-red-700 mt-1">
                            {bureauName} has exceeded the 30-day investigation deadline by {Math.abs(daysRemaining!)} days. 
                            Under FCRA § 1681i(a)(1), they must delete the disputed information or face penalties.
                          </p>
                          <p className="text-sm text-red-700 mt-2 font-medium">
                            Recommended: File a CFPB complaint immediately to enforce your rights.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Disputed Accounts */}
                  {letter.accounts && letter.accounts.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Disputed Accounts ({letter.accounts.length})
                      </h4>
                      <div className="space-y-2">
                        {letter.accounts.map((account, idx) => (
                          <div 
                            key={idx} 
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <span className="text-sm text-gray-700">{account.accountName}</span>
                            {account.status && (
                              <Badge variant="outline" className="text-xs">
                                {account.status}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timeline Details */}
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Timeline</h4>
                    <div className="space-y-3">
                      {letter.createdAt && (
                        <div className="flex items-center gap-3 text-sm">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-500">Created:</span>
                          <span>{new Date(letter.createdAt).toLocaleDateString()}</span>
                        </div>
                      )}
                      {letter.mailedAt && (
                        <div className="flex items-center gap-3 text-sm">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-500">Mailed:</span>
                          <span>{new Date(letter.mailedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                      {letter.responseDeadline && (
                        <div className="flex items-center gap-3 text-sm">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-500">Deadline:</span>
                          <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                            {new Date(letter.responseDeadline).toLocaleDateString()}
                            {isOverdue && ' (OVERDUE)'}
                          </span>
                        </div>
                      )}
                      {letter.responseReceivedAt && (
                        <div className="flex items-center gap-3 text-sm">
                          <Eye className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-500">Response:</span>
                          <span>{new Date(letter.responseReceivedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* CFPB Complaint Generator Modal */}
      <Dialog open={!!cfpbModalLetter} onOpenChange={(open) => !open && setCfpbModalLetter(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate CFPB Complaint</DialogTitle>
          </DialogHeader>
          {cfpbModalLetter && (
            <CFPBComplaintGenerator
              letter={{
                id: cfpbModalLetter.id,
                bureau: cfpbModalLetter.bureau,
                mailedAt: cfpbModalLetter.mailedAt || null,
                responseDeadline: cfpbModalLetter.responseDeadline || null,
                trackingNumber: cfpbModalLetter.trackingNumber,
                accounts: cfpbModalLetter.accounts?.map(a => ({
                  accountName: a.accountName,
                  accountNumber: '',
                })),
              }}
              onComplaintFiled={(letterId) => {
                setCfpbModalLetter(null);
                onFileCFPB?.(letterId);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
