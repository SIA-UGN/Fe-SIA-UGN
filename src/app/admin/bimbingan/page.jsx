'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  Clock3,
  GraduationCap,
  SearchCheck,
  UserRound,
  UserRoundCheck,
  Users,
} from 'lucide-react';
import api from '@/lib/axios';
import AdminBimbinganShell from '@/components/admin/admin-bimbingan-shell';
import StatBanner from '@/components/admin/stat-banner';
import SummaryCard from '@/components/admin/summary-card';
import StatusBadge from '@/components/admin/status-badge';
import {
  extractErrorMessage,
  formatDate,
  getAvatarColor,
  getInitials,
  parseApiPayload,
  parsePaginatedPayload,
  toNumber,
} from '@/features/admin-bimbingan/utils';

const emptyDashboard = {
  thesis_by_status: {
    proposing: 0,
    on_progress: 0,
    revision: 0,
    finished: 0,
    ditolak: 0,
  },
  total_thesis: 0,
  total_topics: 0,
  total_supervisors: 0,
};

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-[142px] animate-pulse rounded-[16px] bg-gray-100" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-[148px] animate-pulse rounded-[16px] bg-gray-100" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="h-[98px] animate-pulse rounded-[14px] bg-gray-100" />
        ))}
      </div>
      <div className="h-[320px] animate-pulse rounded-[14px] bg-gray-100" />
    </div>
  );
}

function QuickActionCard({ href, title, subtitle, icon, iconBg }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-[14px] bg-white p-6 shadow-sm transition hover:shadow-md"
    >
      <span
        className="flex h-12 w-12 items-center justify-center rounded-[12px] text-[#015023]"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </span>
      <span className="flex-1">
        <span className="block text-[15px] font-semibold text-[#1f2937]">{title}</span>
        <span className="mt-1 block text-[12px] text-[#6a7282]">{subtitle}</span>
      </span>
      <ArrowRight className="h-4 w-4 text-[#015023] transition group-hover:translate-x-0.5" />
    </Link>
  );
}

