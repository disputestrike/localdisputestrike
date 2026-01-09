import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  GraduationCap,
  Lock,
  Scale,
  Shield,
  Star,
  Target,
  TrendingUp,
  Award,
  Download,
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: "reading" | "quiz";
  content?: string; // Reading content only
}

interface Module {
  id: number;
  moduleId: string;
  title: string;
  description: string;
  duration: string;
  lessons: Lesson[];
  icon: React.ElementType;
}

// Course content - WRITTEN CONTENT ONLY, NO VIDEOS
const modules: Module[] = [
  {
    id: 1,
    moduleId: "module1",
    title: "Understanding Your Credit Report",
    description: "Learn how to read and interpret your credit report from all three bureaus.",
    duration: "30 min",
    icon: FileText,
    lessons: [
      { 
        id: "1-1", 
        title: "What is a Credit Report?", 
        duration: "8 min", 
        type: "reading",
        content: `# What is a Credit Report?

A credit report is a detailed record of your credit history maintained by credit bureaus. It contains information about:

## Key Components

- **Personal Information**: Name, address, SSN, date of birth, employment history
- **Credit Accounts**: Credit cards, loans, mortgages, lines of credit
- **Payment History**: Whether you paid on time, late, or defaulted
- **Inquiries**: Hard inquiries (when you apply for credit) and soft inquiries (pre-approvals)
- **Public Records**: Bankruptcies, tax liens, judgments
- **Negative Items**: Collections, charge-offs, late payments

## Why It Matters

Your credit report directly affects:
- **Interest rates** you qualify for
- **Credit limits** offered to you
- **Loan approval** decisions
- **Insurance rates** in some states
- **Employment** opportunities (for certain positions)

## The Three Bureaus

Each of the three major bureaus (Equifax, Experian, TransUnion) maintains separate credit reports on you. They may contain different information because not all creditors report to all bureaus.`,
      },
      { 
        id: "1-2", 
        title: "The Three Credit Bureaus Explained", 
        duration: "10 min", 
        type: "reading",
        content: `# The Three Credit Bureaus

The three major credit bureaus in the United States are **Equifax**, **Experian**, and **TransUnion**. Each bureau independently collects and maintains credit information about consumers.

## Why Three Bureaus?

Not all creditors report to all three bureaus. This means your credit report may vary between bureaus, which is why checking all three is crucial.

## Key Differences

### Equifax
- Founded in 1899, oldest bureau
- Strong in mortgage data
- Known for detailed payment history records
- Serves over 800 million consumers globally

### Experian
- Largest bureau globally
- Known for detailed employment history
- Strong in alternative data (utility payments, rental history)
- Serves over 1 billion consumers

### TransUnion
- Focuses on fraud prevention and identity verification
- Known for detailed account verification
- Strong in auto loan data
- Serves over 700 million consumers

## Cross-Bureau Conflicts

When the same account shows different information across bureaus (different balances, dates, or statuses), this is called a **cross-bureau conflict** - and it's one of the strongest grounds for dispute.

### Example of Cross-Bureau Conflict
- **Equifax**: Capital One card shows $2,500 balance, last payment 30 days late
- **Experian**: Capital One card shows $2,200 balance, current status
- **TransUnion**: Capital One card shows $2,400 balance, 60 days late

These discrepancies suggest data entry errors or incomplete reporting - perfect grounds for a dispute.`,
      },
      { 
        id: "1-3", 
        title: "How to Get Your Free Credit Reports", 
        duration: "7 min", 
        type: "reading",
        content: `# How to Get Your Free Credit Reports

You have the right to free credit reports from all three bureaus every 12 months under the Fair Credit Reporting Act.

## The Official Way

Visit **AnnualCreditReport.com** - the only official website authorized by the Federal Trade Commission.

### Steps:
1. Go to AnnualCreditReport.com
2. Provide your name, address, SSN, and date of birth
3. Choose which bureau(s) you want reports from
4. Answer security questions to verify your identity
5. Download or print your reports immediately

**Important**: Never pay for your free annual reports. Legitimate sites don't charge.

## What You'll See

Your credit report will include:
- Personal identifying information
- Account history (open and closed accounts)
- Payment history
- Inquiries (both hard and soft)
- Public records and collections
- Dispute information

## Tips for Review

1. **Check for accuracy** - Verify all personal information is correct
2. **Look for unfamiliar accounts** - Could indicate identity theft
3. **Review payment history** - Ensure dates and statuses are accurate
4. **Note discrepancies** - Different information across bureaus
5. **Keep copies** - Save for your records and disputes

## Dispute Directly on the Report

Most credit reports include instructions for disputing information directly with the bureau. You can also dispute online through each bureau's website.`,
      },
      { 
        id: "1-4", 
        title: "Reading Your Credit Report Line by Line", 
        duration: "15 min", 
        type: "reading",
        content: `# Reading Your Credit Report Line by Line

Understanding each section of your credit report is crucial for identifying errors and disputes.

## Personal Information Section

**What to look for:**
- Correct name spelling
- Current address
- Previous addresses (usually last 7 years)
- Employment information
- SSN

**Red flags:**
- Misspelled name
- Wrong address
- Outdated employment
- Incorrect SSN

## Account History Section

This is the most important section. Each account shows:

### Key Fields:
- **Creditor Name**: Who issued the account
- **Account Number**: Usually partially masked
- **Account Type**: Credit card, installment loan, mortgage, etc.
- **Status**: Open, Closed, Current, Late, Charged-off, Collections
- **Balance**: Current amount owed
- **Credit Limit**: Maximum credit available
- **Payment History**: Last 24 months of payment status
- **Date Opened**: When account was opened
- **Date of Last Activity**: Most recent transaction or payment

### Understanding Payment Status Codes:
- **Current**: Account is in good standing
- **30**: Payment 30 days late
- **60**: Payment 60 days late
- **90**: Payment 90 days late
- **120**: Payment 120+ days late
- **Charged-off**: Creditor gave up on collection
- **Collections**: Sent to collection agency
- **Paid**: Account paid in full
- **Closed**: Account closed by consumer or creditor

## Inquiries Section

**Hard Inquiries** (affect credit score):
- Appear when you apply for credit
- Stay on report for 2 years
- Multiple inquiries in short time = one impact

**Soft Inquiries** (don't affect score):
- Pre-approvals, account reviews
- Don't appear to other creditors

## Public Records Section

Serious negative items:
- **Bankruptcies**: Chapter 7, 11, or 13
- **Tax Liens**: Unpaid federal/state taxes
- **Judgments**: Court ordered debt
- **Foreclosures**: Home repossession

## Collections Section

Accounts sent to collection agencies:
- Shows original creditor and collection agency
- Amount owed
- Date of charge-off
- Collection status

## Dispute Information Section

Shows any disputes you've filed and their status:
- **Under Investigation**: Bureau investigating
- **Verified**: Bureau confirmed information is accurate
- **Deleted**: Information removed from report
- **Not Found**: Bureau couldn't verify information`,
      },
      { id: "1-5", title: "Module 1 Quiz", duration: "10 min", type: "quiz" },
    ],
  },
  {
    id: 2,
    moduleId: "module2",
    title: "Your Rights Under the FCRA",
    description: "Master the Fair Credit Reporting Act and your consumer rights.",
    duration: "45 min",
    icon: Scale,
    lessons: [
      { 
        id: "2-1", 
        title: "Introduction to the FCRA", 
        duration: "10 min", 
        type: "reading",
        content: `# Introduction to the FCRA

The Fair Credit Reporting Act (FCRA) is the federal law that protects your rights as a consumer regarding credit reporting.

## What is the FCRA?

Enacted in 1970, the FCRA (15 U.S.C. § 1681 et seq.) regulates:
- How credit bureaus collect and maintain information
- What information they can report
- How long information stays on your report
- Your rights to dispute inaccurate information
- Penalties for violations

## Your Key Rights Under FCRA

1. **Right to Know** - Access your credit reports free annually
2. **Right to Dispute** - Challenge inaccurate information
3. **Right to Investigation** - Bureaus must investigate disputes
4. **Right to Correction** - Inaccurate info must be corrected or deleted
5. **Right to Notification** - Be told about negative information
6. **Right to Limit Use** - Restrict who can see your report
7. **Right to Sue** - Take legal action for violations

## Time Limits for Negative Information

Most negative information falls off your report after 7 years:
- **Late payments**: 7 years from first delinquency
- **Charge-offs**: 7 years from charge-off date
- **Collections**: 7 years from original delinquency date
- **Bankruptcies**: 7-10 years depending on type
- **Hard inquiries**: 2 years
- **Tax liens**: 7 years (or longer if unpaid)
- **Judgments**: 7 years (varies by state)

## Violations and Penalties

The FCRA provides strong remedies for violations:
- Statutory damages: $100-$1,000 per violation
- Actual damages: Whatever you can prove you lost
- Punitive damages: Additional punishment
- Attorney's fees and costs

This makes FCRA violations serious - bureaus and creditors know they face real consequences.`,
      },
      { 
        id: "2-2", 
        title: "FCRA § 611 - Your Right to Dispute", 
        duration: "12 min", 
        type: "reading",
        content: `# FCRA § 611 - Your Right to Dispute

Section 611 of the Fair Credit Reporting Act (15 U.S.C. § 1681i) is your most powerful tool. It gives you the legal right to dispute any information you believe is inaccurate, incomplete, or unverifiable.

## The 30-Day Rule

This is the most important rule in credit disputes. Credit bureaus MUST:

1. **Receive your dispute** - In writing, with your name and address
2. **Conduct reasonable investigation** - Within 30 days
3. **Forward information to furnisher** - Send your dispute to the creditor
4. **Review and consider** - Look at all information you submit
5. **Delete or modify** - If information can't be verified
6. **Notify you in writing** - Send results within 30 days

## What Constitutes a Valid Dispute?

Your dispute must:
- Be in writing (letter, email, or online form)
- Include your name and address
- Clearly identify the disputed item(s)
- Explain why you believe it's inaccurate
- Include supporting documentation (optional but recommended)

## Your Rights During Investigation

You have the right to:
- Request the method of verification used
- Ask for copies of verification documents
- Submit additional information
- Request re-investigation if new evidence emerges

## What Happens After Investigation

**If information is verified:**
- Bureau notifies you in writing
- Item remains on your report
- You can dispute again with new evidence

**If information cannot be verified:**
- Bureau must delete it
- Bureau must notify you
- Item is removed from your report

**If information is found to be inaccurate:**
- Bureau must correct it
- Bureau must notify you
- Corrected information is reported to other bureaus

## Reinvestigation Rights

You can dispute the same item multiple times if:
- You have new evidence
- You believe the previous investigation was inadequate
- The item has changed status

## Important: Furnisher Obligations

Under FCRA § 611(b), the creditor (furnisher) who reported the information must:
- Investigate your dispute
- Report findings to the bureau
- Correct or delete if found inaccurate
- Notify you of results

This means both the bureau AND the creditor must respond to your dispute.`,
      },
      { 
        id: "2-3", 
        title: "FCRA § 1681n & 1681o - Penalties for Violations", 
        duration: "10 min", 
        type: "reading",
        content: `# FCRA Penalties for Violations

The FCRA provides strong penalties for credit bureaus and furnishers who violate your rights. Understanding these penalties helps you understand why bureaus take disputes seriously.

## § 1681n - Willful Noncompliance

For **intentional** violations (the bureau knew or should have known they were violating the law):

### Damages Available:
- **Statutory damages**: $100 to $1,000 per violation
- **Actual damages**: Whatever you can prove you lost (lost wages, emotional distress, etc.)
- **Punitive damages**: Additional punishment for egregious behavior
- **Attorney's fees and costs**: The violator pays your lawyer's fees

### Examples of Willful Violations:
- Failing to investigate a dispute
- Failing to delete information after 30 days
- Ignoring your dispute letters
- Continuing to report inaccurate information

## § 1681o - Negligent Noncompliance

For **careless** violations (the bureau was negligent but not intentional):

### Damages Available:
- **Actual damages**: What you can prove you lost
- **Attorney's fees and costs**
- **No statutory damages** (unlike willful violations)

### Examples of Negligent Violations:
- Failing to properly investigate
- Clerical errors in investigation
- Inadequate verification procedures

## Real-World Examples

### Major FCRA Settlements:
- **Equifax**: $700 million settlement (2019) for data breach and FCRA violations
- **TransUnion**: $18.6 million class action settlement for FCRA violations
- **Experian**: Multiple settlements for inaccurate reporting

### Individual Awards:
- Consumers routinely win $5,000 - $100,000+ per case
- Some awards exceed $1 million for egregious violations
- Average successful claim: $10,000 - $50,000

## Why This Matters for Your Disputes

When you cite FCRA § 611 in your dispute letters:
- Bureaus know you understand your rights
- They know violations carry real consequences
- They're more likely to thoroughly investigate
- They're more motivated to delete inaccurate information

This is why professional dispute letters reference specific FCRA sections - it shows you're serious and knowledgeable.`,
      },
      { 
        id: "2-4", 
        title: "The 30-Day Investigation Timeline", 
        duration: "8 min", 
        type: "reading",
        content: `# The 30-Day Investigation Timeline

Understanding the 30-day timeline is crucial for tracking your disputes and knowing when to follow up.

## Day 1: You Send Your Dispute

**What you do:**
- Send written dispute to credit bureau
- Include your name, address, and specific items disputed
- Provide reason for dispute
- Include supporting documentation if available

**What the bureau does:**
- Receives and logs your dispute
- Assigns a dispute reference number
- Begins investigation process

## Days 1-5: Bureau Forwards to Creditor

**What the bureau does:**
- Forwards your dispute to the creditor (furnisher)
- Includes your dispute letter and documentation
- Requests investigation and response

**What the creditor does:**
- Receives dispute from bureau
- Begins investigation on their end
- Gathers documentation

## Days 5-25: Investigation Period

**What happens:**
- Bureau investigates the dispute
- Creditor investigates the dispute
- Both sides review documentation
- Verification procedures are conducted

**What you should do:**
- Keep copies of everything sent
- Note the date you sent dispute
- Track the 30-day deadline
- Prepare follow-up documentation if needed

## Day 30: Bureau Must Respond

**What the bureau MUST do:**
- Send you written results
- Notify you of investigation findings
- Tell you if item was deleted, verified, or corrected
- Provide new credit report if item was changed

**What happens to the item:**
- **Deleted**: Removed from your report (best outcome)
- **Verified**: Confirmed as accurate, stays on report
- **Corrected**: Updated with accurate information
- **Not found**: Item couldn't be located, removed

## After Day 30: Your Options

**If item was deleted or corrected:**
- Congratulations! Dispute was successful
- Monitor your report to ensure change sticks
- Consider disputing other items

**If item was verified:**
- You can dispute again with new evidence
- Request method of verification used
- Ask for copies of verification documents
- Consider hiring a credit attorney

**If you disagree with results:**
- You can add a dispute statement to your report
- You can dispute again if new evidence emerges
- You can file a complaint with CFPB
- You can consult an attorney

## Important: The 30-Day Rule is Strict

The 30 days is a legal requirement. Bureaus that miss this deadline are in violation of FCRA § 611. If a bureau fails to respond within 30 days:
- They must delete the item
- You have grounds for legal action
- This is a willful violation (higher damages)

**Pro Tip**: Send your dispute via certified mail with return receipt. This creates proof of when the bureau received it, protecting your 30-day timeline.`,
      },
      { id: "2-5", title: "Module 2 Quiz", duration: "10 min", type: "quiz" },
    ],
  },
  {
    id: 3,
    moduleId: "module3",
    title: "Identifying Errors and Disputes",
    description: "Learn to spot common credit report errors and dispute them effectively.",
    duration: "40 min",
    icon: Target,
    lessons: [
      { 
        id: "3-1", 
        title: "Common Credit Report Errors", 
        duration: "12 min", 
        type: "reading",
        content: `# Common Credit Report Errors

Credit reports contain errors more often than you'd think. Studies show that 1 in 4 consumers have errors on their credit reports. Here are the most common ones.

## Identity Errors

### Wrong Personal Information
- Misspelled name
- Wrong address
- Incorrect SSN
- Wrong date of birth
- Confused with someone else (especially common with similar names)

**How to dispute**: Request correction of personal information. This is usually quick to fix.

### Mixed Files
- Information from someone else on your report
- Common with similar names or SSNs
- Can significantly damage your credit

**How to dispute**: Request investigation and separation of files. Include proof of identity.

## Account Errors

### Accounts Not Yours
- Fraudulent accounts (identity theft)
- Accounts opened in error
- Accounts belonging to someone else

**How to dispute**: "This account is not mine" or "I did not authorize this account."

### Incorrect Account Status
- Shows as "Charged-off" when you paid it
- Shows as "Collections" when settled
- Shows as "Late" when you paid on time
- Shows as "Open" when you closed it

**How to dispute**: Provide proof of payment or settlement. Include payment receipts or bank statements.

### Wrong Balance
- Shows higher balance than owed
- Shows balance when account was paid off
- Includes duplicate charges

**How to dispute**: Provide account statements showing correct balance. Request verification of balance.

### Wrong Payment History
- Shows late payments you made on time
- Shows payments as missed when you paid
- Shows multiple late payments for single incident

**How to dispute**: Provide bank statements or payment receipts proving timely payment.

## Reporting Errors

### Re-aging
- Negative item reappears after 7 years
- Payment date updated to recent date
- Extends reporting period illegally

**How to dispute**: "This item is beyond the 7-year reporting period" or "This item has been re-aged."

### Duplicate Reporting
- Same account reported twice
- Same negative item reported by multiple entities
- Inflates negative impact on score

**How to dispute**: "This is a duplicate of [other account]" or "This account is already reported."

### Wrong Dates
- Charge-off date is wrong
- Delinquency date is wrong
- Date of last activity is wrong

**How to dispute**: Provide documentation showing correct dates. Request verification.

## Cross-Bureau Conflicts

### Conflicting Information Across Bureaus
- Different balances on same account
- Different payment statuses
- Different delinquency dates
- One bureau shows account, others don't

**Why this matters**: Cross-bureau conflicts are strong evidence of errors and grounds for deletion.

**How to dispute**: "This information conflicts with [other bureau's report]" and attach copies of both reports.

## Zombie Debts

### Debts That Won't Die
- Accounts that should have fallen off after 7 years
- Accounts that were discharged in bankruptcy
- Accounts that were settled but still showing as active

**How to dispute**: "This account was included in bankruptcy" or "This account is beyond the 7-year reporting period."

## Statute of Limitations Issues

### Debts Beyond Collection Period
- Accounts still reporting after statute of limitations expired
- Debts that can't be legally collected but still on report
- Old accounts that should be deleted

**How to dispute**: "This debt is beyond the statute of limitations" with documentation.`,
      },
      { 
        id: "3-2", 
        title: "How to Spot Cross-Bureau Conflicts", 
        duration: "10 min", 
        type: "reading",
        content: `# How to Spot Cross-Bureau Conflicts

Cross-bureau conflicts are one of the strongest grounds for dispute. When the same account shows different information across bureaus, it indicates errors.

## What is a Cross-Bureau Conflict?

A cross-bureau conflict occurs when the same account shows different information on different credit bureaus' reports.

## Common Types of Conflicts

### Balance Conflicts
**Example:**
- Equifax: Capital One card shows $2,500 balance
- Experian: Capital One card shows $2,200 balance
- TransUnion: Capital One card shows $2,400 balance

**What it means**: One (or more) of these is wrong. The bureaus are reporting different information.

### Status Conflicts
**Example:**
- Equifax: Account shows "Current"
- Experian: Account shows "30 days late"
- TransUnion: Account shows "Charged-off"

**What it means**: The account can't be all three statuses. At least two are wrong.

### Date Conflicts
**Example:**
- Equifax: Last payment date was 2024-12-15
- Experian: Last payment date was 2024-11-20
- TransUnion: Last payment date was 2024-12-01

**What it means**: Only one date can be correct. The others are errors.

### Account Existence Conflicts
**Example:**
- Equifax: Shows Chase credit card account
- Experian: Shows Chase credit card account
- TransUnion: Does NOT show Chase credit card account

**What it means**: Either TransUnion is missing the account, or the other two have an error.

## Why Cross-Bureau Conflicts Matter

### Proof of Error
Cross-bureau conflicts prove that at least one (usually more) of the bureaus has inaccurate information. This is powerful evidence in a dispute.

### Stronger Dispute Grounds
When you cite a cross-bureau conflict in your dispute letter, you're providing objective evidence that something is wrong.

### Higher Deletion Rates
Disputes citing cross-bureau conflicts have higher success rates because the evidence is clear.

## How to Identify Conflicts

### Step 1: Get All Three Reports
- Visit AnnualCreditReport.com
- Order reports from all three bureaus
- Download or print immediately

### Step 2: Create a Comparison Chart
Make a spreadsheet with columns for:
- Account name
- Equifax info
- Experian info
- TransUnion info
- Conflicts noted

### Step 3: Compare Line by Line
For each account, compare:
- Account status (Current, Late, Charged-off, etc.)
- Balance
- Credit limit
- Last payment date
- Date opened
- Payment history

### Step 4: Document Conflicts
For each conflict found:
- Note which bureaus differ
- Note what the difference is
- Mark as potential dispute ground

### Step 5: Prioritize Disputes
Dispute items with:
- Conflicts across all three bureaus (strongest)
- Conflicts across two bureaus (strong)
- Items that are clearly wrong (moderate)

## Example Dispute Letter Using Cross-Bureau Conflict

"I dispute the Capital One credit card account reported on my credit report. This account shows conflicting information across the three bureaus:

- Equifax: $2,500 balance, Current status
- Experian: $2,200 balance, 30 days late
- TransUnion: $2,400 balance, Charged-off

Since these three bureaus report conflicting information about the same account, at least two of these reports must be inaccurate. I request that you investigate and correct this account to reflect accurate information. Please verify the current balance and status with the creditor."

This type of letter is very effective because it provides clear evidence of errors.`,
      },
      { 
        id: "3-3", 
        title: "Building Your Dispute Strategy", 
        duration: "10 min", 
        type: "reading",
        content: `# Building Your Dispute Strategy

A successful dispute strategy involves more than just sending letters. Here's how to approach it strategically.

## Phase 1: Assessment

### Gather Information
1. Get all three credit reports
2. Identify all negative items
3. Note any errors or conflicts
4. Prioritize items by impact on score

### Prioritize Your Disputes
Focus on:
- **High impact items**: Charge-offs, collections, late payments
- **Clear errors**: Wrong dates, wrong amounts, accounts not yours
- **Cross-bureau conflicts**: Different info across bureaus
- **Recent items**: More recent items have bigger score impact

### Avoid Disputing Everything
- Dispute only items you believe are inaccurate
- Disputing everything looks like "dispute bombing" and may be ignored
- Focus on 3-5 strong disputes first

## Phase 2: Documentation

### Gather Supporting Evidence
- Payment receipts
- Bank statements
- Settlement agreements
- Proof of identity
- Correspondence with creditors

### Create a Dispute File
- Keep organized records
- Note dates and reference numbers
- Save all correspondence
- Document everything in writing

## Phase 3: Dispute Submission

### Choose Your Method
- **Online**: Fastest, but less documented
- **Mail**: Slower, but creates paper trail
- **Certified mail**: Recommended, creates proof of delivery

### Write Effective Dispute Letters
- Be specific about what you're disputing
- Explain why you believe it's inaccurate
- Reference FCRA § 611
- Include supporting documentation
- Keep copies of everything

### Send to Correct Address
- Send to dispute department (not main address)
- Include your account number if applicable
- Request return receipt if mailing

## Phase 4: Follow-Up

### Track the 30-Day Timeline
- Mark calendar for day 30
- If no response by day 30, follow up
- Bureau must respond within 30 days

### Prepare for Responses
- Item may be verified (stays on report)
- Item may be deleted (removed from report)
- Item may be corrected (updated with accurate info)

### Second Round Disputes
If item is verified:
- Request method of verification
- Ask for copies of verification documents
- Dispute again if new evidence emerges

## Phase 5: Escalation (If Needed)

### If Disputes Aren't Working
- File complaint with CFPB
- Consult with credit attorney
- Consider legal action for FCRA violations

### When to Get a Lawyer
- Multiple disputes ignored
- Inaccurate information persists
- Clear FCRA violations
- Significant damage to credit

## Timeline for Results

### Realistic Expectations
- First round: 30-60 days
- Second round: 30-60 days
- Third round: 30-60 days
- Total process: 3-6 months typically

### Monitoring Progress
- Check credit report monthly
- Note any changes
- Document everything
- Celebrate deletions!

## Key Success Factors

1. **Be organized**: Keep detailed records
2. **Be persistent**: Follow up if needed
3. **Be specific**: Don't be vague in disputes
4. **Be documented**: Include supporting evidence
5. **Be patient**: Process takes time
6. **Be professional**: Keep tone respectful but firm`,
      },
      { id: "3-4", title: "Module 3 Quiz", duration: "10 min", type: "quiz" },
    ],
  },
];

