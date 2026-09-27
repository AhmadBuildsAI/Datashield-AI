import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import toast from 'react-hot-toast';
import StatCard from './StatCard';
import { getModelInfo } from '../services/scans';
import { getDashboard } from '../services/scans';

const Analytics: React.FC = () => {
  const [dashboard, setDashboard] = useState<any>(null);
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboard(), getModelInfo()])
      .then(([d, m]) => {
        setDashboard(d);
        setModelInfo(m);
      })
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;
  if (!dashboard || !modelInfo) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
        <p className="text-gray-500 text-sm">Detection statistics & model metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Scans" value={dashboard.total_scans} color="violet" icon="📊" />
        <StatCard title="Total Entities" value={dashboard.total_entities} color="blue" icon="🛡️" />
        <StatCard
          title="High Risk Scans"
          value={dashboard.high_risk_scans}
          color="red"
          icon="🚨"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-3">Entity Distribution</h3>
        {dashboard.entity_distribution.length === 0 ? (
          <p className="text-sm text-gray-500 py-8 text-center">No data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={dashboard.entity_distribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-3">🧠 Detection Pipeline</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <p className="text-gray-500">NER Model</p>
            <p className="font-medium">{modelInfo.model_name}</p>
          </div>
          <div>
            <p className="text-gray-500">Framework</p>
            <p className="font-medium">{modelInfo.framework}</p>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase">Detection Layers</p>
          {modelInfo.detection_layers.map((l: string, i: number) => (
            <p key={i} className="text-sm text-gray-700">• {l}</p>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-3">Per-Entity Performance (Sample)</h3>
        {Object.keys(modelInfo.metrics || {}).length === 0 ? (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
            Evaluation metrics are not available yet. Run the bundled NER training script to create <code>ml/models/metrics.json</code>.
          </div>
        ) : (
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-2 text-left">Entity</th>
              <th className="px-4 py-2 text-left">Precision</th>
              <th className="px-4 py-2 text-left">Recall</th>
              <th className="px-4 py-2 text-left">F1</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Object.entries(modelInfo.metrics || {}).map(([k, v]: [string, any]) => (
              <tr key={k}>
                <td className="px-4 py-2 font-mono text-xs">{k}</td>
                <td className="px-4 py-2">{v.precision?.toFixed(3)}</td>
                <td className="px-4 py-2">{v.recall?.toFixed(3)}</td>
                <td className="px-4 py-2 font-semibold">{v.f1?.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
};

export default Analytics;
