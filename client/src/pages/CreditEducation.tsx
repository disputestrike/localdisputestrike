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
  PlayCircle,
  Scale,
  Shield,
  Star,
  Target,
  TrendingUp,
  Award,
  Download,
  ExternalLink,
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: "video" | "reading" | "quiz";
  videoUrl?: string; // YouTube embed URL
  content?: string; // Reading content
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

// Course content with embedded videos
const modules: Module[] = [
  {
    id: 1,
    moduleId: "module1",
    title: "Understanding Your Credit Report",
    description: "Learn how to read and interpret your credit report from all three bureaus.",
    duration: "45 min",
    icon: FileText,
    lessons: [
      { 
        id: "1-1", 
        title: "What is a Credit Report?", 
        duration: "8 min", 
        type: "video",
        videoUrl: "https://www.youtube.com/embed/aXvjuXKiP0c", // Credit report basics
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

- **Equifax**: Founded in 1899, oldest bureau. Strong in mortgage data.
- **Experian**: Largest bureau globally. Known for detailed employment history.
- **TransUnion**: Focuses on fraud prevention and identity verification.

## Cross-Bureau Conflicts

When the same account shows different information across bureaus (different balances, dates, or statuses), this is called a **cross-bureau conflict** - and it's one of the strongest grounds for dispute.`,
      },
      { 
        id: "1-3", 
        title: "How to Get Your Free Credit Reports", 
        duration: "5 min", 
        type: "video",
        videoUrl: "https://www.youtube.com/embed/HZGCoVF3YvM", // Free credit report
      },
      { 
        id: "1-4", 
        title: "Reading Your Credit Report Line by Line", 
        duration: "15 min", 
        type: "video",
        videoUrl: "https://www.youtube.com/embed/wPwvzuEBBfE", // Reading credit report
      },
      { id: "1-5", title: "Module 1 Quiz", duration: "7 min", type: "quiz" },
    ],
  },
  {
    id: 2,
    moduleId: "module2",
    title: "Your Rights Under the FCRA",
    description: "Master the Fair Credit Reporting Act and your consumer rights.",
    duration: "60 min",
    icon: Scale,
    lessons: [
      { 
        id: "2-1", 
        title: "Introduction to the FCRA", 
        duration: "10 min", 
        type: "video",
        videoUrl: "https://www.youtube.com/embed/KJnPLWgLT3o", // FCRA overview
      },
      { 
        id: "2-2", 
        title: "FCRA § 611 - Your Right to Dispute", 
        duration: "12 min", 
        type: "reading",
        content: `# FCRA § 611 - Your Right to Dispute

Under Section 611 of the Fair Credit Reporting Act (15 U.S.C. § 1681i), you have the legal right to dispute any information in your credit report that you believe is inaccurate, incomplete, or unverifiable.

## The 30-Day Rule

Credit bureaus MUST:
1. Conduct a reasonable investigation within **30 days**
2. Forward all relevant information to the furnisher
3. Review and consider all information you submit
4. Delete or modify information that cannot be verified

## Your Rights Include:

- **Free disputes** - No charge to dispute
- **Written response** - Bureau must send results in writing
- **Method of Verification** - You can request how they verified the information
- **Reinvestigation** - You can dispute again with new information

## Penalties for Violations

Under FCRA § 1681n, willful noncompliance can result in:
- $100 to $1,000 per violation
- Actual damages
- Punitive damages
- Attorney's fees`,
      },
      { 
        id: "2-3", 
        title: "FCRA § 1681i - Investigation Requirements", 
        duration: "10 min", 
        type: "video",
        videoUrl: "https://www.youtube.com/embed/Zy8RoiQDaRU", // Dispute process
      },
      { 
        id: "2-4", 
        title: "FCRA § 1681n & 1681o - Penalties for Violations", 
        duration: "8 min", 
        type: "reading",
        content: `# FCRA Penalties for Violations

The FCRA provides strong penalties for credit bureaus and furnishers who violate your rights.

## § 1681n - Willful Noncompliance

For **intentional** violations:
- **Statutory damages**: $100 - $1,000 per violation
- **Actual damages**: Whatever you can prove you lost
- **Punitive damages**: Additional punishment for bad behavior
- **Attorney's fees and costs**: The violator pays your lawyer

## § 1681o - Negligent Noncompliance

For **careless** violations:
- **Actual damages**: What you can prove you lost
- **Attorney's fees and costs**

## Real Examples

- Consumer wins $1.5 million against Equifax for failing to correct errors
- $18.6 million class action against TransUnion for FCRA violations
- Individual awards of $5,000 - $100,000 are common

## Why This Matters

These penalties give your dispute letters teeth. When you cite these sections, bureaus know you understand your rights.`,
      },
      { 
        id: "2-5", 
        title: "The 30-Day Rule and Your Rights", 
        duration: "10 min", 
        type: "video",
        videoUrl: "https://www.youtube.com/embed/9YLzlIsGdHo", // 30 day rule
      },
      { id: "2-6", title: "Module 2 Quiz", duration: "10 min", type: "quiz" },
    ],
  },
  {
    id: 3,
    moduleId: "module3",
    title: "Identifying Errors and Inaccuracies",
    description: "Learn to spot common errors that can be disputed on your credit report.",
    duration: "50 min",
    icon: Target,
    lessons: [
      { 
        id: "3-1", 
        title: "Common Credit Report Errors", 
        duration: "12 min", 
        type: "video",
        videoUrl: "https://www.youtube.com/embed/rI7MnZPT9Uw", // Common errors
      },
      { 
        id: "3-2", 
        title: "Cross-Bureau Conflicts Explained", 
        duration: "10 min", 
        type: "reading",
        content: `# Cross-Bureau Conflicts

Cross-bureau conflicts occur when the same account shows **different information** across the three credit bureaus. These are among the strongest grounds for dispute.

## Types of Conflicts

### Balance Conflicts
- Equifax shows: $5,000
- Experian shows: $4,200
- TransUnion shows: $5,500

**Both can't be right!**

### Date Conflicts
- Different dates opened
- Different last activity dates
- Different charge-off dates

### Status Conflicts
- One bureau shows "Paid"
- Another shows "Charged Off"
- Third shows "In Collections"

## Why Conflicts Are Powerful

Under FCRA § 1681e(b), bureaus must follow "reasonable procedures to assure maximum possible accuracy." When bureaus report conflicting information, at least one (possibly all) is inaccurate.

## How to Use Conflicts

In your dispute letter:
1. Document the conflict with screenshots
2. Cite the specific discrepancy
3. Demand deletion since accuracy cannot be verified
4. Request Method of Verification`,
      },
      { 
        id: "3-3", 
        title: "Balance Discrepancies", 
        duration: "8 min", 
        type: "video",
        videoUrl: "https://www.youtube.com/embed/aXvjuXKiP0c", // Balance issues
      },
      { 
        id: "3-4", 
        title: "Date and Status Conflicts", 
        duration: "8 min", 
        type: "video",
        videoUrl: "https://www.youtube.com/embed/HZGCoVF3YvM", // Date conflicts
      },
      { 
        id: "3-5", 
        title: "Re-Aging Violations", 
        duration: "7 min", 
        type: "reading",
        content: `# Re-Aging Violations

Re-aging is the **illegal practice** of updating the date of first delinquency (DOFD) to make an old debt appear newer, keeping it on your credit report longer than allowed.

## The 7-Year Rule

Under FCRA § 1681c, most negative items must be removed after **7 years** from the date of first delinquency.

## Signs of Re-Aging

- Date of first delinquency keeps changing
- Account shows recent activity but you haven't used it
- Collection account shows newer date than original account
- Debt sold to new collector with "new" date

## Re-Aging is Illegal

Re-aging violates:
- FCRA § 1681c (reporting period limits)
- FCRA § 1681s-2(a)(5) (furnisher duties)
- State consumer protection laws

## How to Fight Re-Aging

1. Document the original DOFD from old reports
2. Compare to current reporting
3. Cite the violation in your dispute
4. Report to CFPB if not corrected`,
      },
      { id: "3-6", title: "Module 3 Quiz", duration: "5 min", type: "quiz" },
    ],
  },
  {
    id: 4,
    moduleId: "module4",
    title: "The Dispute Process",
    description: "Step-by-step guide to disputing inaccurate information.",
    duration: "55 min",
    icon: Shield,
    lessons: [
      { 
        id: "4-1", 
        title: "Preparing Your Dispute", 
        duration: "10 min", 
        type: "video",
        videoUrl: "https://www.youtube.com/embed/Zy8RoiQDaRU", // Preparing disputes
      },
      { 
        id: "4-2", 
        title: "Writing Effective Dispute Letters", 
        duration: "15 min", 
        type: "reading",
        content: `# Writing Effective Dispute Letters

A well-crafted dispute letter is your most powerful tool. Here's how to write one that gets results.

## Essential Elements

### 1. Your Information
- Full legal name
- Current address
- Date of birth
- Last 4 of SSN

### 2. Account Identification
- Creditor name
- Account number
- The specific error

### 3. Legal Citations
- FCRA § 1681i(a)(1)(A) - Right to dispute
- FCRA § 1681i(a)(5)(A) - Delete unverifiable info
- FCRA § 1681s-2(b) - Furnisher investigation duty

### 4. Specific Demands
- Investigation within 30 days
- Written results
- Method of Verification
- Deletion if unverifiable

## What NOT to Do

❌ Don't use templates word-for-word
❌ Don't dispute everything at once
❌ Don't be vague about the error
❌ Don't forget to sign in blue ink
❌ Don't send without certified mail

## Pro Tips

✅ Be specific about what's wrong
✅ Include supporting documents
✅ Keep copies of everything
✅ Send certified mail with return receipt
✅ Track your 30-day deadline`,
      },
      { 
        id: "4-3", 
        title: "What to Include with Your Dispute", 
        duration: "8 min", 
        type: "video",
        videoUrl: "https://www.youtube.com/embed/wPwvzuEBBfE", // Supporting docs
      },
      { 
        id: "4-4", 
        title: "Mailing Your Dispute (Certified Mail)", 
        duration: "10 min", 
        type: "video",
        videoUrl: "https://www.youtube.com/embed/9YLzlIsGdHo", // Certified mail
      },
      { 
        id: "4-5", 
        title: "Tracking Your Dispute", 
        duration: "7 min", 
        type: "reading",
        content: `# Tracking Your Dispute

Proper tracking is essential for enforcing your rights and building a paper trail for potential litigation.

## What to Track

### Mailing Information
- Date mailed
- Certified mail tracking number
- Return receipt (green card)
- Delivery confirmation date

### Timeline
- Day 1: Date bureau receives your dispute
- Day 30: Investigation deadline
- Day 35: Results must be mailed

### Response Tracking
- Date response received
- What they investigated
- What they verified/deleted
- Method of Verification (if requested)

## Creating Your Dispute Log

| Date | Action | Tracking # | Notes |
|------|--------|-----------|-------|
| 1/1 | Mailed to Equifax | 1234... | Certified |
| 1/5 | Delivered | - | Green card received |
| 2/4 | Deadline | - | 30 days |
| 2/10 | Response received | - | Verified as accurate |

## If They Miss the Deadline

If the bureau doesn't respond within 30 days:
1. The disputed item MUST be deleted
2. Send a follow-up demanding deletion
3. File CFPB complaint
4. Consider legal action`,
      },
      { id: "4-6", title: "Module 4 Quiz", duration: "5 min", type: "quiz" },
    ],
  },
  {
    id: 5,
    moduleId: "module5",
    title: "Escalation Strategies",
    description: "What to do when your initial dispute doesn't work.",
    duration: "45 min",
    icon: TrendingUp,
    lessons: [
      { 
        id: "5-1", 
        title: "Understanding Bureau Responses", 
        duration: "10 min", 
        type: "video",
        videoUrl: "https://www.youtube.com/embed/KJnPLWgLT3o", // Bureau responses
      },
      { 
        id: "5-2", 
        title: "Round 2: Method of Verification Requests", 
        duration: "12 min", 
        type: "reading",
        content: `# Method of Verification (MOV) Requests

When your initial dispute comes back "verified," your next step is to demand the Method of Verification.

## What is MOV?

Under FCRA § 1681i(a)(7), you have the right to know:
- WHO verified the information
- HOW they verified it
- WHAT documents they reviewed

## Why MOV Matters

Most "verifications" are just automated e-OSCAR responses. The bureau clicks a button, the furnisher clicks "verified," and no real investigation happens.

## Your MOV Letter Should:

1. Reference your original dispute
2. Cite FCRA § 1681i(a)(7)
3. Demand specific documentation:
   - Name of person who verified
   - Date of verification
   - Documents reviewed
   - Contact information for verifier

## What to Look For

Red flags in MOV responses:
- Generic "we verified with the furnisher"
- No specific person named
- No documents provided
- Response within 1-2 days (too fast for real investigation)

## Using MOV in Round 3

If the MOV shows inadequate investigation, your Round 3 letter can cite this as evidence of FCRA violations.`,
      },
      { 
        id: "5-3", 
        title: "Round 3: Intent to Litigate Letters", 
        duration: "10 min", 
        type: "video",
        videoUrl: "https://www.youtube.com/embed/rI7MnZPT9Uw", // Intent to litigate
      },
      { 
        id: "5-4", 
        title: "Filing a CFPB Complaint", 
        duration: "8 min", 
        type: "reading",
        content: `# Filing a CFPB Complaint

The Consumer Financial Protection Bureau (CFPB) is a powerful ally in your credit dispute journey.

## When to File

File a CFPB complaint when:
- Bureau doesn't respond within 30 days
- Bureau doesn't investigate properly
- Furnisher refuses to correct errors
- You've exhausted direct disputes

## How to File

1. Go to consumerfinance.gov/complaint
2. Select "Credit reporting"
3. Provide detailed information:
   - What happened
   - What you've tried
   - What you want to happen

## What Happens Next

- CFPB forwards complaint to company
- Company must respond within 15 days
- You can review and dispute their response
- CFPB tracks patterns of violations

## CFPB Complaint Tips

✅ Be specific and factual
✅ Include dates and tracking numbers
✅ Attach supporting documents
✅ State what resolution you want
✅ Keep copies of everything

## Success Rates

CFPB complaints have a high success rate because:
- Companies know CFPB is watching
- Patterns lead to enforcement actions
- Public complaint database affects reputation`,
      },
      { id: "5-5", title: "Module 5 Quiz", duration: "5 min", type: "quiz" },
    ],
  },
  {
    id: 6,
    moduleId: "module6",
    title: "Building and Maintaining Good Credit",
    description: "Strategies for improving and protecting your credit score.",
    duration: "40 min",
    icon: Star,
    lessons: [
      { 
        id: "6-1", 
        title: "The 5 Factors of Your Credit Score", 
        duration: "10 min", 
        type: "video",
        videoUrl: "https://www.youtube.com/embed/aXvjuXKiP0c", // Credit score factors
      },
      { 
        id: "6-2", 
        title: "Credit Utilization Strategies", 
        duration: "8 min", 
        type: "reading",
        content: `# Credit Utilization Strategies

Credit utilization is the second most important factor in your credit score (30%). Here's how to optimize it.

## What is Utilization?

Credit utilization = (Credit Used ÷ Credit Available) × 100

Example: $3,000 balance ÷ $10,000 limit = 30% utilization

## Optimal Utilization Levels

| Utilization | Impact |
|-------------|--------|
| 0% | Good, but shows no activity |
| 1-9% | EXCELLENT - Ideal range |
| 10-29% | Good |
| 30-49% | Fair - Starting to hurt |
| 50%+ | Poor - Significant damage |

## Strategies to Lower Utilization

### 1. Pay Before Statement Closes
Your statement balance is what gets reported. Pay down before the statement date.

### 2. Request Credit Limit Increases
More available credit = lower utilization ratio.

### 3. Spread Balances
Better to have 20% on 3 cards than 60% on 1 card.

### 4. Keep Old Cards Open
Closing cards reduces available credit.

### 5. Become an Authorized User
Get added to someone's old, high-limit card.

## The AZEO Method

**A**ll **Z**ero **E**xcept **O**ne

- Pay all cards to $0
- Leave one small balance ($5-50)
- Shows activity without high utilization`,
      },
      { 
        id: "6-3", 
        title: "Building Positive Credit History", 
        duration: "10 min", 
        type: "video",
        videoUrl: "https://www.youtube.com/embed/HZGCoVF3YvM", // Building credit
      },
      { 
        id: "6-4", 
        title: "Protecting Yourself from Identity Theft", 
        duration: "7 min", 
        type: "reading",
        content: `# Protecting Yourself from Identity Theft

Identity theft can destroy your credit overnight. Here's how to protect yourself.

## Prevention Strategies

### Freeze Your Credit
- Free at all three bureaus
- Prevents new accounts from being opened
- Unfreeze temporarily when you need credit

### Monitor Your Reports
- Check all three bureaus regularly
- Set up fraud alerts
- Use credit monitoring services

### Protect Your Information
- Shred sensitive documents
- Use strong, unique passwords
- Enable two-factor authentication
- Be wary of phishing emails

## Warning Signs

Watch for:
- Accounts you didn't open
- Inquiries you didn't authorize
- Bills for unknown accounts
- Calls from debt collectors about unknown debts
- Missing mail or statements

## If You're a Victim

1. **Place fraud alerts** on all three bureaus
2. **File FTC report** at IdentityTheft.gov
3. **File police report** for documentation
4. **Dispute fraudulent accounts** with bureaus
5. **Contact creditors** directly
6. **Consider credit freeze**

## Extended Fraud Alert

Victims can place a 7-year fraud alert requiring creditors to verify identity before opening new accounts.`,
      },
      { id: "6-5", title: "Final Exam", duration: "5 min", type: "quiz" },
    ],
  },
];

