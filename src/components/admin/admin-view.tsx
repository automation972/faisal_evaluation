// Young10 Marketing CRM - admin console (team management + API keys)

'use client';

import { useState, type FormEvent } from 'react';
import {
  Check,
  ChevronDown,
  Copy,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  Loader2,
  MoreVertical,
  ShieldAlert,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';

import type { SafeApiKey, SafeUser } from '@/types';
import {
  useApiKeys,
  useCreateApiKey,
  useCreateUser,
  useRevokeApiKey,
  useUpdateUser,
  useUsers,
} from '@/hooks/use-crm';
import { useCrmStore } from '@/store/crm-store';
import { UserAvatar, formatDate, formatRelative } from '@/components/shared/badges';
import { ROLE_META, type UserRoleValue } from '@/lib/constants';
import { cn } from '@/lib/utils';
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

const CURL_SNIPPET = [
  'curl -X POST https://your-domain.com/api/v1/leads/ingest \\',
  '  -H "Content-Type: application/json" \\',
  '  -H "x-api-key: y10_xxxxxxxxxxxxxxxx" \\',
  `  -d '{"firstName":"Jane","lastName":"Doe","email":"jane@example.com","phone":"+1 555 010 1234","company":"Acme Inc","source":"WEBSITE","notes":"Submitted from the contact form","value":1500}'`,
].join('\n');

const KEY_MASK_SUFFIX = '••••••••••••';
const SEGMENT_TRIGGER =
  'h-7 rounded-[7px] border-transparent px-4 text-[13px] font-medium text-[#5F6274] shadow-none hover:bg-[#F4F5FA] data-[state=active]:bg-[#EEF0FF] data-[state=active]:font-semibold data-[state=active]:text-primary data-[state=active]:shadow-none';

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success('Copied');
  } catch {
    toast.error('Unable to copy to clipboard');
  }
}

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

/** Mounted only while the dialog is open, so form state resets on every open. */
function CreateKeyForm({ close }: { close: () => void }) {
  const createApiKey = useCreateApiKey();

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState(false);
  const [createdKey, setCreatedKey] = useState<SafeApiKey | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);
    try {
      const key = await createApiKey.mutateAsync({ name: name.trim() });
      setCreatedKey(key);
    } catch {
      toast.error('Failed to create key');
    }
  };

  if (createdKey) {
    return (
      <>
        <DialogHeader className="gap-1 border-b px-6 py-5">
          <DialogTitle className="text-[15px] font-bold tracking-tight">Key created</DialogTitle>
          <DialogDescription className="text-[13px] text-muted-foreground">
            Copy the full key now. It is shown only once.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 px-6 py-5">
          <div className="flex items-center gap-2 rounded-[10px] border border-border bg-[#F8F9FC] p-3">
            <code className="min-w-0 flex-1 select-all break-all rounded-md bg-muted px-2 py-1 font-mono text-[12.5px] text-foreground">
              {createdKey.key}
            </code>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 rounded-[10px] border-border bg-white font-semibold hover:bg-[#F4F5FA]"
              onClick={() => void copyText(createdKey.key)}
            >
              <Copy />
              Copy
            </Button>
          </div>
          <div className="rounded-[10px] bg-[#FEF3DF] px-3 py-2.5 text-[13px] font-medium text-[#92610A]">
            Save this key securely — it authenticates your integrations.
          </div>
        </div>
        <DialogFooter className="flex flex-col-reverse gap-2 border-t bg-[#FAFAFD] px-6 py-4 sm:flex-row sm:justify-end sm:gap-3">
          <Button
            type="button"
            onClick={close}
            className="rounded-[10px] bg-primary font-semibold text-white hover:bg-[#2B3AD1]"
          >
            Done
          </Button>
        </DialogFooter>
      </>
    );
  }

  return (
    <>
      <DialogHeader className="gap-1 border-b px-6 py-5">
        <DialogTitle className="text-[15px] font-bold tracking-tight">Create API Key</DialogTitle>
        <DialogDescription className="text-[13px] text-muted-foreground">
          Name the key after the integration that will use it.
        </DialogDescription>
      </DialogHeader>
      <form
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
      >
        <div className="space-y-4 px-6 py-5">
          <div className="grid gap-1.5">
            <Label htmlFor="api-key-name" className="text-[13px] font-semibold">
              Name
            </Label>
            <Input
              id="api-key-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (nameError) setNameError(false);
              }}
              placeholder="Website contact form"
              aria-invalid={nameError}
              className="h-10 rounded-[10px] border-border bg-white text-[13px]"
            />
            {nameError && <p className="text-xs text-destructive">Key name is required.</p>}
          </div>
        </div>
        <DialogFooter className="flex flex-col-reverse gap-2 border-t bg-[#FAFAFD] px-6 py-4 sm:flex-row sm:justify-end sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={close}
            disabled={createApiKey.isPending}
            className="rounded-[10px] border-border bg-white font-semibold hover:bg-[#F4F5FA]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createApiKey.isPending}
            className="rounded-[10px] bg-primary font-semibold text-white hover:bg-[#2B3AD1]"
          >
            {createApiKey.isPending && <Loader2 className="animate-spin" />}
            Create Key
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

