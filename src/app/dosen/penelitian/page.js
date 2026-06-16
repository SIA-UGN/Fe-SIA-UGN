'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus, Search, FlaskConical, FileText, Users,
    CheckCircle2, Clock, XCircle, TrendingUp, Play,
    AlertCircle, Loader2, Pencil, CheckCheck,
} from 'lucide-react';
import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import { getProposalList, selesaiProposal } from '@/lib/proposalApi';

// status BE: Pengajuan | Aktif | Selesai | Ditolak | Revisi
const STATUS_MAP = {
    Pengajuan: { label: 'Pengajuan',    color: '#D97706', bg: '#FEF3C7', tab: 'Pengajuan' },
    Revisi:    { label: 'Perlu Revisi', color: '#DB2777', bg: '#FCE7F3', tab: 'Pengajuan' },
    Aktif:     { label: 'Aktif',        color: '#0EA5E9', bg: '#E0F2FE', tab: 'Aktif' },
    Selesai:   { label: 'Selesai',      color: '#059669', bg: '#D1FAE5', tab: 'Selesai' },
    Ditolak:   { label: 'Ditolak',      color: '#DC2626', bg: '#FEE2E2', tab: 'Ditolak' },
};
const TABS = ['Semua', 'Pengajuan', 'Aktif', 'Selesai', 'Ditolak'];

