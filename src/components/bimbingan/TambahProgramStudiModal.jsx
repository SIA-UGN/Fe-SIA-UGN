'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import BaseModal from '@/components/bimbingan/BaseModal';
import { lecturerThesisApi } from '@/features/bimbingan-ta/api/lecturer';
import { getCurrentRole } from '@/features/bimbingan-ta/utils';

const initialForm = {
  name: '',
  code: '',
  degree: '',
};

export default function TambahProgramStudiModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialForm);
      setErrors({});
      setLoading(false);
    }
  }, [isOpen]);

  const validate = () => {
    const nextErrors = {};
    const trimmedName = formData.name.trim();

    if (!trimmedName) {
      nextErrors.name = 'Nama program studi wajib diisi.';
    } else if (trimmedName.length > 255) {
      nextErrors.name = 'Nama program studi maksimal 255 karakter.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    const role = getCurrentRole();
    if (role !== 'dosen' && role !== 'admin' && role !== 'manager') {
      toast.error('Program studi hanya dapat ditambahkan oleh dosen, admin, atau manager.');
      return;
    }

    setLoading(true);
    try {
      const trimmedName = formData.name.trim();

      const payload = {
        name: trimmedName,
      };

      const response = await lecturerThesisApi.createProgram(payload);
      const createdProgram = response?.data || response;

      if (typeof onSuccess === 'function') {
        await onSuccess(createdProgram);
      }

      toast.success('Program studi berhasil ditambahkan.');
      onClose?.();
    } catch (err) {
      const message = err?.userMessage || err?.message || 'Gagal menambahkan program studi.';
      toast.error(message);
      console.error('Create program error:', err);
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
      title="Tambah Program Studi"
      subtitle="Program studi baru akan disimpan di backend sistem."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-[#015023]">Nama Program Studi</label>
          <input
            type="text"
            value={formData.name}
            onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Contoh: Teknik Informatika"
            className="h-9 w-full rounded-[8px] border border-[#d1d5dc] bg-[#f3f3f5] px-3 text-sm text-[#111827] outline-none focus:border-[#015023]"
            disabled={loading}
          />
          {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name}</p> : null}
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
