import * as React from "react"
import { cn } from "@/lib/utils"

const DashboardCard = React.forwardRef(({ 
className, 
children, 
title,
description,
icon,
onClick,
...props 
}, ref) => (
<div
ref={ref}
className={cn(
    "bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 sm:p-6 flex flex-col items-center text-center",
    className
)}
style={{ borderRadius: '12px', cursor: 'default' }}
{...props}
>
{icon && (
    <div className="mb-3 sm:mb-4 p-2 sm:p-3 rounded-full flex items-center justify-center" style={{ backgroundColor: '#015023' }}>
    <div className="w-6 h-6 sm:w-8 sm:h-8 text-white flex items-center justify-center" style={{ color: '#FFFFFF' }}>
        {icon}
    </div>
    </div>
)}
{title && (
    <h3 className="font-medium text-base sm:text-lg mb-2" style={{ 
    color: '#015023',
    fontFamily: 'Urbanist, sans-serif'
    }}>
    {title}
    </h3>
)}
{description && (
    <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4" style={{
    fontFamily: 'Urbanist, sans-serif'
    }}>
    {description}  
    </p>
)}
{children}
</div>
))

DashboardCard.displayName = "DashboardCard"

const StatCard = React.forwardRef(({ 
className, 
title,
value,
subtitle,
icon,
...props 
}, ref) => (
<div
ref={ref}
className={cn(
    "bg-white border border-gray-200 shadow-lg p-4 sm:p-6",
    className
)}
style={{ borderRadius: '12px' }}
{...props}
>
<div className="flex items-center justify-between mb-3 sm:mb-4">
    <h3 className="font-medium text-base sm:text-lg" style={{ 
    color: '#015023',
    fontFamily: 'Urbanist, sans-serif' 
    }}>
    {title}
    </h3>
    {icon && (
    <div className="p-1.5 sm:p-2 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#DABC4E' }}>
        <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center" style={{ color: '#015023' }}>
        {icon}
        </div>
    </div>
    )}
</div>
<div className="space-y-1 sm:space-y-2">
    <div className="text-2xl sm:text-3xl font-bold" style={{ 
    color: '#015023',
    fontFamily: 'Urbanist, sans-serif'
    }}>
    {value}
    </div>
    {subtitle && (
    <p className="text-xs sm:text-sm text-gray-600" style={{
        fontFamily: 'Urbanist, sans-serif'
    }}>
        {subtitle}
    </p>
    )}
</div>
</div>
))

StatCard.displayName = "StatCard"

export { DashboardCard, StatCard }