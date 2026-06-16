'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    ArrowLeft, BookOpen, FlaskConical, Heart, Star, FileText,
    Check, X, Loader2, AlertCircle,
} from 'lucide-react';
import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import { getBkdSubmissions, validasiBkdSubmission } from '@/lib/managerApi';

const KATEGORI = [
    { key: 'Pendidikan', label: 'Pendidikan & Pengajaran', icon: BookOpen },
    { key: 'Penelitian', label: 'Penelitian',              icon: FlaskConical },
    { key: 'Pengabdian', label: 'Pengabdian Masyarakat',   icon: Heart },
    { key: 'Penunjang',  label: 'Penunjang',               icon: Star },
];

const fileUrl = (path) => {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/api\/?$/, '');
    return `${base}/storage/${path}`;
};

export default function ReviewBkdPage() {
    const router = useRouter();
    const { id } = useParams();

    const [bkd, setBkd] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeKat, setActiveKat] = useState('Pendidikan');
    const [acting, setActing] = useState(false);
    const [showReject, setShowReject] = useState(false);
    const [catatan, setCatatan] = useState('');

    const load = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        setError(null);
        try {
            const res = await getBkdSubmissions();
            const found = (res?.data ?? []).find(b => String(b.id) === String(id));
            if (found) setBkd(found);
            else setError('Data BKD tidak ditemukan atau sudah selesai divalidasi.');
        } catch (err) {
            setError(err?.userMessage ?? err?.message ?? 'Gagal memuat data BKD.');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => { load(); }, [load]);

    const kegiatans = bkd?.kegiatans ?? [];
    const perKat = useMemo(() => kegiatans.filter(k => k.kategori === activeKat), [kegiatans, activeKat]);
    const subtotal = useMemo(() => perKat.reduce((s, k) => s + Number(k.sks_beban ?? 0), 0), [perKat]);
    const totalAK = useMemo(() => kegiatans.reduce((s, k) => s + Number(k.sks_beban ?? 0), 0), [kegiatans]);

    const dosenNama = bkd?.user_si?.name ?? bkd?.userSi?.name ?? '—';
    const periode = bkd?.academic_period?.name ?? bkd?.academicPeriod?.name ?? '';

    // Kembali ke Aktivitas Dosen (bawa dosen id dari query ?dosen=)
    const backToAktivitas = () => {
        const d = new URLSearchParams(window.location.search).get('dosen');
        router.push(d ? `/manager/dosen/${d}/aktivitas` : '/manager/dosen');
    };

    const doValidate = async (status, catatanText) => {
        setActing(true);
        try {
            await validasiBkdSubmission(id, { status, catatan_manager: catatanText ?? '' });
            backToAktivitas();
        } catch (err) {
            setError(err?.userMessage ?? err?.message ?? 'Gagal memproses validasi.');
            setActing(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F0F4F0', fontFamily: 'Urbanist, sans-serif' }}>
            <Navbar />
            <main className="flex-grow max-w-3xl w-full mx-auto px-4 py-8 pb-28">
                <button onClick={backToAktivitas} className="flex items-center gap-1.5 text-sm font-bold mb-6 hover:opacity-70 transition" style={{ color: '#1a4731' }}>
                    <ArrowLeft size={15} /> Kembali Ke Aktivitas Dosen
                </button>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
                        <Loader2 size={36} className="animate-spin" />
                        <p className="text-sm font-semibold">Memuat data BKD...</p>
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-2xl p-10 border border-red-100 flex flex-col items-center text-center">
                        <AlertCircle size={28} className="text-red-400 mb-3" />
                        <h3 className="text-base font-bold text-gray-700 mb-1">Gagal Memuat</h3>
                        <p className="text-sm text-gray-500 max-w-sm">{error}</p>
                    </div>
                ) : (
                    <>
                        <h1 className="text-2xl font-extrabold mb-1" style={{ color: '#1a4731' }}>Review BKD</h1>
                        <p className="text-sm font-semibold text-gray-500 mb-5">{dosenNama}{periode && ` · ${periode}`}</p>

                        <div className="rounded-xl px-5 py-4 mb-6 text-sm leading-relaxed" style={{ backgroundColor: '#D6E8DC', color: '#1a4731' }}>
                            Halaman ini untuk verifikasi data BKD. Klik <strong>“Lihat Bukti”</strong> pada tiap kegiatan untuk membuka dokumen bukti. Setelah selesai memeriksa, gunakan tombol aksi di bawah.
                        </div>

                        {/* Tab kategori */}
                        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 hide-scrollbar">
                            {KATEGORI.map(k => {
                                const Icon = k.icon;
                                const active = activeKat === k.key;
                                const count = kegiatans.filter(x => x.kategori === k.key).length;
                                return (
                                    <button key={k.key} onClick={() => setActiveKat(k.key)}
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-colors"
                                        style={{ backgroundColor: active ? '#1a4731' : '#fff', color: active ? '#fff' : '#6B7280', border: active ? 'none' : '1px solid #E5E7EB' }}>
                                        <Icon size={15} /> {k.label}{count > 0 && ` (${count})`}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Daftar kegiatan kategori aktif */}
                        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
                            {perKat.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-8">Tidak ada kegiatan pada kategori ini.</p>
                            ) : (
                                <div className="flex flex-col gap-5">
                                    {perKat.map((k, idx) => {
                                        const hasRincian = k.volume != null && k.ak_per_satuan != null;
                                        return (
                                        <div key={k.id ?? idx} className="rounded-2xl border p-5" style={{ borderColor: '#E5E7EB' }}>
                                            <p className="text-xs font-bold tracking-wider text-gray-400 mb-3">KEGIATAN #{idx + 1}</p>
                                            <div className="mb-3">
                                                <p className="text-[11px] text-gray-400 mb-1">Jenis Kegiatan</p>
                                                <p className="text-sm font-bold text-gray-800">{k.nama_kegiatan}</p>
                                            </div>
                                            {hasRincian && (
                                                <div className="grid grid-cols-2 gap-3 mb-3">
                                                    <div className="rounded-xl border px-4 py-2.5" style={{ borderColor: '#E5E7EB' }}>
                                                        <p className="text-[11px] text-gray-400 mb-0.5">Jumlah{k.satuan ? ` (${k.satuan})` : ''}</p>
                                                        <p className="text-sm font-bold text-gray-800">{Number(k.volume)}</p>
                                                    </div>
                                                    <div className="rounded-xl px-4 py-2.5" style={{ backgroundColor: '#E6EEE9' }}>
                                                        <p className="text-[11px] text-gray-500 mb-0.5">AK per Satuan</p>
                                                        <p className="text-sm font-bold" style={{ color: '#1a4731' }}>{Number(k.ak_per_satuan)} AK{k.satuan ? ` / ${k.satuan}` : ''}</p>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between rounded-xl px-4 py-3 mb-3" style={{ backgroundColor: '#1a4731', color: '#fff' }}>
                                                <span className="text-sm">{hasRincian ? `${Number(k.volume)} × ${Number(k.ak_per_satuan)} AK` : 'Total AK Kegiatan Ini'}</span>
                                                <span className="text-sm font-bold">{Number(k.sks_beban ?? 0).toFixed(1)} AK</span>
                                            </div>
                                            <div>
                                                <p className="text-[11px] text-gray-400 mb-1.5">Bukti Dokumen</p>
                                                {(k.bukti_kinerja || k.bukti_penugasan) ? (
                                                    <a href={fileUrl(k.bukti_kinerja || k.bukti_penugasan)} target="_blank" rel="noreferrer"
                                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition hover:bg-gray-50"
                                                        style={{ color: '#1a4731', borderColor: '#D6E8DC' }}>
                                                        <FileText size={15} /> Lihat Bukti
                                                    </a>
                                                ) : (
                                                    <p className="text-sm text-gray-400">Tidak ada bukti diunggah.</p>
                                                )}
                                            </div>
                                        </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="mt-6 rounded-xl px-5 py-3 flex items-center justify-between" style={{ backgroundColor: '#E6EEE9' }}>
                                <span className="text-sm font-semibold" style={{ color: '#1a4731' }}>Subtotal AK {activeKat}</span>
                                <span className="text-sm font-bold" style={{ color: '#1a4731' }}>{subtotal.toFixed(1)} AK</span>
                            </div>
                        </div>
                    </>
                )}
            </main>

            {/* Sticky action bar */}
            {!isLoading && !error && bkd && (
                <div className="sticky bottom-0 w-full border-t border-gray-200 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
                    <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500">Total AK keseluruhan</p>
                            <p className="text-2xl font-extrabold" style={{ color: '#1a4731' }}>{totalAK.toFixed(1)} <span className="text-sm font-semibold text-gray-500">AK</span></p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => { setShowReject(true); setCatatan(''); }} disabled={acting}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition disabled:opacity-50 hover:bg-red-50 border" style={{ color: '#DC2626', borderColor: '#FECACA' }}>
                                <X size={15} strokeWidth={3} /> Tolak
                            </button>
                            <button onClick={() => doValidate('disetujui')} disabled={acting}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition disabled:opacity-50 hover:opacity-90" style={{ backgroundColor: '#059669' }}>
                                {acting ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} strokeWidth={3} />} Setuju
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Tolak */}
            {showReject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setShowReject(false)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-extrabold text-gray-800 mb-1">Tolak BKD</h3>
                        <p className="text-sm text-gray-500 mb-4">Berikan alasan agar dosen bisa memperbaiki & mengajukan ulang.</p>
                        <textarea value={catatan} onChange={e => setCatatan(e.target.value)} rows={3} placeholder="Catatan penolakan..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition resize-none mb-5" />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowReject(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 border border-gray-200 transition">Batal</button>
                            <button onClick={() => doValidate('ditolak', catatan)} disabled={acting || !catatan.trim()}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition disabled:opacity-50 hover:opacity-90" style={{ backgroundColor: '#DC2626' }}>
                                {acting ? <Loader2 size={14} className="animate-spin" /> : <X size={14} strokeWidth={3} />} Tolak BKD
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
}
