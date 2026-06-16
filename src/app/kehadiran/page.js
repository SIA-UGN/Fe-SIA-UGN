'use client';

import { useRouter } from 'next/navigation';
import { Eye, BookOpen, CalendarCheck, Clock3 } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    getLecturerClasses,
    getStudentClassesForAttendance,
    getAcademicPeriods
} from '@/lib/attendanceApi';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import Navbar from '@/components/ui/navigation-menu';
import DataTable from '@/components/ui/table';
import Footer from '@/components/ui/footer';
import LoadingEffect from '@/components/ui/loading-effect';
import Cookies from 'js-cookie';
import { useAuth } from '@/lib/auth-context';

export default function KehadiranPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [selectedSemester, setSelectedSemester] = useState('');
    const [semesterOptions, setSemesterOptions] = useState([]);
    const [classes, setClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingClass, setLoadingClass] = useState(false);
    const [errors, setErrors] = useState({});
    const [userRole, setUserRole] = useState(null);
    const [activePeriodLabel, setActivePeriodLabel] = useState('');

    useEffect(() => { fetchAll(); }, []);

    useEffect(() => {
        if (selectedSemester !== '' && userRole) fetchClasses();
    }, [selectedSemester, userRole]);

    const fetchAll = async () => {
        setErrors(prev => ({ ...prev, fetch: null }));
        setIsLoading(true);
        const role = Cookies.get('roles');
        setUserRole(role);
        await fetchAcademicPeriods();
        setIsLoading(false);
    };

    const fetchClasses = async () => {
        setLoadingClass(true);
        setErrors(prev => ({ ...prev, classes: null }));
        try {
            const data = userRole === 'mahasiswa'
                ? await getStudentClassesForAttendance(selectedSemester)
                : await getLecturerClasses(selectedSemester);

            if (data.status === 'success') {
                setClasses(data.data);
            } else {
                setClasses([]);
                setErrors(prev => ({ ...prev, classes: 'Gagal memuat data kelas: ' + data.message }));
            }
        } catch (err) {
            setClasses([]);
            setErrors(prev => ({ ...prev, classes: 'Terjadi kesalahan saat memuat data kelas: ' + err.message }));
        } finally {
            setLoadingClass(false);
        }
    };

    const fetchAcademicPeriods = async () => {
        try {
            const response = await getAcademicPeriods();
            if (response.status === 'success') {
                const options = response.data.map(period => ({
                    value: period.id_academic_period.toString(),
                    label: period.name,
                    is_active: period.is_active
                }));
                setSemesterOptions(options);
                const activePeriod = options.find(opt => opt.is_active);
                if (activePeriod) {
                    setSelectedSemester(activePeriod.value);
                    setActivePeriodLabel(activePeriod.label);
                } else if (options.length > 0) {
                    setSelectedSemester(options[options.length - 1].value);
                    setActivePeriodLabel(options[options.length - 1].label);
                }
            } else {
                setErrors(prev => ({ ...prev, fetch: 'Gagal memuat data: ' + response.message }));
            }
        } catch (err) {
            setErrors(prev => ({ ...prev, fetch: 'Terjadi kesalahan: ' + err.message }));
        }
    };

    const handleDetailClick = (item) => router.push(`/kehadiran/${item.id_class}`);
    const handleBack = () => router.back();

    // Hitung stats dari data kelas
    const totalMatkul = classes.length;
    const pertemuanSelesai = classes.reduce((acc, c) => acc + (c.pertemuan_selesai || 0), 0);
    const pertemuanTersisa = classes.reduce((acc, c) => acc + (c.pertemuan_tersisa || 0), 0);

    const columns = [
        { key: 'kode_matkul', label: 'Kode Matkul', width: '130px', cellClassName: 'font-medium' },
        { key: 'nama_matkul', label: 'Mata Kuliah', className: 'text-left', cellClassName: 'text-left font-medium' },
        { key: 'sks', label: 'SKS', width: '80px', cellClassName: 'font-semibold' },
        { key: 'kelas', label: 'Kelas', width: '100px', cellClassName: 'font-medium' },
        { key: 'dosen', label: 'Dosen', className: 'text-left', cellClassName: 'text-left' },
        { key: 'jumlah_pertemuan', label: 'Jumlah Pertemuan', width: '180px', cellClassName: 'font-medium text-center' },
        { key: 'detail', label: 'Detail', width: '120px' },
    ];

    const customRender = {
        detail: (_value, item) => (
            <div className="flex items-center justify-center">
                <button
                    onClick={() => handleDetailClick(item)}
                    className="flex items-center gap-2 text-white px-4 py-2 transition shadow-sm hover:opacity-90 font-semibold"
                    style={{ backgroundColor: '#015023', borderRadius: '12px', fontFamily: 'Urbanist, sans-serif' }}
                >
                    <Eye className="w-4 h-4" />
                    Detail
                </button>
            </div>
        ),
        jumlah_pertemuan: (value) => (
            <span className="inline-block px-3 py-1 rounded-lg font-semibold" style={{ backgroundColor: '#DABC4E', color: '#015023' }}>
                {value} Pertemuan
            </span>
        ),
    };

    if (isLoading) return <LoadingEffect message="Memuat data periode akademik..." />;

    if (errors.fetch) return (
        <div className="min-h-screen bg-brand-light-sage">
            <Navbar />
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <ErrorMessageBoxWithButton
                    message={errors.fetch}
                    action={fetchAll}
                    back
                    actionback={handleBack}
                />
            </div>
        </div>
    );

    const isDosen = userRole === 'dosen';
    const dosenName = user?.name || '-';

    return (
        <div className="min-h-screen bg-brand-light-sage flex flex-col">
            <Navbar />
            <div className="container mx-auto px-4 py-8 max-w-7xl flex-grow">

                {/* Back */}
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 mb-5 font-medium hover:opacity-75 transition text-sm"
                    style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}
                >
                    ← Kembali Ke Dashboard
                </button>

                {/* ── Header Stats (Khusus Dosen) ── */}
                {isDosen && (
                    <div className="bg-white rounded-2xl shadow-md p-6 mb-5">
                        {/* Title row */}
                        <div className="flex items-start gap-4 mb-5">
                            <div className="p-3 rounded-xl shrink-0" style={{ backgroundColor: '#015023' }}>
                                <CalendarCheck className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
                                    Kehadiran Dosen
                                </h1>
                                <p className="text-sm mt-0.5" style={{ color: '#015023', opacity: 0.7, fontFamily: 'Urbanist, sans-serif' }}>
                                    {dosenName} — {activePeriodLabel || 'Semester Aktif'}
                                </p>
                            </div>
                        </div>

                        {/* Stats row */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-xl p-4 flex items-center gap-3" style={{ backgroundColor: '#f0faf4' }}>
                                <BookOpen className="w-6 h-6 shrink-0" style={{ color: '#015023' }} />
                                <div>
                                    <p className="text-2xl font-bold leading-none" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
                                        {loadingClass ? '...' : totalMatkul}
                                    </p>
                                    <p className="text-xs mt-1" style={{ color: '#015023', opacity: 0.65 }}>Total Mata Kuliah</p>
                                </div>
                            </div>
                            <div className="rounded-xl p-4 flex items-center gap-3" style={{ backgroundColor: '#f0faf4' }}>
                                <CalendarCheck className="w-6 h-6 shrink-0" style={{ color: '#015023' }} />
                                <div>
                                    <p className="text-2xl font-bold leading-none" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
                                        {loadingClass ? '...' : pertemuanSelesai}
                                    </p>
                                    <p className="text-xs mt-1" style={{ color: '#015023', opacity: 0.65 }}>Pertemuan Selesai</p>
                                </div>
                            </div>
                            <div className="rounded-xl p-4 flex items-center gap-3" style={{ backgroundColor: '#f0faf4' }}>
                                <Clock3 className="w-6 h-6 shrink-0" style={{ color: '#015023' }} />
                                <div>
                                    <p className="text-2xl font-bold leading-none" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
                                        {loadingClass ? '...' : pertemuanTersisa}
                                    </p>
                                    <p className="text-xs mt-1" style={{ color: '#015023', opacity: 0.65 }}>Pertemuan Tersisa</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Semester Selector */}
                <div className="bg-white rounded-2xl shadow-md p-4 mb-5">
                    <div className="flex items-center gap-4">
                        <label
                            htmlFor="semester-select"
                            className="text-sm font-semibold whitespace-nowrap"
                            style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}
                        >
                            Pilih Periode:
                        </label>
                        <select
                            id="semester-select"
                            value={selectedSemester}
                            onChange={(e) => setSelectedSemester(e.target.value)}
                            className="flex-1 px-4 py-2.5 border-2 rounded-xl focus:outline-none transition"
                            style={{
                                fontFamily: 'Urbanist, sans-serif',
                                borderColor: '#015023',
                                color: '#015023',
                                fontWeight: '600',
                                maxWidth: '400px'
                            }}
                        >
                            {semesterOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Error & Loading */}
                {errors.classes && (
                    <ErrorMessageBoxWithButton message={errors.classes} action={fetchClasses} />
                )}
                {loadingClass && (
                    <div className="bg-white rounded-2xl shadow-md p-8 text-center">
                        <p className="text-lg" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>Memuat data...</p>
                    </div>
                )}

                {/* Tabel */}
                {!loadingClass && !errors.classes && (
                    <DataTable
                        columns={columns}
                        data={classes}
                        actions={[]}
                        pagination={false}
                        customRender={customRender}
                    />
                )}
            </div>
            <Footer />
        </div>
    );
}
