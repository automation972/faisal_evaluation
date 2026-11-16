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
import { BRAND, PIPELINE_STAGES, STAGE_META } from '@/lib/constants';
import type { PipelineStage } from '@/lib/constants';
import { useLeads, useUpdateLead } from '@/hooks/use-crm';
import { useCrmStore } from '@/store/crm-store';
import { formatCurrency, SourceBadge, StageBadge, UserAvatar } from '@/components/shared/badges';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

function KanbanCardContent({ lead }: { lead: SafeLead }) {
  const stageMeta = STAGE_META[lead.stage];
  return (
    <Card className="card-shadow relative gap-2 overflow-hidden p-3">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{ backgroundColor: stageMeta.color }}
      />
      <div className="space-y-0.5">
        <p className="text-sm font-bold leading-tight">
          {lead.firstName} {lead.lastName}
        </p>
        <p className="truncate text-xs text-muted-foreground">{lead.company ?? 'No company'}</p>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">{formatCurrency(lead.value)}</span>
        <SourceBadge source={lead.source} />
      </div>
      <div className="flex items-center justify-between gap-2 border-t pt-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <UserAvatar name={lead.assignedTo?.name ?? 'Unassigned'} size="sm" />
          <span className="truncate text-xs text-muted-foreground">
            {lead.assignedTo?.name ?? 'Unassigned'}
          </span>
        </div>
        <StageBadge stage={lead.stage} />
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
      className={isDragging ? 'opacity-30' : undefined}
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
    <div className="flex min-w-[280px] flex-1 snap-start flex-col gap-2">
      {/* Column header */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: meta.color }}
            aria-hidden
          />
          <span className="text-xs font-semibold uppercase tracking-wide">{meta.label}</span>
          <span
            className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
            style={{ backgroundColor: meta.soft, color: meta.color }}
          >
            {leads.length}
          </span>
        </div>
        <span className="text-sm text-muted-foreground">{formatCurrency(sum, { compact: true })}</span>
      </div>

      {/* Droppable body */}
      <div
        ref={setNodeRef}
        className={`min-h-[120px] flex-1 space-y-3 rounded-xl bg-muted/40 p-2 transition-shadow ${
          draggingActive && isOver ? 'ring-2 ring-[#384BFE]/40' : ''
        }`}
      >
        {leads.length === 0 ? (
          <div className="flex h-full min-h-[120px] items-center justify-center rounded-xl border border-dashed p-4">
            <p className="text-xs text-muted-foreground">Drop leads here</p>
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
    <div className="flex min-w-[280px] flex-1 flex-col gap-2">
      <div className="flex items-center gap-2 px-1">
        <Skeleton className="size-2.5 rounded-full" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="ml-auto h-4 w-14" />
      </div>
      <div className="min-h-[120px] space-y-3 rounded-xl bg-muted/40 p-2">
        <Skeleton className="h-[92px] rounded-xl" />
        <Skeleton className="h-[92px] rounded-xl" />
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
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#384BFE]">
            Sales Pipeline
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Pipeline</h1>
        </div>
        <div
          className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
          style={{ backgroundColor: STAGE_META.NEW.soft, color: BRAND.blue }}
        >
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Open pipeline
          </span>
          {formatCurrency(pipelineValue)}
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
          className={`flex gap-4 overflow-x-auto pb-2 scrollbar-slim snap-x ${
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
            <div className="w-[260px] rotate-1 cursor-grabbing">
              <KanbanCardContent lead={activeLead} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
