// Young10 Marketing CRM - create/edit task dialog (Zustand-driven)

'use client';

import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import type { SafeTask } from '@/types';
import {
  useCreateTask,
  useLeads,
  useMe,
  useUpdateTask,
  useUsers,
  type TaskInput,
} from '@/hooks/use-crm';
import { useCrmStore } from '@/store/crm-store';
import {
  PRIORITY_META,
  TASK_PRIORITIES,
  TASK_STATUS_META,
  TASK_STATUSES,
  type TaskPriorityValue,
  type TaskStatusValue,
} from '@/lib/constants';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const NONE_LEAD = 'NONE';
const ME_USER = 'ME';

interface TaskFormFieldsProps {
  editing: SafeTask | null;
  closeTaskDialog: () => void;
}

/** Mounted only while the dialog is open, so form state resets on every open. */
function TaskFormFields({ editing, closeTaskDialog }: TaskFormFieldsProps) {
  const { data: me } = useMe();
  const isAdmin = me?.role === 'ADMIN';

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const { data: leadsResult } = useLeads({ page: 1, pageSize: 100, status: 'ALL' });
  const { data: users } = useUsers();

  const [title, setTitle] = useState(editing?.title ?? '');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [dueDate, setDueDate] = useState(editing?.dueDate ? editing.dueDate.slice(0, 10) : '');
  const [priority, setPriority] = useState<TaskPriorityValue>(editing?.priority ?? 'MEDIUM');
  const [status, setStatus] = useState<TaskStatusValue>(editing?.status ?? 'PENDING');
  const [leadId, setLeadId] = useState<string>(editing?.leadId ?? NONE_LEAD);
  const [assignedToId, setAssignedToId] = useState<string>(editing?.assignedToId ?? ME_USER);
  const [titleError, setTitleError] = useState(false);

  const pending = createTask.isPending || updateTask.isPending;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (trimmed.length < 2) {
      setTitleError(true);
      return;
    }
    setTitleError(false);
    try {
      if (editing) {
        await updateTask.mutateAsync({
          id: editing.id,
          data: {
            title: trimmed,
            description: description.trim(),
            dueDate: dueDate ? new Date(dueDate).toISOString() : null,
            priority,
            status,
            leadId: leadId === NONE_LEAD ? null : leadId,
            ...(isAdmin
              ? { assignedToId: assignedToId === ME_USER ? (me?.id ?? null) : assignedToId }
              : {}),
          },
        });
        toast.success('Task updated');
      } else {
        const payload: TaskInput = {
          title: trimmed,
          description: description.trim() || undefined,
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
          priority,
          status: 'PENDING',
        };
        if (leadId !== NONE_LEAD) payload.leadId = leadId;
        payload.assignedToId = isAdmin
          ? assignedToId === ME_USER
            ? me?.id
            : assignedToId
          : me?.id;
        await createTask.mutateAsync(payload);
        toast.success('Task created');
      }
      closeTaskDialog();
    } catch {
      toast.error('Failed to save task');
    }
  };

  return (
    <>
      <DialogHeader className="gap-1 border-b px-6 py-5">
        <DialogTitle className="text-[15px] font-bold tracking-tight">
          {editing ? 'Edit Task' : 'New Task'}
        </DialogTitle>
        <DialogDescription className="text-[13px] text-muted-foreground">
          {editing
            ? 'Update the details of this task.'
            : 'Track a follow-up and keep execution on schedule.'}
        </DialogDescription>
      </DialogHeader>

      <form
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
      >
        <div className="space-y-4 px-6 py-5">
          <div className="grid gap-1.5">
            <Label htmlFor="task-title" className="text-[13px] font-semibold">
              Title
            </Label>
            <Input
              id="task-title"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                if (titleError) setTitleError(false);
              }}
              placeholder="Follow up with Acme about the proposal"
              aria-invalid={titleError}
              className="h-10 rounded-[10px] border-border bg-white text-[13px]"
            />
            {titleError && <p className="text-xs text-destructive">Title must be at least 2 characters.</p>}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="task-description" className="text-[13px] font-semibold">
              Description
            </Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Optional context, links or next steps"
              rows={3}
              className="rounded-[10px] border-border bg-white text-[13px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="task-due" className="text-[13px] font-semibold">
                Due date
              </Label>
              <Input
                id="task-due"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="h-10 rounded-[10px] border-border bg-white text-[13px]"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-[13px] font-semibold">Priority</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriorityValue)}>
                <SelectTrigger
                  className="h-10 w-full rounded-[10px] border-border bg-white text-[13px] shadow-none"
                  aria-label="Priority"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {PRIORITY_META[p].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {editing && (
            <div className="grid gap-1.5">
              <Label className="text-[13px] font-semibold">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as TaskStatusValue)}>
                <SelectTrigger
                  className="h-10 w-full rounded-[10px] border-border bg-white text-[13px] shadow-none"
                  aria-label="Status"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {TASK_STATUS_META[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-1.5">
            <Label className="text-[13px] font-semibold">Related lead</Label>
            <Select value={leadId} onValueChange={setLeadId}>
              <SelectTrigger
                className="h-10 w-full rounded-[10px] border-border bg-white text-[13px] shadow-none"
                aria-label="Related lead"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_LEAD}>None</SelectItem>
                {(leadsResult?.leads ?? []).map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    {lead.firstName} {lead.lastName}
                    {lead.company ? ` — ${lead.company}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isAdmin && (
            <div className="grid gap-1.5">
              <Label className="text-[13px] font-semibold">Assigned to</Label>
              <Select value={assignedToId} onValueChange={setAssignedToId}>
                <SelectTrigger
                  className="h-10 w-full rounded-[10px] border-border bg-white text-[13px] shadow-none"
                  aria-label="Assigned to"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ME_USER}>Me</SelectItem>
                  {(users ?? [])
                    .filter((u) => u.id !== me?.id)
                    .map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col-reverse gap-2 border-t bg-[#FAFAFD] px-6 py-4 sm:flex-row sm:justify-end sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={closeTaskDialog}
            disabled={pending}
            className="rounded-[10px] border-border bg-white font-semibold hover:bg-[#F4F5FA]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={pending}
            className="rounded-[10px] bg-primary font-semibold text-white hover:bg-[#2B3AD1]"
          >
            {pending && <Loader2 className="animate-spin" />}
            {editing ? 'Save Changes' : 'Create Task'}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export function TaskFormDialog() {
  const taskDialog = useCrmStore((s) => s.taskDialog);
  const closeTaskDialog = useCrmStore((s) => s.closeTaskDialog);

  return (
    <Dialog
      open={taskDialog.open}
      onOpenChange={(open) => {
        if (!open) closeTaskDialog();
      }}
    >
      <DialogContent className="gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-md">
        {taskDialog.open && (
          <TaskFormFields
            key={taskDialog.editing?.id ?? 'create'}
            editing={taskDialog.editing}
            closeTaskDialog={closeTaskDialog}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
