'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, Filter, Search } from 'lucide-react';
import api from '@/lib/axios';
import { getPrograms } from '@/lib/adminApi';
import AdminBimbinganShell from '@/components/admin/admin-bimbingan-shell';
import ThesisTable from '@/components/admin/thesis-table';
import {
  extractErrorMessage,
  extractPrograms,
  isSameOrAfterDate,
  parseApiPayload,
  parsePaginatedPayload,
  toNumber,
} from '@/features/admin-bimbingan/utils';

const emptyPaginated = {
  current_page: 1,
  data: [],
  per_page: 15,
  total: 0,
  last_page: 1,
};

const quickChipConfig = [
  { key: 'all', label: 'Semua', status: '' },
  { key: 'proposing', label: 'Menunggu', status: 'proposing' },
  { key: 'approved', label: 'Approved', status: 'on_progress' },
  { key: 'ditolak', label: 'Ditolak', status: 'ditolak' },
];

export default function SemuaPengajuanPage() {
  const router = useRouter();

  const [programs, setPrograms] = useState([]);
  const [students, setStudents] = useState(emptyPaginated);
  const [dashboardStats, setDashboardStats] = useState({
    proposing: 0,
    approved: 0,
    ditolak: 0,
    total: 0,
  });

  const [filterStatus, setFilterStatus] = useState('');
  const [filterProgram, setFilterProgram] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);
  const [localPage, setLocalPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const useLocalDateFilter = Boolean(fromDate);

  useEffect(() => {
    let isMounted = true;

    async function fetchPrograms() {
      const response = await Promise.allSettled([getPrograms()]);
      if (!isMounted) return;

      const [programRes] = response;
      if (programRes.status === 'fulfilled') {
        setPrograms(extractPrograms(programRes.value));
      }
    }

    fetchPrograms();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      setLoading(true);
      setErrorMessage('');

      const requestPage = useLocalDateFilter ? 1 : page;
      const requestPerPage = useLocalDateFilter ? 200 : 15;

      const [dashboardRes, studentsRes] = await Promise.allSettled([
        api.get('/admin/thesis/dashboard'),
        api.get('/admin/thesis/students', {
          params: {
            status: filterStatus || undefined,
            id_program: filterProgram || undefined,
            search: search || undefined,
            page: requestPage,
            per_page: requestPerPage,
          },
        }),
      ]);

      if (!isMounted) return;

      if (dashboardRes.status === 'fulfilled') {
        const payload = parseApiPayload(dashboardRes.value) || {};
        const thesisByStatus = payload.thesis_by_status || {};

        setDashboardStats({
          proposing: toNumber(thesisByStatus.proposing),
          approved: toNumber(thesisByStatus.on_progress) + toNumber(thesisByStatus.finished),
          ditolak: toNumber(thesisByStatus.ditolak ?? thesisByStatus.rejected),
          total: toNumber(payload.total_thesis),
        });
      }

      if (studentsRes.status === 'fulfilled') {
        setStudents(parsePaginatedPayload(studentsRes.value));
      } else {
        setStudents(emptyPaginated);
      }

      if (studentsRes.status === 'rejected') {
        setErrorMessage(
          extractErrorMessage(studentsRes.reason, 'Daftar pengajuan tidak dapat dimuat saat ini.')
        );
      }

      setLoading(false);
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [filterProgram, filterStatus, page, search, useLocalDateFilter]);

  useEffect(() => {
    setLocalPage(1);
  }, [fromDate, filterStatus, filterProgram, search]);

  const filteredByDate = useMemo(() => {
    if (!useLocalDateFilter) return students.data;
    return students.data.filter((item) => isSameOrAfterDate(item?.created_at, fromDate));
  }, [fromDate, students.data, useLocalDateFilter]);

  const tableData = useMemo(() => {
    if (!useLocalDateFilter) return students.data;

    const startIndex = (localPage - 1) * 15;
    return filteredByDate.slice(startIndex, startIndex + 15);
  }, [filteredByDate, localPage, students.data, useLocalDateFilter]);

  const tablePagination = useMemo(() => {
    if (!useLocalDateFilter) {
      return {
        currentPage: students.current_page,
        lastPage: students.last_page,
        total: students.total,
        perPage: students.per_page,
      };
    }

    return {
      currentPage: localPage,
      lastPage: Math.max(1, Math.ceil(filteredByDate.length / 15)),
      total: filteredByDate.length,
      perPage: 15,
    };
  }, [filteredByDate.length, localPage, students, useLocalDateFilter]);

  function handlePageChange(nextPage) {
    if (useLocalDateFilter) {
      setLocalPage(nextPage);
      return;
    }
    setPage(nextPage);
  }

  return (
    <AdminBimbinganShell
      backHref="/admin/bimbingan"
      backLabel="Dashboard Bimbingan"
      title="Semua Pengajuan Tugas Akhir"
      description="Daftar lengkap seluruh pengajuan TA mahasiswa"
    >
      <section className="flex flex-wrap gap-2 rounded-[14px] bg-white p-3 shadow-sm">
        {quickChipConfig.map((chip) => {
          const isActive =
            chip.key === 'all'
              ? filterStatus === ''
              : chip.key === 'approved'
                ? filterStatus === 'on_progress'
                : chip.key === 'ditolak'
                  ? filterStatus === 'ditolak'
                  : filterStatus === chip.status;

          const value =
            chip.key === 'all'
              ? dashboardStats.total
              : chip.key === 'proposing'
                ? dashboardStats.proposing
                : chip.key === 'approved'
                  ? dashboardStats.approved
                  : dashboardStats.ditolak;

          return (
            <button
              key={chip.key}
              type="button"
              onClick={() => {
                setPage(1);
                setFilterStatus(chip.status);
              }}
              className={`rounded-full border px-3 py-1.5 text-[12px] font-medium ${
                isActive
                  ? 'border-[#015023] bg-[#015023] text-white'
                  : 'border-gray-200 bg-white text-[#6b7280]'
              }`}
            >
              {chip.label} ({value})
            </button>
          );
        })}
      </section>

      <section className="rounded-[14px] bg-white p-4 shadow-sm">
        <div className="mb-3 inline-flex items-center gap-2 text-[12px] font-semibold text-[#015023]">
          <Filter className="h-4 w-4" />
          Filter
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <select
            value={filterStatus}
            onChange={(event) => {
              setPage(1);
              setFilterStatus(event.target.value);
            }}
            className="rounded-[10px] border border-[#d1d5db] px-3 py-2 text-[12px] outline-none focus:border-[#015023]"
          >
            <option value="">Status</option>
            <option value="proposing">Menunggu Approval</option>
            <option value="on_progress">Approved</option>
            <option value="revision">Revisi</option>
            <option value="finished">Selesai</option>
          </select>

          <select
            value={filterProgram}
            onChange={(event) => {
              setPage(1);
              setFilterProgram(event.target.value);
            }}
            className="rounded-[10px] border border-[#d1d5db] px-3 py-2 text-[12px] outline-none focus:border-[#015023]"
          >
            <option value="">Program Studi</option>
            {programs.map((program) => (
              <option key={program.id_program} value={program.id_program}>
                {program.name}
              </option>
            ))}
          </select>

          <label className="inline-flex items-center gap-2 rounded-[10px] border border-[#d1d5db] px-3 py-2 text-[12px] text-[#6b7280]">
            <CalendarDays className="h-4 w-4" />
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="w-full bg-transparent text-[12px] text-[#374151] outline-none"
            />
          </label>
        </div>
      </section>

      <section className="rounded-[14px] border border-[#dabc4e]/30 bg-[#dabc4e]/10 p-3">
        <label className="flex items-center gap-2">
          <Search className="h-4 w-4 text-[#856404]" />
          <input
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            placeholder="Cari nama atau judul..."
            className="w-full bg-transparent text-[13px] text-[#374151] outline-none placeholder:text-[#9ca3af]"
          />
        </label>
      </section>

      <ThesisTable
        data={tableData}
        loading={loading}
        currentPage={tablePagination.currentPage}
        perPage={tablePagination.perPage}
        total={tablePagination.total}
        lastPage={tablePagination.lastPage}
        onPageChange={handlePageChange}
        onDetail={(item) => router.push(`/admin/bimbingan/monitoring-pengajuan/${item.id_student_thesis}`)}
      />

      {errorMessage ? (
        <section className="rounded-[14px] border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#991b1b]">
          {errorMessage}
        </section>
      ) : null}
    </AdminBimbinganShell>
  );
}
