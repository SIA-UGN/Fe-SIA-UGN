'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Filter,
  GraduationCap,
  Search,
  ShieldCheck,
  UserRound,
  UserRoundCheck,
  Users,
} from 'lucide-react';
import api from '@/lib/axios';
import { getPrograms } from '@/lib/adminApi';
import AdminBimbinganShell from '@/components/admin/admin-bimbingan-shell';
import {
  extractErrorMessage,
  extractPrograms,
  formatDate,
  getAvatarColor,
  getInitials,
  getIpkTone,
  getStudentIpk,
  getStudentNim,
  getStudentSemester,
  parseApiPayload,
  parsePaginatedPayload,
} from '@/features/admin-bimbingan/utils';

function MiniSummaryCard({ icon, title, value, subtitle, iconBg, valueColor }) {
  return (
    <article className="flex items-center gap-3 rounded-[12px] bg-white p-4 shadow-sm">
      <span
        className="flex h-11 w-11 items-center justify-center rounded-[10px]"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </span>
      <div>
        <p className="text-[11px] text-[#6a7282]">{title}</p>
        <p className="text-[24px] font-bold leading-none" style={{ color: valueColor }}>
          {value}
        </p>
        <p className="mt-1 text-[11px] text-[#9ca3af]">{subtitle}</p>
      </div>
    </article>
  );
}

