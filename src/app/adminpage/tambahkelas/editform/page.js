"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldContent,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import AdminNavbar from "@/components/ui/admin-navbar";
import LoadingEffect from "@/components/ui/loading-effect";
import {
  ErrorMessageBox,
  ErrorMessageBoxWithButton,
  SuccessMessageBoxWithButton,
} from "@/components/ui/message-box";
import { AlertConfirmationRedDialog } from "@/components/ui/alert-dialog";
import { ArrowLeft, Info, Save, Users, X } from "lucide-react";
import {
  getAcademicPeriods,
  getClassById,
  getSubjects,
  updateClass,
} from "@/lib/adminApi";

export const dynamic = 'force-dynamic';

const initialFormData = {
  code_class: "",
  id_subject: "",
  id_academic_period: "",
  member_class: "",
  current_students: "0",
  day_of_week: "",
  start_time: "",
  end_time: "",
  is_active: true,
};

const dayOptions = [
  { value: "1", label: "Senin" },
  { value: "2", label: "Selasa" },
  { value: "3", label: "Rabu" },
  { value: "4", label: "Kamis" },
  { value: "5", label: "Jumat" },
  { value: "6", label: "Sabtu" },
  { value: "7", label: "Minggu" },
];

function EditKelasForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const kelasId = searchParams.get("id");

  const [formData, setFormData] = useState(initialFormData);
  const [subjects, setSubjects] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [errors, setErrors] = useState({});
  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const fetchFormData = useCallback(async () => {
    if (!kelasId) {
      setErrors({ fetch: "ID kelas tidak valid." });
      setIsFetching(false);
      return;
    }

    setIsFetching(true);
    try {
      const [classResponse, subjectResponse, periodResponse] = await Promise.all([
        getClassById(kelasId),
        getSubjects(),
        getAcademicPeriods(),
      ]);

      if (subjectResponse.status === "success") {
        setSubjects(subjectResponse.data ?? []);
      } else {
        throw { message: subjectResponse.message || "Gagal memuat data mata kuliah." };
      }

      if (periodResponse.status === "success") {
        setPeriods(periodResponse.data ?? []);
      } else {
        throw { message: periodResponse.message || "Gagal memuat data periode akademik." };
      }

      if (classResponse.status !== "success") {
        throw { message: classResponse.message || "Gagal memuat data kelas." };
      }

      const currentStudents =
        classResponse.data.total_students ??
        classResponse.data.students?.length ??
        0;

      setFormData({
        code_class: classResponse.data.code_class ?? "",
        id_subject: String(
          classResponse.data.id_subject ??
            classResponse.data.subject?.id_subject ??
            ""
        ),
        id_academic_period: String(
          classResponse.data.id_academic_period ??
            classResponse.data.academic_period?.id_academic_period ??
            ""
        ),
        member_class: String(classResponse.data.member_class ?? ""),
        current_students: String(currentStudents),
        day_of_week: String(classResponse.data.day_of_week ?? ""),
        start_time: String(classResponse.data.start_time ?? "").slice(0, 5),
        end_time: String(classResponse.data.end_time ?? "").slice(0, 5),
        is_active: Boolean(classResponse.data.is_active),
      });
      setErrors({});
    } catch (error) {
      setErrors({ fetch: error.message || "Gagal memuat form kelas." });
    } finally {
      setIsFetching(false);
    }
  }, [kelasId]);

  useEffect(() => {
    fetchFormData();
  }, [fetchFormData]);

  useEffect(() => {
    if (!success) {
      return undefined;
    }

    if (countdown <= 0) {
      router.push("/adminpage/tambahkelas");
      return undefined;
    }

    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [success, countdown, router]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name] || errors.form) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
        form: null,
      }));
    }

    if (success) {
      setSuccess(null);
      setCountdown(5);
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.code_class.trim()) {
      nextErrors.code_class = "Kode kelas harus diisi";
    } else if (formData.code_class.trim().length < 2) {
      nextErrors.code_class = "Kode kelas minimal 2 karakter";
    }

    if (!formData.id_subject) {
      nextErrors.id_subject = "Mata kuliah harus dipilih";
    }

    if (!formData.id_academic_period) {
      nextErrors.id_academic_period = "Periode akademik harus dipilih";
    }

    if (!formData.member_class) {
      nextErrors.member_class = "Kapasitas kelas harus diisi";
    } else if (Number(formData.member_class) < 1) {
      nextErrors.member_class = "Kapasitas kelas minimal 1 mahasiswa";
    }

    if (Number(formData.current_students) > Number(formData.member_class)) {
      nextErrors.member_class = "Kapasitas tidak boleh lebih kecil dari jumlah mahasiswa saat ini";
    }

    if (!formData.day_of_week) {
      nextErrors.day_of_week = "Hari harus dipilih";
    }

    if (!formData.start_time) {
      nextErrors.start_time = "Jam mulai harus diisi";
    }

    if (!formData.end_time) {
      nextErrors.end_time = "Jam selesai harus diisi";
    } else if (formData.start_time && formData.end_time <= formData.start_time) {
      nextErrors.end_time = "Jam selesai harus lebih besar dari jam mulai";
    }

    setErrors((prev) => ({ ...prev, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await updateClass(kelasId, {
        code_class: formData.code_class.trim().toUpperCase(),
        id_subject: Number(formData.id_subject),
        id_academic_period: Number(formData.id_academic_period),
        member_class: Number(formData.member_class),
        day_of_week: Number(formData.day_of_week),
        start_time: formData.start_time,
        end_time: formData.end_time,
        is_active: formData.is_active,
      });

      if (response.status === "success") {
        setSuccess("Data kelas berhasil diperbarui.");
        setCountdown(5);
        setErrors({});
      } else {
        setErrors({ form: response.message || "Gagal memperbarui data kelas." });
      }
    } catch (error) {
      setErrors({ form: error.message || "Gagal memperbarui data kelas." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    router.push("/adminpage/tambahkelas");
  };

  if (isFetching) {
    return <LoadingEffect message="Memuat data kelas..." />;
  }

  if (errors.fetch) {
    return (
      <div className="min-h-screen bg-brand-light-sage">
        <AdminNavbar title="Dashboard Admin - Edit Kelas" />
        <div className="container mx-auto max-w-5xl px-4 py-8">
          <ErrorMessageBoxWithButton
            message={errors.fetch}
            action={fetchFormData}
            back={true}
            actionback={handleFinish}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light-sage">
      <AdminNavbar title="Dashboard Admin - Edit Kelas" />

      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="mb-10">
          <Button
            variant="ghost"
            onClick={() => setShowCancelDialog(true)}
            className="mb-6 -ml-4"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Kembali
          </Button>

          <div className="mb-4 flex items-center gap-4">
            <div
              className="h-16 w-2 rounded-full"
              style={{ backgroundColor: "#015023" }}
            />
            <div>
              <h1
                className="mb-2 text-4xl font-bold"
                style={{
                  fontFamily: "Urbanist, sans-serif",
                  color: "#015023",
                }}
              >
                Edit Data Kelas
              </h1>
              <p
                className="text-lg text-gray-600"
                style={{ fontFamily: "Urbanist, sans-serif" }}
              >
                Halaman ini sekarang memakai detail kelas, mata kuliah, dan
                periode akademik dari backend deployed.
              </p>
            </div>
          </div>
        </div>

        <div
          className="mb-6 border-2 p-6 shadow-md"
          style={{
            borderColor: "#DABC4E",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #FFFEF7 0%, #FFF9E6 100%)",
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: "#DABC4E", color: "#015023" }}
            >
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p
                className="text-sm font-semibold uppercase tracking-wide"
                style={{ color: "#015023", fontFamily: "Urbanist, sans-serif" }}
              >
                Mahasiswa Saat Ini
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: "#015023", fontFamily: "Urbanist, sans-serif" }}
              >
                {formData.current_students} / {formData.member_class || "-"}
              </p>
            </div>
          </div>
        </div>

        <div
          className="border-2 bg-white p-8 shadow-lg md:p-10"
          style={{
            borderColor: "#015023",
            borderRadius: "12px",
          }}
        >
          <div className="mb-8">
            <h2
              className="mb-2 text-2xl font-bold"
              style={{
                fontFamily: "Urbanist, sans-serif",
                color: "#015023",
              }}
            >
              Informasi Kelas
            </h2>
            <div
              className="h-1 w-20 rounded-full"
              style={{ backgroundColor: "#DABC4E" }}
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <Field>
              <FieldLabel htmlFor="code_class">
                Kode Kelas <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldDescription>Kode unik kelas</FieldDescription>
              <FieldContent>
                <input
                  id="code_class"
                  name="code_class"
                  type="text"
                  value={formData.code_class}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full rounded-[12px] border-2 px-4 py-3.5 uppercase focus:outline-none"
                  style={{
                    fontFamily: "Urbanist, sans-serif",
                    borderColor: errors.code_class ? "#BE0414" : "#015023",
                    opacity: errors.code_class ? 1 : 0.7,
                  }}
                />
              </FieldContent>
              {errors.code_class && <FieldError>{errors.code_class}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="id_subject">
                Mata Kuliah <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldDescription>Mata kuliah yang diajarkan</FieldDescription>
              <FieldContent>
                <select
                  id="id_subject"
                  name="id_subject"
                  value={formData.id_subject}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full rounded-[12px] border-2 px-4 py-3.5 focus:outline-none"
                  style={{
                    fontFamily: "Urbanist, sans-serif",
                    borderColor: errors.id_subject ? "#BE0414" : "#015023",
                    opacity: errors.id_subject ? 1 : 0.7,
                  }}
                >
                  <option value="">Pilih mata kuliah</option>
                  {subjects.map((subject) => (
                    <option key={subject.id_subject} value={subject.id_subject}>
                      {subject.code_subject} - {subject.name_subject}
                    </option>
                  ))}
                </select>
              </FieldContent>
              {errors.id_subject && <FieldError>{errors.id_subject}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="id_academic_period">
                Periode Akademik <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldDescription>Periode aktif untuk kelas ini</FieldDescription>
              <FieldContent>
                <select
                  id="id_academic_period"
                  name="id_academic_period"
                  value={formData.id_academic_period}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full rounded-[12px] border-2 px-4 py-3.5 focus:outline-none"
                  style={{
                    fontFamily: "Urbanist, sans-serif",
                    borderColor: errors.id_academic_period ? "#BE0414" : "#015023",
                    opacity: errors.id_academic_period ? 1 : 0.7,
                  }}
                >
                  <option value="">Pilih periode akademik</option>
                  {periods.map((period) => (
                    <option
                      key={period.id_academic_period}
                      value={period.id_academic_period}
                    >
                      {period.name}
                    </option>
                  ))}
                </select>
              </FieldContent>
              {errors.id_academic_period && (
                <FieldError>{errors.id_academic_period}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="member_class">
                Kapasitas Kelas <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldDescription>
                Tidak boleh lebih kecil dari jumlah mahasiswa yang sudah terdaftar.
              </FieldDescription>
              <FieldContent>
                <input
                  id="member_class"
                  name="member_class"
                  type="number"
                  min="1"
                  value={formData.member_class}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full rounded-[12px] border-2 px-4 py-3.5 focus:outline-none"
                  style={{
                    fontFamily: "Urbanist, sans-serif",
                    borderColor: errors.member_class ? "#BE0414" : "#015023",
                    opacity: errors.member_class ? 1 : 0.7,
                  }}
                />
              </FieldContent>
              {errors.member_class && <FieldError>{errors.member_class}</FieldError>}
            </Field>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Field>
                <FieldLabel htmlFor="day_of_week">
                  Hari <span className="text-red-500">*</span>
                </FieldLabel>
                <FieldDescription>Hari pelaksanaan kelas</FieldDescription>
                <FieldContent>
                  <select
                    id="day_of_week"
                    name="day_of_week"
                    value={formData.day_of_week}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full rounded-[12px] border-2 px-4 py-3.5 focus:outline-none"
                    style={{
                      fontFamily: "Urbanist, sans-serif",
                      borderColor: errors.day_of_week ? "#BE0414" : "#015023",
                      opacity: errors.day_of_week ? 1 : 0.7,
                    }}
                  >
                    <option value="">Pilih hari</option>
                    {dayOptions.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </FieldContent>
                {errors.day_of_week && <FieldError>{errors.day_of_week}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="start_time">
                  Jam Mulai <span className="text-red-500">*</span>
                </FieldLabel>
                <FieldDescription>Waktu mulai kelas</FieldDescription>
                <FieldContent>
                  <input
                    id="start_time"
                    name="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full rounded-[12px] border-2 px-4 py-3.5 focus:outline-none"
                    style={{
                      fontFamily: "Urbanist, sans-serif",
                      borderColor: errors.start_time ? "#BE0414" : "#015023",
                      opacity: errors.start_time ? 1 : 0.7,
                    }}
                  />
                </FieldContent>
                {errors.start_time && <FieldError>{errors.start_time}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="end_time">
                  Jam Selesai <span className="text-red-500">*</span>
                </FieldLabel>
                <FieldDescription>Waktu selesai kelas</FieldDescription>
                <FieldContent>
                  <input
                    id="end_time"
                    name="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full rounded-[12px] border-2 px-4 py-3.5 focus:outline-none"
                    style={{
                      fontFamily: "Urbanist, sans-serif",
                      borderColor: errors.end_time ? "#BE0414" : "#015023",
                      opacity: errors.end_time ? 1 : 0.7,
                    }}
                  />
                </FieldContent>
                {errors.end_time && <FieldError>{errors.end_time}</FieldError>}
              </Field>
            </div>

            <Field>
              <div
                className="flex cursor-pointer items-center gap-4 border-2 p-5"
                style={{
                  borderColor: "#015023",
                  borderRadius: "12px",
                  opacity: 0.7,
                }}
              >
                <input
                  id="is_active"
                  name="is_active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="h-6 w-6 cursor-pointer accent-[#015023]"
                />
                <div className="flex-1">
                  <FieldLabel htmlFor="is_active" className="mb-1 cursor-pointer">
                    Status Aktif
                  </FieldLabel>
                  <FieldDescription className="mt-0">
                    Nonaktifkan jika kelas tidak boleh dipakai pada semester ini.
                  </FieldDescription>
                </div>
              </div>
            </Field>

            {errors.form && <ErrorMessageBox message={errors.form} />}

            {success && (
              <SuccessMessageBoxWithButton
                message={`${success} Akan kembali ke daftar kelas dalam ${countdown} detik.`}
                action={handleFinish}
                btntext={countdown > 0 ? `Lihat Data (${countdown})` : "Lihat Data"}
              />
            )}

            <div className="pt-8">
              <div
                className="mb-8 h-px w-full"
                style={{
                  background:
                    "linear-gradient(to right, transparent, #015023, transparent)",
                  opacity: 0.3,
                }}
              />

              <div className="flex flex-col gap-4 sm:flex-row">
                <Button
                  type="submit"
                  variant="default"
                  disabled={isLoading}
                  className="flex-1 sm:min-w-[200px]"
                >
                  {isLoading ? (
                    <>Menyimpan...</>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Simpan Perubahan
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="warning"
                  disabled={isLoading}
                  onClick={() => setShowCancelDialog(true)}
                  className="flex-1 sm:min-w-[200px]"
                >
                  <X className="mr-2 h-5 w-5" />
                  Batal
                </Button>
              </div>
            </div>
          </form>
        </div>

        <div
          className="mt-8 border-2 p-6 shadow-md"
          style={{
            borderColor: "#DABC4E",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #FFFEF7 0%, #FFF9E6 100%)",
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor: "#DABC4E",
                color: "#015023",
              }}
            >
              <Info className="h-5 w-5" />
            </div>
            <div>
              <h3
                className="mb-2 text-lg font-bold"
                style={{
                  fontFamily: "Urbanist, sans-serif",
                  color: "#015023",
                }}
              >
                Catatan Penting
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{
                  fontFamily: "Urbanist, sans-serif",
                  color: "#015023",
                }}
              >
                Perubahan kapasitas akan divalidasi terhadap jumlah mahasiswa
                yang sudah terdaftar. Form ini sekarang menggunakan payload yang
                sama dengan endpoint update kelas di backend.
              </p>
            </div>
          </div>
        </div>
      </div>

      <AlertConfirmationRedDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title="Konfirmasi Pembatalan"
        description="Apakah Anda yakin ingin membatalkan? Perubahan yang belum disimpan akan hilang."
        onConfirm={handleFinish}
        confirmText="Ya, Batalkan"
        cancelText="Lanjutkan Edit"
      />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingEffect message="Memuat data kelas..." />}>
      <EditKelasForm />
    </Suspense>
  );
}
