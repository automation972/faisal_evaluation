// Young10 Marketing CRM - client UI state (Zustand)

import { create } from 'zustand';
import type { SafeLead, SafeTask } from '@/types';

export type CrmView = 'dashboard' | 'leads' | 'pipeline' | 'tasks' | 'admin';

interface LeadDialogState {
  open: boolean;
  editing: SafeLead | null;
}

interface TaskDialogState {
  open: boolean;
  editing: SafeTask | null;
}

interface CrmStore {
  view: CrmView;
  setView: (view: CrmView) => void;

  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;

  leadDialog: LeadDialogState;
  openLeadDialog: (lead?: SafeLead | null) => void;
  closeLeadDialog: () => void;

  leadDetailId: string | null;
  openLeadDetail: (id: string | null) => void;
  closeLeadDetail: () => void;

  taskDialog: TaskDialogState;
  openTaskDialog: (task?: SafeTask | null) => void;
  closeTaskDialog: () => void;

  apiKeyDialogOpen: boolean;
  openApiKeyDialog: () => void;
  closeApiKeyDialog: () => void;

  newUserDialogOpen: boolean;
  openNewUserDialog: () => void;
  closeNewUserDialog: () => void;
}

export const useCrmStore = create<CrmStore>((set) => ({
  view: 'dashboard',
  setView: (view) => set({ view }),

  mobileNavOpen: false,
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),

  leadDialog: { open: false, editing: null },
  openLeadDialog: (lead = null) => set({ leadDialog: { open: true, editing: lead } }),
  closeLeadDialog: () => set({ leadDialog: { open: false, editing: null } }),

  leadDetailId: null,
  openLeadDetail: (id) => set({ leadDetailId: id }),
  closeLeadDetail: () => set({ leadDetailId: null }),

  taskDialog: { open: false, editing: null },
  openTaskDialog: (task = null) => set({ taskDialog: { open: true, editing: task } }),
  closeTaskDialog: () => set({ taskDialog: { open: false, editing: null } }),

  apiKeyDialogOpen: false,
  openApiKeyDialog: () => set({ apiKeyDialogOpen: true }),
  closeApiKeyDialog: () => set({ apiKeyDialogOpen: false }),

  newUserDialogOpen: false,
  openNewUserDialog: () => set({ newUserDialogOpen: true }),
  closeNewUserDialog: () => set({ newUserDialogOpen: false }),
}));
