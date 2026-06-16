'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ArrowLeft, FlaskConical, Users, Upload,
    Check, Plus, Trash2, Loader2, AlertCircle, FileText, X,
} from 'lucide-react';
import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import { useAuth } from '@/lib/auth-context';
import { storeProposal, updateProposal, ajukanProposal, getProposalById } from '@/lib/proposalApi';

const STEPS = [
    { id: 1, label: 'Data Penelitian', Icon: FlaskConical },
    { id: 2, label: 'Anggota Tim',     Icon: Users },
    { id: 3, label: 'Upload Proposal', Icon: Upload },
];

const BIDANG = ['Teknik Informatika', 'Sistem Informasi', 'Teknik Elektro', 'Sains & Teknologi', 'Ekonomi & Manajemen', 'Sosial & Humaniora', 'Pendidikan', 'Kesehatan', 'Hukum', 'Lainnya'];
const SUMBER_DANA = ['Mandiri', 'Institusi (LPPM)', 'Kerjasama Industri', 'Luar Negeri', 'DIKTI / Kemendikbud Ristek'];

function StepIndicator({ currentStep }) {
    return (
        <div className="relative flex justify-between items-start mb-8 max-w-2xl mx-auto px-4">
            <div className="absolute top-8 left-[12%] right-[12%] h-px bg-gray-200 z-0" />
            {STEPS.map(s => {
                const isActive = currentStep === s.id;
                const isPast = currentStep > s.id;
                const bg = (isActive || isPast) ? '#1a4731' : '#9CA3AF';
                return (
                    <div key={s.id} className="relative z-10 flex flex-col items-center gap-3" style={{ backgroundColor: '#F0F4F0' }}>
                        <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-md transition-all duration-300" style={{ backgroundColor: bg, transform: isActive ? 'scale(1.08)' : 'scale(1)' }}>
                            <s.Icon size={26} color="#fff" strokeWidth={2} />
                        </div>
                        <span className="text-sm text-center font-semibold whitespace-nowrap" style={{ color: isActive || isPast ? '#1a4731' : '#9CA3AF', fontWeight: isActive ? 800 : 600 }}>{s.label}</span>
                    </div>
                );
            })}
        </div>
    );
}

function FieldLabel({ children, required }) {
    return <label className="block text-xs font-semibold text-gray-500 mb-1.5">{children}{required && <span className="text-red-400"> *</span>}</label>;
}

export default function TambahPenelitian() {
    return (
        <Suspense fallback={null}>
            <TambahPenelitianInner />
        </Suspense>
    );
}

