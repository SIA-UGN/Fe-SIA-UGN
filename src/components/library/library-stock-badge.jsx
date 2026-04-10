import { Check, X } from 'lucide-react';

export default function LibraryStockBadge({ isAvailable, className = '' }) {
  const label = isAvailable ? 'Tersedia' : 'Kosong';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-semibold ${className}`}
      style={{
        fontFamily: 'Urbanist, sans-serif',
        backgroundColor: isAvailable ? '#22c55e' : '#ef4444',
        color: '#ffffff',
      }}
    >
      {isAvailable ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
      {label}
    </span>
  );
}
