'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import AdminNavbar from '@/components/ui/admin-navbar';
import Footer from '@/components/ui/footer';
import DataTable from '@/components/ui/table';
import { adminThesisApi } from '@/features/bimbingan-ta/api/admin';
import {
  ArrowLeft, FileText, Clock, CheckCircle,
  UserCheck, UserMinus, Filter, Search, Calendar,
  RefreshCw, AlertCircle, Loader2
} from 'lucide-react';

// --- Helpers ---
const formatDate = (value) => {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  } catch {
    return value;
  }
};

const mapStatus = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'on_progress') return 'Approved';
  if (s === 'revision') return 'Approved';
  if (s === 'finished') return 'Approved';
  if (s === 'proposing') return 'Menunggu Approval';
  return 'Menunggu Approval';
};

// Map StudentThesis → row shape expected by the table
const mapToRow = (item) => {
  const supervisor = item.supervisors?.[0]?.lecturer ?? null;
  const request = item.thesis_lecturers?.[0] ?? null;

  let statusDisplay = mapStatus(item.status);
  if (request) {
    if (request.status === 'accepted') statusDisplay = 'Approved';
    else if (request.status === 'rejected') statusDisplay = 'Ditolak';
    else statusDisplay = 'Menunggu Approval';
  }

  return {
    id: item.id_student_thesis,
    id_pengajuan: `TA-${String(item.id_student_thesis).padStart(4, '0')}`,
    mahasiswa: {
      nama: item.student?.name ?? '-',
      nim: item.student?.username ?? '-',
      prodi: item.program?.name ?? '-',
    },
    judul_ta: item.title_ind ?? '-',
    tgl_pengajuan: formatDate(item.created_at),
    status: statusDisplay,
    pembimbing: supervisor
      ? { status: 'Sudah Ada', nama: supervisor.name }
      : { status: 'Belum Ada', nama: null },
  };
};

