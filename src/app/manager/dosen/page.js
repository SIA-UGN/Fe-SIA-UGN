'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Eye, GraduationCap, ArrowLeft, AlertCircle } from 'lucide-react';
import Navbar from '@/components/ui/navigation-menu';
import { getManagerLecturers } from '@/lib/managerApi';
import { useAuth } from '@/lib/auth-context';

const S = {
    page:    { minHeight: '100vh', background: '#f0f4f0' },
    wrap:    { maxWidth: 860, margin: '0 auto', padding: '24px 16px' },
    back:    { display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#1a4731', fontWeight: 600, fontSize: 13, marginBottom: 16 },
    title:   { fontSize: 22, fontWeight: 800, color: '#1a1a1a', marginBottom: 16 },
    sumCard: { background: '#1a4731', borderRadius: 14, padding: '20px 24px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    sumNum:  { fontSize: 32, fontWeight: 800, color: '#fff' },
    sumLbl:  { fontSize: 13, color: '#a7c4a7', marginBottom: 4 },
    icon:    { width: 44, height: 44, background: '#c9a800', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    search:  { display: 'flex', alignItems: 'center', gap: 10, border: '1.5px solid #c9a800', borderRadius: 10, padding: '10px 14px', background: '#fff', marginBottom: 16 },
    table:   { width: '100%', background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' },
    thead:   { background: '#c9a800' },
    th:      { padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#1a1a1a', textAlign: 'left' },
    td:      { padding: '14px 16px', fontSize: 13, color: '#374151', borderTop: '1px solid #f3f4f6' },
    eye:     { width: 34, height: 34, borderRadius: 8, background: '#1a4731', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
};

export default function DaftarDosenPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [dosen, setDosen]     = useState([]);
    const [search, setSearch]   = useState('');
    const [loading, setLoading] = useState(true);
    const [errCode, setErrCode] = useState(null);  // 401/403/null

    useEffect(() => {
        getManagerLecturers()
            .then(r => {
                // Coba berbagai shape: array langsung, {data: array}, atau {data: {data: array}}
                let arr = [];
                if (Array.isArray(r)) arr = r;
                else if (Array.isArray(r?.data)) arr = r.data;
                else if (Array.isArray(r?.data?.data)) arr = r.data.data;
                console.log('[ManagerDosen] response:', r, '-> parsed length:', arr.length);
                setDosen(arr);
                setErrCode(null);
            })
            .catch(err => {
                const sc = err?.response?.status ?? err?.status ?? null;
                console.warn('[ManagerDosen] fetch error:', sc, err?.message ?? err);
                setErrCode(sc ?? -1);
                setDosen([]);
            })
            .finally(() => setLoading(false));
    }, []);

    const filtered = dosen.filter(d =>
        d.name?.toLowerCase().includes(search.toLowerCase()) ||
        d.employee_id_number?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={S.page}>
            <Navbar />
            <div style={S.wrap}>
                <button style={S.back} onClick={() => router.push('/dashboard')}>
                    <ArrowLeft size={14} /> Kembali Ke Dashboard
                </button>
                <div style={S.title}>Daftar Dosen</div>

                {/* Summary */}
                <div style={S.sumCard}>
                    <div>
                        <div style={S.sumLbl}>Total Dosen</div>
                        <div style={S.sumNum}>{loading ? '—' : dosen.length}</div>
                    </div>
                    <div style={S.icon}><GraduationCap size={22} color="#1a4731" /></div>
                </div>

                {/* Search */}
                <div style={S.search}>
                    <Search size={16} color="#c9a800" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Cari Dosen..."
                        style={{ border: 'none', outline: 'none', flex: 1, fontSize: 13, background: 'transparent' }}
                    />
                </div>

                {/* Table */}
                <table style={S.table}>
                    <thead style={S.thead}>
                        <tr>
                            {['No', 'Nama', 'NIP', 'Program Studi', 'Jabatan', 'Aksi'].map(h => (
                                <th key={h} style={{ ...S.th, textAlign: h === 'Aksi' ? 'center' : 'left' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{ ...S.td, textAlign: 'center', color: '#9ca3af' }}>Memuat data...</td></tr>
                        ) : errCode === 403 ? (
                            <tr><td colSpan={6} style={{ ...S.td, textAlign: 'center', color: '#b91c1c', padding: '28px 16px' }}>
                                <AlertCircle size={28} style={{ display: 'inline-block', marginBottom: 8 }} /><br />
                                <strong>Akses ditolak (403).</strong> Halaman ini hanya untuk akun <strong>Manager / Admin</strong>.<br />
                                Anda sedang login sebagai: <strong>{user?.roles ?? '—'}</strong>. Silakan logout dulu lalu login dengan akun manager.
                            </td></tr>
                        ) : errCode === 401 ? (
                            <tr><td colSpan={6} style={{ ...S.td, textAlign: 'center', color: '#b91c1c', padding: '28px 16px' }}>
                                <AlertCircle size={28} style={{ display: 'inline-block', marginBottom: 8 }} /><br />
                                <strong>Sesi berakhir (401).</strong> Silakan login ulang.
                            </td></tr>
                        ) : errCode ? (
                            <tr><td colSpan={6} style={{ ...S.td, textAlign: 'center', color: '#b91c1c', padding: '28px 16px' }}>
                                <AlertCircle size={28} style={{ display: 'inline-block', marginBottom: 8 }} /><br />
                                Gagal memuat daftar dosen (kode {errCode}).
                            </td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={6} style={{ ...S.td, textAlign: 'center', color: '#9ca3af', padding: '24px 16px' }}>
                                Tidak ada dosen ditemukan.<br />
                                <span style={{ fontSize: 11, color: '#9ca3af' }}>
                                    (Diterima dari API: {dosen.length} dosen · login: <strong>{user?.roles ?? '—'}</strong>)
                                </span>
                            </td></tr>
                        ) : filtered.map((d, i) => (
                            <tr key={d.id_user_si}>
                                <td style={S.td}>{i + 1}</td>
                                <td style={{ ...S.td, fontWeight: 600 }}>{d.name}</td>
                                <td style={S.td}>{d.employee_id_number ?? '-'}</td>
                                <td style={S.td}>{d.program_name ?? '-'}</td>
                                <td style={S.td}>{d.position ?? '-'}</td>
                                <td style={{ ...S.td, textAlign: 'center' }}>
                                    <button
                                        style={S.eye}
                                        onClick={() => router.push(`/manager/dosen/${d.id_user_si}`)}
                                        title="Lihat Profil"
                                    >
                                        <Eye size={16} color="#fff" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
