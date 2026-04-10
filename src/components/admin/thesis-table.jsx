import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import StatusBadge from '@/components/admin/status-badge';
import {
  formatDate,
  formatThesisId,
  getAvatarColor,
  getInitials,
  getStudentNim,
} from '@/features/admin-bimbingan/utils';

function buildPageNumbers(currentPage, lastPage) {
  if (lastPage <= 1) return [1];

  if (lastPage <= 5) {
    return Array.from({ length: lastPage }, (_, index) => index + 1);
  }

  if (currentPage <= 3) return [1, 2, 3, 4, lastPage];
  if (currentPage >= lastPage - 2) return [1, lastPage - 3, lastPage - 2, lastPage - 1, lastPage];

  return [1, currentPage - 1, currentPage, currentPage + 1, lastPage];
}

function ProposalIdBadge({ id, createdAt }) {
  return (
    <span className="inline-flex rounded-full bg-[#e6eee9] px-3 py-1 text-[11px] font-semibold text-[#015023]">
      {formatThesisId(id, createdAt)}
    </span>
  );
}

export default function ThesisTable({
  data = [],
  loading = false,
  currentPage = 1,
  perPage = 6,
  total = 0,
  lastPage = 1,
  onPageChange,
  onDetail,
}) {
  const firstItem = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const lastItem = Math.min(currentPage * perPage, total);
  const pages = buildPageNumbers(currentPage, lastPage || 1);

  return (
    <div className="overflow-hidden rounded-[14px] bg-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]">
      <div className="overflow-x-auto">
        <table className="min-w-[1100px] w-full">
          <thead className="bg-[#dabc4e]">
            <tr className="text-left text-[12px] font-semibold text-[#015023]">
              <th className="px-4 py-3">No</th>
              <th className="px-4 py-3">ID Pengajuan</th>
              <th className="px-4 py-3">Mahasiswa</th>
              <th className="px-4 py-3">Judul TA</th>
              <th className="px-4 py-3">Tgl. Pengajuan</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Pembimbing</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={`skeleton-${index}`} className="border-b border-[#f3f4f6]">
                  <td colSpan={8} className="px-4 py-3">
                    <div className="h-[58px] animate-pulse rounded-lg bg-gray-100" />
                  </td>
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-[#6b7280]">
                  Data pengajuan belum tersedia.
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const hasSupervisor = (item?.supervisors || []).length > 0;
                const supervisorName = item?.supervisors?.[0]?.lecturer?.name || 'Belum Ada';

                return (
                  <tr key={item.id_student_thesis} className="border-b border-[#f3f4f6] text-[12px] text-[#1f2937]">
                    <td className="px-4 py-4 align-top">{(currentPage - 1) * perPage + index + 1}</td>
                    <td className="px-4 py-4 align-top">
                      <ProposalIdBadge id={item.id_student_thesis} createdAt={item.created_at} />
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex items-start gap-2.5">
                        <span
                          className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                          style={{ backgroundColor: getAvatarColor(item?.student?.name) }}
                        >
                          {getInitials(item?.student?.name, 'MH')}
                        </span>
                        <div>
                          <p className="font-semibold text-[#111827]">{item?.student?.name || 'Mahasiswa'}</p>
                          <p className="text-[11px] text-[#9ca3af]">{getStudentNim(item)}</p>
                          <p className="text-[11px] text-[#9ca3af]">{item?.program?.name || 'Program belum diisi'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <p
                        className="max-w-[260px] text-[12px] text-[#374151]"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {item?.title_ind || 'Judul belum tersedia'}
                      </p>
                    </td>
                    <td className="px-4 py-4 align-top text-[#6b7280]">
                      <p className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDate(item?.created_at)}
                      </p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <StatusBadge status={item?.status} />
                    </td>
                    <td className="px-4 py-4 align-top">
                      {hasSupervisor ? (
                        <div>
                          <p className="text-[#065f46]">Sudah Ada</p>
                          <p className="text-[11px] text-[#6b7280]">{supervisorName}</p>
                        </div>
                      ) : (
                        <span className="text-[#9ca3af]">Belum Ada</span>
                      )}
                    </td>
                    <td className="px-4 py-4 align-top text-right">
                      <button
                        type="button"
                        onClick={() => onDetail?.(item)}
                        className="inline-flex items-center gap-1 rounded-[8px] bg-[#015023] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:opacity-90"
                      >
                        Detail
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#f3f4f6] px-4 py-3 text-[11px] text-[#9ca3af]">
        <p>
          Menampilkan {firstItem}-{lastItem} dari {total} data
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange?.(Math.max(currentPage - 1, 1))}
            disabled={currentPage <= 1}
            className="inline-flex items-center gap-1 text-[#6b7280] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Previous
          </button>

          <div className="flex items-center gap-1">
            {pages.map((page, index) => {
              const isEllipsis = index > 0 && page - pages[index - 1] > 1;

              return (
                <div key={`page-item-${page}`} className="flex items-center gap-1">
                  {isEllipsis ? <span className="px-1 text-[#9ca3af]">...</span> : null}
                  <button
                    type="button"
                    onClick={() => onPageChange?.(page)}
                    className={`h-6 min-w-6 rounded-md px-1.5 text-[11px] font-medium ${
                      page === currentPage
                        ? 'bg-[#015023] text-white'
                        : 'bg-transparent text-[#6b7280] hover:bg-[#f3f4f6]'
                    }`}
                  >
                    {page}
                  </button>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => onPageChange?.(Math.min(currentPage + 1, lastPage || 1))}
            disabled={currentPage >= (lastPage || 1)}
            className="inline-flex items-center gap-1 text-[#6b7280] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
