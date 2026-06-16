'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, User, Hash, Mail, BookOpen, Briefcase } from 'lucide-react';
import Navbar from '@/components/ui/navigation-menu';
import { getManagerLecturerProfile } from '@/lib/managerApi';

const S = {
    page:  { minHeight: '100vh', background: '#f0f4f0' },
    wrap:  { maxWidth: 780, margin: '0 auto', padding: '24px 16px' },
    back:  { display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#1a4731', fontWeight: 600, fontSize: 13, marginBottom: 20 },
    card:  { background: '#fff', borderRadius: 16, padding: '24px', marginBottom: 16, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' },
    avatar:{ width: 64, height: 64, background: '#1a4731', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    name:  { fontSize: 20, fontWeight: 800, color: '#1a4731' },
    sub:   { fontSize: 13, color: '#c9a800', fontWeight: 600 },
    prodi: { fontSize: 13, color: '#6b7280', marginTop: 2 },
    sec:   { fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginBottom: 14 },
    row:   { display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 0', borderBottom: '1px solid #f3f4f6' },
    ico:   { width: 34, height: 34, background: '#f0f4f0', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    lbl:   { fontSize: 11, color: '#9ca3af', marginBottom: 2 },
    val:   { fontSize: 13, color: '#1a4731', fontWeight: 600 },
    info:  { background: '#1a4731', borderRadius: 14, padding: '18px 20px', cursor: 'pointer' },
    infoT: { fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4 },
    infoS: { fontSize: 13, color: '#a7c4a7' },
};

export default function ProfilDosenPage() {
    const router = useRouter();
    const { id } = useParams();
    const [dosen, setDosen]     = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(false);

    useEffect(() => {
        if (!id) return;
        // Gunakan endpoint profile yang sudah ada di BE baru
        // GET /api/manager/lecturers/{id}/profile
        getManagerLecturerProfile(id)
            .then(r => setDosen(r?.data ?? null))
            .catch(() => { setDosen(null); setError(true); })
            .finally(() => setLoading(false));
    }, [id]);

    // Response: { id_user_si, nama, nip, jabatan, prodi, email }
    const FIELDS = [
        { icon: User,      label: 'Nama Lengkap',      value: dosen?.nama },
        { icon: Hash,      label: 'NIP',               value: dosen?.nip },
        { icon: Mail,      label: 'Email',              value: dosen?.email },
        { icon: BookOpen,  label: 'Program Studi',      value: dosen?.prodi },
        { icon: Briefcase, label: 'Jabatan Fungsional', value: dosen?.jabatan },
    ];

    return (
        <div style={S.page}>
            <Navbar />
            <div style={S.wrap}>
                <button style={S.back} onClick={() => router.push('/manager/dosen')}>
                    <ArrowLeft size={14} /> Kembali Ke Daftar Dosen
                </button>

                {/* Header card */}
                <div style={S.card}>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <div style={S.avatar}>
                            <span style={{ fontSize: 26 }}>🎓</span>
                        </div>
                        <div>
                            <div style={S.name}>{loading ? 'Memuat...' : (dosen?.nama ?? '—')}</div>
                            <div style={S.sub}>{dosen?.jabatan ?? '—'}</div>
                            <div style={S.prodi}>{dosen?.prodi ?? '—'}</div>
                        </div>
                    </div>
                </div>

                {/* Data Pribadi */}
                <div style={S.card}>
                    <div style={S.sec}>Data Pribadi</div>
                    {loading ? (
                        <p style={{ color: '#9ca3af', fontSize: 13 }}>Memuat data...</p>
                    ) : error ? (
                        <p style={{ color: '#ef4444', fontSize: 13 }}>Dosen tidak ditemukan.</p>
                    ) : (
                        FIELDS.map(({ icon: Icon, label, value }, i) => (
                            <div key={label} style={{ ...S.row, borderBottom: i < FIELDS.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                                <div style={S.ico}><Icon size={16} color="#1a4731" /></div>
                                <div>
                                    <div style={S.lbl}>{label}</div>
                                    <div style={S.val}>{value ?? '—'}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Info Selengkapnya */}
                <div style={S.info} onClick={() => router.push(`/manager/dosen/${id}/aktivitas`)}>
                    <div style={S.infoT}>Info Selengkapnya</div>
                    <div style={S.infoS}>Lihat aktivitas dosen: presensi, penelitian, publikasi &amp; lainnya</div>
                </div>
            </div>
        </div>
    );
}
