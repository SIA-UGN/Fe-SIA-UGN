'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { Navbar } from '@/components/ui/navigation-menu';
import AdminFilterBar from '@/features/admin-persuratan/components/AdminFilterBar';
import Footer from '@/components/ui/footer';
import AdminNavbar from '@/components/ui/admin-navbar';
import InfoCard from '@/components/ui/info-card';
import { BookOpen, Users, Search} from 'lucide-react';
import DataTable from '@/components/ui/table';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const font = { fontFamily: 'Urbanist, sans-serif' };

export default function ThesisUsersPage() {
  const [activeTab, setActiveTab] = useState('students');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({
    total_students: 12,
    total_students_with_supervisor: 7,
    total_supervisors: 7,
    total_active_supervisors: 6,
  });

  // --- 1. STATE UNTUK FILTER BAR ---
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // 1. Definisi Kolom Mahasiswa
  const studentColumns = [
    { key: 'nim_nama', label: 'NIM / Nama', width: '25%' },
    { key: 'program_studi', label: 'Program Studi', width: '20%' },
    { key: 'semester', label: 'Semester', width: '10%' },
    { key: 'ipk', label: 'IPK', width: '10%' },
    { key: 'status', label: 'Status', width: '10%' },
    { key: 'dosen_pembimbing', label: 'Dosen Pembimbing', width: '25%' },
  ];

  // 2. Definisi Kolom Dosen
  const supervisorColumns = [
    { key: 'nip_nama', label: 'NIP / Nama', width: '25%' },
    { key: 'bidang_keahlian', label: 'Bidang Keahlian', width: '25%' },
    { key: 'jabatan', label: 'Jabatan', width: '20%' },
    { key: 'status', label: 'Status', width: '15%' },
    { key: 'kuota_bimbingan', label: 'Kuota Bimbingan', width: '15%' },
  ];
  
  // Dummy data Mahasiswa
  const dummyStudents = Array.from({ length: 25 }).map((_, i) => ({
    id: i + 1,
    no: i + 1,
    nim: `2022010${(i + 1).toString().padStart(3, '0')}`,
    nama: i % 2 === 0 ? `Hasan Fahrezi ${i + 1}` : `Siti Aminah ${i + 1}`,
    program_studi: i % 3 === 0 ? 'Sistem Informasi' : 'Teknik Informatika',
    semester: 8,
    ipk: (3.5 + (i % 5) * 0.1).toFixed(2),
    status: i % 4 === 0 ? 'Lulus' : i % 5 === 0 ? 'Cuti' : 'Aktif',
    dosen_pembimbing: i % 2 === 0 ? 'Dr. Ahmad Santoso' : 'Belum ditentukan',
  }));

  // Dummy data Dosen
  const dummySupervisors = Array.from({ length: 18 }).map((_, i) => ({
    id: i + 1,
    no: i + 1,
    nip: `19801015200812${(i + 1).toString().padStart(3, '0')}`,
    nama: i % 2 === 0 ? `Dr. Ahmad Santoso ${i + 1}` : `Prof. Budi Raharjo ${i + 1}`,
    bidang_keahlian: i % 3 === 0 ? 'Keamanan Siber' : 'Kecerdasan Buatan',
    jabatan: i % 2 === 0 ? 'Lektor Kepala' : 'Guru Besar',
    status: i % 4 === 0 ? 'Cuti' : 'Aktif',
    kuota_bimbingan: `${(i % 5) + 1}/5`,
  }));

  // --- 2. FUNGSI UNTUK RESET FILTER ---
  const clearFilters = useCallback(() => {
    setFilterCategory('all');
    setFilterStatus('all');
    setFilterDateFrom('');
    setFilterDateTo('');
    setSearchQuery('');
  }, []);
  
  // --- 3. DAFTAR KATEGORI DINAMIS UNTUK FILTER BAR ---
  // Jika tab mahasiswa -> Kategori = Program Studi
  // Jika tab dosen -> Kategori = Bidang Keahlian
  const categories = useMemo(() => {
    const key = activeTab === 'students' ? 'program_studi' : 'bidang_keahlian';
    const uniqueValues = Array.from(new Set(data.map(item => item[key])));
    return uniqueValues.map(val => ({ id: val, name: val }));
  }, [data, activeTab]);

  // --- 4. LOGIKA PENCARIAN & FILTER TERINTEGRASI ---
  const filteredUsers = useMemo(() => {
    return data
      .filter((item) => {
        // A. Filter Pencarian (Search)
        const searchString = activeTab === 'students'
          ? [item.nim, item.nama, item.program_studi].join(' ').toLowerCase()
          : [item.nip, item.nama, item.bidang_keahlian].join(' ').toLowerCase();
        const matchSearch = searchString.includes(searchQuery.toLowerCase());

        // B. Filter Kategori (Program Studi / Bidang Keahlian)
        const itemCategory = activeTab === 'students' ? item.program_studi : item.bidang_keahlian;
        const matchCategory = filterCategory === 'all' || itemCategory === filterCategory;

        // C. Filter Status
        const matchStatus = filterStatus === 'all' || item.status.toLowerCase() === filterStatus.toLowerCase();

        return matchSearch && matchCategory && matchStatus;
      })
      .map((item) => ({
        ...item,
        ...(activeTab === 'students'
          ? { nim_nama: `${item.nim} / ${item.nama}` }
          : { nip_nama: `${item.nip} / ${item.nama}` }),
      }));
  }, [data, activeTab, searchQuery, filterCategory, filterStatus]);

  useEffect(() => {
    // Simulasi fetch data
    setIsLoading(true);
    setData([]); 
    
    const timer = setTimeout(() => {
      setData(activeTab === 'students' ? dummyStudents : dummySupervisors);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [activeTab]);

  // --- 5. EVENT HANDLERS UNTUK AKSI ---
  const handleEdit = useCallback((item) => {
    console.log('Edit clicked', item);
    toast.info(`Edit data: ${item.nama || item.nim_nama || item.nip_nama}`);
  }, []);

  const handleActivate = useCallback((item) => {
    console.log('Activate clicked', item);
    // Karena ini masih menggunakan dummy data, kita buat simulasi perubahannya
    // Di aplikasi nyata, ini akan memanggil API backend
    const newStatus = item.status === 'Aktif' ? 'Non-Aktif' : 'Aktif';
    toast.success(`Status ${item.nama} berhasil diubah menjadi ${newStatus}`);
    
    // Update local state (optional simulation)
    setData(prev => prev.map(d => d.id === item.id ? { ...d, status: newStatus } : d));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Admin Navbar */}
      <AdminNavbar title="Kelola Data User" />

      {/* Main Content */}
      <main className="flex-1 bg-brand-light-sage">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Back Button */}
            <Link
              href="/adminpage/thesis"
              className="inline-flex items-center gap-2 text-sm font-medium mb-6 transition-colors hover:opacity-80"
              style={{ color: '#015023', ...font }}
            >
              <ArrowLeft size={18} />
              Kembali
            </Link>

            {/* Header */}
            <div className="mb-8">
              <h1
                className="text-3xl font-bold mb-1"
                style={{ color: '#015023', ...font }}
              >
                Kelola Data User
              </h1>
              <p className="text-gray-600 text-sm" style={font}>
                Manajemen data mahasiswa dan dosen dalam sistem bimbingan TA
              </p>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 mb-8">
              <InfoCard
                title="Total Mahasiswa"
                value={stats.total_students}
                subtitle="Terdaftar aktif"
                Icon={Users}
                theme="green"
                variant="horizontal"
              />
              <InfoCard
                title="Sudah Punya Dosen"
                value={stats.total_students_with_supervisor}
                subtitle="Mahasiswa bimbingan"
                Icon={Users}
                theme="blue"
                variant="horizontal"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 mb-8">
              <InfoCard
                title="Total Dosen"
                value={stats.total_supervisors}
                subtitle="Dosen terdaftar"
                Icon={BookOpen}
                theme="yellow"
                variant="horizontal"
              />
              <InfoCard
                title="Dosen Aktif"
                value={stats.total_active_supervisors}
                subtitle="Dosen bimbingan aktif"
                Icon={Users}
                theme="purple"
                variant="horizontal"
              />
            </div>

            {/* Type Tabs */}
            <div className="mb-8 bg-white rounded-2xl shadow-lg overflow-hidden px-3 py-2">
              <div className="flex">
                {[
                  { key: 'students', label: 'Mahasiswa', count: stats.total_students },
                  { key: 'supervisors', label: 'Dosen', count: stats.total_supervisors },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab.key);
                      clearFilters(); // Reset semua filter saat pindah tab
                    }}
                    className={`flex-1 px-6 py-4 font-semibold text-center transition-all ${
                      activeTab === tab.key
                        ? 'bg-[#015023] text-white rounded-2xl shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-50 rounded-2xl'
                    }`}
                    style={activeTab === tab.key ? {} : { color: '#015023' }}
                  >
                    {tab.label} <span className="ml-2 text-sm">({tab.count})</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Filter Bar */}
            <div className="mb-6 grid-cols-1 md:grid-cols-2 gap-4">
              <AdminFilterBar
                categories={categories}
                filterCategory={filterCategory}
                setFilterCategory={setFilterCategory}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                filterDateFrom={filterDateFrom}
                setFilterDateFrom={setFilterDateFrom}
                filterDateTo={filterDateTo}
                setFilterDateTo={setFilterDateTo}
                clearFilters={clearFilters}
                statuses={[
                  { value: 'aktif', label: 'Aktif' },
                  { value: 'cuti', label: 'Cuti' },
                  { value: 'lulus', label: 'Lulus' },
                  { value: 'non-aktif', label: 'Non-Aktif' }
                ]}
              />
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="flex items-center gap-3 rounded-xl bg-[#f3d45c] px-4 py-3">
                <Search size={18} className="shrink-0 text-[#015023]" />
                <input
                  type="text"
                  placeholder={`Cari ${activeTab === 'students' ? 'Mahasiswa' : 'Dosen'}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border-0 bg-transparent outline-none placeholder:text-[#015023]/70 text-[#015023]"
                />
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden min-h-[300px]">
              {isLoading ? (
                <div className="p-8 flex items-center justify-center h-full text-[#015023] font-medium">
                  Memuat data...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-8 flex items-center justify-center h-full text-gray-500 font-medium">
                  Tidak ada data ditemukan
                </div>
              ) : (
                <DataTable
                  columns={activeTab === 'students' ? studentColumns : supervisorColumns}
                  data={filteredUsers}
                  actions={['edit', 'activate']}
                  onEdit={handleEdit}
                  onActivate={handleActivate}
                  pagination
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}