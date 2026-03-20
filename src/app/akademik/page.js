'use client';

import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import DataTable from '@/components/ui/table';
import LoadingEffect from '@/components/ui/loading-effect';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import { Eye, GraduationCap, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getTeachingClasses, getStudentClasses } from '@/lib/ClassApi';
import { getAcademicPeriods } from '@/lib/gradingApi';
import Cookies from 'js-cookie';

export default function AkademikPage() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);
	const [loadingClass, setLoadingClass] = useState(false);
	const [selectedSemester, setSelectedSemester] = useState('');
	const [semesterOptions, setSemesterOptions] = useState([]);
	const [data, setData] = useState([]);
	const [userRole, setUserRole] = useState(null);
	const [errors, setErrors] = useState({});

	// Fetch initial data saat component mount
	useEffect(() => {
		fetchAll();
	}, []);

	// Fetch classes ketika semester berubah dan userRole sudah tersedia
	useEffect(() => {
		if (selectedSemester && userRole) {
			fetchClassesData();
		}
	}, [selectedSemester, userRole]);

	const fetchAll = async () => {
		setErrors(prev => ({...prev, fetch: null}));
		setIsLoading(true);
		// Get role from cookie
		const role = Cookies.get('roles');
		setUserRole(role);
		await fetchAcademicPeriods();
		setIsLoading(false);
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
				setErrors(prev => ({...prev, fetch: 'Gagal memuat data periode akademik: ' + response.message}));
			}
		} catch (error) {
			console.error('Error fetching academic periods:', error);
			setErrors(prev => ({...prev, fetch: 'Terjadi kesalahan saat memuat data periode akademik: ' + error.message}));
		}
	};

	const fetchClassesData = async () => {
		setLoadingClass(true);
		setErrors(prev => ({...prev, classes: null}));
		try {
			// Hit different endpoint based on user role
			const response = userRole === 'mahasiswa' 
				? await getStudentClasses(selectedSemester)
				: await getTeachingClasses(selectedSemester);
			
			if (response.status === 'success' && response.data) {
				// Backend udah return formatted data, tinggal map ke table format
				const formattedData = response.data.map(item => ({
					id_class: item.id_class,
					kode_kelas: item.code_class,
					mata_kuliah: item.name_subject,
					kode_matkul: item.code_subject,
				}));
				setData(formattedData);
			} else {
				setData([]);
				setErrors(prev => ({...prev, classes: 'Gagal memuat data kelas: ' + response.message}));
			}
		} catch (error) {
			console.error('Error fetching classes:', error);
			setData([]);
			setErrors(prev => ({...prev, classes: 'Terjadi kesalahan saat memuat data kelas: ' + error.message}));
		} finally {
			setLoadingClass(false);
		}
	};

	const handleBack = () => {
		router.back();
	};

	const columns = [
		{ key: 'kode_kelas', label: 'Kode Kelas', width: '150px', cellClassName: 'font-bold' },
		{ key: 'mata_kuliah', label: 'Mata Kuliah', className: 'text-left', cellClassName: 'text-left' },
		{ key: 'kode_matkul', label: 'Kode Matkul', width: '130px', cellClassName: 'font-medium' },
		{ key: 'detail', label: 'Detail Kelas', width: '140px' },
	];

	const handleDetailClick = (item) => {
		router.push(`/akademik/detailkelas/${item.id_class}`);
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
			<div className="container mx-auto px-4 py-8 max-w-7xl grow">

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
					<div className="flex items-start gap-4">
						<div className="p-4 rounded-xl" style={{ backgroundColor: '#015023' }}>
							<GraduationCap className="w-8 h-8 text-white" />
						</div>
						<div className="flex-1">
							<h1 className="text-3xl font-bold" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
								Data Akademik
							</h1>
							<p className="mt-2" style={{ color: '#015023', opacity: 0.7, fontFamily: 'Urbanist, sans-serif' }}>
								Daftar kelas per periode akademik
							</p>
						</div>
					</div>
				</div>

				{/* Error Message */}
				{errors.classes && (
					<ErrorMessageBoxWithButton message={errors.classes} action={fetchClassesData} />
				)}

				{/* Loading State */}
				{loadingClass && (
					<div className="bg-white rounded-2xl shadow-lg p-8 text-center">
						<p className="text-lg" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>Memuat data...</p>
					</div>
				)}

				{/* Tabel Daftar Kelas */}
				{!loadingClass && !errors.classes && (
					<DataTable
						columns={columns}
						data={data}
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
