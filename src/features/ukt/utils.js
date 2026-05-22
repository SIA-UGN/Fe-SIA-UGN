export const BILL_STATUS_META = {
  unpaid: {
    label: 'Belum Bayar',
    className: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]',
  },
  overdue: {
    label: 'Terlambat',
    className: 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]',
  },
  paid: {
    label: 'Lunas',
    className: 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]',
  },
  cancelled: {
    label: 'Dibatalkan',
    className: 'bg-[#E5E7EB] text-[#374151] border-[#D1D5DB]',
  },
};

export const PAYMENT_STATUS_META = {
  pending: {
    label: 'Menunggu Verifikasi',
    className: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]',
  },
  verified: {
    label: 'Disetujui',
    className: 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]',
  },
  rejected: {
    label: 'Ditolak',
    className: 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]',
  },
};

export function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function getBillDisplayStatus(bill) {
  if (!bill) return 'unpaid';
  if (bill.payment?.verification_status === 'pending') {
    return 'pending';
  }
  if (bill.payment?.verification_status === 'rejected') {
    return 'rejected';
  }
  return bill.status;
}

export function getBillStatusMeta(bill) {
  const displayStatus = getBillDisplayStatus(bill);
  if (displayStatus === 'pending' || displayStatus === 'rejected') {
    return PAYMENT_STATUS_META[displayStatus];
  }
  return BILL_STATUS_META[displayStatus] || BILL_STATUS_META.unpaid;
}

export function toShortPaymentMethod(method) {
  if (method === 'virtual_account') return 'VA';
  if (method === 'bank_transfer') return 'Transfer';
  if (method === 'manual') return 'Manual';
  return '-';
}

export function canSimulatePayment(bill) {
  if (!bill) return false;
  if (bill.status === 'paid' || bill.status === 'cancelled') return false;
  if (bill.payment?.verification_status === 'pending') return false;
  return true;
}
