'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { DashboardCard, StatCard } from '@/components/ui/dashboard-card'
import { PrimaryButton } from '@/components/ui/button'
import AdminNavbar from '@/components/ui/admin-navbar'
import Footer from '@/components/ui/footer'
import { useDashboardStats } from '@/features/admin-dashboard/hooks/useDashboardStats'
import Cookies from 'js-cookie'
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box'
import { GraduationCap, Megaphone, Mail, SquareLibrary, Clock, ClipboardCheck, CreditCard, Gauge } from 'lucide-react'

// Icons - using icons from /public/icon folder
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path d="M12 5v14m-7-7h14" />
  </svg>
)

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const BookIcon = () => (
  <Image
    src="/icon/tabler_book.svg"
    alt="Book Icon"
    width={32}
    height={32}
    className="w-8 h-8"
    style={{ filter: 'brightness(0) invert(1)' }}
  />
)

const ClassIcon = () => (
  <Image
    src="/icon/mdi_google-classroom.svg"
    alt="Classroom Icon"
    width={32}
    height={32}
    className="w-8 h-8"
    style={{ filter: 'brightness(0) invert(1)' }}
  />
)

const StudentIcon = () => (
  <Image
    src="/icon/ph_student-fill.svg"
    alt="Student Icon"
    width={32}
    height={32}
    className="w-8 h-8"
    style={{ filter: 'brightness(0) invert(1)' }}
  />
)

const TeacherIcon = () => (
  <Image
    src="/icon/mdi_teacher.svg"
    alt="Teacher Icon"
    width={32}
    height={32}
    className="w-8 h-8"
    style={{ filter: 'brightness(0) invert(1)' }}
  />
)

const ManagerIcon = () => (
  <Image
    src="/icon/clarity_administrator-line.svg"
    alt="Administrator Icon"
    width={32}
    height={32}
    className="w-8 h-8"
    style={{ filter: 'brightness(0) invert(1)' }}
  />
)

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const GradeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
)


