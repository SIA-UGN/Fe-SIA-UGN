import { describe, expect, it } from 'vitest';
import {
  normalizeAdminLibraryOrder,
  AdminLibraryOrderListResponseSchema,
} from '@/features/library/contracts/adminLibraryContracts';
import { toDomainError } from '@/features/library/services/adminLibraryService';

describe('adminLibrary contracts', () => {
  it('normalizes successful order payload', () => {
    const normalized = normalizeAdminLibraryOrder({
      id_book_order: 99,
      id_user: 5,
      user_name: 'John Student',
      user_nim: '20230001',
      user_email: 'john@example.com',
      status: 'borrowed',
      ordered_at: '2026-03-20T00:00:00.000000Z',
      borrowed_at: '2026-03-21T10:00:00.000000Z',
      returned_at: null,
      borrow_duration_days: 10,
      borrow_duration: '1 week 3 days',
      admin_note: null,
      book: {
        id_book: 1,
        title: 'Pemrograman Web dengan Laravel',
        author: 'John Doe',
        category: 'Informatika',
      },
    });

    expect(normalized.id).toBe(99);
    expect(normalized.status).toBe('borrowed');
    expect(normalized.status_label).toBe('Dipinjam');
    expect(normalized.book_title).toBe('Pemrograman Web dengan Laravel');
  });

  it('validates paginated list contract', () => {
    const parsed = AdminLibraryOrderListResponseSchema.parse({
      status: 'success',
      message: 'Daftar pesanan berhasil diambil.',
      data: [
        {
          id_book_order: 1,
          status: 'ordered',
          book: { title: 'Laravel', author: 'John Doe' },
        },
      ],
      meta: {
        current_page: 1,
        last_page: 2,
        per_page: 15,
        total: 20,
      },
    });

    expect(parsed.data.length).toBe(1);
    expect(parsed.meta?.last_page).toBe(2);
  });
});

describe('adminLibrary error normalization', () => {
  it('maps validation failure (422)', () => {
    const err = toDomainError(
      {
        response: {
          status: 422,
          data: {
            message: 'Validasi gagal.',
            errors: { admin_note: ['Catatan terlalu panjang.'] },
          },
        },
      },
      'fallback',
    );

    expect(err.status).toBe(422);
    expect(err.message).toBe('Validasi gagal.');
    expect(err.validationErrors?.admin_note?.[0]).toBe('Catatan terlalu panjang.');
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
