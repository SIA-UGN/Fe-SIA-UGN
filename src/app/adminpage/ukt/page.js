'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Search, Filter, RefreshCw, Download, 
  CheckCircle, Clock, XCircle, FileText, User, 
  CreditCard, Calendar, AlertCircle, X, ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AdminNavbar from '@/components/ui/admin-navbar';
import Footer from '@/components/ui/footer';
import DataTable from '@/components/ui/table';
import { toast } from 'sonner';
import PaymentDetailModal from '@/app/ukt/PaymentDetailModal';
import { fetchAdminTuitionPayments } from '@/features/ukt/services/tuitionService';

function FilterDropdown({ value, options, onChange }) {
  const selectedLabel = options.find(o => o.value === value)?.label || value;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center justify-between gap-2 p-2.5 text-xs sm:text-sm border border-gray-200 rounded-lg outline-none hover:border-[#015023] bg-white font-medium text-gray-700 transition-colors w-full text-left">
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {options.map((opt) => (
            <DropdownMenuRadioItem key={opt.value} value={opt.value}>
              {opt.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function AdminUktMonitoringPage() {
  // --- STATE MANAGEMENT ---
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProdi, setFilterProdi] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [filterTingkat, setFilterTingkat] = useState('Semua');
  
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // State untuk Modal Detail
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);

  // --- STATE DATA ---
  const [rawData, setRawData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Map verification_status from API to consistent display labels used in filters
  const mapVerificationLabel = (verificationLabel) => {
    if (verificationLabel === 'Disetujui') return 'Disetujui';
    if (verificationLabel === 'Ditolak') return 'Ditolak';
    // 'Menunggu Verifikasi' or any other pending-like label → 'Menunggu'
    return 'Menunggu';
  };

  const fetchPaymentData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchAdminTuitionPayments();
      const mappedData = response.items.map(item => ({
        id: item.id_tuition_payment,
        id_transaksi: item.transaction_reference || `PAY-${item.id_tuition_payment}`,
        mahasiswa: {
          nama: item.student?.name || 'Unknown',
          nim: item.student?.nim || '-',
          prodi: item.student?.program || 'Tidak diketahui'
        },
        tingkat_ukt: '-', 
        nominal: item.amount_paid,
        metode: item.payment_method || '-',
        waktu_dibuat: item.uploaded_at ? new Date(item.uploaded_at).toLocaleString('id-ID') : '-',
        waktu_bayar: item.verified_at ? new Date(item.verified_at).toLocaleString('id-ID') : null,
        status: mapVerificationLabel(item.verification_label)
      }));
      setRawData(mappedData);
      return mappedData.length;
    } catch (err) {
      setError(err.message || 'Gagal mengambil data UKT');
      console.error(err);
      return 0;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPaymentData();
  }, [fetchPaymentData]);

  // --- STATISTIK REKAPITULASI (Dihitung dari data) ---
  const stats = useMemo(() => {
    const total = rawData.length;
    const disetujui = rawData.filter(i => i.status === 'Disetujui').length;
    const menunggu = rawData.filter(i => i.status === 'Menunggu').length;
    const ditolak = rawData.filter(i => i.status === 'Ditolak').length;
    
    const totalNominal = rawData.reduce((acc, curr) => acc + curr.nominal, 0);
    const nominalLunas = rawData.filter(i => i.status === 'Disetujui').reduce((acc, curr) => acc + curr.nominal, 0);
    
    return {
      total, disetujui, menunggu, ditolak, totalNominal, nominalLunas,
      pctLunas: Math.round((disetujui / (total || 1)) * 100)
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

  // --- OPSI FILTER ---
  const prodiOptions = [
    { value: 'Semua', label: 'Semua Program Studi' },
    { value: 'Teknologi Rekayasa Perangkat Lunak', label: 'TRPL' },
    { value: 'Sistem Informasi', label: 'Sistem Informasi' },
    { value: 'Teknik Informatika', label: 'Teknik Informatika' },
  ];

  const tingkatOptions = [
    { value: 'Semua', label: 'Semua Golongan UKT' },
    { value: 'Tingkat 2', label: 'Tingkat 2' },
    { value: 'Tingkat 3', label: 'Tingkat 3' },
    { value: 'Tingkat 4', label: 'Tingkat 4' },
  ];

  const statusOptions = [
    { value: 'Semua', label: 'Semua Status' },
    { value: 'Disetujui', label: 'Disetujui' },
    { value: 'Menunggu', label: 'Menunggu' },
    { value: 'Ditolak', label: 'Ditolak' },
  ];

  // --- HELPERS ---
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  // --- HANDLERS ---
  const handleSyncMassal = async () => {
    setIsSyncingAll(true);
    toast.loading('Melakukan rekonsiliasi status massal ke Payment Gateway...', { id: 'sync-all' });
    const count = await fetchPaymentData();
    toast.success(`Sinkronisasi selesai! ${count} tagihan diperbarui.`, { id: 'sync-all' });
    setIsSyncingAll(false);
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
      if (val === 'Disetujui') {
        return (
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-600 border border-green-200 text-xs font-bold">
            <CheckCircle className="w-3 h-3" /> Disetujui
          </div>
        );
      }
      if (val === 'Menunggu') {
        return (
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200 text-xs font-bold animate-pulse">
            <Clock className="w-3 h-3" /> Menunggu
          </div>
        );
      }
      return (
        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 text-xs font-bold">
          <XCircle className="w-3 h-3" /> {val}
        </div>
      );
    },
    aksi: (val, item) => (
      <button 
        onClick={() => setSelectedPaymentId(item.id)}
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
                <p className="text-2xl font-bold mt-1 text-green-400">{stats.disetujui}</p>
                <span className="text-[10px] text-green-300">Terbayar</span>
              </div>
              <div>
                <p className="text-xs text-green-200 font-semibold">Menunggu Bayar</p>
                <p className="text-2xl font-bold mt-1 text-yellow-300">{stats.menunggu}</p>
                <span className="text-[10px] text-yellow-200">Pending VA</span>
              </div>
              <div>
                <p className="text-xs text-green-200 font-semibold">Gagal / Expired</p>
                <p className="text-2xl font-bold mt-1 text-red-400">{stats.ditolak}</p>
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
                <FilterDropdown 
                  value={filterProdi} 
                  onChange={setFilterProdi} 
                  options={prodiOptions} 
                />
                <FilterDropdown 
                  value={filterTingkat} 
                  onChange={setFilterTingkat} 
                  options={tingkatOptions} 
                />
                <FilterDropdown 
                  value={filterStatus} 
                  onChange={setFilterStatus} 
                  options={statusOptions} 
                />
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
              itemsPerPage={10}
              isLoading={isLoading}
            />
            {error && (
              <div className="p-4 text-center text-sm font-bold text-red-500 bg-red-50 border-t border-red-100">
                {error}
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Gunakan PaymentDetailModal untuk Admin */}
      <PaymentDetailModal 
        paymentId={selectedPaymentId} 
        onClose={() => setSelectedPaymentId(null)} 
        isAdmin={true} 
      />

      <Footer />
    </div>
  );
}