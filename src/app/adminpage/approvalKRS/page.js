'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  SlidersHorizontal,
  Eye,
  User,
} from 'lucide-react';
import AdminNavbar from '@/components/ui/admin-navbar';
import Footer from '@/components/ui/footer';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';

// ─── Dummy Data (replace with real API calls) ────────────────────────────────
async function fetchKrsSubmissions() {
  return {
    status: 'success',
    data: [
      {
        id: 1,
        nama: 'Wachyoudi',
        nim: '123456',
        prodi: 'Teknik Informatika S1',
        semester: 5,
        sks: 20,
        mk: 6,
        tanggal: '5 Maret 2026 pukul 14.30',
        status: 'menunggu',
      },
      {
        id: 2,
        nama: 'Mulyadi Rizki',
        nim: '123457',
        prodi: 'Teknik Informatika S1',
        semester: 3,
        sks: 18,
        mk: 5,
        tanggal: '5 Maret 2026 pukul 09.15',
        status: 'menunggu',
      },
      {
        id: 3,
        nama: 'Siti Nurhaliza',
        nim: '123458',
        prodi: 'Sistem Informasi S1',
        semester: 7,
        sks: 22,
        mk: 6,
        tanggal: '4 Maret 2026 pukul 16.45',
        status: 'disetujui',
      },
      {
        id: 4,
        nama: 'Ahmad Fauzi',
        nim: '123459',
        prodi: 'Manajemen S1',
        semester: 5,
        sks: 12,
        mk: 4,
        tanggal: '4 Maret 2026 pukul 11.00',
        status: 'ditolak',
      },
      {
        id: 5,
        nama: 'Dewi Kartika',
        nim: '123460',
        prodi: 'Manajemen S1',
        semester: 3,
        sks: 20,
        mk: 6,
        tanggal: '6 Maret 2026 pukul 08.30',
        status: 'menunggu',
      },
      {
        id: 6,
        nama: 'Budi Santoso',
        nim: '123461',
        prodi: 'Sistem Informasi S1',
        semester: 1,
        sks: 24,
        mk: 8,
        tanggal: '6 Maret 2026 pukul 10.20',
        status: 'disetujui',
      },
    ],
  };
}
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  menunggu:  { label: 'Menunggu',  bg: '#FEF3C7', text: '#92400E', border: '#FCD34D', icon: Clock },
  disetujui: { label: 'Disetujui', bg: '#DCFCE7', text: '#15803D', border: '#86EFAC', icon: CheckCircle2 },
  ditolak:   { label: 'Ditolak',   bg: '#FEE2E2', text: '#BE0414', border: '#FCA5A5', icon: XCircle },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.menunggu;
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function SksBadge({ sks }) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold"
      style={{ backgroundColor: '#EFF6EE', color: '#015023', border: '1px solid #b7dfb0' }}
    >
      {sks} SKS
    </span>
  );
}

