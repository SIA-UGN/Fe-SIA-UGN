import { z } from 'zod';

export const TuitionBillStatusSchema = z.enum(['unpaid', 'paid', 'overdue', 'cancelled']);
export const PaymentMethodSchema = z.enum(['virtual_account', 'bank_transfer', 'manual']);
export const VerificationStatusSchema = z.enum(['pending', 'verified', 'rejected']);

export const VirtualAccountSchema = z.object({
  bank: z.string().min(1),
  nomor: z.string().min(6),
  bank_code: z.string().min(1).optional(),
  bank_name: z.string().min(1).optional(),
  is_active: z.boolean().optional(),
});

export const TuitionPaymentSchema = z.object({
  id_tuition_payment: z.number().int().positive(),
  id_tuition_fee: z.number().int().positive(),
  id_user_si: z.number().int().positive(),
  amount_paid: z.number().nonnegative(),
  payment_method: PaymentMethodSchema,
  payment_proof: z.string().nullable().optional(),
  transaction_reference: z.string().nullable().optional(),
  verification_status: VerificationStatusSchema,
  verified_by: z.string().nullable().optional(),
  verified_at: z.string().nullable().optional(),
  rejection_reason: z.string().nullable().optional(),
  admin_notes: z.string().nullable().optional(),
  uploaded_at: z.string(),
});

export const TuitionBillSchema = z.object({
  id_tuition_fee: z.number().int().positive(),
  id_user_si: z.number().int().positive(),
  id_academic_period: z.number().int().positive(),
  amount: z.number().nonnegative(),
  discount: z.number().nonnegative(),
  final_amount: z.number().nonnegative(),
  status: TuitionBillStatusSchema,
  due_date: z.string().nullable(),
  notes: z.string().nullable().optional(),
  payment: TuitionPaymentSchema.nullable().optional(),
});

export type TuitionBillStatus = z.infer<typeof TuitionBillStatusSchema>;
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type VerificationStatus = z.infer<typeof VerificationStatusSchema>;
export type VirtualAccount = z.infer<typeof VirtualAccountSchema>;
export type TuitionPayment = z.infer<typeof TuitionPaymentSchema>;
export type TuitionBill = z.infer<typeof TuitionBillSchema>;
