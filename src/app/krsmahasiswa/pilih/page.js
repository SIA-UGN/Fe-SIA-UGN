'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, ChevronRight, Search } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/ui/table';
import {
  MOCK_AVAILABLE_SUBJECTS,
  MOCK_DEFAULT_DRAFT_CLASS_IDS,
  MOCK_KRS_QUOTA,
} from '../mockData';

const KRS_DRAFT_STORAGE_KEY = 'krs-mahasiswa-draft-selection';
const KRS_SUBMISSION_STORAGE_KEY = 'krs-mahasiswa-last-submission';

function formatTime(value) {
  if (!value) {
    return '--.--';
  }

  const text = String(value);
  return text.slice(0, 5);
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

function getLecturerName(lecturers = []) {
  if (!Array.isArray(lecturers) || lecturers.length === 0) {
    return '-';
  }

  return lecturers.map((lecturer) => lecturer?.name).filter(Boolean).join(', ');
}

function flattenAvailableSubjects(subjects = []) {
  if (!Array.isArray(subjects)) {
    return [];
  }

  return subjects.flatMap((subject) => {
    const classes = Array.isArray(subject?.classes) ? subject.classes : [];

    return classes.map((classItem) => ({
      id: classItem.id_class,
      id_class: classItem.id_class,
      id_subject: subject.id_subject,
      kode_mk: subject.code_subject,
      nama_mk: subject.name_subject,
      sks: Number(subject.sks || 0),
      kode_kelas: classItem.code_class,
      day_of_week: classItem.day_of_week,
      start_time: classItem.start_time,
      end_time: classItem.end_time,
      dosen: getLecturerName(classItem.lecturers),
      jenis: 'Wajib',
    }));
  });
}

function getDraftFromStorage() {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = sessionStorage.getItem(KRS_DRAFT_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

function saveDraftToStorage(items) {
  if (typeof window === 'undefined') {
    return;
  }

  sessionStorage.setItem(KRS_DRAFT_STORAGE_KEY, JSON.stringify(items));
}

function hasSubmittedKrs() {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const raw = sessionStorage.getItem(KRS_SUBMISSION_STORAGE_KEY);
    if (!raw) {
      return false;
    }

    const parsed = JSON.parse(raw);
    return Boolean(parsed && typeof parsed === 'object' && parsed.is_submitted === true);
  } catch (_error) {
    return false;
  }
}

function calculateTotalSks(items = []) {
  return items.reduce((acc, item) => acc + Number(item?.sks || 0), 0);
}

function normalizeSearch(value) {
  return String(value || '').toLowerCase().trim();
}

export default function PilihMataKuliahPage() {
  const router = useRouter();
  const [quota] = useState(MOCK_KRS_QUOTA);
  const [rows] = useState(() => flattenAvailableSubjects(MOCK_AVAILABLE_SUBJECTS));
  const [draftSelection, setDraftSelection] = useState([]);
  const [search, setSearch] = useState('');
  const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(false);

  useEffect(() => {
    if (hasSubmittedKrs()) {
      setIsAlreadySubmitted(true);
      router.replace('/krsmahasiswa/status');
      return;
    }

    const previousDraft = getDraftFromStorage();
    const defaultDraft = rows.filter((item) => MOCK_DEFAULT_DRAFT_CLASS_IDS.includes(item.id_class));
    const seededDraft = previousDraft.length > 0 ? previousDraft : defaultDraft;

    setDraftSelection(seededDraft);
    saveDraftToStorage(seededDraft);
  }, [rows, router]);

  const draftTotalSks = useMemo(() => calculateTotalSks(draftSelection), [draftSelection]);

  const projectedUsedSks = useMemo(() => {
    const used = Number(quota?.sks_used || 0);
    return used + draftTotalSks;
  }, [quota, draftTotalSks]);

  const projectedProgress = useMemo(() => {
    const maxSks = Number(quota?.max_sks || 0);
    if (maxSks <= 0) {
      return 0;
    }

    return Math.min(100, Math.round((projectedUsedSks / maxSks) * 100));
  }, [quota, projectedUsedSks]);

  const filteredRows = useMemo(() => {
    const keyword = normalizeSearch(search);
    if (!keyword) {
      return rows;
    }

    return rows.filter((row) => {
      const haystack = [
        row.kode_mk,
        row.nama_mk,
        row.dosen,
        row.kode_kelas,
        formatDay(row.day_of_week),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(keyword);
    });
  }, [rows, search]);

  const selectedClassIds = useMemo(
    () => new Set(draftSelection.map((item) => item.id_class)),
    [draftSelection]
  );

  const handleToggleClass = (row) => {
    if (isAlreadySubmitted) {
      return;
    }

    const alreadySelected = selectedClassIds.has(row.id_class);

    if (alreadySelected) {
      const nextSelection = draftSelection.filter((item) => item.id_class !== row.id_class);
      setDraftSelection(nextSelection);
      saveDraftToStorage(nextSelection);
      return;
    }

    const withoutSameSubject = draftSelection.filter((item) => item.id_subject !== row.id_subject);
    const nextSelection = [...withoutSameSubject, row];

    const usedSks = Number(quota?.sks_used || 0);
    const maxSks = Number(quota?.max_sks || 0);
    const projectedSks = usedSks + calculateTotalSks(nextSelection);

    if (maxSks > 0 && projectedSks > maxSks) {
      toast.error('Total SKS pilihan melebihi kuota maksimum Anda.');
      return;
    }

    if (withoutSameSubject.length !== draftSelection.length) {
      toast.message('Pilihan kelas untuk mata kuliah yang sama diganti otomatis.');
    }

    setDraftSelection(nextSelection);
    saveDraftToStorage(nextSelection);
  };

  const handleContinue = () => {
    if (isAlreadySubmitted || hasSubmittedKrs()) {
      toast.info('KRS sudah diajukan. Lihat Status KRS untuk detailnya.');
      router.push('/krsmahasiswa/status');
      return;
    }

    if (draftSelection.length === 0) {
      toast.error('Pilih minimal satu mata kuliah sebelum lanjut ke review.');
      return;
    }

    saveDraftToStorage(draftSelection);
    router.push('/krsmahasiswa/review');
  };

  const tableColumns = [
    { key: 'pilih', label: 'Pilih', width: '90px' },
    { key: 'kode_mk', label: 'Kode MK', width: '130px' },
    { key: 'nama_mk', label: 'Mata Kuliah', className: 'text-left', cellClassName: 'text-left' },
    { key: 'dosen', label: 'Dosen', className: 'text-left', cellClassName: 'text-left' },
    { key: 'jadwal', label: 'Jadwal', width: '170px' },
    { key: 'sks', label: 'SKS', width: '100px' },
    { key: 'jenis', label: 'Jenis', width: '100px' },
  ];

  const tableRender = {
    pilih: (_value, item) => {
      const isSelected = selectedClassIds.has(item.id_class);
      return (
        <button
          type="button"
          onClick={() => handleToggleClass(item)}
          className="w-7 h-7 rounded-full border-2 flex items-center justify-center transition"
          style={{
            borderColor: isSelected ? '#015023' : '#C5C5C5',
            backgroundColor: isSelected ? '#015023' : '#FFFFFF',
          }}
          aria-label={`Pilih ${item.nama_mk}`}
        >
          {isSelected && <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FFFFFF' }} />}
        </button>
      );
    },
    nama_mk: (value, item) => {
      const isSelected = selectedClassIds.has(item.id_class);
      return (
        <div>
          <p className="text-[15px] font-semibold" style={{ color: '#1F2937' }}>
            {value}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs" style={{ color: '#6B7280' }}>Kelas {item.kode_kelas}</span>
            {isSelected && (
              <span
                className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                style={{ backgroundColor: '#DCFCE7', color: '#166534' }}
              >
                Dipilih
              </span>
            )}
          </div>
        </div>
      );
    },
    jadwal: (_value, item) => (
      <span className="text-sm" style={{ color: '#1F2937' }}>
        {formatDay(item.day_of_week)}, {formatTime(item.start_time)}-{formatTime(item.end_time)}
      </span>
    ),
    sks: (value) => (
      <span
        className="inline-block px-3 py-1 rounded-xl text-xs font-semibold"
        style={{ backgroundColor: '#D9E5DE', color: '#015023' }}
      >
        {value} SKS
      </span>
    ),
    jenis: (value) => (
      <span
        className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
        style={{ backgroundColor: '#E6F4EA', color: '#166534', border: '1px solid #4ADE80' }}
      >
        {value}
      </span>
    ),
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
          <nav className="flex items-center gap-2 text-sm mb-3" style={{ fontFamily: 'Urbanist, sans-serif' }}>
            <span style={{ color: '#6B7280' }}>Mahasiswa</span>
            <ChevronRight size={14} style={{ color: '#9CA3AF' }} />
            <span style={{ color: '#6B7280' }}>Pengisian KRS</span>
            <ChevronRight size={14} style={{ color: '#9CA3AF' }} />
            <span style={{ color: '#015023', fontWeight: 600 }}>Pilih Mata Kuliah</span>
          </nav>

          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
                Pilih Mata Kuliah KRS
              </h1>
              <p className="text-base mt-2" style={{ color: '#6B7280', fontFamily: 'Urbanist, sans-serif' }}>
                {quota?.academic_period?.name || 'Periode aktif'}
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
            className="mb-5 p-5 lg:p-6 shadow-md"
            style={{
              borderRadius: '18px',
              backgroundColor: '#015023',
              fontFamily: 'Urbanist, sans-serif',
            }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.82)' }}>
                  Mata Kuliah Dipilih
                </p>
                <p className="text-3xl font-bold text-white mt-1">
                  {draftSelection.length} MK · {draftTotalSks} SKS
                </p>
                <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.82)' }}>
                  Maksimum kuota {quota?.max_sks || 0} SKS
                </p>
              </div>

              <div className="min-w-[260px]">
                <div className="flex items-center justify-between text-sm mb-2" style={{ color: 'rgba(255,255,255,0.9)' }}>
                  <span>Progress SKS</span>
                  <span>{projectedUsedSks}/{quota?.max_sks || 0}</span>
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.35)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${projectedProgress}%`, backgroundColor: '#FFFFFF' }}
                  />
                </div>
              </div>
            </div>
          </section>

          <section
            className="bg-white shadow-md p-4 lg:p-5 mb-5"
            style={{ borderRadius: '18px', fontFamily: 'Urbanist, sans-serif' }}
          >
            <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari nama mata kuliah, kode, atau dosen..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-2 bg-white text-base focus:outline-none"
                  style={{ borderColor: '#D1D5DB', color: '#1F2937' }}
                />
              </div>

              <Button
                onClick={handleContinue}
                className="h-11 px-6 text-sm font-semibold"
                style={{ backgroundColor: '#015023' }}
                disabled={isAlreadySubmitted}
              >
                {isAlreadySubmitted ? 'Sudah Diajukan' : 'Lanjut ke Review'}
              </Button>
            </div>
          </section>

          <section
            className="bg-white overflow-hidden border shadow-md"
            style={{ borderColor: '#E5E7EB', borderRadius: '18px', fontFamily: 'Urbanist, sans-serif' }}
          >
            <div className="px-6 py-5 border-b" style={{ borderColor: '#E5E7EB' }}>
              <h2 className="text-2xl font-bold" style={{ color: '#015023' }}>Daftar Mata Kuliah</h2>
              <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
                Pilih satu kelas untuk setiap mata kuliah yang ingin diajukan.
              </p>
            </div>

            <DataTable
              columns={tableColumns}
              data={filteredRows}
              actions={[]}
              pagination
              customRender={tableRender}
              nomertext="No"
              flatTopCorners
              noRounded
              noShadow
            />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