export default function AdminBimbinganDashboardPage() {
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      setLoading(true);
      setErrorMessage('');

      const [dashboardRes, studentsRes] = await Promise.allSettled([
        api.get('/admin/thesis/dashboard'),
        api.get('/admin/thesis/students', { params: { per_page: 5 } }),
      ]);

      if (!isMounted) return;

      if (dashboardRes.status === 'fulfilled') {
        const payload = parseApiPayload(dashboardRes.value) || {};
        const thesisByStatus = payload.thesis_by_status || {};

        setDashboard({
          thesis_by_status: {
            proposing: toNumber(thesisByStatus.proposing),
            on_progress: toNumber(thesisByStatus.on_progress),
            revision: toNumber(thesisByStatus.revision),
            finished: toNumber(thesisByStatus.finished),
            ditolak: toNumber(thesisByStatus.ditolak ?? thesisByStatus.rejected),
          },
          total_thesis: toNumber(payload.total_thesis),
          total_topics: toNumber(payload.total_topics),
          total_supervisors: toNumber(payload.total_supervisors),
        });
      } else {
        setDashboard(emptyDashboard);
      }

      if (studentsRes.status === 'fulfilled') {
        const paginated = parsePaginatedPayload(studentsRes.value);
        setStudents(paginated.data.slice(0, 5));
      } else {
        setStudents([]);
      }

      if (dashboardRes.status === 'rejected' && studentsRes.status === 'rejected') {
        setErrorMessage(
          extractErrorMessage(dashboardRes.reason, 'Data dashboard bimbingan tidak dapat dimuat.')
        );
      }

      setLoading(false);
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const approvedCount = useMemo(
    () => dashboard.thesis_by_status.on_progress + dashboard.thesis_by_status.finished,
    [dashboard]
  );

  const monitoringCount = useMemo(
    () =>
      dashboard.thesis_by_status.on_progress +
      dashboard.thesis_by_status.revision +
      dashboard.thesis_by_status.finished,
    [dashboard]
  );

  return (
    <AdminBimbinganShell
      backHref="/adminpage"
      backLabel="Kembali ke Dashboard"
      title="Dashboard Bimbingan"
      description="Ringkasan data dan aktivitas modul bimbingan tugas akhir"
    >
      {loading ? <DashboardSkeleton /> : null}

      {!loading ? (
        <>
          <StatBanner
            total={dashboard.total_thesis}
            totalLabel="Total Pengajuan TA"
            totalSubLabel="Pengajuan tercatat"
            breakdown={[
              { label: 'Approved', value: approvedCount, color: '#10b981' },
              { label: 'Menunggu', value: dashboard.thesis_by_status.proposing, color: '#f59e0b' },
              { label: 'Ditolak', value: dashboard.thesis_by_status.ditolak, color: '#ef4444' },
            ]}
            icon={<BookOpen className="h-8 w-8" strokeWidth={2.25} />}
          />

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              icon={<Clock3 className="h-5 w-5 text-[#dabc4e]" />}
              iconBg="#fff3cd"
              label="Pengajuan TA Baru"
              value={dashboard.thesis_by_status.proposing}
              sub="Menunggu approval"
              valueColor="#dabc4e"
            />
            <SummaryCard
              icon={<BookOpen className="h-5 w-5 text-[#015023]" />}
              iconBg="#e6f4ea"
              label="Total Judul TA"
              value={dashboard.total_topics}
              sub="Terdaftar di sistem"
              valueColor="#015023"
            />
            <SummaryCard
              icon={<Users className="h-5 w-5 text-[#1e40af]" />}
              iconBg="#dbeafe"
              label="Dosen Pembimbing Aktif"
              value={dashboard.total_supervisors}
              sub="Dosen aktif bimbingan"
              valueColor="#1e40af"
            />
            <SummaryCard
              icon={<GraduationCap className="h-5 w-5 text-[#7e22ce]" />}
              iconBg="#f3e8ff"
              label="Mahasiswa Monitoring"
              value={monitoringCount}
              sub="Dalam proses bimbingan"
              valueColor="#7e22ce"
            />
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <QuickActionCard
              href="/admin/bimbingan/kelola-data-user"
              title="Kelola Data User"
              subtitle="Kelola data mahasiswa dan dosen"
              icon={<UserRound className="h-5 w-5" />}
              iconBg="rgba(1,80,35,0.08)"
            />
            <QuickActionCard
              href="/admin/bimbingan/monitoring-pengajuan"
              title="Monitoring Pengajuan"
              subtitle="Pantau status pengajuan TA"
              icon={<SearchCheck className="h-5 w-5" />}
              iconBg="rgba(133,100,4,0.08)"
            />
          </section>

          <section className="rounded-[14px] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#f3f4f6] px-5 py-4">
              <h2 className="text-[20px] font-bold text-[#015023]">Pengajuan TA Terbaru</h2>
              <Link
                href="/admin/bimbingan/semua-pengajuan"
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#015023]"
              >
                Lihat semua
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {students.length === 0 ? (
              <p className="px-5 py-8 text-sm text-[#6b7280]">Belum ada pengajuan terbaru.</p>
            ) : (
              <div className="divide-y divide-[#f3f4f6]">
                {students.map((student) => {
                  const lecturerRequestStatus = student?.thesis_lecturers?.[0]?.status;
                  const supervisor = student?.supervisors?.[0]?.lecturer?.name;

                  return (
                    <Link
                      key={student.id_student_thesis}
                      href={`/admin/bimbingan/monitoring-pengajuan/${student.id_student_thesis}`}
                      className="group flex flex-col gap-3 px-5 py-4 transition hover:bg-[#f8fbf9] md:flex-row md:items-center"
                    >
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        <span
                          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                          style={{ backgroundColor: getAvatarColor(student?.student?.name) }}
                        >
                          {getInitials(student?.student?.name, 'MH')}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14px] font-semibold text-[#1f2937]">
                            {student?.student?.name || 'Mahasiswa'}
                          </p>
                          <p className="mt-0.5 text-[11px] text-[#9ca3af]">
                            {(student?.student?.username || 'NIM tidak tersedia')} · {formatDate(student?.created_at)}
                          </p>
                          <p className="mt-2 text-[13px] text-[#4a5565]">{student?.title_ind || '-'}</p>
                          <p className="mt-1 text-[11px] text-[#9ca3af]">
                            {supervisor ? `Pembimbing: ${supervisor}` : 'Belum ada pembimbing'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 md:justify-end">
                        <StatusBadge status={lecturerRequestStatus || student?.status} />
                        <ArrowRight className="h-4 w-4 text-[#015023] transition group-hover:translate-x-0.5" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {errorMessage ? (
            <section className="rounded-[14px] border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#991b1b]">
              {errorMessage}
            </section>
          ) : null}
        </>
      ) : null}
    </AdminBimbinganShell>
  );
}
