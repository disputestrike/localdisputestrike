import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  AlertTriangle, 
  FileText, 
  ExternalLink, 
  Copy, 
  CheckCircle2,
  Gavel,
  Clock,
  Download,
  Info
} from 'lucide-react';

interface DisputeLetter {
  id: number;
  bureau: string;
  mailedAt: Date | null;
  responseDeadline: Date | null;
  trackingNumber?: string | null;
  accounts?: Array<{ accountName: string; accountNumber?: string }>;
}

interface UserProfile {
  fullName?: string;
  email?: string;
  phone?: string;
  currentAddress?: string;
  currentCity?: string;
  currentState?: string;
  currentZip?: string;
}

interface CFPBComplaintGeneratorProps {
  letter: DisputeLetter;
  userProfile?: UserProfile;
  onComplaintFiled?: (letterId: number) => void;
}

export default function CFPBComplaintGenerator({ 
  letter, 
  userProfile,
  onComplaintFiled 
}: CFPBComplaintGeneratorProps) {
  const [copied, setCopied] = useState(false);
  const [showFullComplaint, setShowFullComplaint] = useState(false);

  const bureauName = letter.bureau.charAt(0).toUpperCase() + letter.bureau.slice(1);
  const mailedDate = letter.mailedAt ? new Date(letter.mailedAt) : null;
  const deadlineDate = letter.responseDeadline ? new Date(letter.responseDeadline) : null;
  const daysOverdue = deadlineDate 
    ? Math.floor((Date.now() - deadlineDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const getBureauAddress = (bureau: string) => {
    switch (bureau.toLowerCase()) {
      case 'transunion':
        return 'TransUnion LLC, P.O. Box 2000, Chester, PA 19016';
      case 'equifax':
        return 'Equifax Information Services LLC, P.O. Box 740256, Atlanta, GA 30374';
      case 'experian':
        return 'Experian, P.O. Box 4500, Allen, TX 75013';
      default:
        return '';
    }
  };

  const generateComplaintNarrative = () => {
    const accountList = letter.accounts?.map(a => 
      `• ${a.accountName}${a.accountNumber ? ` (Account ending in ${a.accountNumber.slice(-4)})` : ''}`
    ).join('\n') || '• [Account details from dispute letter]';

    return `CFPB COMPLAINT - FCRA VIOLATION BY ${bureauName.toUpperCase()}

SUMMARY OF COMPLAINT:
${bureauName} has violated the Fair Credit Reporting Act (FCRA) by failing to complete their investigation and respond to my dispute within the legally mandated 30-day period under 15 U.S.C. § 1681i(a)(1).

TIMELINE OF EVENTS:
1. On ${mailedDate?.toLocaleDateString() || '[DATE]'}, I mailed a written dispute letter to ${bureauName} via Certified Mail${letter.trackingNumber ? ` (Tracking #: ${letter.trackingNumber})` : ''}.

2. The dispute concerned the following account(s):
${accountList}

3. Under FCRA § 1681i(a)(1), ${bureauName} was required to complete their investigation and provide results within 30 days of receiving my dispute.

4. The 30-day deadline was ${deadlineDate?.toLocaleDateString() || '[DEADLINE DATE]'}.

5. As of today, ${new Date().toLocaleDateString()}, I have NOT received any response from ${bureauName}. This is ${daysOverdue} days past the legal deadline.

LEGAL VIOLATIONS:
${bureauName} has violated the following provisions of the Fair Credit Reporting Act:

1. 15 U.S.C. § 1681i(a)(1) - Failure to reinvestigate disputed information within 30 days
2. 15 U.S.C. § 1681i(a)(6)(A) - Failure to provide written notice of investigation results
3. 15 U.S.C. § 1681i(a)(5)(A) - Failure to delete information that cannot be verified

REQUESTED RELIEF:
1. Immediate deletion of the disputed account(s) from my credit report as required under FCRA § 1681i(a)(5)(A) when information cannot be verified within the statutory timeframe.

2. Written confirmation that the disputed information has been deleted.

3. Updated credit report reflecting the deletion.

4. Investigation into ${bureauName}'s systematic failure to comply with FCRA timelines.

SUPPORTING DOCUMENTATION:
- Copy of original dispute letter sent to ${bureauName}
- Certified Mail receipt and tracking confirmation
- Proof of delivery (if available)
- Copy of credit report showing disputed accounts

CONSUMER INFORMATION:
Name: ${userProfile?.fullName || '[YOUR FULL NAME]'}
Address: ${userProfile?.currentAddress ? `${userProfile.currentAddress}, ${userProfile.currentCity}, ${userProfile.currentState} ${userProfile.currentZip}` : '[YOUR ADDRESS]'}
Phone: ${userProfile?.phone || '[YOUR PHONE]'}
Email: ${userProfile?.email || '[YOUR EMAIL]'}

I am filing this complaint because ${bureauName} has demonstrated a clear disregard for federal consumer protection laws. Their failure to respond within the legally mandated timeframe has caused me continued harm by allowing inaccurate information to remain on my credit report.

I request that the CFPB investigate this matter and take appropriate enforcement action against ${bureauName} for their FCRA violations.`;
  };

  const complaintText = generateComplaintNarrative();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(complaintText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([complaintText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CFPB_Complaint_${bureauName}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-red-200 bg-red-50/30">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <Gavel className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <CardTitle className="text-red-800 flex items-center gap-2">
              CFPB Complaint Generator
              <Badge variant="destructive">{daysOverdue} Days Overdue</Badge>
            </CardTitle>
            <CardDescription className="text-red-600">
              {bureauName} has violated FCRA § 1681i(a)(1) - File a complaint now
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Violation Summary */}
        <div className="p-4 bg-white rounded-lg border border-red-200">
          <h4 className="font-medium text-red-800 flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5" />
            FCRA Violation Details
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Bureau:</span>
              <span className="ml-2 font-medium">{bureauName}</span>
            </div>
            <div>
              <span className="text-gray-500">Dispute Mailed:</span>
              <span className="ml-2 font-medium">{mailedDate?.toLocaleDateString() || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-500">Response Deadline:</span>
              <span className="ml-2 font-medium">{deadlineDate?.toLocaleDateString() || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-500">Days Overdue:</span>
              <span className="ml-2 font-medium text-red-600">{daysOverdue} days</span>
            </div>
            {letter.trackingNumber && (
              <div className="col-span-2">
                <span className="text-gray-500">Tracking Number:</span>
                <span className="ml-2 font-mono">{letter.trackingNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* What This Means */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 flex items-center gap-2 mb-2">
            <Info className="h-5 w-5" />
            What This Means For You
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• {bureauName} has broken federal law by not responding in 30 days</li>
            <li>• Under FCRA, they must now DELETE the disputed information</li>
            <li>• Filing a CFPB complaint creates an official record of the violation</li>
            <li>• The CFPB will contact {bureauName} and require a response</li>
            <li>• You may be entitled to statutory damages of $100-$1,000 per violation</li>
          </ul>
        </div>

        {/* Generated Complaint */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-base font-medium">Generated Complaint Narrative</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullComplaint(!showFullComplaint)}
            >
              {showFullComplaint ? 'Collapse' : 'Expand'}
            </Button>
          </div>
          <Textarea
            value={complaintText}
            readOnly
            className={`font-mono text-xs bg-white ${showFullComplaint ? 'h-96' : 'h-32'}`}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleCopy} variant="outline">
            {copied ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Complaint
              </>
            )}
          </Button>
          
          <Button onClick={handleDownload} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download as Text
          </Button>

          <Button 
            className="bg-red-600 hover:bg-red-700"
            onClick={() => window.open('https://www.consumerfinance.gov/complaint/', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            File at CFPB.gov
          </Button>
        </div>

        {/* Filing Instructions */}
        <div className="p-4 bg-gray-50 rounded-lg border">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-600" />
            How to File Your CFPB Complaint
          </h4>
          <ol className="text-sm text-gray-600 space-y-2">
            <li className="flex gap-2">
              <span className="font-bold text-gray-800">1.</span>
              Click "File at CFPB.gov" to open the Consumer Financial Protection Bureau complaint portal
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-gray-800">2.</span>
              Select "Credit reporting" as the product type
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-gray-800">3.</span>
              Choose "Problem with a credit reporting company's investigation into an existing problem"
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-gray-800">4.</span>
              Select "{bureauName}" as the company
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-gray-800">5.</span>
              Paste the complaint narrative from above into the description field
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-gray-800">6.</span>
              Upload your supporting documents (dispute letter, tracking receipt, credit report)
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-gray-800">7.</span>
              Submit and save your complaint confirmation number
            </li>
          </ol>
        </div>

        {/* Mark as Filed */}
        {onComplaintFiled && (
          <div className="pt-4 border-t">
            <Button 
              onClick={() => onComplaintFiled(letter.id)}
              className="w-full"
              variant="outline"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              I've Filed My CFPB Complaint
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
