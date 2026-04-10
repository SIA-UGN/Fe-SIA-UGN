'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { getPrograms } from '@/lib/adminApi';
import { Button } from '@/components/ui/button';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import { AdminThesisShell } from '@/features/bimbingan-ta/components/ThesisShell';
import ThesisLoadingBlock from '@/features/bimbingan-ta/components/ThesisLoadingBlock';
import ThesisSectionCard from '@/features/bimbingan-ta/components/ThesisSectionCard';
import ThesisServerPagination from '@/features/bimbingan-ta/components/ThesisServerPagination';
import ThesisStatusBadge from '@/features/bimbingan-ta/components/ThesisStatusBadge';
import { adminThesisApi } from '@/features/bimbingan-ta/api/admin';
import type { PaginatedResponse, ProgramOption, StudentThesis } from '@/features/bimbingan-ta/types';

const emptyPaginated: PaginatedResponse<StudentThesis> = {
  current_page: 1,
  data: [],
  per_page: 15,
  total: 0,
  last_page: 1,
};

export default function AdminThesisStudentsPage() {
  const [students, setStudents] = useState<PaginatedResponse<StudentThesis>>(emptyPaginated);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [programId, setProgramId] = useState('');
  const [perPage, setPerPage] = useState(15);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [studentData, programResponse] = await Promise.all([
        adminThesisApi.getStudents({
          search: search || undefined,
          status: status || undefined,
          id_program: programId || undefined,
          per_page: perPage,
          page,
        }),
        getPrograms(),
      ]);

      setStudents(studentData);
      if (programResponse?.status === 'success') {
        setPrograms(programResponse.data || []);
      }
    } catch (err: any) {
      setError(err?.userMessage || err?.message || 'Gagal memuat daftar pengajuan TA.');
    } finally {
      setIsLoading(false);
    }
  }, [page, perPage, programId, search, status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <AdminThesisShell title="Daftar Pengajuan TA" description="Filter dan telaah seluruh pengajuan tugas akhir mahasiswa." backHref="/adminpage/thesis">
      {isLoading ? (
        <ThesisLoadingBlock />
      ) : error ? (
        <ErrorMessageBoxWithButton message={error} action={fetchData} />
      ) : (
        <div className="space-y-6">
          <ThesisSectionCard title="Filter Pengajuan" description="Semua filter dikirim ke backend sesuai kontrak API admin.">
            <div className="grid gap-4 lg:grid-cols-4">
              <input
                value={search}
                onChange={(event) => {
                  setPage(1);
                  setSearch(event.target.value);
                }}
                placeholder="Cari judul atau mahasiswa..."
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
              />
              <select
                value={status}
                onChange={(event) => {
                  setPage(1);
                  setStatus(event.target.value);
                }}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
              >
                <option value="">Semua status</option>
                <option value="proposing">proposing</option>
                <option value="on_progress">on_progress</option>
                <option value="revision">revision</option>
                <option value="finished">finished</option>
              </select>
              <select
                value={programId}
                onChange={(event) => {
                  setPage(1);
                  setProgramId(event.target.value);
                }}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
              >
                <option value="">Semua program</option>
                {programs.map((program) => (
                  <option key={program.id_program} value={program.id_program}>
                    {program.name}
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

          <ThesisSectionCard title="Data Pengajuan" description={`Total data: ${students.total}`}>
            <div className="space-y-4">
              {students.data.length === 0 ? (
                <p className="text-sm text-gray-500">Tidak ada data pengajuan untuk filter saat ini.</p>
              ) : (
                students.data.map((item) => (
                  <div key={item.id_student_thesis} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#015023]">{item.title_ind}</p>
                        <p className="text-sm text-gray-600">{item.student?.name || 'Mahasiswa'}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <ThesisStatusBadge status={item.status} />
                        <Button variant="outline" asChild>
                          <Link href={`/adminpage/thesis/students/${item.id_student_thesis}`}>Detail</Link>
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-3 text-sm text-gray-600 md:grid-cols-3">
                      <p>Program: {item.program?.name || '-'}</p>
                      <p>Topik Dosen: {item.thesis_topic?.title_ind || '-'}</p>
                      <p>Pembimbing: {item.supervisors?.length || 0}</p>
                    </div>
                  </div>
                ))
              )}
              <ThesisServerPagination
                currentPage={students.current_page}
                lastPage={students.last_page}
                onPageChange={setPage}
              />
            </div>
          </ThesisSectionCard>
        </div>
      )}
    </AdminThesisShell>
  );
}
