'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search, Filter, BookOpen, GraduationCap,
    CheckCircle2, TrendingUp,
    AlertCircle, Loader2, ChevronRight
} from 'lucide-react';
import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import { getKegiatanList } from '@/lib/kegiatanApi';

// ── Pemetaan status (enum BE: Draft|Diajukan|Disetujui|Ditolak|Revisi) ────────
const STATUS_MAP = {
    'Belum Diajukan': { label: 'Belum Diajukan', color: '#92400E', bg: '#FEF3C7', tab: 'Belum Diajukan' },
    Draft:     { label: 'Belum Diajukan', color: '#92400E', bg: '#FEF3C7', tab: 'Belum Diajukan' },
    Diajukan:  { label: 'Menunggu',       color: '#D97706', bg: '#FEF3C7', tab: 'Menunggu' },
    Revisi:    { label: 'Perlu Revisi',   color: '#DB2777', bg: '#FCE7F3', tab: 'Perlu Revisi' },
    Disetujui: { label: 'Selesai',        color: '#059669', bg: '#D1FAE5', tab: 'Selesai' },
    Ditolak:   { label: 'Ditolak',        color: '#DC2626', bg: '#FEE2E2', tab: 'Ditolak' },
};

const TABS = ['Semua', 'Belum Diajukan', 'Menunggu', 'Perlu Revisi', 'Selesai', 'Ditolak'];

function StatusBadge({ status }) {
    const s = STATUS_MAP[status] ?? { label: status ?? '-', color: '#6B7280', bg: '#F3F4F6' };
    return (
        <span
            className="text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap"
            style={{ color: s.color, backgroundColor: s.bg }}
        >
            {s.label}
        </span>
    );
}

function StatCard({ icon: Icon, value, label, iconColor, iconBg }) {
    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: iconBg, color: iconColor }}>
                <Icon size={20} strokeWidth={2.5} />
            </div>
            <div>
                <p className="text-2xl font-extrabold text-gray-800">{value}</p>
                <p className="text-xs font-semibold text-gray-500 mt-0.5">{label}</p>
            </div>
        </div>
    );
}

function KegiatanCard({ item, onOpen }) {
    const status = item.status_validasi ?? 'Belum Diajukan';
    return (
        <div
            onClick={() => onOpen(item)}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all group cursor-pointer"
        >
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: '#1a4731', color: '#fff' }}>
                    <BookOpen size={22} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                        <h3 className="text-sm font-bold text-gray-800 leading-snug group-hover:text-[#1a4731] transition-colors">
                            {item.mata_kuliah}
                        </h3>
                        <StatusBadge status={status} />
                    </div>

                    {(item.kode_mk || item.jenis_kelas) && (
                        <p className="text-sm text-gray-500 leading-relaxed mb-3">
                            {[item.kode_mk, item.jenis_kelas && `Kelas ${item.jenis_kelas}`].filter(Boolean).join(' / ')}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-gray-400">
                        {item.sks != null && <span>{item.sks} SKS</span>}
                        {item.jumlah_mahasiswa != null && (<><span className="w-1 h-1 rounded-full bg-gray-300" /><span>{item.jumlah_mahasiswa} Mahasiswa</span></>)}
                        {item.kelas && (<><span className="w-1 h-1 rounded-full bg-gray-300" /><span>Kelas {item.kelas}</span></>)}
                        {item.semester && (<><span className="w-1 h-1 rounded-full bg-gray-300" /><span>Sem. {item.semester}</span></>)}
                        {item.tahun_ajaran && (<><span className="w-1 h-1 rounded-full bg-gray-300" /><span>{item.tahun_ajaran}</span></>)}
                        {item.angka_kredit > 0 && (<><span className="w-1 h-1 rounded-full bg-gray-300" /><span className="font-bold" style={{ color: '#1a4731' }}>+{item.angka_kredit} AK</span></>)}
                    </div>
                </div>
                <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-400 transition-colors shrink-0 mt-1" />
            </div>
        </div>
    );
}

