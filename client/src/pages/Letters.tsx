import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';

export default function Letters() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Dispute Letters History</h1>
        <p className="text-lg text-gray-600">View and download all generated dispute letters.</p>
        <div className="mt-8 p-6 bg-white border rounded-lg">
          <p className="font-semibold">Feature Status: Under Construction</p>
          <p className="text-sm text-gray-500">The dedicated letter history page is being developed. For now, you can access your generated letters from the main Dashboard's "Dispute Letters" tab.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
