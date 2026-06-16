'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Search,
  Plus,
  Edit,
  Trash2,
  GraduationCap,
  Users,
  Gauge,
  BookOpen,
  X,
  Info,
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
import { OutlineButton, SuccessButton, WarningButton } from '@/components/ui/button';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import {
  getKrsQuotas,
  upsertKrsQuota,
  updateKrsQuota,
  deleteKrsQuota,
} from '@/services/adminKrsQuotaService';
import { getAcademicPeriods } from '@/services/academicPeriodService';
import { getMahasiswa } from '@/lib/adminApi';

// ─── Helpers ──────────────────────────────────────────────────────────────────
// Map error descriptor service ({ status, message, errors }) → pesan UI.
function resolveErrorMessage(err) {
  if (!err) return 'Terjadi kesalahan, coba beberapa saat lagi';
  if (err.status === 403) return 'Anda tidak memiliki akses ke fitur ini';
  if (err.status >= 500) return 'Terjadi kesalahan, coba beberapa saat lagi';
  if (err.errors && typeof err.errors === 'object') {
    const msgs = Object.values(err.errors).flat().filter(Boolean);
    if (msgs.length) return msgs.join(' ');
  }
  return err.message || 'Terjadi kesalahan, coba beberapa saat lagi';
}

// Normalisasi list mahasiswa (S1) → { id, label, nim, prodi } untuk dropdown & merge.
function mapStudent(s) {
  return {
    id: s.id_user_si,
    nama: s.full_name ?? s.name ?? '-',
    nim: s.registration_number ?? s.username ?? '-',
    prodi: s.program_name ?? '-',
  };
}

const DEFAULT_FORM = {
  id_krs_quota: null, // null = mode tambah, terisi = mode edit
  id_user_si: '',
  id_academic_period: '',
  max_sks: 24,
  notes: '',
};

