'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
	ArrowLeft, Plus, ChevronDown, Check, X,
	Hourglass, Pencil
} from 'lucide-react';
import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import LoadingEffect from '@/components/ui/loading-effect';
import { useAuth } from '@/lib/auth-context';
import { getDaftarBkd } from '@/lib/bkdApi';

export default function RiwayatBkdPage() {
	const router = useRouter();
	const { user } = useAuth();

	const [bkdList, setBkdList] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [expandedId, setExpandedId] = useState(null);

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		setIsLoading(true);
		try {
			const res = await getDaftarBkd(user?.id_user_si);
			if (res?.data) {
                setBkdList(res.data);
            }
		} catch (err) {
			console.warn('Gagal memuat riwayat BKD:', err);
		} finally {
			setIsLoading(false);
		}
	};

	// Format data
	const formatted = bkdList
		.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
		.map((bkd) => {
			const totalSks =
				parseFloat(bkd.total_sks_pendidikan || 0) +
				parseFloat(bkd.total_sks_penelitian || 0) +
				parseFloat(bkd.total_sks_pengabdian || 0) +
				parseFloat(bkd.total_sks_penunjang || 0);

			let uiStatus = 'draft';
			// mapping db status to ui status
			if (bkd.status === 'disetujui') uiStatus = 'disetujui';
			else if (bkd.status === 'ditolak' || bkd.status === 'revisi') uiStatus = 'ditolak';
			else if (bkd.status === 'diajukan') uiStatus = 'menunggu';

			return {
				id: bkd.id,
				semester: bkd.academicPeriod?.name ?? bkd.academic_period?.name ?? '-',
				tanggalSubmit: bkd.updated_at
					? new Date(bkd.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
					: '-',
				angkaKredit: Math.round(totalSks),
				status: uiStatus,
				catatan: bkd.catatan_manager ?? null,
				raw: bkd,
			};
		});

    // hitung total (tidak menghitung draft)
    const validPengajuan = formatted.filter(f => f.status !== 'draft');
	const totalDiajukan = validPengajuan.length;
	const totalDisetujui = validPengajuan.filter(f => f.status === 'disetujui').length;
	const totalAKDiperoleh = validPengajuan
		.filter(f => f.status === 'disetujui')
		.reduce((sum, f) => sum + f.angkaKredit, 0);

	const toggleExpand = (id) => {
		setExpandedId(prev => (prev === id ? null : id));
	};

	const getStatusBadge = (status) => {
		switch (status) {
			case 'menunggu':
				return (
					<span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold"
						style={{ backgroundColor: '#FDE68A', color: '#92400E' }}>
						<Hourglass size={13} /> Menunggu
					</span>
				);
			case 'disetujui':
				return (
					<span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold"
						style={{ backgroundColor: '#A7F3D0', color: '#065F46' }}>
						<Check size={13} /> Disetujui
					</span>
				);
			case 'ditolak':
				return (
					<span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-white"
						style={{ backgroundColor: '#FCA5A5', color: '#7f1d1d' }}>
						<X size={13} /> Ditolak
					</span>
				);
			case 'draft':
				return (
					<span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold"
						style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>
						Draft
					</span>
				);
			default:
				return null;
		}
	};

	if (isLoading) return <LoadingEffect message="Memuat riwayat BKD..." />;

	return (
		<div className="min-h-screen" style={{ backgroundColor: '#E6EEE9', fontFamily: 'Urbanist, sans-serif' }}>
			<Navbar />
			<div className="container mx-auto px-4 py-6 max-w-5xl">
				{/* Kembali */}
				<button
					onClick={() => router.push('/dosen/angka-kredit')}
					className="flex items-center gap-1.5 text-sm font-bold mb-6 hover:opacity-80 transition"
					style={{ color: '#044B33' }}
				>
					<ArrowLeft size={16} />
					Kembali Ke Dashboard Angka Kredit
				</button>

				{/* Page Title + Button */}
				<div className="flex items-start justify-between mb-8">
					<div>
						<h1 className="text-3xl font-extrabold" style={{ color: '#044B33' }}>
							Riwayat BKD
						</h1>
						<p className="text-base font-semibold mt-1" style={{ color: '#9CA3AF' }}>
							Rekap semua pengajuan Beban Kerja Dosen
						</p>
					</div>
					<button
						onClick={() => router.push('/dosen/angka-kredit/input-bkd')}
						className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 shrink-0"
						style={{ backgroundColor: '#044B33' }}
					>
						+ Input BKD Baru
					</button>
				</div>

				{/* Summary Cards */}
				<div className="grid grid-cols-3 gap-6 mt-8 mb-8">
					{[
						{ value: totalDiajukan, label: 'Total BKD Diajukan', color: '#044B33' },
						{ value: totalDisetujui, label: 'BKD Disetujui', color: '#044B33' },
						{ value: `${totalAKDiperoleh} AK`, label: 'Total AK Diperoleh', color: '#DABC4E' },
					].map((card) => (
						<div
							key={card.label}
							className="bg-white rounded-[20px] py-6 px-4 text-center shadow-sm border border-gray-100 flex flex-col justify-center"
						>
							<p className="text-xl font-extrabold mb-1" style={{ color: card.color }}>
								{card.value}
							</p>
							<p className="text-xs font-semibold" style={{ color: '#9CA3AF' }}>
								{card.label}
							</p>
						</div>
					))}
				</div>

				{/* BKD List */}
				<div className="space-y-5">
					{validPengajuan.length > 0 ? (
						validPengajuan.map((item) => {
							const isExpanded = expandedId === item.id;
							const isDitolak = item.status === 'ditolak';

							return (
								<div key={item.id} className="bg-white rounded-[24px] shadow-sm overflow-hidden">
									{/* Main Row */}
									<div
										className="flex items-center justify-between px-6 py-5 cursor-pointer hover:bg-gray-50 transition"
										onClick={() => toggleExpand(item.id)}
									>
										<div className="flex items-center gap-4">
											{/* Icon */}
											<div
												className="w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0"
												style={{ backgroundColor: '#A7F3D0' }}
											>
												<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M7 18H17V16H7V18ZM7 14H17V12H7V14ZM7 10H14V8H7V10ZM5 22C4.45 22 3.97917 21.8042 3.5875 21.4125C3.19583 21.0208 3 20.55 3 20V4C3 3.45 3.19583 2.97917 3.5875 2.5875C3.97917 2.19583 4.45 2 5 2H19C19.55 2 20.0208 2.19583 20.4125 2.5875C20.8042 2.97917 21 3.45 21 4V20C21 20.55 20.8042 21.0208 20.4125 21.4125C20.0208 21.8042 19.55 22 19 22H5ZM5 20H19V4H5V20Z" fill="#044B33"/>
                                                </svg>
											</div>
											<div>
												<p className="text-base font-bold" style={{ color: '#044B33' }}>
													{item.semester}
												</p>
												<p className="text-xs font-semibold mt-0.5" style={{ color: '#9CA3AF' }}>
													Disubmit: {item.tanggalSubmit}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-6">
											<span className="text-base font-extrabold" style={{ color: '#1F2937' }}>
												+{item.angkaKredit} AK
											</span>
											{getStatusBadge(item.status)}
											<ChevronDown
												size={20}
												className="transition-transform duration-200"
												style={{
													color: '#9CA3AF',
													transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
												}}
											/>
										</div>
									</div>

									{/* Expanded Content (Tolak) */}
									{isExpanded && isDitolak && item.catatan && (
										<div className="mx-6 mb-6 rounded-[20px] p-5 border border-red-200" style={{ backgroundColor: '#FADADA' }}>
											<p className="text-sm font-bold mb-1" style={{ color: '#B91C1C' }}>
												Catatan Manajer (alasan penolakan):
											</p>
											<p className="text-xs font-medium mb-5" style={{ color: '#991B1B' }}>
												{item.catatan}
											</p>
											<button
												onClick={() => router.push('/dosen/angka-kredit/input-bkd')}
												className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
												style={{ backgroundColor: '#044B33' }}
											>
												<Pencil size={15} /> Input Ulang BKD
											</button>
										</div>
									)}

                                    {/* Expanded Content (Disetujui/Menunggu) - show nothing or show rincian, mockup didn't specify for non-rejected, we can leave it empty or show rincian */}
                                    {isExpanded && !isDitolak && (
                                        <div className="px-6 pb-6">
                                            <div className="grid grid-cols-4 gap-4 bg-gray-50 rounded-xl p-4">
												{[
													{ label: 'Pendidikan', value: item.raw.total_sks_pendidikan ?? 0 },
													{ label: 'Penelitian', value: item.raw.total_sks_penelitian ?? 0 },
													{ label: 'Pengabdian', value: item.raw.total_sks_pengabdian ?? 0 },
													{ label: 'Penunjang', value: item.raw.total_sks_penunjang ?? 0 },
												].map((cat) => (
													<div key={cat.label} className="text-center">
														<p className="text-lg font-extrabold" style={{ color: '#044B33' }}>
															{Math.round(parseFloat(cat.value))}
														</p>
														<p className="text-xs" style={{ color: '#9CA3AF' }}>{cat.label}</p>
													</div>
												))}
											</div>
                                        </div>
                                    )}
								</div>
							);
						})
					) : (
						<div className="bg-white rounded-[24px] px-6 py-12 text-center shadow-sm border border-gray-100">
							<p className="text-sm font-semibold mb-1" style={{ color: '#6B7280' }}>
								Belum ada riwayat BKD yang diajukan
							</p>
							<p className="text-xs" style={{ color: '#9CA3AF' }}>
								Mulai input BKD untuk mencatat kegiatan dan otomatis mengajukan ke manager.
							</p>
						</div>
					)}
				</div>
			</div>
			<Footer />
		</div>
	);
}