export default function CreditEducation() {
  const { isAuthenticated, user } = useAuth();
  const [expandedModule, setExpandedModule] = useState<number | null>(1);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  
  // Fetch progress from database
  const { data: progressData, refetch: refetchProgress } = trpc.courseProgress.getProgress.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const { data: certificate } = trpc.courseProgress.getCertificate.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  
  const completeLesson = trpc.courseProgress.completeLesson.useMutation({
    onSuccess: () => {
      refetchProgress();
      toast.success("Lesson completed!");
    },
  });
  
  const generateCertificate = trpc.courseProgress.generateCertificate.useMutation({
    onSuccess: () => {
      toast.success("Congratulations! Your certificate has been generated!");
      refetchProgress();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Calculate progress
  const completedLessonIds = progressData?.filter(p => p.completed).map(p => p.lessonId) || [];
  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const progressPercent = (completedLessonIds.length / totalLessons) * 100;

  const isLessonCompleted = (lessonId: string) => completedLessonIds.includes(lessonId);

  const handleCompleteLesson = (lesson: Lesson, moduleId: string) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to track your progress");
      return;
    }
    
    completeLesson.mutate({
      lessonId: lesson.id,
      moduleId,
      timeSpentSeconds: parseInt(lesson.duration) * 60,
      quizScore: lesson.type === "quiz" ? 100 : undefined,
    });
  };

  const getModuleProgress = (module: Module) => {
    const completed = module.lessons.filter(l => isLessonCompleted(l.id)).length;
    return { completed, total: module.lessons.length };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <img loading="lazy" src="/logo.png" alt="DisputeStrike" className="h-8 w-8" />
            <span className="font-bold text-xl">DisputeStrike</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/features" className="text-gray-600 hover:text-gray-900">Features</Link>
            <Link href="/how-it-works" className="text-gray-600 hover:text-gray-900">How It Works</Link>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
          </div>
          <Link href="/quiz">
            <Button className="bg-orange-500 hover:bg-orange-600">Start Free Analysis</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 to-indigo-900 py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-blue-500">Free with Your Purchase</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Credit Education Course
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Master your credit rights and learn how to effectively dispute inaccuracies. 
              This comprehensive course is included free with any DisputeStrike package.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-white/80">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <span>6 Modules</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <span>{totalLessons} Lessons</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>~5 Hours Total</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                <span>Certificate Included</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Bar */}
      <section className="bg-white border-b py-6">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Your Progress</span>
              <span className="text-sm text-gray-600">
                {completedLessonIds.length} of {totalLessons} lessons completed
              </span>
            </div>
            <Progress value={progressPercent} className="h-3" />
            
            {/* Certificate Section */}
            {progressPercent === 100 && !certificate && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Award className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-900">Congratulations! You've completed all lessons!</p>
                      <p className="text-sm text-green-700">Generate your certificate of completion.</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => generateCertificate.mutate()}
                    disabled={generateCertificate.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Award className="h-4 w-4 mr-2" />
                    Get Certificate
                  </Button>
                </div>
              </div>
            )}
            
            {certificate && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Award className="h-8 w-8 text-yellow-600" />
                    <div>
                      <p className="font-semibold text-yellow-900">Certificate Earned!</p>
                      <p className="text-sm text-yellow-700">Certificate #{certificate.certificateNumber}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="border-yellow-400 text-yellow-700">
                    <Download className="h-4 w-4 mr-2" />
                    Download Certificate
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-12">
        <div className="container">
          <div className="max-w-4xl mx-auto space-y-4">
            {modules.map((module) => {
              const { completed, total } = getModuleProgress(module);
              const isExpanded = expandedModule === module.id;
              const ModuleIcon = module.icon;

              return (
                <Card key={module.id} className="overflow-hidden">
                  <CardHeader
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedModule(isExpanded ? null : module.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <ModuleIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            Module {module.id}: {module.title}
                          </CardTitle>
                          <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{module.duration}</p>
                          <p className="text-sm font-medium">
                            {completed}/{total} lessons
                          </p>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="border-t bg-gray-50 p-0">
                      <div className="divide-y">
                        {module.lessons.map((lesson) => {
                          const isCompleted = isLessonCompleted(lesson.id);
                          
                          return (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between p-4 hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                {isCompleted ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : lesson.type === "video" ? (
                                  <PlayCircle className="h-5 w-5 text-gray-400" />
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
                                    {lesson.type === "video" ? "Video" : lesson.type === "quiz" ? "Quiz" : "Reading"} • {lesson.duration}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setActiveLesson(lesson)}
                                >
                                  {lesson.type === "video" ? (
                                    <>
                                      <PlayCircle className="h-4 w-4 mr-1" />
                                      Watch
                                    </>
                                  ) : lesson.type === "quiz" ? (
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
                                {!isCompleted && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleCompleteLesson(lesson, module.moduleId)}
                                    disabled={completeLesson.isPending}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Complete
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </section>

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
              {activeLesson.type === "video" && activeLesson.videoUrl && (
                <div className="aspect-video">
                  <iframe
                    src={activeLesson.videoUrl}
                    className="w-full h-full rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
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
                      .replace(/\|.*\|/g, (match) => `<code class="bg-gray-100 px-1 rounded">${match}</code>`)
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
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Start Quiz
                  </Button>
                </div>
              )}
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => setActiveLesson(null)}>
                Close
              </Button>
              {!isLessonCompleted(activeLesson.id) && (
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

      {/* What You'll Learn */}
      <section className="py-16 bg-white">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">What You'll Learn</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { icon: FileText, title: "Read Credit Reports", desc: "Understand every section of your credit report and identify potential errors." },
              { icon: Scale, title: "Know Your FCRA Rights", desc: "Master the federal laws that protect you and give you the power to dispute." },
              { icon: Target, title: "Identify Errors", desc: "Spot common errors, cross-bureau conflicts, and re-aging violations." },
              { icon: Shield, title: "Dispute Effectively", desc: "Learn the step-by-step process for disputing and escalating when needed." },
              { icon: TrendingUp, title: "Build Better Credit", desc: "Strategies for improving and maintaining a healthy credit score." },
              { icon: Award, title: "Earn a Certificate", desc: "Complete the course and receive a certificate of completion." },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Take Control of Your Credit?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Get the Credit Education Course free with any DisputeStrike package. 
            Start disputing inaccuracies with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pricing">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100">
                View Pricing
              </Button>
            </Link>
            <Link href="/quiz">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Start Free Analysis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container text-center">
          <p>© 2025 DisputeStrike. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/croa-disclosure" className="hover:text-white">CROA Disclosure</Link>
            <Link href="/contact" className="hover:text-white">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
