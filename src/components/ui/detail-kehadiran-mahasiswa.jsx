'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, CalendarDays, UserCheck, ClipboardCheck } from 'lucide-react';
import { getStudentAttendanceHistoryByClass } from '@/lib/attendanceApi';
import { getStudentPermissionForAClass } from '@/lib/permissionApi';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import Navbar from '@/components/ui/navigation-menu';
import DataTable from '@/components/ui/table';
import LoadingEffect from '@/components/ui/loading-effect';
import { getStudentProfile } from '@/lib/profileApi';

export default function DetailKehadiranMahasiswa() {
	const router = useRouter();
	const params = useParams();
	
	const id_class = params.kode;

	// State management
	const [schedules, setSchedules] = useState([]);
	const [statistics, setStatistics] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [errors, setErrors] = useState({});
	const [permissionChecked, setPermissionChecked] = useState(false);
	const [permissionGranted, setPermissionGranted] = useState(null);
	const [loadingPermission, setLoadingPermission] = useState(true);
	const [countdown, setCountdown] = useState(5);
    const [studentInfo, setStudentInfo] = useState({
        nim: '',
        name: '',
        program: ''
    });
    const [classInfo, setClassInfo] = useState({
        code_subject: '',
        name_subject: '',
        code_class: '',
        sks: 0,
        dosen: ''
    });

	// Check permission on mount
	useEffect(() => {
		if (id_class) {
			checkPermission();
		}
	}, [id_class]);

	// Fetch data after permission is granted
	useEffect(() => {
		if (permissionChecked && permissionGranted) {
			fetchAll();
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

	// Check Permission
	const checkPermission = async () => {
		setErrors(prev => ({...prev, permission: null}));
		setLoadingPermission(true);
		try {
			const response = await getStudentPermissionForAClass(id_class);
			if (response.status === 'success') {
				// Check if permission is granted
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

	// Fetch All
	const fetchAll = async () => {
		setErrors(prev => ({...prev, fetch: null}));
		setIsLoading(true);
        await Promise.all([
            fetchStudentInfo(),
            fetchStudentAttendanceHistory()
        ]);
		setIsLoading(false);
	};

	// Fetch student attendance history from API
	const fetchStudentAttendanceHistory = async () => {
		try {
			const response = await getStudentAttendanceHistoryByClass(id_class);

			if (response.status === 'success') {
				setClassInfo(response.data.class_info);
				setSchedules(response.data.schedules);
				setStatistics(response.data.statistics);
			} else {
				setErrors(prev => ({...prev, fetch: 'Gagal mengambil riwayat presensi: ' + response.message}));
			}
		} catch (err) {
			setErrors(prev => ({...prev, fetch: 'Terjadi kesalahan saat mengambil data: ' + err.message}));
		}
	};
    // Fetch Student Info
    const fetchStudentInfo = async () => {
        try {
            const response = await getStudentProfile();
            
            if (response.status === 'success' && response.data) {
                setStudentInfo({
                    nim: response.data.registration_number || '-',
                    name: response.data.full_name || '-',
                    program: response.data.program_name || '-'
                });
            } else {
                setErrors(prev => ({...prev, fetch: 'Gagal memuat data: ' + response.message }));
            }
        } catch (error) {
            setErrors(prev => ({...prev, fetch: 'Terjadi kesalahan saat memuat data: ' + error.message }));
        }
    };

	// Format tanggal
	const formatTanggal = (dateString) => {
		const date = new Date(dateString);
		const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
		const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

		const dayName = days[date.getDay()];
		const day = date.getDate();
		const month = months[date.getMonth()];
		const year = date.getFullYear();

		return `${dayName}, ${day} ${month} ${year}`;
	};

	// Format jam (HH:mm dari HH:mm:ss)
	const formatJam = (time) => {
		if (!time) return '-';
		return time.substring(0, 5);
	};

	// Columns untuk mahasiswa
	const columns = [
		{ key: 'tanggal', label: 'Tanggal', className: 'text-left', cellClassName: 'text-left' },
		{ key: 'jam', label: 'Jam Mulai - Selesai', width: '180px', cellClassName: 'text-center' },
		{ key: 'jam_presensi', label: 'Jam Presensi', width: '130px', cellClassName: 'text-center' },
		{ key: 'status', label: 'Status', width: '250px' },
	];

	// Custom render untuk mahasiswa
	const customRender = {
		tanggal: (value, item) => formatTanggal(item.tanggal),
		jam: (value, item) => `${formatJam(item.jam_mulai)} - ${formatJam(item.jam_selesai)}`,
		kelas: (value, item) => item.code_class,
		status: (value, item) => {
			if (!item.status) {
				return (
					<span className="px-3 py-1.5 rounded-lg font-medium" style={{ backgroundColor: '#fee2e2', color: '#991b1b', fontFamily: 'Urbanist, sans-serif' }}>
						Belum Presensi
					</span>
				);
			}
			
			const isScanQR = item.status === 'Scan QR';
			return (
				<span className="px-3 py-1.5 rounded-lg font-medium" style={{ 
					backgroundColor: isScanQR ? '#dcfce7' : '#fef3c7', 
					color: isScanQR ? '#16874B' : '#92400e',
					fontFamily: 'Urbanist, sans-serif' 
				}}>
					{item.status}
				</span>
			);
		},
		jam_presensi: (value, item) => {
			if (!item.jam_presensi) return '-';
			return <span className="font-semibold" style={{ color: '#015023' }}>{item.jam_presensi}</span>;
		},
	};

	const handleBack = () => {
		router.push('/kehadiran');
	};

	// Show loading permission
	if (loadingPermission) {
		return <LoadingEffect message="Memeriksa izin akses..." />;
	} else if (permissionGranted === false) {
		return (
			<div className="min-h-screen bg-brand-light-sage">
				<Navbar />
				<div className="container mx-auto px-4 py-8 max-w-7xl">
					<ErrorMessageBoxWithButton
						message={'Anda tidak memiliki izin untuk mengakses kelas ini.' + `\n\nAkan dialihkan kembali dalam ${countdown} detik.`}
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
		return <LoadingEffect message="Memuat riwayat presensi..." />;
	} else if (errors.fetch) {
		return (
			<div className="min-h-screen bg-brand-light-sage">
				<Navbar />
				<div className="container mx-auto px-4 py-8 max-w-7xl">
					<ErrorMessageBoxWithButton
						message={errors.fetch}
						action={fetchAll}
						back={true}
						actionback={handleBack}
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-brand-light-sage flex flex-col">
			<Navbar/>
			<div className="container mx-auto px-4 py-8 max-w-7xl flex-grow">
				
				<button
					onClick={handleBack}
					className="flex items-center gap-2 mb-6 font-medium hover:opacity-80 transition"
					style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}
				>
					<ArrowLeft className="w-5 h-5" />
					Kembali ke Daftar Mata Kuliah
				</button>

				{/* Card Info Mata Kuliah + Statistics */}
				<div className="bg-white rounded-2xl shadow-lg p-6 mb-6" style={{ borderRadius: '16px' }}>
					{/* Header Info */}
					<div className="flex items-start gap-4 mb-6">
						<div className="p-4 rounded-xl" style={{ backgroundColor: '#015023' }}>
							<CalendarDays className="w-8 h-8 text-white" />
						</div>
						<div className="flex-1">
							<h1 className="text-3xl font-bold" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
								Detail Presensi - {classInfo.code_subject}
							</h1>
							<p className="mt-1 text-lg" style={{ color: '#015023', opacity: 0.75, fontFamily: 'Urbanist, sans-serif' }}>
								{studentInfo.name} ({studentInfo.nim}) - {studentInfo.program}
							</p>
							<div className="mt-3 flex flex-wrap gap-3">
								<span className="px-3 py-1 rounded-lg font-medium" style={{ backgroundColor: '#f3f4f6', color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
									Kelas: {classInfo.name_subject} {classInfo.code_class}
								</span>
								<span className="px-3 py-1 rounded-lg font-medium" style={{ backgroundColor: '#f3f4f6', color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
									{classInfo.sks} SKS
								</span>
								{classInfo.dosen && (
									<span className="px-3 py-1 rounded-lg font-medium" style={{ backgroundColor: '#DABC4E', color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
										Dosen: {classInfo.dosen}
									</span>
								)}
							</div>
						</div>
					</div>

					{/* Statistics */}
					{statistics && (
						<div className="border-t pt-6" style={{ borderColor: '#e5e7eb' }}>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								{/* Total Pertemuan */}
								<div className="flex items-center gap-4">
									<div className="p-3 rounded-xl" style={{ backgroundColor: '#015023' }}>
										<CalendarDays className="w-6 h-6 text-white" />
									</div>
									<div>
										<p className="text-sm font-medium" style={{ color: '#015023', opacity: 0.6, fontFamily: 'Urbanist, sans-serif' }}>
											Total Pertemuan
										</p>
										<p className="text-3xl font-bold" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
											{statistics.total_pertemuan}
										</p>
									</div>
								</div>

								{/* Sudah Presensi */}
								<div className="flex items-center gap-4">
									<div className="p-3 rounded-xl" style={{ backgroundColor: '#16874B' }}>
										<UserCheck className="w-6 h-6 text-white" />
									</div>
									<div>
										<p className="text-sm font-medium" style={{ color: '#015023', opacity: 0.6, fontFamily: 'Urbanist, sans-serif' }}>
											Sudah Presensi
										</p>
										<p className="text-3xl font-bold" style={{ color: '#16874B', fontFamily: 'Urbanist, sans-serif' }}>
											{statistics.sudah_presensi}
										</p>
									</div>
								</div>

								{/* Total Tidak Hadir */}
								<div className="flex items-center gap-4">
									<div className="p-3 rounded-xl" style={{ backgroundColor: '#DC2626' }}>
										<ClipboardCheck className="w-6 h-6 text-white" />
									</div>
									<div>
										<p className="text-sm font-medium" style={{ color: '#015023', opacity: 0.6, fontFamily: 'Urbanist, sans-serif' }}>
											Total Tidak Hadir
										</p>
										<p className="text-3xl font-bold" style={{ color: '#DC2626', fontFamily: 'Urbanist, sans-serif' }}>
											{statistics.total_tidak_hadir || 0}
										</p>
									</div>
								</div>

								{/* Persentase Kehadiran */}
								<div className="flex items-center gap-4">
									<div className="p-3 rounded-xl" style={{ backgroundColor: '#DABC4E' }}>
										<ClipboardCheck className="w-6 h-6 text-white" />
									</div>
									<div>
										<p className="text-sm font-medium" style={{ color: '#015023', opacity: 0.6, fontFamily: 'Urbanist, sans-serif' }}>
											Persentase Kehadiran
										</p>
										<p className="text-3xl font-bold" style={{ color: '#DABC4E', fontFamily: 'Urbanist, sans-serif' }}>
											{statistics.persentase_kehadiran}%
										</p>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Tabel Riwayat Presensi */}
				{schedules.length > 0 ? (
					<div className="bg-white rounded-2xl shadow-lg p-6" style={{ borderRadius: '16px' }}>
						<h2 className="text-xl font-bold mb-4" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
							Riwayat Presensi
						</h2>
						
						<DataTable
							columns={columns}
							data={schedules}
							actions={[]}
							pagination={false}
							customRender={customRender}
                            nomertext='Pertemuan'
						/>
					</div>
				) : (
					<div className="bg-white rounded-2xl shadow-lg p-8 text-center">
						<p className="text-lg" style={{ color: '#015023', opacity: 0.6, fontFamily: 'Urbanist, sans-serif' }}>
							Belum ada data presensi untuk kelas ini.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
