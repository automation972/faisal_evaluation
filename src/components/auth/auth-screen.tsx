// Young10 Marketing CRM - sign in / create account
// Design mirrors young10marketing.com: ink top bar, lavender wash,
// official wordmark, bold two-tone headline and a floating white card.

'use client';

import { useState, type FormEvent } from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Facebook,
  Instagram,
  Linkedin,
  Loader2,
  Lock,
  Mail,
  Phone,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import { Logo } from '@/components/brand/logo';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLogin, useRegister } from '@/hooks/use-crm';
import { cn } from '@/lib/utils';

type AuthMode = 'login' | 'register';

type FieldName = 'name' | 'email' | 'password';

type FieldErrors = Partial<Record<FieldName, string>>;

const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

/** One-click demo credentials (kept in sync with the database seed). */
const DEMO_ACCOUNTS = [
  { title: 'Admin', sub: 'Alex Carter', email: 'admin@young10marketing.com', password: 'Demo123!' },
  { title: 'Sarah', sub: 'Sales rep', email: 'sarah@young10marketing.com', password: 'Demo123!' },
  { title: 'Mike', sub: 'Sales rep', email: 'mike@young10marketing.com', password: 'Demo123!' },
];

const formContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const formItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

function collectFieldErrors(error: z.ZodError): FieldErrors {
  const next: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? '');
    if ((key === 'name' || key === 'email' || key === 'password') && !next[key]) {
      next[key] = issue.message;
    }
  }
  return next;
}

