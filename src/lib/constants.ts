// Young10 Marketing CRM - Domain constants & brand tokens

export const BRAND = {
  name: 'Young10 Marketing',
  shortName: 'Young10',
  appName: 'Y10 CRM',
  blue: '#384BFE',
  blueDeep: '#2B3AD1',
  ink: '#0F0D1D',
  logoBlack: '#1E1B1C',
  textGray: '#7A7A7A',
  surfaceLight: '#FAFAFA',
} as const;

// ---------------------------------------------------------------------------
// Sales pipeline - exactly five stages
// ---------------------------------------------------------------------------

export const PIPELINE_STAGES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON'] as const;
export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export const STAGE_META: Record<PipelineStage, { label: string; color: string; soft: string; description: string }> = {
  NEW: {
    label: 'New',
    color: '#384BFE',
    soft: '#EAEFFF',
    description: 'Fresh inbound or manually added leads',
  },
  CONTACTED: {
    label: 'Contacted',
    color: '#0EA5B7',
    soft: '#E2F7FA',
    description: 'First outreach made, awaiting response',
  },
  QUALIFIED: {
    label: 'Qualified',
    color: '#7C3AED',
    soft: '#F1EAFE',
    description: 'Needs confirmed, budget and fit validated',
  },
  PROPOSAL: {
    label: 'Proposal',
    color: '#F59E0B',
    soft: '#FEF3DF',
    description: 'Proposal or estimate sent, negotiating',
  },
  WON: {
    label: 'Won',
    color: '#16A34A',
    soft: '#E4F7EC',
    description: 'Deal closed - customer acquired',
  },
};

// ---------------------------------------------------------------------------
// Pick lists
// ---------------------------------------------------------------------------

export const LEAD_SOURCES = [
  'WEBSITE',
  'REFERRAL',
  'SOCIAL_MEDIA',
  'PAID_ADS',
  'EMAIL_CAMPAIGN',
  'COLD_CALL',
  'EVENT',
  'OTHER',
] as const;
export type LeadSourceValue = (typeof LEAD_SOURCES)[number];

export const SOURCE_META: Record<LeadSourceValue, { label: string }> = {
  WEBSITE: { label: 'Website' },
  REFERRAL: { label: 'Referral' },
  SOCIAL_MEDIA: { label: 'Social Media' },
  PAID_ADS: { label: 'Paid Ads' },
  EMAIL_CAMPAIGN: { label: 'Email Campaign' },
  COLD_CALL: { label: 'Cold Call' },
  EVENT: { label: 'Event' },
  OTHER: { label: 'Other' },
};

export const LEAD_STATUSES = ['OPEN', 'LOST'] as const;
export type LeadStatusValue = (typeof LEAD_STATUSES)[number];

export const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;
export type TaskPriorityValue = (typeof TASK_PRIORITIES)[number];

export const PRIORITY_META: Record<TaskPriorityValue, { label: string; color: string; soft: string }> = {
  LOW: { label: 'Low', color: '#64748B', soft: '#EEF2F7' },
  MEDIUM: { label: 'Medium', color: '#F59E0B', soft: '#FEF3DF' },
  HIGH: { label: 'High', color: '#DC2626', soft: '#FDE7E7' },
};

export const TASK_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED'] as const;
export type TaskStatusValue = (typeof TASK_STATUSES)[number];

export const TASK_STATUS_META: Record<TaskStatusValue, { label: string }> = {
  PENDING: { label: 'Pending' },
  IN_PROGRESS: { label: 'In Progress' },
  COMPLETED: { label: 'Completed' },
};

export const USER_ROLES = ['ADMIN', 'SALES_REP'] as const;
export type UserRoleValue = (typeof USER_ROLES)[number];

export const ROLE_META: Record<UserRoleValue, { label: string }> = {
  ADMIN: { label: 'Admin' },
  SALES_REP: { label: 'Sales Rep' },
};

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export const SESSION_COOKIE = 'y10_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds
export const ANALYTICS_REFRESH_MS = 45_000; // near-real-time dashboard refresh (server-side cached)
export const DEFAULT_PAGE_SIZE = 20;
