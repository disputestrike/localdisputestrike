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
  ArrowLeft,
  User,
  FileText,
  CreditCard,
  Activity,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  ExternalLink,
} from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import { useEffect } from "react";

const ROLE_BADGES: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  master_admin: { label: "Master Admin", variant: "destructive" },
  super_admin: { label: "Super Admin", variant: "default" },
  admin: { label: "Admin", variant: "secondary" },
  user: { label: "User", variant: "outline" },
};

const STATUS_BADGES: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Active", variant: "default" },
  blocked: { label: "Blocked", variant: "destructive" },
  suspended: { label: "Suspended", variant: "secondary" },
};

export default function AdminUserDetails() {
  const { user } = useAuth();
  const params = useParams();
  const [, setLocation] = useLocation();
  const userId = parseInt(params.id || '0');

  const ADMIN_ROLES = ['admin', 'super_admin', 'master_admin'];
  const isAdmin = !!(user && ADMIN_ROLES.includes(user.role));

  useEffect(() => {
    if (user && !ADMIN_ROLES.includes(user.role)) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  const { data: userDetails, isLoading } = trpc.admin.getUserDetails.useQuery(
    { userId },
    { enabled: !!isAdmin && userId > 0 }
  );

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>User Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin">Back to Admin</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">User Details</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* User Overview Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-500" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{userDetails.name || 'No Name'}</CardTitle>
                  <CardDescription>{userDetails.email || 'No Email'}</CardDescription>
                  <div className="flex gap-2 mt-2">
                    <Badge variant={ROLE_BADGES[userDetails.role]?.variant || 'outline'}>
                      {ROLE_BADGES[userDetails.role]?.label || userDetails.role}
                    </Badge>
                    <Badge variant={STATUS_BADGES[userDetails.status]?.variant || 'outline'}>
                      {STATUS_BADGES[userDetails.status]?.label || userDetails.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button variant="outline" asChild>
                <a href={`/dashboard?impersonate=${userDetails.id}`} target="_blank">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View as User
                </a>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>Joined</span>
                </div>
                <p className="font-medium">
                  {userDetails.createdAt ? new Date(userDetails.createdAt).toLocaleDateString() : '-'}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Activity className="h-4 w-4" />
                  <span>Last Sign In</span>
                </div>
                <p className="font-medium">
                  {userDetails.lastSignedIn ? new Date(userDetails.lastSignedIn).toLocaleString() : '-'}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Shield className="h-4 w-4" />
                  <span>Account Type</span>
                </div>
                <p className="font-medium capitalize">{userDetails.accountType || 'Individual'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        {userDetails.profile && (
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <User className="h-4 w-4" />
                      <span>Full Name</span>
                    </div>
                    <p className="font-medium">{userDetails.profile.fullName || '-'}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <Phone className="h-4 w-4" />
                      <span>Phone</span>
                    </div>
                    <p className="font-medium">{userDetails.profile.phone || '-'}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </div>
                    <p className="font-medium">{userDetails.profile.email || '-'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <MapPin className="h-4 w-4" />
                      <span>Address</span>
                    </div>
                    <p className="font-medium">{userDetails.profile.currentAddress || '-'}</p>
                    <p className="text-sm text-gray-600">
                      {[userDetails.profile.currentCity, userDetails.profile.currentState, userDetails.profile.currentZip]
                        .filter(Boolean)
                        .join(', ') || '-'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs for detailed data */}
        <Tabs defaultValue="letters" className="space-y-4">
          <TabsList>
            <TabsTrigger value="letters">
              <FileText className="h-4 w-4 mr-2" />
              Letters ({userDetails.letters?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="accounts">
              <CreditCard className="h-4 w-4 mr-2" />
              Accounts ({userDetails.accounts?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="payments">
              <CreditCard className="h-4 w-4 mr-2" />
              Payments ({userDetails.paymentHistory?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Activity className="h-4 w-4 mr-2" />
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="letters">
            <Card>
              <CardHeader>
                <CardTitle>Dispute Letters</CardTitle>
              </CardHeader>
              <CardContent>
                {userDetails.letters && userDetails.letters.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Bureau</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Round</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userDetails.letters.map((letter: any) => (
                          <TableRow key={letter.id}>
                            <TableCell>#{letter.id}</TableCell>
                            <TableCell className="capitalize">{letter.bureau}</TableCell>
                            <TableCell className="capitalize">{letter.letterType?.replace('_', ' ')}</TableCell>
                            <TableCell>Round {letter.round}</TableCell>
                            <TableCell>
                              <Badge variant={letter.status === 'mailed' ? 'default' : 'secondary'}>
                                {letter.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {letter.createdAt ? new Date(letter.createdAt).toLocaleDateString() : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No letters generated yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounts">
            <Card>
              <CardHeader>
                <CardTitle>Negative Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                {userDetails.accounts && userDetails.accounts.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Creditor</TableHead>
                          <TableHead>Account #</TableHead>
                          <TableHead>Balance</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Bureau</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userDetails.accounts.map((account: any) => (
                          <TableRow key={account.id}>
                            <TableCell className="font-medium">{account.creditorName}</TableCell>
                            <TableCell>{account.accountNumber || '-'}</TableCell>
                            <TableCell>${account.balance?.toLocaleString() || '0'}</TableCell>
                            <TableCell>{account.accountStatus || '-'}</TableCell>
                            <TableCell className="capitalize">{account.bureau}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No negative accounts found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                {userDetails.paymentHistory && userDetails.paymentHistory.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Package</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userDetails.paymentHistory.map((payment: any) => (
                          <TableRow key={payment.id}>
                            <TableCell>#{payment.id}</TableCell>
                            <TableCell>${payment.amount?.toLocaleString() || '0'}</TableCell>
                            <TableCell>
                              <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                                {payment.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="capitalize">{payment.packageType || '-'}</TableCell>
                            <TableCell>
                              {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No payment history</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {userDetails.activity && userDetails.activity.length > 0 ? (
                  <div className="space-y-4">
                    {userDetails.activity.map((log: any, index: number) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                        <Activity className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium">{log.action}</p>
                          <p className="text-sm text-gray-600">{log.details}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {log.createdAt ? new Date(log.createdAt).toLocaleString() : '-'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No activity logged</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
