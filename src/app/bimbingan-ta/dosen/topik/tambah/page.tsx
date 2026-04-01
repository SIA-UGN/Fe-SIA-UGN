'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import { StudentThesisShell } from '@/features/bimbingan-ta/components/ThesisShell';
import ThesisSectionCard from '@/features/bimbingan-ta/components/ThesisSectionCard';
import ThesisLoadingBlock from '@/features/bimbingan-ta/components/ThesisLoadingBlock';
import LecturerTopicForm from '@/features/bimbingan-ta/components/forms/LecturerTopicForm';
import { lecturerThesisApi } from '@/features/bimbingan-ta/api/lecturer';
import type { ProgramOption } from '@/features/bimbingan-ta/types';

export default function DosenAddTopicPage() {
  const router = useRouter();
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPrograms = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const programData = await lecturerThesisApi.resolveProgramOptions();
      setPrograms(programData);
    } catch (err: any) {
      setError(err?.userMessage || err?.message || 'Gagal memuat sumber program studi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleSubmit = async (payload: any) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await lecturerThesisApi.createTopic(payload);
      router.push('/bimbingan-ta/dosen/topik');
    } catch (err: any) {
      setSubmitError(err?.userMessage || err?.message || 'Gagal membuat topik TA.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StudentThesisShell title="Tambah Topik TA" description="Buat topik baru dengan status awal draft." backHref="/bimbingan-ta/dosen/topik">
      {isLoading ? (
        <ThesisLoadingBlock />
      ) : error ? (
        <ErrorMessageBoxWithButton message={error} action={fetchPrograms} />
      ) : (
        <ThesisSectionCard title="Form Topik TA" description="Topik akan disimpan sebagai draft sampai Anda publikasikan.">
          <LecturerTopicForm
            programs={programs}
            submitError={submitError}
            isSubmitting={isSubmitting}
            submitLabel="Buat Topik"
            onSubmit={handleSubmit}
            onCancel={() => router.push('/bimbingan-ta/dosen/topik')}
          />
        </ThesisSectionCard>
      )}
    </StudentThesisShell>
  );
}
