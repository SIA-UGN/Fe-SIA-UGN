"use client"

import { AlertCircle } from "lucide-react";
import { SuccessButton } from "./button";

function ErrorMessageBox({
    message,
}) {
    return (
        <div 
            className="my-6 p-4 rounded-lg border"
            style={{
                backgroundColor: '#FEE2E2',
                borderColor: '#EF4444'
            }}
        >
            <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#DC2626' }} />
                <div className="flex-1">
                    <h3 className="font-semibold mb-1" style={{ color: '#DC2626', fontFamily: 'Urbanist, sans-serif' }}>
                        Terjadi Kesalahan
                    </h3>
                    <p className="text-sm" style={{ color: '#991B1B', fontFamily: 'Urbanist, sans-serif' }}>
                        {message}
                    </p>
                </div>
            </div>
        </div>
    );
}
function ErrorMessageBoxWithButton({
    message,
    action,
    btntext,
    back,
    actionback,
    btntextback,
}) {
    return (
        <div 
            className="my-6 p-4 rounded-lg border"
            style={{
                backgroundColor: '#FEE2E2',
                borderColor: '#EF4444'
            }}
        >
            <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#DC2626' }} />
                <div className="flex-1">
                    <h3 className="font-semibold mb-1" style={{ color: '#DC2626', fontFamily: 'Urbanist, sans-serif' }}>
                        Terjadi Kesalahan
                    </h3>
                    <p className="text-sm" style={{ color: '#991B1B', fontFamily: 'Urbanist, sans-serif' }}>
                        {message}
                    </p>
                </div>
                {back === true && (<button
                    onClick={actionback}
                    className="px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                    style={{
                        backgroundColor: '#6B7280',
                        color: 'white',
                        fontFamily: 'Urbanist, sans-serif'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4B5563'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6B7280'}
                >
                    {btntextback ? btntextback : 'Kembali'}
                </button>
                )}
                <button
                    onClick={action}
                    className="px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                    style={{
                        backgroundColor: '#DC2626',
                        color: 'white',
                        fontFamily: 'Urbanist, sans-serif'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B91C1C'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
                >
                    {btntext ? btntext : 'Coba Lagi'}
                </button>
            </div>
        </div>
    );
}

function SuccessMessageBox({
    message,
}) {
    return (
        <div 
            className="my-6 p-4 rounded-lg border"
            style={{
                backgroundColor: '#D1FAE5',
                borderColor: '#10B981'
            }}
        >
            <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#059669' }} />
                <div className="flex-1">
                    <h3 className="font-semibold mb-1" style={{ color: '#059669', fontFamily: 'Urbanist, sans-serif' }}>
                        Berhasil
                    </h3>
                    <p className="text-sm" style={{ color: '#047857', fontFamily: 'Urbanist, sans-serif' }}>
                        {message}
                    </p>
                </div>
            </div>
        </div>
    );
}
function SuccessMessageBoxWithButton({
    message,
    action,
    btntext,
}) {
    return (
        <div 
            className="my-6 p-4 rounded-lg border"
            style={{
                backgroundColor: '#D1FAE5',
                borderColor: '#10B981'
            }}
        >
            <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#059669' }} />
                <div className="flex-1">
                    <h3 className="font-semibold mb-1" style={{ color: '#059669', fontFamily: 'Urbanist, sans-serif' }}>
                        Berhasil
                    </h3>
                    <p className="text-sm" style={{ color: '#047857', fontFamily: 'Urbanist, sans-serif' }}>
                        {message}
                    </p>
                </div>
                <button
                    onClick={action}
                    className="px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                    style={{
                        backgroundColor: '#059669',
                        color: 'white',
                        fontFamily: 'Urbanist, sans-serif'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                >
                    {btntext ? btntext : 'Lanjutkan'}
                </button>
            </div>
        </div>
    );
}

export { 
    ErrorMessageBox,
    ErrorMessageBoxWithButton,
    SuccessMessageBox,
    SuccessMessageBoxWithButton,
};