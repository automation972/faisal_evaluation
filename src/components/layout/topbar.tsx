// Young10 Marketing CRM - top bar with mobile nav, task alerts and user menu

'use client';

import { useState, useEffect } from 'react';
import { SidebarNavContent } from '@/components/layout/sidebar';
import { useCrmStore, type CrmView } from '@/store/crm-store';
import { useTasks } from '@/hooks/use-crm';
import { UserAvatar } from '@/components/shared/badges';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import type { SafeUser } from '@/types';
import {
  Menu,
  Bell,
} from 'lucide-react';

const VIEW_META: Record<CrmView, { title: string; kicker: string }> = {
  dashboard: { title: 'Dashboard', kicker: 'Overview' },
  leads: { title: 'Leads', kicker: 'Relationships' },
  pipeline: { title: 'Pipeline', kicker: 'Sales Flow' },
  tasks: { title: 'Tasks & Follow-ups', kicker: 'Execution' },
  admin: { title: 'Admin Console', kicker: 'Administration' },
};

export function Topbar({ user }: { user: SafeUser }) {
  const view = useCrmStore((s) => s.view);
  const setView = useCrmStore((s) => s.setView);
  const mobileNavOpen = useCrmStore((s) => s.mobileNavOpen);
  const setMobileNavOpen = useCrmStore((s) => s.setMobileNavOpen);
  const [now, setNow] = useState(() => new Date());

  // Alert count: overdue + due-today tasks (server truth, polls every 20s)
  const { data: tasksData } = useTasks({ status: 'ALL', mine: true });
  const alertCount = (tasksData?.counts.overdue ?? 0) + 0;

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const meta = VIEW_META[view];
  const dateLabel = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-white/90 px-4 backdrop-blur md:px-8">
      <div className="flex items-center gap-3">
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 border-0 ink-gradient p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SidebarNavContent user={user} onNavigate={() => setMobileNavOpen(false)} />
          </SheetContent>
        </Sheet>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{meta.kicker}</p>
          <h2 className="text-base font-bold leading-tight md:text-lg">{meta.title}</h2>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <p className="hidden text-sm text-muted-foreground lg:block">{dateLabel}</p>

        <button
          type="button"
          onClick={() => setView('tasks')}
          className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={`${alertCount} overdue tasks`}
        >
          <Bell className="h-5 w-5" />
          {alertCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#DC2626] px-1 text-[10px] font-bold text-white">
              {alertCount}
            </span>
          )}
        </button>

        <div className="hidden items-center gap-2.5 rounded-full border bg-white py-1 pl-1 pr-3 md:flex">
          <UserAvatar name={user.name} size="sm" />
          <div className="leading-tight">
            <p className="text-xs font-semibold">{user.name}</p>
            <p className="text-[10px] text-muted-foreground">{VIEW_META[view].title}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

// view metadata shared with other layout pieces
export { VIEW_META };
