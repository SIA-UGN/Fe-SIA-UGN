import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ADMIN_LIBRARY_QUERY_KEYS,
  fetchAdminLibrarySuggestionDetail,
  fetchAdminLibrarySuggestions,
  respondAdminLibrarySuggestionAction,
} from '@/features/library/services/adminLibraryService';

export function useAdminLibrarySuggestionsQuery(params) {
  return useQuery({
    queryKey: ADMIN_LIBRARY_QUERY_KEYS.suggestions(params),
    queryFn: () => fetchAdminLibrarySuggestions(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useAdminLibrarySuggestionDetailQuery(suggestionId, options = {}) {
  return useQuery({
    queryKey: ADMIN_LIBRARY_QUERY_KEYS.suggestionDetail(suggestionId),
    queryFn: () => fetchAdminLibrarySuggestionDetail(suggestionId),
    enabled: Boolean(suggestionId) && (options.enabled ?? true),
  });
}

export function useRespondAdminLibrarySuggestionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ suggestionId, payload }) => respondAdminLibrarySuggestionAction(suggestionId, payload),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-library-suggestions'] });
      if (variables?.suggestionId) {
        queryClient.invalidateQueries({
          queryKey: ADMIN_LIBRARY_QUERY_KEYS.suggestionDetail(variables.suggestionId),
        });
      }
    },
  });
}