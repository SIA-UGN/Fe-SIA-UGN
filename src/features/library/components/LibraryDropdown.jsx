'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, ChevronDown, ClipboardList, ScrollText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function LibraryDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="group relative flex items-center gap-1.5 pb-1 text-sm font-medium text-white transition-colors duration-200 lg:text-base"
          style={{ fontFamily: 'Urbanist, sans-serif' }}
        >
          <span className="group-hover:text-[#DABC4E] transition-colors duration-200">
            Perpustakaan
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
          <Link href="/library/books" className="flex w-full cursor-pointer items-center gap-3 px-2 py-2.5">
            <BookOpen size={18} strokeWidth={1.8} style={{ color: '#015023' }} />
            <span className="text-base font-medium" style={{ color: '#015023' }}>
              Katalog Buku
            </span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/library/activities"
            className="flex w-full cursor-pointer items-center gap-3 px-2 py-2.5"
          >
            <ScrollText size={18} strokeWidth={1.8} style={{ color: '#015023' }} />
            <span className="text-base font-medium" style={{ color: '#015023' }}>
              Aktivitas Saya
            </span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/library/suggestions"
            className="flex w-full cursor-pointer items-center gap-3 px-2 py-2.5"
          >
            <ClipboardList size={18} strokeWidth={1.8} style={{ color: '#015023' }} />
            <span className="text-base font-medium" style={{ color: '#015023' }}>
              Usulan Buku
            </span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
