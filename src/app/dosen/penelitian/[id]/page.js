'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    Pencil, CheckCheck, Loader2, AlertCircle, MessageSquareWarning,
    BookMarked, Upload, X, FileText,
} from 'lucide-react';
import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import { useAuth } from '@/lib/auth-context';
import { getProposalById, selesaiProposal } from '@/lib/proposalApi';

const fmtDate = (d) => {
    if (!d) return '—';
    const dt = new Date(d);
    return isNaN(dt) ? d : dt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};
const fmtRp = (n) => (n == null || n === '') ? '—' : `Rp ${Number(n).toLocaleString('id-ID')},-`;

const STATUS_MAP = {
    Pengajuan: { label: 'Menunggu Validasi', color: '#B45309', bg: '#FBEFC9' },
    Revisi:    { label: 'Perlu Revisi',      color: '#DB2777', bg: '#FCE7F3' },
    Aktif:     { label: 'Aktif',             color: '#0E7490', bg: '#CFFAFE' },
    Selesai:   { label: 'Selesai',           color: '#1a7a47', bg: '#C9E9D4' },
    Ditolak:   { label: 'Ditolak',           color: '#DC2626', bg: '#FEE2E2' },
};

const fileUrl = (path) => {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/api\/?$/, '');
    return `${base}/storage/${path}`;
};

function InfoRow({ label, value }) {
    return (
        <div className="flex items-start justify-between gap-4 py-3">
            <span className="text-[15px] text-gray-500 shrink-0">{label}</span>
            <span className="text-[15px] font-bold text-gray-800 text-right break-words">{value}</span>
        </div>
    );
}

