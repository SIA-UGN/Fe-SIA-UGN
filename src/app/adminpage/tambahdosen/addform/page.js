"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Field, 
  FieldLabel, 
  FieldDescription, 
  FieldError, 
  FieldContent 
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import AdminNavbar from "@/components/ui/admin-navbar";
import { ArrowLeft, Save, X, Info } from "lucide-react";
import { storeDosen, getPrograms } from "@/lib/adminApi";
import { SuccessMessageBoxWithButton, 
  ErrorMessageBox, 
  ErrorMessageBoxWithButton 
} from "@/components/ui/message-box";
import LoadingEffect from "@/components/ui/loading-effect";
import { AlertConfirmationRedDialog } from "@/components/ui/alert-dialog";

export default function AddDosenForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [programs, setPrograms] = useState([]);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    program: "",
    is_active: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    if (errors.form) {
      setErrors(prev => ({ ...prev, form: null }));
    }
    if (success) {
      setSuccess(null);
      setFormData({
        name: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        is_active: true
      })
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = "Username harus diisi";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username minimal 3 karakter";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Nama harus diisi";
    } else if (formData.name.length < 3) {
      newErrors.name = "Nama minimal 3 karakter";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email harus diisi";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }
    
    if (!formData.password) {
      newErrors.password = "Password harus diisi";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password harus diisi";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Password tidak sama";
    }
    if (!formData.program || formData.program === "") {
      newErrors.program = "Program harus dipilih";
    }
    
    setErrors(prev => ({...prev, ...newErrors}));
    return Object.keys(newErrors).length === 0;
  };

  const fetchPrograms = async () => {
    setIsFetching(true);
    try {
      const response = await getPrograms();
      if (response.status === 'success') {
        setPrograms(response.data);
      } else {
        setErrors(prev => ({ ...prev, fetch: response.message || 'Gagal memuat program' }));
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, fetch: error.message || 'Gagal memuat program' }));
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    const newErrors = {};
    try {
      // panggil Api storeDosen
      const response = await storeDosen({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        id_program: formData.program,
        is_active: formData.is_active
      });
      if (response.status === 'success') {
        setSuccess('Dosen berhasil ditambahkan');
        // Reset form
        setFormData({
          name: "",
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
          program: "",
          is_active: true
        });
      } else if (response.status === 'failed') {
        newErrors.form = response.message || 'Gagal menambahkan data';
      } else {
        newErrors.form = response.message || 'Gagal menambahkan data';
      }
    } catch (error) {
      newErrors.form = "Gagal menambah data: " + (error.message || 'Unknown error');
    } finally {
      setIsLoading(false);
      setErrors(prev => ({ ...prev, ...newErrors }));
    }
  };

  const handleCancel = () => {
    setShowCancelDialog(true);
  };

  const confirmCancel = () => {
    router.push("/adminpage/tambahdosen");
  };

  const handleFinish = () => {
    router.push("/adminpage/tambahdosen");
  };

  if (isFetching) {
    return (
      <LoadingEffect/>
    );
  } else if (errors.fetch) {
    return (
      <div className="min-h-screen bg-brand-light-sage">
        <AdminNavbar title="Dashboard Admin - Tambah Dosen" />
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <ErrorMessageBoxWithButton
            message={errors.fetch}
            action={fetchPrograms}
            back={true}
            actionback={handleFinish}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light-sage">
      <AdminNavbar title="Dashboard Admin - Tambah Dosen" />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-10">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="mb-6 -ml-4"
            style={{ fontFamily: 'Urbanist, sans-serif' }}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Kembali
          </Button>
          
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="w-2 h-16 rounded-full"
              style={{ backgroundColor: '#015023' }}
            />
            <div>
              <h1 
                className="text-4xl font-bold mb-2"
                style={{ 
                  fontFamily: 'Urbanist, sans-serif',
                  color: '#015023'
                }}
              >
                Tambah Data Dosen
              </h1>
              <p 
                className="text-lg text-gray-600"
                style={{ fontFamily: 'Urbanist, sans-serif' }}
              >
                Isi form di bawah ini untuk menambahkan dosen baru ke sistem
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div 
          className="bg-white border-2 p-8 md:p-10 shadow-lg"
          style={{ 
            borderColor: '#015023',
            borderRadius: '12px'
          }}
        >
          <div className="mb-8">
            <h2 
              className="text-2xl font-bold mb-2"
              style={{ 
                fontFamily: 'Urbanist, sans-serif',
                color: '#015023'
              }}
            >
              Informasi Dosen
            </h2>
            <div 
              className="w-20 h-1 rounded-full"
              style={{ backgroundColor: '#DABC4E' }}
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Username Field */}
            <Field>
              <FieldLabel htmlFor="username">
                Username <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldDescription>
                Username yang akan digunakan untuk login
              </FieldDescription>
              <FieldContent>
                <div className="relative">
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 border-2 focus:outline-none focus:border-opacity-100"
                    style={{
                      fontFamily: 'Urbanist, sans-serif',
                      borderColor: errors.username ? '#BE0414' : '#015023',
                      borderRadius: '12px',
                      opacity: errors.username ? 1 : 0.7
                    }}
                    placeholder="Masukkan username"
                    disabled={isLoading}
                  />
                  {formData.username && !errors.username && (
                    <div 
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: '#16874B' }}
                    >
                      ✓
                    </div>
                  )}
                </div>
              </FieldContent>
              {errors.username && (
                <FieldError>{errors.username}</FieldError>
              )}
            </Field>
            {/* Name Field */}
            <Field>
              <FieldLabel htmlFor="name">
                Name <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldDescription>
                Nama lengkap dosen
              </FieldDescription>
              <FieldContent>
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 border-2 focus:outline-none focus:border-opacity-100"
                    style={{
                      fontFamily: 'Urbanist, sans-serif',
                      borderColor: errors.name ? '#BE0414' : '#015023',
                      borderRadius: '12px',
                      opacity: errors.name ? 1 : 0.7
                    }}
                    placeholder="Masukkan nama lengkap"
                    disabled={isLoading}
                  />
                  {formData.name && !errors.name && (
                    <div
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: '#16874B' }}
                    >
                      ✓
                    </div>
                  )}
                </div>
              </FieldContent>
              {errors.username && (
                <FieldError>{errors.username}</FieldError>
              )}
            </Field>

            {/* Email Field */}
            <Field>
              <FieldLabel htmlFor="email">
                Email <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldDescription>
                Alamat email yang valid untuk komunikasi
              </FieldDescription>
              <FieldContent>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 border-2 focus:outline-none focus:border-opacity-100"
                    style={{
                      fontFamily: 'Urbanist, sans-serif',
                      borderColor: errors.email ? '#BE0414' : '#015023',
                      borderRadius: '12px',
                      opacity: errors.email ? 1 : 0.7
                    }}
                    placeholder="contoh@email.com"
                    disabled={isLoading}
                  />
                  {formData.email && !errors.email && /\S+@\S+\.\S+/.test(formData.email) && (
                    <div 
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: '#16874B' }}
                    >
                      ✓
                    </div>
                  )}
                </div>
              </FieldContent>
              {errors.email && (
                <FieldError>{errors.email}</FieldError>
              )}
            </Field>

            {/* Password Field */}
            <Field>
              <FieldLabel htmlFor="password">
                Password <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldDescription>
                Password minimal 6 karakter
              </FieldDescription>
              <FieldContent>
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 border-2 focus:outline-none focus:border-opacity-100"
                    style={{
                      fontFamily: 'Urbanist, sans-serif',
                      borderColor: errors.password ? '#BE0414' : '#015023',
                      borderRadius: '12px',
                      opacity: errors.password ? 1 : 0.7
                    }}
                    placeholder="Masukkan password"
                    disabled={isLoading}
                  />
                  {formData.password && !errors.password && formData.password.length >= 6 && (
                    <div 
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: '#16874B' }}
                    >
                      ✓
                    </div>
                  )}
                </div>
              </FieldContent>
              {errors.password && (
                <FieldError>{errors.password}</FieldError>
              )}
            </Field>

            {/* Confirm Password Field */}
            <Field>
              <FieldLabel htmlFor="confirmPassword">
                Konfirmasi Password <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldDescription>
                Ulangi password untuk konfirmasi
              </FieldDescription>
              <FieldContent>
                <div className="relative">
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 border-2 focus:outline-none focus:border-opacity-100"
                    style={{
                      fontFamily: 'Urbanist, sans-serif',
                      borderColor: errors.confirmPassword ? '#BE0414' : '#015023',
                      borderRadius: '12px',
                      opacity: errors.confirmPassword ? 1 : 0.7
                    }}
                    placeholder="Ulangi password"
                    disabled={isLoading}
                  />
                  {formData.confirmPassword && !errors.confirmPassword && formData.password === formData.confirmPassword && (
                    <div 
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: '#16874B' }}
                    >
                      ✓
                    </div>
                  )}
                </div>
              </FieldContent>
              {errors.confirmPassword && (
                <FieldError>{errors.confirmPassword}</FieldError>
              )}
            </Field>

            {/* Role Field */}
            <Field>
              <FieldLabel htmlFor="role">
                Program <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldDescription>
                Pilih program untuk pengguna ini
              </FieldDescription>
              <FieldContent>
                <div className="relative">
                  <select
                    id="program"
                    name="program"
                    value={formData.program}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 border-2 focus:outline-none focus:border-opacity-100 appearance-none cursor-pointer"
                    style={{
                      fontFamily: 'Urbanist, sans-serif',
                      borderColor: errors.program ? '#BE0414' : '#015023',
                      borderRadius: '12px',
                      opacity: errors.program ? 1 : 0.7,
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23015023' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      backgroundSize: '1.5rem'
                    }}
                    disabled={isLoading}
                  >
                    <option value="" disabled>Pilih program</option>
                    {programs.map((program) => (
                      <option key={program.id_program} value={program.id_program}>
                        {program.name}
                      </option>
                    ))}
                  </select>
                </div>
              </FieldContent>
              {errors.program && (
                <FieldError>{errors.program}</FieldError>
              )}
            </Field>

            {/* Is Active Field */}
            <Field>
              <div 
                className="flex items-center gap-4 p-5 border-2 cursor-pointer"
                style={{
                  borderColor: '#015023',
                  borderRadius: '12px',
                  opacity: 0.7
                }}
              >
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="w-6 h-6 cursor-pointer accent-[#015023]"
                  style={{
                    borderRadius: '6px'
                  }}
                  disabled={isLoading}
                />
                <div className="flex-1">
                  <FieldLabel htmlFor="is_active" className="cursor-pointer mb-1">
                    Status Aktif
                  </FieldLabel>
                  <FieldDescription className="mt-0">
                    Centang jika akun dosen ini aktif
                  </FieldDescription>
                </div>
              </div>
            </Field>

            {/* Form Error */}
            {errors.form && (
              <ErrorMessageBox message={errors.form} />
            )}
            {/* Success Message */}
            {success && (
              <SuccessMessageBoxWithButton message={success + ' Lihat Data atau tambahkan akun dosen lain'} action={handleFinish} btntext="Lihat Data" />
            )}

            {/* Action Buttons */}
            <div className="pt-8">
              <div 
                className="w-full h-px mb-8"
                style={{ 
                  background: 'linear-gradient(to right, transparent, #015023, transparent)',
                  opacity: 0.3
                }}
              />
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  type="submit"
                  variant="default"
                  disabled={isLoading}
                  className="flex-1 sm:flex-none sm:min-w-[200px]"
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Simpan Data
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="warning"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="flex-1 sm:flex-none sm:min-w-[200px]"
                >
                  <X className="w-5 h-5 mr-2" />
                  Batal
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div 
          className="mt-8 p-6 border-2 shadow-md"
          style={{
            borderColor: '#DABC4E',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #FFFEF7 0%, #FFF9E6 100%)'
          }}
        >
          <div className="flex items-start gap-4">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: '#DABC4E',
                color: '#015023'
              }}
            >
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 
                className="font-bold text-lg mb-2"
                style={{ 
                  fontFamily: 'Urbanist, sans-serif',
                  color: '#015023'
                }}
              >
                Catatan Penting
              </h3>
              <p 
                className="text-sm leading-relaxed"
                style={{ 
                  fontFamily: 'Urbanist, sans-serif',
                  color: '#015023'
                }}
              >
                Pastikan semua data yang diisi sudah benar sebelum menyimpan. 
                Data yang tersimpan akan langsung tersedia di sistem dan dapat digunakan untuk login.
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Cancel Confirmation Dialog */}
      <AlertConfirmationRedDialog 
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title="Konfirmasi Pembatalan"
        description="Apakah Anda yakin ingin membatalkan? Data yang diisi akan hilang."
        onConfirm={confirmCancel}
        confirmText="Ya, Batalkan"
        cancelText="Lanjutkan Mengisi"
      />
    </div>
  );
}
