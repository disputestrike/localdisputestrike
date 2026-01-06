import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import {
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Home,
  Bell,
  FileWarning,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { Progress } from "@/components/ui/progress";

export default function AdminEnhanced() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  // Fetch admin data
  const { data: stats } = trpc.admin.getStats.useQuery();
  const { data: allUsers } = trpc.admin.listUsers.useQuery();
  const { data: recentLetters } = trpc.admin.recentLetters.useQuery();

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have permission to view this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate success metrics (mock data - will be real once we track outcomes)
  const totalAccountsDisputed = 150; // Example
  const accountsDeleted = 105; // Example: 70% deletion rate
  const accountsVerified = 30; // Example: 20% verified
  const accountsPending = 15; // Example: 10% pending
  const deletionRate = Math.round((accountsDeleted / totalAccountsDisputed) * 100);
  const avgScoreIncrease = 38; // Example average

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">CreditCounsel AI - Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="destructive">Admin</Badge>
            <span className="text-sm text-muted-foreground">{user.name}</span>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">
                <Home className="h-4 w-4 mr-2" />
                User View
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        {/* Success Metrics Overview */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Platform Success Metrics</h2>
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Deletion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{deletionRate}%</div>
                <p className="text-xs text-gray-600">
                  {accountsDeleted} / {totalAccountsDisputed} accounts deleted
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Score Increase</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">+{avgScoreIncrease}</div>
                <p className="text-xs text-muted-foreground">
                  Points per user
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats?.newUsersThisMonth || 0} this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats?.totalRevenue || 0}</div>
                <p className="text-xs text-muted-foreground">
                  ${stats?.revenueThisMonth || 0} this month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Letter Performance by Bureau */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Letter Performance by Bureau</CardTitle>
              <CardDescription>Success rates across TransUnion, Equifax, and Experian</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Equifax</span>
                    <span className="text-muted-foreground">72% deletion rate</span>
                  </div>
                  <Progress value={72} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats?.lettersByBureau?.equifax || 0} letters sent
                  </p>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">TransUnion</span>
                    <span className="text-muted-foreground">68% deletion rate</span>
                  </div>
                  <Progress value={68} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats?.lettersByBureau?.transunion || 0} letters sent
                  </p>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Experian</span>
                    <span className="text-muted-foreground">75% deletion rate</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats?.lettersByBureau?.experian || 0} letters sent
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">
              <TrendingUp className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="letters">
              <FileText className="h-4 w-4 mr-2" />
              Letters
            </TabsTrigger>
            <TabsTrigger value="timelines">
              <Clock className="h-4 w-4 mr-2" />
              Timelines
            </TabsTrigger>
            <TabsTrigger value="alerts">
              <Bell className="h-4 w-4 mr-2" />
              Alerts
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Success Stories */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Success Stories</CardTitle>
                  <CardDescription>Users with significant score improvements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium">Benjamin Peter</p>
                        <p className="text-sm text-gray-600">3 accounts deleted</p>
                      </div>
                      <Badge className="bg-green-600">+42 pts</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium">User #2</p>
                        <p className="text-sm text-gray-600">5 accounts deleted</p>
                      </div>
                      <Badge className="bg-green-600">+58 pts</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium">User #3</p>
                        <p className="text-sm text-gray-600">2 accounts deleted</p>
                      </div>
                      <Badge className="bg-green-600">+31 pts</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Status Distribution</CardTitle>
                  <CardDescription>Current status of all disputed accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span>Deleted</span>
                      </div>
                      <span className="font-bold text-green-600">{accountsDeleted}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-yellow-600" />
                        <span>Verified (Round 2)</span>
                      </div>
                      <span className="font-bold text-yellow-600">{accountsVerified}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <span>Pending</span>
                      </div>
                      <span className="font-bold text-blue-600">{accountsPending}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>
                  {allUsers?.length || 0} total users registered
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Letters</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allUsers?.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Badge variant={u.role === "admin" ? "destructive" : "default"}>
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{u.letterCount || 0}</TableCell>
                        <TableCell>
                          {u.hasActiveSubscription ? (
                            <Badge variant="default">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline">Free</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Letters Tab */}
          <TabsContent value="letters" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Letters</CardTitle>
                <CardDescription>
                  Last 50 letters generated across all users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Bureau</TableHead>
                      <TableHead>Round</TableHead>
                      <TableHead>Generated</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentLetters?.map((letter) => (
                      <TableRow key={letter.id}>
                        <TableCell className="font-medium">{letter.userName}</TableCell>
                        <TableCell className="capitalize">{letter.bureau}</TableCell>
                        <TableCell>
                          <Badge variant={letter.round === 1 ? "default" : "secondary"}>
                            Round {letter.round || 1}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(letter.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              letter.status === "mailed"
                                ? "default"
                                : letter.status === "downloaded"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {letter.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timelines Tab */}
          <TabsContent value="timelines" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Progress Tracking</CardTitle>
                <CardDescription>Monitor all users' 30-day investigation timelines</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Example timeline entries - will be populated with real data */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Benjamin Peter - Equifax</p>
                      <p className="text-sm text-gray-600">Mailed 2 days ago</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">28 days remaining</p>
                        <Progress value={7} className="w-32 h-2 mt-1" />
                      </div>
                      <Badge variant="secondary">In Progress</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">User #2 - TransUnion</p>
                      <p className="text-sm text-gray-600">Mailed 15 days ago</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">15 days remaining</p>
                        <Progress value={50} className="w-32 h-2 mt-1" />
                      </div>
                      <Badge variant="secondary">In Progress</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>FCRA Violation Alerts</CardTitle>
                <CardDescription>Bureaus that missed 30-day deadlines</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">User #3 - Experian</p>
                      <p className="text-sm text-gray-600">Deadline: 3 days overdue</p>
                      <p className="text-xs text-red-600 mt-1">FCRA § 1681i(a)(1) violation - File CFPB complaint</p>
                    </div>
                    <Button size="sm" variant="destructive">
                      <FileWarning className="h-4 w-4 mr-2" />
                      Generate Complaint
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">5 users approaching Day 25</p>
                        <p className="text-sm text-gray-600">Email reminders will be sent automatically</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
