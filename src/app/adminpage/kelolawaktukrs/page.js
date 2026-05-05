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
} from 'lucide-react';
import AdminNavbar from '@/components/ui/admin-navbar';
import Footer from '@/components/ui/footer';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertErrorDialog,
  AlertSuccessDialog,
} from '@/components/ui/alert-dialog';
import { OutlineButton, WarningButton } from '@/components/ui/button';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';

// ─── Dummy helpers (replace with real API calls) ────────────────────────────
async function fetchKrsSessions() {
  // TODO: replace with real API
  return {
    status: 'success',
    data: [
      { id: 1, name: 'Semester Ganjil 2024/2025', start_date: '2025-01-01', end_date: '2025-01-16', status: 'selesai' },
      { id: 2, name: 'Semester Genap 2024/2025', start_date: '2025-01-01', end_date: '2025-01-16', status: 'aktif' },
      { id: 3, name: 'Semester Ganjil 2025/2026', start_date: '2025-01-01', end_date: '2025-01-16', status: 'nonaktif' },
      { id: 4, name: 'Semester Genap 2025/2026', start_date: '2025-01-01', end_date: '2025-01-16', status: 'nonaktif' },
    ],
  };
}

async function deleteKrsSession(id) {
  // TODO: replace with real API
  return { status: 'success' };
}

async function toggleKrsSessionStatus(id, currentStatus) {
  // TODO: replace with real API  — cycles: aktif → nonaktif → aktif
  const next = currentStatus === 'aktif' ? 'nonaktif' : 'aktif';
  return { status: 'success', data: { status: next } };
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

export default function KelolaWaktuKRS() {
  const router = useRouter();

  const [sessions, setSessions]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  // dialogs
  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog]   = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  // ── Fetch ────────────────────────────────────────────────────────────────
  const loadSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchKrsSessions();
      if (res.status === 'success') {
        setSessions(res.data);
      } else {
        setError('Gagal mengambil data sesi KRS.');
      }
    } catch (e) {
      setError('Terjadi kesalahan: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSessions(); }, []);

  // ── Stats ────────────────────────────────────────────────────────────────
  const total    = sessions.length;
  const aktif    = sessions.filter(s => s.status === 'aktif').length;
  const nonaktif = sessions.filter(s => s.status === 'nonaktif').length;
  const selesai  = sessions.filter(s => s.status === 'selesai').length;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleAdd = () => router.push('/adminpage/kelolawaktukrs/addform');

  const handleEdit = (session) =>
    router.push(`/adminpage/kelolawaktukrs/editform?id=${session.id}`);

  const handleDeleteClick = (session) => {
    setDeleteTarget(session);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    setShowDeleteDialog(false);
    try {
      const res = await deleteKrsSession(deleteTarget.id);
      if (res.status === 'success') {
        setSessions(prev => prev.filter(s => s.id !== deleteTarget.id));
        setDialogMessage(`Sesi "${deleteTarget.name}" berhasil dihapus.`);
        setShowSuccessDialog(true);
      } else {
        setDialogMessage('Gagal menghapus sesi KRS.');
        setShowErrorDialog(true);
      }
    } catch (e) {
      setDialogMessage('Terjadi kesalahan: ' + e.message);
      setShowErrorDialog(true);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleToggleStatus = async (session) => {
    try {
      const res = await toggleKrsSessionStatus(session.id, session.status);
      if (res.status === 'success') {
        setSessions(prev =>
          prev.map(s => s.id === session.id ? { ...s, status: res.data.status } : s)
        );
      }
    } catch (e) {
      setDialogMessage('Gagal mengubah status sesi: ' + e.message);
      setShowErrorDialog(true);
    }
  };

  const handleBack = () => router.push('/adminpage');

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
                                session.status === 'aktif'    ? 'Ubah Status' :
                                session.status === 'nonaktif' ? 'Aktifkan' :
                                'Selesai'
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
                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteClick(session)}
                              className="p-2 rounded-xl text-white hover:opacity-80 transition shadow-sm"
                              style={{ backgroundColor: '#BE0414' }}
                              title="Hapus sesi"
                            >
                              <Trash2 className="w-4 h-4" />
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
              <span className="w-5 h-5 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: '#16874B' }}>
                <Power className="w-3 h-3" />
              </span>
              <span className="text-gray-600">Aktif → ubah status</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: '#6B7280' }}>
                <Power className="w-3 h-3" />
              </span>
              <span className="text-gray-600">Nonaktif → klik untuk aktifkan</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: '#2563EB' }}>
                <Power className="w-3 h-3" />
              </span>
              <span className="text-gray-600">Selesai</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: '#16874B' }}>
                <Edit className="w-3 h-3" />
              </span>
              <span className="text-gray-600">Edit sesi</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: '#BE0414' }}>
                <Trash2 className="w-3 h-3" />
              </span>
              <span className="text-gray-600">Hapus sesi</span>
            </span>
          </div>

        </div>
      </main>

      <Footer />

      {/* ── Delete Confirmation Dialog ─────────────────────────────────────── */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            {/* Icon */}
            <div className="flex items-center gap-3 mb-1">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#FEE2E2' }}
              >
                <Trash2 className="w-5 h-5" style={{ color: '#BE0414' }} />
              </div>
              <div>
                <AlertDialogTitle>Hapus Sesi</AlertDialogTitle>
                <p className="text-sm text-gray-500 mt-0.5">Konfirmasi Penghapusan</p>
              </div>
            </div>
          </AlertDialogHeader>

          {/* Session info */}
          {deleteTarget && (
            <div
              className="rounded-xl p-4 text-sm space-y-1"
              style={{ backgroundColor: '#FFF5F5', border: '1px solid #FEC5C5' }}
            >
              <p style={{ color: '#015023' }}>
                <span className="font-semibold">Sesi:</span> {deleteTarget.name}
              </p>
              <p style={{ color: '#015023' }}>
                <span className="font-semibold">Periode:</span>{' '}
                {formatDate(deleteTarget.start_date)} – {formatDate(deleteTarget.end_date)}
              </p>
            </div>
          )}

          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus sesi ini? Data yang terkait dengan sesi ini akan dihapus secara permanen dan tidak dapat dikembalikan.
          </AlertDialogDescription>

          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <OutlineButton>Batal</OutlineButton>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <WarningButton onClick={confirmDelete}>Ya, Hapus</WarningButton>
            </AlertDialogAction>
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
