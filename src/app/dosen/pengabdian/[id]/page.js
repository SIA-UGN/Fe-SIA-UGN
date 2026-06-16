'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    ArrowLeft, FileText, Pencil, CheckCheck, Loader2, AlertCircle,
    MessageSquareWarning, Upload, X,
} from 'lucide-react';
import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import { getPengabdianById, selesaiPengabdian } from '@/lib/pengabdianApi';

const STATUS_MAP = {
    Diajukan:  { label: 'Menunggu Validasi', color: '#B45309', bg: '#FBEFC9' },
    Draft:     { label: 'Menunggu Validasi', color: '#B45309', bg: '#FBEFC9' },
    Revisi:    { label: 'Perlu Revisi',      color: '#DB2777', bg: '#FCE7F3' },
    Aktif:     { label: 'Aktif',             color: '#0E7490', bg: '#CFFAFE' },
    Selesai:   { label: 'Selesai',           color: '#1a7a47', bg: '#C9E9D4' },
    Disetujui: { label: 'Selesai',           color: '#1a7a47', bg: '#C9E9D4' },
    Ditolak:   { label: 'Ditolak',           color: '#DC2626', bg: '#FEE2E2' },
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
const fmtRp = (n) => (n == null || n === '') ? '—' : `Rp ${Number(n).toLocaleString('id-ID')},-`;

// Baris label–value untuk kartu Informasi PKM (tanpa ikon, sesuai Figma).
function InfoRow({ label, value }) {
    return (
        <div className="flex items-start justify-between gap-4 py-3">
            <span className="text-[15px] text-gray-500 shrink-0">{label}</span>
            <span className="text-[15px] font-bold text-gray-800 text-right break-words">{value}</span>
        </div>
    );
}

export default function DetailPengabdian() {
    const router = useRouter();
    const { id } = useParams();

    const [item, setItem] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [acting, setActing] = useState(false);
    const [laporanFile, setLaporanFile] = useState(null);
    const [buktiFile, setBuktiFile] = useState(null);

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const p = await getPengabdianById(id);
            if (p) setItem(p);
            else setError('Kegiatan pengabdian tidak ditemukan.');
        } catch (err) {
            setError(err?.userMessage ?? err?.message ?? 'Gagal memuat data.');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => { load(); }, [load]);

    const status = item?.status_validasi ?? 'Diajukan';
    const st = STATUS_MAP[status] ?? { label: status, color: '#6B7280', bg: '#F3F4F6' };
    const showCatatan = (status === 'Revisi' || status === 'Ditolak') && item?.catatan_validasi;
    const authors = Array.isArray(item?.authors) ? item.authors : [];
    const showAk = item && item.angka_kredit != null && Number(item.angka_kredit) > 0;

    const handleSelesai = async () => {
        setActing(true);
        setError(null);
        try {
            const fd = new FormData();
            if (laporanFile) fd.append('file_laporan_akhir', laporanFile);
            if (buktiFile) fd.append('file_bukti_foto', buktiFile);
            await selesaiPengabdian(item.id, fd);
            setLaporanFile(null);
            setBuktiFile(null);
            await load();
        } catch (err) {
            setError(err?.userMessage ?? err?.message ?? 'Gagal menandai selesai.');
        } finally {
            setActing(false);
        }
    };

    const dokumen = item ? [
        ['Proposal PKM', item.file_laporan, 'PDF', true],
        ['Laporan Akhir', item.file_laporan_akhir, 'PDF', !!item.file_laporan_akhir],
        ['Bukti Foto', item.file_bukti_foto, 'IMG', !!item.file_bukti_foto],
    ].filter(([, , , show]) => show) : [];

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#E6EEE9', fontFamily: 'Urbanist, sans-serif' }}>
            <Navbar />
            <main className="flex-grow max-w-5xl w-full mx-auto px-5 py-7">
                <button onClick={() => router.push('/dosen/pengabdian')} className="text-sm font-bold mb-7 hover:opacity-70 transition" style={{ color: '#1a4731' }}>
                    Kembali Ke Dashboard Pengabdian Masyarakat
                </button>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
                        <Loader2 size={36} className="animate-spin" />
                        <p className="text-sm font-semibold">Memuat detail pengabdian...</p>
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-2xl p-10 border border-red-100 flex flex-col items-center text-center">
                        <AlertCircle size={28} className="text-red-400 mb-3" />
                        <h3 className="text-base font-bold text-gray-700 mb-1">Gagal Memuat</h3>
                        <p className="text-sm text-gray-500 max-w-sm">{error}</p>
                    </div>
                ) : (
                    <>
                        {/* Header: judul + badge + subtitle (tanpa ikon/kartu) */}
                        <div className="flex items-start justify-between gap-6 mb-7">
                            <div className="min-w-0">
                                <h1 className="text-[34px] leading-[1.15] font-extrabold mb-2" style={{ color: '#1a4731' }}>{item.judul_kegiatan}</h1>
                                <p className="text-[15px] text-gray-500">
                                    {item.jenis_pkm && <span>{item.jenis_pkm}</span>}
                                    {item.jenis_pkm && item.tahun_pelaksanaan && <span className="mx-3" />}
                                    {item.tahun_pelaksanaan && <span>Tahun {item.tahun_pelaksanaan}</span>}
                                </p>
                            </div>
                            <span className="text-sm font-semibold px-4 py-2 rounded-lg whitespace-nowrap shrink-0" style={{ color: st.color, backgroundColor: st.bg }}>{st.label}</span>
                        </div>

                        {showCatatan && (
                            <div className="rounded-2xl p-5 mb-6 border" style={{ backgroundColor: status === 'Revisi' ? '#FCE7F3' : '#FEE2E2', borderColor: status === 'Revisi' ? '#FBCFE8' : '#FECACA' }}>
                                <div className="flex items-start gap-3">
                                    <MessageSquareWarning size={20} style={{ color: status === 'Revisi' ? '#DB2777' : '#DC2626' }} className="shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold mb-1" style={{ color: status === 'Revisi' ? '#9D174D' : '#991B1B' }}>Catatan Manajer{status === 'Ditolak' ? ' (alasan penolakan)' : ''}</p>
                                        <p className="text-sm leading-relaxed" style={{ color: status === 'Revisi' ? '#9D174D' : '#991B1B' }}>{item.catatan_validasi}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Deskripsi | Informasi PKM */}
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
                            <div className="lg:col-span-3 bg-white rounded-[24px] p-7 shadow-sm">
                                <h2 className="text-lg font-bold mb-4" style={{ color: '#1a4731' }}>Deskripsi</h2>
                                <p className="text-[15px] text-gray-500 leading-relaxed whitespace-pre-line">{item.deskripsi || 'Belum ada deskripsi.'}</p>
                            </div>
                            <div className="lg:col-span-2 bg-white rounded-[24px] p-7 shadow-sm">
                                <h2 className="text-lg font-bold mb-3" style={{ color: '#1a4731' }}>Informasi PKM</h2>
                                <div className="divide-y divide-gray-50">
                                    <InfoRow label="Diajukan" value={fmtDate(item.created_at)} />
                                    <InfoRow label="Lokasi" value={item.lokasi || '—'} />
                                    <InfoRow label="Mitra" value={item.nama_mitra || '—'} />
                                    <InfoRow label="Sumber Dana" value={item.sumber_dana || item.skema || '—'} />
                                    {item.lembaga_dana && <InfoRow label="Lembaga Dana" value={item.lembaga_dana} />}
                                    <InfoRow label="Jumlah Dana" value={fmtRp(item.jumlah_dana)} />
                                    <InfoRow label="Mulai" value={fmtDate(item.tanggal_mulai)} />
                                    <InfoRow label="Selesai" value={fmtDate(item.tanggal_selesai)} />
                                    <InfoRow label="Peserta" value={item.jumlah_peserta != null ? `${item.jumlah_peserta} orang` : '—'} />
                                    {showAk && <InfoRow label="Total AK Diperoleh" value={`${Math.round(item.angka_kredit)} AK`} />}
                                </div>
                            </div>
                        </div>

                        {/* Anggota Tim */}
                        <div className="bg-white rounded-[24px] p-7 shadow-sm mb-6">
                            <h2 className="text-lg font-bold mb-4" style={{ color: '#1a4731' }}>Anggota Tim ({authors.length} orang)</h2>
                            <div className="flex flex-col gap-3">
                                {authors.map((a, i) => {
                                    const isKetua = (a.pivot?.peran ?? '') === 'Ketua';
                                    return (
                                        <div key={a.id_user_si ?? i} className="flex items-center justify-between gap-4 rounded-2xl px-5 py-4" style={{ backgroundColor: '#ECEFEE' }}>
                                            <div className="min-w-0">
                                                <p className="text-[15px] font-bold text-gray-800">{a.name ?? `ID ${a.id_user_si}`}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{a.program?.name ?? '—'}</p>
                                            </div>
                                            <span className="text-sm font-semibold px-5 py-2 rounded-lg whitespace-nowrap shrink-0"
                                                style={isKetua ? { color: '#1a7a47', backgroundColor: '#C9E9D4' } : { color: '#6B7280', backgroundColor: '#E2E5E4' }}>
                                                {a.pivot?.peran ?? '—'}
                                            </span>
                                        </div>
                                    );
                                })}
                                {authors.length === 0 && <p className="text-sm text-gray-400">Tidak ada anggota tim.</p>}
                            </div>
                        </div>

                        {/* Dokumen */}
                        <div className="bg-white rounded-[24px] p-7 shadow-sm mb-6">
                            <h2 className="text-lg font-bold mb-4" style={{ color: '#1a4731' }}>Dokumen</h2>
                            <div className="flex flex-col gap-3">
                                {dokumen.map(([label, path, tag]) => (
                                    <div key={label} className="flex items-center gap-4 rounded-2xl border px-4 py-3" style={{ borderColor: '#E5E7EB' }}>
                                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#C9E9D4', color: '#1a4731' }}>
                                            <FileText size={20} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[15px] font-bold text-gray-800 truncate">{path ? String(path).split('/').pop() : 'dokumen'}</p>
                                            <p className="text-xs text-gray-400">{label}</p>
                                        </div>
                                        {path ? (
                                            <a href={fileUrl(path)} target="_blank" rel="noreferrer" className="text-xs font-bold px-3 py-1.5 rounded-full shrink-0" style={{ backgroundColor: '#E5E7EB', color: '#6B7280' }}>{tag}</a>
                                        ) : (
                                            <span className="text-xs text-gray-400 shrink-0">Belum ada</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Aktif: Upload Kegiatan (laporan + bukti foto) */}
                        {status === 'Aktif' && (
                            <div className="bg-white rounded-[24px] p-7 shadow-sm mb-6">
                                <h2 className="text-lg font-bold mb-1" style={{ color: '#1a4731' }}>Upload Kegiatan</h2>
                                <p className="text-sm text-gray-500 mb-4">Unggah laporan akhir &amp; bukti foto, lalu tandai kegiatan selesai.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                    {[['Laporan Akhir (PDF)', laporanFile, setLaporanFile, '.pdf'], ['Bukti Foto', buktiFile, setBuktiFile, '.pdf,.jpg,.jpeg,.png']].map(([label, file, setter, accept]) => (
                                        <div key={label} className="border-2 border-dashed border-gray-200 rounded-2xl p-4 flex items-center justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="text-[11px] text-gray-400">{label}</p>
                                                <p className="text-xs font-semibold text-gray-700 truncate">{file ? file.name : 'Belum dipilih'}</p>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {file && <button type="button" onClick={() => setter(null)} className="text-red-400 hover:text-red-600"><X size={14} /></button>}
                                                <label className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer hover:bg-gray-50" style={{ color: '#1a4731', borderColor: '#D6E8DC' }}>
                                                    <Upload size={12} /> {file ? 'Ganti' : 'Pilih'}
                                                    <input type="file" accept={accept} className="hidden" onChange={e => setter(e.target.files?.[0] ?? null)} />
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={handleSelesai} disabled={acting}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition disabled:opacity-50 hover:opacity-90 shadow-sm" style={{ backgroundColor: '#059669' }}>
                                    {acting ? <Loader2 size={15} className="animate-spin" /> : <CheckCheck size={15} />} Tandai Selesai
                                </button>
                            </div>
                        )}

                        {/* Revisi / Ditolak: ajukan ulang */}
                        {(status === 'Revisi' || status === 'Ditolak') && (
                            <button onClick={() => router.push(`/dosen/pengabdian/tambah?id=${item.id}`)}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-white transition hover:opacity-90 shadow-sm"
                                style={{ backgroundColor: status === 'Revisi' ? '#DB2777' : '#1a4731' }}>
                                <Pencil size={15} /> {status === 'Ditolak' ? 'Ajukan Ulang Kegiatan' : 'Perbaiki & Ajukan Ulang'}
                            </button>
                        )}
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
}
