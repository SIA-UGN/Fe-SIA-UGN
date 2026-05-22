'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Home, ChevronRight, ArrowRight, CheckCircle, 
  Download, FileStack, Check, X 
} from 'lucide-react';
import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import { toast } from 'sonner';

export default function StudentUktMainPage() {

  // --- STATE UNTUK BULK SELECTION ---
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDownloadingBulk, setIsDownloadingBulk] = useState(false);

  // --- DUMMY DATA ---
  const tagihanAktif = {
    semester: 'Semester Genap 2025/2026',
    tahunAkademik: '2025/2026',
    nominal: 3500000,
    golongan: 'Tingkat 3',
    jatuhTempo: '28 Feb 2026',
    status: 'Belum Bayar'
  };

  const riwayatPembayaran = [
    {
      id: 1,
      semester: 'Ganjil 2025/2026',
      tahun: '2025/2026',
      nominal: 3500000,
      status: 'Lunas'
    },
    {
      id: 2,
      semester: 'Genap 2024/2025',
      tahun: '2024/2025',
      nominal: 3500000,
      status: 'Lunas'
    }
  ];

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

  // --- LOGIKA SELECTION ---
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(riwayatPembayaran.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkDownload = async () => {
    if (selectedIds.length === 0) return;

    setIsDownloadingBulk(true);
    toast.loading(`Menyiapkan ${selectedIds.length} kwitansi dalam format ZIP...`, { id: 'bulk-load' });

    // Simulasi proses kompresi di backend
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast.success('Batch kwitansi berhasil diunduh!', { id: 'bulk-load' });
    setIsDownloadingBulk(false);
    setSelectedIds([]); // Reset pilihan setelah unduh
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
                  {/* Sesuaikan href dengan rute halaman checkout Anda selanjutnya */}
                  <Link 
                    href="/mahasiswa/ukt/checkout" 
                    className="w-full flex items-center justify-center gap-2 bg-[#015023] hover:bg-[#013d1b] text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm"
                  >
                    Lanjut ke Checkout
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* 2. Riwayat Pembayaran Section dengan BULK DOWNLOAD */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <h2 className="text-xl font-bold text-[#015023]">Riwayat Pembayaran</h2>
                
                {/* Tombol Bulk Download Dinamis (Muncul jika ada yg di-checklist) */}
                {selectedIds.length > 0 && (
                  <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4">
                    <span className="text-sm font-medium text-gray-500">
                      <span className="font-bold text-[#015023]">{selectedIds.length}</span> dipilih
                    </span>
                    <button 
                      onClick={handleBulkDownload}
                      disabled={isDownloadingBulk}
                      className="flex items-center gap-2 px-4 py-2 bg-[#DABC4E] text-[#015023] rounded-xl text-sm font-bold shadow-sm hover:bg-[#c9aa3f] transition-all disabled:opacity-70"
                    >
                      {isDownloadingBulk ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileStack className="w-4 h-4" />}
                      Unduh Terpilih (.zip)
                    </button>
                    <button 
                      onClick={() => setSelectedIds([])}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {/* Kolom Checkbox Header */}
                        <th className="py-4 px-6 w-10">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded border-gray-300 text-[#015023] focus:ring-[#015023] cursor-pointer"
                            onChange={handleSelectAll}
                            checked={selectedIds.length === riwayatPembayaran.length && riwayatPembayaran.length > 0}
                          />
                        </th>
                        <th className="py-4 px-6">Semester</th>
                        <th className="py-4 px-6">Nominal</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {riwayatPembayaran.map((item) => (
                        <tr 
                          key={item.id} 
                          className={`transition-colors ${selectedIds.includes(item.id) ? 'bg-green-50/50' : 'hover:bg-gray-50/50'}`}
                        >
                          {/* Kolom Checkbox Row */}
                          <td className="py-4 px-6">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 rounded border-gray-300 text-[#015023] focus:ring-[#015023] cursor-pointer"
                              checked={selectedIds.includes(item.id)}
                              onChange={() => handleSelectRow(item.id)}
                            />
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-sm font-bold text-[#015023]">{item.semester}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{item.tahun}</p>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-sm font-bold text-gray-800">{formatRupiah(item.nominal)}</p>
                          </td>
                          <td className="py-4 px-6">
                            <div className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                              <CheckCircle className="w-3.5 h-3.5" />
                              {item.status}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-green-50 hover:text-[#015023] hover:border-green-200 rounded-lg text-xs font-bold transition-all shadow-sm">
                              <Download className="w-3.5 h-3.5" />
                              Kwitansi
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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