'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/ui/navigation-menu';
import DataTable from '@/components/ui/table';
import { ArrowLeft, QrCode, CheckCircle, Clock, Users } from 'lucide-react';
import { PrimaryButton, OutlineButton } from '@/components/ui/button';
import { QRCodeCanvas } from 'qrcode.react';
import LoadingEffect from '@/components/ui/loading-effect';
import { AlertConfirmationRedDialog, AlertSuccessDialog, AlertErrorDialog } from '@/components/ui/alert-dialog';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import { openQRSession, getPresencesBySchedule, closeAttendanceSession, getClassDetail, getActiveQR } from '@/lib/attendanceApi';
import { getPermissionForAScheduleInAClass } from '@/lib/permissionApi';
import { getEcho, disconnectEcho } from '@/lib/echo';

export default function ScanQRPage() {
    const router = useRouter();
    const params = useParams();
    const id_schedule = params.pertemuan;
    const id_class = params.kode;

    // States
    const [qrCode, setQrCode] = useState('');
    const [scannedStudents, setScannedStudents] = useState([]);
    const [allStudents, setAllStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [echo, setEcho] = useState(null);
    const [scanSuccessMessages, setScanSuccessMessages] = useState([]);
    const [permissionChecked, setPermissionChecked] = useState(false);
    const [permissionGranted, setPermissionGranted] = useState(null);
    const [loadingPermission, setLoadingPermission] = useState(true);
    const [countdown, setCountdown] = useState(5);
    const [successCountdown, setSuccessCountdown] = useState(3);
    const [errors, setErrors] = useState({});

    // Class and schedule info
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

    // Alert states
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [confirmAction, setConfirmAction] = useState(null);

    // Check permission on mount
    useEffect(() => {
        if (id_class) {
            checkPermission();
        }
    }, [id_class]);

    // Initialize QR session after permission is granted
    useEffect(() => {
        if (permissionChecked && permissionGranted) {
            initializeQRSession();
        }
    }, [permissionChecked, permissionGranted]);

    // Countdown redirect effect when permission is denied
    useEffect(() => {
        let timer;
        if (permissionGranted === false) {
            if (countdown > 0) {
                timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
            } else {
                router.push(`/kehadiran/${id_class}/pertemuan/${id_schedule}`);
            }
        }
        return () => clearTimeout(timer);
    }, [permissionGranted, countdown]);

    // Countdown redirect effect when close session success
    useEffect(() => {
        let timer;
        if (showSuccessDialog) {
            if (successCountdown > 0) {
                timer = setTimeout(() => setSuccessCountdown(prev => prev - 1), 1000);
            } else {
                handleBack();
            }
        }
        return () => clearTimeout(timer);
    }, [showSuccessDialog, successCountdown]);

    // Cleanup on unmount
    useEffect(() => {

        if (!id_schedule) return;

        return () => {
            // Cleanup: Sesi auto close dan disconnect WebSocket.
            const cleanup = async () => {
                console.log('[Cleanup] Component unmounting, starting cleanup...');
                
                // 1. Close QR session 
                if (id_schedule) {
                    try {
                        console.log('[Cleanup] Attempting to close QR session:', id_schedule);
                        await closeAttendanceSession(id_schedule);
                        console.log('[Cleanup] ✅ Session closed successfully');
                    } catch (error) {
                        console.log('[Cleanup] ⚠️ Close session failed (ignored):', error.message || error);
                    }
                }
                
                // 2. Disconnect WebSocket (always try)
                try {
                    if (echo) {
                        console.log('[Cleanup] Disconnecting WebSocket...');
                        echo.leave(`attendance.${id_schedule}`);
                        disconnectEcho();
                        console.log('[Cleanup] ✅ WebSocket disconnected');
                    }
                } catch (error) {
                    console.log('[Cleanup] ⚠️ WebSocket disconnect failed (ignored):', error.message || error);
                }
            };
            cleanup();
        };
    }, [id_schedule, echo]);

    // Monitor QR code changes
    useEffect(() => {
        if (qrCode) {
            console.log('[QR State] QR Code updated to:', qrCode);
        }
    }, [qrCode]);

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
            setErrors(prev => ({...prev, permission: 'Gagal memeriksa izin akses: ' + (error.message || 'Terjadi kesalahan')}));
        } finally {
            setLoadingPermission(false);
        }
    };

    const initializeQRSession = async () => {
        try {
            setLoading(true);
            setErrors(prev => ({...prev, fetch: null}));

            console.log('[QR Init] Initializing QR session with:', { id_schedule, id_class });

            // Validate params
            if (!id_schedule || !id_class) {
                throw new Error('ID Schedule atau ID Class tidak ditemukan!');
            }

            // 1. Fetch class detail to get total students and class info
            console.log('[QR Init] Fetching class detail...');
            const classDetailResponse = await getClassDetail(id_class);
            console.log('[QR Init] Class detail response:', classDetailResponse);

            if (classDetailResponse.status === 'success') {
                setAllStudents(classDetailResponse.data.students || []);
                setClassInfo(classDetailResponse.data.class_info || {
                    code_subject: '-',
                    name_subject: '-',
                    code_class: '-',
                    dosen: '-'
                });
            } else {
                setErrors(prev => ({...prev, fetch: 'Gagal memuat data kelas: ' + classDetailResponse.message}));
            }

            // 2. Always try to open NEW session
            console.log('[QR Init] Opening NEW QR session...');
            const openResponse = await openQRSession(id_schedule);
            console.log('[QR Init] Open response:', openResponse);

            if (openResponse && openResponse.status === 'success' && openResponse.data?.key) {
                console.log('[QR Init] ✅ New session opened successfully:', openResponse.data.key);
                setQrCode(openResponse.data.key);
            } else {
                throw new Error(openResponse?.message || 'Gagal membuka sesi QR');
            }

            // 3. Setup WebSocket connection
            await setupWebSocket();

            // 4. Fetch existing presences
            await fetchPresences();

        } catch (error) {
            console.error('[QR Init] ❌ Error initializing QR session:', error);
            
            // Handle specific error messages from refactored backend
            let errorMessage = 'Gagal membuka sesi QR.';
            
            // Try to extract error message from various response formats
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.errors) {
                // Handle Laravel validation errors
                const errors = error.response.data.errors;
                const firstError = Object.values(errors)[0];
                errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            console.log('[QR Init] Final error message:', errorMessage);

            setErrors(prev => ({...prev, fetch: errorMessage}));
            setAlertMessage(errorMessage);
            setShowErrorDialog(true);
        } finally {
            setLoading(false);
        }
    };

    // Handle back navigation
    const handleBack = () => {
        router.push(`/kehadiran/${id_class}/pertemuan/${id_schedule}`);
    };
    const setupWebSocket = async () => {
        try {
            console.log('[WebSocket] Setting up WebSocket for schedule:', id_schedule);

            const echoInstance = getEcho();
            console.log('[WebSocket] Echo instance created:', echoInstance);

            setEcho(echoInstance);

            const channelName = `attendance.${id_schedule}`;
            console.log('[WebSocket] Subscribing to channel:', channelName);

            const channel = echoInstance.channel(channelName);

            console.log('[WebSocket] Channel object:', channel);

            // Debug: Log connection state
            if (echoInstance.connector && echoInstance.connector.pusher) {
                const pusher = echoInstance.connector.pusher;
                console.log('[WebSocket] Pusher state:', pusher.connection.state);

                pusher.connection.bind('connected', () => {
                    console.log('[WebSocket] ✅ Pusher connected!');
                });

                pusher.connection.bind('error', (err) => {
                    console.error('[WebSocket] ❌ Pusher connection error:', err);
                });
            }

            // Listen for QR rotation
            channel.listen('.qr.rotated', (data) => {
                console.log('========================================');
                console.log('[WebSocket] QR Code rotated event received!');
                console.log('[WebSocket] Event name: qr.rotated');
                console.log('[WebSocket] New key:', data.new_key);
                console.log('[WebSocket] Session ID:', data.session_id);
                console.log('[WebSocket] Schedule ID:', data.schedule_id);
                console.log('[WebSocket] Time start:', data.time_start);
                console.log('[WebSocket] Full data:', JSON.stringify(data, null, 2));
                console.log('[WebSocket] Current QR code:', qrCode);
                console.log('[WebSocket] Calling setQrCode with:', data.new_key);
                console.log('========================================');

                setQrCode(data.new_key);

                console.log('[WebSocket] setQrCode called successfully');
            });

            // Listen for new attendance scans
            channel.listen('.attendance.scanned', (data) => {
                console.log('[WebSocket] New attendance scanned event received!');
                console.log('[WebSocket] Student:', data.student_name);
                console.log('[WebSocket] Full data:', data);

                // Add new success notification with unique ID
                const messageId = Date.now();
                const newMessage = {
                    id: messageId,
                    text: `${data.student_name} (${data.student_nim}) berhasil presensi!`
                };
                
                setScanSuccessMessages(prev => [...prev, newMessage]);
                
                // Auto-hide this specific notification after 5 seconds
                setTimeout(() => {
                    setScanSuccessMessages(prev => prev.filter(msg => msg.id !== messageId));
                }, 5000);

                setScannedStudents(prev => {
                    // Check if student already exists
                    const exists = prev.some(s => s.id === data.student_id);
                    if (exists) return prev;

                    // Add new student to the list with proper numbering
                    const newStudent = {
                        no: prev.length + 1,
                        id: data.student_id,
                        nim: data.student_nim,
                        nama: data.student_name,
                        waktuScan: formatWaktuScan(data.scan_time),
                    };

                    return [newStudent, ...prev];
                });
            });

            // Debug: Check if subscription succeeded
            channel.subscription.bind('pusher:subscription_succeeded', () => {
                console.log('[WebSocket] ✅ Subscription to', channelName, 'SUCCEEDED!');
            });

            channel.subscription.bind('pusher:subscription_error', (error) => {
                console.error('[WebSocket] ❌ Subscription to', channelName, 'FAILED!', error);
            });

            console.log('[WebSocket] WebSocket setup completed successfully');
        } catch (error) {
            console.error('[WebSocket] Error setting up WebSocket:', error);
        }
    };

    // Poll active QR when using Pusher (no scheduler needed)
    useEffect(() => {
        const provider = process.env.NEXT_PUBLIC_BROADCAST_PROVIDER;
        if (provider === 'pusher' && permissionChecked && permissionGranted && id_schedule && !loading) {
            let stopped = false;
            const defaultInterval = parseInt(process.env.NEXT_PUBLIC_QR_POLLING_INTERVAL || '5000', 10);
            
            const poll = async () => {
                try {
                    const response = await getActiveQR(id_schedule);
                    
                    if (response.status === 'success') {
                        // Use expires_in_seconds from API to schedule next poll
                        // Add 1 second buffer to ensure key is actually expired
                        const nextPollDelay = (response.data.expires_in_seconds || 0) * 1000 + 1000;
                        
                        if (!stopped) {
                            // Use API's expiry time, or fallback to default interval
                            const delay = nextPollDelay > 0 ? nextPollDelay : defaultInterval;
                            timer = setTimeout(poll, delay);
                        }
                    } else {
                        // If failed, retry with default interval
                        if (!stopped) {
                            timer = setTimeout(poll, defaultInterval);
                        }
                    }
                } catch (error) {
                    // On error, retry with default interval
                    if (!stopped) {
                        timer = setTimeout(poll, defaultInterval);
                    }
                }
            };

            let timer = setTimeout(poll, 0);
            return () => {
                stopped = true;
                clearTimeout(timer);
            };
        }
    }, [permissionChecked, permissionGranted, id_schedule, loading]);

    const fetchPresences = async () => {
        try {
            const response = await getPresencesBySchedule(id_schedule);
            console.log('Fetch presences response:', response);

            if (response.status === 'success' && response.data) {
                // Set schedule info
                setScheduleInfo({
                    pertemuanke: response.data.pertemuan || '-',
                    date: response.data.tanggal || ''
                });

                // Check if data is array or if it's nested in response.data.students
                const presenceList = Array.isArray(response.data)
                    ? response.data
                    : response.data.students || [];

                console.log('Presence list:', presenceList);

                const students = presenceList.map((p, index) => ({
                    no: index + 1,
                    id: p.id_student || p.id_user_si,
                    nim: p.nim || p.username,
                    nama: p.name || 'Unknown',
                    waktuScan: p.time ? formatWaktuScan(p.time) : '-',
                }));

                setScannedStudents(students);
            } else {
                setErrors(prev => ({...prev, fetch: 'Gagal memuat data presensi: ' + response.message}));
            }
        } catch (error) {
            console.error('Error fetching presences:', error);
            setErrors(prev => ({...prev, fetch: 'Terjadi kesalahan saat memuat data presensi: ' + (error.message || 'Terjadi kesalahan')}));
            // Don't fail initialization if presences fetch fails
        }
    };

    const formatWaktuScan = (timestamp) => {
        const date = new Date(timestamp);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
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

    const handleSelesai = () => {
        setAlertMessage('Apakah Anda yakin ingin menutup sesi presensi QR ini?');
        setConfirmAction(() => async () => {
            setShowConfirmDialog(false);
            await closeSession();
        });
        setShowConfirmDialog(true);
    };

    const closeSession = async () => {
        setIsSaving(true);
        setErrors(prev => ({...prev, close: null}));
        try {
            const response = await closeAttendanceSession(id_schedule);

            if (response.status === 'success') {
                // Disconnect WebSocket
                if (echo) {
                    echo.leave(`attendance.${id_schedule}`);
                    disconnectEcho();
                }

                setSuccessCountdown(5); // Reset countdown
                setAlertMessage('Sesi presensi berhasil ditutup!');
                setShowSuccessDialog(true);
            } else {
                setErrors(prev => ({...prev, close: 'Gagal menutup sesi: ' + response.message}));
                setAlertMessage(response.message || 'Gagal menutup sesi presensi');
                setShowErrorDialog(true);
            }
        } catch (error) {
            console.error('Error closing session:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Gagal menutup sesi presensi';
            setErrors(prev => ({...prev, close: errorMessage}));
            setAlertMessage(errorMessage);
            setShowErrorDialog(true);
        } finally {
            setIsSaving(false);
        }
    };

    const columns = [
        { key: 'nim', label: 'NIM', width: '150px', cellClassName: 'font-medium' },
        { key: 'nama', label: 'Nama Mahasiswa', className: 'text-left', cellClassName: 'text-left font-medium' },
        { key: 'waktuScan', label: 'Waktu Scan', width: '150px', cellClassName: 'text-center' },
        { key: 'status', label: 'Status', width: '120px' },
    ];

    const customRender = {
        waktuScan: (value) => (
            <span className="font-semibold" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
                {value}
            </span>
        ),
        status: () => (
            <div className="flex items-center justify-center">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg font-medium"
                    style={{ backgroundColor: '#dcfce7', color: '#16874B', fontFamily: 'Urbanist, sans-serif' }}>
                    <CheckCircle className="w-4 h-4" />
                    Hadir
                </span>
            </div>
        ),
    };

    if (loadingPermission) {
        return <LoadingEffect message="Memeriksa izin akses..." />;
    } else if (permissionGranted === false) {
        return (
            <div className="min-h-screen bg-brand-light-sage">
                <Navbar />
                <div className="container mx-auto px-4 py-8 max-w-7xl">
                    <ErrorMessageBoxWithButton
                        message={`Anda tidak memiliki izin untuk mengakses kelas atau jadwal ini.\n\nAkan dialihkan kembali dalam ${countdown} detik.`}
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
    } else if (loading) {
        return <LoadingEffect message="Memulai Presensi..." />;
    } else if (errors.fetch) {
        return (
            <div className="min-h-screen bg-brand-light-sage">
                <Navbar />
                <div className="container mx-auto px-4 py-8 max-w-7xl">
                    <ErrorMessageBoxWithButton
                        message={errors.fetch}
                        action={initializeQRSession}
                        back={true}
                        actionback={handleBack}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-light-sage">
            <Navbar />
            
            {/* Fixed Success Notifications - Stacked */}
            <div className="fixed top-20 right-4 z-50 flex flex-col gap-3" style={{ maxWidth: '400px' }}>
                {scanSuccessMessages.map((message, index) => (
                    <div 
                        key={message.id}
                        className="animate-slide-in-right"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div className="bg-white border-2 p-4 shadow-lg flex items-start gap-3" 
                            style={{ borderColor: '#16874B', borderRadius: '12px' }}>
                            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#16874B' }} />
                            <div className="flex-1">
                                <p className="font-semibold mb-1" style={{ color: '#16874B', fontFamily: 'Urbanist, sans-serif' }}>
                                    Berhasil!
                                </p>
                                <p className="text-sm" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
                                    {message.text}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 mb-6 font-medium hover:opacity-80 transition"
                    style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}
                >
                    <ArrowLeft className="w-5 h-5" />
                    Kembali ke Input Presensi
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* QR Code Section */}
                    <div className="bg-white rounded-2xl shadow-lg p-6" style={{ borderRadius: '16px' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-xl" style={{ backgroundColor: '#015023' }}>
                                <QrCode className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
                                    QR Code Presensi
                                </h2>
                                <p className="text-sm" style={{ color: '#6b7280', fontFamily: 'Urbanist, sans-serif' }}>
                                    Scan untuk absen otomatis
                                </p>
                            </div>
                        </div>

                        {/* QR Code Display */}
                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="bg-white p-6 rounded-2xl shadow-xl border-4" style={{ borderColor: '#015023' }}>
                                {qrCode ? (
                                    <QRCodeCanvas
                                        value={qrCode}
                                        size={256}
                                        level="H"
                                        includeMargin={true}
                                    />
                                ) : (
                                    <div className="w-64 h-64 bg-gray-100 rounded-xl flex items-center justify-center">
                                        <span className="text-gray-400">Loading QR...</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 text-center">
                                <p className="text-xs" style={{ color: '#999', fontFamily: 'Urbanist, sans-serif' }}>
                                    QR akan berganti otomatis setiap 30 detik
                                </p>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="bg-brand-light-sage rounded-xl p-4">
                            <p className="text-sm font-medium mb-2" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
                                Informasi Pertemuan:
                            </p>
                            <div className="space-y-2 text-sm" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                                <p><span className="font-semibold">Mata Kuliah:</span> {classInfo.code_subject} - {classInfo.name_subject}</p>
                                <p><span className="font-semibold">Kelas:</span> {classInfo.code_class}</p>
                                <p><span className="font-semibold">Pertemuan:</span> {scheduleInfo.pertemuanke}</p>
                                <p><span className="font-semibold">Tanggal:</span> {formatTanggal(scheduleInfo.date)}</p>
                                {classInfo.dosen && (
                                    <p><span className="font-semibold">Dosen:</span> {classInfo.dosen}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="bg-white rounded-2xl shadow-lg p-6" style={{ borderRadius: '16px' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-xl" style={{ backgroundColor: '#16874B' }}>
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
                                    Statistik Presensi
                                </h2>
                                <p className="text-sm" style={{ color: '#6b7280', fontFamily: 'Urbanist, sans-serif' }}>
                                    Update real-time
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-brand-light-sage rounded-xl p-4">
                                <p className="text-sm font-medium mb-1" style={{ color: '#015023', opacity: 0.6, fontFamily: 'Urbanist, sans-serif' }}>
                                    Total Mahasiswa
                                </p>
                                <p className="text-3xl font-bold" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
                                    {allStudents.length}
                                </p>
                            </div>

                            <div className="rounded-xl p-4" style={{ backgroundColor: '#dcfce7' }}>
                                <p className="text-sm font-medium mb-1" style={{ color: '#16874B', opacity: 0.8, fontFamily: 'Urbanist, sans-serif' }}>
                                    Sudah Scan
                                </p>
                                <p className="text-3xl font-bold" style={{ color: '#16874B', fontFamily: 'Urbanist, sans-serif' }}>
                                    {scannedStudents.length}
                                </p>
                            </div>
                        </div>

                        {/* Live Indicator */}
                        <div className="mb-6 flex items-center justify-center gap-2 text-sm" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                            <div className="relative">
                                <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: '#16874B' }}></div>
                                <div className="absolute inset-0 w-3 h-3 rounded-full animate-ping" style={{ backgroundColor: '#16874B', opacity: 0.5 }}></div>
                            </div>
                            <span className="font-semibold" style={{ color: '#16874B' }}>
                                Sesi scan QR aktif
                            </span>
                        </div>

                        {/* Daftar Mahasiswa yang Sudah Scan */}
                        <div className="border-t border-gray-200 pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
                                        Daftar Mahasiswa yang Sudah Presensi
                                    </h3>
                                    <p className="text-sm mt-1" style={{ color: '#6b7280', fontFamily: 'Urbanist, sans-serif' }}>
                                        {scannedStudents.length > 0
                                            ? `${scannedStudents.length} mahasiswa telah melakukan presensi`
                                            : 'Belum ada mahasiswa yang melakukan presensi'
                                        }
                                    </p>
                                </div>

                                {scannedStudents.length < allStudents.length && (
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#fef3c7' }}>
                                        <Clock className="w-4 h-4" style={{ color: '#92400e' }} />
                                        <span className="text-sm font-medium" style={{ color: '#92400e', fontFamily: 'Urbanist, sans-serif' }}>
                                            Sesi Aktif
                                        </span>
                                    </div>
                                )}
                            </div>

                            {scannedStudents.length > 0 ? (
                                <DataTable
                                    columns={columns}
                                    data={scannedStudents}
                                    actions={[]}
                                    pagination={false}
                                    customRender={customRender}
                                />
                            ) : (
                                <div className="text-center py-12">
                                    <QrCode className="w-16 h-16 mx-auto mb-4" style={{ color: '#d1d5db' }} />
                                    <p className="text-lg font-medium" style={{ color: '#6b7280', fontFamily: 'Urbanist, sans-serif' }}>
                                        Menunggu mahasiswa untuk scan QR Code...
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="bg-white rounded-2xl shadow-lg p-6" style={{ borderRadius: '16px' }}>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-sm" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
                            <p className="font-medium">Keterangan:</p>
                            <p className="text-gray-600 mt-1">
                                • QR Code akan aktif selama sesi presensi dibuka<br />
                                • Mahasiswa scan QR menggunakan aplikasi mobile<br />
                                • Data akan <span className="font-semibold text-green-600">tersimpan otomatis</span> ke database saat scan<br />
                                • Klik "Akhiri Presensi" untuk menutup sesi scan QR
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <OutlineButton 
                                onClick={handleBack}
                                disabled={isSaving}
                            >
                                Kembali
                            </OutlineButton>

                            <PrimaryButton
                                onClick={handleSelesai}
                                disabled={isSaving}
                                className="gap-2"
                            >
                                <CheckCircle className="w-4 h-4" />
                                {isSaving ? 'Menutup Sesi...' : 'Akhiri Presensi'}
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alert Dialogs */}
            <AlertConfirmationRedDialog
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
                description={`${alertMessage}\n\nAkan dialihkan kembali dalam ${successCountdown} detik.`}
                closeText={successCountdown > 0 ? `OK (${successCountdown})` : 'OK'}
            />

            <AlertErrorDialog
                open={showErrorDialog}
                onOpenChange={setShowErrorDialog}
                title="Error"
                description={alertMessage}
                closeText="Tutup"
            />
        </div>
    );
}
