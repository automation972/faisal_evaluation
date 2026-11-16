// Young10 Marketing CRM - Pipeline kanban view (drag-and-drop across five stages)

'use client';

import { useMemo, useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import type { SafeLead } from '@/types';
import { PIPELINE_STAGES, STAGE_META } from '@/lib/constants';
import type { PipelineStage } from '@/lib/constants';
import { useLeads, useUpdateLead } from '@/hooks/use-crm';
import { useCrmStore } from '@/store/crm-store';
import { formatCurrency, SourceBadge, UserAvatar } from '@/components/shared/badges';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

function KanbanCardContent({ lead }: { lead: SafeLead }) {
  const assigneeName = lead.assignedTo?.name ?? 'Unassigned';
  return (
    <Card className="card-shadow gap-2 rounded-xl border-border/70 bg-card p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#384BFE]/30">
      <div className="space-y-0.5">
        <p className="truncate text-[13.5px] font-semibold leading-tight text-foreground">
          {lead.firstName} {lead.lastName}
        </p>
        <p className="truncate text-xs text-muted-foreground">{lead.company ?? 'No company'}</p>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-semibold tabular-nums text-foreground">
          {formatCurrency(lead.value)}
        </span>
        <div className="flex shrink-0 items-center gap-1.5">
          <span title={assigneeName} aria-label={`Assigned to ${assigneeName}`}>
            <UserAvatar name={assigneeName} size="sm" />
          </span>
          <SourceBadge source={lead.source} />
        </div>
      </div>
    </Card>
  );
}

function DraggableLeadCard({
  lead,
  onOpen,
  suppressClick,
}: {
  lead: SafeLead;
  onOpen: (id: string) => void;
  suppressClick: () => boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={
        transform
          ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 50 }
          : undefined
      }
      className={isDragging ? 'opacity-30' : 'cursor-grab'}
      onClick={() => {
        if (suppressClick()) return;
        onOpen(lead.id);
      }}
    >
      <KanbanCardContent lead={lead} />
    </div>
  );
}

