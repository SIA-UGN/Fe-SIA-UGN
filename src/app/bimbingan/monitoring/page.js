'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarDays,
  UserRound,
  MapPin,
  Clock3,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import BimbinganShell from '@/components/bimbingan/bimbingan-shell';
import StatusBadgeMahasiswa from '@/components/ui/status-badge-mahasiswa';

function formatDate(value) {
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
  if (!value) return '-';
  return String(value).slice(0, 5);
}

function getErrorMessage(err) {
  const message = err?.response?.data?.message;
  const errors = err?.response?.data?.errors;

  if (typeof message === 'string' && message.trim()) return message;

  if (errors && typeof errors === 'object') {
    const firstKey = Object.keys(errors)[0];
    const firstValue = errors[firstKey];
    if (Array.isArray(firstValue) && firstValue[0]) return firstValue[0];
    if (typeof firstValue === 'string') return firstValue;
  }

  return 'Terjadi kesalahan, coba lagi.';
}

function getInitials(name) {
  if (!name) return 'DS';
  const letters = name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return letters || 'DS';
}

function getScheduleStatus(item) {
  if (item?.status === 'finished') return 'past';

  const dateStr = item?.consultation_date;
  if (!dateStr) return 'future';

  const fallbackTime = String(item?.start_time || '00:00').slice(0, 5);
  const dateTime = new Date(`${dateStr}T${fallbackTime}`);
  if (Number.isNaN(dateTime.getTime())) return 'future';

  return dateTime.getTime() >= Date.now() ? 'future' : 'past';
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-40 animate-pulse rounded-[16px] bg-gray-100" />
      <div className="h-52 animate-pulse rounded-[16px] bg-gray-100" />
      <div className="h-56 animate-pulse rounded-[16px] bg-gray-100" />
    </div>
  );
}

