'use client';

import { getStatusLabel, getStatusTone } from '../utils';

const toneClasses: Record<string, string> = {
  amber: 'border-amber-300 bg-amber-50 text-amber-700',
  green: 'border-emerald-300 bg-emerald-50 text-emerald-700',
  red: 'border-red-300 bg-red-50 text-red-700',
  slate: 'border-slate-300 bg-slate-50 text-slate-700',
  blue: 'border-blue-300 bg-blue-50 text-blue-700',
};

export default function ThesisStatusBadge({ status }: { status: string }) {
  const tone = getStatusTone(status);

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses[tone]}`}
      style={{ fontFamily: 'Urbanist, sans-serif' }}
    >
      {getStatusLabel(status)}
    </span>
  );
}
