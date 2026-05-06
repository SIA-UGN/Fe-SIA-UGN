'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import { StudentThesisShell } from '@/features/bimbingan-ta/components/ThesisShell';
import ThesisLoadingBlock from '@/features/bimbingan-ta/components/ThesisLoadingBlock';
import ThesisSectionCard from '@/features/bimbingan-ta/components/ThesisSectionCard';
import ThesisStatusBadge from '@/features/bimbingan-ta/components/ThesisStatusBadge';
import { lecturerThesisApi } from '@/features/bimbingan-ta/api/lecturer';
import { formatDate } from '@/features/bimbingan-ta/utils';
import type { ThesisSupervisor } from '@/features/bimbingan-ta/types';
import TambahProgramStudiModal from '@/components/bimbingan/TambahProgramStudiModal';
import TambahKategoriTAModal from '@/components/bimbingan/TambahKategoriTAModal';

export default function DosenSuperviseesPage() {
  const [supervisees, setSupervisees] = useState<ThesisSupervisor[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await lecturerThesisApi.getSupervisees();
      setSupervisees(data);
    } catch (err: any) {
      setError(err?.userMessage || err?.message || 'Gagal memuat daftar mahasiswa bimbingan.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredSupervisees = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return supervisees;
    return supervisees.filter((supervisor) =>
      [
        supervisor.student_thesis?.student?.name,
        supervisor.student_thesis?.title_ind,
        supervisor.student_thesis?.program?.name,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [search, supervisees]);

  return (
    <StudentThesisShell title="Monitoring Bimbingan" description="Pantau mahasiswa bimbingan dan konsultasi yang sudah tercatat." backHref="/bimbingan-ta/dosen">
      {isLoading ? (
        <ThesisLoadingBlock />
      ) : error ? (
        <ErrorMessageBoxWithButton message={error} action={fetchData} />
      ) : (
        <div className="space-y-6">
          <ThesisSectionCard title="Cari Mahasiswa" description="Filter daftar bimbingan berdasarkan nama, judul, atau program studi.">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari mahasiswa bimbingan..."
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
            />
          </ThesisSectionCard>

          <div className="grid gap-4">
            {filteredSupervisees.length === 0 ? (
              <ThesisSectionCard title="Mahasiswa Bimbingan" description="Belum ada mahasiswa yang sesuai filter.">
                <p className="text-sm text-gray-500">Tidak ada data mahasiswa bimbingan.</p>
              </ThesisSectionCard>
            ) : (
              filteredSupervisees.map((supervisor) => (
                <ThesisSectionCard
                  key={supervisor.id_supervisor}
                  title={supervisor.student_thesis?.student?.name || 'Mahasiswa'}
                  description={supervisor.student_thesis?.title_ind || 'Tidak ada judul'}
                  actions={<ThesisStatusBadge status={supervisor.student_thesis?.status || 'on_progress'} />}
                >
                  <div className="space-y-4">
                    <div className="grid gap-3 text-sm text-gray-600 md:grid-cols-3">
                      <p>Program: {supervisor.student_thesis?.program?.name || '-'}</p>
                      <p>Konsultasi: {supervisor.consultations?.length || 0}</p>
                      <p>Supervisor ID: {supervisor.id_supervisor}</p>
                    </div>

                    <div className="space-y-3">
                      {(supervisor.consultations || []).map((consultation) => (
                        <div key={consultation.id_consultation} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold text-[#015023]">{consultation.subject}</p>
                              <p className="text-sm text-gray-600">{formatDate(consultation.consultation_date)}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <ThesisStatusBadge status={consultation.status} />
                              <Button variant="outline" asChild>
                                <Link href={`/bimbingan-ta/dosen/konsultasi/${consultation.id_consultation}/edit`}>Edit</Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button variant="primary" asChild>
                      <Link href={`/bimbingan-ta/dosen/konsultasi/tambah?id_supervisor=${supervisor.id_supervisor}`}>
                        Tambah Konsultasi
                      </Link>
                    </Button>
                  </div>
                </ThesisSectionCard>
              ))
            )}
          </div>
        </div>
      )}
    </StudentThesisShell>
  );
}
