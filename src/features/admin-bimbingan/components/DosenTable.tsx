'use client';

import { Dosen } from '@/features/admin-bimbingan/hooks/useKelolaUser';

interface DosenTableProps {
  dosen: Dosen[];
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const DosenTable = ({ dosen }: DosenTableProps) => {
  const itemsPerPage = 6;
  const totalPages = Math.ceil(dosen.length / itemsPerPage);
  const currentPage = 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedDosen = dosen.slice(startIndex, startIndex + itemsPerPage);
  const totalCount = dosen.length;
  const displayStart = startIndex + 1;
  const displayEnd = Math.min(startIndex + itemsPerPage, totalCount);

  const getQuotaColor = (terisi: number, maks: number): string => {
    const ratio = terisi / maks;
    return ratio >= 0.8 ? 'bg-orange-500' : 'bg-[#16A34A]';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ fontFamily: 'Urbanist, sans-serif' }}>
      {/* Table Header */}
      <div className="bg-[#D4B54D] text-[#015023]">
        <div className="grid grid-cols-12 gap-4 px-6 py-4 font-bold">
          <div className="col-span-1">No</div>
          <div className="col-span-3">NIP / Nama</div>
          <div className="col-span-2">Bidang Keahlian</div>
          <div className="col-span-2">Jabatan</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Kuota Bimbingan</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-100">
        {displayedDosen.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">Tidak ada data dosen</div>
        ) : (
          displayedDosen.map((item, idx) => {
            const ratio = item.kuotaTerisi / item.kuotaMaks;
            const percentageWidth = Math.round((ratio * 100));
            const quotaColor = getQuotaColor(item.kuotaTerisi, item.kuotaMaks);

            return (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors items-start"
              >
                {/* No */}
                <div className="col-span-1 text-sm text-gray-600 pt-2">{startIndex + idx + 1}</div>

                {/* NIP / Nama */}
                <div className="col-span-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#D4B54D] text-[#015023] flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    {getInitials(item.nama)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-sm">{item.nama}</p>
                    <p className="text-xs text-gray-500">{item.nip}</p>
                  </div>
                </div>

                {/* Bidang Keahlian */}
                <div className="col-span-2 text-sm text-gray-700 pt-2">{item.bidangKeahlian}</div>

                {/* Jabatan */}
                <div className="col-span-2 text-sm text-gray-700 pt-2">{item.jabatan}</div>

                {/* Status */}
                <div className="col-span-2 pt-2">
                  <div className="inline-flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${item.status === 'Aktif' ? 'bg-green-600' : 'bg-gray-400'}`} />
                    <span className={`text-xs font-semibold ${item.status === 'Aktif' ? 'text-green-600' : 'text-gray-600'}`}>
                      {item.status === 'Aktif' ? '✓ Aktif' : 'Tidak Aktif'}
                    </span>
                  </div>
                </div>

                {/* Kuota Bimbingan */}
                <div className="col-span-2">
                  {/* Kuota Text */}
                  <p className="text-sm font-bold text-gray-900 mb-1">
                    {item.kuotaTerisi}/{item.kuotaMaks}
                  </p>
                  {/* Progress Bar */}
                  <div className="bg-gray-200 h-2 w-24 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${quotaColor} transition-all`}
                      style={{ width: `${percentageWidth}%` }}
                      role="progressbar"
                      aria-valuenow={item.kuotaTerisi}
                      aria-valuemin={0}
                      aria-valuemax={item.kuotaMaks}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 text-xs text-gray-600 flex items-center justify-between">
        <span>
          Menampilkan {displayStart}-{displayEnd} dari {totalCount} data
        </span>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50" disabled>
            ← Sebelumnya
          </button>
          <span className="px-3 py-1.5 text-gray-700 font-semibold">{currentPage}</span>
          <button className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50" disabled>
            Berikutnya →
          </button>
        </div>
      </div>
    </div>
  );
};
