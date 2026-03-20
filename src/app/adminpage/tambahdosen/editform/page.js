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

    function EditDosenForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dosenId = searchParams.get('id');

    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "dosen",
    is_active: true
    });

    // Fetch data dosen saat component mount
    useEffect(() => {
    if (dosenId) {
        fetchDosenData();
    }
    }, [dosenId]);

    const fetchDosenData = async () => {
    try {
        setIsFetching(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/dosen/${dosenId}`, {
        //   headers: {
        //     'Authorization': `Bearer ${localStorage.getItem('token')}`
        //   }
        // });
        // const data = await response.json();
        
        // Dummy data untuk demo
        const dummyData = {
        username: "prof_ahmad",
        email: "ahmad@example.com",
        role: "dosen",
        is_active: true
        };
        
        setFormData({
        ...formData,
        ...dummyData,
        password: "",
        confirmPassword: ""
        });
    } catch (error) {
        alert("Gagal mengambil data dosen: " + error.message);
        router.push("/adminpage/tambahdosen");
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

    if (!formData.username.trim()) {
        newErrors.username = "Username harus diisi";
    } else if (formData.username.length < 3) {
        newErrors.username = "Username minimal 3 karakter";
    }

    if (!formData.email.trim()) {
        newErrors.email = "Email harus diisi";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Format email tidak valid";
    }

    // Password opsional saat edit (hanya validasi jika diisi)
    if (formData.password) {
        if (formData.password.length < 6) {
        newErrors.password = "Password minimal 6 karakter";
        }
        
        if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Password tidak sama";
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
        
        // TODO: Replace with actual API call
        // const updateData = {
        //   username: formData.username,
        //   email: formData.email,
        //   role: formData.role,
        //   is_active: formData.is_active
        // };
        
        // // Hanya sertakan password jika diisi
        // if (formData.password) {
        //   updateData.password = formData.password;
        // }
        
        // const response = await fetch(`/api/dosen/${dosenId}`, {
        //   method: 'PUT',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Authorization': `Bearer ${localStorage.getItem('token')}`
        //   },
        //   body: JSON.stringify(updateData)
        // });
        
        // if (!response.ok) throw new Error('Gagal mengupdate data');
        
        alert("Data dosen berhasil diperbarui!");
        router.push("/adminpage/tambahdosen");
    } catch (error) {
        alert("Gagal mengupdate data: " + error.message);
    } finally {
        setIsLoading(false);
    }
    };

    const handleCancel = () => {
    if (window.confirm("Apakah Anda yakin ingin membatalkan? Perubahan tidak akan disimpan.")) {
        router.push("/adminpage/tambahdosen");
    }
    };

    if (isFetching) {
    return (
        <LoadingEffect/>
    );
    }

    return (
    <div className="min-h-screen bg-brand-light-sage">
        <AdminNavbar title="Dashboard Admin - Edit Dosen" />
        
        <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-10">
            <Button
            variant="ghost"
            onClick={() => router.push("/adminpage/tambahdosen")}
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
                Edit Data Dosen
                </h1>
                <p 
                className="text-lg text-gray-600"
                style={{ fontFamily: 'Urbanist, sans-serif' }}
                >
                Perbarui informasi dosen di bawah ini
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
                Informasi Dosen
            </h2>
            <div 
                className="w-20 h-1 rounded-full"
                style={{ backgroundColor: '#DABC4E' }}
            />
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
            {/* Username Field */}
            <Field>
                <FieldLabel htmlFor="username">
                Username <span className="text-red-500">*</span>
                </FieldLabel>
                <FieldDescription>
                Username yang digunakan untuk login
                </FieldDescription>
                <FieldContent>
                <div className="relative">
                    <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 border-2 focus:outline-none focus:border-opacity-100"
                    style={{
                        fontFamily: 'Urbanist, sans-serif',
                        borderColor: errors.username ? '#BE0414' : '#015023',
                        borderRadius: '12px',
                        opacity: errors.username ? 1 : 0.7
                    }}
                    placeholder="Masukkan username"
                    disabled={isLoading}
                    />
                    {formData.username && !errors.username && (
                    <div 
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: '#16874B' }}
                    >
                        ✓
                    </div>
                    )}
                </div>
                </FieldContent>
                {errors.username && (
                <FieldError>{errors.username}</FieldError>
                )}
            </Field>

            {/* Email Field */}
            <Field>
                <FieldLabel htmlFor="email">
                Email <span className="text-red-500">*</span>
                </FieldLabel>
                <FieldDescription>
                Alamat email yang valid untuk komunikasi
                </FieldDescription>
                <FieldContent>
                <div className="relative">
                    <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 border-2 focus:outline-none focus:border-opacity-100"
                    style={{
                        fontFamily: 'Urbanist, sans-serif',
                        borderColor: errors.email ? '#BE0414' : '#015023',
                        borderRadius: '12px',
                        opacity: errors.email ? 1 : 0.7
                    }}
                    placeholder="contoh@email.com"
                    disabled={isLoading}
                    />
                    {formData.email && !errors.email && /\S+@\S+\.\S+/.test(formData.email) && (
                    <div 
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: '#16874B' }}
                    >
                        ✓
                    </div>
                    )}
                </div>
                </FieldContent>
                {errors.email && (
                <FieldError>{errors.email}</FieldError>
                )}
            </Field>

            {/* Password Field */}
            <Field>
                <FieldLabel htmlFor="password">
                Password Baru (Opsional)
                </FieldLabel>
                <FieldDescription>
                Kosongkan jika tidak ingin mengubah password. Minimal 6 karakter jika diisi.
                </FieldDescription>
                <FieldContent>
                <div className="relative">
                    <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 border-2 focus:outline-none focus:border-opacity-100"
                    style={{
                        fontFamily: 'Urbanist, sans-serif',
                        borderColor: errors.password ? '#BE0414' : '#015023',
                        borderRadius: '12px',
                        opacity: errors.password ? 1 : 0.7
                    }}
                    placeholder="Masukkan password baru"
                    disabled={isLoading}
                    />
                    {formData.password && !errors.password && formData.password.length >= 6 && (
                    <div 
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: '#16874B' }}
                    >
                        ✓
                    </div>
                    )}
                </div>
                </FieldContent>
                {errors.password && (
                <FieldError>{errors.password}</FieldError>
                )}
            </Field>

            {/* Confirm Password Field - hanya muncul jika password diisi */}
            {formData.password && (
                <Field>
                <FieldLabel htmlFor="confirmPassword">
                    Konfirmasi Password Baru
                </FieldLabel>
                <FieldDescription>
                    Ulangi password baru untuk konfirmasi
                </FieldDescription>
                <FieldContent>
                    <div className="relative">
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 border-2 focus:outline-none focus:border-opacity-100"
                        style={{
                        fontFamily: 'Urbanist, sans-serif',
                        borderColor: errors.confirmPassword ? '#BE0414' : '#015023',
                        borderRadius: '12px',
                        opacity: errors.confirmPassword ? 1 : 0.7
                        }}
                        placeholder="Ulangi password baru"
                        disabled={isLoading}
                    />
                    {formData.confirmPassword && !errors.confirmPassword && formData.password === formData.confirmPassword && (
                        <div 
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: '#16874B' }}
                        >
                        ✓
                        </div>
                    )}
                    </div>
                </FieldContent>
                {errors.confirmPassword && (
                    <FieldError>{errors.confirmPassword}</FieldError>
                )}
                </Field>
            )}

            {/* Role Field */}
            <Field>
                <FieldLabel htmlFor="role">
                Role <span className="text-red-500">*</span>
                </FieldLabel>
                <FieldDescription>
                Pilih role untuk pengguna ini
                </FieldDescription>
                <FieldContent>
                <div className="relative">
                    <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 border-2 focus:outline-none focus:border-opacity-100 appearance-none cursor-pointer"
                    style={{
                        fontFamily: 'Urbanist, sans-serif',
                        borderColor: '#015023',
                        borderRadius: '12px',
                        opacity: 0.7,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23015023' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 1rem center',
                        backgroundSize: '1.5rem'
                    }}
                    disabled={isLoading}
                    >
                    <option value="dosen">Dosen</option>
                    <option value="mahasiswa">Mahasiswa</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    </select>
                </div>
                </FieldContent>
            </Field>

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
                    Centang jika akun dosen ini aktif
                    </FieldDescription>
                </div>
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
                Kosongkan field password jika tidak ingin mengubah password yang sudah ada.
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
        <Suspense fallback={<LoadingEffect message="Memuat data dosen..." />}>
            <EditDosenForm />
        </Suspense>
    );
}