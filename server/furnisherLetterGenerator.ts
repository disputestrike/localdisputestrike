/**
 * Furnisher Dispute Letter Generator
 * 
 * Generates dispute letters directly to creditors/furnishers (not bureaus).
 * These letters invoke FCRA § 1681s-2(b) - Furnisher's duty to investigate disputes.
 */

// Common furnisher addresses database
export const FURNISHER_ADDRESSES: Record<string, { name: string; address: string; disputeAddress?: string }> = {
  // Major Banks
  'chase': {
    name: 'JPMorgan Chase Bank, N.A.',
    address: 'P.O. Box 15298, Wilmington, DE 19850-5298',
    disputeAddress: 'P.O. Box 15299, Wilmington, DE 19850-5299',
  },
  'bank_of_america': {
    name: 'Bank of America, N.A.',
    address: 'P.O. Box 982234, El Paso, TX 79998-2234',
    disputeAddress: 'P.O. Box 982238, El Paso, TX 79998-2238',
  },
  'wells_fargo': {
    name: 'Wells Fargo Bank, N.A.',
    address: 'P.O. Box 5866, Carol Stream, IL 60197-5866',
    disputeAddress: 'P.O. Box 14517, Des Moines, IA 50306-3517',
  },
  'capital_one': {
    name: 'Capital One',
    address: 'P.O. Box 30285, Salt Lake City, UT 84130-0285',
    disputeAddress: 'P.O. Box 30281, Salt Lake City, UT 84130-0281',
  },
  'citibank': {
    name: 'Citibank, N.A.',
    address: 'P.O. Box 6500, Sioux Falls, SD 57117-6500',
  },
  'discover': {
    name: 'Discover Financial Services',
    address: 'P.O. Box 30943, Salt Lake City, UT 84130-0943',
  },
  'american_express': {
    name: 'American Express',
    address: 'P.O. Box 981535, El Paso, TX 79998-1535',
  },
  'synchrony': {
    name: 'Synchrony Bank',
    address: 'P.O. Box 965012, Orlando, FL 32896-5012',
  },
  
  // Major Collection Agencies
  'midland_credit': {
    name: 'Midland Credit Management, Inc.',
    address: '350 Camino de la Reina, Suite 100, San Diego, CA 92108',
  },
  'portfolio_recovery': {
    name: 'Portfolio Recovery Associates, LLC',
    address: '120 Corporate Boulevard, Norfolk, VA 23502',
  },
  'lvnv_funding': {
    name: 'LVNV Funding LLC',
    address: 'P.O. Box 25028, Greenville, SC 29616',
  },
  'cavalry_spv': {
    name: 'Cavalry SPV I, LLC',
    address: '500 Summit Lake Drive, Suite 400, Valhalla, NY 10595',
  },
  'enhanced_recovery': {
    name: 'Enhanced Recovery Company, LLC',
    address: '8014 Bayberry Road, Jacksonville, FL 32256',
  },
  'convergent': {
    name: 'Convergent Outsourcing, Inc.',
    address: '1600 S. Douglass Road, Suite 200, Anaheim, CA 92806',
  },
  
  // Medical Collections
  'medicredit': {
    name: 'Medicredit, Inc.',
    address: 'P.O. Box 548, Chesterfield, MO 63006-0548',
  },
  'transworld': {
    name: 'Transworld Systems Inc.',
    address: '2 Northpoint Drive, Suite 100, Houston, TX 77060',
  },
  
  // Auto Lenders
  'ally_financial': {
    name: 'Ally Financial Inc.',
    address: 'P.O. Box 380901, Bloomington, MN 55438-0901',
  },
  'toyota_financial': {
    name: 'Toyota Financial Services',
    address: 'P.O. Box 105386, Atlanta, GA 30348-5386',
  },
  'honda_financial': {
    name: 'Honda Financial Services',
    address: 'P.O. Box 650903, Dallas, TX 75265-0903',
  },
  
  // Student Loans
  'navient': {
    name: 'Navient Solutions, LLC',
    address: 'P.O. Box 9635, Wilkes-Barre, PA 18773-9635',
  },
  'nelnet': {
    name: 'Nelnet, Inc.',
    address: 'P.O. Box 82561, Lincoln, NE 68501-2561',
  },
  'great_lakes': {
    name: 'Great Lakes Educational Loan Services',
    address: 'P.O. Box 7860, Madison, WI 53707-7860',
  },
};

// System prompt for furnisher letter generation
export const FURNISHER_LETTER_SYSTEM_PROMPT = `You are an expert FCRA attorney specializing in furnisher disputes. You generate FCRA-compliant dispute letters sent directly to creditors and collection agencies (furnishers).

Your letters MUST include:

1. **PRIMARY LEGAL AUTHORITY:**
   - FCRA § 1681s-2(b) - Furnisher's duty to investigate disputes forwarded by bureaus
   - FCRA § 1681s-2(a) - Furnisher's duty to report accurate information
   - FDCPA § 1692g - Debt validation rights (for collection agencies)
   - FDCPA § 1692e - Prohibition on false/misleading representations
   - State consumer protection laws where applicable

2. **DIRECT DISPUTE STRATEGY:**
   - Explain that consumer is disputing directly with furnisher
   - Request complete account documentation
   - Demand validation of debt (for collections)
   - Request proof of ownership/assignment chain
   - Challenge accuracy of reported information

3. **DOCUMENTATION DEMANDS:**
   - Original signed credit agreement/contract
   - Complete payment history
   - Chain of assignment (if debt was sold)
   - Proof of balance calculation
   - Date of first delinquency documentation
   - Any and all documents supporting the account

4. **LEGAL CONSEQUENCES:**
   - FCRA § 1681n - Willful noncompliance ($100-$1,000 per violation)
   - FCRA § 1681o - Negligent noncompliance (actual damages)
   - FDCPA violations (for debt collectors)
   - State law violations
   - Attorney's fees and costs

5. **PROFESSIONAL FORMATTING:**
   - Consumer's full address
   - Furnisher's dispute address
   - Date
   - RE: line with account number
   - Body with legal citations
   - Signature block
   - Exhibits list

6. **CLEAR DEMANDS:**
   - Validate the debt with documentation
   - Correct inaccurate information
   - Delete if unable to validate
   - Cease collection activities pending validation
   - Provide written response within 30 days

Tone: Professional, firm, and legally authoritative. These letters go directly to creditors who have legal departments - they must be legally sound.`;

