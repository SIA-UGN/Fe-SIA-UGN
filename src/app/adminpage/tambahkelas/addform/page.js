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
import { getSubjects, getAcademicPeriods, storeClass } from "@/lib/adminApi";
import LoadingEffect from "@/components/ui/loading-effect";
import { ErrorMessageBox, ErrorMessageBoxWithButton, SuccessMessageBoxWithButton } from "@/components/ui/message-box";
import { AlertConfirmationRedDialog } from "@/components/ui/alert-dialog";

export default function AddKelasForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isFetching, setIsFetching] = useState(true);
  const [success, setSuccess] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [academic_period, setAcademicPeriod] = useState([]);

  
  const [formData, setFormData] = useState({
    kode_kelas: "",
    hari: "",
    maks_mahasiswa: "",
    mata_kuliah_id: "",
    jam_mulai: "",
    jam_selesai: "",
    academic_period: "",
    is_active: true
  });

  const hariOptions = [
    {key: 1, label: "Senin"},
    {key: 2, label: "Selasa"},
    {key: 3, label: "Rabu"},
    {key: 4, label: "Kamis"},
    {key: 5, label: "Jumat"},
    {key: 6, label: "Sabtu"},
    {key: 7, label: "Minggu"}
  ];

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
        kode_kelas: "",
        hari: "",
        maks_mahasiswa: "",
        mata_kuliah_id: "",
        jam_mulai: "",
        jam_selesai: "",
        id_academic_year: "",
        is_active: true
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.kode_kelas.trim()) {
      newErrors.kode_kelas = "Kode kelas harus diisi";
    } else if (formData.kode_kelas.length < 2) {
      newErrors.kode_kelas = "Kode kelas minimal 2 karakter";
    }
    
    if (!formData.hari) {
      newErrors.hari = "Hari harus dipilih";
    }
    
    if (!formData.maks_mahasiswa) {
      newErrors.maks_mahasiswa = "Maksimal mahasiswa harus diisi";
    } else if (parseInt(formData.maks_mahasiswa) < 1 || parseInt(formData.maks_mahasiswa) > 100) {
      newErrors.maks_mahasiswa = "Maksimal mahasiswa harus antara 1-100";
    }
    
    if (!formData.mata_kuliah_id) {
      newErrors.mata_kuliah_id = "Mata kuliah harus dipilih";
    }

    if (!formData.academic_period) {
      newErrors.academic_period = "Tahun akademik harus dipilih";
    }

    if (!formData.jam_mulai) {
      newErrors.jam_mulai = "Jam mulai harus diisi";
    }
    
    if (!formData.jam_selesai) {
      newErrors.jam_selesai = "Jam selesai harus diisi";
    }
    
    // Validasi jam selesai harus lebih besar dari jam mulai
    if (formData.jam_mulai && formData.jam_selesai) {
      if (formData.jam_selesai <= formData.jam_mulai) {
        newErrors.jam_selesai = "Jam selesai harus lebih besar dari jam mulai";
      }
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const fetchSubjects = async () => {
    setIsFetching(true);
    try {
      const response = await getSubjects();
      if (response.status === 'success') {
        setSubjects(response.data);
      } else {
        setErrors(prev => ({ ...prev, fetch: response.message || 'Gagal memuat mata kuliah' }));
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, fetch: error.message || 'Gagal memuat mata kuliah' }));
    } finally {
      setIsFetching(false);
    }
  };

  const fetchAcademicPeriods = async () => {
    try {
      const response = await getAcademicPeriods();
      if (response.status === 'success') {
        setAcademicPeriod(response.data);
      } else {
        setErrors(prev => ({ ...prev, fetch: response.message || 'Gagal memuat tahun akademik' }));
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, fetch: error.message || 'Gagal memuat tahun akademik' }));
    } finally {
      setIsFetching(false);
    }
  };

  const fetchAll = async () => {
    setErrors(prev => ({...prev, fetch: null}));
    await Promise.all([
      fetchSubjects(),
      fetchAcademicPeriods()
    ]);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleFinish = () => {
    router.push("/adminpage/tambahkelas");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    const newErrors = {};
    try {
      const response = await storeClass({
        id_subject: formData.mata_kuliah_id,
        id_academic_period: formData.academic_period,
        code_class: formData.kode_kelas,
        member_class: parseInt(formData.maks_mahasiswa),
        day_of_week: parseInt(formData.hari),
        start_time: formData.jam_mulai.slice(0,5),
        end_time: formData.jam_selesai.slice(0,5),
        is_active: formData.is_active
      });
      if (response.status === 'success') {
        setSuccess('Kelas berhasil ditambahkan');
      } else if (response.status === 'failed') {
        newErrors.form = response.message || 'Gagal menambahkan kelas';
      } else {
        newErrors.form = 'Terjadi kesalahan tak terduga';
      }
    } catch (error) {
      newErrors.form = 'Gagal menambahkan kelas: ' + (error.message || 'Unknown error');
    } finally {
      setErrors(prev => ({...prev, ...newErrors}));
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setShowCancelDialog(true);
  };

  const confirmCancel = () => {
    router.push("/adminpage/tambahkelas");
  };

  if (isFetching) {
    return (
      <LoadingEffect />
    );
  } else if (errors.fetch) {
    return (
      <div className="min-h-screen bg-brand-light-sage">
        <AdminNavbar title="Dashboard Admin - Edit Akun Manager" />
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <ErrorMessageBoxWithButton
            message={errors.fetch}
            action={fetchAll}
            back={true}
            actionback={handleFinish}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light-sage">
      <AdminNavbar title="Dashboard Admin - Tambah Kelas" />
      
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
                Tambah Data Kelas
              </h1>
              <p 
                className="text-lg text-gray-600"
                style={{ fontFamily: 'Urbanist, sans-serif' }}
              >
                Isi form di bawah ini untuk menambahkan kelas baru
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
              Informasi Kelas
            </h2>
            <div 
              className="w-20 h-1 rounded-full"
              style={{ backgroundColor: '#DABC4E' }}
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Kode Kelas Field */}
            <Field>
              <FieldLabel htmlFor="kode_kelas">
                Kode Kelas <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldDescription>
                Kode unik untuk identifikasi kelas (minimal 2 karakter)
              </FieldDescription>
              <FieldContent>
                <div className="relative">
                  <input
                    type="text"
                    id="kode_kelas"
                    name="kode_kelas"
                    value={formData.kode_kelas}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 border-2 focus:outline-none focus:border-opacity-100 uppercase"
                    style={{
                      fontFamily: 'Urbanist, sans-serif',
                      borderColor: errors.kode_kelas ? '#BE0414' : '#015023',
                      borderRadius: '12px',
                      opacity: errors.kode_kelas ? 1 : 0.7
                    }}
                    placeholder="Contoh: A1, B2, CS101-A"
                    disabled={isLoading}
                  />
                  {formData.kode_kelas && !errors.kode_kelas && (
                    <div 
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: '#16874B' }}
                    >
                      ✓
                    </div>
                  )}
                </div>
              </FieldContent>
              {errors.kode_kelas && (
                <FieldError>{errors.kode_kelas}</FieldError>
              )}
            </Field>

            {/* Mata Kuliah Field */}
            <Field>
              <FieldLabel htmlFor="mata_kuliah_id">
                Mata Kuliah <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldDescription>
                Pilih mata kuliah yang akan diajarkan
              </FieldDescription>
              <FieldContent>
                <div className="relative">
                  <select
                    id="mata_kuliah_id"
                    name="mata_kuliah_id"
                    value={formData.mata_kuliah_id}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 border-2 focus:outline-none focus:border-opacity-100 appearance-none cursor-pointer"
                    style={{
                      fontFamily: 'Urbanist, sans-serif',
                      borderColor: errors.mata_kuliah_id ? '#BE0414' : '#015023',
                      borderRadius: '12px',
                      opacity: errors.mata_kuliah_id ? 1 : 0.7,
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23015023' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      backgroundSize: '1.5rem'
                    }}
                    disabled={isLoading}
                  >
                    <option value="" disabled>Pilih Mata Kuliah</option>
                    {subjects.map(matkul => (
                      <option key={matkul.id_subject} value={matkul.id_subject}>
                        {matkul.code_subject} - {matkul.name_subject}
                      </option>
                    ))}
                  </select>
                  {formData.mata_kuliah_id && !errors.mata_kuliah_id && (
                    <div 
                      className="absolute right-12 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: '#16874B' }}
                    >
                      ✓
                    </div>
                  )}
                </div>
              </FieldContent>
              {errors.mata_kuliah_id && (
                <FieldError>{errors.mata_kuliah_id}</FieldError>
              )}
            </Field>

            {/* Tahun ajaran Field */}
            <Field>
              <FieldLabel htmlFor="tahun_ajaran">
                Tahun Ajaran <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldDescription>
                Pilih tahun ajaran yang akan digunakan
              </FieldDescription>
              <FieldContent>
                <div className="relative">
                  <select
                    id="academic_period"
                    name="academic_period"
                    value={formData.academic_period}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 border-2 focus:outline-none focus:border-opacity-100 appearance-none cursor-pointer"
                    style={{
                      fontFamily: 'Urbanist, sans-serif',
                      borderColor: errors.academic_period ? '#BE0414' : '#015023',
                      borderRadius: '12px',
                      opacity: errors.academic_period ? 1 : 0.7,
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23015023' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      backgroundSize: '1.5rem'
                    }}
                    disabled={isLoading}
                  >
                    <option value="" disabled>Pilih Tahun Ajaran</option>
                    {academic_period.map(year => (
                      <option key={year.id_academic_period} value={year.id_academic_period}>
                        {year.name}
                      </option>
                    ))}
                  </select>
                  {formData.academic_period && !errors.academic_period && (
                    <div 
                      className="absolute right-12 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: '#16874B' }}
                    >
                      ✓
                    </div>
                  )}
                </div>
              </FieldContent>
              {errors.mata_kuliah_id && (
                <FieldError>{errors.mata_kuliah_id}</FieldError>
              )}
            </Field>

            {/* Maksimal Mahasiswa Field */}
            <Field>
              <FieldLabel htmlFor="maks_mahasiswa">
                Maksimal Mahasiswa <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldDescription>
                Kapasitas maksimal kelas
              </FieldDescription>
              <FieldContent>
                <div className="relative">
                  <input
                    type="number"
                    id="maks_mahasiswa"
                    name="maks_mahasiswa"
                    value={formData.maks_mahasiswa}
                    onChange={handleChange}
                    min="1"
                    max="100"
                    className="w-full px-4 py-3.5 border-2 focus:outline-none focus:border-opacity-100"
                    style={{
                      fontFamily: 'Urbanist, sans-serif',
                      borderColor: errors.maks_mahasiswa ? '#BE0414' : '#015023',
                      borderRadius: '12px',
                      opacity: errors.maks_mahasiswa ? 1 : 0.7
                    }}
                    placeholder="Contoh: 40"
                    disabled={isLoading}
                  />
                  {formData.maks_mahasiswa && !errors.maks_mahasiswa && parseInt(formData.maks_mahasiswa) >= 1 && (
                    <div 
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: '#16874B' }}
                    >
                      ✓
                    </div>
                  )}
                </div>
              </FieldContent>
              {errors.maks_mahasiswa && (
                <FieldError>{errors.maks_mahasiswa}</FieldError>
              )}
            </Field>

            {/* Jadwal Section */}
            <div className="space-y-6">
              <div>
                <h3 
                  className="text-lg font-bold mb-4"
                  style={{ 
                    fontFamily: 'Urbanist, sans-serif',
                    color: '#015023'
                  }}
                >
                  Jadwal Kelas
                </h3>
                <div 
                  className="w-20 h-0.5 rounded-full mb-6"
                  style={{ backgroundColor: '#DABC4E' }}
                />
              </div>

              {/* Hari Field */}
              <Field>
                <FieldLabel htmlFor="hari">
                  Hari <span className="text-red-500">*</span>
                </FieldLabel>
                <FieldDescription>
                  Pilih hari pelaksanaan kelas
                </FieldDescription>
                <FieldContent>
                  <div className="relative">
                    <select
                      id="hari"
                      name="hari"
                      value={formData.hari}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 border-2 focus:outline-none focus:border-opacity-100 appearance-none cursor-pointer"
                      style={{
                        fontFamily: 'Urbanist, sans-serif',
                        borderColor: errors.hari ? '#BE0414' : '#015023',
                        borderRadius: '12px',
                        opacity: errors.hari ? 1 : 0.7,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23015023' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 1rem center',
                        backgroundSize: '1.5rem'
                      }}
                      disabled={isLoading}
                    >
                      <option value="" disabled>Pilih Hari</option>
                      {hariOptions.map((hari) => (
                        <option key={hari.key} value={hari.key}>
                          {hari.label}
                        </option>
                      ))}
                    </select>
                    {formData.hari && !errors.hari && (
                      <div 
                        className="absolute right-12 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: '#16874B' }}
                      >
                        ✓
                      </div>
                    )}
                  </div>
                </FieldContent>
                {errors.hari && (
                  <FieldError>{errors.hari}</FieldError>
                )}
              </Field>

              {/* Jam Mulai & Jam Selesai */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Jam Mulai Field */}
                <Field>
                  <FieldLabel htmlFor="jam_mulai">
                    Jam Mulai <span className="text-red-500">*</span>
                  </FieldLabel>
                  <FieldDescription>
                    Waktu mulai kelas
                  </FieldDescription>
                  <FieldContent>
                    <div className="relative">
                      <input
                        type="time"
                        id="jam_mulai"
                        name="jam_mulai"
                        value={formData.jam_mulai}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 border-2 focus:outline-none focus:border-opacity-100"
                        style={{
                          fontFamily: 'Urbanist, sans-serif',
                          borderColor: errors.jam_mulai ? '#BE0414' : '#015023',
                          borderRadius: '12px',
                          opacity: errors.jam_mulai ? 1 : 0.7
                        }}
                        disabled={isLoading}
                      />
                      {formData.jam_mulai && !errors.jam_mulai && (
                        <div 
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: '#16874B' }}
                        >
                          ✓
                        </div>
                      )}
                    </div>
                  </FieldContent>
                  {errors.jam_mulai && (
                    <FieldError>{errors.jam_mulai}</FieldError>
                  )}
                </Field>

                {/* Jam Selesai Field */}
                <Field>
                  <FieldLabel htmlFor="jam_selesai">
                    Jam Selesai <span className="text-red-500">*</span>
                  </FieldLabel>
                  <FieldDescription>
                    Waktu selesai kelas
                  </FieldDescription>
                  <FieldContent>
                    <div className="relative">
                      <input
                        type="time"
                        id="jam_selesai"
                        name="jam_selesai"
                        value={formData.jam_selesai}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 border-2 focus:outline-none focus:border-opacity-100"
                        style={{
                          fontFamily: 'Urbanist, sans-serif',
                          borderColor: errors.jam_selesai ? '#BE0414' : '#015023',
                          borderRadius: '12px',
                          opacity: errors.jam_selesai ? 1 : 0.7
                        }}
                        disabled={isLoading}
                      />
                      {formData.jam_selesai && !errors.jam_selesai && formData.jam_selesai > formData.jam_mulai && (
                        <div 
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: '#16874B' }}
                        >
                          ✓
                        </div>
                      )}
                    </div>
                  </FieldContent>
                  {errors.jam_selesai && (
                    <FieldError>{errors.jam_selesai}</FieldError>
                  )}
                </Field>
              </div>
            </div>

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
                    Centang jika kelas ini aktif dan dapat digunakan
                  </FieldDescription>
                </div>
                {formData.is_active && (
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

            {/* Error Message */}
            {errors.form && (
              <ErrorMessageBox message={errors.form} />
            )}

            {/* Success Message */}
            {success && (
              <SuccessMessageBoxWithButton message={success + ' Lihat data atau tambahkan kelas lain'} action={handleFinish} btntext={'Lihat Data'} />
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
                Petunjuk Pengisian
              </h3>
              <ul 
                className="text-sm leading-relaxed space-y-1"
                style={{ 
                  fontFamily: 'Urbanist, sans-serif',
                  color: '#015023'
                }}
              >
                <li>• Kode kelas harus unik (minimal 2 karakter)</li>
                <li>• Pilih mata kuliah yang sesuai untuk kelas ini</li>
                <li>• Maksimal mahasiswa biasanya 25-40 orang per kelas</li>
                <li>• Pastikan hari dan jam sesuai dengan jadwal akademik</li>
                <li>• Jam selesai harus lebih besar dari jam mulai</li>
                <li>• Jadwal pertemuan dapat dibuat setelah kelas ditambahkan</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* Cancel Confirmation Dialog */}
      <AlertConfirmationRedDialog 
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title="Batalkan Penambahan Kelas"
        description="Apakah Anda yakin ingin membatalkan penambahan kelas? Semua data akan hilang."
        onConfirm={confirmCancel}
        confirmText="Ya, Batalkan"
        cancelText="Lanjutkan Mengisi"
      />
    </div>
  );
}
