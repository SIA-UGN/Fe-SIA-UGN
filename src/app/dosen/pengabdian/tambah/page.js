'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, BookOpen, Users, Upload,
    Check, Plus, Trash2, Loader2, AlertCircle, FileText, X
} from 'lucide-react';
import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import { useAuth } from '@/lib/auth-context';
import { storePengabdian, updatePengabdian, ajukanPengabdian, getPengabdianById, getSelectableUsers } from '@/lib/pengabdianApi';

// ── Constants ──────────────────────────────────────────────────────────────
const STEPS = [
    { id: 1, label: 'Data Kegiatan',  Icon: BookOpen },
    { id: 2, label: 'Anggota Tim',    Icon: Users    },
    { id: 3, label: 'Upload Proposal', Icon: Upload   },
];

const JENIS_PKM_OPTIONS = [
    'Pengabdian Masyarakat (Ketua)',
    'Pengabdian Masyarakat (Anggota)',
    'Penyuluhan / Pelatihan Masyarakat',
    'Pembimbing KKN',
    'Narasumber / Pembicara Seminar',
    'Anggota Tim Pengabdian Eksternal',
];

const SUMBER_DANA_OPTIONS = [
    'Mandiri',
    'DIKTI / Kemendikbud Ristek',
    'Institusi (LPPM)',
    'Kerjasama / Sponsor',
    'Luar Negeri',
];