function TablePagination({ currentPage, totalPages, onPageChange, totalLabel }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-[11px] text-[#9ca3af]">
      <p>{totalLabel}</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-[#015023] px-1.5 text-white">
          {currentPage}
        </span>
        <span>/</span>
        <span>{totalPages}</span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default function KelolaDataUserPage() {
  const [students, setStudents] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [activeTab, setActiveTab] = useState('mahasiswa');

  const [studentProgramFilter, setStudentProgramFilter] = useState('');
  const [studentStatusFilter, setStudentStatusFilter] = useState('');
  const [studentSupervisorFilter, setStudentSupervisorFilter] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [studentPage, setStudentPage] = useState(1);

  const [lecturerStatusFilter, setLecturerStatusFilter] = useState('');
  const [lecturerSearch, setLecturerSearch] = useState('');
  const [lecturerPage, setLecturerPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      setLoading(true);
      setErrorMessage('');

      const [studentsRes, supervisorsRes, programsRes] = await Promise.allSettled([
        api.get('/admin/thesis/students', { params: { per_page: 50 } }),
        api.get('/admin/thesis/supervisors'),
        getPrograms(),
      ]);

      if (!isMounted) return;

      if (studentsRes.status === 'fulfilled') {
        const paginated = parsePaginatedPayload(studentsRes.value);
        setStudents(paginated.data || []);
      } else {
        setStudents([]);
      }

      if (supervisorsRes.status === 'fulfilled') {
        const payload = parseApiPayload(supervisorsRes.value);
        setSupervisors(Array.isArray(payload) ? payload : []);
      } else {
        setSupervisors([]);
      }

      if (programsRes.status === 'fulfilled') {
        setPrograms(extractPrograms(programsRes.value));
      } else {
        setPrograms([]);
      }

      if (studentsRes.status === 'rejected' && supervisorsRes.status === 'rejected') {
        setErrorMessage(extractErrorMessage(studentsRes.reason, 'Gagal memuat data user bimbingan.'));
      }

      setLoading(false);
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const lecturers = useMemo(() => {
    const map = new Map();

    supervisors.forEach((item) => {
      const lecturer = item?.lecturer;
      if (!lecturer?.id_user_si) return;

      const current = map.get(lecturer.id_user_si) || {
        ...lecturer,
        supervisees: 0,
      };

      current.supervisees += 1;
      map.set(lecturer.id_user_si, current);
    });

    return Array.from(map.values()).map((lecturer) => {
      const maxQuota = Number(lecturer?.staff_profile?.max_supervisees || 6);
      const quota = Number.isFinite(maxQuota) && maxQuota > 0 ? maxQuota : 6;
      const usage = Math.min(100, Math.round((lecturer.supervisees / quota) * 100));

      return {
        ...lecturer,
        quota,
        usage,
      };
    });
  }, [supervisors]);

  const lecturerOptions = useMemo(
    () => lecturers.map((lecturer) => ({ value: String(lecturer.id_user_si), label: lecturer.name })),
    [lecturers]
  );

  const studentRows = useMemo(() => {
    return students
      .filter((item) => {
        const passProgram = studentProgramFilter
          ? String(item?.program?.id_program) === String(studentProgramFilter)
          : true;
        const hasSupervisor = (item?.supervisors || []).length > 0;
        const passSupervisor = studentSupervisorFilter
          ? (item?.supervisors || []).some(
              (supervisor) =>
                String(supervisor?.lecturer?.id_user_si) === String(studentSupervisorFilter)
            )
          : true;

        const normalizedStatus = hasSupervisor ? 'aktif' : 'menunggu';
        const passStatus = studentStatusFilter
          ? normalizedStatus === studentStatusFilter
          : true;

        const keyword = studentSearch.trim().toLowerCase();
        const source = `${item?.student?.name || ''} ${getStudentNim(item)} ${item?.title_ind || ''}`.toLowerCase();
        const passSearch = keyword ? source.includes(keyword) : true;

        return passProgram && passSupervisor && passStatus && passSearch;
      })
      .sort((a, b) => new Date(b?.created_at || 0) - new Date(a?.created_at || 0));
  }, [studentProgramFilter, studentSearch, studentStatusFilter, studentSupervisorFilter, students]);

  const lecturerRows = useMemo(() => {
    return lecturers
      .filter((lecturer) => {
        const normalizedStatus = lecturer.supervisees > 0 ? 'aktif' : 'idle';
        const passStatus = lecturerStatusFilter
          ? normalizedStatus === lecturerStatusFilter
          : true;

        const keyword = lecturerSearch.trim().toLowerCase();
        const source = `${lecturer?.name || ''} ${
          lecturer?.staff_profile?.employee_id_number || lecturer?.username || ''
        } ${lecturer?.staff_profile?.position || ''}`.toLowerCase();
        const passSearch = keyword ? source.includes(keyword) : true;

        return passStatus && passSearch;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [lecturerSearch, lecturerStatusFilter, lecturers]);

  const paginatedStudents = useMemo(() => {
    const start = (studentPage - 1) * 6;
    return studentRows.slice(start, start + 6);
  }, [studentPage, studentRows]);

  const paginatedLecturers = useMemo(() => {
    const start = (lecturerPage - 1) * 6;
    return lecturerRows.slice(start, start + 6);
  }, [lecturerPage, lecturerRows]);

  const studentTotalPages = Math.max(1, Math.ceil(studentRows.length / 6));
  const lecturerTotalPages = Math.max(1, Math.ceil(lecturerRows.length / 6));

  useEffect(() => {
    setStudentPage(1);
  }, [studentProgramFilter, studentSearch, studentStatusFilter, studentSupervisorFilter]);

  useEffect(() => {
    setLecturerPage(1);
  }, [lecturerSearch, lecturerStatusFilter]);

  const stats = useMemo(() => {
    const totalStudents = students.length;
    const assignedStudents = students.filter((item) => (item?.supervisors || []).length > 0).length;
    const totalLecturers = lecturers.length;
    const activeLecturers = lecturers.filter((lecturer) => lecturer.supervisees > 0).length;

    return {
      totalStudents,
      assignedStudents,
      totalLecturers,
      activeLecturers,
    };
  }, [lecturers, students]);

  return (
    <AdminBimbinganShell
      backHref="/admin/bimbingan"
      backLabel="Dashboard Bimbingan"
      title="Kelola Data User"
      description="Manajemen data mahasiswa dan dosen dalam sistem bimbingan TA"
    >
      {loading ? <div className="h-[220px] animate-pulse rounded-[16px] bg-gray-100" /> : null}

      {!loading ? (
        <>
          <section className="grid gap-3 sm:grid-cols-2">
            <MiniSummaryCard
              icon={<GraduationCap className="h-4 w-4 text-[#047857]" />}
              iconBg="#e6f4ea"
              title="Total Mahasiswa"
              value={stats.totalStudents}
              subtitle="Terdaftar aktif"
              valueColor="#047857"
            />
            <MiniSummaryCard
              icon={<UserRoundCheck className="h-4 w-4 text-[#0f766e]" />}
              iconBg="#e6fffa"
              title="Sudah Punya Dosen"
              value={stats.assignedStudents}
              subtitle="Mahasiswa bimbingan"
              valueColor="#0f766e"
            />
            <MiniSummaryCard
              icon={<Users className="h-4 w-4 text-[#1d4ed8]" />}
              iconBg="#dbeafe"
              title="Total Dosen"
              value={stats.totalLecturers}
              subtitle="Dosen terdaftar"
              valueColor="#1d4ed8"
            />
            <MiniSummaryCard
              icon={<ShieldCheck className="h-4 w-4 text-[#9333ea]" />}
              iconBg="#f3e8ff"
              title="Dosen Aktif"
              value={stats.activeLecturers}
              subtitle="Dosen bimbingan aktif"
              valueColor="#9333ea"
            />
          </section>

          <section className="rounded-[14px] bg-white p-1 shadow-sm">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('mahasiswa')}
                className={`flex-1 rounded-[8px] px-4 py-2 text-[12px] font-medium ${
                  activeTab === 'mahasiswa'
                    ? 'bg-[#015023] text-white'
                    : 'bg-white text-[#6a7282] hover:bg-gray-50'
                }`}
              >
                Mahasiswa ({studentRows.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('dosen')}
                className={`flex-1 rounded-[8px] px-4 py-2 text-[12px] font-medium ${
                  activeTab === 'dosen'
                    ? 'bg-[#015023] text-white'
                    : 'bg-white text-[#6a7282] hover:bg-gray-50'
                }`}
              >
                Dosen ({lecturerRows.length})
              </button>
            </div>
          </section>

          {activeTab === 'mahasiswa' ? (
            <>
              <section className="rounded-[14px] bg-white p-4 shadow-sm">
                <div className="mb-3 inline-flex items-center gap-2 text-[12px] font-semibold text-[#015023]">
                  <Filter className="h-4 w-4" />
                  Filter
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <select
                    value={studentProgramFilter}
                    onChange={(event) => setStudentProgramFilter(event.target.value)}
                    className="rounded-[10px] border border-[#d1d5db] px-3 py-2 text-[12px] outline-none focus:border-[#015023]"
                  >
                    <option value="">Program Studi</option>
                    {programs.map((program) => (
                      <option key={program.id_program} value={program.id_program}>
                        {program.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={studentStatusFilter}
                    onChange={(event) => setStudentStatusFilter(event.target.value)}
                    className="rounded-[10px] border border-[#d1d5db] px-3 py-2 text-[12px] outline-none focus:border-[#015023]"
                  >
                    <option value="">Status</option>
                    <option value="aktif">Aktif</option>
                    <option value="menunggu">Belum Ada Dosen</option>
                  </select>

                  <select
                    value={studentSupervisorFilter}
                    onChange={(event) => setStudentSupervisorFilter(event.target.value)}
                    className="rounded-[10px] border border-[#d1d5db] px-3 py-2 text-[12px] outline-none focus:border-[#015023]"
                  >
                    <option value="">Pembimbing</option>
                    {lecturerOptions.map((lecturer) => (
                      <option key={lecturer.value} value={lecturer.value}>
                        {lecturer.label}
                      </option>
                    ))}
                  </select>
                </div>
              </section>

              <section className="rounded-[14px] border border-[#dabc4e]/30 bg-[#dabc4e]/10 p-3">
                <label className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-[#856404]" />
                  <input
                    value={studentSearch}
                    onChange={(event) => setStudentSearch(event.target.value)}
                    placeholder="Cari Mahasiswa..."
                    className="w-full bg-transparent text-[13px] text-[#374151] outline-none placeholder:text-[#9ca3af]"
                  />
                </label>
              </section>

              <section className="overflow-hidden rounded-[14px] bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-[980px] w-full">
                    <thead className="bg-[#dabc4e] text-left text-[12px] font-semibold text-[#015023]">
                      <tr>
                        <th className="px-4 py-3">No</th>
                        <th className="px-4 py-3">NIM / Nama</th>
                        <th className="px-4 py-3">Program Studi</th>
                        <th className="px-4 py-3">Semester</th>
                        <th className="px-4 py-3">IPK</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Dosen Pembimbing</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedStudents.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-sm text-[#6b7280]">
                            Data mahasiswa tidak ditemukan.
                          </td>
                        </tr>
                      ) : (
                        paginatedStudents.map((item, index) => {
                          const hasSupervisor = (item?.supervisors || []).length > 0;
                          const ipk = getStudentIpk(item);

                          return (
                            <tr key={item.id_student_thesis} className="border-b border-[#f3f4f6] text-[12px]">
                              <td className="px-4 py-3">{(studentPage - 1) * 6 + index + 1}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-start gap-2.5">
                                  <span
                                    className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                                    style={{ backgroundColor: getAvatarColor(item?.student?.name) }}
                                  >
                                    {getInitials(item?.student?.name, 'MH')}
                                  </span>
                                  <div>
                                    <p className="font-semibold text-[#1f2937]">{item?.student?.name || '-'}</p>
                                    <p className="text-[11px] text-[#9ca3af]">{getStudentNim(item)}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-[#4b5563]">{item?.program?.name || '-'}</td>
                              <td className="px-4 py-3 text-[#4b5563]">{getStudentSemester(item)}</td>
                              <td className={`px-4 py-3 font-semibold ${getIpkTone(ipk)}`}>
                                {ipk !== null ? ipk.toFixed(2) : '–'}
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#ecfdf5] px-2 py-1 text-[11px] font-medium text-[#047857]">
                                  <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
                                  Aktif
                                </span>
                              </td>
                              <td className="px-4 py-3 text-[#4b5563]">
                                {hasSupervisor ? item?.supervisors?.[0]?.lecturer?.name : 'Belum ditentukan'}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <TablePagination
                  currentPage={studentPage}
                  totalPages={studentTotalPages}
                  onPageChange={setStudentPage}
                  totalLabel={`Menampilkan ${
                    studentRows.length === 0 ? 0 : (studentPage - 1) * 6 + 1
                  }-${Math.min(studentPage * 6, studentRows.length)} dari ${studentRows.length} data`}
                />
              </section>
            </>
          ) : (
            <>
              <section className="rounded-[14px] bg-white p-4 shadow-sm">
                <div className="mb-3 inline-flex items-center gap-2 text-[12px] font-semibold text-[#015023]">
                  <Filter className="h-4 w-4" />
                  Filter
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <select
                    value={lecturerStatusFilter}
                    onChange={(event) => setLecturerStatusFilter(event.target.value)}
                    className="rounded-[10px] border border-[#d1d5db] px-3 py-2 text-[12px] outline-none focus:border-[#015023]"
                  >
                    <option value="">Status</option>
                    <option value="aktif">Aktif</option>
                    <option value="idle">Belum Aktif</option>
                  </select>

                  <div className="rounded-[10px] border border-[#d1d5db] px-3 py-2">
                    <p className="text-[11px] text-[#6b7280]">
                      Data diperbarui {formatDate(new Date().toISOString())}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-[14px] border border-[#dabc4e]/30 bg-[#dabc4e]/10 p-3">
                <label className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-[#856404]" />
                  <input
                    value={lecturerSearch}
                    onChange={(event) => setLecturerSearch(event.target.value)}
                    placeholder="Cari Dosen..."
                    className="w-full bg-transparent text-[13px] text-[#374151] outline-none placeholder:text-[#9ca3af]"
                  />
                </label>
              </section>

              <section className="overflow-hidden rounded-[14px] bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-[1000px] w-full">
                    <thead className="bg-[#dabc4e] text-left text-[12px] font-semibold text-[#015023]">
                      <tr>
                        <th className="px-4 py-3">No</th>
                        <th className="px-4 py-3">NIP / Nama</th>
                        <th className="px-4 py-3">Bidang Keahlian</th>
                        <th className="px-4 py-3">Jabatan</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Kuota Bimbingan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedLecturers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-sm text-[#6b7280]">
                            Data dosen tidak ditemukan.
                          </td>
                        </tr>
                      ) : (
                        paginatedLecturers.map((lecturer, index) => {
                          const fillColor =
                            lecturer.usage > 90
                              ? '#ef4444'
                              : lecturer.usage >= 60
                                ? '#f59e0b'
                                : '#10b981';

                          return (
                            <tr key={lecturer.id_user_si} className="border-b border-[#f3f4f6] text-[12px]">
                              <td className="px-4 py-3">{(lecturerPage - 1) * 6 + index + 1}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-start gap-2.5">
                                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#8b6f00] text-[10px] font-semibold text-white">
                                    {getInitials(lecturer?.name, 'DS')}
                                  </span>
                                  <div>
                                    <p className="font-semibold text-[#1f2937]">{lecturer?.name || '-'}</p>
                                    <p className="text-[11px] text-[#9ca3af]">
                                      {lecturer?.staff_profile?.employee_id_number || lecturer?.username || '-'}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-[#4b5563]">
                                {lecturer?.staff_profile?.expertise || lecturer?.staff_profile?.specialization || '–'}
                              </td>
                              <td className="px-4 py-3 text-[#4b5563]">
                                {lecturer?.staff_profile?.position || '–'}
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#ecfdf5] px-2 py-1 text-[11px] font-medium text-[#047857]">
                                  <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
                                  Aktif
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <p className="text-[12px] font-semibold text-[#374151]">
                                  {lecturer.supervisees}/{lecturer.quota}
                                </p>
                                <div className="mt-1 h-1.5 w-[120px] rounded-full bg-[#e5e7eb]">
                                  <div
                                    className="h-full rounded-full"
                                    style={{ width: `${lecturer.usage}%`, backgroundColor: fillColor }}
                                  />
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <TablePagination
                  currentPage={lecturerPage}
                  totalPages={lecturerTotalPages}
                  onPageChange={setLecturerPage}
                  totalLabel={`Menampilkan ${
                    lecturerRows.length === 0 ? 0 : (lecturerPage - 1) * 6 + 1
                  }-${Math.min(lecturerPage * 6, lecturerRows.length)} dari ${lecturerRows.length} data`}
                />
              </section>
            </>
          )}

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
