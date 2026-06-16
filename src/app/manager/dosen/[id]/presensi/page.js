'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight, ClipboardCheck, CalendarDays } from 'lucide-react';
import Navbar from '@/components/ui/navigation-menu';
import { getManagerLecturerRekapPresensi, getManagerLecturerSlip } from '@/lib/managerApi';

const BULAN_NAMES = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const BULAN_FULL  = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const formatRp    = (n) => 'Rp ' + Number(n ?? 0).toLocaleString('id-ID');

const S = {
    page:   { minHeight: '100vh', background: '#f0f4f0' },
    wrap:   { maxWidth: 780, margin: '0 auto', padding: '24px 16px' },
    back:   { display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#1a4731', fontWeight: 600, fontSize: 13, marginBottom: 20 },
    card:   { background: '#fff', borderRadius: 16, padding: '20px', marginBottom: 14, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' },
    ico:    { width: 44, height: 44, background: '#1a4731', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    bar:    { height: 8, background: '#f3f4f6', borderRadius: 4, margin: '10px 0' },
    fill:   (pct, c) => ({ height: 8, width: `${Math.min(pct,100)}%`, background: c, borderRadius: 4, transition: 'width 0.6s' }),
    badge:  (bg, color) => ({ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: bg, color }),
    warn:   { background: '#fefce8', border: '1px solid #f5e87b', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#713f12', marginBottom: 14 },
    gGrid:  { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 },
    gCard:  (active) => ({ background: active ? '#c9a800' : '#f0f4f0', borderRadius: 12, padding: '12px 14px' }),
    katBar: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginTop: 12 },
    katItem:(active) => ({ border: `1.5px solid ${active ? '#1a4731' : '#d1d5db'}`, borderRadius: 10, padding: '10px 8px', textAlign: 'center', background: active ? '#1a4731' : '#fff', color: active ? '#fff' : '#374151' }),
};

const KATEGORI_KEYS = [
    { key: 'perlu',      label: 'Perlu Perhatian', sub: '≥0%',  min: 0  },
    { key: 'cukup',      label: 'Cukup',           sub: '≥60%', min: 60 },
    { key: 'baik',       label: 'Baik',            sub: '≥75%', min: 75 },
    { key: 'sangat_baik',label: 'Sangat Baik',     sub: '≥90%', min: 90 },
];

const getKat = (pct) => {
    if (pct >= 90) return { key: 'sangat_baik', label: 'Sangat Baik' };
    if (pct >= 75) return { key: 'baik',        label: 'Baik' };
    if (pct >= 60) return { key: 'cukup',       label: 'Cukup' };
    return             { key: 'perlu',       label: 'Perlu Perhatian' };
};

export default function PresensiDosenPage() {
    const router = useRouter();
    const { id } = useParams();
    const now   = new Date();

    const [bulan, setBulanRaw]  = useState(now.getMonth() + 1);
    const [tahun]               = useState(now.getFullYear());
    const [rekap, setRekap]     = useState(null);   // dari getAttendanceBySubjects
    const [slip, setSlip]       = useState(null);   // dari showLecturerSlip
    const [loading, setLoading] = useState(true);

    const setBulan = (v) => { if (v >= 1 && v <= 12) setBulanRaw(v); };

    const fetchData = useCallback(async () => {
        setLoading(true);
        setRekap(null);
        setSlip(null);
        try {
            // Parallel fetch: rekap per kelas + slip gaji
            const [rekapRes, slipRes] = await Promise.allSettled([
                getManagerLecturerRekapPresensi(id, bulan, tahun),
                getManagerLecturerSlip(id, bulan, tahun),
            ]);
            if (rekapRes.status === 'fulfilled') setRekap(rekapRes.value?.data ?? null);
            if (slipRes.status === 'fulfilled')  setSlip(slipRes.value?.data ?? null);
        } finally {
            setLoading(false);
        }
    }, [id, bulan, tahun]);

    useEffect(() => { if (id) fetchData(); }, [fetchData]);

    // Response dari getAttendanceBySubjects:
    // { lecturer: {...}, periode: {...}, subjects: [{id_class, code_class, code_subject, name_subject, sks, total_hadir, total_pertemuan, ringkasan_hadir}] }
    const subjects     = rekap?.subjects ?? [];
    const totalHadir   = subjects.reduce((s, k) => s + (k.total_hadir ?? 0), 0);
    const totalJadwal  = subjects.reduce((s, k) => s + (k.total_pertemuan ?? 0), 0);
    const pct          = totalJadwal > 0 ? Math.round((totalHadir / totalJadwal) * 100) : 0;
    const kat          = getKat(pct);
    const isCurrent    = bulan === now.getMonth() + 1 && tahun === now.getFullYear();
    const noData       = !loading && !rekap;

    // Info gaji dari slip (final atau estimasi)
    const gajiSummary  = slip?.komponen_gaji?.summary;
    const rekapPrs     = slip?.rekap_presensi;
    const isEstimasi   = slip?.is_estimation ?? true;
    const gajiPokok    = slip?.komponen_gaji?.pendapatan?.find(p => p.nama?.includes('Gaji Pokok'))?.nominal ?? 0;
    const persentase   = rekapPrs?.persentase_hadir ?? (totalJadwal > 0 ? Math.round((totalHadir / totalJadwal) * 100) : 0);
    const totalPotongan = gajiSummary?.total_potongan ?? 0;
    const gajiBersih   = gajiSummary?.gaji_bersih ?? 0;

    // Nama dosen dari rekap atau slip
    const namaDosen  = rekap?.lecturer?.name ?? slip?.dosen?.nama ?? '—';
    const jabatan    = slip?.dosen?.jabatan ?? '—';

    const visibleMonths = [-1, 0, 1, 2].map(d => bulan + d).filter(m => m >= 1 && m <= 12);

    return (
        <div style={S.page}>
            <Navbar />
            <div style={S.wrap}>
                <button style={S.back} onClick={() => router.push(`/manager/dosen/${id}/aktivitas`)}>
                    <ArrowLeft size={14} /> Kembali Ke Aktivitas Dosen
                </button>

                {/* Header dosen */}
                <div style={S.card}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                        <div style={S.ico}><span style={{ fontSize: 22 }}>🎓</span></div>
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: '#1a4731' }}>
                                {loading ? 'Memuat...' : namaDosen}
                            </div>
                            <div style={{ fontSize: 13, color: '#c9a800' }}>{jabatan}</div>
                        </div>
                    </div>
                </div>

                {/* Card Presensi */}
                <div style={S.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                            <div style={S.ico}><ClipboardCheck size={20} color="#c9a800" /></div>
                            <div>
                                <div style={{ fontSize: 16, fontWeight: 700 }}>Presensi</div>
                                <div style={{ fontSize: 13, color: '#6b7280' }}>
                                    {noData ? 'Data belum tersedia' :
                                     loading ? 'Memuat...' :
                                     `${totalHadir}/${totalJadwal} pertemuan hadir bulan ini`}
                                </div>
                            </div>
                        </div>
                        {(isCurrent || isEstimasi) && slip && (
                            <span style={S.badge('#fefce8','#713f12')}>Estimasi</span>
                        )}
                        {slip && !isEstimasi && (
                            <span style={S.badge('#d1fae5','#065f46')}>Final</span>
                        )}
                    </div>

                    {/* Navigasi Bulan */}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '16px 0' }}>
                        <button onClick={() => setBulan(bulan - 1)} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ChevronLeft size={14} />
                        </button>
                        {visibleMonths.map(m => (
                            <button key={m} onClick={() => setBulan(m)} style={{
                                padding: '6px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
                                background: m === bulan ? '#1a4731' : '#f0f4f0',
                                color: m === bulan ? '#fff' : '#374151',
                            }}>
                                {BULAN_NAMES[m - 1]}
                            </button>
                        ))}
                        <button onClick={() => setBulan(bulan + 1)} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ChevronRight size={14} />
                        </button>
                    </div>

                    {noData ? (
                        <div style={{ color: '#9ca3af', fontSize: 13, padding: '8px 0' }}>
                            Tidak ada data rekap untuk {BULAN_FULL[bulan - 1]} {tahun}.
                        </div>
                    ) : loading ? (
                        <div style={{ color: '#9ca3af', fontSize: 13 }}>Memuat rekap presensi...</div>
                    ) : (
                        <>
                            {/* Progress bar */}
                            <div style={S.bar}><div style={S.fill(pct, pct >= 75 ? '#c9a800' : '#ef4444')} /></div>
                            <div style={{ fontSize: 13, color: '#c9a800', fontWeight: 700, marginBottom: 12 }}>{pct}% — {kat.label}</div>

                            {/* Warning estimasi */}
                            {(isCurrent || isEstimasi) && (
                                <div style={S.warn}>
                                    {isEstimasi
                                        ? <>Slip gaji <strong>{BULAN_FULL[bulan - 1]} {tahun}</strong> belum difinalisasi. Angka gaji bersifat estimasi.</>
                                        : <>Bulan <strong>{BULAN_FULL[bulan - 1]} {tahun}</strong> masih berjalan. Estimasi berdasarkan data presensi saat ini.</>
                                    }
                                </div>
                            )}

                            {/* Gaji grid */}
                            <div style={S.gGrid}>
                                <div style={S.gCard(false)}>
                                    <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>Gaji Pokok</div>
                                    <div style={{ fontSize: 15, fontWeight: 700 }}>{slip ? formatRp(gajiPokok) : '—'}</div>
                                </div>
                                <div style={S.gCard(false)}>
                                    <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>% Hadir</div>
                                    <div style={{ fontSize: 15, fontWeight: 700 }}>{slip ? `${persentase}%` : '—'}</div>
                                </div>
                                <div style={S.gCard(true)}>
                                    <div style={{ fontSize: 11, color: '#5a3e00', marginBottom: 4 }}>
                                        {isEstimasi ? 'Estimasi Gaji' : 'Gaji Bersih'}
                                    </div>
                                    <div style={{ fontSize: 15, fontWeight: 800, color: '#1a1a1a' }}>{slip ? formatRp(gajiBersih) : '—'}</div>
                                </div>
                            </div>

                            {/* Kategori bar */}
                            <div style={S.katBar}>
                                {KATEGORI_KEYS.map(k => (
                                    <div key={k.key} style={S.katItem(k.key === kat.key)}>
                                        <div style={{ fontSize: 11, fontWeight: 600 }}>{k.label}</div>
                                        <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>{k.sub}</div>
                                    </div>
                                ))}
                            </div>

                            {totalPotongan > 0 && (
                                <div style={{ textAlign: 'center', color: '#b91c1c', fontSize: 13, fontWeight: 600, marginTop: 12 }}>
                                    Potongan kehadiran {formatRp(totalPotongan)}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Detail Kehadiran per Mata Kuliah */}
                <div style={S.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                            <div style={S.ico}><CalendarDays size={20} color="#c9a800" /></div>
                            <div>
                                <div style={{ fontSize: 16, fontWeight: 700 }}>Detail Kehadiran per Mata Kuliah</div>
                                <div style={{ fontSize: 12, color: '#9ca3af' }}>Data kehadiran dosen dari presensi GPS</div>
                            </div>
                        </div>
                        {subjects.length > 0 && (
                            <span style={S.badge('#f0f4f0','#1a4731')}>{subjects.length} matkul</span>
                        )}
                    </div>

                    {noData || subjects.length === 0 ? (
                        <div style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
                            {noData ? 'Tidak ada data rekap untuk bulan ini.' : 'Tidak ada mata kuliah di bulan ini.'}
                        </div>
                    ) : subjects.map((k, i) => {
                        const kPct = k.total_pertemuan > 0 ? Math.round((k.total_hadir / k.total_pertemuan) * 100) : 0;
                        return (
                            <div key={k.id_class ?? i} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: '12px 16px', marginBottom: 10 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 700 }}>{k.name_subject}</div>
                                        <div style={{ fontSize: 12, color: '#9ca3af' }}>
                                            {k.code_subject} &nbsp; Kelas {k.code_class} &nbsp; {k.sks} SKS
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: 14, fontWeight: 700 }}>{k.ringkasan_hadir}</div>
                                        <div style={{ fontSize: 11, color: '#9ca3af' }}>{kPct}%</div>
                                    </div>
                                </div>
                                {/* Progress bar per kelas */}
                                <div style={{ height: 4, background: '#f3f4f6', borderRadius: 2, marginTop: 8 }}>
                                    <div style={{ height: 4, width: `${Math.min(kPct,100)}%`, background: kPct >= 75 ? '#c9a800' : '#ef4444', borderRadius: 2 }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
