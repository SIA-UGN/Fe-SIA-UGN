'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { correspondenceService } from '@/types/correspondence';

/**
 * Custom hook for the "Edit Surat" page.
 * Fetches the letter detail + master data, guards against editing non-submitted letters,
 * and provides an onSubmit that calls the update service.
 */
export function useEditSurat(correspondenceId) {
    const router = useRouter();

    // Data states
    const [initialData, setInitialData] = useState(null);
    const [categories, setCategories] = useState([]);
    const [recipients, setRecipients] = useState([]);

    // Loading / error states
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [submitError, setSubmitError] = useState(null);

    // Fetch detail + categories + recipients on mount
    useEffect(() => {
        let cancelled = false;

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [detail, cats, recs] = await Promise.all([
                    correspondenceService.getDetail(Number(correspondenceId)),
                    correspondenceService.getCategories(),
                    correspondenceService.getRecipients(),
                ]);

                if (cancelled) return;

                // Business logic: only "submitted" letters can be edited
                if (detail.status !== 'submitted') {
                    alert('Surat yang sudah diproses tidak dapat diubah.');
                    router.replace('/persuratan/status');
                    return;
                }

                // Map detail to initialData, including attachment_url
                setInitialData({
                    ...detail,
                    id_category: detail.id_category || detail.category?.id_category,
                    id_recipient: detail.id_recipient || detail.recipient?.id_recipient,
                    attachment_url: detail.attachment_url || null,
                });
                setCategories(cats || []);
                setRecipients(recs || []);
            } catch (err) {
                if (!cancelled) {
                    console.error('[useEditSurat] Error fetching data:', err);
                    setError(
                        err?.response?.data?.message ||
                        err?.message ||
                        'Gagal memuat data surat.'
                    );
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        if (correspondenceId) {
            fetchData();
        }
        return () => { cancelled = true; };
    }, [correspondenceId, router]);

    /**
     * Submit the edited form.
     * If the user did NOT select a new file, don't send attachment —
     * the backend will keep the existing one.
     */
    const onSubmit = useCallback(async (data) => {
        setIsSubmitting(true);
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

            await correspondenceService.update(Number(correspondenceId), payload);

            // Navigate to status page on success
            router.push('/persuratan/status');
        } catch (err) {
            console.error('[useEditSurat] Submit error:', err);

            // Detailed 422 validation error logging
            if (err?.response?.status === 422) {
                const validationErrors = err.response.data?.errors;
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
        } finally {
            setIsSubmitting(false);
        }
    }, [correspondenceId, router]);

    return {
        initialData,
        categories,
        recipients,
        isLoading,
        isSubmitting,
        error,
        submitError,
        onSubmit,
    };
}
