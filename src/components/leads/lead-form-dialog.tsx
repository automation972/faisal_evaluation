// Young10 Marketing CRM - Global lead create/edit dialog (Zustand-driven)

'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { SafeLead, SafeUser } from '@/types';
import { useCrmStore } from '@/store/crm-store';
import { useMe, useUsers, useCreateLead, useUpdateLead, type LeadInput } from '@/hooks/use-crm';
import {
  LEAD_SOURCES,
  PIPELINE_STAGES,
  SOURCE_META,
  STAGE_META,
} from '@/lib/constants';
import type { LeadSourceValue, PipelineStage } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  source: LeadSourceValue;
  stage: PipelineStage;
  value: string;
  notes: string;
  assignedToId: string; // user id or 'UNASSIGNED' sentinel
}

type FormErrors = Partial<Record<'firstName' | 'lastName' | 'email', string>>;

const EMPTY_FORM: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  jobTitle: '',
  source: 'WEBSITE',
  stage: 'NEW',
  value: '',
  notes: '',
  assignedToId: 'UNASSIGNED',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const UNASSIGNED = 'UNASSIGNED';

function buildForm(editing: SafeLead | null): FormState {
  if (!editing) return EMPTY_FORM;
  return {
    firstName: editing.firstName,
    lastName: editing.lastName,
    email: editing.email ?? '',
    phone: editing.phone ?? '',
    company: editing.company ?? '',
    jobTitle: editing.jobTitle ?? '',
    source: editing.source,
    stage: editing.stage,
    value: editing.value > 0 ? String(editing.value) : '',
    notes: editing.notes ?? '',
    assignedToId: editing.assignedToId ?? UNASSIGNED,
  };
}

export function LeadFormDialog() {
  const leadDialog = useCrmStore((s) => s.leadDialog);
  const closeLeadDialog = useCrmStore((s) => s.closeLeadDialog);
  const open = leadDialog.open;
  const editing = leadDialog.editing;

  const { data: me } = useMe();
  const isAdmin = me?.role === 'ADMIN';
  const { data: users } = useUsers();

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) closeLeadDialog();
      }}
    >
      {/* Keyed mount keeps the form state fresh for every open / target change */}
      {open && (
        <DialogContent className="flex max-h-[85dvh] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-lg">
          <LeadFormFields
            key={editing?.id ?? 'create'}
            editing={editing}
            isAdmin={isAdmin}
            users={users ?? []}
            onClose={closeLeadDialog}
          />
        </DialogContent>
      )}
    </Dialog>
  );
}

