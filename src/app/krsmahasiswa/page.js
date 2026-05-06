'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
	BookOpenText,
	CalendarDays,
	ChevronRight,
	CircleCheck,
	CircleDashed,
	Clock4,
} from 'lucide-react';
import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/ui/table';
import { MOCK_KRS_QUOTA } from './mockData';

const KRS_SUBMISSION_STORAGE_KEY = 'krs-mahasiswa-last-submission';

function hasSubmittedKrs() {
	if (typeof window === 'undefined') {
		return false;
	}

	try {
		const raw = sessionStorage.getItem(KRS_SUBMISSION_STORAGE_KEY);
		if (!raw) {
			return false;
		}

		const parsed = JSON.parse(raw);
		return Boolean(parsed && typeof parsed === 'object' && parsed.is_submitted === true);
	} catch (_error) {
		return false;
	}
}

function formatDate(value) {
	if (!value) {
		return '-';
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return '-';
	}

	return new Intl.DateTimeFormat('id-ID', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	}).format(date);
}

function getSessionStatusLabel(status) {
	if (status === 'open') {
		return 'Sedang Dibuka';
	}

	if (status === 'closed') {
		return 'Sudah Ditutup';
	}

	return 'Belum Tersedia';
}

function getSessionStatusStyle(status) {
	if (status === 'open') {
		return {
			color: '#166534',
			backgroundColor: '#DCFCE7',
			border: '1px solid #4ADE80',
		};
	}

	return {
		color: '#6B7280',
		backgroundColor: '#F3F4F6',
		border: '1px solid #D1D5DB',
	};
}

