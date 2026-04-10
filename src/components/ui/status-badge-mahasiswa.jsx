'use client';

const REQUEST_STATUS = {
  pending: {
    label: 'Diproses',
    bg: '#fef9ec',
    border: '#fde68a',
    text: '#b45309',
    dot: '#f59e0b',
  },
  accepted: {
    label: 'Approved',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    text: '#065f46',
    dot: '#10b981',
  },
  rejected: {
    label: 'Ditolak',
    bg: '#fef2f2',
    border: '#fecaca',
    text: '#991b1b',
    dot: '#ef4444',
  },
};

const CONSULTATION_STATUS = {
  future: {
    label: 'Akan Datang',
    bg: '#fef9ec',
    border: '#fde68a',
    text: '#b45309',
    dot: '#f59e0b',
  },
  on_going: {
    label: 'Akan Datang',
    bg: '#fef9ec',
    border: '#fde68a',
    text: '#b45309',
    dot: '#f59e0b',
  },
  finished: {
    label: 'Selesai',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    text: '#065f46',
    dot: '#10b981',
  },
  past: {
    label: 'Selesai',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    text: '#065f46',
    dot: '#10b981',
  },
};

function pickMeta(status, type) {
  const key = String(status || '').toLowerCase();

  if (type === 'consultation') {
    return (
      CONSULTATION_STATUS[key] || {
        label: 'Akan Datang',
        bg: '#fef9ec',
        border: '#fde68a',
        text: '#b45309',
        dot: '#f59e0b',
      }
    );
  }

  return (
    REQUEST_STATUS[key] ||
    REQUEST_STATUS.pending
  );
}

export default function StatusBadgeMahasiswa({ status, type = 'request', className = '' }) {
  const meta = pickMeta(status, type);

  return (
    <span
      className={`inline-flex items-center gap-[6px] rounded-full border-[0.8px] px-[8px] py-[4px] text-[12px] font-medium ${className}`}
      style={{
        backgroundColor: meta.bg,
        borderColor: meta.border,
        color: meta.text,
        fontFamily: 'Urbanist, sans-serif',
      }}
    >
      <span
        className="h-[6px] w-[6px] rounded-full"
        style={{ backgroundColor: meta.dot }}
      />
      {meta.label}
    </span>
  );
}
