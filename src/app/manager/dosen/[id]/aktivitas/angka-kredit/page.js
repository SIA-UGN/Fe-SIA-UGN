'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    ArrowLeft, BookOpen, FlaskConical, Handshake, Puzzle,
    Award, CheckCircle2, XCircle, Clock, Loader2, AlertCircle, Check, X, FileText
} from 'lucide-react';

const DOC_LABELS = {
    dokumen_1: 'SK Pangkat/Golongan Terakhir',
    dokumen_2: 'Penilaian Kinerja (SKP)',
    dokumen_3: 'Surat Pengantar Dekan',
    dokumen_4: 'PAK / DUPAK Terakhir',
    dokumen_5: 'Fotokopi Ijazah Terlegalisir',
    dokumen_6: 'Sertifikat Pendidik (Serdos)',
};

const fileUrl = (path) => {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/api\/?$/, '');
    return `${base}/storage/${path}`;
};
import Navbar from '@/components/ui/navigation-menu';
import {
    getManagerLecturerAktivitas,
    getManagerPengajuanBkd,
    validasiPengajuanBkd,
} from '@/lib/managerApi';

const S = {
    page: { minHeight: '100vh', background: '#f0f4f0', fontFamily: 'Urbanist, sans-serif' },
    wrap: { maxWidth: 820, margin: '0 auto', padding: '24px 16px' },
    back: { display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#1a4731', fontWeight: 700, fontSize: 13, marginBottom: 24 },
};

const RINCIAN = [
    { key: 'pendidikan', label: 'Pendidikan & Pengajaran', icon: BookOpen,  color: '#044B33', bg: '#E6EEE9' },
    { key: 'penelitian', label: 'Penelitian',              icon: FlaskConical, color: '#0EA5E9', bg: '#E0F2FE' },
    { key: 'pengabdian', label: 'Pengabdian Masyarakat',   icon: Handshake, color: '#10B981', bg: '#D1FAE5' },
    { key: 'penunjang',  label: 'Penunjang',               icon: Puzzle,    color: '#DABC4E', bg: '#FEF9E7' },
];

const PENGAJUAN_STATUS = {
    eligible:            { label: 'Memenuhi Syarat',    color: '#0EA5E9', bg: '#E0F2FE' },
    diajukan:            { label: 'Menunggu Validasi',  color: '#D97706', bg: '#FEF3C7' },
    divalidasi_manager:  { label: 'Disetujui',          color: '#059669', bg: '#D1FAE5' },
    ditolak:             { label: 'Ditolak',            color: '#DC2626', bg: '#FEE2E2' },
};

export default function ApprovalAngkaKreditPage() {
    const router = useRouter();
    const { id } = useParams();

    const [akt, setAkt] = useState(null);
    const [pengajuan, setPengajuan] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [acting, setActing] = useState(false);
    const [showReject, setShowReject] = useState(false);
    const [catatan, setCatatan] = useState('');

    const load = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        setError(null);
        try {
            const [aktRes, bkdRes] = await Promise.allSettled([
                getManagerLecturerAktivitas(id),
                getManagerPengajuanBkd(),
            ]);
            if (aktRes.status === 'fulfilled') setAkt(aktRes.value?.data ?? null);
            if (bkdRes.status === 'fulfilled') {
                const mine = (bkdRes.value?.data ?? []).filter(p => String(p.id_user_si) === String(id));
                setPengajuan(mine[0] ?? null);
            }
            if (aktRes.status === 'rejected' && bkdRes.status === 'rejected') {
                setError('Gagal memuat data dari server.');
            }
        } catch (err) {
            setError(err?.userMessage ?? err?.message ?? 'Terjadi kesalahan jaringan.');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => { load(); }, [load]);

    const ak = akt?.angka_kredit;
    const totalKum = Number(ak?.total_kum ?? 0);
    const targetKum = Number(ak?.target_kum ?? 0);
    const pct = targetKum > 0 ? Math.min(Math.round((totalKum / targetKum) * 100), 100) : 0;

    const doValidate = async (approve) => {
        if (!pengajuan) return;
        setActing(true);
        try {
            await validasiPengajuanBkd(pengajuan.id_pengajuan ?? pengajuan.id, {
                status: approve ? 'divalidasi_manager' : 'ditolak',
                catatan_manager: approve ? '' : catatan,
            });
            setShowReject(false);
            setCatatan('');
            await load();
        } catch (err) {
            setError(err?.userMessage ?? err?.message ?? 'Gagal memproses validasi.');
        } finally {
            setActing(false);
        }
    };

    const st = pengajuan ? (PENGAJUAN_STATUS[pengajuan.status] ?? { label: pengajuan.status, color: '#6B7280', bg: '#F3F4F6' }) : null;
    const isPending = pengajuan?.status === 'diajukan';

    return (
        <div style={S.page}>
            <Navbar />
            <div style={S.wrap}>
                <button style={S.back} onClick={() => router.push(`/manager/dosen/${id}/aktivitas`)}>
                    <ArrowLeft size={16} /> Kembali Ke Aktivitas Dosen
                </button>

                <h1 className="text-2xl font-extrabold mb-1" style={{ color: '#1a4731' }}>Validasi Angka Kredit Dosen</h1>
                <p className="text-sm font-semibold text-gray-500 mb-6">
                    {akt ? `${akt.nama ?? '—'} · ${akt.jabatan ?? '—'} · ${akt.prodi ?? '—'}` : 'Review angka kredit & pengajuan kenaikan jabatan'}
                </p>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
                        <Loader2 size={36} className="animate-spin" />
                        <p className="text-sm font-semibold">Memuat data angka kredit...</p>
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-2xl p-10 border border-red-100 flex flex-col items-center text-center">
                        <AlertCircle size={28} className="text-red-400 mb-3" />
                        <h3 className="text-base font-bold text-gray-700 mb-1">Gagal Memuat Data</h3>
                        <p className="text-sm text-gray-500 max-w-sm">{error}</p>
                    </div>
                ) : (
                    <>
                        {/* Progress total */}
                        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#E6EEE9', color: '#044B33' }}>
                                        <Award size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">Total Angka Kredit (KUM)</p>
                                        <p className="text-xs text-gray-500">{totalKum} dari target {targetKum || '—'} KUM</p>
                                    </div>
                                </div>
                                <p className="text-2xl font-extrabold" style={{ color: '#044B33' }}>{totalKum}</p>
                            </div>
                            <div className="w-full h-2.5 rounded-full" style={{ backgroundColor: '#E5E7EB' }}>
                                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: '#044B33' }} />
                            </div>
                            <p className="text-xs font-semibold text-gray-500 mt-2">{pct}% dari target jabatan berikutnya</p>
                        </div>

                        {/* Rincian per kategori */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {RINCIAN.map(r => {
                                const Icon = r.icon;
                                return (
                                    <div key={r.key} className="bg-white rounded-[18px] p-5 shadow-sm border border-gray-100">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: r.bg, color: r.color }}>
                                            <Icon size={20} />
                                        </div>
                                        <p className="text-2xl font-extrabold mb-1" style={{ color: r.color }}>{Math.round(Number(ak?.[r.key] ?? 0))}</p>
                                        <p className="text-xs font-semibold text-gray-500">{r.label}</p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pengajuan Kenaikan Jabatan */}
                        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
                            <h2 className="text-base font-extrabold text-gray-800 mb-4">Pengajuan Kenaikan Jabatan</h2>

                            {!pengajuan ? (
                                <div className="flex flex-col items-center text-center py-8">
                                    <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                        <Clock size={26} className="text-gray-300" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-600 mb-1">Belum Ada Pengajuan</p>
                                    <p className="text-sm text-gray-400 max-w-sm">Dosen ini belum mengajukan kenaikan jabatan.</p>
                                </div>
                            ) : (
                                <div className="border border-gray-100 rounded-2xl p-5" style={{ borderLeft: isPending ? '4px solid #D6A407' : undefined }}>
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">Pengajuan #{pengajuan.id_pengajuan ?? pengajuan.id}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Total KUM saat pengajuan: <strong>{pengajuan.total_kum}</strong></p>
                                        </div>
                                        <span className="text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap" style={{ color: st.color, backgroundColor: st.bg }}>{st.label}</span>
                                    </div>

                                    {pengajuan.catatan_manager && (
                                        <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600 mb-3">
                                            <span className="font-semibold">Catatan manajer:</span> {pengajuan.catatan_manager}
                                        </div>
                                    )}

                                    {pengajuan.dokumen && Object.keys(pengajuan.dokumen).length > 0 && (
                                        <div className="mb-3">
                                            <p className="text-xs font-bold text-gray-500 mb-2">Dokumen Syarat</p>
                                            <div className="flex flex-col gap-1.5">
                                                {Object.entries(pengajuan.dokumen).map(([k, path]) => (
                                                    <a key={k} href={fileUrl(path)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1a4731] hover:underline">
                                                        <FileText size={14} /> {DOC_LABELS[k] ?? k}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {isPending && (
                                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                                            <button onClick={() => doValidate(true)} disabled={acting}
                                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition disabled:opacity-50 hover:opacity-90" style={{ backgroundColor: '#059669' }}>
                                                {acting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} strokeWidth={3} />} Setujui
                                            </button>
                                            <button onClick={() => { setShowReject(true); setCatatan(''); }} disabled={acting}
                                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition disabled:opacity-50 hover:bg-red-50 border" style={{ color: '#DC2626', borderColor: '#FECACA' }}>
                                                <X size={14} strokeWidth={3} /> Tolak
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Modal Tolak */}
            {showReject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setShowReject(false)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-extrabold text-gray-800 mb-1">Tolak Pengajuan</h3>
                        <p className="text-sm text-gray-500 mb-4">Berikan alasan agar dosen dapat memperbaiki.</p>
                        <textarea value={catatan} onChange={e => setCatatan(e.target.value)} rows={3} placeholder="Catatan penolakan..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition resize-none mb-5" />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowReject(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 border border-gray-200 transition">Batal</button>
                            <button onClick={() => doValidate(false)} disabled={acting}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition disabled:opacity-50 hover:opacity-90" style={{ backgroundColor: '#DC2626' }}>
                                {acting ? <Loader2 size={14} className="animate-spin" /> : <X size={14} strokeWidth={3} />} Tolak Pengajuan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
