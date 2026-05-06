'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock3,
  RefreshCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/ui/table';
import { MOCK_KRS_QUOTA } from '../mockData';

const KRS_SUBMISSION_STORAGE_KEY = 'krs-mahasiswa-last-submission';

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

function readSubmissionFromStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(KRS_SUBMISSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && parsed.is_submitted === true ? parsed : null;
  } catch (_error) {
    return null;
  }
}

function saveSubmissionToStorage(payload) {
  if (typeof window === 'undefined') {
    return;
  }

  sessionStorage.setItem(KRS_SUBMISSION_STORAGE_KEY, JSON.stringify(payload));
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
  const [submission, setSubmission] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setSubmission(readSubmissionFromStorage());
  }, []);

  const courses = submission?.courses || [];

  const totalSks = useMemo(() => calculateTotalSks(courses), [courses]);

  const normalizedStatus = !submission
    ? 'none'
    : submission?.status === 'approved'
      ? 'approved'
      : 'pending';
  const statusMeta = getStatusMeta(normalizedStatus);

  const handleRefreshStatus = async () => {
    if (!submission || normalizedStatus !== 'pending') {
      return;
    }

    setIsRefreshing(true);

    await new Promise((resolve) => {
      setTimeout(resolve, 500);
    });

    const approvedSubmission = {
      ...submission,
      status: 'approved',
      approved_at: new Date().toISOString(),
      courses: courses.map((course) => ({
        ...course,
        status: 'approved',
      })),
    };

    setSubmission(approvedSubmission);
    saveSubmissionToStorage(approvedSubmission);
    setIsRefreshing(false);
    toast.success('Status KRS diperbarui: Disetujui.');
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
    status: (value) => {
      const rowStatus = value === 'approved' || normalizedStatus === 'approved' ? 'approved' : 'pending';
      const rowMeta = rowStatus === 'approved' ? approvedMeta : statusMeta;

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
                {submission?.academic_period || MOCK_KRS_QUOTA?.academic_period?.name || '-'}
                {' · '}
                Dosen PA: {submission?.advisor_name || 'Dr. Ahmad Fauzi, M.Kom'}
              </p>
            </div>

            <Button asChild variant="outline" className="h-11 px-5 text-sm font-semibold">
              <Link href="/krsmahasiswa" className="flex items-center gap-2">
                <ArrowLeft size={16} />
                Kembali
              </Link>
            </Button>
          </div>

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
                  ) : (
                    <Clock3 size={30} style={{ color: statusMeta.iconColor }} />
                  )}
                </div>

                <div>
                  <h2 className="text-2xl font-bold" style={{ color: statusMeta.iconColor }}>
                    {statusMeta.title}
                  </h2>
                  <p className="text-lg mt-1" style={{ color: normalizedStatus === 'approved' ? '#16A34A' : '#5C9BD5' }}>
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
            </div>
          </section>

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
