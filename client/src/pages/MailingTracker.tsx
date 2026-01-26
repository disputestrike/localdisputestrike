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

// Mock data for table if no real data is available
const MOCK_MAILING_DATA = [
  { id: 1, bureau: 'TransUnion', trackingNumber: '9400109699939000000000', mailedDate: '2024-05-15', status: 'Delivered', deliveredDate: '2024-05-18' },
  { id: 2, bureau: 'Equifax', trackingNumber: '9400109699939000000001', mailedDate: '2024-05-15', status: 'In Transit', deliveredDate: null },
  { id: 3, bureau: 'Experian', trackingNumber: '9400109699939000000002', mailedDate: '2024-05-15', status: 'Processing', deliveredDate: null },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Delivered':
      return <Badge variant="default" className="bg-green-500 hover:bg-green-500">Delivered</Badge>;
    case 'In Transit':
      return <Badge variant="secondary" className="bg-blue-500 hover:bg-blue-500">In Transit</Badge>;
    case 'Processing':
      return <Badge variant="outline" className="text-gray-500 border-gray-500">Processing</Badge>;
    default:
      return <Badge variant="destructive">Unknown</Badge>;
  }
};

export default function MailingTracker() {
  // Fetch mailing data (this endpoint will need to be implemented on the server)
  // const { data: mailingData = [], isLoading } = trpc.mailing.list.useQuery();
  const isLoading = false;
  const mailingData = MOCK_MAILING_DATA;

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
                        <TableCell>{mail.trackingNumber}</TableCell>
                        <TableCell>{format(new Date(mail.mailedDate), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{getStatusBadge(mail.status)}</TableCell>
                        <TableCell>
                          {mail.deliveredDate ? format(new Date(mail.deliveredDate), 'MMM dd, yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <a 
                            href={`https://tools.usps.com/go/TrackConfirmAction?tLabels=${mail.trackingNumber}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                          >
                            Track <Truck className="h-3 w-3" />
                          </a>
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
