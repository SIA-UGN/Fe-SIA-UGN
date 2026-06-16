'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Check, X, RotateCcw, Loader2, AlertCircle, FileText } from 'lucide-react';
import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import { getKegiatanManager, validasiKegiatan } from '@/lib/managerApi';

const fileUrl = (path) => {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/api\/?$/, '');
    return `${base}/storage/${path}`;
};
const fmtDate = (d) => {
    if (!d) return '—';
    const dt = new Date(d);
    return isNaN(dt) ? d : dt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

function InfoRow({ label, value }) {
    return (
        <div className="flex items-start justify-between gap-4 py-3">
            <span className="text-[15px] text-gray-500 shrink-0">{label}</span>
            <span className="text-[15px] font-bold text-gray-800 text-right break-words">{value}</span>
        </div>
    );
}

const BERKAS = [
    ['SK Mengajar dari Dekan', 'file_sk', 'PDF'],
    ['Bukti Submit Nilai Mahasiswa', 'file_nilai', 'PDF'],
    ['Rekap Presensi', 'file_presensi', 'XLSX'],
];

export default function ReviewKegiatanPage() {
    const router = useRouter();
    const { id } = useParams();

    const [item, setItem] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [acting, setActing] = useState(false);
    const [modal, setModal] = useState(null); // 'tolak' | 'revisi'
    const [catatan, setCatatan] = useState('');

    const load = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        setError(null);
        try {
            const res = await getKegiatanManager();
            const found = (res?.data ?? []).find(k => String(k.id) === String(id));
            if (found) setItem(found);
            else setError('Kegiatan tidak ditemukan atau sudah selesai divalidasi.');
        } catch (err) {
            setError(err?.userMessage ?? err?.message ?? 'Gagal memuat data.');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => { load(); }, [load]);

    const dosen = item?.userSi?.name ?? item?.user_si?.name ?? '—';

    const backToAktivitas = () => {
        const d = new URLSearchParams(window.location.search).get('dosen');
        router.push(d ? `/manager/dosen/${d}/aktivitas` : '/manager/dosen');
    };

    const submit = async (status_validasi, catatanText) => {
        setActing(true);
        try {
            await validasiKegiatan(id, { status_validasi, catatan_validasi: catatanText ?? '' });
            backToAktivitas();
        } catch (err) {
            setError(err?.userMessage ?? err?.message ?? 'Gagal memproses validasi.');
            setActing(false);
        }
    };

    const subtitle = item ? [
        item.jenis_kelas ? `Kelas ${item.jenis_kelas}` : null,
        item.kelas ? `Kelas ${item.kelas}` : null,
        [item.semester, item.tahun_ajaran].filter(Boolean).join(' '),
    ].filter(Boolean).join('  ·  ') : '';

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#E6EEE9', fontFamily: 'Urbanist, sans-serif' }}>
            <Navbar />
            <main className="flex-grow max-w-5xl w-full mx-auto px-5 py-7 pb-28">
                <button onClick={backToAktivitas} className="text-sm font-bold mb-7 hover:opacity-70 transition" style={{ color: '#1a4731' }}>
                    Kembali Ke Aktivitas Dosen
                </button>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
                        <Loader2 size={36} className="animate-spin" />
                        <p className="text-sm font-semibold">Memuat data kegiatan...</p>
                    </div>
                ) : error && !item ? (
                    <div className="bg-white rounded-2xl p-10 border border-red-100 flex flex-col items-center text-center">
                        <AlertCircle size={28} className="text-red-400 mb-3" />
                        <h3 className="text-base font-bold text-gray-700 mb-1">Gagal Memuat</h3>
                        <p className="text-sm text-gray-500 max-w-sm">{error}</p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="flex items-start justify-between gap-6 mb-7">
                            <div className="min-w-0">
                                <h1 className="text-[34px] leading-[1.15] font-extrabold mb-2" style={{ color: '#1a4731' }}>{item.mata_kuliah}</h1>
                                <p className="text-[15px] text-gray-500">👤 {dosen}{subtitle ? `  ·  ${subtitle}` : ''}</p>
                            </div>
                            <span className="text-sm font-semibold px-4 py-2 rounded-lg whitespace-nowrap shrink-0" style={{ color: '#B45309', backgroundColor: '#FBEFC9' }}>Menunggu Validasi</span>
                        </div>

                        {/* Berkas Wajib | Informasi Mengajar */}
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
                            <div className="lg:col-span-3 bg-white rounded-[24px] p-7 shadow-sm">
                                <h2 className="text-lg font-bold mb-4" style={{ color: '#1a4731' }}>Berkas Wajib</h2>
                                <div className="flex flex-col gap-3">
                                    {BERKAS.map(([label, key, tag]) => {
                                        const path = item[key] || (key === 'file_sk' ? item.file_bukti : null);
                                        return (
                                            <div key={key} className="flex items-center gap-4 rounded-2xl border px-4 py-3" style={{ borderColor: '#E5E7EB' }}>
                                                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#C9E9D4', color: '#1a4731' }}>
                                                    <FileText size={20} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[15px] font-bold text-gray-800 truncate">{path ? String(path).split('/').pop() : label}</p>
                                                    <p className="text-xs text-gray-400">{label}</p>
                                                </div>
                                                {path ? (
                                                    <a href={fileUrl(path)} target="_blank" rel="noreferrer" className="text-xs font-bold px-3 py-1.5 rounded-full shrink-0" style={{ backgroundColor: '#E5E7EB', color: '#6B7280' }}>{tag}</a>
                                                ) : (
                                                    <span className="text-xs text-gray-400 shrink-0">Belum ada</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="lg:col-span-2 bg-white rounded-[24px] p-7 shadow-sm">
                                <h2 className="text-lg font-bold mb-3" style={{ color: '#1a4731' }}>Informasi Mengajar</h2>
                                <div className="divide-y divide-gray-50">
                                    <InfoRow label="Kode Mata Kuliah" value={item.kode_mk || '—'} />
                                    <InfoRow label="SKS" value={item.sks != null ? `${item.sks} SKS` : '—'} />
                                    <InfoRow label="Jumlah Mahasiswa" value={item.jumlah_mahasiswa != null ? `${item.jumlah_mahasiswa} Mahasiswa` : '—'} />
                                    <InfoRow label="Jenis" value={item.jenis_kelas ? `Kelas ${item.jenis_kelas}` : '—'} />
                                    <InfoRow label="Semester" value={item.semester || '—'} />
                                    <InfoRow label="Tahun Ajaran" value={item.tahun_ajaran || '—'} />
                                    <InfoRow label="Diajukan" value={fmtDate(item.created_at)} />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>

            {/* Sticky actions */}
            {!isLoading && item && (
                <div className="sticky bottom-0 w-full border-t border-gray-200 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
                    <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-end gap-3">
                        <button onClick={() => { setModal('revisi'); setCatatan(''); }} disabled={acting}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition disabled:opacity-50 hover:bg-pink-50 border" style={{ color: '#DB2777', borderColor: '#FBCFE8' }}>
                            <RotateCcw size={15} /> Minta Revisi
                        </button>
                        <button onClick={() => { setModal('tolak'); setCatatan(''); }} disabled={acting}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition disabled:opacity-50 hover:bg-red-50 border" style={{ color: '#DC2626', borderColor: '#FECACA' }}>
                            <X size={15} strokeWidth={3} /> Tolak
                        </button>
                        <button onClick={() => submit('Disetujui')} disabled={acting}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition disabled:opacity-50 hover:opacity-90" style={{ backgroundColor: '#059669' }}>
                            {acting ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} strokeWidth={3} />} Setujui
                        </button>
                    </div>
                </div>
            )}

            {/* Modal Tolak / Revisi */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setModal(null)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-extrabold text-gray-800 mb-1">{modal === 'revisi' ? 'Minta Revisi' : 'Tolak Pengajuan'}</h3>
                        <p className="text-sm text-gray-500 mb-4">{modal === 'revisi' ? 'Jelaskan apa yang perlu diperbaiki dosen.' : 'Berikan alasan agar dosen bisa memperbaiki.'}</p>
                        <textarea value={catatan} onChange={e => setCatatan(e.target.value)} rows={3}
                            placeholder={modal === 'revisi' ? 'Catatan revisi...' : 'Catatan penolakan...'}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition resize-none mb-5" />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setModal(null)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 border border-gray-200 transition">Batal</button>
                            <button
                                onClick={() => submit(modal === 'revisi' ? 'Revisi' : 'Ditolak', catatan)}
                                disabled={acting || (modal === 'revisi' && !catatan.trim())}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition disabled:opacity-50 hover:opacity-90"
                                style={{ backgroundColor: modal === 'revisi' ? '#DB2777' : '#DC2626' }}>
                                {acting ? <Loader2 size={14} className="animate-spin" /> : (modal === 'revisi' ? <RotateCcw size={14} /> : <X size={14} strokeWidth={3} />)}
                                {modal === 'revisi' ? 'Kirim Revisi' : 'Tolak'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
}
