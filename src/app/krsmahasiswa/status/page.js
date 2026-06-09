'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock3,
  RefreshCcw,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/ui/table';
import { getMyKrsSubmissions } from '@/lib/krs';

function formatTime(value) {
  if (!value) {
    return '--.--';
  }

  return String(value).slice(0, 5);
}

function formatDay(dayValue) {
  const map = {
    monday: 'Senin',
    tuesday: 'Selasa',
    wednesday: 'Rabu',
    thursday: 'Kamis',
    friday: 'Jumat',
    saturday: 'Sabtu',
    sunday: 'Minggu',
  };

  if (!dayValue) {
    return '-';
  }

  const normalized = String(dayValue).trim().toLowerCase();
  return map[normalized] || dayValue;
}

function calculateTotalSks(items = []) {
  return items.reduce((acc, item) => acc + Number(item?.sks || 0), 0);
}

function getLecturerName(lecturers = []) {
  if (!Array.isArray(lecturers) || lecturers.length === 0) {
    return '-';
  }

  return lecturers.map((lecturer) => lecturer?.name).filter(Boolean).join(', ') || '-';
}

/**
 * Map daftar pengajuan KRS (A8) menjadi bentuk yang dipakai tabel.
 * A8 mengembalikan array entri per-mata kuliah, masing-masing punya status sendiri.
 */
function mapKrsItemToCourse(item) {
  const subject = item?.subject ?? {};
  const krsClass = item?.krsClass ?? {};

  return {
    id_krs: item?.id_krs,
    kode_mk: subject.code_subject || '-',
    nama_mk: subject.name_subject || '-',
    sks: Number(subject.sks || 0),
    kode_kelas: krsClass.code_class || '-',
    day_of_week: krsClass.day_of_week,
    start_time: krsClass.start_time,
    end_time: krsClass.end_time,
    dosen: getLecturerName(krsClass.lecturers),
    rejection_reason: item?.rejection_reason || null,
    status: item?.status || 'pending',
  };
}

/**
 * Status keseluruhan halaman diturunkan dari kumpulan entri KRS:
 *  - ada pending  → 'pending' (masih ada yang perlu ditinjau)
 *  - ada rejected → 'rejected' (ada penolakan yang perlu ditindaklanjuti mahasiswa,
 *    diprioritaskan di atas approved agar alasan penolakan tidak terlewat)
 *  - semua approved → 'approved'
 */
function deriveOverallStatus(courses = []) {
  if (courses.length === 0) {
    return 'none';
  }

  if (courses.some((course) => course.status === 'pending')) {
    return 'pending';
  }

  if (courses.some((course) => course.status === 'rejected')) {
    return 'rejected';
  }

  if (courses.some((course) => course.status === 'approved')) {
    return 'approved';
  }

  return 'pending';
}

