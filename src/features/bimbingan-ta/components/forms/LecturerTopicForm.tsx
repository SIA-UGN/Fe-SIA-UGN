'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, OutlineButton } from '@/components/ui/button';
// PERBAIKAN: Menambahkan SubjectOption ke dalam import
import type { LecturerTopicPayload, ProgramOption, SubjectOption, ThesisCategory } from '../../types';

const schema = z.object({
  topic: z.string().min(1, 'Bidang penelitian wajib diisi').max(255),
  title_ind: z.string().min(1, 'Judul Indonesia wajib diisi').max(255),
  title_eng: z.string().min(1, 'Judul Inggris wajib diisi').max(255),
  description: z.string().min(1, 'Deskripsi wajib diisi'),
  quota: z.coerce.number().int().min(1, 'Kuota minimal 1').max(50, 'Kuota terlalu besar'),
  id_program: z.string().min(1, 'Program studi wajib dipilih'),
  id_thesis_category: z.string().min(1, 'Kategori wajib dipilih'),
});

type FormValues = z.input<typeof schema>;
type FormSubmitValues = z.output<typeof schema>;

interface LecturerTopicFormProps {
  programs: ProgramOption[];
  subjects?: SubjectOption[]; // Sekarang tipe ini sudah terdefinisi
  categories: ThesisCategory[];
  initialValues?: Partial<LecturerTopicPayload>;
  submitError?: string | null;
  isSubmitting?: boolean;
  submitLabel?: string;
  onSubmit: (payload: LecturerTopicPayload) => Promise<void> | void;
  onCancel?: () => void;
}

export default function LecturerTopicForm({
  programs,
  subjects = [],
  categories,
  initialValues,
  submitError,
  isSubmitting,
  submitLabel = 'Simpan Topik',
  onSubmit,
  onCancel,
}: LecturerTopicFormProps) {

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues, any, FormSubmitValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      topic: initialValues?.topic || '',
      title_ind: initialValues?.title_ind || '',
      title_eng: initialValues?.title_eng || '',
      description: initialValues?.description || '',
      quota: initialValues?.quota || 1,
      id_program: initialValues?.id_program ? String(initialValues.id_program) : '',
      id_thesis_category: initialValues?.id_thesis_category ? String(initialValues.id_thesis_category) : '',
    },
  });

  useEffect(() => {
    reset({
      topic: initialValues?.topic || '',
      title_ind: initialValues?.title_ind || '',
      title_eng: initialValues?.title_eng || '',
      description: initialValues?.description || '',
      quota: initialValues?.quota || 1,
      id_program: initialValues?.id_program ? String(initialValues.id_program) : '',
      id_thesis_category: initialValues?.id_thesis_category ? String(initialValues.id_thesis_category) : '',
    });
  }, [initialValues, reset]);

  const selectedTopic = watch('topic');



  const submit = handleSubmit(async (values) => {
    await onSubmit({
      topic: values.topic,
      title_ind: values.title_ind,
      title_eng: values.title_eng,
      description: values.description,
      quota: values.quota,
      id_program: Number(values.id_program),
      id_thesis_category: Number(values.id_thesis_category),
    });
  });

  return (
    <form onSubmit={submit} className="space-y-5">
      {submitError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      ) : null}



      {/* Warning Messages */}
      {programs.length === 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Data program studi belum tersedia.
        </div>
      ) : null}
      {categories.length === 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Kategori tugas akhir belum tersedia. Buat kategori terlebih dahulu sebelum menambahkan topik.
        </div>
      ) : null}

      {/* Form Utama */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#015023]">Bidang / Topik</label>
          <input
            {...register('topic')}
            placeholder="Contoh: Rekayasa Perangkat Lunak"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
          />
          {errors.topic ? <p className="mt-1 text-sm text-red-600">{errors.topic.message}</p> : null}
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#015023]">Program Studi</label>
          <select
            {...register('id_program')}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
            disabled={programs.length === 0}
          >
            <option value="">Pilih program studi</option>
            {programs.map((program) => (
              <option key={program.id_program} value={program.id_program}>
                {program.name}
              </option>
            ))}
          </select>
          {errors.id_program ? <p className="mt-1 text-sm text-red-600">{errors.id_program.message}</p> : null}
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#015023]">Kategori</label>
          <select
            {...register('id_thesis_category')}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
            disabled={categories.length === 0}
          >
            <option value="">Pilih kategori</option>
            {categories.map((category) => (
              <option key={category.id_thesis_category} value={category.id_thesis_category}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.id_thesis_category ? (
            <p className="mt-1 text-sm text-red-600">{errors.id_thesis_category.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#015023]">Judul Indonesia</label>
          <input
            {...register('title_ind')}
            placeholder="Masukkan judul dalam Bahasa Indonesia"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
          />
          {errors.title_ind ? <p className="mt-1 text-sm text-red-600">{errors.title_ind.message}</p> : null}
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#015023]">Judul Inggris</label>
          <input
            {...register('title_eng')}
            placeholder="Masukkan judul dalam Bahasa Inggris"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
          />
          {errors.title_eng ? <p className="mt-1 text-sm text-red-600">{errors.title_eng.message}</p> : null}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-[#015023]">Deskripsi Topik</label>
        <textarea
          {...register('description')}
          placeholder="Jelaskan secara ringkas mengenai topik tugas akhir ini..."
          rows={6}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
        />
        {errors.description ? <p className="mt-1 text-sm text-red-600">{errors.description.message}</p> : null}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-[#015023]">Kuota Mahasiswa</label>
        <input
          type="number"
          min={1}
          {...register('quota')}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023] sm:w-1/3"
        />
        {errors.quota ? <p className="mt-1 text-sm text-red-600">{errors.quota.message}</p> : null}
      </div>

      <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end border-t border-gray-200">
        {onCancel ? (
          <OutlineButton type="button" onClick={onCancel} disabled={isSubmitting}>
            Batal
          </OutlineButton>
        ) : null}
        <Button 
          type="submit" 
          variant="primary" 
          disabled={isSubmitting || programs.length === 0 || categories.length === 0}
        >
          {isSubmitting ? 'Menyimpan...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}