'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    BookOpen, FlaskConical, Heart, Award, ClipboardList, BookMarked,
    Search, CheckCircle2, XCircle, Clock, Loader2, AlertCircle, Check, X, RotateCcw, ChevronRight
} from 'lucide-react';
import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import {
    getKegiatanManager, validasiKegiatan,
    getPenelitianManager, validasiPenelitian,
    getPengabdianManager, validasiPengabdian,
    getManagerPengajuanBkd, validasiPengajuanBkd,
    getBkdSubmissions,
    getProposalManager,
} from '@/lib/managerApi';

// ── Konfigurasi per jenis validasi ───────────────────────────────────────────
const TABS = [
    {
        key: 'kegiatan', label: 'Kegiatan Mengajar', icon: BookOpen,
        fetch: getKegiatanManager,
        reviewHref: (i) => `/manager/validasi/kegiatan/${i.id}`,
        validate: (id, approve, catatan) => validasiKegiatan(id, {
            status_validasi: approve ? 'Disetujui' : 'Ditolak',
            catatan_validasi: catatan ?? '',
        }),
        // Aksi tambahan: minta revisi (kembalikan ke dosen dgn catatan)
        revisi: (id, catatan) => validasiKegiatan(id, { status_validasi: 'Revisi', catatan_validasi: catatan ?? '' }),
        title: i => i.mata_kuliah,
        sub:   i => [i.kode_mk, i.kelas && `Kelas ${i.kelas}`].filter(Boolean).join(' / '),
        meta:  i => [i.sks != null && `${i.sks} SKS`, i.semester && `Sem. ${i.semester}`, i.tahun_ajaran].filter(Boolean),
        dosen: i => i.userSi?.name ?? i.user_si?.name,
        status: i => i.status_validasi,
        pending: i => i.status_validasi === 'Diajukan',
    },
    {
        key: 'penelitian-proposal', label: 'Penelitian', icon: FlaskConical,
        fetch: getProposalManager,
        reviewHref: (i) => `/manager/validasi/penelitian-proposal/${i.id}`,
        title: i => i.judul,
        sub:   i => [i.bidang_penelitian, i.sumber_dana].filter(Boolean).join(' · '),
        meta:  i => [i.tahun].filter(Boolean),
        dosen: i => i.userSi?.name ?? i.user_si?.name,
        status: i => i.status,
        pending: i => i.status === 'Pengajuan',
    },
    {
        key: 'penelitian', label: 'Publikasi', icon: BookMarked,
        fetch: getPenelitianManager,
        reviewHref: (i) => `/manager/validasi/penelitian/${i.id}`,
        validate: (id, approve, catatan) => validasiPenelitian(id, {
            status_validasi: approve ? 'Disetujui' : 'Ditolak',
            catatan_validasi: catatan ?? '',
        }),
        revisi: (id, catatan) => validasiPenelitian(id, { status_validasi: 'Revisi', catatan_validasi: catatan ?? '' }),
        title: i => i.judul,
        sub:   i => [i.jenis_output, i.nama_publikasi].filter(Boolean).join(' · '),
        meta:  i => [i.tahun_terbit, i.status_akreditasi].filter(Boolean),
        dosen: i => i.authors?.[0]?.name,
        status: i => i.status_validasi,
        pending: i => i.status_validasi === 'Diajukan',
    },
    {
        key: 'pengabdian', label: 'Pengabdian', icon: Heart,
        fetch: getPengabdianManager,
        validate: (id, approve) => validasiPengabdian(id, approve ? 'Disetujui' : 'Ditolak'),
        title: i => i.judul_kegiatan,
        sub:   i => [i.skema, i.lokasi].filter(Boolean).join(' · '),
        meta:  i => [i.tahun_pelaksanaan, i.sumber_dana].filter(Boolean),
        dosen: i => i.authors?.[0]?.name,
        status: i => i.status_validasi,
        pending: i => ['Draft', 'Diajukan'].includes(i.status_validasi),
    },
    {
        key: 'bkd', label: 'Angka Kredit', icon: Award,
        fetch: getManagerPengajuanBkd,
        validate: (id, approve, catatan) => validasiPengajuanBkd(id, {
            status: approve ? 'divalidasi_manager' : 'ditolak',
            catatan_manager: catatan ?? '',
        }),
        title: i => i.user_si?.name ?? `Pengajuan #${i.id}`,
        sub:   i => 'Pengajuan Kenaikan Jabatan',
        meta:  i => [i.total_kum != null && `${i.total_kum} KUM`].filter(Boolean),
        dosen: i => i.user_si?.name,
        status: i => i.status,
        pending: i => i.status === 'diajukan',
    },
    {
        key: 'review-bkd', label: 'Review BKD', icon: ClipboardList,
        fetch: getBkdSubmissions,
        // Review BKD pakai halaman penuh (bukan modal): kartu mengarah ke /manager/validasi/bkd/{id}
        reviewHref: (i) => `/manager/validasi/bkd/${i.id}`,
        title: i => i.user_si?.name ?? i.userSi?.name ?? `BKD #${i.id}`,
        sub:   i => 'Beban Kerja Dosen (BKD)',
        meta:  i => [i.academic_period?.name ?? i.academicPeriod?.name].filter(Boolean),
        dosen: i => i.user_si?.name ?? i.userSi?.name,
        status: i => i.status,
        pending: i => i.status === 'diajukan',
    },
];

