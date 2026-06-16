'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle, Loader2, AlertCircle, RefreshCw, Calendar, CreditCard, Receipt, X, XCircle
} from 'lucide-react';
import { 
  fetchStudentPaymentDetail, 
  fetchAdminTuitionPaymentDetail,
  verifyAdminTuitionPayment,
  rejectAdminTuitionPayment,
  fetchStudentTuitionBillDetail
} from '@/features/ukt/services/tuitionService';
import { toast } from 'sonner';

export default function PaymentDetailModal({ paymentId, onClose, isAdmin = false }) {
  const [payment, setPayment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!paymentId) return;
    setIsLoading(true);
    setError(null);
    try {
      let response;
      if (isAdmin) {
        response = await fetchAdminTuitionPaymentDetail(Number(paymentId));
        setPayment(response?.payment);
      } else {
        response = await fetchStudentPaymentDetail(Number(paymentId));
        const paymentData = response?.payment;
        
        // Coba fetch bill terkait untuk mendapatkan golongan UKT
        if (paymentData?.tuition_fee?.id_tuition_fee) {
          try {
            const billResponse = await fetchStudentTuitionBillDetail(paymentData.tuition_fee.id_tuition_fee);
            if (billResponse?.bill?.tuition_rate?.group_name) {
              if (!paymentData.tuition_fee.group_name) {
                paymentData.tuition_fee.group_name = billResponse.bill.tuition_rate.group_name;
              }
            }
          } catch (e) {
            console.warn('Gagal mengambil data golongan UKT dari bill:', e);
          }
        }
        setPayment(paymentData);
      }
    } catch (err) {
      setError(err?.message ?? 'Gagal memuat detail pembayaran');
      console.error('Error fetching payment details:', err);
    } finally {
      setIsLoading(false);
    }
  }, [paymentId, isAdmin]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleVerify = async () => {
    if (!paymentId) return;
    try {
      setIsProcessing(true);
      await verifyAdminTuitionPayment(Number(paymentId), {});
      toast.success('Pembayaran berhasil diverifikasi');
      fetchDetail(); // Refresh data
    } catch (err) {
      toast.error(err?.message || 'Gagal memverifikasi pembayaran');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!paymentId) return;
    const reason = window.prompt("Masukkan alasan penolakan:");
    if (reason === null) return; // User cancelled
    
    try {
      setIsProcessing(true);
      await rejectAdminTuitionPayment(Number(paymentId), { rejection_reason: reason || 'Bukti tidak valid' });
      toast.success('Pembayaran ditolak');
      fetchDetail(); // Refresh data
    } catch (err) {
      toast.error(err?.message || 'Gagal menolak pembayaran');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!paymentId) return null;

  const academicPeriod = payment?.tuition_fee?.academic_period || payment?.academic_period || '-';
  const groupName = payment?.tuition_fee?.group_name || payment?.tuition_fee?.tuition_rate?.group_name || '-';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200 flex flex-col font-urbanist relative">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
          <h3 className="text-xl font-bold text-[#015023]">Detail Pembayaran</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Konten Modal */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1">
          {isLoading && (
            <div className="flex flex-col items-center justify-center min-h-[300px]">
              <Loader2 className="w-8 h-8 animate-spin text-[#015023] mb-3" />
              <p className="text-sm text-gray-500 font-medium">Memuat detail pembayaran...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-bold text-red-700">Gagal memuat data</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
                <button
                  onClick={fetchDetail}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-red-600 hover:text-red-700 bg-white px-4 py-2 rounded-xl border border-red-200 hover:border-red-300 transition-all"
                >
                  <RefreshCw className="w-4 h-4" /> Coba Lagi
                </button>
              </div>
            </div>
          )}

          {!isLoading && !error && payment && (
            <div className="space-y-8 animate-in fade-in duration-200">
              
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[#015023] mb-1">Status Verifikasi</h2>
                  <p className="text-sm text-gray-500">ID Transaksi: {payment.id || '-'}</p>
                </div>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
                  payment.verification_label === 'Disetujui' ? 'bg-green-100 text-green-700 border border-green-200' : 
                  payment.verification_label === 'Ditolak' ? 'bg-red-100 text-red-700 border border-red-200' : 
                  'bg-orange-100 text-orange-700 border border-orange-200'
                }`}>
                  <CheckCircle className="w-4 h-4" />
                  {payment.verification_label}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Informasi Akademik */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Informasi Akademik
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    {isAdmin && payment.student && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Mahasiswa</p>
                        <p className="text-sm font-bold text-gray-800">{payment.student.name} ({payment.student.nim})</p>
                      </div>
                    )}
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Semester</p>
                      <p className="text-sm font-bold text-gray-800">{academicPeriod || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Golongan UKT</p>
                      <p className="text-sm font-bold text-gray-800">{groupName || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Informasi Pembayaran */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> Detail Transaksi
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">Metode</p>
                      <p className="text-sm font-bold text-gray-800 capitalize">{payment.payment_method?.replace('_', ' ')}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">Tanggal Upload</p>
                      <p className="text-sm font-bold text-gray-800">{formatDate(payment.uploaded_at)}</p>
                    </div>
                    {payment.transaction_reference && (
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">No. Referensi</p>
                        <p className="text-sm font-bold text-gray-800">{payment.transaction_reference}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Box Nominal Pembayaran */}
              <div className="border border-gray-200 rounded-xl p-6 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#015023]/10 flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-[#015023]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-600">Total Dibayarkan</p>
                  </div>
                </div>
                <span className="text-2xl font-extrabold text-[#015023]">{formatRupiah(payment.amount_paid)}</span>
              </div>

              {/* Catatan Admin (jika ada) */}
              {(payment.admin_notes || payment.rejection_reason) && (
                <div className={`p-4 rounded-xl border ${payment.verification_label === 'Ditolak' ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'}`}>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${payment.verification_label === 'Ditolak' ? 'text-red-800' : 'text-orange-800'}`}>
                    Catatan dari Admin
                  </p>
                  <p className={`text-sm ${payment.verification_label === 'Ditolak' ? 'text-red-700' : 'text-orange-700'}`}>
                    {payment.rejection_reason || payment.admin_notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer Modal */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-bold rounded-xl transition-colors w-full sm:w-auto"
          >
            Tutup
          </button>
          
          {isAdmin && payment && payment.verification_status === 'pending' && (
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button 
                onClick={handleReject}
                disabled={isProcessing}
                className="px-5 py-2.5 bg-red-50 text-red-700 hover:bg-red-100 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                <XCircle className="w-4 h-4" /> Tolak
              </button>
              <button 
                onClick={handleVerify}
                disabled={isProcessing}
                className="px-5 py-2.5 bg-[#015023] hover:bg-[#015023]/90 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} 
                Terima & Verifikasi
              </button>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
