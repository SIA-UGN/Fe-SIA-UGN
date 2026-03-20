// ===== Card Component =====
// src/components/ui/Card.jsx
export function Card({ children, className = '' }) {
return (
<article className={`bg-white shadow-lg overflow-hidden border border-gray-200 ${className}`} style={{ borderRadius: '12px', fontFamily: 'Urbanist, sans-serif' }}>
    {children}
</article>
);
}

// ===== Card Header Component =====
// src/components/ui/CardHeader.jsx
import { Calendar } from 'lucide-react';

export function CardHeader({ date, onCalendarClick, className = '' }) {
return (
<header className={`text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between ${className}`} style={{ backgroundColor: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
    <div className="flex items-center gap-2">
    <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
    <h2 className="font-semibold text-sm sm:text-base">{date}</h2>
    </div>
    {onCalendarClick && (
    <button 
        onClick={onCalendarClick}
        className="hover:opacity-80 transition-colors"
        style={{ color: '#DABC4E' }}
        aria-label="Open calendar"
    >
        <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
    </button>
    )}
</header>
);
}

// ===== Card Content Component =====
// src/components/ui/CardContent.jsx
export function CardContent({ children, className = '' }) {
return (
<div className={`divide-y divide-gray-200 ${className}`} style={{ fontFamily: 'Urbanist, sans-serif' }  }>
    {children}
</div>
);
}

// ===== Badge Component =====
// src/components/ui/Badge.jsx
export function Badge({ children, variant = 'primary', size = 'md', className = '' }) {
const getVariantStyles = (variant) => {
const styles = {
    primary: { backgroundColor: '#015023', color: '#FFFFFF' },
    gold: { backgroundColor: '#DABC4E', color: '#015023' },
    outline: { backgroundColor: 'transparent', color: '#015023', border: '2px solid #015023' },
};
return styles[variant] || styles.primary;
};

const sizes = {
sm: 'px-3 py-1 text-xs',
md: 'px-4 py-2 text-sm',
lg: 'px-5 py-2.5 text-base',
};

return (
<span 
    className={`${sizes[size]} font-semibold whitespace-nowrap ${className}`} 
    style={{ 
    ...getVariantStyles(variant), 
    borderRadius: '12px',
    fontFamily: 'Urbanist, sans-serif'
    }}
>
    {children}
</span>
);
}

// ===== Schedule Item Component =====
// src/components/ui/ScheduleItem.jsx
import { MapPin } from 'lucide-react';

export function ScheduleItem({ 
matakuliah, 
waktu, 
kelas, 
dosen, 
pertemuan, 
sks, 
kode,
className = '' 
}) {
return (
<div className={`p-4 sm:p-6 bg-gray-50 hover:bg-gray-100 transition-colors ${className}`} style={{ fontFamily: 'Urbanist, sans-serif' }}>
    <div className="flex flex-col sm:flex-row sm:items-start lg:items-center justify-between gap-3 sm:gap-4">
    {/* Left Side - Info */}
    <div className="flex-1">
        <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 leading-tight" style={{ color: '#015023' }}>
        {matakuliah}
        </h3>
        
        <div className="space-y-1 text-xs sm:text-sm text-gray-700">
        <p>{waktu}</p>
        <p>{kelas}</p>
        <p>{dosen}</p>
        <p>{pertemuan}</p>
        </div>
    </div>

    {/* Right Side - Badges */}
    <div className="flex flex-wrap gap-2 sm:gap-3 items-center sm:items-start">
        <Badge variant="primary" size="sm">{sks}</Badge>
        <Badge variant="primary" size="sm">{kode}</Badge>
    </div>
    </div>
</div>
);
}

// ===== Notification Item Component =====
// src/components/ui/NotificationItem.jsx

export function NotificationItem({ 
tag, 
title, 
content,
date,
pengumum = 'System',
metadata,
onClick,
className = '' 
}) {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div 
        className={`p-4 sm:p-6 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer ${className}`} 
        style={{ fontFamily: 'Urbanist, sans-serif' }}
        onClick={onClick}
    >
        {/* Tag Badge */}
        <div className="flex justify-end mb-3 sm:mb-4">
        <Badge variant="primary" size="sm">
            {tag}
        </Badge>
        </div>

        {/* Content */}
        <div className="space-y-3 sm:space-y-4">
        <h4 className="font-bold text-base sm:text-lg leading-tight" style={{ color: '#015023' }}>
            {title}
        </h4>
        
        {/* Sender info only (no date shown in dashboard) */}
        <div style={{
            display: 'flex',
            gap: '12px',
            fontSize: '14px',
            color: '#015023',
            opacity: 0.7
        }}>
            <span>{pengumum}</span>
        </div>

        {/* Rich template untuk class announcement */}
        {metadata?.subject_name && (
            <div style={{
                padding: '12px',
                backgroundColor: '#F0FDF4',
                borderRadius: '8px',
                borderLeft: '4px solid #015023'
            }}>
                <p style={{
                    fontSize: '14px',
                    color: '#015023',
                    margin: 0,
                    marginBottom: '4px'
                }}>
                    <strong>Yth.</strong> {metadata.student_name || 'Mahasiswa'} ({metadata.student_nim || 'NIM'})
                </p>
                <p style={{
                    fontSize: '14px',
                    color: '#015023',
                    margin: 0,
                    marginBottom: '4px'
                }}>
                    <strong>Matakuliah:</strong> {metadata.subject_code} - {metadata.subject_name}
                </p>
                <p style={{
                    fontSize: '14px',
                    color: '#015023',
                    margin: 0,
                    marginBottom: '4px'
                }}>
                    <strong>Kelas:</strong> {metadata.class_code}
                </p>
                {metadata.lecturer_name && (
                    <p style={{
                        fontSize: '14px',
                        color: '#015023',
                        margin: 0
                    }}>
                        <strong>Dosen:</strong> {metadata.lecturer_name}
                    </p>
                )}
            </div>
        )}
        
        <div className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {content}
        </div>
        </div>
    </div>
  );
}

// ===== Section Title Component =====
// src/components/ui/SectionTitle.jsx
export function SectionTitle({ children, className = '' }) {
return (
<h1 className={`text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 ${className}`} style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
    {children}
</h1>
);
}

// ===== Container Component =====
// src/components/ui/Container.jsx
export function Container({ children, className = '' }) {
return (
<div className={`container mx-auto px-4 sm:px-6 py-6 sm:py-8 ${className}`} style={{ fontFamily: 'Urbanist, sans-serif' }}>
    {children}
</div>
);
}