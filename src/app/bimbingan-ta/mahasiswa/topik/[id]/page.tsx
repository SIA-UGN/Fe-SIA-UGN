'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import { StudentThesisShell } from '@/features/bimbingan-ta/components/ThesisShell';
import ThesisSectionCard from '@/features/bimbingan-ta/components/ThesisSectionCard';
import ThesisStatusBadge from '@/features/bimbingan-ta/components/ThesisStatusBadge';
import ThesisLoadingBlock from '@/features/bimbingan-ta/components/ThesisLoadingBlock';
import ThesisKeyValueList from '@/features/bimbingan-ta/components/ThesisKeyValueList';
import StudentTopicSelectionForm from '@/features/bimbingan-ta/components/forms/StudentTopicSelectionForm';
import { studentThesisApi } from '@/features/bimbingan-ta/api/student';
import type { StudentThesis, ThesisTopic } from '@/features/bimbingan-ta/types';

export default function MahasiswaTopicDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [topic, setTopic] = useState<ThesisTopic | null>(null);
  const [thesis, setThesis] = useState<StudentThesis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [topicData, thesisData] = await Promise.all([
        studentThesisApi.getTopicDetail(Number(params.id)),
        studentThesisApi.getCurrentThesis(),
      ]);
      setTopic(topicData);
      setThesis(thesisData);
    } catch (err: any) {
      setError(err?.userMessage || err?.message || 'Gagal memuat detail topik TA.');
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!thesis) return;
    const timer = setTimeout(() => {
      router.replace('/bimbingan-ta/mahasiswa/pengajuan');
    }, 1500);
    return () => clearTimeout(timer);
  }, [router, thesis]);

  const handleSelectTopic = async (payload: { student_note?: string; attachment_proposal?: File | null }) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await studentThesisApi.selectTopic(Number(params.id), payload);
      router.replace('/bimbingan-ta/mahasiswa/pengajuan');
    } catch (err: any) {
      setSubmitError(err?.userMessage || err?.message || 'Gagal memilih topik TA.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StudentThesisShell
      title="Detail Topik TA"
      description="Pastikan topik sesuai minat dan pahami bahwa memilih topik ini akan membuat pengajuan TA baru."
      backHref="/bimbingan-ta/mahasiswa/topik"
    >
      {isLoading ? (
        <ThesisLoadingBlock />
      ) : error ? (
        <ErrorMessageBoxWithButton message={error} action={fetchData} />
      ) : topic ? (
        <div className="space-y-6">
          {thesis ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Anda sudah memiliki pengajuan TA aktif. Anda akan diarahkan ke halaman pengajuan aktif.
            </div>
          ) : null}

          <ThesisSectionCard
            title={topic.title_ind}
            description={topic.title_eng || topic.topic || '-'}
            actions={<ThesisStatusBadge status={topic.status} />}
          >
            <div className="space-y-4">
              <ThesisKeyValueList
                items={[
                  { label: 'Bidang', value: topic.topic || '-' },
                  { label: 'Dosen', value: topic.lecturer?.name || '-' },
                  { label: 'Program Studi', value: topic.program?.name || '-' },
                  { label: 'Kuota', value: topic.quota || '-' },
                ]}
              />
              <p className="text-sm leading-7 text-gray-700">{topic.description || 'Tidak ada deskripsi topik.'}</p>
            </div>
          </ThesisSectionCard>

          {!thesis ? (
            <ThesisSectionCard
              title="Pilih Topik Ini"
              description="Memilih topik akan otomatis membuat pengajuan TA dan mengirim permintaan bimbingan ke dosen pemilik topik."
            >
              <StudentTopicSelectionForm
                isSubmitting={isSubmitting}
                submitError={submitError}
                onSubmit={handleSelectTopic}
              />
            </ThesisSectionCard>
          ) : null}
        </div>
      ) : null}
    </StudentThesisShell>
  );
}
