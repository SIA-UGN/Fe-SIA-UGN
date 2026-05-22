import {
  findStudentById,
  findStudentByNim,
  getAcademicPeriodById,
  getActiveAcademicPeriod,
  getMockState,
  getPaymentByBillId,
  getSnapshot,
  getTuitionRateById,
  getTuitionRateByStudent,
  isoNow,
  nextTuitionFeeId,
  nextTuitionPaymentId,
  removePaymentByBillId,
  withComputedBillStatus,
} from './db';

const DEFAULT_DELAY = 450;

function delay(ms = DEFAULT_DELAY) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function formatBill(student, bill, period, rate, payment) {
  const computedBill = withComputedBillStatus(bill);
  return {
    id_tuition_fee: computedBill.id_tuition_fee,
    id_user_si: computedBill.id_user_si,
    student: {
      id_user_si: student.id_user_si,
      name: student.name,
      nim: student.nim,
      program: student.program_name,
    },
    academic_period: {
      id_academic_period: period?.id_academic_period,
      name: period?.name,
      is_active: period?.is_active,
      start_date: period?.start_date,
      end_date: period?.end_date,
    },
    tuition_rate: {
      id_tuition_rate: rate?.id_tuition_rate || null,
      group_name: rate?.group_name || student.ukt_group || '-',
      base_amount: Number(rate?.amount || computedBill.amount || 0),
    },
    amount: Number(computedBill.amount),
    discount: Number(computedBill.discount),
    final_amount: Number(computedBill.final_amount),
    status: computedBill.status,
    due_date: computedBill.due_date,
    is_overdue: computedBill.status === 'overdue',
    notes: computedBill.notes,
    payment: payment
      ? {
          id_tuition_payment: payment.id_tuition_payment,
          amount_paid: Number(payment.amount_paid),
          payment_method: payment.payment_method,
          payment_proof: payment.payment_proof,
          transaction_reference: payment.transaction_reference,
          verification_status: payment.verification_status,
          verified_by: payment.verified_by,
          verified_at: payment.verified_at,
          rejection_reason: payment.rejection_reason,
          admin_notes: payment.admin_notes,
          uploaded_at: payment.uploaded_at,
          transaction_date: payment.transaction_date,
        }
      : null,
    created_at: computedBill.created_at,
    updated_at: computedBill.updated_at,
  };
}

function resolveStudent(nimOrId) {
  if (!nimOrId) {
    return getSnapshot().students[0];
  }
  const state = getMockState();
  return (
    findStudentByNim(nimOrId) ||
    findStudentById(nimOrId) ||
    state.students[0]
  );
}

function summarizeBills(formattedBills) {
  const summary = {
    total_bills: formattedBills.length,
    total_unpaid: 0,
    total_paid: 0,
    total_overdue: 0,
    total_cancelled: 0,
    total_unpaid_amount: 0,
    total_paid_amount: 0,
  };

  formattedBills.forEach((bill) => {
    if (bill.status === 'paid') {
      summary.total_paid += 1;
      summary.total_paid_amount += bill.final_amount;
      return;
    }

    if (bill.status === 'overdue') {
      summary.total_overdue += 1;
      summary.total_unpaid_amount += bill.final_amount;
      return;
    }

    if (bill.status === 'cancelled') {
      summary.total_cancelled += 1;
      return;
    }

    summary.total_unpaid += 1;
    summary.total_unpaid_amount += bill.final_amount;
  });

  return summary;
}

export async function mockGetTagihanMahasiswa({
  nim,
  status,
  academic_period_id,
} = {}) {
  await delay();

  const state = getSnapshot();
  const student = resolveStudent(nim);
  const billList = state.tuitionFees
    .filter((bill) => bill.id_user_si === student.id_user_si)
    .map((bill) => {
      const period = state.academicPeriods.find(
        (item) => item.id_academic_period === bill.id_academic_period
      );
      const rate = state.tuitionRates.find(
        (item) => item.id_tuition_rate === bill.id_tuition_rate
      );
      const payment = state.tuitionPayments.find(
        (item) => item.id_tuition_fee === bill.id_tuition_fee
      );
      return formatBill(student, bill, period, rate, payment);
    })
    .filter((bill) => (status && status !== 'all' ? bill.status === status : true))
    .filter((bill) =>
      academic_period_id && academic_period_id !== 'all'
        ? Number(bill.academic_period.id_academic_period) === Number(academic_period_id)
        : true
    )
    .sort((a, b) => Number(b.id_tuition_fee) - Number(a.id_tuition_fee));

  return {
    status: 'success',
    message: 'Daftar tagihan UKT berhasil diambil.',
    data: {
      bills: billList,
      summary: summarizeBills(billList),
      virtual_accounts: student.virtual_accounts,
    },
  };
}

