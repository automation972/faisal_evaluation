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
const UNDERLINE_TRIGGER =
  'h-auto rounded-none border-b-2 border-transparent bg-transparent px-1 pb-3 pt-2 shadow-none data-[state=active]:border-[#384BFE] data-[state=active]:bg-transparent data-[state=active]:shadow-none';

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
      <DialogHeader>
        <DialogTitle>Add Member</DialogTitle>
        <DialogDescription>Create an account for a new teammate.</DialogDescription>
      </DialogHeader>
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
      >
        <div className="grid gap-1.5">
          <Label htmlFor="new-user-name">Name</Label>
          <Input
            id="new-user-name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            placeholder="Jordan Smith"
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="new-user-email">Email</Label>
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
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="new-user-password">Password</Label>
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
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>

        <div className="grid gap-1.5">
          <Label>Role</Label>
          <div className="flex h-9 items-center rounded-md border bg-muted/50 px-3 text-sm text-muted-foreground">
            Sales Rep
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={close} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
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
      <DialogContent className="sm:max-w-md">
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
        <DialogHeader>
          <DialogTitle>Key created</DialogTitle>
          <DialogDescription>Copy the full key now. It is shown only once.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 rounded-md border bg-muted/60 p-3">
          <code className="min-w-0 flex-1 select-all break-all font-mono text-xs">{createdKey.key}</code>
          <Button type="button" variant="outline" size="sm" onClick={() => void copyText(createdKey.key)}>
            <Copy />
            Copy
          </Button>
        </div>
        <div className="rounded-md bg-[#FEF3DF] px-3 py-2.5 text-xs text-[#92610A]">
          Save this key securely — it authenticates your integrations.
        </div>
        <DialogFooter>
          <Button type="button" onClick={close}>
            Done
          </Button>
        </DialogFooter>
      </>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create API Key</DialogTitle>
        <DialogDescription>Name the key after the integration that will use it.</DialogDescription>
      </DialogHeader>
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
      >
        <div className="grid gap-1.5">
          <Label htmlFor="api-key-name">Name</Label>
          <Input
            id="api-key-name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (nameError) setNameError(false);
            }}
            placeholder="Website contact form"
            aria-invalid={nameError}
          />
          {nameError && <p className="text-xs text-destructive">Key name is required.</p>}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={close} disabled={createApiKey.isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={createApiKey.isPending}>
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
      <DialogContent className="sm:max-w-md">
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
          <ShieldAlert className="h-10 w-10 text-[#DC2626]" />
          <div>
            <h2 className="text-lg font-semibold">Admins only</h2>
            <p className="mt-1 text-sm text-muted-foreground">
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
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#384BFE]">ADMINISTRATION</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Admin Console</h1>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="h-auto w-full justify-start gap-6 rounded-none border-b bg-transparent p-0">
          <TabsTrigger value="team" className={UNDERLINE_TRIGGER}>
            Team
          </TabsTrigger>
          <TabsTrigger value="api-keys" className={UNDERLINE_TRIGGER}>
            API Keys
          </TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="mt-4">
          <Card className="card-shadow gap-0 overflow-hidden py-0">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-sm font-semibold">Members</h2>
                <p className="text-xs text-muted-foreground">Manage roles and access for your workspace.</p>
              </div>
              <Button size="sm" onClick={openNewUserDialog}>
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
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6">Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="px-6">Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(members ?? []).map((member) => {
                    const isSelf = member.id === user.id;
                    return (
                      <TableRow key={member.id}>
                        <TableCell className="px-6">
                          <div className="flex items-center gap-3">
                            <UserAvatar name={member.name} />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="truncate text-sm font-medium">{member.name}</span>
                                {isSelf && (
                                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
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
                                'border-transparent font-medium',
                                member.role === 'ADMIN'
                                  ? 'bg-[#384BFE] text-white'
                                  : 'bg-[#EAEFFF] text-[#384BFE]',
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
                          <Switch
                            checked={member.active}
                            disabled={isSelf || updateUser.isPending}
                            onCheckedChange={(checked) => void handleToggleActive(member, checked)}
                            aria-label={`Toggle active for ${member.name}`}
                          />
                        </TableCell>
                        <TableCell className="px-6 text-muted-foreground">{formatDate(member.createdAt)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}

            <div className="border-t px-6 py-3 text-xs text-muted-foreground">
              The first registered account is the workspace owner.
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys" className="mt-4 flex flex-col gap-4">
          <Card className="card-shadow gap-0 overflow-hidden border-[#384BFE]/20 bg-[#EAEFFF]/60 py-0">
            <div className="p-4">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-[#384BFE]" />
                <h2 className="text-sm font-semibold">External Lead Capture API</h2>
              </div>
              <p className="mt-1.5 text-sm text-[#26309C]/80">
                Push leads from website forms and landing pages straight into the pipeline. Send a POST request to{' '}
                <code className="rounded bg-white/70 px-1 py-0.5 font-mono text-xs">POST /api/v1/leads/ingest</code>{' '}
                with an{' '}
                <code className="rounded bg-white/70 px-1 py-0.5 font-mono text-xs">x-api-key</code> header. The JSON
                body accepts firstName, lastName, email, phone, company, source, notes and value. Rate limit: 30
                requests per minute.
              </p>
              <div className="relative mt-3">
                <pre
                  className="overflow-x-auto rounded-lg p-3 pr-16 font-mono text-xs leading-relaxed text-[#E6E8F2]"
                  style={{ backgroundColor: '#0F0D1D' }}
                >
                  {CURL_SNIPPET}
                </pre>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 h-7 gap-1.5 px-2 text-[#E6E8F2] hover:bg-white/10 hover:text-white"
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
                <h2 className="text-sm font-semibold">API Keys</h2>
                <p className="text-xs text-muted-foreground">Keys authenticate server-to-server lead ingestion.</p>
              </div>
              <Button size="sm" onClick={openApiKeyDialog}>
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
              <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
                <KeyRound className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm font-medium">No API keys yet</p>
                <p className="text-xs text-muted-foreground">
                  Create a key to start receiving leads from your website forms.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6">Name</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last used</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="px-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(apiKeys ?? []).map((apiKey) => {
                    const isRevealed = revealed[apiKey.id] ?? false;
                    return (
                      <TableRow key={apiKey.id}>
                        <TableCell className="px-6">
                          <div className="text-sm font-medium">{apiKey.name}</div>
                          <div className="font-mono text-xs text-muted-foreground">{apiKey.prefix}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <code className="max-w-[180px] truncate font-mono text-xs text-muted-foreground">
                              {isRevealed ? apiKey.key : `${apiKey.prefix}${KEY_MASK_SUFFIX}`}
                            </code>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              aria-label={isRevealed ? 'Hide key' : 'Reveal key'}
                              onClick={() =>
                                setRevealed((prev) => ({ ...prev, [apiKey.id]: !isRevealed }))
                              }
                            >
                              {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
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
                              'border-transparent font-medium',
                              apiKey.active ? 'bg-[#E4F7EC] text-[#166534]' : 'bg-[#FDE7E7] text-[#DC2626]',
                            )}
                          >
                            {apiKey.active ? 'Active' : 'Revoked'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {apiKey.lastUsedAt ? formatRelative(apiKey.lastUsedAt) : 'Never'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(apiKey.createdAt)}</TableCell>
                        <TableCell className="px-6 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Key actions">
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API key</AlertDialogTitle>
            <AlertDialogDescription>
              Integrations using {revoking ? `"${revoking.name}"` : 'this key'} will stop receiving leads immediately.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
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
