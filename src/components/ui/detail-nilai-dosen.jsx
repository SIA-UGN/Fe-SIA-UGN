    'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Eye } from 'lucide-react';
import DataTable from '@/components/ui/table';
import { PrimaryButton, OutlineButton, WarningButton } from '@/components/ui/button';
import { Field, FieldLabel, FieldContent } from '@/components/ui/field';
import Navbar from '@/components/ui/navigation-menu';
import LoadingEffect from '@/components/ui/loading-effect';
import { getAcademicPeriods, getLecturerClassesForGrading } from '@/lib/gradingApi';
import { getProfile } from '@/lib/profileApi';
import { ErrorMessageBoxWithButton } from './message-box';

export default function DetailNilaiDosen() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [loadingClass, setLoadingClass] = useState(false);
    const [selectedSemester, setSelectedSemester] = useState('');
    const [semesterOptions, setSemesterOptions] = useState([]);
    const [matkulData, setMatkulData] = useState([]);
    const [lecturerInfo, setLecturerInfo] = useState({
        name: '-',
        totalClasses: 0
    });
    const [errors, setErrors] = useState({});

// Fetch Academic Periods saat component mount
useEffect(() => {
    fetchAllData();
}, []);

// Fetch All 
const fetchAllData = async () => {
    setErrors(prev => ({...prev, fetch: null}));
    setIsLoading(true);
    await Promise.all([
        fetchAcademicPeriods(), 
        fetchLecturerInfo()
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
                setSelectedSemester(options[options.length - 1].value);
            }
        } else {
            setErrors(prev => ({...prev, fetch: 'Gagal memuat data: ' + response.message }));
        }
    } catch (err) {
        setErrors(prev => ({...prev, fetch: 'Terjadi kesalahan saat memuat data: ' + err.message }));
    }
};

const fetchLecturerInfo = async () => {
    try {
        const response = await getProfile();
        
        if (response.status === 'success' && response.data) {
            setLecturerInfo({
                name: response.data.name || '-',
                totalClasses: 0 // Will be updated when fetching classes
            });
        } else {
            setErrors(prev => ({...prev, fetch: 'Gagal memuat data: ' + response.message }));
        }
    } catch (error) {
        setErrors(prev => ({...prev, fetch: 'Terjadi kesalahan saat memuat data: ' + error.message }));
    }
};

// Fetch classes ketika semester berubah
useEffect(() => {
    if (selectedSemester) {
        fetchClassData(selectedSemester);
    }
}, [selectedSemester]);

const fetchClassData = async (academicPeriodId) => {
    setLoadingClass(true);
    setErrors(prev => ({...prev, classes: null}));
    try {
        const response = await getLecturerClassesForGrading(academicPeriodId);
        
        if (response.status === 'success' && response.data) {
            // Transform data ke format yang sesuai dengan table
            const formattedData = response.data.map(item => ({
                id: item.id_class,
                kode_matkul: item.subject?.code || '-',
                nama_matkul: item.subject?.name || '-',
                kelas: item.code_class,
                sks: item.subject?.sks || 0,
                id_class: item.id_class
            }));
            
            setMatkulData(formattedData);
            setLecturerInfo(prev => ({
                ...prev,
                totalClasses: formattedData.length
            }));
        } else {
            setMatkulData([]);
            setErrors(prev => ({...prev, classes: 'Gagal memuat data kelas: ' + response.message }));
        }
    } catch (error) {
        setMatkulData([]);
        setErrors(prev => ({...prev, classes: 'Terjadi kesalahan saat memuat data kelas: ' + error.message }));
    } finally {
        setLoadingClass(false);
    }
};

    // Handle detail nilai click
    const handleDetailNilai = (item) => {
        router.push(`/hasil-studi/input-nilai-mahasiswa/${item.id_class}`);
    };

    const handleBack = () => {
        router.back();
    };

    // Custom render for detail nilai column
    const customRender = {
        nama_matkul: (value, item) => {
            return (
                <div className="text-left">
                    <div className="font-medium" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
                        {item.nama_matkul}
                    </div>
                    <div className="text-sm mt-0.5" style={{ color: '#015023', opacity: 0.6, fontFamily: 'Urbanist, sans-serif' }}>
                        Kelas: {item.kelas}
                    </div>
                </div>
            );
        },
        detail_nilai: (value, item) => {
            return (
                <div className="flex items-center justify-center">
                    <button
                        onClick={() => handleDetailNilai(item)}
                        className="flex items-center gap-2 text-white px-4 py-2 transition shadow-sm hover:opacity-90 font-semibold"
                        style={{ 
                            backgroundColor: '#015023',
                            borderRadius: '12px',
                            fontFamily: 'Urbanist, sans-serif'
                        }}
                    >
                        <Eye className="w-4 h-4" />
                        Detail Nilai
                    </button>
                </div>
            );
        }
    };

    // Define table columns (hanya: no, kode matkul, matkul, sks, detail nilai)
    const columns = [
    { 
        key: 'kode_matkul', 
        label: 'Kode Matkul', 
        width: '130px',
        cellClassName: 'font-medium'
    },
    { 
        key: 'nama_matkul', 
        label: 'Mata Kuliah',
        className: 'text-left'
    },
    { 
        key: 'sks', 
        label: 'SKS', 
        width: '100px',
        cellClassName: 'font-semibold'
    },
    { 
        key: 'detail_nilai', 
        label: 'Aksi', 
        width: '200px'
    },
    ];

    // Show loading
    if (isLoading) {
        return <LoadingEffect message="Memuat data kelas..." />;
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
            Kembali
        </button>

        {/* Semester Selector */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6" style={{ borderRadius: '16px' }}>
            <div className="flex items-center gap-4">
            <label 
                htmlFor="semester-select-dosen"
                className="text-sm font-semibold whitespace-nowrap"
                style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}
            >
                Pilih Periode:
            </label>
            <select
                id="semester-select-dosen"
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
                    Daftar Mata Kuliah
                </h1>
                <p 
                    className="text-lg"
                    style={{ color: '#015023', opacity: 0.7, fontFamily: 'Urbanist, sans-serif' }}
                >
                    {semesterOptions.find(s => s.value === selectedSemester)?.label}
                </p>
                </div>
            </div>
            </div>

            {/* Info Dosen */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div>
                <p className="text-sm font-medium" style={{ color: '#015023', opacity: 0.6, fontFamily: 'Urbanist, sans-serif' }}>
                Dosen Pengampu
                </p>
                <p className="text-lg font-semibold" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
                {lecturerInfo.name}
                </p>
            </div>
            <div>
                <p className="text-sm font-medium" style={{ color: '#015023', opacity: 0.6, fontFamily: 'Urbanist, sans-serif' }}>
                Jumlah Mata Kuliah
                </p>
                <p className="text-lg font-semibold" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
                {lecturerInfo.totalClasses} Mata Kuliah
                </p>
            </div>
            </div>
        </div>

        {/* error */}
        {errors.classes && (
            <ErrorMessageBoxWithButton 
                message={errors.classes} 
                action={fetchClassData} 
            />
        )}

        {/* Loading State kelas */}
        {loadingClass && (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center mb-5">
                <p className="text-lg" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>Memuat data kelas...</p>
            </div>
        )}

        {/* Table Nilai */}
        {!loadingClass && !errors.classes && (
            <div>
                <DataTable
                columns={columns}
                data={matkulData}
                actions={[]}
                pagination={false}
                customRender={customRender}
                />
            </div>
        )}
        </div>
        </div>
    );
}
