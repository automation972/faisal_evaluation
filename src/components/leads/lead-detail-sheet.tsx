// Young10 Marketing CRM - Global lead detail sheet (Zustand-driven right drawer)

'use client';

import { useEffect, useState } from 'react';
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Globe,
  Loader2,
  Mail,
  Phone,
  Plus,
  Save,
  Trash2,
  TrendingDown,
} from 'lucide-react';
import { toast } from 'sonner';
import type { SafeTask } from '@/types';
import {
  PIPELINE_STAGES,
  PRIORITY_META,
  STAGE_META,
  TASK_PRIORITIES,
} from '@/lib/constants';
import type { PipelineStage, TaskPriorityValue } from '@/lib/constants';
import {
  useAssignLead,
  useCreateTask,
  useDeleteLead,
  useLead,
  useLeadActivities,
  useMe,
  useUpdateLead,
  useUpdateTask,
  useUsers,
  useTasks,
} from '@/hooks/use-crm';
import { useCrmStore } from '@/store/crm-store';
import { cn } from '@/lib/utils';
import {
  formatCurrency,
  formatDate,
  formatRelative,
  PriorityBadge,
  SourceBadge,
  StageBadge,
  UserAvatar,
} from '@/components/shared/badges';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const UNASSIGNED = 'UNASSIGNED';

function ContactRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p
          className={cn(
            'truncate text-sm font-medium',
            !value && 'font-normal text-muted-foreground',
          )}
        >
          {value ?? '-'}
        </p>
      </div>
    </div>
  );
}