function StatusBadge({ status }) {
    const s = STATUS_MAP[status] ?? { label: status ?? '-', color: '#6B7280', bg: '#F3F4F6' };
    return <span className="text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap" style={{ color: s.color, backgroundColor: s.bg }}>{s.label}</span>;
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

function ProposalCard({ item, onOpen, onPerbaiki, onSelesai, busy }) {
    const status = item.status ?? 'Pengajuan';
    const showPerbaiki = status === 'Revisi';
    const showSelesai  = status === 'Aktif';
    const showCatatan  = (status === 'Revisi' || status === 'Ditolak') && item.catatan_validasi;
    const anggota = Array.isArray(item.anggota) ? item.anggota.length : 0;

    return (
        <div onClick={() => onOpen(item)}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all group cursor-pointer"
            style={{ borderLeft: showPerbaiki ? '4px solid #DB2777' : status === 'Pengajuan' ? '4px solid #D6A407' : undefined }}>
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: '#1a4731', color: '#fff' }}>
                    <FlaskConical size={22} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                        <h3 className="text-sm font-bold text-gray-800 leading-snug group-hover:text-[#1a4731] transition-colors">{item.judul}</h3>
                        <StatusBadge status={status} />
                    </div>
                    {item.abstrak && <p className="text-sm text-gray-500 leading-relaxed mb-3 line-clamp-2">{item.abstrak}</p>}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-gray-400">
                        {item.sumber_dana && <span>{item.sumber_dana}</span>}
                        {item.tahun && (<><span className="w-1 h-1 rounded-full bg-gray-300" /><span>Tahun {item.tahun}</span></>)}
                        <><span className="w-1 h-1 rounded-full bg-gray-300" /><span className="inline-flex items-center gap-1"><Users size={12} /> {anggota} anggota tim</span></>
                        {item.file_proposal && (<><span className="w-1 h-1 rounded-full bg-gray-300" /><span className="inline-flex items-center gap-1 text-[#1a4731]"><FileText size={12} /> Proposal</span></>)}
                        {item.angka_kredit != null && Number(item.angka_kredit) > 0 && (<><span className="w-1 h-1 rounded-full bg-gray-300" /><span style={{ color: '#D97706' }}>+{Math.round(item.angka_kredit)} AK</span></>)}
                    </div>

                    {showCatatan && (
                        <div className="mt-3 rounded-xl px-3 py-2 text-xs leading-relaxed"
                            style={{ backgroundColor: status === 'Revisi' ? '#FCE7F3' : '#FEE2E2', color: status === 'Revisi' ? '#9D174D' : '#991B1B' }}>
                            <span className="font-bold">Catatan manajer:</span> {item.catatan_validasi}
                        </div>
                    )}

                    {(showPerbaiki || showSelesai) && (
                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                            {showPerbaiki && (
                                <button onClick={(e) => { e.stopPropagation(); onPerbaiki(item); }}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition hover:opacity-90 border"
                                    style={{ color: '#9D174D', borderColor: '#FBCFE8', backgroundColor: '#FDF2F8' }}>
                                    <Pencil size={14} /> Perbaiki &amp; Ajukan Ulang
                                </button>
                            )}
                            {showSelesai && (
                                <button onClick={(e) => { e.stopPropagation(); onSelesai(item); }} disabled={busy}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition disabled:opacity-50 hover:opacity-90"
                                    style={{ backgroundColor: '#059669' }}>
                                    {busy ? <Loader2 size={14} className="animate-spin" /> : <CheckCheck size={14} />} Tandai Selesai
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function DashboardPenelitian() {
    const router = useRouter();
    const [list, setList] = useState([]);
    const [totalAk, setTotalAk] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('Semua');
    const [searchQuery, setSearchQuery] = useState('');
    const [actingId, setActingId] = useState(null);

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await getProposalList();
            if (res?.status === 'success') {
                setList(res.data ?? []);
                setTotalAk(res.total_ak ?? 0);
            } else setError('Gagal memuat data dari server.');
        } catch (err) {
            setError(err?.userMessage ?? err?.message ?? 'Terjadi kesalahan jaringan.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleSelesai = async (item) => {
        setActingId(item.id);
        try {
            await selesaiProposal(item.id);
            await load();
        } catch (err) {
            setError(err?.userMessage ?? err?.message ?? 'Gagal menandai selesai.');
        } finally {
            setActingId(null);
        }
    };
    const handlePerbaiki = (item) => router.push(`/dosen/penelitian/tambah?id=${item.id}`);

    const stats = useMemo(() => ({
        total:   list.length,
        aktif:   list.filter(d => d.status === 'Aktif').length,
        selesai: list.filter(d => d.status === 'Selesai').length,
    }), [list]);

    const filtered = useMemo(() => {
        let result = list;
        if (activeTab !== 'Semua') result = result.filter(d => (STATUS_MAP[d.status]?.tab ?? d.status) === activeTab);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(d =>
                d.judul?.toLowerCase().includes(q) ||
                d.bidang_penelitian?.toLowerCase().includes(q)
            );
        }
        return result;
    }, [list, activeTab, searchQuery]);

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F0F4F0', fontFamily: 'Urbanist, sans-serif' }}>
            <Navbar />
            <main className="flex-grow max-w-[1000px] w-full mx-auto px-4 py-8">

                <button onClick={() => router.push('/dashboard')} className="text-sm font-bold mb-6 hover:opacity-70 transition block" style={{ color: '#1a4731' }}>
                    ← Kembali Ke Dashboard
                </button>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold mb-1" style={{ color: '#1a4731' }}>Dashboard Penelitian</h1>
                        <p className="text-sm font-semibold text-gray-500">Kelola proposal, progres, dan luaran penelitian ilmiah Anda</p>
                    </div>
                    <button onClick={() => router.push('/dosen/penelitian/tambah')}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm hover:opacity-90 transition whitespace-nowrap shrink-0"
                        style={{ backgroundColor: '#1a4731' }}>
                        <Plus size={16} strokeWidth={3} /> Tambah Penelitian
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <StatCard icon={FlaskConical} value={isLoading ? '–' : stats.total}   label="Total Penelitian"   iconColor="#1a4731" iconBg="#DCF0E5" />
                    <StatCard icon={Play}         value={isLoading ? '–' : stats.aktif}   label="Sedang Aktif"       iconColor="#0EA5E9" iconBg="#E0F2FE" />
                    <StatCard icon={CheckCircle2} value={isLoading ? '–' : stats.selesai} label="Telah Selesai"      iconColor="#10B981" iconBg="#D1FAE5" />
                    <StatCard icon={TrendingUp}   value={isLoading ? '–' : `${Math.round(totalAk)} AK`} label="Total AK Diperoleh" iconColor="#F59E0B" iconBg="#FEF3C7" />
                </div>

                <div className="rounded-2xl px-6 py-5 mb-6 flex items-center justify-between shadow-sm" style={{ backgroundColor: '#1a4731' }}>
                    <div>
                        <h3 className="text-white text-sm font-bold mb-0.5">Akumulasi Angka Kredit dari Penelitian</h3>
                        <p className="text-green-200 text-xs">
                            {stats.selesai > 0 ? `${stats.selesai} penelitian selesai telah diklaim ke BKD Anda.` : 'Belum ada penelitian yang selesai.'}
                        </p>
                    </div>
                    <div className="text-right shrink-0 ml-6">
                        <p className="text-3xl font-extrabold text-white">{Math.round(totalAk)}</p>
                        <p className="text-green-300 text-[10px] font-bold uppercase mt-0.5">AK Total</p>
                    </div>
                </div>

                <div className="relative mb-5">
                    <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Cari judul atau bidang penelitian..."
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-green-700 focus:ring-1 focus:ring-green-700 transition" />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 mb-4 hide-scrollbar">
                    {TABS.map(t => (
                        <button key={t} onClick={() => setActiveTab(t)}
                            className="px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors"
                            style={{ backgroundColor: activeTab === t ? '#1a4731' : '#fff', color: activeTab === t ? '#fff' : '#6B7280', border: activeTab === t ? 'none' : '1px solid #E5E7EB' }}>
                            {t}
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
                        <Loader2 size={36} className="animate-spin" />
                        <p className="text-sm font-semibold">Memuat data penelitian...</p>
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-2xl p-10 border border-red-100 flex flex-col items-center text-center">
                        <AlertCircle size={28} className="text-red-400 mb-3" />
                        <h3 className="text-base font-bold text-gray-700 mb-1">Gagal Memuat Data</h3>
                        <p className="text-sm text-gray-500 max-w-sm">{error}</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 border border-gray-100 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <FlaskConical size={30} className="text-gray-300" />
                        </div>
                        <h3 className="text-base font-bold text-gray-600 mb-2">{activeTab === 'Semua' && !searchQuery ? 'Belum Ada Penelitian' : 'Tidak Ada Hasil'}</h3>
                        <p className="text-sm text-gray-400 mb-6 max-w-sm">{activeTab === 'Semua' && !searchQuery ? 'Mulai dengan mengajukan proposal penelitian pertama Anda.' : 'Coba ubah filter atau kata kunci pencarian.'}</p>
                        {activeTab === 'Semua' && !searchQuery && (
                            <button onClick={() => router.push('/dosen/penelitian/tambah')} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition" style={{ backgroundColor: '#1a4731' }}>
                                <Plus size={15} strokeWidth={3} /> Ajukan Penelitian Pertama
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {filtered.map(item => (
                            <ProposalCard key={item.id} item={item} busy={actingId === item.id}
                                onOpen={(it) => router.push(`/dosen/penelitian/${it.id}`)}
                                onPerbaiki={handlePerbaiki}
                                onSelesai={handleSelesai} />
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
