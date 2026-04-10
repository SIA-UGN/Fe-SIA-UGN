'use client';

import { useEffect, useMemo, useState } from 'react';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import { Button } from '@/components/ui/button';
import { StudentThesisShell } from '@/features/bimbingan-ta/components/ThesisShell';
import ThesisSectionCard from '@/features/bimbingan-ta/components/ThesisSectionCard';
import ThesisStatusBadge from '@/features/bimbingan-ta/components/ThesisStatusBadge';
import ThesisAttachmentLink from '@/features/bimbingan-ta/components/ThesisAttachmentLink';
import ThesisLoadingBlock from '@/features/bimbingan-ta/components/ThesisLoadingBlock';
import { studentThesisApi } from '@/features/bimbingan-ta/api/student';
import { formatDate, formatTime, sortByNewest } from '@/features/bimbingan-ta/utils';
import type { Consultation, ThesisSupervisor } from '@/features/bimbingan-ta/types';

export default function MahasiswaMonitoringPage() {
  const [supervisors, setSupervisors] = useState<ThesisSupervisor[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'on_going' | 'finished'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [supervisorData, consultationData] = await Promise.all([
        studentThesisApi.getSupervisors(),
        studentThesisApi.getConsultations(),
      ]);
      setSupervisors(supervisorData);
      setConsultations(consultationData);
    } catch (err: any) {
      setError(err?.userMessage || err?.message || 'Gagal memuat monitoring bimbingan.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredConsultations = useMemo(() => {
    const items = sortByNewest(consultations);
    if (statusFilter === 'all') return items;
    return items.filter((item) => item.status === statusFilter);
  }, [consultations, statusFilter]);

  return (
    <StudentThesisShell
      title="Monitoring Bimbingan"
      description="Pantau dosen pembimbing yang sudah disetujui dan seluruh riwayat konsultasi tugas akhir."
      backHref="/bimbingan-ta/mahasiswa"
      actions={
        <div className="flex flex-wrap gap-3">
          <Button variant={statusFilter === 'all' ? 'primary' : 'outline'} onClick={() => setStatusFilter('all')}>
            Semua
          </Button>
          <Button
            variant={statusFilter === 'on_going' ? 'primary' : 'outline'}
            onClick={() => setStatusFilter('on_going')}
          >
            on_going
          </Button>
          <Button
            variant={statusFilter === 'finished' ? 'primary' : 'outline'}
            onClick={() => setStatusFilter('finished')}
          >
            finished
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
          <ThesisSectionCard title="Dosen Pembimbing" description="Dosen yang sudah menyetujui bimbingan tugas akhir Anda.">
            <div className="grid gap-4 md:grid-cols-2">
              {supervisors.length === 0 ? (
                <p className="text-sm text-gray-500">Belum ada dosen pembimbing yang disetujui.</p>
              ) : (
                supervisors.map((supervisor) => (
                  <div key={supervisor.id_supervisor} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <p className="font-semibold text-[#015023]">
                      {supervisor.lecturer?.name || `Dosen #${supervisor.id_lecturer}`}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      Total konsultasi: {supervisor.consultations?.length || 0}
                    </p>
                  </div>
                ))
              )}
            </div>
          </ThesisSectionCard>

          <ThesisSectionCard title="Riwayat Konsultasi" description="Seluruh catatan konsultasi dari semua pembimbing.">
            <div className="space-y-4">
              {filteredConsultations.length === 0 ? (
                <p className="text-sm text-gray-500">Belum ada konsultasi yang sesuai filter.</p>
              ) : (
                filteredConsultations.map((consultation) => (
                  <div key={consultation.id_consultation} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#015023]">{consultation.subject}</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(consultation.consultation_date)} • {formatTime(consultation.start_time)} -{' '}
                          {formatTime(consultation.end_time)}
                        </p>
                      </div>
                      <ThesisStatusBadge status={consultation.status} />
                    </div>
                    <div className="mt-3 grid gap-3 text-sm text-gray-700 md:grid-cols-2">
                      <p>Pembimbing: {consultation.supervisor?.lecturer?.name || '-'}</p>
                      <p>Lokasi: {consultation.location || '-'}</p>
                      <p>Catatan Mahasiswa: {consultation.student_notes || '-'}</p>
                      <p>Catatan Dosen: {consultation.lecturer_notes || '-'}</p>
                      <p>Tugas Berikutnya: {consultation.next_task || '-'}</p>
                      <p>Progress: {consultation.progress ?? 0}%</p>
                    </div>
                    <div className="mt-3">
                      <ThesisAttachmentLink path={consultation.attachment} label="Buka lampiran konsultasi" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </ThesisSectionCard>
        </div>
      )}
    </StudentThesisShell>
  );
}
