'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, X } from 'lucide-react';
import { Button, OutlineButton } from '@/components/ui/button';
import ThesisAttachmentLink from '../ThesisAttachmentLink';
import type {
  ConsultationStatus,
  LecturerConsultationPayload,
  ThesisSupervisor,
} from '../../types';

const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;

const schema = z.object({
  id_supervisor: z.string().min(1, 'Mahasiswa bimbingan wajib dipilih'),
  consultation_date: z.string().min(1, 'Tanggal konsultasi wajib diisi'),
  start_time: z.string().optional().or(z.literal('')),
  end_time: z.string().optional().or(z.literal('')),
  location: z.string().max(255).optional().or(z.literal('')),
  subject: z.string().min(1, 'Agenda konsultasi wajib diisi').max(255),
  student_notes: z.string().optional().or(z.literal('')),
  lecturer_notes: z.string().optional().or(z.literal('')),
  next_task: z.string().optional().or(z.literal('')),
  progress: z.coerce.number().min(0, 'Progress minimal 0').max(100, 'Progress maksimal 100'),
  status: z.enum(['on_going', 'finished']),
});

type FormValues = z.input<typeof schema>;
type FormSubmitValues = z.output<typeof schema>;

interface LecturerConsultationFormProps {
  supervisors: ThesisSupervisor[];
  initialValues?: Omit<Partial<LecturerConsultationPayload>, 'attachment'> & { attachment?: string | null };
  submitError?: string | null;
  isSubmitting?: boolean;
  submitLabel?: string;
  onSubmit: (payload: LecturerConsultationPayload) => Promise<void> | void;
  onCancel?: () => void;
}

export default function LecturerConsultationForm({
  supervisors,
  initialValues,
  submitError,
  isSubmitting,
  submitLabel = 'Simpan Konsultasi',
  onSubmit,
  onCancel,
}: LecturerConsultationFormProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues, any, FormSubmitValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      id_supervisor: initialValues?.id_supervisor ? String(initialValues.id_supervisor) : '',
      consultation_date: initialValues?.consultation_date || '',
      start_time: initialValues?.start_time || '',
      end_time: initialValues?.end_time || '',
      location: initialValues?.location || '',
      subject: initialValues?.subject || '',
      student_notes: initialValues?.student_notes || '',
      lecturer_notes: initialValues?.lecturer_notes || '',
      next_task: initialValues?.next_task || '',
      progress: initialValues?.progress ?? 0,
      status: (initialValues?.status as ConsultationStatus) || 'on_going',
    },
  });

  useEffect(() => {
    reset({
      id_supervisor: initialValues?.id_supervisor ? String(initialValues.id_supervisor) : '',
      consultation_date: initialValues?.consultation_date || '',
      start_time: initialValues?.start_time || '',
      end_time: initialValues?.end_time || '',
      location: initialValues?.location || '',
      subject: initialValues?.subject || '',
      student_notes: initialValues?.student_notes || '',
      lecturer_notes: initialValues?.lecturer_notes || '',
      next_task: initialValues?.next_task || '',
      progress: initialValues?.progress ?? 0,
      status: (initialValues?.status as ConsultationStatus) || 'on_going',
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
      'image/jpeg',
      'image/png',
    ];

    if (!validTypes.includes(selected.type)) {
      setFile(null);
      setFileError('Lampiran konsultasi harus berupa PDF, DOC, DOCX, JPG, atau PNG.');
      return;
    }

    if (selected.size > MAX_ATTACHMENT_SIZE) {
      setFile(null);
      setFileError('Ukuran lampiran maksimal 10 MB.');
    }
  };

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      id_supervisor: Number(values.id_supervisor),
      consultation_date: values.consultation_date,
      start_time: values.start_time || undefined,
      end_time: values.end_time || undefined,
      location: values.location || undefined,
      subject: values.subject,
      student_notes: values.student_notes || undefined,
      lecturer_notes: values.lecturer_notes || undefined,
      attachment: file,
      next_task: values.next_task || undefined,
      progress: values.progress,
      status: values.status,
    });
  });

  return (
    <form onSubmit={submit} className="space-y-5">
      {submitError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      ) : null}

      <div>
        <label className="mb-2 block text-sm font-semibold text-[#015023]">Mahasiswa Bimbingan</label>
        <select
          {...register('id_supervisor')}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
        >
          <option value="">Pilih mahasiswa</option>
          {supervisors.map((supervisor) => (
            <option key={supervisor.id_supervisor} value={supervisor.id_supervisor}>
              {supervisor.student_thesis?.student?.name || `Supervisor #${supervisor.id_supervisor}`}
            </option>
          ))}
        </select>
        {errors.id_supervisor ? <p className="mt-1 text-sm text-red-600">{errors.id_supervisor.message}</p> : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#015023]">Tanggal Konsultasi</label>
          <input
            type="date"
            {...register('consultation_date')}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
          />
          {errors.consultation_date ? <p className="mt-1 text-sm text-red-600">{errors.consultation_date.message}</p> : null}
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#015023]">Status</label>
          <select
            {...register('status')}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
          >
            <option value="on_going">on_going</option>
            <option value="finished">finished</option>
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#015023]">Mulai</label>
          <input
            type="time"
            {...register('start_time')}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#015023]">Selesai</label>
          <input
            type="time"
            {...register('end_time')}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#015023]">Progress</label>
          <input
            type="number"
            min={0}
            max={100}
            {...register('progress')}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
          />
          {errors.progress ? <p className="mt-1 text-sm text-red-600">{errors.progress.message}</p> : null}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-[#015023]">Lokasi</label>
        <input
          {...register('location')}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
        />
        {errors.location ? <p className="mt-1 text-sm text-red-600">{errors.location.message}</p> : null}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-[#015023]">Agenda</label>
        <input
          {...register('subject')}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
        />
        {errors.subject ? <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p> : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#015023]">Catatan Mahasiswa</label>
          <textarea
            {...register('student_notes')}
            rows={4}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#015023]">Catatan Dosen</label>
          <textarea
            {...register('lecturer_notes')}
            rows={4}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-[#015023]">Tugas Selanjutnya</label>
        <textarea
          {...register('next_task')}
          rows={4}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
        />
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-semibold text-[#015023]">Lampiran</label>
        {initialValues?.attachment && !file ? (
          <ThesisAttachmentLink path={initialValues.attachment} label="Lihat lampiran saat ini" />
        ) : null}
        {file ? (
          <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-[#015023]">{file.name}</p>
              <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button type="button" onClick={() => setSelectedFile(null)} className="rounded-full bg-red-100 p-2 text-red-600">
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
            Pilih lampiran PDF/DOC/DOCX/JPG/PNG
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
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
