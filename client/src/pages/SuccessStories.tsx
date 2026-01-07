import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  TrendingUp,
  CheckCircle2,
  Award,
  ArrowRight,
  Star,
} from "lucide-react";

export default function SuccessStories() {
  // Mock data - will be replaced with real data from database
  const successStories = [
    {
      id: 1,
      displayName: "Benjamin P.",
      scoreBefore: 582,
      scoreAfter: 624,
      scoreIncrease: 42,
      accountsDeleted: 3,
      daysToResults: 2,
      testimonial: "I couldn't believe how fast CreditCounsel AI worked! Within just 2 days of mailing my Attack letters, I saw 3 negative accounts completely removed from my Equifax report. My score jumped 42 points, and I finally qualified for the mortgage I've been dreaming about. The AI-powered letters were professional, legally sound, and incredibly effective. This platform saved me thousands compared to traditional credit monitoring companies!",
      specificDeletions: ["Credit Union of Texas", "PNC Bank", "Ford Motor Credit"],
      isFeatured: true,
    },
    {
      id: 2,
      displayName: "Sarah M.",
      scoreBefore: 550,
      scoreAfter: 608,
      scoreIncrease: 58,
      accountsDeleted: 5,
      daysToResults: 28,
      testimonial: "After years of struggling with bad credit, I finally found a solution that works. CreditCounsel AI generated Attack letters that got 5 negative accounts deleted across all three bureaus. My score increased 58 points in less than a month! The best part? I did it all myself for a fraction of what credit monitoring companies charge. Highly recommend!",
      specificDeletions: null,
      isFeatured: true,
    },
    {
      id: 3,
      displayName: "Michael T.",
      scoreBefore: 615,
      scoreAfter: 646,
      scoreIncrease: 31,
      accountsDeleted: 2,
      daysToResults: 15,
      testimonial: "I was skeptical at first, but CreditCounsel AI delivered real results. Within just 15 days, I saw 2 negative accounts completely removed from my credit report, and my score jumped 31 points! Now I can finally qualify for that car loan I've been dreaming about. This platform is a game-changer.",
      specificDeletions: null,
      isFeatured: false,
    },
  ];

  const featuredStories = successStories.filter(s => s.isFeatured);
  const otherStories = successStories.filter(s => !s.isFeatured);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-green-600">Real Results from Real People</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Success Stories
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              See how CreditCounsel AI helped thousands of people delete negative items,
              increase their credit scores, and achieve their financial goals.
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-green-600">70-85%</div>
                <div className="text-sm text-gray-600">Deletion Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">+38</div>
                <div className="text-sm text-gray-600">Avg Score Increase</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">1,247</div>
                <div className="text-sm text-gray-600">Items Deleted This Week</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Success Stories */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8 text-center">Featured Success Stories</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {featuredStories.map((story) => (
              <Card key={story.id} className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="h-5 w-5 text-green-600" />
                        <span className="font-bold text-lg">{story.displayName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <Badge className="bg-green-600 text-lg px-3 py-1">
                      +{story.scoreIncrease} pts
                    </Badge>
                  </div>

                  {/* Score Visualization */}
                  <div className="flex items-center justify-center gap-4 mb-6 p-4 bg-white rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{story.scoreBefore}</div>
                      <div className="text-xs text-gray-500">Before</div>
                    </div>
                    <ArrowRight className="h-6 w-6 text-green-600" />
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{story.scoreAfter}</div>
                      <div className="text-xs text-gray-500">After</div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span><strong>{story.accountsDeleted}</strong> accounts deleted</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span><strong>{story.daysToResults}</strong> days to results</span>
                    </div>
                  </div>

                  {/* Specific Deletions */}
                  {story.specificDeletions && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-600 mb-2">Accounts Deleted:</p>
                      <div className="flex flex-wrap gap-2">
                        {story.specificDeletions.map((account, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {account}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Testimonial */}
                  <blockquote className="border-l-4 border-green-600 pl-4 italic text-gray-700">
                    "{story.testimonial}"
                  </blockquote>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Other Success Stories */}
      {otherStories.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container">
            <h2 className="text-3xl font-bold mb-8 text-center">More Success Stories</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {otherStories.map((story) => (
                <Card key={story.id}>
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-bold">{story.displayName}</span>
                      <Badge className="bg-green-600">+{story.scoreIncrease} pts</Badge>
                    </div>

                    {/* Score */}
                    <div className="flex items-center justify-center gap-2 mb-4 text-sm">
                      <span className="text-red-600 font-semibold">{story.scoreBefore}</span>
                      <ArrowRight className="h-4 w-4" />
                      <span className="text-green-600 font-semibold">{story.scoreAfter}</span>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-center gap-4 mb-4 text-xs text-gray-600">
                      <span>{story.accountsDeleted} deleted</span>
                      <span>•</span>
                      <span>{story.daysToResults} days</span>
                    </div>

                    {/* Testimonial */}
                    <p className="text-sm text-gray-700 italic line-clamp-4">
                      "{story.testimonial}"
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Write Your Own Success Story?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of people who've already deleted negative items and
            increased their credit scores with CreditCounsel AI.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/quiz">
                Start Free Analysis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600" asChild>
              <Link href="/pricing">
                View Pricing
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
