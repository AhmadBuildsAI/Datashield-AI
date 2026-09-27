import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { listScans } from '../services/scans';
import { ScanListItem } from '../types';

const RISK_STYLE: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  LOW: 'bg-green-100 text-green-700',
};

const ScanHistory: React.FC = () => {
  const [scans, setScans] = useState<ScanListItem[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listScans(filter || undefined)
      .then(setScans)
      .catch(() => toast.error('Failed to load history'))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Scan History</h1>
          <p className="text-gray-500 text-sm">{scans.length} scans</p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All Risk Levels</option>
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Ref</th>
              <th className="px-4 py-3 text-left">Source</th>
              <th className="px-4 py-3 text-left">Entities</th>
              <th className="px-4 py-3 text-left">Risk</th>
              <th className="px-4 py-3 text-left">Score</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : scans.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No scans yet</td></tr>
            ) : (
              scans.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{s.scan_ref}</td>
                  <td className="px-4 py-3 text-gray-600 truncate max-w-xs">
                    {s.filename || 'pasted text'}
                  </td>
                  <td className="px-4 py-3">{s.total_entities}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${RISK_STYLE[s.risk_level]}`}>
                      {s.risk_level}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono">{s.risk_score.toFixed(1)}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(s.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/scan/${s.id}`} className="text-violet-600 hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScanHistory;
