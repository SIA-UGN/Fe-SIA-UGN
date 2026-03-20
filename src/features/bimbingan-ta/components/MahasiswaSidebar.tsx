'use client';

import React from 'react';
import { GraduationCap, Search } from 'lucide-react';
import type { MonitoringMahasiswa } from '@/features/bimbingan-ta/hooks/useMonitoringDosen';

interface MahasiswaSidebarProps {
  students: MonitoringMahasiswa[];
  searchQuery: string;
  selectedStudentId: number;
  onSearchChange: (value: string) => void;
  onSelectStudent: (id: number) => void;
}

export default function MahasiswaSidebar({
  students,
  searchQuery,
  selectedStudentId,
  onSearchChange,
  onSelectStudent,
}: MahasiswaSidebarProps) {
  const font: React.CSSProperties = { fontFamily: 'Urbanist, sans-serif' };

  return (
    <aside className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm" style={font}>
      <h2 className="text-lg font-bold text-[#015023]">Mahasiswa Bimbingan</h2>

      <div className="relative mt-3">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Cari nama/NIM..."
          className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#015023] focus:ring-2 focus:ring-[#015023]/10"
        />
      </div>

      <div className="mt-4 space-y-3">
        {students.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 px-3 py-8 text-center text-sm text-gray-500">
            Mahasiswa tidak ditemukan.
          </div>
        ) : (
          students.map((student) => {
            const isActive = student.id === selectedStudentId;

            return (
              <button
                key={student.id}
                type="button"
                onClick={() => onSelectStudent(student.id)}
                className={`w-full rounded-xl p-3 text-left transition-colors ${
                  isActive
                    ? 'border-2 border-[#015023] bg-[#F4F9F5]'
                    : 'border border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full ${
                      isActive ? 'bg-[#015023] text-white' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    <GraduationCap size={15} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#015023]">{student.nama}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{student.nim} - {student.semester}</p>

                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-gray-200">
                        <div
                          className="h-1.5 rounded-full bg-[#015023]"
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-gray-500">{student.progress}%</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