// Build furnisher letter prompt
export function buildFurnisherLetterPrompt(
  userName: string,
  userAddress: string,
  furnisherName: string,
  furnisherAddress: string,
  account: {
    accountNumber: string;
    accountType: string;
    balance: string;
    status: string;
    dateOpened?: string;
    lastActivity?: string;
    originalCreditor?: string;
  },
  disputeReasons: string[],
  isCollectionAgency: boolean
): string {
  return `Generate a FCRA-compliant dispute letter to a ${isCollectionAgency ? 'collection agency' : 'creditor/furnisher'}.

Consumer Information:
- Name: ${userName}
- Address: ${userAddress}

Furnisher Information:
- Name: ${furnisherName}
- Address: ${furnisherAddress}

Account Details:
- Account Number: ${account.accountNumber}
- Account Type: ${account.accountType}
- Reported Balance: $${account.balance}
- Status: ${account.status}
${account.dateOpened ? `- Date Opened: ${account.dateOpened}` : ''}
${account.lastActivity ? `- Last Activity: ${account.lastActivity}` : ''}
${account.originalCreditor ? `- Original Creditor: ${account.originalCreditor}` : ''}

Dispute Reasons:
${disputeReasons.map((reason, i) => `${i + 1}. ${reason}`).join('\n')}

${isCollectionAgency ? `
IMPORTANT: This is a COLLECTION AGENCY. Include:
- FDCPA § 1692g debt validation demand
- Request for complete chain of assignment
- Challenge to their legal authority to collect
- Demand they cease collection until validated
` : ''}

Generate a complete, professional dispute letter that:
1. Opens with legal authority (FCRA § 1681s-2)
2. States the dispute clearly with specific reasons
3. Demands complete documentation
4. Sets 30-day deadline for response
5. Warns of legal consequences for non-compliance
6. Includes proper signature block and exhibits list

Format professionally with proper letterhead and legal citations.`;
}

// Detect furnisher type from name
export function detectFurnisherType(creditorName: string): 'bank' | 'collection' | 'auto' | 'student' | 'medical' | 'other' {
  const name = creditorName.toLowerCase();
  
  // Medical (check before collection since 'Medical Collections' should be medical)
  if (name.includes('medical') || name.includes('hospital') || 
      name.includes('health') || name.includes('medicredit')) {
    return 'medical';
  }
  
  // Collection agencies
  if (name.includes('collection') || name.includes('recovery') || 
      name.includes('midland') || name.includes('lvnv') || 
      name.includes('cavalry') || name.includes('portfolio') ||
      name.includes('convergent') || name.includes('enhanced')) {
    return 'collection';
  }
  
  // Auto
  if (name.includes('auto') || name.includes('motor') || 
      name.includes('toyota') || name.includes('honda') ||
      name.includes('ford') || name.includes('ally')) {
    return 'auto';
  }
  
  // Student loans
  if (name.includes('student') || name.includes('navient') || 
      name.includes('nelnet') || name.includes('great lakes') ||
      name.includes('education') || name.includes('sallie')) {
    return 'student';
  }
  
  // Banks
  if (name.includes('bank') || name.includes('chase') || 
      name.includes('wells') || name.includes('citi') ||
      name.includes('capital one') || name.includes('discover') ||
      name.includes('american express') || name.includes('synchrony')) {
    return 'bank';
  }
  
  return 'other';
}

// Get standard dispute reasons based on account type
export function getStandardDisputeReasons(accountType: string, status: string): string[] {
  const reasons: string[] = [];
  
  // Universal reasons
  reasons.push('I dispute the accuracy of this account as reported to the credit bureaus');
  reasons.push('I request complete validation and documentation of this account');
  
  // Collection-specific
  if (accountType.toLowerCase().includes('collection')) {
    reasons.push('I dispute that this debt is valid and request proof of the original obligation');
    reasons.push('I request the complete chain of assignment showing legal ownership');
    reasons.push('I dispute the reported balance and request itemized accounting');
  }
  
  // Charge-off specific
  if (status.toLowerCase().includes('charge') || status.toLowerCase().includes('off')) {
    reasons.push('I dispute the charge-off status and request documentation of the charge-off date');
    reasons.push('I request proof that proper notification was provided before charge-off');
  }
  
  // Late payment specific
  if (status.toLowerCase().includes('late') || status.toLowerCase().includes('delinquent')) {
    reasons.push('I dispute the reported late payment history');
    reasons.push('I request complete payment records showing all payments received');
  }
  
  return reasons;
}

// Look up furnisher address
export function lookupFurnisherAddress(creditorName: string): { name: string; address: string } | null {
  const name = creditorName.toLowerCase();
  
  for (const [key, value] of Object.entries(FURNISHER_ADDRESSES)) {
    if (name.includes(key.replace('_', ' ')) || name.includes(key)) {
      return {
        name: value.name,
        address: value.disputeAddress || value.address,
      };
    }
  }
  
  return null;
}