// PengajuanKenaikanJabatan (Angka Kredit) pakai PK `id_pengajuan`; modul lain pakai `id`.
// Helper ini ambil id yang benar untuk semua tab tanpa salah kirim `undefined`.
const rowId = (i) => i?.id_pengajuan ?? i?.id;

const STATUS_STYLE = (raw) => {
    const s = String(raw ?? '').toLowerCase();
    if (['disetujui', 'divalidasi_manager', 'aktif', 'selesai'].includes(s)) return { label: 'Disetujui', color: '#059669', bg: '#D1FAE5' };
    if (['ditolak'].includes(s))                          return { label: 'Ditolak',   color: '#DC2626', bg: '#FEE2E2' };
    if (['draft', 'diajukan', 'eligible', 'pengajuan'].includes(s)) return { label: 'Menunggu', color: '#D97706', bg: '#FEF3C7' };
    if (['revisi'].includes(s))                           return { label: 'Revisi',    color: '#DB2777', bg: '#FCE7F3' };
    return { label: raw ?? '-', color: '#6B7280', bg: '#F3F4F6' };
};

function StatCard({ icon: Icon, value, label, color, bg }) {
    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg, color }}>
                <Icon size={20} strokeWidth={2.5} />
            </div>
            <div>
                <p className="text-2xl font-extrabold text-gray-800">{value}</p>
                <p className="text-xs font-semibold text-gray-500 mt-0.5">{label}</p>
            </div>
        </div>
    );
}

