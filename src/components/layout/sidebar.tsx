// Young10 Marketing CRM - dark brand sidebar (desktop)

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
    <div className="flex h-full flex-col">
      <div className="flex items-center px-5 pb-6 pt-6">
        <Logo variant="white" size={34} />
      </div>

      <nav className="flex-1 space-y-1 px-3" aria-label="Main navigation">
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
                'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-[#384BFE] text-white'
                  : 'text-[#B6B8CF] hover:bg-[#1D1B2E] hover:text-white',
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={active ? 2.2 : 1.8} />
              {item.label}
              {active && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-white/90" />}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-[#262439] p-4">
        <div className="mb-3 flex items-center gap-3">
          <UserAvatar name={user.name} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user.name}</p>
            <p className="truncate text-xs text-[#8E90AC]">
              {user.role === 'ADMIN' ? ROLE_META.ADMIN.label : ROLE_META.SALES_REP.label}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          disabled={logout.isPending}
          className="w-full justify-start gap-2 text-[#B6B8CF] hover:bg-[#1D1B2E] hover:text-white"
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
    <aside className="hidden w-64 shrink-0 flex-col ink-gradient md:flex" aria-label="Sidebar">
      <SidebarNavContent user={user} />
    </aside>
  );
}
