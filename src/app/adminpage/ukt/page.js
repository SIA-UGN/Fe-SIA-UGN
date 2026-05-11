'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Search, Filter, RefreshCw, Download, 
  CheckCircle, Clock, XCircle, FileText, User, 
  CreditCard, Calendar, AlertCircle, X
} from 'lucide-react';
import AdminNavbar from '@/components/ui/admin-navbar';
import Footer from '@/components/ui/footer';
import DataTable from '@/components/ui/table';
import { toast } from 'sonner';

export default function AdminUktMonitoringPage() {
  // --- STATE MANAGEMENT ---
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProdi, setFilterProdi] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [filterTingkat, setFilterTingkat] = useState('Semua');
  
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // State untuk Modal Detail
  const [selectedTrx, setSelectedTrx] = useState(null);
  const [isSyncingSingle, setIsSyncingSingle] = useState(false);

  // --- DUMMY DATA TRANSAKSI UKT MAHASISWA ---
  const rawData = [
    {
      id: 1,
      id_transaksi: 'TRX-UKT-2026-001',
      mahasiswa: {
        nama: 'Dimas Jati Satria',
        nim: '2022010001',
        prodi: 'Teknologi Rekayasa Perangkat Lunak'
      },
      tingkat_ukt: 3,
      nominal: 3500000,
      metode: 'Transfer Bank BNI (VA)',
      va_number: '98812021010001',
      waktu_dibuat: '08 Mei 2026, 08:00 WIB',
      waktu_bayar: '08 Mei 2026, 15:52 WIB',
      status: 'Lunas'
    },
    {
      id: 2,
      id_transaksi: 'TRX-UKT-2026-002',
      mahasiswa: {
        nama: 'Ahmad Fauzi',
        nim: '2022010002',
        prodi: 'Teknologi Rekayasa Perangkat Lunak'
      },
      tingkat_ukt: 3,
      nominal: 3500000,
      metode: 'Transfer Bank Mandiri (VA)',
      va_number: '89912021010002',
      waktu_dibuat: '10 Mei 2026, 10:15 WIB',
      waktu_bayar: null,
      status: 'Menunggu'
    },
    {
      id: 3,
      id_transaksi: 'TRX-UKT-2026-003',
      mahasiswa: {
        nama: 'Siti Aminah',
        nim: '2022010003',
        prodi: 'Sistem Informasi'
      },
      tingkat_ukt: 2,
      nominal: 2500000,
      metode: 'Transfer Bank BRI (VA)',
      va_number: '77712021010003',
      waktu_dibuat: '05 Mei 2026, 09:00 WIB',
      waktu_bayar: null,
      status: 'Expired'
    },
    {
      id: 4,
      id_transaksi: 'TRX-UKT-2026-004',
      mahasiswa: {
        nama: 'Hasan Fahrezi',
        nim: '2022010004',
        prodi: 'Teknik Informatika'
      },
      tingkat_ukt: 3,
      nominal: 3500000,
      metode: 'Transfer Bank BNI (VA)',
      va_number: '98812021010004',
      waktu_dibuat: '09 Mei 2026, 11:20 WIB',
      waktu_bayar: '09 Mei 2026, 14:10 WIB',
      status: 'Lunas'
    },
    {
      id: 5,
      id_transaksi: 'TRX-UKT-2026-005',
      mahasiswa: {
        nama: 'Resti Dinda',
        nim: '2022010005',
        prodi: 'Sistem Informasi'
      },
      tingkat_ukt: 4,
      nominal: 4500000,
      metode: 'Transfer Bank BCA (VA)',
      va_number: '10012021010005',
      waktu_dibuat: '11 Mei 2026, 07:30 WIB',
      waktu_bayar: null,
      status: 'Menunggu'
    },
  ];

  // --- STATISTIK REKAPITULASI (Dihitung dari data) ---
  const stats = useMemo(() => {
    const total = rawData.length;
    const lunas = rawData.filter(i => i.status === 'Lunas').length;
    const menunggu = rawData.filter(i => i.status === 'Menunggu').length;
    const expired = rawData.filter(i => i.status === 'Expired').length;
    
    const totalNominal = rawData.reduce((acc, curr) => acc + curr.nominal, 0);
    const nominalLunas = rawData.filter(i => i.status === 'Lunas').reduce((acc, curr) => acc + curr.nominal, 0);
    
    return {
      total, lunas, menunggu, expired, totalNominal, nominalLunas,
      pctLunas: Math.round((lunas / total) * 100) || 0
    };
  }, [rawData]);

  // --- FILTER & SEARCH LOGIC ---
  const filteredData = useMemo(() => {
    return rawData.filter(item => {
      // Search
      const str = `${item.mahasiswa.nama} ${item.mahasiswa.nim} ${item.id_transaksi}`.toLowerCase();
      const matchSearch = str.includes(searchQuery.toLowerCase());
      
      // Filters
      const matchProdi = filterProdi === 'Semua' || item.mahasiswa.prodi === filterProdi;
      const matchStatus = filterStatus === 'Semua' || item.status === filterStatus;
      const matchTingkat = filterTingkat === 'Semua' || `Tingkat ${item.tingkat_ukt}` === filterTingkat;
      
      return matchSearch && matchProdi && matchStatus && matchTingkat;
    });
  }, [rawData, searchQuery, filterProdi, filterStatus, filterTingkat]);

  // --- HELPERS ---
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  // --- HANDLERS ---
  const handleSyncMassal = async () => {
    setIsSyncingAll(true);
    toast.loading('Melakukan rekonsiliasi status massal ke Payment Gateway...', { id: 'sync-all' });
    await new Promise(resolve => setTimeout(resolve, 2500));
    toast.success('Sinkronisasi selesai! 12 tagihan diperbarui.', { id: 'sync-all' });
    setIsSyncingAll(false);
  };

  const handleExportLaporan = async () => {
    setIsExporting(true);
    toast.loading('Mengekspor laporan UKT ke format Excel...', { id: 'export' });
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success('Laporan berhasil diunduh!', { id: 'export' });
    setIsExporting(false);
  };

  const handleSyncSingleTrx = async (idTrx) => {
    setIsSyncingSingle(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success(`Status transaksi ${idTrx} tersinkronisasi dengan bank.`);
    setIsSyncingSingle(false);
  };

  const handleBatalkanTrx = (idTrx) => {
    const confirm = window.confirm(`Apakah Anda yakin ingin membatalkan tagihan ${idTrx} secara manual?`);
    if (confirm) {
      toast.success(`Transaksi ${idTrx} berhasil dibatalkan.`);
      setSelectedTrx(null);
    }
  };

  // --- CONFIG TABEL ---
  const columns = [
    { key: 'id_transaksi', label: 'ID Transaksi' },
    { key: 'mahasiswa', label: 'Mahasiswa' },
    { key: 'tingkat_ukt', label: 'Golongan' },
    { key: 'nominal', label: 'Nominal' },
    { key: 'status', label: 'Status Gateway' },
    { key: 'aksi', label: 'Aksi' },
  ];

  const customRender = {
    id_transaksi: (val) => (
      <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-mono font-bold border border-gray-200">
        {val}
      </span>
    ),
    mahasiswa: (val, item) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#015023] text-white flex items-center justify-center font-bold text-xs shrink-0">
          {item.mahasiswa.nama.split(' ').map(n => n[0]).join('').substring(0, 2)}
        </div>
        <div className="flex flex-col text-left">
          <span className="text-sm font-bold text-gray-900">{item.mahasiswa.nama}</span>
          <span className="text-xs text-gray-500">{item.mahasiswa.nim} &bull; {item.mahasiswa.prodi}</span>
        </div>
      </div>
    ),
    tingkat_ukt: (val) => (
      <span className="text-sm font-bold text-gray-700">Tingkat {val}</span>
    ),
    nominal: (val) => (
      <span className="text-sm font-extrabold text-[#015023]">{formatRupiah(val)}</span>
    ),
    status: (val) => {
      if (val === 'Lunas') {
        return (
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-600 border border-green-200 text-xs font-bold">
            <CheckCircle className="w-3 h-3" /> Lunas
          </div>
        );
      }
      if (val === 'Expired') {
        return (
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 text-xs font-bold">
            <XCircle className="w-3 h-3" /> Expired
          </div>
        );
      }
      return (
        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-50 text-yellow-600 border border-yellow-200 text-xs font-bold">
          <Clock className="w-3 h-3" /> Menunggu
        </div>
      );
    },
    aksi: (val, item) => (
      <button 
        onClick={() => setSelectedTrx(item)}
        className="bg-[#015023] hover:bg-[#013d1b] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
      >
        Detail
      </button>
    )
  };

  return (
    <div className="min-h-screen flex flex-col font-urbanist bg-[#f4f7f5]">
      <AdminNavbar title="Monitoring UKT" />

      <main className="flex-1 p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          
          {/* Back Navigation */}
          <Link
            href="/adminpage"
            className="inline-flex items-center gap-2 text-sm font-bold mb-6 text-[#015023] hover:opacity-80 transition-opacity"
          >
            <ArrowLeft size={18} />
            Kembali ke Dashboard Utama
          </Link>

          {/* Header & Tombol Action Massal */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-[#015023] mb-1">
                Monitoring Pembayaran UKT
              </h1>
              <p className="text-gray-500 text-sm font-medium">
                Pantau otomatisasi pembayaran UKT mahasiswa secara real-time dari Payment Gateway
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={handleSyncMassal}
                disabled={isSyncingAll}
                className="flex items-center gap-2 bg-white border border-[#015023] text-[#015023] hover:bg-green-50 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm disabled:opacity-70"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncingAll ? 'animate-spin' : ''}`} />
                {isSyncingAll ? 'Menyinkronkan...' : 'Sinkronisasi'}
              </button>

              <button 
                onClick={handleExportLaporan}
                disabled={isExporting}
                className="flex items-center gap-2 bg-[#DABC4E] text-[#015023] hover:bg-[#c9aa3f] font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm disabled:opacity-70"
              >
                <Download className="w-4 h-4" />
                {isExporting ? 'Mengekspor...' : 'Ekspor Laporan'}
              </button>
            </div>
          </div>

          {/* --- 1. BANNER STATISTIK (Hijau Gelap) --- */}
          <div className="bg-[#015023] rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center text-white mb-6 shadow-md relative overflow-hidden gap-6">
            <div className="z-10">
              <span className="bg-white/20 text-green-100 text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block backdrop-blur-sm">
                SEMESTER GENAP 2025/2026
              </span>
              <h2 className="text-sm font-medium text-green-200">Total Pemasukan Masuk</h2>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#DABC4E] mt-1">
                {formatRupiah(stats.nominalLunas)}
              </div>
              <p className="text-xs text-green-200 mt-1">
                Dari target total {formatRupiah(stats.totalNominal)} ({stats.pctLunas}% Lunas)
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 w-full lg:w-auto border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-8 z-10">
              <div>
                <p className="text-xs text-green-200 font-semibold">Total Tagihan</p>
                <p className="text-2xl font-bold mt-1">{stats.total}</p>
                <span className="text-[10px] text-gray-300">Mahasiswa</span>
              </div>
              <div>
                <p className="text-xs text-green-200 font-semibold">Lunas (Verified)</p>
                <p className="text-2xl font-bold mt-1 text-green-400">{stats.lunas}</p>
                <span className="text-[10px] text-green-300">Terbayar</span>
              </div>
              <div>
                <p className="text-xs text-green-200 font-semibold">Menunggu Bayar</p>
                <p className="text-2xl font-bold mt-1 text-yellow-300">{stats.menunggu}</p>
                <span className="text-[10px] text-yellow-200">Pending VA</span>
              </div>
              <div>
                <p className="text-xs text-green-200 font-semibold">Gagal / Expired</p>
                <p className="text-2xl font-bold mt-1 text-red-400">{stats.expired}</p>
                <span className="text-[10px] text-red-200">Hangus</span>
              </div>
            </div>

            {/* Efek Latar Hijau Tipis */}
            <div className="absolute right-0 top-0 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl pointer-events-none translate-x-10 -translate-y-10"></div>
          </div>

          {/* --- 2. FILTER & PENCARIAN BAR --- */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6 flex flex-col gap-4">
            
            {/* Row 1: Search Bar (Kuning) */}
            <div className="bg-[#DABC4E] rounded-xl p-3.5 flex items-center gap-3 shadow-inner">
              <Search className="text-[#015023] w-5 h-5 shrink-0" />
              <input 
                type="text" 
                placeholder="Cari nama mahasiswa, NIM, atau ID Transaksi..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-[#015023] placeholder:text-[#015023]/70 font-semibold text-sm"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-[#015023] hover:opacity-70">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Row 2: Dropdown Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 text-[#015023] font-bold shrink-0 self-start sm:self-center text-sm">
                <Filter size={16} /> Filter Spesifik:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full sm:w-auto flex-1">
                <select 
                  value={filterProdi} 
                  onChange={(e) => setFilterProdi(e.target.value)}
                  className="p-2.5 text-xs sm:text-sm border border-gray-200 rounded-lg outline-none focus:border-[#015023] bg-white font-medium text-gray-700"
                >
                  <option value="Semua">Semua Program Studi</option>
                  <option value="Teknologi Rekayasa Perangkat Lunak">TRPL</option>
                  <option value="Sistem Informasi">Sistem Informasi</option>
                  <option value="Teknik Informatika">Teknik Informatika</option>
                </select>

                <select 
                  value={filterTingkat} 
                  onChange={(e) => setFilterTingkat(e.target.value)}
                  className="p-2.5 text-xs sm:text-sm border border-gray-200 rounded-lg outline-none focus:border-[#015023] bg-white font-medium text-gray-700"
                >
                  <option value="Semua">Semua Golongan UKT</option>
                  <option value="Tingkat 2">Tingkat 2</option>
                  <option value="Tingkat 3">Tingkat 3</option>
                  <option value="Tingkat 4">Tingkat 4</option>
                </select>

                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="p-2.5 text-xs sm:text-sm border border-gray-200 rounded-lg outline-none focus:border-[#015023] bg-white font-medium text-gray-700"
                >
                  <option value="Semua">Semua Status Gateway</option>
                  <option value="Lunas">Lunas</option>
                  <option value="Menunggu">Menunggu</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
            </div>

          </div>

          {/* --- 3. TABEL DATA TAGIHAN --- */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden [&_thead]:bg-[#DABC4E] [&_thead_th]:text-[#015023] [&_thead_th]:font-extrabold [&_thead_th]:py-4 text-sm">
            <DataTable
              columns={columns}
              data={filteredData}
              customRender={customRender}
              pagination={true}
            />
          </div>

        </div>
      </main>

      <Footer />

      {/* ========================================= */}
      {/* MODAL POP-UP DETAIL TRANSAKSI & LOG GATEWAY*/}
      {/* ========================================= */}
      {selectedTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 font-urbanist">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-[#015023] px-6 py-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#DABC4E]" />
                <h3 className="font-bold text-base">Rincian & Log Gateway</h3>
              </div>
              <button 
                onClick={() => setSelectedTrx(null)}
                className="text-gray-300 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6 bg-gray-50/30">
              
              {/* Info Mahasiswa */}
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#015023] text-white flex items-center justify-center font-bold text-base">
                  {selectedTrx.mahasiswa.nama.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-900 text-base">{selectedTrx.mahasiswa.nama}</h4>
                  <p className="text-xs text-gray-500 font-medium">{selectedTrx.mahasiswa.nim} &bull; {selectedTrx.mahasiswa.prodi}</p>
                  <span className="inline-block mt-1 text-xs font-bold text-[#015023] bg-green-50 px-2 py-0.5 rounded border border-green-100">
                    UKT Tingkat {selectedTrx.tingkat_ukt}
                  </span>
                </div>
              </div>

              {/* Rincian Transaksi */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 font-bold text-xs text-gray-600 border-b border-gray-100 uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#015023]" /> Data Payment Gateway
                </div>
                
                <div className="p-4 flex flex-col divide-y divide-gray-50 text-xs sm:text-sm">
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-gray-500">Order ID / Ref</span>
                    <span className="font-mono font-bold text-gray-800">{selectedTrx.id_transaksi}</span>
                  </div>
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-gray-500">Metode VA</span>
                    <span className="font-bold text-gray-800">{selectedTrx.metode}</span>
                  </div>
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-gray-500">Nomor Virtual Account</span>
                    <span className="font-mono font-bold text-blue-700 tracking-wider bg-blue-50 px-2 py-1 rounded">
                      {selectedTrx.va_number}
                    </span>
                  </div>
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-gray-500">Nominal Tagihan</span>
                    <span className="font-extrabold text-[#015023] text-base">{formatRupiah(selectedTrx.nominal)}</span>
                  </div>
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-gray-500">Waktu VA Dibuat</span>
                    <span className="font-medium text-gray-800">{selectedTrx.waktu_dibuat}</span>
                  </div>
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-gray-500">Waktu Terbayar</span>
                    <span className="font-medium text-gray-800">{selectedTrx.waktu_bayar || '-'}</span>
                  </div>
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-gray-500">Status Gateway</span>
                    {customRender.status(selectedTrx.status)}
                  </div>
                </div>
              </div>

              {/* Log / Peringatan */}
              <div className="bg-[#fef8e6] border border-[#fdeeb5] rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <div className="text-xs text-orange-900 leading-relaxed font-medium">
                  <span className="font-bold block mb-0.5">Catatan Sistem:</span>
                  Sistem mengecek status transaksi ini secara berkala melalui webhook. Jika uang sudah masuk di bank namun status masih "Menunggu", gunakan tombol sinkronisasi manual di bawah.
                </div>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-white border-t border-gray-100 flex flex-col sm:flex-row justify-between gap-3">
              <button 
                onClick={() => handleBatalkanTrx(selectedTrx.id_transaksi)}
                disabled={selectedTrx.status === 'Lunas'}
                className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40 disabled:hover:bg-transparent text-left sm:text-center"
              >
                Batalkan Tagihan Manual
              </button>

              <div className="flex items-center justify-end gap-2">
                <button 
                  onClick={() => setSelectedTrx(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Tutup
                </button>
                <button 
                  onClick={() => handleSyncSingleTrx(selectedTrx.id_transaksi)}
                  disabled={isSyncingSingle}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#015023] hover:bg-[#013d1b] rounded-lg transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-70"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSingle ? 'animate-spin' : ''}`} />
                  {isSyncingSingle ? 'Mengecek...' : 'Cek Status Gateway'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}