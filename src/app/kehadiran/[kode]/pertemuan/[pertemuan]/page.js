'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getClassDetail, sendManualAttendance, getPresencesBySchedule, deletePresence, checkInDosenGPS } from '@/lib/attendanceApi';
import { getPermissionForAScheduleInAClass } from '@/lib/permissionApi';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import { AlertConfirmationDialog, AlertSuccessDialog, AlertErrorDialog } from '@/components/ui/alert-dialog';
import Navbar from '@/components/ui/navigation-menu';
import DataTable from '@/components/ui/table';
import { ArrowLeft, CalendarDays, Save, QrCode, MapPin, Navigation, CheckCircle, WifiOff, AlertTriangle, LocateFixed } from 'lucide-react';
import { PrimaryButton, WarningButton } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import Footer from '@/components/ui/footer';
import LoadingEffect from '@/components/ui/loading-effect';

export default function InputPresensiPage() {
    const router = useRouter();
    const params = useParams();
    const id_schedule = params.pertemuan;
    const id_class = params.kode;

    // ── State management (ORIGINAL — tidak diubah) ────────────────────────────
    const [mahasiswaData, setMahasiswaData] = useState([]);
    const [originalAttendance, setOriginalAttendance] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [permissionChecked, setPermissionChecked] = useState(false);
    const [permissionGranted, setPermissionGranted] = useState(null);
    const [loadingPermission, setLoadingPermission] = useState(true);
    const [countdown, setCountdown] = useState(5);
    const [classInfo, setClassInfo] = useState({
        code_subject: '-',
        name_subject: '-',
        code_class: '-',
        dosen: '-'
    });
    const [scheduleInfo, setScheduleInfo] = useState({
        pertemuanke: '-',
        date: '',
    });
    const [statistics, setStatistics] = useState({
        total_students: 0,
        present_students: 0,
        absent_students: 0
    });
    const [errors, setErrors] = useState({});

    // Alert states (ORIGINAL — tidak diubah)
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [confirmAction, setConfirmAction] = useState(null);

    // State untuk fitur lokasi
    // lokasiState: 'idle' | 'loading' | 'ready' | 'denied' | 'timeout'
    const [lokasiState, setLokasiState] = useState('idle');
    const [lokasiDetail, setLokasiDetail] = useState(null);
    const [isCatatLoading, setIsCatatLoading] = useState(false);

    // ── useEffect (ORIGINAL — tidak diubah) ──────────────────────────────────
    // Check permission on mount
    useEffect(() => {
        if (id_class) {
            checkPermission();
        }
    }, [id_class]);

    // Fetch data after permission is granted
    useEffect(() => {
        if (permissionChecked && permissionGranted) {
            fetchAllData();
        }
    }, [permissionChecked, permissionGranted]);

    // Countdown redirect effect when permission is denied
    useEffect(() => {
        let timer;
        if (permissionGranted === false) {
            if (countdown > 0) {
                timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
            } else {
                handleBack();
            }
        }
        return () => clearTimeout(timer);
    }, [permissionGranted, countdown]);

    // ── Functions (ORIGINAL — tidak diubah) ──────────────────────────────────
    // Check Permission
    const checkPermission = async () => {
        setErrors(prev => ({...prev, permission: null}));
        setLoadingPermission(true);
        try {
            const response = await getPermissionForAScheduleInAClass(id_class, id_schedule);
            if (response.status === 'success') {
                if (response.data.permission === false) {
                    setPermissionGranted(false);
                    setPermissionChecked(true);
                } else {
                    setPermissionGranted(true);
                    setPermissionChecked(true);
                }
            } else {
                setErrors(prev => ({...prev, permission: 'Gagal memeriksa izin akses: ' + response.message}));
            }
        } catch (error) {
            setErrors(prev => ({...prev, permission: 'Gagal memeriksa izin akses: ' + error.message}));
        } finally {
            setLoadingPermission(false);
        }
    };

    // Fetch All Data
    const fetchAllData = async () => {
        setErrors(prev => ({...prev, fetch: null}));
        setIsLoading(true);
        await Promise.all([
            fetchClassDetail(),
            fetchAttendanceData()
        ]);
        setIsLoading(false);
    };

    // Fetch class detail with students list
    const fetchClassDetail = async () => {
        setErrors(prev => ({...prev, fetch: null}));
        try {
            const response = await getClassDetail(id_class);
            if (response.status === 'success') {
                setClassInfo(response.data.class_info);
            } else {
                setErrors(prev => ({...prev, fetch: 'Gagal memuat data kelas: ' + response.message}));
            }
        } catch (error) {
            setErrors(prev => ({...prev, fetch: 'Terjadi kesalahan saat memuat data kelas: ' + error.message}));
        }
    };

    // Fetch attendance data
    const fetchAttendanceData = async () => {
        setErrors(prev => ({...prev, fetch: null}));
        try {
            const response = await getPresencesBySchedule(id_schedule);
            if (response.status === 'success') {
                setScheduleInfo({
                    pertemuanke: response.data.pertemuan || '-',
                    date: response.data.tanggal || ''
                });
                const attendedStudentIds = response.data.students.map(s => s.id_user_si);
                setOriginalAttendance(attendedStudentIds);
                const classData = await getClassDetail(response.data.id_class);
                if (classData.status === 'success') {
                    const formattedData = classData.data.students.map(student => ({
                        id: student.id_user_si,
                        nim: student.nim,
                        nama: student.name,
                        hadir: attendedStudentIds.includes(student.id_user_si),
                    }));
                    setMahasiswaData(formattedData);
                    setStatistics({
                        total_students: formattedData.length,
                        present_students: attendedStudentIds.length,
                        absent_students: formattedData.length - attendedStudentIds.length
                    });
                }
            } else {
                setErrors(prev => ({...prev, fetch: 'Gagal memuat data presensi: ' + response.message}));
            }
        } catch (error) {
            setErrors(prev => ({...prev, fetch: 'Terjadi kesalahan saat memuat data presensi: ' + error.message}));
        }
    };

    // Handle scan QR
    const handleScanQR = () => {
        setIsScanning(true);
        router.push(`/kehadiran/${id_class}/pertemuan/${id_schedule}/scanqr`);
    };

    // Format tanggal
    const formatTanggal = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const dayName = days[date.getDay()];
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        return `${dayName}, ${day} ${month} ${year}`;
    };

    // Toggle presensi (tanpa konfirmasi, langsung update state)
    const togglePresensi = (id) => {
        setMahasiswaData(prevData =>
            prevData.map(item =>
                item.id === id ? { ...item, hadir: !item.hadir } : item
            )
        );
    };

    // Simpan semua presensi
    const handleSaveAll = async () => {
        if (mahasiswaData.length === 0) {
            setAlertMessage('Tidak ada data mahasiswa untuk disimpan');
            setShowErrorDialog(true);
            return;
        }
        const currentAttendedIds = mahasiswaData.filter(m => m.hadir === true).map(m => m.id);
        const toAdd = currentAttendedIds.filter(id => !originalAttendance.includes(id));
        const toDelete = originalAttendance.filter(id => !currentAttendedIds.includes(id));
        const hadirCount = currentAttendedIds.length;
        const totalCount = mahasiswaData.length;
        let message = `Anda akan menyimpan presensi untuk ${hadirCount} mahasiswa hadir dari total ${totalCount} mahasiswa.`;
        if (toAdd.length > 0 || toDelete.length > 0) {
            message += '\n\nPerubahan:';
            if (toAdd.length > 0) message += `\n• Menambah ${toAdd.length} presensi baru`;
            if (toDelete.length > 0) message += `\n• Menghapus ${toDelete.length} presensi`;
        }
        message += '\n\nLanjutkan?';
        setAlertMessage(message);
        setConfirmAction(() => async () => {
            setShowConfirmDialog(false);
            await savePresences();
        });
        setShowConfirmDialog(true);
    };

    const savePresences = async () => {
        setIsSaving(true);
        setErrors(prev => ({...prev, save: null}));
        try {
            const currentAttendedIds = mahasiswaData.filter(m => m.hadir === true).map(m => m.id);
            const toAdd = currentAttendedIds.filter(id => !originalAttendance.includes(id));
            const toDelete = originalAttendance.filter(id => !currentAttendedIds.includes(id));
            if (toDelete.length > 0) {
                await Promise.all(toDelete.map(studentId => deletePresence(id_schedule, studentId)));
            }
            if (currentAttendedIds.length > 0) {
                await sendManualAttendance(id_schedule, currentAttendedIds);
            }
            const response = { status: 'success' };
            if (response.status === 'success') {
                setAlertMessage('Presensi berhasil disimpan!');
                setShowSuccessDialog(true);
                setTimeout(() => { router.back(); }, 1500);
            } else {
                setErrors(prev => ({...prev, save: 'Gagal menyimpan presensi: ' + response.message}));
                setAlertMessage('Gagal menyimpan presensi: ' + response.message);
                setShowErrorDialog(true);
            }
        } catch (error) {
            setErrors(prev => ({...prev, save: 'Terjadi kesalahan saat menyimpan presensi: ' + error.message}));
            setAlertMessage('Terjadi kesalahan saat menyimpan presensi: ' + error.message);
            setShowErrorDialog(true);
        } finally {
            setIsSaving(false);
        }
    };

    const columns = [
        { key: 'nim', label: 'NIM', width: '150px', cellClassName: 'font-medium' },
        { key: 'nama', label: 'Nama Mahasiswa', className: 'text-left', cellClassName: 'text-left font-medium' },
        { key: 'hadir', label: 'Hadir', width: '100px', cellClassName: 'text-center' },
    ];

    const customRender = {
        hadir: (value, item) => {
            return (
                <div className="flex items-center justify-center">
                    <Checkbox
                        checked={item.hadir}
                        onCheckedChange={() => togglePresensi(item.id)}
                    />
                </div>
            );
        },
    };

    // Handle back navigation
    const handleBack = () => {
        router.push('/kehadiran/' + id_class);
    };

    // Handler deteksi lokasi GPS — cukup dapat koordinat, validasi radius di BE
    const handleDeteksiLokasi = () => {
        if (!navigator.geolocation) {
            setLokasiState('denied');
            return;
        }
        setLokasiState('loading');
        setLokasiDetail(null);

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude, accuracy } = pos.coords;
                setLokasiDetail({ lat: latitude, lng: longitude, accuracy: Math.round(accuracy) });
                if (accuracy > 100) {
                    setLokasiState('low_accuracy');
                } else {
                    setLokasiState('ready');
                }
            },
            (err) => {
                if (err.code === err.PERMISSION_DENIED) setLokasiState('denied');
                else if (err.code === err.TIMEOUT) setLokasiState('timeout');
                else setLokasiState('denied');
            },
            { timeout: 10000, enableHighAccuracy: true, maximumAge: 0 }
        );
    };

    // ✅ TAMBAHAN: Handler catat kehadiran dosen (sudah terhubung ke BE)
    const handleCatatKehadiran = async () => {
        if (!lokasiDetail) {
            setAlertMessage('Lokasi belum terdeteksi. Silakan deteksi lokasi terlebih dahulu.');
            setShowErrorDialog(true);
            return;
        }
        setIsCatatLoading(true);
        try {
            const result = await checkInDosenGPS(
                lokasiDetail.lat,
                lokasiDetail.lng,
                id_schedule ? Number(id_schedule) : null
            );
            setAlertMessage(
                `Kehadiran berhasil dicatat!\n\nKampus: ${result.data?.nama_kampus ?? '-'}\nJarak: ${result.data?.distance_meter ?? '-'} meter\nJam Masuk: ${result.data?.jam_masuk ?? '-'}`
            );
            setShowSuccessDialog(true);
            setTimeout(() => router.back(), 2000);
        } catch (error) {
            const msg = error?.message ?? 'Terjadi kesalahan saat mencatat kehadiran.';
            setAlertMessage(msg);
            setShowErrorDialog(true);
        } finally {
            setIsCatatLoading(false);
        }
    };

    // ✅ TAMBAHAN: Komponen section lokasi (render sesuai state)
    const LokasiContent = () => {
        if (lokasiState === 'idle') return (
            <div className="flex flex-col items-center py-10 gap-5">
                <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f3f4f6' }}>
                    <MapPin className="w-10 h-10" style={{ color: '#9ca3af' }} />
                </div>
                <div className="text-center">
                    <p className="text-lg font-semibold" style={{ color: '#374151', fontFamily: 'Urbanist, sans-serif' }}>Lokasi Belum Aktif</p>
                    <p className="text-sm mt-1" style={{ color: '#6b7280', fontFamily: 'Urbanist, sans-serif' }}>
                        Klik tombol di bawah untuk mengizinkan akses GPS<br />dan memverifikasi lokasi Anda saat ini.
                    </p>
                </div>
                <button onClick={handleDeteksiLokasi} className="flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-xl hover:opacity-90 transition shadow-sm" style={{ backgroundColor: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
                    <Navigation className="w-4 h-4" /> Deteksi Lokasi
                </button>
            </div>
        );

        if (lokasiState === 'loading') return (
            <div className="flex flex-col items-center py-10 gap-5">
                <div className="w-24 h-24 rounded-full flex items-center justify-center relative" style={{ backgroundColor: '#E6EEE9' }}>
                    <div className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ backgroundColor: '#015023' }} />
                    <MapPin className="w-10 h-10 relative z-10" style={{ color: '#015023' }} />
                </div>
                <div className="text-center">
                    <p className="text-lg font-semibold flex items-center gap-2 justify-center" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
                        <span className="inline-block w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#015023', borderTopColor: 'transparent' }} />
                        Meminta izin lokasi...
                    </p>
                    <p className="text-sm mt-1" style={{ color: '#6b7280', fontFamily: 'Urbanist, sans-serif' }}>Mohon tunggu, sedang mengambil koordinat lokasi</p>
                </div>
            </div>
        );

        if (lokasiState === 'ready') return (
            <div className="flex flex-col items-center py-10 gap-5">
                <div className="w-24 h-24 rounded-full border-4 flex items-center justify-center" style={{ borderColor: '#015023', backgroundColor: '#f0fdf4' }}>
                    <CheckCircle className="w-12 h-12" style={{ color: '#015023' }} />
                </div>
                <div className="text-center">
                    <p className="text-lg font-bold" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>Lokasi Berhasil Dideteksi</p>
                    <p className="text-sm mt-1" style={{ color: '#374151', fontFamily: 'Urbanist, sans-serif' }}>Koordinat GPS sudah didapat. Klik tombol di bawah untuk mencatat kehadiran.</p>
                </div>
                {lokasiDetail && (
                    <div className="w-full max-w-sm rounded-xl p-4" style={{ backgroundColor: '#E6EEE9' }}>
                        <p className="text-sm font-semibold mb-2" style={{ color: '#015023' }}>Detail Lokasi</p>
                        <p className="text-sm" style={{ color: '#015023' }}>Koordinat: <span className="font-medium">{lokasiDetail.lat.toFixed(6)}, {lokasiDetail.lng.toFixed(6)}</span></p>
                        <p className="text-sm" style={{ color: '#015023' }}>Akurasi GPS: <span className="font-medium">±{lokasiDetail.accuracy} meter</span></p>
                    </div>
                )}
                <button onClick={handleCatatKehadiran} disabled={isCatatLoading} className="flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-xl hover:opacity-90 transition shadow-sm disabled:opacity-50" style={{ backgroundColor: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
                    <Navigation className="w-4 h-4" /> {isCatatLoading ? 'Mencatat...' : 'Catat Kehadiran'}
                </button>
            </div>
        );

        if (lokasiState === 'low_accuracy') return (
            <div className="flex flex-col items-center py-10 gap-5">
                <div className="w-24 h-24 rounded-full border-4 flex items-center justify-center" style={{ borderColor: '#DC2626', backgroundColor: '#fef2f2' }}>
                    <LocateFixed className="w-12 h-12" style={{ color: '#DC2626' }} />
                </div>
                <div className="text-center">
                    <p className="text-lg font-bold" style={{ color: '#DC2626', fontFamily: 'Urbanist, sans-serif' }}>Akurasi Rendah</p>
                    <p className="text-sm mt-1" style={{ color: '#374151', fontFamily: 'Urbanist, sans-serif' }}>Sinyal GPS terlalu lemah untuk memverifikasi lokasi Anda secara akurat.</p>
                    <p className="text-sm font-semibold mt-2" style={{ color: '#DC2626' }}>
                        Akurasi saat ini: <span>±{lokasiDetail?.accuracy} meter</span>{' '}
                        <span style={{ color: '#9ca3af' }}>(dibutuhkan &lt;100m)</span>
                    </p>
                </div>
                <div className="w-full max-w-sm rounded-xl p-4" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                    <p className="text-sm font-semibold mb-2" style={{ color: '#DC2626' }}>Cara Meningkatkan Akurasi</p>
                    <ol className="text-sm space-y-1" style={{ color: '#DC2626' }}>
                        <li>1. Pindah ke area yang lebih terbuka atau dekat jendela</li>
                        <li>2. Tunggu beberapa detik lalu coba lagi agar satelit terkunci</li>
                        <li>3. Hindari area dalam ruangan tertutup saat pertama kali aktivasi</li>
                    </ol>
                </div>
                <button onClick={handleDeteksiLokasi} className="flex items-center gap-2 px-6 py-3 font-semibold rounded-xl border-2 hover:bg-gray-50 transition" style={{ borderColor: '#015023', color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
                    <Navigation className="w-4 h-4" /> Coba Lagi
                </button>
            </div>
        );

        if (lokasiState === 'denied') return (
            <div className="flex flex-col items-center py-10 gap-5">
                <div className="w-24 h-24 rounded-full border-4 flex items-center justify-center" style={{ borderColor: '#DABC4E', backgroundColor: '#fefce8' }}>
                    <AlertTriangle className="w-12 h-12" style={{ color: '#DABC4E' }} />
                </div>
                <div className="text-center">
                    <p className="text-lg font-bold" style={{ color: '#DABC4E', fontFamily: 'Urbanist, sans-serif' }}>Izin Lokasi Ditolak</p>
                    <p className="text-sm mt-1" style={{ color: '#374151', fontFamily: 'Urbanist, sans-serif' }}>Anda menolak izin akses lokasi. Presensi dosen<br />memerlukan akses lokasi.</p>
                </div>
                <div className="w-full max-w-sm rounded-xl p-4" style={{ backgroundColor: '#fefce8', border: '1px solid #fde68a' }}>
                    <p className="text-sm font-semibold mb-2" style={{ color: '#92400e' }}>Cara Mengaktifkan Izin</p>
                    <ol className="text-sm space-y-1" style={{ color: '#92400e' }}>
                        <li>1. Klik ikon gembok/info di bilah alamat browser</li>
                        <li>2. Ubah izin <strong>Lokasi</strong> menjadi <strong>Izinkan</strong></li>
                        <li>3. Refresh halaman lalu klik Aktifkan Lokasi kembali</li>
                    </ol>
                </div>
                <button onClick={handleDeteksiLokasi} className="flex items-center gap-2 px-6 py-3 font-semibold rounded-xl border-2 hover:bg-gray-50 transition" style={{ borderColor: '#015023', color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
                    <Navigation className="w-4 h-4" /> Coba Lagi
                </button>
            </div>
        );

        if (lokasiState === 'timeout') return (
            <div className="flex flex-col items-center py-10 gap-5">
                <div className="w-24 h-24 rounded-full border-4 flex items-center justify-center" style={{ borderColor: '#374151', backgroundColor: '#f9fafb' }}>
                    <WifiOff className="w-12 h-12" style={{ color: '#374151' }} />
                </div>
                <div className="text-center">
                    <p className="text-lg font-bold" style={{ color: '#374151', fontFamily: 'Urbanist, sans-serif' }}>Koneksi Internet Buruk</p>
                    <p className="text-sm mt-1" style={{ color: '#6b7280', fontFamily: 'Urbanist, sans-serif' }}>Permintaan GPS timeout. Koneksi internet Anda tidak<br />stabil atau sinyal terlalu lemah.</p>
                </div>
                <div className="w-full max-w-sm rounded-xl p-4" style={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb' }}>
                    <p className="text-sm font-semibold mb-2" style={{ color: '#374151' }}>Saran Perbaikan</p>
                    <ol className="text-sm space-y-1" style={{ color: '#374151' }}>
                        <li>1. Periksa koneksi Wi-Fi atau data seluler Anda</li>
                        <li>2. Pindah ke area dengan sinyal yang lebih kuat</li>
                        <li>3. Jika menggunakan Wi-Fi kampus, pastikan sudah login portal</li>
                    </ol>
                </div>
                <button onClick={handleDeteksiLokasi} className="flex items-center gap-2 px-6 py-3 font-semibold rounded-xl border-2 hover:bg-gray-50 transition" style={{ borderColor: '#015023', color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
                    <Navigation className="w-4 h-4" /> Coba Lagi
                </button>
            </div>
        );

        return null;
    };

    // ── Guard renders (ORIGINAL — tidak diubah) ───────────────────────────────
    // Loading permission check
    if (loadingPermission) {
        return <LoadingEffect message="Memeriksa izin akses..." />;
    } else if (permissionGranted === false) {
        return (
            <div className="min-h-screen bg-brand-light-sage">
                <Navbar />
                <div className="container mx-auto px-4 py-8 max-w-7xl">
                    <ErrorMessageBoxWithButton
                        message={'Anda tidak memiliki izin untuk mengakses kelas atau jadwal ini.' + `\n\nAkan dialihkan kembali dalam ${countdown} detik.`}
                        action={handleBack}
                        btntext={countdown > 0 ? `Kembali (${countdown})` : 'Kembali'}
                    />
                </div>
            </div>
        );
    } else if (errors.permission) {
        return (
            <div className="min-h-screen bg-brand-light-sage">
                <Navbar />
                <div className="container mx-auto px-4 py-8 max-w-7xl">
                    <ErrorMessageBoxWithButton
                        message={errors.permission}
                        action={checkPermission}
                    />
                </div>
            </div>
        );
    } else if (isLoading) {
        return <LoadingEffect message="Memuat data mahasiswa..." />;
    } else if (errors.fetch) {
        return (
            <div className="min-h-screen bg-brand-light-sage">
                <Navbar />
                <div className="container mx-auto px-4 py-8 max-w-7xl">
                    <ErrorMessageBoxWithButton
                        message={errors.fetch}
                        action={fetchAllData}
                        back={true}
                        actionback={handleBack}
                    />
                </div>
            </div>
        );
    }

    // ── Main render (ORIGINAL header + tabel + actions, ✅ lokasi ditambahkan di tengah) ──
    return (
        <div className="min-h-screen bg-brand-light-sage flex flex-col">
            <Navbar />
            <div className="container mx-auto px-4 py-8 max-w-7xl flex-grow">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 mb-6 font-medium hover:opacity-80 transition"
                    style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}
                >
                    <ArrowLeft className="w-5 h-5" />
                    Kembali ke Detail Presensi
                </button>

                {/* Header — ORIGINAL */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6" style={{ borderRadius: '16px' }}>
                    <div className="flex items-start gap-4">
                        <div className="p-4 rounded-xl" style={{ backgroundColor: '#015023' }}>
                            <CalendarDays className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
                                Input Presensi - Pertemuan {scheduleInfo.pertemuanke}
                            </h1>
                            <p className="mt-1 text-lg" style={{ color: '#015023', opacity: 0.75, fontFamily: 'Urbanist, sans-serif' }}>
                                {classInfo.code_subject} - {classInfo.name_subject}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-3">
                                <span className="px-3 py-1 rounded-lg font-medium" style={{ backgroundColor: '#f3f4f6', color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
                                    Kelas: {classInfo.code_class}
                                </span>
                                <span className="px-3 py-1 rounded-lg font-medium" style={{ backgroundColor: '#DABC4E', color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
                                    {formatTanggal(scheduleInfo.date)}
                                </span>
                                {classInfo?.dosen && (
                                    <span className="px-3 py-1 rounded-lg font-medium" style={{ backgroundColor: '#DABC4E', color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
                                        Dosen: {classInfo.dosen}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Summary — ORIGINAL */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
                        <div>
                            <p className="text-sm font-medium" style={{ color: '#015023', opacity: 0.6, fontFamily: 'Urbanist, sans-serif' }}>Total Mahasiswa</p>
                            <p className="text-2xl font-bold" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>{mahasiswaData.length} Mahasiswa</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium" style={{ color: '#015023', opacity: 0.6, fontFamily: 'Urbanist, sans-serif' }}>Hadir</p>
                            <p className="text-2xl font-bold" style={{ color: '#16874B', fontFamily: 'Urbanist, sans-serif' }}>{mahasiswaData.filter(m => m.hadir === true).length} Mahasiswa</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium" style={{ color: '#015023', opacity: 0.6, fontFamily: 'Urbanist, sans-serif' }}>Tidak Hadir</p>
                            <p className="text-2xl font-bold" style={{ color: '#BE0414', fontFamily: 'Urbanist, sans-serif' }}>{mahasiswaData.filter(m => m.hadir === false).length} Mahasiswa</p>
                        </div>
                    </div>
                </div>

                {/* ✅ TAMBAHAN: Section Presensi Berbasis Lokasi */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6" style={{ borderRadius: '16px' }}>
                    {/* Header hijau */}
                    <div className="flex items-center gap-3 px-6 py-4" style={{ backgroundColor: '#015023' }}>
                        <Navigation className="w-5 h-5" style={{ color: '#DABC4E' }} />
                        <div>
                            <p className="font-semibold text-white" style={{ fontFamily: 'Urbanist, sans-serif' }}>Presensi Berbasis Lokasi</p>
                            <p className="text-xs" style={{ color: '#DABC4E', fontFamily: 'Urbanist, sans-serif' }}>Aktifkan lokasi untuk melakukan presensi</p>
                        </div>
                    </div>
                    <div className="px-6 pb-6">
                        {/* Info lokasi mengajar */}
                        <div className="flex items-start gap-3 mt-5 p-4 rounded-xl" style={{ backgroundColor: '#E6EEE9' }}>
                            <div className="p-2 rounded-lg shrink-0" style={{ backgroundColor: '#015023' }}>
                                <MapPin className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold mb-0.5" style={{ color: '#015023', opacity: 0.6, fontFamily: 'Urbanist, sans-serif' }}>Lokasi Mengajar</p>
                                <p className="font-bold" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>{classInfo.name_subject} — {classInfo.code_class}</p>
                                <p className="text-xs mt-0.5" style={{ color: '#015023', opacity: 0.7, fontFamily: 'Urbanist, sans-serif' }}>
                                    Validasi radius akan dicek otomatis oleh sistem saat kamu catat kehadiran
                                </p>
                            </div>
                        </div>
                        {/* Konten dinamis sesuai state */}
                        <LokasiContent />
                    </div>
                </div>

                {/* ✅ TAMBAHAN: Keterangan lokasi */}
                <div className="bg-white rounded-2xl shadow-lg p-5 mb-6" style={{ borderRadius: '16px' }}>
                    <p className="font-semibold mb-2" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>Keterangan</p>
                    <ul className="text-sm space-y-1" style={{ color: '#6b7280', fontFamily: 'Urbanist, sans-serif' }}>
                        <li>· Presensi dilakukan berdasarkan verifikasi lokasi GPS</li>
                        <li>· Pastikan Anda berada di dalam area kampus sebelum mengaktifkan lokasi</li>
                        <li>· Izinkan akses lokasi saat browser meminta konfirmasi</li>
                        <li>· Validasi radius akan dicek secara otomatis oleh sistem</li>
                    </ul>
                </div>

                {/* Tabel Mahasiswa — ORIGINAL */}
                {mahasiswaData.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6" style={{ borderRadius: '16px' }}>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-bold" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>Daftar Mahasiswa</h2>
                                <p className="text-sm mt-1" style={{ color: '#6b7280', fontFamily: 'Urbanist, sans-serif' }}>Centang checkbox untuk menandai mahasiswa hadir</p>
                            </div>
                            <button
                                onClick={handleScanQR}
                                disabled={isScanning}
                                className="flex items-center gap-2 text-white px-6 py-3 transition shadow-sm hover:opacity-90 font-semibold disabled:opacity-50"
                                style={{ backgroundColor: '#015023', borderRadius: '12px', fontFamily: 'Urbanist, sans-serif' }}
                            >
                                <QrCode className="w-5 h-5" />
                                {isScanning ? 'Memulai Scanner...' : 'Mulai Scan QR'}
                            </button>
                        </div>
                        <DataTable
                            columns={columns}
                            data={mahasiswaData}
                            actions={[]}
                            pagination={false}
                            customRender={customRender}
                        />
                    </div>
                )}

                {/* Actions — ORIGINAL */}
                {mahasiswaData.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg p-6" style={{ borderRadius: '16px' }}>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="text-sm" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
                                <p className="font-medium">Keterangan:</p>
                                <p className="text-gray-600 mt-1">
                                    • Centang checkbox untuk menandai mahasiswa hadir<br />
                                    • Gunakan tombol "Mulai Scan QR" untuk presensi otomatis via QR Code
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <WarningButton onClick={handleBack} disabled={isSaving}>Batal</WarningButton>
                                <PrimaryButton onClick={handleSaveAll} disabled={isSaving} className="gap-2">
                                    <Save className="w-4 h-4" />
                                    {isSaving ? 'Menyimpan...' : 'Simpan Presensi'}
                                </PrimaryButton>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Alert Dialogs — ORIGINAL */}
            <AlertConfirmationDialog
                open={showConfirmDialog}
                onOpenChange={setShowConfirmDialog}
                title="Konfirmasi"
                description={alertMessage}
                confirmText="Ya, Lanjutkan"
                cancelText="Batal"
                onConfirm={confirmAction}
            />
            <AlertSuccessDialog
                open={showSuccessDialog}
                onOpenChange={setShowSuccessDialog}
                title="Berhasil"
                description={alertMessage}
                closeText="Tutup"
            />
            <AlertErrorDialog
                open={showErrorDialog}
                onOpenChange={setShowErrorDialog}
                title="Gagal"
                description={alertMessage}
                closeText="Tutup"
            />

            <Footer />
        </div>
    );
}