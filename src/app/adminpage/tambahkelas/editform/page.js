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
import LoadingEffect from "@/components/ui/loading-effect";

function EditKelasForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const kelasId = searchParams.get('id');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    kode_kelas: "",
    jumlah_mahasiswa: "0",
    maks_mahasiswa: "",
    hari: "",
    jam_mulai: "",
    jam_selesai: "",
    tanggal: "",
    is_active: true
  });

  const hariOptions = [
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu"
  ];

  // Fetch data kelas saat component mount
  useEffect(() => {
    if (kelasId) {
      fetchKelasData();
    }
  }, [kelasId]);

  const fetchKelasData = async () => {
    try {
      setIsFetching(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/kelas/${kelasId}`, {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   }
      // });
      // const data = await response.json();
      
      // Dummy data untuk demo
      const dummyData = {
        kode_kelas: "A-CS101",
        jumlah_mahasiswa: "35",
        maks_mahasiswa: "40",
        jadwal: "Kamis, 09.00 - 11.00",
        tanggal: "2024-11-07",
        is_active: true
      };
      
      // Parse jadwal (format: "Hari, Jam - Jam")
      const jadwalParts = dummyData.jadwal.split(', ');
      const timeParts = jadwalParts[1].split(' - ');
      
      setFormData({
        kode_kelas: dummyData.kode_kelas,
        jumlah_mahasiswa: dummyData.jumlah_mahasiswa,
        maks_mahasiswa: dummyData.maks_mahasiswa,
        hari: jadwalParts[0],
        jam_mulai: timeParts[0],
        jam_selesai: timeParts[1],
        tanggal: dummyData.tanggal,
        is_active: dummyData.is_active
      });
    } catch (error) {
      alert("Gagal mengambil data kelas: " + error.message);
      router.push("/adminpage/tambahkelas");
    } finally {
      setIsFetching(false);
    }
  };

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
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.kode_kelas.trim()) {
      newErrors.kode_kelas = "Kode kelas harus diisi";
    } else if (formData.kode_kelas.length < 2) {
      newErrors.kode_kelas = "Kode kelas minimal 2 karakter";
    }
    
    if (!formData.jumlah_mahasiswa) {
      newErrors.jumlah_mahasiswa = "Jumlah mahasiswa harus diisi";
    } else if (parseInt(formData.jumlah_mahasiswa) < 0) {
      newErrors.jumlah_mahasiswa = "Jumlah mahasiswa tidak boleh negatif";
    }
    
    if (!formData.maks_mahasiswa) {
      newErrors.maks_mahasiswa = "Maksimal mahasiswa harus diisi";
    } else if (parseInt(formData.maks_mahasiswa) < 1 || parseInt(formData.maks_mahasiswa) > 100) {
      newErrors.maks_mahasiswa = "Maksimal mahasiswa harus antara 1-100";
    }
    
    // Validasi jumlah mahasiswa tidak boleh lebih dari maksimal
    if (formData.jumlah_mahasiswa && formData.maks_mahasiswa) {
      if (parseInt(formData.jumlah_mahasiswa) > parseInt(formData.maks_mahasiswa)) {
        newErrors.jumlah_mahasiswa = "Jumlah mahasiswa tidak boleh melebihi maksimal";
      }
    }
    
    if (!formData.hari) {
      newErrors.hari = "Hari harus dipilih";
    }
    
    if (!formData.jam_mulai) {
      newErrors.jam_mulai = "Jam mulai harus diisi";
    }
    
    if (!formData.jam_selesai) {
      newErrors.jam_selesai = "Jam selesai harus diisi";
    }
    
    if (!formData.tanggal) {
      newErrors.tanggal = "Tanggal harus diisi";
    }
    
    // Validasi jam selesai harus lebih besar dari jam mulai
    if (formData.jam_mulai && formData.jam_selesai) {
      if (formData.jam_selesai <= formData.jam_mulai) {
        newErrors.jam_selesai = "Jam selesai harus lebih besar dari jam mulai";
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
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Format jadwal
      const jadwal = `${formData.hari}, ${formData.jam_mulai} - ${formData.jam_selesai}`;
      
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/kelas/${kelasId}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify({
      //     kode_kelas: formData.kode_kelas.toUpperCase(),
      //     maks_mahasiswa: parseInt(formData.maks_mahasiswa),
      //     jadwal: jadwal,
      //     is_active: formData.is_active
      //   })
      // });
      
      // if (!response.ok) throw new Error('Gagal mengupdate data');
      
      alert("Data kelas berhasil diperbarui!");
      router.push("/adminpage/tambahkelas");
    } catch (error) {
      alert("Gagal mengupdate data: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm("Apakah Anda yakin ingin membatalkan? Perubahan tidak akan disimpan.")) {
      router.push("/adminpage/tambahkelas");
    }
  };

  if (isFetching) {
    return (
      <LoadingEffect/>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light-sage">
      <AdminNavbar title="Dashboard Admin - Edit Kelas" />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-10">
          <Button
            variant="ghost"
            onClick={() => router.push("/adminpage/tambahkelas")}
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
                Edit Data Kelas
              </h1>
              <p 
                className="text-lg text-gray-600"
                style={{ fontFamily: 'Urbanist, sans-serif' }}
              >
                Perbarui informasi kelas di bawah ini
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
                Masukkan kode unik untuk kelas ini (contoh: A-CS101)
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
                    placeholder="Contoh: A-CS101"
                    disabled={isLoading}
                  />
                  {formData.kode_kelas && !errors.kode_kelas && formData.kode_kelas.length >= 2 && (
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

            {/* Jumlah & Maks Mahasiswa Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Jumlah Mahasiswa Field */}
              <Field>
                <FieldLabel htmlFor="jumlah_mahasiswa">
                  Jumlah Mahasiswa Saat Ini <span className="text-red-500">*</span>
                </FieldLabel>
                <FieldDescription>
                  Jumlah mahasiswa yang sudah terdaftar
                </FieldDescription>
                <FieldContent>
                  <div className="relative">
                    <input
                      type="number"
                      id="jumlah_mahasiswa"
                      name="jumlah_mahasiswa"
                      value={formData.jumlah_mahasiswa}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      className="w-full px-4 py-3.5 border-2 focus:outline-none focus:border-opacity-100"
                      style={{
                        fontFamily: 'Urbanist, sans-serif',
                        borderColor: errors.jumlah_mahasiswa ? '#BE0414' : '#015023',
                        borderRadius: '12px',
                        opacity: errors.jumlah_mahasiswa ? 1 : 0.7
                      }}
                      placeholder="Contoh: 30"
                      disabled={isLoading}
                    />
                    {formData.jumlah_mahasiswa && !errors.jumlah_mahasiswa && parseInt(formData.jumlah_mahasiswa) >= 0 && (
                      <div 
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: '#16874B' }}
                      >
                        ✓
                      </div>
                    )}
                  </div>
                </FieldContent>
                {errors.jumlah_mahasiswa && (
                  <FieldError>{errors.jumlah_mahasiswa}</FieldError>
                )}
              </Field>

              {/* Maks Mahasiswa Field */}
              <Field>
                <FieldLabel htmlFor="maks_mahasiswa">
                  Maksimal Mahasiswa <span className="text-red-500">*</span>
                </FieldLabel>
                <FieldDescription>
                  Kapasitas maksimal kelas (1-100)
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
            </div>

            {/* Jadwal Section */}
            <div className="space-y-6">
              <div>
                <h3 
                  className="text-xl font-bold mb-4"
                  style={{ 
                    fontFamily: 'Urbanist, sans-serif',
                    color: '#015023'
                  }}
                >
                  Jadwal Kelas
                </h3>
                <div 
                  className="w-16 h-0.5 rounded-full mb-6"
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
                      <option value="">Pilih Hari</option>
                      {hariOptions.map(hari => (
                        <option key={hari} value={hari}>{hari}</option>
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

              {/* Tanggal Field */}
              <Field>
                <FieldLabel htmlFor="tanggal">
                  Tanggal Pelaksanaan <span className="text-red-500">*</span>
                </FieldLabel>
                <FieldDescription>
                  Tanggal pelaksanaan kelas pertama kali
                </FieldDescription>
                <FieldContent>
                  <div className="relative">
                    <input
                      type="date"
                      id="tanggal"
                      name="tanggal"
                      value={formData.tanggal}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 border-2 focus:outline-none focus:border-opacity-100"
                      style={{
                        fontFamily: 'Urbanist, sans-serif',
                        borderColor: errors.tanggal ? '#BE0414' : '#015023',
                        borderRadius: '12px',
                        opacity: errors.tanggal ? 1 : 0.7
                      }}
                      disabled={isLoading}
                    />
                    {formData.tanggal && !errors.tanggal && (
                      <div 
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: '#16874B' }}
                      >
                        ✓
                      </div>
                    )}
                  </div>
                </FieldContent>
                {errors.tanggal && (
                  <FieldError>{errors.tanggal}</FieldError>
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
                Perubahan jadwal dapat mempengaruhi mahasiswa yang sudah terdaftar di kelas ini.
              </p>
            </div>
          </div>
        </div>
      </div>
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
