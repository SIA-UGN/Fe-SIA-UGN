'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getClassSchedules, checkInGPS, getLecturerAttendedSchedules } from '@/lib/attendanceApi';
import { AlertSuccessDialog, AlertErrorDialog } from '@/components/ui/alert-dialog';
import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import LoadingEffect from '@/components/ui/loading-effect';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import {
    ArrowLeft, CalendarDays, MapPin, Clock, Navigation,
    CheckCircle2, XCircle, Loader2, Building2, AlertTriangle,
    WifiOff, Settings
} from 'lucide-react';

const GPS_STATUS = {
    IDLE: 'idle',
    LOADING: 'loading',
    READY: 'ready',           // Koordinat OK, siap kirim ke BE
    SAVING: 'saving',         // Sedang kirim ke BE
    SUCCESS: 'success',       // BE konfirmasi dalam radius
    FAILED: 'failed',         // BE konfirmasi luar radius
    LOW_ACCURACY: 'low_accuracy',
    PERMISSION_DENIED: 'permission_denied',
    TIMEOUT: 'timeout',
    ERROR: 'error',
};

export default function InputPresensiGPSPage() {
    const router = useRouter();
    const params = useParams();
    const id_schedule = params.pertemuan;
    const id_class = params.kode;

    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [scheduleInfo, setScheduleInfo] = useState(null);
    const [classInfo, setClassInfo] = useState(null);
    const [alreadyAttended, setAlreadyAttended] = useState(false);  // dosen sudah hadir utk pertemuan ini

    const [gpsStatus, setGpsStatus] = useState(GPS_STATUS.IDLE);
    const [gpsCoords, setGpsCoords] = useState(null);   // { lat, lng, accuracy }
    const [gpsResult, setGpsResult] = useState(null);   // response.data dari BE
    const [distanceMeter, setDistanceMeter] = useState(null);
    const [failReason, setFailReason] = useState(null);   // pesan asli dari BE saat gagal

    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [alertMsg, setAlertMsg] = useState('');

    useEffect(() => { if (id_class) fetchScheduleInfo(); }, [id_class]);

    const fetchScheduleInfo = async () => {
        setIsLoading(true);
        setFetchError(null);
        try {
            const res = await getClassSchedules(id_class);
            if (res.status === 'success') {
                setClassInfo(res.data.class_info);
                const found = res.data.schedules?.find(
                    s => String(s.id_schedule) === String(id_schedule)
                );
                setScheduleInfo(found || null);
                // Cek apakah dosen sudah hadir untuk pertemuan ini → tampilkan status, bukan minta check-in ulang
                try {
                    const attended = await getLecturerAttendedSchedules([Number(id_schedule)]);
                    if (Array.isArray(attended) && attended.map(Number).includes(Number(id_schedule))) {
                        setAlreadyAttended(true);
                    }
                } catch { /* abaikan — fallback ke flow check-in normal */ }
            } else {
                setFetchError(res.message || 'Gagal memuat data jadwal.');
            }
        } catch (err) {
            setFetchError(err?.message || 'Terjadi kesalahan saat memuat data.');
        } finally {
            setIsLoading(false);
        }
    };

    const formatJam = (t) => (t ? t.substring(0, 5) : '-');
    const formatHari = (dateStr) => {
        if (!dateStr) return '-';
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        return days[new Date(dateStr).getDay()];
    };



    const handleDeteksiLokasi = () => {
        setGpsStatus(GPS_STATUS.LOADING);
        setGpsCoords(null);
        setGpsResult(null);
        setDistanceMeter(null);



        if (!navigator.geolocation) {
            setGpsStatus(GPS_STATUS.ERROR);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude: lat, longitude: lng, accuracy } = pos.coords;

                // Cek akurasi: toleransi 500m (laptop pakai WiFi positioning, bukan GPS chip)
                if (accuracy > 500) {
                    setGpsStatus(GPS_STATUS.LOW_ACCURACY);
                    setGpsCoords({ lat, lng, accuracy });
                    return;
                }

                setGpsCoords({ lat, lng, accuracy });
                setGpsStatus(GPS_STATUS.SAVING);

                try {
                    const res = await checkInGPS(lat, lng, Number(id_schedule));
                    if (res.status === 'success') {
                        setGpsResult(res.data);
                        setDistanceMeter(res.data?.distance_meter ?? null);
                        setFailReason(null);
                        setGpsStatus(GPS_STATUS.SUCCESS);
                    } else {
                        setDistanceMeter(res.data?.distance_meter ?? null);
                        setFailReason(res.message ?? null);
                        setGpsStatus(GPS_STATUS.FAILED);
                    }
                } catch (err) {
                    setDistanceMeter(err?.data?.distance_meter ?? null);
                    setFailReason(err?.message ?? err?.userMessage ?? err?.data?.message ?? null);
                    setGpsStatus(GPS_STATUS.FAILED);
                }
            },
            (err) => {
                if (err.code === 1) setGpsStatus(GPS_STATUS.PERMISSION_DENIED);
                else if (err.code === 3) setGpsStatus(GPS_STATUS.TIMEOUT);
                else setGpsStatus(GPS_STATUS.ERROR);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleCatatKehadiran = () => {
        setAlertMsg(
            `Presensi berhasil dicatat!\n\nKampus: ${gpsResult?.nama_kampus || '-'}\nJarak: ${gpsResult?.distance_meter ? Math.round(gpsResult.distance_meter) + ' meter' : '-'}`
        );
        setShowSuccess(true);
    };

    const handleSuccessClose = () => {
        setShowSuccess(false);
        router.push(`/kehadiran/${id_class}`);
    };

    const handleBack = () => router.push(`/kehadiran/${id_class}`);

    if (isLoading) return <LoadingEffect message="Memuat data jadwal..." />;
    if (fetchError) return (
        <div className="min-h-screen bg-brand-light-sage">
            <Navbar />
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <ErrorMessageBoxWithButton message={fetchError} action={fetchScheduleInfo} back actionback={handleBack} />
            </div>
        </div>
    );

    const hari = scheduleInfo ? formatHari(scheduleInfo.tanggal) : '-';
    const jamMulai = scheduleInfo ? formatJam(scheduleInfo.jam_mulai) : '-';
    const jamSelesai = scheduleInfo ? formatJam(scheduleInfo.jam_selesai) : '-';
    const gedung = scheduleInfo?.gedung || classInfo?.gedung || '-';
    const ruang = scheduleInfo?.ruang || classInfo?.ruang || '-';
    const lokasiLabel = (gedung !== '-' || ruang !== '-') ? `${gedung} — ${ruang}` : 'Informasi lokasi tidak tersedia';
    const pertemuanKe = scheduleInfo?.pertemuan_ke ?? id_schedule;

    // ── Render GPS Status Area ──────────────────────────────────
    const renderGpsArea = () => {
        // Sudah hadir → tampilkan status, jangan minta check-in ulang (BE akan tolak 409)
        if (alreadyAttended && gpsStatus !== GPS_STATUS.SUCCESS) {
            return (
                <>
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#dcfce7', border: '2px solid #86efac' }}>
                        <CheckCircle2 className="w-10 h-10" style={{ color: '#16a34a' }} />
                    </div>
                    <p className="text-lg font-bold mb-1" style={{ color: '#16a34a', fontFamily: 'Urbanist, sans-serif' }}>Anda Sudah Hadir</p>
                    <p className="text-sm text-center mb-6 max-w-xs" style={{ color: '#6b7280' }}>
                        Presensi untuk pertemuan ini sudah tercatat. Tidak perlu melakukan check-in ulang.
                    </p>
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 px-8 py-3 text-white font-semibold rounded-xl transition hover:opacity-90 shadow"
                        style={{ backgroundColor: '#015023', fontFamily: 'Urbanist, sans-serif' }}
                    >
                        <ArrowLeft className="w-5 h-5" /> Kembali Ke Daftar Pertemuan
                    </button>
                </>
            );
        }
        switch (gpsStatus) {
            case GPS_STATUS.IDLE:
                return (
                    <>
                        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#f3f4f6' }}>
                            <MapPin className="w-9 h-9" style={{ color: '#9ca3af' }} />
                        </div>
                        <p className="text-lg font-bold mb-1" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>Lokasi Belum Aktif</p>
                        <p className="text-sm text-center mb-6 max-w-xs" style={{ color: '#6b7280' }}>
                            Klik tombol di bawah untuk mengaktifkan akses GPS<br />dan memverifikasi lokasi Anda saat ini
                        </p>
                        <BtnDeteksi onClick={handleDeteksiLokasi} />
                    </>
                );

            case GPS_STATUS.LOADING:
            case GPS_STATUS.SAVING:
                return (
                    <>
                        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#e8f5e9' }}>
                            <Loader2 className="w-9 h-9 animate-spin" style={{ color: '#015023' }} />
                        </div>
                        <p className="text-lg font-bold mb-1" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
                            {gpsStatus === GPS_STATUS.SAVING ? 'Memverifikasi Lokasi...' : 'Mendeteksi Lokasi...'}
                        </p>
                        <p className="text-sm" style={{ color: '#6b7280' }}>Mohon tunggu sebentar</p>
                    </>
                );

            case GPS_STATUS.SUCCESS:
                return (
                    <>
                        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#dcfce7', border: '2px solid #86efac' }}>
                            <CheckCircle2 className="w-10 h-10" style={{ color: '#16a34a' }} />
                        </div>
                        <p className="text-lg font-bold mb-1" style={{ color: '#16a34a', fontFamily: 'Urbanist, sans-serif' }}>Lokasi Terverifikasi!</p>
                        <p className="text-sm mb-1" style={{ color: '#374151' }}>
                            Anda berada dalam jangkauan <strong>{gpsResult?.nama_kampus || gedung}</strong>
                        </p>
                        {distanceMeter !== null && (
                            <p className="text-sm font-semibold mb-5" style={{ color: '#16a34a' }}>
                                Jarak dari gedung: {Math.round(distanceMeter)} meter
                            </p>
                        )}
                        {/* Detail Lokasi card */}
                        <div className="w-full rounded-xl p-4 mb-6 text-left text-sm" style={{ backgroundColor: '#f0faf4', border: '1px solid #c6e8d4' }}>
                            {gpsCoords && (
                                <p style={{ color: '#015023' }}>Koordinat: <span className="font-medium">{gpsCoords.lat.toFixed(6)}, {gpsCoords.lng.toFixed(6)}</span></p>
                            )}
                            {gpsCoords?.accuracy && (
                                <p className="mt-1" style={{ color: '#16a34a' }}>Akurasi GPS: <span className="font-semibold">±{Math.round(gpsCoords.accuracy)} meter</span></p>
                            )}
                            <p className="mt-1" style={{ color: '#16a34a' }}>Status: <span className="font-semibold">Dalam radius gedung ✓</span></p>
                        </div>
                        <button
                            onClick={handleCatatKehadiran}
                            className="flex items-center gap-2 px-8 py-3 text-white font-semibold rounded-xl transition hover:opacity-90 shadow"
                            style={{ backgroundColor: '#015023', fontFamily: 'Urbanist, sans-serif' }}
                        >
                            <Navigation className="w-5 h-5" />
                            Catat Kehadiran
                        </button>
                    </>
                );

            case GPS_STATUS.FAILED: {
                const isRadiusIssue = !!failReason && /radius|lokasi|kampus/i.test(failReason);
                return (
                    <>
                        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#fee2e2', border: '2px solid #fca5a5' }}>
                            <XCircle className="w-10 h-10" style={{ color: '#dc2626' }} />
                        </div>
                        <p className="text-lg font-bold mb-1" style={{ color: '#dc2626', fontFamily: 'Urbanist, sans-serif' }}>
                            {isRadiusIssue ? 'Lokasi Tidak Sesuai' : 'Presensi Gagal'}
                        </p>
                        {distanceMeter !== null && (
                            <p className="text-sm font-semibold mb-2" style={{ color: '#dc2626' }}>
                                Jarak dari titik kampus: {Math.round(distanceMeter)} meter
                            </p>
                        )}
                        <div className="w-full rounded-xl p-4 mb-6 text-left text-sm" style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5' }}>
                            <p className="font-semibold mb-1" style={{ color: '#dc2626' }}>Presensi Tidak Dapat Dicatat</p>
                            <p style={{ color: '#7f1d1d' }}>
                                {failReason || 'Terjadi kendala saat mencatat presensi. Silakan coba lagi.'}
                            </p>
                        </div>
                        <BtnCobaLagi onClick={handleDeteksiLokasi} />
                    </>
                );
            }

            case GPS_STATUS.LOW_ACCURACY:
                return (
                    <>
                        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#fee2e2', border: '2px solid #fca5a5' }}>
                            <Settings className="w-10 h-10" style={{ color: '#dc2626' }} />
                        </div>
                        <p className="text-lg font-bold mb-1" style={{ color: '#dc2626', fontFamily: 'Urbanist, sans-serif' }}>Akurasi Rendah</p>
                        <p className="text-sm text-center mb-1" style={{ color: '#374151' }}>Sinyal GPS terlalu lemah untuk memverifikasi lokasi Anda secara akurat.</p>
                        {gpsCoords?.accuracy && (
                            <p className="text-sm font-semibold mb-5" style={{ color: '#dc2626' }}>
                                Akurasi saat ini: <span>±{Math.round(gpsCoords.accuracy)} meter</span>{' '}
                                <span style={{ color: '#9ca3af', fontWeight: 400 }}>(dibutuhkan &lt;100m)</span>
                            </p>
                        )}
                        <div className="w-full rounded-xl p-4 mb-6 text-left text-sm" style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5' }}>
                            <p className="font-semibold mb-2" style={{ color: '#dc2626' }}>Cara Meningkatkan Akurasi</p>
                            <ol className="list-decimal list-inside space-y-1" style={{ color: '#7f1d1d' }}>
                                <li>Pindah ke area yang lebih terbuka atau dekat jendela</li>
                                <li>Tunggu beberapa detik lalu coba lagi agar satelit terkunci</li>
                                <li>Hindari area dalam ruangan tertutup saat pertama kali aktivasi</li>
                            </ol>
                        </div>
                        <BtnCobaLagi onClick={handleDeteksiLokasi} />
                    </>
                );

            case GPS_STATUS.PERMISSION_DENIED:
                return (
                    <>
                        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#fefce8', border: '2px solid #fde68a' }}>
                            <AlertTriangle className="w-10 h-10" style={{ color: '#ca8a04' }} />
                        </div>
                        <p className="text-lg font-bold mb-1" style={{ color: '#ca8a04', fontFamily: 'Urbanist, sans-serif' }}>Izin Lokasi Ditolak</p>
                        <p className="text-sm text-center mb-5" style={{ color: '#374151' }}>
                            Anda menolak izin akses lokasi. Presensi dosen<br />memerlukan akses lokasi.
                        </p>
                        <div className="w-full rounded-xl p-4 mb-6 text-left text-sm" style={{ backgroundColor: '#fefce8', border: '1px solid #fde68a' }}>
                            <p className="font-semibold mb-2" style={{ color: '#ca8a04' }}>Cara Mengaktifkan Izin</p>
                            <ol className="list-decimal list-inside space-y-1" style={{ color: '#713f12' }}>
                                <li>Klik ikon gembok/info di bilah alamat browser</li>
                                <li>Ubah izin <strong>Lokasi</strong> menjadi <strong>Izinkan</strong></li>
                                <li>Refresh halaman lalu klik Aktifkan Lokasi kembali</li>
                            </ol>
                        </div>
                        <BtnCobaLagi onClick={handleDeteksiLokasi} />
                    </>
                );

            case GPS_STATUS.TIMEOUT:
                return (
                    <>
                        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#f3f4f6', border: '2px solid #d1d5db' }}>
                            <WifiOff className="w-10 h-10" style={{ color: '#374151' }} />
                        </div>
                        <p className="text-lg font-bold mb-1" style={{ color: '#374151', fontFamily: 'Urbanist, sans-serif' }}>Koneksi Internet Buruk</p>
                        <p className="text-sm text-center mb-5" style={{ color: '#6b7280' }}>
                            Permintaan GPS timeout. Koneksi internet Anda tidak<br />stabil atau sinyal terlalu lemah.
                        </p>
                        <div className="w-full rounded-xl p-4 mb-6 text-left text-sm" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
                            <p className="font-semibold mb-2" style={{ color: '#374151' }}>Saran Perbaikan</p>
                            <ol className="list-decimal list-inside space-y-1" style={{ color: '#4b5563' }}>
                                <li>Periksa koneksi Wi-Fi atau data seluler Anda</li>
                                <li>Pindah ke area dengan sinyal yang lebih kuat</li>
                                <li>Jika menggunakan Wi-Fi kampus, pastikan sudah login portal</li>
                            </ol>
                        </div>
                        <BtnCobaLagi onClick={handleDeteksiLokasi} />
                    </>
                );

            default: // ERROR
                return (
                    <>
                        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#fef3c7' }}>
                            <AlertTriangle className="w-10 h-10" style={{ color: '#d97706' }} />
                        </div>
                        <p className="text-lg font-bold mb-1" style={{ color: '#d97706', fontFamily: 'Urbanist, sans-serif' }}>GPS Tidak Tersedia</p>
                        <p className="text-sm text-center mb-6" style={{ color: '#6b7280' }}>Browser Anda tidak mendukung GPS atau terjadi kesalahan tak terduga.</p>
                        <BtnCobaLagi onClick={handleDeteksiLokasi} />
                    </>
                );
        }
    };

    return (
        <div className="min-h-screen bg-brand-light-sage flex flex-col">
            <Navbar />
            <div className="container mx-auto px-4 py-6 max-w-3xl flex-grow">

                {/* Back */}
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 mb-5 font-medium hover:opacity-75 transition text-sm"
                    style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali Ke Detail Presensi
                </button>

                {/* Header Card */}
                <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl shrink-0" style={{ backgroundColor: '#015023' }}>
                            <CalendarDays className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
                                Input Presensi - Pertemuan {pertemuanKe}
                            </h1>
                            <p className="mt-0.5 text-base" style={{ color: '#015023', opacity: 0.75, fontFamily: 'Urbanist, sans-serif' }}>
                                {classInfo?.code_subject || '-'} - {classInfo?.name_subject || '-'}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-4 text-sm font-medium" style={{ color: '#015023' }}>
                                <span className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" />
                                    {hari}: {jamMulai} - {jamSelesai}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4" />
                                    {lokasiLabel}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* GPS Section */}
                <div className="rounded-2xl shadow-md overflow-hidden mb-4">
                    <div className="px-6 py-4" style={{ backgroundColor: '#015023' }}>
                        <div className="flex items-center gap-2">
                            <Navigation className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold text-base" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                                Presensi Berbasis Lokasi
                            </span>
                        </div>
                        <p className="text-white text-xs mt-0.5 opacity-75">Verifikasi lokasi diperlukan untuk mencatat presensi</p>
                    </div>

                    <div className="bg-white px-6 py-6">
                        {/* Lokasi Mengajar Info */}
                        <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: '#f0faf4', border: '1px solid #c6e8d4' }}>
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg shrink-0" style={{ backgroundColor: '#015023' }}>
                                    <Building2 className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#015023', opacity: 0.6 }}>Lokasi Mengajar</p>
                                    <p className="font-bold text-base" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>{lokasiLabel}</p>
                                    <p className="text-sm mt-0.5" style={{ color: '#015023', opacity: 0.7 }}>
                                        Radius valid <strong>150 meter</strong> dari gedung
                                    </p>
                                    {gpsCoords && gpsStatus !== GPS_STATUS.SUCCESS && (
                                        <p className="text-xs mt-1" style={{ color: '#015023', opacity: 0.55 }}>
                                            Koordinat: {gpsCoords.lat.toFixed(6)}, {gpsCoords.lng.toFixed(6)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* GPS Status */}
                        <div className="flex flex-col items-center justify-center py-6">
                            {renderGpsArea()}
                        </div>
                    </div>
                </div>

                {/* Keterangan (hanya saat IDLE) */}
                {gpsStatus === GPS_STATUS.IDLE && (
                    <div className="bg-white rounded-2xl shadow-md px-6 py-5 mb-4">
                        <p className="font-semibold mb-3" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>Keterangan</p>
                        <ul className="space-y-1.5 text-sm" style={{ color: '#374151' }}>
                            <li>• Presensi dilakukan berdasarkan verifikasi lokasi</li>
                            <li>• Pastikan Anda berada di dalam gedung sebelum mengaktifkan lokasi</li>
                            <li>• Izinkan akses lokasi saat browser meminta konfirmasi</li>
                            <li>• Radius valid adalah <strong>150 meter</strong> dari tempat mengajar</li>
                        </ul>
                    </div>
                )}

                {/* Batal */}
                <div className="bg-white rounded-2xl shadow-md px-6 py-4 flex justify-end">
                    <button
                        onClick={handleBack}
                        className="px-6 py-2.5 font-semibold rounded-xl transition hover:opacity-90"
                        style={{ backgroundColor: '#dc2626', color: 'white', fontFamily: 'Urbanist, sans-serif' }}
                    >
                        Batal
                    </button>
                </div>

            </div>

            <AlertSuccessDialog
                open={showSuccess}
                onOpenChange={(o) => { if (!o) handleSuccessClose(); }}
                title="Presensi Berhasil"
                description={alertMsg}
                closeText="OK"
            />
            <AlertErrorDialog
                open={showError}
                onOpenChange={setShowError}
                title="Gagal"
                description={alertMsg}
                closeText="Tutup"
            />
            <Footer />
        </div>
    );
}

// ── Shared Buttons ──────────────────────────────────────────
function BtnDeteksi({ onClick }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 px-8 py-3 text-white font-semibold rounded-xl transition hover:opacity-90 shadow"
            style={{ backgroundColor: '#015023', fontFamily: 'Urbanist, sans-serif' }}
        >
            <Navigation className="w-5 h-5" />
            Deteksi Lokasi
        </button>
    );
}

function BtnCobaLagi({ onClick }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 px-8 py-3 font-semibold rounded-xl transition hover:bg-gray-50"
            style={{ border: '1.5px solid #015023', color: '#015023', fontFamily: 'Urbanist, sans-serif' }}
        >
            <Navigation className="w-5 h-5" />
            Coba Lagi
        </button>
    );
}
