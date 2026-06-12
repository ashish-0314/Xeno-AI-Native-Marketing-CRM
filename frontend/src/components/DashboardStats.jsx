import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity } from 'lucide-react';

const DashboardStats = () => {
  const [stats, setStats] = useState({ Pending: 0, Delivered: 0, Failed: 0, Clicked: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      }
    };

    fetchStats(); // Initial fetch
    const interval = setInterval(fetchStats, 2000); // Poll every 2s

    return () => clearInterval(interval);
  }, []);

  const badgeColors = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Delivered: 'bg-green-100 text-green-800',
    Failed: 'bg-red-100 text-red-800',
    Clicked: 'bg-blue-100 text-blue-800'
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {Object.entries(stats).map(([status, count]) => (
        <div key={status} className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between border border-zinc-100">
          <div>
            <p className="text-sm font-medium text-zinc-500">{status} Messages</p>
            <p className="text-3xl font-bold text-zinc-900 mt-2">{count}</p>
          </div>
          <div className={`p-3 rounded-full ${badgeColors[status]}`}>
            <Activity className="w-6 h-6" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
