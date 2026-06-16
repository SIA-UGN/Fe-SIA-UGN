'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { createKrsSession } from '@/services/adminKrsSessionService';
import { getAcademicPeriods } from '@/services/academicPeriodService';

function resolveErrorMessage(err) {
  if (!err) return 'Terjadi kesalahan, coba beberapa saat lagi';
  if (err.status === 403) return 'Anda tidak memiliki akses ke fitur ini';
  if (err.status >= 500)  return 'Terjadi kesalahan, coba beberapa saat lagi';
  if (err.errors && typeof err.errors === 'object') {
    const msgs = Object.values(err.errors).flat().filter(Boolean);
    if (msgs.length) return msgs.join(' ');
  }
  return err.message || 'Terjadi kesalahan, coba beberapa saat lagi';
}

function formatPeriodDate(dateStr) {
  if (!dateStr) return '-';
  const [y, m, d] = String(dateStr).slice(0, 10).split('-');
  if (!y || !m || !d) return '-';
  return `${d}/${m}/${y}`;
}

export default function TambahSesiKRS() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors]       = useState({});
  const [success, setSuccess]     = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Periode akademik di-fetch untuk dropdown (tidak diinput manual).
  const [periods, setPeriods]             = useState([]);
  const [periodsLoading, setPeriodsLoading] = useState(true);
  const [periodsError, setPeriodsError]   = useState(null);

  const [formData, setFormData] = useState({
    id_academic_period: '',
    notes: '',
  });

  useEffect(() => {
    let active = true;
    (async () => {
      setPeriodsLoading(true);
      const { data, error } = await getAcademicPeriods();
      if (!active) return;
      if (error) {
        setPeriodsError(resolveErrorMessage(error));
        setPeriods([]);
      } else {
        setPeriods(Array.isArray(data?.data) ? data.data : []);
      }
      setPeriodsLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const selectedPeriod = periods.find(
    (p) => String(p.id_academic_period) === String(formData.id_academic_period)
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    if (errors.form)  setErrors(prev => ({ ...prev, form: null }));
    if (success) setSuccess(null);
  };

  const validate = () => {
    const errs = {};
    if (!formData.id_academic_period) errs.id_academic_period = 'Periode akademik wajib dipilih';
    setErrors(prev => ({ ...prev, ...errs }));
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);

    // API POST /manager/krs-sessions hanya butuh id_academic_period (+ notes opsional).
    // Status sesi otomatis "open", opened_at di-set backend.
    const payload = { id_academic_period: Number(formData.id_academic_period) };
    if (formData.notes.trim()) payload.notes = formData.notes.trim();

    const { error: err } = await createKrsSession(payload);
    if (err) {
      setErrors(prev => ({ ...prev, form: resolveErrorMessage(err) }));
      setIsLoading(false);
      return;
    }
    setSuccess('Sesi KRS berhasil ditambahkan dan langsung berstatus Aktif.');
    setFormData({ id_academic_period: '', notes: '' });
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: 'Urbanist, sans-serif' }}>
      <AdminNavbar title="Dashboard Manager - Tambah Sesi KRS" />

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
            <div className="w-2 h-16 rounded-full" style={{ backgroundColor: '#015023' }} />
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#015023' }}>
                Tambah Sesi KRS Baru
              </h1>
              <p className="text-gray-500 text-base mt-1">
                Pilih periode akademik untuk membuka sesi pengisian KRS
              </p>
            </div>
          </div>

          {/* Form card */}
          <div
            className="bg-white p-8 md:p-10 shadow-lg"
            style={{ borderRadius: '12px', border: '2px solid #015023' }}
          >
            <div className="mb-8">
              <h2 className="text-xl font-bold" style={{ color: '#015023' }}>
                Informasi Sesi KRS
              </h2>
              <div className="w-20 h-1 rounded-full mt-2" style={{ backgroundColor: '#DABC4E' }} />
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

              {/* Periode Akademik (dropdown — fetch dari API) */}
              <Field>
                <FieldLabel htmlFor="id_academic_period">
                  Periode Akademik <span className="text-red-500">*</span>
                </FieldLabel>
                <FieldDescription>
                  Pilih periode akademik. Sesi akan dibuat untuk periode ini.
                </FieldDescription>
                <FieldContent>
                  <div className="relative">
                    <select
                      id="id_academic_period"
                      name="id_academic_period"
                      value={formData.id_academic_period}
                      onChange={handleChange}
                      disabled={isLoading || periodsLoading}
                      className="w-full px-4 py-3.5 border-2 focus:outline-none appearance-none bg-white"
                      style={{
                        borderColor: errors.id_academic_period ? '#BE0414' : '#015023',
                        borderRadius: '12px',
                        opacity: errors.id_academic_period ? 1 : 0.75,
                        fontFamily: 'Urbanist, sans-serif',
                        color: formData.id_academic_period ? '#1a1a1a' : '#9ca3af',
                      }}
                    >
                      <option value="" disabled>
                        {periodsLoading ? 'Memuat periode akademik...' : 'Pilih periode akademik'}
                      </option>
                      {periods.map((p) => (
                        <option key={p.id_academic_period} value={p.id_academic_period}>
                          {p.name}{p.is_active ? ' · Aktif' : ''}
                        </option>
                      ))}
                    </select>
                    {/* Chevron icon */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4" fill="none" stroke="#015023" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </FieldContent>
                {errors.id_academic_period && <FieldError>{errors.id_academic_period}</FieldError>}
                {periodsError && <FieldError>{periodsError}</FieldError>}
                {!periodsLoading && !periodsError && periods.length === 0 && (
                  <FieldError>
                    Belum ada periode akademik. Buat periode akademik terlebih dahulu.
                  </FieldError>
                )}
              </Field>

              {/* Rentang tanggal periode (read-only, dari periode terpilih) */}
              {selectedPeriod && (
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl text-sm"
                  style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}
                >
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Tanggal Mulai Periode</p>
                    <p className="font-semibold" style={{ color: '#015023' }}>
                      {formatPeriodDate(selectedPeriod.start_date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Tanggal Selesai Periode</p>
                    <p className="font-semibold" style={{ color: '#015023' }}>
                      {formatPeriodDate(selectedPeriod.end_date)}
                    </p>
                  </div>
                </div>
              )}

              {/* Catatan (opsional) */}
              <Field>
                <FieldLabel htmlFor="notes">Catatan untuk Mahasiswa (Opsional)</FieldLabel>
                <FieldDescription>
                  Instruksi/keterangan yang ditampilkan ke mahasiswa saat pengisian KRS.
                </FieldDescription>
                <FieldContent>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Contoh: Pendaftaran KRS Semester Genap 2025/2026. Batas waktu 5 hari."
                    rows={3}
                    maxLength={1000}
                    disabled={isLoading}
                    className="w-full px-4 py-3.5 border-2 focus:outline-none resize-none"
                    style={{
                      borderColor: '#015023',
                      borderRadius: '12px',
                      opacity: 0.75,
                      fontFamily: 'Urbanist, sans-serif',
                    }}
                  />
                </FieldContent>
              </Field>

              {/* Info note */}
              <div
                className="flex items-start gap-3 p-4 rounded-xl text-sm"
                style={{ backgroundColor: '#EFF6EE', border: '1px solid #b7dfb0' }}
              >
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#015023' }} />
                <p style={{ color: '#015023' }}>
                  Sesi langsung berstatus <span className="font-bold">Aktif</span> setelah dibuat dan
                  mahasiswa dapat mengisi KRS. Setiap periode hanya boleh memiliki satu sesi aktif.
                  Sesi ditutup dari tabel daftar sesi.
                </p>
              </div>

              {/* Error / Success */}
              {errors.form && <ErrorMessageBox message={errors.form} />}
              {success && (
                <SuccessMessageBoxWithButton
                  message={success + ' Lihat data atau tambahkan sesi lain.'}
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
                    disabled={isLoading || periodsLoading || periods.length === 0}
                    className="flex-1 sm:flex-none sm:min-w-[160px]"
                    style={{ backgroundColor: '#DABC4E', color: '#015023' }}
                  >
                    {isLoading ? (
                      <><span className="animate-spin mr-2">⏳</span>Menyimpan...</>
                    ) : (
                      <><Save className="w-5 h-5 mr-2" />Tambah</>
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

          {/* Info box */}
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
                  Setelah sesi dibuat, daftarkan kelas yang boleh dipilih mahasiswa lewat menu
                  <strong> Kelola Kelas</strong> pada tabel daftar sesi. Hanya satu sesi yang bisa
                  berstatus <strong>Aktif</strong> per periode akademik.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <AlertConfirmationRedDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title="Konfirmasi Pembatalan"
        description="Apakah Anda yakin ingin membatalkan? Data yang diisi akan hilang."
        confirmText="Ya, Batalkan"
        cancelText="Lanjutkan Mengisi"
        onConfirm={() => {
          setShowCancelDialog(false);
          router.push('/adminpage/kelolawaktukrs');
        }}
      />
    </div>
  );
}
