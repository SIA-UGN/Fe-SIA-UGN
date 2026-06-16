'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    FileText, Upload, X, Send, Loader2, AlertCircle, MessageSquareWarning,
} from 'lucide-react';
import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import { getKegiatanByClass, ajukanKegiatanKelas } from '@/lib/kegiatanApi';

const STATUS_MAP = {
    'Belum Diajukan': { label: 'Belum Diajukan', color: '#92400E', bg: '#FEF3C7' },
    Draft:     { label: 'Belum Diajukan', color: '#92400E', bg: '#FEF3C7' },
    Diajukan:  { label: 'Menunggu',       color: '#B45309', bg: '#FBEFC9' },
    Revisi:    { label: 'Perlu Revisi',   color: '#DB2777', bg: '#FCE7F3' },
    Disetujui: { label: 'Selesai',        color: '#1a7a47', bg: '#C9E9D4' },
    Ditolak:   { label: 'Ditolak',        color: '#DC2626', bg: '#FEE2E2' },
};

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

const BERKAS = [
    { key: 'file_sk',       label: 'SK Mengajar dari Dekan',       accept: '.pdf',                 tag: 'PDF' },
    { key: 'file_nilai',    label: 'Bukti Submit Nilai Mahasiswa', accept: '.pdf',                 tag: 'PDF' },
    { key: 'file_presensi', label: 'Rekap Presensi',               accept: '.pdf,.xlsx,.xls,.csv', tag: 'PDF / XLSX' },
];

function InfoRow({ label, value }) {
    return (
        <div className="flex items-start justify-between gap-4 py-3">
            <span className="text-[15px] text-gray-500 shrink-0">{label}</span>
            <span className="text-[15px] font-bold text-gray-800 text-right break-words">{value}</span>
        </div>
    );
}

