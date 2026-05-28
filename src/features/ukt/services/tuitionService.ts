import api from '@/lib/axios';
import {
  AdminBillDetailResponseSchema,
  AdminBillsResponseSchema,
  AdminDashboardResponseSchema,
  AdminPaymentDetailResponseSchema,
  AdminPaymentsResponseSchema,
  AdminVirtualAccountsResponseSchema,
  MidtransStatusResponseSchema,
  StudentBillDetailResponseSchema,
  StudentBillsResponseSchema,
  StudentCheckoutResponseSchema,
  StudentPaymentDetailResponseSchema,
  StudentPaymentHistoryResponseSchema,
  StudentVirtualAccountResponseSchema,
  VerificationStatusSchema,
  PaymentMethodSchema,
  TuitionStatusSchema,
  StudentPaymentSchema,
  StudentBillSchema,
  AdminBillListItemSchema,
  AdminPaymentListItemSchema,
  AdminPaymentDetailSchema,
  AdminBillDetailSchema,
  StudentPaymentHistoryItemSchema,
} from '@/features/ukt/contracts/tuitionContracts';

export const tuitionStatusLabelMap = {
  unpaid: 'Belum Bayar',
  paid: 'Lunas',
  overdue: 'Terlambat',
  cancelled: 'Dibatalkan',
};

export const verificationStatusLabelMap = {
  pending: 'Menunggu Verifikasi',
  verified: 'Disetujui',
  rejected: 'Ditolak',
};

export function toDomainError(error: any, fallbackMessage = 'Terjadi kesalahan.') {
  const status = error?.response?.status || null;
  const payload = error?.response?.data || null;
  const message =
    payload?.message ||
    error?.userMessage ||
    error?.message ||
    fallbackMessage;

  const validationErrors = payload?.errors && typeof payload.errors === 'object' ? payload.errors : null;

  return {
    status,
    message,
    validationErrors,
    code: error?.code || null,
    isConnectivityError: Boolean(error?.isConnectivityError || (!status && error?.message)),
    raw: error,
  };
}

function buildParams(params: Record<string, any> = {}) {
  return Object.entries(params).reduce<Record<string, any>>((acc, [key, value]) => {
    if (value === undefined || value === null || value === '') return acc;
    acc[key] = value;
    return acc;
  }, {});
}

export function normalizeStudentPayment(raw: unknown) {
  const parsed = StudentPaymentSchema.parse(raw);
  const verification = VerificationStatusSchema.parse(parsed.verification_status);

  return {
    id: parsed.id_tuition_payment,
    id_tuition_payment: parsed.id_tuition_payment,
    amount_paid: parsed.amount_paid,
    payment_method: PaymentMethodSchema.parse(parsed.payment_method),
    payment_proof_url: parsed.payment_proof_url ?? parsed.payment_proof ?? null,
    transaction_reference: parsed.transaction_reference ?? null,
    verification_status: verification,
    verification_label: verificationStatusLabelMap[verification] || verification,
    verified_by: parsed.verified_by ?? null,
    verified_at: parsed.verified_at ?? null,
    rejection_reason: parsed.rejection_reason ?? null,
    admin_notes: parsed.admin_notes ?? null,
    uploaded_at: parsed.uploaded_at ?? null,
  };
}

export function normalizeStudentBill(raw: unknown) {
  const parsed = StudentBillSchema.parse(raw);
  const status = TuitionStatusSchema.parse(parsed.status);

  return {
    id: parsed.id_tuition_fee,
    id_tuition_fee: parsed.id_tuition_fee,
    academic_period: parsed.academic_period,
    tuition_rate: parsed.tuition_rate,
    amount: parsed.amount,
    discount: parsed.discount ?? 0,
    final_amount: parsed.final_amount,
    status,
    status_label: tuitionStatusLabelMap[status] || status,
    due_date: parsed.due_date ?? null,
    is_overdue: parsed.is_overdue ?? status === 'overdue',
    notes: parsed.notes ?? null,
    payment: parsed.payment ? normalizeStudentPayment(parsed.payment) : null,
    created_at: parsed.created_at ?? null,
    updated_at: parsed.updated_at ?? null,
  };
}

