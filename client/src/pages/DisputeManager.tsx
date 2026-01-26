import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';

export default function DisputeManager() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Dispute Manager</h1>
        <p className="text-lg text-gray-600">This is your central hub for managing all active and past disputes.</p>
        <div className="mt-8 p-6 bg-white border rounded-lg">
          <p className="font-semibold">Feature Status: Under Construction</p>
          <p className="text-sm text-gray-500">The dispute tracking and management interface is being built. All dispute letters are currently accessible via the main Dashboard's "Dispute Letters" tab.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
