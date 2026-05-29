'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, GraduationCap, Calendar, BookOpen,
  ThumbsUp, ThumbsDown, X, CheckCircle2, Clock, XCircle,
} from 'lucide-react';
import AdminNavbar from '@/components/ui/admin-navbar';
import Footer from '@/components/ui/footer';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertErrorDialog,
  AlertSuccessDialog,
} from '@/components/ui/alert-dialog';
import { OutlineButton, SuccessButton, WarningButton } from '@/components/ui/button';
import { getStudentKrsDetail, approveKRS, rejectKRS } from '@/services/krsApprovalService';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const DAY_MAP = { 1: 'Senin', 2: 'Selasa', 3: 'Rabu', 4: 'Kamis', 5: 'Jumat', 6: 'Sabtu', 7: 'Minggu' };

function formatJadwal(kc) {
  if (!kc) return '-';
  const raw = kc.day_of_week;
  const day = typeof raw === 'number' ? (DAY_MAP[raw] ?? '-') : (raw ?? '-');
  const start = (kc.start_time ?? '').slice(0, 5);
  const end   = (kc.end_time ?? '').slice(0, 5);
  if (!start && !end) return day;
  return `${day}, ${start}–${end}`;
}

function formatTanggal(krsArr) {
  const dates = (krsArr ?? []).map((k) => k.created_at).filter(Boolean).sort();
  if (dates.length === 0) return '-';
  const d = new Date(dates[dates.length - 1]);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

// A3 memberi summary count per status → status tunggal untuk badge.
function deriveDetailStatus(d) {
  const s = d?.summary ?? {};
  if ((s.pending?.count  ?? 0) > 0) return 'menunggu';
  if ((s.approved?.count ?? 0) > 0) return 'disetujui';
  if ((s.rejected?.count ?? 0) > 0) return 'ditolak';
  return 'menunggu';
}

// Map response A3 (data.data) → bentuk yang dipakai JSX.
// NIM/prodi/IPK/semester tidak tersedia di BE → fallback (username untuk NIM).
function mapDetail(apiData) {
  const d = apiData?.data ?? {};
  const krsArr = d.krs ?? [];
  return {
    nama:     d.student?.name ?? '-',
    nim:      d.student?.username ?? '-',
    prodi:    '-',
    ipk:      '-',
    semester: '-',
    tanggal:  formatTanggal(krsArr),
    status:   deriveDetailStatus(d),
    matakuliah: krsArr.map((k) => ({
      kode:   k.krsClass?.subject?.code_subject ?? k.subject?.code_subject ?? '-',
      nama:   k.krsClass?.subject?.name_subject ?? k.subject?.name_subject ?? '-',
      dosen:  (k.krsClass?.lecturers ?? []).map((l) => l.name).join(', ') || '-',
      jadwal: formatJadwal(k.krsClass),
      kelas:  k.krsClass?.code_class ? `Kelas ${k.krsClass.code_class}` : '-',
      sks:    k.krsClass?.subject?.sks ?? k.subject?.sks ?? 0,
      jenis:  '-',   // BE tidak punya field wajib/pilihan
    })),
    krs: krsArr,     // entri mentah untuk approve/reject per id_krs
  };
}

function resolveErrorMessage(err) {
  if (!err) return 'Terjadi kesalahan, coba beberapa saat lagi';
  if (err.status === 403) return 'Anda tidak memiliki akses ke fitur ini';
  if (err.status >= 500)  return 'Terjadi kesalahan, coba beberapa saat lagi';
  if (err.errors && typeof err.errors === 'object') {
    const msgs = Object.values(err.errors).flat().filter(Boolean);
    if (msgs.length) return msgs.join(' ');
  }
  return err.message || 'Terjadi kesalahan, coba beberapa saat lagi';
}
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  menunggu:  { label: 'Menunggu',  bg: '#FEF3C7', text: '#92400E', border: '#FCD34D', Icon: Clock },
  disetujui: { label: 'Disetujui', bg: '#DCFCE7', text: '#15803D', border: '#86EFAC', Icon: CheckCircle2 },
  ditolak:   { label: 'Ditolak',   bg: '#FEE2E2', text: '#BE0414', border: '#FCA5A5', Icon: XCircle },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.menunggu;
  const { Icon } = cfg;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function JenisBadge({ jenis }) {
  const isWajib = jenis === 'Wajib';
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
      style={isWajib
        ? { backgroundColor: '#EFF6EE', color: '#015023', border: '1px solid #b7dfb0' }
        : { backgroundColor: '#F5F3FF', color: '#5B21B6', border: '1px solid #C4B5FD' }}
    >
      {jenis}
    </span>
  );
}

