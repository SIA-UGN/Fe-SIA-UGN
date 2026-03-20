'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, User, MapPin, Users, Eye, EyeOff, Upload, X, Lock, Trash2 } from 'lucide-react';
import { Field, FieldLabel, FieldContent, FieldDescription, FieldError } from '@/components/ui/field';
import { PrimaryButton, OutlineButton, WarningButton } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getStudentProfile, getStudentAddress, getStudentFamilyEducation, updateStudentProfile, updateStudentAddress, updateStudentFamilyEducation, changePassword, deleteProfileImage } from '@/lib/profileApi';
import LoadingEffect from './loading-effect';
import { buildImageUrl } from '@/lib/utils';
import { ErrorMessageBox, SuccessMessageBox, ErrorMessageBoxWithButton } from './message-box';
import { useAuth } from '@/lib/auth-context';
import {
  AlertConfirmationDialog,
  AlertConfirmationRedDialog,
} from '@/components/ui/alert-dialog';

export default function ProfileMahasiswa() {
const router = useRouter();
const { refreshUser } = useAuth();
const [isLoading, setIsLoading] = useState(false);
const [isFetching, setIsFetching] = useState(true);
const [isDeleting, setIsDeleting] = useState(false);
const [success, setSuccess] = useState({});
const [errors, setErrors] = useState({});
const [showOldPassword, setShowOldPassword] = useState(false);
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const [imagePreview, setImagePreview] = useState(null);
const [showSaveDialog, setShowSaveDialog] = useState(false);
const [showCancelDialog, setShowCancelDialog] = useState(false);

// State untuk data profile mahasiswa
const [profileData, setProfileData] = useState({
    // Data yang bisa edit dan dilihat
    // profile umum
    registration_number: '',
    full_name: '',
    username: '',
    email: '',
    program: '', 

    //
    old_password: '',
    password: '',
    confirm_password: '',
    profile_image: null,
    alamat: '',
    dusun: '',
    kelurahan: '',
    kecamatan: '',
    city_regency: '',
    provinsi: '',
    kode_pos: '',

    // Data yang bisa edit dan dilihat
    gender: '',
    religion: '',
    tanggal_lahir: '',
    tempat_lahir: '',
    nik: '',
    nomor_kartu_keluarga: '',
    citizenship: '',
    birth_order: '',
    jumlah_saudara: '',
    sekolah_asal: '',
    ijazah_terakhir: '',
});

const [oldData, setOldData] = useState({
    // Data yang bisa edit dan dilihat
    // profile umum
    registration_number: '',
    full_name: '',
    username: '',
    email: '',
    program: '', 

    //
    old_password: '',
    password: '',
    confirm_password: '',
    profile_image: null,
    alamat: '',
    dusun: '',
    kelurahan: '',
    kecamatan: '',
    city_regency: '',
    provinsi: '',
    kode_pos: '',

    // Data yang bisa edit dan dilihat
    gender: '',
    religion: '',
    tanggal_lahir: '',
    tempat_lahir: '',
    nik: '',
    nomor_kartu_keluarga: '',
    citizenship: '',
    birth_order: '',
    jumlah_saudara: '',
    sekolah_asal: '',
    ijazah_terakhir: '',
});

const [editableData, setEditableData] = useState({
    // Data yang bisa edit opsional kalo data di database null
    // profile umum
    gender: false,
    tanggal_lahir: false,
    tempat_lahir: false,
    nik: false,
    nomor_kartu_keluarga: false,

    // keluarga-pendidikan
    birth_order: false,
    sekolah_asal: false,
    ijazah_terakhir: false,
});

useEffect(() => {
    fetchAll();
}, []);

const fetchAll = async () => {
    setErrors(prev => ({...prev, fetch: null}));
    setIsFetching(true);
    await Promise.all([
        FetchProfileData(),
        FetchAddressData(),
        FetchFamilyEducationData(),
    ]);
    setIsFetching(false);
};

const FetchProfileData = async () => {
    // alert('Debug: FetchProfileData dipanggil');
    try {
        const response = await getStudentProfile()
        if (response.status === 'success') {
            setProfileData(prev => ({
                ...prev, 
                registration_number: response.data.registration_number,
                full_name: response.data.name,
                username: response.data.username,
                email: response.data.email,
                profile_image: response.data.profile_image,
                program: response.data.program_name,
                gender: response.data.gender,
                religion: response.data.religion,
                tanggal_lahir: response.data.birth_date ? response.data.birth_date.slice(0, 10) : '',
                tempat_lahir: response.data.birth_place,
                nik: response.data.nik,
                nomor_kartu_keluarga: response.data.no_kk,
                citizenship: response.data.citizenship,
            }));
            setOldData(prev => ({
                ...prev,
                registration_number: response.data.registration_number,
                full_name: response.data.name,
                username: response.data.username,
                email: response.data.email,
                profile_image: response.data.profile_image,
                program: response.data.program_name,
                gender: response.data.gender,
                religion: response.data.religion,
                tanggal_lahir: response.data.birth_date ? response.data.birth_date.slice(0, 10) : '',
                tempat_lahir: response.data.birth_place,
                nik: response.data.nik,
                nomor_kartu_keluarga: response.data.no_kk,
                citizenship: response.data.citizenship,
            }));
            setEditableData(prev => ({
                ...prev,
                gender: response.data.editable_fields.gender,
                tanggal_lahir: response.data.editable_fields.birth_date,
                tempat_lahir: response.data.editable_fields.birth_place,
                nik: response.data.editable_fields.nik,
                nomor_kartu_keluarga: response.data.editable_fields.no_kk,
            }))
        } else {
            setErrors(prev => ({...prev, fetch: 'Gagal mengambil data profile: ' + response.message}));
        }
    } catch (error) {
        setErrors(prev => ({...prev, fetch: 'Gagal mengambil data profile: ' + error.message}));
    }
};

const FetchAddressData = async () => {
    try {
        const response = await getStudentAddress()
        if (response.status === 'success') {
            setProfileData(prev => ({
                ...prev,
                alamat: response.data.full_address,
                dusun: response.data.dusun,
                kelurahan: response.data.kelurahan,
                kecamatan: response.data.kecamatan,
                city_regency: response.data.city_regency,
                provinsi: response.data.province,
                kode_pos: response.data.postal_code,
            }));
            setOldData(prev => ({
                ...prev,
                alamat: response.data.full_address,
                dusun: response.data.dusun,
                kelurahan: response.data.kelurahan,
                kecamatan: response.data.kecamatan,
                city_regency: response.data.city_regency,
                provinsi: response.data.province,
                kode_pos: response.data.postal_code,
            }));
        } else {
            setErrors(prev => ({...prev, fetch: 'Gagal mengambil data alamat: ' + response.message}));
        }
    } catch (error) {
        setErrors(prev => ({...prev, fetch: 'Gagal mengambil data alamat: ' + error.message}));
    }
};

const FetchFamilyEducationData = async () => {
    try {
        const response = await getStudentFamilyEducation()
        if (response.status === 'success') {
            setProfileData(prev => ({
                ...prev,
                birth_order: response.data.birth_order,
                jumlah_saudara: response.data.number_of_siblings,
                sekolah_asal: response.data.previous_school,
                ijazah_terakhir: response.data.last_ijazah,
            }));
            setOldData(prev => ({
                ...prev,
                birth_order: response.data.birth_order,
                jumlah_saudara: response.data.number_of_siblings,
                sekolah_asal: response.data.previous_school,
                ijazah_terakhir: response.data.last_ijazah,
            }));
            setEditableData(prev => ({
                ...prev,
                birth_order: response.data.editable_fields.birth_order,
                sekolah_asal: response.data.editable_fields.previous_school,
                ijazah_terakhir: response.data.editable_fields.last_ijazah,
            }))
        } else {
            setErrors(prev => ({...prev, fetch: 'Gagal mengambil data edukasi: ' + response.message}));
        }
    } catch (error) {
        setErrors(prev => ({...prev,  fetch: 'Gagal mengambil data edukasi: ' + error.message}))
    }
};

const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
        ...prev,
        [name]: value
    }));
    // Clear error untuk field ini
    if (errors[name]) {
        setErrors(prev => ({
        ...prev,
        [name]: ''
        }));
    }
    // Clear general submit error
    if (errors.submit || errors.submitpassword || errors.submitaddress || errors.submitfamilyeducation) {
        setErrors(prev => ({
        ...prev,
        submit: null,
        submitpassword: null,
        submitaddress: null,
        submitfamilyeducation: null
        }));
    }
};

