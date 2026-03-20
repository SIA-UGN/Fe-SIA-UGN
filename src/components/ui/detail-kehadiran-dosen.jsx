'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, CalendarDays, Clock, MapPin, Download } from 'lucide-react';
import { getClassSchedules } from '@/lib/attendanceApi';
import { getPermissionForAClass } from '@/lib/permissionApi';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import Navbar from '@/components/ui/navigation-menu';
import LoadingEffect from '@/components/ui/loading-effect';

export default function DetailKehadiranDosen() {
	const router = useRouter();
	const params = useParams();
	const id_class = params.kode;

	const [classInfo, setClassInfo] = useState({
		code_subject: '', name_subject: '', code_class: '',
		sks: 0, dosen: '', start_time: '', end_time: '', academic_period: '',
	});
	const [schedules, setSchedules] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [errors, setErrors] = useState({});
	const [permissionChecked, setPermissionChecked] = useState(false);
	const [permissionGranted, setPermissionGranted] = useState(null);
	const [loadingPermission, setLoadingPermission] = useState(true);
	const [countdown, setCountdown] = useState(5);

	useEffect(() => { if (id_class) checkPermission(); }, [id_class]);
	useEffect(() => { if (permissionChecked && permissionGranted) fetchAll(); }, [permissionChecked, permissionGranted]);

	// Re-fetch saat user balik ke halaman ini (setelah presensi berhasil)
	useEffect(() => {
		const handleFocus = () => {
			if (permissionGranted && permissionChecked) fetchAll();
		};
		window.addEventListener('focus', handleFocus);
		return () => window.removeEventListener('focus', handleFocus);
	}, [permissionGranted, permissionChecked]);
	useEffect(() => {
		let timer;
		if (permissionGranted === false) {
			if (countdown > 0) timer = setTimeout(() => setCountdown(p => p - 1), 1000);
			else handleBack();
		}
		return () => clearTimeout(timer);
	}, [permissionGranted, countdown]);

	const checkPermission = async () => {
		setErrors(prev => ({ ...prev, permission: null }));
		setLoadingPermission(true);
		try {
			const response = await getPermissionForAClass(id_class);
			if (response.status === 'success') {
				setPermissionGranted(response.data.permission !== false);
				setPermissionChecked(true);
			} else {
				setErrors(prev => ({ ...prev, permission: 'Gagal memeriksa izin akses: ' + response.message }));
			}
		} catch (error) {
			setErrors(prev => ({ ...prev, permission: 'Gagal memeriksa izin akses: ' + error.message }));
		} finally {
			setLoadingPermission(false);
		}
	};

	const fetchAll = async () => {
		setErrors(prev => ({ ...prev, fetch: null }));
		setIsLoading(true);
		try {
			const data = await getClassSchedules(id_class);
			if (data.status === 'success') {
				setClassInfo(data.data.class_info);
				setSchedules(data.data.schedules);
			} else {
				setErrors(prev => ({ ...prev, fetch: 'Gagal mengambil data pertemuan: ' + data.message }));
			}
		} catch (err) {
			setErrors(prev => ({ ...prev, fetch: 'Terjadi kesalahan: ' + err.message }));
		} finally {
			setIsLoading(false);
		}
	};

	const handleBack = () => router.push('/kehadiran');
	const handleInputPresensi = (id_schedule) => router.push(`/kehadiran/${id_class}/pertemuan/${id_schedule}`);

	const formatTanggal = (dateString) => {
		if (!dateString) return '-';
		const date = new Date(dateString);
		const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
		const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
			'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
		return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
	};

	const formatJam = (time) => {
		if (!time) return '-';
		return time.substring(0, 5);
	};

	// total_present > 0 = sesi sudah ada presensi mahasiswa = dosen sudah hadir
	const pertemuanSelesai = schedules.filter(s => s.total_present > 0).length;
	const totalPertemuan = schedules.length;

	// ── Guards ────────────────────────────────────────────────────────────────
	if (loadingPermission) return <LoadingEffect message="Memeriksa izin akses..." />;
	if (permissionGranted === false) return (
		<div className="min-h-screen bg-[#E6EEE9]"><Navbar />
			<div className="container mx-auto px-4 py-8 max-w-7xl">
				<ErrorMessageBoxWithButton
					message={`Anda tidak memiliki izin untuk mengakses kelas ini.\n\nAkan dialihkan kembali dalam ${countdown} detik.`}
					action={handleBack} btntext={countdown > 0 ? `Kembali (${countdown})` : 'Kembali'}
				/>
			</div>
		</div>
	);
	if (errors.permission) return (
		<div className="min-h-screen bg-[#E6EEE9]"><Navbar />
			<div className="container mx-auto px-4 py-8 max-w-7xl">
				<ErrorMessageBoxWithButton message={errors.permission} action={checkPermission} />
			</div>
		</div>
	);
	if (isLoading) return <LoadingEffect message="Memuat data jadwal..." />;
	if (errors.fetch) return (
		<div className="min-h-screen bg-[#E6EEE9]"><Navbar />
			<div className="container mx-auto px-4 py-8 max-w-7xl">
				<ErrorMessageBoxWithButton message={errors.fetch} action={fetchAll} back={true} actionback={handleBack} />
			</div>
		</div>
	);

	// ── Main render ───────────────────────────────────────────────────────────
	return (
		<div className="min-h-screen bg-[#E6EEE9] flex flex-col">
			<Navbar />
			<main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 flex justify-center">
				<div className="w-full max-w-[1440px] flex flex-col gap-6">

					{/* Back */}
					<button
						onClick={handleBack}
						className="flex items-center gap-1.5 font-semibold text-base hover:opacity-70 transition-opacity w-fit"
						style={{ color: '#044B33', fontFamily: 'Urbanist, sans-serif' }}
					>
						<ArrowLeft className="w-4 h-4" />
						Kembali Ke Dashboard
					</button>

					{/* Header Card */}
					<div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between md:items-center gap-4">
						<div className="flex items-start gap-4">
							<div className="bg-[#044B33] p-3.5 rounded-[14px] text-white flex items-center justify-center shadow-md shrink-0">
								<CalendarDays size={28} strokeWidth={1.5} />
							</div>
							<div className="flex flex-col justify-center">
								<h1 className="text-2xl font-bold text-[#044B33] leading-tight">Detail Presensi</h1>
								<p className="text-[#528a70] text-[16px] mb-2">{classInfo.name_subject}</p>
								<div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-medium">
									{(classInfo.start_time || classInfo.end_time) && (
										<div className="flex items-center gap-1.5">
											<Clock size={16} className="text-gray-400" />
											<span>
												{schedules.length > 0 ? formatTanggal(schedules[0].tanggal).split(' ')[0] : ''}
												{classInfo.start_time ? `, ${formatJam(classInfo.start_time)}` : ''}
												{classInfo.end_time ? ` - ${formatJam(classInfo.end_time)}` : ''}
											</span>
										</div>
									)}
									<div className="flex items-center gap-1.5">
										<MapPin size={16} className="text-gray-400" />
										{/* TODO: ganti dengan data ruangan dari BE kalau sudah ada */}
										<span>Gedung B — Ruang 305</span>
									</div>
								</div>
							</div>
						</div>

						{/* Counter */}
						<div className="text-right flex flex-col md:items-end mt-4 md:mt-0 shrink-0">
							<span className="text-xl font-bold text-[#044B33] leading-none">
								{pertemuanSelesai}/{totalPertemuan}
							</span>
							<span className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">
								Pertemuan Selesai
							</span>
						</div>
					</div>

					{/* Tabel Pertemuan */}
					<div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden p-6">
						<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
							<h2 className="text-[18px] font-bold text-[#044B33]">
								Daftar Pertemuan dan Input Presensi
							</h2>
							{/* TODO: hubungkan ke endpoint export PDF/Excel */}
							<button className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#044B33] text-[#044B33] font-semibold text-sm hover:bg-gray-50 transition-colors">
								<Download size={18} />
								Unduh
							</button>
						</div>

						{schedules.length > 0 ? (
							<div className="overflow-x-auto rounded-xl border border-gray-100">
								<table className="w-full text-center border-collapse">
									<thead className="bg-[#DABC4E] text-[#044B33]">
										<tr>
											<th className="py-4 px-4 font-semibold text-[15px] whitespace-nowrap">Pertemuan</th>
											<th className="py-4 px-4 font-semibold text-[15px] whitespace-nowrap">Tanggal</th>
											<th className="py-4 px-4 font-semibold text-[15px] whitespace-nowrap">Jam Mulai-Selesai</th>
											<th className="py-4 px-4 font-semibold text-[15px] whitespace-nowrap">Aksi Presensi</th>
										</tr>
									</thead>
									<tbody className="text-gray-700 text-[15px]">
										{schedules.map((item) => (
											<tr key={item.id_schedule} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
												<td className="py-5 px-4 font-medium">{item.pertemuan}</td>
												<td className="py-5 px-4">{formatTanggal(item.tanggal)}</td>
												<td className="py-5 px-4">{formatJam(item.jam_mulai)} - {formatJam(item.jam_selesai)}</td>
												<td className="py-5 px-4">
													{item.total_present > 0 ? (
														// Sudah ada presensi mahasiswa = dosen sudah hadir
														<div
															className="px-8 py-2.5 rounded-full font-bold text-sm inline-block min-w-[140px]"
															style={{ backgroundColor: '#BCE3C8', color: '#044B33' }}
														>
															Hadir
														</div>
													) : (
														// Belum ada presensi = dosen belum hadir
														<button
															onClick={() => handleInputPresensi(item.id_schedule)}
															className="px-8 py-2.5 rounded-full font-semibold text-sm text-white hover:opacity-90 transition-colors shadow-sm active:scale-95 inline-block min-w-[140px]"
															style={{ backgroundColor: '#044B33' }}
														>
															Input Presensi
														</button>
													)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						) : (
							<div className="text-center py-12">
								<p className="text-gray-400 font-medium">Belum ada jadwal pertemuan untuk kelas ini.</p>
							</div>
						)}
					</div>

				</div>
			</main>
		</div>
	);
}