export async function mockGetTagihanDetail(id, { nim } = {}) {
  await delay();

  const state = getSnapshot();
  const student = resolveStudent(nim);
  const bill = state.tuitionFees.find(
    (item) => Number(item.id_tuition_fee) === Number(id) && item.id_user_si === student.id_user_si
  );

  if (!bill) {
    throw new Error('Tagihan tidak ditemukan.');
  }

  const period = state.academicPeriods.find(
    (item) => item.id_academic_period === bill.id_academic_period
  );
  const rate = state.tuitionRates.find(
    (item) => item.id_tuition_rate === bill.id_tuition_rate
  );
  const payment = state.tuitionPayments.find(
    (item) => item.id_tuition_fee === bill.id_tuition_fee
  );

  return {
    status: 'success',
    message: 'Detail tagihan UKT berhasil diambil.',
    data: formatBill(student, bill, period, rate, payment),
  };
}

export async function mockGetVirtualAccountMahasiswa({ nim } = {}) {
  await delay();

  const student = resolveStudent(nim);

  return {
    status: 'success',
    message: 'Informasi Virtual Account berhasil diambil.',
    data: clone(student.virtual_accounts),
  };
}

export async function mockGetRiwayatPembayaranMahasiswa({ nim } = {}) {
  await delay();

  const state = getSnapshot();
  const student = resolveStudent(nim);

  const history = state.tuitionPayments
    .filter((payment) => payment.id_user_si === student.id_user_si)
    .map((payment) => {
      const bill = state.tuitionFees.find(
        (item) => item.id_tuition_fee === payment.id_tuition_fee
      );
      const period = state.academicPeriods.find(
        (item) => item.id_academic_period === bill?.id_academic_period
      );

      return {
        id_tuition_payment: payment.id_tuition_payment,
        id_tuition_fee: payment.id_tuition_fee,
        academic_period: period?.name || '-',
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
      };
    })
    .sort((a, b) => Number(b.id_tuition_payment) - Number(a.id_tuition_payment));

  return {
    status: 'success',
    message: 'Riwayat pembayaran berhasil diambil.',
    data: history,
  };
}

export async function mockSimulatePayment({
  id_tuition_fee,
  nim,
  payment_method = 'virtual_account',
  transaction_reference,
  amount_paid,
} = {}) {
  await delay(700);

  const state = getMockState();
  const student = resolveStudent(nim);
  const bill = state.tuitionFees.find(
    (item) => Number(item.id_tuition_fee) === Number(id_tuition_fee) && item.id_user_si === student.id_user_si
  );

  if (!bill) {
    throw new Error('Tagihan tidak ditemukan.');
  }

  const computedBill = withComputedBillStatus(bill);
  if (computedBill.status === 'paid') {
    throw new Error('Tagihan ini sudah lunas.');
  }

  if (computedBill.status === 'cancelled') {
    throw new Error('Tagihan ini sudah dibatalkan.');
  }

  const existingPayment = getPaymentByBillId(bill.id_tuition_fee);
  if (existingPayment && existingPayment.verification_status === 'pending') {
    const pendingError = new Error('Sudah ada pembayaran yang menunggu verifikasi untuk tagihan ini.');
    pendingError.data = {
      id_tuition_payment: existingPayment.id_tuition_payment,
      verification_status: existingPayment.verification_status,
      uploaded_at: existingPayment.uploaded_at,
    };
    throw pendingError;
  }

  if (existingPayment && existingPayment.verification_status === 'verified') {
    throw new Error('Tagihan ini sudah lunas.');
  }

  if (existingPayment && existingPayment.verification_status === 'rejected') {
    removePaymentByBillId(bill.id_tuition_fee);
  }

  const nowIso = isoNow();
  const payment = {
    id_tuition_payment: nextTuitionPaymentId(),
    id_tuition_fee: bill.id_tuition_fee,
    id_user_si: student.id_user_si,
    amount_paid: Number(amount_paid || bill.final_amount),
    payment_method,
    payment_proof: 'Pembayaran via Virtual Account BNI - Telah Dikonfirmasi Sistem',
    transaction_reference: transaction_reference || `TRX-${Date.now()}`,
    verification_status: 'pending',
    verified_by: null,
    verified_at: null,
    rejection_reason: null,
    admin_notes: null,
    uploaded_at: nowIso,
    created_at: nowIso,
    updated_at: nowIso,
    transaction_date: nowIso.slice(0, 10),
  };

  state.tuitionPayments.push(payment);
  bill.updated_at = nowIso;

  return {
    status: 'success',
    message: 'Bukti pembayaran berhasil diupload. Menunggu verifikasi admin.',
    data: {
      id_tuition_payment: payment.id_tuition_payment,
      id_tuition_fee: payment.id_tuition_fee,
      amount_paid: payment.amount_paid,
      payment_method: payment.payment_method,
      payment_proof_url: payment.payment_proof,
      verification_status: payment.verification_status,
      uploaded_at: payment.uploaded_at,
    },
  };
}

