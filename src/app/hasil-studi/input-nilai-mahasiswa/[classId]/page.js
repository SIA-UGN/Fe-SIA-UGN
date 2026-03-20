'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, FileText, Save } from 'lucide-react';
import DataTable from '@/components/ui/table';
import { PrimaryButton, OutlineButton, WarningButton } from '@/components/ui/button';
import Navbar from '@/components/ui/navigation-menu';
import LoadingEffect from '@/components/ui/loading-effect';
import { getClassStudentsWithGrades, saveGradesBulk } from '@/lib/gradingApi';
import { getGradeConversions } from '@/lib/gradeConv';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import { getPermissionForAClass } from '@/lib/permissionApi';
import { 
  AlertConfirmationDialog, 
  AlertErrorDialog, 
  AlertSuccessDialog, 
  AlertWarningDialog 
} from '@/components/ui/alert-dialog';

export default function InputNilaiMahasiswa() {
  const router = useRouter();
  const params = useParams();
  const classId = params.classId; // Get classId from URL params
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingGrade, setLoadingGrade] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mahasiswaData, setMahasiswaData] = useState([]);
  const [gradeConversions, setGradeConversions] = useState([]);
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(null);
  const [loadingPermission, setLoadingPermission] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const [classInfo, setClassInfo] = useState({
    code_class: '-',
    subject: {
      name: '-',
      code: '-',
      sks: 0
    },
    academic_period: {
      name: '-'
    }
  });
  const [statistics, setStatistics] = useState({
    total_students: 0,
    graded_students: 0,
    ungraded_students: 0
  });
  const [errors, setErrors] = useState({});
  
  // Dialog states
  const [showInvalidDialog, setShowInvalidDialog] = useState(false);
  const [showUngradedConfirm, setShowUngradedConfirm] = useState(false);
  const [showNoGradesDialog, setShowNoGradesDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [ungradedCount, setUngradedCount] = useState(0);
  const [gradedCount, setGradedCount] = useState(0);

  // Fetch data saat component mount
  useEffect(() => {
    if (classId) {
      checkPermission();
    }
  }, [classId]);

  const checkPermission = async () => {
    setErrors(prev => ({...prev, permission: null}));
    setLoadingPermission(true);
    try {
      // Here you can add actual permission check logic if needed
      const Response = await getPermissionForAClass(classId);
      if (Response.status === 'success') {
        // Check if permission is granted
        if (Response.data.permission === false) {
          setPermissionGranted(false);
          setPermissionChecked(true);
        } else {
          setPermissionGranted(true);
          setPermissionChecked(true);
        }
      } else {
        setErrors(prev => ({...prev, permission: 'Gagal memeriksa izin akses: ' + Response.message}));
      }
    } catch (error) {
      setErrors(prev => ({...prev, permission: 'Gagal memeriksa izin akses: ' + error.message}));
    } finally {
      setLoadingPermission(false);
    }
  };

  useEffect(() => {
		if (permissionChecked && permissionGranted) {
			fetchAllData();
		}
	}, [permissionChecked, permissionGranted]);

  // Countdown redirect effect ketika ada error permission atau permissionGranted false
  useEffect(() => {
    let timer;
    if (permissionGranted === false) {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      } else {
        handleBack();
      }
    }
    return () => clearTimeout(timer);
  }, [permissionGranted, countdown]);

  // Fetch All
  const fetchAllData = async () => {
    setErrors(prev => ({...prev, fetch: null}));
    setIsLoading(true);
    await Promise.all([
      fetchGradeConversions(),
      fetchClassData()
    ]);
    setIsLoading(false);
  };

  const fetchGradeConversions = async () => {
    setLoadingGrade(true);
    setErrors(prev => ({...prev, grades: null}));
    try {
      const response = await getGradeConversions();
      
      if (response.status === 'success') {
        setGradeConversions(response.data);
      } else {
        setErrors(prev => ({...prev, grades: 'Gagal memuat konversi nilai: ' + response.message}));
      }
    } catch (error) {
      setErrors(prev => ({...prev, grades: 'Terjadi kesalahan saat memuat konversi nilai: ' + error.message}));
    } finally {
      setLoadingGrade(false);
    }
  };

  const fetchClassData = async () => {
    setErrors(prev => ({...prev, fetch: null}));
    try {
      const response = await getClassStudentsWithGrades(classId);
      
      if (response.status === 'success') {
        setClassInfo(response.data.class_info);
        setStatistics(response.data.statistics);
        
        // Transform data ke format yang sesuai dengan table
        const formattedData = response.data.students.map(student => ({
          id: student.id_user_si,
          nim: student.nim,
          nama: student.name,
          nilai: student.grade?.grade ?? null,
          id_grades: student.grade?.id_grades ?? null
        }));
        
        setMahasiswaData(formattedData);
      } else {
        setErrors(prev => ({...prev, fetch: 'Gagal memuat data mahasiswa: ' + response.message}));
      }
    } catch (error) {
      setErrors(prev => ({...prev, fetch: 'Terjadi kesalahan saat memuat data mahasiswa: ' + error.message}));
    }
  };

  // Handle nilai change - langsung update tanpa toggle
  const handleNilaiChange = (id, newNilai) => {
    const numValue = newNilai === '' ? null : parseInt(newNilai);
    setMahasiswaData(prevData => {
      const updatedData = prevData.map(item =>
        item.id === id ? { ...item, nilai: numValue } : item
      );
      
      // Update statistics
      const graded = updatedData.filter(item => item.nilai !== null).length;
      setStatistics(prev => ({
        ...prev,
        graded_students: graded,
        ungraded_students: prev.total_students - graded
      }));
      
      return updatedData;
    });
  };

  // Convert nilai to grade using backend grade conversions
  const nilaiToGrade = (nilai) => {
    if (nilai === null || nilai === undefined) return '-';
    
    // Find matching grade conversion from backend
    const conversion = gradeConversions.find(
      conv => nilai >= conv.min_grade && nilai <= conv.max_grade
    );
    
    return conversion ? conversion.letter : '-';
  };

  // Custom render for nilai column
  const customRender = {
    nilai_akhir: (value, item) => {
      return (
        <div className="flex items-center justify-center">
          {item.nilai !== null ? (
            <span 
              className="px-6 py-2.5 rounded-lg font-bold text-xl"
              style={{ 
                backgroundColor: '#DABC4E', 
                color: '#015023',
                fontFamily: 'Urbanist, sans-serif' 
              }}
            >
              {nilaiToGrade(item.nilai)}
            </span>
          ) : (
            <span 
              className="px-4 py-2 rounded-lg font-medium"
              style={{ 
                backgroundColor: '#f3f4f6', 
                color: '#6b7280',
                fontFamily: 'Urbanist, sans-serif' 
              }}
            >
              -
            </span>
          )}
        </div>
      );
    },
    input_nilai: (value, item) => {
      const isInvalid = item.nilai !== null && (item.nilai < 0 || item.nilai > 100);
      
      return (
        <div className="flex items-center justify-center">
          <input
            type="number"
            min="0"
            max="100"
            value={item.nilai === null ? '' : item.nilai}
            onChange={(e) => handleNilaiChange(item.id, e.target.value)}
            className="w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none text-center font-semibold transition"
            style={{
              fontFamily: 'Urbanist, sans-serif',
              borderColor: isInvalid ? '#BE0414' : '#015023',
              borderRadius: '12px',
              fontSize: '16px',
              maxWidth: '120px',
              backgroundColor: isInvalid ? '#fee2e2' : 'white',
              /* Hide number input arrows for perfect centering */
              MozAppearance: 'textfield',
              WebkitAppearance: 'none',
              appearance: 'none'
            }}
            placeholder="0-100"
          />
          <style jsx>{`
            input[type='number']::-webkit-inner-spin-button,
            input[type='number']::-webkit-outer-spin-button {
              -webkit-appearance: none;
              margin: 0;
            }
            input[type='number'] {
              -moz-appearance: textfield;
            }
          `}</style>
        </div>
      );
    }
  };

  // Define table columns
  const columns = [
    { 
      key: 'nim', 
      label: 'NIM', 
      width: '150px',
      cellClassName: 'font-medium'
    },
    { 
      key: 'nama', 
      label: 'Nama Mahasiswa',
      className: 'text-left',
      cellClassName: 'text-left font-medium'
    },
    { 
      key: 'input_nilai', 
      label: 'Input Nilai', 
      width: '150px'
    },
    { 
      key: 'nilai_akhir', 
      label: 'Nilai Akhir', 
      width: '180px'
    },
  ];

  const handleSaveAll = async () => {
    const belumDinilai = mahasiswaData.filter(item => item.nilai === null);
    const nilaiInvalid = mahasiswaData.filter(item => 
      item.nilai !== null && (item.nilai < 0 || item.nilai > 100)
    );
    
    if (nilaiInvalid.length > 0) {
      setShowInvalidDialog(true);
      return;
    }
    
    if (belumDinilai.length > 0) {
      setUngradedCount(belumDinilai.length);
      setShowUngradedConfirm(true);
      return;
    }

    await processSave();
  };

  const processSave = async () => {
    setIsSaving(true);
    setErrors(prev => ({...prev, save: null}));
    try {
      // Prepare grades data (only for students with grades)
      const gradesToSave = mahasiswaData
        .filter(item => item.nilai !== null)
        .map(item => ({
          id_user_si: item.id,
          grade: item.nilai
        }));
      
      if (gradesToSave.length === 0) {
        setShowNoGradesDialog(true);
        return;
      }
      
      const response = await saveGradesBulk(classId, gradesToSave);
      
      if (response.status === 'success') {
        setGradedCount(gradesToSave.length);
        setShowSuccessDialog(true);
      } else {
        setErrors(prev => ({...prev, save: 'Gagal menyimpan nilai: ' + response.message}));
      }
    } catch (error) {
      setErrors(prev => ({...prev, save: 'Terjadi kesalahan saat menyimpan nilai: ' + error.message}));
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    router.push('/hasil-studi');
  };

  // Show loading
  if (loadingPermission) {
    return <LoadingEffect message="Memeriksa izin akses..." />;
  } else if (permissionGranted === false) {
    return (
      <div className="min-h-screen bg-brand-light-sage">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <ErrorMessageBoxWithButton
            message={'Anda tidak memiliki izin untuk mengakses kelas ini.' + `\n\nAkan dialihkan kembali dalam ${countdown} detik.`}
            action={handleBack}
            btntext={countdown > 0 ? `Kembali (${countdown})` : 'Kembali'}
          />
        </div>
      </div>
    );
  } else if (errors.permission) {
    return (
      <div className="min-h-screen bg-brand-light-sage">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <ErrorMessageBoxWithButton
            message={errors.permission}
            action={checkPermission}
          />
        </div>
      </div>
    );
  } else if (isLoading) {
    return <LoadingEffect message="Memuat data mahasiswa..." />;
  } else if (errors.fetch) {
    return (
      <div className="min-h-screen bg-brand-light-sage">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <ErrorMessageBoxWithButton
            message={errors.fetch}
            action={fetchAllData}
            back={true}
            actionback={handleBack}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light-sage">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-6 font-medium hover:opacity-80 transition"
          style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali ke Daftar Mata Kuliah
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6" style={{ borderRadius: '16px' }}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="p-4 rounded-xl"
                style={{ backgroundColor: '#015023' }}
              >
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 
                  className="text-3xl font-bold mb-2"
                  style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}
                >
                  Input Nilai Akhir Mahasiswa
                </h1>
                <p 
                  className="text-lg"
                  style={{ color: '#015023', opacity: 0.7, fontFamily: 'Urbanist, sans-serif' }}
                >
                  {classInfo.subject.code} - {classInfo.subject.name} ({classInfo.subject.sks} SKS)
                </p>
                <p 
                  className="text-sm mt-1"
                  style={{ color: '#015023', opacity: 0.6, fontFamily: 'Urbanist, sans-serif' }}
                >
                  Kelas: {classInfo.code_class} | {classInfo.academic_period.name}
                </p>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div>
              <p className="text-sm font-medium" style={{ color: '#015023', opacity: 0.6, fontFamily: 'Urbanist, sans-serif' }}>
                Jumlah Mahasiswa
              </p>
              <p className="text-lg font-semibold" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
                {statistics.total_students} Mahasiswa
              </p>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: '#015023', opacity: 0.6, fontFamily: 'Urbanist, sans-serif' }}>
                Sudah Dinilai
              </p>
              <p className="text-lg font-semibold" style={{ color: '#16874B', fontFamily: 'Urbanist, sans-serif' }}>
                {statistics.graded_students} Mahasiswa
              </p>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: '#015023', opacity: 0.6, fontFamily: 'Urbanist, sans-serif' }}>
                Belum Dinilai
              </p>
              <p className="text-lg font-semibold" style={{ color: '#BE0414', fontFamily: 'Urbanist, sans-serif' }}>
                {statistics.ungraded_students} Mahasiswa
              </p>
            </div>
          </div>
        </div>

        {/* Error Message Save */}
        {errors.save && (
          <ErrorMessageBoxWithButton
            message={errors.save}
            action={handleSaveAll}
          />
        )}

        {/* Table Mahasiswa */}
        <div className="mb-6">
          <DataTable
            columns={columns}
            data={mahasiswaData}
            actions={[]}
            pagination={false}
            customRender={customRender}
          />
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6" style={{ borderRadius: '16px' }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
              <p className="font-medium">Keterangan Konversi Nilai:</p>
              <p className="text-gray-600 mt-1">
                {gradeConversions.length > 0 ? (
                  gradeConversions
                    .sort((a, b) => b.min_grade - a.min_grade)
                    .map(conv => `${conv.letter}: ${conv.min_grade}-${conv.max_grade}`)
                    .join(' | ')
                ) : (
                  'Memuat konversi nilai...'
                )}
              </p>
            </div>

            <div className="flex gap-3">
              <WarningButton
                onClick={() => router.back()}
                disabled={isSaving}
              >
                Batal
              </WarningButton>
              
              <PrimaryButton
                onClick={handleSaveAll}
                disabled={isSaving}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Menyimpan...' : 'Simpan Semua Nilai'}
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Dialogs */}
      <AlertWarningDialog
        open={showInvalidDialog}
        onOpenChange={setShowInvalidDialog}
        title="Nilai Tidak Valid"
        description="Ada nilai yang tidak valid (harus 0-100). Mohon perbaiki terlebih dahulu."
        closeText="Tutup"
      />

      <AlertConfirmationDialog
        open={showUngradedConfirm}
        onOpenChange={setShowUngradedConfirm}
        title="Konfirmasi Simpan"
        description={`Masih ada ${ungradedCount} mahasiswa yang belum dinilai. Lanjutkan menyimpan?`}
        confirmText="Lanjutkan"
        cancelText="Batal"
        onConfirm={() => {
          setShowUngradedConfirm(false);
          processSave();
        }}
      />

      <AlertWarningDialog
        open={showNoGradesDialog}
        onOpenChange={setShowNoGradesDialog}
        title="Tidak Ada Nilai"
        description="Tidak ada nilai yang akan disimpan."
        closeText="Tutup"
      />

      <AlertSuccessDialog
        open={showSuccessDialog}
        onOpenChange={(open) => {
          setShowSuccessDialog(open);
          if (!open) router.back();
        }}
        title="Berhasil Disimpan"
        description={`Berhasil menyimpan nilai untuk ${gradedCount} mahasiswa!`}
        closeText="Tutup"
      />
    </div>
  );
}
