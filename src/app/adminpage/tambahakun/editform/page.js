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
import { ArrowLeft, Info, Save, X } from "lucide-react";
import { getManagerById, updateManager } from "@/lib/adminApi";

const initialFormData = {
  name: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  is_active: true,
};

function EditManagerForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const managerId = searchParams.get("id");

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const fetchManagerData = useCallback(async () => {
    if (!managerId) {
      setErrors({ fetch: "ID manager tidak valid." });
      setIsFetching(false);
      return;
    }

    setIsFetching(true);
    try {
      const response = await getManagerById(managerId);

      if (response.status === "success") {
        setFormData({
          name: response.data.name ?? "",
          username: response.data.username ?? "",
          email: response.data.email ?? "",
          password: "",
          confirmPassword: "",
          is_active: Boolean(response.data.is_active),
        });
        setErrors({});
      } else {
        setErrors({ fetch: response.message || "Gagal memuat data manager." });
      }
    } catch (error) {
      setErrors({ fetch: error.message || "Gagal memuat data manager." });
    } finally {
      setIsFetching(false);
    }
  }, [managerId]);

  useEffect(() => {
    fetchManagerData();
  }, [fetchManagerData]);

  useEffect(() => {
    if (!success) {
      return undefined;
    }

    if (countdown <= 0) {
      router.push("/adminpage/tambahakun");
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

    if (!formData.name.trim()) {
      nextErrors.name = "Nama manager harus diisi";
    } else if (formData.name.trim().length < 3) {
      nextErrors.name = "Nama manager minimal 3 karakter";
    }

    if (!formData.username.trim()) {
      nextErrors.username = "Username harus diisi";
    } else if (formData.username.trim().length < 3) {
      nextErrors.username = "Username minimal 3 karakter";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Email harus diisi";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      nextErrors.email = "Format email tidak valid";
    }

    if (formData.password && formData.password.length < 6) {
      nextErrors.password = "Password minimal 6 karakter";
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = "Konfirmasi password tidak sama";
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
      const payload = {
        name: formData.name.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        is_active: formData.is_active,
      };

      if (formData.password) {
        payload.password = formData.password;
        payload.password_confirmation = formData.confirmPassword;
      }

      const response = await updateManager(managerId, payload);

      if (response.status === "success") {
        setSuccess("Data manager berhasil diperbarui.");
        setCountdown(5);
        setErrors({});
      } else {
        setErrors({ form: response.message || "Gagal memperbarui data manager." });
      }
    } catch (error) {
      setErrors({ form: error.message || "Gagal memperbarui data manager." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    router.push("/adminpage/tambahakun");
  };

  if (isFetching) {
    return <LoadingEffect message="Memuat data manager..." />;
  }

  if (errors.fetch) {
    return (
      <div className="min-h-screen bg-brand-light-sage">
        <AdminNavbar title="Dashboard Admin - Edit Akun Manager" />
        <div className="container mx-auto max-w-5xl px-4 py-8">
          <ErrorMessageBoxWithButton
            message={errors.fetch}
            action={fetchManagerData}
            back={true}
            actionback={handleFinish}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light-sage">
      <AdminNavbar title="Dashboard Admin - Edit Akun Manager" />

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
                Edit Akun Manager
              </h1>
              <p
                className="text-lg text-gray-600"
                style={{ fontFamily: "Urbanist, sans-serif" }}
              >
                Data akun diambil dari backend yang sedang aktif.
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
              Informasi Akun
            </h2>
            <div
              className="h-1 w-20 rounded-full"
              style={{ backgroundColor: "#DABC4E" }}
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <Field>
              <FieldLabel htmlFor="name">
                Nama <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldDescription>Nama lengkap manager</FieldDescription>
              <FieldContent>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full rounded-[12px] border-2 px-4 py-3.5 focus:outline-none"
                  style={{
                    fontFamily: "Urbanist, sans-serif",
                    borderColor: errors.name ? "#BE0414" : "#015023",
                    opacity: errors.name ? 1 : 0.7,
                  }}
                />
              </FieldContent>
              {errors.name && <FieldError>{errors.name}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="username">
                Username <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldDescription>Username untuk login manager</FieldDescription>
              <FieldContent>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full rounded-[12px] border-2 px-4 py-3.5 focus:outline-none"
                  style={{
                    fontFamily: "Urbanist, sans-serif",
                    borderColor: errors.username ? "#BE0414" : "#015023",
                    opacity: errors.username ? 1 : 0.7,
                  }}
                />
              </FieldContent>
              {errors.username && <FieldError>{errors.username}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="email">
                Email <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldDescription>Email aktif untuk akun manager</FieldDescription>
              <FieldContent>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full rounded-[12px] border-2 px-4 py-3.5 focus:outline-none"
                  style={{
                    fontFamily: "Urbanist, sans-serif",
                    borderColor: errors.email ? "#BE0414" : "#015023",
                    opacity: errors.email ? 1 : 0.7,
                  }}
                />
              </FieldContent>
              {errors.email && <FieldError>{errors.email}</FieldError>}
            </Field>

            <div
              className="my-8 h-px w-full"
              style={{
                background:
                  "linear-gradient(to right, transparent, #DABC4E, transparent)",
              }}
            />

            <Field>
              <FieldLabel htmlFor="password">Password Baru</FieldLabel>
              <FieldDescription>
                Kosongkan jika tidak ingin mengubah password.
              </FieldDescription>
              <FieldContent>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full rounded-[12px] border-2 px-4 py-3.5 focus:outline-none"
                  style={{
                    fontFamily: "Urbanist, sans-serif",
                    borderColor: errors.password ? "#BE0414" : "#015023",
                    opacity: errors.password ? 1 : 0.7,
                  }}
                />
              </FieldContent>
              {errors.password && <FieldError>{errors.password}</FieldError>}
            </Field>

            {formData.password && (
              <Field>
                <FieldLabel htmlFor="confirmPassword">
                  Konfirmasi Password Baru
                </FieldLabel>
                <FieldDescription>
                  Ulangi password baru untuk konfirmasi.
                </FieldDescription>
                <FieldContent>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full rounded-[12px] border-2 px-4 py-3.5 focus:outline-none"
                    style={{
                      fontFamily: "Urbanist, sans-serif",
                      borderColor: errors.confirmPassword ? "#BE0414" : "#015023",
                      opacity: errors.confirmPassword ? 1 : 0.7,
                    }}
                  />
                </FieldContent>
                {errors.confirmPassword && (
                  <FieldError>{errors.confirmPassword}</FieldError>
                )}
              </Field>
            )}

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
                    Nonaktifkan jika akun manager tidak boleh login.
                  </FieldDescription>
                </div>
              </div>
            </Field>

            {errors.form && <ErrorMessageBox message={errors.form} />}

            {success && (
              <SuccessMessageBoxWithButton
                message={`${success} Akan kembali ke daftar akun dalam ${countdown} detik.`}
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
                Halaman ini sekarang membaca data manager dari backend deployed.
                Jika penyimpanan gagal, kemungkinan endpoint update manager belum
                tersedia di deployment backend saat ini.
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
    <Suspense fallback={<LoadingEffect message="Memuat data manager..." />}>
      <EditManagerForm />
    </Suspense>
  );
}
