'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import { StudentThesisShell } from '@/features/bimbingan-ta/components/ThesisShell';
import ThesisSectionCard from '@/features/bimbingan-ta/components/ThesisSectionCard';
import ThesisKeyValueList from '@/features/bimbingan-ta/components/ThesisKeyValueList';
import ThesisLoadingBlock from '@/features/bimbingan-ta/components/ThesisLoadingBlock';
import ThesisStatusBadge from '@/features/bimbingan-ta/components/ThesisStatusBadge';
import { lecturerThesisApi } from '@/features/bimbingan-ta/api/lecturer';
import type { ThesisTopic } from '@/features/bimbingan-ta/types';

export default function DosenTopicDetailPage() {
  const params = useParams<{ id: string }>();
  const [topic, setTopic] = useState<ThesisTopic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await lecturerThesisApi.getTopicDetail(Number(params.id));
      setTopic(data);
    } catch (err: any) {
      setError(err?.userMessage || err?.message || 'Gagal memuat detail topik.');
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <StudentThesisShell title="Detail Topik TA" description="Lihat informasi detail topik dan mahasiswa yang sudah memilihnya." backHref="/bimbingan-ta/dosen/topik">
      {isLoading ? (
        <ThesisLoadingBlock />
      ) : error ? (
        <ErrorMessageBoxWithButton message={error} action={fetchData} />
      ) : topic ? (
        <div className="space-y-6">
          <ThesisSectionCard
            title={topic.title_ind}
            description={topic.title_eng || topic.topic || '-'}
            actions={<ThesisStatusBadge status={topic.status} />}
          >
            <div className="space-y-4">
              <ThesisKeyValueList
                items={[
                  { label: 'Topik', value: topic.topic || '-' },
                  { label: 'Program Studi', value: topic.program?.name || '-' },
                  { label: 'Kuota', value: topic.quota || '-' },
                  { label: 'Status', value: topic.status },
                ]}
              />
              <p className="text-sm leading-7 text-gray-700">{topic.description || 'Tidak ada deskripsi.'}</p>
              {topic.status === 'draft' ? (
                <Button variant="outline" asChild>
                  <Link href={`/bimbingan-ta/dosen/topik/${topic.id_thesis_topic}/edit`}>Edit Topik</Link>
                </Button>
              ) : null}
            </div>
          </ThesisSectionCard>

          <ThesisSectionCard
            title="Mahasiswa yang Memilih Topik"
            description="Daftar mahasiswa yang sudah terkait dengan topik ini."
          >
            <div className="space-y-3">
              {topic.student_theses?.length ? (
                topic.student_theses.map((item) => (
                  <div key={item.id_student_thesis} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-semibold text-[#015023]">{item.student?.name || 'Mahasiswa'}</p>
                      <ThesisStatusBadge status={item.status} />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Belum ada mahasiswa yang memilih topik ini.</p>
              )}
            </div>
          </ThesisSectionCard>
        </div>
      ) : null}
    </StudentThesisShell>
  );
}