export default function AuthScreen() {
  const login = useLogin();
  const register = useRegister();

  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const pending = login.isPending || register.isPending;

  function handleFieldChange(field: FieldName, value: string) {
    if (field === 'name') setName(value);
    else if (field === 'email') setEmail(value);
    else setPassword(value);
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function autofillDemo(account: (typeof DEMO_ACCOUNTS)[number]) {
    setMode('login');
    setEmail(account.email);
    setPassword(account.password);
    setErrors({});
  }

  function switchMode(next: AuthMode) {
    if (next === mode) return;
    setMode(next);
    setErrors({});
  }

  function showError(err: unknown, currentMode: AuthMode) {
    const message = err instanceof Error && err.message ? err.message : '';
    toast.error(message || (currentMode === 'login' ? 'Invalid email or password' : 'Could not create your account'));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (mode === 'login') {
      const parsed = loginSchema.safeParse({ email, password });
      if (!parsed.success) {
        setErrors(collectFieldErrors(parsed.error));
        return;
      }
      setErrors({});
      try {
        await login.mutateAsync({ email: parsed.data.email, password: parsed.data.password });
      } catch (err) {
        showError(err, 'login');
      }
      return;
    }

    const parsed = registerSchema.safeParse({ name, email, password });
    if (!parsed.success) {
      setErrors(collectFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    try {
      await register.mutateAsync({
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
      });
    } catch (err) {
      showError(err, 'register');
    }
  }

  const passwordToggleLabel = showPassword ? 'Hide password' : 'Show password';

  return (
    <div className="flex min-h-screen flex-col bg-[#FBFBFE]">
      {/* Ink contact bar - identical to the site header chrome */}
      <header className="ink-gradient flex h-11 shrink-0 items-center justify-between px-4 text-[12.5px] text-white/90 md:px-8">
        <div className="flex items-center gap-6">
          <a
            href="mailto:alex@young10marketing.com"
            className="flex items-center gap-2 transition-colors hover:text-white"
          >
            <Mail className="h-3.5 w-3.5 text-white/70" aria-hidden="true" />
            <span className="hidden sm:inline">alex@young10marketing.com</span>
            <span className="sm:hidden">Email</span>
          </a>
          <a href="tel:+12708444916" className="hidden items-center gap-2 transition-colors hover:text-white md:flex">
            <Phone className="h-3.5 w-3.5 text-white/70" aria-hidden="true" />
            +1 270-844-4916
          </a>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-white/70 sm:inline">Follow Us</span>
          <div className="flex items-center gap-1.5">
            {[Facebook, Instagram, Linkedin].map((Icon, i) => (
              <span
                key={i}
                className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-primary text-white"
              >
                <Icon className="h-3 w-3" aria-hidden="true" />
              </span>
            ))}
          </div>
        </div>
      </header>

      <main className="auth-wash relative flex-1 overflow-hidden">
        {/* Quiet geometry - thin arcs and dots, echoing the site hero */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -left-36 -top-44 h-[480px] w-[480px] rounded-full border border-[#384BFE]/12" />
          <div className="absolute -left-24 -top-32 h-[360px] w-[360px] rounded-full border border-[#384BFE]/10" />
          <div className="absolute -bottom-52 -right-40 h-[520px] w-[520px] rounded-full border border-[#384BFE]/10" />
          <div className="absolute left-[46%] top-16 h-3 w-3 rounded-full border-2 border-red-500/60" />
          <div className="absolute right-[38%] top-[46%] h-2 w-2 rounded-full bg-[#384BFE]/50" />
          <div className="absolute left-[42%] bottom-14 h-1.5 w-1.5 rounded-full bg-[#384BFE]/40" />
        </div>

        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-12 md:px-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-20">
          {/* Brand column */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <Logo height={46} className="hidden lg:inline-flex" />
            <div className="mt-12 flex items-center gap-3 lg:mt-14">
              <span className="h-[3px] w-9 rounded-full bg-primary" aria-hidden="true" />
              <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-primary">
                Your growth, in focus
              </p>
            </div>
            <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl xl:text-[56px]">
              Professional
              <br />
              marketing.
              <br />
              <span className="text-primary">Personal</span> connections.
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              Keep every opportunity moving. Sign in to manage your leads, relationships, and next
              steps&mdash;all in one place.
            </p>
          </motion.div>

          {/* Card column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08, ease: 'easeOut' }}
            className="w-full max-w-[460px] justify-self-center"
          >
            <div className="card-float rounded-2xl border border-white/70 bg-white px-7 py-8 sm:px-9 sm:py-9">
              <Logo height={38} className="lg:hidden" />

              <motion.div
                key={mode}
                variants={formContainer}
                initial="hidden"
                animate="show"
                className="mt-6 lg:mt-0"
              >
                <motion.p
                  variants={formItem}
                  className="text-[12px] font-bold uppercase tracking-[0.18em] text-primary"
                >
                  {mode === 'login' ? 'Welcome back' : 'Join the team'}
                </motion.p>
                <motion.h2 variants={formItem} className="mt-2 text-[27px] font-bold tracking-tight text-foreground">
                  {mode === 'login' ? 'Sign in to your CRM' : 'Create your account'}
                </motion.h2>
                <motion.p variants={formItem} className="mt-1.5 text-sm text-muted-foreground">
                  {mode === 'login'
                    ? 'Enter your details to access your workspace.'
                    : 'Set up your rep account in seconds.'}
                </motion.p>

                <form noValidate onSubmit={handleSubmit} className="mt-7 space-y-4">
                  {mode === 'register' ? (
                    <motion.div variants={formItem} className="space-y-1.5">
                      <Label htmlFor="name" className="text-[13px] font-semibold text-foreground">
                        Full name
                      </Label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                        <Input
                          id="name"
                          type="text"
                          autoComplete="name"
                          placeholder="Jordan Blake"
                          value={name}
                          onChange={(e) => handleFieldChange('name', e.target.value)}
                          aria-invalid={Boolean(errors.name)}
                          className="h-12 rounded-[10px] border-transparent bg-[#F1F3FA] pl-10 text-[15px] transition-colors focus-visible:bg-white focus-visible:border-[#384BFE]/50 focus-visible:ring-4 focus-visible:ring-[#384BFE]/10"
                        />
                      </div>
                      {errors.name ? <p className="text-xs text-red-500">{errors.name}</p> : null}
                    </motion.div>
                  ) : null}

                  <motion.div variants={formItem} className="space-y-1.5">
                    <Label htmlFor="email" className="text-[13px] font-semibold text-foreground">
                      Email address
                    </Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@young10marketing.com"
                        value={email}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        aria-invalid={Boolean(errors.email)}
                        className="h-12 rounded-[10px] border-transparent bg-[#F1F3FA] pl-10 text-[15px] transition-colors focus-visible:bg-white focus-visible:border-[#384BFE]/50 focus-visible:ring-4 focus-visible:ring-[#384BFE]/10"
                      />
                    </div>
                    {errors.email ? <p className="text-xs text-red-500">{errors.email}</p> : null}
                  </motion.div>

                  <motion.div variants={formItem} className="space-y-1.5">
                    <Label htmlFor="password" className="text-[13px] font-semibold text-foreground">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => handleFieldChange('password', e.target.value)}
                        aria-invalid={Boolean(errors.password)}
                        className="h-12 rounded-[10px] border-transparent bg-[#F1F3FA] pl-10 pr-10 text-[15px] transition-colors focus-visible:bg-white focus-visible:border-[#384BFE]/50 focus-visible:ring-4 focus-visible:ring-[#384BFE]/10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={passwordToggleLabel}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password ? <p className="text-xs text-red-500">{errors.password}</p> : null}
                  </motion.div>

                  <motion.div variants={formItem} className="pt-1.5">
                    <button
                      type="submit"
                      disabled={pending}
                      className={cn(
                        'brand-shadow flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-primary text-[15px] font-semibold text-white',
                        'transition-all hover:bg-[#2B3AD1] active:scale-[0.99]',
                        'disabled:cursor-not-allowed disabled:opacity-70',
                      )}
                    >
                      {pending ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : null}
                      {mode === 'login' ? 'Sign In' : 'Create Account'}
                      {pending ? null : <ArrowRight className="h-4 w-4" aria-hidden="true" />}
                    </button>
                  </motion.div>
                </form>

                {mode === 'login' ? (
                  <motion.div variants={formItem}>
                    <div className="mt-7 flex items-center gap-4" aria-hidden="true">
                      <span className="h-px flex-1 bg-border" />
                      <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                        Demo access
                      </span>
                      <span className="h-px flex-1 bg-border" />
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2.5" role="group" aria-label="Demo accounts - click to autofill">
                      {DEMO_ACCOUNTS.map((account) => (
                        <button
                          key={account.email}
                          type="button"
                          onClick={() => autofillDemo(account)}
                          title={`Autofill ${account.email}`}
                          className="group rounded-xl border border-border bg-white px-2 py-3 text-center transition-all hover:-translate-y-0.5 hover:border-[#384BFE]/50 hover:bg-[#F7F8FF] hover:shadow-[0_10px_20px_-10px_rgba(56,75,254,0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#384BFE]"
                        >
                          <span className="block text-[13px] font-bold text-foreground transition-colors group-hover:text-primary">
                            {account.title}
                          </span>
                          <span className="mt-0.5 block text-[11px] text-muted-foreground">{account.sub}</span>
                        </button>
                      ))}
                    </div>
                    <p className="mt-3.5 text-center text-xs text-muted-foreground">
                      Demo password: <span className="font-semibold text-foreground">Demo123!</span>
                    </p>
                  </motion.div>
                ) : null}

                <motion.p variants={formItem} className="mt-6 text-center text-sm text-muted-foreground">
                  {mode === 'login' ? 'New to the team? ' : 'Already have an account? '}
                  <button
                    type="button"
                    onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                    className="font-semibold text-primary transition-colors hover:text-[#2B3AD1]"
                  >
                    {mode === 'login' ? 'Create an account' : 'Sign in'}
                  </button>
                </motion.p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="shrink-0 border-t border-border/70 bg-white/60 px-6 py-4 md:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between text-xs text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} <span className="font-semibold text-foreground">Young10 Marketing</span>
          </p>
          <p className="hidden sm:block">Professional Digital Marketing Agency &middot; Sheridan, WY</p>
        </div>
      </footer>
    </div>
  );
}
