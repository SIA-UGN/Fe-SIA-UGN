const academicPeriods = [
  {
    id_academic_period: 3,
    name: 'Semester Genap 2025/2026',
    is_active: true,
    start_date: '2026-02-01',
    end_date: '2026-07-31',
  },
  {
    id_academic_period: 2,
    name: 'Semester Ganjil 2025/2026',
    is_active: false,
    start_date: '2025-08-01',
    end_date: '2026-01-31',
  },
];

const students = [
  {
    id_user_si: 5,
    nim: '2024001',
    name: 'Budi Santoso',
    id_program: 2,
    program_name: 'Teknik Informatika',
    ukt_group: 'UKT 5',
    ukt_amount: 4000000,
    virtual_accounts: [
      { bank: 'BNI', nomor: '88012024001', bank_code: 'BNI', bank_name: 'Bank Negara Indonesia', is_active: true },
      { bank: 'Mandiri', nomor: '70012024001', bank_code: 'BMRI', bank_name: 'Bank Mandiri', is_active: true },
      { bank: 'BCA', nomor: '01422024001', bank_code: 'BCA', bank_name: 'Bank Central Asia', is_active: true },
    ],
  },
  {
    id_user_si: 7,
    nim: '2024003',
    name: 'Citra Dewi',
    id_program: 2,
    program_name: 'Teknik Informatika',
    ukt_group: 'UKT 6',
    ukt_amount: 5000000,
    virtual_accounts: [
      { bank: 'BNI', nomor: '88012024003', bank_code: 'BNI', bank_name: 'Bank Negara Indonesia', is_active: true },
      { bank: 'Mandiri', nomor: '70012024003', bank_code: 'BMRI', bank_name: 'Bank Mandiri', is_active: true },
      { bank: 'BCA', nomor: '01422024003', bank_code: 'BCA', bank_name: 'Bank Central Asia', is_active: true },
    ],
  },
  {
    id_user_si: 8,
    nim: '2024004',
    name: 'Dian Pratama',
    id_program: 1,
    program_name: 'Teknologi Rekayasa Perangkat Lunak',
    ukt_group: 'UKT 4',
    ukt_amount: 3000000,
    virtual_accounts: [
      { bank: 'BNI', nomor: '88012024004', bank_code: 'BNI', bank_name: 'Bank Negara Indonesia', is_active: true },
      { bank: 'Mandiri', nomor: '70012024004', bank_code: 'BMRI', bank_name: 'Bank Mandiri', is_active: true },
      { bank: 'BCA', nomor: '01422024004', bank_code: 'BCA', bank_name: 'Bank Central Asia', is_active: true },
    ],
  },
  {
    id_user_si: 11,
    nim: '2024008',
    name: 'Eko Ramadhan',
    id_program: 1,
    program_name: 'Teknologi Rekayasa Perangkat Lunak',
    ukt_group: 'UKT 3',
    ukt_amount: 2500000,
    virtual_accounts: [
      { bank: 'BNI', nomor: '88012024008', bank_code: 'BNI', bank_name: 'Bank Negara Indonesia', is_active: true },
      { bank: 'Mandiri', nomor: '70012024008', bank_code: 'BMRI', bank_name: 'Bank Mandiri', is_active: true },
      { bank: 'BCA', nomor: '01422024008', bank_code: 'BCA', bank_name: 'Bank Central Asia', is_active: true },
    ],
  },
];

const tuitionRates = [
  { id_tuition_rate: 5, id_program: 2, group_name: 'UKT 5', amount: 4000000, is_active: true },
  { id_tuition_rate: 6, id_program: 2, group_name: 'UKT 6', amount: 5000000, is_active: true },
  { id_tuition_rate: 4, id_program: 1, group_name: 'UKT 4', amount: 3000000, is_active: true },
  { id_tuition_rate: 3, id_program: 1, group_name: 'UKT 3', amount: 2500000, is_active: true },
];

const tuitionFees = [
  {
    id_tuition_fee: 1,
    id_user_si: 5,
    id_academic_period: 3,
    id_tuition_rate: 5,
    amount: 4000000,
    discount: 500000,
    final_amount: 3500000,
    status: 'unpaid',
    due_date: '2026-05-30',
    notes: 'Mendapat potongan beasiswa',
    created_at: '2026-04-17T00:00:00.000000Z',
    updated_at: '2026-04-17T00:00:00.000000Z',
  },
  {
    id_tuition_fee: 2,
    id_user_si: 5,
    id_academic_period: 2,
    id_tuition_rate: 5,
    amount: 4000000,
    discount: 0,
    final_amount: 4000000,
    status: 'paid',
    due_date: '2025-11-30',
    notes: null,
    created_at: '2025-09-01T00:00:00.000000Z',
    updated_at: '2025-10-15T10:30:00.000000Z',
  },
  {
    id_tuition_fee: 3,
    id_user_si: 7,
    id_academic_period: 3,
    id_tuition_rate: 6,
    amount: 5000000,
    discount: 0,
    final_amount: 5000000,
    status: 'unpaid',
    due_date: '2026-05-30',
    notes: null,
    created_at: '2026-04-10T00:00:00.000000Z',
    updated_at: '2026-04-16T10:00:00.000000Z',
  },
  {
    id_tuition_fee: 4,
    id_user_si: 8,
    id_academic_period: 3,
    id_tuition_rate: 4,
    amount: 3000000,
    discount: 0,
    final_amount: 3000000,
    status: 'overdue',
    due_date: '2026-03-10',
    notes: 'Mohon segera melakukan pembayaran',
    created_at: '2026-03-01T00:00:00.000000Z',
    updated_at: '2026-04-05T08:10:00.000000Z',
  },
  {
    id_tuition_fee: 5,
    id_user_si: 11,
    id_academic_period: 3,
    id_tuition_rate: 3,
    amount: 2500000,
    discount: 0,
    final_amount: 2500000,
    status: 'cancelled',
    due_date: '2026-05-12',
    notes: 'Tagihan dibatalkan sesuai kebijakan fakultas',
    created_at: '2026-04-01T00:00:00.000000Z',
    updated_at: '2026-04-04T10:00:00.000000Z',
  },
];

