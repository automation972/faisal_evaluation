// Young10 Marketing CRM - analytics dashboard (real-time overview)

'use client';

import type { ReactNode } from 'react';

import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  ArrowRightLeft,
  CalendarCheck,
  CheckCircle2,
  Globe,
  Percent,
  Trophy,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { formatCurrency, formatRelative, UserAvatar } from '@/components/shared/badges';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useActivities, useAnalytics, useTasks } from '@/hooks/use-crm';
import { PRIORITY_META, SOURCE_META, STAGE_META } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useCrmStore } from '@/store/crm-store';
import type { SafeActivity, SafeTask, SafeUser } from '@/types';

// ---------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------

const ACTIVITY_ICONS: Record<string, LucideIcon> = {
  LEAD_CREATED: UserPlus,
  STAGE_CHANGED: ArrowRightLeft,
  LEAD_ASSIGNED: UserCheck,
  TASK_COMPLETED: CheckCircle2,
  EXTERNAL_LEAD: Globe,
};

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function dueChip(task: SafeTask): { label: string; className: string } | null {
  if (!task.dueDate) return null;
  const today = startOfToday();
  const due = new Date(task.dueDate);
  if (due.getTime() < today.getTime()) {
    return { label: 'Overdue', className: 'bg-[#FDE7E7] text-[#DC2626]' };
  }
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (due.getTime() < tomorrow.getTime()) {
    return { label: 'Today', className: 'bg-[#FEF3DF] text-[#B45309]' };
  }
  return {
    label: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    className: 'bg-muted text-muted-foreground',
  };
}

function pluralLeads(count: number): string {
  return count === 1 ? 'lead' : 'leads';
}

function Section({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function CardHead({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-base font-semibold leading-none">{title}</h2>
      {action}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = 'blue',
}: {
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  tone?: 'blue' | 'green';
}) {
  return (
    <Card className="card-shadow gap-3 p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            tone === 'green' ? 'bg-[#E4F7EC] text-[#16A34A]' : 'bg-[#EAEFFF] text-[#384BFE]',
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className={cn('text-3xl font-bold tracking-tight tabular-nums', tone === 'green' && 'text-[#16A34A]')}>
        {value}
      </p>
      <p className="text-sm text-muted-foreground">{sub}</p>
    </Card>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: number; tone?: 'danger' }) {
  return (
    <div className="rounded-xl bg-muted/70 px-3 py-3.5 text-center">
      <p className={cn('text-2xl font-bold tabular-nums', tone === 'danger' && value > 0 && 'text-[#DC2626]')}>
        {value}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function ListSkeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-full rounded-lg" />
      ))}
    </div>
  );
}

function ActivityRow({ activity, onOpenLead }: { activity: SafeActivity; onOpenLead?: () => void }) {
  const Icon = ACTIVITY_ICONS[activity.type] ?? Activity;
  const actor = activity.user?.name ?? 'System';
  const content = (
    <>
      <div className="relative shrink-0">
        <UserAvatar name={actor} />
        <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border border-border bg-card text-[#384BFE]">
          <Icon className="h-2.5 w-2.5" />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm leading-snug">{activity.message}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{formatRelative(activity.createdAt)}</p>
      </div>
    </>
  );
  if (onOpenLead) {
    return (
      <button
        type="button"
        onClick={onOpenLead}
        className="flex w-full items-start gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-accent/60"
      >
        {content}
      </button>
    );
  }
  return <div className="flex items-start gap-3 px-2 py-1.5">{content}</div>;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card-shadow rounded-xl border bg-card p-6">
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-10 rounded-xl" />
            </div>
            <Skeleton className="mt-4 h-8 w-24" />
            <Skeleton className="mt-3 h-4 w-32" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="card-shadow rounded-xl border bg-card p-6 xl:col-span-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="mt-6 h-72 w-full" />
        </div>
        <div className="card-shadow rounded-xl border bg-card p-6">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="mt-6 h-72 w-full" />
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-3/4" />
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="card-shadow rounded-xl border bg-card p-6">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="mt-6 h-56 w-full" />
        </div>
        <div className="card-shadow rounded-xl border bg-card p-6">
          <Skeleton className="h-5 w-40" />
          <div className="mt-6">
            <ListSkeleton rows={5} />
          </div>
        </div>
        <div className="card-shadow rounded-xl border bg-card p-6">
          <Skeleton className="h-5 w-28" />
          <div className="mt-6">
            <ListSkeleton rows={4} />
          </div>
        </div>
      </div>
      <div className="card-shadow rounded-xl border bg-card p-6">
        <Skeleton className="h-5 w-40" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Chart tooltips (white cards)
// ---------------------------------------------------------------------------

function TrendTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number | string }>;
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  const count = Number(payload[0]?.value ?? 0);
  return (
    <div className="rounded-lg border border-border bg-white px-3 py-2 shadow-md">
      <p className="text-[11px] font-medium text-muted-foreground">Week of {label}</p>
      <p className="mt-0.5 text-sm font-semibold">
        {count} {pluralLeads(count)}
      </p>
    </div>
  );
}