export default function DetailKegiatanMengajar() {
    const router = useRouter();
    const { id } = useParams(); // id = id_class

    const [item, setItem] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [acting, setActing] = useState(false);
    const [files, setFiles] = useState({ file_sk: null, file_nilai: null, file_presensi: null });
    const [jenis, setJenis] = useState('');

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const k = await getKegiatanByClass(id);
            if (k) { setItem(k); setJenis(k.jenis_kelas ?? ''); }
            else setError('Kelas tidak ditemukan.');
        } catch (err) {
            setError(err?.userMessage ?? err?.message ?? 'Gagal memuat data.');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => { load(); }, [load]);

    const status = item?.status_validasi ?? 'Belum Diajukan';
    const st = STATUS_MAP[status] ?? { label: status, color: '#6B7280', bg: '#F3F4F6' };
    const editable = ['Belum Diajukan', 'Draft', 'Revisi', 'Ditolak'].includes(status);
    const showCatatan = (status === 'Revisi' || status === 'Ditolak') && item?.catatan_validasi;
    const setFile = (k, f) => setFiles(p => ({ ...p, [k]: f }));

    const handleAjukan = async () => {
        setActing(true);
        setError(null);
        try {
            const fd = new FormData();
            if (jenis) fd.append('jenis_kelas', jenis);
            BERKAS.forEach(b => { if (files[b.key]) fd.append(b.key, files[b.key]); });
            await ajukanKegiatanKelas(id, fd);
            setFiles({ file_sk: null, file_nilai: null, file_presensi: null });
            await load();
        } catch (err) {
            setError(err?.userMessage ?? err?.message ?? 'Gagal mengajukan.');
        } finally {
            setActing(false);
        }
    };

    const subtitle = item ? [
        jenis ? `Kelas ${jenis}` : (item.jenis_kelas ? `Kelas ${item.jenis_kelas}` : null),
        item.kelas ? `Kelas ${item.kelas}` : null,
        item.periode || [item.semester, item.tahun_ajaran].filter(Boolean).join(' '),
    ].filter(Boolean).join('  ·  ') : '';

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#E6EEE9', fontFamily: 'Urbanist, sans-serif' }}>
            <Navbar />
            <main className="flex-grow max-w-5xl w-full mx-auto px-5 py-7">
                <button onClick={() => router.push('/dosen/kegiatan-mengajar')} className="text-sm font-bold mb-7 hover:opacity-70 transition" style={{ color: '#1a4731' }}>
                    Kembali Ke Dashboard Kegiatan Mengajar
                </button>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
                        <Loader2 size={36} className="animate-spin" />
                        <p className="text-sm font-semibold">Memuat detail kegiatan...</p>
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
                                <p className="text-[15px] text-gray-500">{subtitle}</p>
                            </div>
                            <span className="text-sm font-semibold px-4 py-2 rounded-lg whitespace-nowrap shrink-0" style={{ color: st.color, backgroundColor: st.bg }}>{st.label}</span>
                        </div>

                        {showCatatan && (
                            <div className="rounded-2xl p-5 mb-6 border" style={{ backgroundColor: status === 'Revisi' ? '#FCE7F3' : '#FEE2E2', borderColor: status === 'Revisi' ? '#FBCFE8' : '#FECACA' }}>
                                <div className="flex items-start gap-3">
                                    <MessageSquareWarning size={20} style={{ color: status === 'Revisi' ? '#DB2777' : '#DC2626' }} className="shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold mb-1" style={{ color: status === 'Revisi' ? '#9D174D' : '#991B1B' }}>Catatan Manajer{status === 'Revisi' ? ' (alasan revisi)' : ' (alasan penolakan)'}</p>
                                        <p className="text-sm leading-relaxed" style={{ color: status === 'Revisi' ? '#9D174D' : '#991B1B' }}>{item.catatan_validasi}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Berkas Wajib | Informasi Mengajar */}
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
                            <div className="lg:col-span-3 bg-white rounded-[24px] p-7 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold" style={{ color: '#1a4731' }}>Berkas Wajib</h2>
                                    {editable && (
                                        <select value={jenis} onChange={e => setJenis(e.target.value)}
                                            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-[#1a4731]"
                                            style={{ color: jenis ? '#1f2937' : '#9CA3AF' }}>
                                            <option value="" disabled hidden>Jenis Kelas</option>
                                            <option value="Teori">Kelas Teori</option>
                                            <option value="Praktikum">Kelas Praktikum</option>
                                        </select>
                                    )}
                                </div>
                                <div className="flex flex-col gap-3">
                                    {BERKAS.map(b => {
                                        const uploaded = item[b.key];
                                        const staged = files[b.key];
                                        return (
                                            <div key={b.key} className="flex items-center gap-4 rounded-2xl border px-4 py-3" style={{ borderColor: '#E5E7EB' }}>
                                                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#C9E9D4', color: '#1a4731' }}>
                                                    <FileText size={20} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[15px] font-bold text-gray-800 truncate">{staged ? staged.name : (uploaded ? String(uploaded).split('/').pop() : b.label)}</p>
                                                    <p className="text-xs text-gray-400">{staged ? `Siap diunggah · ${b.label}` : (uploaded ? b.label : `Belum diunggah · ${b.tag}, maks 5MB`)}</p>
                                                </div>
                                                {editable ? (
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        {staged && <button type="button" onClick={() => setFile(b.key, null)} className="text-red-400 hover:text-red-600"><X size={15} /></button>}
                                                        <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer hover:bg-gray-50 transition" style={{ color: '#1a4731', borderColor: '#D6E8DC' }}>
                                                            <Upload size={13} /> {staged || uploaded ? 'Ganti' : 'Pilih'}
                                                            <input type="file" accept={b.accept} className="hidden" onChange={e => setFile(b.key, e.target.files?.[0] ?? null)} />
                                                        </label>
                                                    </div>
                                                ) : uploaded ? (
                                                    <a href={fileUrl(uploaded)} target="_blank" rel="noreferrer" className="text-xs font-bold px-3 py-1.5 rounded-full shrink-0" style={{ backgroundColor: '#E5E7EB', color: '#6B7280' }}>{b.tag}</a>
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
                                    <InfoRow label="SKS" value={item.sks != null ? `${item.sks} SKS` : '—'} />
                                    <InfoRow label="Jumlah Mahasiswa" value={item.jumlah_mahasiswa != null ? `${item.jumlah_mahasiswa} Mahasiswa` : '—'} />
                                    <InfoRow label="Jenis" value={(jenis || item.jenis_kelas) ? `Kelas ${jenis || item.jenis_kelas}` : '—'} />
                                    <InfoRow label="Semester" value={item.semester || '—'} />
                                    <InfoRow label="Tahun Ajaran" value={item.tahun_ajaran || '—'} />
                                    <InfoRow label="Diajukan" value={status === 'Belum Diajukan' ? '—' : fmtDate(item.diajukan_at)} />
                                </div>
                            </div>
                        </div>

                        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

                        {/* Aksi: Ajukan / Ajukan Ulang */}
                        {editable && (
                            <button onClick={handleAjukan} disabled={acting}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-white transition disabled:opacity-50 hover:opacity-90 shadow-sm"
                                style={{ backgroundColor: '#1a4731' }}>
                                {acting ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                {status === 'Revisi' || status === 'Ditolak' ? 'Ajukan Ulang' : 'Ajukan ke Manager'}
                            </button>
                        )}
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
}