function computeStudentSummary(bills: Array<ReturnType<typeof normalizeStudentBill>>) {
  return bills.reduce(
    (summary, bill) => {
      summary.total_bills += 1;
      if (bill.status === 'paid') {
        summary.total_paid += 1;
        summary.total_paid_amount += bill.final_amount;
      } else if (bill.status === 'overdue') {
        summary.total_overdue += 1;
        summary.total_unpaid_amount += bill.final_amount;
      } else if (bill.status === 'cancelled') {
        summary.total_cancelled += 1;
      } else {
        summary.total_unpaid += 1;
        summary.total_unpaid_amount += bill.final_amount;
      }
      return summary;
    },
    {
      total_bills: 0,
      total_unpaid: 0,
      total_paid: 0,
      total_overdue: 0,
      total_cancelled: 0,
      total_unpaid_amount: 0,
      total_paid_amount: 0,
    },
  );
}

export async function fetchStudentTuitionBills(params: { status?: string; academic_period_id?: number } = {}) {
  try {
    const response = await api.get('/student/tuition', { params: buildParams(params) });
    const parsed = StudentBillsResponseSchema.parse(response.data);
    const bills = parsed.data.bills.map(normalizeStudentBill);
    const summary = parsed.data.summary
      ? parsed.data.summary
      : computeStudentSummary(bills);

    return {
      bills,
      summary,
      message: parsed.message || 'Daftar tagihan UKT berhasil diambil.',
    };
  } catch (error) {
    throw toDomainError(error, 'Gagal mengambil daftar tagihan UKT.');
  }
}

export async function fetchStudentTuitionBillDetail(id: number) {
  try {
    const response = await api.get(`/student/tuition/${id}`);
    const parsed = StudentBillDetailResponseSchema.parse(response.data);

    return {
      bill: normalizeStudentBill(parsed.data),
      message: parsed.message || 'Detail tagihan UKT berhasil diambil.',
    };
  } catch (error) {
    throw toDomainError(error, 'Gagal mengambil detail tagihan UKT.');
  }
}

export async function fetchStudentVirtualAccount() {
  try {
    const response = await api.get('/student/tuition/virtual-account');
    const parsed = StudentVirtualAccountResponseSchema.parse(response.data);

    return {
      account: parsed.data,
      message: parsed.message || 'Informasi Virtual Account berhasil diambil.',
    };
  } catch (error) {
    throw toDomainError(error, 'Gagal mengambil informasi Virtual Account.');
  }
}

export async function fetchStudentPaymentHistory() {
  try {
    const response = await api.get('/student/tuition/payments');
    const parsed = StudentPaymentHistoryResponseSchema.parse(response.data);

    const items = parsed.data.map((item) => {
      const normalized = normalizeStudentPayment(item);
      const withAcademicPeriod = StudentPaymentHistoryItemSchema.parse(item);
      return {
        ...normalized,
        academic_period: withAcademicPeriod.academic_period ?? '-',
      };
    });

    return {
      items,
      message: parsed.message || 'Riwayat pembayaran berhasil diambil.',
    };
  } catch (error) {
    throw toDomainError(error, 'Gagal mengambil riwayat pembayaran.');
  }
}

export async function fetchStudentPaymentDetail(id: number) {
  try {
    const response = await api.get(`/student/tuition/payments/${id}`);
    const parsed = StudentPaymentDetailResponseSchema.parse(response.data);

    return {
      payment: {
        ...normalizeStudentPayment(parsed.data),
        tuition_fee: parsed.data.tuition_fee,
      },
      message: parsed.message || 'Detail pembayaran berhasil diambil.',
    };
  } catch (error) {
    throw toDomainError(error, 'Gagal mengambil detail pembayaran.');
  }
}

export async function downloadStudentTuitionReceipt(id: number) {
  try {
    const response = await api.get(`/student/tuition/receipt/${id}`, {
      responseType: 'blob',
      headers: {
        Accept: 'application/pdf',
      },
    });

    return {
      blob: response.data,
      message: 'Kwitansi berhasil diunduh.',
    };
  } catch (error) {
    const status = error?.response?.status || null;
    const fallbackMessage =
      status === 404
        ? 'Endpoint kwitansi belum tersedia di backend.'
        : 'Gagal mengunduh kwitansi.';

    throw toDomainError(error, fallbackMessage);
  }
}

