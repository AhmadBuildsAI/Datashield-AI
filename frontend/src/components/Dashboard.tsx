import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import toast from 'react-hot-toast';
import StatCard from './StatCard';
import { getDashboard } from '../services/scans';
import { DashboardData } from '../types';

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Privacy Dashboard</h1>
          <p className="text-gray-500 text-sm">
            Sensitive-data detection & masking overview
          </p>
        </div>
        <Link
          to="/scan"
          className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
        >
          🔍 New Scan
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Scans" value={data.total_scans} icon="📊" color="violet" />
        <StatCard title="High Risk" value={data.high_risk_scans} icon="🚨" color="red" />
        <StatCard title="Entities Detected" value={data.total_entities} icon="🛡️" color="blue" />
        <StatCard
          title="Avg Risk Score"
          value={data.avg_risk_score.toFixed(1)}
          icon="📈"
          color="yellow"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-3">Sensitive Data by Type</h3>
        {data.entity_distribution.length === 0 ? (
          <p className="text-sm text-gray-500 py-8 text-center">No scans yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data.entity_distribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
