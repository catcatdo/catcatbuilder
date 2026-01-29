import type { Metadata } from 'next';
import HydroponicsCharts from '@/components/hydroponics-charts';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Visualize your hydroponics data.',
};

const DashboardPage = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-gray-800">Lettuce Growth Dashboard</h1>
      <p className="text-lg text-gray-600">
        Real-time monitoring of your hydroponics system for optimal lettuce growth.
      </p>
      <HydroponicsCharts />
    </div>
  );
};

export default DashboardPage;
