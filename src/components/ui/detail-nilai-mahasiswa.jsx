'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Download } from 'lucide-react';
import DataTable from '@/components/ui/table';
import { PrimaryButton, OutlineButton } from '@/components/ui/button';
import Navbar from '@/components/ui/navigation-menu';
import LoadingEffect from '@/components/ui/loading-effect';
import { getAcademicPeriods, getStudentGrades, downloadTranscriptPDF } from '@/lib/gradingApi';
import { getProfile } from '@/lib/profileApi';
import { getGradeConversions } from '@/lib/gradeConv';
import { ErrorMessageBoxWithButton } from './message-box';
import { AlertWarningDialog } from '@/components/ui/alert-dialog';

export default function DetailNilaiMahasiswa() {
const router = useRouter();

// State Management
const [isLoading, setIsLoading] = useState(true);
const [loadingGrade, setLoadingGrade] = useState(false);
const [isDownloading, setIsDownloading] = useState(false);
const [selectedSemester, setSelectedSemester] = useState('');
const [semesterOptions, setSemesterOptions] = useState([]);
const [nilaiData, setNilaiData] = useState([]);
const [studentInfo, setStudentInfo] = useState({
    nim: '-',
    name: '-',
    program: '-'
});
const [errors, setErrors] = useState({});
const [gradeConversions, setGradeConversions] = useState([]);
const [showWaitDialog, setShowWaitDialog] = useState(false);
const [summary, setSummary] = useState({
    totalSKSSems: 0,
    totalSkS: 0,
    totalNilaiSKSsems: 0,
    totalNilaiSKS: 0,
    ips: 0,
    ipk: 0
});

// Fetch Academic Periods saat component mount
useEffect(() => {
    fetchAll();
}, []);

    // Fetch All 
    const fetchAll = async () => {
        setErrors(prev => ({...prev, fetch: null}));
        setIsLoading(true);
        await Promise.all([
            fetchAcademicPeriods(), 
            fetchStudentInfo(),
            fetchGradeConversions()
        ]);
        setIsLoading(false);
    }

    const fetchAcademicPeriods = async () => {
        try {
            const response = await getAcademicPeriods();

            if (response.status === 'success') {
                // Transform to dropdown options
                const options = response.data.map(period => ({
                    value: period.id_academic_period.toString(),
                    label: period.name,
                    is_active: period.is_active
                }));
                setSemesterOptions(options);

                // Auto-select active period
                const activePeriod = options.find(opt => opt.is_active);
                if (activePeriod) {
                    setSelectedSemester(activePeriod.value);
                } else if (options.length > 0) {
                    setSelectedSemester(options[options.length - 1]?.value || '');
                }
            } else {
                setErrors(prev => ({...prev, fetch: 'Gagal memuat data: ' + response.message }));
            }
        } catch (err) {
            setErrors(prev => ({...prev, fetch: 'Terjadi kesalahan saat memuat data: ' + err.message }));
        }
    };

// Fetch Student Info
const fetchStudentInfo = async () => {
    try {
        const response = await getProfile();
        
        if (response.status === 'success' && response.data) {
            setStudentInfo({
                nim: response.data.student_data.registration_number || '-',
                name: response.data.name || '-',
                program: response.data.student_data.program_name || '-'
            });
        } else {
            setErrors(prev => ({...prev, fetch: 'Gagal memuat data: ' + response.message }));
        }
    } catch (error) {
        setErrors(prev => ({...prev, fetch: 'Terjadi kesalahan saat memuat data: ' + error.message }));
    }
};

// Fetch Grade Conversions
const fetchGradeConversions = async () => {
    try {
        const response = await getGradeConversions();
        if (response.status === 'success') {
            // Sort by ip_skor descending
            const sorted = response.data.sort((a, b) => b.ip_skor - a.ip_skor);
            setGradeConversions(sorted);
        } else {
            setErrors(prev => ({...prev, fetch: 'Gagal memuat data: ' + response.message }));
        }
    } catch (error) {
        setErrors(prev => ({...prev, fetch: 'Terjadi kesalahan saat memuat data: ' + error.message }) );
    }
};

// Fetch Student Grades ketika semester berubah
useEffect(() => {
    if (selectedSemester) {
        fetchStudentGrades();
    }
}, [selectedSemester]);

// Fetch Student Grades
const fetchStudentGrades = async () => {
    setLoadingGrade(true);
    try {
        const response = await getStudentGrades(selectedSemester);
        if (response.status === 'success') {
            const allGrades = (response.data?.grade || []).map(item => ({
                id: item.id_class,
                kode_matkul: item.code_subject,
                nama_matkul: item.subject_name,
                sks: item.sks,
                nilai: item.grade_details?.letter || null,
                bobot: item.grade_details?.ip ?? null,
                nilai_sks: item.grade_details ? (item.sks || 0) * (item.grade_details?.ip ?? 0) : null
            }));
            setNilaiData(allGrades);
            setSummary({
                totalSKSSems: response.data.summary.total_sks_sems,
                totalSkS: response.data.summary.total_sks_all,
                totalNilaiSKSsems: response.data.summary.total_nilai_x_sks_sems,
                totalNilaiSKS: response.data.summary.total_nilai_x_sks_all,
                ips: response.data.summary.ips,
                ipk: response.data.summary.ipk
            });
        } else {
            setNilaiData([]);
            setSummary({ totalSKS: 0, totalNilaiSKS: 0, ipk: 0 });
            setErrors(prev => ({...prev, grades: 'Gagal memuat data nilai: ' + response.message }) );
        }
    } catch (error) {
        setNilaiData([]);
        setSummary({ totalSKS: 0, totalNilaiSKS: 0, ipk: 0 });
        setErrors(prev => ({...prev, grades: 'Terjadi kesalahan saat memuat data nilai: ' + error.message }) );
    } finally {
        setLoadingGrade(false);
    }
};

// Define table columns
const columns = [
{ 
    key: 'kode_matkul', 
    label: 'Kode Matkul', 
    width: '120px' 
},
{ 
    key: 'nama_matkul', 
    label: 'Mata Kuliah',
    className: 'text-left',
    cellClassName: 'text-left font-medium'
},
{ 
    key: 'sks', 
    label: 'SKS', 
    width: '80px' 
},
{ 
    key: 'nilai', 
    label: 'Nilai', 
    width: '100px',
    render: (value) => value ? value.toFixed(2) : '-'
},
{ 
    key: 'bobot', 
    label: 'Bobot', 
    width: '80px',
    cellClassName: 'font-semibold'
},
{ 
    key: 'nilai_sks', 
    label: 'Nilai SKS', 
    width: '120px',
    cellClassName: 'font-medium',
    render: (value) => value ? value.toFixed(2) : '-'
},
];

const handleExport = async () => {
    setErrors(prev => ({...prev, export: null}));
    if (!selectedSemester) {
        setShowWaitDialog(true);
        return;
    }

    setIsDownloading(true);
    try {
        // Call API to get PDF blob
        const response = await downloadTranscriptPDF(selectedSemester);
        
        // Create blob URL
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        
        // Create temporary link and trigger download
        const link = document.createElement('a');
        link.href = url;
        
        // Generate filename
        const periodName = semesterOptions.find(s => s.value === selectedSemester)?.label || 'Transkrip';
        const safePeriodName = periodName.replace(/[^A-Za-z0-9\-]/g, '_');
        const nim = studentInfo.nim !== '-' ? studentInfo.nim : 'Mahasiswa';
        link.download = `KHS_${nim}_${safePeriodName}.pdf`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
    } catch (error) {
        setErrors(prev => ({...prev, export: 'Gagal mengunduh PDF: Gagal mengambil data atau data nilai untuk semester ini belum ada. Silakan coba lagi.'}));
    } finally {
        setIsDownloading(false);
    }
};

const handleBack = () => {
    router.back();
}

// Show loading
if (isLoading) {
    return <LoadingEffect message="Memuat data nilai..." />
} else if (errors.fetch) {
    return (
    <div className="min-h-screen bg-brand-light-sage">
        <Navbar/>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
        <ErrorMessageBoxWithButton
            message={errors.fetch}
            action={fetchAll}
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
        Kembali
    </button>

    {/* Semester Selector */}
    <div className="bg-white rounded-2xl shadow-lg p-4 mb-6" style={{ borderRadius: '16px' }}>
        <div className="flex items-center gap-4">
        <label 
            htmlFor="semester-select"
            className="text-sm font-semibold whitespace-nowrap"
            style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}
        >
            Pilih Periode:
        </label>
        <select
            id="semester-select"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="flex-1 px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:border-opacity-100 transition"
            style={{
            fontFamily: 'Urbanist, sans-serif',
            borderColor: '#015023',
            color: '#015023',
            fontWeight: '600',
            maxWidth: '400px'
            }}
        >
            {semesterOptions.map(option => (
            <option key={option.value} value={option.value}>
                {option.label}
            </option>
            ))}
        </select>
        </div>
    </div>

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
                Detail Nilai Akhir
            </h1>
            <p 
                className="text-lg"
                style={{ color: '#015023', opacity: 0.7, fontFamily: 'Urbanist, sans-serif' }}
            >
                {semesterOptions.find(s => s.value === selectedSemester)?.label}
            </p>
            </div>
        </div>

        <OutlineButton
            onClick={handleExport}
            className="gap-2"
        >
            <Download className="w-4 h-4" />
            Export PDF
        </OutlineButton>
        </div>

        {/* Info Mahasiswa */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
        <div>
            <p className="text-sm font-medium" style={{ color: '#015023', opacity: 0.6, fontFamily: 'Urbanist, sans-serif' }}>
            NIM
            </p>
            <p className="text-lg font-semibold" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
            {studentInfo.nim}
            </p>
        </div>
        <div>
            <p className="text-sm font-medium" style={{ color: '#015023', opacity: 0.6, fontFamily: 'Urbanist, sans-serif' }}>
            Nama Mahasiswa
            </p>
            <p className="text-lg font-semibold" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
            {studentInfo.name}
            </p>
        </div>
        <div>
            <p className="text-sm font-medium" style={{ color: '#015023', opacity: 0.6, fontFamily: 'Urbanist, sans-serif' }}>
            Program Studi
            </p>
            <p className="text-lg font-semibold" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
            {studentInfo.program}
            </p>
        </div>
        </div>
    </div>
    {/* error */}
    {errors.grades || errors.export && (
        <ErrorMessageBoxWithButton 
            message={errors.grades || errors.export} 
            action={errors.grades ? fetchStudentGrades : handleExport} 
        />
    )}

    {/* Loading State nilai */}
    {loadingGrade && (
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center mb-5">
            <p className="text-lg" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>Memuat data Nilai...</p>
        </div>
    )}
    {/* Table Nilai */}
    {!loadingGrade && !errors.grades && (
        <div className="mb-6">
            <DataTable
            columns={columns}
            data={nilaiData}
            actions={[]}
            pagination={false}
            />
        </div>
    )}

    {/* Summary IPK */}
    <div className="bg-white rounded-2xl shadow-lg p-6" style={{ borderRadius: '16px' }}>
        <h3 
        className="text-xl font-bold mb-4"
        style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}
        >
        Ringkasan
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
            <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-medium mb-1" style={{ color: '#015023', opacity: 0.6, fontFamily: 'Urbanist, sans-serif' }}>
                SKS Semester
                </p>
                <p className="text-3xl font-bold" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
                {summary.totalSKSSems}
                </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-medium mb-1" style={{ color: '#015023', opacity: 0.6, fontFamily: 'Urbanist, sans-serif' }}>
                SKS
                </p>
                <p className="text-3xl font-bold" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
                {summary.totalSkS}
                </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-medium mb-1" style={{ color: '#015023', opacity: 0.6, fontFamily: 'Urbanist, sans-serif' }}>
                Nilai SKS Semester
                </p>
                <p className="text-3xl font-bold" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
                {summary.totalNilaiSKSsems.toFixed(2)}
                </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-medium mb-1" style={{ color: '#015023', opacity: 0.6, fontFamily: 'Urbanist, sans-serif' }}>
                Nilai SKS
                </p>
                <p className="text-3xl font-bold" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
                {summary.totalNilaiSKS.toFixed(2)}
                </p>
            </div>
            
            <div 
                className="rounded-xl p-4 text-white"
                style={{ backgroundColor: '#015023' }}
            >
                <p className="text-sm font-medium mb-1" style={{ opacity: 0.8, fontFamily: 'Urbanist, sans-serif' }}>
                IP Semester
                </p>
                <p className="text-3xl font-bold" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                {summary.ips.toFixed(2)}
                </p>
            </div>
            <div 
                className="rounded-xl p-4 text-white"
                style={{ backgroundColor: '#015023' }}
            >
                <p className="text-sm font-medium mb-1" style={{ opacity: 0.8, fontFamily: 'Urbanist, sans-serif' }}>
                IP Kumulatif
                </p>
                <p className="text-3xl font-bold" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                {summary.ipk.toFixed(2)}
                </p>
            </div>
        </div>

        {/* Keterangan Bobot */}
        <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-semibold mb-3" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
            Keterangan Bobot Nilai:
        </h4>
        <div className="grid grid-cols-4 md:grid-cols-8 xl:grid-cols-12 gap-3 text-sm" style={{ fontFamily: 'Urbanist, sans-serif' }}>
            {gradeConversions.length > 0 ? (
                gradeConversions.map((grade) => (
                    <div key={grade.id_grades} className="flex justify-between">
                        <span className="font-medium">{grade.letter}:</span>
                        <span className="text-gray-600">{typeof grade.ip_skor === 'number' ? grade.ip_skor.toFixed(2) : grade.ip_skor}</span>
                    </div>
                ))
            ) : (
                <div className="col-span-full text-center text-gray-500">
                    Memuat keterangan bobot nilai...
                </div>
            )}
        </div>
        </div>
    </div>
    </div>

    {/* Warning Dialog */}
    <AlertWarningDialog
        open={showWaitDialog}
        onOpenChange={setShowWaitDialog}
        title="Data Belum Siap"
        description="Silakan tunggu data nilai dimuat."
        closeText="Tutup"
    />
</div>
);
}
