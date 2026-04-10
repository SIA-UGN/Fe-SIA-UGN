'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import { AdminThesisShell } from '@/features/bimbingan-ta/components/ThesisShell';
import ThesisAttachmentLink from '@/features/bimbingan-ta/components/ThesisAttachmentLink';
import ThesisKeyValueList from '@/features/bimbingan-ta/components/ThesisKeyValueList';
import ThesisLoadingBlock from '@/features/bimbingan-ta/components/ThesisLoadingBlock';
import ThesisSectionCard from '@/features/bimbingan-ta/components/ThesisSectionCard';
import ThesisStatusBadge from '@/features/bimbingan-ta/components/ThesisStatusBadge';
import { adminThesisApi } from '@/features/bimbingan-ta/api/admin';
import type { StudentThesis } from '@/features/bimbingan-ta/types';

export default function AdminThesisStudentDetailPage() {
  const params = useParams<{ id: string }>();
  const [thesis, setThesis] = useState<StudentThesis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminThesisApi.getStudentDetail(Number(params.id));
      setThesis(data);
    } catch (err: any) {
      setError(err?.userMessage || err?.message || 'Gagal memuat detail pengajuan TA.');
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <AdminThesisShell title="Detail Pengajuan TA" description="Detail lengkap proposal, riwayat permintaan, pembimbing, dan konsultasi." backHref="/adminpage/thesis/students">
      {isLoading ? (
        <ThesisLoadingBlock />
      ) : error ? (
        <ErrorMessageBoxWithButton message={error} action={fetchData} />
      ) : thesis ? (
        <div className="space-y-6">
          <ThesisSectionCard title={thesis.title_ind} description={thesis.title_eng || '-'} actions={<ThesisStatusBadge status={thesis.status} />}>
            <div className="space-y-4">
              <ThesisKeyValueList
                items={[
                  { label: 'Mahasiswa', value: thesis.student?.name || '-' },
                  { label: 'Email', value: thesis.student?.email || '-' },
                  { label: 'Program Studi', value: thesis.program?.name || '-' },
                  { label: 'Topik Dosen', value: thesis.thesis_topic?.title_ind || '-' },
                ]}
              />
              <p className="text-sm leading-7 text-gray-700">{thesis.description || 'Tidak ada deskripsi.'}</p>
              <ThesisAttachmentLink path={thesis.attachment_proposal} label="Buka proposal" />
            </div>
          </ThesisSectionCard>

          <div className="grid gap-6 lg:grid-cols-2">
            <ThesisSectionCard title="Riwayat Permintaan" description="Status permintaan pembimbing mahasiswa.">
              <div className="space-y-3">
                {thesis.thesis_lecturers?.length ? (
                  thesis.thesis_lecturers.map((request) => (
                    <div key={request.id_thesis_lecturer} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="font-semibold text-[#015023]">{request.lecturer?.name || 'Dosen'}</p>
                        <ThesisStatusBadge status={request.status} />
                      </div>
                      {request.student_note ? <p className="mt-2 text-sm text-gray-600">Catatan: {request.student_note}</p> : null}
                      {request.rejection_note ? <p className="mt-2 text-sm text-red-600">Penolakan: {request.rejection_note}</p> : null}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Tidak ada riwayat permintaan pembimbing.</p>
                )}
              </div>
            </ThesisSectionCard>

            <ThesisSectionCard title="Pembimbing dan Konsultasi" description="Dosen pembimbing aktif dan ringkasan konsultasi.">
              <div className="space-y-3">
                {thesis.supervisors?.length ? (
                  thesis.supervisors.map((supervisor) => (
                    <div key={supervisor.id_supervisor} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <p className="font-semibold text-[#015023]">{supervisor.lecturer?.name || 'Dosen'}</p>
                      <p className="mt-1 text-sm text-gray-600">Konsultasi: {supervisor.consultations?.length || 0}</p>
                      <div className="mt-2 space-y-2">
                        {(supervisor.consultations || []).map((consultation) => (
                          <div key={consultation.id_consultation} className="rounded-xl bg-white px-3 py-2 text-sm text-gray-700">
                            {consultation.subject} • {consultation.consultation_date} • {consultation.status}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Belum ada data pembimbing.</p>
                )}
              </div>
            </ThesisSectionCard>
          </div>
        </div>
      ) : null}
    </AdminThesisShell>
  );
}
