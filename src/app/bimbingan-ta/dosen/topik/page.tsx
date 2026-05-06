'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertConfirmationRedDialog } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  ErrorMessageBoxWithButton,
  SuccessMessageBox,
} from '@/components/ui/message-box';
import { StudentThesisShell } from '@/features/bimbingan-ta/components/ThesisShell';
import ThesisLoadingBlock from '@/features/bimbingan-ta/components/ThesisLoadingBlock';
import ThesisSectionCard from '@/features/bimbingan-ta/components/ThesisSectionCard';
import ThesisStatusBadge from '@/features/bimbingan-ta/components/ThesisStatusBadge';
import { lecturerThesisApi } from '@/features/bimbingan-ta/api/lecturer';
import { formatDate } from '@/features/bimbingan-ta/utils';
import type { ThesisTopic, ThesisTopicStatus } from '@/features/bimbingan-ta/types';

export default function DosenTopicsPage() {
  const [topics, setTopics] = useState<ThesisTopic[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ThesisTopicStatus>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ThesisTopic | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await lecturerThesisApi.getTopics();
      setTopics(data);
    } catch (err: any) {
      setError(err?.userMessage || err?.message || 'Gagal memuat daftar topik.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(null), 4000);
    return () => clearTimeout(timer);
  }, [success]);

  const filteredTopics = useMemo(() => {
    return topics.filter((topic) => {
      const matchesStatus = statusFilter === 'all' || topic.status === statusFilter;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        [topic.topic, topic.title_ind, topic.title_eng, topic.program?.name]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [search, statusFilter, topics]);

  const handlePublish = async (id: number) => {
    try {
      await lecturerThesisApi.publishTopic(id);
      setSuccess('Topik TA berhasil dipublikasikan.');
      await fetchData();
    } catch (err: any) {
      setError(err?.userMessage || err?.message || 'Gagal mempublikasikan topik.');
    }
  };

  const handleArchive = async (id: number) => {
    try {
      await lecturerThesisApi.archiveTopic(id);
      setSuccess('Topik TA berhasil diarsipkan.');
      await fetchData();
    } catch (err: any) {
      setError(err?.userMessage || err?.message || 'Gagal mengarsipkan topik.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await lecturerThesisApi.deleteTopic(deleteTarget.id_thesis_topic);
      setSuccess('Topik TA berhasil dihapus.');
      setDeleteTarget(null);
      await fetchData();
    } catch (err: any) {
      setError(err?.userMessage || err?.message || 'Gagal menghapus topik.');
    }
  };

  return (
    <StudentThesisShell
      title="Topik TA"
      description="Kelola seluruh topik tugas akhir milik dosen."
      backHref="/bimbingan-ta/dosen"
      actions={
        <Button variant="primary" asChild>
          <Link href="/bimbingan-ta/dosen/topik/tambah">Tambah Topik</Link>
        </Button>
      }
    >
      {isLoading ? (
        <ThesisLoadingBlock />
      ) : error ? (
        <ErrorMessageBoxWithButton message={error} action={fetchData} />
      ) : (
        <div className="space-y-6">
          {success ? <SuccessMessageBox message={success} /> : null}

          <ThesisSectionCard title="Filter Topik" description="Cari dan saring topik berdasarkan status publikasi.">
            <div className="grid gap-4 md:grid-cols-[1.5fr,1fr]">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari topik..."
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
              />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as 'all' | ThesisTopicStatus)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
              >
                <option value="all">Semua status</option>
                <option value="draft">draft</option>
                <option value="available">available</option>
                <option value="taken">taken</option>
                <option value="archived">archived</option>
              </select>
            </div>
          </ThesisSectionCard>

          <div className="grid gap-4">
            {filteredTopics.length === 0 ? (
              <ThesisSectionCard title="Daftar Topik" description="Belum ada topik yang cocok dengan filter.">
                <p className="text-sm text-gray-500">Tidak ada data topik.</p>
              </ThesisSectionCard>
            ) : (
              filteredTopics.map((topic) => (
                <ThesisSectionCard
                  key={topic.id_thesis_topic}
                  title={topic.title_ind}
                  description={topic.title_eng || topic.topic || '-'}
                  actions={<ThesisStatusBadge status={topic.status} />}
                >
                  <div className="space-y-4">
                    <div className="grid gap-3 text-sm text-gray-600 md:grid-cols-4">
                      <p>Topik: {topic.topic || '-'}</p>
                      <p>Program: {topic.program?.name || '-'}</p>
                      <p>Kuota: {topic.quota || 0}</p>
                      <p>Dibuat: {formatDate(topic.created_at)}</p>
                    </div>
                    <p className="text-sm leading-7 text-gray-700">{topic.description || 'Tidak ada deskripsi.'}</p>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" asChild>
                        <Link href={`/bimbingan-ta/dosen/topik/${topic.id_thesis_topic}`}>Detail</Link>
                      </Button>
                      {topic.status === 'draft' ? (
                        <>
                          <Button variant="outline" asChild>
                            <Link href={`/bimbingan-ta/dosen/topik/${topic.id_thesis_topic}/edit`}>Edit</Link>
                          </Button>
                          <Button variant="primary" onClick={() => handlePublish(topic.id_thesis_topic)}>
                            Publish
                          </Button>
                          <Button variant="warning" onClick={() => setDeleteTarget(topic)}>
                            Hapus
                          </Button>
                        </>
                      ) : null}
                      {(topic.status === 'available' || topic.status === 'taken') ? (
                        <Button variant="warning" onClick={() => handleArchive(topic.id_thesis_topic)}>
                          Arsipkan
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </ThesisSectionCard>
              ))
            )}
          </div>
        </div>
      )}

      <AlertConfirmationRedDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Topik TA"
        description={`Hapus topik "${deleteTarget?.title_ind || ''}"? Tindakan ini hanya valid untuk topik draft.`}
        confirmText="Ya, Hapus"
        onConfirm={handleDelete}
      />
    </StudentThesisShell>
  );
}
