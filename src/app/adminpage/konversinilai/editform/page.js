'use client';

import { useState, useEffect, use, Suspense } from 'react';
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
import { rule } from 'postcss/lib/postcss';
import { getGradeConversionById, updateGradeConversion } from '@/lib/gradeConv';

function EditKonversiNilaiForm() {
const router = useRouter();
const searchParams = useSearchParams();
const ruleId = searchParams.get('id');

const [isLoading, setIsLoading] = useState(false);
const [errors, setErrors] = useState({});
const [success, setSuccess] = useState(null);
const [countdown, setCountdown] = useState(10);
const [fetching, setFetching] = useState(true);
const [showCancelDialog, setShowCancelDialog] = useState(false);

const [formData, setFormData] = useState({
min_grade: '',
max_grade: '',
letter: '',
ip_skor: ''
});

const fetchgrade = async () => {
    setFetching(true);
    try {
        const response = await getGradeConversionById(ruleId);
    
    if (response.status === 'success') {
        setFormData({
            min_grade: response.data.min_grade.toString(),
            max_grade: response.data.max_grade.toString(),
            letter: response.data.letter,
            ip_skor: response.data.ip_skor.toString()
        });
    } else {
        setErrors({ fetch: 'Konversi nilai tidak ditemukan' });
    }
    } catch (error) {
    setErrors({ fetch: 'Gagal mengambil data: ' + error.message });
    } finally {
    setFetching(false);
    }
};

useEffect(() => {
    if (ruleId) {
        fetchgrade();
    }
}, [ruleId]);

const handleChange = (e) => {
    const { name, value } = e.target;

    // Validasi input numerik
    if (name === 'min_grade' || name === 'max_grade') {
        if (value && !/^\d*$/.test(value)) return;
    }
    if (name === 'ip_skor') {
        if (value && !/^\d*\.?\d*$/.test(value)) return;
    }

    setFormData(prev => ({
        ...prev,
        [name]: value
    }));

    // Bersihkan error spesifik & form error
    if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: null }));
    }
    if (errors.form) {
        setErrors(prev => ({ ...prev, form: null }));
    }
    // Jika ada success sebelumnya, hilangkan agar user tahu perubahan belum disimpan
    if (success) {
        setSuccess(null);
    }
};

const validateForm = () => {
const newErrors = {};

if (!formData.min_grade) {
    newErrors.min_grade = 'Nilai minimal harus diisi';
} else {
    const minGrade = parseFloat(formData.min_grade);
    if (minGrade < 0 || minGrade > 100) {
    newErrors.min_grade = 'Nilai minimal harus antara 0-100';
    }
}

if (!formData.max_grade) {
    newErrors.max_grade = 'Nilai maksimal harus diisi';
} else {
    const maxGrade = parseFloat(formData.max_grade);
    if (maxGrade < 0 || maxGrade > 100) {
    newErrors.max_grade = 'Nilai maksimal harus antara 0-100';
    }
}

if (formData.min_grade && formData.max_grade) {
    const minGrade = parseFloat(formData.min_grade);
    const maxGrade = parseFloat(formData.max_grade);
    
    if (maxGrade <= minGrade) {
    newErrors.max_grade = 'Nilai maksimal harus lebih besar dari nilai minimal';
    }
}

if (!formData.letter.trim()) {
    newErrors.letter = 'Nilai huruf harus diisi';
} else {
    const validLetters = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'E', 'F'];
    if (!validLetters.includes(formData.letter.toUpperCase())) {
    newErrors.letter = 'Nilai huruf harus salah satu dari: A, A-, B+, B, B-, C+, C, C-, D+, D, E, F';
    }
}

if (!formData.ip_skor) {
    newErrors.ip_skor = 'Nilai IP harus diisi';
} else {
    const ipSkor = parseFloat(formData.ip_skor);
    if (isNaN(ipSkor) || ipSkor < 0 || ipSkor > 4) {
    newErrors.ip_skor = 'Nilai IP harus antara 0.00-4.00';
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
        const sendData = {
            min_grade: parseFloat(formData.min_grade),
            max_grade: parseFloat(formData.max_grade),
            letter: formData.letter.toUpperCase(),
            ip_skor: formData.ip_skor
        };
        const response = await updateGradeConversion(ruleId, sendData);

        if (response.status === 'success') {
            setSuccess('Konversi nilai berhasil diperbarui');
            setCountdown(5);
        } else {
            newErrors.form = response.message;
        }
    } catch (error) {
        newErrors.form = error.message;
    } finally {
        setIsLoading(false);
        setErrors(prev => ({ ...prev, ...newErrors }));
    }
};

