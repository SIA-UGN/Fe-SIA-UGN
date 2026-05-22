import { z } from 'zod';

export const ApiStatusSchema = z.enum(['success', 'error']);

export const ApiResponseSchema = z.object({
  status: ApiStatusSchema.optional(),
  message: z.string().optional(),
  data: z.unknown().optional(),
});

export const TuitionStatusSchema = z.enum(['unpaid', 'paid', 'overdue', 'cancelled']);
export const PaymentMethodSchema = z.enum(['virtual_account', 'bank_transfer', 'manual']);
export const VerificationStatusSchema = z.enum(['pending', 'verified', 'rejected']);

export const AcademicPeriodSchema = z.object({
  id_academic_period: z.coerce.number().int().positive().optional(),
  name: z.string().nullish(),
  is_active: z.boolean().optional(),
  start_date: z.string().nullish(),
  end_date: z.string().nullish(),
});

export const TuitionRateSchema = z.object({
  id_tuition_rate: z.coerce.number().int().positive().optional(),
  group_name: z.string().nullish(),
  base_amount: z.coerce.number().nonnegative().optional(),
});

export const StudentPaymentSchema = z.object({
  id_tuition_payment: z.coerce.number().int().positive(),
  amount_paid: z.coerce.number().nonnegative(),
  payment_method: PaymentMethodSchema,
  payment_proof_url: z.string().nullish(),
  payment_proof: z.string().nullish(),
  transaction_reference: z.string().nullish(),
  verification_status: VerificationStatusSchema,
  verified_by: z.string().nullish(),
  verified_at: z.string().nullish(),
  rejection_reason: z.string().nullish(),
  admin_notes: z.string().nullish(),
  uploaded_at: z.string().nullish(),
});

export const StudentBillSchema = z.object({
  id_tuition_fee: z.coerce.number().int().positive(),
  academic_period: AcademicPeriodSchema,
  tuition_rate: TuitionRateSchema,
  amount: z.coerce.number().nonnegative(),
  discount: z.coerce.number().nonnegative().default(0),
  final_amount: z.coerce.number().nonnegative(),
  status: TuitionStatusSchema,
  due_date: z.string().nullish(),
  is_overdue: z.boolean().optional(),
  notes: z.string().nullish(),
  payment: StudentPaymentSchema.nullish().optional(),
  created_at: z.string().nullish(),
  updated_at: z.string().nullish(),
});

export const StudentBillsSummarySchema = z.object({
  total_bills: z.coerce.number().int().nonnegative().default(0),
  total_unpaid: z.coerce.number().int().nonnegative().default(0),
  total_paid: z.coerce.number().int().nonnegative().default(0),
  total_overdue: z.coerce.number().int().nonnegative().default(0),
  total_cancelled: z.coerce.number().int().nonnegative().default(0),
  total_unpaid_amount: z.coerce.number().nonnegative().default(0),
  total_paid_amount: z.coerce.number().nonnegative().default(0),
});

export const StudentBillsResponseSchema = ApiResponseSchema.extend({
  data: z.object({
    bills: z.array(StudentBillSchema).default([]),
    summary: StudentBillsSummarySchema.optional(),
  }),
});

export const StudentBillDetailResponseSchema = ApiResponseSchema.extend({
  data: StudentBillSchema,
});

export const VirtualAccountSchema = z.object({
  va_number: z.string().min(1),
  bank_code: z.string().nullish(),
  bank_name: z.string().nullish(),
  is_active: z.boolean().optional(),
});

export const StudentVirtualAccountResponseSchema = ApiResponseSchema.extend({
  data: VirtualAccountSchema.nullable(),
});

export const StudentPaymentHistoryItemSchema = z.object({
  id_tuition_payment: z.coerce.number().int().positive(),
  academic_period: z.string().nullish(),
  amount_paid: z.coerce.number().nonnegative(),
  payment_method: PaymentMethodSchema,
  payment_proof_url: z.string().nullish(),
  transaction_reference: z.string().nullish(),
  verification_status: VerificationStatusSchema,
  verified_by: z.string().nullish(),
  verified_at: z.string().nullish(),
  rejection_reason: z.string().nullish(),
  admin_notes: z.string().nullish(),
  uploaded_at: z.string().nullish(),
});

export const StudentPaymentHistoryResponseSchema = ApiResponseSchema.extend({
  data: z.array(StudentPaymentHistoryItemSchema).default([]),
});

