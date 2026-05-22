import { describe, expect, it } from 'vitest';
import {
  StudentBillsResponseSchema,
} from '@/features/ukt/contracts/tuitionContracts';
import { normalizeStudentBill, toDomainError } from '@/features/ukt/services/tuitionService';

describe('ukt contracts', () => {
  it('normalizes student bill payload', () => {
    const normalized = normalizeStudentBill({
      id_tuition_fee: 1,
      academic_period: {
        id_academic_period: 3,
        name: 'Semester Genap 2025/2026',
        is_active: true,
      },
      tuition_rate: {
        id_tuition_rate: 5,
        group_name: 'UKT 5',
        base_amount: 4000000,
      },
      amount: 4000000,
      discount: 500000,
      final_amount: 3500000,
      status: 'unpaid',
      due_date: '2026-05-30',
      is_overdue: false,
      notes: null,
      payment: null,
      created_at: '2026-04-17T00:00:00.000000Z',
    });

    expect(normalized.id).toBe(1);
    expect(normalized.status).toBe('unpaid');
    expect(normalized.status_label).toBe('Belum Bayar');
  });

  it('validates student bills response shape', () => {
    const parsed = StudentBillsResponseSchema.parse({
      status: 'success',
      message: 'Daftar tagihan UKT berhasil diambil.',
      data: {
        bills: [
          {
            id_tuition_fee: 1,
            academic_period: { id_academic_period: 3, name: 'Semester Genap 2025/2026' },
            tuition_rate: { id_tuition_rate: 5, group_name: 'UKT 5', base_amount: 4000000 },
            amount: 4000000,
            discount: 0,
            final_amount: 4000000,
            status: 'paid',
            due_date: '2026-05-30',
          },
        ],
        summary: {
          total_bills: 1,
          total_unpaid: 0,
          total_paid: 1,
          total_overdue: 0,
          total_cancelled: 0,
          total_unpaid_amount: 0,
          total_paid_amount: 4000000,
        },
      },
    });

    expect(parsed.data.bills.length).toBe(1);
    expect(parsed.data.summary?.total_paid).toBe(1);
  });
});

describe('ukt error normalization', () => {
  it('maps validation failure (422)', () => {
    const err = toDomainError(
      {
        response: {
          status: 422,
          data: {
            message: 'Validasi gagal.',
            errors: { amount: ['Nominal wajib diisi.'] },
          },
        },
      },
      'fallback',
    );

    expect(err.status).toBe(422);
    expect(err.message).toBe('Validasi gagal.');
    expect(err.validationErrors?.amount?.[0]).toBe('Nominal wajib diisi.');
  });

  it('maps timeout/connectivity error', () => {
    const err = toDomainError(
      {
        code: 'ECONNABORTED',
        message: 'Permintaan timeout.',
        isConnectivityError: true,
      },
      'fallback',
    );

    expect(err.status).toBeNull();
    expect(err.isConnectivityError).toBe(true);
    expect(err.message).toBe('Permintaan timeout.');
  });

  it('maps unauthorized error (401)', () => {
    const err = toDomainError(
      {
        response: {
          status: 401,
          data: {
            message: 'Unauthenticated.',
          },
        },
      },
      'fallback',
    );

    expect(err.status).toBe(401);
    expect(err.message).toBe('Unauthenticated.');
  });
});
