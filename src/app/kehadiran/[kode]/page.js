'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DetailKehadiranMahasiswa from '@/components/ui/detail-kehadiran-mahasiswa';
import DetailKehadiranDosen from '@/components/ui/detail-kehadiran-dosen';
import Footer from '@/components/ui/footer';
import LoadingEffect from '@/components/ui/loading-effect';
import Cookies from 'js-cookie';

export default function DetailKehadiranPage() {
	const router = useRouter();
	const [userRole, setUserRole] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	const getUserRole = () => {
		const role = Cookies.get('roles');
		if (!(role === 'mahasiswa' || role === 'dosen')) {
			router.push('/unauthorized');
			return null;
		}
		return role;
	};

	useEffect(() => {
		const role = getUserRole();
		setUserRole(role);
		setIsLoading(false);
	}, []);

	if (isLoading) {
		return (
			<LoadingEffect message="Memuat data..." />
		);
	}

	// Render berdasarkan role user
	return (
		<>
			{userRole === 'mahasiswa' ? (
				<>
					<DetailKehadiranMahasiswa />
					<Footer />
				</>
			) : userRole === 'dosen' ? (
				<>
					<DetailKehadiranDosen />
					<Footer />
				</>
			) : null}
		</>
	);
}
