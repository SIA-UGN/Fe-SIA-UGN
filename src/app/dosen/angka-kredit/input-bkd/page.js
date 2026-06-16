'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
	ArrowLeft, Plus, Trash2, Upload, ChevronLeft, Check,
	BookOpen, FlaskConical, Handshake, Star, Lock, Loader2, AlertCircle
} from 'lucide-react';
import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import { storeKegiatanBkd, submitFinalisasi, getMasterKegiatanBkd } from '@/lib/bkdApi';
import { useAuth } from '@/lib/auth-context';

// Ikon per kategori (presentasi saja). Data kegiatan + nilai AK diambil dari BE
// (GET /lecturer/bkd/master-kegiatan) — TIDAK di-hardcode di FE.
const KATEGORI_ICONS = {
	Pendidikan: BookOpen,
	Penelitian: FlaskConical,
	Pengabdian: Handshake,
	Penunjang: Star,
};

const createEmptyKegiatan = () => ({
	id: Date.now() + Math.random(),
	jenisIndex: '',
	jumlah: 1,
	file: null,
});

export default function InputBkdPage() {
	const router = useRouter();
	const { user } = useAuth();
	const [currentStep, setCurrentStep] = useState(0);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [totalSubmitted, setTotalSubmitted] = useState(0);

	// Katalog kegiatan dari BE
	const [kategoriSteps, setKategoriSteps] = useState([]);
	const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
	const [catalogError, setCatalogError] = useState(null);

	// State kegiatan per kategori (diinisialisasi setelah katalog termuat)
	const [kegiatanPerKategori, setKegiatanPerKategori] = useState([]);

	useEffect(() => {
		const loadCatalog = async () => {
			setIsLoadingCatalog(true);
			setCatalogError(null);
			try {
				const res = await getMasterKegiatanBkd();
				const data = (res?.data ?? []).map(c => ({
					...c,
					icon: KATEGORI_ICONS[c.key] ?? Star,
				}));
				setKategoriSteps(data);
				setKegiatanPerKategori(data.map(() => [createEmptyKegiatan()]));
			} catch (err) {
				setCatalogError(err?.message ?? 'Gagal memuat daftar jenis kegiatan dari server.');
			} finally {
				setIsLoadingCatalog(false);
			}
		};
		loadCatalog();
	}, []);

	const step = kategoriSteps[currentStep];
	const StepIcon = step?.icon ?? Star;
	const kegiatanList = kegiatanPerKategori[currentStep] ?? [];

	// === Helpers ===
	const getOption = (stepIdx, jenisIndex) => {
		if (jenisIndex === '' || jenisIndex === undefined) return null;
		return kategoriSteps[stepIdx]?.options?.[parseInt(jenisIndex)] ?? null;
	};

	const getKegiatanAK = (stepIdx, kegiatan) => {
		const opt = getOption(stepIdx, kegiatan.jenisIndex);
		if (!opt) return 0;
		return kegiatan.jumlah * opt.ak_per_satuan;
	};

	const getSubtotal = (stepIdx) => {
		return (kegiatanPerKategori[stepIdx] ?? []).reduce((sum, k) => sum + getKegiatanAK(stepIdx, k), 0);
	};

	const getTotalAK = () => {
		return kategoriSteps.reduce((sum, _, idx) => sum + getSubtotal(idx), 0);
	};

	// === Handlers ===
	const updateKegiatan = (kegiatanId, field, value) => {
		setKegiatanPerKategori(prev => {
			const updated = [...prev];
			updated[currentStep] = updated[currentStep].map(k =>
				k.id === kegiatanId ? { ...k, [field]: value } : k
			);
			return updated;
		});
	};

	const addKegiatan = () => {
		setKegiatanPerKategori(prev => {
			const updated = [...prev];
			updated[currentStep] = [...updated[currentStep], createEmptyKegiatan()];
			return updated;
		});
	};

	const removeKegiatan = (kegiatanId) => {
		setKegiatanPerKategori(prev => {
			const updated = [...prev];
			if (updated[currentStep].length <= 1) return prev;
			updated[currentStep] = updated[currentStep].filter(k => k.id !== kegiatanId);
			return updated;
		});
	};

	const handleNext = () => {
		if (currentStep < kategoriSteps.length - 1) {
			setCurrentStep(prev => prev + 1);
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	};

	const handlePrev = () => {
		if (currentStep > 0) {
			setCurrentStep(prev => prev - 1);
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	};

	const handleSubmit = async () => {
		setIsSubmitting(true);
		try {
			// Kirim setiap kegiatan ke BE satu per satu (multipart agar bukti ikut terkirim).
			for (let stepIdx = 0; stepIdx < kategoriSteps.length; stepIdx++) {
				const kategori = kategoriSteps[stepIdx].key;
				for (const kegiatan of kegiatanPerKategori[stepIdx]) {
					const opt = getOption(stepIdx, kegiatan.jenisIndex);
					if (!opt) continue; // skip yang belum dipilih
					const totalSks = kegiatan.jumlah * opt.ak_per_satuan;

					const fd = new FormData();
					fd.append('id_user_si', user?.id_user_si ?? '');
					fd.append('kategori', kategori);
					fd.append('nama_kegiatan', opt.label);
					fd.append('volume', kegiatan.jumlah);
					fd.append('satuan', opt.satuan);
					fd.append('ak_per_satuan', opt.ak_per_satuan);
					fd.append('sks_beban', totalSks);
					if (kegiatan.file) fd.append('bukti', kegiatan.file);

					await storeKegiatanBkd(fd);
				}
			}

			// Finalisasi pengajuan ke manager
			if (getTotalAK() > 0) {
				await submitFinalisasi(user?.id_user_si);
			}

			setTotalSubmitted(getTotalAK());
			setIsSuccess(true);
			setTimeout(() => router.push('/dosen/angka-kredit'), 3000);
		} catch (err) {
			alert(err?.message ?? 'Gagal submit BKD. Silakan coba lagi.');
		} finally {
			setIsSubmitting(false);
		}
	};

	// === Loading / Error katalog ===
	if (isLoadingCatalog) {
		return (
			<div className="min-h-screen" style={{ backgroundColor: '#E6EEE9', fontFamily: 'Urbanist, sans-serif' }}>
				<Navbar />
				<div className="flex flex-col items-center justify-center py-32 gap-3 text-gray-500">
					<Loader2 size={36} className="animate-spin" style={{ color: '#044B33' }} />
					<p className="text-sm font-semibold">Memuat daftar jenis kegiatan...</p>
				</div>
			</div>
		);
	}

	if (catalogError || kategoriSteps.length === 0) {
		return (
			<div className="min-h-screen" style={{ backgroundColor: '#E6EEE9', fontFamily: 'Urbanist, sans-serif' }}>
				<Navbar />
				<div className="container mx-auto px-4 py-20 max-w-xl">
					<div className="bg-white rounded-2xl p-10 border border-red-100 flex flex-col items-center text-center">
						<AlertCircle size={28} className="text-red-400 mb-3" />
						<h3 className="text-base font-bold text-gray-700 mb-1">Gagal Memuat Data</h3>
						<p className="text-sm text-gray-500 mb-6 max-w-sm">{catalogError ?? 'Daftar jenis kegiatan kosong.'}</p>
						<button onClick={() => router.push('/dosen/angka-kredit')} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: '#044B33' }}>
							Kembali ke Dashboard
						</button>
					</div>
				</div>
			</div>
		);
	}

	// === Success Page ===
	if (isSuccess) {
		return (
			<div className="min-h-screen relative" style={{ backgroundColor: '#E6EEE9', fontFamily: 'Urbanist, sans-serif' }}>
				<Navbar />

				{/* Floating Toast */}
				<div
					className="absolute right-8 top-24 rounded-[12px] p-4 flex items-start gap-4 shadow-md z-50 animate-fade-in-down max-w-sm"
					style={{ backgroundColor: '#E2EBE5', border: '1px solid #7D9F8D' }}
				>
					<div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: '#044B33' }}>
						<Check size={12} strokeWidth={3} style={{ color: '#fff' }} />
					</div>
					<div>
						<p className="text-xs font-bold mb-1" style={{ color: '#044B33' }}>
							BKD berhasil disubmit! Menunggu validasi manajer.
						</p>
						<p className="text-xs" style={{ color: '#044B33', opacity: 0.8 }}>
							Anda akan mendapat notifikasi setelah manajer memvalidasi BKD Anda.
						</p>
					</div>
				</div>

				<div className="container mx-auto px-4 py-32 max-w-xl text-center flex flex-col items-center justify-center h-[calc(100vh-80px)]">
					<div className="w-24 h-24 rounded-full mx-auto mb-8 flex items-center justify-center animate-bounce-short"
						style={{ backgroundColor: '#B8CDBF' }}>
						<Check size={50} strokeWidth={3} style={{ color: '#044B33' }} />
					</div>

					<h1 className="text-3xl font-bold mb-5" style={{ color: '#044B33' }}>
						BKD Berhasil Disubmit!
					</h1>

					<p className="text-[15px] mb-3" style={{ color: '#6B7280' }}>
						Total Angka Kredit yang diajukan: <strong style={{ color: '#044B33' }}>{totalSubmitted.toFixed(1)} AK</strong>
					</p>

					<p className="text-sm mb-6" style={{ color: '#6B7280' }}>
						Status: <span style={{ color: '#D4AF37' }} className="font-bold">Menunggu Validasi Manager</span>
					</p>

					<p className="text-xs mt-6" style={{ color: '#9CA3AF' }}>
						Mengalihkan ke dashboard...
					</p>
				</div>
			</div>
		);
	}

	// === Main Form ===
	return (
		<div className="min-h-screen" style={{ backgroundColor: '#E6EEE9', fontFamily: 'Urbanist, sans-serif' }}>
			<Navbar />
			<div className="container mx-auto px-4 py-6 max-w-4xl">
				{/* Kembali */}
				<button
					onClick={() => router.push('/dosen/angka-kredit')}
					className="flex items-center gap-1.5 text-sm font-medium mb-4 hover:opacity-80 transition"
					style={{ color: '#044B33' }}
				>
					<ArrowLeft size={16} />
					Kembali Ke Dashboard Angka Kredit
				</button>

				{/* Page Title */}
				<h1 className="text-2xl font-bold mb-1" style={{ color: '#044B33' }}>
					Input BKD (Beban Kerja Dosen)
				</h1>
				<p className="text-sm mb-6" style={{ color: '#6B7280' }}>
					Periode akademik aktif
				</p>

				{/* Info Banner */}
				<div className="rounded-[16px] px-5 py-4 mb-8" style={{ backgroundColor: '#044B33' }}>
					<p className="text-xs text-white leading-relaxed">
						Pilih jenis kegiatan dari daftar yang tersedia. Nilai AK per satuan ditetapkan sistem (acuan Permenpan-RB) dan tidak dapat diubah manual untuk mencegah kesalahan input.
					</p>
				</div>

				{/* Step Indicator */}
				<div className="flex items-center justify-center gap-8 mb-8">
					{kategoriSteps.map((s, idx) => {
						const Icon = s.icon;
						const isActive = idx === currentStep;
						const isDone = idx < currentStep;
						return (
							<div
								key={s.key}
								className="flex flex-col items-center gap-2 cursor-pointer"
								onClick={() => setCurrentStep(idx)}
							>
								<div
									className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300"
									style={{ backgroundColor: isActive || isDone ? '#044B33' : '#E5E7EB' }}
								>
									<Icon size={22} style={{ color: isActive || isDone ? 'white' : '#9CA3AF' }} />
								</div>
								<span className="text-xs font-medium text-center max-w-[100px]"
									style={{ color: isActive ? '#044B33' : '#9CA3AF' }}>
									{s.label}
								</span>
							</div>
						);
					})}
				</div>

				{/* Step Content */}
				<div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 mb-6">
					<div className="flex items-center gap-3 mb-6">
						<div className="w-10 h-10 rounded-full flex items-center justify-center"
							style={{ backgroundColor: '#E6EEE9' }}>
							<StepIcon size={20} style={{ color: '#044B33' }} />
						</div>
						<h2 className="text-lg font-bold" style={{ color: '#1F2937' }}>
							Langkah {currentStep + 1} dari {kategoriSteps.length}: {step.label}
						</h2>
					</div>

					{/* Kegiatan List */}
					<div className="space-y-6">
						{kegiatanList.map((kegiatan, kIdx) => {
							const selectedOpt = getOption(currentStep, kegiatan.jenisIndex);
							const totalAKKegiatan = getKegiatanAK(currentStep, kegiatan);
							return (
								<div key={kegiatan.id} className="rounded-[16px] border p-5" style={{ borderColor: '#E5E7EB' }}>
									{/* Header */}
									<div className="flex items-center justify-between mb-4">
										<span className="text-xs font-bold tracking-wider" style={{ color: '#6B7280' }}>
											KEGIATAN #{kIdx + 1}
										</span>
										{kegiatanList.length > 1 && (
											<button
												onClick={() => removeKegiatan(kegiatan.id)}
												className="p-1.5 rounded-lg hover:bg-red-50 transition"
											>
												<Trash2 size={16} style={{ color: '#EF4444' }} />
											</button>
										)}
									</div>

									{/* Jenis Kegiatan Dropdown */}
									<div className="mb-4">
										<label className="text-xs font-medium mb-1.5 block" style={{ color: '#6B7280' }}>
											Jenis Kegiatan
										</label>
										<select
											value={kegiatan.jenisIndex}
											onChange={(e) => updateKegiatan(kegiatan.id, 'jenisIndex', e.target.value)}
											className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 transition"
											style={{ borderColor: '#D1D5DB', color: '#1F2937' }}
										>
											<option value="">-- Pilih jenis kegiatan --</option>
											{step.options.map((opt, optIdx) => (
												<option key={optIdx} value={optIdx}>
													{opt.label}
												</option>
											))}
										</select>
									</div>

									{/* Jumlah + AK per Satuan */}
									<div className="grid grid-cols-2 gap-4 mb-4">
										<div>
											<label className="text-xs font-medium mb-1.5 block" style={{ color: '#6B7280' }}>
												Jumlah {selectedOpt ? `(satuan: ${selectedOpt.satuan})` : ''}
											</label>
											<input
												type="number"
												min="1"
												value={kegiatan.jumlah}
												onChange={(e) => updateKegiatan(kegiatan.id, 'jumlah', Math.max(1, parseInt(e.target.value) || 1))}
												className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 transition"
												style={{ borderColor: '#D1D5DB' }}
											/>
										</div>
										<div>
											<label className="text-xs font-medium mb-1.5 flex items-center gap-1" style={{ color: '#6B7280' }}>
												<Lock size={11} /> AK per Satuan (otomatis sistem)
											</label>
											<div className="border rounded-xl px-4 py-3 text-sm"
												style={{ backgroundColor: '#044B33', color: 'white', borderColor: '#044B33' }}>
												{selectedOpt ? `${selectedOpt.ak_per_satuan} AK / ${selectedOpt.satuan}` : 'Pilih kegiatan dulu'}
											</div>
										</div>
									</div>

									{/* Total AK Kegiatan */}
									<div className="mb-4">
										<label className="text-xs font-medium mb-1.5 block" style={{ color: '#6B7280' }}>
											Total AK Kegiatan Ini
										</label>
										<div className="rounded-xl px-4 py-3 text-sm font-semibold flex items-center justify-between"
											style={{ backgroundColor: '#044B33', color: 'white' }}>
											<span>
												{selectedOpt
													? `${kegiatan.jumlah} × ${selectedOpt.ak_per_satuan} AK`
													: '—'}
											</span>
											<span>{totalAKKegiatan.toFixed(1)} AK</span>
										</div>
									</div>

									{/* Upload Bukti */}
									<div>
										<label className="text-xs font-medium mb-1.5 block" style={{ color: '#6B7280' }}>
											Upload Bukti Dokumen (PDF, opsional)
										</label>
										<label className="flex items-center gap-2 border-2 border-dashed rounded-xl px-4 py-3 cursor-pointer hover:border-green-400 transition text-sm"
											style={{ borderColor: '#D1D5DB', color: '#9CA3AF' }}>
											<Upload size={16} />
											{kegiatan.file
												? <span style={{ color: '#1F2937' }}>{kegiatan.file.name}</span>
												: 'Klik untuk upload bukti (PDF)'}
											<input
												type="file"
												className="hidden"
												accept=".pdf"
												onChange={(e) => updateKegiatan(kegiatan.id, 'file', e.target.files?.[0] ?? null)}
											/>
										</label>
									</div>
								</div>
							);
						})}
					</div>

					{/* Tambah Kegiatan */}
					<button
						onClick={addKegiatan}
						className="w-full mt-4 flex items-center justify-center gap-2 border-2 border-dashed rounded-xl py-3 text-sm font-medium hover:border-green-400 hover:bg-green-50 transition"
						style={{ borderColor: '#D1D5DB', color: '#6B7280' }}
					>
						<Plus size={16} /> Tambah Kegiatan
					</button>

					{/* Subtotal */}
					<div className="mt-6 rounded-xl px-5 py-3 flex items-center justify-between"
						style={{ backgroundColor: '#E6EEE9' }}>
						<span className="text-sm font-semibold" style={{ color: '#044B33' }}>
							Total AK Khusus {step.label}
						</span>
						<span className="text-sm font-bold" style={{ color: '#044B33' }}>
							{getSubtotal(currentStep).toFixed(1)} AK
						</span>
					</div>
				</div>
			</div>

			{/* Sticky Bottom Bar */}
			<div className="sticky bottom-0 w-full border-t border-gray-200 z-40 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
				<div className="container mx-auto px-4 py-4 max-w-4xl flex items-center justify-between">
					<div>
						<p className="text-xs font-semibold" style={{ color: '#6B7280' }}>Total AK Smt Ini (Semua Kategori)</p>
						<p className="text-2xl font-extrabold" style={{ color: '#044B33' }}>
							{getTotalAK().toFixed(1)} <span className="text-sm font-semibold text-gray-500">AK</span>
						</p>
					</div>
					<div className="flex items-center gap-3">
						{currentStep > 0 && (
							<button
								onClick={handlePrev}
								className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 hover:bg-gray-200 transition"
								style={{ color: '#4B5563' }}
							>
								<ChevronLeft size={16} /> Sebelumnya
							</button>
						)}
						{currentStep < kategoriSteps.length - 1 ? (
							<button
								onClick={handleNext}
								className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 shadow-sm shadow-emerald-900/20"
								style={{ backgroundColor: '#044B33' }}
							>
								Selanjutnya
							</button>
						) : (
							<button
								onClick={handleSubmit}
								disabled={isSubmitting}
								className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 shadow-sm shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
								style={{ backgroundColor: '#044B33' }}
							>
								{isSubmitting ? 'Mengirim...' : 'Submit BKD'}
							</button>
						)}
					</div>
				</div>
			</div>

			<Footer />
		</div>
	);
}