// ── Halaman Utama ─────────────────────────────────────────────────────────────
export default function DashboardKegiatanMengajar() {
    const router = useRouter();

    const [list, setList] = useState([]);
    const [bebanAktif, setBebanAktif] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('Semua');
    const [searchQuery, setSearchQuery] = useState('');

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await getKegiatanList();
            if (res?.status === 'success') {
                setList(res.data ?? []);
                setBebanAktif(res.beban_mengajar_aktif ?? 0);
            } else {
                setError('Gagal memuat data dari server.');
            }
        } catch (err) {
            setError(err?.userMessage ?? err?.message ?? 'Terjadi kesalahan jaringan.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    // ── Statistik ──
    const stats = useMemo(() => {
        const totalMk  = list.length;
        const totalSks = bebanAktif || list.reduce((s, k) => s + (Number(k.sks) || 0), 0);
        const selesai  = list.filter(d => d.status_validasi === 'Disetujui').length;
        const totalAk  = list.reduce((s, k) => s + (Number(k.angka_kredit) || 0), 0);
        return { totalMk, totalSks, selesai, totalAk };
    }, [list, bebanAktif]);

    // ── Filter + Search ──
    const filtered = useMemo(() => {
        let result = list;
        if (activeTab !== 'Semua') {
            result = result.filter(d => (STATUS_MAP[d.status_validasi]?.tab ?? d.status_validasi) === activeTab);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(d =>
                d.mata_kuliah?.toLowerCase().includes(q) ||
                d.kode_mk?.toLowerCase().includes(q)
            );
        }
        return result;
    }, [list, activeTab, searchQuery]);

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F0F4F0', fontFamily: 'Urbanist, sans-serif' }}>
            <Navbar />

            <main className="flex-grow max-w-[1000px] w-full mx-auto px-4 py-8">

                {/* Kembali */}
                <button
                    onClick={() => router.push('/dashboard')}
                    className="text-sm font-bold mb-6 hover:opacity-70 transition block"
                    style={{ color: '#1a4731' }}
                >
                    ← Kembali Ke Dashboard
                </button>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold mb-1" style={{ color: '#1a4731' }}>
                        Dashboard Kegiatan Mengajar
                    </h1>
                    <p className="text-sm font-semibold text-gray-500">
                        Data beban mengajar semester berjalan dan riwayat, serta klaim Angka Kredit pendidikan
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <StatCard icon={BookOpen}     value={isLoading ? '–' : stats.totalMk}  label="Total Mata Kuliah"  iconColor="#1a4731" iconBg="#DCF0E5" />
                    <StatCard icon={GraduationCap} value={isLoading ? '–' : stats.totalSks} label="Total SKS Diajar"    iconColor="#0EA5E9" iconBg="#E0F2FE" />
                    <StatCard icon={CheckCircle2}  value={isLoading ? '–' : stats.selesai}  label="Telah Selesai"       iconColor="#10B981" iconBg="#D1FAE5" />
                    <StatCard icon={TrendingUp}    value={isLoading ? '–' : `${stats.totalAk} AK`} label="Total AK Diperoleh"  iconColor="#F59E0B" iconBg="#FEF3C7" />
                </div>

                {/* AK Banner */}
                <div className="rounded-2xl px-6 py-5 mb-6 flex items-center justify-between shadow-sm" style={{ backgroundColor: '#1a4731' }}>
                    <div>
                        <h3 className="text-white text-sm font-bold mb-0.5">
                            Akumulasi AK dari Kegiatan Mengajar
                        </h3>
                        <p className="text-green-200 text-xs">
                            {stats.selesai > 0
                                ? `${stats.selesai} mata kuliah terverifikasi — Angka Kredit siap diklaim lewat menu BKD (Angka Kredit).`
                                : 'Belum ada mata kuliah yang selesai divalidasi.'}
                        </p>
                    </div>
                    <div className="text-right shrink-0 ml-6">
                        <p className="text-3xl font-extrabold text-white">{stats.totalAk}</p>
                        <p className="text-green-300 text-[10px] font-bold uppercase mt-0.5">AK Total</p>
                    </div>
                </div>

                {/* Search + Filter */}
                <div className="flex gap-3 mb-5">
                    <div className="relative flex-grow">
                        <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Cari judul atau kode mata kuliah..."
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-green-700 focus:ring-1 focus:ring-green-700 transition"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
                        <Filter size={15} /> Filter
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-1 mb-4 hide-scrollbar">
                    {TABS.map(t => (
                        <button
                            key={t}
                            onClick={() => setActiveTab(t)}
                            className="px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors"
                            style={{
                                backgroundColor: activeTab === t ? '#1a4731' : '#fff',
                                color:           activeTab === t ? '#fff'     : '#6B7280',
                                border: activeTab === t ? 'none' : '1px solid #E5E7EB',
                            }}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
                        <Loader2 size={36} className="animate-spin" />
                        <p className="text-sm font-semibold">Memuat data kegiatan mengajar...</p>
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-2xl p-10 border border-red-100 flex flex-col items-center text-center">
                        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle size={28} className="text-red-400" />
                        </div>
                        <h3 className="text-base font-bold text-gray-700 mb-2">Gagal Memuat Data</h3>
                        <p className="text-sm text-gray-500 max-w-sm">{error}</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 border border-gray-100 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <BookOpen size={30} className="text-gray-300" />
                        </div>
                        <h3 className="text-base font-bold text-gray-600 mb-2">
                            {activeTab === 'Semua' && !searchQuery ? 'Belum Ada Kelas Diajar' : 'Tidak Ada Hasil'}
                        </h3>
                        <p className="text-sm text-gray-400 max-w-sm">
                            {activeTab === 'Semua' && !searchQuery
                                ? 'Kelas yang Anda ampu akan otomatis muncul di sini setelah ditugaskan.'
                                : 'Coba ubah filter atau kata kunci pencarian.'}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {filtered.map(item => (
                            <KegiatanCard
                                key={item.id_class}
                                item={item}
                                onOpen={(it) => router.push(`/dosen/kegiatan-mengajar/${it.id_class}`)}
                            />
                        ))}
                    </div>
                )}

            </main>
            <Footer />
        </div>
    );
}