function TaskRow({
  task,
  onToggle,
  pending,
}: {
  task: SafeTask;
  onToggle: (task: SafeTask) => void;
  pending: boolean;
}) {
  const completed = task.status === 'COMPLETED';
  const overdue =
    !!task.dueDate && !completed && new Date(task.dueDate).getTime() < Date.now();

  return (
    <div className="flex items-start gap-2.5 py-1.5">
      <button
        type="button"
        aria-label={completed ? 'Mark task as pending' : 'Mark task as completed'}
        disabled={pending}
        onClick={() => onToggle(task)}
        className="mt-0.5 shrink-0 outline-none"
      >
        <CheckCircle2
          className={cn(
            'size-5 transition-colors',
            completed ? 'text-[#16A34A]' : 'text-muted-foreground/40 hover:text-foreground',
          )}
        />
      </button>
      <div className="min-w-0 flex-1">
        <p className={cn('text-sm leading-snug', completed && 'text-muted-foreground line-through')}>
          {task.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <PriorityBadge priority={task.priority} />
          {task.dueDate && (
            <span
              className={cn(
                'rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium',
                overdue && 'bg-[#FDE7E7] font-semibold text-[#DC2626]',
              )}
            >
              Due {formatDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6 px-5 py-5">
      <div className="flex items-center gap-3">
        <Skeleton className="size-11 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-28 rounded-xl" />
      <Skeleton className="h-36 rounded-xl" />
      <Skeleton className="h-40 rounded-xl" />
    </div>
  );
}

export function LeadDetailSheet() {
  const leadDetailId = useCrmStore((s) => s.leadDetailId);
  const closeLeadDetail = useCrmStore((s) => s.closeLeadDetail);

  const { data: lead, isLoading } = useLead(leadDetailId);
  const { data: me } = useMe();
  const isAdmin = me?.role === 'ADMIN';
  const { data: users } = useUsers();
  const { data: taskData } = useTasks({
    leadId: leadDetailId ?? undefined,
    status: 'ALL',
  });
  const { data: activities } = useLeadActivities(leadDetailId);

  const updateLead = useUpdateLead();
  const assignLead = useAssignLead();
  const updateTask = useUpdateTask();
  const createTask = useCreateTask();
  const deleteLead = useDeleteLead();

  const [notes, setNotes] = useState('');
  const [confirmLost, setConfirmLost] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriorityValue>('MEDIUM');
  const [taskDate, setTaskDate] = useState('');

  // Keep the notes editor in sync with the loaded lead
  useEffect(() => {
    if (lead) setNotes(lead.notes ?? '');
  }, [lead?.id, lead?.notes]);

  const handleStageChange = async (stage: string) => {
    if (!lead) return;
    try {
      await updateLead.mutateAsync({ id: lead.id, data: { stage } });
      toast.success(`Moved to ${STAGE_META[stage as PipelineStage].label}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update stage');
    }
  };

  const handleAssign = async (value: string) => {
    if (!lead) return;
    const target = value === UNASSIGNED ? null : (users ?? []).find((u) => u.id === value) ?? null;
    try {
      await assignLead.mutateAsync({
        id: lead.id,
        assignedToId: value === UNASSIGNED ? null : value,
        assignee: target
          ? { id: target.id, name: target.name, email: target.email, role: target.role }
          : null,
      });
      toast.success(value === UNASSIGNED ? 'Lead unassigned' : 'Lead assigned');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to assign lead');
    }
  };

  const handleMarkLost = async () => {
    if (!lead) return;
    try {
      await updateLead.mutateAsync({ id: lead.id, data: { status: 'LOST' } });
      toast.success('Lead marked as lost');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update lead');
    } finally {
      setConfirmLost(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!lead) return;
    try {
      await updateLead.mutateAsync({ id: lead.id, data: { notes } });
      toast.success('Notes saved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save notes');
    }
  };

  const handleToggleTask = async (task: SafeTask) => {
    const next = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await updateTask.mutateAsync({ id: task.id, data: { status: next } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const handleAddTask = async () => {
    if (!leadDetailId || !taskTitle.trim()) return;
    try {
      await createTask.mutateAsync({
        title: taskTitle.trim(),
        priority: taskPriority,
        leadId: leadDetailId,
        ...(taskDate ? { dueDate: new Date(taskDate).toISOString() } : {}),
      });
      toast.success('Task added');
      setTaskTitle('');
      setTaskPriority('MEDIUM');
      setTaskDate('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  const handleDelete = async () => {
    if (!lead) return;
    try {
      await deleteLead.mutateAsync(lead.id);
      toast.success('Lead deleted');
      closeLeadDetail();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete lead');
    }
  };

  const open = leadDetailId !== null;

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) closeLeadDetail();
      }}
    >
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
        {isLoading || !lead ? (
          <>
            <SheetHeader className="sr-only">
              <SheetTitle>Lead details</SheetTitle>
              <SheetDescription>Lead detail panel</SheetDescription>
            </SheetHeader>
            <DetailSkeleton />
          </>
        ) : (
          <>
            {/* Header */}
            <SheetHeader className="shrink-0 border-b border-border/70 px-5 py-5">
              <div className="flex items-start gap-3 pr-8">
                <UserAvatar
                  name={`${lead.firstName} ${lead.lastName}`}
                  className="h-11 w-11 [&>span]:text-sm"
                />
                <div className="min-w-0 space-y-1.5">
                  <SheetTitle className="text-base font-bold tracking-tight leading-snug">
                    {lead.firstName} {lead.lastName}
                  </SheetTitle>
                  <SheetDescription className="truncate text-[13px]">
                    {lead.company ?? 'No company'}
                  </SheetDescription>
                  <div className="flex flex-wrap gap-1.5">
                    <StageBadge stage={lead.stage} />
                    <SourceBadge source={lead.source} />
                  </div>
                </div>
              </div>
            </SheetHeader>

            {/* Body */}
            <ScrollArea className="min-h-0 flex-1">
              <div>
                {/* Contact */}
                <div className="flex flex-col gap-4 border-b border-border/70 px-5 py-5">
                  <ContactRow icon={Mail} label="Email" value={lead.email} />
                  <ContactRow icon={Phone} label="Phone" value={lead.phone} />
                  <ContactRow icon={Building2} label="Company" value={lead.company} />
                  <ContactRow icon={Briefcase} label="Job title" value={lead.jobTitle} />
                </div>

                {/* Value + status */}
                <div className="flex items-start justify-between gap-4 border-b border-border/70 px-5 py-5">
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                      Deal value
                    </p>
                    <p className="text-2xl font-bold tabular-nums tracking-tight">
                      {formatCurrency(lead.value)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <Badge
                      variant="outline"
                      className="border-transparent"
                      style={
                        lead.status === 'OPEN'
                          ? { backgroundColor: '#E4F7EC', color: '#166534' }
                          : { backgroundColor: '#FDE7E7', color: '#991B1B' }
                      }
                    >
                      {lead.status === 'OPEN' ? 'Open' : 'Lost'}
                    </Badge>
                    {lead.createdViaApi && (
                      <Badge variant="outline" className="gap-1 bg-muted border-transparent">
                        <Globe className="size-3" />
                        via API
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Pipeline controls */}
                <div className="space-y-4 border-b border-border/70 px-5 py-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="detail-stage" className="text-[13px] font-semibold">Stage</Label>
                    <Select
                      value={lead.stage}
                      onValueChange={(v) => void handleStageChange(v)}
                    >
                      <SelectTrigger id="detail-stage" className="data-[size=default]:h-10 w-full rounded-[10px] border-border bg-white">
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

                  {isAdmin && (
                    <div className="space-y-1.5">
                      <Label htmlFor="detail-assignee" className="text-[13px] font-semibold">Assigned to</Label>
                      <Select
                        value={lead.assignedToId ?? UNASSIGNED}
                        onValueChange={(v) => void handleAssign(v)}
                      >
                        <SelectTrigger id="detail-assignee" className="data-[size=default]:h-10 w-full rounded-[10px] border-border bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                          {(users ?? []).map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {lead.status === 'OPEN' && lead.stage !== 'WON' && (
                    <AlertDialog open={confirmLost} onOpenChange={setConfirmLost}>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-10 w-full rounded-[10px] border-[#DC2626]/40 bg-white font-medium text-[#DC2626] hover:bg-[#FDE7E7] hover:text-[#DC2626]"
                        >
                          <TrendingDown className="size-4" />
                          Mark as Lost
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Mark as lost?</AlertDialogTitle>
                          <AlertDialogDescription>
                            &quot;{lead.firstName} {lead.lastName}&quot; will be moved out of the
                            active pipeline. You can reopen it later by editing the lead.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => void handleMarkLost()}
                            className="bg-[#DC2626] text-white hover:bg-[#B91C1C]"
                          >
                            Mark as Lost
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-2 border-b border-border/70 px-5 py-5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="detail-notes" className="text-[13px] font-semibold">Notes</Label>
                    <span className="text-xs text-muted-foreground">
                      {notes.length} characters
                    </span>
                  </div>
                  <Textarea
                    id="detail-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add context about this lead..."
                    rows={5}
                    className="rounded-[10px] border-border bg-white"
                  />
                  <Button
                    disabled={updateLead.isPending}
                    onClick={() => void handleSaveNotes()}
                    className="h-10 rounded-[10px] bg-primary px-4 font-semibold text-white hover:bg-[#2B3AD1]"
                  >
                    {updateLead.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Save className="size-4" />
                    )}
                    Save Notes
                  </Button>
                </div>

                {/* Tasks */}
                <div className="space-y-3 border-b border-border/70 px-5 py-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Follow-up tasks
                  </p>

                  {(taskData?.tasks ?? []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No tasks yet</p>
                  ) : (
                    <div className="divide-y divide-border/60 rounded-[10px] border border-border bg-white px-3">
                      {(taskData?.tasks ?? []).map((task) => (
                        <TaskRow
                          key={task.id}
                          task={task}
                          onToggle={(t) => void handleToggleTask(t)}
                          pending={updateTask.isPending}
                        />
                      ))}
                    </div>
                  )}

                  {/* Add-task inline form */}
                  <div className="space-y-2 rounded-[10px] border border-border bg-[#F8F9FC] p-3">
                    <Input
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      placeholder="Task title"
                      className="h-10 rounded-[10px] border-border bg-white"
                    />
                    <div className="flex items-center gap-2">
                      <Select
                        value={taskPriority}
                        onValueChange={(v) => setTaskPriority(v as TaskPriorityValue)}
                      >
                        <SelectTrigger size="sm" className="data-[size=sm]:h-10 w-[110px] rounded-[10px] border-border bg-white">
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
                      <Input
                        type="date"
                        value={taskDate}
                        onChange={(e) => setTaskDate(e.target.value)}
                        aria-label="Due date"
                        className="h-10 flex-1 rounded-[10px] border-border bg-white"
                      />
                      <Button
                        size="sm"
                        disabled={!taskTitle.trim() || createTask.isPending}
                        onClick={() => void handleAddTask()}
                        className="h-10 rounded-[10px] bg-primary px-3 text-white hover:bg-[#2B3AD1]"
                      >
                        {createTask.isPending ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Plus className="size-4" />
                        )}
                        <span className="sr-only">Add task</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Activity timeline */}
                <div className="space-y-3 px-5 py-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Activity
                  </p>
                  {(activities ?? []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No activity recorded yet</p>
                  ) : (
                    <div className="space-y-4">
                      {(activities ?? []).map((activity) => (
                        <div key={activity.id} className="flex gap-3">
                          <div className="flex flex-col items-center pt-1.5">
                            <span className="size-2 shrink-0 rounded-full bg-primary" aria-hidden />
                            <span className="mt-1 w-px flex-1 bg-border" aria-hidden />
                          </div>
                          <div className="min-w-0 flex-1 pb-1">
                            <p className="text-sm leading-snug">{activity.message}</p>
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                              <UserAvatar
                                name={activity.user?.name ?? 'System'}
                                size="sm"
                                className="size-4 [&>span]:text-[7px]"
                              />
                              <span>{activity.user?.name ?? 'System'}</span>
                              <span aria-hidden>·</span>
                              <span>{formatRelative(activity.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>

            {/* Admin danger zone */}
            {isAdmin && (
              <div className="mt-auto">
                <SheetFooter className="border-t border-border/70 bg-white px-5 py-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="h-10 w-full rounded-[10px] font-semibold">
                        <Trash2 className="size-4" />
                        Delete lead
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete lead?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This permanently deletes &quot;{lead.firstName} {lead.lastName}&quot; and
                          all related activity. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => void handleDelete()}
                          className="bg-[#DC2626] text-white hover:bg-[#B91C1C]"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </SheetFooter>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
