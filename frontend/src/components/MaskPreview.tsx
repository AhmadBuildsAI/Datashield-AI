import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { remask } from '../services/scans';
import { ScanResponse } from '../types';

interface Props {
  scan: ScanResponse;
  onUpdate: (s: ScanResponse) => void;
}

const MODES = [
  { key: 'mask', label: 'Mask', example: '[EMAIL]' },
  { key: 'replace', label: 'Replace', example: '<EMAIL_REDACTED>' },
  { key: 'remove', label: 'Remove', example: '(removed)' },
  { key: 'keep', label: 'Keep', example: 'unchanged' },
];

const MaskPreview: React.FC<Props> = ({ scan, onUpdate }) => {
  const [mode, setMode] = useState(scan.mask_mode);
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    setLoading(true);
    try {
      const updated = await remask(scan.scan_id, mode);
      onUpdate({ ...updated, mask_mode: mode });
      toast.success(`Applied "${mode}" mode`);
    } catch {
      toast.error('Failed to remask');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-800 mb-3">🎭 Masked Preview</h3>

      <div className="flex flex-wrap gap-2 mb-3">
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition ${
              mode === m.key
                ? 'bg-violet-600 text-white border-violet-600'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}
          >
            {m.label}
            <span className="ml-2 text-xs opacity-70">{m.example}</span>
          </button>
        ))}
      </div>

      <pre className="bg-gray-900 text-green-300 text-sm rounded-lg p-4 overflow-x-auto whitespace-pre-wrap font-mono max-h-96">
        {scan.masked_text || '(no masked text)'}
      </pre>

      <div className="flex justify-end mt-3">
        <button
          onClick={handleApply}
          disabled={loading || mode === scan.mask_mode}
          className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 text-sm"
        >
          {loading ? 'Applying...' : 'Apply Mode'}
        </button>
      </div>
    </div>
  );
};

export default MaskPreview;
