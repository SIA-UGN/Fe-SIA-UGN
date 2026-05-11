'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    useCorrespondenceCategoriesQuery,
    useCorrespondenceDetailQuery,
    useCorrespondenceRecipientsQuery,
    useUpdateCorrespondenceMutation,
} from '@/features/persuratan/hooks/useCorrespondenceQueries';

/**
 * Custom hook for the "Edit Surat" page.
 * Fetches the letter detail + master data, guards against editing non-submitted letters,
 * and provides an onSubmit that calls the update service.
 */
export function useEditSurat(correspondenceId) {
    const router = useRouter();

    const detailQuery = useCorrespondenceDetailQuery(correspondenceId, { enabled: Boolean(correspondenceId) });
    const categoriesQuery = useCorrespondenceCategoriesQuery();
    const recipientsQuery = useCorrespondenceRecipientsQuery();
    const updateMutation = useUpdateCorrespondenceMutation();

    const [submitError, setSubmitError] = useState(null);

    const initialData = useMemo(() => {
        if (!detailQuery.data) return null;
        return {
            ...detailQuery.data,
            id_category: detailQuery.data.id_category || detailQuery.data.category?.id_category,
            id_recipient: detailQuery.data.id_recipient || detailQuery.data.recipient?.id_recipient,
            attachment_url: detailQuery.data.attachment_url || null,
        };
    }, [detailQuery.data]);

    useEffect(() => {
        if (!detailQuery.data) return;

        if (detailQuery.data.status !== 'submitted') {
            alert('Surat yang sudah diproses tidak dapat diubah.');
            router.replace('/persuratan/status');
        }
    }, [detailQuery.data, router]);

    /**
     * Submit the edited form.
     * If the user did NOT select a new file, don't send attachment —
     * the backend will keep the existing one.
     */
    const onSubmit = useCallback(async (data) => {
        setSubmitError(null);
        try {
            const payload = {
                title: data.title,
                id_category: Number(data.category_id),
                id_recipient: Number(data.recipient_id),
                correspondence_body: data.body,
            };

            // Only append attachment if user selected a new file
            if (data.attachment) {
                payload.attachment = data.attachment;
            }

            await updateMutation.mutateAsync({ id: Number(correspondenceId), payload });

            // Navigate to status page on success
            router.push('/persuratan/status');
        } catch (err) {
            console.error('[useEditSurat] Submit error:', err);

            // Detailed 422 validation error logging
            const statusCode = err?.status || err?.response?.status;
            const validationErrors = err?.validationErrors || err?.response?.data?.errors;

            if (statusCode === 422) {
                console.error('[useEditSurat] 422 Validation Errors:', validationErrors);

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
                'Gagal menyimpan perubahan. Silakan coba lagi.'
            );
        }
    }, [correspondenceId, updateMutation, router]);

    const error =
        detailQuery.error?.message ||
        detailQuery.error?.userMessage ||
        categoriesQuery.error?.message ||
        recipientsQuery.error?.message ||
        null;

    return {
        initialData,
        categories: categoriesQuery.data || [],
        recipients: recipientsQuery.data || [],
        isLoading: detailQuery.isLoading || categoriesQuery.isLoading || recipientsQuery.isLoading,
        isSubmitting: updateMutation.isPending,
        error,
        submitError,
        onSubmit,
    };
}
