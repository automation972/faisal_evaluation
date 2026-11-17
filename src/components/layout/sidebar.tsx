// Young10 Marketing CRM - light sidebar (desktop + mobile sheet content)

'use client';

import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { useCrmStore, type CrmView } from '@/store/crm-store';
import { useLogout } from '@/hooks/use-crm';
import { UserAvatar } from '@/components/shared/badges';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Columns3,
  ClipboardCheck,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { toast } from 'sonner';
import { ROLE_META } from '@/lib/constants';
import type { SafeUser } from '@/types';

const NAV_ITEMS: Array<{ view: CrmView; label: string; icon: typeof LayoutDashboard; adminOnly?: boolean }> = [
  { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { view: 'leads', label: 'Leads', icon: Users },
  { view: 'pipeline', label: 'Pipeline', icon: Columns3 },
  { view: 'tasks', label: 'Tasks', icon: ClipboardCheck },
  { view: 'admin', label: 'Admin Console', icon: ShieldCheck, adminOnly: true },
];

export function SidebarNavContent({ user, onNavigate }: { user: SafeUser; onNavigate?: () => void }) {
  const view = useCrmStore((s) => s.view);
  const setView = useCrmStore((s) => s.setView);
  const logout = useLogout();

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      toast.success('Signed out');
    } catch {
      toast.error('Could not sign out');
    }
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="px-5 pb-6 pt-6">
        <Logo height={72} />
      </div>

      <p className="px-6 pb-2 text-[10.5px] font-bold uppercase tracking-[0.16em] text-muted-foreground/80">
        Workspace
      </p>
      <nav className="flex-1 space-y-1 px-3.5" aria-label="Main navigation">
        {NAV_ITEMS.filter((item) => !item.adminOnly || user.role === 'ADMIN').map((item) => {
          const active = view === item.view;
          const Icon = item.icon;
          return (
            <button
              key={item.view}
              type="button"
              onClick={() => {
                setView(item.view);
                onNavigate?.();
              }}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group relative flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13.5px] transition-all',
                active
                  ? 'bg-[#EEF0FF] font-semibold text-primary'
                  : 'font-medium text-[#5F6274] hover:bg-[#F4F5FA] hover:text-foreground',
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary transition-opacity',
                  active ? 'opacity-100' : 'opacity-0',
                )}
              />
              <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={active ? 2.1 : 1.8} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-[#ECEEF5] p-4">
        <div className="mb-3 flex items-center gap-3 px-1">
          <UserAvatar name={user.name} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-foreground">{user.name}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {user.role === 'ADMIN' ? ROLE_META.ADMIN.label : ROLE_META.SALES_REP.label}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          disabled={logout.isPending}
          className="h-9 w-full justify-start gap-2 rounded-[10px] text-[13px] text-[#5F6274] hover:bg-[#F4F5FA] hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          {logout.isPending ? 'Signing out...' : 'Sign Out'}
        </Button>
      </div>
    </div>
  );
}

export function DesktopSidebar({ user }: { user: SafeUser }) {
  return (
    <aside className="hidden w-[264px] shrink-0 flex-col border-r border-[#ECEEF5] bg-white md:flex" aria-label="Sidebar">
      <SidebarNavContent user={user} />
    </aside>
  );
}