// ── Sub-components ─────────────────────────────────────────────────────────
function StepIndicator({ currentStep }) {
    return (
        <div className="relative flex justify-between items-start mb-8 max-w-2xl mx-auto px-4">
            <div className="absolute top-8 left-[12%] right-[12%] h-px bg-gray-200 z-0" />
            {STEPS.map(s => {
                const isActive = currentStep === s.id;
                const isPast   = currentStep >  s.id;
                const bg       = (isActive || isPast) ? '#1a4731' : '#9CA3AF';
                return (
                    <div key={s.id} className="relative z-10 flex flex-col items-center gap-3" style={{ backgroundColor: '#F0F4F0' }}>
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center shadow-md transition-all duration-300"
                            style={{ backgroundColor: bg, transform: isActive ? 'scale(1.08)' : 'scale(1)' }}
                        >
                            <s.Icon size={26} color="#fff" strokeWidth={2} />
                        </div>
                        <span
                            className="text-sm text-center font-semibold whitespace-nowrap"
                            style={{ color: isActive || isPast ? '#1a4731' : '#9CA3AF', fontWeight: isActive ? 800 : 600 }}
                        >
                            {s.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

function FieldLabel({ children }) {
    return <label className="block text-xs font-semibold text-gray-500 mb-1.5">{children}</label>;
}

function TextInput({ ...props }) {
    return (
        <input
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#1a4731] focus:ring-1 focus:ring-[#1a4731] transition placeholder:text-gray-300"
            {...props}
        />
    );
}

function SelectInput({ options, placeholder, value, onChange }) {
    return (
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#1a4731] focus:ring-1 focus:ring-[#1a4731] transition"
            style={{ color: value ? '#1f2937' : '#9CA3AF' }}
        >
            <option value="" disabled hidden>{placeholder}</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function TambahPengabdian() {
    const router = useRouter();
    const { user } = useAuth();
    const fileRef = useRef(null);

    const [step, setStep]         = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess]     = useState(false);
    const [submitError, setSubmitError] = useState(null);

    // ── Step 1: Data Kegiatan ──
    const [form, setForm] = useState({
        judul_kegiatan:    '',
        deskripsi:         '',
        lokasi:            '',
        nama_mitra:        '',
        tanggal_mulai:     '',
        tanggal_selesai:   '',
        jumlah_peserta:    '',
        jenis_pkm:         '',   // maps to skema in BE
        sumber_dana:       '',
        nama_lembaga_dana: '',
        jumlah_dana:       '',
        tahun_pelaksanaan: String(new Date().getFullYear()),
    });
    const updateForm = (k, v) => setForm(p => ({ ...p, [k]: v }));

    // ── Step 2: Anggota ──
    const [authors, setAuthors] = useState([
        {
            tempId:     'ketua',
            tipe:       'Dosen',
            nama:       user?.name ?? '',
            id_user_si: user?.id_user_si ?? '',
            nidn:       '',
            prodi:      '',
            peran:      'Ketua',
            isKetua:    true,
        }
    ]);

    // Sinkronkan id_user_si & nama Ketua saat user (async) selesai dimuat.
    // Tanpa ini, snapshot useState awal pakai user.loading=true → id_user_si='' → step 2 selamanya invalid.
    useEffect(() => {
        if (user?.id_user_si) {
            setAuthors(prev => prev.map(a => a.isKetua
                ? { ...a, id_user_si: user.id_user_si, nama: a.nama || user.name || '' }
                : a
            ));
        }
    }, [user?.id_user_si, user?.name]);

    const addAnggota = () => setAuthors(p => [
        ...p,
        { tempId: String(Date.now()), tipe: 'Dosen', nama: '', id_user_si: '', nidn: '', prodi: '', peran: 'Anggota', isKetua: false }
    ]);
    const removeAnggota   = id  => setAuthors(p => p.filter(a => a.tempId !== id));
    const updateAnggota   = (id, k, v) => setAuthors(p => p.map(a => a.tempId === id ? { ...a, [k]: v } : a));

    // Opsi user untuk dropdown "Nama Lengkap" anggota (dosen & mahasiswa) — diambil dari BE.
    const [userOpts, setUserOpts] = useState({ Dosen: [], Mahasiswa: [] });
    useEffect(() => {
        (async () => {
            try {
                const [d, m] = await Promise.all([getSelectableUsers('dosen'), getSelectableUsers('mahasiswa')]);
                setUserOpts({ Dosen: d?.data ?? [], Mahasiswa: m?.data ?? [] });
            } catch { /* abaikan — dropdown kosong kalau gagal */ }
        })();
    }, []);
    // Pilih user dari dropdown → set nama + id_user_si + prodi sekaligus.
    const selectAnggotaUser = (tempId, idUserSi) => setAuthors(p => p.map(a => {
        if (a.tempId !== tempId) return a;
        const u = (userOpts[a.tipe] ?? []).find(x => String(x.id_user_si) === String(idUserSi));
        return u ? { ...a, id_user_si: u.id_user_si, nama: u.name, prodi: u.program_name ?? '', nidn: u.nim ?? '' }
                 : { ...a, id_user_si: '', nama: '', prodi: '', nidn: '' };
    }));
    // Ganti tipe (Dosen/Mahasiswa) → reset pilihan user sebelumnya.
    const changeAnggotaTipe = (tempId, tipe) => setAuthors(p => p.map(a =>
        a.tempId === tempId ? { ...a, tipe, id_user_si: '', nama: '', prodi: '' } : a
    ));

    // ── Mode edit/perbaiki (?id=) ──
    const [editId, setEditId] = useState(null);
    const prefilledRef = useRef(false);
    useEffect(() => {
        const id = new URLSearchParams(window.location.search).get('id');
        if (!id || prefilledRef.current) return;
        prefilledRef.current = true;
        setEditId(id);
        (async () => {
            try {
                const p = await getPengabdianById(id);
                if (!p) return;
                setForm({
                    judul_kegiatan:    p.judul_kegiatan ?? '',
                    deskripsi:         p.deskripsi ?? '',
                    lokasi:            p.lokasi ?? '',
                    nama_mitra:        p.nama_mitra ?? '',
                    tanggal_mulai:     p.tanggal_mulai ?? '',
                    tanggal_selesai:   p.tanggal_selesai ?? '',
                    jumlah_peserta:    p.jumlah_peserta != null ? String(p.jumlah_peserta) : '',
                    jenis_pkm:         p.jenis_pkm ?? '',
                    sumber_dana:       p.sumber_dana ?? '',
                    nama_lembaga_dana: p.lembaga_dana ?? '',
                    jumlah_dana:       p.jumlah_dana != null ? String(p.jumlah_dana) : '',
                    tahun_pelaksanaan: String(p.tahun_pelaksanaan ?? new Date().getFullYear()),
                });
                if (Array.isArray(p.authors) && p.authors.length) {
                    setAuthors(p.authors.map((a, i) => {
                        const isKetua = (a.pivot?.peran ?? '') === 'Ketua' || (i === 0 && !p.authors.some(x => x.pivot?.peran === 'Ketua'));
                        return {
                            tempId:     isKetua ? 'ketua' : String(a.id_user_si ?? i),
                            tipe:       'Dosen',
                            nama:       a.name ?? '',
                            id_user_si: a.id_user_si ?? '',
                            nidn:       '',
                            prodi:      '',
                            peran:      a.pivot?.peran ?? (isKetua ? 'Ketua' : 'Anggota'),
                            isKetua,
                        };
                    }));
                }
            } catch { /* abaikan, biarkan form kosong */ }
        })();
    }, []);

    // ── Step 3: Upload ──
    const [uploadedFile, setUploadedFile] = useState(null);
    const handleFileChange = e => { const f = e.target.files?.[0]; if (f) setUploadedFile(f); };

    // ── Counts for summary ──
    const dosenCount     = authors.filter(a => a.tipe === 'Dosen').length;
    const mahasiswaCount = authors.filter(a => a.tipe === 'Mahasiswa').length;

    // ── Validation ──
    const isStep1Valid = form.judul_kegiatan.trim() && form.lokasi.trim() && form.jenis_pkm && form.sumber_dana;
    const isStep2Valid = authors.every(a => String(a.id_user_si ?? '').trim().length > 0);

    // BE menerima skema (enum pendanaan): Mandiri/Hibah Internal/Hibah Dikti/Lainnya.
    // Mapping dari opsi sumber_dana FE → skema BE.
    const mapSkema = (s) => {
        if (!s) return 'Lainnya';
        if (['Mandiri','Hibah Internal','Hibah Dikti','Lainnya'].includes(s)) return s;
        if (/dikti|kemendikbud/i.test(s)) return 'Hibah Dikti';
        if (/lppm|institusi|internal/i.test(s)) return 'Hibah Internal';
        if (/mandiri/i.test(s)) return 'Mandiri';
        return 'Lainnya';
    };

    // ── Submit ──
    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSubmitError(null);
        try {
            const fd = new FormData();
            fd.append('judul_kegiatan',    form.judul_kegiatan);
            if (form.deskripsi.trim()) fd.append('deskripsi', form.deskripsi.trim());
            if (form.jenis_pkm) fd.append('jenis_pkm', form.jenis_pkm);
            // BE field `skema` = jenis pendanaan (enum). Ambil dari sumber_dana yang dipilih user.
            fd.append('skema',             mapSkema(form.sumber_dana));
            fd.append('lokasi',            form.lokasi);
            if (form.nama_mitra.trim()) fd.append('nama_mitra', form.nama_mitra.trim());
            fd.append('tahun_pelaksanaan', form.tahun_pelaksanaan || String(new Date().getFullYear()));
            if (form.tanggal_mulai)   fd.append('tanggal_mulai', form.tanggal_mulai);
            if (form.tanggal_selesai) fd.append('tanggal_selesai', form.tanggal_selesai);
            if (form.jumlah_peserta !== '') fd.append('jumlah_peserta', form.jumlah_peserta);
            if (form.sumber_dana) fd.append('sumber_dana', form.sumber_dana);
            if (form.nama_lembaga_dana.trim()) fd.append('lembaga_dana', form.nama_lembaga_dana.trim());
            if (form.jumlah_dana) fd.append('jumlah_dana', form.jumlah_dana);
            if (uploadedFile)     fd.append('file_laporan', uploadedFile);

            authors.forEach((a, i) => {
                fd.append(`authors[${i}][id_user_si]`, a.id_user_si);
                fd.append(`authors[${i}][peran]`,      a.peran);
            });

            if (editId) {
                await updatePengabdian(editId, fd);
                await ajukanPengabdian(editId);
            } else {
                await storePengabdian(fd);
            }
            setIsSuccess(true);
            setTimeout(() => router.push('/dosen/pengabdian'), 3200);
        } catch (err) {
            setSubmitError(err?.userMessage ?? err?.message ?? 'Terjadi kesalahan. Coba lagi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Success Screen ──
    if (isSuccess) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: '#F0F4F0', fontFamily: 'Urbanist, sans-serif' }}>
                <Navbar />
                <div className="fixed right-6 top-20 bg-white border border-green-200 rounded-2xl p-4 flex items-start gap-3 shadow-lg z-50 max-w-xs">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={13} color="#fff" strokeWidth={3} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-800">Pengajuan PKM berhasil dikirim!</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">Pantau statusnya di Dashboard PKM.</p>
                    </div>
                </div>
                <div className="max-w-md mx-auto px-4 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center">
                    <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-8">
                        <Check size={50} className="text-green-600" strokeWidth={3} />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-800 mb-3">{editId ? 'Diajukan Ulang!' : 'Kegiatan Diajukan!'}</h1>
                    <p className="text-sm text-gray-500 mb-2 max-w-sm leading-relaxed">
                        {editId ? 'Perbaikan kegiatan PKM berhasil disimpan dan diajukan ulang.' : 'Kegiatan PKM Anda sedang menunggu validasi dari manajer.'}
                    </p>
                    <p className="text-sm font-bold text-amber-500 mb-8">Status: Menunggu Verifikasi Manager</p>
                    <p className="text-xs text-gray-400">Mengalihkan ke dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F0F4F0', fontFamily: 'Urbanist, sans-serif' }}>
            <Navbar />
            <main className="flex-grow max-w-4xl w-full mx-auto px-4 py-8">

                {/* Back */}
                <button
                    onClick={() => router.push('/dosen/pengabdian')}
                    className="text-sm font-bold mb-6 hover:opacity-70 transition block"
                    style={{ color: '#1a4731' }}
                >
                    ← Kembali Ke Dashboard Pengabdian Masyarakat
                </button>

                <h1 className="text-2xl font-extrabold mb-0.5" style={{ color: '#1a4731' }}>
                    {editId ? 'Perbaiki Kegiatan PKM' : 'Ajukan Kegiatan PKM Baru'}
                </h1>
                <p className="text-sm font-medium text-gray-500 mb-6">
                    {editId ? 'Perbaiki kegiatan sesuai catatan manajer, lalu ajukan ulang.' : 'Periode: Semester Genap 2025/2026'}
                </p>

                {/* Info Banner */}
                <div className="rounded-xl px-5 py-4 mb-8 text-sm text-[#1a4731] font-medium leading-relaxed" style={{ backgroundColor: '#D6E8DC' }}>
                    Silakan isi form berikut untuk mengajukan proposal kegiatan pengabdian masyarakat secara lengkap dan akurat. Pastikan setiap kolom informasi dan kategori penelitian yang dipilih telah sesuai dengan daftar yang tersedia.
                </div>

                <StepIndicator currentStep={step} />

                {/* Card */}
                <div className="bg-white rounded-[20px] p-8 shadow-sm border border-gray-100">

                    {/* ══ STEP 1 ══ */}
                    {step === 1 && (
                        <div>
                            <h2 className="text-lg font-extrabold text-gray-800 flex items-center gap-3 mb-6">
                                <div className="w-9 h-9 rounded-xl bg-[#D6E8DC] flex items-center justify-center">
                                    <BookOpen size={18} color="#1a4731" />
                                </div>
                                Langkah 1 dari 3: Data Kegiatan
                            </h2>

                            <div className="space-y-5">
                                <div>
                                    <FieldLabel>Judul Kegiatan</FieldLabel>
                                    <TextInput
                                        value={form.judul_kegiatan}
                                        onChange={e => updateForm('judul_kegiatan', e.target.value)}
                                        placeholder="Contoh: Workshop Pengembangan Aplikasi Mobile untuk Santri Pondok Pesantren Al-Hidayah"
                                    />
                                </div>

                                <div>
                                    <FieldLabel>Deskripsi</FieldLabel>
                                    <textarea
                                        value={form.deskripsi}
                                        onChange={e => updateForm('deskripsi', e.target.value)}
                                        placeholder="Jelaskan latar belakang, tujuan, metode, dan manfaat kegiatan secara singkat..."
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#1a4731] focus:ring-1 focus:ring-[#1a4731] transition placeholder:text-gray-300 resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <FieldLabel>Lokasi Kegiatan</FieldLabel>
                                        <TextInput
                                            value={form.lokasi}
                                            onChange={e => updateForm('lokasi', e.target.value)}
                                            placeholder="Kel. Caturtunggal, Depok"
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel>Nama Mitra</FieldLabel>
                                        <TextInput
                                            value={form.nama_mitra}
                                            onChange={e => updateForm('nama_mitra', e.target.value)}
                                            placeholder="Dinas Pendidikan Kabupaten Sleman"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-5">
                                    <div>
                                        <FieldLabel>Tanggal Mulai</FieldLabel>
                                        <TextInput
                                            type="date"
                                            value={form.tanggal_mulai}
                                            onChange={e => updateForm('tanggal_mulai', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel>Tanggal Selesai</FieldLabel>
                                        <TextInput
                                            type="date"
                                            value={form.tanggal_selesai}
                                            onChange={e => updateForm('tanggal_selesai', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel>Jumlah Peserta</FieldLabel>
                                        <TextInput
                                            type="number"
                                            value={form.jumlah_peserta}
                                            onChange={e => updateForm('jumlah_peserta', e.target.value)}
                                            placeholder="Estimasi"
                                            min="0"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <FieldLabel>Jenis PKM</FieldLabel>
                                        <SelectInput
                                            options={JENIS_PKM_OPTIONS}
                                            placeholder="-- Pilih jenis kegiatan --"
                                            value={form.jenis_pkm}
                                            onChange={v => updateForm('jenis_pkm', v)}
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel>Sumber Dana</FieldLabel>
                                        <SelectInput
                                            options={SUMBER_DANA_OPTIONS}
                                            placeholder="-- Pilih sumber dana --"
                                            value={form.sumber_dana}
                                            onChange={v => updateForm('sumber_dana', v)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <FieldLabel>Nama Lembaga Dana</FieldLabel>
                                        <TextInput
                                            value={form.nama_lembaga_dana}
                                            onChange={e => updateForm('nama_lembaga_dana', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel>Jumlah Dana (Rp)</FieldLabel>
                                        <TextInput
                                            type="number"
                                            value={form.jumlah_dana}
                                            onChange={e => updateForm('jumlah_dana', e.target.value)}
                                            placeholder="0"
                                            min="0"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ══ STEP 2 ══ */}
                    {step === 2 && (
                        <div>
                            <h2 className="text-lg font-extrabold text-gray-800 flex items-center gap-3 mb-6">
                                <div className="w-9 h-9 rounded-xl bg-[#D6E8DC] flex items-center justify-center">
                                    <Users size={18} color="#1a4731" />
                                </div>
                                Langkah 2 dari 3: Anggota Tim
                            </h2>

                            <div className="space-y-4">
                                {authors.map((a, idx) => (
                                    <div key={a.tempId} className="border border-gray-100 rounded-2xl p-5 bg-gray-50 relative">
                                        {/* Header row */}
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-xs font-bold text-gray-500">
                                                {a.isKetua ? 'Ketua Penelitian' : `Anggota #${idx}`}
                                            </p>
                                            {!a.isKetua && (
                                                <button onClick={() => removeAnggota(a.tempId)} className="text-red-400 hover:text-red-600 transition">
                                                    <Trash2 size={17} />
                                                </button>
                                            )}
                                        </div>

                                        {/* Tipe toggle (only for non-ketua) */}
                                        {!a.isKetua && (
                                            <div className="flex mb-4">
                                                {['Dosen', 'Mahasiswa'].map(t => (
                                                    <button
                                                        key={t}
                                                        type="button"
                                                        onClick={() => changeAnggotaTipe(a.tempId, t)}
                                                        className="px-5 py-1.5 text-sm font-bold rounded-lg transition-colors first:rounded-r-none last:rounded-l-none border"
                                                        style={{
                                                            backgroundColor: a.tipe === t ? '#1a4731' : '#fff',
                                                            color:           a.tipe === t ? '#fff'    : '#6B7280',
                                                            borderColor:     '#D1D5DB',
                                                            zIndex:          a.tipe === t ? 1 : 0,
                                                        }}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        <div className="mb-4">
                                            <FieldLabel>Nama Lengkap</FieldLabel>
                                            {a.isKetua ? (
                                                <div className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-100 text-gray-600 font-semibold">
                                                    {a.nama || '(Nama Anda)'}
                                                </div>
                                            ) : (
                                                <select
                                                    value={a.id_user_si}
                                                    onChange={e => selectAnggotaUser(a.tempId, e.target.value)}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#1a4731] focus:ring-1 focus:ring-[#1a4731] transition"
                                                    style={{ color: a.id_user_si ? '#1f2937' : '#9CA3AF' }}
                                                >
                                                    <option value="" disabled hidden>-- Pilih {a.tipe} --</option>
                                                    {(userOpts[a.tipe] ?? []).map(u => (
                                                        <option key={u.id_user_si} value={u.id_user_si}>
                                                            {u.name}{u.nim ? ` (${u.nim})` : ''}{u.program_name ? ` — ${u.program_name}` : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <FieldLabel>{a.tipe === 'Mahasiswa' ? 'NIM' : 'NIP / NIDN'}</FieldLabel>
                                                <div className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-100 text-gray-500">
                                                    {a.nidn || a.id_user_si || '—'}
                                                </div>
                                            </div>
                                            <div>
                                                <FieldLabel>Program Studi</FieldLabel>
                                                <div className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-100 text-gray-400">
                                                    {a.prodi || '—'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={addAnggota}
                                    className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 text-sm font-bold text-gray-400 hover:border-[#1a4731] hover:text-[#1a4731] transition"
                                >
                                    <Plus size={16} /> Tambah Anggota
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ══ STEP 3 ══ */}
                    {step === 3 && (
                        <div>
                            <h2 className="text-lg font-extrabold text-gray-800 flex items-center gap-3 mb-6">
                                <div className="w-9 h-9 rounded-xl bg-[#D6E8DC] flex items-center justify-center">
                                    <Upload size={18} color="#1a4731" />
                                </div>
                                Langkah 3 dari 3: Upload Proposal
                            </h2>

                            {/* Upload Box */}
                            <input ref={fileRef} type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                            <div
                                onClick={() => fileRef.current?.click()}
                                className="border-2 border-dashed border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-[#1a4731] transition mb-6"
                            >
                                {uploadedFile ? (
                                    <>
                                        <div className="w-14 h-14 bg-green-100 text-green-700 rounded-full flex items-center justify-center mb-3">
                                            <FileText size={28} />
                                        </div>
                                        <p className="text-sm font-bold text-gray-700 mb-1">{uploadedFile.name}</p>
                                        <p className="text-xs text-gray-400 mb-3">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                        <button
                                            onClick={e => { e.stopPropagation(); setUploadedFile(null); }}
                                            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 font-bold transition"
                                        >
                                            <X size={13} /> Hapus File
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-14 h-14 rounded-2xl bg-[#D6E8DC] text-[#1a4731] flex items-center justify-center mb-4">
                                            <Upload size={28} />
                                        </div>
                                        <p className="text-sm font-semibold text-gray-600">Klik untuk upload proposal</p>
                                        <p className="text-xs text-gray-400 mt-1">PDF Maks. 10 MB</p>
                                    </>
                                )}
                            </div>

                            {/* Ringkasan */}
                            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                                <p className="text-xs font-bold text-gray-500 mb-4">Ringkasan Pengajuan</p>
                                <div className="space-y-3 text-sm">
                                    {[
                                        ['Judul',       form.judul_kegiatan || '—'],
                                        ['Tahun',       form.tahun_pelaksanaan],
                                        ['Bidang',      form.jenis_pkm || '—'],
                                        ['Sumber Dana', form.sumber_dana || '—'],
                                        ['Jumlah Tim',  `${authors.length} orang (${dosenCount} Dosen · ${mahasiswaCount} Mahasiswa)`],
                                    ].map(([label, val]) => (
                                        <div key={label} className="flex justify-between items-start gap-4 pb-3 border-b border-gray-100 last:border-none last:pb-0">
                                            <span className="text-gray-400 font-medium shrink-0">{label}</span>
                                            <span className="font-semibold text-gray-700 text-right">{val}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Error */}
                            {submitError && (
                                <div className="mt-5 bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3">
                                    <AlertCircle size={18} className="text-red-500 shrink-0" />
                                    <p className="text-sm text-red-700">{submitError}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Navigation Bar ── */}
                    <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
                        {step > 1 ? (
                            <button
                                onClick={() => setStep(s => s - 1)}
                                className="flex items-center gap-1.5 px-6 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 border border-gray-200 transition"
                            >
                                <ArrowLeft size={15} /> Sebelumnya
                            </button>
                        ) : <div />}

                        {step < 3 ? (
                            <button
                                onClick={() => setStep(s => s + 1)}
                                disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
                                className="px-8 py-3 rounded-xl text-sm font-bold text-white transition disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                                style={{ backgroundColor: '#1a4731' }}
                            >
                                Selanjutnya
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white transition disabled:opacity-60 hover:opacity-90"
                                style={{ backgroundColor: '#1a4731' }}
                            >
                                {isSubmitting
                                    ? <><Loader2 size={16} className="animate-spin" /> Mengirim...</>
                                    : (editId ? 'Simpan & Ajukan Ulang' : 'Submit Proposal')
                                }
                            </button>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
