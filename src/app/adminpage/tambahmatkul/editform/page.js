"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { getSubjectById, updateSubject } from "@/lib/adminApi";
import LoadingEffect from "@/components/ui/loading-effect";
import { ErrorMessageBox, SuccessMessageBoxWithButton, ErrorMessageBoxWithButton } from "@/components/ui/message-box";
import { AlertConfirmationRedDialog } from "@/components/ui/alert-dialog";

function EditMatkulForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const matkulId = searchParams.get('id');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [errors, setErrors] = useState({});
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [success, setSuccess] = useState(null);
  const [countdown, setCountdown] = useState(5);
  
  const [formData, setFormData] = useState({
    name_subject: "",
    code_subject: "",
    sks: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name_subject.trim()) {
      newErrors.name_subject = "Nama mata kuliah harus diisi";
    } else if (formData.name_subject.length < 3) {
      newErrors.name_subject = "Nama mata kuliah minimal 3 karakter";
    }
    
    if (!formData.code_subject.trim()) {
      newErrors.code_subject = "Kode mata kuliah harus diisi";
    } else if (formData.code_subject.length < 2) {
      newErrors.code_subject = "Kode mata kuliah minimal 2 karakter";
    }
    
    if (!formData.sks) {
      newErrors.sks = "SKS harus diisi";
    } else if (parseInt(formData.sks) < 1 || parseInt(formData.sks) > 6) {
      newErrors.sks = "SKS harus antara 1-6";
    }
    
    setErrors(prev => ({...prev, ...newErrors}));
    return Object.keys(newErrors).length === 0;
  };

  const fetchMatkulData = async () => {
    setIsFetching(true);
    try {
      // Call API untuk GET detail matkul
      const response = await getSubjectById(matkulId);
      
      if (response.status === 'success') {
        // Mengambil data dari database dan set ke form
        setFormData({
          name_subject: response.data.name_subject,
          code_subject: response.data.code_subject,
          sks: response.data.sks.toString()
        });
      } else {
        setErrors(pref => ({ ...pref, fetch: response.message || 'Gagal memuat data mata kuliah' }));
      }

    } catch (error) {
      setErrors(pref => ({ ...pref, fetch: "Error fetching subjects: " + (error.message || 'Gagal memuat data mata kuliah') }));
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchMatkulData();
  }, []);

  // Auto-redirect 5s setelah berhasil update
  useEffect(() => {
    if (!success) return;
    setCountdown(5);
    const intervalId = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          router.push('/adminpage/tambahmatkul');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalId);
  }, [success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    const newErrors = {};
    try {
      // Call API untuk UPDATE
      const response = await updateSubject(matkulId, {
        name_subject: formData.name_subject.trim(),
        code_subject: formData.code_subject.trim().toUpperCase(),
        sks: parseInt(formData.sks)
      });
      
      if (response.status === 'success') {
        setSuccess('Mata kuliah berhasil diperbarui');
      } else if (response.status === 'failed') { 
        newErrors.form = response.errors || 'Gagal mengupdate data';
      } else {
        newErrors.form = response.message || 'Gagal mengupdate data';
      }
      
    } catch (error) {
      newErrors.form = 'Gagal mengupdate data: ' + (error.message || 'Terjadi kesalahan'); 
    } finally {
      setIsLoading(false);
      setErrors(prev => ({...prev, ...newErrors}));
    }
  };

  const handleCancel = () => {
    setShowCancelDialog(true);
  };
  const confirmCancel = () => {
    router.push("/adminpage/tambahmatkul");
  };

  const handleFinish = () => {
    router.push("/adminpage/tambahmatkul");
  };

  if (isFetching) {
    return (
      <LoadingEffect/>
    );
  } else if (errors.fetch) {
    return (
      <div className="min-h-screen bg-brand-light-sage">
        <AdminNavbar title="Dashboard Admin - Edit Mata Kuliah" />
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <ErrorMessageBoxWithButton
            message={errors.fetch}
            action={fetchMatkulData}
            back={true}
            actionback={handleFinish}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light-sage">
      <AdminNavbar title="Dashboard Admin - Edit Mata Kuliah" />
      
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
                Edit Data Mata Kuliah
              </h1>
              <p 
                className="text-lg text-gray-600"
                style={{ fontFamily: 'Urbanist, sans-serif' }}
              >
                Perbarui informasi mata kuliah di bawah ini
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
              Informasi Mata Kuliah
            </h2>
            <div 
              className="w-20 h-1 rounded-full"
              style={{ backgroundColor: '#DABC4E' }}
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Name Subject Field */}
            <Field>
              <FieldLabel htmlFor="name_subject">
                Nama Mata Kuliah <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldDescription>
                Masukkan nama lengkap mata kuliah
              </FieldDescription>
              <FieldContent>
                <div className="relative">
                  <input
                    type="text"
                    id="name_subject"
                    name="name_subject"
                    value={formData.name_subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 border-2 focus:outline-none focus:border-opacity-100"
                    style={{
                      fontFamily: 'Urbanist, sans-serif',
                      borderColor: errors.name_subject ? '#BE0414' : '#015023',
                      borderRadius: '12px',
                      opacity: errors.name_subject ? 1 : 0.7
                    }}
                    placeholder="Contoh: Algoritma dan Pemrograman"
                    disabled={isLoading}
                  />
                  {formData.name_subject && !errors.name_subject && formData.name_subject.length >= 3 && (
                    <div 
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: '#16874B' }}
                    >
                      ✓
                    </div>
                  )}
                </div>
              </FieldContent>
              {errors.name_subject && (
                <FieldError>{errors.name_subject}</FieldError>
              )}
            </Field>

            {/* Code Subject Field */}
            <Field>
              <FieldLabel htmlFor="code_subject">
                Kode Mata Kuliah <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldDescription>
                Kode unik untuk mata kuliah ini (huruf besar)
              </FieldDescription>
              <FieldContent>
                <div className="relative">
                  <input
                    type="text"
                    id="code_subject"
                    name="code_subject"
                    value={formData.code_subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 border-2 focus:outline-none focus:border-opacity-100 uppercase"
                    style={{
                      fontFamily: 'Urbanist, sans-serif',
                      borderColor: errors.code_subject ? '#BE0414' : '#015023',
                      borderRadius: '12px',
                      opacity: errors.code_subject ? 1 : 0.7
                    }}
                    placeholder="Contoh: CS101"
                    disabled={isLoading}
                  />
                  {formData.code_subject && !errors.code_subject && formData.code_subject.length >= 2 && (
                    <div 
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: '#16874B' }}
                    >
                      ✓
                    </div>
                  )}
                </div>
              </FieldContent>
              {errors.code_subject && (
                <FieldError>{errors.code_subject}</FieldError>
              )}
            </Field>

            {/* SKS Field */}
            <Field>
              <FieldLabel htmlFor="sks">
                Jumlah SKS <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldDescription>
                Pilih jumlah SKS mata kuliah (1-6)
              </FieldDescription>
              <FieldContent>
                <div className="relative">
                  <select
                    id="sks"
                    name="sks"
                    value={formData.sks}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 border-2 focus:outline-none focus:border-opacity-100 appearance-none cursor-pointer"
                    style={{
                      fontFamily: 'Urbanist, sans-serif',
                      borderColor: errors.sks ? '#BE0414' : '#015023',
                      borderRadius: '12px',
                      opacity: errors.sks ? 1 : 0.7,
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23015023' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      backgroundSize: '1.5rem'
                    }}
                    disabled={isLoading}
                  >
                    <option value="">Pilih SKS</option>
                    <option value="1">1 SKS</option>
                    <option value="2">2 SKS</option>
                    <option value="3">3 SKS</option>
                    <option value="4">4 SKS</option>
                    <option value="5">5 SKS</option>
                    <option value="6">6 SKS</option>
                  </select>
                  {formData.sks && !errors.sks && (
                    <div 
                      className="absolute right-12 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: '#16874B' }}
                    >
                      ✓
                    </div>
                  )}
                </div>
              </FieldContent>
              {errors.sks && (
                <FieldError>{errors.sks}</FieldError>
              )}
            </Field>

            {/* Form Error */}
            {errors.form && (
              <ErrorMessageBox message={errors.form} />
            )}

            {/* Success Message*/}
            {success && (
              <SuccessMessageBoxWithButton
                message={`${success}\nAkan dialihkan ke halaman data mata kuliah dalam ${countdown} detik.`}
                action={handleFinish}
                btntext={countdown > 0 ? `Lihat Data (${countdown})` : 'Lihat Data'}
              />
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
                      Update Data
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
                Pastikan semua perubahan data sudah benar sebelum menyimpan. 
                Perubahan kode mata kuliah dapat mempengaruhi data terkait lainnya.
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Cancel Confirmation Dialog */}
      <AlertConfirmationRedDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={confirmCancel}
        title="Konfirmasi Pembatalan"
        description="Apakah Anda yakin ingin membatalkan? Perubahan tidak akan disimpan."
        confirmText="Ya, Batalkan"
        cancelText="Lanjutkan Mengisi"
      />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingEffect message="Memuat data mata kuliah..." />}>
      <EditMatkulForm />
    </Suspense>
  );
}
