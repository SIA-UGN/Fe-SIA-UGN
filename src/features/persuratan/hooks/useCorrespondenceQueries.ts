import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { correspondenceService } from '@/types/correspondence';
import type { CorrespondencePayload } from '@/types/correspondence.d';

export const CORRESPONDENCE_QUERY_KEYS = {
  list: (params: Record<string, any> = {}) => ['correspondence', params],
  detail: (id?: number | null) => ['correspondence', 'detail', id],
  categories: () => ['correspondence', 'categories'],
  recipients: () => ['correspondence', 'recipients'],
};

export function useCorrespondenceListQuery(params: Record<string, any> = {}) {
  return useQuery({
    queryKey: CORRESPONDENCE_QUERY_KEYS.list(params),
    queryFn: () => correspondenceService.getAll(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useCorrespondenceDetailQuery(id?: number | null, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: CORRESPONDENCE_QUERY_KEYS.detail(id),
    queryFn: () => correspondenceService.getDetail(Number(id)),
    enabled: Boolean(id) && (options.enabled ?? true),
  });
}

export function useCorrespondenceCategoriesQuery() {
  return useQuery({
    queryKey: CORRESPONDENCE_QUERY_KEYS.categories(),
    queryFn: () => correspondenceService.getCategories(),
    placeholderData: (previousData) => previousData,
  });
}

export function useCorrespondenceRecipientsQuery() {
  return useQuery({
    queryKey: CORRESPONDENCE_QUERY_KEYS.recipients(),
    queryFn: () => correspondenceService.getRecipients(),
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateCorrespondenceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CorrespondencePayload) => correspondenceService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['correspondence'] });
    },
  });
}

export function useUpdateCorrespondenceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) =>
      correspondenceService.update(id, payload),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['correspondence'] });
      if (variables?.id) {
        queryClient.invalidateQueries({
          queryKey: CORRESPONDENCE_QUERY_KEYS.detail(variables.id),
        });
      }
    },
  });
}

export function useDeleteCorrespondenceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => correspondenceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['correspondence'] });
    },
  });
}

export function useDeleteCorrespondenceAttachmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => correspondenceService.deleteAttachment(id),
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: ['correspondence'] });
      if (id) {
        queryClient.invalidateQueries({
          queryKey: CORRESPONDENCE_QUERY_KEYS.detail(id),
        });
      }
    },
  });
}

export function useRespondCorrespondenceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) =>
      correspondenceService.respond(id, payload),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['correspondence'] });
      if (variables?.id) {
        queryClient.invalidateQueries({
          queryKey: CORRESPONDENCE_QUERY_KEYS.detail(variables.id),
        });
      }
    },
  });
}

export function useUpdateCorrespondenceStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      correspondenceService.updateStatus(id, status),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['correspondence'] });
      if (variables?.id) {
        queryClient.invalidateQueries({
          queryKey: CORRESPONDENCE_QUERY_KEYS.detail(variables.id),
        });
      }
    },
  });
}
