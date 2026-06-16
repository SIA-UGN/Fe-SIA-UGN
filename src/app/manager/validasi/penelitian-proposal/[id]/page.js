'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Check, X, RotateCcw, Loader2, AlertCircle, Award, FileText, BookMarked } from 'lucide-react';
import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import { getProposalManager, validasiProposal } from '@/lib/managerApi';

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

function InfoRow({ label, value }) {
    return (
        <div className="flex items-start justify-between gap-4 py-3">
            <span className="text-[15px] text-gray-500 shrink-0">{label}</span>
            <span className="text-[15px] font-bold text-gray-800 text-right break-words">{value}</span>
        </div>
    );
}

export default function ReviewProposalPage() {
    const router = useRouter();
    const { id } = useParams();

    const [item, setItem] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [acting, setActing] = useState(false);
    const [modal, setModal] = useState(null); // 'setujui' | 'tolak' | 'revisi'
    const [ak, setAk] = useState('');
    const [catatan, setCatatan] = useState('');

    const load = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        setError(null);
        try {
            const res = await getProposalManager();
            const found = (res?.data ?? []).find(p => String(p.id) === String(id));
            if (found) setItem(found);
            else setError('Proposal tidak ditemukan atau sudah selesai divalidasi.');
        } catch (err) {
            setError(err?.userMessage ?? err?.message ?? 'Gagal memuat data.');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => { load(); }, [load]);

    const ketua = item?.userSi?.name ?? item?.user_si?.name ?? '—';
    const anggota = Array.isArray(item?.anggota) ? item.anggota : [];
    const luaran = item?.luaran && typeof item.luaran === 'object' ? item.luaran : null;

    const backToAktivitas = () => {
        const d = new URLSearchParams(window.location.search).get('dosen');
        router.push(d ? `/manager/dosen/${d}/aktivitas` : '/manager/dosen');
    };

    const submit = async (status, body) => {
        setActing(true);
        try {
            await validasiProposal(id, { status, ...body });
            backToAktivitas();
        } catch (err) {
            setError(err?.userMessage ?? err?.message ?? 'Gagal memproses validasi.');
            setActing(false);
        }
    };

    const subtitle = item ? [item.bidang_penelitian, item.tahun && `Tahun ${item.tahun}`].filter(Boolean).join('  ·  ') : '';
    const dokumen = item ? [
        ['Proposal Penelitian', item.file_proposal, true],
        ['Laporan Akhir', item.file_laporan, !!item.file_laporan],
    ].filter(([, , show]) => show) : [];

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
                        <p className="text-sm font-semibold">Memuat data penelitian...</p>
                    </div>
                ) : error && !item ? (
                    <div className="bg-white rounded-2xl p-10 border border-red-100 flex flex-col items-center text-center">
                        <AlertCircle size={28} className="text-red-400 mb-3" />
                        <h3 className="text-base font-bold text-gray-700 mb-1">Gagal Memuat</h3>
                        <p className="text-sm text-gray-500 max-w-sm">{error}</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-start justify-between gap-6 mb-7">
                            <div className="min-w-0">
                                <h1 className="text-[34px] leading-[1.15] font-extrabold mb-2" style={{ color: '#1a4731' }}>{item.judul}</h1>
                                <p className="text-[15px] text-gray-500">👤 {ketua}{subtitle ? `  ·  ${subtitle}` : ''}</p>
                            </div>
                            <span className="text-sm font-semibold px-4 py-2 rounded-lg whitespace-nowrap shrink-0" style={{ color: '#B45309', backgroundColor: '#FBEFC9' }}>Menunggu Validasi</span>
                        </div>

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
                                </div>
                            </div>
                        </div>

                        {/* Tim Peneliti */}
                        <div className="bg-white rounded-[24px] p-7 shadow-sm mb-6">
                            <h2 className="text-lg font-bold mb-4" style={{ color: '#1a4731' }}>Tim Peneliti ({anggota.length + 1} orang)</h2>
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
                                {dokumen.map(([label, path]) => (
                                    <div key={label} className="flex items-center gap-4 rounded-2xl border px-4 py-3" style={{ borderColor: '#E5E7EB' }}>
                                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#C9E9D4', color: '#1a4731' }}>
                                            <FileText size={20} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[15px] font-bold text-gray-800 truncate">{path ? String(path).split('/').pop() : 'dokumen'}</p>
                                            <p className="text-xs text-gray-400">{label}</p>
                                        </div>
                                        {path ? (
                                            <a href={fileUrl(path)} target="_blank" rel="noreferrer" className="text-xs font-bold px-3 py-1.5 rounded-full shrink-0" style={{ backgroundColor: '#E5E7EB', color: '#6B7280' }}>PDF</a>
                                        ) : (
                                            <span className="text-xs text-gray-400 shrink-0">Belum ada</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Luaran Publikasi (bila ada) */}
                        {luaran && (luaran.nama || luaran.doi || luaran.jenis) && (
                            <div className="bg-white rounded-[24px] p-7 shadow-sm mb-6">
                                <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#1a4731' }}><BookMarked size={18} /> Luaran Publikasi</h2>
                                <div className="rounded-2xl border p-4" style={{ borderColor: '#E5E7EB' }}>
                                    <p className="text-[15px] font-bold text-gray-800">{luaran.nama || '—'}{luaran.tahun ? ` — ${luaran.tahun}` : ''}</p>
                                    <p className="text-xs text-gray-500 mt-1">{[luaran.peringkat, luaran.jenis, luaran.doi ? `DOI: ${luaran.doi}` : null].filter(Boolean).join('  |  ') || '—'}</p>
                                </div>
                            </div>
                        )}
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
                        <button onClick={() => { setModal('setujui'); setAk(''); }} disabled={acting}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition disabled:opacity-50 hover:opacity-90" style={{ backgroundColor: '#059669' }}>
                            {acting ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} strokeWidth={3} />} Setujui
                        </button>
                    </div>
                </div>
            )}

            {/* Modal Setujui (isi AK) */}
            {modal === 'setujui' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setModal(null)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-extrabold text-gray-800 mb-1">Setujui Penelitian</h3>
                        <p className="text-sm text-gray-500 mb-4">Tetapkan Angka Kredit (AK). Penelitian akan berstatus <strong>Aktif</strong>.</p>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1"><Award size={13} /> Angka Kredit</label>
                        <input type="number" min="0" value={ak} onChange={e => setAk(e.target.value)} placeholder="mis. 70"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition mb-5" />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setModal(null)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 border border-gray-200 transition">Batal</button>
                            <button onClick={() => submit('Aktif', { angka_kredit: Number(ak) || 0 })} disabled={acting}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition disabled:opacity-50 hover:opacity-90" style={{ backgroundColor: '#059669' }}>
                                {acting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} strokeWidth={3} />} Setujui &amp; Tetapkan AK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Tolak / Revisi */}
            {(modal === 'tolak' || modal === 'revisi') && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setModal(null)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-extrabold text-gray-800 mb-1">{modal === 'revisi' ? 'Minta Revisi' : 'Tolak Penelitian'}</h3>
                        <p className="text-sm text-gray-500 mb-4">{modal === 'revisi' ? 'Jelaskan apa yang perlu diperbaiki dosen.' : 'Berikan alasan penolakan.'}</p>
                        <textarea value={catatan} onChange={e => setCatatan(e.target.value)} rows={3}
                            placeholder={modal === 'revisi' ? 'Catatan revisi...' : 'Catatan penolakan...'}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition resize-none mb-5" />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setModal(null)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 border border-gray-200 transition">Batal</button>
                            <button onClick={() => submit(modal === 'revisi' ? 'Revisi' : 'Ditolak', { catatan_validasi: catatan })}
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
