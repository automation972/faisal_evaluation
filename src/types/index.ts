// Young10 Marketing CRM - shared client/server types (JSON-serialized forms)

import type {
  PipelineStage,
  LeadSourceValue,
  LeadStatusValue,
  TaskPriorityValue,
  TaskStatusValue,
  UserRoleValue,
} from '@/lib/constants';

// ---------------------------------------------------------------------------
// Entities
// ---------------------------------------------------------------------------

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: UserRoleValue;
  active: boolean;
  createdAt: string;
}

export interface LeadAssignee {
  id: string;
  name: string;
  email: string;
  role: UserRoleValue;
}

export interface SafeLead {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  jobTitle: string | null;
  source: LeadSourceValue;
  stage: PipelineStage;
  status: LeadStatusValue;
  value: number;
  notes: string | null;
  lastContactedAt: string | null;
  createdViaApi: boolean;
  assignedToId: string | null;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
  assignedTo: LeadAssignee | null;
  createdBy?: LeadAssignee | null;
}

export interface SafeTask {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: TaskPriorityValue;
  status: TaskStatusValue;
  completedAt: string | null;
  leadId: string | null;
  assignedToId: string | null;
  createdAt: string;
  updatedAt: string;
  assignedTo: LeadAssignee | null;
  lead: { id: string; firstName: string; lastName: string; company: string | null; stage: PipelineStage } | null;
}

export interface SafeActivity {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  user: { id: string; name: string; role: UserRoleValue } | null;
  lead: { id: string; firstName: string; lastName: string } | null;
}

export interface SafeApiKey {
  id: string;
  name: string;
  key: string;
  prefix: string;
  active: boolean;
  lastUsedAt: string | null;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// API envelopes
// ---------------------------------------------------------------------------

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiFailure {
  success: false;
  error: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

// ---------------------------------------------------------------------------
// List payloads
// ---------------------------------------------------------------------------

export interface LeadListParams {
  search?: string;
  stage?: PipelineStage | 'ALL';
  status?: LeadStatusValue | 'ALL';
  source?: LeadSourceValue | 'ALL';
  assignedToId?: string | 'ALL' | 'UNASSIGNED';
  page?: number;
  pageSize?: number;
  sort?: 'createdAt_desc' | 'createdAt_asc' | 'value_desc' | 'value_asc';
}

export interface LeadListResult {
  leads: SafeLead[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface TaskListParams {
  status?: TaskStatusValue | 'ALL';
  priority?: TaskPriorityValue | 'ALL';
  mine?: boolean;
  leadId?: string;
}

export interface TaskListResult {
  tasks: SafeTask[];
  counts: { pending: number; inProgress: number; completed: number; overdue: number };
}

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

export interface StageCount {
  stage: PipelineStage;
  count: number;
  value: number;
}

export interface WeeklyPoint {
  weekStart: string;
  count: number;
}

export interface SourceCount {
  source: LeadSourceValue;
  count: number;
}

export interface RepStat {
  userId: string;
  name: string;
  email: string;
  totalLeads: number;
  wonLeads: number;
  openValue: number;
  wonValue: number;
}

export interface AnalyticsResult {
  totals: {
    leads: number;
    openLeads: number;
    wonLeads: number;
    lostLeads: number;
    pipelineValue: number;
    wonValue: number;
    conversionRate: number;
    leadsThisMonth: number;
  };
  stageBreakdown: StageCount[];
  weeklyTrend: WeeklyPoint[];
  topSources: SourceCount[];
  repLeaderboard: RepStat[];
  tasks: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    overdue: number;
    dueToday: number;
  };
  generatedAt: string;
}

export interface IngestLeadInput {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  source?: LeadSourceValue;
  notes?: string;
  value?: number;
}

export interface IngestResponse {
  leadId: string;
  message: string;
}