function PipelineColumn({
  stage,
  leads,
  draggingActive,
  onOpen,
  suppressClick,
}: {
  stage: PipelineStage;
  leads: SafeLead[];
  draggingActive: boolean;
  onOpen: (id: string) => void;
  suppressClick: () => boolean;
}) {
  const meta = STAGE_META[stage];
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const sum = useMemo(() => leads.reduce((acc, l) => acc + l.value, 0), [leads]);

  return (
    <div
      className={`flex min-w-[280px] flex-1 snap-start flex-col gap-2.5 rounded-2xl border border-dashed border-transparent bg-[#F4F5FA] p-3 transition-colors duration-200 ${
        draggingActive && isOver ? 'border-2 border-[#384BFE]/40 bg-[#EEF0FF]/40' : ''
      }`}
    >
      {/* Column header */}
      <div className="flex items-center gap-2">
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: meta.color }}
          aria-hidden
        />
        <span className="truncate text-[13px] font-semibold text-foreground">{meta.label}</span>
        <span className="ml-auto flex min-w-6 items-center justify-center rounded-full border border-border bg-white px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
          {leads.length}
        </span>
        <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
          {formatCurrency(sum, { compact: true })}
        </span>
      </div>

      {/* Stage soft accent bar */}
      <div
        aria-hidden
        className="h-[3px] w-full rounded-full opacity-30"
        style={{ backgroundColor: meta.color }}
      />

      {/* Droppable body */}
      <div ref={setNodeRef} className="min-h-[120px] flex-1 space-y-3">
        {leads.length === 0 ? (
          <div className="flex h-full min-h-[120px] items-center justify-center rounded-xl border border-dashed border-border/70 py-6 text-center">
            <p className="text-[12px] text-muted-foreground">No leads</p>
          </div>
        ) : (
          leads.map((lead) => (
            <DraggableLeadCard
              key={lead.id}
              lead={lead}
              onOpen={onOpen}
              suppressClick={suppressClick}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ColumnSkeleton() {
  return (
    <div className="flex min-w-[280px] flex-1 flex-col gap-2.5 rounded-2xl border border-transparent bg-[#F4F5FA] p-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-2 w-2 rounded-full" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="ml-auto h-5 w-9 rounded-full" />
        <Skeleton className="h-3.5 w-10" />
      </div>
      <Skeleton className="h-[3px] w-full rounded-full" />
      <div className="min-h-[120px] flex-1 space-y-3">
        <Skeleton className="h-[96px] rounded-xl" />
        <Skeleton className="h-[96px] rounded-xl" />
      </div>
    </div>
  );
}

export default function PipelineView() {
  const openLeadDetail = useCrmStore((s) => s.openLeadDetail);
  const updateLead = useUpdateLead();
  const { data, isLoading } = useLeads({ status: 'OPEN', pageSize: 100, sort: 'value_desc' });
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const [activeId, setActiveId] = useState<string | null>(null);
  const suppressClickRef = useRef(false);

  const leads = useMemo(() => data?.leads ?? [], [data]);

  const byStage = useMemo(() => {
    const map: Record<PipelineStage, SafeLead[]> = {
      NEW: [],
      CONTACTED: [],
      QUALIFIED: [],
      PROPOSAL: [],
      WON: [],
    };
    for (const lead of leads) {
      if (lead.status === 'OPEN' && map[lead.stage]) map[lead.stage].push(lead);
    }
    return map;
  }, [leads]);

  const activeLead = activeId ? (leads.find((l) => l.id === activeId) ?? null) : null;
  const pipelineValue = useMemo(() => leads.reduce((acc, l) => acc + l.value, 0), [leads]);

  const suppressClick = () => {
    const suppressed = suppressClickRef.current;
    suppressClickRef.current = false;
    return suppressed;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const draggedId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : null;
    setActiveId(null);

    // Swallow the click that follows a drag so it does not open the detail sheet
    suppressClickRef.current = true;
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 300);

    const lead = leads.find((l) => l.id === draggedId);
    if (!lead || !overId || overId === draggedId) return;

    const targetStage = PIPELINE_STAGES.find((s) => s === overId);
    if (!targetStage || targetStage === lead.stage) return;

    try {
      await updateLead.mutateAsync({ id: lead.id, data: { stage: targetStage } });
      toast.success(`Moved to ${STAGE_META[targetStage].label}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to move lead');
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    suppressClickRef.current = true;
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 300);
  };

  const handleCardOpen = (id: string) => {
    openLeadDetail(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Sales Pipeline
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            Drag leads across stages to keep every open deal moving.
          </p>
        </div>
        <div className="card-shadow flex shrink-0 items-center gap-2.5 rounded-full border border-border bg-white px-3.5 py-2">
          <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-[#384BFE]" />
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Open pipeline
          </span>
          <span className="text-xs font-semibold tabular-nums text-foreground">
            {formatCurrency(pipelineValue)}
          </span>
        </div>
      </div>

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={(e) => void handleDragEnd(e)}
        onDragCancel={handleDragCancel}
      >
        <div
          className={`scrollbar-slim flex gap-4 overflow-x-auto pb-3 pt-1 snap-x ${
            activeId ? 'cursor-grabbing select-none' : ''
          }`}
        >
          {isLoading
            ? Array.from({ length: PIPELINE_STAGES.length }).map((_, i) => <ColumnSkeleton key={i} />)
            : PIPELINE_STAGES.map((stage) => (
                <PipelineColumn
                  key={stage}
                  stage={stage}
                  leads={byStage[stage]}
                  draggingActive={!!activeId}
                  onOpen={handleCardOpen}
                  suppressClick={suppressClick}
                />
              ))}
        </div>

        <DragOverlay>
          {activeLead ? (
            <div className="w-[260px] rotate-none scale-[1.02] cursor-grabbing rounded-xl shadow-lg ring-2 ring-[#384BFE]/30">
              <KanbanCardContent lead={activeLead} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