export default function KrsMahasiswaPage() {
	const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(false);
	const quota = MOCK_KRS_QUOTA;

	const activeSession = quota?.active_session ?? null;
	const isSessionOpen = activeSession?.status === 'open';

	useEffect(() => {
		setIsAlreadySubmitted(hasSubmittedKrs());
	}, []);

	const progress = useMemo(() => {
		const used = Number(quota?.sks_used ?? 0);
		const max = Number(quota?.max_sks ?? 0);
		if (max <= 0) {
			return 0;
		}

		return Math.min(100, Math.round((used / max) * 100));
	}, [quota]);

	const sessionRows = [
		{
			id: activeSession?.id_krs_session ?? 1,
			sesi: quota?.academic_period?.name ?? 'Sesi Belum Tersedia',
			tanggal_mulai: formatDate(activeSession?.opened_at),
			status: activeSession?.status ?? 'closed',
		},
	];

	const sessionColumns = [
		{ key: 'sesi', label: 'Sesi' },
		{ key: 'tanggal_mulai', label: 'Tanggal Mulai', width: '180px' },
		{ key: 'status', label: 'Status', width: '170px' },
		{ key: 'aksi', label: 'Aksi', width: '320px' },
	];

	const sessionRender = {
		sesi: (value) => (
			<div className="text-left">
				<p className="font-semibold text-base" style={{ color: '#1F2937' }}>
					{value}
				</p>
			</div>
		),
		status: (value) => (
			<span
				className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
				style={getSessionStatusStyle(value)}
			>
				{value === 'open' ? <CircleCheck size={14} /> : <CircleDashed size={14} />}
				{getSessionStatusLabel(value)}
			</span>
		),
		aksi: () => (
			<div className="flex items-center justify-center gap-2 flex-wrap">
				<Button asChild variant="outline" className="h-10 px-4 text-sm font-semibold">
					<Link href="/krsmahasiswa/status">Status KRS</Link>
				</Button>

				{isSessionOpen && !isAlreadySubmitted ? (
					<Button
						asChild
						className="h-10 px-4 text-sm font-semibold"
						style={{ backgroundColor: '#015023' }}
					>
						<Link href="/krsmahasiswa/pilih">Mulai Isi</Link>
					</Button>
				) : (
					<Button
						disabled
						className="h-10 px-4 text-sm font-semibold"
						style={{ backgroundColor: '#6B7280' }}
					>
						{isAlreadySubmitted ? 'Sudah Diajukan' : 'Mulai Isi'}
					</Button>
				)}
			</div>
		),
	};

	return (
		<div
			className="min-h-screen flex flex-col relative overflow-hidden"
			style={{ backgroundColor: '#E6EEE9' }}
		>
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10" style={{ backgroundColor: '#015023' }} />
				<div className="absolute top-40 -left-32 w-96 h-96 rounded-full opacity-5" style={{ backgroundColor: '#015023' }} />
				<div className="absolute -bottom-32 right-20 w-80 h-80 rounded-full opacity-[0.08]" style={{ backgroundColor: '#015023' }} />
			</div>

			<Navbar />

			<main className="flex-1 relative z-10">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
					<nav className="flex items-center gap-2 text-sm mb-3" style={{ fontFamily: 'Urbanist, sans-serif' }}>
						<span style={{ color: '#6B7280' }}>Mahasiswa</span>
						<ChevronRight size={14} style={{ color: '#9CA3AF' }} />
						<span style={{ color: '#015023', fontWeight: 600 }}>Pengisian KRS</span>
					</nav>

					<header className="mb-6">
						<h1 className="text-4xl font-bold" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
							Pengisian Kartu Rencana Studi
						</h1>
						<p className="text-lg mt-2" style={{ color: '#7B7B7B', fontFamily: 'Urbanist, sans-serif' }}>
							{quota?.academic_period?.name || 'Periode akademik aktif belum tersedia'}
						</p>
					</header>

					<section
						className="mb-5 p-5 lg:p-6 shadow-md"
						style={{
							borderRadius: '18px',
							backgroundColor: '#015023',
							fontFamily: 'Urbanist, sans-serif',
						}}
					>
						<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
							<div>
								<p className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.82)' }}>
									Status Sesi
								</p>
								<p className="text-2xl lg:text-3xl font-bold text-white mt-1">
									{getSessionStatusLabel(activeSession?.status)}
								</p>
								<p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.82)' }}>
									Dibuka pada {formatDate(activeSession?.opened_at)}
								</p>
							</div>
							<div className="flex gap-3">
								<div className="min-w-[145px] rounded-xl px-4 py-3" style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}>
									<p className="text-xs font-semibold uppercase" style={{ color: '#F3F4F6' }}>
										Kuota Maksimum
									</p>
									<p className="text-2xl font-bold text-white">{quota?.max_sks ?? 0}</p>
								</div>
								<div className="min-w-[145px] rounded-xl px-4 py-3" style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}>
									<p className="text-xs font-semibold uppercase" style={{ color: '#F3F4F6' }}>
										Sisa Kuota
									</p>
									<p className="text-2xl font-bold text-white">{quota?.sks_remaining ?? 0}</p>
								</div>
							</div>
						</div>
					</section>

					<section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
						<div className="bg-white shadow-md rounded-2xl p-4 border border-white/60">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#E6F4EA' }}>
									<BookOpenText size={18} style={{ color: '#015023' }} />
								</div>
								<div>
									<p className="text-xs uppercase font-semibold" style={{ color: '#6B7280' }}>SKS Terpakai</p>
									<p className="text-2xl font-bold" style={{ color: '#015023' }}>
										{quota?.sks_used ?? 0}/{quota?.max_sks ?? 0}
									</p>
								</div>
							</div>
						</div>

						<div className="bg-white shadow-md rounded-2xl p-4 border border-white/60">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FEF7E0' }}>
									<CalendarDays size={18} style={{ color: '#B8860B' }} />
								</div>
								<div>
									<p className="text-xs uppercase font-semibold" style={{ color: '#6B7280' }}>Periode Aktif</p>
									<p className="text-lg font-bold leading-tight" style={{ color: '#015023' }}>
										{quota?.academic_period?.name || '-'}
									</p>
								</div>
							</div>
						</div>
					</section>

					<section
						className="bg-white overflow-hidden mb-5 border shadow-md"
						style={{ borderColor: '#E5E7EB', borderRadius: '18px', fontFamily: 'Urbanist, sans-serif' }}
					>
						<div className="px-6 py-5 border-b" style={{ borderColor: '#E5E7EB' }}>
							<h2 className="text-2xl font-bold" style={{ color: '#015023' }}>Jadwal Pengisian KRS</h2>
							<p className="text-sm mt-1" style={{ color: '#6B7280' }}>
								Gunakan tombol Status KRS untuk melihat progres pengajuan dan Mulai Isi saat sesi terbuka.
							</p>
						</div>

						<DataTable
							columns={sessionColumns}
							data={sessionRows}
							actions={[]}
							pagination={false}
							customRender={sessionRender}
							nomertext="No"
							flatTopCorners
							noRounded
							noShadow
						/>

						<div className="px-6 py-4 border-t" style={{ borderColor: '#E5E7EB' }}>
							<div className="flex items-center gap-2 text-sm" style={{ color: '#166534' }}>
								<Clock4 size={15} />
								<span>
									Periode pengisian KRS hanya bisa dilakukan saat sesi berstatus terbuka.
								</span>
							</div>
						</div>
					</section>

					<section
						className="bg-white shadow-md p-6"
						style={{ borderRadius: '18px', fontFamily: 'Urbanist, sans-serif' }}
					>
						<div className="flex items-center justify-between gap-3 mb-4">
							<h3 className="text-xl font-bold" style={{ color: '#015023' }}>Progress Kuota KRS</h3>
							<span className="text-lg font-semibold" style={{ color: '#015023' }}>
								{quota?.sks_used ?? 0}/{quota?.max_sks ?? 0} SKS
							</span>
						</div>

						<div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: '#E5E7EB' }}>
							<div
								className="h-full rounded-full"
								style={{
									width: `${progress}%`,
									background: 'linear-gradient(90deg, #015023 0%, #16874B 100%)',
								}}
							/>
						</div>

						<p className="text-sm mt-3" style={{ color: '#6B7280' }}>
							Sisa kuota: {quota?.sks_remaining ?? 0} SKS
						</p>
					</section>
				</div>
			</main>

			<Footer />
		</div>
	);
}
