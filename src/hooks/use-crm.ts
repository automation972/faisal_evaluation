// Young10 Marketing CRM - server state layer (TanStack Query)

'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import { api, buildQuery } from '@/lib/fetcher';
import { ANALYTICS_REFRESH_MS, DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { useCrmStore } from '@/store/crm-store';
import type {
  SafeActivity,
  SafeApiKey,
  SafeLead,
  SafeTask,
  SafeUser,
  AnalyticsResult,
  LeadListParams,
  LeadListResult,
  TaskListParams,
  TaskListResult,
  IngestLeadInput,
} from '@/types';

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export function useMe() {
  return useQuery<SafeUser | null, Error>({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        return await api.get<SafeUser>('/api/auth/me');
      } catch (err) {
        const status = (err as { status?: number }).status;
        if (status === 401) return null;
        throw err;
      }
    },
    staleTime: 60_000,
    retry: false,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation<SafeUser, Error, { email: string; password: string }>({
    mutationFn: (input) => api.post<SafeUser>('/api/auth/login', input),
    onSuccess: (user) => {
      qc.setQueryData(['me'], user);
      useCrmStore.getState().setView('dashboard');
    },
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation<SafeUser, Error, { name: string; email: string; password: string }>({
    mutationFn: (input) => api.post<SafeUser>('/api/auth/register', input),
    onSuccess: (user) => {
      qc.setQueryData(['me'], user);
      useCrmStore.getState().setView('dashboard');
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: () => api.post<void>('/api/auth/logout'),
    onSuccess: () => {
      // Deterministically flip to the auth screen, then drop all cached data
      qc.setQueryData(['me'], null);
      qc.removeQueries({ predicate: (q) => q.queryKey[0] !== 'me' });
    },
  });
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export function useUsers(options?: { includeInactive?: boolean }) {
  return useQuery<SafeUser[], Error>({
    queryKey: ['users', options?.includeInactive ?? false],
    queryFn: () => api.get<SafeUser[]>(`/api/users${options?.includeInactive ? '?includeInactive=true' : ''}`),
    staleTime: 30_000,
  });
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'SALES_REP';
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation<SafeUser, Error, CreateUserInput>({
    mutationFn: (input) => api.post<SafeUser>('/api/users', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation<SafeUser, Error, { id: string; role?: 'ADMIN' | 'SALES_REP'; active?: boolean }>({
    mutationFn: ({ id, ...patch }) => api.patch<SafeUser>(`/api/users/${id}`, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

// ---------------------------------------------------------------------------
// Leads
// ---------------------------------------------------------------------------

export function useLeads(params: LeadListParams) {
  return useQuery<LeadListResult, Error>({
    queryKey: ['leads', params],
    queryFn: () =>
      api.get<LeadListResult>(
        `/api/leads${buildQuery({
          search: params.search,
          stage: params.stage,
          status: params.status,
          source: params.source,
          assignedToId: params.assignedToId,
          page: params.page,
          pageSize: params.pageSize,
          sort: params.sort,
        })}`,
      ),
    placeholderData: (prev) => prev,
  });
}

export function useLead(id: string | null) {
  return useQuery<SafeLead, Error>({
    queryKey: ['lead', id],
    queryFn: () => api.get<SafeLead>(`/api/leads/${id}`),
    enabled: !!id,
  });
}

export interface LeadInput {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  source?: string;
  stage?: string;
  value?: number;
  notes?: string;
  assignedToId?: string;
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation<SafeLead, Error, LeadInput>({
    mutationFn: (input) => api.post<SafeLead>('/api/leads', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
      qc.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation<SafeLead, Error, { id: string; data: Record<string, unknown> }>({
    mutationFn: ({ id, data }) => api.patch<SafeLead>(`/api/leads/${id}`, data),
    onSuccess: (lead) => {
      qc.setQueryData(['lead', lead.id], lead);
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
      qc.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => api.delete<void>(`/api/leads/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
      qc.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}

export function useAssignLead() {
  const qc = useQueryClient();
  return useMutation<SafeLead, Error, { id: string; assignedToId: string | null }>({
    mutationFn: ({ id, assignedToId }) => api.post<SafeLead>(`/api/leads/${id}/assign`, { assignedToId }),
    onSuccess: (lead) => {
      qc.setQueryData(['lead', lead.id], lead);
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
      qc.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

export function useTasks(params: TaskListParams) {
  return useQuery<TaskListResult, Error>({
    queryKey: ['tasks', params],
    queryFn: () =>
      api.get<TaskListResult>(
        `/api/tasks${buildQuery({
          status: params.status,
          priority: params.priority,
          mine: params.mine ? 'true' : undefined,
          leadId: params.leadId,
        })}`,
      ),
    refetchInterval: ANALYTICS_REFRESH_MS,
    placeholderData: (prev) => prev,
  });
}

export interface TaskInput {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: string;
  status?: string;
  leadId?: string;
  assignedToId?: string;
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation<SafeTask, Error, TaskInput>({
    mutationFn: (input) => api.post<SafeTask>('/api/tasks', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
      qc.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation<SafeTask, Error, { id: string; data: Record<string, unknown> }>({
    mutationFn: ({ id, data }) => api.patch<SafeTask>(`/api/tasks/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
      qc.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => api.delete<void>(`/api/tasks/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

// ---------------------------------------------------------------------------
// Analytics & activity feed (near-real-time)
// ---------------------------------------------------------------------------

export function useAnalytics() {
  return useQuery<AnalyticsResult, Error>({
    queryKey: ['analytics'],
    queryFn: () => api.get<AnalyticsResult>('/api/analytics'),
    refetchInterval: ANALYTICS_REFRESH_MS,
  });
}

export function useActivities(limit = 12) {
  return useQuery<SafeActivity[], Error>({
    queryKey: ['activities', limit],
    queryFn: () => api.get<SafeActivity[]>(`/api/activities?limit=${limit}`),
    refetchInterval: ANALYTICS_REFRESH_MS,
  });
}

/** Activity timeline for a single lead (used in the lead detail drawer). */
export function useLeadActivities(leadId: string | null) {
  return useQuery<SafeActivity[], Error>({
    queryKey: ['activities', 'lead', leadId],
    queryFn: () => api.get<SafeActivity[]>(`/api/activities?leadId=${leadId}&limit=30`),
    enabled: !!leadId,
  });
}

// ---------------------------------------------------------------------------
// API keys (admin)
// ---------------------------------------------------------------------------

export function useApiKeys() {
  return useQuery<SafeApiKey[], Error>({
    queryKey: ['api-keys'],
    queryFn: () => api.get<SafeApiKey[]>('/api/api-keys'),
  });
}

export function useCreateApiKey() {
  const qc = useQueryClient();
  return useMutation<SafeApiKey, Error, { name: string }>({
    mutationFn: (input) => api.post<SafeApiKey>('/api/api-keys', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['api-keys'] }),
  });
}

export function useRevokeApiKey() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => api.delete<void>(`/api/api-keys/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['api-keys'] }),
  });
}

// ---------------------------------------------------------------------------
// External lead ingest (kept for completeness - server-to-server)
// ---------------------------------------------------------------------------

export const ingestLeadEndpoint = '/api/v1/leads/ingest';
export type { IngestLeadInput };
