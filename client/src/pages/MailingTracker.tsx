import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { Truck, Mail, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Delivered':
      return <Badge variant="default" className="bg-green-500 hover:bg-green-500">Delivered</Badge>;
    case 'In Transit':
      return <Badge variant="secondary" className="bg-blue-500 hover:bg-blue-500">In Transit</Badge>;
    case 'Processing':
      return <Badge variant="outline" className="text-gray-500 border-gray-500">Processing</Badge>;
    case 'Failed':
      return <Badge variant="destructive">Failed</Badge>;
    default:
      return <Badge variant="outline" className="text-gray-600 border-gray-400">Unknown</Badge>;
  }
};

const getStatusLabel = (letter: any) => {
  if (letter.lobMailingStatus) {
    const map: Record<string, string> = {
      pending: 'Processing',
      processing: 'Processing',
      printed: 'Processing',
      mailed: 'In Transit',
      in_transit: 'In Transit',
      delivered: 'Delivered',
      returned: 'Failed',
      failed: 'Failed',
    };
    return map[letter.lobMailingStatus] || 'Processing';
  }

  if (letter.status === 'mailed') return 'In Transit';
  if (letter.status === 'response_received') return 'Delivered';
  if (letter.status === 'resolved') return 'Delivered';
  return 'Processing';
};

export default function MailingTracker() {
  const { data: disputeLetters = [], isLoading } = trpc.disputeLetters.list.useQuery();
  const mailingData = disputeLetters.filter((letter) => letter.trackingNumber || letter.status === 'mailed' || letter.lobMailingStatus);

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Mailing Tracker</h1>
        <p className="text-muted-foreground">Track the certified mail status for your dispute letters.</p>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-600" />
              Certified Mail Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-40 flex items-center justify-center text-gray-500">Loading tracking data...</div>
            ) : mailingData.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center text-gray-500">
                <AlertTriangle className="h-8 w-8 mb-2" />
                <p>No mailings found. Generate your first letters to start tracking!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bureau</TableHead>
                      <TableHead>Tracking Number</TableHead>
                      <TableHead>Mailed Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Delivered Date</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mailingData.map((mail) => (
                      <TableRow key={mail.id}>
                        <TableCell className="font-medium">{mail.bureau}</TableCell>
                        <TableCell>{mail.trackingNumber || '—'}</TableCell>
                        <TableCell>{mail.mailedAt ? format(new Date(mail.mailedAt), 'MMM dd, yyyy') : '—'}</TableCell>
                        <TableCell>{getStatusBadge(getStatusLabel(mail))}</TableCell>
                        <TableCell>
                          {mail.responseReceivedAt ? format(new Date(mail.responseReceivedAt), 'MMM dd, yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {mail.trackingNumber ? (
                            <a 
                              href={`https://tools.usps.com/go/TrackConfirmAction?tLabels=${mail.trackingNumber}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                            >
                              Track <Truck className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400">Tracking pending</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