export default function CreditEducation() {
  const { isAuthenticated } = useAuth();
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  // TODO: Add education router endpoints
  // const completeLesson = trpc.education.completeLesson.useMutation();
  // const { data: progress } = trpc.education.getProgress.useQuery();
  const progress = { completedLessons: Array.from(completedLessons) };

  useEffect(() => {
    if (progress?.completedLessons) {
      setCompletedLessons(new Set(progress.completedLessons as string[]));
    }
  }, [progress]);

  const handleCompleteLesson = async (lesson: Lesson, moduleId: string) => {
    try {
      // TODO: Implement completeLesson mutation
      // await completeLesson.mutateAsync({
      //   lessonId: lesson.id,
      //   moduleId,
      // });
      const newSet = new Set(completedLessons);
      newSet.add(lesson.id);
      setCompletedLessons(newSet);
      toast.success(`Completed: ${lesson.title}`);
    } catch (error) {
      toast.error("Failed to mark lesson as complete");
    }
  };

  const isLessonCompleted = (lessonId: string) => completedLessons.has(lessonId);

  const calculateProgress = () => {
    const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
    return Math.round((completedLessons.size / totalLessons) * 100);
  };



  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-orange-500" />
            Credit Education Course
          </h1>
          <p className="text-gray-600 mt-2">
            Master credit repair, FCRA law, and dispute strategies. Written content only.
          </p>
        </div>

        {/* Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your Progress</span>
              <Badge variant="outline">{calculateProgress()}% Complete</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={calculateProgress()} className="h-2" />
            <p className="text-sm text-gray-600 mt-3">
              {completedLessons.size} of {modules.reduce((sum, m) => sum + m.lessons.length, 0)} lessons completed
            </p>
          </CardContent>
        </Card>

        {/* Modules */}
        <div className="space-y-4">
          {modules.map((module) => (
            <Card key={module.id}>
              <CardHeader
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedModule(expandedModule === module.moduleId ? null : module.moduleId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <module.icon className="h-6 w-6 text-orange-500" />
                    <div>
                      <CardTitle>{module.title}</CardTitle>
                      <p className="text-sm text-gray-600">{module.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{module.duration}</Badge>
                    {expandedModule === module.moduleId ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                  </div>
                </div>
              </CardHeader>

              {expandedModule === module.moduleId && (
                <CardContent className="space-y-3 border-t pt-4">
                  {module.lessons.map((lesson) => {
                    const isCompleted = isLessonCompleted(lesson.id);
                    return (
                      <div key={lesson.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : lesson.type === "quiz" ? (
                            <GraduationCap className="h-5 w-5 text-gray-400" />
                          ) : (
                            <FileText className="h-5 w-5 text-gray-400" />
                          )}
                          <div>
                            <p className={`font-medium ${isCompleted ? "text-green-700" : ""}`}>
                              {lesson.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {lesson.type === "quiz" ? "Quiz" : "Reading"} • {lesson.duration}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveLesson(lesson)}
                          >
                            {lesson.type === "quiz" ? (
                              <>
                                <GraduationCap className="h-4 w-4 mr-1" />
                                Take Quiz
                              </>
                            ) : (
                              <>
                                <FileText className="h-4 w-4 mr-1" />
                                Read
                              </>
                            )}
                          </Button>
                          {!isCompleted && lesson.type !== "quiz" && (
                            <Button
                              size="sm"
                              onClick={() => handleCompleteLesson(lesson, module.moduleId)}
                              disabled={false}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Lesson Modal */}
      {activeLesson && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-lg">{activeLesson.title}</h3>
              <Button variant="ghost" size="sm" onClick={() => setActiveLesson(null)}>
                ✕
              </Button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {activeLesson.type === "reading" && activeLesson.content && (
                <div className="prose prose-blue max-w-none">
                  <div dangerouslySetInnerHTML={{ 
                    __html: activeLesson.content
                      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
                      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
                      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
                      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>')
                      .replace(/\n\n/g, '</p><p class="mb-4">')
                  }} />
                </div>
              )}
              {activeLesson.type === "quiz" && (
                <div className="text-center py-12">
                  <GraduationCap className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Ready for the Quiz?</h3>
                  <p className="text-gray-600 mb-6">
                    Test your knowledge from this module. You need 70% to pass.
                  </p>
                  <Link href={`/dashboard/quiz/${activeLesson.id}`}>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Start Quiz
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => setActiveLesson(null)}>
                Close
              </Button>
              {!isLessonCompleted(activeLesson.id) && activeLesson.type !== "quiz" && (
                <Button 
                  onClick={() => {
                    const module = modules.find(m => m.lessons.some(l => l.id === activeLesson.id));
                    if (module) {
                      handleCompleteLesson(activeLesson, module.moduleId);
                    }
                    setActiveLesson(null);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Complete
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
