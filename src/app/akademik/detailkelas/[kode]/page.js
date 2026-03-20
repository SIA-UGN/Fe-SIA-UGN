'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import DataTable from '@/components/ui/table';
import LoadingEffect from '@/components/ui/loading-effect';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import { ArrowLeft, GraduationCap, Users, Mail, Phone, MessageCircle, Megaphone } from 'lucide-react';
import { use, useMemo, useState, useEffect } from 'react';
import { getClassDetail } from '@/lib/ClassApi';
import { getProfile } from '@/lib/profileApi';
import { getPermissionForAClass, getStudentPermissionForAClass } from '@/lib/permissionApi';
import ChatModal from '@/components/ui/chatmodal';
import Cookies from 'js-cookie';

export default function DetailKelasPage() {
	const router = useRouter();
	const params = useParams();
	
	const classId = params.kode || '';

	// State for class data
	const [classData, setClassData] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [errors, setErrors] = useState({});

	// Permission states
	const [permissionChecked, setPermissionChecked] = useState(false);
	const [permissionGranted, setPermissionGranted] = useState(null);
	const [loadingPermission, setLoadingPermission] = useState(true);
	const [countdown, setCountdown] = useState(5);

	// Get user role
	const [userRole, setUserRole] = useState(null);
	const [currentUserId, setCurrentUserId] = useState(null);

	// Chat modal state
	const [isChatOpen, setIsChatOpen] = useState(false);
	const [chatUser, setChatUser] = useState({ id: '', name: '', nim: '' });

	// Check permission on mount
	useEffect(() => {
		if (classId) {
			const role = getUserRole();
			if (role) {
				setUserRole(role);
				checkPermission(role);
			}
		}
	}, [classId]);

	// Fetch data after permission is granted
	useEffect(() => {
		if (permissionChecked && permissionGranted && userRole) {
			fetchAll();
		}
	}, [permissionChecked, permissionGranted, userRole]);

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

	const getUserRole = () => {
		const role = Cookies.get('roles');
		return role;
	};

	const fetchAll = async () => {
		setErrors(prev => ({...prev, fetch: null}));
		setIsLoading(true);
		
		await Promise.all([
			fetchUserProfile(),
			fetchClassData()
		]);
		
		setIsLoading(false);
	};

	const fetchUserProfile = async () => {
		try {
			const profileResponse = await getProfile();
			if (profileResponse.status === 'success') {
				setCurrentUserId(profileResponse.data.id_user_si);
			} else {
				setErrors(prev => ({...prev, fetch: 'Gagal memuat profil pengguna: ' + profileResponse.message}));
			}
		} catch (err) {
			console.error('Error fetching user profile:', err);
			setErrors(prev => ({...prev, fetch: 'Terjadi kesalahan saat memuat profil pengguna: ' + err.message}));
		}
	};

	// Check Permission based on role
	// Nanti terima parameter roleToCheck, defaultnya ambil dari state jika kosong
	const checkPermission = async (roleToCheck = null) => {
		// Kemudian pakai role yang dikirim (prioritas) atau dari state
		const currentRole = roleToCheck || userRole;

		setErrors(prev => ({...prev, permission: null}));
		setLoadingPermission(true);
		try {
			// Use different permission check based on role
			const response = currentRole === 'mahasiswa' 
				? await getStudentPermissionForAClass(classId)
				: await getPermissionForAClass(classId);
				
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
			setErrors(prev => ({...prev, permission: 'Gagal memeriksa izin akses: ' + (error.message || 'Terjadi kesalahan')}));
		} finally {
			setLoadingPermission(false);
		}
	};

	const fetchClassData = async () => {
		setErrors(prev => ({...prev, class: null}));
		
		try {
			// Pass userRole to API untuk hit endpoint yang sesuai
			const response = await getClassDetail(classId, userRole);
			
			if (response.status === 'success') {
				setClassData(response.data);
			} else {
				setErrors(prev => ({...prev, class: 'Gagal memuat data kelas: ' + response.message}));
			}
		} catch (err) {
			console.error('Error fetching class detail:', err);
			setErrors(prev => ({...prev, class: 'Terjadi kesalahan saat memuat data kelas: ' + (err.message || 'Terjadi kesalahan')}));
		}
	};

	const handleBack = () => {
		router.push('/akademik');
	};

	const handlePengumumanClick = () => {
		router.push(`/akademik/detailkelas/${classId}/pengumuman`);
	}

	// Extract class info and students/lecturers from API response
	const classInfo = classData?.class_info || {};
	
	// Get mahasiswa data - Add flag to identify current user
	const mahasiswaData = useMemo(() => {
		if (!classData?.students) return [];
		
		return classData.students.map(student => ({
			...student,
			isCurrentUser: student.id_user_si === currentUserId, // Flag for hiding chat button
		}));
	}, [classData, currentUserId]);
	
	// Get dosen data - SHOW ALL lecturers, but mark which one is current user
	const dosenData = useMemo(() => {
		if (!classData?.lecturers) return [];
		
		// Show ALL lecturers, add flag to identify current user
		return classData.lecturers.map(lecturer => ({
			id_user_si: lecturer.id_user_si,
			nama: lecturer.name,
			isCurrentUser: lecturer.id_user_si === currentUserId, // Flag for hiding chat button
		}));
	}, [classData, currentUserId]);

	const columns = [
		{ key: 'nim', label: 'NIM', width: '140px', cellClassName: 'font-bold' },
		{ key: 'name', label: 'Nama Mahasiswa', className: 'text-left', cellClassName: 'text-left font-medium' },
		{ key: 'chat', label: 'Chat', width: '120px' },
	];

	const dosenColumns = [
		{ key: 'nama', label: 'Nama Dosen', className: 'text-left', cellClassName: 'text-left font-medium' },
		{ key: 'chat', label: 'Chat', width: '120px' },
	];

	const customRender = {
		chat: (_value, item) => {
			// Don't show chat button for current user (mahasiswa can't chat themselves)
			if (item.isCurrentUser) {
				return (
					<div className="flex items-center justify-center">
						<span className="text-sm font-medium" style={{ color: '#015023', opacity: 0.5 }}>
							(Anda)
						</span>
					</div>
				);
			}

			return (
				<div className="flex items-center justify-center">
					<button
						onClick={() => {
							// Use id_user_si from API response
							setChatUser({ 
								id: item.id_user_si, 
								name: item.name, 
								nim: item.nim 
							});
							setIsChatOpen(true);
						}}
						className="flex items-center gap-2 text-white px-3 py-2 transition shadow-sm hover:opacity-90 font-semibold"
						style={{ backgroundColor: '#16874B', borderRadius: '12px', fontFamily: 'Urbanist, sans-serif' }}
					>
						<MessageCircle className="w-4 h-4" />
						Chat
					</button>
				</div>
			);
		},
	};

	const dosenCustomRender = {
		chat: (_value, item) => {
			// Don't show chat button for current user (dosen can't chat themselves)
			if (item.isCurrentUser) {
				return (
					<div className="flex items-center justify-center">
						<span className="text-sm font-medium" style={{ color: '#015023', opacity: 0.5 }}>
							(Anda)
						</span>
					</div>
				);
			}

			return (
				<div className="flex items-center justify-center">
					<button
						onClick={() => {
							// Use id_user_si from API response
							setChatUser({ 
								id: item.id_user_si, 
								name: item.nama, 
								nim: '' 
							});
							setIsChatOpen(true);
						}}
						className="flex items-center gap-2 text-white px-3 py-2 transition shadow-sm hover:opacity-90 font-semibold"
						style={{ backgroundColor: '#16874B', borderRadius: '12px', fontFamily: 'Urbanist, sans-serif' }}
					>
						<MessageCircle className="w-4 h-4" />
						Chat
					</button>
				</div>
			);
		},
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
						message={`Anda tidak memiliki izin untuk mengakses kelas ini.\n\nAkan dialihkan kembali dalam ${countdown} detik.`}
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
						action={() => checkPermission(userRole)}
					/>
				</div>
			</div>
		);
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
	} else if (isLoading) {
		return <LoadingEffect message="Memuat data kelas..." />;
	}

	return (
		<div className="min-h-screen bg-brand-light-sage flex flex-col">
			<Navbar/>
			<div className="container mx-auto px-4 py-8 max-w-7xl flex-grow">
				
				{/* Back Button */}
				<button
					onClick={handleBack}
					className="flex items-center gap-2 mb-6 font-medium hover:opacity-80 transition"
					style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}
				>
					<ArrowLeft className="w-5 h-5" />
					Kembali ke Daftar Kelas
				</button>

				{/* Error State */}
				{errors.class && (
					<ErrorMessageBoxWithButton
						message={errors.class}
						action={fetchClassData}
					/>
				)}

				{/* Header */}
				{!errors.class && classData && (
					<div className="bg-white rounded-2xl shadow-lg p-6 mb-6" style={{ borderRadius: '16px' }}>
						<div className="flex items-start gap-4">
							<div className="p-4 rounded-xl" style={{ backgroundColor: '#015023' }}>
								<GraduationCap className="w-8 h-8 text-white" />
							</div>
							<div className="flex-1">
								<h1 className="text-3xl font-bold" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
									Detail Kelas - {classInfo.code_class || kode}
								</h1>
								<p className="mt-1 text-lg font-medium" style={{ color: '#015023', opacity: 0.75, fontFamily: 'Urbanist, sans-serif' }}>
									{classInfo.name_subject || '-'}
								</p>
								<div className="mt-3 flex flex-wrap gap-3">
									<span className="px-3 py-1 rounded-lg font-medium" style={{ backgroundColor: '#f3f4f6', color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
										Kelas: {classInfo.code_subject || '-'}
									</span>
									<span className="px-3 py-1 rounded-lg font-medium" style={{ backgroundColor: '#DABC4E', color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
										{classInfo.academic_period || '-'}
									</span>
									<span className="px-3 py-1 rounded-lg font-medium" style={{ backgroundColor: '#f3f4f6', color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
										{classInfo.sks || 0} SKS
									</span>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Tabel Daftar Dosen Pengampu */}
				{!errors.class && classData && (
					<div className="bg-white rounded-2xl shadow-lg p-6 mb-6" style={{ borderRadius: '16px' }}>
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-xl font-bold" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
								Daftar Dosen Pengampu
							</h2>
							{userRole === 'dosen' && (
								<button
									onClick={handlePengumumanClick}
									className="flex items-center gap-2 text-white px-4 py-2 transition shadow-sm hover:opacity-90 font-semibold"
									style={{ backgroundColor: '#015023', borderRadius: '12px', fontFamily: 'Urbanist, sans-serif' }}
								>
									<Megaphone className="w-4 h-4" />
									Buat Pengumuman
								</button>
							)}
						</div>
						
						<DataTable
							columns={dosenColumns}
							data={dosenData}
							actions={[]}
							pagination={false}
							customRender={dosenCustomRender}
						/>
					</div>
				)}

				{/* Tabel Daftar Mahasiswa */}
				{!errors.class && classData && (
					<div className="bg-white rounded-2xl shadow-lg p-6 mb-6" style={{ borderRadius: '16px' }}>
						<h2 className="text-xl font-bold mb-4" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
							Daftar Mahasiswa
						</h2>
						<DataTable
							columns={columns}
							data={mahasiswaData}
							actions={[]}
							pagination={false}
							customRender={customRender}
						/>
					</div>
				)}
			</div>

			{/* Chat Modal */}
			<ChatModal
				isOpen={isChatOpen}
				onClose={() => setIsChatOpen(false)}
				userId={chatUser.id}
				userName={chatUser.name}
				userNim={chatUser.nim}
			/>

			<Footer/>
		</div>
	);
}
