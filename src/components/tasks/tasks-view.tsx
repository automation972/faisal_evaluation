// Young10 Marketing CRM - Tasks & follow-ups management view

'use client';

import { useMemo, useState, type ReactNode } from 'react';
import {
  AlertTriangle,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import type { SafeTask, SafeUser } from '@/types';
import { useDeleteTask, useTasks, useUpdateTask } from '@/hooks/use-crm';
import { useCrmStore } from '@/store/crm-store';
import { PriorityBadge, UserAvatar, formatDate } from '@/components/shared/badges';
import {
  PRIORITY_META,
  TASK_PRIORITIES,
  TASK_STATUSES,
  TASK_STATUS_META,
  type TaskPriorityValue,
  type TaskStatusValue,
} from '@/lib/constants';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskFormDialog } from '@/components/tasks/task-form-dialog';

type StatusTab = TaskStatusValue | 'ALL';
type PriorityFilter = TaskPriorityValue | 'ALL';
type DueTone = 'overdue' | 'today' | 'plain';

const CHIP_BASE = 'inline-flex items-center gap-1.5 rounded-full border border-transparent px-2.5 py-1 text-[12px] font-medium';

const DUE_TONE_CLASSES: Record<DueTone, string> = {
  overdue: 'bg-[#FDE7E7] text-[#DC2626]',
  today: 'bg-[#FEF3DF] text-[#B45309]',
  plain: 'bg-muted text-muted-foreground',
};

const SEGMENT_TRIGGER =
  'h-7 rounded-[7px] border-transparent px-3 text-[13px] font-medium text-[#5F6274] shadow-none hover:bg-[#F4F5FA] data-[state=active]:bg-[#EEF0FF] data-[state=active]:font-semibold data-[state=active]:text-primary data-[state=active]:shadow-none';

function dueChip(task: SafeTask): { label: string; tone: DueTone } | null {
  if (!task.dueDate) return null;
  const completed = task.status === 'COMPLETED';
  const due = new Date(task.dueDate);
  const now = new Date();
  if (!completed && due.getTime() < now.getTime()) {
    return { label: `Overdue ${formatDate(task.dueDate)}`, tone: 'overdue' };
  }
  const sameDay =
    due.getFullYear() === now.getFullYear() &&
    due.getMonth() === now.getMonth() &&
    due.getDate() === now.getDate();
  if (sameDay) return { label: 'Today', tone: 'today' };
  return { label: formatDate(task.dueDate), tone: 'plain' };
}

function sortTasks(tasks: SafeTask[]): SafeTask[] {
  return [...tasks].sort((a, b) => {
    const aDone = a.status === 'COMPLETED';
    const bDone = b.status === 'COMPLETED';
    if (aDone !== bDone) return aDone ? 1 : -1;
    const aTime = a.dueDate ? new Date(a.dueDate).getTime() : null;
    const bTime = b.dueDate ? new Date(b.dueDate).getTime() : null;
    if (aTime === null && bTime === null) return a.title.localeCompare(b.title);
    if (aTime === null) return 1;
    if (bTime === null) return -1;
    return aTime - bTime;
  });
}

function StatChip({ label, count, className, icon }: { label: string; count: number; className?: string; icon?: ReactNode }) {
  return (
    <span className={cn(CHIP_BASE, className)}>
      {icon}
      {label}
      <span className="font-bold">{count}</span>
    </span>
  );
}

interface TaskRowProps {
  task: SafeTask;
  toggling: boolean;
  onToggle: (task: SafeTask) => void;
  onEdit: (task: SafeTask) => void;
  onDelete: (task: SafeTask) => void;
  onOpenLead: (leadId: string) => void;
}