export async function mockGetAdminDashboard({ academic_period_id } = {}) {
  await delay();

  const state = getSnapshot();
  const activePeriod = getActiveAcademicPeriod();
  const selectedPeriodId = academic_period_id ? Number(academic_period_id) : activePeriod?.id_academic_period;
  const selectedPeriod = getAcademicPeriodById(selectedPeriodId) || activePeriod;

  const bills = state.tuitionFees
    .filter((bill) => Number(bill.id_academic_period) === Number(selectedPeriodId))
    .map((bill) => withComputedBillStatus(bill));

  const summary = {
    total_bills: bills.length,
    total_unpaid: 0,
    total_paid: 0,
    total_overdue: 0,
    total_cancelled: 0,
    total_amount: 0,
    total_paid_amount: 0,
    total_unpaid_amount: 0,
    pending_verification: 0,
  };

  const byProgramMap = new Map();

  bills.forEach((bill) => {
    const student = state.students.find((item) => item.id_user_si === bill.id_user_si);
    if (!student) return;

    const key = student.id_program;
    if (!byProgramMap.has(key)) {
      byProgramMap.set(key, {
        id_program: student.id_program,
        program_name: student.program_name,
        total: 0,
        paid: 0,
        unpaid: 0,
        total_amount: 0,
        paid_amount: 0,
      });
    }

    const item = byProgramMap.get(key);
    item.total += 1;
    item.total_amount += Number(bill.final_amount);

    summary.total_amount += Number(bill.final_amount);

    if (bill.status === 'paid') {
      item.paid += 1;
      item.paid_amount += Number(bill.final_amount);
      summary.total_paid += 1;
      summary.total_paid_amount += Number(bill.final_amount);
    } else if (bill.status === 'overdue') {
      item.unpaid += 1;
      summary.total_overdue += 1;
      summary.total_unpaid_amount += Number(bill.final_amount);
    } else if (bill.status === 'cancelled') {
      summary.total_cancelled += 1;
    } else {
      item.unpaid += 1;
      summary.total_unpaid += 1;
      summary.total_unpaid_amount += Number(bill.final_amount);
    }

    const payment = state.tuitionPayments.find((value) => value.id_tuition_fee === bill.id_tuition_fee);
    if (payment?.verification_status === 'pending') {
      summary.pending_verification += 1;
    }
  });

  return {
    status: 'success',
    message: 'Dashboard statistik UKT berhasil diambil.',
    data: {
      period_id: selectedPeriod?.id_academic_period,
      period_name: selectedPeriod?.name,
      summary,
      by_program: Array.from(byProgramMap.values()),
    },
  };
}

export async function mockGetTagihanAdmin(filters = {}) {
  await delay();

  const { academic_period_id, status, program_id, search } = filters;
  const state = getSnapshot();

  const rows = state.tuitionFees
    .map((bill) => {
      const computedBill = withComputedBillStatus(bill);
      const student = state.students.find((item) => item.id_user_si === bill.id_user_si);
      const period = state.academicPeriods.find((item) => item.id_academic_period === bill.id_academic_period);
      const rate = state.tuitionRates.find((item) => item.id_tuition_rate === bill.id_tuition_rate);
      const payment = state.tuitionPayments.find((item) => item.id_tuition_fee === bill.id_tuition_fee);

      return {
        id_tuition_fee: bill.id_tuition_fee,
        student: {
          id_user_si: student?.id_user_si,
          name: student?.name,
          nim: student?.nim,
          program: student?.program_name,
          id_program: student?.id_program,
        },
        academic_period: period?.name,
        id_academic_period: period?.id_academic_period,
        group_name: rate?.group_name || student?.ukt_group || '-',
        amount: Number(computedBill.amount),
        discount: Number(computedBill.discount),
        final_amount: Number(computedBill.final_amount),
        status: computedBill.status,
        due_date: computedBill.due_date,
        payment_status: payment?.verification_status || null,
        payment_id: payment?.id_tuition_payment || null,
        created_at: computedBill.created_at,
      };
    })
    .filter((row) => {
      if (!academic_period_id || academic_period_id === 'all') return true;
      return Number(row.id_academic_period) === Number(academic_period_id);
    })
    .filter((row) => {
      if (!status || status === 'all') return true;
      return row.status === status;
    })
    .filter((row) => {
      if (!program_id || program_id === 'all') return true;
      return Number(row.student.id_program) === Number(program_id);
    })
    .filter((row) => {
      if (!search) return true;
      const keyword = String(search).toLowerCase();
      return (
        row.student.name?.toLowerCase().includes(keyword) ||
        row.student.nim?.toLowerCase().includes(keyword)
      );
    })
    .sort((a, b) => Number(b.id_tuition_fee) - Number(a.id_tuition_fee));

  return {
    status: 'success',
    message: 'Daftar tagihan UKT berhasil diambil.',
    data: rows,
  };
}

