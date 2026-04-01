'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Clock3,
  GraduationCap,
  MapPin,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import BimbinganShell from '@/components/bimbingan/bimbingan-shell';

const DEFAULT_NOTE_FORM = {
  subject: '',
  lecturer_notes: '',
  next_task: '',
};

const DEFAULT_SCHEDULE_FORM = {
  consultation_date: '',
  start_time: '',
  end_time: '',
  subject: '',
  location: '',
};

function getErrorMessage(err, fallback = 'Terjadi kesalahan, coba lagi.') {
  const message = err?.response?.data?.message || err?.message;
  const errors = err?.response?.data?.errors;

  if (typeof message === 'string' && message.trim()) return message;

  if (errors && typeof errors === 'object') {
    const firstKey = Object.keys(errors)[0];
    const firstValue = errors[firstKey];
    if (Array.isArray(firstValue) && firstValue[0]) return firstValue[0];
    if (typeof firstValue === 'string') return firstValue;
  }

  return fallback;
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateShort(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(value) {
  if (!value) return '--:--';
  return String(value).slice(0, 5);
}

function getInitials(name) {
  if (!name) return 'M';
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function toIsoDate(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function getLatestProgress(supervisee) {
  const consultations = Array.isArray(supervisee?.consultations)
    ? [...supervisee.consultations]
    : [];

  if (consultations.length === 0) return 0;

  consultations.sort((a, b) => {
    const aTime = new Date(`${a.consultation_date || ''}T${String(a.start_time || '00:00').slice(0, 5)}`).getTime();
    const bTime = new Date(`${b.consultation_date || ''}T${String(b.start_time || '00:00').slice(0, 5)}`).getTime();
    return bTime - aTime;
  });

  return Math.max(0, Math.min(100, Number(consultations[0]?.progress || 0)));
}

function getScheduleStatus(item) {
  if (String(item?.status).toLowerCase() === 'finished') {
    return { label: 'Selesai', tone: 'done' };
  }

  const datePart = item?.consultation_date;
  const timePart = String(item?.start_time || '00:00').slice(0, 5);
  const value = new Date(`${datePart || ''}T${timePart}`);
  const isFuture = !Number.isNaN(value.getTime()) && value.getTime() >= Date.now();

  if (isFuture) {
    return { label: 'Akan Datang', tone: 'upcoming' };
  }

  return { label: 'Berjalan', tone: 'ongoing' };
}

function ScheduleBadge({ status }) {
  if (status.tone === 'done') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#dcfce7] px-2.5 py-1 text-[11px] font-semibold text-[#166534]">
        <span className="h-[6px] w-[6px] rounded-full bg-[#22c55e]" />
        {status.label}
      </span>
    );
  }

  if (status.tone === 'upcoming') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#fef3c7] px-2.5 py-1 text-[11px] font-semibold text-[#92400e]">
        <span className="h-[6px] w-[6px] rounded-full bg-[#f59e0b]" />
        {status.label}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#e0f2fe] px-2.5 py-1 text-[11px] font-semibold text-[#0c4a6e]">
      <span className="h-[6px] w-[6px] rounded-full bg-[#0284c7]" />
      {status.label}
    </span>
  );
}

export default function DosenSuperviseesPage() {
  const [loading, setLoading] = useState(true);
  const [supervisees, setSupervisees] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [selectedSupervisorId, setSelectedSupervisorId] = useState(null);

  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [noteForm, setNoteForm] = useState(DEFAULT_NOTE_FORM);
  const [scheduleForm, setScheduleForm] = useState(DEFAULT_SCHEDULE_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchSupervisees = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/lecturer/thesis/supervisees');
      const list = response?.data?.data || [];
      const normalized = Array.isArray(list) ? list : [];
      setSupervisees(normalized);

      if (normalized.length > 0) {
        setSelectedSupervisorId((prev) => prev || normalized[0]?.id_supervisor || null);
      } else {
        setSelectedSupervisorId(null);
      }
    } catch (err) {
      setSupervisees([]);
      setSelectedSupervisorId(null);
      toast.error(getErrorMessage(err, 'Gagal memuat data monitoring bimbingan'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSupervisees();
  }, [fetchSupervisees]);

  const filteredSupervisees = useMemo(() => {
    const query = searchInput.trim().toLowerCase();
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

    const nextErrors = {};
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

    const nextErrors = {};
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
    <BimbinganShell
      title="Monitoring Bimbingan Tugas Akhir"
      description="Kelola catatan bimbingan dan jadwal konsultasi mahasiswa bimbingan"
      breadcrumbItems={[
        { label: 'Bimbingan', href: '/bimbingan-ta/dosen/topik' },
        { label: 'Monitoring Bimbingan', active: true },
      ]}
    >
      <section className="flex flex-col gap-6 xl:flex-row" style={{ fontFamily: 'Urbanist, sans-serif' }}>
        <aside className="w-full shrink-0 xl:w-[360px]">
          <div className="rounded-[16px] bg-white p-[20px] shadow-sm">
            <h2 className="text-[22px] font-bold text-[#015023]">Mahasiswa Bimbingan</h2>

            <div className="relative mt-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6a7282]" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Cari nama/NIM..."
                className="h-[38px] w-full rounded-[8px] border border-[#d1d5dc] bg-[#f3f3f5] pl-10 pr-3 text-[14px] text-[#374151] outline-none focus:border-[#015023]"
              />
            </div>

            <div className="mt-4 space-y-2">
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-[86px] animate-pulse rounded-[10px] bg-slate-100" />
                ))
              ) : filteredSupervisees.length === 0 ? (
                <div className="rounded-[10px] border border-dashed border-[#d1d5db] p-6 text-center">
                  <p className="text-[14px] text-[#6a7282]">Belum ada mahasiswa bimbingan</p>
                </div>
              ) : (
                filteredSupervisees.map((item) => {
                  const selected = Number(item.id_supervisor) === Number(selectedSupervisorId);
                  const progress = getLatestProgress(item);
                  const studentName = item?.student_thesis?.student?.name || 'Mahasiswa';
                  const nim = item?.student_thesis?.student?.username || '-';

                  return (
                    <button
                      type="button"
                      key={item.id_supervisor}
                      onClick={() => setSelectedSupervisorId(item.id_supervisor)}
                      className={`w-full rounded-[10px] border p-[12px] text-left transition ${
                        selected
                          ? 'border-[#015023] bg-[#f0fdf4]'
                          : 'border-transparent bg-white hover:border-[#d1d5db] hover:bg-[#f9fafb]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#015023] text-[12px] font-bold text-white">
                          {getInitials(studentName)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14px] font-semibold text-[#015023]">{studentName}</p>
                          <p className="text-[12px] text-[#6a7282]">{nim}</p>
                        </div>
                        <p className="text-[12px] font-semibold text-[#015023]">{progress}%</p>
                      </div>

                      <div className="mt-2 h-[6px] w-full rounded-full bg-[#e5e7eb]">
                        <div
                          className="h-full rounded-full bg-[#015023]"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </aside>

        <div className="flex-1 space-y-4">
          {!selectedSupervisee && !loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[16px] bg-white p-8 text-center shadow-sm">
              <GraduationCap className="h-10 w-10 text-[#9ca3af]" />
              <h3 className="mt-3 text-[20px] font-bold text-[#015023]">Pilih mahasiswa dari daftar kiri</h3>
              <p className="mt-1 text-[14px] text-[#6a7282]">Klik nama mahasiswa untuk melihat detail bimbingan</p>
            </div>
          ) : null}

          {selectedSupervisee ? (
            <>
              <section className="rounded-[16px] border border-[#015023] bg-white p-[16px] shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <span className="inline-flex h-[56px] w-[56px] items-center justify-center rounded-full bg-[#015023] text-[18px] font-bold text-white">
                    {getInitials(selectedSupervisee?.student_thesis?.student?.name)}
                  </span>

                  <div className="flex-1">
                    <h3 className="text-[28px] font-bold leading-tight text-[#015023]">
                      {selectedSupervisee?.student_thesis?.student?.name || 'Mahasiswa'}
                    </h3>
                    <p className="text-[13px] text-[#6a7282]">
                      {selectedSupervisee?.student_thesis?.student?.username || '-'} •
                      {' '}
                      {selectedSupervisee?.student_thesis?.program?.name || 'Program Studi'}
                    </p>

                    <div className="mt-2 flex items-center gap-3 text-[13px] text-[#4b5563]">
                      <span>Progress TA:</span>
                      <div className="h-[8px] w-[220px] rounded-full bg-[#d1d5db]">
                        <div
                          className="h-full rounded-full bg-[#015023]"
                          style={{ width: `${selectedProgress}%` }}
                        />
                      </div>
                      <span className="font-semibold text-[#015023]">{selectedProgress}%</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 rounded-[10px] border border-[#e5e7eb] bg-[#f9fafb] p-3">
                  <p className="text-[12px] text-[#6a7282]">Judul Tugas Akhir:</p>
                  <p className="text-[14px] font-semibold text-[#015023]">
                    {selectedSupervisee?.student_thesis?.title_ind || '-'}
                  </p>
                </div>
              </section>

              <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setNoteModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#015023] py-[11px] text-[14px] font-semibold text-white"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Catatan
                </button>

                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#dabc4e] py-[11px] text-[14px] font-semibold text-white"
                >
                  <CalendarDays className="h-4 w-4" />
                  Atur Jadwal
                </button>
              </section>

              <section className="rounded-[16px] bg-white p-[20px] shadow-sm">
                <h2 className="text-[22px] font-bold text-[#015023]">Riwayat Catatan Bimbingan</h2>

                {consultationTimeline.length === 0 ? (
                  <p className="mt-4 text-[14px] text-[#6a7282]">Belum ada catatan bimbingan</p>
                ) : (
                  <div className="relative mt-4 space-y-5 pl-6">
                    <div className="absolute left-[9px] top-1 h-[calc(100%-8px)] w-[2px] bg-[#0d7a3b]" />

                    {consultationTimeline.map((item) => (
                      <article key={item.id_consultation} className="relative">
                        <span className="absolute -left-[20px] top-[7px] h-[10px] w-[10px] rounded-full bg-[#015023]" />

                        <p className="text-[12px] text-[#6a7282]">{formatDate(item.consultation_date)}</p>
                        <h3 className="mt-1 text-[22px] font-bold leading-tight text-[#015023]">
                          {item.subject || 'Catatan Bimbingan'}
                        </h3>
                        <p className="mt-1 text-[14px] leading-6 text-[#4a5565]">
                          {item.lecturer_notes || 'Belum ada detail catatan'}
                        </p>

                        {item.next_task ? (
                          <div className="mt-3 rounded-[8px] bg-[#dcebe1] px-3 py-2 text-[13px] text-[#4a5565]">
                            Tugas selanjutnya: {item.next_task}
                          </div>
                        ) : null}

                        <p className="mt-1 text-[12px] text-[#dabc4e]">Oleh: Dosen</p>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section className="overflow-hidden rounded-[14px] shadow-sm">
                <div className="bg-[#015023] px-[20px] py-[14px]">
                  <h2 className="inline-flex items-center gap-2 text-[20px] font-semibold text-white">
                    <CalendarDays className="h-5 w-5" />
                    Jadwal Bimbingan
                  </h2>
                </div>

                <div className="overflow-x-auto bg-white">
                  <table className="min-w-[820px] w-full">
                    <thead>
                      <tr className="border-b border-[#eef1f4] text-left text-[13px] text-[#6a7282]">
                        <th className="px-4 py-3 font-semibold">Tanggal</th>
                        <th className="px-4 py-3 font-semibold">Waktu</th>
                        <th className="px-4 py-3 font-semibold">Tempat</th>
                        <th className="px-4 py-3 font-semibold">Topik</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consultationSchedules.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-[14px] text-[#9ca3af]">
                            Belum ada jadwal bimbingan
                          </td>
                        </tr>
                      ) : (
                        consultationSchedules.map((item) => {
                          const status = getScheduleStatus(item);

                          return (
                            <tr
                              key={`schedule-${item.id_consultation}`}
                              className="border-b border-[#eef1f4] text-[14px] text-[#4a5565]"
                            >
                              <td className="px-4 py-3">{formatDateShort(item.consultation_date)}</td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center gap-1">
                                  <Clock3 className="h-3.5 w-3.5 text-[#9ca3af]" />
                                  {formatTime(item.start_time)} - {formatTime(item.end_time)}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5 text-[#9ca3af]" />
                                  {item.location || '-'}
                                </span>
                              </td>
                              <td className="px-4 py-3">{item.subject || '-'}</td>
                              <td className="px-4 py-3">
                                <ScheduleBadge status={status} />
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          ) : null}
        </div>
      </section>

      {noteModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-[500px] rounded-[12px] bg-white shadow-xl" style={{ fontFamily: 'Urbanist, sans-serif' }}>
            <div className="flex items-start justify-between px-[24px] pb-[16px] pt-[24px]">
              <div>
                <h3 className="text-[30px] font-bold leading-tight text-[#015023]">Tambah Catatan Bimbingan</h3>
                <p className="mt-1 text-[14px] text-[#717182]">
                  Tambahkan catatan hasil bimbingan untuk {selectedSupervisee?.student_thesis?.student?.name || 'mahasiswa'}
                </p>
              </div>

              <button type="button" onClick={closeNoteModal} className="text-[#6b7280] hover:text-[#111827]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submitNote} className="space-y-4 px-[24px] py-[12px]">
              <div>
                <label className="text-[14px] font-semibold text-[#015023]">Topik Pembahasan</label>
                <input
                  value={noteForm.subject}
                  onChange={(event) => {
                    setNoteForm((prev) => ({ ...prev, subject: event.target.value }));
                    setFormErrors((prev) => ({ ...prev, subject: undefined }));
                  }}
                  placeholder="Contoh: Review BAB 1"
                  className="mt-1 h-[42px] w-full rounded-[8px] border border-[#d1d5dc] bg-[#f3f3f5] px-[12px] text-[14px] outline-none focus:border-[#015023]"
                />
                {formErrors.subject ? <p className="mt-1 text-[12px] text-[#dc2626]">{formErrors.subject}</p> : null}
              </div>

              <div>
                <label className="text-[14px] font-semibold text-[#015023]">Catatan</label>
                <textarea
                  value={noteForm.lecturer_notes}
                  onChange={(event) =>
                    setNoteForm((prev) => ({ ...prev, lecturer_notes: event.target.value }))
                  }
                  placeholder="Tuliskan catatan, feedback, dan arahan untuk mahasiswa..."
                  className="mt-1 min-h-[92px] w-full rounded-[8px] border border-[#d1d5dc] bg-[#f3f3f5] px-[12px] py-[8px] text-[14px] outline-none focus:border-[#015023]"
                />
              </div>

              <div>
                <label className="text-[14px] font-semibold text-[#015023]">Tugas Selanjutnya</label>
                <textarea
                  value={noteForm.next_task}
                  onChange={(event) =>
                    setNoteForm((prev) => ({ ...prev, next_task: event.target.value }))
                  }
                  placeholder="Tuliskan tugas selanjutnya untuk mahasiswa..."
                  className="mt-1 min-h-[92px] w-full rounded-[8px] border border-[#d1d5dc] bg-[#f3f3f5] px-[12px] py-[8px] text-[14px] outline-none focus:border-[#015023]"
                />
              </div>

              <div className="flex justify-end gap-2 pb-[24px]">
                <button
                  type="button"
                  onClick={closeNoteModal}
                  className="rounded-[8px] border border-[#d1d5dc] bg-white px-4 py-2 text-[14px] text-[#0a0a0a]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-[8px] bg-[#015023] px-5 py-2 text-[14px] font-semibold text-white disabled:opacity-60"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Catatan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {scheduleModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-[500px] rounded-[12px] bg-white shadow-xl" style={{ fontFamily: 'Urbanist, sans-serif' }}>
            <div className="flex items-start justify-between px-[24px] pb-[16px] pt-[24px]">
              <div>
                <h3 className="text-[30px] font-bold leading-tight text-[#015023]">Atur Jadwal Bimbingan</h3>
                <p className="mt-1 text-[14px] text-[#717182]">
                  Buat jadwal bimbingan baru untuk {selectedSupervisee?.student_thesis?.student?.name || 'mahasiswa'}
                </p>
              </div>

              <button type="button" onClick={closeScheduleModal} className="text-[#6b7280] hover:text-[#111827]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submitSchedule} className="space-y-4 px-[24px] py-[12px]">
              <div>
                <label className="text-[14px] font-semibold text-[#015023]">Tanggal</label>
                <input
                  type="date"
                  value={scheduleForm.consultation_date}
                  onChange={(event) => {
                    setScheduleForm((prev) => ({ ...prev, consultation_date: event.target.value }));
                    setFormErrors((prev) => ({ ...prev, consultation_date: undefined }));
                  }}
                  className="mt-1 h-[42px] w-full rounded-[8px] border border-[#d1d5dc] bg-[#f3f3f5] px-[12px] text-[14px] outline-none focus:border-[#015023]"
                />
                {formErrors.consultation_date ? (
                  <p className="mt-1 text-[12px] text-[#dc2626]">{formErrors.consultation_date}</p>
                ) : null}
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-[14px] font-semibold text-[#015023]">Waktu Mulai</label>
                  <input
                    type="time"
                    value={scheduleForm.start_time}
                    onChange={(event) =>
                      setScheduleForm((prev) => ({ ...prev, start_time: event.target.value }))
                    }
                    className="mt-1 h-[42px] w-full rounded-[8px] border border-[#d1d5dc] bg-[#f3f3f5] px-[12px] text-[14px] outline-none focus:border-[#015023]"
                  />
                </div>

                <div>
                  <label className="text-[14px] font-semibold text-[#015023]">Waktu Selesai</label>
                  <input
                    type="time"
                    value={scheduleForm.end_time}
                    onChange={(event) =>
                      setScheduleForm((prev) => ({ ...prev, end_time: event.target.value }))
                    }
                    className="mt-1 h-[42px] w-full rounded-[8px] border border-[#d1d5dc] bg-[#f3f3f5] px-[12px] text-[14px] outline-none focus:border-[#015023]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[14px] font-semibold text-[#015023]">Topik Pembahasan</label>
                <input
                  value={scheduleForm.subject}
                  onChange={(event) => {
                    setScheduleForm((prev) => ({ ...prev, subject: event.target.value }));
                    setFormErrors((prev) => ({ ...prev, schedule_subject: undefined }));
                  }}
                  placeholder="Contoh: Review BAB 3"
                  className="mt-1 h-[42px] w-full rounded-[8px] border border-[#d1d5dc] bg-[#f3f3f5] px-[12px] text-[14px] outline-none focus:border-[#015023]"
                />
                {formErrors.schedule_subject ? (
                  <p className="mt-1 text-[12px] text-[#dc2626]">{formErrors.schedule_subject}</p>
                ) : null}
              </div>

              <div>
                <label className="text-[14px] font-semibold text-[#015023]">Lokasi</label>
                <input
                  value={scheduleForm.location}
                  onChange={(event) =>
                    setScheduleForm((prev) => ({ ...prev, location: event.target.value }))
                  }
                  placeholder="Contoh: Ruang Dosen A.301"
                  className="mt-1 h-[42px] w-full rounded-[8px] border border-[#d1d5dc] bg-[#f3f3f5] px-[12px] text-[14px] outline-none focus:border-[#015023]"
                />
              </div>

              <div className="flex justify-end gap-2 pb-[24px]">
                <button
                  type="button"
                  onClick={closeScheduleModal}
                  className="rounded-[8px] border border-[#d1d5dc] bg-white px-4 py-2 text-[14px] text-[#0a0a0a]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-[8px] bg-[#015023] px-5 py-2 text-[14px] font-semibold text-white disabled:opacity-60"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Jadwal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </BimbinganShell>
  );
}