export default function ApprovalKRSPage() {
  const router = useRouter();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus] = useState('semua');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const loadSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchKrsSubmissions();
      if (res.status === 'success') {
        setSubmissions(res.data);
      } else {
        setError('Gagal mengambil data pengajuan KRS.');
      }
    } catch (e) {
      setError('Terjadi kesalahan: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSubmissions(); }, []);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const total     = submissions.length;
  const menunggu  = submissions.filter(s => s.status === 'menunggu').length;
  const disetujui = submissions.filter(s => s.status === 'disetujui').length;
  const ditolak   = submissions.filter(s => s.status === 'ditolak').length;

  // ── Filtered data ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return submissions.filter(s => {
      const matchSearch =
        s.nama.toLowerCase().includes(search.toLowerCase()) ||
        s.nim.includes(search) ||
        s.prodi.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'semua' || s.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [submissions, search, filterStatus]);

  const handleReview = (id) => router.push(`/adminpage/approvalKRS/${id}`);
  const handleDetail = (id) => router.push(`/adminpage/approvalKRS/${id}`);

  const filterOptions = [
    { value: 'semua',     label: 'Semua Status' },
    { value: 'menunggu',  label: 'Menunggu' },
    { value: 'disetujui', label: 'Disetujui' },
    { value: 'ditolak',   label: 'Ditolak' },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: 'Urbanist, sans-serif' }}>
      <AdminNavbar title="Dashboard Manager" />

      <main className="flex-1" style={{ backgroundColor: '#F1F5F0' }}>
        <div className="max-w-7xl mx-auto p-4 sm:p-6">

          {/* Page header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#015023' }}>
              Approval KRS Mahasiswa
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Tinjau dan berikan keputusan atas pengajuan KRS mahasiswa
            </p>
          </div>

          {/* Error */}
          {error && <ErrorMessageBoxWithButton message={error} action={loadSubmissions} />}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              {
                label: 'Total Pengajuan',
                value: total,
                icon: <BookOpen className="w-5 h-5" />,
                iconBg: '#015023',
              },
              {
                label: 'Menunggu',
                value: menunggu,
                icon: <Clock className="w-5 h-5" />,
                iconBg: '#D97706',
              },
              {
                label: 'Disetujui',
                value: disetujui,
                icon: <CheckCircle2 className="w-5 h-5" />,
                iconBg: '#15803D',
              },
              {
                label: 'Ditolak',
                value: ditolak,
                icon: <XCircle className="w-5 h-5" />,
                iconBg: '#BE0414',
              },
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

          {/* Table card */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
            {/* Table header row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-b border-gray-100 gap-3">
              <div>
                <h2 className="text-base font-bold" style={{ color: '#015023' }}>Daftar Pengajuan KRS</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {loading ? 'Memuat...' : `${filtered.length} dari ${submissions.length} mahasiswa`}
                </p>
              </div>

              {/* Search + Filter */}
              <div className="flex items-center gap-2">
                {/* Search */}
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
                  style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', minWidth: 220 }}
                >
                  <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Cari nama, NIM, prodi..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm"
                  />
                </div>

                {/* Filter Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowFilterDropdown(p => !p)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition hover:opacity-80"
                    style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', color: '#374151', height: '38px' }}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    {filterOptions.find(o => o.value === filterStatus)?.label ?? 'Filter'}
                  </button>
                  {showFilterDropdown && (
                    <div
                      className="absolute right-0 top-10 z-20 w-44 rounded-xl shadow-lg overflow-hidden"
                      style={{ border: '1px solid #E5E7EB', backgroundColor: '#fff' }}
                    >
                      {filterOptions.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => { setFilterStatus(opt.value); setShowFilterDropdown(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition"
                          style={{ color: filterStatus === opt.value ? '#015023' : '#374151', fontWeight: filterStatus === opt.value ? 700 : 400 }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: '#015023' }}>
                    {['No', 'Nama Mahasiswa', 'NIM', 'Program Studi', 'Sem', 'SKS', 'MK', 'Tanggal Pengajuan', 'Status', 'Aksi'].map((h) => (
                      <th
                        key={h}
                        className="p-3 text-center font-semibold text-white text-sm whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={10} className="text-center py-12 text-gray-400 text-sm">
                        Memuat data...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-12 text-gray-400 text-sm">
                        Tidak ada data pengajuan KRS yang ditemukan
                      </td>
                    </tr>
                  ) : (
                    filtered.map((s, idx) => (
                      <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                        {/* No */}
                        <td className="p-3 text-center text-sm text-gray-500 font-medium w-10">
                          {idx + 1}
                        </td>
                        {/* Nama */}
                        <td className="p-3 text-left">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: '#EFF6EE' }}
                            >
                              <User className="w-4 h-4" style={{ color: '#015023' }} />
                            </div>
                            <span className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>
                              {s.nama}
                            </span>
                          </div>
                        </td>
                        {/* NIM */}
                        <td className="p-3 text-center text-sm text-gray-500">{s.nim}</td>
                        {/* Prodi */}
                        <td className="p-3 text-left text-sm" style={{ color: '#374151' }}>{s.prodi}</td>
                        {/* Semester */}
                        <td className="p-3 text-center text-sm font-medium text-gray-600">{s.semester}</td>
                        {/* SKS */}
                        <td className="p-3 text-center">
                          <SksBadge sks={s.sks} />
                        </td>
                        {/* MK */}
                        <td className="p-3 text-center text-sm font-medium text-gray-600">{s.mk}</td>
                        {/* Tanggal */}
                        <td className="p-3 text-center text-xs text-gray-500 whitespace-nowrap">{s.tanggal}</td>
                        {/* Status */}
                        <td className="p-3 text-center">
                          <StatusBadge status={s.status} />
                        </td>
                        {/* Aksi */}
                        <td className="p-3 text-center">
                          {s.status === 'menunggu' ? (
                            <button
                              onClick={() => handleReview(s.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition hover:opacity-85"
                              style={{ backgroundColor: '#DABC4E', color: '#015023' }}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Tinjau
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDetail(s.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition hover:opacity-85"
                              style={{ backgroundColor: '#015023' }}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Detail
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table footer */}
            {!loading && submissions.length > 0 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
                <span>Menampilkan {filtered.length} dari {submissions.length} pengajuan</span>
                {menunggu > 0 && (
                  <span className="font-semibold" style={{ color: '#D97706' }}>
                    {menunggu} pengajuan menunggu persetujuan
                  </span>
                )}
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
