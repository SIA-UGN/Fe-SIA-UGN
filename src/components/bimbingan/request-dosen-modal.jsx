'use client';

import { useMemo, useState } from 'react';
import { X } from 'lucide-react';

export default function RequestDosenModal({
  open,
  lecturers = [],
  disabledLecturerIds = [],
  loading,
  onClose,
  onSubmit,
}) {
  const [selectedLecturer, setSelectedLecturer] = useState('');
  const [studentNote, setStudentNote] = useState('');

  const available = useMemo(
    () => lecturers.filter((item) => !disabledLecturerIds.includes(Number(item.id_user_si))),
    [disabledLecturerIds, lecturers],
  );

  if (!open) return null;

  const handleSubmit = async () => {
    if (!selectedLecturer) return;

    await onSubmit?.({
      id_lecturer: Number(selectedLecturer),
      student_note: studentNote,
    });

    setSelectedLecturer('');
    setStudentNote('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-[500px] rounded-[16px] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-[18px] font-bold text-[#015023]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
            Ajukan ke Dosen Lain
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-[#6a7282] hover:bg-gray-100"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5" style={{ fontFamily: 'Urbanist, sans-serif' }}>
          <div>
            <label className="mb-2 block text-[13px] font-semibold text-[#015023]">Pilih Dosen</label>
            <select
              value={selectedLecturer}
              onChange={(event) => setSelectedLecturer(event.target.value)}
              className="w-full rounded-[10px] border border-[#e5e7eb] px-3 py-3 text-[14px] outline-none focus:border-[#015023]"
            >
              <option value="">Pilih dosen pembimbing</option>
              {available.map((lecturer) => (
                <option key={lecturer.id_user_si} value={lecturer.id_user_si}>
                  {(lecturer.staff_profile?.full_name || lecturer.name || '-')}
                  {lecturer.staff_profile?.employee_id_number
                    ? ` - ${lecturer.staff_profile.employee_id_number}`
                    : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-semibold text-[#015023]">Catatan (opsional)</label>
            <textarea
              value={studentNote}
              onChange={(event) => setStudentNote(event.target.value)}
              rows={4}
              maxLength={1000}
              className="w-full rounded-[10px] border border-[#e5e7eb] px-3 py-3 text-[14px] outline-none focus:border-[#015023]"
              placeholder="Tambahkan catatan untuk dosen..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-[8px] border border-gray-300 bg-white px-4 py-2 text-[13px] text-[#6a7282]"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!selectedLecturer || loading}
              className="rounded-[8px] bg-[#015023] px-4 py-2 text-[13px] text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Mengirim...' : 'Kirim Permintaan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
