'use client';

import { useRouter } from 'next/navigation';
import { Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getLecturerClasses, getStudentClassesForAttendance, getAcademicPeriods } from '@/lib/attendanceApi';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import Navbar from '@/components/ui/navigation-menu';
import DataTable from '@/components/ui/table';
import Footer from '@/components/ui/footer';
import LoadingEffect from '@/components/ui/loading-effect';
import Cookies from 'js-cookie';

export default function KehadiranPage() {
	const router = useRouter();
	const [selectedSemester, setSelectedSemester] = useState('');
	const [semesterOptions, setSemesterOptions] = useState([]);
	const [classes, setClasses] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [loadingClass, setLoadingClass] = useState(false);
	const [errors, setErrors] = useState({});
	const [userRole, setUserRole] = useState(null);

	// Fetch data on mount
	useEffect(() => {
		fetchAll();
	}, []);

	// Fetch classes when semester changes or userRole is loaded
	useEffect(() => {
		if (selectedSemester !== '' && userRole) {
			fetchClasses();
		}
	}, [selectedSemester, userRole]);

	// Fetch All
	const fetchAll = async () => {
		setErrors(prev => ({...prev, fetch: null}));
		setIsLoading(true);
		// Get role from cookie
		const role = Cookies.get('roles');
		setUserRole(role);
		await fetchAcademicPeriods();
		setIsLoading(false);
	};

	const fetchClasses = async () => {
		setLoadingClass(true);
		setErrors(prev => ({...prev, classes: null}));
		try {
			// Use different API based on user role
			const data = userRole === 'mahasiswa' 
				? await getStudentClassesForAttendance(selectedSemester)
				: await getLecturerClasses(selectedSemester);

			if (data.status === 'success') {
				setClasses(data.data);
			} else {
				setClasses([]);
				setErrors(prev => ({...prev, classes: 'Gagal memuat data kelas: ' + data.message}));
			}
		} catch (err) {
			setClasses([]);
			setErrors(prev => ({...prev, classes: 'Terjadi kesalahan saat memuat data kelas: ' + err.message}));
		} finally {
			setLoadingClass(false);
		}
	};

	const fetchAcademicPeriods = async () => {
		try {
			const response = await getAcademicPeriods();

			if (response.status === 'success') {
				// Transform to dropdown options
				const options = response.data.map(period => ({
					value: period.id_academic_period.toString(),
					label: period.name,
					is_active: period.is_active
				}));
				setSemesterOptions(options);

				// Auto-select active period
				const activePeriod = options.find(opt => opt.is_active);
				if (activePeriod) {
					setSelectedSemester(activePeriod.value);
				} else if (options.length > 0) {
					setSelectedSemester(options[options.length - 1].value);
				}
			} else {
				setErrors(prev => ({...prev, fetch: 'Gagal memuat data: ' + response.message}));
			}
		} catch (err) {
			setErrors(prev => ({...prev, fetch: 'Terjadi kesalahan saat memuat data: ' + err.message}));
		}
	};

	const handleBack = () => {
		router.back();
	};

	const columns = [
		{ key: 'kode_matkul', label: 'Kode Matkul', width: '130px', cellClassName: 'font-medium' },
		{ key: 'nama_matkul', label: 'Mata Kuliah', className: 'text-left', cellClassName: 'text-left font-medium' },
		{ key: 'sks', label: 'SKS', width: '80px', cellClassName: 'font-semibold' },
		{ key: 'kelas', label: 'Kelas', width: '100px', cellClassName: 'font-medium' },
		{ key: 'dosen', label: 'Dosen', className: 'text-left', cellClassName: 'text-left' },
		{ key: 'jumlah_pertemuan', label: 'Jumlah Pertemuan', width: '180px', cellClassName: 'font-medium text-center' },
		{ key: 'detail', label: 'Detail', width: '120px' },
	];

	const handleDetailClick = (item) => {
		router.push(`/kehadiran/${item.id_class}`);
	}

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

	// Show loading
	if (isLoading) {
		return <LoadingEffect message="Memuat data periode akademik..." />;
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

				{/* Semester Selector */}
				<div className="bg-white rounded-2xl shadow-lg p-4 mb-6" style={{ borderRadius: '16px' }}>
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
							className="flex-1 px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:border-opacity-100 transition"
							style={{
								fontFamily: 'Urbanist, sans-serif',
								borderColor: '#015023',
								color: '#015023',
								fontWeight: '600',
								maxWidth: '400px'
							}}
						>
							{semesterOptions.map(option => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
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

				{/* Error Message */}
				{errors.classes && (
					<ErrorMessageBoxWithButton message={errors.classes} action={fetchClasses} />
				)}

				{/* Loading State */}
				{loadingClass && (
					<div className="bg-white rounded-2xl shadow-lg p-8 text-center">
						<p className="text-lg" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>Memuat data...</p>
					</div>
				)}

				{/* Tabel Daftar Matkul */}
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
			<Footer/>
		</div>
	);
}
