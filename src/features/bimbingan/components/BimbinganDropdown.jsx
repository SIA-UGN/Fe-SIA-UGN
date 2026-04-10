'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  ChevronDown,
  CirclePlus,
  ClipboardCheck,
  ClipboardList,
  Monitor,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import api from '@/lib/axios';

function isMenuActive(pathname, href) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

const STUDENT_MENU_ITEMS = [
  {
    href: '/bimbingan/pengajuan-ta',
    label: 'Pengajuan TA',
    icon: CirclePlus,
  },
  {
    href: '/bimbingan/galeri-judul',
    label: 'Galeri Judul TA',
    icon: ClipboardList,
  },
  {
    href: '/bimbingan/monitoring',
    label: 'Monitoring',
    icon: Monitor,
  },
];

const LECTURER_MENU_ITEMS = [
  {
    href: '/bimbingan-ta/dosen/topik',
    label: 'Kelola Judul TA',
    icon: BookOpen,
  },
  {
    href: '/bimbingan-ta/dosen/permintaan',
    label: 'Validasi Pengajuan',
    icon: ClipboardCheck,
    badgeKey: 'pending',
  },
  {
    href: '/bimbingan-ta/dosen/bimbingan',
    label: 'Monitoring Bimbingan',
    icon: Monitor,
  },
];

export default function BimbinganDropdown({ role = 'mahasiswa' }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const isLecturer = role === 'dosen';

  const menuItems = useMemo(
    () => (isLecturer ? LECTURER_MENU_ITEMS : STUDENT_MENU_ITEMS),
    [isLecturer],
  );

  useEffect(() => {
    if (!isLecturer) return undefined;

    let isMounted = true;

    const fetchPendingCount = async () => {
      try {
        const response = await api.get('/lecturer/thesis/requests', {
          params: { status: 'pending' },
        });
        const list = response?.data?.data;
        const nextCount = Array.isArray(list)
          ? list.length
          : Number(response?.data?.total || 0);

        if (isMounted) {
          setPendingCount(Number.isFinite(nextCount) ? nextCount : 0);
        }
      } catch (_err) {
        if (isMounted) setPendingCount(0);
      }
    };

    fetchPendingCount();
    const timer = setInterval(fetchPendingCount, 120000);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [isLecturer]);

  const isActiveMenu = isLecturer
    ? pathname.startsWith('/bimbingan-ta/dosen')
    : pathname.startsWith('/bimbingan');

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="group relative flex items-center gap-1.5 pb-1 text-sm font-medium transition-colors duration-200 lg:text-base"
          style={{
            color: isActiveMenu ? '#dabc4e' : '#e6eee9',
            fontFamily: 'Urbanist, sans-serif',
          }}
        >
          <span className="transition-colors duration-200 group-hover:text-[#dabc4e]">Bimbingan</span>
          <ChevronDown
            size={18}
            className={`transition-all duration-200 group-hover:text-[#dabc4e] ${open ? 'rotate-180' : ''}`}
          />
          <span
            className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-opacity duration-200 ${
              open || isActiveMenu ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
            style={{ backgroundColor: '#dabc4e' }}
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={12}
        className="w-[300px] border-none p-3"
        style={{
          backgroundColor: '#015023',
          borderRadius: '18px',
          boxShadow: '0px 16px 28px rgba(0,0,0,0.22)',
          fontFamily: 'Urbanist, sans-serif',
        }}
      >
        <div className="space-y-1">
          {menuItems.map((item) => {
            const active = isMenuActive(pathname, item.href);
            const Icon = item.icon;
            const showPendingBadge = item.badgeKey === 'pending' && pendingCount > 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between gap-3 rounded-[12px] px-4 py-3 text-[17px] font-medium transition-all duration-150"
                style={{
                  color: active ? '#dabc4e' : '#e6eee9',
                  backgroundColor: active ? 'rgba(218,188,78,0.08)' : 'transparent',
                }}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
                  {item.label}
                </span>

                {showPendingBadge ? (
                  <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[#ef4444] px-[6px] py-[2px] text-[11px] font-bold text-white">
                    {pendingCount > 99 ? '99+' : pendingCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
