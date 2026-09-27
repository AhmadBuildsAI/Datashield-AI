import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { scanText, scanFile } from '../services/scans';

const SAMPLE = `Hi team,

Please review the attached invoice for Ahmed Khattak.
Contact: ahmed.khattak@example.com | Phone: 0300-1234567
CNIC: 42101-1234567-1
Bank account: PK36SCBL0000001123456702
Credit card on file: 4111 1111 1111 1111
API key: [REDACTED_API_KEY]
Password: SuperSecret123!

Meeting scheduled for 2026-09-30 at 14:00.
Server IP: 192.168.1.42
`;

const Scan: React.FC = () => {
  const [mode, setMode] = useState<'text' | 'file'>('text');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [maskMode, setMaskMode] = useState('mask');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleScan = async () => {
    setLoading(true);
    try {
      let result;
      if (mode === 'text') {
        if (text.trim().length < 3) {
          toast.error('Please paste some text');
          setLoading(false);
          return;
        }
        result = await scanText(text, maskMode);
      } else {
        if (!file) {
          toast.error('Please select a file');
          setLoading(false);
          return;
        }
        result = await scanFile(file, maskMode);
      }
      toast.success(`Scan complete — ${result.entities.length} entities`);
      navigate(`/scan/${result.scan_id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Scan failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Scan for Sensitive Data</h1>
        <p className="text-gray-500 text-sm">
          Paste text or upload a file to detect & mask PII, financial data, and credentials
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex">
            {(['text', 'file'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-6 py-3 text-sm font-medium ${
                  mode === m
                    ? 'border-b-2 border-violet-600 text-violet-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {m === 'text' ? '📝 Paste Text' : '📁 Upload File'}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 space-y-4">
          {mode === 'text' ? (
            <>
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">Text</label>
                <button
                  onClick={() => setText(SAMPLE)}
                  className="text-xs text-violet-600 hover:underline"
                >
                  Load sample data
                </button>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={14}
                placeholder="Paste text containing names, emails, phones, CNIC, credit cards, API keys..."
                className="w-full rounded-lg border border-gray-300 p-3 font-mono text-sm resize-none focus:border-violet-500 focus:ring-violet-500"
              />
            </>
          ) : (
            <>
              <input
                ref={inputRef}
                type="file"
                accept=".txt,.csv,.md,.log"
                onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                className="hidden"
              />
              <div
                onClick={() => inputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-violet-500 transition"
              >
                <div className="text-5xl mb-2">📄</div>
                <p className="font-medium text-gray-700">
                  {file ? file.name : 'Click to upload (.txt, .csv, .md, .log)'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Max 10 MB</p>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Masking Mode</label>
            <select
              value={maskMode}
              onChange={(e) => setMaskMode(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="mask">Mask (e.g., [EMAIL])</option>
              <option value="replace">Replace (e.g., &lt;EMAIL_REDACTED&gt;)</option>
              <option value="remove">Remove</option>
              <option value="keep">Keep (detect only)</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleScan}
              disabled={loading}
              className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 font-semibold"
            >
              {loading ? '⏳ Scanning...' : '🔍 Scan Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scan;
