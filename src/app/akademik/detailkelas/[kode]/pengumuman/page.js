'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import LoadingEffect from '@/components/ui/loading-effect';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import { AlertSuccessDialog, AlertErrorDialog } from '@/components/ui/alert-dialog';
import { WarningButton } from '@/components/ui/button';
import { Send, Megaphone } from 'lucide-react';
import { getPermissionForAClass } from '@/lib/permissionApi';
import { getClassDetail } from '@/lib/ClassApi';
import { createAnnouncement } from '@/lib/notificationApi';
import { ArrowLeft } from 'lucide-react';

export default function BuatPengumumanPage() {
	const router = useRouter();
	const params = useParams();
	const classId = params.kode; // Kode kelas dari URL

	const [formData, setFormData] = useState({
		judul: '',
		isi: '',
	});

	const [classData, setClassData] = useState({
		code_class: '',
		name_subject: '',
		academic_period: '',
		sks: 0
	});

	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// Permission states
	const [permissionChecked, setPermissionChecked] = useState(false);
	const [permissionGranted, setPermissionGranted] = useState(null);
	const [loadingPermission, setLoadingPermission] = useState(true);
	const [countdown, setCountdown] = useState(5);
	
	// Alert states
	const [showSuccessAlert, setShowSuccessAlert] = useState(false);
	const [showErrorAlert, setShowErrorAlert] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	// Check permission on mount
	useEffect(() => {
		if (classId) {
			checkPermission();
		}
	}, [classId]);

	// Fetch data after permission granted
	useEffect(() => {
		if (permissionChecked && permissionGranted) {
			fetchClassDetail();
		}
	}, [permissionChecked, permissionGranted]);

	// Countdown redirect effect when permission is denied
	useEffect(() => {
		let timer;
		if (permissionGranted === false) {
			if (countdown > 0) {
				timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
			} else {
				router.back();
			}
		}
		return () => clearTimeout(timer);
	}, [permissionGranted, countdown]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
		// Clear error saat user mulai mengetik
		if (errors[name]) {
			setErrors(prev => ({
				...prev,
				[name]: ''
			}));
		}
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.isi.trim()) {
			newErrors.isi = 'Isi pengumuman harus diisi';
		} else if (formData.isi.trim().length < 10) {
			newErrors.isi = 'Isi pengumuman minimal 10 karakter';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setIsSubmitting(true);

		try {
			const payload = {
				id_class: classId,
				title: formData.judul.trim() || null, // null will trigger auto-generate
				message: formData.isi.trim()
			};

			const response = await createAnnouncement(payload);

			if (response.status === 'success') {
				setShowSuccessAlert(true);
			} else {
				setErrorMessage(response.message || 'Terjadi kesalahan');
				setShowErrorAlert(true);
			}
		} catch (error) {
			console.error('Error submitting announcement:', error);
			setErrorMessage(error.message || 'Terjadi kesalahan');
			setShowErrorAlert(true);
		} finally {
			setIsSubmitting(false);
		}
	};

	const fetchClassDetail = async () => {
		setErrors(prev => ({...prev, fetch: null}));
		setIsLoading(true);
		try {
			const response = await getClassDetail(classId, 'dosen');
			if (response.status === 'success') {
				setClassData(response.data.class_info);
			} else {
				setErrors(prev => ({...prev, fetch: 'Gagal memuat detail kelas: ' + response.message}));
			}
		} catch (error) {
			console.error('Error fetching class detail:', error);
			setErrors(prev => ({...prev, fetch: 'Terjadi kesalahan saat memuat detail kelas: ' + (error.message || 'Terjadi kesalahan')}));
		} finally {
			setIsLoading(false);
		}
	};

	// Check Permission
	const checkPermission = async () => {
		setErrors(prev => ({...prev, permission: null}));
		setLoadingPermission(true);
		try {
			const response = await getPermissionForAClass(classId);
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

	const handleBack = () => {
		router.push('/akademik/detailkelas/' + classId);
	}

	if (loadingPermission) {
		return <LoadingEffect message="Memeriksa izin akses..." />;
	} else if (permissionGranted === false) {
		return (
			<div className="min-h-screen bg-brand-light-sage">
				<Navbar />
				<div className="container mx-auto px-4 py-8 max-w-7xl">
					<ErrorMessageBoxWithButton
						message={`Anda tidak memiliki izin untuk mengakses halaman ini.\n\nAkan dialihkan kembali dalam ${countdown} detik.`}
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
	} else if (errors.fetch) {
		return (
			<div className="min-h-screen bg-brand-light-sage">
				<Navbar />
				<div className="container mx-auto px-4 py-8 max-w-7xl">
					<ErrorMessageBoxWithButton
						message={errors.fetch}
						action={fetchClassDetail}
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
					Kembali
				</button>

				{/* Header */}
				{classData && (
					<div className="bg-white rounded-2xl shadow-lg p-6 mb-6" style={{ borderRadius: '16px' }}>
						<div className="flex items-start gap-4">
							<div className="p-4 rounded-xl" style={{ backgroundColor: '#015023' }}>
								<Megaphone className="w-8 h-8 text-white" />
							</div>
							<div className="flex-1">
								<h1 className="text-3xl font-bold" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
									Buat Pengumuman
								</h1>
								<p className="mt-1 text-lg font-medium" style={{ color: '#015023', opacity: 0.75, fontFamily: 'Urbanist, sans-serif' }}>
									{classData.name_subject || '-'}
								</p>
								<div className="mt-3 flex flex-wrap gap-3">
									<span className="px-3 py-1 rounded-lg font-medium" style={{ backgroundColor: '#f3f4f6', color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
										Kelas: {classData.code_class || '-'}
									</span>
									<span className="px-3 py-1 rounded-lg font-medium" style={{ backgroundColor: '#DABC4E', color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
										{classData.academic_period || '-'}
									</span>
									<span className="px-3 py-1 rounded-lg font-medium" style={{ backgroundColor: '#f3f4f6', color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
										{classData.sks || 0} SKS
									</span>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Form */}
				<div className="bg-white rounded-2xl shadow-lg p-6" style={{ borderRadius: '16px' }}>
					<form onSubmit={handleSubmit} className="space-y-6">
						
						{/* Judul */}
						<div>
							<label 
								htmlFor="judul"
								className="block text-sm font-semibold mb-2"
								style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}
							>
								Judul Pengumuman
							</label>
							<input
								type="text"
								id="judul"
								name="judul"
								value={formData.judul}
								onChange={handleChange}
								placeholder="Masukkan judul pengumuman"
								className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-opacity-100 transition"
									style={{
										fontFamily: 'Urbanist, sans-serif',
										borderColor: errors.judul ? '#BE0414' : '#015023',
										borderRadius: '12px',
										opacity: errors.judul ? 1 : 0.7
									}}
								/>
								{errors.judul && (
									<p className="mt-1 text-sm" style={{ color: '#BE0414', fontFamily: 'Urbanist, sans-serif' }}>
										{errors.judul}
									</p>
								)}
							<p className="mt-1 text-xs" style={{ color: '#015023', opacity: 0.6, fontFamily: 'Urbanist, sans-serif' }}>
								Opsional. Jika kosong, akan otomatis menjadi "Pengumuman Kelas - {classData.code_class || '-'}"
							</p>
						</div>
						{/* Isi Pengumuman */}
						<div>
							<label 
								htmlFor="isi"
								className="block text-sm font-semibold mb-2"
								style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}
							>
								Isi Pengumuman <span className="text-red-600">*</span>
							</label>
							<textarea
								id="isi"
								name="isi"
								value={formData.isi}
								onChange={handleChange}
								placeholder="Tulis isi pengumuman di sini..."
								rows={8}
								className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-opacity-100 transition resize-none"
								style={{
									fontFamily: 'Urbanist, sans-serif',
									borderColor: errors.isi ? '#BE0414' : '#015023',
									borderRadius: '12px',
									opacity: errors.isi ? 1 : 0.7
								}}
							/>
							{errors.isi && (
								<p className="mt-1 text-sm" style={{ color: '#BE0414', fontFamily: 'Urbanist, sans-serif' }}>
									{errors.isi}
								</p>
							)}
							<p className="mt-1 text-xs" style={{ color: '#015023', opacity: 0.6, fontFamily: 'Urbanist, sans-serif' }}>
								Minimal 10 karakter
							</p>
						</div>

						{/* Action Buttons */}
						<div className="flex gap-3 pt-4">
							<button
								type="submit"
								disabled={isSubmitting}
								className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition shadow-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
								style={{
									backgroundColor: '#015023',
									color: 'white',
									fontFamily: 'Urbanist, sans-serif',
									borderRadius: '12px'
								}}
							>
								<Send className="w-5 h-5" />
								{isSubmitting ? 'Mengirim...' : 'Kirim Pengumuman'}
							</button>
							<WarningButton
								type="button"
								onClick={() => router.back()}
								className="px-6 py-3 rounded-xl font-semibold transition shadow-sm hover:opacity-90"
							>
								Batal
							</WarningButton>
						</div>
					</form>
				</div>
			</div>

			{/* Success Alert */}
			<AlertSuccessDialog
				open={showSuccessAlert}
				onOpenChange={setShowSuccessAlert}
				title="Pengumuman berhasil dikirim!"
				description="Pengumuman telah dikirim ke semua mahasiswa di kelas ini."
				closeText="OK"
			/>

			{/* Error Alert */}
			<AlertErrorDialog
				open={showErrorAlert}
				onOpenChange={setShowErrorAlert}
				title="Gagal mengirim pengumuman"
				description={errorMessage}
				closeText="Tutup"
			/>

			<Footer/>
		</div>
	);
}