export default function MonitoringPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [thesis, setThesis] = useState(null);
  const [supervisors, setSupervisors] = useState([]);
  const [consultations, setConsultations] = useState([]);

  const fetchData = async () => {
    setLoading(true);

    let thesisData = null;

    try {
      const thesisRes = await api.get('/student/thesis');
      thesisData = thesisRes?.data?.data || null;
      setThesis(thesisData);
    } catch (err) {
      setThesis(null);
      toast.error(getErrorMessage(err));
      setLoading(false);
      return;
    }

    if (!thesisData) {
      setSupervisors([]);
      setConsultations([]);
      setLoading(false);
      return;
    }

    const [supervisorsRes, consultationsRes] = await Promise.allSettled([
      api.get('/student/thesis/supervisors'),
      api.get('/student/thesis/consultations'),
    ]);

    if (supervisorsRes.status === 'fulfilled') {
      setSupervisors(supervisorsRes.value?.data?.data ?? []);
    } else {
      setSupervisors([]);
      toast.error(getErrorMessage(supervisorsRes.reason));
    }

    if (consultationsRes.status === 'fulfilled') {
      setConsultations(consultationsRes.value?.data?.data ?? []);
    } else {
      setConsultations([]);
      toast.error(getErrorMessage(consultationsRes.reason));
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const scheduleRows = useMemo(() => {
    return [...consultations].sort((a, b) => {
      const aDate = new Date(`${a.consultation_date || ''}T${String(a.start_time || '00:00').slice(0, 5)}`).getTime();
      const bDate = new Date(`${b.consultation_date || ''}T${String(b.start_time || '00:00').slice(0, 5)}`).getTime();
      return aDate - bDate;
    });
  }, [consultations]);

  const timelineRows = useMemo(() => {
    return [...consultations].sort((a, b) => {
      const aDate = new Date(`${a.consultation_date || ''}T${String(a.start_time || '00:00').slice(0, 5)}`).getTime();
      const bDate = new Date(`${b.consultation_date || ''}T${String(b.start_time || '00:00').slice(0, 5)}`).getTime();
      return bDate - aDate;
    });
  }, [consultations]);

  return (
    <BimbinganShell
      title="Monitoring Bimbingan Tugas Akhir"
      description="Pantau progress bimbingan dan jadwal pertemuan dengan dosen pembimbing"
      breadcrumbItems={[
        { label: 'Bimbingan', href: '/bimbingan/pengajuan-ta' },
        { label: 'Monitoring', active: true },
      ]}
    >
      {loading ? (
        <LoadingSkeleton />
      ) : !thesis ? (
        <section className="rounded-[16px] bg-white p-10 text-center shadow-sm" style={{ fontFamily: 'Urbanist, sans-serif' }}>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#e6f4ea] text-[#015023]">
            <FileText className="h-6 w-6" />
          </div>
          <h2 className="text-[22px] font-bold text-[#015023]">Belum Ada Pengajuan Tugas Akhir</h2>
          <p className="mx-auto mt-2 max-w-[620px] text-[14px] text-[#6a7282]">
            Anda belum memiliki data TA aktif. Silakan ajukan proposal baru atau pilih topik dari galeri judul TA.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/bimbingan/pengajuan-ta')}
              className="rounded-[10px] bg-[#015023] px-4 py-2 text-[14px] text-white"
            >
              Ajukan Bimbingan
            </button>
            <button
              type="button"
              onClick={() => router.push('/bimbingan/galeri-judul')}
              className="rounded-[8px] border border-[#015023] bg-white px-4 py-2 text-[14px] text-[#015023]"
            >
              Galeri Judul
            </button>
          </div>
        </section>
      ) : (
        <div className="space-y-4">
          <section className="rounded-[16px] bg-white p-[24px] shadow-sm">
            <h2 className="mb-3 text-[18px] font-bold text-[#015023]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
              Dosen Pembimbing
            </h2>

            {supervisors.length > 0 ? (
              <div className="space-y-3">
                {supervisors.map((item) => (
                  <article key={item.id_supervisor} className="rounded-[12px] border border-[#eef1f4] bg-[#f9fafb] p-4">
                    <div className="flex items-start gap-3">
                      <span
                        className="inline-flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#015023] text-[15px] font-bold text-white"
                        style={{ fontFamily: 'Urbanist, sans-serif' }}
                      >
                        {getInitials(item?.lecturer?.name)}
                      </span>

                      <div>
                        <p className="text-[15px] font-semibold text-[#015023]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                          {item?.lecturer?.name || 'Dosen Pembimbing'}
                        </p>
                        <p className="text-[13px] text-[#4a5565]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                          Judul TA: {thesis?.title_ind || '-'}
                        </p>
                        {item?.lecturer?.email ? (
                          <a
                            href={`mailto:${item.lecturer.email}`}
                            className="text-[13px] text-[#dabc4e] underline-offset-2 hover:underline"
                            style={{ fontFamily: 'Urbanist, sans-serif' }}
                          >
                            {item.lecturer.email}
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-[12px] border border-dashed border-[#d1d5db] p-8 text-center" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                <UserRound className="mx-auto h-7 w-7 text-[#9ca3af]" />
                <p className="mt-2 text-[14px] font-medium text-[#6a7282]">Belum ada dosen pembimbing</p>
                <button
                  type="button"
                  onClick={() => router.push('/bimbingan/pengajuan-ta')}
                  className="mt-3 rounded-[10px] bg-[#015023] px-4 py-2 text-[14px] text-white"
                >
                  Ajukan Bimbingan
                </button>
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-[16px] bg-white shadow-sm">
            <div className="rounded-t-[16px] bg-[#015023] px-[24px] py-[16px]">
              <h2 className="inline-flex items-center gap-2 text-[18px] font-semibold text-white" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                <CalendarDays className="h-5 w-5" />
                Jadwal Bimbingan
              </h2>
            </div>

            <div className="overflow-x-auto rounded-b-[16px]">
              <table className="min-w-[860px] w-full">
                <thead className="bg-[#f8fafc] text-left text-[13px] text-[#6a7282]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                  <tr>
                    <th className="px-4 py-3 font-semibold">Tanggal</th>
                    <th className="px-4 py-3 font-semibold">Waktu</th>
                    <th className="px-4 py-3 font-semibold">Tempat</th>
                    <th className="px-4 py-3 font-semibold">Topik</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {scheduleRows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-[14px] text-[#9ca3af]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                        Belum ada jadwal bimbingan
                      </td>
                    </tr>
                  ) : (
                    scheduleRows.map((item) => (
                      <tr key={item.id_consultation} className="border-b border-[#eef1f4] text-[14px] text-[#4a5565]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                        <td className="px-4 py-3">{formatDate(item.consultation_date)}</td>
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
                          <StatusBadgeMahasiswa
                            status={getScheduleStatus(item)}
                            type="consultation"
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-[16px] bg-white p-[24px] shadow-sm">
            <h2 className="mb-4 text-[18px] font-bold text-[#015023]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
              Riwayat Catatan Bimbingan
            </h2>

            {timelineRows.length === 0 ? (
              <p className="text-[14px] text-[#9ca3af]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                Belum ada catatan bimbingan.
              </p>
            ) : (
              <div className="relative space-y-6 pl-7">
                <div className="absolute left-2 top-1 h-[calc(100%-8px)] w-[2px] bg-[#015023]" />

                {timelineRows.map((item) => (
                  <article key={`timeline-${item.id_consultation}`} className="relative">
                    <span className="absolute -left-[23px] top-1.5 h-[10px] w-[10px] rounded-full bg-[#015023]" />

                    <p className="text-[12px] text-[#6a7282]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                      {formatDate(item.consultation_date)}
                    </p>
                    <h3 className="mt-1 text-[16px] font-bold text-[#015023]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                      {item.subject || 'Catatan Bimbingan'}
                    </h3>
                    <p className="mt-1 text-[14px] text-[#4a5565]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                      {item.lecturer_notes || item.student_notes || 'Belum ada catatan detail.'}
                    </p>

                    {item.next_task ? (
                      <div className="mt-3 rounded-[8px] bg-[#eef4f0] px-3 py-2 text-[13px] text-[#4a5565]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                        Tugas selanjutnya: {item.next_task}
                      </div>
                    ) : null}

                    <p className="mt-1 text-[12px] text-[#dabc4e]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                      Oleh: Dosen
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </BimbinganShell>
  );
}
