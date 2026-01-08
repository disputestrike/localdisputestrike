import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import {
  BookOpen,
  CheckCircle,
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
} from "lucide-react";

interface Module {
  id: number;
  title: string;
  description: string;
  duration: string;
  lessons: Lesson[];
  icon: React.ElementType;
}

interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: "video" | "reading" | "quiz";
  completed?: boolean;
}

const modules: Module[] = [
  {
    id: 1,
    title: "Understanding Your Credit Report",
    description: "Learn how to read and interpret your credit report from all three bureaus.",
    duration: "45 min",
    icon: FileText,
    lessons: [
      { id: "1-1", title: "What is a Credit Report?", duration: "8 min", type: "video" },
      { id: "1-2", title: "The Three Credit Bureaus Explained", duration: "10 min", type: "reading" },
      { id: "1-3", title: "How to Get Your Free Credit Reports", duration: "5 min", type: "video" },
      { id: "1-4", title: "Reading Your Credit Report Line by Line", duration: "15 min", type: "video" },
      { id: "1-5", title: "Module 1 Quiz", duration: "7 min", type: "quiz" },
    ],
  },
  {
    id: 2,
    title: "Your Rights Under the FCRA",
    description: "Master the Fair Credit Reporting Act and your consumer rights.",
    duration: "60 min",
    icon: Scale,
    lessons: [
      { id: "2-1", title: "Introduction to the FCRA", duration: "10 min", type: "video" },
      { id: "2-2", title: "FCRA § 611 - Your Right to Dispute", duration: "12 min", type: "reading" },
      { id: "2-3", title: "FCRA § 1681i - Investigation Requirements", duration: "10 min", type: "video" },
      { id: "2-4", title: "FCRA § 1681n & 1681o - Penalties for Violations", duration: "8 min", type: "reading" },
      { id: "2-5", title: "The 30-Day Rule and Your Rights", duration: "10 min", type: "video" },
      { id: "2-6", title: "Module 2 Quiz", duration: "10 min", type: "quiz" },
    ],
  },
  {
    id: 3,
    title: "Identifying Errors and Inaccuracies",
    description: "Learn to spot common errors that can be disputed on your credit report.",
    duration: "50 min",
    icon: Target,
    lessons: [
      { id: "3-1", title: "Common Credit Report Errors", duration: "12 min", type: "video" },
      { id: "3-2", title: "Cross-Bureau Conflicts Explained", duration: "10 min", type: "reading" },
      { id: "3-3", title: "Balance Discrepancies", duration: "8 min", type: "video" },
      { id: "3-4", title: "Date and Status Conflicts", duration: "8 min", type: "video" },
      { id: "3-5", title: "Re-Aging Violations", duration: "7 min", type: "reading" },
      { id: "3-6", title: "Module 3 Quiz", duration: "5 min", type: "quiz" },
    ],
  },
  {
    id: 4,
    title: "The Dispute Process",
    description: "Step-by-step guide to disputing inaccurate information.",
    duration: "55 min",
    icon: Shield,
    lessons: [
      { id: "4-1", title: "Preparing Your Dispute", duration: "10 min", type: "video" },
      { id: "4-2", title: "Writing Effective Dispute Letters", duration: "15 min", type: "reading" },
      { id: "4-3", title: "What to Include with Your Dispute", duration: "8 min", type: "video" },
      { id: "4-4", title: "Mailing Your Dispute (Certified Mail)", duration: "10 min", type: "video" },
      { id: "4-5", title: "Tracking Your Dispute", duration: "7 min", type: "reading" },
      { id: "4-6", title: "Module 4 Quiz", duration: "5 min", type: "quiz" },
    ],
  },
  {
    id: 5,
    title: "Escalation Strategies",
    description: "What to do when your initial dispute doesn't work.",
    duration: "45 min",
    icon: TrendingUp,
    lessons: [
      { id: "5-1", title: "Understanding Bureau Responses", duration: "10 min", type: "video" },
      { id: "5-2", title: "Round 2: Method of Verification Requests", duration: "12 min", type: "reading" },
      { id: "5-3", title: "Round 3: Intent to Litigate Letters", duration: "10 min", type: "video" },
      { id: "5-4", title: "Filing a CFPB Complaint", duration: "8 min", type: "reading" },
      { id: "5-5", title: "Module 5 Quiz", duration: "5 min", type: "quiz" },
    ],
  },
  {
    id: 6,
    title: "Building and Maintaining Good Credit",
    description: "Strategies for improving and protecting your credit score.",
    duration: "40 min",
    icon: Star,
    lessons: [
      { id: "6-1", title: "The 5 Factors of Your Credit Score", duration: "10 min", type: "video" },
      { id: "6-2", title: "Credit Utilization Strategies", duration: "8 min", type: "reading" },
      { id: "6-3", title: "Building Positive Credit History", duration: "10 min", type: "video" },
      { id: "6-4", title: "Protecting Yourself from Identity Theft", duration: "7 min", type: "reading" },
      { id: "6-5", title: "Final Exam", duration: "5 min", type: "quiz" },
    ],
  },
];

