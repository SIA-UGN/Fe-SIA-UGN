'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import { AdminThesisShell } from '@/features/bimbingan-ta/components/ThesisShell';
import ThesisLoadingBlock from '@/features/bimbingan-ta/components/ThesisLoadingBlock';
import ThesisSummaryCard from '@/features/bimbingan-ta/components/ThesisSummaryCard';
import ThesisSectionCard from '@/features/bimbingan-ta/components/ThesisSectionCard';
import { adminThesisApi } from '@/features/bimbingan-ta/api/admin';
import type { ThesisDashboardStats } from '@/features/bimbingan-ta/types';

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
  const [stats, setStats] = useState<ThesisDashboardStats>(emptyStats);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminThesisApi.getDashboard();
      setStats(data);
    } catch (err: any) {
      setError(err?.userMessage || err?.message || 'Gagal memuat dashboard Bimbingan TA.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <AdminThesisShell title="Manajemen Bimbingan TA" description="Dashboard rekapitulasi pengajuan tugas akhir, topik dosen, pembimbing, dan konsultasi." backHref="/adminpage">
      {isLoading ? (
        <ThesisLoadingBlock />
      ) : error ? (
        <ErrorMessageBoxWithButton message={error} action={fetchData} />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ThesisSummaryCard title="Total TA" value={stats.total_thesis} subtitle="Seluruh pengajuan mahasiswa" />
            <ThesisSummaryCard title="Total Topik" value={stats.total_topics} subtitle="Topik TA dari seluruh dosen" />
            <ThesisSummaryCard title="Total Pembimbing" value={stats.total_supervisors} subtitle="Relasi dosen-mahasiswa" />
            <ThesisSummaryCard title="Total Konsultasi" value={stats.total_consultations} subtitle="Catatan konsultasi bimbingan" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ThesisSectionCard title="Status Pengajuan TA" description="Distribusi status student thesis.">
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(stats.thesis_by_status).map(([key, value]) => (
                  <div key={key} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">{key}</p>
                    <p className="mt-1 text-2xl font-bold text-[#015023]">{value}</p>
                  </div>
                ))}
              </div>
            </ThesisSectionCard>
            <ThesisSectionCard title="Status Topik TA" description="Distribusi status topik dosen.">
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(stats.topics_by_status).map(([key, value]) => (
                  <div key={key} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">{key}</p>
                    <p className="mt-1 text-2xl font-bold text-[#015023]">{value}</p>
                  </div>
                ))}
              </div>
            </ThesisSectionCard>
          </div>

          <ThesisSectionCard title="Navigasi Cepat" description="Buka daftar detail sesuai jenis data yang ingin ditinjau.">
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" asChild>
                <Link href="/adminpage/thesis/students">Daftar Pengajuan</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/adminpage/thesis/supervisors">Daftar Pembimbing</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/adminpage/thesis/consultations">Daftar Konsultasi</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/adminpage/thesis/topics">Daftar Topik</Link>
              </Button>
            </div>
          </ThesisSectionCard>
        </div>
      )}
    </AdminThesisShell>
  );
}