function TambahPenelitianInner() {
    const router = useRouter();
    const { user } = useAuth();
    const fileRef = useRef(null);
    const searchParams = useSearchParams();
    const editId = searchParams.get('id');
    const isEditing = Boolean(editId);
    const prefilledRef = useRef(false);

    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [isLoadingEdit, setIsLoadingEdit] = useState(isEditing);
    const [existingFileName, setExistingFileName] = useState(null);

    const [form, setForm] = useState({
        judul: '', abstrak: '', tahun: String(new Date().getFullYear()),
        bidang_penelitian: '', sumber_dana: '',
        lembaga_dana: '', jumlah_dana: '', tanggal_mulai: '', tanggal_selesai: '',
    });
    const updateForm = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const [anggota, setAnggota] = useState([]); // [{nama, peran}]
    const addAnggota = () => setAnggota(p => [...p, { nama: '', peran: 'Anggota' }]);
    const removeAnggota = (i) => setAnggota(p => p.filter((_, idx) => idx !== i));
    const updateAnggota = (i, k, v) => setAnggota(p => p.map((a, idx) => idx === i ? { ...a, [k]: v } : a));

    const [uploadedFile, setUploadedFile] = useState(null);
    const handleFileChange = e => { const f = e.target.files?.[0]; if (f) setUploadedFile(f); };

    // Mode edit — prefill
    useEffect(() => {
        if (!isEditing || prefilledRef.current) return;
        prefilledRef.current = true;
        (async () => {
            try {
                const p = await getProposalById(editId);
                if (!p) { setSubmitError('Data penelitian tidak ditemukan.'); return; }
                setForm({
                    judul: p.judul ?? '',
                    abstrak: p.abstrak ?? '',
                    tahun: String(p.tahun ?? new Date().getFullYear()),
                    bidang_penelitian: p.bidang_penelitian ?? '',
                    sumber_dana: p.sumber_dana ?? '',
                    lembaga_dana: p.lembaga_dana ?? '',
                    jumlah_dana: p.jumlah_dana != null ? String(p.jumlah_dana) : '',
                    tanggal_mulai: p.tanggal_mulai ?? '',
                    tanggal_selesai: p.tanggal_selesai ?? '',
                });
                if (Array.isArray(p.anggota)) setAnggota(p.anggota.map(a => ({ nama: a.nama ?? '', peran: a.peran ?? 'Anggota' })));
                if (p.file_proposal) setExistingFileName(String(p.file_proposal).split('/').pop());
            } catch (e) {
                setSubmitError(e?.userMessage ?? e?.message ?? 'Gagal memuat data untuk diedit.');
            } finally {
                setIsLoadingEdit(false);
            }
        })();
    }, [isEditing, editId]);

    const isStep1Valid = form.judul.trim() && /^\d{4}$/.test(form.tahun);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSubmitError(null);
        try {
            const fd = new FormData();
            fd.append('judul', form.judul.trim());
            if (form.abstrak.trim()) fd.append('abstrak', form.abstrak.trim());
            fd.append('tahun', form.tahun);
            if (form.bidang_penelitian) fd.append('bidang_penelitian', form.bidang_penelitian);
            if (form.sumber_dana) fd.append('sumber_dana', form.sumber_dana);
            if (form.lembaga_dana.trim()) fd.append('lembaga_dana', form.lembaga_dana.trim());
            if (form.jumlah_dana !== '') fd.append('jumlah_dana', form.jumlah_dana);
            if (form.tanggal_mulai) fd.append('tanggal_mulai', form.tanggal_mulai);
            if (form.tanggal_selesai) fd.append('tanggal_selesai', form.tanggal_selesai);
            anggota.filter(a => a.nama.trim()).forEach((a, i) => {
                fd.append(`anggota[${i}][nama]`, a.nama.trim());
                fd.append(`anggota[${i}][peran]`, a.peran || 'Anggota');
            });
            if (uploadedFile) fd.append('file_proposal', uploadedFile);

            if (isEditing) {
                await updateProposal(editId, fd);
                await ajukanProposal(editId);
            } else {
                await storeProposal(fd);
            }
            setIsSuccess(true);
            setTimeout(() => router.push('/dosen/penelitian'), 3000);
        } catch (err) {
            setSubmitError(err?.userMessage ?? err?.message ?? 'Terjadi kesalahan. Coba lagi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingEdit) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: '#F0F4F0', fontFamily: 'Urbanist, sans-serif' }}>
                <Navbar />
                <div className="flex flex-col items-center justify-center py-32 gap-3 text-gray-500">
                    <Loader2 size={36} className="animate-spin" style={{ color: '#1a4731' }} />
                    <p className="text-sm font-semibold">Memuat data untuk diperbaiki...</p>
                </div>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: '#F0F4F0', fontFamily: 'Urbanist, sans-serif' }}>
                <Navbar />
                <div className="max-w-md mx-auto px-4 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center">
                    <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-8">
                        <Check size={50} className="text-green-600" strokeWidth={3} />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-800 mb-3">{isEditing ? 'Diajukan Ulang!' : 'Proposal Diajukan!'}</h1>
                    <p className="text-sm text-gray-500 mb-2 max-w-sm leading-relaxed">{isEditing ? 'Perbaikan proposal berhasil disimpan dan diajukan ulang.' : 'Proposal penelitian Anda berhasil diajukan.'}</p>
                    <p className="text-sm font-bold text-amber-500 mb-8">Status: Menunggu Validasi Manager</p>
                    <p className="text-xs text-gray-400">Mengalihkan ke dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F0F4F0', fontFamily: 'Urbanist, sans-serif' }}>
            <Navbar />
            <main className="flex-grow max-w-4xl w-full mx-auto px-4 py-8">
                <button onClick={() => router.push('/dosen/penelitian')} className="text-sm font-bold mb-6 hover:opacity-70 transition block" style={{ color: '#1a4731' }}>
                    ← Kembali Ke Dashboard Penelitian
                </button>

                <h1 className="text-2xl font-extrabold mb-0.5" style={{ color: '#1a4731' }}>{isEditing ? 'Perbaiki Penelitian' : 'Ajukan Penelitian Baru'}</h1>
                <p className="text-sm font-medium text-gray-500 mb-6">{isEditing ? 'Perbaiki proposal sesuai catatan manajer, lalu ajukan ulang.' : 'Isi proposal penelitian ilmiah secara lengkap dan akurat.'}</p>

                <StepIndicator currentStep={step} />

                <div className="bg-white rounded-[20px] p-8 shadow-sm border border-gray-100">
                    {step === 1 && (
                        <div className="space-y-5">
                            <h2 className="text-lg font-extrabold text-gray-800 mb-2">Langkah 1 dari 3: Data Penelitian</h2>
                            <div>
                                <FieldLabel required>Judul Penelitian</FieldLabel>
                                <input value={form.judul} onChange={e => updateForm('judul', e.target.value)} placeholder="Contoh: Implementasi Deep Learning untuk Deteksi Dini..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#1a4731] focus:ring-1 focus:ring-[#1a4731] transition" />
                            </div>
                            <div>
                                <FieldLabel>Abstrak</FieldLabel>
                                <textarea value={form.abstrak} onChange={e => updateForm('abstrak', e.target.value)} rows={4} placeholder="Jelaskan latar belakang, tujuan, metode, dan manfaat penelitian secara singkat..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#1a4731] focus:ring-1 focus:ring-[#1a4731] transition resize-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <FieldLabel required>Tahun</FieldLabel>
                                    <input type="number" value={form.tahun} onChange={e => updateForm('tahun', e.target.value)} placeholder="2026"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#1a4731] focus:ring-1 focus:ring-[#1a4731] transition" />
                                </div>
                                <div>
                                    <FieldLabel>Bidang Penelitian</FieldLabel>
                                    <select value={form.bidang_penelitian} onChange={e => updateForm('bidang_penelitian', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#1a4731] focus:ring-1 focus:ring-[#1a4731] transition"
                                        style={{ color: form.bidang_penelitian ? '#1f2937' : '#9CA3AF' }}>
                                        <option value="" disabled hidden>-- Pilih Bidang --</option>
                                        {BIDANG.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <FieldLabel>Sumber Dana</FieldLabel>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {SUMBER_DANA.map(s => {
                                        const active = form.sumber_dana === s;
                                        return (
                                            <button key={s} type="button" onClick={() => updateForm('sumber_dana', active ? '' : s)}
                                                className="px-4 py-2.5 rounded-xl text-sm font-semibold border text-left transition"
                                                style={{ borderColor: active ? '#1a4731' : '#E5E7EB', backgroundColor: active ? '#1a4731' : '#fff', color: active ? '#fff' : '#374151' }}>
                                                {s}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <FieldLabel>Lembaga Dana</FieldLabel>
                                    <input value={form.lembaga_dana} onChange={e => updateForm('lembaga_dana', e.target.value)} placeholder="Contoh: Kemendikbud Ristek – PDUPT"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#1a4731] focus:ring-1 focus:ring-[#1a4731] transition" />
                                </div>
                                <div>
                                    <FieldLabel>Jumlah Dana (Rp)</FieldLabel>
                                    <input type="number" min="0" value={form.jumlah_dana} onChange={e => updateForm('jumlah_dana', e.target.value)} placeholder="Contoh: 50000000"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#1a4731] focus:ring-1 focus:ring-[#1a4731] transition" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <FieldLabel>Tanggal Mulai</FieldLabel>
                                    <input type="date" value={form.tanggal_mulai} onChange={e => updateForm('tanggal_mulai', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#1a4731] focus:ring-1 focus:ring-[#1a4731] transition" />
                                </div>
                                <div>
                                    <FieldLabel>Tanggal Selesai</FieldLabel>
                                    <input type="date" value={form.tanggal_selesai} min={form.tanggal_mulai || undefined} onChange={e => updateForm('tanggal_selesai', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#1a4731] focus:ring-1 focus:ring-[#1a4731] transition" />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <h2 className="text-lg font-extrabold text-gray-800 mb-2">Langkah 2 dari 3: Anggota Tim</h2>
                            <p className="text-sm text-gray-500 mb-5">Anda otomatis menjadi <strong>Ketua</strong>. Tambahkan anggota tim lain (opsional).</p>
                            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-500">Ketua Peneliti</p>
                                    <p className="text-sm font-semibold text-gray-800">{user?.name ?? 'Anda'}</p>
                                </div>
                                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ color: '#1a4731', backgroundColor: '#DCF0E5' }}>Ketua</span>
                            </div>
                            <div className="space-y-3">
                                {anggota.map((a, i) => (
                                    <div key={i} className="border border-gray-100 rounded-2xl p-4 bg-white flex items-end gap-3">
                                        <div className="flex-1">
                                            <FieldLabel>Nama Anggota</FieldLabel>
                                            <input value={a.nama} onChange={e => updateAnggota(i, 'nama', e.target.value)} placeholder="Nama anggota"
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#1a4731] focus:ring-1 focus:ring-[#1a4731] transition" />
                                        </div>
                                        <div className="w-40">
                                            <FieldLabel>Peran</FieldLabel>
                                            <select value={a.peran} onChange={e => updateAnggota(i, 'peran', e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#1a4731] transition">
                                                <option>Anggota</option>
                                                <option>Asisten</option>
                                            </select>
                                        </div>
                                        <button onClick={() => removeAnggota(i)} className="p-2.5 text-red-400 hover:text-red-600 transition"><Trash2 size={17} /></button>
                                    </div>
                                ))}
                                <button onClick={addAnggota} className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 text-sm font-bold text-gray-400 hover:border-[#1a4731] hover:text-[#1a4731] transition">
                                    <Plus size={16} /> Tambah Anggota
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <h2 className="text-lg font-extrabold text-gray-800 mb-6">Langkah 3 dari 3: Upload Proposal</h2>
                            <input ref={fileRef} type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                            <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-[#1a4731] transition mb-6">
                                {uploadedFile ? (
                                    <>
                                        <div className="w-14 h-14 bg-green-100 text-green-700 rounded-full flex items-center justify-center mb-3"><FileText size={28} /></div>
                                        <p className="text-sm font-bold text-gray-700 mb-1">{uploadedFile.name}</p>
                                        <button onClick={e => { e.stopPropagation(); setUploadedFile(null); }} className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 font-bold transition"><X size={13} /> Hapus File</button>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-14 h-14 rounded-2xl bg-[#D6E8DC] text-[#1a4731] flex items-center justify-center mb-4"><Upload size={28} /></div>
                                        <p className="text-sm font-semibold text-gray-600">Klik untuk upload proposal</p>
                                        <p className="text-xs text-gray-400 mt-1">PDF Maks. 5 MB (opsional)</p>
                                    </>
                                )}
                            </div>
                            {isEditing && existingFileName && !uploadedFile && (
                                <p className="text-xs text-gray-500 -mt-3 mb-6 flex items-center gap-1.5">
                                    <FileText size={13} className="text-[#1a4731]" /> Proposal saat ini: <span className="font-semibold text-gray-700">{existingFileName}</span> — unggah baru untuk mengganti.
                                </p>
                            )}
                            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                                <p className="text-xs font-bold text-gray-500 mb-4">Ringkasan</p>
                                <div className="space-y-3 text-sm">
                                    {[
                                        ['Judul', form.judul || '—'],
                                        ['Tahun', form.tahun],
                                        ['Bidang', form.bidang_penelitian || '—'],
                                        ['Sumber Dana', form.sumber_dana || '—'],
                                        ['Lembaga Dana', form.lembaga_dana || '—'],
                                        ['Jumlah Dana', form.jumlah_dana !== '' ? `Rp ${Number(form.jumlah_dana).toLocaleString('id-ID')}` : '—'],
                                        ['Periode', (form.tanggal_mulai || form.tanggal_selesai) ? `${form.tanggal_mulai || '…'} s/d ${form.tanggal_selesai || '…'}` : '—'],
                                        ['Anggota Tim', `${anggota.filter(a => a.nama.trim()).length} orang`],
                                    ].map(([label, val]) => (
                                        <div key={label} className="flex justify-between items-start gap-4 pb-3 border-b border-gray-100 last:border-none last:pb-0">
                                            <span className="text-gray-400 font-medium shrink-0">{label}</span>
                                            <span className="font-semibold text-gray-700 text-right">{val}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {submitError && (
                                <div className="mt-5 bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3">
                                    <AlertCircle size={18} className="text-red-500 shrink-0" />
                                    <p className="text-sm text-red-700">{submitError}</p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
                        {step > 1 ? (
                            <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-1.5 px-6 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 border border-gray-200 transition">
                                <ArrowLeft size={15} /> Sebelumnya
                            </button>
                        ) : <div />}
                        {step < 3 ? (
                            <button onClick={() => setStep(s => s + 1)} disabled={step === 1 && !isStep1Valid}
                                className="px-8 py-3 rounded-xl text-sm font-bold text-white transition disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90" style={{ backgroundColor: '#1a4731' }}>
                                Selanjutnya
                            </button>
                        ) : (
                            <button onClick={handleSubmit} disabled={isSubmitting}
                                className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white transition disabled:opacity-60 hover:opacity-90" style={{ backgroundColor: '#1a4731' }}>
                                {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</> : (isEditing ? 'Simpan & Ajukan Ulang' : 'Ajukan Penelitian')}
                            </button>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
