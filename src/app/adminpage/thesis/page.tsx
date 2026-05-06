'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import { AdminThesisShell } from '@/features/bimbingan-ta/components/ThesisShell';
import ThesisLoadingBlock from '@/features/bimbingan-ta/components/ThesisLoadingBlock';
import ThesisSectionCard from '@/features/bimbingan-ta/components/ThesisSectionCard';
import ThesisStatusBadge from '@/features/bimbingan-ta/components/ThesisStatusBadge';
import ThesisSummaryCard from '@/features/bimbingan-ta/components/ThesisSummaryCard';
import { adminThesisApi } from '@/features/bimbingan-ta/api/admin';
import type { StudentThesis, ThesisDashboardStats } from '@/features/bimbingan-ta/types';
import { formatDate } from '@/features/bimbingan-ta/utils';
import StatCard from '@/components/ui/StatCard';
import { ArrowRight, BookOpen, CheckCircle2, ClipboardCheck, ClipboardList, Clock, GraduationCap, Users, XCircle } from 'lucide-react';
import InfoCard from '@/components/ui/info-card';
import ActionCard from '@/components/ui/actioncard';

const emptyStats: ThesisDashboardStats = {
  thesis_by_status: { proposing: 0, on_progress: 0, revision: 0, finished: 0 },
  total_thesis: 0,
  topics_by_status: { draft: 0, available: 0, taken: 0, archived: 0 },
  total_topics: 0,
  total_supervisors: 0,
  consultations_by_status: {},
  total_consultations: 0,
};

export default function AdminThesisDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<ThesisDashboardStats>(emptyStats);
  const [recentStudents, setRecentStudents] = useState<StudentThesis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setWarning(null);

    try {
      const [dashboardResult, studentsResult] = await Promise.allSettled([
        adminThesisApi.getDashboard(),
        adminThesisApi.getStudents({ per_page: 5, page: 1 }),
      ]);

      if (dashboardResult.status === 'fulfilled') {
        setStats(dashboardResult.value);
      } else {
        setStats(emptyStats);
      }

      if (studentsResult.status === 'fulfilled') {
        setRecentStudents(studentsResult.value.data || []);
      } else {
        setRecentStudents([]);
      }

      if (dashboardResult.status === 'rejected' && studentsResult.status === 'rejected') {
        const dashboardError = dashboardResult.reason as any;
        const studentError = studentsResult.reason as any;
        setError(
          dashboardError?.userMessage ||
            studentError?.userMessage ||
            dashboardError?.message ||
            studentError?.message ||
            'Gagal memuat dashboard Bimbingan TA.'
        );
      } else if (dashboardResult.status === 'rejected' || studentsResult.status === 'rejected') {
        setWarning('Sebagian data belum berhasil dimuat. Silakan muat ulang untuk mencoba lagi.');
      }
    } catch (err: any) {
      setError(err?.userMessage || err?.message || 'Gagal memuat dashboard Bimbingan TA.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <AdminThesisShell
      title="Manajemen Bimbingan TA"
      description="Dashboard rekapitulasi pengajuan tugas akhir, topik dosen, pembimbing, dan konsultasi."
      backHref="/adminpage"
    >
      <div className="mb-6">
        <StatCard
          title="Total Pengajuan TA"
          total={stats.total_thesis || 0}
          subText="Pengajuan tercatat"
          statuses={[
            { label: 'Selesai', value: stats.thesis_by_status.finished || 0, icon: CheckCircle2, color: '#22C55E' },
            { label: 'Menunggu', value: stats.thesis_by_status.on_progress || 0, icon: Clock, color: '#F59E0B' },
            { label: 'Ditolak', value: stats.thesis_by_status.revision || 0, icon: XCircle, color: '#EF4444' },
          ]}
          isLoading={isLoading}
          MainIcon={GraduationCap}
        />
      </div>

      {/* Loading Block */}
      {isLoading ? (
        <ThesisLoadingBlock />
      ) : error ? (
        <ErrorMessageBoxWithButton message={error} action={fetchData} />
      ) : (
        <div className="min-h-screen bg-[#f3f6f4] p-6 rounded-2xl">
          {warning ? (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {warning}
            </div>
          ) : null}

          {/* Info Card */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 md:gap-6">
            <InfoCard
              title="Pengajuan TA Baru"
              value={stats.thesis_by_status?.proposing || 0}
              subtitle="Menunggu approval"
              Icon={ClipboardList}
              theme="yellow"
              variant='vertikal'
            />
            <InfoCard
              title="Total Judul TA"
              value={stats.total_topics || 0}
              subtitle="Topik terdaftar di sistem"
              Icon={BookOpen}
              theme="green"
              variant='vertikal'
            />
            <InfoCard
              title="Dosen Pembimbing Aktif"
              value={stats.total_supervisors || 0}
              subtitle="Dosen aktif bimbingan"
              Icon={Users}
              theme="blue"
              variant='vertikal'
            />
            <InfoCard
              title="Total Konsultasi"
              value={stats.total_consultations || 0}
              subtitle="Catatan proses bimbingan"
              Icon={GraduationCap}
              theme="purple"
              variant='vertikal'
            />
          </div>

          {/* Action Card */}
          <div className="grid grid-cols-1 gap-4 py-6 md:grid-cols-2 lg:gap-6">
            <ActionCard
              title="Kelola Data User"
              description="kelola data mahasiswa dan dosen"
              Icon={Users}
              href="/adminpage/thesis/users"
              theme="green"
            />
            <ActionCard
              title="monitoring Pengajuan"
              description="Pantau status pengatuan TA"
              Icon={ClipboardCheck}
              href="/adminpage/thesis/consultations"
              theme="yellow"
            />
          </div>

          {/* Pengajuan TA Terbaru */}
          <ThesisSectionCard
            title="Pengajuan TA Terbaru"
            description="Data terbaru diambil langsung dari endpoint backend /admin/thesis/students."
            actions={(
              <Button asChild variant="outline" size="sm">
                <Link href="/adminpage/thesis/students">Lihat semua</Link>
              </Button>
            )}
          >
            <div className="space-y-3">
              {recentStudents.length === 0 ? (
                <p className="text-sm text-gray-500">Belum ada data pengajuan terbaru.</p>
              ) : (
                recentStudents.map((item) => (
                  <Link
                    key={item.id_student_thesis}
                    href={`/adminpage/thesis/students/${item.id_student_thesis}`}
                    className="group flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-[#015023]/20 hover:bg-white md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-[#015023]">
                        {item.title_ind || 'Judul belum tersedia'}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        {item.student?.name || 'Mahasiswa'} · {item.program?.name || 'Program belum tersedia'}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        Diperbarui {formatDate(item.updated_at || item.created_at)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <ThesisStatusBadge status={item.status} />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          router.push(`/adminpage/thesis/consultations/${item.id_student_thesis}`);
                        }}
                        className="inline-flex items-center gap-1 text-sm font-medium text-[#015023]"
                      >
                        Detail
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                      </button>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </ThesisSectionCard>
        </div>
      )}
    </AdminThesisShell>
  );
}