function TaskRow({ task, toggling, onToggle, onEdit, onDelete, onOpenLead }: TaskRowProps) {
  const completed = task.status === 'COMPLETED';
  const due = dueChip(task);
  const lead = task.lead;

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 transition-colors hover:bg-[#F7F8FC]',
        completed && 'opacity-70',
      )}
    >
      <button
        type="button"
        aria-label={completed ? 'Mark task as pending' : 'Mark task as completed'}
        disabled={toggling}
        onClick={() => onToggle(task)}
        className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors',
          completed
            ? 'border-primary bg-primary text-white hover:bg-[#2B3AD1]'
            : 'border-[#C6C9D4] bg-white text-transparent hover:border-primary/50 hover:bg-[#EEF0FF]',
        )}
      >
        <Check className={cn('h-3.5 w-3.5', toggling && 'animate-pulse')} />
      </button>

      <div className="min-w-0 flex-1">
        <p className={cn('truncate text-sm font-medium', completed && 'text-muted-foreground line-through')}>
          {task.title}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <PriorityBadge priority={task.priority} />
          {due && (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
                DUE_TONE_CLASSES[due.tone],
              )}
            >
              <Calendar className="h-3 w-3" />
              {due.label}
            </span>
          )}
          {lead && (
            <button
              type="button"
              onClick={() => onOpenLead(lead.id)}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-[#EEF0FF] hover:text-primary"
            >
              <Building2 className="h-3 w-3" />
              {lead.firstName} {lead.lastName}
            </button>
          )}
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <UserAvatar name={task.assignedTo?.name ?? 'Unassigned'} size="sm" />
            {task.assignedTo?.name ?? 'Unassigned'}
          </span>
        </div>
        {task.description && (
          <p className="mt-1.5 truncate text-xs text-muted-foreground">{task.description}</p>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-[#F4F5FA] hover:text-foreground"
            aria-label="Task actions"
          >
            <MoreVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => onEdit(task)}>
            <Pencil />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={() => onDelete(task)}>
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default function TasksView({ user }: { user: SafeUser }) {
  const isAdmin = user.role === 'ADMIN';
  const openTaskDialog = useCrmStore((s) => s.openTaskDialog);
  const openLeadDetail = useCrmStore((s) => s.openLeadDetail);

  const [statusTab, setStatusTab] = useState<StatusTab>('ALL');
  const [priority, setPriority] = useState<PriorityFilter>('ALL');
  const [teamTasks, setTeamTasks] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<SafeTask | null>(null);

  const params = useMemo(
    () => ({ status: statusTab, priority, mine: isAdmin ? !teamTasks : true }),
    [statusTab, priority, isAdmin, teamTasks],
  );
  const { data, isLoading } = useTasks(params);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const counts = data?.counts;
  const tasks = useMemo(() => sortTasks(data?.tasks ?? []), [data?.tasks]);

  const handleToggle = async (task: SafeTask) => {
    const completing = task.status !== 'COMPLETED';
    setTogglingId(task.id);
    try {
      await updateTask.mutateAsync({ id: task.id, data: { status: completing ? 'COMPLETED' : 'PENDING' } });
      toast.success(completing ? 'Task completed' : 'Task reopened');
    } catch {
      toast.error('Failed to update task');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteTask.mutateAsync(deleting.id);
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">EXECUTION</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Tasks &amp; Follow-ups</h1>
        </div>
        <Button
          onClick={() => openTaskDialog(null)}
          className="rounded-[10px] bg-primary font-semibold text-white hover:bg-[#2B3AD1]"
        >
          <Plus />
          New Task
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <StatChip label="Pending" count={counts?.pending ?? 0} className="bg-muted text-muted-foreground" />
        <StatChip label="In Progress" count={counts?.inProgress ?? 0} className="bg-[#EAEFFF] text-primary" />
        {counts && counts.overdue > 0 && (
          <StatChip
            label="Overdue"
            count={counts.overdue}
            className="bg-[#FDE7E7] text-[#DC2626]"
            icon={<AlertTriangle className="h-3.5 w-3.5" />}
          />
        )}
        <StatChip label="Completed" count={counts?.completed ?? 0} className="bg-[#E4F7EC] text-[#166534]" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={statusTab} onValueChange={(value) => setStatusTab(value as StatusTab)}>
          <TabsList className="h-9 max-w-full overflow-x-auto rounded-[10px] border border-border bg-white p-1 shadow-none">
            <TabsTrigger value="ALL" className={cn(SEGMENT_TRIGGER, 'shrink-0')}>
              All
            </TabsTrigger>
            {TASK_STATUSES.map((status) => (
              <TabsTrigger key={status} value={status} className={cn(SEGMENT_TRIGGER, 'shrink-0')}>
                {TASK_STATUS_META[status].label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap items-center gap-4">
          <Select value={priority} onValueChange={(value) => setPriority(value as PriorityFilter)}>
            <SelectTrigger
              className="h-10 w-[160px] rounded-[10px] border-border bg-white text-[13px] shadow-none"
              aria-label="Filter by priority"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All priorities</SelectItem>
              {TASK_PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {PRIORITY_META[p].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <Switch id="team-tasks" checked={teamTasks} onCheckedChange={setTeamTasks} />
              <Label htmlFor="team-tasks" className="text-sm text-muted-foreground">
                Team tasks
              </Label>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <Card className="card-shadow gap-0 overflow-hidden py-0">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className={cn('flex items-center gap-4 p-4', index > 0 && 'border-t border-border/60')}>
              <Skeleton className="h-5 w-5 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
              </div>
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          ))}
        </Card>
      ) : tasks.length === 0 ? (
        <Card className="card-shadow items-center py-14 text-center">
          <div className="flex flex-col items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF0FF]">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </span>
            <p className="text-[15px] font-bold tracking-tight">All caught up</p>
            <p className="max-w-sm text-[13px] text-muted-foreground">
              No tasks match the current filters. Create a new task or adjust the filters to see more.
            </p>
          </div>
        </Card>
      ) : (
        <Card className="card-shadow divide-y divide-border/60 gap-0 overflow-hidden py-0">
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              toggling={togglingId === task.id}
              onToggle={(t) => void handleToggle(t)}
              onEdit={(t) => openTaskDialog(t)}
              onDelete={(t) => setDeleting(t)}
              onOpenLead={(leadId) => openLeadDetail(leadId)}
            />
          ))}
        </Card>
      )}

      <TaskFormDialog />

      <AlertDialog open={deleting !== null} onOpenChange={(open) => { if (!open) setDeleting(null); }}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold tracking-tight">Delete task</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes {deleting?.title ? `"${deleting.title}"` : 'this task'} from your workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-[10px] border-border bg-white font-semibold hover:bg-[#F4F5FA]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-[10px] bg-[#DC2626] font-semibold text-white hover:bg-[#B91C1C]"
              onClick={() => void handleDelete()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
