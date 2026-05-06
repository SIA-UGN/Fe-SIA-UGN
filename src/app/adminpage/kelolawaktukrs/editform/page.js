'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, X, Info } from 'lucide-react';
import AdminNavbar from '@/components/ui/admin-navbar';
import Footer from '@/components/ui/footer';
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldContent,
} from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { ErrorMessageBox, SuccessMessageBoxWithButton } from '@/components/ui/message-box';
import { AlertConfirmationRedDialog } from '@/components/ui/alert-dialog';

// TODO: replace with real API
async function fetchKrsSessionById(id) {
  const mock = {
    1: { id: 1, name: 'Semester Ganjil 2024/2025', start_date: '2025-01-01', end_date: '2025-01-16', status: 'selesai' },
    2: { id: 2, name: 'Semester Genap 2024/2025',  start_date: '2025-01-01', end_date: '2025-01-16', status: 'aktif' },
    3: { id: 3, name: 'Semester Ganjil 2025/2026', start_date: '2025-01-01', end_date: '2025-01-16', status: 'nonaktif' },
    4: { id: 4, name: 'Semester Genap 2025/2026',  start_date: '2025-01-01', end_date: '2025-01-16', status: 'nonaktif' },
  };
  return { status: 'success', data: mock[id] ?? null };
}

async function updateKrsSession(id, data) {
  return { status: 'success' };
}

const STATUS_OPTIONS = [
  { value: 'aktif',    label: 'Aktif' },
  { value: 'nonaktif', label: 'Nonaktif' },
  { value: 'selesai',  label: 'Selesai' },
];

