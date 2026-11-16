// Young10 Marketing CRM - Leads list view (table, filters, pagination, row actions)

'use client';

import { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  SearchX,
  TrendingDown,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import type { SafeLead, SafeUser } from '@/types';
import type { LeadListParams } from '@/types';
import {
  PIPELINE_STAGES,
  LEAD_SOURCES,
  LEAD_STATUSES,
  SOURCE_META,
  STAGE_META,
} from '@/lib/constants';
import type { LeadSourceValue, LeadStatusValue, PipelineStage } from '@/lib/constants';
import { useLeads, useUsers, useUpdateLead, useDeleteLead, useAssignLead } from '@/hooks/use-crm';
import { useCrmStore } from '@/store/crm-store';
import {
  formatCurrency,
  formatDate,
  SourceBadge,
  StageBadge,
  UserAvatar,
} from '@/components/shared/badges';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

const PAGE_SIZE = 10;

type StageFilter = PipelineStage | 'ALL';
type StatusFilter = LeadStatusValue | 'ALL';
type SourceFilter = LeadSourceValue | 'ALL';
type SortValue = NonNullable<LeadListParams['sort']>;

/** Shared row/card actions menu (edit, mark lost, delete). */
function LeadActionsMenu({
  lead,
  isAdmin,
  onEdit,
  onLost,
  onDelete,
}: {
  lead: SafeLead;
  isAdmin: boolean;
  onEdit: (lead: SafeLead) => void;
  onLost: (lead: SafeLead) => void;
  onDelete: (lead: SafeLead) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Lead actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={() => onEdit(lead)} className="cursor-pointer">
          <Pencil className="size-4" />
          Edit
        </DropdownMenuItem>
        {lead.status === 'OPEN' && lead.stage !== 'WON' && (
          <DropdownMenuItem
            variant="default"
            onClick={() => onLost(lead)}
            className="cursor-pointer"
          >
            <TrendingDown className="size-4" />
            Mark as Lost
          </DropdownMenuItem>
        )}
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(lead)}
              className="cursor-pointer"
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function LeadsView({ user }: { user: SafeUser }) {
  const isAdmin = user.role === 'ADMIN';
  const openLeadDialog = useCrmStore((s) => s.openLeadDialog);
  const openLeadDetail = useCrmStore((s) => s.openLeadDetail);

  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const assignLead = useAssignLead();
  const { data: users } = useUsers();

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<StageFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('ALL');
  const [sort, setSort] = useState<SortValue>('createdAt_desc');
  const [page, setPage] = useState(1);

  const [lostLead, setLostLead] = useState<SafeLead | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SafeLead | null>(null);

  // Debounce search input (350ms) before hitting the API
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading } = useLeads({
    search: search || undefined,
    stage: stageFilter === 'ALL' ? undefined : stageFilter,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    source: sourceFilter === 'ALL' ? undefined : sourceFilter,
    assignedToId: isAdmin && assigneeFilter !== 'ALL' ? assigneeFilter : undefined,
    page,
    pageSize: PAGE_SIZE,
    sort,
  });

  const leads = data?.leads ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.pageCount ?? 0;

  const handleAssign = async (lead: SafeLead, value: string) => {
    const target = value === 'UNASSIGNED' ? null : (users ?? []).find((u) => u.id === value) ?? null;
    try {
      await assignLead.mutateAsync({
        id: lead.id,
        assignedToId: value === 'UNASSIGNED' ? null : value,
        assignee: target
          ? { id: target.id, name: target.name, email: target.email, role: target.role }
          : null,
      });
      toast.success(value === 'UNASSIGNED' ? 'Lead unassigned' : 'Lead assigned');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to assign lead');
    }
  };

  const handleMarkLost = async () => {
    if (!lostLead) return;
    try {
      await updateLead.mutateAsync({ id: lostLead.id, data: { status: 'LOST' } });
      toast.success('Lead marked as lost');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update lead');
    } finally {
      setLostLead(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteLead.mutateAsync(deleteTarget.id);
      toast.success('Lead deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete lead');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
            Relationships
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
        </div>
        <Button
          onClick={() => openLeadDialog(null)}
          className="h-10 rounded-[10px] bg-primary px-4 font-semibold text-white hover:bg-[#2B3AD1]"
        >
          <Plus className="size-4" />
          New Lead
        </Button>
      </div>

      {/* Toolbar - grid on mobile, inline flex on md+ */}
      <div className="card-shadow grid grid-cols-2 gap-3 rounded-xl border bg-card p-4 md:flex md:flex-wrap md:items-center md:gap-5 md:p-5">
        <div className="relative col-span-2 min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search leads..."
            inputMode="search"
            className="h-10 rounded-[10px] border-border bg-white pl-9"
          />
        </div>

        <Select
          value={stageFilter}
          onValueChange={(v) => {
            setStageFilter(v as StageFilter);
            setPage(1);
          }}
        >
          <SelectTrigger className="data-[size=default]:h-10 w-full rounded-[10px] border-border bg-white md:w-[132px]">
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Stages</SelectItem>
            {PIPELINE_STAGES.map((stage) => (
              <SelectItem key={stage} value={stage}>
                {STAGE_META[stage].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v as StatusFilter);
            setPage(1);
          }}
        >
          <SelectTrigger className="data-[size=default]:h-10 w-full rounded-[10px] border-border bg-white md:w-[120px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            {LEAD_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status === 'OPEN' ? 'Open' : 'Lost'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sourceFilter}
          onValueChange={(v) => {
            setSourceFilter(v as SourceFilter);
            setPage(1);
          }}
        >
          <SelectTrigger className="data-[size=default]:h-10 w-full rounded-[10px] border-border bg-white md:w-[150px]">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Sources</SelectItem>
            {LEAD_SOURCES.map((source) => (
              <SelectItem key={source} value={source}>
                {SOURCE_META[source].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isAdmin && (
          <Select
            value={assigneeFilter}
            onValueChange={(v) => {
              setAssigneeFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="data-[size=default]:h-10 w-full rounded-[10px] border-border bg-white md:w-[150px]">
              <SelectValue placeholder="Assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Assignees</SelectItem>
              <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
              {(users ?? []).map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select
          value={sort}
          onValueChange={(v) => {
            setSort(v as SortValue);
            setPage(1);
          }}
        >
          <SelectTrigger className="data-[size=default]:h-10 w-full rounded-[10px] border-border bg-white md:w-[150px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt_desc">Newest first</SelectItem>
            <SelectItem value="createdAt_asc">Oldest first</SelectItem>
            <SelectItem value="value_desc">Highest value</SelectItem>
            <SelectItem value="value_asc">Lowest value</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="card-shadow gap-0 overflow-hidden rounded-xl border bg-white p-0">
        {isLoading ? (
          <div className="space-y-3 px-5 py-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="h-4 w-[180px]" />
                <Skeleton className="h-4 w-[160px]" />
                <Skeleton className="hidden h-4 w-[90px] sm:block" />
                <Skeleton className="hidden h-4 w-[90px] md:block" />
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="ml-auto h-4 w-[60px]" />
              </div>
            ))}
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-[#EEF0FF]">
              <SearchX className="size-6 text-primary" />
            </div>
            <p className="font-semibold">No leads found</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Try adjusting your search or filters, or add a new lead to start building your
              pipeline.
            </p>
            <Button
              onClick={() => openLeadDialog(null)}
              className="h-10 rounded-[10px] bg-primary px-4 font-semibold text-white hover:bg-[#2B3AD1]"
            >
              <Plus className="size-4" />
              Create your first lead
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop table (hidden on mobile) */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="border-b bg-[#F8F9FC] hover:bg-[#F8F9FC] [&>th]:text-[11px] [&>th]:font-bold [&>th]:uppercase [&>th]:tracking-[0.12em] [&>th]:text-muted-foreground">
                    <TableHead className="pl-5">Lead</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-10 pr-5" aria-label="Actions" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => {
                    const fullName = `${lead.firstName} ${lead.lastName}`;
                    return (
                      <TableRow
                        key={lead.id}
                        onClick={() => openLeadDetail(lead.id)}
                        className="cursor-pointer border-border/60 hover:bg-[#F7F8FC]"
                      >
                        <TableCell className="pl-5">
                          <div className="flex items-center gap-3">
                            <UserAvatar name={fullName} />
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-foreground">{fullName}</p>
                              <p className="truncate text-xs text-muted-foreground">
                                {lead.email ?? '-'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="block truncate text-sm text-muted-foreground">
                            {lead.phone ?? '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <SourceBadge source={lead.source} />
                        </TableCell>
                        <TableCell>
                          <StageBadge stage={lead.stage} />
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold tabular-nums">{formatCurrency(lead.value)}</span>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          {isAdmin ? (
                            <Select
                              value={lead.assignedToId ?? 'UNASSIGNED'}
                              onValueChange={(v) => void handleAssign(lead, v)}
                            >
                              <SelectTrigger
                                size="sm"
                                className="data-[size=sm]:h-9 w-[150px] rounded-[10px] border-border bg-white"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <SelectValue placeholder="Unassigned" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                                {(users ?? []).map((u) => (
                                  <SelectItem key={u.id} value={u.id}>
                                    {u.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="flex items-center gap-2">
                              <UserAvatar name={lead.assignedTo?.name ?? 'Unassigned'} size="sm" />
                              <span className="text-sm">
                                {lead.assignedTo?.name ?? 'Unassigned'}
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(lead.createdAt)}
                        </TableCell>
                        <TableCell className="pr-5 text-right" onClick={(e) => e.stopPropagation()}>
                          <LeadActionsMenu
                            lead={lead}
                            isAdmin={isAdmin}
                            onEdit={openLeadDialog}
                            onLost={setLostLead}
                            onDelete={setDeleteTarget}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile card list (hidden on md+) */}
            <div className="divide-y divide-border/60 md:hidden">
              {leads.map((lead) => {
                const fullName = `${lead.firstName} ${lead.lastName}`;
                return (
                  <div
                    key={lead.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openLeadDetail(lead.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') openLeadDetail(lead.id);
                    }}
                    className="cursor-pointer px-4 py-3.5 transition-colors hover:bg-[#F7F8FC] active:bg-[#EEF0FF]/60"
                  >
                    <div className="flex items-start gap-3">
                      <UserAvatar name={fullName} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-foreground">{fullName}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {lead.company ?? lead.email ?? '-'}
                        </p>
                      </div>
                      <div
                        className="shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <LeadActionsMenu
                          lead={lead}
                          isAdmin={isAdmin}
                          onEdit={openLeadDialog}
                          onLost={setLostLead}
                          onDelete={setDeleteTarget}
                        />
                      </div>
                    </div>
                    <div className="mt-2.5 flex flex-wrap items-center gap-2 pl-[2px]">
                      <StageBadge stage={lead.stage} />
                      <SourceBadge source={lead.source} />
                      <span className="ml-auto font-semibold tabular-nums">
                        {formatCurrency(lead.value)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 pl-[2px]">
                      {isAdmin ? (
                        <Select
                          value={lead.assignedToId ?? 'UNASSIGNED'}
                          onValueChange={(v) => void handleAssign(lead, v)}
                        >
                          <SelectTrigger
                            size="sm"
                            className="data-[size=sm]:h-8 w-[150px] rounded-[10px] border-border bg-white text-xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <SelectValue placeholder="Unassigned" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                            {(users ?? []).map((u) => (
                              <SelectItem key={u.id} value={u.id}>
                                {u.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex min-w-0 items-center gap-1.5">
                          <UserAvatar name={lead.assignedTo?.name ?? 'Unassigned'} size="sm" />
                          <span className="truncate text-xs text-muted-foreground">
                            {lead.assignedTo?.name ?? 'Unassigned'}
                          </span>
                        </div>
                      )}
                      <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                        {formatDate(lead.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Card footer: total + pagination */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 px-5 py-3.5">
              <p className="text-sm text-muted-foreground">
                {total} lead{total === 1 ? '' : 's'}
              </p>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="size-4" />
                  <span className="sr-only">Previous page</span>
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {data?.page ?? page} of {Math.max(1, pageCount)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  disabled={page >= pageCount}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="size-4" />
                  <span className="sr-only">Next page</span>
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Mark as lost confirmation */}
      <AlertDialog open={!!lostLead} onOpenChange={(open) => !open && setLostLead(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as lost?</AlertDialogTitle>
            <AlertDialogDescription>
              {lostLead
                ? `"${lostLead.firstName} ${lostLead.lastName}" will be moved out of the active pipeline. You can reopen it later by editing the lead.`
                : ''}
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

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete lead?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `This permanently deletes "${deleteTarget.firstName} ${deleteTarget.lastName}" and cannot be undone.`
                : ''}
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
    </div>
  );
}
