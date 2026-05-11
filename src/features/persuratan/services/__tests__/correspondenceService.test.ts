import { describe, expect, it } from 'vitest';
import {
  CorrespondenceListResponseSchema,
  normalizeCorrespondence,
} from '@/features/persuratan/contracts/correspondenceContracts';
import { toDomainError } from '@/types/correspondence';

describe('persuratan contracts', () => {
  it('normalizes correspondence payload', () => {
    const normalized = normalizeCorrespondence({
      id_correspondence: 7,
      id_user: 12,
      sender_name: 'Budi Santoso',
      sender_email: 'budi@ugn.ac.id',
      title: 'Permohonan Cuti Akademik',
      correspondence_body: 'Dengan hormat...',
      status: 'submitted',
      category: { id_category: 1, name: 'Akademik', slug: 'akademik' },
      recipient: { id_recipient: 1, name: 'Akademik', slug: 'akademik' },
      created_at: '2026-03-03T08:00:00.000000Z',
      updated_at: '2026-03-03T08:00:00.000000Z',
    });

    expect(normalized.id).toBe(7);
    expect(normalized.id_correspondence).toBe(7);
    expect(normalized.sender_name).toBe('Budi Santoso');
  });

  it('validates list response shape', () => {
    const parsed = CorrespondenceListResponseSchema.parse({
      status: 'success',
      message: 'Daftar persuratan berhasil diambil.',
      data: [
        {
          id_correspondence: 1,
          id_user: 12,
          sender_name: 'Budi Santoso',
          sender_email: 'budi@ugn.ac.id',
          title: 'Permohonan Cuti Akademik',
          correspondence_body: 'Dengan hormat...',
          status: 'submitted',
          created_at: '2026-03-03T08:00:00.000000Z',
          updated_at: '2026-03-03T08:00:00.000000Z',
        },
      ],
    });

    expect(parsed.data.length).toBe(1);
  });
});

describe('persuratan error normalization', () => {
  it('maps validation failure (422)', () => {
    const err = toDomainError(
      {
        response: {
          status: 422,
          data: {
            message: 'Validasi gagal.',
            errors: { title: ['Judul wajib diisi.'] },
          },
        },
      },
      'fallback',
    );

    expect(err.status).toBe(422);
    expect(err.message).toBe('Validasi gagal.');
    expect(err.validationErrors?.title?.[0]).toBe('Judul wajib diisi.');
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
