'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, FileText, ScrollText, Monitor } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function BimbinganDropdownMahasiswa() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="group relative flex items-center gap-1.5 pb-1 text-sm font-medium text-white transition-colors duration-200 lg:text-base"
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
        <DropdownMenuItem asChild>
          <Link href="/bimbingan-ta/mahasiswa/pengajuan" 
          className="flex w-full items-center gap-3 px-2 py-2.5">
            <FileText size={20} strokeWidth={1.8} style={{ color: '#015023' }} />
            <span className="text-base font-medium" style={{ color: '#015023' }}>
              Ajukan Judul TA
            </span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/bimbingan/galeri-judul" 
          className="flex w-full items-center gap-3 px-2 py-2.5">
            <ScrollText size={20} strokeWidth={1.8} style={{ color: '#015023' }} />
            <span className="text-base font-medium" style={{ color: '#015023' }}>
              Galeri TA
            </span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild >
          <Link href="/bimbingan-ta/mahasiswa/monitoring" 
          className="flex w-full items-center gap-3 px-2 py-2.5">
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