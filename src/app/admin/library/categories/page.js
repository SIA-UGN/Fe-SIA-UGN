'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import AdminBimbinganShell from '@/components/admin/admin-bimbingan-shell';
import { PrimaryButton, WarningButton } from '@/components/ui/button';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import {
  createAdminLibraryCategory,
  deleteAdminLibraryCategory,
  getAdminLibraryCategories,
  updateAdminLibraryCategory,
} from '@/lib/libraryApi';
import { getErrorMessage, parseListData } from '@/features/library/utils';

const initialForm = {
  name: '',
  slug: '',
  description: '',
};

export default function AdminLibraryCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getAdminLibraryCategories();
      setCategories(parseListData(response));
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal memuat kategori buku.'));
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const submitLabel = useMemo(() => {
    if (saving) return editingId ? 'Menyimpan...' : 'Membuat...';
    return editingId ? 'Simpan Perubahan' : 'Tambah Kategori';
  }, [editingId, saving]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || undefined,
      };

      if (!payload.name || !payload.slug) {
        toast.error('Nama dan slug kategori wajib diisi.');
        return;
      }

      if (editingId) {
        const response = await updateAdminLibraryCategory(editingId, payload);
        toast.success(response?.message || 'Kategori berhasil diperbarui.');
      } else {
        const response = await createAdminLibraryCategory(payload);
        toast.success(response?.message || 'Kategori berhasil ditambahkan.');
      }

      resetForm();
      await fetchCategories();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal menyimpan kategori.'));
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (category) => {
    setEditingId(category.id_book_category);
    setForm({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
    });
  };

  const handleDelete = async (categoryId) => {
    const confirmed = window.confirm('Hapus kategori ini?');
    if (!confirmed) return;

    try {
      const response = await deleteAdminLibraryCategory(categoryId);
      toast.success(response?.message || 'Kategori berhasil dihapus.');
      if (editingId === categoryId) resetForm();
      await fetchCategories();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal menghapus kategori.'));
    }
  };

  return (
    <AdminBimbinganShell
      title="Manajemen Kategori Buku"
      description="Kelola kategori untuk klasifikasi koleksi perpustakaan"
      backHref="/admin/library"
      backLabel="Kembali ke Dashboard Perpustakaan"
    >
      {error ? <ErrorMessageBoxWithButton message={error} action={fetchCategories} /> : null}

      <section className="rounded-[16px] bg-white p-5 shadow-sm">
        <h2 className="text-[22px] font-bold text-[#015023]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
          {editingId ? 'Edit Kategori' : 'Tambah Kategori Baru'}
        </h2>

        <form className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-[13px] font-semibold text-[#374151]">Nama Kategori *</label>
            <input
              type="text"
              className="h-10 w-full rounded-[10px] border border-[#d1d5db] px-3 text-[14px] outline-none ring-[#015023] focus:ring-2"
              style={{ fontFamily: 'Urbanist, sans-serif' }}
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Contoh: Informatika"
            />
          </div>

          <div>
            <label className="mb-1 block text-[13px] font-semibold text-[#374151]">Slug *</label>
            <input
              type="text"
              className="h-10 w-full rounded-[10px] border border-[#d1d5db] px-3 text-[14px] outline-none ring-[#015023] focus:ring-2"
              style={{ fontFamily: 'Urbanist, sans-serif' }}
              value={form.slug}
              onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
              placeholder="contoh-informatika"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-[13px] font-semibold text-[#374151]">Deskripsi</label>
            <textarea
              rows={3}
              className="w-full rounded-[10px] border border-[#d1d5db] px-3 py-2 text-[14px] outline-none ring-[#015023] focus:ring-2"
              style={{ fontFamily: 'Urbanist, sans-serif' }}
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Deskripsi kategori buku"
            />
          </div>

          <div className="md:col-span-2 flex flex-wrap gap-2">
            <PrimaryButton type="submit" className="h-10 px-4 text-[13px] font-semibold" disabled={saving}>
              <Plus className="h-4 w-4" />
              {submitLabel}
            </PrimaryButton>

            {editingId ? (
              <button
                type="button"
                className="inline-flex h-10 items-center rounded-[10px] border border-[#d1d5db] px-4 text-[13px] font-semibold text-[#374151]"
                style={{ fontFamily: 'Urbanist, sans-serif' }}
                onClick={resetForm}
              >
                Batal Edit
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-[16px] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[#e8f1eb]">
              <tr>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-[#015023]">Nama</th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-[#015023]">Slug</th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-[#015023]">Jumlah Buku</th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-[#015023]">Deskripsi</th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-[#015023]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[14px] text-[#6b7280]">
                    Memuat kategori...
                  </td>
                </tr>
              ) : null}

              {!loading && categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[14px] text-[#6b7280]">
                    Belum ada kategori buku.
                  </td>
                </tr>
              ) : null}

              {!loading
                ? categories.map((category) => (
                    <tr key={category.id_book_category} className="border-t border-[#f1f5f9]">
                      <td className="px-4 py-3 text-[14px] font-semibold text-[#015023]">{category.name}</td>
                      <td className="px-4 py-3 text-[13px] text-[#374151]">{category.slug}</td>
                      <td className="px-4 py-3 text-[13px] text-[#374151]">{category.books_count ?? 0}</td>
                      <td className="px-4 py-3 text-[13px] text-[#374151]">{category.description || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="inline-flex h-8 items-center gap-1 rounded-[8px] bg-[#16874b] px-3 text-[12px] font-semibold text-white"
                            style={{ fontFamily: 'Urbanist, sans-serif' }}
                            onClick={() => startEdit(category)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>

                          <WarningButton
                            type="button"
                            className="h-8 gap-1 rounded-[8px] px-3 text-[12px] font-semibold"
                            onClick={() => handleDelete(category.id_book_category)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Hapus
                          </WarningButton>
                        </div>
                      </td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>
      </section>
    </AdminBimbinganShell>
  );
}
