'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import BaseModal from '@/components/bimbingan/BaseModal';
import { lecturerThesisApi } from '@/features/bimbingan-ta/api/lecturer';

const initialForm = {
  name: '',
  description: '',
};

export default function TambahKategoriTAModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialForm);
      setErrors({});
      setApiError('');
      setLoading(false);
    }
  }, [isOpen]);

  const remainingNameChars = useMemo(() => 255 - (formData.name?.length || 0), [formData.name]);

  const validate = () => {
    const nextErrors = {};
    const trimmedName = formData.name.trim();

    if (!trimmedName) {
      nextErrors.name = 'Nama kategori wajib diisi.';
    } else if (trimmedName.length > 255) {
      nextErrors.name = 'Nama kategori maksimal 255 karakter.';
    }

    if (formData.description.length > 1000) {
      nextErrors.description = 'Deskripsi maksimal 1000 karakter.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setApiError('');

    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      };

      const created = await lecturerThesisApi.createCategory(payload);

      if (typeof onSuccess === 'function') {
        await onSuccess(created);
      }

      toast.success('Kategori TA berhasil ditambahkan.');
      onClose?.();
    } catch (err) {
      const validationErrors = err?.validationErrors || {};
      const serverFieldErrors = {};

      if (validationErrors?.name?.[0]) {
        serverFieldErrors.name = validationErrors.name[0];
      }

      if (validationErrors?.description?.[0]) {
        serverFieldErrors.description = validationErrors.description[0];
      }

      if (Object.keys(serverFieldErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...serverFieldErrors }));
      }

      const message = err?.userMessage || err?.message || 'Gagal menambahkan kategori TA.';
      if (Object.keys(serverFieldErrors).length === 0) {
        setApiError(message);
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={() => {
        if (!loading) {
          onClose?.();
        }
      }}
      title="Tambah Kategori TA"
      subtitle="Tambahkan kategori baru agar dapat dipilih saat membuat topik bimbingan."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {apiError ? (
          <div className="rounded-[8px] border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{apiError}</div>
        ) : null}

        <div>
          <label className="mb-1 block text-sm font-semibold text-[#015023]">Nama Kategori</label>
          <input
            type="text"
            value={formData.name}
            onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Contoh: Data Science"
            className="h-9 w-full rounded-[8px] border border-[#d1d5dc] bg-[#f3f3f5] px-3 text-sm text-[#111827] outline-none focus:border-[#015023]"
            disabled={loading}
          />
          <div className="mt-1 flex items-center justify-between">
            <p className="text-xs text-red-600">{errors.name || ''}</p>
            <p className="text-xs text-[#717182]">{Math.max(0, remainingNameChars)} karakter tersisa</p>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-[#015023]">Deskripsi</label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="Deskripsi kategori (opsional)"
            className="w-full rounded-[8px] border border-[#d1d5dc] bg-[#f3f3f5] px-3 py-2 text-sm text-[#111827] outline-none focus:border-[#015023]"
            disabled={loading}
          />
          {errors.description ? <p className="mt-1 text-xs text-red-600">{errors.description}</p> : null}
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={() => onClose?.()}
            disabled={loading}
            className="rounded-[8px] border border-[#d1d5dc] bg-white px-4 py-2 text-sm font-medium text-[#0a0a0a] hover:bg-[#f8f8f8] disabled:cursor-not-allowed disabled:opacity-70"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-[8px] bg-[#015023] px-4 py-2 text-sm font-semibold text-white hover:bg-[#013a1a] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}
