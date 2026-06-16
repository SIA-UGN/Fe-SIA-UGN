'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/ui/table';
import { getKrsQuota, submitKrs } from '@/lib/krs';

const KRS_DRAFT_STORAGE_KEY = 'krs-mahasiswa-draft-selection';

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

function readDraftFromStorage() {
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

function clearDraftStorage() {
  if (typeof window === 'undefined') {
    return;
  }

  sessionStorage.removeItem(KRS_DRAFT_STORAGE_KEY);
}

function calculateTotalSks(items = []) {
  return items.reduce((acc, item) => acc + Number(item?.sks || 0), 0);
}

export default function ReviewKrsPage() {
  const router = useRouter();
  const [quota, setQuota] = useState(null);
  const [draftSelection, setDraftSelection] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    // Draft adalah keranjang sementara dari halaman "pilih" (sessionStorage).
    const draftItems = readDraftFromStorage();
    setDraftSelection(draftItems);
    saveDraftToStorage(draftItems);

    // A6 — ambil kuota untuk header progres SKS.
    (async () => {
      const { data } = await getKrsQuota();
      if (active && data?.data) {
        setQuota(data.data);
      }
    })();

    return () => {
      active = false;
    };
  }, [router]);

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

  const handleRemoveDraft = (idClass) => {
    const nextSelection = draftSelection.filter((item) => item.id_class !== idClass);
    setDraftSelection(nextSelection);
    saveDraftToStorage(nextSelection);
  };

  const handleSubmitKrs = async () => {
    if (draftSelection.length === 0) {
      toast.error('Belum ada mata kuliah untuk diajukan.');
      return;
    }

    setIsSubmitting(true);

    // A9 — POST /student/krs hanya menerima 1 kelas per request, jadi seluruh
    // pilihan diajukan satu per satu. Sesi aktif diisi otomatis oleh backend.
    const failed = [];
    let successCount = 0;

    for (const item of draftSelection) {
      const { error } = await submitKrs({ id_class: item.id_class });
      if (error) {
        failed.push({ item, message: error.message });
      } else {
        successCount += 1;
      }
    }

    if (failed.length === 0) {
      clearDraftStorage();
      setDraftSelection([]);
      toast.success('Pengajuan KRS berhasil dikirim.');
      setIsSubmitting(false);
      router.push('/krsmahasiswa/status');
      return;
    }

    // Sebagian/seluruhnya gagal: sisakan hanya item yang gagal di keranjang
    // agar mahasiswa bisa memperbaiki & mengajukan ulang.
    const failedItems = failed.map((entry) => entry.item);
    setDraftSelection(failedItems);
    saveDraftToStorage(failedItems);

    const firstMessage = failed[0]?.message || 'Sebagian pengajuan KRS gagal.';
    if (successCount > 0) {
      toast.error(`${successCount} mata kuliah berhasil diajukan, ${failed.length} gagal. ${firstMessage}`);
    } else {
      toast.error(firstMessage);
    }
    setIsSubmitting(false);
  };

  const tableColumns = [
    { key: 'kode_mk', label: 'Kode MK', width: '130px' },
    { key: 'nama_mk', label: 'Nama Mata Kuliah', className: 'text-left', cellClassName: 'text-left' },
    { key: 'dosen', label: 'Dosen', className: 'text-left', cellClassName: 'text-left' },
    { key: 'jadwal', label: 'Jadwal', width: '170px' },
    { key: 'kelas', label: 'Kelas', width: '110px' },
    { key: 'sks', label: 'SKS', width: '90px' },
    { key: 'jenis', label: 'Jenis', width: '100px' },
    { key: 'aksi', label: 'Aksi', width: '90px' },
  ];

  const tableRender = {
    nama_mk: (value) => (
      <p className="text-[15px] font-semibold" style={{ color: '#1F2937' }}>
        {value}
      </p>
    ),
    jadwal: (_value, item) => (
      <span className="text-sm" style={{ color: '#1F2937' }}>
        {formatDay(item.day_of_week)}, {formatTime(item.start_time)}-{formatTime(item.end_time)}
      </span>
    ),
    kelas: (_value, item) => (
      <span className="text-sm font-semibold" style={{ color: '#1F2937' }}>
        Kelas {item.kode_kelas}
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
    aksi: (_value, item) => (
      <button
        type="button"
        onClick={() => handleRemoveDraft(item.id_class)}
        className="w-9 h-9 rounded-xl border flex items-center justify-center transition hover:opacity-80"
        style={{ borderColor: '#EF4444', color: '#EF4444', backgroundColor: '#FFFFFF' }}
        aria-label={`Hapus ${item.nama_mk}`}
      >
        <Trash2 size={16} />
      </button>
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
            <span style={{ color: '#015023', fontWeight: 600 }}>Review KRS</span>
          </nav>

          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
                Review Pengajuan KRS
              </h1>
              <p className="text-base mt-2" style={{ color: '#6B7280', fontFamily: 'Urbanist, sans-serif' }}>
                {quota?.academic_period?.name || 'Periode aktif'}
              </p>
            </div>

            <Button asChild variant="outline" className="h-11 px-5 text-sm font-semibold">
              <Link href="/krsmahasiswa/pilih" className="flex items-center gap-2">
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
                  Ringkasan Pilihan
                </p>
                <p className="text-3xl font-bold text-white mt-1">
                  {draftSelection.length} MK · {draftTotalSks} SKS
                </p>
                <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.82)' }}>
                  Pastikan data sudah sesuai sebelum pengajuan.
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
              <div>
                <h2 className="text-xl font-bold" style={{ color: '#015023' }}>Finalisasi Pengajuan</h2>
                <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
                  Kamu bisa hapus item yang tidak jadi diajukan sebelum submit.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button asChild variant="outline" className="h-11 px-5 text-sm font-semibold">
                  <Link href="/krsmahasiswa/pilih">Edit Pilihan</Link>
                </Button>
                <Button
                  onClick={handleSubmitKrs}
                  className="h-11 px-6 text-sm font-semibold"
                  style={{ backgroundColor: '#015023' }}
                  disabled={isSubmitting || draftSelection.length === 0}
                >
                  {isSubmitting ? 'Memproses...' : 'Ajukan KRS'}
                </Button>
              </div>
            </div>
          </section>

          <section
            className="bg-white overflow-hidden border shadow-md"
            style={{ borderColor: '#E5E7EB', borderRadius: '18px', fontFamily: 'Urbanist, sans-serif' }}
          >
            <div className="px-6 py-5 border-b" style={{ borderColor: '#E5E7EB' }}>
              <h2 className="text-2xl font-bold" style={{ color: '#015023' }}>Mata Kuliah yang Akan Diajukan</h2>
              <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
                Total {draftSelection.length} mata kuliah siap diajukan.
              </p>
            </div>

            <DataTable
              columns={tableColumns}
              data={draftSelection}
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
