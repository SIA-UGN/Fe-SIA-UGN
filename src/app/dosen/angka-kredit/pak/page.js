'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
	ArrowLeft, Clock, Download, Printer, FileText, CheckCircle2, Loader2,
} from 'lucide-react';
import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import LoadingEffect from '@/components/ui/loading-effect';
import { useAuth } from '@/lib/auth-context';
import { checkEligibility, cetakPak, getMasterJabatan } from '@/lib/bkdApi';
import { getStaffProfile } from '@/lib/profileApi';

const dash = (v) => (v === null || v === undefined || v === '') ? '-' : v;

const RINCIAN_ROWS = [
	{ key: 'pendidikan', kode: 'A', label: 'Pendidikan & Pengajaran' },
	{ key: 'penelitian', kode: 'B', label: 'Penelitian & Karya Ilmiah' },
	{ key: 'pengabdian', kode: 'C', label: 'Pengabdian kepada Masyarakat' },
	{ key: 'penunjang',  kode: 'D', label: 'Penunjang Tri Dharma' },
];

export default function PakPage() {
	const router = useRouter();
	const { user } = useAuth();
	const [isLoading, setIsLoading] = useState(true);
	const [isDownloading, setIsDownloading] = useState(false);
	const [eligibility, setEligibility] = useState(null);
	const [profile, setProfile] = useState(null);
	const [masterJabatan, setMasterJabatan] = useState([]);

	useEffect(() => {
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
				console.error('Failed to fetch data:', err);
			} finally {
				setIsLoading(false);
			}
		};
		fetchData();
	}, [user]);

	if (isLoading) return <LoadingEffect message="Memuat Status PAK..." />;

	// ── Data nyata dari BE; field yang BE tak sediakan ditampilkan strip "-" ──
	const pengajuan = eligibility?.data_pengajuan ?? null;
	const isVerified = ['divalidasi_manager', 'disetujui', 'disetujui_pak'].includes(pengajuan?.status);
	const hasActivePengajuan = pengajuan && pengajuan.status !== 'eligible';

	const staffData = profile?.staff_data ?? {};
	const dosenName = staffData?.full_name ?? profile?.name ?? user?.name ?? '-';
	const dosenNIP = staffData?.employee_id_number ?? '-';
	const jabatanSekarang = pengajuan?.jabatan_sekarang ?? staffData?.position ?? 'Tenaga Pengajar';
	const prodi = staffData?.nama_program ?? profile?.nama_program ?? '-';

	const rincian = eligibility?.rincian ?? {};
	const totalAK = Number(eligibility?.total_kum ?? pengajuan?.total_kum ?? 0);

	const sortedTiers = [...masterJabatan].filter(j => j.target_kum > 0).sort((a, b) => a.target_kum - b.target_kum);
	const nextTier = sortedTiers.find(j => totalAK < j.target_kum) ?? sortedTiers[sortedTiers.length - 1] ?? null;
	const jabatanTujuan = pengajuan?.jabatan_tujuan ?? nextTier?.jabatan ?? '-';

	const tanggalCetak = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

	const handleDownloadPak = async () => {
		if (!pengajuan?.id_pengajuan) return;
		setIsDownloading(true);
		try {
			const blob = await cetakPak(pengajuan.id_pengajuan);
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `Dokumen_PAK_${String(dosenName).replace(/\s+/g, '_')}.pdf`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			window.URL.revokeObjectURL(url);
		} catch (err) {
			alert('Gagal mengunduh dokumen PAK. Pastikan pengajuan sudah disetujui manajer.');
		} finally {
			setIsDownloading(false);
		}
	};

	return (
		<div className="min-h-screen flex flex-col" style={{ backgroundColor: '#E6EEE9', fontFamily: 'Urbanist, sans-serif' }}>
			<Navbar />
			<main className="flex-grow max-w-4xl w-full mx-auto px-4 py-8">
				<button
					onClick={() => router.push('/dosen/angka-kredit')}
					className="flex items-center gap-2 text-sm font-semibold mb-6 transition opacity-70 hover:opacity-100"
					style={{ color: '#044B33' }}
				>
					<ArrowLeft size={16} /> Kembali ke Dashboard Angka Kredit
				</button>

				{!isVerified ? (
					// ── PENDING / BELUM ADA PENGAJUAN ──
					<div className="max-w-2xl mx-auto bg-white rounded-[24px] p-10 text-center shadow-sm border border-gray-100">
						{hasActivePengajuan ? (
							<>
								<div className="w-20 h-20 rounded-full mx-auto bg-amber-50 flex items-center justify-center mb-6">
									<Clock size={40} className="text-amber-500" strokeWidth={2} />
								</div>
								<h1 className="text-2xl font-extrabold mb-3" style={{ color: '#1F2937' }}>Pengajuan Sedang Diverifikasi</h1>
								<p className="text-sm mb-8 leading-relaxed max-w-md mx-auto" style={{ color: '#6B7280' }}>
									Dokumen PAK akan terbit setelah pengajuan kenaikan jabatan Anda disetujui manajer.
								</p>
								{pengajuan?.catatan_manager && (
									<div className="bg-gray-50 rounded-2xl p-4 text-left max-w-md mx-auto mb-8 border border-gray-100">
										<p className="text-xs font-bold mb-1" style={{ color: '#6B7280' }}>Catatan manajer</p>
										<p className="text-sm" style={{ color: '#374151' }}>{pengajuan.catatan_manager}</p>
									</div>
								)}
								<button disabled className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-gray-100 text-gray-400 cursor-not-allowed">
									Menunggu Validasi Manager
								</button>
							</>
						) : (
							<>
								<div className="w-20 h-20 rounded-full mx-auto bg-gray-50 flex items-center justify-center mb-6">
									<FileText size={40} className="text-gray-400" strokeWidth={2} />
								</div>
								<h1 className="text-2xl font-extrabold mb-3" style={{ color: '#1F2937' }}>Belum Ada Pengajuan PAK</h1>
								<p className="text-sm mb-8 leading-relaxed max-w-md mx-auto" style={{ color: '#6B7280' }}>
									Anda belum memiliki pengajuan kenaikan jabatan yang diproses. Ajukan kenaikan jabatan dari dashboard bila sudah memenuhi syarat.
								</p>
								<button onClick={() => router.push('/dosen/angka-kredit')} className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-green-50 text-green-700 hover:bg-green-100 transition">
									Pindah ke Dashboard
								</button>
							</>
						)}
					</div>
				) : (
					// ── DISETUJUI: dokumen PAK lengkap (data nyata; field BE tak ada = "-") ──
					<div>
						<div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
							<div>
								<h1 className="text-2xl font-extrabold" style={{ color: '#044B33' }}>Dokumen PAK</h1>
								<p className="text-sm" style={{ color: '#6B7280' }}>Penetapan Angka Kredit Jabatan Fungsional Dosen</p>
							</div>
							<button onClick={handleDownloadPak} disabled={isDownloading}
								className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition hover:opacity-90 shadow-sm disabled:opacity-50"
								style={{ backgroundColor: '#DABC4E', color: '#044B33' }}>
								{isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} strokeWidth={2.5} />}
								{isDownloading ? 'Menyiapkan...' : 'Cetak/Unduh PDF'}
							</button>
						</div>

						{/* Kertas PAK */}
						<div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
							{/* Header hijau */}
							<div className="px-8 py-6 flex items-center justify-between" style={{ backgroundColor: '#044B33' }}>
								<div className="flex items-center gap-4">
									<div className="w-12 h-12 flex items-center justify-center">
										<img src="/logo_ugn.png" alt="Logo UGN" className="w-full h-full object-contain" onError={(e) => e.target.style.display = 'none'} />
									</div>
									<div className="text-white">
										<h2 className="text-lg font-bold" style={{ color: '#FDE68A' }}>Universitas Global Nusantara</h2>
										<p className="text-xs opacity-80 mt-0.5">Penetapan Angka Kredit · No. -</p>
									</div>
								</div>
								<div className="text-right text-white">
									<p className="text-[10px] opacity-80 uppercase mb-0.5">Tanggal</p>
									<p className="text-sm font-bold">{tanggalCetak}</p>
								</div>
							</div>

							<div className="p-8 md:p-10">
								{/* Info dosen */}
								<div className="border rounded-2xl p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8" style={{ borderColor: '#E5E7EB' }}>
									{[
										['Nama Lengkap', dosenName],
										['NIP / NIDN', dosenNIP],
										['Jabatan Fungsional', jabatanSekarang],
										['Pangkat / Golongan', '-'],
										['Program Studi', prodi],
										['Periode Penilaian', '-'],
									].map(([label, value]) => (
										<div key={label}>
											<p className="text-xs font-semibold text-gray-400 mb-1">{label}</p>
											<p className="text-sm font-semibold break-words" style={{ color: '#1F2937' }}>{dash(value)}</p>
										</div>
									))}
								</div>

								{/* Tabel rincian */}
								<h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Rincian Angka Kredit</h3>
								<div className="border rounded-xl overflow-hidden mb-3" style={{ borderColor: '#044B33' }}>
									<table className="w-full text-left text-sm">
										<thead style={{ backgroundColor: '#044B33' }} className="text-white">
											<tr>
												<th className="px-6 py-4 font-semibold text-xs">Unsur Penilaian</th>
												<th className="px-6 py-4 font-semibold text-xs text-center">AK Lama</th>
												<th className="px-6 py-4 font-semibold text-xs text-center">AK Baru</th>
												<th className="px-6 py-4 font-semibold text-xs text-center">Selisih</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-100">
											{RINCIAN_ROWS.map((row) => (
												<tr key={row.key} className="bg-white">
													<td className="px-6 py-4 font-medium text-gray-800 text-xs">
														<span className="font-bold mr-3">{row.kode}</span>{row.label}
													</td>
													<td className="px-6 py-4 text-center text-gray-400">-</td>
													<td className="px-6 py-4 text-center font-bold" style={{ color: '#F59E0B' }}>{Math.round(Number(rincian[row.key] ?? 0))}</td>
													<td className="px-6 py-4 text-center text-gray-400">-</td>
												</tr>
											))}
										</tbody>
										<tfoot style={{ backgroundColor: '#064E3B' }} className="text-white font-bold">
											<tr>
												<td className="px-6 py-4 tracking-widest text-xs">TOTAL</td>
												<td className="px-6 py-4 text-center opacity-70 border-l border-green-800">-</td>
												<td className="px-6 py-4 text-center text-yellow-400 border-l border-green-800">{Math.round(totalAK)}</td>
												<td className="px-6 py-4 text-center border-l border-green-800">-</td>
											</tr>
										</tfoot>
									</table>
								</div>
								<p className="text-[11px] text-gray-400 mb-10">AK Lama & Selisih belum tersedia (sistem belum menyimpan riwayat PAK sebelumnya).</p>

								{/* Box kenaikan jabatan */}
								<div className="rounded-xl border border-green-100 mb-10" style={{ backgroundColor: '#F0FDF4' }}>
									<div className="px-6 py-3 border-b border-green-200" style={{ backgroundColor: '#D1FAE5' }}>
										<p className="text-xs font-bold text-green-800">DISETUJUI – KENAIKAN JABATAN FUNGSIONAL</p>
									</div>
									<div className="p-6 text-center">
										<p className="text-sm text-gray-700 mb-6 font-medium">Berdasarkan total AK kumulatif sebesar <strong className="text-gray-900">{Math.round(totalAK)} AK</strong>, ditetapkan kenaikan jabatan fungsional:</p>
										<div className="flex flex-wrap justify-center items-center gap-4 mb-2">
											<div className="flex flex-col items-center justify-center py-4 px-8 bg-white border border-gray-100 rounded-xl shadow-sm w-48">
												<span className="text-[10px] uppercase text-gray-400 font-bold mb-2">Jabatan Lama</span>
												<span className="text-sm font-extrabold text-gray-900">{dash(jabatanSekarang)}</span>
											</div>
											<ArrowLeft size={20} className="text-gray-300 rotate-180" strokeWidth={2} />
											<div className="flex flex-col items-center justify-center py-4 px-8 border border-green-100 rounded-xl shadow-sm w-48" style={{ backgroundColor: '#ECFDF5' }}>
												<span className="text-[10px] uppercase text-emerald-600 font-bold mb-2">Jabatan Baru</span>
												<span className="text-sm font-extrabold text-emerald-900">{dash(jabatanTujuan)}</span>
											</div>
										</div>
									</div>
								</div>

								{/* Tanda tangan */}
								<div className="flex justify-between items-end">
									<div>
										<p className="text-sm text-gray-600 mb-16">Nusantara, {tanggalCetak}<br />Rektor,</p>
										<p className="text-sm font-bold text-gray-800">-</p>
										<p className="text-xs text-gray-500">NIP. -</p>
									</div>
								</div>
							</div>

							<div className="py-4 text-center text-[11px] text-white" style={{ backgroundColor: '#D1D5DB' }}>
								Dicetak pada {tanggalCetak} · Dokumen dibuat otomatis oleh Sistem Informasi Akademik UGN
							</div>
						</div>

						{/* Banner + unduh */}
						<div className="rounded-2xl p-5 mb-6 flex items-start gap-3 border" style={{ backgroundColor: '#D1FAE5', borderColor: '#A7F3D0' }}>
							<CheckCircle2 size={22} style={{ color: '#065F46' }} className="shrink-0 mt-0.5" />
							<div>
								<h4 className="text-sm font-bold mb-0.5" style={{ color: '#065F46' }}>Pengajuan Disetujui Manajer</h4>
								<p className="text-xs" style={{ color: '#047857' }}>Unduh dokumen PAK resmi (PDF) yang ditandatangani lewat tombol di bawah.</p>
							</div>
						</div>
						<button onClick={handleDownloadPak} disabled={isDownloading}
							className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold transition hover:opacity-90 disabled:opacity-50 mb-6"
							style={{ backgroundColor: '#044B33', color: '#fff' }}>
							{isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} strokeWidth={2.5} />}
							Unduh Dokumen PAK Resmi (PDF)
						</button>

						{/* Arsip */}
						<div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-10 p-5">
							<div className="flex items-center gap-3 mb-2">
								<FileText size={16} className="text-green-800" />
								<h3 className="text-sm font-bold text-gray-800">Arsip PAK Sebelumnya</h3>
							</div>
							<p className="text-sm text-gray-400">Belum ada arsip PAK sebelumnya.</p>
						</div>
					</div>
				)}
			</main>
			<Footer />
		</div>
	);
}
