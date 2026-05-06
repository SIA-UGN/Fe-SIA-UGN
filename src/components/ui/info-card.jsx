import { TrendingUp } from 'lucide-react';

/**
 * Komponen InfoCard untuk statistik dashboard
 * @param {Object} props
 * @param {string} props.title - Judul kartu
 * @param {number|string} props.value - Angka statistik
 * @param {string} props.subtitle - Teks kecil di bawah
 * @param {React.ElementType} props.Icon - Komponen ikon
 * @param {string} props.theme - Tema warna ('yellow', 'green', 'blue', 'purple')
 * @param {string} props.variant - Tampilan kartu ('vertical' | 'horizontal')
 */
export default function InfoCard({ 
    title, 
    value, 
    subtitle, 
    Icon, 
    theme = 'green',
    variant = 'vertical' // Default ke vertikal agar kode lamamu tidak rusak
}) {
    // Definisi warna berdasarkan tema
    const themeStyles = {
        yellow: { text: 'text-amber-500', bg: 'bg-amber-50' },
        green: { text: 'text-[#015023]', bg: 'bg-[#e6eee9]' },
        blue: { text: 'text-blue-500', bg: 'bg-blue-50' },
        purple: { text: 'text-purple-500', bg: 'bg-purple-50' },
        red: { text: 'text-red-500', bg: 'bg-red-50' },
    };

    const currentTheme = themeStyles[theme] || themeStyles.green;
    
    // Class dasar yang sama untuk kedua varian (Background, border, shadow, font)
    const baseCardClass = "bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] h-full font-urbanist transition-shadow hover:shadow-[0_4px_15px_rgba(0,0,0,0.05)]";

    // ─── TAMPILAN HORIZONTAL 
    if (variant === 'horizontal') {
        return (
            <div className={`${baseCardClass} p-5 flex items-center`}>
                {/* Ikon di Kiri */}
                <div className={`p-4 rounded-2xl mr-5 shrink-0 flex items-center justify-center ${currentTheme.bg} ${currentTheme.text}`}>
                    <Icon size={28} strokeWidth={2} />
                </div>

                {/* Teks di Kanan */}
                <div className="flex flex-col">
                    <p className="text-gray-500 text-sm font-medium mb-0.5">
                        {title}
                    </p>
                    <h3 className={`text-3xl font-bold leading-tight mb-0.5 ${currentTheme.text}`}>
                        {value}
                    </h3>
                    <p className="text-gray-400 text-xs font-medium">
                        {subtitle}
                    </p>
                </div>
            </div>
        );
    }

    // ─── TAMPILAN VERTIKAL 
    return (
        <div className={`${baseCardClass} p-6 flex flex-col justify-between`}>
            {/* Bagian Atas: Ikon Utama & Ikon Tren */}
            <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-xl ${currentTheme.bg} ${currentTheme.text}`}>
                    <Icon size={24} strokeWidth={2} />
                </div>
                <TrendingUp size={20} className="text-gray-300" strokeWidth={2} />
            </div>

            {/* Bagian Bawah: Teks dan Angka */}
            <div>
                <p className="text-gray-500 text-sm font-medium mb-1">
                    {title}
                </p>
                <h3 className={`text-4xl font-bold mb-2 ${currentTheme.text}`}>
                    {value}
                </h3>
                <p className="text-gray-400 text-xs font-medium">
                    {subtitle}
                </p>
            </div>
        </div>
    );
}