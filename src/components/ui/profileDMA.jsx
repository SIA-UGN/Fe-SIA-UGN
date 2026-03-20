'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, User, Eye, EyeOff, Upload, X, Lock, Trash2 } from 'lucide-react';
import { Field, FieldLabel, FieldContent, FieldDescription, FieldError } from '@/components/ui/field';
import { PrimaryButton, OutlineButton, WarningButton } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { changePassword, deleteProfileImage, getStaffProfile, updateStaffProfile } from '@/lib/profileApi';
import LoadingEffect from './loading-effect';
import { buildImageUrl } from '@/lib/utils';
import { ErrorMessageBoxWithButton, SuccessMessageBox, ErrorMessageBox } from './message-box';
import { useAuth } from '@/lib/auth-context';
import {
  AlertConfirmationDialog,
  AlertConfirmationRedDialog,
} from '@/components/ui/alert-dialog';

export default function ProfileDMA() {
const router = useRouter();
const { refreshUser } = useAuth();
const [isLoading, setIsLoading] = useState(false);
const [isFetching, setIsFetching] = useState(true);
const [isDeleting, setIsDeleting] = useState(false)
const [errors, setErrors] = useState({});
const [successSubmit, setSuccessSubmit] = useState('');
const [successPassword, setSuccessPassword] = useState('');
const [successDeleteImage, setSuccessDeleteImage] = useState('');
const [showOldPassword, setShowOldPassword] = useState(false);
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const [imagePreview, setImagePreview] = useState(null);
const [showSaveDialog, setShowSaveDialog] = useState(false);
const [showCancelDialog, setShowCancelDialog] = useState(false);

// State untuk data profile DMA (Dosen, Manager, Admin)
const [profileData, setProfileData] = useState({
    // Data yang bisa edit dan dilihat
    full_name: '',
    username: '',
    email: '',
    old_password: '',
    password: '',
    confirm_password: '',
    profile_image: null,

    // Data yang hanya bisa dilihat (read-only)
    employee_id: '',
    position: '', // Dosen / Manager / Admin
});

// State untuk data profile DMA (Dosen, Manager, Admin)
const [oldData, setOldData] = useState({
    // Data yang bisa edit dan dilihat
    full_name: '',
    username: '',
    email: '',
    old_password: '',
    password: '',
    confirm_password: '',
    profile_image: null,

    // Data yang hanya bisa dilihat (read-only)
    employee_id: '',
    position: '', // Dosen / Manager / Admin
});

useEffect(() => {
    fetchAll();
}, []);

const fetchAll = async () => {
    setErrors(prev => ({...prev, fetch: null}));
    setIsFetching(true);
    await Promise.all([
        FetchProfileData()
    ]);
    setIsFetching(false);
};

const FetchProfileData = async () => {
    try {
        const response = await getStaffProfile();
        if (response.status === 'success') {
            setOldData(prev => ({
                ...prev,
                full_name: response.data.name,
                username: response.data.username,
                email: response.data.email,
                profile_image: response.data.profile_image,
                employee_id: response.data.staff_data.employee_id_number,
                position: response.data.staff_data.position,
            }));
            setProfileData(prev => ({
                ...prev,
                full_name: response.data.name,
                username: response.data.username,
                email: response.data.email,
                profile_image: response.data.profile_image,
                employee_id: response.data.staff_data.employee_id_number,
                position: response.data.staff_data.position,
            }));
        } else {
            setErrors(prev => ({...prev, fetch: 'Gagal mengambil data profile: ' + response.message}));
        }
    } catch (error) {
        setErrors(prev => ({...prev, fetch: 'Gagal mengambil data profile: ' + error.message}));
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
    // Clear submit error
    if (errors.submit || errors.submitpassword) {
        setErrors(prev => ({
        ...prev,
        submit: null,
        submitpassword: null
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

        if (profileData.old_password && (!profileData.password || !profileData.confirm_password)) {
        newErrors.password = 'Password baru wajib diisi';
        newErrors.confirm_password = 'Konfirmasi password wajib diisi';
        }
        
        if (profileData.password && profileData.password.length < 8) {
        newErrors.password = 'Password minimal 8 karakter';
        }
        
        if (profileData.password !== profileData.confirm_password) {
        newErrors.confirm_password = 'Password tidak cocok';
        }
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
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

    setErrors(prev => ({ ...prev, submit: null, submitpassword: null }));

    const newErrors = {};
    try {
        const response = await updateStaffProfile({
            name: profileData.full_name,
            username: profileData.username,
            profile_image: profileData.profile_image === oldData.profile_image ? null : profileData.profile_image
        });
        if (response.status === 'success') {
            await refreshUser();
            setSuccessSubmit('Profile berhasil diperbarui!');
            setOldData(prev => ({
                ...prev,
                name: response.data.name,
                username: response.data.username,
                profile_image: response.data.profile_image
            }));
            setImagePreview(null);
        } else {
            newErrors.submit = 'Gagal memperbarui profile: ' + response.message;
            return;
        }

        if (profileData.password && profileData.old_password && profileData.confirm_password) {
            // Jika mengisi password, kirim perubahan password
            const passwordResponse = await changePassword({
                old_password: profileData.old_password,
                password: profileData.password,
                confirm_password: profileData.confirm_password,
            });
            if (passwordResponse.status === 'success') {
                setSuccessPassword('Profile dan password berhasil diperbarui!');
            } else {
                newErrors.submitpassword = 'Gagal memperbarui password: ' + passwordResponse.message;
                return;
            }
        }

        // Clear password fields after successful update
        setProfileData(prev => ({
            ...prev,
            old_password: '',
            password: '',
            confirm_password: ''
        }));
    } catch (error) {
        newErrors.submit = 'Gagal memperbarui profile/password: ' + error.message;
    } finally {
        setErrors(prev => ({ ...prev, ...newErrors }));
        setIsLoading(false);
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
            setSuccessDeleteImage('Gambar profil berhasil dihapus!');
        } else {
            setErrors(prev => ({ ...prev, deleteProfileImage: 'Gagal menghapus gambar profil: ' + response.message }));
        }
    } catch (error) {
        setErrors(prev => ({ ...prev, deleteProfileImage: 'Gagal menghapus gambar profil: ' + error.message }));
    } finally {
        setIsDeleting(false);
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

useEffect(() => {
    if (!successSubmit) return;
    const timer = setTimeout(() => {
        setSuccessSubmit(null);
    }, 5000);
    return () => clearTimeout(timer);
}, [successSubmit]);

useEffect(() => {
    if (!successPassword) return;
    const timer = setTimeout(() => {
        setSuccessPassword(null);
    }, 5000);
    return () => clearTimeout(timer);
}, [successPassword]);

useEffect(() => {
    if (!successDeleteImage) return;
    const timer = setTimeout(() => {
        setSuccessDeleteImage(null);
    }, 5000);
    return () => clearTimeout(timer);
}, [successDeleteImage]);

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
            <AvatarImage 
            src={buildImageUrl(oldData.profile_image)} 
            alt={oldData.full_name} 
            />
            <AvatarFallback className="text-2xl">
            {oldData.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </AvatarFallback>
        </Avatar>
        <div>
            <h1 
            className="text-2xl sm:text-3xl font-bold mb-2"
            style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}
            >
            Profile {oldData.position}
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
            Employee ID: {oldData.employee_id}
            </p>
        </div>
        </div>
    </div>

    {/* Form */}
    <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Data yang Hanya Bisa Dilihat */}
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
                Informasi Kepegawaian
            </h2>
            <p 
                className="text-sm"
                style={{ color: '#015023', opacity: 0.6, fontFamily: 'Urbanist, sans-serif' }}
            >
                Data ini hanya dapat dilihat, tidak dapat diubah
            </p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Employee ID */}
            <Field>
            <FieldLabel htmlFor="employee_id">
                Employee ID
            </FieldLabel>
            <FieldDescription>
                Nomor induk pegawai <span className="text-sm text-red-500">(tidak dapat diubah)</span>
            </FieldDescription>
            <FieldContent>
                <input
                type="text"
                id="employee_id"
                name="employee_id"
                value={profileData.employee_id}
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
            </Field>

            {/* Position */}
            <Field>
            <FieldLabel htmlFor="position">
                Posisi/Jabatan
            </FieldLabel>
            <FieldDescription>
                Role dalam sistem <span className="text-sm text-red-500">(tidak dapat diubah)</span>
            </FieldDescription>
            <FieldContent>
                <input
                type="text"
                id="position"
                name="position"
                value={profileData.position}
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
            </Field>
        </div>
        </div>

        {/* Section 2: Data yang Bisa Edit dan Dilihat */}
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
                Data Pribadi
            </h2>
            <p 
                className="text-sm"
                style={{ color: '#015023', opacity: 0.6, fontFamily: 'Urbanist, sans-serif' }}
            >
                Informasi yang dapat Anda ubah
            </p>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
            {/* Full Name */}
            <Field>
            <FieldLabel htmlFor="full_name">
                Nama Lengkap <span className="text-red-500">*</span>
            </FieldLabel>
            <FieldDescription>
                Nama lengkap sesuai identitas
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                Email aktif untuk komunikasi <span className="text-sm text-red-500">(tidak dapat diubah)</span>
                </FieldDescription>
                <FieldContent>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleChange}
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
            </div>

            {/* Profile Image */}
            <Field>
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
            {successDeleteImage && (
                <SuccessMessageBox message={successDeleteImage} />
            )}
            {errors.deleteProfileImage && (
                <ErrorMessageBox message={errors.deleteProfileImage} />
            )}
        </div>
        </div>

        {/* Section 3: Ubah Password */}
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

        {/* success messaaage */}
        {successSubmit && (
            <SuccessMessageBox message={successSubmit} />
        )}
        {successPassword && (
            <SuccessMessageBox message={successPassword} />
        )}
        {/* error message */}
        {errors.submit && (
            <ErrorMessageBox
                message={errors.submit}
            />
        )}
        {errors.submitpassword && (
            <ErrorMessageBox
                message={errors.submitpassword}
            />
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
        description="Apakah Anda yakin ingin menyimpan perubahan data profil?"
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
