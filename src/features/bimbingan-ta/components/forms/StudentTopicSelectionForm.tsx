'use client';

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MAX_PROPOSAL_SIZE = 10 * 1024 * 1024;

const schema = z.object({
  student_note: z.string().max(1000, 'Catatan maksimal 1000 karakter').optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

interface StudentTopicSelectionFormProps {
  isSubmitting?: boolean;
  submitError?: string | null;
  onSubmit: (payload: { student_note?: string; attachment_proposal?: File | null }) => Promise<void> | void;
}

export default function StudentTopicSelectionForm({
  isSubmitting,
  submitError,
  onSubmit,
}: StudentTopicSelectionFormProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { student_note: '' },
  });

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
      student_note: values.student_note || undefined,
      attachment_proposal: file,
    });
  });

  return (
    <form onSubmit={submit} className="space-y-4">
      {submitError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      ) : null}

      <div>
        <label className="mb-2 block text-sm font-semibold text-[#015023]">Catatan ke Dosen</label>
        <textarea
          {...register('student_note')}
          rows={4}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
          placeholder="Opsional, maksimal 1000 karakter"
        />
        {errors.student_note ? <p className="mt-1 text-sm text-red-600">{errors.student_note.message}</p> : null}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-[#015023]">Lampiran Proposal Awal</label>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 px-4 py-8 text-sm text-[#015023]"
        >
          <Upload className="h-4 w-4" />
          {file ? file.name : 'Pilih proposal PDF/DOC/DOCX'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
        />
        {fileError ? <p className="text-sm text-red-600">{fileError}</p> : null}
      </div>

      <Button type="submit" variant="primary" disabled={isSubmitting}>
        {isSubmitting ? 'Memproses...' : 'Pilih Topik Ini'}
      </Button>
    </form>
  );
}
