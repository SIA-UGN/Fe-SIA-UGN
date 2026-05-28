'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Home, ChevronRight, ArrowLeft, Check, 
  ChevronDown, Rocket, Loader2, AlertCircle, RefreshCw
} from 'lucide-react';
import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import { fetchStudentTuitionBillDetail, checkoutStudentTuition } from '@/features/ukt/services/tuitionService';
import { toast } from 'sonner';

// --- Komponen Custom Select untuk Bank ---
const CustomBankSelect = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative font-urbanist w-full mt-4" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3.5 text-sm bg-white border rounded-xl outline-none transition-all duration-200 shadow-sm ${
          isOpen 
            ? 'border-[#015023] ring-4 ring-[#015023]/10' 
            : 'border-gray-300 hover:border-[#015023]/50'
        }`}
      >
        <span className={`font-semibold ${selectedOption ? 'text-gray-900' : 'text-gray-500'}`}>
          {selectedOption ? selectedOption.label : 'Pilih Bank'}
        </span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-[105%] left-0 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="max-h-60 overflow-y-auto py-1.5">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                  value === option.value
                    ? 'bg-[#015023] text-white font-bold'
                    : 'text-gray-700 hover:bg-green-50 hover:text-[#015023] font-medium'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


export default function UktCheckoutPage() {
  const router = useRouter();

  const [selectedBank, setSelectedBank] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [billData, setBillData] = useState(null);
  const [isLoadingBill, setIsLoadingBill] = useState(false);
  const [billId, setBillId] = useState(null);
  const [error, setError] = useState(null);

  // --- FETCH BILL DETAILS ---
  const fetchBillDetails = useCallback(async () => {
    if (!billId) {
      setError('No bill selected. Please go back and select a bill.');
      return;
    }
    setIsLoadingBill(true);
    setError(null);
    try {
      const response = await fetchStudentTuitionBillDetail(billId);
      setBillData(response?.bill);
    } catch (err) {
      setError(err?.message ?? 'Gagal memuat detail tagihan');
      console.error('Error fetching bill:', err);
    } finally {
      setIsLoadingBill(false);
    }
  }, [billId]);

  useEffect(() => {
    if (billId) {
      fetchBillDetails();
    }
  }, [billId, fetchBillDetails]);

  // Read URLSearchParams client-side to avoid prerender/useSearchParams SSR bailout
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const bid = Number(sp.get('bill')) || null;
      if (bid) setBillId(bid);
    } catch (err) {
      // ignore when window not available or parsing fails
    }
  }, []);

  // --- DERIVED DATA FROM BILL ---
  const ringkasan = billData ? {
    tagihan: billData.academic_period?.name ?? 'Unknown',
    golongan: billData.tuition_rate?.group_name ?? 'Unknown',
    jatuhTempo: billData.due_date ? new Date(billData.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-',
    nominal: billData.final_amount
  } : {
    tagihan: 'Loading...',
    golongan: '-',
    jatuhTempo: '-',
    nominal: 0
  };

  const bankOptions = [
    { label: 'Bank BNI (Virtual Account)', value: 'bni' },
    { label: 'Bank Mandiri (Virtual Account)', value: 'mandiri' },
    { label: 'Bank BRI (Virtual Account)', value: 'bri' },
    { label: 'Bank BCA (Virtual Account)', value: 'bca' },
  ];

  // --- ALUR PEMBAYARAN (STEPPER) ---
  const alurPembayaran = [
    { id: 1, title: 'Pilih Tagihan', desc: 'Pilih tagihan UKT', status: 'completed' },
    { id: 2, title: 'Checkout', desc: 'Pilih metode bayar', status: 'active' },
    { id: 3, title: 'Bayar', desc: 'Lakukan pembayaran', status: 'pending' },
    { id: 4, title: 'Selesai', desc: 'Pembayaran berhasil', status: 'pending' },
  ];

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const handleCheckout = async () => {
    if (!selectedBank || !billId) {
      toast.error('Pilih metode pembayaran dan tagihan');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await checkoutStudentTuition(billId, selectedBank);
      if (response?.transaction) {
        toast.success('Transaksi pembayaran berhasil dibuat');
        const transaction = response.transaction;
        const params = new URLSearchParams({
          transaction: String(transaction.id_tuition_payment),
        });

        if (transaction.va_number) {
          params.set('va', transaction.va_number);
        }
        if (transaction.midtrans_va_bank) {
          params.set('bank', transaction.midtrans_va_bank);
        }
        if (transaction.amount !== undefined && transaction.amount !== null) {
          params.set('amount', String(transaction.amount));
        }
        if (transaction.expiry_time) {
          params.set('expiry', transaction.expiry_time);
        }

        router.push(`/ukt/bayar?${params.toString()}`);
      }
    } catch (err) {
      toast.error(err?.message ?? 'Gagal membuat transaksi pembayaran');
      console.error('Checkout error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f7f5] font-urbanist">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-10">
        
        {/* --- BREADCRUMBS --- */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-8">
          <Home className="w-4 h-4" />
          <span className="hover:text-[#015023] cursor-pointer transition-colors">Beranda</span>
          <ChevronRight className="w-3 h-3" />
          <span className="hover:text-[#015023] cursor-pointer transition-colors">Administrasi</span>
          <ChevronRight className="w-3 h-3" />
          <span className="font-bold text-[#015023]">UKT</span>
        </div>

        {/* --- HEADER TITLE --- */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#015023] mb-2">
            Pembayaran UKT
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            Bayar tagihan UKT Anda dengan mudah menggunakan Virtual Account
          </p>
        </div>

        {/* --- BACK BUTTON --- */}
        <Link 
          href="/ukt" 
          className="inline-flex items-center gap-2 text-[#015023] font-bold mb-6 hover:opacity-80 transition-opacity text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Tagihan
        </Link>

        {/* --- ERROR ALERT --- */}
        {error && (
          <div className="mb-6 flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">{error}</p>
            </div>
            <button
              onClick={fetchBillDetails}
              className="text-red-600 hover:text-red-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* --- LOADING UI --- */}
        {isLoadingBill && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-[#015023] animate-spin mx-auto mb-2" />
              <p className="text-gray-500">Memuat detail tagihan...</p>
            </div>
          </div>
        )}

        {/* --- MAIN LAYOUT (2 COLUMNS) --- */}
        {!isLoadingBill && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* KOLOM KIRI (Pilihan Bank & Ringkasan) */}
            <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* 1. Container Pilih Metode Pembayaran */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-bold text-[#015023] mb-1">Pilih Metode Pembayaran</h2>
              <p className="text-sm text-gray-500">Pilih bank untuk mendapatkan nomor Virtual Account</p>
              
              <CustomBankSelect 
                value={selectedBank} 
                onChange={setSelectedBank} 
                options={bankOptions} 
              />
            </div>

            {/* 2. Container Ringkasan Pembayaran */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-bold text-[#015023] mb-6">Ringkasan Pembayaran</h2>
              
              <div className="flex flex-col gap-5 mb-8">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Tagihan</p>
                  <p className="text-sm font-bold text-gray-800">{ringkasan.tagihan}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Golongan</p>
                  <p className="text-sm font-bold text-gray-800">{ringkasan.golongan}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Jatuh Tempo</p>
                  <p className="text-sm font-bold text-gray-800">{ringkasan.jatuhTempo}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-medium text-gray-500">Nominal UKT</span>
                <span className="text-base font-bold text-gray-800">{formatRupiah(ringkasan.nominal)}</span>
              </div>

              {/* Box Total Pembayaran */}
              <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-between bg-gray-50/50 mb-6">
                <span className="text-sm font-semibold text-gray-600">Total Pembayaran</span>
                <span className="text-xl font-extrabold text-[#015023]">{formatRupiah(ringkasan.nominal)}</span>
              </div>

              {/* Action Button & Warning */}
              <div className="flex flex-col items-center gap-3 mt-8">
                <button 
                  onClick={handleCheckout}
                  disabled={!selectedBank || isSubmitting}
                  className={`w-full py-3.5 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 shadow-sm ${
                    selectedBank 
                      ? 'bg-[#015023] hover:bg-[#013d1b] cursor-pointer' 
                      : 'bg-[#8aa192] cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Memproses...</>
                  ) : (
                    <>Checkout Sekarang <Rocket className="w-4 h-4 ml-1" /></>
                  )}
                </button>
                
                {!selectedBank && (
                  <p className="text-xs font-bold text-red-500 animate-in fade-in">
                    Pilih metode pembayaran terlebih dahulu
                  </p>
                )}
              </div>

            </div>

          </div>

          {/* KOLOM KANAN (Alur Pembayaran) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 sticky top-24">
              <h2 className="text-lg font-bold text-[#015023] mb-8">Alur Pembayaran</h2>
              
              <div className="relative">
                {/* Garis vertikal background */}
                <div className="absolute left-[19px] top-2 bottom-6 w-0.5 bg-gray-100 z-0"></div>

                <div className="flex flex-col gap-8 relative z-10">
                  {alurPembayaran.map((step) => (
                    <div key={step.id} className="flex items-start gap-4">
                      
                      {/* Lingkaran Indikator */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border-[3px] border-white shadow-sm transition-colors ${
                        step.status === 'completed' 
                          ? 'bg-[#015023] text-white' 
                          : step.status === 'active'
                            ? 'bg-[#DABC4E] text-[#015023]'
                            : 'bg-gray-100 text-gray-400'
                      }`}>
                        {step.status === 'completed' ? <Check className="w-5 h-5" /> : step.id}
                      </div>
                      
                      {/* Teks Step */}
                      <div className="flex flex-col mt-0.5">
                        <p className={`text-base font-bold ${
                          step.status === 'completed' ? 'text-gray-900' : 
                          step.status === 'active' ? 'text-[#015023]' : 'text-gray-400'
                        }`}>
                          {step.title}
                        </p>
                        <p className={`text-sm ${
                          step.status === 'active' ? 'text-gray-500' : 'text-gray-400/70'
                        }`}>
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
        )}

      </main>

      <Footer />
    </div>
  );
}