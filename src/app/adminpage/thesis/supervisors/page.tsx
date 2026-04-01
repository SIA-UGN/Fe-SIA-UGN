'use client';

import { useCallback, useEffect, useState } from 'react';
import { getDosen, getPrograms } from '@/lib/adminApi';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import { AdminThesisShell } from '@/features/bimbingan-ta/components/ThesisShell';
import ThesisLoadingBlock from '@/features/bimbingan-ta/components/ThesisLoadingBlock';
import ThesisSectionCard from '@/features/bimbingan-ta/components/ThesisSectionCard';
import { adminThesisApi } from '@/features/bimbingan-ta/api/admin';
import type { BasicLecturer, ProgramOption, ThesisSupervisor } from '@/features/bimbingan-ta/types';

export default function AdminThesisSupervisorsPage() {
  const [supervisors, setSupervisors] = useState<ThesisSupervisor[]>([]);
  const [lecturers, setLecturers] = useState<BasicLecturer[]>([]);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [lecturerId, setLecturerId] = useState('');
  const [programId, setProgramId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [supervisorData, dosenResponse, programResponse] = await Promise.all([
        adminThesisApi.getSupervisors({
          id_lecturer: lecturerId || undefined,
          id_program: programId || undefined,
        }),
        getDosen(),
        getPrograms(),
      ]);
      setSupervisors(supervisorData);
      if (dosenResponse?.status === 'success') setLecturers(dosenResponse.data || []);
      if (programResponse?.status === 'success') setPrograms(programResponse.data || []);
    } catch (err: any) {
      setError(err?.userMessage || err?.message || 'Gagal memuat data pembimbing.');
    } finally {
      setIsLoading(false);
    }
  }, [lecturerId, programId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <AdminThesisShell title="Daftar Pembimbing" description="Lihat pasangan dosen-mahasiswa yang sudah memiliki relasi pembimbing." backHref="/adminpage/thesis">
      {isLoading ? (
        <ThesisLoadingBlock />
      ) : error ? (
        <ErrorMessageBoxWithButton message={error} action={fetchData} />
      ) : (
        <div className="space-y-6">
          <ThesisSectionCard title="Filter Pembimbing" description="Saring berdasarkan dosen atau program studi mahasiswa.">
            <div className="grid gap-4 md:grid-cols-2">
              <select
                value={lecturerId}
                onChange={(event) => setLecturerId(event.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
              >
                <option value="">Semua dosen</option>
                {lecturers.map((lecturer) => (
                  <option key={lecturer.id_user_si} value={lecturer.id_user_si}>
                    {lecturer.name}
                  </option>
                ))}
              </select>
              <select
                value={programId}
                onChange={(event) => setProgramId(event.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
              >
                <option value="">Semua program</option>
                {programs.map((program) => (
                  <option key={program.id_program} value={program.id_program}>
                    {program.name}
                  </option>
                ))}
              </select>
            </div>
          </ThesisSectionCard>

          <ThesisSectionCard title="Data Pembimbing" description={`Total data: ${supervisors.length}`}>
            <div className="space-y-3">
              {supervisors.length === 0 ? (
                <p className="text-sm text-gray-500">Tidak ada data pembimbing untuk filter saat ini.</p>
              ) : (
                supervisors.map((supervisor) => (
                  <div key={supervisor.id_supervisor} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <div className="grid gap-3 text-sm text-gray-700 md:grid-cols-3">
                      <p>Dosen: {supervisor.lecturer?.name || '-'}</p>
                      <p>Mahasiswa: {supervisor.student_thesis?.student?.name || '-'}</p>
                      <p>Program: {supervisor.student_thesis?.program?.name || '-'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ThesisSectionCard>
        </div>
      )}
    </AdminThesisShell>
  );
}
