import {
  findStudentById,
  getAcademicPeriodById,
  getMockState,
  getSnapshot,
  isoNow,
  withComputedBillStatus,
} from './db';

const DEFAULT_DELAY = 450;

function delay(ms = DEFAULT_DELAY) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function formatVerificationRow(payment, bill, student, period) {
  return {
    id_tuition_payment: payment.id_tuition_payment,
    student: {
      id_user_si: student?.id_user_si,
      name: student?.name,
      nim: student?.nim,
      program: student?.program_name,
    },
    tuition_fee: {
      id_tuition_fee: bill?.id_tuition_fee,
      academic_period: period?.name || '-',
      final_amount: Number(bill?.final_amount || 0),
      status: bill?.status || 'unpaid',
    },
    amount_paid: Number(payment.amount_paid),
    payment_method: payment.payment_method,
    payment_proof_url: payment.payment_proof,
    transaction_reference: payment.transaction_reference,
    verification_status: payment.verification_status,
    verified_by: payment.verified_by,
    verified_at: payment.verified_at,
    rejection_reason: payment.rejection_reason,
    admin_notes: payment.admin_notes,
    uploaded_at: payment.uploaded_at,
    transaction_date: payment.transaction_date,
  };
}

function filterByKeyword(value, keyword) {
  if (!keyword) return true;
  const normalized = String(keyword).toLowerCase();
  return String(value || '').toLowerCase().includes(normalized);
}

export async function mockGetVerifikasiList({ verification_status, search } = {}) {
  await delay();

  const state = getSnapshot();

  const rows = state.tuitionPayments
    .map((payment) => {
      const billRaw = state.tuitionFees.find((item) => item.id_tuition_fee === payment.id_tuition_fee);
      const bill = billRaw ? withComputedBillStatus(billRaw) : null;
      const student = state.students.find((item) => item.id_user_si === payment.id_user_si);
      const period = getAcademicPeriodById(bill?.id_academic_period);
      return formatVerificationRow(payment, bill, student, period);
    })
    .filter((row) => {
      if (!verification_status || verification_status === 'all') return true;
      return row.verification_status === verification_status;
    })
    .filter((row) => {
      if (!search) return true;
      return (
        filterByKeyword(row.student.name, search) ||
        filterByKeyword(row.student.nim, search)
      );
    })
    .sort((a, b) => Number(b.id_tuition_payment) - Number(a.id_tuition_payment));

  const summary = {
    pending: rows.filter((item) => item.verification_status === 'pending').length,
    verified: rows.filter((item) => item.verification_status === 'verified').length,
    rejected: rows.filter((item) => item.verification_status === 'rejected').length,
    total_received_amount: rows
      .filter((item) => item.verification_status === 'verified')
      .reduce((total, item) => total + Number(item.amount_paid || 0), 0),
  };

  return {
    status: 'success',
    message: 'Daftar pembayaran UKT berhasil diambil.',
    data: {
      rows,
      summary,
    },
  };
}

export async function mockGetVerifikasiDetail(id) {
  await delay();

  const state = getSnapshot();
  const payment = state.tuitionPayments.find((item) => Number(item.id_tuition_payment) === Number(id));

  if (!payment) {
    throw new Error('Detail pembayaran tidak ditemukan.');
  }

  const billRaw = state.tuitionFees.find((item) => item.id_tuition_fee === payment.id_tuition_fee);
  const bill = billRaw ? withComputedBillStatus(billRaw) : null;
  const student = state.students.find((item) => item.id_user_si === payment.id_user_si);
  const period = getAcademicPeriodById(bill?.id_academic_period);

  return {
    status: 'success',
    message: 'Detail pembayaran UKT berhasil diambil.',
    data: formatVerificationRow(payment, bill, student, period),
  };
}

