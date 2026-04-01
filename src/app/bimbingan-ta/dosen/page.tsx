'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import { StudentThesisShell } from '@/features/bimbingan-ta/components/ThesisShell';
import ThesisSectionCard from '@/features/bimbingan-ta/components/ThesisSectionCard';
import ThesisStatusBadge from '@/features/bimbingan-ta/components/ThesisStatusBadge';
import ThesisLoadingBlock from '@/features/bimbingan-ta/components/ThesisLoadingBlock';
import ThesisSummaryCard from '@/features/bimbingan-ta/components/ThesisSummaryCard';
import { lecturerThesisApi } from '@/features/bimbingan-ta/api/lecturer';
import { formatDate, sortByNewest } from '@/features/bimbingan-ta/utils';
import type { Consultation, StudentThesisRequest, ThesisSupervisor, ThesisTopic } from '@/features/bimbingan-ta/types';

export default function DosenThesisDashboardPage() {
  const [topics, setTopics] = useState<ThesisTopic[]>([]);
  const [requests, setRequests] = useState<StudentThesisRequest[]>([]);
  const [supervisees, setSupervisees] = useState<ThesisSupervisor[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [topicData, requestData, superviseeData, consultationData] = await Promise.all([
        lecturerThesisApi.getTopics(),
        lecturerThesisApi.getRequests(),
        lecturerThesisApi.getSupervisees(),
        lecturerThesisApi.getConsultations(),
      ]);
      setTopics(topicData);
      setRequests(requestData);
      setSupervisees(superviseeData);
      setConsultations(consultationData);
    } catch (err: any) {
      setError(err?.userMessage || err?.message || 'Gagal memuat dashboard dosen.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const recentRequests = useMemo(() => sortByNewest(requests).slice(0, 4), [requests]);
  const recentConsultations = useMemo(() => sortByNewest(consultations).slice(0, 4), [consultations]);

  const topicCounts = topics.reduce(
    (acc, topic) => {
      acc[topic.status] = (acc[topic.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const requestCounts = requests.reduce(
    (acc, request) => {
      acc[request.status] = (acc[request.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <StudentThesisShell
      title="Bimbingan TA Dosen"
      description="Kelola topik, review permintaan bimbingan, dan pantau mahasiswa yang dibimbing."
      actions={
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" asChild>
            <Link href="/bimbingan-ta/dosen/topik">Kelola Topik</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/bimbingan-ta/dosen/permintaan">Permintaan Masuk</Link>
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
          <div className="grid gap-4 md:grid-cols-4">
            <ThesisSummaryCard title="Topik Draft" value={topicCounts.draft || 0} />
            <ThesisSummaryCard title="Topik Tersedia" value={topicCounts.available || 0} />
            <ThesisSummaryCard title="Permintaan Pending" value={requestCounts.pending || 0} />
            <ThesisSummaryCard title="Mahasiswa Bimbingan" value={supervisees.length} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ThesisSectionCard
              title="Permintaan Terbaru"
              description="Permintaan mahasiswa yang baru masuk ke akun dosen."
              actions={
                <Button variant="outline" asChild>
                  <Link href="/bimbingan-ta/dosen/permintaan">Lihat Semua</Link>
                </Button>
              }
            >
              <div className="space-y-3">
                {recentRequests.length === 0 ? (
                  <p className="text-sm text-gray-500">Belum ada permintaan bimbingan.</p>
                ) : (
                  recentRequests.map((request) => (
                    <div key={request.id_thesis_lecturer} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-[#015023]">
                          {request.student_thesis?.student?.name || 'Mahasiswa'}
                        </p>
                        <ThesisStatusBadge status={request.status} />
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {request.student_thesis?.title_ind || 'Tidak ada judul'} • {formatDate(request.created_at)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </ThesisSectionCard>

            <ThesisSectionCard
              title="Konsultasi Terbaru"
              description="Agenda dan catatan konsultasi mahasiswa bimbingan."
              actions={
                <Button variant="outline" asChild>
                  <Link href="/bimbingan-ta/dosen/bimbingan">Monitoring</Link>
                </Button>
              }
            >
              <div className="space-y-3">
                {recentConsultations.length === 0 ? (
                  <p className="text-sm text-gray-500">Belum ada konsultasi tercatat.</p>
                ) : (
                  recentConsultations.map((consultation) => (
                    <div key={consultation.id_consultation} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-[#015023]">{consultation.subject}</p>
                        <ThesisStatusBadge status={consultation.status} />
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {consultation.supervisor?.student_thesis?.student?.name || 'Mahasiswa'} •{' '}
                        {formatDate(consultation.consultation_date)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </ThesisSectionCard>
          </div>
        </div>
      )}
    </StudentThesisShell>
  );
}
