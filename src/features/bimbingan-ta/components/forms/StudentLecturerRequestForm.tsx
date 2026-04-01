'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import type { ThesisLecturer } from '../../types';

const schema = z.object({
  id_lecturer: z.string().min(1, 'Pilih dosen pembimbing'),
  student_note: z.string().max(1000, 'Catatan maksimal 1000 karakter').optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

interface StudentLecturerRequestFormProps {
  lecturers: ThesisLecturer[];
  disabledLecturerIds?: number[];
  isSubmitting?: boolean;
  submitError?: string | null;
  onSubmit: (payload: { id_lecturer: number; student_note?: string }) => Promise<void> | void;
}

export default function StudentLecturerRequestForm({
  lecturers,
  disabledLecturerIds = [],
  isSubmitting,
  submitError,
  onSubmit,
}: StudentLecturerRequestFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      id_lecturer: '',
      student_note: '',
    },
  });

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      id_lecturer: Number(values.id_lecturer),
      student_note: values.student_note || undefined,
    });
    reset();
  });

  return (
    <form onSubmit={submit} className="space-y-4">
      {submitError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      ) : null}

      <div>
        <label className="mb-2 block text-sm font-semibold text-[#015023]">Dosen Pembimbing</label>
        <select
          {...register('id_lecturer')}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
        >
          <option value="">Pilih dosen</option>
          {lecturers.map((lecturer) => (
            <option
              key={lecturer.id_user_si}
              value={lecturer.id_user_si}
              disabled={disabledLecturerIds.includes(lecturer.id_user_si)}
            >
              {lecturer.staff_profile?.full_name || lecturer.name}
              {disabledLecturerIds.includes(lecturer.id_user_si) ? ' (sudah aktif)' : ''}
            </option>
          ))}
        </select>
        {errors.id_lecturer ? <p className="mt-1 text-sm text-red-600">{errors.id_lecturer.message}</p> : null}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-[#015023]">Catatan Mahasiswa</label>
        <textarea
          {...register('student_note')}
          rows={4}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
          placeholder="Opsional, maksimal 1000 karakter"
        />
        {errors.student_note ? <p className="mt-1 text-sm text-red-600">{errors.student_note.message}</p> : null}
      </div>

      <Button type="submit" variant="primary" disabled={isSubmitting}>
        {isSubmitting ? 'Mengirim...' : 'Kirim Permintaan'}
      </Button>
    </form>
  );
}
