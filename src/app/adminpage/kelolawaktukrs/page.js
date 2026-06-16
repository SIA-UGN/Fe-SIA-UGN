'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Info,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Power,
  BookOpen,
  X,
  Search,
} from 'lucide-react';
import AdminNavbar from '@/components/ui/admin-navbar';
import Footer from '@/components/ui/footer';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertErrorDialog,
  AlertSuccessDialog,
} from '@/components/ui/alert-dialog';
import { OutlineButton, SuccessButton } from '@/components/ui/button';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import {
  getKrsSessions,
  closeKrsSession,
  getKrsSessionClasses,
  addClassesToKrsSession,
  removeClassFromKrsSession,
} from '@/services/adminKrsSessionService';
import { getClasses } from '@/services/classService';

// ─── Helpers ────────────────────────────────────────────────────────────────
// Status BE sesi KRS hanya open/closed → petakan ke status badge UI.
function mapSessionStatus(apiStatus) {
  return apiStatus === 'open' ? 'aktif' : 'selesai';
}

function resolveErrorMessage(err) {
  if (!err) return 'Terjadi kesalahan, coba beberapa saat lagi';
  if (err.status === 403) return 'Anda tidak memiliki akses ke fitur ini';
  if (err.status >= 500)  return 'Terjadi kesalahan, coba beberapa saat lagi';
  return err.message || 'Terjadi kesalahan, coba beberapa saat lagi';
}
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  aktif:    { label: 'Aktif',    bg: '#16874B', text: '#fff' },
  nonaktif: { label: 'Nonaktif', bg: '#6B7280', text: '#fff' },
  selesai:  { label: 'Selesai', bg: '#2563EB', text: '#fff' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.nonaktif;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
    >
      {status === 'aktif'    && <CheckCircle2 className="w-3 h-3" />}
      {status === 'nonaktif' && <XCircle      className="w-3 h-3" />}
      {status === 'selesai'  && <Clock        className="w-3 h-3" />}
      {cfg.label}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

// day_of_week BE bisa integer (1=Senin..7=Minggu) atau string sudah ter-format.
const DAY_MAP = { 1: 'Senin', 2: 'Selasa', 3: 'Rabu', 4: 'Kamis', 5: 'Jumat', 6: 'Sabtu', 7: 'Minggu' };
function formatDay(raw) {
  if (raw == null) return '-';
  if (typeof raw === 'number') return DAY_MAP[raw] ?? '-';
  return DAY_MAP[Number(raw)] ?? raw;
}

function formatTime(t) {
  return t ? String(t).slice(0, 5) : '--:--';
}

// Rakit label jadwal kelas untuk ditampilkan di tabel/picker.
function formatSchedule(kc) {
  if (!kc) return '-';
  const day = formatDay(kc.day_of_week);
  const start = formatTime(kc.start_time);
  const end = formatTime(kc.end_time);
  if (start === '--:--' && end === '--:--') return day;
  return `${day}, ${start}–${end}`;
}

export default function KelolaWaktuKRS() {
  const router = useRouter();

  const [sessions, setSessions]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [refreshKey, setRefreshKey]   = useState(0);
  const refetch = () => setRefreshKey((k) => k + 1);

  // dialogs
  const [showErrorDialog, setShowErrorDialog]   = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  // ── Kelola Kelas (B5/B6/B7 + E1) ───────────────────────────────────────────
  const [classModalSession, setClassModalSession] = useState(null); // sesi yang sedang dikelola kelasnya
  const [sessionClasses, setSessionClasses] = useState([]);         // kelas dalam whitelist sesi (B5)
  const [classLoading, setClassLoading] = useState(false);
  const [classError, setClassError] = useState(null);
  const [allClasses, setAllClasses] = useState([]);                 // semua kelas (E1) untuk picker
  const [classSearch, setClassSearch] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [classActionLoading, setClassActionLoading] = useState(false);

  // ── Fetch (B1) ─────────────────────────────────────────────────────────────
  const loadSessions = async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await getKrsSessions();
    if (err) {
      setSessions([]);
      setError(resolveErrorMessage(err));
      setLoading(false);
      return;
    }
    // B1: paginasi ada di data.data → { current_page, data: [...], ... }
    const rows = (data?.data?.data ?? []).map((s) => ({
      id:         s.id_krs_session,
      name:       s.academic_period?.name ?? `Sesi KRS #${s.id_krs_session}`,
      start_date: (s.opened_at ?? '').slice(0, 10),
      end_date:   s.closed_at ? s.closed_at.slice(0, 10) : '',
      status:     mapSessionStatus(s.status),
    }));
    setSessions(rows);
    setLoading(false);
  };

  useEffect(() => { loadSessions(); }, [refreshKey]);

  // ── Stats ────────────────────────────────────────────────────────────────
  const total    = sessions.length;
  const aktif    = sessions.filter(s => s.status === 'aktif').length;
  const nonaktif = sessions.filter(s => s.status === 'nonaktif').length;
  const selesai  = sessions.filter(s => s.status === 'selesai').length;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleAdd = () => router.push('/adminpage/kelolawaktukrs/addform');

  const handleEdit = (session) =>
    router.push(`/adminpage/kelolawaktukrs/editform?id=${session.id}`);

  // Catatan: BE TIDAK punya endpoint hapus sesi. Aksi yang tersedia hanya
  // "tutup sesi" (B4) → tombol Power memetakan ke close. Sesi yang sudah
  // ditutup tidak dapat dibuka kembali.
  const handleToggleStatus = async (session) => {
    if (session.status !== 'aktif') return; // hanya sesi aktif yang bisa ditutup
    if (!confirm('Yakin ingin menutup sesi KRS ini? Setelah ditutup, sesi tidak dapat dibuka kembali.')) return;
    const { error: err } = await closeKrsSession(session.id, true);
    if (err) {
      setDialogMessage(resolveErrorMessage(err));
      setShowErrorDialog(true);
      return;
    }
    setDialogMessage(`Sesi "${session.name}" berhasil ditutup.`);
    setShowSuccessDialog(true);
    refetch();
  };

  const handleBack = () => router.push('/adminpage');

  // ── Kelola Kelas dalam Sesi ────────────────────────────────────────────────
  // B5: ambil daftar kelas whitelist sesi. Paginator dibungkus di data.classes.
  const loadSessionClasses = async (sessionId) => {
    setClassLoading(true);
    setClassError(null);
    const { data, error: err } = await getKrsSessionClasses(sessionId);
    if (err) {
      setSessionClasses([]);
      setClassError(resolveErrorMessage(err));
      setClassLoading(false);
      return;
    }
    const rows = (data?.data?.classes?.data ?? []).map((c) => ({
      id_class:     c.id_class,
      kode_mk:      c.subject?.code_subject ?? '-',
      nama_mk:      c.subject?.name_subject ?? '-',
      sks:          c.subject?.sks ?? 0,
      kode_kelas:   c.krsClass?.code_class ?? c.krs_class?.code_class ?? '-',
      jadwal:       formatSchedule(c.krsClass ?? c.krs_class),
    }));
    setSessionClasses(rows);
    setClassLoading(false);
  };

  // E1: daftar semua kelas untuk dropdown picker. Dimuat sekali saat modal dibuka.
  const loadAllClasses = async () => {
    const { data, error: err } = await getClasses();
    if (err) return; // picker tetap kosong; error utama sudah dari B5
    const list = data?.data ?? [];
    setAllClasses(Array.isArray(list) ? list : []);
  };

  const handleOpenClassModal = async (session) => {
    setClassModalSession(session);
    setSelectedClassId('');
    setClassSearch('');
    await Promise.all([loadSessionClasses(session.id), loadAllClasses()]);
  };

  const handleCloseClassModal = () => {
    setClassModalSession(null);
    setSessionClasses([]);
    setClassError(null);
    setSelectedClassId('');
    setClassSearch('');
  };

  // B6: tambah kelas terpilih ke whitelist sesi.
  const handleAddClass = async () => {
    if (!classModalSession || !selectedClassId) return;
    setClassActionLoading(true);
    const { data, error: err } = await addClassesToKrsSession(classModalSession.id, {
      classes: [{ id_class: Number(selectedClassId) }],
    });
    setClassActionLoading(false);
    if (err) {
      setClassError(resolveErrorMessage(err));
      return;
    }
    // BE balas { added, skipped, total_classes } — beri info bila kelas sudah ada.
    if ((data?.data?.added ?? 0) === 0) {
      setClassError('Kelas tersebut sudah terdaftar dalam sesi ini.');
    }
    setSelectedClassId('');
    await loadSessionClasses(classModalSession.id);
  };

  // B7: hapus kelas dari whitelist sesi (dicegah BE bila sudah ada pengajuan).
  const handleRemoveClass = async (idClass) => {
    if (!classModalSession) return;
    if (!confirm('Yakin ingin menghapus kelas ini dari sesi KRS?')) return;
    setClassActionLoading(true);
    const { error: err } = await removeClassFromKrsSession(classModalSession.id, idClass, true);
    setClassActionLoading(false);
    if (err) {
      setClassError(resolveErrorMessage(err));
      return;
    }
    await loadSessionClasses(classModalSession.id);
  };

  // Kelas yang belum ada di sesi + cocok pencarian → opsi dropdown.
  const registeredClassIds = new Set(sessionClasses.map((c) => c.id_class));
  const availableClasses = allClasses
    .filter((c) => !registeredClassIds.has(c.id_class))
    .filter((c) => {
      const kw = classSearch.trim().toLowerCase();
      if (!kw) return true;
      return [c.name_subject, c.code_subject, c.code_class, c.schedule]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(kw);
    });

  // ── UI ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: 'Urbanist, sans-serif' }}>
      <AdminNavbar title="Dashboard Manager" />

      <main className="flex-1 bg-brand-light-sage" style={{ backgroundColor: '#F1F5F0' }}>
        <div className="max-w-7xl mx-auto p-4 sm:p-6">

          {/* Back button */}
          <div className="mb-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-sm font-medium hover:opacity-80 transition"
              style={{ color: '#015023' }}
            >
              <ArrowLeft className="w-5 h-5" />
              Kembali ke Dashboard
            </button>
          </div>

          {/* Page header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#015023' }}>
              Kelola Waktu KRS
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Atur jadwal pembukaan dan penutupan pengisian KRS untuk setiap semester
            </p>
          </div>

          {/* Error */}
          {error && (
            <ErrorMessageBoxWithButton message={error} action={loadSessions} />
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Sesi',  value: total,    icon: <Calendar className="w-5 h-5" />, iconBg: '#015023', border: '#015023' },
              { label: 'Sesi Aktif', value: aktif,    icon: <CheckCircle2 className="w-5 h-5" />, iconBg: '#16874B', border: '#16874B' },
              { label: 'Nonaktif',   value: nonaktif, icon: <XCircle className="w-5 h-5" />, iconBg: '#6B7280', border: '#6B7280' },
              { label: 'Selesai',    value: selesai,  icon: <Clock className="w-5 h-5" />, iconBg: '#2563EB', border: '#2563EB' },
            ].map((card) => (
              <div
                key={card.label}
                className="bg-white rounded-xl p-4 sm:p-5 shadow-sm flex items-center justify-between"
                style={{ border: `1px solid #e5e7eb` }}
              >
                <div>
                  <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                  <p className="text-3xl font-bold" style={{ color: '#015023' }}>
                    {loading ? '...' : card.value}
                  </p>
                </div>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0"
                  style={{ backgroundColor: card.iconBg }}
                >
                  {card.icon}
                </div>
              </div>
            ))}
          </div>

          {/* Info banner */}
          <div
            className="flex items-start gap-3 p-4 rounded-xl mb-6 text-sm"
            style={{ backgroundColor: '#EFF6EE', border: '1px solid #b7dfb0' }}
          >
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#015023' }} />
            <p style={{ color: '#015023' }}>
              <span className="font-semibold">Waktu KRS:</span>{' '}
              Atur jadwal pembukaan dan penutupan pengisian KRS untuk setiap semester. Hanya satu sesi yang dapat berstatus{' '}
              <span className="font-bold text-green-700">Aktif</span> pada satu waktu.
            </p>
          </div>

          {/* Table card */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
            {/* Table header row */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold" style={{ color: '#015023' }}>Daftar Sesi KRS</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {loading ? 'Memuat...' : `${sessions.length} sesi terdaftar`}
                </p>
              </div>
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 shadow-sm hover:opacity-90 transition"
                style={{ backgroundColor: '#DABC4E', borderRadius: '10px', color: '#015023' }}
              >
                <Plus className="w-4 h-4" />
                Tambah Sesi KRS Baru
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: '#015023' }}>
                    {['No', 'Nama Sesi', 'Tanggal Mulai', 'Tanggal Selesai', 'Status', 'Aksi'].map((h) => (
                      <th
                        key={h}
                        className="text-center p-4 font-semibold text-white text-sm"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                        Memuat data...
                      </td>
                    </tr>
                  ) : sessions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                        Tidak ada data sesi KRS
                      </td>
                    </tr>
                  ) : (
                    sessions.map((session, idx) => (
                      <tr
                        key={session.id}
                        className="border-b border-gray-50 hover:bg-gray-50 transition"
                      >
                        {/* No */}
                        <td className="text-center p-4 text-sm text-gray-500 font-medium w-12">
                          {idx + 1}
                        </td>
                        {/* Nama */}
                        <td className="p-4 text-left">
                          <p className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>
                            {session.name}
                          </p>
                          <div className="mt-1">
                            <StatusBadge status={session.status} />
                          </div>
                        </td>
                        {/* Tanggal Mulai */}
                        <td className="text-center p-4 text-sm font-medium" style={{ color: '#DABC4E' }}>
                          {formatDate(session.start_date)}
                        </td>
                        {/* Tanggal Selesai */}
                        <td className="text-center p-4 text-sm font-medium" style={{ color: '#DABC4E' }}>
                          {formatDate(session.end_date)}
                        </td>
                        {/* Status */}
                        <td className="text-center p-4">
                          <StatusBadge status={session.status} />
                        </td>
                        {/* Aksi */}
                        <td className="text-center p-4">
                          <div className="flex items-center justify-center gap-2">
                            {/* Kelola Kelas dalam sesi */}
                            <button
                              onClick={() => handleOpenClassModal(session)}
                              className="p-2 rounded-xl text-white hover:opacity-80 transition shadow-sm"
                              style={{ backgroundColor: '#4F46E5' }}
                              title="Kelola kelas dalam sesi"
                            >
                              <BookOpen className="w-4 h-4" />
                            </button>
                            {/* Toggle Status */}
                            <button
                              onClick={() => handleToggleStatus(session)}
                              className="p-2 rounded-xl text-white hover:opacity-80 transition shadow-sm"
                              style={{
                                backgroundColor:
                                  session.status === 'aktif' ? '#16874B' :
                                  session.status === 'selesai' ? '#2563EB' :
                                  '#6B7280',
                              }}
                              title={
                                session.status === 'aktif' ? 'Tutup sesi' : 'Sesi sudah ditutup'
                              }
                            >
                              <Power className="w-4 h-4" />
                            </button>
                            {/* Edit */}
                            <button
                              onClick={() => handleEdit(session)}
                              className="p-2 rounded-xl text-white hover:opacity-80 transition shadow-sm"
                              style={{ backgroundColor: '#16874B' }}
                              title="Edit sesi"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table footer info */}
            {!loading && sessions.length > 0 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
                <span>Menampilkan {sessions.length} dari {sessions.length} sesi</span>
                <span>Klik ikon status untuk mengubah status sesi secara cepat</span>
              </div>
            )}
          </div>

          {/* Legend */}
          <div
            className="mt-4 flex flex-wrap items-center gap-4 px-5 py-4 rounded-xl text-xs"
            style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
          >
            <span className="font-semibold" style={{ color: '#015023' }}>Keterangan Tombol Aksi:</span>
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: '#4F46E5' }}>
                <BookOpen className="w-3 h-3" />
              </span>
              <span className="text-gray-600">Kelola kelas dalam sesi</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: '#16874B' }}>
                <Power className="w-3 h-3" />
              </span>
              <span className="text-gray-600">Aktif → tutup sesi</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: '#2563EB' }}>
                <Power className="w-3 h-3" />
              </span>
              <span className="text-gray-600">Selesai (sudah ditutup)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: '#16874B' }}>
                <Edit className="w-3 h-3" />
              </span>
              <span className="text-gray-600">Edit sesi</span>
            </span>
          </div>

        </div>
      </main>

      <Footer />

      {/* ── Kelola Kelas dalam Sesi Modal ──────────────────────────────────── */}
      <AlertDialog
        open={!!classModalSession}
        onOpenChange={(open) => { if (!open) handleCloseClassModal(); }}
      >
        <AlertDialogContent className="max-w-2xl overflow-hidden">
          <AlertDialogHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#EEF2FF' }}
                >
                  <BookOpen className="w-5 h-5" style={{ color: '#4F46E5' }} />
                </div>
                <div className="min-w-0">
                  <AlertDialogTitle>Kelola Kelas Sesi KRS</AlertDialogTitle>
                  <p className="text-sm text-gray-500 mt-0.5 truncate">{classModalSession?.name}</p>
                </div>
              </div>
              <button
                onClick={handleCloseClassModal}
                className="text-gray-400 hover:text-gray-600 transition flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </AlertDialogHeader>

          {/* Error dalam modal */}
          {classError && (
            <div
              className="rounded-xl p-3 text-sm min-w-0 break-words"
              style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', color: '#BE0414' }}
            >
              {classError}
            </div>
          )}

          {/* Tambah kelas: search + dropdown + tombol */}
          <div className="rounded-xl p-4 space-y-3 min-w-0" style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
            <p className="text-sm font-semibold" style={{ color: '#015023' }}>Tambahkan Kelas ke Sesi</p>

            <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm bg-white" style={{ border: '1px solid #E5E7EB' }}>
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Cari mata kuliah / kode kelas..."
                value={classSearch}
                onChange={(e) => setClassSearch(e.target.value)}
                className="flex-1 min-w-0 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="flex-1 min-w-0 rounded-xl px-3 py-2.5 text-sm bg-white outline-none truncate"
                style={{ border: '1px solid #E5E7EB', color: '#374151', fontFamily: 'Urbanist, sans-serif' }}
              >
                <option value="">-- Pilih Kelas --</option>
                {availableClasses.map((c) => (
                  <option key={c.id_class} value={c.id_class}>
                    {c.code_subject ? `${c.code_subject} · ` : ''}{c.name_subject ?? 'Kelas'}
                    {c.code_class ? ` — ${c.code_class}` : ''}
                    {c.schedule ? ` (${c.schedule})` : ''}
                  </option>
                ))}
              </select>
              <SuccessButton
                onClick={handleAddClass}
                disabled={!selectedClassId || classActionLoading}
                className="whitespace-nowrap shrink-0 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-1" />
                {classActionLoading ? 'Memproses...' : 'Tambah'}
              </SuccessButton>
            </div>
            {availableClasses.length === 0 && (
              <p className="text-xs text-gray-400">Tidak ada kelas lain yang dapat ditambahkan.</p>
            )}
          </div>

          {/* Daftar kelas dalam sesi */}
          <div className="rounded-xl overflow-hidden min-w-0" style={{ border: '1px solid #E5E7EB' }}>
            <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-semibold" style={{ color: '#015023' }}>Kelas Terdaftar</p>
              <span className="text-xs text-gray-400">
                {classLoading ? 'Memuat...' : `${sessionClasses.length} kelas`}
              </span>
            </div>

            <div className="max-h-72 overflow-auto">
              <table className="w-full min-w-[460px]">
                <thead>
                  <tr style={{ backgroundColor: '#015023' }}>
                    {['No', 'Mata Kuliah', 'Kelas', 'Jadwal', 'SKS', 'Aksi'].map((h) => (
                      <th key={h} className="p-2.5 text-center font-semibold text-white text-xs whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {classLoading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-400 text-sm">Memuat data...</td>
                    </tr>
                  ) : sessionClasses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-400 text-sm">
                        Belum ada kelas dalam sesi ini.
                      </td>
                    </tr>
                  ) : (
                    sessionClasses.map((c, idx) => (
                      <tr key={c.id_class} className="border-b border-gray-50 hover:bg-gray-50 transition">
                        <td className="p-2.5 text-center text-xs text-gray-500">{idx + 1}</td>
                        <td className="p-2.5 text-left">
                          <p className="text-sm font-semibold" style={{ color: '#1a1a1a' }}>{c.nama_mk}</p>
                          <p className="text-xs text-gray-400">{c.kode_mk}</p>
                        </td>
                        <td className="p-2.5 text-center text-sm text-gray-600">{c.kode_kelas}</td>
                        <td className="p-2.5 text-center text-xs text-gray-600 whitespace-nowrap">{c.jadwal}</td>
                        <td className="p-2.5 text-center">
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold"
                            style={{ backgroundColor: '#EFF6EE', color: '#015023', border: '1px solid #b7dfb0' }}
                          >
                            {c.sks}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            onClick={() => handleRemoveClass(c.id_class)}
                            disabled={classActionLoading}
                            className="p-1.5 rounded-lg text-white hover:opacity-80 transition shadow-sm disabled:opacity-50"
                            style={{ backgroundColor: '#BE0414' }}
                            title="Hapus kelas dari sesi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <AlertDialogFooter>
            <OutlineButton onClick={handleCloseClassModal}>Tutup</OutlineButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Error Dialog ──────────────────────────────────────────────────── */}
      <AlertErrorDialog
        open={showErrorDialog}
        onOpenChange={setShowErrorDialog}
        description={dialogMessage}
      />

      {/* ── Success Dialog ────────────────────────────────────────────────── */}
      <AlertSuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        description={dialogMessage}
        closeText="Tutup"
      />
    </div>
  );
}