const tuitionPayments = [
  {
    id_tuition_payment: 1,
    id_tuition_fee: 2,
    id_user_si: 5,
    amount_paid: 4000000,
    payment_method: 'virtual_account',
    payment_proof: 'Pembayaran VA BNI terkonfirmasi sistem.',
    transaction_reference: 'TRX000001',
    verification_status: 'verified',
    verified_by: 'Admin UGN',
    verified_at: '2025-10-15T10:30:00.000000Z',
    rejection_reason: null,
    admin_notes: 'Pembayaran sesuai nominal.',
    uploaded_at: '2025-10-14T08:00:00.000000Z',
    created_at: '2025-10-14T08:00:00.000000Z',
    updated_at: '2025-10-15T10:30:00.000000Z',
    transaction_date: '2025-10-14',
  },
  {
    id_tuition_payment: 3,
    id_tuition_fee: 3,
    id_user_si: 7,
    amount_paid: 5000000,
    payment_method: 'bank_transfer',
    payment_proof: 'Bukti transfer bank terunggah oleh mahasiswa.',
    transaction_reference: 'TRX000003',
    verification_status: 'pending',
    verified_by: null,
    verified_at: null,
    rejection_reason: null,
    admin_notes: null,
    uploaded_at: '2026-04-16T10:00:00.000000Z',
    created_at: '2026-04-16T10:00:00.000000Z',
    updated_at: '2026-04-16T10:00:00.000000Z',
    transaction_date: '2026-04-16',
  },
];

const admins = [
  { id_user_si: 9001, name: 'Admin UGN', role: 'admin' },
  { id_user_si: 9002, name: 'Manager Keuangan', role: 'manager' },
];

const counters = {
  tuitionFee: 16,
  tuitionPayment: 4,
};

const state = {
  academicPeriods,
  students,
  tuitionRates,
  tuitionFees,
  tuitionPayments,
  admins,
  counters,
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function getMockState() {
  return state;
}

export function getSnapshot() {
  return clone(state);
}

export function nextTuitionFeeId() {
  const id = state.counters.tuitionFee;
  state.counters.tuitionFee += 1;
  return id;
}

export function nextTuitionPaymentId() {
  const id = state.counters.tuitionPayment;
  state.counters.tuitionPayment += 1;
  return id;
}

export function isoNow() {
  return new Date().toISOString();
}

export function findStudentByNim(nim) {
  return state.students.find((student) => student.nim === String(nim));
}

export function findStudentById(idUserSi) {
  return state.students.find((student) => Number(student.id_user_si) === Number(idUserSi));
}

export function getActiveAcademicPeriod() {
  return state.academicPeriods.find((period) => period.is_active) || state.academicPeriods[0];
}

export function getAcademicPeriodById(id) {
  return state.academicPeriods.find((period) => Number(period.id_academic_period) === Number(id)) || null;
}

export function getTuitionRateById(id) {
  return state.tuitionRates.find((rate) => Number(rate.id_tuition_rate) === Number(id)) || null;
}

export function getTuitionRateByStudent(student) {
  if (!student) return null;
  return (
    state.tuitionRates.find(
      (rate) => rate.id_program === student.id_program && rate.group_name === student.ukt_group
    ) || null
  );
}

export function getPaymentByBillId(idTuitionFee) {
  return (
    state.tuitionPayments.find(
      (payment) => Number(payment.id_tuition_fee) === Number(idTuitionFee)
    ) || null
  );
}

export function removePaymentByBillId(idTuitionFee) {
  const index = state.tuitionPayments.findIndex(
    (payment) => Number(payment.id_tuition_fee) === Number(idTuitionFee)
  );
  if (index >= 0) {
    state.tuitionPayments.splice(index, 1);
  }
}

export function isBillOverdue(bill) {
  if (!bill?.due_date) return false;
  return bill.status !== 'paid' && new Date(bill.due_date) < new Date();
}

export function withComputedBillStatus(bill) {
  const copy = { ...bill };
  if (copy.status === 'unpaid' && isBillOverdue(copy)) {
    copy.status = 'overdue';
  }
  return copy;
}
