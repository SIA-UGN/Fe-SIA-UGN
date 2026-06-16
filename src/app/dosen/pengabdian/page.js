'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus, Search, Filter, Users, UserSearch, BookOpen,
    CheckCircle2, Clock, XCircle, TrendingUp,
    AlertCircle, Loader2, ChevronRight
} from 'lucide-react';
import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import { useAuth } from '@/lib/auth-context';
import { getPengabdianList } from '@/lib/pengabdianApi';

// ── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_MAP = {
    Draft:     { label: 'Pengajuan',    color: '#D97706', bg: '#FEF3C7', tab: 'Pengajuan' },
    Diajukan:  { label: 'Pengajuan',    color: '#D97706', bg: '#FEF3C7', tab: 'Pengajuan' },
    Revisi:    { label: 'Perlu Revisi', color: '#DB2777', bg: '#FCE7F3', tab: 'Pengajuan' },
    Aktif:     { label: 'Aktif',        color: '#0EA5E9', bg: '#E0F2FE', tab: 'Aktif'     },
    Disetujui: { label: 'Selesai',      color: '#059669', bg: '#D1FAE5', tab: 'Selesai'   },
    Selesai:   { label: 'Selesai',      color: '#059669', bg: '#D1FAE5', tab: 'Selesai'   },
    Ditolak:   { label: 'Ditolak',      color: '#DC2626', bg: '#FEE2E2', tab: 'Ditolak'   },
};

const TABS = ['Semua', 'Pengajuan', 'Aktif', 'Selesai', 'Ditolak'];

const SKEMA_ICON_COLOR = {
    Mandiri:        '#6366F1',
    'Hibah Internal': '#0EA5E9',
    'Hibah Dikti':  '#10B981',
    Lainnya:        '#F59E0B',
};