const handleImageChange = (e) => {
const file = e.target.files[0];
if (file) {
    // Validasi ukuran file (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
    setErrors(prev => ({
        ...prev,
        profile_image: 'Ukuran file maksimal 2MB'
    }));
    return;
    }

    // Validasi tipe file
    if (!file.type.startsWith('image/')) {
    setErrors(prev => ({
        ...prev,
        profile_image: 'File harus berupa gambar'
    }));
    return;
    }

    setProfileData(prev => ({
    ...prev,
    profile_image: file
    }));

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
    setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Clear error
    if (errors.profile_image) {
    setErrors(prev => ({
        ...prev,
        profile_image: ''
    }));
    }
}
};

const handleRemoveImage = () => {
setProfileData(prev => ({
    ...prev,
    profile_image: null
}));
setImagePreview(null);
};

const validateForm = () => {
const newErrors = {};

// Validasi data wajib

if (!profileData.full_name?.trim()) {
    newErrors.full_name = 'Nama Lengkap wajib diisi';
}

if (!profileData.username?.trim()) {
    newErrors.username = 'Username wajib diisi';
} else if (profileData.username.length < 3) {
    newErrors.username = 'Username minimal 3 karakter';
}

if (!profileData.email?.trim()) {
    newErrors.email = 'Email wajib diisi';
} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
    newErrors.email = 'Format email tidak valid';
}

// Validasi password (opsional, hanya jika diisi)
if (profileData.password || profileData.old_password || profileData.confirm_password) {
    // Jika mengisi password baru, harus mengisi password lama
    if ((profileData.password || profileData.confirm_password) && !profileData.old_password) {
    newErrors.old_password = 'Password lama wajib diisi untuk mengubah password';
    }
    
    if (profileData.password && profileData.password.length < 8) {
    newErrors.password = 'Password minimal 8 karakter';
    }
    
    if (profileData.password !== profileData.confirm_password) {
    newErrors.confirm_password = 'Password tidak cocok';
    }
}

if (!profileData.alamat?.trim()) {
    newErrors.alamat = 'Alamat wajib diisi';
}

if (!profileData.dusun?.trim()) {
    newErrors.dusun = 'Dusun wajib diisi';
}

if (!profileData.kelurahan?.trim()) {
    newErrors.kelurahan = 'Kelurahan wajib diisi';
}

if (!profileData.kecamatan?.trim()) {
    newErrors.kecamatan = 'Kecamatan wajib diisi';
}

if (!profileData.city_regency?.trim()) {
    newErrors.city_regency = 'Kota/Kabupaten wajib diisi';
}
if (!profileData.provinsi?.trim()) {
    newErrors.provinsi = 'Provinsi wajib diisi';
}
if (!profileData.kode_pos?.trim()) {
    newErrors.kode_pos = 'Kode Pos wajib diisi';
}

if (!profileData.gender) {
    newErrors.gender = 'Jenis Kelamin wajib dipilih';
}

if (!profileData.religion) {
    newErrors.religion = 'Agama wajib dipilih';
}

if (!profileData.tanggal_lahir) {
    newErrors.tanggal_lahir = 'Tanggal Lahir wajib diisi';
}

if (!profileData.tempat_lahir?.trim()) {
    newErrors.tempat_lahir = 'Tempat Lahir wajib diisi';
}

if (!profileData.nik?.trim()) {
    newErrors.nik = 'NIK wajib diisi';
} else if (profileData.nik.length !== 16) {
    newErrors.nik = 'NIK harus 16 digit';
}
if (!profileData.nomor_kartu_keluarga?.trim()) {
    newErrors.nomor_kartu_keluarga = 'No KK wajib diisi';
} else if (profileData.nomor_kartu_keluarga.length !== 16) {
    newErrors.nomor_kartu_keluarga = 'No KK harus 16 digit';
}
if (!profileData.citizenship) {
    newErrors.citizenship = 'Kewarganegaraan wajib dipilih';
}
if (!profileData.birth_order) {
    newErrors.birth_order = 'Anak ke-berapa wajib diisi';
}
if (!profileData.jumlah_saudara) {
    newErrors.jumlah_saudara = 'Jumlah saudara wajib diisi';
}
if (!profileData.sekolah_asal?.trim()) {
    newErrors.sekolah_asal = 'Sekolah Asal wajib diisi';
}
if (!profileData.ijazah_terakhir) {
    newErrors.ijazah_terakhir = 'Ijazah Terakhir wajib dipilih';
}

setErrors(newErrors);
return Object.keys(newErrors).length === 0;
};

const getStudentIdenititySubmissionBecauseApiWantOnlyUpdatedDataToSend = () => {
    const updatedData = {};
    if (profileData.full_name !== oldData.full_name) {
        updatedData.name = profileData.full_name;
        updatedData.full_name = profileData.full_name;
    }
    if (profileData.username !== oldData.username) {
        updatedData.username = profileData.username;
    }
    if (profileData.profile_image !== oldData.profile_image) {
        updatedData.profile_image = profileData.profile_image;
    }
    if (profileData.gender !== oldData.gender && editableData.gender) {
        updatedData.gender = profileData.gender;
    }
    if (profileData.religion !== oldData.religion) {
        updatedData.religion = profileData.religion;
    }
    if (profileData.tanggal_lahir !== oldData.tanggal_lahir && editableData.tanggal_lahir) {
        updatedData.birth_date = profileData.tanggal_lahir;
    }
    if (profileData.tempat_lahir !== oldData.tempat_lahir && editableData.tempat_lahir) {
        updatedData.birth_place = profileData.tempat_lahir;
    }
    if (profileData.nik !== oldData.nik && editableData.nik) {
        updatedData.nik = profileData.nik;
    }
    if (profileData.nomor_kartu_keluarga !== oldData.nomor_kartu_keluarga && editableData.nomor_kartu_keluarga) {
        updatedData.no_kk = profileData.nomor_kartu_keluarga;
    }
    if (profileData.citizenship !== oldData.citizenship) {
        updatedData.citizenship = profileData.citizenship;
    }
    return updatedData;
};