function CreateKeyDialog() {
  const apiKeyDialogOpen = useCrmStore((s) => s.apiKeyDialogOpen);
  const closeApiKeyDialog = useCrmStore((s) => s.closeApiKeyDialog);

  return (
    <Dialog
      open={apiKeyDialogOpen}
      onOpenChange={(open) => {
        if (!open) closeApiKeyDialog();
      }}
    >
      <DialogContent className="gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-md">
        {apiKeyDialogOpen && <CreateKeyForm close={closeApiKeyDialog} />}
      </DialogContent>
    </Dialog>
  );
}

export default function AdminView({ user }: { user: SafeUser }) {
  const openNewUserDialog = useCrmStore((s) => s.openNewUserDialog);
  const openApiKeyDialog = useCrmStore((s) => s.openApiKeyDialog);

  const [tab, setTab] = useState('team');
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [revoking, setRevoking] = useState<SafeApiKey | null>(null);

  const { data: members, isLoading: membersLoading } = useUsers({ includeInactive: true });
  const { data: apiKeys, isLoading: keysLoading } = useApiKeys();
  const updateUser = useUpdateUser();
  const revokeApiKey = useRevokeApiKey();

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

  const handleRevoke = async () => {
    if (!revoking) return;
    try {
      await revokeApiKey.mutateAsync(revoking.id);
      toast.success('API key revoked');
    } catch {
      toast.error('Failed to revoke key');
    } finally {
      setRevoking(null);
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
          <TabsTrigger value="api-keys" className={SEGMENT_TRIGGER}>
            API Keys
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
            )}

            <div className="border-t bg-[#FAFAFD] px-6 py-3 text-[13px] text-muted-foreground">
              The first registered account is the workspace owner.
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys" className="mt-5 flex flex-col gap-5">
          <Card className="card-shadow gap-0 overflow-hidden py-0">
            <div className="p-5">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <h2 className="text-[15px] font-bold tracking-tight">External Lead Capture API</h2>
              </div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                Push leads from website forms and landing pages straight into the pipeline. Send a POST request to{' '}
                <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[12px] text-foreground">POST /api/v1/leads/ingest</code>{' '}
                with an{' '}
                <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[12px] text-foreground">x-api-key</code> header. The JSON
                body accepts firstName, lastName, email, phone, company, source, notes and value. Rate limit: 30
                requests per minute.
              </p>
              <div className="relative mt-3">
                <pre className="overflow-x-auto rounded-[10px] border border-border bg-[#F8F9FC] p-3 pr-16 font-mono text-[12.5px] leading-relaxed text-foreground">
                  {CURL_SNIPPET}
                </pre>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="absolute right-2 top-2 h-7 gap-1.5 rounded-[10px] border-border bg-white px-2 text-[12px] font-semibold text-muted-foreground shadow-none hover:bg-[#F4F5FA] hover:text-foreground"
                  onClick={() => void copyText(CURL_SNIPPET)}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </Button>
              </div>
            </div>
          </Card>

          <Card className="card-shadow gap-0 overflow-hidden py-0">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-[15px] font-bold tracking-tight">API Keys</h2>
                <p className="text-[13px] text-muted-foreground">Keys authenticate server-to-server lead ingestion.</p>
              </div>
              <Button
                size="sm"
                onClick={openApiKeyDialog}
                className="rounded-[10px] bg-primary font-semibold text-white hover:bg-[#2B3AD1]"
              >
                <KeyRound />
                Create Key
              </Button>
            </div>

            {keysLoading ? (
              <div className="space-y-3 px-6 py-5">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))}
              </div>
            ) : (apiKeys ?? []).length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF0FF]">
                  <KeyRound className="h-6 w-6 text-primary" />
                </span>
                <p className="text-[15px] font-bold tracking-tight">No API keys yet</p>
                <p className="text-[13px] text-muted-foreground">
                  Create a key to start receiving leads from your website forms.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-[#F8F9FC]">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-6 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      Name
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      Key
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      Last used
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      Created
                    </TableHead>
                    <TableHead className="px-6 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(apiKeys ?? []).map((apiKey) => {
                    const isRevealed = revealed[apiKey.id] ?? false;
                    return (
                      <TableRow key={apiKey.id} className="hover:bg-[#F7F8FC]">
                        <TableCell className="px-6">
                          <div className="text-sm font-semibold">{apiKey.name}</div>
                          <code className="mt-1 inline-block rounded-md bg-muted px-2 py-1 font-mono text-[12.5px] text-muted-foreground">
                            {apiKey.prefix}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <code className="max-w-[180px] truncate rounded-md bg-muted px-2 py-1 font-mono text-[12.5px] text-foreground">
                              {isRevealed ? apiKey.key : `${apiKey.prefix}${KEY_MASK_SUFFIX}`}
                            </code>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 rounded-[10px] border-border bg-white text-muted-foreground shadow-none hover:bg-[#F4F5FA] hover:text-foreground"
                              aria-label={isRevealed ? 'Hide key' : 'Reveal key'}
                              onClick={() =>
                                setRevealed((prev) => ({ ...prev, [apiKey.id]: !isRevealed }))
                              }
                            >
                              {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 rounded-[10px] border-border bg-white text-muted-foreground shadow-none hover:bg-[#F4F5FA] hover:text-foreground"
                              aria-label="Copy key"
                              onClick={() => void copyText(apiKey.key)}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              'border-transparent font-semibold',
                              apiKey.active ? 'bg-[#E4F7EC] text-[#166534]' : 'bg-[#FDE7E7] text-[#DC2626]',
                            )}
                          >
                            {apiKey.active ? 'Active' : 'Revoked'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[13px] text-muted-foreground">
                          {apiKey.lastUsedAt ? formatRelative(apiKey.lastUsedAt) : 'Never'}
                        </TableCell>
                        <TableCell className="text-[13px] text-muted-foreground">{formatDate(apiKey.createdAt)}</TableCell>
                        <TableCell className="px-6 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:bg-[#F4F5FA] hover:text-foreground"
                                aria-label="Key actions"
                              >
                                <MoreVertical className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                variant="destructive"
                                disabled={!apiKey.active}
                                onSelect={() => setRevoking(apiKey)}
                              >
                                Revoke
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <NewUserDialog />
      <CreateKeyDialog />

      <AlertDialog open={revoking !== null} onOpenChange={(open) => { if (!open) setRevoking(null); }}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold tracking-tight">Revoke API key</AlertDialogTitle>
            <AlertDialogDescription>
              Integrations using {revoking ? `"${revoking.name}"` : 'this key'} will stop receiving leads immediately.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-[10px] border-border bg-white font-semibold hover:bg-[#F4F5FA]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-[10px] bg-[#DC2626] font-semibold text-white hover:bg-[#B91C1C]"
              onClick={() => void handleRevoke()}
            >
              Revoke Key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