export default function ThesisConsultationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDosen, setFilterDosen] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Fetch Data ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminThesisApi.getStudents({ per_page: 100 });
      const rawList = response?.data ?? [];
      setRows(rawList.map(mapToRow));
    } catch (err) {
      setError(
        err?.userMessage ?? err?.message ?? 'Gagal memuat data pengajuan TA.'
      );
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Statistics (computed from live data) ---
  const stats = useMemo(() => {
    const menunggu = rows.filter((r) => r.status === 'Menunggu Approval').length;
    const approved = rows.filter((r) => r.status === 'Approved').length;
    const ditolak = rows.filter((r) => r.status === 'Ditolak').length;
    const sudahDosen = rows.filter((r) => r.pembimbing.status === 'Sudah Ada').length;
    return {
      total: rows.length,
      menunggu,
      approved,
      ditolak,
      sudahDosen,
      belumDosen: rows.length - sudahDosen,
    };
  }, [rows]);

  // --- Filtered data ---
  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return rows.filter((item) => {
      const matchSearch =
        !q ||
        item.mahasiswa.nama.toLowerCase().includes(q) ||
        item.mahasiswa.nim.toLowerCase().includes(q) ||
        item.id_pengajuan.toLowerCase().includes(q) ||
        item.judul_ta.toLowerCase().includes(q);

      const matchStatus = !filterStatus || item.status === filterStatus;
      const matchDosen =
        !filterDosen ||
        (filterDosen === 'ada' && item.pembimbing.status === 'Sudah Ada') ||
        (filterDosen === 'tidak' && item.pembimbing.status === 'Belum Ada');
      const matchDate = !filterDate || item.tgl_pengajuan.startsWith(filterDate);

      return matchSearch && matchStatus && matchDosen && matchDate;
    });
  }, [rows, searchQuery, filterStatus, filterDosen, filterDate]);

  // --- Column config ---
  const columns = [
    { key: 'id_pengajuan', label: 'ID Pengajuan' },
    { key: 'mahasiswa', label: 'Mahasiswa' },
    { key: 'judul_ta', label: 'Judul TA' },
    { key: 'tgl_pengajuan', label: 'Tgl. Pengajuan' },
    { key: 'status', label: 'Status' },
    { key: 'pembimbing', label: 'Pembimbing' },
    { key: 'aksi', label: 'Aksi' },
  ];

  const customRender = {
    id_pengajuan: (value) => (
      <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200">
        {value}
      </span>
    ),
    mahasiswa: (val, item) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#015023] text-white flex items-center justify-center font-bold text-sm shrink-0">
          {item.mahasiswa.nama.split(' ').map((n) => n[0]).join('').substring(0, 2)}
        </div>
        <div className="flex flex-col text-left">
          <span className="text-sm font-bold text-gray-900">{item.mahasiswa.nama}</span>
          <span className="text-xs text-gray-500">{item.mahasiswa.nim}</span>
          <span className="text-xs text-gray-400">{item.mahasiswa.prodi}</span>
        </div>
      </div>
    ),
    judul_ta: (value) => (
      <div className="max-w-[200px] text-sm text-gray-700 font-medium">{value}</div>
    ),
    tgl_pengajuan: (value) => (
      <div className="flex flex-col items-center justify-center gap-1 text-gray-500">
        <Calendar className="w-4 h-4" />
        <span className="text-xs font-medium">{value}</span>
      </div>
    ),
    status: (value) => {
      if (value === 'Approved') {
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-600 border border-green-200 text-xs font-bold">
            <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
            <CheckCircle className="w-3.5 h-3.5" /> Approved
          </div>
        );
      }
      if (value === 'Ditolak') {
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 text-xs font-bold">
            <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
            Ditolak
          </div>
        );
      }
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-50 text-yellow-600 border border-yellow-200 text-xs font-bold">
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-600" />
          Menunggu Approval
        </div>
      );
    },
    pembimbing: (val, item) => (
      <div className="flex flex-col items-center justify-center">
        {item.pembimbing.status === 'Sudah Ada' ? (
          <>
            <span className="inline-flex items-center gap-1 text-green-600 text-xs font-bold">
              <UserCheck className="w-3.5 h-3.5" /> Sudah Ada
            </span>
            <span className="text-xs text-gray-500 mt-1 text-center">{item.pembimbing.nama}</span>
          </>
        ) : (
          <span className="inline-flex items-center gap-1 text-gray-400 text-xs font-bold">
            <UserMinus className="w-3.5 h-3.5" /> Belum Ada
          </span>
        )}
      </div>
    ),
    aksi: (val, item) => (
      <Link
        href={`/adminpage/thesis/consultations/${item.id}`}
        className="bg-[#015023] hover:bg-[#013d1b] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-1"
      >
        Detail →
      </Link>
    ),
  };

  // --- Loading state ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col font-urbanist bg-[#f4f7f5]">
        <AdminNavbar title="Monitoring Pengajuan TA" />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <Loader2 className="w-10 h-10 animate-spin text-[#015023]" />
            <p className="text-sm font-medium">Memuat data pengajuan...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // --- Error state ---
  if (error) {
    return (
      <div className="min-h-screen flex flex-col font-urbanist bg-[#f4f7f5]">
        <AdminNavbar title="Monitoring Pengajuan TA" />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-red-100 flex flex-col items-center gap-4 max-w-sm w-full text-center">
            <AlertCircle className="w-12 h-12 text-red-400" />
            <h3 className="text-lg font-bold text-gray-800">Gagal Memuat Data</h3>
            <p className="text-sm text-gray-500">{error}</p>
            <button
              onClick={fetchData}
              className="mt-2 inline-flex items-center gap-2 bg-[#015023] hover:bg-[#013d1b] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Coba Lagi
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-urbanist bg-[#f4f7f5]">
      <AdminNavbar title="Monitoring Pengajuan TA" />

      <main className="flex-1 p-6 md:p-10">
        <div className="max-w-7xl mx-auto">

          {/* Back Button */}
          <Link
            href="/adminpage/thesis"
            className="inline-flex items-center gap-2 text-sm font-bold mb-6 text-[#015023] hover:opacity-80 transition-opacity"
          >
            <ArrowLeft size={18} />
            Dashboard Bimbingan
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#015023] mb-2">
              Monitoring Pengajuan TA
            </h1>
            <p className="text-gray-500 text-sm font-medium">
              Pantau status pengajuan judul tugas akhir seluruh mahasiswa
            </p>
          </div>

          {/* Hero Banner */}
          <div className="bg-[#015023] rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row justify-between items-center text-white mb-6 shadow-md relative overflow-hidden">
            <div className="w-full lg:w-auto mb-6 lg:mb-0 z-10">
              <h2 className="text-lg font-bold mb-1 text-green-50">Total Pengajuan TA</h2>
              <div className="text-5xl sm:text-6xl font-extrabold mb-1">{stats.total}</div>
              <p className="text-sm text-green-200 font-medium">Pengajuan terdaftar</p>
            </div>

            <div className="flex w-full lg:w-auto justify-between lg:justify-end gap-6 sm:gap-12 z-10">
              <div className="text-center">
                <p className="text-xs sm:text-sm text-green-200 mb-1 font-semibold">Menunggu</p>
                <p className="text-3xl sm:text-4xl font-bold text-[#DABC4E]">{stats.menunggu}</p>
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm text-green-200 mb-1 font-semibold">Approved</p>
                <p className="text-3xl sm:text-4xl font-bold text-green-400">{stats.approved}</p>
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm text-green-200 mb-1 font-semibold">Ditolak</p>
                <p className="text-3xl sm:text-4xl font-bold text-red-400">{stats.ditolak}</p>
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-center bg-[#DABC4E] p-5 rounded-2xl z-10 ml-8 shadow-sm">
              <FileText size={36} className="text-[#015023]" />
            </div>

            <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-5 rounded-2xl flex items-center gap-4 shadow-sm border border-gray-100">
              <div className="p-3 bg-yellow-50 rounded-xl text-yellow-500"><Clock size={24} /></div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Menunggu Approval</p>
                <p className="text-2xl font-bold text-gray-800">{stats.menunggu}</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl flex items-center gap-4 shadow-sm border border-gray-100">
              <div className="p-3 bg-green-50 rounded-xl text-green-500"><CheckCircle size={24} /></div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl flex items-center gap-4 shadow-sm border border-gray-100">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-500"><UserCheck size={24} /></div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sudah Ada Dosen</p>
                <p className="text-2xl font-bold text-blue-600">{stats.sudahDosen}</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl flex items-center gap-4 shadow-sm border border-gray-100">
              <div className="p-3 bg-gray-50 rounded-xl text-gray-400"><UserMinus size={24} /></div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Belum Ada Dosen</p>
                <p className="text-2xl font-bold text-gray-600">{stats.belumDosen}</p>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex items-center gap-2 text-[#015023] font-bold shrink-0">
              <Filter size={20} /> Filter
            </div>
            <div className="flex flex-wrap md:flex-nowrap items-center gap-4 w-full">
              <div className="flex flex-col gap-1 w-full md:w-auto">
                <label className="text-xs font-bold text-gray-500">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="p-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#015023] text-gray-700 bg-white"
                >
                  <option value="">Semua</option>
                  <option value="Approved">Approved</option>
                  <option value="Menunggu Approval">Menunggu Approval</option>
                  <option value="Ditolak">Ditolak</option>
                </select>
              </div>
              <div className="flex flex-col gap-1 w-full md:flex-1">
                <label className="text-xs font-bold text-gray-500">Dosen Pembimbing</label>
                <select
                  value={filterDosen}
                  onChange={(e) => setFilterDosen(e.target.value)}
                  className="p-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#015023] text-gray-700 bg-white"
                >
                  <option value="">Semua</option>
                  <option value="ada">Sudah Ada</option>
                  <option value="tidak">Belum Ada</option>
                </select>
              </div>
              <div className="flex flex-col gap-1 w-full md:w-auto">
                <label className="text-xs font-bold text-gray-500">Dari Tanggal</label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="p-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#015023] text-gray-700 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-[#DABC4E] rounded-2xl p-4 shadow-sm mb-6 flex items-center gap-3">
            <Search className="text-[#015023] w-5 h-5 shrink-0" />
            <input
              type="text"
              placeholder="Cari Mahasiswa, NIM, atau Judul TA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-[#015023] placeholder:text-[#015023]/70 font-semibold"
            />
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden [&_thead]:bg-[#DABC4E] [&_thead_th]:text-[#015023] [&_thead_th]:font-extrabold [&_thead_th]:py-4">
            {filteredData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                <FileText className="w-12 h-12 mb-3 opacity-50" strokeWidth={1.5} />
                <p className="text-sm font-medium text-gray-400">Tidak ada data yang ditemukan</p>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={filteredData}
                customRender={customRender}
                pagination={true}
              />
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}