export default function DetailPenelitian() {
    const router = useRouter();
    const { id } = useParams();
    const { user } = useAuth();

    const [item, setItem] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [acting, setActing] = useState(false);
    const [showSelesai, setShowSelesai] = useState(false);
    const [laporanFile, setLaporanFile] = useState(null);
    const [luaran, setLuaran] = useState({ nama: '', tahun: '', peringkat: '', jenis: '', doi: '' });

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const p = await getProposalById(id);
            if (p) setItem(p);
            else setError('Penelitian tidak ditemukan.');
        } catch (err) {
            setError(err?.userMessage ?? err?.message ?? 'Gagal memuat data.');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => { load(); }, [load]);

    const status = item?.status ?? 'Pengajuan';
    const st = STATUS_MAP[status] ?? { label: status, color: '#6B7280', bg: '#F3F4F6' };
    const showCatatan = (status === 'Revisi' || status === 'Ditolak') && item?.catatan_validasi;
    const anggota = Array.isArray(item?.anggota) ? item.anggota : [];
    const luaranData = item?.luaran && typeof item.luaran === 'object' ? item.luaran : null;
    const showAk = item && item.angka_kredit != null && Number(item.angka_kredit) > 0;
    const ketua = item?.userSi?.name ?? user?.name ?? 'Anda';

    const handleSelesai = async () => {
        setActing(true);
        setError(null);
        try {
            const fd = new FormData();
            if (laporanFile) fd.append('file_laporan', laporanFile);
            Object.entries(luaran).forEach(([k, v]) => { if (v.trim()) fd.append(`luaran[${k}]`, v.trim()); });
            await selesaiProposal(item.id, fd);
            setShowSelesai(false);
            await load();
        } catch (err) {
            setError(err?.userMessage ?? err?.message ?? 'Gagal menandai selesai.');
        } finally {
            setActing(false);
        }
    };

    const subtitle = item ? [item.bidang_penelitian, item.tahun && `Tahun ${item.tahun}`].filter(Boolean).join('  ·  ') : '';

    const dokumen = item ? [
        ['Proposal Penelitian', item.file_proposal, 'PDF', true],
        ['Laporan Akhir', item.file_laporan, 'PDF', !!item.file_laporan],
    ].filter(([, , , show]) => show) : [];

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#E6EEE9', fontFamily: 'Urbanist, sans-serif' }}>
            <Navbar />
            <main className="flex-grow max-w-5xl w-full mx-auto px-5 py-7">
                <button onClick={() => router.push('/dosen/penelitian')} className="text-sm font-bold mb-7 hover:opacity-70 transition" style={{ color: '#1a4731' }}>
                    Kembali Ke Dashboard Penelitian
                </button>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
                        <Loader2 size={36} className="animate-spin" />
                        <p className="text-sm font-semibold">Memuat detail penelitian...</p>
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
                                <h1 className="text-[34px] leading-[1.15] font-extrabold mb-2" style={{ color: '#1a4731' }}>{item.judul}</h1>
                                <p className="text-[15px] text-gray-500">{subtitle}</p>
                            </div>
                            <span className="text-sm font-semibold px-4 py-2 rounded-lg whitespace-nowrap shrink-0" style={{ color: st.color, backgroundColor: st.bg }}>{st.label}</span>
                        </div>

                        {showCatatan && (
                            <div className="rounded-2xl p-5 mb-6 border" style={{ backgroundColor: status === 'Revisi' ? '#FCE7F3' : '#FEE2E2', borderColor: status === 'Revisi' ? '#FBCFE8' : '#FECACA' }}>
                                <div className="flex items-start gap-3">
                                    <MessageSquareWarning size={20} style={{ color: status === 'Revisi' ? '#DB2777' : '#DC2626' }} className="shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold mb-1" style={{ color: status === 'Revisi' ? '#9D174D' : '#991B1B' }}>{status === 'Revisi' ? 'Catatan Manajer (perlu diperbaiki)' : 'Catatan Penolakan'}</p>
                                        <p className="text-sm leading-relaxed" style={{ color: status === 'Revisi' ? '#9D174D' : '#991B1B' }}>{item.catatan_validasi}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Abstrak | Informasi Penelitian */}
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
                            <div className="lg:col-span-3 bg-white rounded-[24px] p-7 shadow-sm">
                                <h2 className="text-lg font-bold mb-4" style={{ color: '#1a4731' }}>Abstrak</h2>
                                <p className="text-[15px] text-gray-500 leading-relaxed whitespace-pre-line">{item.abstrak || 'Belum ada abstrak.'}</p>
                            </div>
                            <div className="lg:col-span-2 bg-white rounded-[24px] p-7 shadow-sm">
                                <h2 className="text-lg font-bold mb-3" style={{ color: '#1a4731' }}>Informasi Penelitian</h2>
                                <div className="divide-y divide-gray-50">
                                    <InfoRow label="Diajukan" value={fmtDate(item.created_at)} />
                                    <InfoRow label="Sumber Dana" value={item.sumber_dana || '—'} />
                                    {item.lembaga_dana && <InfoRow label="Lembaga Dana" value={item.lembaga_dana} />}
                                    <InfoRow label="Jumlah Dana" value={fmtRp(item.jumlah_dana)} />
                                    <InfoRow label="Mulai" value={fmtDate(item.tanggal_mulai)} />
                                    <InfoRow label="Selesai" value={fmtDate(item.tanggal_selesai)} />
                                    {showAk && <InfoRow label="Total AK Diperoleh" value={`${Math.round(item.angka_kredit)} AK`} />}
                                </div>
                            </div>
                        </div>

                        {/* Anggota Tim */}
                        <div className="bg-white rounded-[24px] p-7 shadow-sm mb-6">
                            <h2 className="text-lg font-bold mb-4" style={{ color: '#1a4731' }}>Anggota Tim ({anggota.length + 1} orang)</h2>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between gap-4 rounded-2xl px-5 py-4" style={{ backgroundColor: '#ECEFEE' }}>
                                    <p className="text-[15px] font-bold text-gray-800">{ketua}</p>
                                    <span className="text-sm font-semibold px-5 py-2 rounded-lg whitespace-nowrap shrink-0" style={{ color: '#1a7a47', backgroundColor: '#C9E9D4' }}>Ketua</span>
                                </div>
                                {anggota.map((a, i) => (
                                    <div key={i} className="flex items-center justify-between gap-4 rounded-2xl px-5 py-4" style={{ backgroundColor: '#ECEFEE' }}>
                                        <div className="min-w-0">
                                            <p className="text-[15px] font-bold text-gray-800">{a.nama || '—'}</p>
                                            {a.prodi && <p className="text-xs text-gray-400 mt-0.5">{a.prodi}</p>}
                                        </div>
                                        <span className="text-sm font-semibold px-5 py-2 rounded-lg whitespace-nowrap shrink-0" style={{ color: '#6B7280', backgroundColor: '#E2E5E4' }}>{a.peran || 'Anggota'}</span>
                                    </div>
                                ))}
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

                        {/* Luaran Publikasi (bila ada) */}
                        {luaranData && (luaranData.nama || luaranData.doi || luaranData.jenis) && (
                            <div className="bg-white rounded-[24px] p-7 shadow-sm mb-6">
                                <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#1a4731' }}><BookMarked size={18} /> Luaran Publikasi</h2>
                                <div className="rounded-2xl border p-4" style={{ borderColor: '#E5E7EB' }}>
                                    <p className="text-[15px] font-bold text-gray-800">{luaranData.nama || '—'}{luaranData.tahun ? ` — ${luaranData.tahun}` : ''}</p>
                                    <p className="text-xs text-gray-500 mt-1">{[luaranData.peringkat, luaranData.jenis, luaranData.doi ? `DOI: ${luaranData.doi}` : null].filter(Boolean).join('  |  ') || '—'}</p>
                                </div>
                            </div>
                        )}

                        {/* Aksi */}
                        {status === 'Revisi' && (
                            <button onClick={() => router.push(`/dosen/penelitian/tambah?id=${item.id}`)}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-white transition hover:opacity-90 shadow-sm" style={{ backgroundColor: '#DB2777' }}>
                                <Pencil size={15} /> Perbaiki &amp; Ajukan Ulang
                            </button>
                        )}
                        {status === 'Aktif' && (
                            <button onClick={() => setShowSelesai(true)} disabled={acting}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-white transition disabled:opacity-50 hover:opacity-90 shadow-sm" style={{ backgroundColor: '#059669' }}>
                                <CheckCheck size={15} /> Tandai Selesai
                            </button>
                        )}
                    </>
                )}
            </main>

            {/* Modal Tandai Selesai: Laporan Akhir + Luaran Publikasi (opsional) */}
            {showSelesai && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => !acting && setShowSelesai(false)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-extrabold text-gray-800 mb-1">Tandai Penelitian Selesai</h3>
                        <p className="text-sm text-gray-500 mb-5">Unggah Laporan Akhir dan isi Luaran Publikasi (opsional) sebagai output penelitian.</p>

                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Laporan Akhir (PDF)</label>
                            <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-gray-300 text-sm cursor-pointer hover:bg-gray-50 transition" style={{ color: '#1a4731' }}>
                                <Upload size={15} /> {laporanFile ? laporanFile.name : 'Pilih file PDF...'}
                                <input type="file" accept=".pdf" className="hidden" onChange={e => setLaporanFile(e.target.files?.[0] ?? null)} />
                            </label>
                        </div>

                        <p className="text-xs font-bold text-gray-500 mb-2">Luaran Publikasi</p>
                        <div className="space-y-3 mb-5">
                            <input value={luaran.nama} onChange={e => setLuaran(p => ({ ...p, nama: e.target.value }))} placeholder="Nama publikasi / jurnal (mis. Journal of Information Security)"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a4731] focus:ring-1 focus:ring-[#1a4731] transition" />
                            <div className="grid grid-cols-2 gap-3">
                                <input type="number" value={luaran.tahun} onChange={e => setLuaran(p => ({ ...p, tahun: e.target.value }))} placeholder="Tahun (2025)"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a4731] focus:ring-1 focus:ring-[#1a4731] transition" />
                                <input value={luaran.peringkat} onChange={e => setLuaran(p => ({ ...p, peringkat: e.target.value }))} placeholder="Peringkat (Scopus Q2)"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a4731] focus:ring-1 focus:ring-[#1a4731] transition" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <input value={luaran.jenis} onChange={e => setLuaran(p => ({ ...p, jenis: e.target.value }))} placeholder="Jenis (Jurnal)"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a4731] focus:ring-1 focus:ring-[#1a4731] transition" />
                                <input value={luaran.doi} onChange={e => setLuaran(p => ({ ...p, doi: e.target.value }))} placeholder="DOI (10.1234/...)"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a4731] focus:ring-1 focus:ring-[#1a4731] transition" />
                            </div>
                        </div>

                        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowSelesai(false)} disabled={acting} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 border border-gray-200 transition disabled:opacity-50">Batal</button>
                            <button onClick={handleSelesai} disabled={acting}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition disabled:opacity-50 hover:opacity-90" style={{ backgroundColor: '#059669' }}>
                                {acting ? <Loader2 size={14} className="animate-spin" /> : <CheckCheck size={14} />} Tandai Selesai
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
}
