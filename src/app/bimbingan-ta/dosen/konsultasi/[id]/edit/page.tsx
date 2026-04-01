'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import { StudentThesisShell } from '@/features/bimbingan-ta/components/ThesisShell';
import ThesisLoadingBlock from '@/features/bimbingan-ta/components/ThesisLoadingBlock';
import ThesisSectionCard from '@/features/bimbingan-ta/components/ThesisSectionCard';
import LecturerConsultationForm from '@/features/bimbingan-ta/components/forms/LecturerConsultationForm';
import { lecturerThesisApi } from '@/features/bimbingan-ta/api/lecturer';
import type { Consultation, ThesisSupervisor } from '@/features/bimbingan-ta/types';

export default function DosenEditConsultationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [supervisors, setSupervisors] = useState<ThesisSupervisor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [consultationData, supervisorData] = await Promise.all([
        lecturerThesisApi.getConsultationDetail(Number(params.id)),
        lecturerThesisApi.getSupervisees(),
      ]);
      setConsultation(consultationData);
      setSupervisors(supervisorData);
    } catch (err: any) {
      setError(err?.userMessage || err?.message || 'Gagal memuat data konsultasi.');
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (payload: any) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await lecturerThesisApi.updateConsultation(Number(params.id), payload);
      router.push('/bimbingan-ta/dosen/bimbingan');
    } catch (err: any) {
      setSubmitError(err?.userMessage || err?.message || 'Gagal memperbarui konsultasi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StudentThesisShell title="Edit Konsultasi" description="Perbarui agenda, catatan, atau lampiran konsultasi." backHref="/bimbingan-ta/dosen/bimbingan">
      {isLoading ? (
        <ThesisLoadingBlock />
      ) : error ? (
        <ErrorMessageBoxWithButton message={error} action={fetchData} />
      ) : consultation ? (
        <ThesisSectionCard title="Form Edit Konsultasi" description="Semua field bersifat opsional saat pembaruan.">
          <LecturerConsultationForm
            supervisors={supervisors}
            initialValues={{
              id_supervisor: consultation.id_supervisor,
              consultation_date: consultation.consultation_date,
              start_time: consultation.start_time || '',
              end_time: consultation.end_time || '',
              location: consultation.location || '',
              subject: consultation.subject,
              student_notes: consultation.student_notes || '',
              lecturer_notes: consultation.lecturer_notes || '',
              attachment: consultation.attachment || null,
              next_task: consultation.next_task || '',
              progress: consultation.progress ?? 0,
              status: consultation.status,
            }}
            submitError={submitError}
            isSubmitting={isSubmitting}
            submitLabel="Simpan Perubahan"
            onSubmit={handleSubmit}
            onCancel={() => router.push('/bimbingan-ta/dosen/bimbingan')}
          />
        </ThesisSectionCard>
      ) : null}
    </StudentThesisShell>
  );
}
