import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import RiskGauge from './RiskGauge';
import EntityHighlight from './EntityHighlight';
import EntityTable from './EntityTable';
import MaskPreview from './MaskPreview';
import StatCard from './StatCard';
import { getScan } from '../services/scans';
import { ScanResponse } from '../types';

const DetectionResults: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [scan, setScan] = useState<ScanResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getScan(id)
      .then(setScan)
      .catch(() => {
        toast.error('Failed to load scan');
        navigate('/history');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;
  if (!scan) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Detection Results</h1>
          <p className="text-gray-500 text-sm">
            {scan.scan_ref} · {scan.filename || 'pasted text'} · {scan.content_chars} chars
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/scan')}
            className="px-3 py-1.5 text-sm bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200"
          >
            + New Scan
          </button>
          <button
            onClick={() => navigate('/history')}
            className="text-sm text-violet-600 hover:underline"
          >
            ← History
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Entities Detected"
          value={scan.entities.length}
          icon="🛡️"
          color="violet"
        />
        <StatCard title="HIGH" value={scan.high_count} icon="🚨" color="red" />
        <StatCard title="MEDIUM" value={scan.medium_count} icon="⚠️" color="yellow" />
        <StatCard title="LOW" value={scan.low_count} icon="ℹ️" color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <RiskGauge score={scan.risk_score} level={scan.risk_level} />
        </div>
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-3">📊 Entity Breakdown</h3>
            <div className="space-y-2">
              {Object.entries(scan.entity_counts)
                .sort((a, b) => b[1] - a[1])
                .map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-gray-100 py-1.5 text-sm">
                    <span className="font-mono text-gray-700">{k}</span>
                    <span className="font-semibold text-gray-800">{v}</span>
                  </div>
                ))}
              {Object.keys(scan.entity_counts).length === 0 && (
                <p className="text-sm text-green-600">✅ No sensitive entities detected</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <EntityHighlight text={scan.original_text} entities={scan.entities} />

      <EntityTable entities={scan.entities} />

      <MaskPreview scan={scan} onUpdate={setScan} />
    </div>
  );
};

export default DetectionResults;