export async function mockGetTagihanAdminDetail(id) {
  await delay();

  const state = getSnapshot();
  const bill = state.tuitionFees.find((item) => Number(item.id_tuition_fee) === Number(id));

  if (!bill) {
    throw new Error('Tagihan tidak ditemukan.');
  }

  const student = state.students.find((item) => item.id_user_si === bill.id_user_si);
  const payment = state.tuitionPayments.find((item) => item.id_tuition_fee === bill.id_tuition_fee);
  const period = state.academicPeriods.find((item) => item.id_academic_period === bill.id_academic_period);
  const rate = state.tuitionRates.find((item) => item.id_tuition_rate === bill.id_tuition_rate);

  return {
    status: 'success',
    message: 'Detail tagihan UKT berhasil diambil.',
    data: formatBill(student, bill, period, rate, payment),
  };
}

export async function mockGenerateTagihanMassal({
  id_academic_period,
  due_date,
  notes,
} = {}) {
  await delay(850);

  const state = getMockState();
  const period = getAcademicPeriodById(id_academic_period) || getActiveAcademicPeriod();
  const errors = [];
  let created = 0;
  let skipped = 0;

  state.students.forEach((student) => {
    const exists = state.tuitionFees.some(
      (bill) => bill.id_user_si === student.id_user_si && Number(bill.id_academic_period) === Number(period.id_academic_period)
    );

    if (exists) {
      skipped += 1;
      return;
    }

    const rate = getTuitionRateByStudent(student);
    if (!rate) {
      errors.push(`Tarif UKT untuk ${student.name} belum tersedia.`);
      return;
    }

    const nowIso = isoNow();

    state.tuitionFees.push({
      id_tuition_fee: nextTuitionFeeId(),
      id_user_si: student.id_user_si,
      id_academic_period: period.id_academic_period,
      id_tuition_rate: rate.id_tuition_rate,
      amount: Number(rate.amount),
      discount: 0,
      final_amount: Number(rate.amount),
      status: 'unpaid',
      due_date: due_date || null,
      notes: notes || null,
      created_at: nowIso,
      updated_at: nowIso,
    });

    created += 1;
  });

  return {
    status: 'success',
    message: `Tagihan massal berhasil digenerate. ${created} tagihan dibuat, ${skipped} dilewati.`,
    data: {
      created,
      skipped,
      total_students: state.students.length,
      errors,
    },
  };
}

export async function mockCreateTagihanIndividu(payload = {}) {
  await delay(700);

  const state = getMockState();
  const {
    id_user_si,
    id_academic_period,
    id_tuition_rate,
    amount,
    discount = 0,
    due_date,
    notes,
  } = payload;

  const student = findStudentById(id_user_si);
  if (!student) {
    throw new Error('Mahasiswa tidak ditemukan.');
  }

  const period = getAcademicPeriodById(id_academic_period);
  if (!period) {
    throw new Error('Periode akademik tidak ditemukan.');
  }

  const duplicate = state.tuitionFees.some(
    (bill) => bill.id_user_si === student.id_user_si && Number(bill.id_academic_period) === Number(period.id_academic_period)
  );
  if (duplicate) {
    throw new Error('Mahasiswa ini sudah memiliki tagihan pada semester tersebut.');
  }

  const selectedRate = id_tuition_rate ? getTuitionRateById(id_tuition_rate) : getTuitionRateByStudent(student);
  const nominalAmount = Number(amount || selectedRate?.amount || student.ukt_amount || 0);
  const nominalDiscount = Number(discount || 0);
  const nowIso = isoNow();

  const newBill = {
    id_tuition_fee: nextTuitionFeeId(),
    id_user_si: student.id_user_si,
    id_academic_period: period.id_academic_period,
    id_tuition_rate: selectedRate?.id_tuition_rate || null,
    amount: nominalAmount,
    discount: nominalDiscount,
    final_amount: Math.max(0, nominalAmount - nominalDiscount),
    status: 'unpaid',
    due_date: due_date || null,
    notes: notes || null,
    created_at: nowIso,
    updated_at: nowIso,
  };

  state.tuitionFees.push(newBill);

  return {
    status: 'success',
    message: 'Tagihan UKT berhasil dibuat.',
    data: {
      id_tuition_fee: newBill.id_tuition_fee,
      final_amount: newBill.final_amount,
      status: newBill.status,
    },
  };
}
