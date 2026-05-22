import { z } from 'zod';

export const ApiStatusSchema = z.enum(['success', 'error']);

export const ApiMetaSchema = z.object({
  current_page: z.coerce.number().int().positive().default(1),
  last_page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().positive().default(15),
  total: z.coerce.number().int().nonnegative().default(0),
});

export const ApiResponseSchema = z.object({
  status: ApiStatusSchema.optional(),
  message: z.string().optional(),
  data: z.unknown().optional(),
  meta: ApiMetaSchema.optional(),
});

export const AdminOrderStatusSchema = z.enum(['ordered', 'borrowed', 'returned', 'cancelled']);

export const AdminLibraryBookBriefSchema = z.object({
  id_book: z.coerce.number().int().positive().nullable().optional(),
  title: z.string().nullish().default('-'),
  author: z.string().nullish().default('-'),
  category: z.union([z.string(), z.null()]).optional(),
  isbn: z.string().nullish().default('-'),
});

export const AdminLibraryOrderRawSchema = z.object({
  id_book_order: z.coerce.number().int().positive(),
  id_user: z.coerce.number().int().positive().nullable().optional(),
  user_name: z.string().nullish().default('-'),
  user_nim: z.string().nullish().default('-'),
  user_email: z.string().nullish().default('-'),
  status: AdminOrderStatusSchema,
  ordered_at: z.string().datetime({ offset: true }).or(z.null()).optional(),
  borrowed_at: z.string().datetime({ offset: true }).or(z.null()).optional(),
  returned_at: z.string().datetime({ offset: true }).or(z.null()).optional(),
  borrow_duration_days: z.coerce.number().int().nullable().optional(),
  borrow_duration: z.string().nullish().default('-'),
  admin_note: z.string().nullish().default('-'),
  created_at: z.string().datetime({ offset: true }).or(z.null()).optional(),
  updated_at: z.string().datetime({ offset: true }).or(z.null()).optional(),
  book: AdminLibraryBookBriefSchema,
});

export const AdminLibraryOrderListResponseSchema = ApiResponseSchema.extend({
  data: z.array(AdminLibraryOrderRawSchema).default([]),
  meta: ApiMetaSchema.optional(),
});

export const AdminLibraryOrderDetailResponseSchema = ApiResponseSchema.extend({
  data: AdminLibraryOrderRawSchema,
});

export const AdminLibrarySuggestionStatusSchema = z.enum(['pending', 'approved', 'rejected']);

export const AdminLibrarySuggestionRawSchema = z.object({
  id_book_suggestion: z.coerce.number().int().positive(),
  id_user: z.coerce.number().int().positive().nullable().optional(),
  user_name: z.string().nullish().default('-'),
  user_nim: z.string().nullish().default('-'),
  user_email: z.string().nullish().default('-'),
  title: z.string().nullish().default('-'),
  author: z.string().nullish().default('-'),
  reason: z.string().nullish().default('-'),
  status: AdminLibrarySuggestionStatusSchema,
  admin_response: z.string().nullish().default('-'),
  responded_at: z.string().datetime({ offset: true }).or(z.null()).optional(),
  created_at: z.string().datetime({ offset: true }).or(z.null()).optional(),
  updated_at: z.string().datetime({ offset: true }).or(z.null()).optional(),
});

export const AdminLibrarySuggestionListResponseSchema = ApiResponseSchema.extend({
  data: z.array(AdminLibrarySuggestionRawSchema).default([]),
  meta: ApiMetaSchema.optional(),
});

export const AdminLibrarySuggestionDetailResponseSchema = ApiResponseSchema.extend({
  data: AdminLibrarySuggestionRawSchema,
});

export const AdminLibraryOrderSchema = z.object({
  id: z.number().int().positive(),
  id_book_order: z.number().int().positive(),
  user_id: z.number().int().positive().nullable(),
  user_name: z.string(),
  user_nim: z.string(),
  user_email: z.string(),
  status: AdminOrderStatusSchema,
  status_label: z.string(),
  ordered_at: z.string().nullable(),
  borrowed_at: z.string().nullable(),
  returned_at: z.string().nullable(),
  due_date: z.string().nullable(),
  borrow_duration_days: z.number().int().nullable(),
  borrow_duration: z.string(),
  admin_note: z.string(),
  book: z.object({
    id_book: z.number().int().positive().nullable(),
    title: z.string(),
    author: z.string(),
    category: z.string(),
    isbn: z.string(),
  }),
  book_title: z.string(),
  book_author: z.string(),
  book_category: z.string(),
  book_isbn: z.string(),
});