function StageTooltip({
  active,
  payload,
  total,
}: {
  active?: boolean;
  payload?: Array<{ name?: string | number; value?: number | string; payload?: { color?: string } }>;
  total?: number;
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const count = Number(entry?.value ?? 0);
  const name = String(entry?.name ?? '');
  const color = entry?.payload?.color;
  const share = total && total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="rounded-lg border border-border bg-white px-3 py-2 shadow-md">
      <div className="flex items-center gap-2">
        {color ? <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} /> : null}
        <p className="text-xs font-medium">{name}</p>
      </div>
      <p className="mt-0.5 text-sm font-semibold">
        {count} {pluralLeads(count)} · {share}%
      </p>
    </div>
  );
}

function SourceTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number | string }>;
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  const count = Number(payload[0]?.value ?? 0);
  return (
    <div className="rounded-lg border border-border bg-white px-3 py-2 shadow-md">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold">
        {count} {pluralLeads(count)}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard view
// ---------------------------------------------------------------------------

const LEADERBOARD_GRID =
  'grid grid-cols-[1.75rem_auto_minmax(0,1fr)_3.5rem_4rem_5.75rem] items-center gap-x-3';

export default function DashboardView({ user }: { user: SafeUser }) {
  const { data: analytics, isLoading } = useAnalytics();
  const { data: activities } = useActivities(10);
  const { data: tasksData } = useTasks({ status: 'ALL', mine: user.role !== 'ADMIN' });
  const setView = useCrmStore((s) => s.setView);
  const openLeadDetail = useCrmStore((s) => s.openLeadDetail);

  const weeklyData = (analytics?.weeklyTrend ?? []).map((point) => ({
    label: new Date(point.weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count: point.count,
  }));
  const stageData = (analytics?.stageBreakdown ?? []).map((entry) => ({
    name: STAGE_META[entry.stage].label,
    value: entry.count,
    color: STAGE_META[entry.stage].color,
  }));
  const donutTotal = stageData.reduce((sum, entry) => sum + entry.value, 0);
  const sourceData = (analytics?.topSources ?? []).map((entry) => ({
    label: SOURCE_META[entry.source]?.label ?? entry.source,
    count: entry.count,
  }));
  const upcomingTasks = (tasksData?.tasks ?? [])
    .filter((task) => task.status !== 'COMPLETED')
    .sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, 5);
  const leaderboard = [...(analytics?.repLeaderboard ?? [])].sort((a, b) => b.wonValue - a.wonValue);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">OVERVIEW</p>
          <h1 className="mt-1.5 text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Welcome back, {user.name}</p>
        </div>
        <div className="card-shadow inline-flex items-center gap-2.5 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-medium text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#16A34A] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#16A34A]" />
          </span>
          <span>Live · refreshed {analytics ? formatRelative(analytics.generatedAt) : 'syncing'}</span>
        </div>
      </Section>

      {isLoading || !analytics ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* Row 1 - stat cards */}
          <Section className="grid grid-cols-2 gap-6 xl:grid-cols-4" delay={0.04}>
            <StatCard
              label="Total Leads"
              value={analytics.totals.leads.toLocaleString('en-US')}
              sub={`+${analytics.totals.leadsThisMonth} this month`}
              icon={Users}
            />
            <StatCard
              label="Open Pipeline"
              value={formatCurrency(analytics.totals.pipelineValue, { compact: true })}
              sub={`${analytics.totals.openLeads} open`}
              icon={TrendingUp}
            />
            <StatCard
              label="Won Revenue"
              value={formatCurrency(analytics.totals.wonValue, { compact: true })}
              sub={`${analytics.totals.wonLeads} won`}
              icon={Trophy}
              tone="green"
            />
            <StatCard
              label="Conversion Rate"
              value={`${analytics.totals.conversionRate}%`}
              sub={`${analytics.totals.lostLeads} lost`}
              icon={Percent}
            />
          </Section>

          {/* Row 2 - trend + stage donut */}
          <Section className="grid gap-6 xl:grid-cols-3" delay={0.08}>
            <Card className="card-shadow p-6 xl:col-span-2">
              <CardHead
                title="Leads created"
                action={
                  <button
                    type="button"
                    onClick={() => setView('leads')}
                    className="text-xs font-medium text-[#384BFE] transition-colors hover:text-[#2B3AD1] hover:underline"
                  >
                    View leads
                  </button>
                }
              />
              <div className="h-72">
                {weeklyData.length === 0 ? (
                  <EmptyChart message="No lead activity recorded yet" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                      <defs>
                        <linearGradient id="dashboardLeadTrend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#384BFE" stopOpacity={0.22} />
                          <stop offset="100%" stopColor="#384BFE" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="#EEF0F8" />
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        minTickGap={24}
                        tick={{ fontSize: 11, fill: '#7A7A7A' }}
                      />
                      <YAxis hide allowDecimals={false} />
                      <Tooltip
                        content={<TrendTooltip />}
                        cursor={{ stroke: '#384BFE', strokeOpacity: 0.3, strokeWidth: 1 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#384BFE"
                        strokeWidth={2}
                        fill="url(#dashboardLeadTrend)"
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 2, stroke: '#ffffff', fill: '#384BFE' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>

            <Card className="card-shadow p-6">
              <CardHead title="Pipeline by stage" />
              <div>
                <div className="relative h-72">
                  {stageData.length === 0 ? (
                    <EmptyChart message="No leads in the pipeline yet" />
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Tooltip content={<StageTooltip total={donutTotal} />} />
                          <Pie
                            data={stageData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius="68%"
                            outerRadius="92%"
                            paddingAngle={3}
                            stroke="none"
                          >
                            {stageData.map((entry) => (
                              <Cell key={entry.name} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold tabular-nums">{donutTotal}</span>
                        <span className="mt-0.5 text-xs text-muted-foreground">Total leads</span>
                      </div>
                    </>
                  )}
                </div>
                <div className="mt-4 space-y-1">
                  {stageData.map((entry) => (
                    <button
                      key={entry.name}
                      type="button"
                      onClick={() => setView('pipeline')}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 transition-colors hover:bg-accent/60"
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-sm">{entry.name}</span>
                      </span>
                      <span className="text-sm font-semibold tabular-nums">{entry.value}</span>
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </Section>

          {/* Row 3 - sources + follow-ups + activity */}
          <Section className="grid gap-6 xl:grid-cols-3" delay={0.12}>
            <Card className="card-shadow p-6">
              <CardHead title="Lead sources" />
              <div className="h-56">
                {sourceData.length === 0 ? (
                  <EmptyChart message="No sources tracked yet" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sourceData} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
                      <XAxis type="number" hide />
                      <YAxis
                        type="category"
                        dataKey="label"
                        width={104}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#7A7A7A' }}
                      />
                      <Tooltip content={<SourceTooltip />} cursor={{ fill: 'rgba(56, 75, 254, 0.06)' }} />
                      <Bar dataKey="count" fill="#384BFE" radius={[0, 7, 7, 0]} barSize={14} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>

            <Card className="card-shadow p-6">
              <CardHead title="Upcoming follow-ups" />
              {tasksData === undefined ? (
                <ListSkeleton rows={5} />
              ) : upcomingTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-10 text-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAEFFF] text-[#384BFE]">
                    <CalendarCheck className="h-5 w-5" />
                  </span>
                  <p className="mt-3 text-sm font-medium">No follow-ups scheduled</p>
                  <p className="mt-1 text-xs text-muted-foreground">Tasks with upcoming due dates will appear here</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {upcomingTasks.map((task) => {
                    const chip = dueChip(task);
                    const dotColor = PRIORITY_META[task.priority]?.color ?? '#64748B';
                    return (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => setView('tasks')}
                        className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-accent/60"
                      >
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: dotColor }}
                          aria-hidden
                        />
                        <span className="min-w-0 flex-1 truncate text-sm">{task.title}</span>
                        {chip ? (
                          <span
                            className={cn(
                              'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium',
                              chip.className,
                            )}
                          >
                            {chip.label}
                          </span>
                        ) : (
                          <span className="shrink-0 text-xs text-muted-foreground">No due date</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card className="card-shadow p-6">
              <CardHead title="Activity feed" />
              {activities === undefined ? (
                <ListSkeleton rows={4} />
              ) : activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-10 text-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAEFFF] text-[#384BFE]">
                    <Activity className="h-5 w-5" />
                  </span>
                  <p className="mt-3 text-sm font-medium">No activity yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">Team actions will show up here in real time</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {activities.map((item) => {
                    const leadId = item.lead?.id ?? null;
                    return (
                      <ActivityRow
                        key={item.id}
                        activity={item}
                        onOpenLead={leadId ? () => openLeadDetail(leadId) : undefined}
                      />
                    );
                  })}
                </div>
              )}
            </Card>
          </Section>

          {/* Row 4 - leaderboard (admin) or personal focus (sales rep) */}
          <Section delay={0.16}>
            {user.role === 'ADMIN' ? (
              <Card className="card-shadow p-6">
                <CardHead title="Team leaderboard" />
                {leaderboard.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No rep activity recorded yet.</p>
                ) : (
                  <div>
                    <div
                      className={cn(
                        LEADERBOARD_GRID,
                        'border-b border-border pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground',
                      )}
                    >
                      <span>#</span>
                      <span aria-hidden />
                      <span>Rep</span>
                      <span className="text-right">Leads</span>
                      <span className="text-right">Won</span>
                      <span className="text-right">Revenue</span>
                    </div>
                    <div className="pt-1">
                      {leaderboard.map((rep, index) => (
                        <div key={rep.userId} className={cn(LEADERBOARD_GRID, 'py-2.5')}>
                          <span className="text-sm font-semibold tabular-nums text-muted-foreground">
                            {index + 1}
                          </span>
                          <UserAvatar name={rep.name} />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{rep.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{rep.email}</p>
                          </div>
                          <span className="text-right text-sm tabular-nums">{rep.totalLeads}</span>
                          <span className="justify-self-end rounded-full bg-[#E4F7EC] px-2.5 py-0.5 text-xs font-semibold tabular-nums text-[#16A34A]">
                            {rep.wonLeads}
                          </span>
                          <span className="text-right text-sm font-semibold tabular-nums">
                            {formatCurrency(rep.wonValue, { compact: true })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ) : (
              <Card className="card-shadow p-6">
                <CardHead title="My focus" />
                <div>
                  <div className="grid grid-cols-3 gap-4">
                    <MiniStat label="Due today" value={analytics.tasks.dueToday} />
                    <MiniStat label="Overdue" value={analytics.tasks.overdue} tone="danger" />
                    <MiniStat label="Pending" value={analytics.tasks.pending} />
                  </div>
                  <Button className="mt-5 w-full" onClick={() => setView('tasks')}>
                    Open tasks
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            )}
          </Section>
        </>
      )}
    </div>
  );
}