export async function submitStudentPayment(
  tuitionFeeId: number,
  payload: {
    payment_proof: File;
    payment_method: 'virtual_account' | 'bank_transfer' | 'manual';
    transaction_reference?: string;
    amount_paid?: number;
  },
) {
  try {
    // Build FormData from provided payload (client) before sending
    const formData = new FormData();
    if (payload.payment_proof) formData.append('payment_proof', payload.payment_proof as File);
    if (payload.payment_method) formData.append('payment_method', payload.payment_method);
    if (payload.transaction_reference) formData.append('transaction_reference', payload.transaction_reference);
    if (payload.amount_paid !== undefined) formData.append('amount_paid', String(payload.amount_paid));

    const response = await api.post(`/student/tuition/${tuitionFeeId}/pay`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const parsed = StudentPaymentDetailResponseSchema.safeParse(response.data);
    if (parsed.success) {
      const payment = parsed.data.data;
      return {
        payment: {
          ...normalizeStudentPayment(payment),
          tuition_fee: payment.tuition_fee,
        },
        message: parsed.data.message || 'Bukti pembayaran berhasil diupload.',
      };
    }

    // Fallback: try to parse server-returned payload as StudentPayment
    const serverPayload = response.data?.data ?? response.data;
    const paymentParsed = StudentPaymentSchema.safeParse(serverPayload);

    if (paymentParsed.success) {
      return {
        payment: normalizeStudentPayment(paymentParsed.data),
        message: response.data?.message || 'Bukti pembayaran berhasil diupload.',
      };
    }

    return {
      payment: serverPayload,
      message: response.data?.message || 'Bukti pembayaran berhasil diupload.',
    };
  } catch (error) {
    throw toDomainError(error, 'Gagal mengupload bukti pembayaran.');
  }
}

export async function checkoutStudentTuition(tuitionFeeId: number, bank: string) {
  try {
    const response = await api.post(`/student/tuition/${tuitionFeeId}/checkout`, { bank });
    const parsed = StudentCheckoutResponseSchema.parse(response.data);

    return {
      transaction: parsed.data,
      message: parsed.message || 'Transaksi pembayaran berhasil dibuat.',
    };
  } catch (error) {
    throw toDomainError(error, 'Gagal membuat transaksi pembayaran.');
  }
}

export async function fetchStudentPaymentStatus(tuitionFeeId: number) {
  try {
    const response = await api.get(`/student/tuition/${tuitionFeeId}/payment-status`);
    const parsed = MidtransStatusResponseSchema.parse(response.data);

    return {
      status: parsed.data,
      message: parsed.message || 'Status pembayaran berhasil diambil.',
    };
  } catch (error) {
    throw toDomainError(error, 'Gagal mengambil status pembayaran.');
  }
}

export async function fetchAdminTuitionDashboard(params: { academic_period_id?: number } = {}) {
  try {
    const response = await api.get('/admin/tuition/dashboard', { params: buildParams(params) });
    const parsed = AdminDashboardResponseSchema.parse(response.data);

    return {
      dashboard: parsed.data,
      message: parsed.message || 'Dashboard UKT berhasil diambil.',
    };
  } catch (error) {
    throw toDomainError(error, 'Gagal mengambil dashboard UKT.');
  }
}

export async function fetchAdminTuitionBills(params: Record<string, any> = {}) {
  try {
    const response = await api.get('/admin/tuition/bills', { params: buildParams(params) });
    const parsed = AdminBillsResponseSchema.parse(response.data);

    const items = parsed.data.map((item) => {
      const normalized = AdminBillListItemSchema.parse(item);
      const status = TuitionStatusSchema.parse(normalized.status);

      return {
        id: normalized.id_tuition_fee,
        id_tuition_fee: normalized.id_tuition_fee,
        student: normalized.student,
        academic_period: normalized.academic_period ?? '-',
        group_name: normalized.group_name ?? '-',
        amount: normalized.amount,
        discount: normalized.discount ?? 0,
        final_amount: normalized.final_amount,
        status,
        status_label: tuitionStatusLabelMap[status] || status,
        due_date: normalized.due_date ?? null,
        payment_status: normalized.payment_status ?? null,
        created_at: normalized.created_at ?? null,
      };
    });

    return {
      items,
      message: parsed.message || 'Daftar tagihan UKT berhasil diambil.',
    };
  } catch (error) {
    throw toDomainError(error, 'Gagal mengambil daftar tagihan UKT.');
  }
}

export async function fetchAdminTuitionBillDetail(id: number) {
  try {
    const response = await api.get(`/admin/tuition/bills/${id}`);
    const parsed = AdminBillDetailResponseSchema.parse(response.data);
    const normalized = AdminBillDetailSchema.parse(parsed.data);

    return {
      bill: {
        ...normalized,
        id: normalized.id_tuition_fee,
        status_label: tuitionStatusLabelMap[normalized.status] || normalized.status,
      },
      message: parsed.message || 'Detail tagihan UKT berhasil diambil.',
    };
  } catch (error) {
    throw toDomainError(error, 'Gagal mengambil detail tagihan UKT.');
  }
}

export async function createAdminTuitionBill(payload: Record<string, any>) {
  try {
    const response = await api.post('/admin/tuition/bills', payload);
    return response.data;
  } catch (error) {
    throw toDomainError(error, 'Gagal membuat tagihan UKT.');
  }
}

export async function generateAdminTuitionBills(payload: Record<string, any>) {
  try {
    const response = await api.post('/admin/tuition/bills/generate', payload);
    return response.data;
  } catch (error) {
    throw toDomainError(error, 'Gagal membuat tagihan massal.');
  }
}

export async function updateAdminTuitionBill(id: number, payload: Record<string, any>) {
  try {
    const response = await api.put(`/admin/tuition/bills/${id}`, payload);
    return response.data;
  } catch (error) {
    throw toDomainError(error, 'Gagal memperbarui tagihan UKT.');
  }
}

export async function fetchAdminTuitionPayments(params: Record<string, any> = {}) {
  try {
    const response = await api.get('/admin/tuition/payments', { params: buildParams(params) });
    const parsed = AdminPaymentsResponseSchema.parse(response.data);

    const items = parsed.data.map((item) => {
      const normalized = AdminPaymentListItemSchema.parse(item);
      const verification = VerificationStatusSchema.parse(normalized.verification_status);

      return {
        id: normalized.id_tuition_payment,
        id_tuition_payment: normalized.id_tuition_payment,
        student: normalized.student,
        academic_period: normalized.academic_period ?? '-',
        bill_amount: normalized.bill_amount ?? null,
        amount_paid: normalized.amount_paid,
        payment_method: normalized.payment_method,
        payment_proof_url: normalized.payment_proof_url ?? null,
        transaction_reference: normalized.transaction_reference ?? null,
        verification_status: verification,
        verification_label: verificationStatusLabelMap[verification] || verification,
        verified_by: normalized.verified_by ?? null,
        verified_at: normalized.verified_at ?? null,
        uploaded_at: normalized.uploaded_at ?? null,
      };
    });

    return {
      items,
      message: parsed.message || 'Daftar pembayaran UKT berhasil diambil.',
    };
  } catch (error) {
    throw toDomainError(error, 'Gagal mengambil daftar pembayaran UKT.');
  }
}

export async function fetchAdminTuitionPaymentDetail(id: number) {
  try {
    const response = await api.get(`/admin/tuition/payments/${id}`);
    const parsed = AdminPaymentDetailResponseSchema.parse(response.data);
    const normalized = AdminPaymentDetailSchema.parse(parsed.data);
    const verification = VerificationStatusSchema.parse(normalized.verification_status);

    return {
      payment: {
        ...normalized,
        id: normalized.id_tuition_payment,
        verification_label: verificationStatusLabelMap[verification] || verification,
      },
      message: parsed.message || 'Detail pembayaran UKT berhasil diambil.',
    };
  } catch (error) {
    throw toDomainError(error, 'Gagal mengambil detail pembayaran UKT.');
  }
}

export async function verifyAdminTuitionPayment(id: number, payload: { admin_notes?: string }) {
  try {
    const response = await api.patch(`/admin/tuition/payments/${id}/verify`, payload);
    return response.data;
  } catch (error) {
    throw toDomainError(error, 'Gagal memverifikasi pembayaran.');
  }
}

export async function rejectAdminTuitionPayment(
  id: number,
  payload: { rejection_reason: string; admin_notes?: string },
) {
  try {
    const response = await api.patch(`/admin/tuition/payments/${id}/reject`, payload);
    return response.data;
  } catch (error) {
    throw toDomainError(error, 'Gagal menolak pembayaran.');
  }
}

export async function fetchAdminVirtualAccounts(params: { search?: string } = {}) {
  try {
    const response = await api.get('/admin/tuition/virtual-accounts', { params: buildParams(params) });
    const parsed = AdminVirtualAccountsResponseSchema.parse(response.data);

    return {
      items: parsed.data,
      message: parsed.message || 'Daftar Virtual Account berhasil diambil.',
    };
  } catch (error) {
    throw toDomainError(error, 'Gagal mengambil daftar Virtual Account.');
  }
}

export async function generateAdminVirtualAccounts(payload: {
  bank_code: string;
  bank_name: string;
  bank_prefix: string;
}) {
  try {
    const response = await api.post('/admin/tuition/virtual-accounts/generate', payload);
    return response.data;
  } catch (error) {
    throw toDomainError(error, 'Gagal membuat Virtual Account.');
  }
}
