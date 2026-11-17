// Young10 Marketing CRM - shared badges, avatars and formatters used across views

'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  STAGE_META,
  SOURCE_META,
  PRIORITY_META,
  type PipelineStage,
  type LeadSourceValue,
  type TaskPriorityValue,
} from '@/lib/constants';

export function formatCurrency(value: number, opts?: { compact?: boolean }): string {
  if (opts?.compact) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return '-';
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function initials(name: string | null | undefined): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
}

const AVATAR_TONES = [
  'bg-[#EAEFFF] text-[#26309C]',
  'bg-[#E2F7FA] text-[#0B6B78]',
  'bg-[#F1EAFE] text-[#5B21B6]',
  'bg-[#FEF3DF] text-[#92610A]',
  'bg-[#E4F7EC] text-[#166534]',
  'bg-[#FDE7E7] text-[#991B1B]',
];

export function UserAvatar({ name, size = 'default', className }: { name: string; size?: 'sm' | 'default'; className?: string }) {
  const tone = AVATAR_TONES[name.charCodeAt(0) % AVATAR_TONES.length];
  return (
    <Avatar className={cn(size === 'sm' ? 'h-6 w-6' : 'h-8 w-8', className)}>
      <AvatarFallback className={cn('text-[11px] font-semibold', tone, size === 'sm' && 'text-[9px]')}>
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}

export function StageBadge({ stage, className }: { stage: PipelineStage; className?: string }) {
  const meta = STAGE_META[stage];
  return (
    <Badge
      variant="outline"
      className={cn('font-medium border-transparent', className)}
      style={{ backgroundColor: meta.soft, color: meta.color }}
    >
      {meta.label}
    </Badge>
  );
}

export function SourceBadge({ source, className }: { source: LeadSourceValue; className?: string }) {
  return (
    <Badge variant="outline" className={cn('bg-muted text-muted-foreground border-transparent font-medium', className)}>
      {SOURCE_META[source].label}
    </Badge>
  );
}

export function PriorityBadge({ priority, className }: { priority: TaskPriorityValue; className?: string }) {
  const meta = PRIORITY_META[priority];
  return (
    <Badge
      variant="outline"
      className={cn('font-medium border-transparent', className)}
      style={{ backgroundColor: meta.soft, color: meta.color }}
    >
      {meta.label}
    </Badge>
  );
}
