'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    useCorrespondenceCategoriesQuery,
    useCorrespondenceRecipientsQuery,
    useCreateCorrespondenceMutation,
} from '@/features/persuratan/hooks/useCorrespondenceQueries';

/**
 * Custom hook for the "Ajukan Surat" form.
 * Encapsulates all business logic: data fetching, form submission, and navigation.
 * The UI component receives only data and callbacks — zero API awareness.
 */
export function useAjukanSurat() {
    const router = useRouter();

    const categoriesQuery = useCorrespondenceCategoriesQuery();
    const recipientsQuery = useCorrespondenceRecipientsQuery();
    const createMutation = useCreateCorrespondenceMutation();

    const [submitError, setSubmitError] = useState(null);

    const error = useMemo(() => {
        const categoryError = categoriesQuery.error?.message || categoriesQuery.error?.userMessage;
        const recipientError = recipientsQuery.error?.message || recipientsQuery.error?.userMessage;
        return categoryError || recipientError || null;
    }, [categoriesQuery.error, recipientsQuery.error]);

    /**
     * Submit the form.
     * @param {Object} data — validated form data from react-hook-form
     * @param {string} data.title
     * @param {number} data.category_id
     * @param {number} data.recipient_id
     * @param {string} data.body
     * @param {File}   [data.attachment]
     */
    const onSubmit = useCallback(async (data) => {
        setSubmitError(null);
        try {
            await createMutation.mutateAsync({
                title: data.title,
                id_category: Number(data.category_id),
                id_recipient: Number(data.recipient_id),
                correspondence_body: data.body,
                attachment: data.attachment || undefined,
            });

            // Navigate to success splash on successful submission
            router.push('/persuratan/success');
        } catch (err) {
            console.error('[useAjukanSurat] Submit error:', err);

            // Detailed 422 validation error logging
            const statusCode = err?.status || err?.response?.status;
            const validationErrors = err?.validationErrors || err?.response?.data?.errors;

            if (statusCode === 422) {
                console.error('[useAjukanSurat] 422 Validation Errors:', validationErrors);

                if (validationErrors) {
                    const firstField = Object.keys(validationErrors)[0];
                    const firstMessage = validationErrors[firstField]?.[0];
                    setSubmitError(firstMessage || 'Data yang dikirim tidak valid.');
                    return;
                }
            }

            setSubmitError(
                err?.response?.data?.message ||
                err?.message ||
                'Gagal mengirim pengajuan. Silakan coba lagi.'
            );
        }
    }, [createMutation, router]);

    return {
        categories: categoriesQuery.data || [],
        recipients: recipientsQuery.data || [],
        isLoading: categoriesQuery.isLoading || recipientsQuery.isLoading,
        isSubmitting: createMutation.isPending,
        error,
        submitError,
        onSubmit,
    };
}