function StatusBadge({ status }) {
    const s = STATUS_MAP[status] ?? { label: status, color: '#6B7280', bg: '#F3F4F6' };
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

function KegiatanCard({ item, onClick }) {
    const status = item.status_validasi ?? 'Draft';
    const authorCount = item.authors?.length ?? 0;

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all cursor-pointer group"
        >
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: '#1a4731', color: '#fff' }}
                >
                    <UserSearch size={22} strokeWidth={2} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-sm font-bold text-gray-800 leading-snug group-hover:text-[#1a4731] transition-colors">
                            {item.judul_kegiatan}
                        </h3>
                        <StatusBadge status={status} />
                    </div>

                    {(item.deskripsi || item.lokasi) && (
                        <p className="text-sm text-gray-500 leading-relaxed mb-3 line-clamp-2">
                            {item.deskripsi || item.lokasi}
                        </p>
                    )}

                    {/* Meta tags */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-gray-400">
                        <span>{item.lembaga_dana ?? item.sumber_dana ?? item.skema}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span>Tahun {item.tahun_pelaksanaan}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span>{authorCount} anggota tim</span>
                        {item.angka_kredit > 0 && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                <span className="font-bold" style={{ color: '#1a4731' }}>+{Math.round(item.angka_kredit)} AK</span>
                            </>
                        )}
                    </div>
                </div>

                <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-400 transition-colors shrink-0 mt-1" />
            </div>
        </div>
    );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPengabdian() {
    const router = useRouter();
    const { user } = useAuth();

    const [list, setList] = useState([]);
    const [totalAk, setTotalAk] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('Semua');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await getPengabdianList();
                if (res?.status === 'success') {
                    setList(res.data ?? []);
                    setTotalAk(res.total_ak ?? 0);
                } else {
                    setError('Gagal memuat data dari server.');
                }
            } catch (err) {
                setError(err?.userMessage ?? err?.message ?? 'Terjadi kesalahan jaringan.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // ── Stats ──
    const stats = useMemo(() => {
        const total    = list.length;
        const aktif    = list.filter(d => d.status_validasi === 'Aktif').length;
        const selesai  = list.filter(d => ['Selesai', 'Disetujui'].includes(d.status_validasi)).length;
        return { total, aktif, selesai };
    }, [list]);

    // ── Filter + Search ──
    const filtered = useMemo(() => {
        let result = list;

        if (activeTab !== 'Semua') {
            result = result.filter(d => {
                const tab = STATUS_MAP[d.status_validasi]?.tab ?? d.status_validasi;
                return tab === activeTab;
            });
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(d =>
                d.judul_kegiatan?.toLowerCase().includes(q) ||
                d.lokasi?.toLowerCase().includes(q) ||
                d.skema?.toLowerCase().includes(q)
            );
        }

        return result;
    }, [list, activeTab, searchQuery]);

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#E6EEE9', fontFamily: 'Urbanist, sans-serif' }}>
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
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold mb-1" style={{ color: '#1a4731' }}>
                            Dashboard Pengabdian Masyarakat
                        </h1>
                        <p className="text-sm font-semibold text-gray-500">
                            Kelola kegiatan PKM, progres pelaksanaan, dan klaim Angka Kredit Anda
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/dosen/pengabdian/tambah')}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm hover:opacity-90 transition whitespace-nowrap shrink-0"
                        style={{ backgroundColor: '#1a4731' }}
                    >
                        <Plus size={16} strokeWidth={3} /> + Tambah Kegiatan
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <StatCard icon={BookOpen}    value={isLoading ? '–' : stats.total}   label="Total Kegiatan"    iconColor="#1a4731" iconBg="#DCF0E5" />
                    <StatCard icon={Clock}       value={isLoading ? '–' : stats.aktif}   label="Sedang Aktif"     iconColor="#0EA5E9" iconBg="#E0F2FE" />
                    <StatCard icon={CheckCircle2} value={isLoading ? '–' : stats.selesai} label="Telah Selesai"   iconColor="#10B981" iconBg="#D1FAE5" />
                    <StatCard icon={TrendingUp}  value={isLoading ? '–' : `${Math.round(totalAk)} AK`} label="Total AK Diperoleh" iconColor="#F59E0B" iconBg="#FEF3C7" />
                </div>

                {/* AK Banner */}
                <div
                    className="rounded-2xl px-6 py-5 mb-6 flex items-center justify-between shadow-sm"
                    style={{ backgroundColor: '#1a4731' }}
                >
                    <div>
                        <h3 className="text-white text-sm font-bold mb-0.5">
                            Akumulasi Angka Kredit dari Pengabdian Masyarakat
                        </h3>
                        <p className="text-green-200 text-xs">
                            {stats.selesai > 0
                                ? `Total dari ${stats.selesai} kegiatan selesai telah diklaim ke BKD Anda.`
                                : 'Belum ada kegiatan yang selesai divalidasi.'
                            }
                        </p>
                    </div>
                    <div className="text-right shrink-0 ml-6">
                        <p className="text-3xl font-extrabold text-white">{Math.round(totalAk)}</p>
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
                            placeholder="Cari judul atau bidang kegiatan..."
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
                        <p className="text-sm font-semibold">Memuat data pengabdian...</p>
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
                            <Users size={30} className="text-gray-300" />
                        </div>
                        <h3 className="text-base font-bold text-gray-600 mb-2">
                            {activeTab === 'Semua' && !searchQuery
                                ? 'Belum Ada Kegiatan Pengabdian'
                                : 'Tidak Ada Hasil'}
                        </h3>
                        <p className="text-sm text-gray-400 mb-6 max-w-sm">
                            {activeTab === 'Semua' && !searchQuery
                                ? 'Mulai dengan menambahkan kegiatan PKM pertama Anda.'
                                : 'Coba ubah filter atau kata kunci pencarian.'}
                        </p>
                        {activeTab === 'Semua' && !searchQuery && (
                            <button
                                onClick={() => router.push('/dosen/pengabdian/tambah')}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition"
                                style={{ backgroundColor: '#1a4731' }}
                            >
                                <Plus size={15} strokeWidth={3} /> Tambah Kegiatan Pertama
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {filtered.map(item => (
                            <KegiatanCard
                                key={item.id}
                                item={item}
                                onClick={() => router.push(`/dosen/pengabdian/${item.id}`)}
                            />
                        ))}
                    </div>
                )}

            </main>
            <Footer />
        </div>
    );
}