const handleCancel = () => {
setShowCancelDialog(true);
};

const confirmCancel = () => {
router.push('/adminpage/konversinilai');
};

const handleFinish = () => {
    router.push('/adminpage/konversinilai');
};

// Countdown effect for success redirect
useEffect(() => {
    let timer;
    if (success) {
        if (countdown > 0) {
            timer = setTimeout(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        } else {
            handleFinish();
        }
    }
    return () => clearTimeout(timer);
}, [success, countdown]);

const handleBack = () => {
router.push('/adminpage/konversinilai');
};

if (fetching) {
    return (
        <LoadingEffect message='Memuat data nilai konversi...'/>
    );
} else if (errors.fetch) {
    return (
    <div className="min-h-screen bg-brand-light-sage">
        <AdminNavbar title="Dashboard Admin - Edit Konversi Nilai" />
        <div className="container mx-auto px-4 py-8 max-w-5xl">
        <ErrorMessageBoxWithButton
            message={errors.fetch}
            action={fetchgrade}
            back={true}
            actionback={handleBack}
        />
        </div>
    </div>
    );
}

return (
<div className="min-h-screen bg-brand-light-sage">
    <AdminNavbar title="Dashboard Admin - Edit Konversi Nilai" />
    
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
            Edit Konversi Nilai
            </h1>
            <p 
            className="text-gray-600 text-lg"
            style={{ fontFamily: 'Urbanist, sans-serif' }}
            >
            Perbarui aturan konversi nilai
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
              Informasi Konversi Nilai
            </h2>
            <div 
              className="w-20 h-1 rounded-full"
              style={{ backgroundColor: '#DABC4E' }}
            />
          </div>

        <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field>
            <FieldLabel htmlFor="min_grade">
                Nilai Minimal <span className="text-red-500">*</span>
            </FieldLabel>
            <FieldDescription>
                Masukkan nilai minimal (0-100)
            </FieldDescription>
            <FieldContent>
                <div className="relative">
                    <input
                    type="text"
                    id="min_grade"
                    name="min_grade"
                    value={formData.min_grade}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 border-2 focus:outline-none focus:border-opacity-100"
                    style={{
                      fontFamily: 'Urbanist, sans-serif',
                      borderColor: errors.min_grade ? '#BE0414' : '#015023',
                      borderRadius: '12px',
                      opacity: errors.min_grade ? 1 : 0.7
                    }}
                    placeholder="95"
                    disabled={isLoading}
                    />
                    {formData.min_grade && !errors.min_grade && parseFloat(formData.min_grade) >= 0 && parseFloat(formData.min_grade) <= 100 && (
                      <div 
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: '#16874B' }}
                      >
                        ✓
                      </div>
                    )}
                </div>
            </FieldContent>
            {errors.min_grade && <FieldError>{errors.min_grade}</FieldError>}
            </Field>

            <Field>
            <FieldLabel htmlFor="max_grade">
                Nilai Maksimal <span className="text-red-500">*</span>
            </FieldLabel>
            <FieldDescription>
                Masukkan nilai maksimal (0-100)
            </FieldDescription>
            <FieldContent>
                <div className="relative">
                    <input
                    type="text"
                    id="max_grade"
                    name="max_grade"
                    value={formData.max_grade}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 border-2 focus:outline-none focus:border-opacity-100"
                    style={{
                      fontFamily: 'Urbanist, sans-serif',
                      borderColor: errors.max_grade ? '#BE0414' : '#015023',
                      borderRadius: '12px',
                      opacity: errors.max_grade ? 1 : 0.7
                    }}
                    placeholder="100"
                    disabled={isLoading}
                    />
                    {formData.max_grade && !errors.max_grade && parseFloat(formData.max_grade) >= 0 && parseFloat(formData.max_grade) <= 100 && (
                      <div 
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: '#16874B' }}
                      >
                        ✓
                      </div>
                    )}
                </div>
            </FieldContent>
            {errors.max_grade && <FieldError>{errors.max_grade}</FieldError>}
            </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field>
            <FieldLabel htmlFor="letter">
                Nilai Huruf <span className="text-red-500">*</span>
            </FieldLabel>
            <FieldDescription>
                Masukkan nilai huruf (contoh: A, B+, C)
            </FieldDescription>
            <FieldContent>
                <div className="relative">
                    <input
                    type="text"
                    id="letter"
                    name="letter"
                    value={formData.letter}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 border-2 focus:outline-none focus:border-opacity-100 uppercase"
                    style={{
                      fontFamily: 'Urbanist, sans-serif',
                      borderColor: errors.letter ? '#BE0414' : '#015023',
                      borderRadius: '12px',
                      opacity: errors.letter ? 1 : 0.7
                    }}
                    placeholder="A"
                    disabled={isLoading}
                    maxLength={2}
                    />
                    {formData.letter && !errors.letter && ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'E', 'F'].includes(formData.letter.toUpperCase()) && (
                      <div 
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: '#16874B' }}
                      >
                        ✓
                      </div>
                    )}
                </div>
            </FieldContent>
            {errors.letter && <FieldError>{errors.letter}</FieldError>}
            </Field>

            <Field>
            <FieldLabel htmlFor="ip_skor">
                Nilai IP <span className="text-red-500">*</span>
            </FieldLabel>
            <FieldDescription>
                Masukkan nilai IP (0.00-4.00)
            </FieldDescription>
            <FieldContent>
                <div className="relative">
                    <input
                    type="text"
                    id="ip_skor"
                    name="ip_skor"
                    value={formData.ip_skor}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 border-2 focus:outline-none focus:border-opacity-100"
                    style={{
                      fontFamily: 'Urbanist, sans-serif',
                      borderColor: errors.ip_skor ? '#BE0414' : '#015023',
                      borderRadius: '12px',
                      opacity: errors.ip_skor ? 1 : 0.7
                    }}
                    placeholder="4.00"
                    disabled={isLoading}
                    />
                    {formData.ip_skor && !errors.ip_skor && !isNaN(parseFloat(formData.ip_skor)) && parseFloat(formData.ip_skor) >= 0 && parseFloat(formData.ip_skor) <= 4 && (
                      <div 
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: '#16874B' }}
                      >
                        ✓
                      </div>
                    )}
                </div>
            </FieldContent>
            {errors.ip_skor && <FieldError>{errors.ip_skor}</FieldError>}
            </Field>
        </div>

        {/* Separator */}
        <div 
          className="w-full h-px my-8"
          style={{ 
            background: 'linear-gradient(to right, transparent, #DABC4E, transparent)'
          }}
        />

        <div 
            className="p-4 border-2"
            style={{ 
            backgroundColor: '#FFF8E1',
            borderColor: '#FFE082',
            borderRadius: '12px'
            }}
        >
            <p 
            className="text-sm font-semibold mb-2"
            style={{ 
                color: '#F57F17',
                fontFamily: 'Urbanist, sans-serif'
            }}
            >
            Contoh Konversi Nilai:
            </p>
            <ul 
            className="text-sm space-y-1"
            style={{ 
                color: '#6D4C41',
                fontFamily: 'Urbanist, sans-serif'
            }}
            >
            <li>• 95-100 = A (4.00)</li>
            <li>• 90-94 = A- (3.75)</li>
            <li>• 85-89 = B+ (3.50)</li>
            <li>• 80-84 = B (3.00)</li>
            </ul>
        </div>
        {errors.form && (
            <div className="mb-6">
            <ErrorMessageBox message={errors.form} />
            </div>
        )}

        {success && (
            <SuccessMessageBoxWithButton
                message={success + `\nAkan dialihkan ke halaman data konversi nilai dalam ${countdown} detik.`}
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
                        Pastikan rentang nilai tidak tumpang tindih dengan konversi nilai yang sudah ada.<br />
                        Nilai huruf yang valid: A, A-, A/B, B+, B, B-, B/C, C+, C, C-, C/D, D+, D, D-, D/E, E+, E.
                    </p>
                </div>
            </div>
        </div>
    </div>
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
        <Suspense fallback={<LoadingEffect message="Memuat data nilai konversi..." />}> 
            <EditKonversiNilaiForm />
        </Suspense>
    );
}
