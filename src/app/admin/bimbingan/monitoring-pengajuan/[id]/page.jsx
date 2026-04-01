'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Calendar,
  CalendarDays,
  Clock3,
  FileText,
  MessageSquare,
  SquareLibrary,
  UserRound,
} from 'lucide-react';
import api from '@/lib/axios';
import AdminBimbinganShell from '@/components/admin/admin-bimbingan-shell';
import ProgressStepper from '@/components/admin/progress-stepper';
import StatusBadge from '@/components/admin/status-badge';
import {
  extractErrorMessage,
  flattenConsultations,
  formatDate,
  formatDateTime,
  formatThesisId,
  getAttachmentUrl,
  getInitials,
  getStudentIpk,
  getStudentNim,
  getStudentSemester,
  parseApiPayload,
} from '@/features/admin-bimbingan/utils';

const STEPS = [
  { label: 'Pengajuan', sub: 'Mahasiswa mengajukan judul' },
  { label: 'Review Dosen', sub: 'Dosen meninjau pengajuan' },
  { label: 'Penetapan Pembimbing', sub: 'Dosen pembimbing ditetapkan' },
  { label: 'Bimbingan Aktif', sub: 'Proses bimbingan berlangsung' },
  { label: 'Sidang TA', sub: 'Siap untuk sidang' },
];

function getCurrentStep(status) {
  if (status === 'proposing') return 1;
  if (status === 'on_progress') return 3;
  if (status === 'revision') return 4;
  if (status === 'finished') return 5;
  return 1;
}

function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="mb-3 text-[#d1d5db]">{icon}</div>
      <p className="text-[13px] font-medium text-[#9ca3af]">{title}</p>
      {subtitle ? <p className="mt-1 text-[11px] text-[#c0c4cc]">{subtitle}</p> : null}
    </div>
  );
}

