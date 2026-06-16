'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
	ArrowLeft, FileText, TrendingUp, Award,
	BookOpen, FlaskConical, Handshake, Puzzle,
	CheckCircle2, XCircle, FolderOpen
} from 'lucide-react';
import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import LoadingEffect from '@/components/ui/loading-effect';
import { useAuth } from '@/lib/auth-context';
import { checkEligibility, getMasterJabatan } from '@/lib/bkdApi';
import { getStaffProfile } from '@/lib/profileApi';

// Target jabatan diambil dari endpoint BE GET /lecturer/bkd/master-jabatan (bukan hardcode).

export default function AngkaKreditPage() {
	const router = useRouter();
	const { user } = useAuth();

	const [profile, setProfile] = useState(null);
	const [eligibility, setEligibility] = useState(null);
	const [masterJabatan, setMasterJabatan] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		setIsLoading(true);
		try {
			const [profileRes, eligibilityRes, masterRes] = await Promise.allSettled([
				getStaffProfile(),
				checkEligibility(user?.id_user_si),
				getMasterJabatan(),
			]);
			if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data);
			if (eligibilityRes.status === 'fulfilled') setEligibility(eligibilityRes.value);
			if (masterRes.status === 'fulfilled') setMasterJabatan(masterRes.value?.data ?? []);
		} catch (err) {
			console.warn('Gagal memuat data:', err);
		} finally {
			setIsLoading(false);
		}
	};

	// === Derived data dari API ===
	const totalAK = eligibility?.total_kum ?? 0;

	// Profil dosen dari staff profile
	const staffData = profile?.staff_data ?? {};
	const dosenName = staffData?.full_name ?? profile?.name ?? user?.name ?? '-';
	const dosenNIP = staffData?.employee_id_number ?? '-';
	const dosenPosition = staffData?.position ?? 'Tenaga Pengajar';

	// Target jabatan berikutnya dari master-jabatan BE (tier terkecil yang masih > totalAK)
	const sortedTiers = [...masterJabatan].filter(j => j.target_kum > 0).sort((a, b) => a.target_kum - b.target_kum);
	const nextTier = sortedTiers.find(j => totalAK < j.target_kum) ?? sortedTiers[sortedTiers.length - 1] ?? null;
	const targetAK = nextTier?.target_kum ?? 0;
	const targetJabatan = nextTier?.jabatan ?? '—';

	const percentage = targetAK > 0 ? Math.min(Math.round((totalAK / targetAK) * 100), 100) : 0;
	const sisaAK = Math.max(targetAK - totalAK, 0);
	const isEligible = (eligibility?.is_eligible ?? false) && totalAK >= targetAK;

	// Pengajuan from eligibility response
	const pengajuan = eligibility?.data_pengajuan ?? null;
	const hasActivePengajuan = pengajuan && pengajuan.status !== 'eligible';
	const jabatanSekarang = pengajuan?.jabatan_sekarang ?? dosenPosition;
	const jabatanTujuan = pengajuan?.jabatan_tujuan ?? targetJabatan;

	const initials = dosenName
		.split(' ')
		.filter(w => w.length > 1)
		.slice(0, 2)
		.map(w => w[0])
		.join('')
		.toUpperCase() || 'D';

	// Rincian AK per kategori dari checkEligibility response
	const rincian = eligibility?.rincian ?? {};
	const rincianCards = [
		{ label: 'Pendidikan & Pengajaran', value: Math.round(rincian.pendidikan ?? 0), icon: BookOpen, color: '#044B33', bgIcon: '#E6EEE9', barColor: '#044B33' },
		{ label: 'Penelitian', value: Math.round(rincian.penelitian ?? 0), icon: FlaskConical, color: '#044B33', bgIcon: '#E6EEE9', barColor: '#044B33' },
		{ label: 'Pengabdian Masyarakat', value: Math.round(rincian.pengabdian ?? 0), icon: Handshake, color: '#044B33', bgIcon: '#E6EEE9', barColor: '#044B33' },
		{ label: 'Penunjang', value: Math.round(rincian.penunjang ?? 0), icon: Puzzle, color: '#DABC4E', bgIcon: '#FEF9E7', barColor: '#DABC4E' },
	];

	if (isLoading) return <LoadingEffect message="Memuat data angka kredit..." />;

	return (
		<div className="min-h-screen" style={{ backgroundColor: '#E6EEE9', fontFamily: 'Urbanist, sans-serif' }}>
			<Navbar />
			<div className="container mx-auto px-4 py-6 max-w-7xl">
				{/* Kembali ke Dashboard */}
				<button
					onClick={() => router.push('/dashboard')}
					className="flex items-center gap-1.5 text-sm font-medium mb-6 hover:opacity-80 transition"
					style={{ color: '#044B33' }}
				>
					<ArrowLeft size={16} />
					Kembali Ke Dashboard
				</button>

				{/* Page Title */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold" style={{ color: '#044B33' }}>
						Dashboard Angka Kredit
					</h1>
					<p className="text-sm mt-1" style={{ color: '#6B7280' }}>
						Kelola BKD dan pantau perkembangan angka kredit Anda
					</p>
				</div>

				{/* Profile + Progress Section */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
					{/* Profile Card */}
					<div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
						<div className="flex items-center gap-4 mb-6">
							<div
								className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0"
								style={{ backgroundColor: '#044B33' }}
							>
								{initials}
							</div>
							<div>
								<h2 className="text-base font-bold" style={{ color: '#1F2937' }}>
									{dosenName}
								</h2>
								<p className="text-xs" style={{ color: '#6B7280' }}>
									{jabatanSekarang}
								</p>
							</div>
						</div>
						<div className="space-y-3">
							{[
								{ label: 'NIP', value: dosenNIP },
								{ label: 'Jabatan', value: jabatanSekarang },
							].map((item) => (
								<div key={item.label} className="flex items-center">
									<span className="text-sm w-28 shrink-0" style={{ color: '#6B7280' }}>{item.label}</span>
									<span className="text-sm font-semibold" style={{ color: '#1F2937' }}>: {item.value}</span>
								</div>
							))}
						</div>
					</div>

					{/* Progress Card — target diambil dari master-jabatan BE */}
					<div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
						<div className="flex items-center justify-between mb-3">
							<div className="flex items-center gap-3">
								<div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#E6EEE9', color: '#044B33' }}>
									<Award size={20} />
								</div>
								<div>
									<h3 className="text-sm font-bold text-gray-800">Progres Menuju {targetJabatan}</h3>
									<p className="text-xs text-gray-500 mt-0.5">{totalAK} dari {targetAK || '—'} AK</p>
								</div>
							</div>
							<p className="text-2xl font-extrabold" style={{ color: '#044B33' }}>{percentage}%</p>
						</div>
						<div className="w-full h-2.5 rounded-full" style={{ backgroundColor: '#E5E7EB' }}>
							<div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%`, backgroundColor: '#044B33' }} />
						</div>
						<p className="text-xs font-semibold text-gray-500 mt-2">
							{isEligible
								? 'Memenuhi syarat — silakan ajukan kenaikan jabatan.'
								: `Kurang ${Math.round(sisaAK)} AK lagi menuju ${targetJabatan}.`}
						</p>

						{/* Action Buttons (Input & Riwayat tetap ada untuk navigasi) */}
						<div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-100">
							<button
								onClick={() => router.push('/dosen/angka-kredit/input-bkd')}
								className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
								style={{ backgroundColor: '#044B33' }}
							>
								<FileText size={15} /> Input BKD
							</button>
							<button
								onClick={() => router.push('/dosen/angka-kredit/riwayat')}
								className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition hover:bg-gray-50"
								style={{ color: '#044B33', borderColor: '#044B33' }}
							>
								<TrendingUp size={15} /> Riwayat BKD
							</button>
							{hasActivePengajuan ? (
								<button
									onClick={() => router.push('/dosen/angka-kredit/pak')}
									className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90 shadow-sm"
									style={{ backgroundColor: '#DABC4E', color: '#044B33' }}
								>
									<BookOpen size={15} strokeWidth={2.5} /> Lacak Dokumen PAK
								</button>
							) : (
								<button
									onClick={() => isEligible ? router.push('/dosen/angka-kredit/pengajuan') : null}
									className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition shadow-sm ${isEligible ? 'hover:opacity-90 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
									style={{ backgroundColor: isEligible ? '#DABC4E' : '#9CA3AF', color: isEligible ? '#044B33' : '#F3F4F6' }}
								>
									<Award size={15} strokeWidth={2.5} /> Ajukan Kenaikan Jabatan
								</button>
							)}
						</div>
					</div>
				</div>

				{/* Eligibility Banner */}
				<div className="rounded-[20px] p-5 mb-8 shadow-sm border"
					style={{
						backgroundColor: isEligible ? '#D1FAE5' : '#FEF3C7',
						borderColor: isEligible ? '#A7F3D0' : '#FDE68A',
					}}>
					<div className="flex items-start gap-3">
						{isEligible ? (
							<CheckCircle2 size={22} style={{ color: hasActivePengajuan ? '#1D4ED8' : '#065F46' }} className="shrink-0 mt-0.5" />
						) : (
							<XCircle size={22} style={{ color: '#92400E' }} className="shrink-0 mt-0.5" />
						)}
						<div>
							<h4 className="text-sm font-bold mb-1"
								style={{ color: isEligible ? (hasActivePengajuan ? '#1D4ED8' : '#065F46') : '#92400E' }}>
								{isEligible
									? (hasActivePengajuan ? 'Pengajuan Kenaikan Jabatan Diproses' : 'Memenuhi Syarat Kenaikan Jabatan')
									: 'Belum Memenuhi Syarat Kenaikan Jabatan'}
							</h4>
							<p className="text-xs" style={{ color: isEligible ? (hasActivePengajuan ? '#1E40AF' : '#047857') : '#B45309' }}>
								{isEligible
									? (hasActivePengajuan ? `Pengajuan kenaikan jabatan ke ${jabatanTujuan} Anda sedang diverifikasi. Silakan lacak statusnya di menu PAK.` : `Anda sudah memenuhi syarat minimum angka kredit. Silakan ajukan kenaikan jabatan ke ${jabatanTujuan}.`)
									: `Anda membutuhkan ${Math.round(sisaAK)} AK lagi untuk mencapai syarat minimum jabatan ${targetJabatan} (min. ${targetAK} AK). Terus input BKD secara rutin setiap semester.`}
							</p>
						</div>
					</div>
				</div>

				{/* Rincian Angka Kredit */}
				<h2 className="text-lg font-bold mb-4" style={{ color: '#1F2937' }}>
					Rincian Angka Kredit
				</h2>
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
					{rincianCards.map((card) => {
						const Icon = card.icon;
						return (
							<div
								key={card.label}
								className="bg-white rounded-[18px] p-5 shadow-sm border border-gray-100"
							>
								<div
									className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
									style={{ backgroundColor: card.bgIcon }}
								>
									<Icon size={20} style={{ color: card.color }} />
								</div>
								<p className="text-3xl font-extrabold mb-1" style={{ color: card.color }}>
									{card.value}
								</p>
								<p className="text-xs font-medium mb-3" style={{ color: '#6B7280' }}>
									{card.label}
								</p>
								<div className="w-full h-2 rounded-full" style={{ backgroundColor: '#E5E7EB' }}>
									<div
										className="h-full rounded-full transition-all duration-500"
										style={{ width: `${totalAK > 0 ? Math.min(Math.round((card.value / totalAK) * 100), 100) : 0}%`, backgroundColor: card.barColor }}
									/>
								</div>
							</div>
						);
					})}
				</div>

				{/* Dokumen PAK Card */}
				<div className="rounded-[20px] p-6 shadow-sm mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
					style={{ backgroundColor: '#044B33' }}>
					<div>
						<h3 className="text-base font-bold text-white mb-1">
							Dokumen PAK (Penetapan Angka Kredit)
						</h3>
						<p className="text-xs" style={{ color: '#A7F3D0' }}>
							{hasActivePengajuan ? 'Pengajuan Anda sedang diproses. Buka menu untuk melacak status atau melihat arsip.' : 'Belum ada PAK baru yang diproses. Buka menu untuk melihat arsip periode sebelumnya.'}
						</p>
					</div>
					<button
						onClick={() => router.push('/dosen/angka-kredit/pak')}
						className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition hover:opacity-90 shrink-0"
						style={{ backgroundColor: '#DABC4E', color: '#044B33' }}
					>
						<FolderOpen size={16} /> Buka Menu PAK
					</button>
				</div>
			</div>
			<Footer />
		</div>
	);
}
