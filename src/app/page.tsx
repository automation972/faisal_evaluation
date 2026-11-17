// Young10 Marketing CRM - application shell (single-page)
// Unauthenticated -> brand auth screen. Authenticated -> CRM workspace.

'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMe } from '@/hooks/use-crm';
import AuthScreen from '@/components/auth/auth-screen';
import { LandingPage } from '@/components/landing/vesper-landing';
import { DesktopSidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import DashboardView from '@/components/dashboard/dashboard-view';
import LeadsView from '@/components/leads/leads-view';
import PipelineView from '@/components/pipeline/pipeline-view';
import TasksView from '@/components/tasks/tasks-view';
import AdminView from '@/components/admin/admin-view';
import { LeadFormDialog } from '@/components/leads/lead-form-dialog';
import { LeadDetailSheet } from '@/components/leads/lead-detail-sheet';
import { LogoMark } from '@/components/brand/logo';
import { useCrmStore } from '@/store/crm-store';

function BrandSplash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <LogoMark size={52} className="animate-pulse" />
        <p className="text-sm font-medium text-muted-foreground">Loading your workspace...</p>
      </div>
    </div>
  );
}

function CrmWorkspace() {
  const view = useCrmStore((s) => s.view);
  const { data: user, isLoading } = useMe();
  const [showAuth, setShowAuth] = useState(false);

  if (isLoading) return <BrandSplash />;
  if (!user) {
    return showAuth ? (
      <AuthScreen onBack={() => setShowAuth(false)} />
    ) : (
      <LandingPage onSignIn={() => setShowAuth(true)} />
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F6FB]">
      <DesktopSidebar user={user} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar user={user} />

        <main
          className="scrollbar-slim flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8"
          aria-label="CRM workspace"
        >
          {view === 'dashboard' && <DashboardView user={user} />}
          {view === 'leads' && <LeadsView user={user} />}
          {view === 'pipeline' && <PipelineView />}
          {view === 'tasks' && <TasksView user={user} />}
          {view === 'admin' && <AdminView user={user} />}
        </main>

        <footer className="flex shrink-0 items-center justify-between border-t border-[#ECEEF5] bg-white px-4 py-2.5 text-xs text-muted-foreground md:px-8">
          <span>
            <span className="font-semibold text-foreground">Y10 CRM</span>
            <span className="mx-2 text-border">|</span>
            © {new Date().getFullYear()} Young10 Marketing
          </span>
          <span className="hidden sm:block">Live data · PostgreSQL</span>
        </footer>
      </div>

      <LeadFormDialog />
      <LeadDetailSheet />
    </div>
  );
}

export default function Page() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cached data stays fresh longer: view switches render instantly
            // from cache instead of re-fetching on every navigation.
            refetchOnWindowFocus: false,
            staleTime: 20_000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <CrmWorkspace />
    </QueryClientProvider>
  );
}
