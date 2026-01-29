"use client";

import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

// Mock Data
const generateData = (numPoints = 7) => {
  const labels = Array.from({ length: numPoints }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (numPoints - 1 - i));
    return d.toLocaleDateString();
  });
  
  return {
    labels,
    temperature: Array.from({ length: numPoints }, () => (22 + Math.random() * 5).toFixed(1)),
    humidity: Array.from({ length: numPoints }, () => (60 + Math.random() * 15).toFixed(1)),
    ph: Array.from({ length: numPoints }, () => (5.8 + Math.random() * 0.5).toFixed(1)),
  };
};

const mockData = generateData();

const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      }
    },
    y: {
      grid: {
        color: '#e0e0e0',
      }
    }
  }
};

const HydroponicsCharts = () => {
  const tempData = {
    labels: mockData.labels,
    datasets: [
      {
        label: 'Temperature (°C)',
        data: mockData.temperature,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const humidityData = {
    labels: mockData.labels,
    datasets: [
      {
        label: 'Humidity (%)',
        data: mockData.humidity,
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        tension: 0.3,
      },
    ],
  };
  
  const phData = {
    labels: mockData.labels,
    datasets: [
      {
        label: 'pH Level',
        data: mockData.ph,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        type: 'line' as const,
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-xl shadow-lg h-96">
        <h3 className="text-xl font-bold mb-4">Temperature Trend</h3>
        <Line options={commonOptions} data={tempData} />
      </div>
      <div className="bg-white p-6 rounded-xl shadow-lg h-96">
        <h3 className="text-xl font-bold mb-4">Humidity Trend</h3>
        <Line options={commonOptions} data={humidityData} />
      </div>
      <div className="bg-white p-6 rounded-xl shadow-lg h-96 col-span-1 lg:col-span-2">
        <h3 className="text-xl font-bold mb-4">pH Level Over Time</h3>
        <Line options={commonOptions} data={phData} />
      </div>
    </div>
  );
};

export default HydroponicsCharts;
