'use client';

import { useRouter } from 'next/navigation';
import { Eye, BookOpen, CalendarCheck, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getLecturerClasses, getStudentClassesForAttendance, getAcademicPeriods } from '@/lib/attendanceApi';
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
				if (activePeriod) setSelectedSemester(activePeriod.value);
				else if (options.length > 0) setSelectedSemester(options[options.length - 1].value);
			} else {
				setErrors(prev => ({ ...prev, fetch: 'Gagal memuat data: ' + response.message }));
			}
		} catch (err) {
			setErrors(prev => ({ ...prev, fetch: 'Terjadi kesalahan saat memuat data: ' + err.message }));
		}
	};

	const handleBack = () => router.back();
	const handleDetailClick = (item) => router.push(`/kehadiran/${item.id_class}`);

	// ── Stats untuk dosen ─────────────────────────────────────────────────────
	const totalPertemuanSelesai = classes.reduce((acc, c) => {
		// jumlah_pertemuan = total schedule, kita hitung dari data yang ada
		return acc + (c.pertemuan_selesai || 0);
	}, 0);
	const totalPertemuanSemua = classes.reduce((acc, c) => acc + (c.jumlah_pertemuan || 0), 0);
	const pertemuanTersisa = totalPertemuanSemua - totalPertemuanSelesai;

	const activeSemesterLabel = semesterOptions.find(o => o.value === selectedSemester)?.label || '';

	// Kolom tabel (sama untuk dosen & mahasiswa)
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
					className="font-semibold text-sm text-white px-5 py-2 rounded-xl hover:opacity-90 transition shadow-sm"
					style={{ backgroundColor: '#015023', fontFamily: 'Urbanist, sans-serif' }}
				>
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

	// ── Guards ────────────────────────────────────────────────────────────────
	if (isLoading) return <LoadingEffect message="Memuat data periode akademik..." />;

	if (errors.fetch) return (
		<div className="min-h-screen bg-brand-light-sage">
			<Navbar />
			<div className="container mx-auto px-4 py-8 max-w-7xl">
				<ErrorMessageBoxWithButton message={errors.fetch} action={fetchAll} back={true} actionback={handleBack} />
			</div>
		</div>
	);

	// ── DOSEN layout ──────────────────────────────────────────────────────────
	if (userRole === 'dosen') {
		return (
			<div className="min-h-screen bg-[#E6EEE9] flex flex-col">
				<Navbar />
				<main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 flex justify-center">
					<div className="w-full max-w-[1440px] flex flex-col gap-6">

						<button
							onClick={() => router.push('/dashboard')}
							className="font-semibold text-base hover:opacity-70 transition-opacity w-fit"
							style={{ color: '#044B33', fontFamily: 'Urbanist, sans-serif' }}
						>
							Kembali Ke Dashboard
						</button>

						{/* Header card dosen */}
						<div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
							<div className="flex items-start gap-4 mb-5">
								<div className="bg-[#044B33] p-3.5 rounded-[14px] text-white flex items-center justify-center shadow-md shrink-0">
									<BookOpen size={28} strokeWidth={1.5} />
								</div>
								<div>
									<h1 className="text-2xl font-bold text-[#044B33]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
										Kehadiran Dosen
									</h1>
									<p className="text-[#528a70] text-sm mt-0.5" style={{ fontFamily: 'Urbanist, sans-serif' }}>
										{user?.name || ''}{activeSemesterLabel ? ` — ${activeSemesterLabel}` : ''}
									</p>
								</div>
							</div>

							{/* Stats cards */}
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
								<div className="flex items-center gap-3 p-4 rounded-[14px]" style={{ backgroundColor: '#E6EEE9' }}>
									<BookOpen size={22} className="text-[#044B33] shrink-0" strokeWidth={1.5} />
									<div>
										<p className="text-2xl font-bold text-[#044B33]">{classes.length}</p>
										<p className="text-xs text-gray-500 font-medium">Total Mata Kuliah</p>
									</div>
								</div>
								<div className="flex items-center gap-3 p-4 rounded-[14px]" style={{ backgroundColor: '#E6EEE9' }}>
									<CalendarCheck size={22} className="text-[#044B33] shrink-0" strokeWidth={1.5} />
									<div>
										<p className="text-2xl font-bold text-[#044B33]">{totalPertemuanSelesai}</p>
										<p className="text-xs text-gray-500 font-medium">Pertemuan Selesai</p>
									</div>
								</div>
								<div className="flex items-center gap-3 p-4 rounded-[14px]" style={{ backgroundColor: '#E6EEE9' }}>
									<Clock size={22} className="text-[#044B33] shrink-0" strokeWidth={1.5} />
									<div>
										<p className="text-2xl font-bold text-[#044B33]">{pertemuanTersisa}</p>
										<p className="text-xs text-gray-500 font-medium">Pertemuan Tersisa</p>
									</div>
								</div>
							</div>
						</div>

						{/* Semester selector */}
						<div className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-100">
							<div className="flex items-center gap-4">
								<label className="text-sm font-semibold whitespace-nowrap" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
									Pilih Periode:
								</label>
								<select
									value={selectedSemester}
									onChange={(e) => setSelectedSemester(e.target.value)}
									className="flex-1 px-4 py-2.5 border-2 rounded-xl focus:outline-none transition"
									style={{ fontFamily: 'Urbanist, sans-serif', borderColor: '#015023', color: '#015023', fontWeight: '600', maxWidth: '400px' }}
								>
									{semesterOptions.map(option => (
										<option key={option.value} value={option.value}>{option.label}</option>
									))}
								</select>
							</div>
						</div>

						{/* Error */}
						{errors.classes && <ErrorMessageBoxWithButton message={errors.classes} action={fetchClasses} />}

						{/* Tabel */}
						{loadingClass ? (
							<div className="bg-white rounded-[20px] p-8 text-center shadow-sm">
								<p style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>Memuat data...</p>
							</div>
						) : (
							!errors.classes && (
								<DataTable
									columns={columns}
									data={classes}
									actions={[]}
									pagination={false}
									customRender={customRender}
								/>
							)
						)}
					</div>
				</main>
				<Footer />
			</div>
		);
	}

	// ── MAHASISWA layout (tetap seperti semula) ───────────────────────────────
	return (
		<div className="min-h-screen bg-brand-light-sage flex flex-col">
			<Navbar />
			<div className="container mx-auto px-4 py-8 max-w-7xl flex-grow">

				{/* Semester Selector */}
				<div className="bg-white rounded-2xl shadow-lg p-4 mb-6" style={{ borderRadius: '16px' }}>
					<div className="flex items-center gap-4">
						<label htmlFor="semester-select" className="text-sm font-semibold whitespace-nowrap" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
							Pilih Periode:
						</label>
						<select
							id="semester-select"
							value={selectedSemester}
							onChange={(e) => setSelectedSemester(e.target.value)}
							className="flex-1 px-4 py-2.5 border-2 rounded-xl focus:outline-none transition"
							style={{ fontFamily: 'Urbanist, sans-serif', borderColor: '#015023', color: '#015023', fontWeight: '600', maxWidth: '400px' }}
						>
							{semesterOptions.map(option => (
								<option key={option.value} value={option.value}>{option.label}</option>
							))}
						</select>
					</div>
				</div>

				{/* Header */}
				<div className="bg-white rounded-2xl shadow-lg p-6 mb-6" style={{ borderRadius: '16px' }}>
					<h1 className="text-3xl font-bold" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
						Daftar Mata Kuliah - Presensi
					</h1>
					<p className="mt-2" style={{ color: '#015023', opacity: 0.7, fontFamily: 'Urbanist, sans-serif' }}>
						Pilih mata kuliah untuk melihat detail presensi dan pertemuan.
					</p>
				</div>

				{errors.classes && <ErrorMessageBoxWithButton message={errors.classes} action={fetchClasses} />}

				{loadingClass && (
					<div className="bg-white rounded-2xl shadow-lg p-8 text-center">
						<p className="text-lg" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>Memuat data...</p>
					</div>
				)}

				{!loadingClass && !errors.classes && (
					<DataTable columns={columns} data={classes} actions={[]} pagination={false} customRender={customRender} />
				)}
			</div>
			<Footer />
		</div>
	);
}