export default function AdminDashboard() {
  const router = useRouter();

  // Role berasal dari cookie yang hanya ada di client. Saat SSR Cookies.get()
  // mengembalikan undefined sehingga kartu khusus admin tidak dirender, tetapi
  // di client kartu itu muncul → daftar kartu bergeser → hydration mismatch.
  // Gate role di belakang flag `mounted`: render pertama (server & client) sama,
  // kartu khusus admin baru muncul setelah komponen ter-mount.
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(Cookies.get('roles') === 'admin');
  }, []);

  // Use the extracted hook for statistics
  const { statistics, isLoading: loading, error, refetch: fetchStatistics } = useDashboardStats();

  const handleCardClick = (actionType) => {
    console.log(`Clicked: ${actionType}`)
    switch (actionType) {
      case 'manage-course':
        router.push('/adminpage/tambahmatkul');
        break;
      case 'manage-class':
        router.push('/adminpage/tambahkelas');
        break;
      case 'manage-student':
        router.push('/adminpage/tambahmahasiswa');
        break;
      case 'manage-manager':
        router.push('/adminpage/tambahakun');
        break;
      case 'manage-teacher':
        router.push('/adminpage/tambahdosen');
        break;
      case 'manage-period':
        router.push('/adminpage/periodeakademik');
        break;
      case 'manage-grade':
        router.push('/adminpage/konversinilai');
        break;
      case 'create-broadcast':
        router.push('/adminpage/pengumuman');
        break;
      case 'manage-persuratan':
        router.push('/adminpage/persuratan');
        break;
      case 'manage-bimbingan':
      case 'manage-thesis':
        router.push('/admin/bimbingan');
        break;
      case 'manage-library':
        router.push('/adminpage/perpustakaan');
        break;
      case 'manage-UKT':
        router.push('/adminpage/ukt');
        break;
      case 'manage-krs-time':
        router.push('/adminpage/kelolawaktukrs');
        break;
      case 'manage-krs-quota':
        router.push('/adminpage/kelolakuotakrs');
        break;
      case 'approval-krs':
        router.push('/adminpage/approvalKRS');
        break;
      default:
        console.log('Unknown action type');
    }
  }

  const managementCards = [
    {
      id: 'manage-course',
      title: 'Manajemen Mata Kuliah',
      description: 'Tambahkan mata kuliah baru ke dalam sistem',
      icon: <BookIcon />,
      action: () => handleCardClick('manage-course')
    },
    {
      id: 'manage-class',
      title: 'Manajemen Kelas',
      description: 'Buat kelas baru untuk semester ini',
      icon: <ClassIcon />,
      action: () => handleCardClick('manage-class')
    },
    {
      id: 'manage-student',
      title: 'Manajemen Mahasiswa',
      description: 'Daftarkan mahasiswa baru ke sistem',
      icon: <StudentIcon />,
      action: () => handleCardClick('manage-student')
    },
    // Card Tambah Akun Manajer hanya untuk admin
    ...(isAdmin ? [{
      id: 'manage-manager',
      title: 'Manajemen Akun Manajer',
      description: 'Buat akun manajer untuk administrasi',
      icon: <ManagerIcon />,
      action: () => handleCardClick('manage-manager')
    }] : []),
    {
      id: 'manage-teacher',
      title: 'Manajemen Dosen',
      description: 'Tambahkan dosen baru ke dalam sistem',
      icon: <TeacherIcon />,
      action: () => handleCardClick('manage-teacher')
    },
    {
      id: 'manage-period',
      title: 'Manajemen Periode Akademik',
      description: 'Kelola periode akademik semester',
      icon: <CalendarIcon />,
      action: () => handleCardClick('manage-period')
    },
    {
      id: 'manage-grade',
      title: 'Manajemen Konversi Nilai',
      description: 'Atur konversi nilai angka ke huruf',
      icon: <GradeIcon />,
      action: () => handleCardClick('manage-grade')
    },
    {
      id: 'create-broadcast',
      title: 'Buat Pengumuman Baru',
      description: 'Buat pengumuman untuk seluruh pengguna',
      icon: <Megaphone />,
      action: () => handleCardClick('create-broadcast')
    },
    {
      id: 'manage-persuratan',
      title: 'Manajemen Persuratan',
      description: 'Kelola surat masuk dan keluar universitas',
      icon: <Mail className="w-8 h-8" />,
      action: () => handleCardClick('manage-persuratan')
    },
    {
      id: 'manage-thesis',
      title: 'Manajemen Bimbingan TA',
      description: 'Pantau pengajuan, pembimbing, topik, dan konsultasi tugas akhir',
      icon: <GraduationCap className="w-8 h-8" />,
      action: () => handleCardClick('manage-thesis')
    },
    {
      id: 'manage-library',
      title: 'Manajemen Perpustakaan',
      description: 'Kelola katalog buku, peminjaman, dan usulan koleksi perpustakaan',
      icon: <SquareLibrary className="w-8 h-8" />,
      action: () => handleCardClick('manage-library')
    },
    {
      id: 'manage-UKT',
      title: 'Manajemen UKT',
      description: 'Kelola pembayaran UKT mahasiswa',
      icon: <CreditCard className="w-8 h-8" />,
      action: () => handleCardClick('manage-UKT')
    },
    {
      id: 'manage-krs-time',
      title: 'Kelola Waktu KRS',
      description: 'Atur jadwal pembukaan dan penutupan pengisian KRS untuk setiap semester',
      icon: <Clock className="w-8 h-8" />,
      action: () => handleCardClick('manage-krs-time')
    },
    {
      id: 'manage-krs-quota',
      title: 'Kelola Kuota KRS',
      description: 'Tetapkan batas maksimal SKS yang dapat diambil setiap mahasiswa per periode',
      icon: <Gauge className="w-8 h-8" />,
      action: () => handleCardClick('manage-krs-quota')
    },
    {
      id: 'approval-krs',
      title: 'Approval KRS',
      description: 'Tinjau dan setujui pengajuan KRS mahasiswa setiap semester',
      icon: <ClipboardCheck className="w-8 h-8" />,
      action: () => handleCardClick('approval-krs')
    },
  ];

  // Data statistik menggunakan data dari hook
  const statisticsData = [
    {
      id: 'total-courses',
      title: 'Total Mata Kuliah',
      value: loading ? '...' : statistics.total_subjects.toLocaleString('id-ID'),
      subtitle: 'Mata kuliah aktif',
      icon: <BookIcon />,
    },
    {
      id: 'total-students',
      title: 'Total Mahasiswa',
      value: loading ? '...' : statistics.total_students.toLocaleString('id-ID'),
      subtitle: 'Mahasiswa aktif',
      icon: <StudentIcon />,
    },
    {
      id: 'total-teachers',
      title: 'Total Dosen',
      value: loading ? '...' : statistics.total_lecturers.toLocaleString('id-ID'),
      subtitle: 'Dosen aktif',
      icon: <TeacherIcon />,
    },
    {
      id: 'total-classes',
      title: 'Total Kelas',
      value: loading ? '...' : statistics.total_classes.toLocaleString('id-ID'),
      subtitle: 'Kelas aktif semester ini',
      icon: <ClassIcon />,
    }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Admin Navbar */}
      <AdminNavbar title="Dashboard Admin" showBack={false} />

      {/* Main Content */}
      <main className="flex-1 bg-brand-light-sage">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1
                className="text-3xl font-bold mb-2"
                style={{
                  color: '#015023',
                  fontFamily: 'Urbanist, sans-serif'
                }}
              >
                Dashboard Admin
              </h1>
              <p
                className="text-gray-600"
                style={{ fontFamily: 'Urbanist, sans-serif' }}
              >
                Kelola semua aspek sistem akademik universitas
              </p>
            </div>

            {/* Statistics Cards */}
            <div className="mb-8">
              <h2
                className="text-xl font-semibold mb-4"
                style={{
                  color: '#015023',
                  fontFamily: 'Urbanist, sans-serif'
                }}
              >
                Statistik Sistem
              </h2>

              {/* Error Message */}
              {error && (
                <ErrorMessageBoxWithButton message={error} action={fetchStatistics} />
              )}

              {/* Statistics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statisticsData.map((stat) => (
                  <StatCard
                    key={stat.id}
                    title={stat.title}
                    value={stat.value}
                    subtitle={stat.subtitle}
                    icon={stat.icon}
                  />
                ))}
              </div>
            </div>

            {/* Management Cards */}
            <div>
              <h2
                className="text-xl font-semibold mb-4"
                style={{
                  color: '#015023',
                  fontFamily: 'Urbanist, sans-serif'
                }}
              >
                Manajemen Sistem
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {managementCards.map((card) => (
                  <DashboardCard
                    key={card.id}
                    title={card.title}
                    description={card.description}
                    icon={card.icon}
                  >
                    <PrimaryButton className="w-full mt-4" onClick={card.action}>
                      {card.id === 'create-broadcast' ? (
                        <>
                          <PlusIcon />
                          Buat Pengumuman
                        </>
                      ) : (
                        <>
                          <SettingsIcon />
                          Kelola
                        </>
                      )}
                    </PrimaryButton>
                  </DashboardCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}