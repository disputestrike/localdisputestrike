import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';

export default function ScoreTracker() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Score Tracker</h1>
        <p className="text-lg text-gray-600">Monitor your credit score progress over time.</p>
        <div className="mt-8 p-6 bg-white border rounded-lg">
          <p className="font-semibold">Feature Status: Under Construction</p>
          <p className="text-sm text-gray-500">The score tracking charts and historical data views are being developed. Your current scores are visible on the main Dashboard.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