export default function KelolaKuotaKRS() {
  const router = useRouter();

  const [quotas, setQuotas] = useState([]);
  const [students, setStudents] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const refetch = () => setRefreshKey((k) => k + 1);

  // form modal
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  // delete dialog
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // result dialogs
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  // Index mahasiswa untuk merge NIM/prodi ke baris kuota (C1 tidak menyediakannya).
  const studentIndex = useMemo(() => {
    const map = new Map();
    students.forEach((s) => map.set(s.id, s));
    return map;
  }, [students]);

  // ── Fetch list kuota (C1) ───────────────────────────────────────────────────
  const loadQuotas = async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await getKrsQuotas();
    if (err) {
      setQuotas([]);
      setError(resolveErrorMessage(err));
      setLoading(false);
      return;
    }
    // C1: envelope → paginator → array  (data.data.data)
    const rows = (data?.data?.data ?? []).map((q) => ({
      id: q.id_krs_quota,
      id_user_si: q.id_user_si,
      id_academic_period: q.id_academic_period,
      nama: q.student?.name ?? '-',
      username: q.student?.username ?? '-',
      periode: q.academicPeriod?.name ?? '-',
      max_sks: q.max_sks,
      notes: q.notes ?? '',
      setter: q.setter?.name ?? '-',
    }));
    setQuotas(rows);
    setLoading(false);
  };

  // Dropdown sources (mahasiswa S1 + periode S2) — sekali muat, non-blocking.
  const loadReferences = async () => {
    const [studentsRes, periodsRes] = await Promise.allSettled([
      getMahasiswa(),
      getAcademicPeriods(),
    ]);

    if (studentsRes.status === 'fulfilled') {
      const list = studentsRes.value?.data ?? studentsRes.value ?? [];
      setStudents(Array.isArray(list) ? list.map(mapStudent) : []);
    }
    if (periodsRes.status === 'fulfilled') {
      const list = periodsRes.value?.data?.data ?? periodsRes.value?.data ?? [];
      setPeriods(Array.isArray(list) ? list : []);
    }
  };

  useEffect(() => {
    loadQuotas();
  }, [refreshKey]);

  useEffect(() => {
    loadReferences();
  }, []);

  // ── Stats ────────────────────────────────────────────────────────────────────
  const total = quotas.length;
  const totalSksAlokasi = quotas.reduce((acc, q) => acc + Number(q.max_sks || 0), 0);
  const rataRata = total > 0 ? Math.round(totalSksAlokasi / total) : 0;

  // ── Filtered ───────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return quotas;
    return quotas.filter((q) => {
      const merged = studentIndex.get(q.id_user_si);
      const haystack = [q.nama, q.username, q.periode, merged?.nim, merged?.prodi]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(keyword);
    });
  }, [quotas, search, studentIndex]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleBack = () => router.push('/adminpage');

  const openAddForm = () => {
    const activePeriod = periods.find((p) => p.is_active);
    setForm({
      ...DEFAULT_FORM,
      id_academic_period: activePeriod?.id_academic_period ?? '',
    });
    setFormErrors({});
    setShowForm(true);
  };

  const openEditForm = (row) => {
    setForm({
      id_krs_quota: row.id,
      id_user_si: row.id_user_si,
      id_academic_period: row.id_academic_period,
      max_sks: row.max_sks,
      notes: row.notes ?? '',
    });
    setFormErrors({});
    setShowForm(true);
  };

  const validateForm = () => {
    const errs = {};
    if (!form.id_user_si) errs.id_user_si = 'Mahasiswa wajib dipilih.';
    if (!form.id_academic_period) errs.id_academic_period = 'Periode akademik wajib dipilih.';
    const sks = Number(form.max_sks);
    if (!sks || sks < 1 || sks > 60) errs.max_sks = 'Maksimal SKS harus antara 1–60.';
    if (form.notes && form.notes.length > 500) errs.notes = 'Catatan maksimal 500 karakter.';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitForm = async () => {
    if (!validateForm()) return;
    setActionLoading(true);

    const isEdit = form.id_krs_quota != null;
    const { error: err } = isEdit
      ? // C4 — hanya max_sks & notes yang dapat diubah.
        await updateKrsQuota(form.id_krs_quota, {
          max_sks: Number(form.max_sks),
          notes: form.notes?.trim() || null,
        })
      : // C2 — upsert kuota baru.
        await upsertKrsQuota({
          id_user_si: Number(form.id_user_si),
          id_academic_period: Number(form.id_academic_period),
          max_sks: Number(form.max_sks),
          notes: form.notes?.trim() || null,
        });

    setActionLoading(false);

    if (err) {
      // tampilkan error per-field bila ada, selain itu pesan umum.
      if (err.errors && typeof err.errors === 'object') {
        const mapped = {};
        Object.entries(err.errors).forEach(([k, v]) => {
          mapped[k] = Array.isArray(v) ? v[0] : String(v);
        });
        setFormErrors((prev) => ({ ...prev, ...mapped }));
      }
      setDialogMessage(resolveErrorMessage(err));
      setShowErrorDialog(true);
      return;
    }

    setShowForm(false);
    setDialogMessage(
      isEdit ? 'Kuota KRS berhasil diperbarui.' : 'Kuota KRS berhasil ditetapkan.'
    );
    setShowSuccessDialog(true);
    refetch();
  };

  const handleDeleteClick = (row) => {
    setDeleteTarget(row);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    setShowDeleteDialog(false);
    const target = deleteTarget;
    setDeleteTarget(null);
    if (!target) return;

    const { error: err } = await deleteKrsQuota(target.id, true);
    if (err) {
      setDialogMessage(resolveErrorMessage(err));
      setShowErrorDialog(true);
      return;
    }
    setDialogMessage(`Kuota "${target.nama}" berhasil dihapus.`);
    setShowSuccessDialog(true);
    refetch();
  };

  // ── UI ───────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: 'Urbanist, sans-serif' }}>
      <AdminNavbar title="Dashboard Manager" />

      <main className="flex-1" style={{ backgroundColor: '#F1F5F0' }}>
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
              Kelola Kuota KRS
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Tetapkan batas maksimal SKS yang dapat diambil setiap mahasiswa per periode akademik
            </p>
          </div>

          {/* Error */}
          {error && <ErrorMessageBoxWithButton message={error} action={loadQuotas} />}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Kuota', value: total, icon: <Users className="w-5 h-5" />, iconBg: '#015023' },
              { label: 'Total SKS Dialokasikan', value: totalSksAlokasi, icon: <BookOpen className="w-5 h-5" />, iconBg: '#16874B' },
              { label: 'Rata-rata Maks SKS', value: rataRata, icon: <Gauge className="w-5 h-5" />, iconBg: '#D97706' },
              { label: 'Mahasiswa Terdaftar', value: students.length, icon: <GraduationCap className="w-5 h-5" />, iconBg: '#2563EB' },
            ].map((card) => (
              <div
                key={card.label}
                className="bg-white rounded-xl p-4 sm:p-5 shadow-sm flex items-center justify-between"
                style={{ border: '1px solid #e5e7eb' }}
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
              <span className="font-semibold">Kuota SKS:</span>{' '}
              Setiap mahasiswa hanya memiliki satu kuota per periode akademik. Menambahkan kuota untuk
              kombinasi mahasiswa &amp; periode yang sudah ada akan{' '}
              <span className="font-bold">memperbarui</span> nilai yang lama.
            </p>
          </div>

          {/* Table card */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
            {/* Table header row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-b border-gray-100 gap-3">
              <div>
                <h2 className="text-base font-bold" style={{ color: '#015023' }}>Daftar Kuota KRS</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {loading ? 'Memuat...' : `${filtered.length} dari ${quotas.length} kuota`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Search */}
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
                  style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', minWidth: 220 }}
                >
                  <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Cari nama, NIM, prodi, periode..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm"
                  />
                </div>

                {/* Add */}
                <button
                  onClick={openAddForm}
                  className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 shadow-sm hover:opacity-90 transition whitespace-nowrap"
                  style={{ backgroundColor: '#DABC4E', borderRadius: '10px', color: '#015023', height: '38px' }}
                >
                  <Plus className="w-4 h-4" />
                  Tambah Kuota
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: '#015023' }}>
                    {['No', 'Nama Mahasiswa', 'NIM', 'Program Studi', 'Periode Akademik', 'Maks SKS', 'Catatan', 'Aksi'].map((h) => (
                      <th key={h} className="p-3 text-center font-semibold text-white text-sm whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-gray-400 text-sm">
                        Memuat data...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-gray-400 text-sm">
                        Belum ada data kuota yang ditetapkan.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((q, idx) => {
                      const merged = studentIndex.get(q.id_user_si);
                      return (
                        <tr key={q.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                          <td className="p-3 text-center text-sm text-gray-500 font-medium w-10">{idx + 1}</td>
                          <td className="p-3 text-left">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: '#EFF6EE' }}
                              >
                                <GraduationCap className="w-4 h-4" style={{ color: '#015023' }} />
                              </div>
                              <span className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>
                                {q.nama}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-center text-sm text-gray-500">{merged?.nim ?? q.username}</td>
                          <td className="p-3 text-left text-sm" style={{ color: '#374151' }}>{merged?.prodi ?? '-'}</td>
                          <td className="p-3 text-center text-sm text-gray-600">{q.periode}</td>
                          <td className="p-3 text-center">
                            <span
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold"
                              style={{ backgroundColor: '#EFF6EE', color: '#015023', border: '1px solid #b7dfb0' }}
                            >
                              {q.max_sks} SKS
                            </span>
                          </td>
                          <td className="p-3 text-left text-sm text-gray-500 max-w-[200px] truncate" title={q.notes}>
                            {q.notes || '-'}
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => openEditForm(q)}
                                className="p-2 rounded-xl text-white hover:opacity-80 transition shadow-sm"
                                style={{ backgroundColor: '#16874B' }}
                                title="Edit kuota"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(q)}
                                className="p-2 rounded-xl text-white hover:opacity-80 transition shadow-sm"
                                style={{ backgroundColor: '#BE0414' }}
                                title="Hapus kuota"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table footer */}
            {!loading && quotas.length > 0 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
                <span>Menampilkan {filtered.length} dari {quotas.length} kuota</span>
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />

      {/* ── Add / Edit Form Modal ───────────────────────────────────────────── */}
      <AlertDialog open={showForm} onOpenChange={setShowForm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#EFF6EE' }}
                >
                  <Gauge className="w-5 h-5" style={{ color: '#015023' }} />
                </div>
                <div>
                  <AlertDialogTitle>
                    {form.id_krs_quota != null ? 'Edit Kuota KRS' : 'Tambah Kuota Baru'}
                  </AlertDialogTitle>
                  <p className="text-sm text-gray-500 mt-0.5">Atur maksimal SKS mahasiswa</p>
                </div>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </AlertDialogHeader>

          <div className="space-y-4">
            {/* Pilih Mahasiswa */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>
                Pilih Mahasiswa:
              </label>
              <select
                value={form.id_user_si}
                onChange={(e) => setForm((p) => ({ ...p, id_user_si: e.target.value }))}
                disabled={form.id_krs_quota != null}
                className="w-full rounded-xl p-3 text-sm outline-none transition bg-white disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ border: `1.5px solid ${formErrors.id_user_si ? '#FCA5A5' : '#E5E7EB'}`, fontFamily: 'Urbanist, sans-serif', color: '#374151' }}
              >
                <option value="">-- Pilih Mahasiswa --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama} {s.nim !== '-' ? `(${s.nim})` : ''}
                  </option>
                ))}
              </select>
              {formErrors.id_user_si && <p className="text-xs mt-1.5 text-red-500">{formErrors.id_user_si}</p>}
              {form.id_krs_quota != null && (
                <p className="text-xs mt-1.5" style={{ color: '#6B7280' }}>
                  Mahasiswa &amp; periode tidak dapat diubah saat edit. Hapus lalu buat baru untuk memindahkan.
                </p>
              )}
            </div>

            {/* Periode Akademik */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>
                Periode Akademik:
              </label>
              <select
                value={form.id_academic_period}
                onChange={(e) => setForm((p) => ({ ...p, id_academic_period: e.target.value }))}
                disabled={form.id_krs_quota != null}
                className="w-full rounded-xl p-3 text-sm outline-none transition bg-white disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ border: `1.5px solid ${formErrors.id_academic_period ? '#FCA5A5' : '#E5E7EB'}`, fontFamily: 'Urbanist, sans-serif', color: '#374151' }}
              >
                <option value="">-- Pilih Periode --</option>
                {periods.map((p) => (
                  <option key={p.id_academic_period} value={p.id_academic_period}>
                    {p.name} {p.is_active ? '(Aktif)' : ''}
                  </option>
                ))}
              </select>
              {formErrors.id_academic_period && <p className="text-xs mt-1.5 text-red-500">{formErrors.id_academic_period}</p>}
            </div>

            {/* Maksimal SKS */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>
                Maksimal SKS:
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={form.max_sks}
                onChange={(e) => setForm((p) => ({ ...p, max_sks: e.target.value }))}
                className="w-full rounded-xl p-3 text-sm text-center font-semibold outline-none transition"
                style={{ border: `1.5px solid ${formErrors.max_sks ? '#FCA5A5' : '#E5E7EB'}`, fontFamily: 'Urbanist, sans-serif', color: '#374151' }}
              />
              {formErrors.max_sks && <p className="text-xs mt-1.5 text-red-500">{formErrors.max_sks}</p>}
            </div>

            {/* Catatan */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>
                Catatan (Opsional):
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Catatan untuk kuota ini (mis. alasan penyesuaian)"
                rows={2}
                className="w-full rounded-xl p-3 text-sm resize-none outline-none transition"
                style={{ border: `1.5px solid ${formErrors.notes ? '#FCA5A5' : '#E5E7EB'}`, fontFamily: 'Urbanist, sans-serif', color: '#374151' }}
              />
              {formErrors.notes && <p className="text-xs mt-1.5 text-red-500">{formErrors.notes}</p>}
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <OutlineButton>Batal</OutlineButton>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <SuccessButton onClick={handleSubmitForm} disabled={actionLoading}>
                {actionLoading ? 'Menyimpan...' : 'Simpan'}
              </SuccessButton>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Delete Confirmation Dialog ──────────────────────────────────────── */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#FEE2E2' }}
              >
                <Trash2 className="w-5 h-5" style={{ color: '#BE0414' }} />
              </div>
              <div>
                <AlertDialogTitle>Hapus Kuota</AlertDialogTitle>
                <p className="text-sm text-gray-500 mt-0.5">Konfirmasi Penghapusan</p>
              </div>
            </div>
          </AlertDialogHeader>

          {deleteTarget && (
            <div
              className="rounded-xl p-4 text-sm space-y-1"
              style={{ backgroundColor: '#FFF5F5', border: '1px solid #FEC5C5' }}
            >
              <p style={{ color: '#015023' }}>
                <span className="font-semibold">Mahasiswa:</span> {deleteTarget.nama}
              </p>
              <p style={{ color: '#015023' }}>
                <span className="font-semibold">Periode:</span> {deleteTarget.periode}
              </p>
              <p style={{ color: '#015023' }}>
                <span className="font-semibold">Maks SKS:</span> {deleteTarget.max_sks} SKS
              </p>
            </div>
          )}

          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus kuota ini? Kuota tidak dapat dihapus jika mahasiswa masih
            memiliki KRS yang sudah disetujui pada periode tersebut.
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

      {/* ── Result Dialogs ──────────────────────────────────────────────────── */}
      <AlertErrorDialog
        open={showErrorDialog}
        onOpenChange={setShowErrorDialog}
        description={dialogMessage}
      />
      <AlertSuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        description={dialogMessage}
        closeText="Tutup"
      />
    </div>
  );
}