const getStudentStudentFamilyAndEducationSubmissionBecauseApiWantOnlyUpdatedDataToSend = () => {
    const updatedData = {};
    if (profileData.birth_order !== oldData.birth_order && editableData.birth_order) {
        updatedData.birth_order = profileData.birth_order;
    }
    if (profileData.jumlah_saudara !== oldData.jumlah_saudara) {
        updatedData.number_of_siblings = profileData.jumlah_saudara;
    }
    if (profileData.sekolah_asal !== oldData.sekolah_asal && editableData.sekolah_asal) {
        updatedData.previous_school = profileData.sekolah_asal;
    }
    if (profileData.ijazah_terakhir !== oldData.ijazah_terakhir && editableData.ijazah_terakhir) {
        updatedData.last_ijazah = profileData.ijazah_terakhir;
    }
    return updatedData;
};

const handleSubmit = async (e) => {
e.preventDefault();

if (!validateForm()) {
    setErrors(prev => ({
        ...prev,
        submit: 'Data tidak valid, silakan periksa kembali form di atas',
    }));
    return;
}

setShowSaveDialog(true);
};

const confirmSave = async () => {
setShowSaveDialog(false);
setIsLoading(true);
setErrors(prev => ({
    ...prev,
    submit: null,
    submitpassword: null,
    submitaddress: null,
    submitfamilyeducation: null
}));

const newErrors = {};
const newSuccess = {};
try {
    const response = await updateStudentProfile(getStudentIdenititySubmissionBecauseApiWantOnlyUpdatedDataToSend());
    if (response.status === 'success') {
        newSuccess.submit = 'Data Identitas berhasil diperbarui';
        oldData.full_name = profileData.full_name;
        oldData.username = profileData.username;
        oldData.profile_image = response.data.profile_image;
        oldData.gender = profileData.gender;
        oldData.religion = profileData.religion;
        oldData.tanggal_lahir = profileData.tanggal_lahir;
        oldData.tempat_lahir = profileData.tempat_lahir;
        oldData.nik = profileData.nik;
        oldData.nomor_kartu_keluarga = profileData.nomor_kartu_keluarga;
        oldData.citizenship = profileData.citizenship;

        editableData.gender = oldData.gender ? false : true;
        editableData.tanggal_lahir = oldData.tanggal_lahir ? false : true;
        editableData.tempat_lahir = oldData.tempat_lahir ? false : true;
        editableData.nik = oldData.nik ? false : true;
        editableData.nomor_kartu_keluarga = oldData.nomor_kartu_keluarga ? false : true;

        // Refresh user data in auth context
        await refreshUser();
        setImagePreview(null);
    } else {
        newErrors.submit = 'Gagal memperbarui data identitas: ' + response.message;
        return;
    }
    const responseAddress = await updateStudentAddress({
        full_address : profileData.alamat,
        dusun : profileData.dusun,
        kelurahan : profileData.kelurahan,
        kecamatan : profileData.kecamatan,
        city_regency : profileData.city_regency,
        province : profileData.provinsi,
        postal_code : profileData.kode_pos,
    });
    if (responseAddress.status === 'success') {
        newSuccess.submitaddress = 'Alamat berhasil diperbarui';
        oldData.alamat = profileData.alamat;
        oldData.dusun = profileData.dusun;
        oldData.kelurahan = profileData.kelurahan;
        oldData.kecamatan = profileData.kecamatan;
        oldData.city_regency = profileData.city_regency;
        oldData.provinsi = profileData.provinsi;
        oldData.kode_pos = profileData.kode_pos;
    } else {
        newErrors.submitaddress = 'Gagal memperbarui data alamat: ' + responseAddress.message;
        return;
    }
    const responseFamilyEducation = await updateStudentFamilyEducation(getStudentStudentFamilyAndEducationSubmissionBecauseApiWantOnlyUpdatedDataToSend());
    if (responseFamilyEducation.status === 'success') {
        newSuccess.submitfamilyeducation = 'Data keluarga & pendidikan berhasil diperbarui';
        oldData.birth_order = profileData.birth_order;
        oldData.jumlah_saudara = profileData.jumlah_saudara;
        oldData.sekolah_asal = profileData.sekolah_asal;
        oldData.ijazah_terakhir = profileData.ijazah_terakhir;

        editableData.birth_order = oldData.birth_order ? false : true;
        editableData.sekolah_asal = oldData.sekolah_asal ? false : true;
        editableData.ijazah_terakhir = oldData.ijazah_terakhir ? false : true;

    } else {
        newErrors.submitfamilyeducation = 'Gagal memperbarui data keluarga & pendidikan: ' + responseFamilyEducation.message;
        return;
    }
    if (profileData.password && profileData.old_password && profileData.confirm_password) {
        const passwordResponse = await changePassword({
            old_password: profileData.old_password,
            password: profileData.password,
            confirm_password: profileData.confirm_password,
        });
        if (passwordResponse.status === 'success') {
            newSuccess.submitpassword = 'Password berhasil diperbarui';
            // Clear password fields
            setProfileData(prev => ({
                ...prev,
                old_password: '',
                password: '',
                confirm_password: ''
            }));
        } else {
            newErrors.submitpassword = 'Gagal memperbarui password: ' + passwordResponse.message;
            return;
        }
    }

} catch (error) {
    newErrors.submit = 'Gagal memperbarui profile: ' + error.message;
} finally {
    setIsLoading(false);
    setErrors(prev => ({
        ...prev,
        ...newErrors
    }));
    setSuccess(prev => ({
        ...prev,
        ...newSuccess
    }));
}
};
const handleDeleteProfileImage = async () => {
    setIsDeleting(true)
    setErrors(prev => ({ ...prev, deleteProfileImage: null }));
    try {
        const response = await deleteProfileImage();
        if (response.status === 'success') {
            setOldData(prev => ({
                ...prev,
                profile_image: null
            }));
            refreshUser();
            setSuccess(prev => ({ ...prev, deleteProfileImage: 'Gambar profil berhasil dihapus' }));
        } else {
            setErrors(prev => ({ ...prev, deleteProfileImage: 'Gagal menghapus gambar profil: ' + response.message }));
        }
    } catch (error) {
        setErrors(prev => ({ ...prev, deleteProfileImage: 'Gagal menghapus gambar profil: ' + error.message }));
    } finally {
        setIsDeleting(false)
    }
};

const handleCancel = () => {
    setShowCancelDialog(true);
};

const confirmCancel = () => {
    setShowCancelDialog(false);
    router.back();
};
const handleBack = () => {
    router.back();
};

