// Young10 Marketing CRM - admin console (team management)

'use client';

import { useState, type FormEvent } from 'react';
import {
  Check,
  ChevronDown,
  Loader2,
  ShieldAlert,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';

import type { SafeUser } from '@/types';
import {
  useCreateUser,
  useUpdateUser,
  useUsers,
} from '@/hooks/use-crm';
import { useCrmStore } from '@/store/crm-store';
import { UserAvatar, formatDate } from '@/components/shared/badges';
import { ROLE_META, type UserRoleValue } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SEGMENT_TRIGGER =
  'h-7 rounded-[7px] border-transparent px-4 text-[13px] font-medium text-[#5F6274] shadow-none hover:bg-[#F4F5FA] data-[state=active]:bg-[#EEF0FF] data-[state=active]:font-semibold data-[state=active]:text-primary data-[state=active]:shadow-none';

/** Mounted only while the dialog is open, so form state resets on every open. */
function NewUserForm({ close }: { close: () => void }) {
  const createUser = useCreateUser();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const pending = createUser.isPending;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: { name?: string; email?: string; password?: string } = {};
    if (!name.trim()) nextErrors.name = 'Name is required.';
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) nextErrors.email = 'Enter a valid email address.';
    if (password.length < 8) nextErrors.password = 'Password must be at least 8 characters.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    try {
      await createUser.mutateAsync({ name: name.trim(), email: email.trim(), password, role: 'SALES_REP' });
      toast.success('Member added');
      close();
    } catch {
      toast.error('Failed to add member. The email may already be in use.');
    }
  };

  return (
    <>
      <DialogHeader className="gap-1 border-b px-6 py-5">
        <DialogTitle className="text-[15px] font-bold tracking-tight">Add Member</DialogTitle>
        <DialogDescription className="text-[13px] text-muted-foreground">
          Create an account for a new teammate.
        </DialogDescription>
      </DialogHeader>
      <form
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
      >
        <div className="space-y-4 px-6 py-5">
          <div className="grid gap-1.5">
            <Label htmlFor="new-user-name" className="text-[13px] font-semibold">
              Name
            </Label>
            <Input
              id="new-user-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="Jordan Smith"
              aria-invalid={Boolean(errors.name)}
              className="h-10 rounded-[10px] border-border bg-white text-[13px]"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="new-user-email" className="text-[13px] font-semibold">
              Email
            </Label>
            <Input
              id="new-user-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              placeholder="jordan@young10.com"
              aria-invalid={Boolean(errors.email)}
              className="h-10 rounded-[10px] border-border bg-white text-[13px]"
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="new-user-password" className="text-[13px] font-semibold">
              Password
            </Label>
            <Input
              id="new-user-password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              placeholder="At least 8 characters"
              aria-invalid={Boolean(errors.password)}
              className="h-10 rounded-[10px] border-border bg-white text-[13px]"
            />
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>

          <div className="grid gap-1.5">
            <Label className="text-[13px] font-semibold">Role</Label>
            <div className="flex h-10 items-center rounded-[10px] border border-border bg-muted/50 px-3 text-[13px] text-muted-foreground">
              Sales Rep
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse gap-2 border-t bg-[#FAFAFD] px-6 py-4 sm:flex-row sm:justify-end sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={close}
            disabled={pending}
            className="rounded-[10px] border-border bg-white font-semibold hover:bg-[#F4F5FA]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={pending}
            className="rounded-[10px] bg-primary font-semibold text-white hover:bg-[#2B3AD1]"
          >
            {pending && <Loader2 className="animate-spin" />}
            Add Member
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

function NewUserDialog() {
  const newUserDialogOpen = useCrmStore((s) => s.newUserDialogOpen);
  const closeNewUserDialog = useCrmStore((s) => s.closeNewUserDialog);

  return (
    <Dialog
      open={newUserDialogOpen}
      onOpenChange={(open) => {
        if (!open) closeNewUserDialog();
      }}
    >
      <DialogContent className="gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-md">
        {newUserDialogOpen && <NewUserForm close={closeNewUserDialog} />}
      </DialogContent>
    </Dialog>
  );
}

export default function AdminView({ user }: { user: SafeUser }) {
  const openNewUserDialog = useCrmStore((s) => s.openNewUserDialog);

  const [tab, setTab] = useState('team');

  const { data: members, isLoading: membersLoading } = useUsers({ includeInactive: true });
  const updateUser = useUpdateUser();

  const handleToggleActive = async (member: SafeUser, active: boolean) => {
    try {
      await updateUser.mutateAsync({ id: member.id, active });
      toast.success(active ? `${member.name} is now active` : `${member.name} has been deactivated`);
    } catch {
      toast.error('Failed to update member');
    }
  };

  const handleRoleChange = async (member: SafeUser, role: UserRoleValue) => {
    if (member.role === role) return;
    try {
      await updateUser.mutateAsync({ id: member.id, role });
      toast.success(`${member.name} is now ${ROLE_META[role].label}`);
    } catch {
      toast.error('Failed to change role');
    }
  };


  if (user.role !== 'ADMIN') {
    return (
      <Card className="card-shadow mx-auto max-w-md py-10 text-center">
        <div className="flex flex-col items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FDE7E7]">
            <ShieldAlert className="h-6 w-6 text-[#DC2626]" />
          </span>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Admins only</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              This area manages team members and integration keys. Ask a workspace admin if you need access.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">ADMINISTRATION</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Admin Console</h1>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="h-9 w-fit justify-start rounded-[10px] border border-border bg-white p-1 shadow-none">
          <TabsTrigger value="team" className={SEGMENT_TRIGGER}>
            Team
          </TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="mt-5">
          <Card className="card-shadow gap-0 overflow-hidden py-0">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-[15px] font-bold tracking-tight">Members</h2>
                <p className="text-[13px] text-muted-foreground">Manage roles and access for your workspace.</p>
              </div>
              <Button
                size="sm"
                onClick={openNewUserDialog}
                className="rounded-[10px] bg-primary font-semibold text-white hover:bg-[#2B3AD1]"
              >
                <UserPlus />
                Add Member
              </Button>
            </div>

            {membersLoading ? (
              <div className="space-y-3 px-6 py-5">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <>
                {/* Mobile member cards (hidden on sm+) */}
                <div className="divide-y divide-border/60 sm:hidden">
                  {(members ?? []).map((member) => {
                    const isSelf = member.id === user.id;
                    return (
                      <div key={member.id} className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <UserAvatar name={member.name} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-sm font-semibold">{member.name}</span>
                              {isSelf && (
                                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">{member.email}</div>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              'shrink-0 border-transparent font-semibold',
                              member.role === 'ADMIN'
                                ? 'bg-[#EEF0FF] text-primary'
                                : 'bg-muted text-muted-foreground',
                            )}
                          >
                            {ROLE_META[member.role].label}
                          </Badge>
                        </div>
                        <div className="mt-2.5 flex items-center justify-between pl-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                'h-2 w-2 shrink-0 rounded-full',
                                member.active ? 'bg-[#16A34A]' : 'bg-[#C6C9D4]',
                              )}
                            />
                            <Switch
                              checked={member.active}
                              disabled={isSelf || updateUser.isPending}
                              onCheckedChange={(checked) => void handleToggleActive(member, checked)}
                              aria-label={`Toggle active for ${member.name}`}
                            />
                            <span className="text-xs text-muted-foreground">
                              {member.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          {!isSelf && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 gap-1.5 rounded-[10px] text-xs font-semibold text-muted-foreground"
                                  aria-label={`Change role for ${member.name}`}
                                >
                                  Change role
                                  <ChevronDown className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {(['ADMIN', 'SALES_REP'] as const).map((role) => (
                                  <DropdownMenuItem
                                    key={role}
                                    onSelect={() => void handleRoleChange(member, role)}
                                  >
                                    {ROLE_META[role].label}
                                    {member.role === role && <Check className="ml-auto h-3.5 w-3.5" />}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                        <p className="mt-1.5 pl-1 text-[11px] text-muted-foreground">
                          Joined {formatDate(member.createdAt)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop table (hidden on mobile) */}
                <div className="hidden sm:block">
                  <Table>
                    <TableHeader className="bg-[#F8F9FC]">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="px-6 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                          Member
                        </TableHead>
                        <TableHead className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                          Role
                        </TableHead>
                        <TableHead className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                          Status
                        </TableHead>
                        <TableHead className="px-6 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                          Joined
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(members ?? []).map((member) => {
                        const isSelf = member.id === user.id;
                        return (
                          <TableRow key={member.id} className="hover:bg-[#F7F8FC]">
                            <TableCell className="px-6">
                              <div className="flex items-center gap-3">
                                <UserAvatar name={member.name} />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="truncate text-sm font-semibold">{member.name}</span>
                                    {isSelf && (
                                      <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                                        You
                                      </span>
                                    )}
                                  </div>
                                  <div className="truncate text-xs text-muted-foreground">{member.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    'border-transparent font-semibold',
                                    member.role === 'ADMIN'
                                      ? 'bg-[#EEF0FF] text-primary'
                                      : 'bg-muted text-muted-foreground',
                                  )}
                                >
                                  {ROLE_META[member.role].label}
                                </Badge>
                                {!isSelf && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        aria-label={`Change role for ${member.name}`}
                                      >
                                        <ChevronDown className="h-3.5 w-3.5" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                      {(['ADMIN', 'SALES_REP'] as const).map((role) => (
                                        <DropdownMenuItem
                                          key={role}
                                          onSelect={() => void handleRoleChange(member, role)}
                                        >
                                          {ROLE_META[role].label}
                                          {member.role === role && <Check className="ml-auto h-3.5 w-3.5" />}
                                        </DropdownMenuItem>
                                      ))}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2.5">
                                <span
                                  className={cn(
                                    'h-2 w-2 shrink-0 rounded-full',
                                    member.active ? 'bg-[#16A34A]' : 'bg-[#C6C9D4]',
                                  )}
                                />
                                <Switch
                                  checked={member.active}
                                  disabled={isSelf || updateUser.isPending}
                                  onCheckedChange={(checked) => void handleToggleActive(member, checked)}
                                  aria-label={`Toggle active for ${member.name}`}
                                />
                              </div>
                            </TableCell>
                            <TableCell className="px-6 text-[13px] text-muted-foreground">{formatDate(member.createdAt)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}

            <div className="border-t bg-[#FAFAFD] px-6 py-3 text-[13px] text-muted-foreground">
              The first registered account is the workspace owner.
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <NewUserDialog />

    </div>
  );
}
