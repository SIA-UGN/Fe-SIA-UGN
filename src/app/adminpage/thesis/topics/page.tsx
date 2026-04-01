'use client';

import { useCallback, useEffect, useState } from 'react';
import { getDosen, getPrograms } from '@/lib/adminApi';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import { AdminThesisShell } from '@/features/bimbingan-ta/components/ThesisShell';
import ThesisLoadingBlock from '@/features/bimbingan-ta/components/ThesisLoadingBlock';
import ThesisSectionCard from '@/features/bimbingan-ta/components/ThesisSectionCard';
import ThesisStatusBadge from '@/features/bimbingan-ta/components/ThesisStatusBadge';
import { adminThesisApi } from '@/features/bimbingan-ta/api/admin';
import type { BasicLecturer, ProgramOption, ThesisTopic, ThesisTopicStatus } from '@/features/bimbingan-ta/types';

export default function AdminThesisTopicsPage() {
  const [topics, setTopics] = useState<ThesisTopic[]>([]);
  const [lecturers, setLecturers] = useState<BasicLecturer[]>([]);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [status, setStatus] = useState<'all' | ThesisTopicStatus>('all');
  const [lecturerId, setLecturerId] = useState('');
  const [programId, setProgramId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [topicData, dosenResponse, programResponse] = await Promise.all([
        adminThesisApi.getTopics({
          status: status === 'all' ? undefined : status,
          id_lecturer: lecturerId || undefined,
          id_program: programId || undefined,
        }),
        getDosen(),
        getPrograms(),
      ]);
      setTopics(topicData);
      if (dosenResponse?.status === 'success') setLecturers(dosenResponse.data || []);
      if (programResponse?.status === 'success') setPrograms(programResponse.data || []);
    } catch (err: any) {
      setError(err?.userMessage || err?.message || 'Gagal memuat daftar topik TA.');
    } finally {
      setIsLoading(false);
    }
  }, [lecturerId, programId, status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <AdminThesisShell title="Daftar Topik TA" description="Semua topik tugas akhir yang dibuat dosen." backHref="/adminpage/thesis">
      {isLoading ? (
        <ThesisLoadingBlock />
      ) : error ? (
        <ErrorMessageBoxWithButton message={error} action={fetchData} />
      ) : (
        <div className="space-y-6">
          <ThesisSectionCard title="Filter Topik" description="Filter topik berdasarkan status, dosen, dan program.">
            <div className="grid gap-4 lg:grid-cols-3">
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as 'all' | ThesisTopicStatus)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
              >
                <option value="all">Semua status</option>
                <option value="draft">draft</option>
                <option value="available">available</option>
                <option value="taken">taken</option>
                <option value="archived">archived</option>
              </select>
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

          <ThesisSectionCard title="Data Topik" description={`Total data: ${topics.length}`}>
            <div className="space-y-3">
              {topics.length === 0 ? (
                <p className="text-sm text-gray-500">Tidak ada topik untuk filter saat ini.</p>
              ) : (
                topics.map((topic) => (
                  <div key={topic.id_thesis_topic} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#015023]">{topic.title_ind}</p>
                        <p className="text-sm text-gray-600">
                          {topic.lecturer?.name || 'Dosen'} • {topic.program?.name || '-'}
                        </p>
                      </div>
                      <ThesisStatusBadge status={topic.status} />
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
