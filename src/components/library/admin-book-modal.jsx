'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Plus, Save, X } from 'lucide-react';
import AdminCategoryModal from '@/components/library/admin-category-modal';

const initialForm = {
  title: '',
  author: '',
  id_book_category: '',
  isbn: '',
  publisher: '',
  year: '',
  total_stock: '',
  available_stock: '',
};

export default function AdminBookModal({
  open,
  onClose,
  onSubmit,
  categories = [],
  editingBook = null,
  saving = false,
  onCreateCategory,
}) {
  const [form, setForm] = useState(initialForm);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

  const isEditing = Boolean(editingBook);

  useEffect(() => {
    if (editingBook) {
      setForm({
        title: editingBook.title || '',
        author: editingBook.author || '',
        id_book_category: String(editingBook?.category?.id_book_category || editingBook?.id_book_category || ''),
        isbn: editingBook.isbn || '',
        publisher: editingBook.publisher || '',
        year: editingBook.year ? String(editingBook.year) : '',
        total_stock: editingBook.total_stock != null ? String(editingBook.total_stock) : '',
        available_stock: editingBook.available_stock != null ? String(editingBook.available_stock) : '',
      });
    } else {
      setForm(initialForm);
    }
  }, [editingBook, open]);

  useEffect(() => {
    if (!open) {
      setIsDropdownOpen(false);
      setShowAddCategoryModal(false);
    }
  }, [open]);

  if (!open) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      title: form.title.trim(),
      author: form.author.trim(),
      id_book_category: form.id_book_category ? Number(form.id_book_category) : undefined,
      isbn: form.isbn.trim() || undefined,
      publisher: form.publisher.trim() || undefined,
      year: form.year ? Number(form.year) : undefined,
      total_stock: form.total_stock ? Number(form.total_stock) : undefined,
    });
  };

  const selectedCategoryName = categories.find(
    (cat) => String(cat.id_book_category) === String(form.id_book_category),
  )?.name;

  const handleCreateCategory = async (categoryName) => {
    if (!onCreateCategory) return;

    const createdCategory = await onCreateCategory(categoryName);

    if (createdCategory?.id_book_category != null) {
      setForm((prev) => ({
        ...prev,
        id_book_category: String(createdCategory.id_book_category),
      }));
    }

    setShowAddCategoryModal(false);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <div
          className="w-full max-w-[600px] overflow-hidden rounded-[16px] bg-white shadow-2xl"
          style={{ fontFamily: 'Urbanist, sans-serif' }}
        >
          <div className="flex items-center justify-between bg-[#015023] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-[40px] w-[40px] items-center justify-center rounded-[10px] bg-white/20">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-[20px] font-bold text-white">
                {isEditing ? 'Edit Buku' : 'Tambah Buku Baru'}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6">
            <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] font-semibold text-[#015023]">
                  Judul Buku <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(event) => handleChange('title', event.target.value)}
                  className="h-[48px] rounded-[10px] border border-[#d1d5dc] px-4 text-[15px] outline-none transition-colors focus:border-[#015023] focus:ring-2 focus:ring-[#015023]/20"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] font-semibold text-[#015023]">
                  Penulis <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.author}
                  onChange={(event) => handleChange('author', event.target.value)}
                  className="h-[48px] rounded-[10px] border border-[#d1d5dc] px-4 text-[15px] outline-none transition-colors focus:border-[#015023] focus:ring-2 focus:ring-[#015023]/20"
                />
              </div>

              <div className="relative flex flex-col gap-1.5 font-urbanist">
                <label className="text-[14px] font-semibold text-[#015023]">
                  Kategori <span className="text-red-500">*</span>
                </label>

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setIsDropdownOpen((prev) => !prev);
                    }
                  }}
                  className={`flex h-[48px] items-center rounded-[10px] border px-4 text-[15px] cursor-pointer bg-white transition-colors ${
                    isDropdownOpen
                      ? 'border-[#015023] ring-2 ring-[#015023]/20'
                      : 'border-[#d1d5dc] hover:border-[#015023]/50'
                  }`}
                >
                  <span className={selectedCategoryName ? 'text-gray-800' : 'text-gray-400'}>
                    {selectedCategoryName || 'Pilih Kategori'}
                  </span>
                </div>

                {isDropdownOpen ? (
                  <div className="absolute left-0 top-[75px] z-40 w-full overflow-hidden rounded-[12px] border border-[#015023] bg-white py-2 shadow-lg">
                    <div className="max-h-[200px] overflow-y-auto">
                      {categories.map((cat) => (
                        <button
                          key={cat.id_book_category}
                          type="button"
                          onClick={() => {
                            handleChange('id_book_category', String(cat.id_book_category));
                            setIsDropdownOpen(false);
                          }}
                          className="block w-full px-5 py-3 text-left text-[15px] font-medium text-[#015023] transition-colors hover:bg-[#e6eee9]"
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setShowAddCategoryModal(true);
                      }}
                      className="mt-1 flex w-full rounded-[12px] items-center gap-3 border-t border-gray-100 px-5 py-3.5 text-left text-[15px] font-semibold text-[#015023] transition-colors hover:bg-[#e6eee9]"
                    >
                      <Plus className="h-4 w-4" strokeWidth={2.5} />
                      Tambah Kategori Baru
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] font-semibold text-[#015023]">
                  ISBN <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.isbn}
                  onChange={(event) => handleChange('isbn', event.target.value)}
                  className="h-[48px] rounded-[10px] border border-[#d1d5dc] px-4 text-[15px] outline-none transition-colors focus:border-[#015023] focus:ring-2 focus:ring-[#015023]/20"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] font-semibold text-[#015023]">
                  Penerbit <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.publisher}
                  onChange={(event) => handleChange('publisher', event.target.value)}
                  className="h-[48px] rounded-[10px] border border-[#d1d5dc] px-4 text-[15px] outline-none transition-colors focus:border-[#015023] focus:ring-2 focus:ring-[#015023]/20"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] font-semibold text-[#015023]">
                  Tahun <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1900"
                  max="2100"
                  value={form.year}
                  onChange={(event) => handleChange('year', event.target.value)}
                  className="h-[48px] rounded-[10px] border border-[#d1d5dc] px-4 text-[15px] outline-none transition-colors focus:border-[#015023] focus:ring-2 focus:ring-[#015023]/20"
                  placeholder="2026"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] font-semibold text-[#015023]">
                  Total Buku <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={form.total_stock}
                  onChange={(event) => handleChange('total_stock', event.target.value)}
                  className="h-[48px] rounded-[10px] border border-[#d1d5dc] px-4 text-[15px] outline-none transition-colors focus:border-[#015023] focus:ring-2 focus:ring-[#015023]/20"
                  placeholder="0"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] font-semibold text-[#015023]">
                  Stok Tersedia <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.available_stock}
                  onChange={(event) => handleChange('available_stock', event.target.value)}
                  className="h-[48px] rounded-[10px] border border-[#d1d5dc] px-4 text-[15px] outline-none transition-colors focus:border-[#015023] focus:ring-2 focus:ring-[#015023]/20"
                  placeholder="0"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="flex h-[48px] items-center justify-center rounded-[10px] bg-[#e5e7eb] text-[16px] font-semibold text-[#374151] transition-colors hover:bg-[#d1d5db]"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex h-[48px] items-center justify-center gap-2 rounded-[10px] bg-[#015023] text-[16px] font-semibold text-white transition-colors hover:bg-[#013d1a] disabled:opacity-60"
              >
                <Save className="h-5 w-5" />
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <AdminCategoryModal
        open={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
        onSubmit={handleCreateCategory}
        saving={saving}
      />
    </>
  );
}
