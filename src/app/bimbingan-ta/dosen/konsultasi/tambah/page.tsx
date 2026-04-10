'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import { StudentThesisShell } from '@/features/bimbingan-ta/components/ThesisShell';
import ThesisLoadingBlock from '@/features/bimbingan-ta/components/ThesisLoadingBlock';
import ThesisSectionCard from '@/features/bimbingan-ta/components/ThesisSectionCard';
import LecturerConsultationForm from '@/features/bimbingan-ta/components/forms/LecturerConsultationForm';
import { lecturerThesisApi } from '@/features/bimbingan-ta/api/lecturer';
import type { ThesisSupervisor } from '@/features/bimbingan-ta/types';

function DosenAddConsultationPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSupervisorId = searchParams.get('id_supervisor');

  const [supervisors, setSupervisors] = useState<ThesisSupervisor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await lecturerThesisApi.getSupervisees();
      setSupervisors(data);
    } catch (err: any) {
      setError(err?.userMessage || err?.message || 'Gagal memuat mahasiswa bimbingan.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (payload: any) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await lecturerThesisApi.createConsultation(payload);
      router.push('/bimbingan-ta/dosen/bimbingan');
    } catch (err: any) {
      setSubmitError(err?.userMessage || err?.message || 'Gagal menambahkan konsultasi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StudentThesisShell title="Tambah Konsultasi" description="Buat catatan konsultasi baru untuk mahasiswa bimbingan." backHref="/bimbingan-ta/dosen/bimbingan">
      {isLoading ? (
        <ThesisLoadingBlock />
      ) : error ? (
        <ErrorMessageBoxWithButton message={error} action={fetchData} />
      ) : (
        <ThesisSectionCard title="Form Konsultasi" description="Setelah disimpan, mahasiswa akan menerima notifikasi baru.">
          <LecturerConsultationForm
            supervisors={supervisors}
            initialValues={{
              id_supervisor: initialSupervisorId ? Number(initialSupervisorId) : undefined,
            }}
            submitError={submitError}
            isSubmitting={isSubmitting}
            submitLabel="Tambah Konsultasi"
            onSubmit={handleSubmit}
            onCancel={() => router.push('/bimbingan-ta/dosen/bimbingan')}
          />
        </ThesisSectionCard>
      )}
    </StudentThesisShell>
  );
}

export default function DosenAddConsultationPage() {
  return (
    <Suspense
      fallback={
        <StudentThesisShell
          title="Tambah Konsultasi"
          description="Buat catatan konsultasi baru untuk mahasiswa bimbingan."
          backHref="/bimbingan-ta/dosen/bimbingan"
        >
          <ThesisLoadingBlock />
        </StudentThesisShell>
      }
    >
      <DosenAddConsultationPageContent />
    </Suspense>
  );
}
