'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, ChevronDown, ClipboardCheck, Monitor } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function BimbinganDropdownDosen() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="group relative flex items-center gap-1.5 pb-1 text-sm font-medium text-white transition-colors duration-200 lg:text-base outline-none"
          style={{ fontFamily: 'Urbanist, sans-serif' }}
        >
          <span className="group-hover:text-[#DABC4E] transition-colors duration-200">
            Bimbingan
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
        <DropdownMenuItem asChild >
          <Link href="/bimbingan-ta/dosen/topik" className="flex w-full items-center gap-3 px-2 py-2.5">
            <BookOpen size={20} strokeWidth={1.8} style={{ color: '#015023' }} />
            <span className="text-base font-medium" style={{ color: '#015023' }}>
              Kelola Judul TA
            </span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/bimbingan-ta/dosen/permintaan" className="flex w-full items-center gap-3 px-2 py-2.5">
            <ClipboardCheck size={20} strokeWidth={1.8} style={{ color: '#015023' }} />
            <span className="text-base font-medium" style={{ color: '#015023' }}>
              Validasi Pengajuan
            </span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild >
          <Link href="/bimbingan-ta/dosen/bimbingan" className="flex w-full items-center gap-3 px-2 py-2.5">
            <Monitor size={20} strokeWidth={1.8} style={{ color: '#015023' }} />
            <span className="text-base font-medium" style={{ color: '#015023' }}>
              Monitoring Bimbingan
            </span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}