export default function MonitoringPengajuanDetailPage() {
  const params = useParams();
  const [thesis, setThesis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      setLoading(true);
      setErrorMessage('');

      try {
        const response = await api.get(`/admin/thesis/students/${params.id}`);
        const payload = parseApiPayload(response);
        if (!isMounted) return;
        setThesis(payload || null);
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(
          extractErrorMessage(error, 'Detail pengajuan tidak dapat dimuat. Silakan coba kembali.')
        );
        setThesis(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [params.id]);

  const consultations = useMemo(() => flattenConsultations(thesis?.supervisors), [thesis?.supervisors]);
  const currentStep = getCurrentStep(thesis?.status);
  const proposalUrl = getAttachmentUrl(thesis?.attachment_proposal);
  const proposalFileName = thesis?.attachment_proposal
    ? String(thesis.attachment_proposal).split('/').pop()
    : '';
  const ipkValue = getStudentIpk(thesis);

  return (
    <AdminBimbinganShell
      backHref="/admin/bimbingan/monitoring-pengajuan"
      backLabel="Monitoring Pengajuan TA"
      title="Monitoring Pengajuan TA"
      description="Pantau status pengajuan judul tugas akhir seluruh mahasiswa"
    >
      {loading ? <div className="h-[420px] animate-pulse rounded-[16px] bg-gray-100" /> : null}

      {!loading && thesis ? (
        <>
          <section className="overflow-hidden rounded-[14px] bg-[linear-gradient(173deg,#015023_0%,#013d1c_100%)] shadow-sm">
            <div className="flex flex-col gap-4 border-b border-white/10 p-5 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-4">
                <span className="flex h-[56px] w-[56px] items-center justify-center rounded-[16px] bg-[#dabc4e] text-[17px] font-bold text-white">
                  {getInitials(thesis?.student?.name, 'MH')}
                </span>

                <div>
                  <h2 className="text-[28px] font-bold text-white">{thesis?.student?.name || '-'}</h2>
                  <p className="mt-1 text-[14px] text-white/80">
                    {getStudentNim(thesis)} · {thesis?.program?.name || 'Program Studi'} · Semester{' '}
                    {getStudentSemester(thesis)}
                  </p>
                  <p className="mt-1 text-[13px] text-white/60">{thesis?.student?.email || '-'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <StatusBadge status={thesis?.status} />
                <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-white">
                  IPK {ipkValue !== null ? ipkValue.toFixed(2) : '–'}
                </span>
              </div>
            </div>

            <div className="p-5">
              <p className="text-[11px] uppercase tracking-[0.08em] text-white/60">Judul Tugas Akhir</p>
              <p className="mt-2 text-[18px] font-bold text-white">{thesis?.title_ind || '-'}</p>
              <p className="mt-1 text-[14px] italic text-white/70">{thesis?.title_eng || '-'}</p>
            </div>
          </section>

          <section className="rounded-[14px] bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-[14px] font-semibold text-[#111827]">Progress Bimbingan</h3>
            <ProgressStepper currentStep={currentStep} steps={STEPS} />
          </section>

          <section className="rounded-[14px] bg-white p-5 shadow-sm">
            <h3 className="text-[16px] font-semibold text-[#1f2937]">Deskripsi Penelitian</h3>
            <p className="mt-3 text-[14px] leading-7 text-[#4a5565]">
              {thesis?.description || 'Deskripsi penelitian belum tersedia.'}
            </p>
          </section>

          <section className="rounded-[14px] bg-white p-5 shadow-sm">
            <h3 className="inline-flex items-center gap-2 text-[16px] font-semibold text-[#1f2937]">
              <MessageSquare className="h-4 w-4 text-[#015023]" />
              Catatan Bimbingan
            </h3>

            {consultations.length ? (
              <div className="mt-4 space-y-3">
                {consultations.map((consultation) => (
                  <div key={consultation.id_consultation} className="rounded-[12px] border border-[#f0f2f4] bg-[#f9fafb] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-[13px] font-semibold text-[#111827]">{consultation.subject || '-'}</p>
                        <p className="mt-0.5 text-[11px] text-[#9ca3af]">
                          {formatDateTime(consultation.consultation_date)} · {consultation.lecturer_name}
                        </p>
                      </div>
                      <StatusBadge status={consultation.status} />
                    </div>
                    <p className="mt-2 text-[13px] text-[#4b5563]">
                      {consultation.lecturer_notes || consultation.student_notes || 'Belum ada catatan detail.'}
                    </p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e5e7eb]">
                      <div
                        className="h-full rounded-full bg-[#015023]"
                        style={{ width: `${Math.min(Math.max(consultation.progress || 0, 0), 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<MessageSquare className="h-6 w-6" />}
                title="Belum ada catatan bimbingan"
              />
            )}
          </section>

          <section className="rounded-[14px] bg-white p-5 shadow-sm">
            <h3 className="text-[16px] font-semibold text-[#1f2937]">Info Pengajuan</h3>

            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <div className="space-y-3 text-[13px] text-[#4b5563]">
                <p className="inline-flex items-center gap-2">
                  <SquareLibrary className="h-4 w-4 text-[#9ca3af]" />
                  <span className="font-medium text-[#111827]">ID Pengajuan:</span>{' '}
                  {formatThesisId(thesis?.id_student_thesis, thesis?.created_at)}
                </p>
                <p className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#9ca3af]" />
                  <span className="font-medium text-[#111827]">Tanggal Pengajuan:</span>{' '}
                  {formatDate(thesis?.created_at)}
                </p>
              </div>

              <div className="space-y-3 text-[13px] text-[#4b5563]">
                <p className="inline-flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-[#9ca3af]" />
                  <span className="font-medium text-[#111827]">Program Studi:</span>{' '}
                  {thesis?.program?.name || '-'}
                </p>
                <p className="inline-flex items-center gap-2">
                  <SquareLibrary className="h-4 w-4 text-[#9ca3af]" />
                  <span className="font-medium text-[#111827]">Semester:</span>{' '}
                  {getStudentSemester(thesis)}
                </p>
              </div>
            </div>

            <div className="mt-5 border-t border-[#f3f4f6] pt-4">
              <p className="mb-2 text-[12px] font-medium text-[#6b7280]">Dokumen Proposal</p>

              {proposalUrl ? (
                <Link
                  href={proposalUrl}
                  target="_blank"
                  className="flex items-center justify-between rounded-[10px] border border-[#eceff3] bg-[#f9fafb] px-3 py-2 transition hover:bg-[#f3f4f6]"
                >
                  <span className="inline-flex items-center gap-2 text-[13px] text-[#374151]">
                    <FileText className="h-4 w-4 text-[#d97706]" />
                    {proposalFileName || 'Dokumen proposal'}
                  </span>
                  <span className="text-[11px] font-semibold text-[#015023]">Download</span>
                </Link>
              ) : (
                <p className="text-[13px] text-[#9ca3af]">Tidak ada dokumen proposal</p>
              )}
            </div>
          </section>

          <section className="rounded-[14px] bg-white p-5 shadow-sm">
            <h3 className="text-[16px] font-semibold text-[#1f2937]">Dosen Pembimbing</h3>

            {thesis?.supervisors?.length ? (
              <div className="mt-4 space-y-3">
                {thesis.supervisors.map((supervisor) => (
                  <div
                    key={supervisor.id_supervisor}
                    className="flex items-center gap-3 rounded-[12px] border border-[#f0f2f4] p-3"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#015023] text-[11px] font-semibold text-white">
                      {getInitials(supervisor?.lecturer?.name, 'DS')}
                    </span>
                    <div>
                      <p className="text-[13px] font-semibold text-[#111827]">
                        {supervisor?.lecturer?.name || 'Dosen Pembimbing'}
                      </p>
                      <p className="text-[12px] text-[#9ca3af]">{supervisor?.lecturer?.email || '-'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<UserRound className="h-6 w-6" />}
                title="Belum ada dosen pembimbing"
                subtitle="Menunggu approval pengajuan"
              />
            )}
          </section>

          <section className="rounded-[14px] bg-white p-5 shadow-sm">
            <h3 className="inline-flex items-center gap-2 text-[16px] font-semibold text-[#1f2937]">
              <CalendarDays className="h-4 w-4 text-[#015023]" />
              Jadwal Bimbingan
            </h3>

            {consultations.length ? (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-[720px] w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-[#eceff3] text-left text-[#6b7280]">
                      <th className="px-2 py-2">Tanggal</th>
                      <th className="px-2 py-2">Waktu</th>
                      <th className="px-2 py-2">Tempat</th>
                      <th className="px-2 py-2">Topik</th>
                      <th className="px-2 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultations.map((consultation) => (
                      <tr key={`schedule-${consultation.id_consultation}`} className="border-b border-[#f3f4f6]">
                        <td className="px-2 py-3">{formatDate(consultation.consultation_date)}</td>
                        <td className="px-2 py-3">
                          <span className="inline-flex items-center gap-1">
                            <Clock3 className="h-3.5 w-3.5 text-[#9ca3af]" />
                            {consultation.start_time || '-'}
                            {consultation.end_time ? ` - ${consultation.end_time}` : ''}
                          </span>
                        </td>
                        <td className="px-2 py-3">{consultation.location || '-'}</td>
                        <td className="px-2 py-3">{consultation.subject || '-'}</td>
                        <td className="px-2 py-3">
                          <StatusBadge status={consultation.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState icon={<CalendarDays className="h-6 w-6" />} title="Belum ada jadwal" />
            )}
          </section>
        </>
      ) : null}

      {!loading && !thesis ? (
        <section className="rounded-[14px] border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#991b1b]">
          {errorMessage || 'Detail pengajuan tidak ditemukan.'}
        </section>
      ) : null}
    </AdminBimbinganShell>
  );
}