function LeadFormFields({
  editing,
  isAdmin,
  users,
  onClose,
}: {
  editing: SafeLead | null;
  isAdmin: boolean;
  users: SafeUser[];
  onClose: () => void;
}) {
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();

  const [form, setForm] = useState<FormState>(() => buildForm(editing));
  const [errors, setErrors] = useState<FormErrors>({});

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.firstName.trim()) next.firstName = 'First name is required';
    if (!form.lastName.trim()) next.lastName = 'Last name is required';
    if (form.email.trim() && !EMAIL_PATTERN.test(form.email.trim())) {
      next.email = 'Enter a valid email address';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const pending = createLead.isPending || updateLead.isPending;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    const trimmedValue = form.value.trim();
    const numericValue = trimmedValue === '' ? undefined : Number(trimmedValue);

    const payload: LeadInput = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      ...(form.email.trim() ? { email: form.email.trim() } : {}),
      ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
      ...(form.company.trim() ? { company: form.company.trim() } : {}),
      ...(form.jobTitle.trim() ? { jobTitle: form.jobTitle.trim() } : {}),
      source: form.source,
      stage: form.stage,
      ...(numericValue !== undefined && Number.isFinite(numericValue) && numericValue >= 0
        ? { value: numericValue }
        : {}),
      ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
      ...(isAdmin
        ? { assignedToId: form.assignedToId === UNASSIGNED ? undefined : form.assignedToId }
        : {}),
    };

    try {
      if (editing) {
        await updateLead.mutateAsync({
          id: editing.id,
          data: { ...payload } as Record<string, unknown>,
        });
        toast.success('Lead updated');
      } else {
        await createLead.mutateAsync(payload);
        toast.success('Lead created');
      }
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save lead');
    }
  };

  return (
    <>
      <DialogHeader className="shrink-0 border-b px-6 py-5">
        <DialogTitle className="font-bold tracking-tight">
          {editing ? 'Edit Lead' : 'New Lead'}
        </DialogTitle>
        <DialogDescription className="text-[13px]">
          {editing
            ? 'Update the contact details, stage and deal value for this lead.'
            : 'Add a new lead to your pipeline and keep your relationships moving.'}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={(e) => void handleSubmit(e)} className="flex min-h-0 flex-1 flex-col" noValidate>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="lead-first-name" className="text-[13px] font-semibold">
                First name <span className="text-[#DC2626]">*</span>
              </Label>
              <Input
                id="lead-first-name"
                value={form.firstName}
                onChange={(e) => setField('firstName', e.target.value)}
                placeholder="Jordan"
                aria-invalid={!!errors.firstName}
                className="h-10 rounded-[10px] border-border bg-white"
                autoFocus
              />
              {errors.firstName && <p className="text-xs text-[#DC2626]">{errors.firstName}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lead-last-name" className="text-[13px] font-semibold">
                Last name <span className="text-[#DC2626]">*</span>
              </Label>
              <Input
                id="lead-last-name"
                value={form.lastName}
                onChange={(e) => setField('lastName', e.target.value)}
                placeholder="Lee"
                aria-invalid={!!errors.lastName}
                className="h-10 rounded-[10px] border-border bg-white"
              />
              {errors.lastName && <p className="text-xs text-[#DC2626]">{errors.lastName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="lead-email" className="text-[13px] font-semibold">
                Email
              </Label>
              <Input
                id="lead-email"
                type="email"
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                placeholder="jordan@company.com"
                aria-invalid={!!errors.email}
                className="h-10 rounded-[10px] border-border bg-white"
              />
              {errors.email && <p className="text-xs text-[#DC2626]">{errors.email}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lead-phone" className="text-[13px] font-semibold">
                Phone
              </Label>
              <Input
                id="lead-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setField('phone', e.target.value)}
                placeholder="+1 555 010 2233"
                className="h-10 rounded-[10px] border-border bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="lead-company" className="text-[13px] font-semibold">
                Company
              </Label>
              <Input
                id="lead-company"
                value={form.company}
                onChange={(e) => setField('company', e.target.value)}
                placeholder="Acme Inc."
                className="h-10 rounded-[10px] border-border bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lead-job-title" className="text-[13px] font-semibold">
                Job title
              </Label>
              <Input
                id="lead-job-title"
                value={form.jobTitle}
                onChange={(e) => setField('jobTitle', e.target.value)}
                placeholder="Marketing Manager"
                className="h-10 rounded-[10px] border-border bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="lead-source" className="text-[13px] font-semibold">
                Source
              </Label>
              <Select
                value={form.source}
                onValueChange={(v) => setField('source', v as LeadSourceValue)}
              >
                <SelectTrigger
                  id="lead-source"
                  className="data-[size=default]:h-10 w-full rounded-[10px] border-border bg-white"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_SOURCES.map((source) => (
                    <SelectItem key={source} value={source}>
                      {SOURCE_META[source].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lead-stage" className="text-[13px] font-semibold">
                Stage
              </Label>
              <Select
                value={form.stage}
                onValueChange={(v) => setField('stage', v as PipelineStage)}
              >
                <SelectTrigger
                  id="lead-stage"
                  className="data-[size=default]:h-10 w-full rounded-[10px] border-border bg-white"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PIPELINE_STAGES.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {STAGE_META[stage].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="lead-value" className="text-[13px] font-semibold">
                Deal value (USD)
              </Label>
              <Input
                id="lead-value"
                type="number"
                min={0}
                step={50}
                value={form.value}
                onChange={(e) => setField('value', e.target.value)}
                placeholder="0"
                className="h-10 rounded-[10px] border-border bg-white"
              />
            </div>
            {isAdmin && (
              <div className="space-y-1.5">
                <Label htmlFor="lead-assignee" className="text-[13px] font-semibold">
                  Assigned to
                </Label>
                <Select value={form.assignedToId} onValueChange={(v) => setField('assignedToId', v)}>
                  <SelectTrigger
                    id="lead-assignee"
                    className="data-[size=default]:h-10 w-full rounded-[10px] border-border bg-white"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lead-notes" className="text-[13px] font-semibold">
              Notes
            </Label>
            <Textarea
              id="lead-notes"
              value={form.notes}
              onChange={(e) => setField('notes', e.target.value)}
              placeholder="Context, goals, next steps..."
              rows={4}
              className="rounded-[10px] border-border bg-white"
            />
          </div>
        </div>

        <DialogFooter className="flex shrink-0 flex-row justify-end gap-3 border-t bg-[#FAFAFD] px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-10 rounded-[10px] border-border bg-white hover:bg-[#F4F5FA]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={pending}
            className="h-10 rounded-[10px] bg-primary font-semibold text-white hover:bg-[#2B3AD1]"
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            {editing ? 'Save Changes' : 'Create Lead'}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