function getStatusMeta(status) {
  if (status === 'none') {
    return {
      badgeLabel: 'Belum Ajukan',
      badgeStyle: {
        color: '#6B7280',
        backgroundColor: '#F3F4F6',
        border: '1px solid #D1D5DB',
      },
      cardBorder: '#D1D5DB',
      cardBackground: '#F9FAFB',
      iconBackground: '#E5E7EB',
      iconColor: '#6B7280',
      title: 'Belum Ada Pengajuan KRS',
      description: 'Anda belum mengajukan KRS. Silakan mulai isi KRS terlebih dahulu dari halaman utama.',
      rowStatusLabel: 'Belum Diajukan',
      rowStatusStyle: {
        color: '#6B7280',
        backgroundColor: '#F3F4F6',
        border: '1px solid #D1D5DB',
      },
    };
  }

  if (status === 'approved') {
    return {
      badgeLabel: 'Disetujui',
      badgeStyle: {
        color: '#16A34A',
        backgroundColor: '#DCFCE7',
        border: '1px solid #4ADE80',
      },
      cardBorder: '#37B36C',
      cardBackground: '#EFFAF3',
      iconBackground: '#CCF0D9',
      iconColor: '#16A34A',
      title: 'KRS Disetujui',
      description: 'KRS Anda telah disetujui oleh Dosen Pembimbing Akademik. Anda dapat mengikuti perkuliahan sesuai jadwal.',
      rowStatusLabel: 'Disetujui',
      rowStatusStyle: {
        color: '#16A34A',
        backgroundColor: '#E8F8EE',
        border: '1px solid #5BC98A',
      },
    };
  }

  if (status === 'rejected') {
    return {
      badgeLabel: 'Ditolak',
      badgeStyle: {
        color: '#BE0414',
        backgroundColor: '#FEE2E2',
        border: '1px solid #FCA5A5',
      },
      cardBorder: '#FCA5A5',
      cardBackground: '#FEF2F2',
      iconBackground: '#FEE2E2',
      iconColor: '#BE0414',
      title: 'KRS Ditolak',
      description: 'Sebagian atau seluruh mata kuliah yang Anda ajukan ditolak. Periksa alasan penolakan di bawah, lalu ajukan ulang KRS.',
      actionLabel: 'Ajukan Ulang',
      actionColor: '#BE0414',
      rowStatusLabel: 'Ditolak',
      rowStatusStyle: {
        color: '#BE0414',
        backgroundColor: '#FEE2E2',
        border: '1px solid #FCA5A5',
      },
    };
  }

  return {
    badgeLabel: 'Menunggu Persetujuan',
    badgeStyle: {
      color: '#3B82F6',
      backgroundColor: '#EFF6FF',
      border: '1px solid #93C5FD',
    },
    cardBorder: '#60A5FA',
    cardBackground: '#EFF6FF',
    iconBackground: '#DBEAFE',
    iconColor: '#2563EB',
    title: 'Menunggu Persetujuan',
    description: 'KRS Anda sedang dalam proses peninjauan oleh Dosen Pembimbing Akademik. Harap menunggu konfirmasi.',
    actionLabel: 'Perbarui',
    actionColor: '#5C9BD5',
    rowStatusLabel: 'Menunggu',
    rowStatusStyle: {
      color: '#2563EB',
      backgroundColor: '#EFF6FF',
      border: '1px solid #93C5FD',
    },
  };
}

function getJenisStyle(jenis) {
  if (String(jenis).toLowerCase() === 'wajib') {
    return {
      color: '#166534',
      backgroundColor: '#E8F8EE',
      border: '1px solid #5BC98A',
    };
  }

  return {
    color: '#3B82F6',
    backgroundColor: '#EFF6FF',
    border: '1px solid #93C5FD',
  };
}

