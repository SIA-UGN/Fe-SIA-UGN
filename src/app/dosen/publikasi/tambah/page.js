'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ArrowLeft, BookMarked, Users, Upload,
    Check, Plus, Trash2, Loader2, AlertCircle, FileText, X
} from 'lucide-react';
import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import { useAuth } from '@/lib/auth-context';
import { storePenelitian, updatePenelitian, ajukanPenelitian, getPenelitianById } from '@/lib/penelitianApi';

const STEPS = [
    { id: 1, label: 'Data Publikasi', Icon: BookMarked },
    { id: 2, label: 'Penulis',        Icon: Users },
    { id: 3, label: 'Upload Artikel', Icon: Upload },
];

const JENIS_OUTPUT = ['Jurnal Nasional', 'Jurnal Internasional', 'Prosiding', 'Buku', 'Paten'];
const AKREDITASI = ['SINTA 1', 'SINTA 2', 'SINTA 3', 'SINTA 4', 'Scopus Q1', 'Scopus Q2', 'Scopus Q3', 'Scopus Q4', 'Tidak Terakreditasi'];

function StepIndicator({ currentStep }) {
    return (
        <div className="relative flex justify-between items-start mb-8 max-w-2xl mx-auto px-4">
            <div className="absolute top-8 left-[12%] right-[12%] h-px bg-gray-200 z-0" />
            {STEPS.map(s => {
                const isActive = currentStep === s.id;
                const isPast   = currentStep >  s.id;
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
function TextInput(props) {
    return <input className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#1a4731] focus:ring-1 focus:ring-[#1a4731] transition placeholder:text-gray-300" {...props} />;
}
function SelectInput({ options, placeholder, value, onChange }) {
    return (
        <select value={value} onChange={e => onChange(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#1a4731] focus:ring-1 focus:ring-[#1a4731] transition"
            style={{ color: value ? '#1f2937' : '#9CA3AF' }}>
            <option value="" disabled hidden>{placeholder}</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
    );
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
        judul: '', jenis_output: '', nama_publikasi: '', tahun_terbit: String(new Date().getFullYear()),
        volume: '', nomor: '', halaman: '', penerbit: '', doi_url: '', status_akreditasi: '',
    });
    const updateForm = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const [authors, setAuthors] = useState([
        { tempId: 'utama', nama: user?.name ?? '', id_user_si: user?.id_user_si ?? '', peran: 'Penulis Utama', isUtama: true },
    ]);
    // Sinkronkan id_user_si & nama Penulis Utama saat user (async) selesai dimuat.
    useEffect(() => {
        if (user?.id_user_si) {
            setAuthors(prev => prev.map(a => a.isUtama
                ? { ...a, id_user_si: user.id_user_si, nama: a.nama || user.name || '' }
                : a
            ));
        }
    }, [user?.id_user_si, user?.name]);

    // Mode edit (?id=) — prefill form dari data penelitian untuk "Perbaiki & Ajukan Ulang".
    useEffect(() => {
        if (!isEditing || prefilledRef.current || !user?.id_user_si) return;
        prefilledRef.current = true;
        (async () => {
            try {
                const p = await getPenelitianById(editId);
                if (!p) { setSubmitError('Data penelitian tidak ditemukan.'); return; }
                setForm({
                    judul: p.judul ?? '',
                    jenis_output: p.jenis_output ?? '',
                    nama_publikasi: p.nama_publikasi ?? '',
                    tahun_terbit: String(p.tahun_terbit ?? new Date().getFullYear()),
                    volume: p.volume ?? '', nomor: p.nomor ?? '', halaman: p.halaman ?? '',
                    penerbit: p.penerbit ?? '', doi_url: p.doi_url ?? '', status_akreditasi: p.status_akreditasi ?? '',
                });
                const mapped = (p.authors ?? []).map(a => ({
                    tempId: String(a.id_user_si),
                    nama: a.name ?? '',
                    id_user_si: String(a.id_user_si),
                    peran: a.pivot?.peran ?? 'Anggota',
                    isUtama: String(a.id_user_si) === String(user.id_user_si),
                }));
                if (mapped.length && !mapped.some(x => x.isUtama)) mapped[0].isUtama = true;
                if (mapped.length) setAuthors(mapped);
                if (p.file_artikel) setExistingFileName(String(p.file_artikel).split('/').pop());
            } catch (e) {
                setSubmitError(e?.userMessage ?? e?.message ?? 'Gagal memuat data untuk diedit.');
            } finally {
                setIsLoadingEdit(false);
            }
        })();
    }, [isEditing, editId, user?.id_user_si]);

    const addAuthor = () => setAuthors(p => [...p, { tempId: String(Date.now()), nama: '', id_user_si: '', peran: 'Anggota', isUtama: false }]);
    const removeAuthor = id => setAuthors(p => p.filter(a => a.tempId !== id));
    const updateAuthor = (id, k, v) => setAuthors(p => p.map(a => a.tempId === id ? { ...a, [k]: v } : a));

    const [uploadedFile, setUploadedFile] = useState(null);
    const handleFileChange = e => { const f = e.target.files?.[0]; if (f) setUploadedFile(f); };

    const isStep1Valid = form.judul.trim() && form.jenis_output && form.nama_publikasi.trim() && /^\d{4}$/.test(form.tahun_terbit);
    const isStep2Valid = authors.every(a => String(a.id_user_si).trim());

    // Normalisasi DOI/URL: trim, auto-prepend https:// kalau user cuma menulis DOI bare (10.xxxx/yyy)
    // atau hostname tanpa protocol. Kalau hasilnya masih bukan URL valid, dilewat (tidak dikirim) agar
    // BE (validasi `nullable|url`) tidak menolak.
    const normalizeDoiUrl = (raw) => {
        const s = String(raw ?? '').trim();
        if (!s) return '';
        const candidate = /^https?:\/\//i.test(s)
            ? s
            : /^10\.\d{4,9}\//.test(s)
                ? `https://doi.org/${s}`
                : `https://${s}`;
        try { new URL(candidate); return candidate; } catch { return ''; }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSubmitError(null);
        try {
            const fd = new FormData();
            fd.append('judul', form.judul.trim());
            fd.append('jenis_output', form.jenis_output);
            fd.append('nama_publikasi', form.nama_publikasi.trim());
            fd.append('tahun_terbit', form.tahun_terbit);
            // Field opsional: trim & skip kalau kosong agar BE tidak menerima string kosong.
            ['volume', 'nomor', 'halaman', 'penerbit', 'status_akreditasi'].forEach(k => {
                const v = String(form[k] ?? '').trim();
                if (v) fd.append(k, v);
            });
            const doi = normalizeDoiUrl(form.doi_url);
            if (doi) fd.append('doi_url', doi);
            if (uploadedFile) fd.append('file_artikel', uploadedFile);
            authors.forEach((a, i) => {
                fd.append(`authors[${i}][id_user_si]`, a.id_user_si);
                fd.append(`authors[${i}][peran]`, a.peran);
                fd.append(`authors[${i}][urutan]`, String(i + 1));
            });
            if (isEditing) {
                await updatePenelitian(editId, fd);
                await ajukanPenelitian(editId);
            } else {
                await storePenelitian(fd);
            }
            setIsSuccess(true);
            setTimeout(() => router.push('/dosen/publikasi'), 3000);
        } catch (err) {
            setSubmitError(err?.userMessage ?? err?.message ?? 'Terjadi kesalahan. Coba lagi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: '#F0F4F0', fontFamily: 'Urbanist, sans-serif' }}>
                <Navbar />
                <div className="max-w-md mx-auto px-4 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center">
                    <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-8">
                        <Check size={50} className="text-green-600" strokeWidth={3} />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-800 mb-3">{isEditing ? 'Diajukan Ulang!' : 'Publikasi Tersimpan!'}</h1>
                    <p className="text-sm text-gray-500 mb-2 max-w-sm leading-relaxed">{isEditing ? 'Perbaikan publikasi berhasil disimpan dan diajukan ulang ke manajer.' : 'Data publikasi penelitian Anda berhasil disimpan.'}</p>
                    <p className="text-sm font-bold text-amber-500 mb-8">Status: Menunggu Verifikasi Manager</p>
                    <p className="text-xs text-gray-400">Mengalihkan ke dashboard...</p>
                </div>
            </div>
        );
    }

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

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F0F4F0', fontFamily: 'Urbanist, sans-serif' }}>
            <Navbar />
            <main className="flex-grow max-w-4xl w-full mx-auto px-4 py-8">

                <button onClick={() => router.push('/dosen/publikasi')} className="text-sm font-bold mb-6 hover:opacity-70 transition block" style={{ color: '#1a4731' }}>
                    ← Kembali Ke Publikasi Ilmiah
                </button>

                <h1 className="text-2xl font-extrabold mb-0.5" style={{ color: '#1a4731' }}>{isEditing ? 'Perbaiki Publikasi Ilmiah' : 'Tambah Publikasi Ilmiah'}</h1>
                <p className="text-sm font-medium text-gray-500 mb-6">{isEditing ? 'Perbaiki data sesuai catatan manajer, lalu ajukan ulang untuk divalidasi.' : 'Catat luaran ilmiah (jurnal, prosiding, buku, paten) untuk klaim Angka Kredit.'}</p>

                <div className="rounded-xl px-5 py-4 mb-8 text-sm text-[#1a4731] font-medium leading-relaxed" style={{ backgroundColor: '#D6E8DC' }}>
                    Isi data publikasi/luaran ilmiah Anda. Pastikan jenis luaran & nama publikasi sesuai dengan dokumen asli.
                </div>

                <StepIndicator currentStep={step} />

                <div className="bg-white rounded-[20px] p-8 shadow-sm border border-gray-100">

                    {step === 1 && (
                        <div>
                            <h2 className="text-lg font-extrabold text-gray-800 flex items-center gap-3 mb-6">
                                <div className="w-9 h-9 rounded-xl bg-[#D6E8DC] flex items-center justify-center"><BookMarked size={18} color="#1a4731" /></div>
                                Langkah 1 dari 3: Data Publikasi
                            </h2>
                            <div className="space-y-5">
                                <div>
                                    <FieldLabel required>Judul</FieldLabel>
                                    <TextInput value={form.judul} onChange={e => updateForm('judul', e.target.value)} placeholder="Judul artikel / buku / paten" />
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <FieldLabel required>Jenis Luaran</FieldLabel>
                                        <SelectInput options={JENIS_OUTPUT} placeholder="-- Pilih jenis --" value={form.jenis_output} onChange={v => updateForm('jenis_output', v)} />
                                    </div>
                                    <div>
                                        <FieldLabel required>Tahun Terbit</FieldLabel>
                                        <TextInput type="number" value={form.tahun_terbit} onChange={e => updateForm('tahun_terbit', e.target.value)} placeholder="2026" />
                                    </div>
                                </div>
                                <div>
                                    <FieldLabel required>Nama Publikasi (Jurnal / Penerbit / Konferensi)</FieldLabel>
                                    <TextInput value={form.nama_publikasi} onChange={e => updateForm('nama_publikasi', e.target.value)} placeholder="Contoh: Jurnal Ilmu Komputer Indonesia" />
                                </div>
                                <div className="grid grid-cols-3 gap-5">
                                    <div><FieldLabel>Volume</FieldLabel><TextInput value={form.volume} onChange={e => updateForm('volume', e.target.value)} placeholder="Vol." /></div>
                                    <div><FieldLabel>Nomor</FieldLabel><TextInput value={form.nomor} onChange={e => updateForm('nomor', e.target.value)} placeholder="No." /></div>
                                    <div><FieldLabel>Halaman</FieldLabel><TextInput value={form.halaman} onChange={e => updateForm('halaman', e.target.value)} placeholder="1-10" /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div><FieldLabel>Penerbit</FieldLabel><TextInput value={form.penerbit} onChange={e => updateForm('penerbit', e.target.value)} /></div>
                                    <div>
                                        <FieldLabel>Status Akreditasi</FieldLabel>
                                        <SelectInput options={AKREDITASI} placeholder="-- Pilih --" value={form.status_akreditasi} onChange={v => updateForm('status_akreditasi', v)} />
                                    </div>
                                </div>
                                <div>
                                    <FieldLabel>DOI / URL</FieldLabel>
                                    <TextInput value={form.doi_url} onChange={e => updateForm('doi_url', e.target.value)} placeholder="https://doi.org/..." />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <h2 className="text-lg font-extrabold text-gray-800 flex items-center gap-3 mb-6">
                                <div className="w-9 h-9 rounded-xl bg-[#D6E8DC] flex items-center justify-center"><Users size={18} color="#1a4731" /></div>
                                Langkah 2 dari 3: Penulis
                            </h2>
                            <div className="space-y-4">
                                {authors.map((a, idx) => (
                                    <div key={a.tempId} className="border border-gray-100 rounded-2xl p-5 bg-gray-50 relative">
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-xs font-bold text-gray-500">{a.isUtama ? 'Penulis Utama' : `Anggota #${idx}`}</p>
                                            {!a.isUtama && <button onClick={() => removeAuthor(a.tempId)} className="text-red-400 hover:text-red-600 transition"><Trash2 size={17} /></button>}
                                        </div>
                                        <div className="mb-4">
                                            <FieldLabel>Nama</FieldLabel>
                                            {a.isUtama ? (
                                                <div className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-100 text-gray-600 font-semibold">{a.nama || '(Nama Anda)'}</div>
                                            ) : (
                                                <TextInput value={a.nama} onChange={e => updateAuthor(a.tempId, 'nama', e.target.value)} placeholder="Nama penulis" />
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <FieldLabel required>ID User SI</FieldLabel>
                                                {a.isUtama ? (
                                                    <div className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-100 text-gray-500">{a.id_user_si || '—'}</div>
                                                ) : (
                                                    <TextInput value={a.id_user_si} onChange={e => updateAuthor(a.tempId, 'id_user_si', e.target.value)} placeholder="ID user SI penulis" />
                                                )}
                                            </div>
                                            <div>
                                                <FieldLabel>Peran</FieldLabel>
                                                {a.isUtama ? (
                                                    <div className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-100 text-gray-500">Penulis Utama</div>
                                                ) : (
                                                    <SelectInput options={['Penulis Utama', 'Anggota']} placeholder="Peran" value={a.peran} onChange={v => updateAuthor(a.tempId, 'peran', v)} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={addAuthor} className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 text-sm font-bold text-gray-400 hover:border-[#1a4731] hover:text-[#1a4731] transition">
                                    <Plus size={16} /> Tambah Penulis
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <h2 className="text-lg font-extrabold text-gray-800 flex items-center gap-3 mb-6">
                                <div className="w-9 h-9 rounded-xl bg-[#D6E8DC] flex items-center justify-center"><Upload size={18} color="#1a4731" /></div>
                                Langkah 3 dari 3: Upload Artikel
                            </h2>
                            <input ref={fileRef} type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                            <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-[#1a4731] transition mb-6">
                                {uploadedFile ? (
                                    <>
                                        <div className="w-14 h-14 bg-green-100 text-green-700 rounded-full flex items-center justify-center mb-3"><FileText size={28} /></div>
                                        <p className="text-sm font-bold text-gray-700 mb-1">{uploadedFile.name}</p>
                                        <p className="text-xs text-gray-400 mb-3">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                        <button onClick={e => { e.stopPropagation(); setUploadedFile(null); }} className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 font-bold transition"><X size={13} /> Hapus File</button>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-14 h-14 rounded-2xl bg-[#D6E8DC] text-[#1a4731] flex items-center justify-center mb-4"><Upload size={28} /></div>
                                        <p className="text-sm font-semibold text-gray-600">Klik untuk upload artikel</p>
                                        <p className="text-xs text-gray-400 mt-1">PDF Maks. 5 MB (opsional)</p>
                                    </>
                                )}
                            </div>
                            {isEditing && existingFileName && !uploadedFile && (
                                <p className="text-xs text-gray-500 -mt-3 mb-6 flex items-center gap-1.5">
                                    <FileText size={13} className="text-[#1a4731]" /> Artikel saat ini: <span className="font-semibold text-gray-700">{existingFileName}</span> — unggah baru untuk mengganti.
                                </p>
                            )}
                            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                                <p className="text-xs font-bold text-gray-500 mb-4">Ringkasan</p>
                                <div className="space-y-3 text-sm">
                                    {[
                                        ['Judul', form.judul || '—'],
                                        ['Jenis', form.jenis_output || '—'],
                                        ['Publikasi', form.nama_publikasi || '—'],
                                        ['Tahun', form.tahun_terbit],
                                        ['Jumlah Penulis', `${authors.length} orang`],
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
                            <button onClick={() => setStep(s => s + 1)} disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
                                className="px-8 py-3 rounded-xl text-sm font-bold text-white transition disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90" style={{ backgroundColor: '#1a4731' }}>
                                Selanjutnya
                            </button>
                        ) : (
                            <button onClick={handleSubmit} disabled={isSubmitting}
                                className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white transition disabled:opacity-60 hover:opacity-90" style={{ backgroundColor: '#1a4731' }}>
                                {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</> : (isEditing ? 'Simpan & Ajukan Ulang' : 'Simpan Publikasi')}
                            </button>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
