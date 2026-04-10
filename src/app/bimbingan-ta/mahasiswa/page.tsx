'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import {
  StudentThesisShell,
} from '@/features/bimbingan-ta/components/ThesisShell';
import ThesisLoadingBlock from '@/features/bimbingan-ta/components/ThesisLoadingBlock';
import ThesisSummaryCard from '@/features/bimbingan-ta/components/ThesisSummaryCard';
import ThesisSectionCard from '@/features/bimbingan-ta/components/ThesisSectionCard';
import ThesisStatusBadge from '@/features/bimbingan-ta/components/ThesisStatusBadge';
import ThesisQuotaMeter from '@/features/bimbingan-ta/components/ThesisQuotaMeter';
import ThesisAttachmentLink from '@/features/bimbingan-ta/components/ThesisAttachmentLink';
import ThesisEmptyState from '@/features/bimbingan-ta/components/ThesisEmptyState';
import ThesisKeyValueList from '@/features/bimbingan-ta/components/ThesisKeyValueList';
import { studentThesisApi } from '@/features/bimbingan-ta/api/student';
import { countActiveRequests, formatDate, sortByNewest } from '@/features/bimbingan-ta/utils';
import type { Consultation, StudentThesis, StudentThesisRequest, ThesisSupervisor } from '@/features/bimbingan-ta/types';

export default function MahasiswaThesisDashboardPage() {
  const [thesis, setThesis] = useState<StudentThesis | null>(null);
  const [requests, setRequests] = useState<StudentThesisRequest[]>([]);
  const [supervisors, setSupervisors] = useState<ThesisSupervisor[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [thesisData, requestData, supervisorData, consultationData] = await Promise.all([
        studentThesisApi.getCurrentThesis(),
        studentThesisApi.getRequests(),
        studentThesisApi.getSupervisors(),
        studentThesisApi.getConsultations(),
      ]);

      setThesis(thesisData);
      setRequests(requestData);
      setSupervisors(supervisorData);
      setConsultations(consultationData);
    } catch (err: any) {
      setError(err?.userMessage || err?.message || 'Gagal memuat dashboard Bimbingan TA.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeRequestCount = useMemo(
    () => countActiveRequests(requests.map((item) => item.status)),
    [requests],
  );

  const recentConsultations = useMemo(
    () => sortByNewest(consultations).slice(0, 4),
    [consultations],
  );

  return (
    <StudentThesisShell
      title="Bimbingan Tugas Akhir"
      description="Ringkasan pengajuan, pembimbing, dan progres konsultasi tugas akhir Anda."
      actions={
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" asChild>
            <Link href="/bimbingan-ta/mahasiswa/pengajuan">Kelola Pengajuan</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/bimbingan-ta/mahasiswa/topik">Lihat Topik TA</Link>
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
          <div className="grid gap-4 md:grid-cols-3">
            <ThesisSummaryCard
              title="Status TA"
              subtitle={thesis ? thesis.title_ind : 'Belum ada pengajuan aktif'}
            >
              {thesis ? <ThesisStatusBadge status={thesis.status} /> : <span className="text-sm text-gray-500">Belum ada data</span>}
            </ThesisSummaryCard>
            <ThesisSummaryCard
              title="Dosen Pembimbing"
              value={supervisors.length}
              subtitle="Dosen yang sudah menyetujui bimbingan"
            />
            <ThesisSummaryCard
              title="Konsultasi"
              value={consultations.length}
              subtitle="Total catatan konsultasi"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <ThesisQuotaMeter
              label="Kuota Permintaan Pembimbing"
              value={activeRequestCount}
              max={4}
              helperText="Status pending dan accepted dihitung aktif."
            />
            <ThesisQuotaMeter
              label="Kuota Pembimbing Disetujui"
              value={supervisors.length}
              max={2}
              helperText="Backend hanya mengizinkan maksimal 2 dosen pembimbing."
            />
          </div>

          {thesis ? (
            <ThesisSectionCard
              title="Pengajuan TA Aktif"
              description="Status proposal tugas akhir yang sedang terdaftar pada akun Anda."
              actions={
                <Button variant="outline" asChild>
                  <Link href="/bimbingan-ta/mahasiswa/pengajuan">Buka Detail</Link>
                </Button>
              }
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-[#015023]">{thesis.title_ind}</h3>
                    <p className="text-sm text-gray-600">{thesis.title_eng || '-'}</p>
                  </div>
                  <ThesisStatusBadge status={thesis.status} />
                </div>
                <ThesisKeyValueList
                  items={[
                    { label: 'Topik', value: thesis.topic || thesis.thesis_topic?.topic || '-' },
                    { label: 'Program Studi', value: thesis.program?.name || '-' },
                    { label: 'Dibuat', value: formatDate(thesis.created_at) },
                    { label: 'Terakhir Diubah', value: formatDate(thesis.updated_at) },
                  ]}
                />
                <p className="text-sm leading-7 text-gray-700">{thesis.description || 'Tidak ada deskripsi.'}</p>
                <ThesisAttachmentLink path={thesis.attachment_proposal} label="Buka proposal" />
              </div>
            </ThesisSectionCard>
          ) : (
            <ThesisEmptyState
              title="Belum ada pengajuan TA"
              description="Anda dapat membuat pengajuan mandiri atau memilih salah satu topik yang dipublikasikan dosen."
            />
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <ThesisSectionCard
              title="Pembimbing"
              description="Dosen yang sudah menerima bimbingan Anda."
              actions={
                <Button variant="outline" asChild>
                  <Link href="/bimbingan-ta/mahasiswa/monitoring">Monitoring</Link>
                </Button>
              }
            >
              <div className="space-y-3">
                {supervisors.length === 0 ? (
                  <p className="text-sm text-gray-500">Belum ada dosen pembimbing yang disetujui.</p>
                ) : (
                  supervisors.map((supervisor) => (
                    <div key={supervisor.id_supervisor} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <p className="font-semibold text-[#015023]">
                        {supervisor.lecturer?.name || `Dosen #${supervisor.id_lecturer}`}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        Konsultasi tercatat: {supervisor.consultations?.length || 0}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </ThesisSectionCard>

            <ThesisSectionCard
              title="Konsultasi Terbaru"
              description="Catatan konsultasi dari semua pembimbing."
              actions={
                <Button variant="outline" asChild>
                  <Link href="/bimbingan-ta/mahasiswa/monitoring">Lihat Semua</Link>
                </Button>
              }
            >
              <div className="space-y-3">
                {recentConsultations.length === 0 ? (
                  <p className="text-sm text-gray-500">Belum ada konsultasi yang tercatat.</p>
                ) : (
                  recentConsultations.map((consultation) => (
                    <div key={consultation.id_consultation} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-[#015023]">{consultation.subject}</p>
                        <ThesisStatusBadge status={consultation.status} />
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {formatDate(consultation.consultation_date)} •{' '}
                        {consultation.supervisor?.lecturer?.name || 'Pembimbing'}
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
