'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Home, ChevronRight, ArrowRight, CheckCircle, 
  Download, FileStack, Check, X, Loader2, AlertCircle, RefreshCw
} from 'lucide-react';
import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import { toast } from 'sonner';
import { fetchStudentTuitionBills, fetchStudentPaymentHistory } from '@/features/ukt/services/tuitionService';
import PaymentDetailModal from './PaymentDetailModal';

export default function StudentUktMainPage() {
  // --- STATE UNTUK DATA & LOADING ---
  const [bills, setBills] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);

  // --- FETCH DATA ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [billsResponse, historyResponse] = await Promise.all([
        fetchStudentTuitionBills(),
        fetchStudentPaymentHistory()
      ]);
      setBills(billsResponse?.bills ?? []);
      setPaymentHistory(historyResponse?.items ?? []);
    } catch (err) {
      setError(err?.message ?? 'Gagal memuat data UKT');
      console.error('Error fetching UKT data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- DERIVED DATA ---
  const tagihanAktif = useMemo(() => {
    const unpaidBill = bills.find(b => b.status === 'unpaid');
    if (!unpaidBill) {
      return {
        semester: 'Tidak ada tagihan',
        tahunAkademik: '-',
        nominal: 0,
        golongan: '-',
        jatuhTempo: '-',
        status: 'Lunas',
        id: null
      };
    }
    return {
      id: unpaidBill.id,
      semester: unpaidBill.academic_period?.name ?? 'Unknown',
      tahunAkademik: unpaidBill.academic_period?.name?.match(/\d{4}\/\d{4}/) ?? '-',
      nominal: unpaidBill.final_amount,
      golongan: unpaidBill.tuition_rate?.group_name ?? 'Unknown',
      jatuhTempo: unpaidBill.due_date ? new Date(unpaidBill.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-',
      status: unpaidBill.status_label ?? 'Belum Bayar'
    };
  }, [bills]);

  const riwayatPembayaran = useMemo(() => {
    return paymentHistory.map(item => {
      const tahunMatch = item.academic_period?.match(/\d{4}\/\d{4}/);
      return {
        ...item,
        id: item.id,
        semester: item.academic_period ?? '-',
        tahun: tahunMatch ? tahunMatch[0] : '-',
        nominal: item.amount_paid,
        status: item.verification_label ?? 'Disetujui',
        method: item.payment_method ?? '-',
        tanggal: item.uploaded_at ? new Date(item.uploaded_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-',
        rejectionReason: item.rejection_reason,
        adminNotes: item.admin_notes
      };
    });
  }, [paymentHistory]);

  const alurPembayaran = [
    { id: 1, title: 'Pilih Tagihan', desc: 'Pilih tagihan UKT', isActive: true },
    { id: 2, title: 'Checkout', desc: 'Pilih metode bayar', isActive: false },
    { id: 3, title: 'Bayar', desc: 'Lakukan pembayaran', isActive: false },
    { id: 4, title: 'Selesai', desc: 'Pembayaran berhasil', isActive: false },
  ];

  // Format Rupiah helper
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };
  
return (
    <div className="min-h-screen flex flex-col bg-[#f4f7f5] font-urbanist">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-10">
        
        {/* --- BREADCRUMBS --- */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-8">
          <Home className="w-4 h-4" />
          <Link href="/dashboard" className="hover:text-[#015023] cursor-pointer transition-colors">Beranda</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-500">Administrasi</span>
          <ChevronRight className="w-3 h-3" />
          <span className="font-bold text-[#015023]">UKT</span>
        </div>

        {/* --- HEADER TITLE --- */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#015023] mb-2">
            Pembayaran UKT
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            Bayar tagihan UKT Anda dengan mudah menggunakan Virtual Account
          </p>
        </div>

        {/* --- MAIN LAYOUT (2 COLUMNS) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* KOLOM KIRI (Tagihan Aktif & Riwayat) */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* 1. Tagihan Aktif Section */}
            <div>
              <h2 className="text-xl font-bold text-[#015023] mb-4">Tagihan Aktif</h2>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header Tagihan */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-[#015023]">{tagihanAktif.semester}</h3>
                    <p className="text-sm text-gray-500 mt-1">Tahun Akademik {tagihanAktif.tahunAkademik}</p>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full text-xs font-bold border border-orange-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                    {tagihanAktif.status}
                  </div>
                </div>

                {/* Body Tagihan */}
                <div className="p-6">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nominal Tagihan</p>
                  <p className="text-4xl font-extrabold text-[#015023] mb-8">
                    {formatRupiah(tagihanAktif.nominal)}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Golongan UKT</p>
                      <p className="text-sm font-bold text-gray-800">{tagihanAktif.golongan}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Jatuh Tempo</p>
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                        <CalendarIcon className="w-4 h-4 text-gray-500" />
                        {tagihanAktif.jatuhTempo}
                      </div>
                    </div>
                  </div>

                  {/* Tombol Lanjut ke Checkout */}
                  <Link 
                    href={tagihanAktif.id ? `/ukt/checkout?bill=${tagihanAktif.id}` : '#'} 
                    className={`w-full flex items-center justify-center gap-2 text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm ${
                      tagihanAktif.id 
                        ? 'bg-[#015023] hover:bg-[#013d1b] cursor-pointer' 
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                    onClick={(e) => {
                      if (!tagihanAktif.id) {
                        e.preventDefault();
                        toast.info('Tidak ada tagihan yang perlu dibayar');
                      }
                    }}
                  >
                    Lanjut ke Checkout
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Loading & Error States */}
            {isLoading && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center min-h-[300px]">
                <Loader2 className="w-8 h-8 animate-spin text-[#015023] mb-3" />
                <p className="text-sm text-gray-500 font-medium">Memuat riwayat pembayaran...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-3 mb-6">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-red-700">Gagal memuat data</p>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                  <button
                    onClick={fetchData}
                    className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-red-600 hover:text-red-700 bg-white px-3 py-1.5 rounded-lg border border-red-200 hover:border-red-300"
                  >
                    <RefreshCw className="w-4 h-4" /> Coba Lagi
                  </button>
                </div>
              </div>
            )}

            {/* 2. Riwayat Pembayaran Section dengan BULK DOWNLOAD */}
            {!isLoading && !error && <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <h2 className="text-xl font-bold text-[#015023]">Riwayat Pembayaran</h2>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto overflow-y-auto max-h-[380px]">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <th className="py-4 px-6 bg-gray-50">Semester</th>
                        <th className="py-4 px-6 bg-gray-50">Nominal</th>
                        <th className="py-4 px-6 bg-gray-50">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {riwayatPembayaran.map((item) => (
                        <tr 
                          key={item.id} 
                          className="transition-colors hover:bg-gray-50/50 cursor-pointer"
                          onClick={() => setSelectedPaymentId(item.id)}
                        >
                          <td className="py-4 px-6">
                            <p className="text-sm font-bold text-[#015023]">{item.semester}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{item.tahun}</p>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-sm font-bold text-gray-800">{formatRupiah(item.nominal)}</p>
                          </td>
                          <td className="py-4 px-6">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                              item.status === 'Disetujui' 
                                ? 'bg-green-100 text-green-700' 
                                : item.status === 'Ditolak'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-orange-100 text-orange-700'
                            }`}>
                              {item.status === 'Disetujui' && <CheckCircle className="w-3.5 h-3.5" />}
                              {item.status === 'Ditolak' && <X className="w-3.5 h-3.5" />}
                              {item.status !== 'Disetujui' && item.status !== 'Ditolak' && <AlertCircle className="w-3.5 h-3.5" />}
                              {item.status}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            }

          </div>

          {/* KOLOM KANAN (Alur Pembayaran) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 sticky top-24">
              <h2 className="text-lg font-bold text-[#015023] mb-8">Alur Pembayaran</h2>
              
              <div className="relative">
                {/* Garis vertikal background */}
                <div className="absolute left-[19px] top-2 bottom-6 w-0.5 bg-gray-100 z-0"></div>

                <div className="flex flex-col gap-8 relative z-10">
                  {alurPembayaran.map((step, index) => (
                    <div key={step.id} className="flex items-start gap-4">
                      {/* Lingkaran Angka */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border-[3px] border-white shadow-sm ${
                        step.isActive 
                          ? 'bg-[#DABC4E] text-[#015023]' 
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {step.id}
                      </div>
                      
                      {/* Teks Step */}
                      <div className="flex flex-col mt-0.5">
                        <p className={`text-base font-bold ${step.isActive ? 'text-[#015023]' : 'text-gray-400'}`}>
                          {step.title}
                        </p>
                        <p className={`text-sm ${step.isActive ? 'text-gray-500' : 'text-gray-400/70'}`}>
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>

      </main>
      
      <PaymentDetailModal 
        paymentId={selectedPaymentId} 
        onClose={() => setSelectedPaymentId(null)} 
      />

      <Footer />
    </div>
  );
}

// Icon Calendar kecil untuk bagian jatuh tempo
function CalendarIcon(props) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  );
}