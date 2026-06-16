'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    ArrowLeft, BookMarked, Hash, Users, Calendar, Layers, Award, Link2,
    FileText, Send, Pencil, Loader2, AlertCircle, MessageSquareWarning
} from 'lucide-react';
import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import { getPenelitianById, ajukanPenelitian } from '@/lib/penelitianApi';

const STATUS_MAP = {
    Draft:     { label: 'Belum Diajukan', color: '#92400E', bg: '#FEF3C7' },
    Diajukan:  { label: 'Menunggu',       color: '#D97706', bg: '#FEF3C7' },
    Revisi:    { label: 'Perlu Revisi',   color: '#DB2777', bg: '#FCE7F3' },
    Disetujui: { label: 'Disetujui',      color: '#059669', bg: '#D1FAE5' },
    Ditolak:   { label: 'Ditolak',        color: '#DC2626', bg: '#FEE2E2' },
};

const fileUrl = (path) => {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/api\/?$/, '');
    return `${base}/storage/${path}`;
};

export default function DetailPenelitian() {
    const router = useRouter();
    const { id } = useParams();

    const [item, setItem] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [acting, setActing] = useState(false);

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const p = await getPenelitianById(id);
            if (p) setItem(p);
            else setError('Publikasi penelitian tidak ditemukan.');
        } catch (err) {
            setError(err?.userMessage ?? err?.message ?? 'Gagal memuat data.');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => { load(); }, [load]);

    const status = item?.status_validasi ?? 'Draft';
    const st = STATUS_MAP[status] ?? { label: status, color: '#6B7280', bg: '#F3F4F6' };
    const showCatatan = (status === 'Revisi' || status === 'Ditolak') && item?.catatan_validasi;

    const handleAjukan = async () => {
        setActing(true);
        try {
            await ajukanPenelitian(item.id);
            await load();
        } catch (err) {
            setError(err?.userMessage ?? err?.message ?? 'Gagal mengajukan.');
        } finally {
            setActing(false);
        }
    };

    const INFO = item ? [
        { icon: Layers,   label: 'Jenis Luaran',     value: item.jenis_output || '—' },
        { icon: BookMarked, label: 'Nama Publikasi',  value: item.nama_publikasi || '—' },
        { icon: Calendar, label: 'Tahun Terbit',     value: item.tahun_terbit || '—' },
        { icon: Hash,     label: 'Volume / Nomor',   value: [item.volume, item.nomor].filter(Boolean).join(' / ') || '—' },
        { icon: Hash,     label: 'Halaman',          value: item.halaman || '—' },
        { icon: Award,    label: 'Status Akreditasi', value: item.status_akreditasi || '—' },
        { icon: BookMarked, label: 'Penerbit',        value: item.penerbit || '—' },
    ] : [];

    const authors = item?.authors ?? [];

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F0F4F0', fontFamily: 'Urbanist, sans-serif' }}>
            <Navbar />
            <main className="flex-grow max-w-3xl w-full mx-auto px-4 py-8">

                <button onClick={() => router.push('/dosen/publikasi')} className="flex items-center gap-1.5 text-sm font-bold mb-6 hover:opacity-70 transition" style={{ color: '#1a4731' }}>
                    <ArrowLeft size={15} /> Kembali Ke Publikasi Ilmiah
                </button>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
                        <Loader2 size={36} className="animate-spin" />
                        <p className="text-sm font-semibold">Memuat detail publikasi...</p>
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-2xl p-10 border border-red-100 flex flex-col items-center text-center">
                        <AlertCircle size={28} className="text-red-400 mb-3" />
                        <h3 className="text-base font-bold text-gray-700 mb-1">Gagal Memuat</h3>
                        <p className="text-sm text-gray-500 max-w-sm">{error}</p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 mb-5">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#1a4731', color: '#fff' }}>
                                    <BookMarked size={26} strokeWidth={2} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-3">
                                        <h1 className="text-xl font-extrabold leading-snug" style={{ color: '#1a4731' }}>{item.judul}</h1>
                                        <span className="text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap" style={{ color: st.color, backgroundColor: st.bg }}>{st.label}</span>
                                    </div>
                                    {(item.jenis_output || item.nama_publikasi) && (
                                        <p className="text-sm text-gray-500 mt-1">{[item.jenis_output, item.nama_publikasi].filter(Boolean).join(' · ')}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Catatan manajer */}
                        {showCatatan && (
                            <div className="rounded-[20px] p-5 mb-5 border" style={{ backgroundColor: status === 'Revisi' ? '#FCE7F3' : '#FEE2E2', borderColor: status === 'Revisi' ? '#FBCFE8' : '#FECACA' }}>
                                <div className="flex items-start gap-3">
                                    <MessageSquareWarning size={20} style={{ color: status === 'Revisi' ? '#DB2777' : '#DC2626' }} className="shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold mb-1" style={{ color: status === 'Revisi' ? '#9D174D' : '#991B1B' }}>
                                            {status === 'Revisi' ? 'Perlu Diperbaiki' : 'Catatan Penolakan'}
                                        </p>
                                        <p className="text-sm leading-relaxed" style={{ color: status === 'Revisi' ? '#9D174D' : '#991B1B' }}>{item.catatan_validasi}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Info detail */}
                        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 mb-5">
                            <h2 className="text-base font-extrabold text-gray-800 mb-4">Detail Publikasi</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                                {INFO.map(({ icon: Icon, label, value }) => (
                                    <div key={label} className="flex items-center gap-3 py-3 border-b border-gray-50">
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#F0F4F0' }}>
                                            <Icon size={16} style={{ color: '#1a4731' }} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[11px] text-gray-400">{label}</p>
                                            <p className="text-sm font-bold text-gray-700 break-words">{value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* DOI */}
                            {item.doi_url && (
                                <div className="mt-4">
                                    <p className="text-[11px] text-gray-400 mb-1.5">DOI / URL</p>
                                    <a href={item.doi_url} target="_blank" rel="noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition hover:bg-gray-50"
                                        style={{ color: '#1a4731', borderColor: '#D6E8DC' }}>
                                        <Link2 size={15} /> Buka Tautan
                                    </a>
                                </div>
                            )}

                            {/* Artikel */}
                            <div className="mt-4">
                                <p className="text-[11px] text-gray-400 mb-1.5">Berkas Artikel</p>
                                {item.file_artikel ? (
                                    <a href={fileUrl(item.file_artikel)} target="_blank" rel="noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition hover:bg-gray-50"
                                        style={{ color: '#1a4731', borderColor: '#D6E8DC' }}>
                                        <FileText size={15} /> Lihat Artikel
                                    </a>
                                ) : (
                                    <p className="text-sm text-gray-400">Belum ada artikel diunggah.</p>
                                )}
                            </div>
                        </div>

                        {/* Penulis */}
                        {authors.length > 0 && (
                            <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 mb-5">
                                <h2 className="text-base font-extrabold text-gray-800 mb-4 flex items-center gap-2"><Users size={18} style={{ color: '#1a4731' }} /> Penulis</h2>
                                <div className="flex flex-col gap-2">
                                    {authors.map((a, i) => (
                                        <div key={a.id_user_si ?? i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-none">
                                            <span className="text-sm font-semibold text-gray-700">{a.name ?? `ID ${a.id_user_si}`}</span>
                                            <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ color: '#1a4731', backgroundColor: '#DCF0E5' }}>
                                                {a.pivot?.peran ?? '—'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Aksi kontekstual */}
                        {(status === 'Draft' || status === 'Revisi') && (
                            <div className="flex flex-wrap gap-3">
                                {status === 'Draft' && (
                                    <button onClick={handleAjukan} disabled={acting}
                                        className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition disabled:opacity-50 hover:opacity-90 shadow-sm"
                                        style={{ backgroundColor: '#1a4731' }}>
                                        {acting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Ajukan ke Manager
                                    </button>
                                )}
                                {status === 'Revisi' && (
                                    <button onClick={() => router.push(`/dosen/publikasi/tambah?id=${item.id}`)}
                                        className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition hover:opacity-90 shadow-sm"
                                        style={{ backgroundColor: '#DB2777' }}>
                                        <Pencil size={15} /> Perbaiki &amp; Ajukan Ulang
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
}
