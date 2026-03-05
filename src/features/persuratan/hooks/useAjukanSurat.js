'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { correspondenceService } from '@/types/correspondence';

/**
 * Custom hook for the "Ajukan Surat" form.
 * Encapsulates all business logic: data fetching, form submission, and navigation.
 * The UI component receives only data and callbacks — zero API awareness.
 */
export function useAjukanSurat() {
    const router = useRouter();

    // Master data
    const [categories, setCategories] = useState([]);
    const [recipients, setRecipients] = useState([]);

    // Loading / error states
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [submitError, setSubmitError] = useState(null);

    // Fetch categories and recipients on mount
    useEffect(() => {
        let cancelled = false;

        const fetchMasterData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [cats, recs] = await Promise.all([
                    correspondenceService.getCategories(),
                    correspondenceService.getRecipients(),
                ]);
                if (!cancelled) {
                    setCategories(cats || []);
                    setRecipients(recs || []);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error('[useAjukanSurat] Error fetching master data:', err);
                    setError(
                        err?.response?.data?.message ||
                        err?.message ||
                        'Gagal memuat data kategori dan tujuan.'
                    );
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        fetchMasterData();
        return () => { cancelled = true; };
    }, []);

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
        setIsSubmitting(true);
        setSubmitError(null);
        try {
            await correspondenceService.create({
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
            if (err?.response?.status === 422) {
                const validationErrors = err.response.data?.errors;
                console.error('[useAjukanSurat] 422 Validation Errors:', validationErrors);

                // Build a user-friendly message from the first validation error
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
        } finally {
            setIsSubmitting(false);
        }
    }, [router]);

    return {
        categories,
        recipients,
        isLoading,
        isSubmitting,
        error,
        submitError,
        onSubmit,
    };
}
