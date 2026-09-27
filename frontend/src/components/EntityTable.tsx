import React from 'react';
import { DetectedEntity } from '../types';

interface Props {
  entities: DetectedEntity[];
}

const SEV_STYLE: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  LOW: 'bg-blue-100 text-blue-700',
};

const EntityTable: React.FC<Props> = ({ entities }) => {
  if (!entities || entities.length === 0) {
    return <p className="text-sm text-gray-500">No entities detected.</p>;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
          <tr>
            <th className="px-4 py-3 text-left">Type</th>
            <th className="px-4 py-3 text-left">Value</th>
            <th className="px-4 py-3 text-left">Severity</th>
            <th className="px-4 py-3 text-left">Source</th>
            <th className="px-4 py-3 text-left">Confidence</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {entities.map((e, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-mono text-xs text-gray-700">{e.type}</td>
              <td className="px-4 py-3 text-gray-800 max-w-xs truncate">{e.value}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded text-xs font-bold ${SEV_STYLE[e.severity] || SEV_STYLE.LOW}`}>
                  {e.severity}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-gray-500">{e.source}</td>
              <td className="px-4 py-3">{(e.confidence * 100).toFixed(0)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EntityTable;