export default function ValidasiManager() {
    const router = useRouter();
    const [activeKey, setActiveKey] = useState('kegiatan');
    const [list, setList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [actingId, setActingId] = useState(null);
    const [rejectTarget, setRejectTarget] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [revisiTarget, setRevisiTarget] = useState(null);
    const [revisiReason, setRevisiReason] = useState('');

    const cfg = useMemo(() => TABS.find(t => t.key === activeKey), [activeKey]);

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await cfg.fetch();
            setList(res?.status === 'success' ? (res.data ?? []) : []);
            if (res?.status !== 'success') setError('Gagal memuat data dari server.');
        } catch (err) {
            setError(err?.userMessage ?? err?.message ?? 'Terjadi kesalahan jaringan.');
            setList([]);
        } finally {
            setIsLoading(false);
        }
    }, [cfg]);

    useEffect(() => { load(); }, [load]);

    const stats = useMemo(() => {
        const total   = list.length;
        const perlu   = list.filter(i => cfg.pending(i)).length;
        const selesai = list.filter(i => ['Disetujui', 'divalidasi_manager'].includes(i.status_validasi ?? i.status)).length;
        const ditolak = list.filter(i => (i.status_validasi ?? i.status) === 'ditolak' || (i.status_validasi ?? i.status) === 'Ditolak').length;
        return { total, perlu, selesai, ditolak };
    }, [list, cfg]);

    const filtered = useMemo(() => {
        if (!search.trim()) return list;
        const q = search.toLowerCase();
        return list.filter(i =>
            String(cfg.title(i) ?? '').toLowerCase().includes(q) ||
            String(cfg.dosen(i) ?? '').toLowerCase().includes(q) ||
            String(cfg.sub(i) ?? '').toLowerCase().includes(q)
        );
    }, [list, search, cfg]);

    const doApprove = async (item) => {
        setActingId(rowId(item));
        try {
            await cfg.validate(rowId(item), true);
            await load();
        } catch (err) {
            setError(err?.userMessage ?? err?.message ?? 'Gagal menyetujui.');
        } finally {
            setActingId(null);
        }
    };

    const confirmReject = async () => {
        if (!rejectTarget) return;
        setActingId(rowId(rejectTarget));
        try {
            await cfg.validate(rowId(rejectTarget), false, rejectReason);
            setRejectTarget(null);
            setRejectReason('');
            await load();
        } catch (err) {
            setError(err?.userMessage ?? err?.message ?? 'Gagal menolak.');
        } finally {
            setActingId(null);
        }
    };

    const confirmRevisi = async () => {
        if (!revisiTarget || !cfg.revisi) return;
        setActingId(rowId(revisiTarget));
        try {
            await cfg.revisi(rowId(revisiTarget), revisiReason);
            setRevisiTarget(null);
            setRevisiReason('');
            await load();
        } catch (err) {
            setError(err?.userMessage ?? err?.message ?? 'Gagal meminta revisi.');
        } finally {
            setActingId(null);
        }
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F0F4F0', fontFamily: 'Urbanist, sans-serif' }}>
            <Navbar />
            <main className="flex-grow max-w-[1000px] w-full mx-auto px-4 py-8">

                <button onClick={() => router.push('/dashboard')} className="text-sm font-bold mb-6 hover:opacity-70 transition block" style={{ color: '#1a4731' }}>
                    ← Kembali Ke Dashboard
                </button>

                <h1 className="text-3xl font-extrabold mb-1" style={{ color: '#1a4731' }}>Validasi Pengajuan Dosen</h1>
                <p className="text-sm font-semibold text-gray-500 mb-6">Review berkas dan validasi pengajuan aktivitas Tri Dharma dosen</p>

                {/* Tabs jenis */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-6 hide-scrollbar">
                    {TABS.map(t => {
                        const Icon = t.icon;
                        const active = activeKey === t.key;
                        return (
                            <button
                                key={t.key}
                                onClick={() => { setActiveKey(t.key); setSearch(''); }}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-colors"
                                style={{
                                    backgroundColor: active ? '#1a4731' : '#fff',
                                    color: active ? '#fff' : '#6B7280',
                                    border: active ? 'none' : '1px solid #E5E7EB',
                                }}
                            >
                                <Icon size={16} /> {t.label}
                            </button>
                        );
                    })}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <StatCard icon={cfg.icon}     value={isLoading ? '–' : stats.total}   label="Total Pengajuan" color="#1a4731" bg="#DCF0E5" />
                    <StatCard icon={Clock}        value={isLoading ? '–' : stats.perlu}   label="Perlu Validasi"  color="#D97706" bg="#FEF3C7" />
                    <StatCard icon={CheckCircle2} value={isLoading ? '–' : stats.selesai} label="Disetujui"       color="#10B981" bg="#D1FAE5" />
                    <StatCard icon={XCircle}      value={isLoading ? '–' : stats.ditolak} label="Ditolak"         color="#DC2626" bg="#FEE2E2" />
                </div>

                {/* Search */}
                <div className="relative mb-5">
                    <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Cari judul, kode, atau nama dosen..."
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-green-700 focus:ring-1 focus:ring-green-700 transition"
                    />
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
                        <Loader2 size={36} className="animate-spin" />
                        <p className="text-sm font-semibold">Memuat data...</p>
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
                            <CheckCircle2 size={30} className="text-gray-300" />
                        </div>
                        <h3 className="text-base font-bold text-gray-600 mb-1">Tidak Ada Pengajuan</h3>
                        <p className="text-sm text-gray-400 max-w-sm">Belum ada {cfg.label.toLowerCase()} yang perlu divalidasi.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {filtered.map(item => {
                            const st = STATUS_STYLE(cfg.status(item));
                            const isPending = cfg.pending(item);
                            const Icon = cfg.icon;
                            const busy = actingId === rowId(item);
                            const href = cfg.reviewHref ? cfg.reviewHref(item) : null;
                            return (
                                <div key={rowId(item)}
                                    onClick={href ? () => router.push(href) : undefined}
                                    className={`bg-white rounded-2xl p-6 border border-gray-100 shadow-sm${href ? ' cursor-pointer hover:shadow-md hover:border-gray-200 transition' : ''}`}
                                    style={{ borderLeft: isPending ? '4px solid #D6A407' : '1px solid #f3f4f6' }}>
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: '#1a4731', color: '#fff' }}>
                                            <Icon size={22} strokeWidth={2} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3 mb-1">
                                                <h3 className="text-sm font-bold text-gray-800 leading-snug">{cfg.title(item)}</h3>
                                                <span className="text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap" style={{ color: st.color, backgroundColor: st.bg }}>{st.label}</span>
                                            </div>
                                            {cfg.sub(item) && <p className="text-sm text-gray-500 mb-1">{cfg.sub(item)}</p>}
                                            {cfg.dosen(item) && <p className="text-xs font-semibold text-[#1a4731] mb-2">👤 {cfg.dosen(item)}</p>}
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-gray-400">
                                                {cfg.meta(item).map((m, i) => (
                                                    <span key={i} className="flex items-center gap-2">
                                                        {i > 0 && <span className="w-1 h-1 rounded-full bg-gray-300" />}{m}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Halaman review penuh (mis. Review BKD) */}
                                            {href && isPending && (
                                                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 text-sm font-bold" style={{ color: '#1a4731' }}>
                                                    <ClipboardList size={15} /> Buka untuk review <ChevronRight size={15} />
                                                </div>
                                            )}

                                            {/* Aksi validasi inline */}
                                            {!href && isPending && (
                                                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                                                    <button
                                                        onClick={() => doApprove(item)}
                                                        disabled={busy}
                                                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition disabled:opacity-50 hover:opacity-90"
                                                        style={{ backgroundColor: '#059669' }}
                                                    >
                                                        {busy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} strokeWidth={3} />} Setujui
                                                    </button>
                                                    {cfg.revisi && (
                                                        <button
                                                            onClick={() => { setRevisiTarget(item); setRevisiReason(''); }}
                                                            disabled={busy}
                                                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition disabled:opacity-50 hover:bg-pink-50 border"
                                                            style={{ color: '#DB2777', borderColor: '#FBCFE8' }}
                                                        >
                                                            <RotateCcw size={14} /> Minta Revisi
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => { setRejectTarget(item); setRejectReason(''); }}
                                                        disabled={busy}
                                                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition disabled:opacity-50 hover:bg-red-50 border"
                                                        style={{ color: '#DC2626', borderColor: '#FECACA' }}
                                                    >
                                                        <X size={14} strokeWidth={3} /> Tolak
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Modal Tolak */}
            {rejectTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setRejectTarget(null)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-extrabold text-gray-800 mb-1">Tolak Pengajuan</h3>
                        <p className="text-sm text-gray-500 mb-4">{cfg.title(rejectTarget)}</p>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Catatan / alasan penolakan (opsional)</label>
                        <textarea
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            rows={3}
                            placeholder="Tuliskan alasan agar dosen bisa memperbaiki..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition resize-none mb-5"
                        />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setRejectTarget(null)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 border border-gray-200 transition">Batal</button>
                            <button
                                onClick={confirmReject}
                                disabled={actingId === rowId(rejectTarget)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition disabled:opacity-50 hover:opacity-90"
                                style={{ backgroundColor: '#DC2626' }}
                            >
                                {actingId === rowId(rejectTarget) ? <Loader2 size={14} className="animate-spin" /> : <X size={14} strokeWidth={3} />} Tolak Pengajuan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Minta Revisi */}
            {revisiTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setRevisiTarget(null)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-extrabold text-gray-800 mb-1">Minta Revisi</h3>
                        <p className="text-sm text-gray-500 mb-4">{cfg.title(revisiTarget)}</p>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                            Catatan revisi untuk dosen <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            value={revisiReason}
                            onChange={e => setRevisiReason(e.target.value)}
                            rows={3}
                            placeholder="Jelaskan apa yang perlu diperbaiki dosen..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 transition resize-none mb-5"
                        />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setRevisiTarget(null)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 border border-gray-200 transition">Batal</button>
                            <button
                                onClick={confirmRevisi}
                                disabled={actingId === rowId(revisiTarget) || !revisiReason.trim()}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition disabled:opacity-50 hover:opacity-90"
                                style={{ backgroundColor: '#DB2777' }}
                            >
                                {actingId === rowId(revisiTarget) ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />} Kirim Permintaan Revisi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
