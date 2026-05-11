'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Home, ChevronRight, CheckCircle, Clock, 
  Copy, CreditCard, Smartphone, ChevronDown, 
  ChevronUp, ExternalLink, Check, RefreshCw
} from 'lucide-react';
import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import { toast } from 'sonner';

export default function UktPaymentPage() {
  const router = useRouter();
  const [isCopied, setIsCopied] = useState(false);
  const [openAccordion, setOpenAccordion] = useState('atm'); // Default buka ATM
  const [isSyncing, setIsSyncing] = useState(false);

  // --- DUMMY DATA TRANSAKSI ---
  const transaction = {
    idTransaksi: 'TRX-1778229571883',
    metode: 'Bank BNI',
    namaMetode: 'Transfer Bank BNI (Virtual Account)',
    vaNumber: '98812021010001',
    nominal: 3500000,
    batasWaktu: '9 Mei 2026 pukul 15.39 WIB'
  };

  // --- ALUR PEMBAYARAN (STEPPER) ---
  const alurPembayaran = [
    { id: 1, title: 'Pilih Tagihan', desc: 'Pilih tagihan UKT', status: 'completed' },
    { id: 2, title: 'Checkout', desc: 'Pilih metode bayar', status: 'completed' },
    { id: 3, title: 'Bayar', desc: 'Lakukan pembayaran', status: 'active' },
    { id: 4, title: 'Selesai', desc: 'Pembayaran berhasil', status: 'pending' },
  ];

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const handleCopyVA = () => {
    navigator.clipboard.writeText(transaction.vaNumber);
    setIsCopied(true);
    toast.success('Nomor Virtual Account berhasil disalin!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleBatalkan = () => {
    const confirm = window.confirm('Yakin ingin membatalkan transaksi ini?');
    if (confirm) {
      toast.success('Transaksi berhasil dibatalkan.');
      router.push('/ukt');
    }
  };

  const handleCekStatus = async () => {
    setIsSyncing(true);
    toast .info('Mengecek status pembayaran...');
    router.push('/ukt/success');
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

        {/* --- STATUS TRANSAKSI (CENTERED) --- */}
        <div className="flex flex-col items-center justify-center mb-10 mt-4">
          <div className="w-16 h-16 bg-[#DABC4E] rounded-full flex items-center justify-center mb-4 shadow-sm border-4 border-yellow-100">
            <Check className="w-8 h-8 text-[#015023]" strokeWidth={3} />
          </div>
          <h2 className="text-2xl font-bold text-[#015023] mb-1">Transaksi Dibuat</h2>
          <p className="text-gray-500 text-sm">Lakukan pembayaran sebelum batas waktu berakhir</p>
        </div>

        {/* --- MAIN LAYOUT (2 COLUMNS) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* KOLOM KIRI (Detail VA & Panduan) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* 1. Container Detail Transaksi & VA */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              
              {/* Warning Banner */}
              <div className="bg-[#fef8e6] px-6 py-4 flex items-start gap-3 border-b border-[#fdeeb5]">
                <Clock className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-orange-800">Batas Waktu Pembayaran</p>
                  <p className="text-xs font-medium text-orange-700 mt-0.5">{transaction.batasWaktu}</p>
                </div>
              </div>

              {/* ID & Metode Row */}
              <div className="p-6 grid grid-cols-2 gap-4 border-b border-gray-100">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">ID Transaksi</p>
                  <p className="text-sm font-bold text-gray-800">{transaction.idTransaksi}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Metode Pembayaran</p>
                  <p className="text-sm font-bold text-gray-800">{transaction.metode}</p>
                </div>
              </div>

              {/* VA & Nominal Row */}
              <div className="p-6 flex flex-col gap-6">
                
                {/* Box VA Number */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Nomor Virtual Account</p>
                  <div className="border border-[#015023]/30 bg-green-50/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-gray-600">{transaction.namaMetode}</span>
                      <span className="text-2xl sm:text-3xl font-mono font-bold text-[#015023] tracking-widest">
                        {transaction.vaNumber}
                      </span>
                    </div>
                    <button 
                      onClick={handleCopyVA}
                      className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-[#015023] hover:bg-[#013d1b] transition-colors shadow-sm shrink-0"
                    >
                      {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {isCopied ? 'Tersalin' : 'Salin'}
                    </button>
                  </div>
                </div>

                {/* Box Total */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Tagihan</p>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 flex items-center">
                    <span className="text-3xl font-extrabold text-[#015023]">{formatRupiah(transaction.nominal)}</span>
                  </div>
                </div>

              </div>
            </div>

            {/* 2. Container Panduan Pembayaran */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-lg font-bold text-[#015023] mb-6">Panduan Pembayaran</h2>
              
              {/* Accordion ATM */}
              <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
                <button 
                  onClick={() => setOpenAccordion(openAccordion === 'atm' ? null : 'atm')}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#015023] text-white rounded-lg"><CreditCard className="w-5 h-5" /></div>
                    <span className="text-sm font-bold text-gray-800">Pembayaran via ATM</span>
                  </div>
                  {openAccordion === 'atm' ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                </button>
                
                {openAccordion === 'atm' && (
                  <div className="p-5 bg-white text-sm text-gray-600 leading-relaxed border-t border-gray-200">
                    <ol className="list-decimal pl-5 space-y-3 font-medium">
                      <li>Masukkan kartu ATM dan PIN Anda</li>
                      <li>Pilih menu <span className="text-gray-900 font-bold">'Transaksi Lainnya'</span></li>
                      <li>Pilih menu <span className="text-gray-900 font-bold">'Transfer'</span></li>
                      <li>Pilih menu <span className="text-gray-900 font-bold">'Ke Rekening Bank Lain'</span></li>
                      <li>Masukkan kode bank BNI (009)</li>
                      <li>Masukkan nomor VA: <span className="text-[#015023] font-bold">{transaction.vaNumber}</span></li>
                      <li>Masukkan nominal: <span className="text-[#015023] font-bold">{formatRupiah(transaction.nominal)}</span></li>
                      <li>Periksa data transaksi, tekan <span className="text-gray-900 font-bold">'Ya'</span> atau <span className="text-gray-900 font-bold">'Benar'</span></li>
                      <li>Ambil struk sebagai bukti pembayaran</li>
                    </ol>
                  </div>
                )}
              </div>

              {/* Accordion Mobile Banking */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button 
                  onClick={() => setOpenAccordion(openAccordion === 'mbanking' ? null : 'mbanking')}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#015023] text-white rounded-lg"><Smartphone className="w-5 h-5" /></div>
                    <span className="text-sm font-bold text-gray-800">Pembayaran via Mobile Banking</span>
                  </div>
                  {openAccordion === 'mbanking' ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                </button>
                
                {openAccordion === 'mbanking' && (
                  <div className="p-5 bg-white text-sm text-gray-600 leading-relaxed border-t border-gray-200">
                    <ol className="list-decimal pl-5 space-y-3 font-medium">
                      <li>Buka aplikasi Bank BNI Mobile Banking</li>
                      <li>Login dengan User ID dan Password</li>
                      <li>Pilih menu <span className="text-gray-900 font-bold">'Transfer'</span></li>
                      <li>Pilih <span className="text-gray-900 font-bold">'Virtual Account Billing'</span></li>
                      <li>Masukkan nomor VA: <span className="text-[#015023] font-bold">{transaction.vaNumber}</span></li>
                      <li>Nominal akan muncul otomatis</li>
                      <li>Masukkan PIN transaksi Anda</li>
                      <li>Tekan <span className="text-gray-900 font-bold">'Konfirmasi'</span></li>
                      <li>Simpan notifikasi sebagai bukti</li>
                    </ol>
                  </div>
                )}
              </div>

              {/* Action Buttons Container */}
              <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 pt-6 border-t border-gray-100">
                <button 
                  onClick={handleCekStatus}
                  disabled={isSyncing}
                  className="w-full sm:flex-1 py-3.5 rounded-xl font-bold text-white bg-[#015023] hover:bg-[#013d1b] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
                >
                  {isSyncing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ExternalLink className="w-5 h-5" />}
                  {isSyncing ? 'Mengecek Status...' : 'Cek Status Pembayaran'}
                </button>
                
                <button 
                  onClick={handleBatalkan}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-red-500 bg-red-50 hover:bg-red-100 border border-red-200 transition-all text-sm"
                >
                  Batalkan Transaksi
                </button>
              </div>

            </div>
          </div>

          {/* KOLOM KANAN (Alur Pembayaran / Stepper) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 sticky top-24">
              <h2 className="text-lg font-bold text-[#015023] mb-8">Alur Pembayaran</h2>
              
              <div className="relative">
                {/* Garis vertikal background */}
                <div className="absolute left-[19px] top-2 bottom-6 w-0.5 bg-gray-200 z-0"></div>

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
                          step.status === 'completed' ? 'text-[#015023]' : 
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

      </main>

      <Footer />
    </div>
  );
}