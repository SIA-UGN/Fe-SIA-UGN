import { getStatusMeta } from '@/features/admin-bimbingan/utils';

export default function StatusBadge({ status, className = '' }) {
  const meta = getStatusMeta(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${className}`}
      style={{
        backgroundColor: meta.bg,
        borderColor: meta.border,
        color: meta.text,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: meta.dot }}
        aria-hidden="true"
      />
      {meta.label}
    </span>
  );
}