export default function KrsStatusPage() {
  const [courses, setCourses] = useState([]);
  const [academicPeriod, setAcademicPeriod] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSubmissions = async ({ silent = false } = {}) => {
    if (silent) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    // A8 — daftar pengajuan KRS milik mahasiswa (semua status).
    const { data, error: fetchError } = await getMyKrsSubmissions();

    if (fetchError) {
      setError(fetchError.message);
    } else {
      const list = Array.isArray(data?.data) ? data.data : [];
      setCourses(list.map(mapKrsItemToCourse));
      setAcademicPeriod(list[0]?.academicPeriod?.name ?? null);
    }

    if (silent) {
      setIsRefreshing(false);
      if (!fetchError) {
        toast.success('Status KRS diperbarui.');
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const totalSks = useMemo(() => calculateTotalSks(courses), [courses]);

  const rejectedCourses = useMemo(
    () => courses.filter((course) => course.status === 'rejected'),
    [courses],
  );

  const normalizedStatus = deriveOverallStatus(courses);
  const statusMeta = getStatusMeta(normalizedStatus);

  const handleRefreshStatus = () => {
    loadSubmissions({ silent: true });
  };
  const approvedMeta = getStatusMeta('approved');

  const courseColumns = [
    { key: 'kode_mk', label: 'Kode MK', width: '130px' },
    { key: 'nama_mk', label: 'Nama Mata Kuliah', className: 'text-left', cellClassName: 'text-left' },
    { key: 'dosen', label: 'Dosen', className: 'text-left', cellClassName: 'text-left' },
    { key: 'jadwal', label: 'Jadwal', width: '200px' },
    { key: 'sks', label: 'SKS', width: '110px' },
    { key: 'jenis', label: 'Jenis', width: '110px' },
    { key: 'status', label: 'Status', width: '170px' },
  ];

  const courseRender = {
    nama_mk: (value, item) => (
      <div>
        <p className="text-[15px] font-semibold" style={{ color: '#1F2937' }}>
          {value || '-'}
        </p>
        <p className="text-sm mt-1" style={{ color: '#7B7B7B' }}>
          Kelas {item?.kode_kelas || '-'}
        </p>
      </div>
    ),
    dosen: (value) => (
      <span className="text-sm" style={{ color: '#1F2937' }}>
        {value || '-'}
      </span>
    ),
    jadwal: (_value, item) => (
      <span className="text-sm" style={{ color: '#1F2937' }}>
        {formatDay(item?.day_of_week)}, {formatTime(item?.start_time)}-{formatTime(item?.end_time)}
      </span>
    ),
    sks: (value) => (
      <span
        className="inline-flex items-center rounded-xl px-3 py-1 text-xs font-semibold"
        style={{ backgroundColor: '#D9E5DE', color: '#015023' }}
      >
        {value || 0} SKS
      </span>
    ),
    jenis: (value) => (
      <span
        className="inline-flex items-center rounded-full px-3 py-1 text-base font-semibold"
        style={getJenisStyle(value || 'Pilihan')}
      >
        {value || 'Pilihan'}
      </span>
    ),
    status: (value, item) => {
      if (value === 'rejected') {
        return (
          <div className="flex flex-col items-center gap-1">
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-base font-semibold"
              style={{ color: '#BE0414', backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5' }}
            >
              <XCircle size={14} />
              Ditolak
            </span>
            {item?.rejection_reason && (
              <span className="text-xs leading-snug" style={{ color: '#BE0414', maxWidth: 200 }}>
                {item.rejection_reason}
              </span>
            )}
          </div>
        );
      }

      const rowStatus = value === 'approved' ? 'approved' : 'pending';
      const rowMeta = rowStatus === 'approved' ? approvedMeta : getStatusMeta('pending');

      return (
        <span
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-base font-semibold"
          style={rowMeta.rowStatusStyle}
        >
          {rowStatus === 'approved' ? <CheckCircle2 size={14} /> : <Clock3 size={14} />}
          {rowMeta.rowStatusLabel}
        </span>
      );
    },
  };

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ backgroundColor: '#E6EEE9' }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10" style={{ backgroundColor: '#015023' }} />
        <div className="absolute top-40 -left-32 w-96 h-96 rounded-full opacity-5" style={{ backgroundColor: '#015023' }} />
        <div className="absolute -bottom-32 right-20 w-80 h-80 rounded-full opacity-[0.08]" style={{ backgroundColor: '#015023' }} />
      </div>

      <Navbar />

      <main className="flex-1 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
          <nav className="flex items-center gap-2 text-sm mb-3 flex-wrap" style={{ fontFamily: 'Urbanist, sans-serif' }}>
            <span style={{ color: '#6B7280' }}>Mahasiswa</span>
            <ChevronRight size={14} style={{ color: '#9CA3AF' }} />
            <span style={{ color: '#6B7280' }}>Pengisian KRS</span>
            <ChevronRight size={14} style={{ color: '#9CA3AF' }} />
            <span style={{ color: '#015023', fontWeight: 600 }}>Status KRS</span>
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
              style={statusMeta.badgeStyle}
            >
              {statusMeta.badgeLabel}
            </span>
          </nav>

          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
                Pengisian Kartu Rencana Studi
              </h1>
              <p className="text-base mt-2" style={{ color: '#6B7280', fontFamily: 'Urbanist, sans-serif' }}>
                {academicPeriod || 'Periode akademik aktif'}
              </p>
            </div>

            <Button asChild variant="outline" className="h-11 px-5 text-sm font-semibold">
              <Link href="/krsmahasiswa" className="flex items-center gap-2">
                <ArrowLeft size={16} />
                Kembali
              </Link>
            </Button>
          </div>

          {loading && (
            <div
              className="mb-5 p-4 rounded-2xl text-sm font-medium shadow-sm"
              style={{ backgroundColor: '#FFFFFF', color: '#015023', fontFamily: 'Urbanist, sans-serif' }}
            >
              Memuat status pengajuan KRS...
            </div>
          )}

          {!loading && error && (
            <div
              className="mb-5 p-4 rounded-2xl text-sm font-medium shadow-sm"
              style={{ backgroundColor: '#FEE2E2', color: '#BE0414', border: '1px solid #FCA5A5', fontFamily: 'Urbanist, sans-serif' }}
            >
              {error}
            </div>
          )}

          <section
            className="mb-5 p-5 lg:p-6 shadow-md border"
            style={{
              borderRadius: '18px',
              borderColor: statusMeta.cardBorder,
              backgroundColor: statusMeta.cardBackground,
              fontFamily: 'Urbanist, sans-serif',
            }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: statusMeta.iconBackground }}
                >
                  {normalizedStatus === 'approved' ? (
                    <CheckCircle2 size={30} style={{ color: statusMeta.iconColor }} />
                  ) : normalizedStatus === 'rejected' ? (
                    <XCircle size={30} style={{ color: statusMeta.iconColor }} />
                  ) : (
                    <Clock3 size={30} style={{ color: statusMeta.iconColor }} />
                  )}
                </div>

                <div>
                  <h2 className="text-2xl font-bold" style={{ color: statusMeta.iconColor }}>
                    {statusMeta.title}
                  </h2>
                  <p className="text-lg mt-1" style={{ color: statusMeta.iconColor }}>
                    {statusMeta.description}
                  </p>
                  <p className="text-2xl font-bold mt-2" style={{ color: statusMeta.iconColor }}>
                    {courses.length} Mata Kuliah · {totalSks} SKS
                  </p>
                </div>
              </div>

              {normalizedStatus === 'none' && (
                <Button asChild className="h-11 px-6 text-base font-semibold" style={{ backgroundColor: '#015023' }}>
                  <Link href="/krsmahasiswa/pilih">Mulai Isi</Link>
                </Button>
              )}

              {normalizedStatus === 'pending' && (
                <Button
                  onClick={handleRefreshStatus}
                  className="h-11 px-6 text-base font-semibold"
                  style={{ backgroundColor: statusMeta.actionColor }}
                  disabled={isRefreshing}
                >
                  <RefreshCcw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Memeriksa...' : statusMeta.actionLabel}
                </Button>
              )}

              {normalizedStatus === 'rejected' && (
                <Button asChild className="h-11 px-6 text-base font-semibold" style={{ backgroundColor: statusMeta.actionColor }}>
                  <Link href="/krsmahasiswa/pilih">{statusMeta.actionLabel}</Link>
                </Button>
              )}
            </div>
          </section>

          {rejectedCourses.length > 0 && (
            <section
              className="mb-5 p-5 lg:p-6 border shadow-sm"
              style={{ borderRadius: '18px', borderColor: '#FCA5A5', backgroundColor: '#FEF2F2', fontFamily: 'Urbanist, sans-serif' }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FEE2E2' }}>
                  <AlertTriangle size={20} style={{ color: '#BE0414' }} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold" style={{ color: '#BE0414' }}>
                    {rejectedCourses.length} Mata Kuliah Ditolak
                  </h3>
                  <p className="text-sm mt-1" style={{ color: '#7F1D1D' }}>
                    Berikut alasan penolakan dari Dosen Pembimbing Akademik. Silakan perbaiki lalu ajukan ulang KRS.
                  </p>
                  <ul className="mt-3 space-y-2">
                    {rejectedCourses.map((course) => (
                      <li key={course.id_krs} className="rounded-xl p-3 bg-white border" style={{ borderColor: '#FCA5A5' }}>
                        <p className="text-sm font-semibold" style={{ color: '#1F2937' }}>
                          {course.nama_mk}
                          <span className="font-normal" style={{ color: '#6B7280' }}> · Kelas {course.kode_kelas}</span>
                        </p>
                        <p className="text-sm mt-1" style={{ color: '#BE0414' }}>
                          Alasan: {course.rejection_reason || 'Tidak ada alasan yang diberikan.'}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}

          <section
            className="bg-white overflow-hidden mb-5 border shadow-md"
            style={{ borderColor: '#E5E7EB', borderRadius: '18px', fontFamily: 'Urbanist, sans-serif' }}
          >
            <div className="px-6 py-5 border-b" style={{ borderColor: '#E5E7EB' }}>
              <h2 className="text-2xl font-bold" style={{ color: '#015023' }}>Rincian Mata Kuliah</h2>
              <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
                {courses.length} mata kuliah · {totalSks} SKS total
              </p>
            </div>

            <DataTable
              columns={courseColumns}
              data={courses}
              actions={[]}
              pagination={false}
              customRender={courseRender}
              nomertext="No"
              flatTopCorners
              noRounded
              noShadow
              headerBackgroundColor="#DABC4E"
            />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
