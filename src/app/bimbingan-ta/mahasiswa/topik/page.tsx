'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import { StudentThesisShell } from '@/features/bimbingan-ta/components/ThesisShell';
import ThesisSectionCard from '@/features/bimbingan-ta/components/ThesisSectionCard';
import ThesisStatusBadge from '@/features/bimbingan-ta/components/ThesisStatusBadge';
import ThesisLoadingBlock from '@/features/bimbingan-ta/components/ThesisLoadingBlock';
import { studentThesisApi } from '@/features/bimbingan-ta/api/student';
import type { StudentThesis, ThesisTopic } from '@/features/bimbingan-ta/types';

export default function MahasiswaThesisTopicsPage() {
  const [topics, setTopics] = useState<ThesisTopic[]>([]);
  const [thesis, setThesis] = useState<StudentThesis | null>(null);
  const [search, setSearch] = useState('');
  const [myProgram, setMyProgram] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [topicData, thesisData] = await Promise.all([
        studentThesisApi.getTopics(myProgram),
        studentThesisApi.getCurrentThesis(),
      ]);
      setTopics(topicData);
      setThesis(thesisData);
    } catch (err: any) {
      setError(err?.userMessage || err?.message || 'Gagal memuat daftar topik TA.');
    } finally {
      setIsLoading(false);
    }
  }, [myProgram]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredTopics = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return topics;
    return topics.filter((topic) =>
      [
        topic.topic,
        topic.title_ind,
        topic.title_eng,
        topic.lecturer?.name,
        topic.program?.name,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [search, topics]);

  return (
    <StudentThesisShell
      title="Topik TA Dosen"
      description="Pilih salah satu topik yang dipublikasikan dosen. Memilih topik akan otomatis membuat pengajuan TA."
      backHref="/bimbingan-ta/mahasiswa"
      actions={
        <div className="flex flex-wrap gap-3">
          <Button variant={myProgram ? 'primary' : 'outline'} onClick={() => setMyProgram(true)}>
            Program Saya
          </Button>
          <Button variant={!myProgram ? 'primary' : 'outline'} onClick={() => setMyProgram(false)}>
            Semua Program
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <ThesisLoadingBlock />
      ) : error ? (
        <ErrorMessageBoxWithButton message={error} action={fetchData} />
      ) : (
        <div className="space-y-6">
          {thesis ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Anda sudah memiliki pengajuan TA aktif. Detail topik masih dapat dilihat, tetapi pemilihan topik akan diarahkan
              ke halaman pengajuan aktif.
            </div>
          ) : null}

          <ThesisSectionCard title="Filter Topik" description="Cari topik berdasarkan judul, topik, dosen, atau program studi.">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari topik..."
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
            />
          </ThesisSectionCard>

          <div className="grid gap-4">
            {filteredTopics.length === 0 ? (
              <ThesisSectionCard title="Daftar Topik" description="Belum ada topik yang sesuai dengan filter saat ini.">
                <p className="text-sm text-gray-500">Tidak ada topik tersedia.</p>
              </ThesisSectionCard>
            ) : (
              filteredTopics.map((topic) => (
                <ThesisSectionCard
                  key={topic.id_thesis_topic}
                  title={topic.title_ind}
                  description={topic.title_eng || topic.topic || '-'}
                  actions={<ThesisStatusBadge status={topic.status} />}
                >
                  <div className="space-y-3">
                    <div className="grid gap-3 text-sm text-gray-600 sm:grid-cols-3">
                      <p>Dosen: {topic.lecturer?.name || '-'}</p>
                      <p>Program: {topic.program?.name || '-'}</p>
                      <p>Kuota: {topic.quota || 0}</p>
                    </div>
                    <p className="text-sm leading-7 text-gray-700">{topic.description || 'Tidak ada deskripsi.'}</p>
                    <Button variant="outline" asChild>
                      <Link href={`/bimbingan-ta/mahasiswa/topik/${topic.id_thesis_topic}`}>Lihat Detail</Link>
                    </Button>
                  </div>
                </ThesisSectionCard>
              ))
            )}
          </div>
        </div>
      )}
    </StudentThesisShell>
  );
}