export default function EditSesiKRS() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const id           = searchParams.get('id');

  const [isLoading,  setIsLoading]  = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [errors,     setErrors]     = useState({});
  const [success,    setSuccess]    = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const [formData, setFormData] = useState({
    name:       '',
    start_date: '',
    end_date:   '',
    status:     '',
  });

  // Load existing session
  useEffect(() => {
    if (!id) {
      setFetchError('ID sesi tidak ditemukan.');
      setIsFetching(false);
      return;
    }
    (async () => {
      try {
        const res = await fetchKrsSessionById(Number(id));
        if (res.status === 'success' && res.data) {
          const s = res.data;
          setFormData({
            name:       s.name       ?? '',
            start_date: s.start_date ?? '',
            end_date:   s.end_date   ?? '',
            status:     s.status     ?? '',
          });
        } else {
          setFetchError('Data sesi tidak ditemukan.');
        }
      } catch (e) {
        setFetchError('Gagal memuat data sesi: ' + e.message);
      } finally {
        setIsFetching(false);
      }
    })();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    if (errors.form)  setErrors(prev => ({ ...prev, form: null }));
    if (success) setSuccess(null);
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Nama sesi harus diisi';
    else if (formData.name.length < 5) errs.name = 'Nama sesi minimal 5 karakter';
    if (!formData.start_date) errs.start_date = 'Tanggal mulai harus diisi';
    if (!formData.end_date)   errs.end_date   = 'Tanggal selesai harus diisi';
    if (formData.start_date && formData.end_date) {
      if (new Date(formData.end_date) <= new Date(formData.start_date)) {
        errs.end_date = 'Tanggal selesai harus setelah tanggal mulai';
      }
    }
    if (!formData.status) errs.status = 'Status harus dipilih';
    setErrors(prev => ({ ...prev, ...errs }));
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const res = await updateKrsSession(id, formData);
      if (res.status === 'success') {
        setSuccess('Sesi KRS berhasil diperbarui.');
      } else {
        setErrors(prev => ({ ...prev, form: res.message || 'Gagal memperbarui data.' }));
      }
    } catch (err) {
      setErrors(prev => ({ ...prev, form: err.message }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: 'Urbanist, sans-serif' }}>
      <AdminNavbar title="Dashboard Manager - Edit Sesi KRS" />

      <main className="flex-1" style={{ backgroundColor: '#F1F5F0' }}>
        <div className="max-w-5xl mx-auto px-4 py-8">

          {/* Back */}
          <Button
            variant="ghost"
            onClick={() => router.push('/adminpage/kelolawaktukrs')}
            className="mb-6 -ml-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Kembali
          </Button>

          {/* Page title */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-2 h-16 rounded-full" style={{ backgroundColor: '#DABC4E' }} />
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#015023' }}>
                Edit Sesi KRS
              </h1>
              <p className="text-gray-500 text-base mt-1">
                Perbarui informasi sesi KRS
              </p>
            </div>
          </div>

          {/* Fetch error */}
          {fetchError && (
            <div
              className="mb-6 p-4 rounded-xl text-sm font-medium"
              style={{ backgroundColor: '#FEE2E2', color: '#BE0414', border: '1px solid #FCA5A5' }}
            >
              {fetchError}
            </div>
          )}

          {/* Loading skeleton */}
          {isFetching && !fetchError && (
            <div className="bg-white p-8 rounded-xl shadow-sm animate-pulse space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-12 bg-gray-100 rounded-xl" />
              ))}
            </div>
          )}

          {/* Form card */}
          {!isFetching && !fetchError && (
            <div
              className="bg-white p-8 md:p-10 shadow-lg"
              style={{ borderRadius: '12px', border: '2px solid #DABC4E' }}
            >
              <div className="mb-8">
                <h2 className="text-xl font-bold" style={{ color: '#015023' }}>
                  Informasi Sesi KRS
                </h2>
                <div className="w-20 h-1 rounded-full mt-2" style={{ backgroundColor: '#DABC4E' }} />
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">

                {/* Nama Sesi */}
                <Field>
                  <FieldLabel htmlFor="name">
                    Nama Sesi <span className="text-red-500">*</span>
                  </FieldLabel>
                  <FieldDescription>
                    Masukkan nama sesi KRS (contoh: Semester Ganjil 2024/2025)
                  </FieldDescription>
                  <FieldContent>
                    <div className="relative">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Semester Ganjil 2024/2025"
                        disabled={isLoading}
                        className="w-full px-4 py-3.5 border-2 focus:outline-none"
                        style={{
                          borderColor: errors.name ? '#BE0414' : '#015023',
                          borderRadius: '12px',
                          opacity: errors.name ? 1 : 0.75,
                          fontFamily: 'Urbanist, sans-serif',
                        }}
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

                {/* Tanggal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Mulai */}
                  <Field>
                    <FieldLabel htmlFor="start_date">
                      Tanggal Mulai <span className="text-red-500">*</span>
                    </FieldLabel>
                    <FieldDescription>Pilih tanggal pembukaan pengisian KRS</FieldDescription>
                    <FieldContent>
                      <div className="relative">
                        <input
                          type="date"
                          id="start_date"
                          name="start_date"
                          value={formData.start_date}
                          onChange={handleChange}
                          disabled={isLoading}
                          className="w-full px-4 py-3.5 border-2 focus:outline-none"
                          style={{
                            borderColor: errors.start_date ? '#BE0414' : '#015023',
                            borderRadius: '12px',
                            opacity: errors.start_date ? 1 : 0.75,
                            fontFamily: 'Urbanist, sans-serif',
                          }}
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

                  {/* Selesai */}
                  <Field>
                    <FieldLabel htmlFor="end_date">
                      Tanggal Selesai <span className="text-red-500">*</span>
                    </FieldLabel>
                    <FieldDescription>Pilih tanggal penutupan pengisian KRS</FieldDescription>
                    <FieldContent>
                      <div className="relative">
                        <input
                          type="date"
                          id="end_date"
                          name="end_date"
                          value={formData.end_date}
                          onChange={handleChange}
                          disabled={isLoading}
                          className="w-full px-4 py-3.5 border-2 focus:outline-none"
                          style={{
                            borderColor: errors.end_date ? '#BE0414' : '#015023',
                            borderRadius: '12px',
                            opacity: errors.end_date ? 1 : 0.75,
                            fontFamily: 'Urbanist, sans-serif',
                          }}
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
                  className="w-full h-px"
                  style={{ background: 'linear-gradient(to right, transparent, #DABC4E, transparent)' }}
                />

                {/* Status */}
                <Field>
                  <FieldLabel htmlFor="status">
                    Status Awal <span className="text-red-500">*</span>
                  </FieldLabel>
                  <FieldDescription>Status dapat diubah kapan saja dari tabel</FieldDescription>
                  <FieldContent>
                    <div className="relative">
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        disabled={isLoading}
                        className="w-full px-4 py-3.5 border-2 focus:outline-none appearance-none bg-white"
                        style={{
                          borderColor: errors.status ? '#BE0414' : '#015023',
                          borderRadius: '12px',
                          opacity: errors.status ? 1 : 0.75,
                          fontFamily: 'Urbanist, sans-serif',
                          color: formData.status ? '#1a1a1a' : '#9ca3af',
                        }}
                      >
                        <option value="" disabled>Pilih status</option>
                        {STATUS_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4" fill="none" stroke="#015023" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </FieldContent>
                  {errors.status && <FieldError>{errors.status}</FieldError>}
                </Field>

                {/* Info note */}
                <div
                  className="flex items-start gap-3 p-4 rounded-xl text-sm"
                  style={{ backgroundColor: '#EFF6EE', border: '1px solid #b7dfb0' }}
                >
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#015023' }} />
                  <p style={{ color: '#015023' }}>
                    Mahasiswa hanya dapat mengisi KRS ketika status sesi adalah{' '}
                    <span className="font-bold">Aktif</span>
                  </p>
                </div>

                {/* Error / Success */}
                {errors.form && <ErrorMessageBox message={errors.form} />}
                {success && (
                  <SuccessMessageBoxWithButton
                    message={success + ' Kembali ke daftar sesi KRS.'}
                    action={() => router.push('/adminpage/kelolawaktukrs')}
                    btntext="Lihat Data"
                  />
                )}

                {/* Action buttons */}
                <div className="pt-4">
                  <div
                    className="w-full h-px mb-6"
                    style={{ background: 'linear-gradient(to right, transparent, #015023, transparent)', opacity: 0.2 }}
                  />
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      type="submit"
                      variant="secondary"
                      disabled={isLoading}
                      className="flex-1 sm:flex-none sm:min-w-[160px]"
                      style={{ backgroundColor: '#DABC4E', color: '#015023' }}
                    >
                      {isLoading ? (
                        <><span className="animate-spin mr-2">⏳</span>Menyimpan...</>
                      ) : (
                        <><Save className="w-5 h-5 mr-2" />Perbarui</>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCancelDialog(true)}
                      disabled={isLoading}
                      className="flex-1 sm:flex-none sm:min-w-[160px]"
                    >
                      <X className="w-5 h-5 mr-2" />
                      Batal
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Info box */}
          {!isFetching && !fetchError && (
            <div
              className="mt-8 p-6 shadow-md"
              style={{
                border: '2px solid #DABC4E',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #FFFEF7 0%, #FFF9E6 100%)',
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#DABC4E', color: '#015023' }}
                >
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1" style={{ color: '#015023' }}>
                    Catatan Penting
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#015023' }}>
                    Pastikan rentang tanggal sesi KRS tidak tumpang tindih dengan sesi lain.
                    Hanya satu sesi yang bisa berstatus <strong>Aktif</strong> dalam satu waktu.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <AlertConfirmationRedDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title="Konfirmasi Pembatalan"
        description="Apakah Anda yakin ingin membatalkan perubahan?"
        confirmText="Ya, Batalkan"
        cancelText="Lanjutkan Edit"
        onConfirm={() => {
          setShowCancelDialog(false);
          router.push('/adminpage/kelolawaktukrs');
        }}
      />
    </div>
  );
}