export async function mockApproveVerifikasi(id, { admin_notes } = {}) {
  await delay(650);

  const state = getMockState();
  const payment = state.tuitionPayments.find((item) => Number(item.id_tuition_payment) === Number(id));
  if (!payment) {
    throw new Error('Pembayaran tidak ditemukan.');
  }

  const bill = state.tuitionFees.find((item) => item.id_tuition_fee === payment.id_tuition_fee);
  if (!bill) {
    throw new Error('Tagihan terkait tidak ditemukan.');
  }

  const nowIso = isoNow();
  payment.verification_status = 'verified';
  payment.admin_notes = admin_notes || payment.admin_notes || 'Pembayaran diverifikasi.';
  payment.verified_by = 'Admin UGN';
  payment.verified_at = nowIso;
  payment.rejection_reason = null;
  payment.updated_at = nowIso;

  bill.status = 'paid';
  bill.updated_at = nowIso;

  return {
    status: 'success',
    message: 'Pembayaran berhasil diverifikasi. Status tagihan: LUNAS.',
    data: {
      id_tuition_payment: payment.id_tuition_payment,
      verification_status: payment.verification_status,
      verified_at: payment.verified_at,
      bill_status: bill.status,
    },
  };
}

export async function mockRejectVerifikasi(id, { rejection_reason, admin_notes } = {}) {
  await delay(650);

  const state = getMockState();
  const payment = state.tuitionPayments.find((item) => Number(item.id_tuition_payment) === Number(id));
  if (!payment) {
    throw new Error('Pembayaran tidak ditemukan.');
  }

  const bill = state.tuitionFees.find((item) => item.id_tuition_fee === payment.id_tuition_fee);
  if (!bill) {
    throw new Error('Tagihan terkait tidak ditemukan.');
  }

  const nowIso = isoNow();
  payment.verification_status = 'rejected';
  payment.rejection_reason = rejection_reason || 'Bukti pembayaran tidak valid.';
  payment.admin_notes = admin_notes || null;
  payment.verified_by = 'Admin UGN';
  payment.verified_at = nowIso;
  payment.updated_at = nowIso;

  bill.status = 'unpaid';
  bill.updated_at = nowIso;

  return {
    status: 'success',
    message: 'Pembayaran ditolak. Mahasiswa dapat mengupload ulang bukti pembayaran.',
    data: {
      id_tuition_payment: payment.id_tuition_payment,
      verification_status: payment.verification_status,
      rejection_reason: payment.rejection_reason,
    },
  };
}

export async function mockGetPaymentStatusTimeline(id) {
  await delay();

  const state = getSnapshot();
  const payment = state.tuitionPayments.find((item) => Number(item.id_tuition_payment) === Number(id));
  if (!payment) {
    throw new Error('Data timeline pembayaran tidak ditemukan.');
  }

  const bill = state.tuitionFees.find((item) => item.id_tuition_fee === payment.id_tuition_fee);
  const student = findStudentById(payment.id_user_si);

  const steps = [
    {
      key: 'uploaded',
      label: 'Bukti Diupload',
      time: payment.uploaded_at,
      done: Boolean(payment.uploaded_at),
      description: `${student?.name || 'Mahasiswa'} mengunggah bukti pembayaran`,
    },
    {
      key: 'review',
      label: 'Proses Verifikasi',
      time: payment.verification_status === 'pending' ? payment.updated_at : payment.verified_at,
      done: payment.verification_status !== 'pending',
      description: 'Admin memeriksa kesesuaian nominal dan bukti transfer',
    },
    {
      key: 'result',
      label: payment.verification_status === 'verified' ? 'Disetujui' : 'Hasil Verifikasi',
      time: payment.verified_at,
      done: payment.verification_status !== 'pending',
      description:
        payment.verification_status === 'verified'
          ? `Tagihan #${bill?.id_tuition_fee || '-'} dinyatakan lunas`
          : payment.verification_status === 'rejected'
          ? payment.rejection_reason || 'Pembayaran ditolak dan perlu upload ulang'
          : 'Menunggu tindakan admin',
    },
  ];

  return {
    status: 'success',
    message: 'Timeline pembayaran berhasil diambil.',
    data: steps,
  };
}
