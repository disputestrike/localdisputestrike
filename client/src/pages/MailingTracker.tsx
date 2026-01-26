import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';

export default function MailingTracker() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Mailing Tracker</h1>
        <p className="text-lg text-gray-600">Track the status of your certified mail (Complete Tier only).</p>
        <div className="mt-8 p-6 bg-white border rounded-lg">
          <p className="font-semibold">Feature Status: Under Construction</p>
          <p className="text-sm text-gray-500">This feature is for Complete Tier members to track letters sent by DisputeStrike. The integration with the mailing service is currently being finalized.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
