'use client';

interface ThesisQuotaMeterProps {
  label: string;
  value: number;
  max: number;
  helperText?: string;
}

export default function ThesisQuotaMeter({
  label,
  value,
  max,
  helperText,
}: ThesisQuotaMeterProps) {
  const percent = max <= 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  const tone =
    percent >= 100 ? '#BE0414' : percent >= 75 ? '#D97706' : '#16874B';

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#015023]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
            {label}
          </p>
          {helperText ? (
            <p className="text-xs text-gray-500" style={{ fontFamily: 'Urbanist, sans-serif' }}>
              {helperText}
            </p>
          ) : null}
        </div>
        <p className="text-sm font-bold text-[#015023]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
          {value}/{max}
        </p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full transition-all" style={{ width: `${percent}%`, backgroundColor: tone }} />
      </div>
    </div>
  );
}