export default function CreditEducation() {
  const [expandedModule, setExpandedModule] = useState<number | null>(1);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const progressPercent = (completedLessons.length / totalLessons) * 100;

  const toggleLesson = (lessonId: string) => {
    setCompletedLessons((prev) =>
      prev.includes(lessonId)
        ? prev.filter((id) => id !== lessonId)
        : [...prev, lessonId]
    );
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
                <GraduationCap className="w-5 h-5" />
                <span>6 Modules</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <span>32 Lessons</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>~5 Hours Total</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                <span>Certificate Included</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Section */}
      <section className="py-8 bg-white border-b">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Your Progress</span>
              <span className="text-sm text-gray-500">
                {completedLessons.length} of {totalLessons} lessons completed
              </span>
            </div>
            <Progress value={progressPercent} className="h-3" />
            {progressPercent === 100 && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <Award className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Congratulations!</p>
                  <p className="text-sm text-green-600">You've completed the course. Download your certificate below.</p>
                </div>
                <Button size="sm" className="ml-auto bg-green-600 hover:bg-green-700">
                  Download Certificate
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-12">
        <div className="container">
          <div className="max-w-4xl mx-auto space-y-6">
            {modules.map((module) => {
              const moduleCompletedCount = module.lessons.filter((l) =>
                completedLessons.includes(l.id)
              ).length;
              const isModuleComplete = moduleCompletedCount === module.lessons.length;

              return (
                <Card key={module.id} className="overflow-hidden">
                  <CardHeader
                    className={`cursor-pointer transition-colors ${
                      expandedModule === module.id ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                    onClick={() =>
                      setExpandedModule(expandedModule === module.id ? null : module.id)
                    }
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          isModuleComplete
                            ? "bg-green-100 text-green-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {isModuleComplete ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <module.icon className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          Module {module.id}: {module.title}
                          {isModuleComplete && (
                            <Badge className="bg-green-500 text-xs">Complete</Badge>
                          )}
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">{module.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">{module.duration}</div>
                        <div className="text-xs text-gray-400">
                          {moduleCompletedCount}/{module.lessons.length} lessons
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          expandedModule === module.id ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  </CardHeader>

                  {expandedModule === module.id && (
                    <CardContent className="pt-0 pb-4">
                      <div className="border-t pt-4 space-y-2">
                        {module.lessons.map((lesson) => {
                          const isCompleted = completedLessons.includes(lesson.id);
                          return (
                            <div
                              key={lesson.id}
                              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                isCompleted
                                  ? "bg-green-50 hover:bg-green-100"
                                  : "bg-gray-50 hover:bg-gray-100"
                              }`}
                              onClick={() => toggleLesson(lesson.id)}
                            >
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  isCompleted
                                    ? "bg-green-500 text-white"
                                    : "bg-white border-2 border-gray-300"
                                }`}
                              >
                                {isCompleted ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : lesson.type === "video" ? (
                                  <PlayCircle className="w-4 h-4 text-gray-400" />
                                ) : lesson.type === "reading" ? (
                                  <BookOpen className="w-4 h-4 text-gray-400" />
                                ) : (
                                  <FileText className="w-4 h-4 text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p
                                  className={`font-medium ${
                                    isCompleted ? "text-green-700" : "text-gray-700"
                                  }`}
                                >
                                  {lesson.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {lesson.type === "video"
                                    ? "Video"
                                    : lesson.type === "reading"
                                    ? "Reading"
                                    : "Quiz"}{" "}
                                  • {lesson.duration}
                                </p>
                              </div>
                              {isCompleted && (
                                <Badge variant="outline" className="text-green-600 border-green-300">
                                  Completed
                                </Badge>
                              )}
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

      {/* What You'll Learn */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">What You'll Learn</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Read Credit Reports</h3>
                  <p className="text-gray-600 text-sm">
                    Understand every section of your credit report and identify potential errors.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Scale className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Know Your FCRA Rights</h3>
                  <p className="text-gray-600 text-sm">
                    Master the federal laws that protect you and give you the power to dispute.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Identify Errors</h3>
                  <p className="text-gray-600 text-sm">
                    Spot common errors, cross-bureau conflicts, and re-aging violations.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Dispute Effectively</h3>
                  <p className="text-gray-600 text-sm">
                    Learn the step-by-step process for disputing and escalating when needed.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Build Better Credit</h3>
                  <p className="text-gray-600 text-sm">
                    Strategies for improving and maintaining a healthy credit score.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Earn a Certificate</h3>
                  <p className="text-gray-600 text-sm">
                    Complete the course and receive a certificate of completion.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-orange-500 to-amber-500">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Take Control of Your Credit?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Get the Credit Education Course free with any DisputeStrike package. 
              Start disputing inaccuracies with confidence.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
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
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-gray-400 py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <img loading="lazy" src="/logo.png" alt="DisputeStrike" className="h-8 w-8" />
              <span className="text-white font-bold">DisputeStrike</span>
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="hover:text-white">Privacy</Link>
              <Link href="/terms" className="hover:text-white">Terms</Link>
              <Link href="/croa-disclosure" className="hover:text-white">CROA Disclosure</Link>
              <Link href="/contact" className="hover:text-white">Contact</Link>
            </div>
            <p className="text-sm">© 2025 DisputeStrike LLC. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
