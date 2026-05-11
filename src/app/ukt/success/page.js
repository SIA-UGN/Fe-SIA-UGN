'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Home, ChevronRight, CheckCircle, Download, 
  FileText, Sparkles, Check 
} from 'lucide-react';
import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';

export default function UktSuccessPage() {
  // --- DUMMY DATA TRANSAKSI BERHASIL ---
  const transaction = {
    idTransaksi: 'TRX-1778229571883',
    nominal: 3500000,
    waktuPembayaran: '8 Mei 2026 pukul 15.52 WIB',
    status: 'Lunas'
  };

  // --- ALUR PEMBAYARAN (STEPPER) ---
  const alurPembayaran = [
    { id: 1, title: 'Pilih Tagihan', desc: 'Pilih tagihan UKT', status: 'completed' },
    { id: 2, title: 'Checkout', desc: 'Pilih metode bayar', status: 'completed' },
    { id: 3, title: 'Bayar', desc: 'Lakukan pembayaran', status: 'completed' },
    { id: 4, title: 'Selesai', desc: 'Pembayaran berhasil', status: 'active' },
  ];

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const handleDownloadKwitansi = async () => {
    try {
      // 1. Munculkan loading state (bisa menggunakan toast)
      toast.loading('Sedang menyiapkan kwitansi Anda...', { id: 'download-pdf' });

      // 2. Lakukan request ke Backend API Anda
      // Ganti URL dengan endpoint backend Anda yang men-generate PDF
      const response = await fetch(`/api/ukt/receipt/${transaction.idTransaksi}`, {
        method: 'GET',
        headers: {
          // 'Authorization': `Bearer ${token}` // Jika menggunakan auth
          'Accept': 'application/pdf',
        },
      });

      if (!response.ok) throw new Error('Gagal mengunduh kwitansi');

      // 3. Konversi response ke bentuk Blob (Binary Large Object)
      const blob = await response.blob();

      // 4. Buat URL sementara untuk Blob tersebut
      const downloadUrl = window.URL.createObjectURL(blob);

      // 5. Buat elemen <a> bayangan untuk memicu download di browser
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Beri nama file yang rapi
      link.download = `Kwitansi_UKT_Genap2026_${transaction.idTransaksi}.pdf`; 
      
      // Eksekusi download dan bersihkan URL
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success('Kwitansi berhasil diunduh!', { id: 'download-pdf' });

    } catch (error) {
      console.error(error);
      toast.error('Terjadi kesalahan saat mengunduh kwitansi.', { id: 'download-pdf' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f7f5] font-urbanist">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-10 relative">
        
        {/* --- BREADCRUMBS --- */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-8 relative z-10">
          <Home className="w-4 h-4" />
          <span className="hover:text-[#015023] cursor-pointer transition-colors">Beranda</span>
          <ChevronRight className="w-3 h-3" />
          <span className="hover:text-[#015023] cursor-pointer transition-colors">Administrasi</span>
          <ChevronRight className="w-3 h-3" />
          <span className="font-bold text-[#015023]">UKT</span>
        </div>

        {/* --- HEADER TITLE --- */}
        <div className="mb-8 relative z-10">
          <h1 className="text-3xl font-bold text-[#015023] mb-2">
            Pembayaran UKT
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            Bayar tagihan UKT Anda dengan mudah menggunakan Virtual Account
          </p>
        </div>

        {/* --- MAIN LAYOUT (2 COLUMNS) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative z-10">
          
          {/* KOLOM KIRI (Success Card) */}
          <div className="lg:col-span-2">
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              
              {/* Top Banner (Hijau Gelap) */}
              <div className="bg-[#015023] p-10 flex flex-col items-center justify-center text-center relative overflow-hidden">
                {/* Dekorasi Bintang/Sparkles */}
                <Sparkles className="absolute top-10 left-1/3 w-6 h-6 text-yellow-300 opacity-50" />
                <Sparkles className="absolute bottom-10 right-1/4 w-8 h-8 text-yellow-300 opacity-30" />
                <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl"></div>

                {/* Ikon Sukses */}
                <div className="w-20 h-20 bg-[#DABC4E] rounded-full flex items-center justify-center mb-6 shadow-lg border-4 border-[#015023] ring-4 ring-[#DABC4E]/30 relative z-10">
                  <Check className="w-10 h-10 text-[#015023]" strokeWidth={3} />
                </div>
                
                <h2 className="text-3xl font-extrabold text-white mb-2 relative z-10">Pembayaran Berhasil!</h2>
                <p className="text-green-100 font-medium relative z-10">Tagihan UKT Anda telah dibayar dan diverifikasi</p>
              </div>

              {/* Body Content */}
              <div className="p-6 md:p-8 flex flex-col gap-6">
                
                {/* Alert Verifikasi Otomatis */}
                <div className="bg-[#e9f5ec] border border-[#cce8d6] rounded-xl p-4 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-green-800">Transaksi Terverifikasi Otomatis</h4>
                    <p className="text-xs sm:text-sm text-green-700 mt-1">
                      Pembayaran Anda telah berhasil diverifikasi oleh sistem. Status UKT Anda sudah diperbarui menjadi <span className="font-bold">"Lunas"</span>.
                    </p>
                  </div>
                </div>

                {/* Detail Transaksi List */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between py-4 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">ID Transaksi</span>
                    <span className="text-sm font-bold text-gray-800">{transaction.idTransaksi}</span>
                  </div>
                  <div className="flex items-center justify-between py-4 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Nominal Dibayar</span>
                    <span className="text-base font-extrabold text-[#015023]">{formatRupiah(transaction.nominal)}</span>
                  </div>
                  <div className="flex items-center justify-between py-4 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Waktu Pembayaran</span>
                    <span className="text-sm font-bold text-gray-800">{transaction.waktuPembayaran}</span>
                  </div>
                  <div className="flex items-center justify-between py-4 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Status</span>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-600 border border-green-200 text-xs font-bold">
                      <CheckCircle className="w-3.5 h-3.5" /> {transaction.status}
                    </div>
                  </div>
                </div>

                {/* Alert Kwitansi Tersedia */}
                <div className="bg-[#f0f5fa] border border-[#e1eaf4] rounded-xl p-4 flex items-center gap-3 mt-2">
                  <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                  <p className="text-sm text-blue-800">
                    Kwitansi pembayaran telah tersedia dan dapat diunduh sebagai bukti pembayaran resmi.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 mt-4">
                  <button 
                    onClick={handleDownloadKwitansi}
                    className="w-full py-3.5 rounded-xl font-bold text-white bg-[#015023] hover:bg-[#013d1b] transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Download className="w-5 h-5" /> Unduh Kwitansi
                  </button>
                  <Link 
                    href="/ukt"
                    className="w-full py-3.5 rounded-xl font-bold text-[#015023] bg-white border border-[#015023] hover:bg-green-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Home className="w-5 h-5" /> Kembali ke Beranda
                  </Link>
                </div>

              </div>
            </div>

            {/* Footer Note */}
            <p className="text-center text-sm font-medium text-gray-500 mt-8 mb-4">
              Terima kasih telah melakukan pembayaran tepat waktu! 🎉
            </p>

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