// ─── Approve Modal ────────────────────────────────────────────────────────────
function ApproveModal({ open, onOpenChange, detail, onConfirm }) {
  const [catatan, setCatatan] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm(catatan);
    setLoading(false);
    setCatatan('');
  };

  if (!open) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#DCFCE7' }}>
                <ThumbsUp className="w-5 h-5" style={{ color: '#15803D' }} />
              </div>
              <div>
                <AlertDialogTitle>Setujui KRS</AlertDialogTitle>
                <p className="text-sm text-gray-500 mt-0.5">Konfirmasi Keputusan</p>
              </div>
            </div>
            <button onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-gray-600 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </AlertDialogHeader>

        {detail && (
          <div className="rounded-xl p-4 text-sm space-y-1"
            style={{ backgroundColor: '#F0FFF4', border: '1px solid #86EFAC' }}>
            <p style={{ color: '#015023' }}><span className="font-semibold">Mahasiswa:</span> {detail.nama}</p>
            <p style={{ color: '#015023' }}><span className="font-semibold">NIM:</span> {detail.nim}</p>
            <p style={{ color: '#015023' }}>
              <span className="font-semibold">Total SKS:</span>{' '}
              {detail.matakuliah?.reduce((a, m) => a + m.sks, 0) ?? 0} SKS
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>
            Catatan (Opsional):
          </label>
          <textarea
            value={catatan}
            onChange={e => setCatatan(e.target.value)}
            placeholder="Tambahkan catatan untuk mahasiswa (opsional)"
            rows={3}
            className="w-full rounded-xl p-3 text-sm resize-none outline-none transition"
            style={{ border: '1.5px solid #E5E7EB', fontFamily: 'Urbanist, sans-serif', color: '#374151' }}
            onFocus={e => (e.target.style.borderColor = '#15803D')}
            onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
          />
          <p className="text-xs mt-1.5" style={{ color: '#6B7280' }}>
            KRS mahasiswa akan disetujui dan mahasiswa dapat mengikuti perkuliahan.
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <OutlineButton>Batal</OutlineButton>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <SuccessButton onClick={handleConfirm} disabled={loading}>
              {loading ? 'Memproses...' : 'Ya, Setujui'}
            </SuccessButton>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Reject Modal ─────────────────────────────────────────────────────────────
function RejectModal({ open, onOpenChange, detail, onConfirm }) {
  const [catatan, setCatatan] = useState('');
  const [loading, setLoading] = useState(false);
  const [catatanError, setCatatanError] = useState('');

  const handleConfirm = async () => {
    if (!catatan.trim()) {
      setCatatanError('Catatan penolakan wajib diisi.');
      return;
    }
    setCatatanError('');
    setLoading(true);
    await onConfirm(catatan);
    setLoading(false);
    setCatatan('');
  };

  if (!open) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#FEE2E2' }}>
                <ThumbsDown className="w-5 h-5" style={{ color: '#BE0414' }} />
              </div>
              <div>
                <AlertDialogTitle style={{ color: '#BE0414' }}>Tolak KRS</AlertDialogTitle>
                <p className="text-sm text-gray-500 mt-0.5">Konfirmasi Keputusan</p>
              </div>
            </div>
            <button onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-gray-600 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </AlertDialogHeader>

        {detail && (
          <div className="rounded-xl p-4 text-sm space-y-1"
            style={{ backgroundColor: '#FFF5F5', border: '1px solid #FCA5A5' }}>
            <p style={{ color: '#015023' }}><span className="font-semibold">Mahasiswa:</span> {detail.nama}</p>
            <p style={{ color: '#015023' }}><span className="font-semibold">NIM:</span> {detail.nim}</p>
            <p style={{ color: '#015023' }}>
              <span className="font-semibold">Total SKS:</span>{' '}
              {detail.matakuliah?.reduce((a, m) => a + m.sks, 0) ?? 0} SKS
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>
            Catatan (Wajib):
          </label>
          <textarea
            value={catatan}
            onChange={e => { setCatatan(e.target.value); if (e.target.value.trim()) setCatatanError(''); }}
            placeholder="Jelaskan alasan penolakan KRS..."
            rows={3}
            className="w-full rounded-xl p-3 text-sm resize-none outline-none transition"
            style={{
              border: `1.5px solid ${catatanError ? '#FCA5A5' : '#E5E7EB'}`,
              fontFamily: 'Urbanist, sans-serif', color: '#374151'
            }}
            onFocus={e => (e.target.style.borderColor = catatanError ? '#FCA5A5' : '#BE0414')}
            onBlur={e => (e.target.style.borderColor = catatanError ? '#FCA5A5' : '#E5E7EB')}
          />
          {catatanError
            ? <p className="text-xs mt-1.5 text-red-500">{catatanError}</p>
            : <p className="text-xs mt-1.5" style={{ color: '#BE0414' }}>
                KRS mahasiswa akan ditolak dan mahasiswa harus memperbaiki KRS.
              </p>
          }
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <OutlineButton>Batal</OutlineButton>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <WarningButton onClick={handleConfirm} disabled={loading}>
              {loading ? 'Memproses...' : 'Ya, Tolak'}
            </WarningButton>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DetailApprovalKRS() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);

  const [detail, setDetail]             = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [currentStatus, setCurrentStatus] = useState(null);

  const [showApprove, setShowApprove]   = useState(false);
  const [showReject, setShowReject]     = useState(false);
  const [showSuccess, setShowSuccess]   = useState(false);
  const [showError, setShowError]       = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await getStudentKrsDetail(id);
    if (err) {
      setDetail(null);
      setError(err.status === 404
        ? 'Data pengajuan KRS tidak ditemukan.'
        : resolveErrorMessage(err));
      setLoading(false);
      return;
    }
    const mapped = mapDetail(data);
    setDetail(mapped);
    setCurrentStatus(mapped.status);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const totalSks = detail?.matakuliah?.reduce((a, m) => a + m.sks, 0) ?? 0;
  const totalMk  = detail?.matakuliah?.length ?? 0;

  // BE approve/reject bersifat per-entri (id_krs), bukan per-mahasiswa.
  // UI hanya punya 1 tombol per keputusan → proses semua entri pending sekaligus.
  const handleApprove = async (catatan) => {
    const pending = (detail?.krs ?? []).filter((k) => k.status === 'pending');
    if (pending.length === 0) {
      setShowApprove(false);
      setDialogMessage('Tidak ada pengajuan KRS berstatus menunggu untuk disetujui.');
      setShowError(true);
      return;
    }
    for (const k of pending) {
      const { error: err } = await approveKRS(k.id_krs, catatan);
      if (err) {
        setShowApprove(false);
        setDialogMessage(resolveErrorMessage(err));
        setShowError(true);
        await load(); // refresh agar entri yang sudah diproses tercermin
        return;
      }
    }
    setShowApprove(false);
    setCurrentStatus('disetujui');
    setDialogMessage('KRS mahasiswa berhasil disetujui.');
    setShowSuccess(true);
  };

  const handleReject = async (catatan) => {
    const pending = (detail?.krs ?? []).filter((k) => k.status === 'pending');
    if (pending.length === 0) {
      setShowReject(false);
      setDialogMessage('Tidak ada pengajuan KRS berstatus menunggu untuk ditolak.');
      setShowError(true);
      return;
    }
    // rejectKRS butuh confirmed === true; modal ini sudah berperan sebagai konfirmasi.
    for (const k of pending) {
      const { error: err } = await rejectKRS(k.id_krs, catatan, true);
      if (err) {
        setShowReject(false);
        setDialogMessage(resolveErrorMessage(err));
        setShowError(true);
        await load();
        return;
      }
    }
    setShowReject(false);
    setCurrentStatus('ditolak');
    setDialogMessage('KRS mahasiswa berhasil ditolak.');
    setShowSuccess(true);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: 'Urbanist, sans-serif' }}>
      <AdminNavbar title="Dashboard Manager" />

      <main className="flex-1" style={{ backgroundColor: '#F1F5F0' }}>
        <div className="max-w-7xl mx-auto p-4 sm:p-6">

          {/* Page Header */}
          <div className="mb-5">
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#015023' }}>
              Detail KRS — {loading ? '...' : detail?.nama}
            </h1>
            {!loading && detail && (
              <p className="text-sm text-gray-500 mt-1">
                NIM {detail.nim} · {detail.prodi} · Semester {detail.semester}
              </p>
            )}
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-5">
            <button
              onClick={() => router.push('/adminpage/approvalKRS')}
              className="hover:underline transition"
              style={{ color: '#015023' }}
            >
              ← Daftar Approval KRS
            </button>
            <span className="text-gray-400">›</span>
            <span className="font-medium" style={{ color: '#015023' }}>
              Detail KRS — {detail?.nama ?? '...'}
            </span>
            {currentStatus && <StatusBadge status={currentStatus} />}
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl p-4 mb-4 text-sm"
              style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', color: '#BE0414' }}>
              {error}
            </div>
          )}

          {/* Student Info Card */}
          {!loading && detail && (
            <div
              className="rounded-xl p-5 mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              style={{ backgroundColor: '#F5F0E8', border: '1px solid #e8dfc8' }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#EFE8D5' }}
                >
                  <GraduationCap className="w-7 h-7" style={{ color: '#92400E' }} />
                </div>
                <div>
                  <p className="font-bold text-lg" style={{ color: '#1a1a1a' }}>{detail.nama}</p>
                  <p className="text-sm text-gray-500">{detail.prodi}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>{detail.tanggal}</span>
              </div>

              <div className="grid grid-cols-5 gap-4 sm:gap-6">
                {[
                  { label: 'NIM',      value: detail.nim },
                  { label: 'IPK',      value: detail.ipk },
                  { label: 'SKS',      value: totalSks },
                  { label: 'MK',       value: totalMk },
                  { label: 'Semester', value: detail.semester },
                ].map(item => (
                  <div key={item.label} className="text-center">
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="font-bold text-base mt-0.5" style={{ color: '#1a1a1a' }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Course Table */}
          {!loading && detail && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-5"
              style={{ border: '1px solid #e5e7eb' }}>
              {/* Header */}
              <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
                <BookOpen className="w-5 h-5" style={{ color: '#015023' }} />
                <h2 className="font-bold text-base" style={{ color: '#015023' }}>
                  {totalMk} Mata Kuliah Dipilih
                </h2>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: '#015023' }}>
                      {['No', 'Kode MK', 'Mata Kuliah', 'Dosen', 'Jadwal & Kelas', 'SKS', 'Jenis'].map(h => (
                        <th key={h} className="p-4 text-center font-semibold text-white text-sm whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {detail.matakuliah.map((mk, idx) => (
                      <tr key={mk.kode} className="border-b border-gray-50 hover:bg-gray-50 transition">
                        <td className="p-4 text-center text-sm text-gray-500">{idx + 1}</td>
                        <td className="p-4 text-center text-sm text-gray-400 font-mono">{mk.kode}</td>
                        <td className="p-4 text-left text-sm font-semibold" style={{ color: '#1a1a1a' }}>{mk.nama}</td>
                        <td className="p-4 text-left text-sm text-gray-600">{mk.dosen}</td>
                        <td className="p-4 text-left text-sm text-gray-600">
                          <p>{mk.jadwal}</p>
                          <p className="text-xs text-gray-400">{mk.kelas}</p>
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold"
                            style={{ backgroundColor: '#EFF6EE', color: '#015023', border: '1px solid #b7dfb0' }}>
                            {mk.sks} SKS
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <JenisBadge jenis={mk.jenis} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
                <span>Total: {totalMk} Mata Kuliah · {totalSks} SKS</span>
                <span>Tinjau semua mata kuliah sebelum memberi keputusan</span>
              </div>
            </div>
          )}

          {/* Action Buttons — only show when status is menunggu */}
          {!loading && detail && currentStatus === 'menunggu' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setShowApprove(true)}
                className="flex items-center justify-center gap-2 py-4 rounded-xl text-white font-bold text-base transition hover:opacity-90"
                style={{ backgroundColor: '#15803D' }}
              >
                <ThumbsUp className="w-5 h-5" />
                Setujui KRS
              </button>
              <button
                onClick={() => setShowReject(true)}
                className="flex items-center justify-center gap-2 py-4 rounded-xl text-white font-bold text-base transition hover:opacity-90"
                style={{ backgroundColor: '#BE0414' }}
              >
                <ThumbsDown className="w-5 h-5" />
                Tolak KRS
              </button>
            </div>
          )}

          {/* Already decided */}
          {!loading && detail && currentStatus !== 'menunggu' && (
            <div className="rounded-xl p-4 text-center text-sm font-semibold"
              style={{
                backgroundColor: currentStatus === 'disetujui' ? '#DCFCE7' : '#FEE2E2',
                color: currentStatus === 'disetujui' ? '#15803D' : '#BE0414',
                border: `1px solid ${currentStatus === 'disetujui' ? '#86EFAC' : '#FCA5A5'}`,
              }}>
              {currentStatus === 'disetujui'
                ? '✓ KRS ini telah disetujui.'
                : '✗ KRS ini telah ditolak.'}
            </div>
          )}

        </div>
      </main>

      <Footer />

      {/* Modals */}
      <ApproveModal
        open={showApprove}
        onOpenChange={setShowApprove}
        detail={detail}
        onConfirm={handleApprove}
      />
      <RejectModal
        open={showReject}
        onOpenChange={setShowReject}
        detail={detail}
        onConfirm={handleReject}
      />
      <AlertSuccessDialog
        open={showSuccess}
        onOpenChange={setShowSuccess}
        description={dialogMessage}
        closeText="Tutup"
      />
      <AlertErrorDialog
        open={showError}
        onOpenChange={setShowError}
        description={dialogMessage}
      />
    </div>
  );
}