export const StudentPaymentDetailSchema = StudentPaymentHistoryItemSchema.extend({
  tuition_fee: z.object({
    id_tuition_fee: z.coerce.number().int().positive(),
    academic_period: z.string().nullish(),
    final_amount: z.coerce.number().nonnegative(),
    status: TuitionStatusSchema,
  }),
});

export const StudentPaymentDetailResponseSchema = ApiResponseSchema.extend({
  data: StudentPaymentDetailSchema,
});

export const CheckoutCoreResponseSchema = z.object({
  id_tuition_payment: z.coerce.number().int().positive(),
  id_tuition_fee: z.coerce.number().int().positive(),
  amount: z.coerce.number().nonnegative(),
  payment_method: z.string().optional(),
  method: z.literal('core_api'),
  midtrans_order_id: z.string().nullish(),
  midtrans_va_bank: z.string().nullish(),
  va_number: z.string().nullish(),
  verification_status: z.string().nullish(),
  expiry_time: z.string().nullish(),
  created_at: z.string().nullish(),
});

export const CheckoutSnapResponseSchema = z.object({
  id_tuition_payment: z.coerce.number().int().positive(),
  id_tuition_fee: z.coerce.number().int().positive(),
  amount: z.coerce.number().nonnegative(),
  payment_method: z.string().optional(),
  method: z.literal('snap'),
  midtrans_order_id: z.string().nullish(),
  midtrans_va_bank: z.string().nullish(),
  snap_token: z.string().nullish(),
  redirect_url: z.string().nullish(),
  verification_status: z.string().nullish(),
  expiry_time: z.string().nullish(),
  created_at: z.string().nullish(),
});

export const StudentCheckoutResponseSchema = ApiResponseSchema.extend({
  data: z.union([CheckoutCoreResponseSchema, CheckoutSnapResponseSchema]),
});

export const MidtransStatusResponseSchema = ApiResponseSchema.extend({
  data: z.object({
    id_tuition_payment: z.coerce.number().int().positive(),
    id_tuition_fee: z.coerce.number().int().positive(),
    verification_status: z.string().nullish(),
    payment_method: z.string().nullish(),
    midtrans_order_id: z.string().nullish(),
    midtrans_va_number: z.string().nullish(),
    midtrans_va_bank: z.string().nullish(),
    midtrans_expiry_time: z.string().nullish(),
    midtrans_status: z.unknown().optional(),
  }),
});

export const AdminDashboardResponseSchema = ApiResponseSchema.extend({
  data: z.object({
    period_id: z.coerce.number().int().positive().optional(),
    summary: z.object({
      total_bills: z.coerce.number().int().nonnegative().default(0),
      total_unpaid: z.coerce.number().int().nonnegative().default(0),
      total_paid: z.coerce.number().int().nonnegative().default(0),
      total_overdue: z.coerce.number().int().nonnegative().default(0),
      total_cancelled: z.coerce.number().int().nonnegative().default(0),
      total_amount: z.coerce.number().nonnegative().default(0),
      total_paid_amount: z.coerce.number().nonnegative().default(0),
      total_unpaid_amount: z.coerce.number().nonnegative().default(0),
      pending_verification: z.coerce.number().int().nonnegative().default(0),
    }),
    by_program: z.array(z.object({
      id_program: z.coerce.number().int().positive(),
      program_name: z.string().nullish(),
      total: z.coerce.number().int().nonnegative().default(0),
      paid: z.coerce.number().int().nonnegative().default(0),
      unpaid: z.coerce.number().int().nonnegative().default(0),
      total_amount: z.coerce.number().nonnegative().default(0),
      paid_amount: z.coerce.number().nonnegative().default(0),
    })).default([]),
  }),
});

export const AdminBillListItemSchema = z.object({
  id_tuition_fee: z.coerce.number().int().positive(),
  student: z.object({
    id_user_si: z.coerce.number().int().positive().optional(),
    name: z.string().nullish(),
    nim: z.string().nullish(),
    program: z.string().nullish(),
  }),
  academic_period: z.string().nullish(),
  group_name: z.string().nullish(),
  amount: z.coerce.number().nonnegative(),
  discount: z.coerce.number().nonnegative().default(0),
  final_amount: z.coerce.number().nonnegative(),
  status: TuitionStatusSchema,
  due_date: z.string().nullish(),
  payment_status: z.string().nullish(),
  created_at: z.string().nullish(),
});

export const AdminBillsResponseSchema = ApiResponseSchema.extend({
  data: z.array(AdminBillListItemSchema).default([]),
});

