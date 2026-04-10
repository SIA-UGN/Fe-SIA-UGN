import type { PaginatedResponse, ProgramOption } from '../types';

export interface NormalizedApiError extends Error {
  statusCode?: number;
  validationErrors?: Record<string, string[]>;
  userMessage: string;
  raw?: any;
}

export function normalizeApiError(error: any): NormalizedApiError {
  const statusCode = error?.status || error?.response?.status;
  const validationErrors =
    error?.errors || error?.response?.data?.errors || undefined;
  const businessMessage =
    error?.message ||
    error?.response?.data?.message ||
    error?.userMessage ||
    'Terjadi kesalahan. Silakan coba lagi.';

  const normalized = new Error(getFirstErrorMessage(validationErrors) || businessMessage) as NormalizedApiError;
  normalized.statusCode = statusCode;
  normalized.validationErrors = validationErrors;
  normalized.userMessage = getFirstErrorMessage(validationErrors) || businessMessage;
  normalized.raw = error;
  return normalized;
}

export function getFirstErrorMessage(validationErrors?: Record<string, string[]>) {
  if (!validationErrors) return null;
  const firstKey = Object.keys(validationErrors)[0];
  if (!firstKey) return null;
  return validationErrors[firstKey]?.[0] || null;
}

export function unwrapResponseData<T>(response: { data?: T }) {
  return response?.data as T;
}

export function unwrapPaginatedData<T>(response: { data?: PaginatedResponse<T> }) {
  return response?.data as PaginatedResponse<T>;
}

export function buildFormData(payload: object) {
  const formData = new FormData();

  Object.entries(payload as Record<string, unknown>).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;

    if (value instanceof Blob) {
      formData.append(key, value);
      return;
    }

    if (typeof value === 'boolean') {
      formData.append(key, value ? '1' : '0');
      return;
    }

    formData.append(key, String(value));
  });

  return formData;
}

export function mapProgramsToOptions(programs?: any[]): ProgramOption[] {
  if (!Array.isArray(programs)) return [];

  return programs
    .map((program) => ({
      id_program: Number(program?.id_program || program?.id),
      name: program?.name || program?.program_name || '',
    }))
    .filter((program) => Number.isFinite(program.id_program) && program.name);
}

export function getProgramCandidatesFromPayload(payload: any): ProgramOption[] {
  if (!payload || typeof payload !== 'object') return [];

  const directId = Number(payload.id_program);
  const directName =
    payload.program_name ||
    payload.program?.name ||
    payload.staff_data?.program?.name ||
    payload.staff_profile?.program?.name;

  const derived: ProgramOption[] = [];

  if (Number.isFinite(directId) && directId > 0) {
    derived.push({
      id_program: directId,
      name: directName || `Program ${directId}`,
    });
  }

  const nestedCandidates = [
    payload.program,
    payload.staff_data?.program,
    payload.staff_profile?.program,
  ];

  nestedCandidates.forEach((candidate) => {
    const idProgram = Number(candidate?.id_program || candidate?.id);
    const name = candidate?.name || candidate?.program_name;
    if (Number.isFinite(idProgram) && name) {
      derived.push({ id_program: idProgram, name });
    }
  });

  const uniqueMap = new Map<number, ProgramOption>();
  derived.forEach((item) => {
    if (!uniqueMap.has(item.id_program)) {
      uniqueMap.set(item.id_program, item);
    }
  });

  return Array.from(uniqueMap.values());
}
