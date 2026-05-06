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
  const [loading, setLoading] = useState(true);
  const [supervisees, setSupervisees] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [selectedSupervisorId, setSelectedSupervisorId] = useState(null);

  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [noteForm, setNoteForm] = useState(DEFAULT_NOTE_FORM);
  const [scheduleForm, setScheduleForm] = useState(DEFAULT_SCHEDULE_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

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

    return supervisees.filter((item) => {
      const studentName = item?.student_thesis?.student?.name || '';
      const nim = item?.student_thesis?.student?.username || '';
      const title = item?.student_thesis?.title_ind || '';
      return [studentName, nim, title].some((value) =>
        String(value).toLowerCase().includes(query),
      );
    });
  }, [searchInput, supervisees]);

  const selectedSupervisee = useMemo(() => {
    return (
      supervisees.find((item) => Number(item.id_supervisor) === Number(selectedSupervisorId)) ||
      null
    );
  }, [selectedSupervisorId, supervisees]);

  const consultationTimeline = useMemo(() => {
    if (!selectedSupervisee?.consultations) return [];
    return [...selectedSupervisee.consultations].sort((a, b) => {
      const aTime = new Date(`${a.consultation_date || ''}T${String(a.start_time || '00:00').slice(0, 5)}`).getTime();
      const bTime = new Date(`${b.consultation_date || ''}T${String(b.start_time || '00:00').slice(0, 5)}`).getTime();
      return bTime - aTime;
    });
  }, [selectedSupervisee]);

  const consultationSchedules = useMemo(() => {
    if (!selectedSupervisee?.consultations) return [];
    return [...selectedSupervisee.consultations].sort((a, b) => {
      const aTime = new Date(`${a.consultation_date || ''}T${String(a.start_time || '00:00').slice(0, 5)}`).getTime();
      const bTime = new Date(`${b.consultation_date || ''}T${String(b.start_time || '00:00').slice(0, 5)}`).getTime();
      return aTime - bTime;
    });
  }, [selectedSupervisee]);

  const selectedProgress = useMemo(
    () => getLatestProgress(selectedSupervisee),
    [selectedSupervisee],
  );

  const closeNoteModal = () => {
    setNoteModalOpen(false);
    setNoteForm(DEFAULT_NOTE_FORM);
    setFormErrors({});
  };

  const closeScheduleModal = () => {
    setScheduleModalOpen(false);
    setScheduleForm(DEFAULT_SCHEDULE_FORM);
    setFormErrors({});
  };

  const submitNote = async (event) => {
    event.preventDefault();
    if (!selectedSupervisee) return;

    const nextErrors: Record<string, string> = {};
    if (!noteForm.subject.trim()) nextErrors.subject = 'Topik pembahasan wajib diisi';
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const formData = new FormData();
    formData.append('id_supervisor', String(selectedSupervisee.id_supervisor));
    formData.append('consultation_date', toIsoDate(new Date()));
    formData.append('subject', noteForm.subject.trim());
    formData.append('lecturer_notes', noteForm.lecturer_notes.trim());
    formData.append('next_task', noteForm.next_task.trim());
    formData.append('progress', String(selectedProgress));
    formData.append('status', 'on_going');

    try {
      setSubmitting(true);
      await api.post('/lecturer/thesis/consultations', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Catatan berhasil ditambahkan');
      closeNoteModal();
      fetchSupervisees();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal menambahkan catatan'));
    } finally {
      setSubmitting(false);
    }
  };

  const submitSchedule = async (event) => {
    event.preventDefault();
    if (!selectedSupervisee) return;

    const nextErrors: Record<string, string> = {};
    if (!scheduleForm.consultation_date) nextErrors.consultation_date = 'Tanggal wajib diisi';
    if (!scheduleForm.subject.trim()) nextErrors.schedule_subject = 'Topik pembahasan wajib diisi';
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const formData = new FormData();
    formData.append('id_supervisor', String(selectedSupervisee.id_supervisor));
    formData.append('consultation_date', scheduleForm.consultation_date);
    formData.append('subject', scheduleForm.subject.trim());
    formData.append('location', scheduleForm.location.trim());
    if (scheduleForm.start_time) formData.append('start_time', scheduleForm.start_time);
    if (scheduleForm.end_time) formData.append('end_time', scheduleForm.end_time);
    formData.append('progress', String(selectedProgress));
    formData.append('status', 'on_going');

    try {
      setSubmitting(true);
      await api.post('/lecturer/thesis/consultations', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Jadwal berhasil ditambahkan');
      closeScheduleModal();
      fetchSupervisees();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal menambahkan jadwal'));
    } finally {
      setSubmitting(false);
    }
  };

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
