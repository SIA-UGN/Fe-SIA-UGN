'use client';

import Link from 'next/link';
import { ChevronRight, BookOpen, Users, User, FileText } from 'lucide-react';

interface ActionLink {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  href: string;
  bgColor: string;
}

export const BimbinganActionLinks = () => {
  const actions: ActionLink[] = [
    {
      id: 'kelola-judul',
      title: 'Kelola Judul TA',
      subtitle: 'Tambah, edit, atau hapus judul',
      icon: <FileText className="w-6 h-6 text-green-600" />,
      href: '/admin/kelola-judul',
      bgColor: 'bg-green-100',
    },
    {
      id: 'kelola-dosen',
      title: 'Kelola Dosen Pembimbing',
      subtitle: 'Kelola pembimbing dan penguji',
      icon: <User className="w-6 h-6 text-blue-600" />,
      href: '/admin/kelola-dosen',
      bgColor: 'bg-blue-100',
    },
    {
      id: 'kelola-mahasiswa',
      title: 'Kelola Mahasiswa',
      subtitle: 'Lihat data mahasiswa bimbingan',
      icon: <Users className="w-6 h-6 text-purple-600" />,
      href: '/admin/kelola-mahasiswa',
      bgColor: 'bg-purple-100',
    },
    {
      id: 'validasi-ta',
      title: 'Validasi Pengajuan TA',
      subtitle: 'Review dan validasi pengajuan',
      icon: <BookOpen className="w-6 h-6 text-yellow-600" />,
      href: '/admin/validasi-ta',
      bgColor: 'bg-yellow-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      {actions.map((action) => (
        <Link key={action.id} href={action.href}>
          <div
            className="flex items-center p-4 bg-white rounded-xl shadow-sm cursor-pointer hover:bg-gray-50 transition-colors border border-gray-100"
            style={{ fontFamily: 'Urbanist, sans-serif' }}
          >
            {/* Left - Icon */}
            <div className={`${action.bgColor} rounded-lg p-3 flex items-center justify-center flex-shrink-0`}>
              {action.icon}
            </div>

            {/* Middle - Title and Subtitle */}
            <div className="flex-1 mx-4">
              <h3 className="font-bold text-gray-900 text-sm">{action.title}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{action.subtitle}</p>
            </div>

            {/* Right - Chevron */}
            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" strokeWidth={2} />
          </div>
        </Link>
      ))}
    </div>
  );
};
