'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    ChevronLeft, ChevronRight, ArrowLeft,
    FileText, Download, TrendingUp,
    AlertCircle, Clock, CalendarX,
} from 'lucide-react';
import Navbar from '@/components/ui/navigation-menu';
import {
    getPayrollList,
    generateSlipGaji,
    generateRekap,
    downloadSlipGajiPDF,
    getRekapPresensi,
} from '@/lib/payrollApi.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const BULAN_NAMES = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const BULAN_FULL  = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

const formatRupiah = (n) =>
    'Rp ' + Number(n ?? 0).toLocaleString('id-ID', { minimumFractionDigits: 0 });

const getKategori = (pct) => {
    if (pct >= 90) return { label: 'Sangat Baik', key: 'sangat_baik' };
    if (pct >= 75) return { label: 'Baik',        key: 'baik'        };
    if (pct >= 60) return { label: 'Cukup',       key: 'cukup'       };
    return            { label: 'Perlu Perhatian', key: 'perlu'       };
};

// ─── Kategori Bar ─────────────────────────────────────────────────────────────
function KategoriBar({ active }) {
    const items = [
        { label: 'Perlu Perhatian', sub: '≥0%',  key: 'perlu'       },
        { label: 'Cukup',           sub: '≥60%', key: 'cukup'       },
        { label: 'Baik',            sub: '≥75%', key: 'baik'        },
        { label: 'Sangat Baik',     sub: '≥90%', key: 'sangat_baik' },
    ];
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginTop: 12 }}>
            {items.map(it => {
                const isActive = it.key === active;
                return (
                    <div key={it.key} style={{
                        border: `1.5px solid ${isActive ? '#1a4731' : '#d1d5db'}`,
                        borderRadius: 10, padding: '10px 8px', textAlign: 'center',
                        background: isActive ? '#1a4731' : '#fff',
                        color: isActive ? '#fff' : '#374151',
                        transition: 'all 0.2s',
                    }}>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{it.label}</div>
                        <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>{it.sub}</div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Navigasi Bulan ───────────────────────────────────────────────────────────
function BulanNav({ bulan, setBulan, tahun }) {
    const now          = new Date();
    const currentMonth = now.getMonth() + 1;
    const start        = Math.max(0, Math.min(bulan - 2, 8));
    const visibleIdx   = Array.from({ length: 4 }, (_, i) => start + i);

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '12px 0' }}>
            <button
                onClick={() => setBulan(b => Math.max(1, b - 1))}
                disabled={bulan <= 1}
                style={{
                    width: 28, height: 28, borderRadius: '50%', border: '1px solid #d1d5db',
                    background: bulan <= 1 ? '#f3f4f6' : '#fff',
                    cursor: bulan <= 1 ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
            >
                <ChevronLeft size={14} />
            </button>

            {visibleIdx.map(idx => {
                const b        = idx + 1;
                const isActive = b === bulan;
                const isFuture = tahun === now.getFullYear() && b > currentMonth;
                return (
                    <button
                        key={b}
                        onClick={() => !isFuture && setBulan(b)}
                        style={{
                            padding: '6px 18px', borderRadius: 20, border: 'none',
                            background: isActive ? '#1a4731' : isFuture ? '#f3f4f6' : '#e5e7eb',
                            color: isActive ? '#fff' : isFuture ? '#9ca3af' : '#374151',
                            fontWeight: isActive ? 700 : 400,
                            cursor: isFuture ? 'not-allowed' : 'pointer',
                            fontSize: 13, transition: 'all 0.2s',
                        }}
                    >
                        {BULAN_NAMES[idx]}
                    </button>
                );
            })}

            <button
                onClick={() => setBulan(b => Math.min(12, b + 1))}
                disabled={bulan >= 12}
                style={{
                    width: 28, height: 28, borderRadius: '50%', border: '1px solid #d1d5db',
                    background: bulan >= 12 ? '#f3f4f6' : '#fff',
                    cursor: bulan >= 12 ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
            >
                <ChevronRight size={14} />
            </button>
        </div>
    );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner() {
    return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
            stroke="#1a4731" strokeWidth="2.5" strokeLinecap="round"
            style={{ animation: 'payroll-spin 0.9s linear infinite' }}
        >
            <style>{`@keyframes payroll-spin { to { transform: rotate(360deg); } }`}</style>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );
}

// ─── Modal Slip Gaji ──────────────────────────────────────────────────────────
function SlipGajiModal({ slip, rekap, profile, bulan, tahun, isFinal, onClose }) {
    const BULAN_FULL = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    const formatRp   = (n) => 'Rp ' + Number(n ?? 0).toLocaleString('id-ID');

    const totalHadir     = rekap?.total_hadir     ?? 0;
    const totalHariKerja = rekap?.total_hari_kerja ?? 0;
    const pct            = totalHariKerja > 0 ? Math.round((totalHadir / totalHariKerja) * 100) : 0;
    const kategoriLabel  = pct >= 90 ? 'Sangat Baik' : pct >= 75 ? 'Baik' : pct >= 60 ? 'Cukup' : 'Perlu Perhatian';

    const gajiPokokKomp = slip?.komponens?.find(k => k.tipe === 'pendapatan' && k.nama_komponen?.includes('Gaji Pokok'));
    const totalPendapatan= slip?.total_pendapatan ?? 0;
    const potongan       = slip?.total_potongan ?? 0;
    const gajiBersih     = slip?.gaji_bersih ?? 0;
    const pendapatanRows = slip?.komponens?.filter(k => k.tipe === 'pendapatan') ?? [];

    const handlePrint = () => window.print();

    return (
        <div onClick={onClose} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
            zIndex: 1000, display: 'flex', alignItems: 'flex-start',
            justifyContent: 'center', overflowY: 'auto', padding: '24px 16px',
        }}>
            <div onClick={e => e.stopPropagation()} style={{
                background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480,
                boxShadow: '0 8px 40px rgba(0,0,0,0.2)', overflow: 'hidden',
            }}>
                {/* Header bar */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 20px', borderBottom:'1px solid #e5e7eb' }}>
                    <span style={{ fontWeight:700, fontSize:15, color:'#1a4731' }}>
                        {isFinal ? 'Slip Gaji Dosen' : 'Estimasi Slip Gaji Dosen'}
                    </span>
                    <div style={{ display:'flex', gap:8 }}>
                        <button onClick={handlePrint} style={{
                            padding:'6px 14px', borderRadius:20, border:'1px solid #d1d5db',
                            background:'#fff', cursor:'pointer', fontSize:12, fontWeight:600, color:'#374151',
                            display:'flex', alignItems:'center', gap:5,
                        }}>
                            🖨️ Cetak/Unduh
                        </button>
                        <button onClick={onClose} style={{
                            width:28, height:28, borderRadius:'50%', border:'1px solid #d1d5db',
                            background:'#f3f4f6', cursor:'pointer', fontWeight:700, fontSize:14, color:'#374151',
                        }}>×</button>
                    </div>
                </div>

                <div style={{ padding:'24px 28px' }}>
                    {/* Logo + Badge */}
                    <div style={{ textAlign:'center', marginBottom:20 }}>
                        <div style={{
                            width:72, height:72, borderRadius:'50%', background:'#1a4731',
                            display:'inline-flex', alignItems:'center', justifyContent:'center',
                            marginBottom:12,
                        }}>
                            <span style={{ fontSize:28 }}>🎓</span>
                        </div>
                        <div>
                            <span style={{
                                display:'inline-flex', alignItems:'center', gap:8,
                                background:'#1a4731', color:'#fff', borderRadius:20,
                                padding:'8px 20px', fontWeight:700, fontSize:14,
                            }}>
                                {isFinal ? 'Slip Gaji Dosen' : 'Estimasi Slip Gaji'}
                                {!isFinal && (
                                    <span style={{ background:'#c9a800', color:'#1a1a1a', borderRadius:8, padding:'2px 8px', fontSize:11, fontWeight:800 }}>DRAFT</span>
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Periode */}
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16, fontSize:13 }}>
                        <span style={{ color:'#6b7280' }}>Periode:</span>
                        <span style={{ fontWeight:700, color:'#1a4731' }}>{BULAN_FULL[bulan - 1]} {tahun}</span>
                    </div>

                    {/* Data Dosen */}
                    <div style={{ background:'#f0f4f0', borderRadius:10, padding:'14px 16px', marginBottom:16 }}>
                        <p style={{ margin:'0 0 8px', fontSize:11, fontWeight:700, color:'#6b7280', letterSpacing:1 }}>DATA DOSEN</p>
                        {[
                            ['Nama',          profile?.full_name ?? profile?.name ?? '-'],
                            ['NIP',           profile?.employee_id_number ?? '-'],
                            ['Jabatan',       profile?.position ?? '-'],
                            ['Program Studi', profile?.nama_program ?? '-'],
                            ['Email',         profile?.email ?? '-'],
                        ].map(([label, value]) => (
                            <div key={label} style={{ display:'flex', fontSize:13, marginBottom:4 }}>
                                <span style={{ color:'#6b7280', width:110, flexShrink:0 }}>{label}</span>
                                <span style={{ color:'#374151' }}>: {value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Rekap Kehadiran */}
                    <p style={{ margin:'0 0 8px', fontSize:11, fontWeight:700, color:'#6b7280', letterSpacing:1 }}>REKAP KEHADIRAN</p>
                    <div style={{ border:'1px solid #e5e7eb', borderRadius:10, overflow:'hidden', marginBottom:16 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 14px', borderBottom:'1px solid #e5e7eb', fontSize:13 }}>
                            <span style={{ color:'#374151' }}>Total Pertemuan ({BULAN_FULL[bulan - 1]} {tahun})</span>
                            <span style={{ fontWeight:700 }}>{totalHariKerja} pertemuan</span>
                        </div>
                        {!isFinal && (
                            <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 14px', borderBottom:'1px solid #e5e7eb', fontSize:13, background:'#fefce8' }}>
                                <span style={{ color:'#92400e' }}>Sudah Berlangsung</span>
                                <span style={{ fontWeight:700, color:'#92400e' }}>{totalHadir} pertemuan</span>
                            </div>
                        )}
                        <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 14px', borderBottom:'1px solid #e5e7eb', fontSize:13 }}>
                            <span style={{ color:'#374151' }}>Jumlah Hadir {!isFinal && <span style={{ color:'#c9a800', fontSize:11 }}>(estimasi)</span>}</span>
                            <span style={{ fontWeight:700 }}>{totalHadir} pertemuan</span>
                        </div>
                        <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 14px', fontSize:13 }}>
                            <span style={{ color:'#374151' }}>Persentase Kehadiran {!isFinal && <span style={{ color:'#c9a800', fontSize:11 }}>(estimasi)</span>}</span>
                            <span style={{ fontWeight:700, color:'#1a4731' }}>{pct}% - {kategoriLabel}</span>
                        </div>
                    </div>

                    {/* Komponen Gaji */}
                    <p style={{ margin:'0 0 8px', fontSize:11, fontWeight:700, color:'#6b7280', letterSpacing:1 }}>
                        KOMPONEN GAJI {!isFinal && <span style={{ color:'#c9a800' }}>(PROYEKSI)</span>}
                    </p>
                    <div style={{ border:'1px solid #e5e7eb', borderRadius:10, overflow:'hidden', marginBottom:20 }}>
                        {pendapatanRows.map((k, i) => (
                            <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'12px 14px', borderBottom:'1px solid #e5e7eb', fontSize:13 }}>
                                <span style={{ color:'#374151' }}>{k.nama_komponen}</span>
                                <span style={{ fontWeight:700 }}>{formatRp(k.nominal)}</span>
                            </div>
                        ))}
                        {potongan > 0 && (
                            <div style={{ display:'flex', justifyContent:'space-between', padding:'12px 14px', borderBottom:'1px solid #e5e7eb', fontSize:13, background:'#fef2f2' }}>
                                <span style={{ color:'#b91c1c' }}>Potongan Kehadiran</span>
                                <span style={{ fontWeight:700, color:'#b91c1c' }}>- {formatRp(potongan)}</span>
                            </div>
                        )}
                        <div style={{ display:'flex', justifyContent:'space-between', padding:'14px 14px', fontSize:14, background:'#f0f4f0' }}>
                            <span style={{ fontWeight:700, color:'#1a4731' }}>Total Gaji Diterima</span>
                            <span style={{ fontWeight:800, color:'#1a4731', fontSize:15 }}>{formatRp(gajiBersih)}</span>
                        </div>
                    </div>

                    {/* Tanda Tangan */}
                    <div style={{ textAlign:'center', margin:'20px 0 8px', color:'#6b7280', fontSize:13 }}>
                        <div style={{ marginBottom:32 }}>Mengetahui,</div>
                        <div style={{ fontWeight:700, color:'#1a1a1a' }}>Manager UGN</div>
                    </div>

                    {/* Footer */}
                    <div style={{ borderTop:'1px solid #e5e7eb', paddingTop:12, marginTop:16, fontSize:11, color:'#9ca3af', textAlign:'center' }}>
                        {!isFinal ? (
                            <span>Estimasi berdasarkan <strong>{totalHadir} dari {totalHariKerja} pertemuan</strong> yang telah berlangsung. Nilai dapat berubah.</span>
                        ) : (
                            <span>Slip gaji resmi {BULAN_FULL[bulan - 1]} {tahun} · Sistem Informasi Akademik UGN</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


export default function PayrollPage() {
    const router = useRouter();
    const now    = new Date();

    const prevMonth = now.getMonth() === 0 ? 12 : now.getMonth();
    const [bulan, setBulanRaw] = useState(prevMonth);
    const [tahun, setTahun]    = useState(now.getFullYear());

    const [profile,  setProfile]  = useState(null);
    const [allSlips, setAllSlips] = useState([]);
    const [rekaps,   setRekaps]   = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState(null);
    const [showSlip, setShowSlip] = useState(false);

    const setBulan = (val) => { setError(null); setBulanRaw(val); };

    // ── Fetch profil dosen ──────────────────────────────────────────────────────
    useEffect(() => {
        (async () => {
            try {
                const { default: api } = await import('@/lib/axios');
                const res = await api.get('/profile/staff');
                setProfile(res.data?.data ?? null);
            } catch { /* ignore */ }
        })();
    }, []);

    // ── Auto-init: generate rekap + slip otomatis semua bulan ada jadwal ───────
    const autoInit = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const limitMonth = tahun === now.getFullYear() ? now.getMonth() + 1 : 12;

            // Fetch existing slips sekali di awal
            const slipRes0 = await getPayrollList(tahun).catch(() => ({ data: [] }));
            const existingSlips = slipRes0?.data ?? [];

            for (let m = 1; m <= limitMonth; m++) {
                const isCurrent = tahun === now.getFullYear() && m === limitMonth;
                const hasSlip   = existingSlips.some(s => s.bulan === m && s.tahun === tahun);

                // SELALU generate rekap (agar data kehadiran selalu fresh)
                let rekapData = null;
                try {
                    const r = await generateRekap(m, tahun);
                    rekapData = r?.data;
                } catch { continue; } // Tidak ada periode akademik → lewati

                // SELALU generate slip ulang (agar sinkron dengan rekap terbaru)
                // Hanya skip jika tidak ada jadwal sama sekali di bulan itu
                if (rekapData && rekapData.total_hari_kerja > 0) {
                    try { await generateSlipGaji(m, tahun); } catch { /* ignore */ }
                }
            }

            // Fetch final setelah semua selesai
            const [slipRes, rekapRes] = await Promise.all([
                getPayrollList(tahun),
                getRekapPresensi(null, tahun),
            ]);
            setAllSlips(slipRes?.data ?? []);
            setRekaps(rekapRes?.data ?? []);
        } catch (e) {
            setError(e?.message || 'Gagal memuat data payroll.');
        } finally {
            setLoading(false);
        }
    }, [tahun]);

    useEffect(() => { autoInit(); }, [autoInit]);

    // ── Derived state ───────────────────────────────────────────────────────────
    const slip  = allSlips.find(s => s.bulan === bulan && s.tahun === tahun) ?? null;
    const rekap = rekaps.find(r  => r.bulan === bulan && r.tahun === tahun)  ?? null;

    const totalHadir     = rekap?.total_hadir     ?? 0;
    const totalHariKerja = rekap?.total_hari_kerja ?? 0;
    const pct            = totalHariKerja > 0 ? Math.round((totalHadir / totalHariKerja) * 100) : 0;
    const kategori       = getKategori(pct);

    const isBulanSelesai = !(tahun === now.getFullYear() && bulan >= now.getMonth() + 1);
    const tidakAdaJadwal = rekap !== null && totalHariKerja === 0;

    const gajiPokokKomp   = slip?.komponens?.find(k => k.tipe === 'pendapatan' && k.nama_komponen?.includes('Gaji Pokok'));
    const totalPendapatan  = slip?.total_pendapatan ?? 0;  // gaji pokok + tunjangan
    const potonganAlpha    = slip?.total_potongan ?? 0;
    const gajiBersih       = slip?.gaji_bersih ?? null;
    const labelGajiPokok   = gajiPokokKomp?.nama_komponen ?? 'Total Pendapatan';

    // ── Download PDF ────────────────────────────────────────────────────────────
    const handleDownloadPDF = async () => {
        if (!slip?.id) return;
        try {
            const blob = await downloadSlipGajiPDF(slip.id);
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href     = url;
            a.download = `SlipGaji_${BULAN_FULL[bulan - 1]}_${tahun}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            setError('Gagal mengunduh slip gaji PDF.');
        }
    };

    // ── Render ──────────────────────────────────────────────────────────────────
    return (
        <>
        <div style={{ minHeight: '100vh', background: '#f0f4f0' }}>
            <Navbar />
            <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>

                {/* Back */}
                <button
                    onClick={() => router.push('/dashboard')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#1a4731', fontWeight: 600, fontSize: 14, marginBottom: 20,
                    }}
                >
                    <ArrowLeft size={16} /> Kembali Ke Dashboard
                </button>

                {/* Card Profil */}
                <div style={{
                    background: '#fff', borderRadius: 16, padding: 24,
                    boxShadow: '0 1px 6px rgba(0,0,0,0.07)', marginBottom: 20,
                    display: 'flex', alignItems: 'center', gap: 20,
                }}>
                    <div style={{
                        width: 60, height: 60, borderRadius: 14, background: '#1a4731',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                        <TrendingUp size={28} color="#fff" />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1a1a1a' }}>
                            {profile?.name ?? 'Dosen'}
                        </h1>
                        <p style={{ margin: '2px 0 0', color: '#2d6a4f', fontWeight: 600, fontSize: 14 }}>
                            {profile?.position ?? 'Dosen Tetap'}
                        </p>
                        <p style={{ margin: '2px 0 0', color: '#6b7280', fontSize: 13 }}>
                            {profile?.nama_program ?? 'Program Studi'}
                        </p>
                    </div>
                </div>

                {/* Card Payroll */}
                <div style={{
                    background: '#fff', borderRadius: 16, padding: 24,
                    boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
                }}>
                    {/* Header card */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: 12, background: '#f0f4f0',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <FileText size={22} color="#1a4731" />
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#1a1a1a' }}>
                                        {isBulanSelesai ? 'Slip Gaji' : 'Slip Gaji Bulanan'}
                                    </h2>
                                    <select 
                                        value={tahun} 
                                        onChange={(e) => {
                                            setTahun(Number(e.target.value));
                                            setBulan(1); // reset to Jan when year changes
                                        }}
                                        style={{ 
                                            padding: '2px 8px', borderRadius: 6, border: '1px solid #d1d5db', 
                                            fontSize: 14, fontWeight: 600, color: '#1a4731', background: '#fff', cursor: 'pointer' 
                                        }}
                                    >
                                        <option value={now.getFullYear()}>{now.getFullYear()}</option>
                                        <option value={now.getFullYear() - 1}>{now.getFullYear() - 1}</option>
                                        <option value={now.getFullYear() - 2}>{now.getFullYear() - 2}</option>
                                        <option value={now.getFullYear() - 3}>{now.getFullYear() - 3}</option>
                                    </select>
                                </div>
                                <p style={{ margin: '2px 0 0', color: '#6b7280', fontSize: 13 }}>
                                    {rekap
                                        ? `${totalHadir}/${totalHariKerja} pertemuan hadir bulan ini`
                                        : 'Memproses data...'}
                                </p>
                            </div>
                        </div>

                        {/* Badge + tombol lihat slip */}
                        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                            {isBulanSelesai && slip && (
                                <span style={{ padding:'6px 14px', borderRadius:20, background:'#f5e87b', color:'#5a4e00', fontWeight:600, fontSize:13 }}>Final</span>
                            )}
                            {!isBulanSelesai && slip && (
                                <span style={{ padding:'6px 14px', borderRadius:20, background:'#fefce8', color:'#713f12', fontWeight:600, fontSize:13, border:'1px solid #f5e87b' }}>Estimasi</span>
                            )}
                            {slip && (
                                <button onClick={() => setShowSlip(true)} style={{
                                    padding:'6px 14px', borderRadius:20, border:'none',
                                    background: isBulanSelesai ? '#1a4731' : '#c9a800',
                                    color: '#fff', fontWeight:600, fontSize:12, cursor:'pointer',
                                }}>
                                    {isBulanSelesai ? 'Lihat Slip Gaji' : 'Lihat Estimasi'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Navigasi Bulan */}
                    <BulanNav bulan={bulan} setBulan={setBulan} tahun={tahun} />

                    {/* Body */}
                    {loading ? (
                        <div style={{
                            textAlign: 'center', padding: '32px 0',
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', gap: 10, color: '#6b7280',
                        }}>
                            <Spinner />
                            <span style={{ fontSize: 13 }}>Menghitung gaji otomatis...</span>
                        </div>
                    ) : (
                        <>
                            {/* Progress bar */}
                            <div style={{
                                height: 10, borderRadius: 10,
                                background: '#e5e7eb', overflow: 'hidden', marginBottom: 6,
                            }}>
                                <div style={{
                                    width: `${pct}%`, height: '100%',
                                    background: 'linear-gradient(90deg, #c9a800, #1a4731)',
                                    borderRadius: 10, transition: 'width 0.6s ease',
                                }} />
                            </div>
                            <p style={{ margin: '0 0 12px', fontWeight: 700, color: '#1a4731', fontSize: 14 }}>
                                {pct}% — {kategori.label}
                            </p>

                            {/* Banner estimasi */}
                            {!isBulanSelesai && (
                                <div style={{
                                    background: '#fefce8', border: '1px solid #f5e87b',
                                    borderRadius: 10, padding: '10px 14px',
                                    color: '#713f12', fontSize: 13, marginBottom: 16,
                                    display: 'flex', alignItems: 'center', gap: 8,
                                }}>
                                    <Clock size={15} />
                                    Bulan <strong>{BULAN_FULL[bulan - 1]} {tahun}</strong> masih berjalan.
                                    Angka gaji bersifat estimasi.
                                </div>
                            )}

                            {/* Error */}
                            {error && (
                                <div style={{
                                    background: '#fef2f2', border: '1px solid #fca5a5',
                                    borderRadius: 10, padding: '10px 14px', color: '#b91c1c',
                                    fontSize: 13, marginBottom: 16, display: 'flex', gap: 8,
                                }}>
                                    <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                                    {error}
                                </div>
                            )}

                            {/* ── State: ada slip ── */}
                            {slip && (
                                <>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 4 }}>
                                        <div style={{ background: '#f0f4f0', borderRadius: 12, padding: '14px 16px' }}>
                                            <p style={{ margin: 0, fontSize: 11, color: '#6b7280', fontWeight: 500 }}>Total Pendapatan</p>
                                            <p style={{ margin: '4px 0 0', fontSize: 17, fontWeight: 700, color: '#1a1a1a' }}>
                                                {formatRupiah(totalPendapatan)}
                                            </p>
                                            {potonganAlpha > 0 && (
                                                <p style={{ margin: '4px 0 0', fontSize: 11, color: '#b91c1c' }}>Potongan {formatRupiah(potonganAlpha)}</p>
                                            )}
                                        </div>
                                        <div style={{
                                            background: isBulanSelesai ? '#1a4731' : '#c9a800',
                                            borderRadius: 12, padding: '14px 16px',
                                        }}>
                                            <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                                                {isBulanSelesai ? 'Gaji Diterima' : 'Estimasi Gaji'}
                                            </p>
                                            <p style={{ margin: '4px 0 0', fontSize: 17, fontWeight: 700, color: '#fff' }}>
                                                {formatRupiah(gajiBersih)}
                                            </p>
                                        </div>
                                    </div>

                                    <KategoriBar active={kategori.key} />

                                    {isBulanSelesai && (
                                        <button
                                            onClick={handleDownloadPDF}
                                            style={{
                                                width: '100%', marginTop: 16, padding: '12px 0',
                                                borderRadius: 12, border: 'none',
                                                background: '#1a4731', color: '#fff',
                                                fontWeight: 700, fontSize: 14, cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                            }}
                                        >
                                            <Download size={16} /> Unduh Slip Gaji PDF
                                        </button>
                                    )}
                                </>
                            )}

                            {/* ── State: tidak ada jadwal ── */}
                            {!slip && tidakAdaJadwal && (
                                <div style={{ textAlign: 'center', padding: '28px 0 8px' }}>
                                    <CalendarX size={40} color="#d1d5db" style={{ marginBottom: 8 }} />
                                    <p style={{ color: '#9ca3af', fontSize: 14, margin: 0 }}>
                                        Tidak ada jadwal mengajar di {BULAN_FULL[bulan - 1]} {tahun}.
                                    </p>
                                </div>
                            )}

                            {/* ── State: belum ada data ── */}
                            {!slip && !rekap && (
                                <div style={{ textAlign: 'center', padding: '28px 0 8px' }}>
                                    <CalendarX size={40} color="#d1d5db" style={{ marginBottom: 8 }} />
                                    <p style={{ color: '#9ca3af', fontSize: 14, margin: 0 }}>
                                        Data gaji {BULAN_FULL[bulan - 1]} {tahun} belum tersedia.
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>

        {/* Modal Slip Gaji */}
        {showSlip && slip && (
            <SlipGajiModal
                slip={slip}
                rekap={rekap}
                profile={profile}
                bulan={bulan}
                tahun={tahun}
                isFinal={isBulanSelesai}
                onClose={() => setShowSlip(false)}
            />
        )}
    </>
    );
}

