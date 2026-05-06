'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import { StudentThesisShell } from '@/features/bimbingan-ta/components/ThesisShell';
import ThesisLoadingBlock from '@/features/bimbingan-ta/components/ThesisLoadingBlock';
import ThesisSectionCard from '@/features/bimbingan-ta/components/ThesisSectionCard';
import ThesisStatusBadge from '@/features/bimbingan-ta/components/ThesisStatusBadge';
import { lecturerThesisApi } from '@/features/bimbingan-ta/api/lecturer';
import { formatDate, sortByNewest } from '@/features/bimbingan-ta/utils';
import type { StudentThesisRequest, ThesisRequestStatus } from '@/features/bimbingan-ta/types';

export default function DosenRequestsPage() {
  const [requests, setRequests] = useState<StudentThesisRequest[]>([]);
  const [filter, setFilter] = useState<'all' | ThesisRequestStatus>('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await lecturerThesisApi.getRequests(filter === 'all' ? undefined : filter);
      setRequests(data);
    } catch (err: any) {
      setError(err?.userMessage || err?.message || 'Gagal memuat permintaan bimbingan.');
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();
    return sortByNewest(requests).filter((request) => {
      if (!query) return true;
      return [
        request.student_thesis?.student?.name,
        request.student_thesis?.title_ind,
        request.student_thesis?.program?.name,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [requests, search]);

  return (
    <StudentThesisShell
      title="Permintaan Bimbingan"
      description="Tinjau permintaan mahasiswa dan putuskan apakah akan menerima atau menolak bimbingan."
      backHref="/bimbingan-ta/dosen"
    >
      {isLoading ? (
        <ThesisLoadingBlock />
      ) : error ? (
        <ErrorMessageBoxWithButton message={error} action={fetchData} />
      ) : (
        <div className="space-y-6">
          <ThesisSectionCard title="Filter Permintaan" description="Saring permintaan berdasarkan status dan pencarian mahasiswa.">
            <div className="grid gap-4 md:grid-cols-[1.4fr,1fr]">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari mahasiswa atau judul TA..."
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
              />
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value as 'all' | ThesisRequestStatus)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
              >
                <option value="all">Semua status</option>
                <option value="pending">pending</option>
                <option value="accepted">accepted</option>
                <option value="rejected">rejected</option>
              </select>
            </div>
          </ThesisSectionCard>

          <div className="grid gap-4">
            {filteredRequests.length === 0 ? (
              <ThesisSectionCard title="Permintaan" description="Belum ada permintaan yang sesuai filter.">
                <p className="text-sm text-gray-500">Tidak ada data permintaan.</p>
              </ThesisSectionCard>
            ) : (
              filteredRequests.map((request) => (
                <ThesisSectionCard
                  key={request.id_thesis_lecturer}
                  title={request.student_thesis?.student?.name || 'Mahasiswa'}
                  description={request.student_thesis?.title_ind || 'Tidak ada judul'}
                  actions={<ThesisStatusBadge status={request.status} />}
                >
                  <div className="space-y-3">
                    <div className="grid gap-3 text-sm text-gray-600 md:grid-cols-3">
                      <p>Program: {request.student_thesis?.program?.name || '-'}</p>
                      <p>Dikirim: {formatDate(request.created_at)}</p>
                      <p>Status TA: {request.student_thesis?.status || '-'}</p>
                    </div>
                    {request.student_note ? (
                      <p className="text-sm leading-7 text-gray-700">Catatan mahasiswa: {request.student_note}</p>
                    ) : null}
                    <Button variant="outline" asChild>
                      <Link href={`/bimbingan-ta/dosen/permintaan/${request.id_thesis_lecturer}`}>Lihat Detail</Link>
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
