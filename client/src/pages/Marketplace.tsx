import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CreditCard,
  Building2,
  Shield,
  TrendingUp,
  Star,
  ExternalLink,
  CheckCircle2,
  DollarSign,
  Percent,
  Gift,
} from "lucide-react";

const securedCards = [
  {
    name: "Discover it® Secured",
    issuer: "Discover",
    deposit: "$200 - $2,500",
    apr: "28.24%",
    annualFee: "$0",
    rating: 4.8,
    features: ["Cash back rewards", "Free FICO score", "No annual fee", "Graduates to unsecured"],
    highlight: "Best Overall",
  },
  {
    name: "Capital One Platinum Secured",
    issuer: "Capital One",
    deposit: "$49 - $200",
    apr: "30.74%",
    annualFee: "$0",
    rating: 4.5,
    features: ["Low deposit option", "No annual fee", "Credit line increase", "Mobile app"],
    highlight: "Lowest Deposit",
  },
  {
    name: "OpenSky® Secured Visa®",
    issuer: "OpenSky",
    deposit: "$200 - $3,000",
    apr: "25.64%",
    annualFee: "$35",
    rating: 4.2,
    features: ["No credit check", "Reports to all 3 bureaus", "Choose your credit line", "Fast approval"],
    highlight: "No Credit Check",
  },
];

const creditBuilderLoans = [
  {
    name: "Self Credit Builder",
    type: "Credit Builder Loan",
    amount: "$25 - $150/mo",
    term: "12-24 months",
    rating: 4.7,
    features: ["Reports to all 3 bureaus", "Build savings", "No credit check", "Mobile app"],
    highlight: "Most Popular",
  },
  {
    name: "Kikoff Credit Account",
    type: "Credit Line",
    amount: "$750 credit line",
    term: "No term",
    rating: 4.5,
    features: ["$5/month", "No interest", "Reports monthly", "No credit check"],
    highlight: "Lowest Cost",
  },
  {
    name: "Grow Credit",
    type: "Subscription Reporting",
    amount: "$0 - $9.99/mo",
    term: "Monthly",
    rating: 4.3,
    features: ["Reports subscriptions", "Netflix, Spotify, etc.", "Build credit passively", "Free tier available"],
    highlight: "Easiest",
  },
];

const rentReporting = [
  {
    name: "Rental Kharma",
    type: "Rent Reporting",
    price: "$75 setup + $8.95/mo",
    bureaus: "TransUnion",
    rating: 4.4,
    features: ["Reports past 24 months", "Landlord verification", "Monthly reporting", "Cancel anytime"],
  },
  {
    name: "Boom",
    type: "Rent Reporting",
    price: "$2/report",
    bureaus: "All 3 Bureaus",
    rating: 4.6,
    features: ["Pay per report", "No subscription", "Fast setup", "Reports to all bureaus"],
  },
];

export default function Marketplace() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-cyan-400" />
            Credit Building Marketplace
          </h1>
          <p className="text-slate-400 mt-1">
            Recommended products to help you build and improve your credit
          </p>
        </div>

        {/* Disclaimer */}
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-4">
            <p className="text-sm text-yellow-200">
              <strong>Disclosure:</strong> Some links may be affiliate links. We may earn a commission
              at no extra cost to you. We only recommend products we believe will help you build credit.
            </p>
          </CardContent>
        </Card>

        <Tabs defaultValue="secured" className="space-y-6">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="secured" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              Secured Cards
            </TabsTrigger>
            <TabsTrigger value="builder" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              Credit Builders
            </TabsTrigger>
            <TabsTrigger value="rent" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              Rent Reporting
            </TabsTrigger>
          </TabsList>

          {/* Secured Cards Tab */}
          <TabsContent value="secured" className="space-y-4">
            {securedCards.map((card, index) => (
              <Card key={index} className="bg-slate-900 border-slate-800">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-white">{card.name}</h3>
                        {card.highlight && (
                          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                            {card.highlight}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 mb-3">{card.issuer}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-slate-500">Deposit</p>
                          <p className="text-sm font-medium text-white">{card.deposit}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">APR</p>
                          <p className="text-sm font-medium text-white">{card.apr}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Annual Fee</p>
                          <p className="text-sm font-medium text-green-400">{card.annualFee}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Rating</p>
                          <p className="text-sm font-medium text-yellow-400 flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400" />
                            {card.rating}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {card.features.map((feature, fIndex) => (
                          <span
                            key={fIndex}
                            className="text-xs px-2 py-1 bg-slate-800 text-slate-300 rounded"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Button className="bg-cyan-500 hover:bg-cyan-600 text-white whitespace-nowrap">
                      Apply Now
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Credit Builders Tab */}
          <TabsContent value="builder" className="space-y-4">
            {creditBuilderLoans.map((product, index) => (
              <Card key={index} className="bg-slate-900 border-slate-800">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                        {product.highlight && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            {product.highlight}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 mb-3">{product.type}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-slate-500">Amount</p>
                          <p className="text-sm font-medium text-white">{product.amount}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Term</p>
                          <p className="text-sm font-medium text-white">{product.term}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Rating</p>
                          <p className="text-sm font-medium text-yellow-400 flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400" />
                            {product.rating}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {product.features.map((feature, fIndex) => (
                          <span
                            key={fIndex}
                            className="text-xs px-2 py-1 bg-slate-800 text-slate-300 rounded"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Button className="bg-cyan-500 hover:bg-cyan-600 text-white whitespace-nowrap">
                      Learn More
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Rent Reporting Tab */}
          <TabsContent value="rent" className="space-y-4">
            {rentReporting.map((service, index) => (
              <Card key={index} className="bg-slate-900 border-slate-800">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-white">{service.name}</h3>
                      </div>
                      <p className="text-sm text-slate-400 mb-3">{service.type}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-slate-500">Price</p>
                          <p className="text-sm font-medium text-white">{service.price}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Reports To</p>
                          <p className="text-sm font-medium text-white">{service.bureaus}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Rating</p>
                          <p className="text-sm font-medium text-yellow-400 flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400" />
                            {service.rating}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {service.features.map((feature, fIndex) => (
                          <span
                            key={fIndex}
                            className="text-xs px-2 py-1 bg-slate-800 text-slate-300 rounded"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Button className="bg-cyan-500 hover:bg-cyan-600 text-white whitespace-nowrap">
                      Get Started
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
