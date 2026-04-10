'use client';

import { useCallback, useEffect, useState } from 'react';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import { AdminThesisShell } from '@/features/bimbingan-ta/components/ThesisShell';
import ThesisLoadingBlock from '@/features/bimbingan-ta/components/ThesisLoadingBlock';
import ThesisSectionCard from '@/features/bimbingan-ta/components/ThesisSectionCard';
import ThesisServerPagination from '@/features/bimbingan-ta/components/ThesisServerPagination';
import ThesisStatusBadge from '@/features/bimbingan-ta/components/ThesisStatusBadge';
import { adminThesisApi } from '@/features/bimbingan-ta/api/admin';
import type { Consultation, PaginatedResponse, ThesisSupervisor } from '@/features/bimbingan-ta/types';

const emptyPaginated: PaginatedResponse<Consultation> = {
  current_page: 1,
  data: [],
  per_page: 15,
  total: 0,
  last_page: 1,
};

export default function AdminThesisConsultationsPage() {
  const [consultations, setConsultations] = useState<PaginatedResponse<Consultation>>(emptyPaginated);
  const [supervisors, setSupervisors] = useState<ThesisSupervisor[]>([]);
  const [status, setStatus] = useState('');
  const [supervisorId, setSupervisorId] = useState('');
  const [perPage, setPerPage] = useState(15);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [consultationData, supervisorData] = await Promise.all([
        adminThesisApi.getConsultations({
          status: status || undefined,
          id_supervisor: supervisorId || undefined,
          per_page: perPage,
          page,
        }),
        adminThesisApi.getSupervisors(),
      ]);
      setConsultations(consultationData);
      setSupervisors(supervisorData);
    } catch (err: any) {
      setError(err?.userMessage || err?.message || 'Gagal memuat daftar konsultasi.');
    } finally {
      setIsLoading(false);
    }
  }, [page, perPage, status, supervisorId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <AdminThesisShell title="Daftar Konsultasi TA" description="Semua catatan konsultasi bimbingan dari seluruh dosen pembimbing." backHref="/adminpage/thesis">
      {isLoading ? (
        <ThesisLoadingBlock />
      ) : error ? (
        <ErrorMessageBoxWithButton message={error} action={fetchData} />
      ) : (
        <div className="space-y-6">
          <ThesisSectionCard title="Filter Konsultasi" description="Gunakan filter status dan pembimbing untuk mempersempit data.">
            <div className="grid gap-4 lg:grid-cols-3">
              <select
                value={status}
                onChange={(event) => {
                  setPage(1);
                  setStatus(event.target.value);
                }}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
              >
                <option value="">Semua status</option>
                <option value="pending">pending</option>
                <option value="on_going">on_going</option>
                <option value="finished">finished</option>
                <option value="rejected">rejected</option>
              </select>
              <select
                value={supervisorId}
                onChange={(event) => {
                  setPage(1);
                  setSupervisorId(event.target.value);
                }}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
              >
                <option value="">Semua pembimbing</option>
                {supervisors.map((supervisor) => (
                  <option key={supervisor.id_supervisor} value={supervisor.id_supervisor}>
                    {supervisor.lecturer?.name || 'Dosen'} - {supervisor.student_thesis?.student?.name || 'Mahasiswa'}
                  </option>
                ))}
              </select>
              <select
                value={perPage}
                onChange={(event) => {
                  setPage(1);
                  setPerPage(Number(event.target.value));
                }}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
              >
                <option value={10}>10 / halaman</option>
                <option value={15}>15 / halaman</option>
                <option value={25}>25 / halaman</option>
              </select>
            </div>
          </ThesisSectionCard>

          <ThesisSectionCard title="Data Konsultasi" description={`Total data: ${consultations.total}`}>
            <div className="space-y-3">
              {consultations.data.length === 0 ? (
                <p className="text-sm text-gray-500">Tidak ada konsultasi untuk filter saat ini.</p>
              ) : (
                consultations.data.map((consultation) => (
                  <div key={consultation.id_consultation} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#015023]">{consultation.subject}</p>
                        <p className="text-sm text-gray-600">
                          {consultation.supervisor?.lecturer?.name || 'Dosen'} •{' '}
                          {consultation.supervisor?.student_thesis?.student?.name || 'Mahasiswa'}
                        </p>
                      </div>
                      <ThesisStatusBadge status={consultation.status} />
                    </div>
                  </div>
                ))
              )}
              <ThesisServerPagination
                currentPage={consultations.current_page}
                lastPage={consultations.last_page}
                onPageChange={setPage}
              />
            </div>
          </ThesisSectionCard>
        </div>
      )}
    </AdminThesisShell>
  );
}
