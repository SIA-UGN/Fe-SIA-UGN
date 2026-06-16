'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, ClipboardCheck, BookMarked, FlaskConical, FileText, Heart, BookOpen } from 'lucide-react';
import Navbar from '@/components/ui/navigation-menu';
import { getManagerLecturerAktivitas, getManagerLecturerRekapPresensi } from '@/lib/managerApi';

const S = {
    page:  { minHeight: '100vh', background: '#f0f4f0' },
    wrap:  { maxWidth: 780, margin: '0 auto', padding: '24px 16px' },
    back:  { display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#1a4731', fontWeight: 600, fontSize: 13, marginBottom: 20 },
    card:  { background: '#fff', borderRadius: 16, padding: '20px', marginBottom: 14, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' },
    hdr:   { display: 'flex', gap: 14, alignItems: 'center', marginBottom: 12 },
    ico:   { width: 44, height: 44, background: '#1a4731', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    title: { fontSize: 16, fontWeight: 700, color: '#1a1a1a' },
    sub:   { fontSize: 13, color: '#6b7280', marginTop: 2 },
    badge: { padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 },
    bar:   { height: 8, background: '#f3f4f6', borderRadius: 4, margin: '8px 0' },
    fill:  (pct, color) => ({ height: '100%', width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 4, transition: 'width 0.6s' }),
    item:  { border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 14px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    empty: { color: '#9ca3af', fontSize: 13, textAlign: 'center', padding: '20px 0' },
};

const statusBadge = (s) => {
    const map = {
        selesai:     ['#d1fae5', '#065f46', 'Selesai'],
        berlangsung: ['#fef9c3', '#713f12', 'Berlangsung'],
        approved:    ['#d1fae5', '#065f46', 'Approved'],
    };
    const [bg, color, label] = map[s?.toLowerCase()] ?? ['#f3f4f6', '#374151', s ?? '-'];
    return <span style={{ ...S.badge, background: bg, color }}>{label}</span>;
};

export default function AktivitasDosenPage() {
    const router = useRouter();
    const { id } = useParams();
    const now = new Date();

    const [aktivitas, setAktivitas] = useState(null);
    const [rekap, setRekap]         = useState(null);
    const [dosenInfo, setDosenInfo] = useState(null);
    const [loadingA, setLoadingA]   = useState(true);
    const [loadingR, setLoadingR]   = useState(true);

    // Fetch presensi dari endpoint yang sudah ada (bulan berjalan)
    useEffect(() => {
        if (!id) return;
        getManagerLecturerRekapPresensi(id, now.getMonth() + 1, now.getFullYear())
            .then(r => {
                const d = r?.data ?? null;
                setRekap(d);
                // Info dosen dari rekap (lecturer.name)
                if (d?.lecturer) setDosenInfo({ nama: d.lecturer.name });
            })
            .catch(() => setRekap(null))
            .finally(() => setLoadingR(false));
    }, [id]);

    // Fetch aktivitas dari endpoint (belum ada → empty state)
    useEffect(() => {
        if (!id) return;
        getManagerLecturerAktivitas(id)
            .then(r => setAktivitas(r?.data ?? null))
            .catch(() => setAktivitas(null))
            .finally(() => setLoadingA(false));
    }, [id]);

    // Hitung dari subjects[] (respons baru dari ManagerPayrollController)
    const subjects       = rekap?.subjects ?? [];
    const totalHadir     = subjects.reduce((s, k) => s + (k.total_hadir ?? 0), 0);
    const totalJadwal    = subjects.reduce((s, k) => s + (k.total_pertemuan ?? 0), 0);
    const prsHadir       = totalHadir;
    const prsTotal       = totalJadwal;
    const prsPct         = prsTotal > 0 ? Math.round((prsHadir / prsTotal) * 100) : 0;

    const ak    = aktivitas?.angka_kredit;
    const akPct = ak ? Math.round((ak.total_kum / ak.target_kum) * 100) : 0;

    const katLabel = prsPct >= 90 ? 'Sangat Baik' : prsPct >= 75 ? 'Baik' : prsPct >= 60 ? 'Cukup' : 'Perlu Perhatian';

    const noAktivitasMsg = !loadingA && !aktivitas;

    // Approve via Aktivitas Dosen (sesuai Figma): item PENDING → halaman Review
    const PENDING = { kegiatan: 'Diajukan', publikasi: 'Diajukan', penelitian: 'Pengajuan' };
    const ROUTE   = { kegiatan: 'kegiatan', publikasi: 'penelitian', penelitian: 'penelitian-proposal' };
    const reviewHref = (type, item) => (item?.id && item.status === PENDING[type]) ? `/manager/validasi/${ROUTE[type]}/${item.id}?dosen=${id}` : null;
    const openReview = (type, item) => { const h = reviewHref(type, item); if (h) router.push(h); };
    const ReviewTag = ({ show }) => show ? <span style={{ fontSize: 11, fontWeight: 700, color: '#1a4731', whiteSpace: 'nowrap' }}>Review →</span> : null;

    return (
        <div style={S.page}>
            <Navbar />
            <div style={S.wrap}>
                <button style={S.back} onClick={() => router.push(`/manager/dosen/${id}`)}>
                    <ArrowLeft size={14} /> Kembali Ke Detail Dosen
                </button>

                {/* Header dosen */}
                <div style={S.card}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                        <div style={S.ico}><span style={{ fontSize: 22 }}>🎓</span></div>
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: '#1a4731' }}>
                                {loadingR ? 'Memuat...' : (dosenInfo?.nama ?? aktivitas?.nama ?? '—')}
                            </div>
                            <div style={{ fontSize: 13, color: '#c9a800' }}>
                                {dosenInfo?.jabatan ?? aktivitas?.jabatan ?? '—'}
                            </div>
                            <div style={{ fontSize: 13, color: '#6b7280' }}>
                                {dosenInfo?.prodi ?? aktivitas?.prodi ?? '—'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Presensi (data dari rekap-presensi endpoint ✅) ── */}
                <div
                    style={{ ...S.card, cursor: 'pointer' }}
                    onClick={() => router.push(`/manager/dosen/${id}/presensi`)}
                >
                    <div style={S.hdr}>
                        <div style={S.ico}><ClipboardCheck size={20} color="#c9a800" /></div>
                        <div>
                            <div style={S.title}>Presensi</div>
                            <div style={S.sub}>
                                {loadingR ? 'Memuat...' :
                                 !rekap   ? 'Belum ada rekap bulan ini' :
                                 `${prsHadir}/${prsTotal} Pertemuan hadir`}
                            </div>
                        </div>
                    </div>
                    {!loadingR && rekap && (
                        <>
                            <div style={S.bar}>
                                <div style={S.fill(prsPct, prsPct >= 75 ? '#c9a800' : '#ef4444')} />
                            </div>
                            <span style={{ fontSize: 13, color: '#c9a800', fontWeight: 600 }}>
                                {prsPct}% — {katLabel}
                            </span>
                        </>
                    )}
                    {!loadingR && !rekap && (
                        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                            Generate rekap presensi dosen terlebih dahulu.
                        </div>
                    )}
                </div>

                {/* ── Angka Kredit ── */}
                <div 
                    style={{ ...S.card, cursor: 'pointer', transition: 'box-shadow 0.2s', ':hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } }}
                    onClick={() => router.push(`/manager/dosen/${id}/aktivitas/angka-kredit`)}
                >
                    <div style={S.hdr}>
                        <div style={S.ico}><BookMarked size={20} color="#c9a800" /></div>
                        <div>
                            <div style={S.title}>Angka Kredit</div>
                            <div style={S.sub}>
                                {ak ? `${ak.total_kum} / ${ak.target_kum} poin` : '—'}
                            </div>
                        </div>
                    </div>
                    {noAktivitasMsg ? (
                        <div style={S.empty}>
                            Klik disini untuk memvalidasi pengajuan Angka Kredit dosen.
                        </div>
                    ) : ak ? (
                        <>
                            <div style={S.bar}><div style={S.fill(akPct, '#1a4731')} /></div>
                            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>{akPct}% dari target</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                                {[['Pendidikan & Pengajaran', ak.pendidikan], ['Penelitian', ak.penelitian], ['Pengabdian Masyarakat', ak.pengabdian], ['Penunjang', ak.penunjang]].map(([label, val]) => (
                                    <div key={label} style={{ background: '#f0f4f0', borderRadius: 10, padding: '10px', textAlign: 'center' }}>
                                        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>{label}</div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1a4731' }}>{val} poin</div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : null}
                </div>

                {/* ── Penelitian (pending BE) ── */}
                <div style={S.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={S.hdr}>
                            <div style={S.ico}><FlaskConical size={20} color="#c9a800" /></div>
                            <div style={S.title}>Penelitian</div>
                        </div>
                        {aktivitas?.penelitian?.length > 0 && (
                            <span style={{ ...S.badge, background: '#f0f4f0', color: '#1a4731' }}>
                                {aktivitas.penelitian.length} proyek
                            </span>
                        )}
                    </div>
                    {noAktivitasMsg ? (
                        <div style={S.empty}>Gagal memuat data aktivitas.</div>
                    ) : (aktivitas?.penelitian ?? []).length === 0 ? (
                        <div style={S.empty}>Belum ada proyek penelitian.</div>
                    ) : (aktivitas?.penelitian ?? []).map((p, i) => {
                        const href = reviewHref('penelitian', p);
                        return (
                        <div key={i} style={{ ...S.item, cursor: href ? 'pointer' : 'default' }} onClick={() => openReview('penelitian', p)}>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{p.judul}</div>
                                <div style={{ fontSize: 11, color: '#9ca3af' }}>{[p.tahun, p.sumber, p.bidang, (p.ak ? `+${Math.round(p.ak)} AK` : null)].filter(Boolean).join(' · ')}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{statusBadge(p.status)}<ReviewTag show={!!href} /></div>
                        </div>
                        );
                    })}
                </div>

                {/* ── Publikasi (pending BE) ── */}
                <div style={S.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={S.hdr}>
                            <div style={S.ico}><FileText size={20} color="#c9a800" /></div>
                            <div style={S.title}>Publikasi Ilmiah</div>
                        </div>
                        {aktivitas?.publikasi?.length > 0 && (
                            <span style={{ ...S.badge, background: '#f0f4f0', color: '#1a4731' }}>
                                {aktivitas.publikasi.length} karya
                            </span>
                        )}
                    </div>
                    {noAktivitasMsg ? (
                        <div style={S.empty}>Gagal memuat data aktivitas.</div>
                    ) : (aktivitas?.publikasi ?? []).length === 0 ? (
                        <div style={S.empty}>Belum ada publikasi ilmiah.</div>
                    ) : (aktivitas?.publikasi ?? []).map((p, i) => {
                        const href = reviewHref('publikasi', p);
                        return (
                        <div key={i} style={{ ...S.item, cursor: href ? 'pointer' : 'default' }} onClick={() => openReview('publikasi', p)}>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{p.judul}</div>
                                <div style={{ fontSize: 11, color: '#9ca3af' }}>{p.jurnal} · {p.tahun}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{statusBadge(p.status)}<ReviewTag show={!!href} /></div>
                        </div>
                        );
                    })}
                </div>

                {/* ── Kegiatan Mengajar ── */}
                <div style={S.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={S.hdr}>
                            <div style={S.ico}><BookOpen size={20} color="#c9a800" /></div>
                            <div style={S.title}>Kegiatan Mengajar</div>
                        </div>
                        {aktivitas?.kegiatan_mengajar?.length > 0 && (
                            <span style={{ ...S.badge, background: '#f0f4f0', color: '#1a4731' }}>
                                {aktivitas.kegiatan_mengajar.length} mata kuliah
                            </span>
                        )}
                    </div>
                    {noAktivitasMsg ? (
                        <div style={S.empty}>Gagal memuat data aktivitas.</div>
                    ) : (aktivitas?.kegiatan_mengajar ?? []).length === 0 ? (
                        <div style={S.empty}>Belum ada kegiatan mengajar.</div>
                    ) : (aktivitas?.kegiatan_mengajar ?? []).map((k, i) => {
                        const href = reviewHref('kegiatan', k);
                        return (
                        <div key={i} style={{ ...S.item, cursor: href ? 'pointer' : 'default' }} onClick={() => openReview('kegiatan', k)}>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{k.mata_kuliah}</div>
                                <div style={{ fontSize: 11, color: '#9ca3af' }}>{[k.kode_mk, k.kelas && `Kelas ${k.kelas}`, k.sks != null && `${k.sks} SKS`, k.semester, k.tahun_ajaran].filter(Boolean).join(' · ')}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{statusBadge(k.status)}<ReviewTag show={!!href} /></div>
                        </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
