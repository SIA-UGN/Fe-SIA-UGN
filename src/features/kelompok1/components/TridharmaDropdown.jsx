'use client';

// [KELOMPOK 1] Dropdown navbar untuk modul dosen: Tridharma + Angka Kredit + Gaji.
// Pola disalin dari LibraryDropdown (org) agar konsisten styling & kompatibel.
import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, FlaskConical, BookMarked, Star, Banknote, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ITEMS = [
  { href: '/dosen/kegiatan-mengajar', label: 'Kegiatan Mengajar', icon: BookOpen },
  { href: '/dosen/penelitian', label: 'Penelitian', icon: FlaskConical },
  { href: '/dosen/publikasi', label: 'Publikasi Ilmiah', icon: BookMarked },
  { href: '/dosen/angka-kredit', label: 'Angka Kredit', icon: Star },
  { href: '/administrasi/payroll', label: 'Gaji', icon: Banknote },
];

export default function TridharmaDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="group relative flex items-center gap-1.5 pb-1 text-sm font-medium text-white transition-colors duration-200 lg:text-base"
          style={{ fontFamily: 'Urbanist, sans-serif' }}
        >
          <span className="group-hover:text-[#DABC4E] transition-colors duration-200">
            Tridharma
          </span>
          <ChevronDown
            size={18}
            className={`transition-transform duration-200 group-hover:text-[#DABC4E] ${isOpen ? 'rotate-180' : ''}`}
          />
          <span
            className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-opacity duration-200 ${
              isOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
            style={{ backgroundColor: '#DABC4E' }}
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={12}
        className="min-w-[240px] p-4"
        style={{
          backgroundColor: '#FEFDFB',
          borderColor: '#015023',
          borderWidth: '1px',
          borderRadius: '16px',
          fontFamily: 'Urbanist, sans-serif',
        }}
      >
        {ITEMS.map(({ href, label, icon: Icon }) => (
          <DropdownMenuItem asChild key={href}>
            <Link href={href} className="flex w-full cursor-pointer items-center gap-3 px-2 py-2.5">
              <Icon size={18} strokeWidth={1.8} style={{ color: '#015023' }} />
              <span className="text-base font-medium" style={{ color: '#015023' }}>
                {label}
              </span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
