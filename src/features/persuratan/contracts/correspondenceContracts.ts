import { z } from 'zod';

export const ApiStatusSchema = z.enum(['success', 'error']);

export const ApiResponseSchema = z.object({
  status: ApiStatusSchema.optional(),
  message: z.string().optional(),
  data: z.unknown().optional(),
});

export const CorrespondenceStatusSchema = z.enum([
  'submitted',
  'process',
  'resolved',
  'rejected',
]);

export const CategorySchema = z.object({
  id_category: z.coerce.number().int().positive(),
  name: z.string().nullish(),
  slug: z.string().nullish(),
  description: z.string().nullish(),
  created_at: z.string().nullish(),
  updated_at: z.string().nullish(),
});

export const RecipientSchema = z.object({
  id_recipient: z.coerce.number().int().positive(),
  name: z.string().nullish(),
  slug: z.string().nullish(),
  description: z.string().nullish(),
  created_at: z.string().nullish(),
  updated_at: z.string().nullish(),
});

export const CorrespondenceRawSchema = z.object({
  id_correspondence: z.coerce.number().int().positive().optional(),
  id: z.coerce.number().int().positive().optional(),
  id_user: z.coerce.number().int().positive().optional(),
  user_id: z.coerce.number().int().positive().optional(),
  id_category: z.coerce.number().int().positive().optional(),
  id_recipient: z.coerce.number().int().positive().optional(),
  sender_name: z.string().nullish(),
  sender_email: z.string().nullish(),
  sender_nim: z.string().nullish(),
  sender_nip: z.string().nullish(),
  user_name: z.string().nullish(),
  user_email: z.string().nullish(),
  title: z.string().nullish(),
  correspondence_body: z.string().nullish(),
  status: CorrespondenceStatusSchema.catch('submitted'),
  attachment_url: z.string().nullish(),
  attachment: z.string().nullish(),
  response_text: z.string().nullish(),
  responded_at: z.string().nullish(),
  created_at: z.string().nullish(),
  updated_at: z.string().nullish(),
  category: CategorySchema.nullish(),
  recipient: RecipientSchema.nullish(),
  user: z
    .object({
      name: z.string().nullish(),
      email: z.string().nullish(),
      nim: z.string().nullish(),
      nip: z.string().nullish(),
    })
    .nullish(),
});

export const CorrespondenceListResponseSchema = ApiResponseSchema.extend({
  data: z.array(CorrespondenceRawSchema).default([]),
});

export const CorrespondenceDetailResponseSchema = ApiResponseSchema.extend({
  data: CorrespondenceRawSchema,
});

export const CategoryListResponseSchema = ApiResponseSchema.extend({
  data: z.array(CategorySchema).default([]),
});

export const CategoryDetailResponseSchema = ApiResponseSchema.extend({
  data: CategorySchema,
});

export const RecipientListResponseSchema = ApiResponseSchema.extend({
  data: z.array(RecipientSchema).default([]),
});

export const RecipientDetailResponseSchema = ApiResponseSchema.extend({
  data: RecipientSchema,
});

export function normalizeCorrespondence(raw: unknown) {
  const parsed = CorrespondenceRawSchema.parse(raw);
  const id = Number(parsed.id_correspondence ?? parsed.id ?? 0);
  const idUser = Number(parsed.id_user ?? parsed.user_id ?? 0);
  const category = parsed.category ?? (parsed.id_category ? {
    id_category: parsed.id_category,
    name: '-',
    slug: '',
    description: null,
  } : null);
  const recipient = parsed.recipient ?? (parsed.id_recipient ? {
    id_recipient: parsed.id_recipient,
    name: '-',
    slug: '',
    description: null,
  } : null);
  const userName = parsed.sender_name || parsed.user_name || parsed.user?.name || '-';
  const userEmail = parsed.sender_email || parsed.user_email || parsed.user?.email || '-';

  return {
    id,
    id_correspondence: id,
    id_user: idUser,
    id_category: category?.id_category ?? parsed.id_category ?? null,
    id_recipient: recipient?.id_recipient ?? parsed.id_recipient ?? null,
    title: parsed.title || '-',
    correspondence_body: parsed.correspondence_body || '-',
    status: parsed.status,
    attachment_url: parsed.attachment_url ?? parsed.attachment ?? null,
    response_text: parsed.response_text ?? null,
    responded_at: parsed.responded_at ?? null,
    created_at: parsed.created_at ?? null,
    updated_at: parsed.updated_at ?? null,
    category: category || null,
    recipient: recipient || null,
    user: parsed.user || null,
    sender_name: userName,
    sender_email: userEmail,
    sender_nim: parsed.sender_nim || parsed.user?.nim || null,
    sender_nip: parsed.sender_nip || parsed.user?.nip || null,
    user_name: userName,
    user_email: userEmail,
  };
}
