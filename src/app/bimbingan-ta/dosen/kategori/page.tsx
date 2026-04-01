'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AlertConfirmationRedDialog } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { ErrorMessageBoxWithButton, SuccessMessageBox } from '@/components/ui/message-box';
import { StudentThesisShell } from '@/features/bimbingan-ta/components/ThesisShell';
import ThesisLoadingBlock from '@/features/bimbingan-ta/components/ThesisLoadingBlock';
import ThesisSectionCard from '@/features/bimbingan-ta/components/ThesisSectionCard';
import ThesisStatusBadge from '@/features/bimbingan-ta/components/ThesisStatusBadge';
import { lecturerThesisApi } from '@/features/bimbingan-ta/api/lecturer';
import type { ThesisCategory } from '@/features/bimbingan-ta/types';

const blankForm = { name: '', description: '' };

export default function DosenCategoriesPage() {
  const [categories, setCategories] = useState<ThesisCategory[]>([]);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ThesisCategory | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await lecturerThesisApi.getCategories();
      setCategories(data);
    } catch (err: any) {
      setError(err?.userMessage || err?.message || 'Gagal memuat kategori thesis.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(null), 4000);
    return () => clearTimeout(timer);
  }, [success]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      if (editingId) {
        await lecturerThesisApi.updateCategory(editingId, form);
        setSuccess('Kategori thesis berhasil diperbarui.');
      } else {
        await lecturerThesisApi.createCategory(form);
        setSuccess('Kategori thesis berhasil ditambahkan.');
      }

      setForm(blankForm);
      setEditingId(null);
      await fetchData();
    } catch (err: any) {
      setError(err?.userMessage || err?.message || 'Gagal menyimpan kategori.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await lecturerThesisApi.deleteCategory(deleteTarget.id_thesis_category);
      setSuccess('Kategori thesis berhasil dihapus.');
      setDeleteTarget(null);
      await fetchData();
    } catch (err: any) {
      setError(err?.userMessage || err?.message || 'Gagal menghapus kategori.');
    }
  };

  const startEdit = (category: ThesisCategory) => {
    setEditingId(category.id_thesis_category);
    setForm({
      name: category.name,
      description: category.description || '',
    });
  };

  return (
    <StudentThesisShell title="Kategori Thesis" description="Kelola kategori penelitian yang digunakan pada topik TA dosen." backHref="/bimbingan-ta/dosen">
      {isLoading ? (
        <ThesisLoadingBlock />
      ) : error && categories.length === 0 ? (
        <ErrorMessageBoxWithButton message={error} action={fetchData} />
      ) : (
        <div className="space-y-6">
          {success ? <SuccessMessageBox message={success} /> : null}
          {error && categories.length > 0 ? <ErrorMessageBoxWithButton message={error} action={fetchData} /> : null}

          <ThesisSectionCard
            title={editingId ? 'Edit Kategori' : 'Tambah Kategori Baru'}
            description="Kategori baru akan langsung tersedia untuk pembuatan topik TA."
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#015023]">Nama Kategori</label>
                <input
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#015023]">Deskripsi</label>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                  rows={4}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" type="submit">
                  {editingId ? 'Simpan Perubahan' : 'Tambah Kategori'}
                </Button>
                {editingId ? (
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setForm(blankForm);
                    }}
                  >
                    Batal Edit
                  </Button>
                ) : null}
              </div>
            </form>
          </ThesisSectionCard>

          <div className="grid gap-4 md:grid-cols-2">
            {categories.map((category) => (
              <ThesisSectionCard
                key={category.id_thesis_category}
                title={category.name}
                description={category.description || 'Tidak ada deskripsi kategori.'}
                actions={<ThesisStatusBadge status={category.thesis_topics?.length ? 'available' : 'draft'} />}
              >
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={() => startEdit(category)}>
                    Edit
                  </Button>
                  <Button variant="warning" onClick={() => setDeleteTarget(category)}>
                    Hapus
                  </Button>
                </div>
              </ThesisSectionCard>
            ))}
          </div>
        </div>
      )}

      <AlertConfirmationRedDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Kategori Thesis"
        description={`Hapus kategori "${deleteTarget?.name || ''}"? Backend akan menolak jika kategori masih digunakan oleh topik.`}
        confirmText="Ya, Hapus"
        onConfirm={handleDelete}
      />
    </StudentThesisShell>
  );
}
