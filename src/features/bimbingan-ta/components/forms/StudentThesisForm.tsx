'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, X } from 'lucide-react';
import { Button, OutlineButton } from '@/components/ui/button';
import ThesisAttachmentLink from '../ThesisAttachmentLink';
import type { StudentThesisPayload } from '../../types';

const MAX_PROPOSAL_SIZE = 10 * 1024 * 1024;

const schema = z.object({
  title_ind: z.string().min(1, 'Judul Bahasa Indonesia wajib diisi').max(255),
  title_eng: z.string().min(1, 'Judul Bahasa Inggris wajib diisi').max(255),
  topic: z.string().max(255).optional().or(z.literal('')),
  description: z.string().min(1, 'Deskripsi wajib diisi'),
});

type FormValues = z.infer<typeof schema>;

interface StudentThesisFormProps {
  initialValues?: Partial<FormValues>;
  currentAttachment?: string | null;
  isSubmitting?: boolean;
  submitLabel?: string;
  submitError?: string | null;
  onSubmit: (payload: StudentThesisPayload) => Promise<void> | void;
  onCancel?: () => void;
}

export default function StudentThesisForm({
  initialValues,
  currentAttachment,
  isSubmitting,
  submitLabel = 'Simpan Pengajuan',
  submitError,
  onSubmit,
  onCancel,
}: StudentThesisFormProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title_ind: initialValues?.title_ind || '',
      title_eng: initialValues?.title_eng || '',
      topic: initialValues?.topic || '',
      description: initialValues?.description || '',
    },
  });

  useEffect(() => {
    reset({
      title_ind: initialValues?.title_ind || '',
      title_eng: initialValues?.title_eng || '',
      topic: initialValues?.topic || '',
      description: initialValues?.description || '',
    });
  }, [initialValues, reset]);

  const setSelectedFile = (selected: File | null) => {
    setFileError(null);
    setFile(selected);

    if (!selected) return;

    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!validTypes.includes(selected.type)) {
      setFile(null);
      setFileError('Lampiran proposal harus berupa PDF, DOC, atau DOCX.');
      return;
    }

    if (selected.size > MAX_PROPOSAL_SIZE) {
      setFile(null);
      setFileError('Ukuran proposal maksimal 10 MB.');
    }
  };

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      ...values,
      topic: values.topic || undefined,
      attachment_proposal: file,
    });
  });

  return (
    <form onSubmit={submit} className="space-y-5">
      {submitError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#015023]">Judul Indonesia</label>
          <input
            {...register('title_ind')}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
          />
          {errors.title_ind ? <p className="mt-1 text-sm text-red-600">{errors.title_ind.message}</p> : null}
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#015023]">Judul Inggris</label>
          <input
            {...register('title_eng')}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
          />
          {errors.title_eng ? <p className="mt-1 text-sm text-red-600">{errors.title_eng.message}</p> : null}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-[#015023]">Topik</label>
        <input
          {...register('topic')}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
          placeholder="Opsional"
        />
        {errors.topic ? <p className="mt-1 text-sm text-red-600">{errors.topic.message}</p> : null}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-[#015023]">Deskripsi</label>
        <textarea
          {...register('description')}
          rows={5}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
        />
        {errors.description ? <p className="mt-1 text-sm text-red-600">{errors.description.message}</p> : null}
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-semibold text-[#015023]">Lampiran Proposal</label>
        {currentAttachment && !file ? <ThesisAttachmentLink path={currentAttachment} label="Lihat proposal saat ini" /> : null}
        {file ? (
          <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-[#015023]">{file.name}</p>
              <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              className="rounded-full bg-red-100 p-2 text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 px-4 py-8 text-sm text-[#015023]"
          >
            <Upload className="h-4 w-4" />
            Pilih proposal PDF/DOC/DOCX
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
        />
        {fileError ? <p className="text-sm text-red-600">{fileError}</p> : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        {onCancel ? (
          <OutlineButton type="button" onClick={onCancel}>
            Batal
          </OutlineButton>
        ) : null}
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
