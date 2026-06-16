'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, Check, ShieldCheck, Upload as UploadIcon, X,
    CheckCircle2, AlertCircle, FileText
} from 'lucide-react';
import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import LoadingEffect from '@/components/ui/loading-effect';
import { useAuth } from '@/lib/auth-context';
import { checkEligibility, submitPengajuan, getMasterJabatan } from '@/lib/bkdApi';
import { getStaffProfile } from '@/lib/profileApi';

const DOC_REQUIREMENTS = [
    { id: '1', title: 'SK Pangkat/Golongan Terakhir', subtitle: 'Dari BKN / Instansi' },
    { id: '2', title: 'Penilaian Kinerja (SKP)', subtitle: '2 tahun terakhir, min. Baik' },
    { id: '3', title: 'Surat Pengantar Dekan', subtitle: 'Ditandatangani & distempel' },
    { id: '4', title: 'PAK / DUPAK Terakhir', subtitle: 'Dokumen PAK periode sebelumnya' },
    { id: '5', title: 'Fotokopi Ijazah Terlegalisir', subtitle: 'Min. S2' },
    { id: '6', title: 'Sertifikat Pendidik (Serdos)', subtitle: 'Jika sudah memiliki' }
];

export default function PengajuanKenaikanJabatan() {
    const router = useRouter();
    const { user } = useAuth();
    
    // States
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    
    
    // Data States
    const [eligibilityData, setEligibilityData] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [masterJabatan, setMasterJabatan] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState({}); // { id: { name: 'file.pdf', file: File } }
    const [isAgreed, setIsAgreed] = useState(false);
    
    const fileInputRef = useRef(null);
    const [activeUploadId, setActiveUploadId] = useState(null);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [eligibilityRes, profileRes, masterRes] = await Promise.allSettled([
                checkEligibility(user?.id_user_si),
                getStaffProfile(),
                getMasterJabatan(),
            ]);

            if (eligibilityRes.status === 'fulfilled') setEligibilityData(eligibilityRes.value);
            if (profileRes.status === 'fulfilled') setProfileData(profileRes.value.data);
            if (masterRes.status === 'fulfilled') setMasterJabatan(masterRes.value?.data ?? []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Derived Dynamic Data
    const staffData = profileData?.staff_data ?? {};
    const currentJabatan = staffData?.position ?? 'Tenaga Pengajar';
    const nidn = staffData?.employee_id_number ?? user?.nim ?? '-';

    const totalAK = eligibilityData?.total_kum ?? 0;

    // Target jabatan berikutnya dari master-jabatan BE (tier terkecil yang masih > totalAK).
    const sortedTiers = [...masterJabatan].filter(j => j.target_kum > 0).sort((a, b) => a.target_kum - b.target_kum);
    const nextTier = sortedTiers.find(j => totalAK < j.target_kum) ?? sortedTiers[sortedTiers.length - 1] ?? null;
    const targetAK = nextTier?.target_kum ?? 0;
    const targetJabatan = nextTier?.jabatan ?? '—';

    const isReadyForPromotion = (eligibilityData?.is_eligible ?? false) && totalAK >= targetAK;

    const handleFileUploadClick = (docId) => {
        setActiveUploadId(docId);
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // reset input
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && activeUploadId) {
            // Mock upload - just store the name and object
            setUploadedFiles(prev => ({
                ...prev,
                [activeUploadId]: { name: file.name, file }
            }));
            setActiveUploadId(null);
        }
    };

    const removeFile = (docId) => {
        setUploadedFiles(prev => {
            const newFiles = { ...prev };
            delete newFiles[docId];
            return newFiles;
        });
    };

    const handleSubmit = async () => {
        if (!isAgreed) return;
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            if (user?.id_user_si) formData.append('id_user_si', user.id_user_si);
            
            // Masukkan objek file ke dalam form data (dokumen_1 s/d dokumen_6)
            DOC_REQUIREMENTS.forEach((doc) => {
                if (uploadedFiles[doc.id]?.file) {
                    formData.append(`dokumen_${doc.id}`, uploadedFiles[doc.id].file);
                }
            });

            await submitPengajuan(formData);
            setIsSuccess(true);
            setTimeout(() => {
                router.push('/dosen/angka-kredit/pak');
            }, 3500);
        } catch (error) {
            console.error('Failed to submit pengajuan:', error);
            alert('Terjadi kesalahan saat mensubmit pengajuan.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const uploadedCount = Object.keys(uploadedFiles).length;
    const isUploadValid = uploadedCount >= 4; // Minimal 4 dokumen

    if (isLoading) return <LoadingEffect message="Memeriksa kelayakan dan mengambil data..." />;

    // Success Screen
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
							Pengajuan berhasil dikirim!
						</p>
						<p className="text-xs" style={{ color: '#044B33', opacity: 0.8 }}>
							Pengajuan kenaikan jabatan Anda akan segera direview. Anda akan menerima notifikasi prosesnya.
						</p>
					</div>
				</div>

				<div className="container mx-auto px-4 py-32 max-w-xl text-center flex flex-col items-center justify-center h-[calc(100vh-80px)]">
					{/* Big Check Circle */}
					<div className="w-24 h-24 rounded-full mx-auto mb-8 flex items-center justify-center animate-bounce-short"
						style={{ backgroundColor: '#B8CDBF' }}>
						<Check size={50} strokeWidth={3} style={{ color: '#044B33' }} />
					</div>
					
					<h1 className="text-3xl font-bold mb-5" style={{ color: '#044B33' }}>
						Pengajuan Berhasil Dikirim!
					</h1>
					
					<p className="text-[15px] mb-3" style={{ color: '#6B7280' }}>
						Total Angka Kredit yang diajukan: <strong style={{ color: '#044B33' }}>{Math.round(totalAK)} AK</strong>
					</p>
					
					<p className="text-sm mb-6" style={{ color: '#6B7280' }}>
						Status Pengajuan: <span style={{ color: '#D4AF37' }} className="font-bold">Menunggu Validasi</span>
					</p>
					
					<p className="text-xs mt-6" style={{ color: '#9CA3AF' }}>
						Mengalihkan ke dashboard...
					</p>
				</div>
			</div>
		);
	}

    // Step UI Helpers
    const steps = [
        { id: 1, label: 'Cek Kelayakan', Icon: ShieldCheck },
        { id: 2, label: 'Upload Dokumen', Icon: UploadIcon },
        { id: 3, label: 'Konfirmasi', Icon: Check }
    ];

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#E6EEE9', fontFamily: 'Urbanist, sans-serif' }}>
            <Navbar />
            
            {/* Hidden File Input */}
            <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
            />

            <div className="container mx-auto px-4 py-6 max-w-4xl">
                {/* Back Button */}
                <button
                    onClick={() => step > 1 ? setStep(step - 1) : router.push('/dosen/angka-kredit')}
                    className="flex items-center gap-1.5 text-sm font-bold mb-6 hover:opacity-80 transition"
                    style={{ color: '#044B33' }}
                >
                    <ArrowLeft size={16} />
                    {step === 1 ? 'Kembali Ke Dashboard Angka Kredit' : 'Kembali Ke Langkah Sebelumnya'}
                </button>

                {/* Page Title */}
                <div className="mb-10">
                    <h1 className="text-3xl font-bold mb-1" style={{ color: '#044B33' }}>
                        Ajukan Kenaikan Jabatan
                    </h1>
                    <p className="text-sm font-medium" style={{ color: '#6B7280' }}>
                        {currentJabatan} <span className="mx-1">â†’</span> <span className="font-bold" style={{ color: '#044B33' }}>{targetJabatan}</span>
                    </p>
                </div>

                {/* Stepper */}
                <div className="relative flex justify-between items-start mb-12 max-w-3xl mx-auto">
                    {/* Background Line */}
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 w-full h-px" style={{ backgroundColor: '#D1D5DB', zIndex: 0 }}></div>
                    
                    {steps.map((s) => {
                        const isActive = step === s.id;
                        const isPast = step > s.id;
                        
                        let bgColor = '#9CA3AF'; // Gray future
                        if (isActive || isPast) bgColor = '#044B33'; // Green active/past
                        
                        return (
                            <div key={s.id} className="relative z-10 flex flex-col items-center w-32 px-2" style={{ backgroundColor: '#E6EEE9' }}>
                                <div 
                                    className="w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-md transition-all duration-300"
                                    style={{ 
                                        backgroundColor: bgColor,
                                        transform: isActive ? 'scale(1.05)' : 'scale(1)',
                                    }}
                                >
                                    <s.Icon size={26} style={{ color: '#fff' }} strokeWidth={2.5} />
                                </div>
                                <span className={`text-sm text-center ${isActive || isPast ? 'font-bold' : 'font-medium'}`} style={{ color: isActive || isPast ? '#044B33' : '#6B7280' }}>
                                    {s.label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Content Based on Step */}
                <div className="max-w-3xl mx-auto">
                    {/* STEP 1: CEK KELAYAKAN */}
                    {step === 1 && (
                        <div className="animate-fade-in">
                            {/* Target AK Banner */}
                            <div className="rounded-[18px] p-6 mb-8 shadow-sm text-white flex items-center justify-between" style={{ backgroundColor: '#044B33' }}>
                                <div className="flex items-center gap-5">
                                    {/* Medal Icon Wrapper */}
                                    <div className="w-14 h-14 rounded-[12px] flex items-center justify-center" style={{ backgroundColor: '#B8CDBF' }}>
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" fill="#fff"/>
                                            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12Z" fill="#fff"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium mb-1" style={{ color: '#D1D5DB' }}>Total Angka Kredit Anda</p>
                                        <p className="text-3xl font-extrabold flex items-baseline gap-2">
                                            {Math.round(totalAK)}
                                            <span className="text-sm font-medium" style={{ color: '#9CA3AF' }}>/ {targetAK} AK target</span>
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    {isReadyForPromotion ? (
                                        <div className="px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2" style={{ backgroundColor: '#DABC4E', color: '#044B33' }}>
                                            <Check size={16} strokeWidth={3} /> Memenuhi Syarat
                                        </div>
                                    ) : (
                                        <div className="px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2" style={{ backgroundColor: '#FCA5A5', color: '#7f1d1d' }}>
                                            <X size={16} strokeWidth={3} /> Belum Memenuhi
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Data Dosen */}
                            <div className="bg-white rounded-[24px] p-8 mb-6 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#B8CDBF' }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#044B33"/>
                                        </svg>
                                    </div>
                                    <h2 className="text-base font-bold" style={{ color: '#044B33' }}>Data Dosen</h2>
                                </div>

                                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2" style={{ color: '#6B7280' }}>Nama</label>
                                        <div className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold" style={{ color: '#1F2937' }}>
                                            {user?.name || '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2" style={{ color: '#6B7280' }}>NIP / NIDN</label>
                                        <div className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold" style={{ color: '#1F2937' }}>
                                            {nidn}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2" style={{ color: '#6B7280' }}>Jabatan Saat Ini</label>
                                        <div className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold" style={{ color: '#1F2937' }}>
                                            {currentJabatan}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-8 rounded-xl px-5 py-4 flex justify-between items-center" style={{ backgroundColor: '#A7F3D0' }}>
                                    <p className="text-sm font-semibold" style={{ color: '#065F46', opacity: 0.8 }}>Naik ke jabatan</p>
                                    <p className="text-lg font-extrabold" style={{ color: '#065F46' }}>{targetJabatan}</p>
                                </div>
                            </div>

                            {/* Syarat Administratif */}
                            <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 mb-8">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#B8CDBF' }}>
                                        <CheckCircle2 size={15} style={{ color: '#044B33' }} />
                                    </div>
                                    <h2 className="text-base font-bold" style={{ color: '#044B33' }}>Syarat Administratif</h2>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { title: 'Angka Kredit mencapai target', checked: isReadyForPromotion },
                                        { title: 'Masa jabatan minimal 2 tahun', byManager: true },
                                        { title: 'Penilaian kinerja minimal Baik', byManager: true },
                                        { title: 'Belum melewati batas usia pensiun', byManager: true },
                                        { title: 'Telah memiliki sertifikasi pendidik', byManager: true },
                                    ].map((req, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: req.checked ? '#A7F3D0' : '#E5E7EB' }}>
                                                {req.checked && <Check size={12} strokeWidth={3} style={{ color: '#065F46' }} />}
                                            </div>
                                            <p className="text-sm font-semibold flex-1" style={{ color: '#1F2937' }}>{req.title}</p>
                                            {req.byManager && (
                                                <span className="text-[11px] font-semibold whitespace-nowrap" style={{ color: '#9CA3AF' }}>Diverifikasi manajer</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[11px] mt-4" style={{ color: '#9CA3AF' }}>
                                    Syarat administratif selain Angka Kredit diverifikasi manajer berdasarkan dokumen yang Anda unggah pada langkah berikutnya.
                                </p>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                disabled={!isReadyForPromotion}
                                className={`w-full py-4 rounded-xl text-base font-semibold text-white transition-opacity ${!isReadyForPromotion ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
                                style={{ backgroundColor: '#1C4A34' }}
                            >
                                Lanjut Upload Dokumen
                            </button>
                        </div>
                    )}

                    {/* STEP 2: UPLOAD DOKUMEN */}
                    {step === 2 && (
                        <div className="animate-fade-in">
                            {/* Summary / Progress Upload */}
                            <div className="bg-white rounded-[24px] p-8 mb-6 shadow-sm border border-gray-100 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium mb-1" style={{ color: '#6B7280' }}>Dokumen terupload</p>
                                    <p className="text-3xl font-extrabold flex items-baseline gap-2" style={{ color: '#DABC4E' }}>
                                        {uploadedCount} <span className="text-base font-semibold" style={{ color: '#9CA3AF' }}>/ 6 dokumen</span>
                                    </p>
                                </div>
                                <div className="w-48 text-right">
                                    {/* Progress Bar */}
                                    <div className="w-full h-3 rounded-full mb-2 overflow-hidden flex" style={{ backgroundColor: '#E5E7EB' }}>
                                        <div className="h-full rounded-full transition-all duration-500" 
                                             style={{ width: `${(Math.min(uploadedCount, 4) / 4) * 100}%`, backgroundColor: '#DABC4E' }}></div>
                                        {/* Optional extra progress for 5 & 6 */}
                                        <div className="h-full transition-all duration-500" 
                                             style={{ width: `${(Math.max(0, uploadedCount - 4) / 2) * 100}%`, backgroundColor: '#DABC4E', opacity: 0.5 }}></div>
                                    </div>
                                    <p className="text-[10px] font-bold uppercase" style={{ color: '#9CA3AF' }}>Min. 4 dokumen</p>
                                </div>
                            </div>

                            {/* Document List */}
                            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden mb-6">
                                {DOC_REQUIREMENTS.map((doc, idx) => {
                                    const fileObj = uploadedFiles[doc.id];
                                    return (
                                        <div key={doc.id} className={`p-5 flex items-center justify-between border-b ${idx === DOC_REQUIREMENTS.length - 1 ? 'border-none' : 'border-gray-100'} hover:bg-gray-50 transition-colors`}>
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-[13px]" 
                                                     style={{ backgroundColor: fileObj ? '#D1FAE5' : '#E5E7EB', color: fileObj ? '#044B33' : '#9CA3AF' }}>
                                                    {fileObj ? <Check size={16} strokeWidth={3} /> : doc.id}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold" style={{ color: '#1F2937' }}>{doc.title}</p>
                                                    {fileObj ? (
                                                        <p className="text-[11px] font-semibold mt-0.5" style={{ color: '#059669' }}>{fileObj.name}</p>
                                                    ) : (
                                                        <p className="text-[11px] font-medium mt-0.5" style={{ color: '#9CA3AF' }}>{doc.subtitle}</p>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {fileObj ? (
                                                <button onClick={() => removeFile(doc.id)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition">
                                                    <X size={16} strokeWidth={2.5} />
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleFileUploadClick(doc.id)}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition hover:bg-gray-50"
                                                    style={{ borderColor: '#D1D5DB', color: '#374151' }}
                                                >
                                                    <UploadIcon size={12} strokeWidth={2.5} /> Upload
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Warning / Status */}
                            <div className="rounded-[16px] px-6 py-4 flex items-center justify-center mb-8" 
                                style={{ backgroundColor: isUploadValid ? '#D1FAE5' : '#FEF3C7' }}>
                                <p className="text-xs font-bold" style={{ color: isUploadValid ? '#065F46' : '#92400E' }}>
                                    {isUploadValid 
                                        ? `Syarat minimal dokumen terpenuhi (${uploadedCount} dokumen terupload)` 
                                        : `Upload minimal 4 dokumen untuk melanjutkan (${4 - uploadedCount} lagi dibutuhkan)`}
                                </p>
                            </div>

                            <button
                                onClick={() => setStep(3)}
                                disabled={!isUploadValid}
                                className={`w-full py-4 rounded-xl text-base font-semibold text-white transition-opacity ${!isUploadValid ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
                                style={{ backgroundColor: '#1C4A34' }}
                            >
                                Lanjut ke Konfirmasi
                            </button>
                        </div>
                    )}

                    {/* STEP 3: KONFIRMASI */}
                    {step === 3 && (
                        <div className="animate-fade-in">
                            {/* Summary Card */}
                            <div className="bg-white rounded-[24px] p-8 mb-6 shadow-sm border border-gray-100 flex flex-col gap-5">
                                <h3 className="text-base font-bold mb-2" style={{ color: '#6B7280' }}>Ringkasan Pengajuan</h3>
                                
                                <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                                    <p className="text-sm font-medium" style={{ color: '#9CA3AF' }}>Dosen</p>
                                    <p className="text-sm font-bold" style={{ color: '#1F2937' }}>{user?.name || '-'}</p>
                                </div>
                                <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                                    <p className="text-sm font-medium" style={{ color: '#9CA3AF' }}>Jabatan Saat Ini</p>
                                    <p className="text-sm font-bold" style={{ color: '#1F2937' }}>{currentJabatan}</p>
                                </div>
                                <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                                    <p className="text-sm font-medium" style={{ color: '#9CA3AF' }}>Naik ke Jabatan</p>
                                    <p className="text-sm font-bold" style={{ color: '#1F2937' }}>{targetJabatan}</p>
                                </div>
                                <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                                    <p className="text-sm font-medium" style={{ color: '#9CA3AF' }}>Total AK</p>
                                    <p className="text-sm font-bold" style={{ color: '#1F2937' }}>{Math.round(totalAK)} AK</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm font-medium" style={{ color: '#9CA3AF' }}>Tanggal Pengajuan</p>
                                    <p className="text-sm font-bold" style={{ color: '#1F2937' }}>
                                        {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>

                            {/* Uploaded Documents Validation */}
                            <div className="bg-white rounded-[24px] p-8 mb-6 shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-base font-bold" style={{ color: '#6B7280' }}>Dokumen Terupload</h3>
                                    <div className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: '#A7F3D0', color: '#065F46' }}>
                                        {uploadedCount} / 6
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {DOC_REQUIREMENTS.map((doc) => {
                                        const fileObj = uploadedFiles[doc.id];
                                        return (
                                            <div key={doc.id} className="flex items-center gap-3">
                                                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" 
                                                     style={{ backgroundColor: fileObj ? '#A7F3D0' : '#E5E7EB' }}>
                                                    {fileObj ? <Check size={12} strokeWidth={3} style={{ color: '#065F46' }} /> : <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>}
                                                </div>
                                                <div className="flex-1 flex justify-between items-center">
                                                    <p className={`text-sm ${fileObj ? 'font-semibold' : 'text-gray-400 line-through'}`} style={{ color: fileObj ? '#1F2937' : undefined }}>{doc.title}</p>
                                                    {fileObj && <p className="text-[11px] font-medium" style={{ color: '#9CA3AF' }}>{fileObj.name}</p>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Agreement Checkbox */}
                            <div className="bg-white rounded-2xl p-6 mb-8 border transition-colors cursor-pointer" 
                                 onClick={() => setIsAgreed(!isAgreed)}
                                 style={{ borderColor: isAgreed ? '#044B33' : '#E5E7EB' }}>
                                <div className="flex items-start gap-4">
                                    <div className={`mt-0.5 w-5 h-5 rounded-[6px] shrink-0 flex items-center justify-center border transition-colors ${isAgreed ? 'bg-[#044B33] border-[#044B33]' : 'bg-transparent border-gray-300'}`}>
                                        {isAgreed && <Check size={14} style={{ color: '#fff' }} strokeWidth={3} />}
                                    </div>
                                    <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>
                                        Saya menyatakan bahwa seluruh data dan dokumen yang diajukan adalah <strong style={{ color: '#374151' }}>benar dan dapat dipertanggungjawabkan</strong>. Saya memahami bahwa pemalsuan dokumen merupakan pelanggaran serius.
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <button
                                onClick={handleSubmit}
                                disabled={!isAgreed || isSubmitting}
                                className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-base font-semibold text-white transition-opacity ${(!isAgreed || isSubmitting) ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
                                style={{ backgroundColor: '#1C4A34' }}
                            >
                                {isSubmitting ? 'Mengirim Pengajuan...' : 'Kirim Pengajuan Kenaikan Jabatan'}
                            </button>
                            <p className="text-center text-xs mt-4 font-medium opacity-60" style={{ color: '#9CA3AF' }}>
                                Pengajuan tidak dapat dibatalkan setelah dikirim
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}
