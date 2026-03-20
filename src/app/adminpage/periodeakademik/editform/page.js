'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Field, 
  FieldLabel, 
  FieldDescription, 
  FieldError, 
  FieldContent 
} from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import AdminNavbar from '@/components/ui/admin-navbar';
import { ArrowLeft, Save, X, Info } from 'lucide-react';
import { ErrorMessageBox, ErrorMessageBoxWithButton, SuccessMessageBoxWithButton } from '@/components/ui/message-box';
import LoadingEffect from '@/components/ui/loading-effect';
import { AlertConfirmationRedDialog } from '@/components/ui/alert-dialog';
import { getAcademicPeriodById, updateAcademicPeriod } from '@/lib/adminApi';

function EditPeriodeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const periodId = searchParams.get('id');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [loading, setLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    active: false,
    all_class: false,
  });

  const fetchPeriod = async () => {
    setLoading(true);
    try {
      const response = await getAcademicPeriodById(periodId);
      if (response.status === 'success') {
        setFormData({
          name: response.data.name,
          start_date: response.data.start_date,
          end_date: response.data.end_date,
          active: response.data.is_active,
          all_class: false,
        });
      } else {
        setErrors({ fetch: 'Periode tidak ditemukan' });
      }
    } catch (error) {
      setErrors({ fetch: 'Gagal mengambil data: ' + error.message });
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (periodId) {
      fetchPeriod();
    }
  }, [periodId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (!formData.active) {
      setFormData(prev => ({ ...prev, all_class: false }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    if (errors.form) {
      setErrors(prev => ({ ...prev, form: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nama periode harus diisi';
    } else if (formData.name.length < 5) {
      newErrors.name = 'Nama periode minimal 5 karakter';
    }
    
    if (!formData.start_date) {
      newErrors.start_date = 'Tanggal mulai harus diisi';
    }
    
    if (!formData.end_date) {
      newErrors.end_date = 'Tanggal selesai harus diisi';
    }
    
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      
      if (endDate <= startDate) {
        newErrors.end_date = 'Tanggal selesai harus lebih besar dari tanggal mulai';
      }
    }
    
    setErrors(prev => ({...prev, ...newErrors}));
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    const newErrors = {};
    try {
      const response = await updateAcademicPeriod(periodId, {
        name: formData.name,
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_active: formData.active,
        all_class: formData.all_class ?? null
      });
      if (response.status === 'success') {
        setSuccess('Periode akademik berhasil diperbarui');
        setCountdown(5);
      } else {
        newErrors.form = response.message || 'Unknown error';
      }
    } catch (error) {
      newErrors.form = 'Gagal memperbarui data: ' + (error.message || 'Unknown error');
    } finally {
      setIsLoading(false);
      setErrors(prev => ({...prev, ...newErrors}));
    }
  };

  // Countdown redirect effect ketika sukses
  useEffect(() => {
    let timer;
    if (success) {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      } else {
        handleFinish();
      }
    }
    return () => clearTimeout(timer);
  }, [success, countdown]);

  const handleCancel = () => {
    setShowCancelDialog(true);
  };

  const confirmCancel = () => {
    router.push('/adminpage/periodeakademik');
  }

  const handleFinish = () => {
    router.push('/adminpage/periodeakademik');
  };

  if (loading) {
    return (
      <LoadingEffect />
    );
  } else if (errors.fetch) {
    return (
      <div className="min-h-screen bg-brand-light-sage">
        <AdminNavbar title="Dashboard Admin - Edit Periode Akademik" />
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <ErrorMessageBoxWithButton
            message={errors.fetch}
            action={fetchPeriod}
            back={true}
            actionback={handleCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light-sage">
      <AdminNavbar title="Dashboard Admin - Edit Periode Akademik" />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
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
                  color: '#015023',
                  fontFamily: 'Urbanist, sans-serif'
                }}
              >
                Edit Periode Akademik
              </h1>
              <p 
                className="text-gray-600 text-lg"
                style={{ fontFamily: 'Urbanist, sans-serif' }}
              >
                Perbarui informasi periode akademik
              </p>
            </div>
          </div>
        </div>
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
              Informasi Periode Akademik
            </h2>
            <div 
              className="w-20 h-1 rounded-full"
              style={{ backgroundColor: '#DABC4E' }}
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <Field>
              <FieldLabel htmlFor="name">
                Nama Periode <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldDescription>
                Masukkan nama periode akademik (contoh: Semester Ganjil 2024/2025)
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
                    placeholder="Semester Ganjil 2024/2025"
                    disabled={isLoading}
                  />
                  {formData.name && !errors.name && formData.name.length >= 5 && (
                    <div 
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: '#16874B' }}
                    >
                      ✓
                    </div>
                  )}
                </div>
              </FieldContent>
              {errors.name && <FieldError>{errors.name}</FieldError>}
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field>
                <FieldLabel htmlFor="start_date">
                  Tanggal Mulai <span className="text-red-500">*</span>
                </FieldLabel>
                <FieldDescription>
                  Pilih tanggal mulai periode
                </FieldDescription>
                <FieldContent>
                  <div className="relative">
                    <input
                      type="date"
                      id="start_date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 border-2 focus:outline-none focus:border-opacity-100"
                      style={{
                        fontFamily: 'Urbanist, sans-serif',
                        borderColor: errors.start_date ? '#BE0414' : '#015023',
                        borderRadius: '12px',
                        opacity: errors.start_date ? 1 : 0.7
                      }}
                      disabled={isLoading}
                    />
                    {formData.start_date && !errors.start_date && (
                      <div 
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: '#16874B' }}
                      >
                        ✓
                      </div>
                    )}
                  </div>
                </FieldContent>
                {errors.start_date && <FieldError>{errors.start_date}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="end_date">
                  Tanggal Selesai <span className="text-red-500">*</span>
                </FieldLabel>
                <FieldDescription>
                  Pilih tanggal selesai periode
                </FieldDescription>
                <FieldContent>
                  <div className="relative">
                    <input
                      type="date"
                      id="end_date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 border-2 focus:outline-none focus:border-opacity-100"
                      style={{
                        fontFamily: 'Urbanist, sans-serif',
                        borderColor: errors.end_date ? '#BE0414' : '#015023',
                        borderRadius: '12px',
                        opacity: errors.end_date ? 1 : 0.7
                      }}
                      disabled={isLoading}
                    />
                    {formData.end_date && !errors.end_date && (
                      <div 
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: '#16874B' }}
                      >
                        ✓
                      </div>
                    )}
                  </div>
                </FieldContent>
                {errors.end_date && <FieldError>{errors.end_date}</FieldError>}
              </Field>
            </div>

            {/* Separator */}
            <div 
              className="w-full h-px my-8"
              style={{ 
                background: 'linear-gradient(to right, transparent, #DABC4E, transparent)'
              }}
            />

            <Field>
              <div 
                className="flex items-center gap-4 p-5 border-2 cursor-pointer"
                style={{
                  border: '2px solid #015023',
                  borderRadius: '12px',
                  backgroundColor: formData.active ? 'rgba(1, 80, 35, 0.05)' : 'transparent',
                  opacity: 0.7
                }}
              >
                <input
                  type="checkbox"
                  name="active"
                  id="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="w-6 h-6 cursor-pointer accent-[#015023]"
                  style={{
                    borderRadius: '6px'
                  }}
                  disabled={isLoading}
                />
                <div className="flex-1">
                  <label 
                    htmlFor="active"
                    className="font-semibold cursor-pointer block"
                    style={{ 
                      color: '#015023',
                      fontFamily: 'Urbanist, sans-serif'
                    }}
                  >
                    Aktifkan periode ini
                  </label>
                  <p 
                    className="text-sm mt-1"
                    style={{ 
                      color: '#015023',
                      opacity: 0.7,
                      fontFamily: 'Urbanist, sans-serif'
                    }}
                  >
                    Jika dicentang, periode ini akan menjadi periode aktif dan periode lain akan dinonaktifkan
                  </p>
                </div>
                {formData.active && (
                  <div 
                    className="px-3 py-1 rounded text-xs font-semibold"
                    style={{
                      backgroundColor: '#16874B',
                      color: '#FFFFFF',
                      borderRadius: '12px'
                    }}
                  >
                    Active
                  </div>
                )}
              </div>
            </Field>
            {/* Aktifkan semua kelas */}
            {formData.active && (
              <Field>
                <div 
                  className="flex items-center gap-4 p-5 border-2 cursor-pointer"
                  style={{
                    border: '2px solid #015023',
                    borderRadius: '12px',
                  backgroundColor: formData.all_class ? 'rgba(1, 80, 35, 0.05)' : 'transparent',
                  opacity: 0.7
                }}
              >
                <input
                  type="checkbox"
                  name="all_class"
                  id="all_class"
                  checked={formData.all_class}
                  onChange={handleChange}
                  className="w-6 h-6 cursor-pointer accent-[#015023]"
                  style={{
                    borderRadius: '6px'
                  }}
                  disabled={isLoading}
                />
                <div className="flex-1">
                  <label 
                    htmlFor="active"
                    className="font-semibold cursor-pointer block"
                    style={{ 
                      color: '#015023',
                      fontFamily: 'Urbanist, sans-serif'
                    }}
                  >
                    Aktifkan semua kelas di periode ini
                  </label>
                  <p 
                    className="text-sm mt-1"
                    style={{ 
                      color: '#015023',
                      opacity: 0.7,
                      fontFamily: 'Urbanist, sans-serif'
                    }}
                  >
                    Jika dicentang, semua kelas di periode ini akan diaktifkan
                  </p>
                </div>
                {formData.all_class && (
                  <div 
                    className="px-3 py-1 rounded text-xs font-semibold"
                    style={{
                      backgroundColor: '#16874B',
                      color: '#FFFFFF',
                      borderRadius: '12px'
                    }}
                  >
                    Active
                  </div>
                )}
              </div>
            </Field> 
            )}

            {errors.form && (
              <ErrorMessageBox message={errors.form} />
            )}

            {success && (
              <SuccessMessageBoxWithButton
                message={success + `\nAkan dialihkan ke halaman data periode akademik dalam ${countdown} detik.`}
                action={handleFinish}
                btntext={countdown > 0 ? `Kembali ke Daftar (${countdown})` : 'Kembali ke Daftar'}
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
                      Simpan Perubahan
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
                Informasi Penting
              </h3>
              <p 
                className="text-sm leading-relaxed"
                style={{ 
                  fontFamily: 'Urbanist, sans-serif',
                  color: '#015023'
                }}
              >
                Pastikan tanggal periode tidak tumpang tindih dengan periode lain. Hanya satu periode yang bisa aktif dalam satu waktu.
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

export default function Page() {
  return (
    <Suspense fallback={<LoadingEffect message="Memuat data periode akademik..." />}>
      <EditPeriodeForm />
    </Suspense>
  );
}
