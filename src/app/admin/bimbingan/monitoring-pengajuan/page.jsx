'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Filter,
  Search,
  UserCheck,
  UserMinus,
} from 'lucide-react';
import api from '@/lib/axios';
import { getPrograms } from '@/lib/adminApi';
import AdminBimbinganShell from '@/components/admin/admin-bimbingan-shell';
import StatBanner from '@/components/admin/stat-banner';
import SummaryCard from '@/components/admin/summary-card';
import ThesisTable from '@/components/admin/thesis-table';
import {
  extractErrorMessage,
  extractPrograms,
  isSameOrAfterDate,
  parseApiPayload,
  parsePaginatedPayload,
  toNumber,
} from '@/features/admin-bimbingan/utils';

const emptyDashboard = {
  thesis_by_status: {
    proposing: 0,
    on_progress: 0,
    revision: 0,
    finished: 0,
    ditolak: 0,
  },
  total_thesis: 0,
};

const emptyPaginated = {
  current_page: 1,
  data: [],
  per_page: 6,
  total: 0,
  last_page: 1,
};

export default function MonitoringPengajuanPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [students, setStudents] = useState(emptyPaginated);
  const [programs, setPrograms] = useState([]);
  const [lecturers, setLecturers] = useState([]);

  const [filterStatus, setFilterStatus] = useState('');
  const [filterProgram, setFilterProgram] = useState('');
  const [filterSupervisor, setFilterSupervisor] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);
  const [localPage, setLocalPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const useLocalPagination = Boolean(filterSupervisor || fromDate);

  useEffect(() => {
    let isMounted = true;

    async function fetchFilterReferences() {
      const [programRes, supervisorRes] = await Promise.allSettled([
        getPrograms(),
        api.get('/admin/thesis/supervisors'),
      ]);

      if (!isMounted) return;

      if (programRes.status === 'fulfilled') {
        setPrograms(extractPrograms(programRes.value));
      }

      if (supervisorRes.status === 'fulfilled') {
        const payload = parseApiPayload(supervisorRes.value);
        const source = Array.isArray(payload) ? payload : [];

        const map = new Map();
        source.forEach((item) => {
          const lecturer = item?.lecturer;
          if (lecturer?.id_user_si && !map.has(lecturer.id_user_si)) {
            map.set(lecturer.id_user_si, lecturer);
          }
        });

        setLecturers(Array.from(map.values()));
      }
    }

    fetchFilterReferences();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      setLoading(true);
      setErrorMessage('');

      const requestPage = useLocalPagination ? 1 : page;
      const requestPerPage = useLocalPagination ? 120 : 6;

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

        setDashboard({
          thesis_by_status: {
            proposing: toNumber(thesisByStatus.proposing),
            on_progress: toNumber(thesisByStatus.on_progress),
            revision: toNumber(thesisByStatus.revision),
            finished: toNumber(thesisByStatus.finished),
            ditolak: toNumber(thesisByStatus.ditolak ?? thesisByStatus.rejected),
          },
          total_thesis: toNumber(payload.total_thesis),
        });
      } else {
        setDashboard(emptyDashboard);
      }

      if (studentsRes.status === 'fulfilled') {
        setStudents(parsePaginatedPayload(studentsRes.value));
      } else {
        setStudents(emptyPaginated);
      }

      if (dashboardRes.status === 'rejected' && studentsRes.status === 'rejected') {
        setErrorMessage(
          extractErrorMessage(
            studentsRes.reason,
            'Gagal memuat monitoring pengajuan. Coba lagi beberapa saat.'
          )
        );
      }

      setLoading(false);
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [filterProgram, filterStatus, page, search, useLocalPagination]);

  useEffect(() => {
    setLocalPage(1);
  }, [filterProgram, filterStatus, filterSupervisor, fromDate, search]);

  const filteredByLocal = useMemo(() => {
    if (!useLocalPagination) return students.data;

    return students.data.filter((item) => {
      const passSupervisor = filterSupervisor
        ? (item?.supervisors || []).some(
            (supervisor) => String(supervisor?.lecturer?.id_user_si) === String(filterSupervisor)
          )
        : true;

      const passDate = isSameOrAfterDate(item?.created_at, fromDate);

      return passSupervisor && passDate;
    });
  }, [filterSupervisor, fromDate, students.data, useLocalPagination]);

  const tableData = useMemo(() => {
    if (!useLocalPagination) return students.data;

    const startIndex = (localPage - 1) * 6;
    return filteredByLocal.slice(startIndex, startIndex + 6);
  }, [filteredByLocal, localPage, students.data, useLocalPagination]);

  const tablePagination = useMemo(() => {
    if (!useLocalPagination) {
      return {
        currentPage: students.current_page,
        lastPage: students.last_page,
        total: students.total,
        perPage: students.per_page,
      };
    }

    return {
      currentPage: localPage,
      lastPage: Math.max(1, Math.ceil(filteredByLocal.length / 6)),
      total: filteredByLocal.length,
      perPage: 6,
    };
  }, [filteredByLocal.length, localPage, students, useLocalPagination]);

  const approvedCount = dashboard.thesis_by_status.on_progress + dashboard.thesis_by_status.finished;
  const assignedSupervisorCount = (students.data || []).filter(
    (item) => (item?.supervisors || []).length > 0
  ).length;
  const unassignedSupervisorCount = (students.data || []).filter(
    (item) => (item?.supervisors || []).length === 0
  ).length;

  function handlePageChange(nextPage) {
    if (useLocalPagination) {
      setLocalPage(nextPage);
      return;
    }
    setPage(nextPage);
  }

  return (
    <AdminBimbinganShell
      backHref="/admin/bimbingan"
      backLabel="Dashboard Bimbingan"
      title="Monitoring Pengajuan TA"
      description="Pantau status pengajuan judul tugas akhir seluruh mahasiswa"
    >
      {loading ? <div className="h-[120px] animate-pulse rounded-[16px] bg-gray-100" /> : null}

      {!loading ? (
        <>
          <StatBanner
            total={dashboard.total_thesis}
            totalLabel="Total Pengajuan TA"
            totalSubLabel="Pengajuan terdaftar"
            breakdown={[
              { label: 'Menunggu', value: dashboard.thesis_by_status.proposing, color: '#f59e0b' },
              { label: 'Approved', value: approvedCount, color: '#10b981' },
              { label: 'Ditolak', value: dashboard.thesis_by_status.ditolak, color: '#ef4444' },
            ]}
            icon={<ClipboardList className="h-8 w-8" strokeWidth={2.25} />}
          />

          <section className="grid gap-3 sm:grid-cols-2">
            <SummaryCard
              icon={<Clock3 className="h-5 w-5 text-[#d97706]" />}
              iconBg="#fef3c7"
              label="Menunggu Approval"
              value={dashboard.thesis_by_status.proposing}
              sub="Menunggu approval"
              valueColor="#d97706"
            />
            <SummaryCard
              icon={<CheckCircle2 className="h-5 w-5 text-[#047857]" />}
              iconBg="#d1fae5"
              label="Approved"
              value={approvedCount}
              sub="Pengajuan aktif/selesai"
              valueColor="#047857"
            />
            <SummaryCard
              icon={<UserCheck className="h-5 w-5 text-[#1e40af]" />}
              iconBg="#dbeafe"
              label="Sudah Ada Dosen"
              value={assignedSupervisorCount}
              sub="Mahasiswa dengan pembimbing"
              valueColor="#1e40af"
            />
            <SummaryCard
              icon={<UserMinus className="h-5 w-5 text-[#6b7280]" />}
              iconBg="#f3f4f6"
              label="Belum Ada Dosen"
              value={unassignedSupervisorCount}
              sub="Perlu penetapan pembimbing"
              valueColor="#6b7280"
            />
          </section>

          <section className="rounded-[14px] bg-white p-4 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-[12px] font-semibold text-[#015023]">
              <Filter className="h-4 w-4" />
              Filter
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <select
                value={filterStatus}
                onChange={(event) => {
                  setPage(1);
                  setFilterStatus(event.target.value);
                }}
                className="rounded-[10px] border border-[#d1d5db] bg-white px-3 py-2 text-[12px] text-[#374151] outline-none focus:border-[#015023]"
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
                className="rounded-[10px] border border-[#d1d5db] bg-white px-3 py-2 text-[12px] text-[#374151] outline-none focus:border-[#015023]"
              >
                <option value="">Program Studi</option>
                {programs.map((program) => (
                  <option key={program.id_program} value={program.id_program}>
                    {program.name}
                  </option>
                ))}
              </select>

              <select
                value={filterSupervisor}
                onChange={(event) => setFilterSupervisor(event.target.value)}
                className="rounded-[10px] border border-[#d1d5db] bg-white px-3 py-2 text-[12px] text-[#374151] outline-none focus:border-[#015023]"
              >
                <option value="">Dosen Pembimbing</option>
                {lecturers.map((lecturer) => (
                  <option key={lecturer.id_user_si} value={lecturer.id_user_si}>
                    {lecturer.name}
                  </option>
                ))}
              </select>

              <label className="inline-flex items-center gap-2 rounded-[10px] border border-[#d1d5db] bg-white px-3 py-2 text-[12px] text-[#6b7280]">
                <CalendarDays className="h-4 w-4" />
                <input
                  type="date"
                  value={fromDate}
                  onChange={(event) => setFromDate(event.target.value)}
                  className="w-full bg-transparent text-[12px] text-[#374151] outline-none"
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  setFilterStatus('');
                  setFilterProgram('');
                  setFilterSupervisor('');
                  setFromDate('');
                  setSearch('');
                  setPage(1);
                  setLocalPage(1);
                }}
                className="rounded-[10px] border border-[#d1d5db] px-3 py-2 text-[12px] font-semibold text-[#374151] hover:bg-[#f9fafb]"
              >
                Reset Filter
              </button>
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
                placeholder="Cari Mahasiswa..."
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
        </>
      ) : null}
    </AdminBimbinganShell>
  );
}
