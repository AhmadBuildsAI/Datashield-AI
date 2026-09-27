import React from 'react';
import { DetectedEntity } from '../types';

interface Props {
  text: string;
  entities: DetectedEntity[];
}

const SEVERITY_COLORS: Record<string, string> = {
  HIGH: 'bg-red-200 text-red-900',
  MEDIUM: 'bg-yellow-200 text-yellow-900',
  LOW: 'bg-blue-200 text-blue-900',
};

const EntityHighlight: React.FC<Props> = ({ text, entities }) => {
  if (!entities || entities.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-3">📄 Original Text</h3>
        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">{text}</pre>
      </div>
    );
  }

  const sorted = [...entities].sort((a, b) => a.start - b.start);
  const parts: React.ReactNode[] = [];
  let cursor = 0;

  sorted.forEach((e, i) => {
    if (e.start > cursor) {
      parts.push(<span key={`t-${i}`}>{text.slice(cursor, e.start)}</span>);
    }
    parts.push(
      <span
        key={`e-${i}`}
        className={`px-1 rounded ${SEVERITY_COLORS[e.severity] || SEVERITY_COLORS.LOW}`}
        title={`${e.type} · ${e.source} · ${(e.confidence * 100).toFixed(0)}%`}
      >
        {text.slice(e.start, e.end)}
      </span>
    );
    cursor = e.end;
  });
  if (cursor < text.length) {
    parts.push(<span key="tail">{text.slice(cursor)}</span>);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-800 mb-3">📄 Original Text (with highlights)</h3>
      <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
        {parts}
      </pre>
      <div className="flex gap-3 mt-3 text-xs">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-200 inline-block" /> HIGH
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-yellow-200 inline-block" /> MEDIUM
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-blue-200 inline-block" /> LOW
        </span>
      </div>
    </div>
  );
};

export default EntityHighlight;
