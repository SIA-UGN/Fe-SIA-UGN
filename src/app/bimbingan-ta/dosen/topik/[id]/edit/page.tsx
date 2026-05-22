'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import { StudentThesisShell } from '@/features/bimbingan-ta/components/ThesisShell';
import ThesisSectionCard from '@/features/bimbingan-ta/components/ThesisSectionCard';
import ThesisLoadingBlock from '@/features/bimbingan-ta/components/ThesisLoadingBlock';
import LecturerTopicForm from '@/features/bimbingan-ta/components/forms/LecturerTopicForm';
import { lecturerThesisApi } from '@/features/bimbingan-ta/api/lecturer';
import type { ProgramOption, ThesisCategory, ThesisTopic } from '@/features/bimbingan-ta/types';

export default function DosenEditTopicPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [topic, setTopic] = useState<ThesisTopic | null>(null);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [categories, setCategories] = useState<ThesisCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [topicData, programData, categoryData] = await Promise.all([
        lecturerThesisApi.getTopicDetail(Number(params.id)),
        lecturerThesisApi.resolveProgramOptions(),
        lecturerThesisApi.getCategories(),
      ]);
      setTopic(topicData);
      setPrograms(programData);
      setCategories(categoryData);
    } catch (err: any) {
      setError(err?.userMessage || err?.message || 'Gagal memuat data topik.');
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
      await lecturerThesisApi.updateTopic(Number(params.id), payload);
      router.push(`/bimbingan-ta/dosen/topik/${params.id}`);
    } catch (err: any) {
      setSubmitError(err?.userMessage || err?.message || 'Gagal memperbarui topik.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StudentThesisShell title="Edit Topik TA" description="Topik hanya dapat diperbarui ketika masih berstatus draft." backHref={`/bimbingan-ta/dosen/topik/${params.id}`}>
      {isLoading ? (
        <ThesisLoadingBlock />
      ) : error ? (
        <ErrorMessageBoxWithButton message={error} action={fetchData} />
      ) : topic ? (
        <ThesisSectionCard title="Form Edit Topik" description="Pastikan detail topik sudah final sebelum dipublikasikan.">
          <LecturerTopicForm
            programs={programs}
            categories={categories}
            initialValues={{
              topic: topic.topic || '',
              title_ind: topic.title_ind,
              title_eng: topic.title_eng || '',
              description: topic.description || '',
              quota: topic.quota || 1,
              id_program: topic.id_program || topic.program?.id_program,
              id_thesis_category:
                topic.id_thesis_category ||
                topic.thesis_category?.id_thesis_category ||
                topic.category?.id_thesis_category ||
                null,
            }}
            submitError={submitError}
            isSubmitting={isSubmitting}
            submitLabel="Simpan Perubahan"
            onSubmit={handleSubmit}
            onCancel={() => router.push(`/bimbingan-ta/dosen/topik/${params.id}`)}
          />
        </ThesisSectionCard>
      ) : null}
    </StudentThesisShell>
  );
}
