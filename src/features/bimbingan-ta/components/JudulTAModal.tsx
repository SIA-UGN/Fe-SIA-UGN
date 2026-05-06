'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2, AlertCircle } from 'lucide-react';
import type { DosenTaTitle, DosenTaTitlePayload, TaTitleStatus } from '@/services/dosenTaService';
import { Button } from '@/components/ui/button';

const DEFAULT_MODAL_CATEGORY_OPTIONS = [
  'Artificial Intelligence',
  'Software Engineering',
  'Data Science',
  'Cyber Security',
  'Internet of Things',
  'Lainnya',
];

const PROGRAM_STUDI_OPTIONS = [
  { label: 'Teknik Informatika', value: '1' },
  { label: 'Sistem Informasi', value: '2' },
  { label: 'Ilmu Komputer', value: '3' },
];

const schema = z.object({
  id_program: z
    .string()
    .min(1, 'Program studi wajib dipilih')
    .regex(/^[1-9]\d*$/, 'Program studi tidak valid'),
  title_ind: z.string().trim().min(1, 'Judul Bahasa Indonesia wajib diisi'),
  title_eng: z.string().trim().min(1, 'Judul Bahasa Inggris wajib diisi'),
  category: z.string().trim().min(1, 'Kategori wajib dipilih'),
  description: z.string().trim().min(1, 'Deskripsi wajib diisi'),
  quota_total: z
    .number()
    .refine((value) => Number.isFinite(value), 'Kuota harus berupa angka')
    .int('Kuota harus bilangan bulat')
    .min(1, 'Kuota minimal 1'),
  status: z.enum(['draft', 'published', 'archived']),
});

type FormValues = z.infer<typeof schema>;

interface JudulTAModalProps {
  open: boolean;
  editingItem: DosenTaTitle | null;
  categoryOptions?: string[];
  isSubmitting?: boolean;
  /** Pesan error dari server (misal 422) — ditampilkan di dalam modal */
  serverError?: string | null;
  onClose: () => void;
  onCreate: (payload: DosenTaTitlePayload) => Promise<void>;
  onUpdate: (id: number, payload: DosenTaTitlePayload) => Promise<void>;
}

export default function JudulTAModal({
  open,
  editingItem,
  categoryOptions = DEFAULT_MODAL_CATEGORY_OPTIONS,
  isSubmitting = false,
  serverError,
  onClose,
  onCreate,
  onUpdate,
}: JudulTAModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      id_program: '',
      title_ind: '',
      title_eng: '',
      category: '',
      description: '',
      quota_total: 1,
      status: 'draft',
    },
  });

  useEffect(() => {
    if (editingItem) {
      reset({
        id_program: editingItem.id_program ? String(editingItem.id_program) : '',
        title_ind: editingItem.title_ind,
        title_eng: editingItem.title_eng,
        category: editingItem.category,
        description: editingItem.description,
        quota_total: editingItem.quota_total,
        status: editingItem.status,
      });
    } else {
      reset({
        id_program: '',
        title_ind: '',
        title_eng: '',
        category: '',
        description: '',
        quota_total: 1,
        status: 'draft',
      });
    }
  }, [editingItem, reset, open]);

  const onSubmit = async (values: FormValues) => {
    const parsed = schema.safeParse(values);
    if (!parsed.success) return;

    const payload: DosenTaTitlePayload = {
      id_program: Number(parsed.data.id_program),
      title_ind: parsed.data.title_ind,
      title_eng: parsed.data.title_eng,
      category: parsed.data.category,
      description: parsed.data.description,
      quota_total: parsed.data.quota_total,
      status: parsed.data.status as TaTitleStatus,
    };

    if (editingItem) {
      await onUpdate(editingItem.id, payload);
    } else {
      await onCreate(payload);
    }
  };

  if (!open) return null;

  const font: React.CSSProperties = { fontFamily: 'Urbanist, sans-serif' };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200" style={font}>
          <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#015023]">
                {editingItem ? 'Edit Judul TA' : 'Tambah Judul TA Baru'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Tambahkan judul tugas akhir baru untuk mahasiswa
              </p>
            </div>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-[#015023]">Judul (Bahasa Indonesia) <span className="text-red-500">*</span></label>
              <input
                {...register('title_ind')}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-[#16874B] focus:ring-2 focus:ring-[#16874B]/10"
                placeholder="Contoh: Implementasi Machine Learning untuk ..."
              />
              {errors.title_ind && <p className="text-xs text-red-500 mt-1">{errors.title_ind.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-[#015023]">Judul (English) <span className="text-red-500">*</span></label>
              <input
                {...register('title_eng')}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-[#16874B] focus:ring-2 focus:ring-[#16874B]/10"
                placeholder="Example: Implementation of Machine Learning for ..."
              />
              {errors.title_eng && <p className="text-xs text-red-500 mt-1">{errors.title_eng.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-[#015023]">Program Studi <span className="text-red-500">*</span></label>
              <select
                {...register('id_program')}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-[#16874B] focus:ring-2 focus:ring-[#16874B]/10"
              >
                <option value="">Pilih program studi</option>
                {PROGRAM_STUDI_OPTIONS.map((program) => (
                  <option key={program.value} value={program.value}>{program.label}</option>
                ))}
              </select>
              {errors.id_program && <p className="text-xs text-red-500 mt-1">{errors.id_program.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-[#015023]">Kategori <span className="text-red-500">*</span></label>
              <select
                {...register('category')}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-[#16874B] focus:ring-2 focus:ring-[#16874B]/10"
              >
                <option value="">Pilih kategori</option>
                {categoryOptions.map((kategori) => (
                  <option key={kategori} value={kategori}>{kategori}</option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-[#015023]">Deskripsi <span className="text-red-500">*</span></label>
              <textarea
                {...register('description')}
                rows={4}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm outline-none resize-none focus:border-[#16874B] focus:ring-2 focus:ring-[#16874B]/10"
                placeholder="Jelaskan detail penelitian, tujuan, dan metodologi"
              />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[#015023]">Kuota Mahasiswa <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  {...register('quota_total', {
                    valueAsNumber: true,
                    setValueAs: (value) => {
                      const numericValue = Number(value);
                      if (!Number.isFinite(numericValue)) return 1;
                      return Math.max(1, Math.trunc(numericValue));
                    },
                  })}
                  onKeyDown={(event) => {
                    if (['-', '+', 'e', 'E'].includes(event.key)) {
                      event.preventDefault();
                    }
                  }}
                  onBlur={(event) => {
                    const numericValue = Number(event.currentTarget.value);
                    if (!Number.isFinite(numericValue) || numericValue < 1) {
                      event.currentTarget.value = '1';
                    }
                  }}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-[#16874B] focus:ring-2 focus:ring-[#16874B]/10"
                />
                {errors.quota_total && <p className="text-xs text-red-500 mt-1">{errors.quota_total.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-[#015023]">Status <span className="text-red-500">*</span></label>
                <select
                  {...register('status')}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-[#16874B] focus:ring-2 focus:ring-[#16874B]/10"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              {serverError && (
                <div className="flex-1 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                  <AlertCircle size={15} className="mt-0.5 flex-shrink-0 text-red-500" />
                  <p className="text-xs text-red-700" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                    {serverError}
                  </p>
                </div>
              )}
              <Button type="button" variant="outline" size="default" style={{}} className="" onClick={onClose}>
                Batal
              </Button>
              <Button type="submit" variant="primary" size="default" style={{}} disabled={isSubmitting} className="min-w-28">
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Menyimpan...
                  </span>
                ) : (
                  'Simpan'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
