// Young10 Marketing CRM - zod validation schemas

import { z } from 'zod';
import { PIPELINE_STAGES, LEAD_SOURCES, LEAD_STATUSES, TASK_PRIORITIES, TASK_STATUSES, USER_ROLES } from '@/lib/constants';

const emailish = z.string().trim().max(200).email('Invalid email address').optional().or(z.literal(''));

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().trim().toLowerCase().email('Invalid email address').max(200),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const leadCreateSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(80),
  lastName: z.string().trim().min(1, 'Last name is required').max(80),
  email: emailish,
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  company: z.string().trim().max(120).optional().or(z.literal('')),
  jobTitle: z.string().trim().max(120).optional().or(z.literal('')),
  source: z.enum(LEAD_SOURCES).default('WEBSITE'),
  stage: z.enum(PIPELINE_STAGES).default('NEW'),
  value: z.coerce.number().min(0, 'Value cannot be negative').max(100000000).default(0),
  notes: z.string().trim().max(5000).optional().or(z.literal('')),
  assignedToId: z.string().trim().max(64).optional().or(z.literal('')),
});

export const leadUpdateSchema = z.object({
  firstName: z.string().trim().min(1).max(80).optional(),
  lastName: z.string().trim().min(1).max(80).optional(),
  email: emailish,
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  company: z.string().trim().max(120).optional().or(z.literal('')),
  jobTitle: z.string().trim().max(120).optional().or(z.literal('')),
  source: z.enum(LEAD_SOURCES).optional(),
  stage: z.enum(PIPELINE_STAGES).optional(),
  status: z.enum(LEAD_STATUSES).optional(),
  value: z.coerce.number().min(0).max(100000000).optional(),
  notes: z.string().trim().max(5000).optional().or(z.literal('')),
  assignedToId: z.string().trim().max(64).optional().or(z.literal('')),
});

export const taskCreateSchema = z.object({
  title: z.string().trim().min(2, 'Title is required').max(150),
  description: z.string().trim().max(3000).optional().or(z.literal('')),
  dueDate: z.string().datetime({ offset: true }).optional().or(z.literal('')),
  priority: z.enum(TASK_PRIORITIES).default('MEDIUM'),
  status: z.enum(TASK_STATUSES).default('PENDING'),
  leadId: z.string().trim().max(64).optional().or(z.literal('')),
  assignedToId: z.string().trim().max(64).optional().or(z.literal('')),
});

export const taskUpdateSchema = z.object({
  title: z.string().trim().min(2).max(150).optional(),
  description: z.string().trim().max(3000).optional().or(z.literal('')),
  dueDate: z.string().datetime({ offset: true }).nullable().optional().or(z.literal('')),
  priority: z.enum(TASK_PRIORITIES).optional(),
  status: z.enum(TASK_STATUSES).optional(),
  leadId: z.string().trim().max(64).nullable().optional().or(z.literal('')),
  assignedToId: z.string().trim().max(64).nullable().optional().or(z.literal('')),
});

export const userUpdateSchema = z.object({
  role: z.enum(USER_ROLES).optional(),
  active: z.boolean().optional(),
  name: z.string().trim().min(2).max(80).optional(),
});

export const ingestLeadSchema = z.object({
  firstName: z.string().trim().min(1, 'firstName is required').max(80),
  lastName: z.string().trim().min(1, 'lastName is required').max(80),
  email: emailish,
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  company: z.string().trim().max(120).optional().or(z.literal('')),
  jobTitle: z.string().trim().max(120).optional().or(z.literal('')),
  source: z.enum(LEAD_SOURCES).optional(),
  notes: z.string().trim().max(5000).optional().or(z.literal('')),
  value: z.coerce.number().min(0).max(100000000).optional(),
});

export const apiKeyCreateSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(80),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type LeadCreateInput = z.infer<typeof leadCreateSchema>;
export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
export type IngestLeadInputSchema = z.infer<typeof ingestLeadSchema>;
