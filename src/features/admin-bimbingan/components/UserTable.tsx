'use client';

import { Mahasiswa } from '@/features/admin-bimbingan/hooks/useKelolaUser';

interface UserTableProps {
  mahasiswa: Mahasiswa[];
  onRowClick: (user: Mahasiswa) => void;
  isLoading?: boolean;
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const UserTable = ({ mahasiswa, onRowClick, isLoading = false }: UserTableProps) => {
  const itemsPerPage = 6;
  const totalPages = Math.ceil(mahasiswa.length / itemsPerPage);
  const currentPage = 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedMahasiswa = mahasiswa.slice(startIndex, startIndex + itemsPerPage);
  const totalCount = mahasiswa.length;
  const displayStart = startIndex + 1;
  const displayEnd = Math.min(startIndex + itemsPerPage, totalCount);

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 overflow-hidden transition-opacity duration-200"
      style={{ fontFamily: 'Urbanist, sans-serif' }}
      role="table"
      aria-label="Tabel daftar mahasiswa"
    >
      {/* Table Header */}
      <div className="bg-[#D4B54D] text-[#015023]" role="rowgroup">
        <div className="grid grid-cols-12 gap-4 px-6 py-4 font-bold" role="row">
          <div className="col-span-1" role="columnheader">
            No
          </div>
          <div className="col-span-3" role="columnheader">
            NIM / Nama
          </div>
          <div className="col-span-2" role="columnheader">
            Program Studi
          </div>
          <div className="col-span-1" role="columnheader">
            Smt
          </div>
          <div className="col-span-1" role="columnheader">
            IPK
          </div>
          <div className="col-span-2" role="columnheader">
            Status
          </div>
          <div className="col-span-2" role="columnheader">
            Dosen Pembimbing
          </div>
        </div>
      </div>

      {/* Table Body or Skeleton */}
      {isLoading ? (
        <div className="divide-y divide-gray-100" role="rowgroup">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="hover:bg-gray-50 transition-colors" role="row">
              <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center text-sm">
                <div className="col-span-1 bg-gray-200 h-4 rounded animate-pulse" />
                <div className="col-span-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 animate-pulse" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="bg-gray-200 h-4 rounded animate-pulse" />
                    <div className="bg-gray-200 h-3 rounded animate-pulse w-2/3" />
                  </div>
                </div>
                <div className="col-span-2 bg-gray-200 h-4 rounded animate-pulse" />
                <div className="col-span-1 bg-gray-200 h-4 rounded animate-pulse" />
                <div className="col-span-1 bg-gray-200 h-4 rounded animate-pulse" />
                <div className="col-span-2 bg-gray-200 h-4 rounded animate-pulse" />
                <div className="col-span-2 bg-gray-200 h-4 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="divide-y divide-gray-100" role="rowgroup">
          {displayedMahasiswa.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">Tidak ada data mahasiswa</div>
          ) : (
            displayedMahasiswa.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => onRowClick(item)}
                className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors items-center"
                role="row"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onRowClick(item);
                  }
                }}
                aria-label={`Mahasiswa ${item.nama}`}
              >
              {/* No */}
              <div className="col-span-1 text-sm text-gray-600">{startIndex + idx + 1}</div>

              {/* NIM / Nama */}
              <div className="col-span-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#015023] text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  {getInitials(item.nama)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 text-sm">{item.nama}</p>
                  <p className="text-xs text-gray-500">{item.nim}</p>
                </div>
              </div>

              {/* Program Studi */}
              <div className="col-span-2 text-sm text-gray-700">{item.programStudi}</div>

              {/* Semester */}
              <div className="col-span-1 text-sm font-semibold text-gray-900">{item.semester}</div>

              {/* IPK */}
              <div className="col-span-1 text-sm font-bold text-green-600">{item.ipk.toFixed(2)}</div>

              {/* Status */}
              <div className="col-span-2">
                <div className="inline-flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-600" />
                  <span className="text-xs font-semibold text-green-600">{item.status}</span>
                </div>
              </div>

              {/* Dosen Pembimbing */}
              <div className="col-span-2 text-sm">
                {item.dosenNama ? (
                  <span className="font-bold text-[#015023]">{item.dosenNama}</span>
                ) : (
                  <span className="text-gray-400">Belum ditentukan</span>
                )}
              </div>
            </div>
          ))
          )}
        </div>
      )}

      {/* Footer */}
      <div
        className="px-6 py-4 border-t border-gray-100 text-xs text-gray-600 flex items-center justify-between bg-gray-50"
        role="status"
        aria-live="polite"
      >
        <span>
          Menampilkan {isLoading ? '-' : displayStart}-{isLoading ? '-' : displayEnd} dari {isLoading ? '-' : totalCount}{' '}
          data
        </span>
        <div className="flex gap-2">
          <button
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            disabled
            aria-label="Halaman sebelumnya"
          >
            ← Sebelumnya
          </button>
          <span className="px-3 py-1.5 text-gray-700 font-semibold" aria-current="page">
            {isLoading ? '-' : currentPage}
          </span>
          <button
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            disabled
            aria-label="Halaman berikutnya"
          >
            Berikutnya →
          </button>
        </div>
      </div>
    </div>
  );
};
