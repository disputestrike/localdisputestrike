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
  Mail,
  Home,
  Zap,
} from "lucide-react";
import { MethodsAnalyticsDashboard } from "@/components/MethodsAnalyticsDashboard";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";

export default function Admin() {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <img loading="lazy" src="/logo.webp" alt="DisputeStrike" className="h-8 w-8" />
            <span className="font-bold text-xl">DisputeStrike - Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="destructive">Admin</Badge>
            <span className="text-sm text-muted-foreground">{user.name}</span>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6">
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
              <CardTitle className="text-sm font-medium">Letters Generated</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalLetters || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{stats?.lettersThisMonth || 0} this month
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.successRate || 0}%</div>
              <p className="text-xs text-muted-foreground">
                Based on {stats?.completedDisputes || 0} disputes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="letters">
              <FileText className="h-4 w-4 mr-2" />
              Recent Letters
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="methods">
              <Zap className="h-4 w-4 mr-2" />
              43 Methods
            </TabsTrigger>
          </TabsList>

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
                      <TableHead>Generated</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Conflicts</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentLetters?.map((letter) => (
                      <TableRow key={letter.id}>
                        <TableCell className="font-medium">{letter.userName}</TableCell>
                        <TableCell className="capitalize">{letter.bureau}</TableCell>
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
                        <TableCell>
                          {letter.hasConflicts ? (
                            <Badge variant="destructive">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Yes
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">No</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Letter Generation Trends</CardTitle>
                  <CardDescription>Monthly breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">TransUnion</span>
                      <span className="font-semibold">{stats?.lettersByBureau?.transunion || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Equifax</span>
                      <span className="font-semibold">{stats?.lettersByBureau?.equifax || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Experian</span>
                      <span className="font-semibold">{stats?.lettersByBureau?.experian || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Conflict Detection</CardTitle>
                  <CardDescription>Cross-bureau conflicts found</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Balance Discrepancies</span>
                      <span className="font-semibold">{stats?.conflictTypes?.balance || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status Conflicts</span>
                      <span className="font-semibold">{stats?.conflictTypes?.status || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Date Conflicts</span>
                      <span className="font-semibold">{stats?.conflictTypes?.date || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Re-aging Violations</span>
                      <span className="font-semibold">{stats?.conflictTypes?.reaging || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 43 Methods Analytics Tab */}
          <TabsContent value="methods" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>43 Dispute Detection Methods Analytics</CardTitle>
                <CardDescription>
                  Track which detection algorithms are most effective at achieving deletions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MethodsAnalyticsDashboard />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
