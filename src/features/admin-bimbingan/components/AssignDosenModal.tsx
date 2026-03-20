'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Mahasiswa, Dosen } from '@/features/admin-bimbingan/hooks/useKelolaUser';
import { Button } from '@/components/ui/button';

interface AssignDosenModalProps {
  open: boolean;
  mahasiswa: Mahasiswa | null;
  dosenList: Dosen[];
  onClose: () => void;
  onAssign: (userId: string, dosenId: string) => Promise<void>;
}

export const AssignDosenModal = ({ open, mahasiswa, dosenList, onClose, onAssign }: AssignDosenModalProps) => {
  const [selectedDosenId, setSelectedDosenId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open || !mahasiswa) return null;

  const handleSubmit = async () => {
    if (!selectedDosenId) return;
    setIsSubmitting(true);
    try {
      await onAssign(mahasiswa.id, selectedDosenId);
      setSelectedDosenId('');
    } catch {
      // error feedback handled in parent hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedDosenId('');
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={handleClose}
        role="presentation"
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg">
        <div
          className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden"
          style={{ fontFamily: 'Urbanist, sans-serif' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Assign Dosen Pembimbing</h2>
              <p className="text-sm text-gray-500 mt-1">
                {mahasiswa.nama} - {mahasiswa.nim}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-400" strokeWidth={2} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            {/* Dosen Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Pilih Dosen Pembimbing</label>
              <select
                value={selectedDosenId}
                onChange={(e) => setSelectedDosenId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:border-[#015023] focus:ring-2 focus:ring-[#015023]/10 text-sm text-gray-900 font-medium"
              >
                <option value="">-- Pilih Dosen --</option>
                {dosenList
                  .filter((d) => d.status === 'Aktif')
                  .map((dosen) => (
                    <option key={dosen.id} value={dosen.id}>
                      {dosen.nama} ({dosen.nip})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 p-6 border-t border-gray-100 bg-gray-50">
            <Button
              variant="primary"
              size="default"
              style={{}}
              onClick={handleSubmit}
              disabled={!selectedDosenId || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
            <Button
              variant="outline"
              size="default"
              style={{}}
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Batal
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