const genderOptions = ['Laki-laki', 'Perempuan'];
const religionOptions = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'];
const citizenshipOptions = ['WNI', 'WNA'];
const ijazahOption = ['SMA', 'SMK' , 'MA', 'Paket C', 'Lainnya']

// restart success message after 5 seconds
useEffect(() => {
    if (success.submit || success.submitpassword || success.submitaddress || success.submitfamilyeducation || success.deleteProfileImage) {
        const timer = setTimeout(() => {
            setSuccess({
                submit: '',
                submitpassword: '',
                submitaddress: '',
                submitfamilyeducation: ''
            });
        }, 5000);

        return () => clearTimeout(timer);
    }
}, [success]);

if (isFetching) {
    return (
        <LoadingEffect />
    );
}

if (errors.fetch) {
    return (
        <div className="min-h-screen bg-brand-light-sage">
            <div className="container mx-auto px-4 py-8 max-w-5xl">
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Button */}
        <button
    onClick={() => router.back()}
    className="flex items-center gap-2 mb-6 font-medium hover:opacity-80 transition"
    style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}
    >
    <ArrowLeft className="w-5 h-5" />
    Kembali
    </button>

    {/* Header dengan Avatar */}
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6" style={{ borderRadius: '16px' }}>
    <div className="flex items-center gap-6">
        <Avatar className="size-24 sm:size-28">
        <AvatarImage src={buildImageUrl(oldData.profile_image)} alt={oldData.full_name} />
        <AvatarFallback className="text-2xl">
            {oldData.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
        </AvatarFallback>
        </Avatar>
        <div>
        <h1 
            className="text-2xl sm:text-3xl font-bold mb-2"
            style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}
        >
            Profile Mahasiswa
        </h1>
        <p 
            className="text-lg"
            style={{ color: '#015023', opacity: 0.7, fontFamily: 'Urbanist, sans-serif' }}
        >
            {oldData.full_name}
        </p>
        <p 
            className="text-sm"
            style={{ color: '#015023', opacity: 0.6, fontFamily: 'Urbanist, sans-serif' }}
        >
            NIM: {oldData.registration_number}
        </p>
        </div>
    </div>
    </div>

    {/* Form */}
    <form onSubmit={handleSubmit} className="space-y-6">
    {/* Section 1: Data Identitas */}
    <div 
        className="bg-white rounded-2xl shadow-lg p-6"
        style={{ borderRadius: '16px' }}
    >
        <div className="flex items-center gap-3 mb-6">
        <div 
            className="p-3 rounded-xl"
            style={{ backgroundColor: '#015023' }}
        >
            <User className="w-6 h-6 text-white" />
        </div>
        <div>
            <h2 
            className="text-xl font-bold"
            style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}
            >
            Data Identitas
            </h2>
            <p 
            className="text-sm"
            style={{ color: '#015023', opacity: 0.6, fontFamily: 'Urbanist, sans-serif' }}
            >
            Informasi pribadi dan identitas
            </p>
        </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Registration Number */}
        <Field>
            <FieldLabel htmlFor="registration_number">
            Registration Number (NIM) <span className="text-red-500">*</span>
            </FieldLabel>
            <FieldDescription>
            Nomor induk mahasiswa <span className="text-red-500">(tidak dapat diubah)</span>
            </FieldDescription>
            <FieldContent>
            <input
                type="text"
                id="registration_number"
                name="registration_number"
                value={profileData.registration_number}
                className="w-full px-4 py-3 border-2 focus:outline-none cursor-not-allowed bg-gray-50"
                style={{
                fontFamily: 'Urbanist, sans-serif',
                borderColor: '#015023',
                borderRadius: '12px',
                opacity: 0.5
                }}
                disabled
                readOnly
            />
            </FieldContent>
            {errors.registration_number && (
            <FieldError>{errors.registration_number}</FieldError>
            )}
        </Field>

        {/* Full Name */}
        <Field>
            <FieldLabel htmlFor="full_name">
            Nama Lengkap <span className="text-red-500">*</span>
            </FieldLabel>
            <FieldDescription>
            Nama lengkap sesuai KTP
            </FieldDescription>
            <FieldContent>
            <input
                type="text"
                id="full_name"
                name="full_name"
                value={profileData.full_name}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 focus:outline-none focus:border-opacity-100"
                style={{
                fontFamily: 'Urbanist, sans-serif',
                borderColor: errors.full_name ? '#BE0414' : '#015023',
                borderRadius: '12px',
                opacity: errors.full_name ? 1 : 0.7
                }}
                disabled={isLoading}
            />
            </FieldContent>
            {errors.full_name && (
            <FieldError>{errors.full_name}</FieldError>
            )}
        </Field>

        {/* Username */}
        <Field>
            <FieldLabel htmlFor="username">
            Username <span className="text-red-500">*</span>
            </FieldLabel>
            <FieldDescription>
            Username untuk login (min. 3 karakter)
            </FieldDescription>
            <FieldContent>
            <input
                type="text"
                id="username"
                name="username"
                value={profileData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 focus:outline-none focus:border-opacity-100"
                style={{
                fontFamily: 'Urbanist, sans-serif',
                borderColor: errors.username ? '#BE0414' : '#015023',
                borderRadius: '12px',
                opacity: errors.username ? 1 : 0.7
                }}
                disabled={isLoading}
            />
            </FieldContent>
            {errors.username && (
            <FieldError>{errors.username}</FieldError>
            )}
        </Field>

        {/* Email */}
        <Field>
            <FieldLabel htmlFor="email">
            Email <span className="text-red-500">*</span>
            </FieldLabel>
            <FieldDescription>
            Email aktif untuk komunikasi <span className="text-red-500">(tidak dapat diubah)</span>
            </FieldDescription>
            <FieldContent>
            <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                className="w-full px-4 py-3 border-2 focus:outline-none cursor-not-allowed bg-gray-50"
                style={{
                fontFamily: 'Urbanist, sans-serif',
                borderColor: errors.email ? '#BE0414' : '#015023',
                borderRadius: '12px',
                opacity: 0.5
                }}
                disabled
                readOnly
            />
            </FieldContent>
            {errors.email && (
            <FieldError>{errors.email}</FieldError>
            )}
        </Field>

        {/* Profile Image */}
        <Field className="md:col-span-2">
            <FieldLabel htmlFor="profile_image">
            Foto Profil
            </FieldLabel>
            <FieldDescription>
            Upload foto profil (max. 2MB, format: JPG, PNG, JPEG)
            </FieldDescription>
            <FieldContent>
            <div className="flex items-center gap-4">
                {imagePreview && (
                <div className="relative">
                    <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-20 h-20 rounded-full object-cover border-2"
                    style={{ borderColor: '#015023' }}
                    />
                    <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition"
                    >
                    <X className="w-4 h-4" />
                    </button>
                </div>
                )}
                <label
                htmlFor="profile_image"
                className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition hover:opacity-80"
                style={{
                    backgroundColor: '#015023',
                    color: 'white',
                    fontFamily: 'Urbanist, sans-serif'
                }}
                >
                <Upload className="w-5 h-5" />
                {oldData.profile_image ? 'Ganti Foto' : 'Upload Foto'}
                </label>
                <input
                type="file"
                id="profile_image"
                name="profile_image"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={isLoading}
                />
                {oldData.profile_image && (
                    <button
                    type="button"
                    onClick={handleDeleteProfileImage}
                    className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition hover:opacity-80"
                    style={{
                        backgroundColor: '#BE0414',
                        color: 'white',
                        fontFamily: 'Urbanist, sans-serif'
                    }}
                    disabled={!profileData.profile_image || isLoading}
                    >
                    {isDeleting ? (
                    <>
                        <span className="animate-spin mr-2">⏳</span>
                        Menghapus....
                    </>
                    ) : (
                    <>
                        <Trash2 /> Hapus Foto
                    </>
                    )}
                    </button>
                )}
            </div>
            </FieldContent>
            {errors.profile_image && (
            <p className="text-red-500 text-sm mt-1">{errors.profile_image}</p>
            )}
        </Field>
        <Field className="md:col-span-2">
            {success.deleteProfileImage && (
                <SuccessMessageBox message={success.deleteProfileImage} onClose={() => setSuccess(prev => ({ ...prev, deleteProfileImage: '' }))} />
            )}
            {errors.deleteProfileImage && (
                <ErrorMessageBox message={errors.deleteProfileImage} onClose={() => setErrors(prev => ({ ...prev, deleteProfileImage: null }))} />
            )}
        </Field>

        {/* Gender */}
        <Field>
            <FieldLabel htmlFor="gender">
            Jenis Kelamin <span className="text-red-500">*</span>
            </FieldLabel>
            <FieldDescription>
            Pilih jenis kelamin <span className="text-red-500">{!editableData.gender ? '(tidak dapat diubah)' : '(tidak dapat diubah setelah disimpan)'}</span>
            </FieldDescription>
            <FieldContent>
            <select
                id="gender"
                name="gender"
                value={profileData.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 focus:outline-none focus:border-opacity-100 appearance-none cursor-pointer"
                style={{
                fontFamily: 'Urbanist, sans-serif',
                borderColor: errors.gender ? '#BE0414' : '#015023',
                borderRadius: '12px',
                opacity: !editableData.gender ? 0.5 : errors.gender ? 1 : 0.7,
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23015023' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1.5rem'
                }}
                disabled={!editableData.gender || isLoading}
                readOnly={!editableData.gender}
            >
                <option value="" disabled>Pilih Jenis Kelamin</option>
                {genderOptions.map(option => (
                <option key={option} value={option}>{option}</option>
                ))}
            </select>
            </FieldContent>
            {errors.gender && (
            <FieldError>{errors.gender}</FieldError>
            )}
        </Field>

        {/* Religion */}
        <Field>
            <FieldLabel htmlFor="religion">
            Agama <span className="text-red-500">*</span>
            </FieldLabel>
            <FieldDescription>
            Pilih agama
            </FieldDescription>
            <FieldContent>
            <select
                id="religion"
                name="religion"
                value={profileData.religion || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 focus:outline-none focus:border-opacity-100 appearance-none cursor-pointer"
                style={{
                fontFamily: 'Urbanist, sans-serif',
                borderColor: errors.religion ? '#BE0414' : '#015023',
                borderRadius: '12px',
                opacity: errors.religion ? 1 : 0.7,
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23015023' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1.5rem'
                }}
                disabled={isLoading}
            >
                <option value="" disabled>Pilih Agama</option>
                {religionOptions.map(option => (
                <option key={option} value={option}>{option}</option>
                ))}
            </select>
            </FieldContent>
            {errors.religion && (
            <FieldError>{errors.religion}</FieldError>
            )}
        </Field>

        {/* Tempat Lahir */}
        <Field>
            <FieldLabel htmlFor="tempat_lahir">
            Tempat Lahir <span className="text-red-500">*</span>
            </FieldLabel>
            <FieldDescription>
            Kota/Kabupaten tempat lahir <span className="text-red-500">{!editableData.tempat_lahir ? '(tidak dapat diubah)' : '(tidak dapat diubah setelah disimpan)'}</span>
            </FieldDescription>
            <FieldContent>
            <input
                type="text"
                id="tempat_lahir"
                name="tempat_lahir"
                value={profileData.tempat_lahir}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 focus:outline-none focus:border-opacity-100"
                style={{
                fontFamily: 'Urbanist, sans-serif',
                borderColor: errors.tempat_lahir ? '#BE0414' : '#015023',
                borderRadius: '12px',
                opacity: !editableData.tempat_lahir ? 0.5 : errors.tempat_lahir ? 1 : 0.7
                }}
                disabled={!editableData.tempat_lahir || isLoading}
                readOnly={!editableData.tempat_lahir}
            />
            </FieldContent>
            {errors.tempat_lahir && (
            <FieldError>{errors.tempat_lahir}</FieldError>
            )}
        </Field>

        {/* Tanggal Lahir */}
        <Field>
            <FieldLabel htmlFor="tanggal_lahir">
            Tanggal Lahir <span className="text-red-500">*</span>
            </FieldLabel>
            <FieldDescription>
            Format: DD/MM/YYYY <span className="text-red-500">{!editableData.tanggal_lahir ? '(tidak dapat diubah)' : '(tidak dapat diubah setelah disimpan)'}</span>
            </FieldDescription>
            <FieldContent>
            <input
                type="date"
                id="tanggal_lahir"
                name="tanggal_lahir"
                value={profileData.tanggal_lahir}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 focus:outline-none focus:border-opacity-100"
                style={{
                fontFamily: 'Urbanist, sans-serif',
                borderColor: errors.tanggal_lahir ? '#BE0414' : '#015023',
                borderRadius: '12px',
                opacity: !editableData.tanggal_lahir ? 0.5 : errors.tanggal_lahir ? 1 : 0.7
                }}
                disabled={!editableData.tanggal_lahir || isLoading}
                readOnly={!editableData.tanggal_lahir}
            />
            </FieldContent>
            {errors.tanggal_lahir && (
            <FieldError>{errors.tanggal_lahir}</FieldError>
            )}
        </Field>

        {/* NIK */}
        <Field>
            <FieldLabel htmlFor="nik">
            NIK (Nomor Induk Kependudukan) <span className="text-red-500">*</span>
            </FieldLabel>
            <FieldDescription>
            16 digit NIK sesuai KTP <span className="text-red-500">{!editableData.nik ? '(tidak dapat diubah)' : '(tidak dapat diubah setelah disimpan)'}</span>
            </FieldDescription>
            <FieldContent>
            <input
                type="text"
                id="nik"
                name="nik"
                value={profileData.nik}
                onChange={handleChange}
                maxLength="16"
                className="w-full px-4 py-3 border-2 focus:outline-none focus:border-opacity-100"
                style={{
                fontFamily: 'Urbanist, sans-serif',
                borderColor: errors.nik ? '#BE0414' : '#015023',
                borderRadius: '12px',
                opacity: !editableData.nik ? 0.5 : errors.nik ? 1 : 0.7
                }}
                disabled={!editableData.nik || isLoading}
                readOnly={!editableData.nik}
            />
            </FieldContent>
            {errors.nik && (
            <FieldError>{errors.nik}</FieldError>
            )}
        </Field>

        {/* Nomor Kartu Keluarga */}
        <Field>
            <FieldLabel htmlFor="nomor_kartu_keluarga">
            Nomor Kartu Keluarga
            </FieldLabel>
            <FieldDescription>
            16 digit nomor KK <span className="text-red-500">{!editableData.nomor_kartu_keluarga ? '(tidak dapat diubah)' : '(tidak dapat diubah setelah disimpan)'}</span>
            </FieldDescription>
            <FieldContent>
            <input
                type="text"
                id="nomor_kartu_keluarga"
                name="nomor_kartu_keluarga"
                value={profileData.nomor_kartu_keluarga}
                onChange={handleChange}
                maxLength="16"
                className="w-full px-4 py-3 border-2 focus:outline-none focus:border-opacity-100"
                style={{
                fontFamily: 'Urbanist, sans-serif',
                borderColor: errors.nomor_kartu_keluarga ? '#BE0414' : '#015023',
                borderRadius: '12px',
                opacity: !editableData.nomor_kartu_keluarga ? 0.5 : errors.nomor_kartu_keluarga ? 1 : 0.7
                }}
                disabled={!editableData.nomor_kartu_keluarga || isLoading}
                readOnly={!editableData.nomor_kartu_keluarga}
            />
            </FieldContent>
            {errors.nomor_kartu_keluarga && (
            <FieldError>{errors.nomor_kartu_keluarga}</FieldError>
            )}
        </Field>

        {/* Citizenship */}
        <Field>
            <FieldLabel htmlFor="citizenship">
            Kewarganegaraan
            </FieldLabel>
            <FieldDescription>
            WNI atau WNA
            </FieldDescription>
            <FieldContent>
            <select
                id="citizenship"
                name="citizenship"
                value={profileData.citizenship || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 focus:outline-none focus:border-opacity-100 appearance-none cursor-pointer"
                style={{
                fontFamily: 'Urbanist, sans-serif',
                borderColor: errors.citizenship ? '#BE0414' : '#015023',
                borderRadius: '12px',
                opacity: errors.citizenship ? 1 : 0.7,
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23015023' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1.5rem'
                }}
                disabled={isLoading}
            >
                <option value="" disabled>Pilih Kewarganegaraan</option>
                {citizenshipOptions.map(option => (
                <option key={option} value={option}>{option}</option>
                ))}
            </select>
            </FieldContent>
            {errors.citizenship && (
            <FieldError>{errors.citizenship}</FieldError>
            )}
        </Field>

        {/* Jurusan */}
        <Field>
            <FieldLabel htmlFor="jurusan">
            Jurusan <span className="text-red-500">*</span>
            </FieldLabel>
            <FieldDescription>
            Jurusan Kuliah <span className="text-red-500">(tidak dapat diubah)</span>
            </FieldDescription>
            <FieldContent>
            <input
                type="email"
                id="email"
                name="email"
                value={profileData.program}
                className="w-full px-4 py-3 border-2 focus:outline-none cursor-not-allowed bg-gray-50"
                style={{
                fontFamily: 'Urbanist, sans-serif',
                borderColor: errors.program ? '#BE0414' : '#015023',
                borderRadius: '12px',
                opacity: 0.5
                }}
                disabled
                readOnly
            />
            </FieldContent>
        </Field>
        </div>
    </div>

    {/* Section 2: Alamat */}
    <div 
        className="bg-white rounded-2xl shadow-lg p-6"
        style={{ borderRadius: '16px' }}
    >
        <div className="flex items-center gap-3 mb-6">
        <div 
            className="p-3 rounded-xl"
            style={{ backgroundColor: '#015023' }}
        >
            <MapPin className="w-6 h-6 text-white" />
        </div>
        <div>
            <h2 
            className="text-xl font-bold"
            style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}
            >
            Alamat Lengkap
            </h2>
            <p 
            className="text-sm"
            style={{ color: '#015023', opacity: 0.6, fontFamily: 'Urbanist, sans-serif' }}
            >
            Informasi tempat tinggal
            </p>
        </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
        {/* Alamat */}
        <Field>
            <FieldLabel htmlFor="alamat">
            Alamat <span className="text-red-500">*</span>
            </FieldLabel>
            <FieldDescription>
            Alamat lengkap tempat tinggal
            </FieldDescription>
            <FieldContent>
            <textarea
                id="alamat"
                name="alamat"
                value={profileData.alamat}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 border-2 focus:outline-none focus:border-opacity-100 resize-none"
                style={{
                fontFamily: 'Urbanist, sans-serif',
                borderColor: errors.alamat ? '#BE0414' : '#015023',
                borderRadius: '12px',
                opacity: errors.alamat ? 1 : 0.7
                }}
                disabled={isLoading}
            />
            </FieldContent>
            {errors.alamat && (
            <FieldError>{errors.alamat}</FieldError>
            )}
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dusun */}
            <Field>
            <FieldLabel htmlFor="dusun">
                Dusun
            </FieldLabel>
            <FieldContent>
                <input
                type="text"
                id="dusun"
                name="dusun"
                value={profileData.dusun}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 focus:outline-none focus:border-opacity-100"
                style={{
                    fontFamily: 'Urbanist, sans-serif',
                    borderColor: errors.dusun ? '#BE0414' : '#015023',
                    borderRadius: '12px',
                    opacity: errors.dusun ? 1 : 0.7
                }}
                disabled={isLoading}
                />
            </FieldContent>
            {errors.dusun && (
            <FieldError>{errors.dusun}</FieldError>
            )}
            </Field>

            {/* Kelurahan */}
            <Field>
            <FieldLabel htmlFor="kelurahan">
                Kelurahan/Desa
            </FieldLabel>
            <FieldContent>
                <input
                type="text"
                id="kelurahan"
                name="kelurahan"
                value={profileData.kelurahan}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 focus:outline-none focus:border-opacity-100"
                style={{
                    fontFamily: 'Urbanist, sans-serif',
                    borderColor: errors.kelurahan ? '#BE0414' : '#015023',
                    borderRadius: '12px',
                    opacity: errors.kelurahan ? 1 : 0.7
                }}
                disabled={isLoading}
                />
            </FieldContent>
            {errors.kelurahan && (
            <FieldError>{errors.kelurahan}</FieldError>
            )}
            </Field>

            {/* Kecamatan */}
            <Field>
            <FieldLabel htmlFor="kecamatan">
                Kecamatan
            </FieldLabel>
            <FieldContent>
                <input
                type="text"
                id="kecamatan"
                name="kecamatan"
                value={profileData.kecamatan}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 focus:outline-none focus:border-opacity-100"
                style={{
                    fontFamily: 'Urbanist, sans-serif',
                    borderColor: errors.kecamatan ? '#BE0414' : '#015023',
                    borderRadius: '12px',
                    opacity: errors.kecamatan ? 1 : 0.7
                }}
                disabled={isLoading}
                />
            </FieldContent>
                {errors.kecamatan && (
                <FieldError>{errors.kecamatan}</FieldError>
                )}
            </Field>

            {/* City/Regency */}
            <Field>
            <FieldLabel htmlFor="city_regency">
                Kota/Kabupaten
            </FieldLabel>
            <FieldContent>
                <input
                type="text"
                id="city_regency"
                name="city_regency"
                value={profileData.city_regency}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 focus:outline-none focus:border-opacity-100"
                style={{
                    fontFamily: 'Urbanist, sans-serif',
                    borderColor: errors.city_regency ? '#BE0414' : '#015023',
                    borderRadius: '12px',
                    opacity: errors.city_regency ? 1 : 0.7
                }}
                disabled={isLoading}
                />
            </FieldContent>
            {errors.city_regency && (
            <FieldError>{errors.city_regency}</FieldError>
            )}
            </Field>

            {/* Provinsi */}
            <Field>
            <FieldLabel htmlFor="provinsi">
                Provinsi
            </FieldLabel>
            <FieldContent>
                <input
                type="text"
                id="provinsi"
                name="provinsi"
                value={profileData.provinsi}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 focus:outline-none focus:border-opacity-100"
                style={{
                    fontFamily: 'Urbanist, sans-serif',
                    borderColor: errors.provinsi ? '#BE0414' : '#015023',
                    borderRadius: '12px',
                    opacity: errors.provinsi ? 1 : 0.7
                }}
                disabled={isLoading}
                />
            </FieldContent>
            {errors.provinsi && (
            <FieldError>{errors.provinsi}</FieldError>
            )}
            </Field>

            {/* Kode Pos */}
            <Field>
            <FieldLabel htmlFor="kode_pos">
                Kode Pos
            </FieldLabel>
            <FieldContent>
                <input
                type="text"
                id="kode_pos"
                name="kode_pos"
                value={profileData.kode_pos}
                onChange={handleChange}
                maxLength="5"
                className="w-full px-4 py-3 border-2 focus:outline-none focus:border-opacity-100"
                style={{
                    fontFamily: 'Urbanist, sans-serif',
                    borderColor: errors.kode_pos ? '#BE0414' : '#015023',
                    borderRadius: '12px',
                    opacity: errors.kode_pos ? 1 : 0.7
                }}
                disabled={isLoading}
                />
            </FieldContent>
            {errors.kode_pos && (
            <FieldError>{errors.kode_pos}</FieldError>
            )}
            </Field>
        </div>
        </div>
    </div>

    {/* Section 3: Data Keluarga & Pendidikan */}
    <div 
        className="bg-white rounded-2xl shadow-lg p-6"
        style={{ borderRadius: '16px' }}
    >
        <div className="flex items-center gap-3 mb-6">
        <div 
            className="p-3 rounded-xl"
            style={{ backgroundColor: '#015023' }}
        >
            <Users className="w-6 h-6 text-white" />
        </div>
        <div>
            <h2 
            className="text-xl font-bold"
            style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}
            >
            Data Keluarga & Pendidikan
            </h2>
            <p 
            className="text-sm"
            style={{ color: '#015023', opacity: 0.6, fontFamily: 'Urbanist, sans-serif' }}
            >
            Informasi keluarga dan riwayat pendidikan
            </p>
        </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Birth Order */}
        <Field>
            <FieldLabel htmlFor="birth_order">
            Anak Ke-
            </FieldLabel>
            <FieldDescription>
            Urutan kelahiran dalam keluarga (1, 2, 3, dst.) <span className="text-red-500">{!editableData.birth_order ? '(tidak dapat diubah)' : '(tidak dapat diubah setelah disimpan)'}</span>
            </FieldDescription>
            <FieldContent>
            <input
                type="number"
                id="birth_order"
                name="birth_order"
                value={profileData.birth_order}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-3 border-2 focus:outline-none focus:border-opacity-100"
                style={{
                fontFamily: 'Urbanist, sans-serif',
                borderColor: errors.birth_order ? '#BE0414' : '#015023',
                borderRadius: '12px',
                opacity: !editableData.birth_order ? 0.5 : errors.birth_order ? 1 : 0.7
                }}
                disabled={!editableData.birth_order || isLoading}
                readOnly={!editableData.birth_order}
            />
            </FieldContent>
            {errors.birth_order && (
            <FieldError>{errors.birth_order}</FieldError>
            )}
        </Field>

        {/* Jumlah Saudara */}
        <Field>
            <FieldLabel htmlFor="jumlah_saudara">
            Jumlah Saudara
            </FieldLabel>
            <FieldDescription>
            Total jumlah saudara kandung
            </FieldDescription>
            <FieldContent>
            <input
                type="number"
                id="jumlah_saudara"
                name="jumlah_saudara"
                value={profileData.jumlah_saudara}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-3 border-2 focus:outline-none focus:border-opacity-100"
                style={{
                fontFamily: 'Urbanist, sans-serif',
                borderColor: errors.jumlah_saudara ? '#BE0414' : '#015023',
                borderRadius: '12px',
                opacity: errors.jumlah_saudara ? 1 : 0.7
                }}
                disabled={isLoading}
            />
            </FieldContent>
            {errors.jumlah_saudara && (
            <FieldError>{errors.jumlah_saudara}</FieldError>
            )}
        </Field>

        {/* Ijazah Terakhir */}
        <Field>
            <FieldLabel htmlFor="ijazah_terakhir">
            Ijazah Terakhir
            </FieldLabel>
            <FieldDescription>
            SMA, SMK, MA, Paket C, Lainnya <span className="text-red-500">{!editableData.ijazah_terakhir ? '(tidak dapat diubah)' : '(tidak dapat diubah setelah disimpan)'}</span>
            </FieldDescription>
            <FieldContent>
            <select
                id="ijazah_terakhir"
                name="ijazah_terakhir"
                value={profileData.ijazah_terakhir || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 focus:outline-none focus:border-opacity-100 appearance-none cursor-pointer"
                style={{
                fontFamily: 'Urbanist, sans-serif',
                borderColor: errors.ijazah_terakhir ? '#BE0414' : '#015023',
                borderRadius: '12px',
                opacity: !editableData.ijazah_terakhir ? 0.5 : errors.ijazah_terakhir ? 1 : 0.7,
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23015023' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1.5rem'
                }}
                disabled={!editableData.ijazah_terakhir || isLoading}
                readOnly={!editableData.ijazah_terakhir}
            >
                <option value="" disabled>Pilih Ijazah  Terakhir</option>
                {ijazahOption.map(option => (
                <option key={option} value={option}>{option}</option>
                ))}
            </select>
            </FieldContent>
            {errors.ijazah_terakhir && (
            <FieldError>{errors.ijazah_terakhir}</FieldError>
            )}
        </Field>

        {/* Sekolah Asal */}
        <Field>
            <FieldLabel htmlFor="sekolah_asal">
            Sekolah Asal
            </FieldLabel>
            <FieldDescription>
            Nama sekolah menengah atas terakhir <span className="text-red-500">{!editableData.sekolah_asal ? '(tidak dapat diubah)' : '(tidak dapat diubah setelah disimpan)'}</span>
            </FieldDescription>
            <FieldContent>
            <input
                type="text"
                id="sekolah_asal"
                name="sekolah_asal"
                value={profileData.sekolah_asal}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 focus:outline-none focus:border-opacity-100"
                style={{
                fontFamily: 'Urbanist, sans-serif',
                borderColor: errors.sekolah_asal ? '#BE0414' : '#015023',
                borderRadius: '12px',
                opacity: !editableData.sekolah_asal ? 0.5 : errors.sekolah_asal ? 1 : 0.7
                }}
                disabled={!editableData.sekolah_asal || isLoading}
                readOnly={!editableData.sekolah_asal}
            />
            </FieldContent>
            {errors.sekolah_asal && (
            <FieldError>{errors.sekolah_asal}</FieldError>
            )}
        </Field>
        </div>
    </div>

    {/* Section 4: Ubah Password */}
    <div 
        className="bg-white rounded-2xl shadow-lg p-6"
        style={{ borderRadius: '16px' }}
        >
        <div className="flex items-center gap-3 mb-6">
            <div 
            className="p-3 rounded-xl"
            style={{ backgroundColor: '#015023' }}
            >
            <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
            <h2 
                className="text-xl font-bold"
                style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}
            >
                Ubah Password
            </h2>
            <p 
                className="text-sm"
                style={{ color: '#015023', opacity: 0.6, fontFamily: 'Urbanist, sans-serif' }}
            >
                Kosongkan jika tidak ingin mengubah password
            </p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Password Lama */}
            <Field className="md:col-span-2">
            <FieldLabel htmlFor="old_password">
                Password Lama
            </FieldLabel>
            <FieldDescription>
                Wajib diisi jika ingin mengubah password
            </FieldDescription>
            <FieldContent>
                <div className="relative">
                <input
                    type={showOldPassword ? "text" : "password"}
                    id="old_password"
                    name="old_password"
                    value={profileData.old_password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-12 border-2 focus:outline-none focus:border-opacity-100"
                    style={{
                    fontFamily: 'Urbanist, sans-serif',
                    borderColor: errors.old_password ? '#BE0414' : '#015023',
                    borderRadius: '12px',
                    opacity: errors.old_password ? 1 : 0.7
                    }}
                    disabled={isLoading}
                    placeholder="Masukkan password lama"
                />
                <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:opacity-70 transition"
                    style={{ color: '#015023' }}
                >
                    {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                </div>
            </FieldContent>
            {errors.old_password && (
                <FieldError>{errors.old_password}</FieldError>
            )}
            </Field>

            {/* Password Baru */}
            <Field>
            <FieldLabel htmlFor="password">
                Password Baru
            </FieldLabel>
            <FieldDescription>
                Minimal 6 karakter
            </FieldDescription>
            <FieldContent>
                <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={profileData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-12 border-2 focus:outline-none focus:border-opacity-100"
                    style={{
                    fontFamily: 'Urbanist, sans-serif',
                    borderColor: errors.password ? '#BE0414' : '#015023',
                    borderRadius: '12px',
                    opacity: errors.password ? 1 : 0.7
                    }}
                    disabled={isLoading}
                    placeholder="Masukkan password baru"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:opacity-70 transition"
                    style={{ color: '#015023' }}
                >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                </div>
            </FieldContent>
            {errors.password && (
                <FieldError>{errors.password}</FieldError>
            )}
            </Field>

            {/* Confirm Password */}
            <Field>
            <FieldLabel htmlFor="confirm_password">
                Konfirmasi Password Baru
            </FieldLabel>
            <FieldDescription>
                Masukkan ulang password baru
            </FieldDescription>
            <FieldContent>
                <div className="relative">
                <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirm_password"
                    name="confirm_password"
                    value={profileData.confirm_password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-12 border-2 focus:outline-none focus:border-opacity-100"
                    style={{
                    fontFamily: 'Urbanist, sans-serif',
                    borderColor: errors.confirm_password ? '#BE0414' : '#015023',
                    borderRadius: '12px',
                    opacity: errors.confirm_password ? 1 : 0.7
                    }}
                    disabled={isLoading}
                    placeholder="Konfirmasi password baru"
                />
                <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:opacity-70 transition"
                    style={{ color: '#015023' }}
                >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                </div>
            </FieldContent>
            {errors.confirm_password && (
                <FieldError>{errors.confirm_password}</FieldError>
            )}
            </Field>
        </div>
        </div>

        {/* Error message */}
        {errors.submit && (
            <ErrorMessageBox message={errors.submit} />
        )}
        {errors.submitpassword && (
            <ErrorMessageBox message={errors.submitpassword} />
        )}
        {errors.submitaddress && (
            <ErrorMessageBox message={errors.submitaddress} />
        )}
        {errors.submitfamilyeducation && (
            <ErrorMessageBox message={errors.submitfamilyeducation} />
        )}

        {/* Success message */}
        {success.submit && (
            <SuccessMessageBox message={success.submit} />
        )}
        {success.submitpassword && (
            <SuccessMessageBox message={success.submitpassword} />
        )}
        {success.submitaddress && (
            <SuccessMessageBox message={success.submitaddress} />
        )}
        {success.submitfamilyeducation && (
            <SuccessMessageBox message={success.submitfamilyeducation} />
        )}

    {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <WarningButton
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="sm:min-w-[150px]"
        >
            Batal
            </WarningButton>
        
        <PrimaryButton
            type="submit"
            disabled={isLoading}
            className="sm:min-w-[150px]"
        >
            {isLoading ? (
            <>
                <span className="animate-spin mr-2">⏳</span>
                Menyimpan...
            </>
            ) : (
            <>
                <Save className="w-5 h-5 mr-2" /> Simpan Perubahan
            </>
            )}
        </PrimaryButton>
        </div>
    </form>

    {/* Save Confirmation Dialog */}
    <AlertConfirmationDialog 
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        title="Konfirmasi Simpan"
        description={
          <>
            Apakah Anda yakin ingin menyimpan perubahan?
            <br />
            <span style={{ color: '#DABC4E', fontWeight: '600', marginTop: '8px', display: 'block' }}>
              Beberapa data tidak dapat diubah kembali setelah disimpan.
            </span>
          </>
        }
        confirmText="Ya, Simpan"
        cancelText="Batal"
        onConfirm={confirmSave}
    />

    {/* Cancel Confirmation Dialog */}
    <AlertConfirmationRedDialog 
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title="Konfirmasi Pembatalan"
        description={
          <>
            Apakah Anda yakin ingin membatalkan perubahan?
            <br />
            <span style={{ color: '#BE0414', fontWeight: '600', marginTop: '8px', display: 'block' }}>
              Data yang diisi akan hilang.
            </span>
          </>
        }
        confirmText="Ya, Batalkan"
        cancelText="Lanjutkan Mengisi"
        onConfirm={confirmCancel}
    />
    </div>
</div>
);
}