export const statusLabelMap = {
  ordered: 'Dipesan',
  borrowed: 'Dipinjam',
  returned: 'Dikembalikan',
  cancelled: 'Dibatalkan',
};

export const suggestionStatusLabelMap = {
  pending: 'Menunggu',
  approved: 'Disetujui',
  rejected: 'Ditolak',
};

function normalizeCategory(rawCategory) {
  if (!rawCategory) return '-';
  if (typeof rawCategory === 'string') return rawCategory;
  if (typeof rawCategory?.name === 'string') return rawCategory.name;
  return '-';
}

function toIsoOrNull(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function deriveDueDate(raw) {
  const base = raw.borrowed_at || raw.ordered_at;
  if (!base) return null;

  const parsed = new Date(base);
  if (Number.isNaN(parsed.getTime())) return null;

  const fallbackDays = 7;
  const durationDays = Number.isFinite(raw.borrow_duration_days) ? raw.borrow_duration_days : fallbackDays;
  const due = new Date(parsed);
  due.setDate(due.getDate() + Math.max(durationDays, fallbackDays));

  return due.toISOString();
}

export function normalizeAdminLibraryOrder(rawOrder) {
  const parsed = AdminLibraryOrderRawSchema.parse(rawOrder);
  const category = normalizeCategory(parsed.book?.category);

  const normalized = {
    id: parsed.id_book_order,
    id_book_order: parsed.id_book_order,
    user_id: parsed.id_user ?? null,
    user_name: parsed.user_name || '-',
    user_nim: parsed.user_nim || '-',
    user_email: parsed.user_email || '-',
    status: parsed.status,
    status_label: statusLabelMap[parsed.status] || parsed.status,
    ordered_at: toIsoOrNull(parsed.ordered_at),
    borrowed_at: toIsoOrNull(parsed.borrowed_at),
    returned_at: toIsoOrNull(parsed.returned_at),
    due_date: deriveDueDate(parsed),
    borrow_duration_days: parsed.borrow_duration_days ?? null,
    borrow_duration: parsed.borrow_duration || '-',
    admin_note: parsed.admin_note || '-',
    book: {
      id_book: parsed.book?.id_book ?? null,
      title: parsed.book?.title || '-',
      author: parsed.book?.author || '-',
      category,
      isbn: parsed.book?.isbn || '-',
    },
    book_title: parsed.book?.title || '-',
    book_author: parsed.book?.author || '-',
    book_category: category,
    book_isbn: parsed.book?.isbn || '-',
  };

  return AdminLibraryOrderSchema.parse(normalized);
}

export const AdminLibrarySuggestionSchema = z.object({
  id: z.number().int().positive(),
  id_book_suggestion: z.number().int().positive(),
  user_id: z.number().int().positive().nullable(),
  user_name: z.string(),
  user_nim: z.string(),
  user_email: z.string(),
  title: z.string(),
  author: z.string(),
  reason: z.string(),
  status: AdminLibrarySuggestionStatusSchema,
  status_label: z.string(),
  admin_response: z.string(),
  responded_at: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export function normalizeAdminLibrarySuggestion(rawSuggestion) {
  const parsed = AdminLibrarySuggestionRawSchema.parse(rawSuggestion);

  const normalized = {
    id: parsed.id_book_suggestion,
    id_book_suggestion: parsed.id_book_suggestion,
    user_id: parsed.id_user ?? null,
    user_name: parsed.user_name || '-',
    user_nim: parsed.user_nim || '-',
    user_email: parsed.user_email || '-',
    title: parsed.title || '-',
    author: parsed.author || '-',
    reason: parsed.reason || '-',
    status: parsed.status,
    status_label: suggestionStatusLabelMap[parsed.status] || parsed.status,
    admin_response: parsed.admin_response || '-',
    responded_at: toIsoOrNull(parsed.responded_at),
    created_at: toIsoOrNull(parsed.created_at),
    updated_at: toIsoOrNull(parsed.updated_at),
  };

  return AdminLibrarySuggestionSchema.parse(normalized);
}
