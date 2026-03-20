'use client';

import React from 'react';
import { PlusCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KelolaToolbarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onOpenCreate: () => void;
}

export default function KelolaToolbar({
  searchQuery,
  setSearchQuery,
  onOpenCreate,
}: KelolaToolbarProps) {
  const font: React.CSSProperties = { fontFamily: 'Urbanist, sans-serif' };

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
      style={font}
    >
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari judul atau nama dosen..."
          className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#16874B] focus:ring-2 focus:ring-[#16874B]/10"
        />
      </div>

      <Button
        variant="primary"
        size="default"
        style={{}}
        className="flex items-center gap-2 px-4 h-10"
        onClick={onOpenCreate}
      >
        <PlusCircle size={16} />
        Tambah Judul Baru
      </Button>
    </div>
  );
}