export const AdminBillDetailSchema = z.object({
  id_tuition_fee: z.coerce.number().int().positive(),
  student: z.object({
    id_user_si: z.coerce.number().int().positive().optional(),
    name: z.string().nullish(),
    nim: z.string().nullish(),
    program: z.string().nullish(),
  }),
  virtual_account: z.object({
    va_number: z.string().nullish(),
    bank_name: z.string().nullish(),
  }).nullish(),
  academic_period: AcademicPeriodSchema,
  tuition_rate: TuitionRateSchema.nullish(),
  amount: z.coerce.number().nonnegative(),
  discount: z.coerce.number().nonnegative().default(0),
  final_amount: z.coerce.number().nonnegative(),
  status: TuitionStatusSchema,
  due_date: z.string().nullish(),
  notes: z.string().nullish(),
  payment: StudentPaymentSchema.nullish().optional(),
  created_at: z.string().nullish(),
  updated_at: z.string().nullish(),
});

export const AdminBillDetailResponseSchema = ApiResponseSchema.extend({
  data: AdminBillDetailSchema,
});

export const AdminPaymentListItemSchema = z.object({
  id_tuition_payment: z.coerce.number().int().positive(),
  student: z.object({
    id_user_si: z.coerce.number().int().positive().optional(),
    name: z.string().nullish(),
    nim: z.string().nullish(),
    program: z.string().nullish().optional(),
  }),
  academic_period: z.string().nullish(),
  bill_amount: z.coerce.number().nonnegative().optional(),
  amount_paid: z.coerce.number().nonnegative(),
  payment_method: PaymentMethodSchema,
  payment_proof_url: z.string().nullish(),
  transaction_reference: z.string().nullish(),
  verification_status: VerificationStatusSchema,
  verified_by: z.string().nullish(),
  verified_at: z.string().nullish(),
  uploaded_at: z.string().nullish(),
});

export const AdminPaymentsResponseSchema = ApiResponseSchema.extend({
  data: z.array(AdminPaymentListItemSchema).default([]),
});

export const AdminPaymentDetailSchema = z.object({
  id_tuition_payment: z.coerce.number().int().positive(),
  student: z.object({
    id_user_si: z.coerce.number().int().positive().optional(),
    name: z.string().nullish(),
    nim: z.string().nullish(),
    program: z.string().nullish(),
  }),
  tuition_fee: z.object({
    id_tuition_fee: z.coerce.number().int().positive(),
    academic_period: z.string().nullish(),
    group_name: z.string().nullish(),
    amount: z.coerce.number().nonnegative(),
    discount: z.coerce.number().nonnegative().default(0),
    final_amount: z.coerce.number().nonnegative(),
    status: TuitionStatusSchema,
  }),
  amount_paid: z.coerce.number().nonnegative(),
  payment_method: PaymentMethodSchema,
  payment_proof_url: z.string().nullish(),
  transaction_reference: z.string().nullish(),
  verification_status: VerificationStatusSchema,
  verified_by: z.string().nullish(),
  verified_at: z.string().nullish(),
  rejection_reason: z.string().nullish(),
  admin_notes: z.string().nullish(),
  uploaded_at: z.string().nullish(),
});

export const AdminPaymentDetailResponseSchema = ApiResponseSchema.extend({
  data: AdminPaymentDetailSchema,
});

export const AdminVirtualAccountSchema = z.object({
  id_virtual_account: z.coerce.number().int().positive(),
  student: z.object({
    id_user_si: z.coerce.number().int().positive().optional(),
    name: z.string().nullish(),
    nim: z.string().nullish(),
  }),
  va_number: z.string().nullish(),
  bank_code: z.string().nullish(),
  bank_name: z.string().nullish(),
  is_active: z.boolean().optional(),
  created_at: z.string().nullish(),
});

export const AdminVirtualAccountsResponseSchema = ApiResponseSchema.extend({
  data: z.array(AdminVirtualAccountSchema).default([]),
});

export type StudentBill = z.infer<typeof StudentBillSchema>;
export type StudentPayment = z.infer<typeof StudentPaymentSchema>;
export type StudentBillsSummary = z.infer<typeof StudentBillsSummarySchema>;
export type AdminBillListItem = z.infer<typeof AdminBillListItemSchema>;
export type AdminPaymentListItem = z.infer<typeof AdminPaymentListItemSchema>;
export type AdminPaymentDetail = z.infer<typeof AdminPaymentDetailSchema>;
export type AdminVirtualAccount = z.infer<typeof AdminVirtualAccountSchema>;
