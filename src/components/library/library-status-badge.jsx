const STATUS_MAP = {
  order: {
    ordered: { label: 'Dipesan', bg: '#fef3c7', border: '#fcd34d', text: '#92400e' },
    borrowed: { label: 'Dipinjam', bg: '#dbeafe', border: '#93c5fd', text: '#1e3a8a' },
    returned: { label: 'Dikembalikan', bg: '#dcfce7', border: '#86efac', text: '#166534' },
    cancelled: { label: 'Dibatalkan', bg: '#fee2e2', border: '#fca5a5', text: '#991b1b' },
  },
  suggestion: {
    pending: { label: 'Menunggu', bg: '#fef3c7', border: '#fcd34d', text: '#92400e' },
    approved: { label: 'Disetujui', bg: '#dcfce7', border: '#86efac', text: '#166534' },
    rejected: { label: 'Ditolak', bg: '#fee2e2', border: '#fca5a5', text: '#991b1b' },
  },
};

function getMeta(type, status) {
  const source = STATUS_MAP[type] || {};
  return (
    source[String(status).toLowerCase()] || {
      label: status || '-',
      bg: '#f3f4f6',
      border: '#d1d5db',
      text: '#374151',
    }
  );
}

export default function LibraryStatusBadge({ type = 'order', status, className = '' }) {
  const meta = getMeta(type, status);

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[12px] font-semibold ${className}`}
      style={{
        fontFamily: 'Urbanist, sans-serif',
        backgroundColor: meta.bg,
        borderColor: meta.border,
        color: meta.text,
      }}
    >
      {meta.label}
    </span>
  );
}
