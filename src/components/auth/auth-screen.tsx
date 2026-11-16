// Young10 Marketing CRM - authentication screen (sign in / sign up)

'use client';

import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion, type MotionProps, type Variants } from 'framer-motion';
import { Eye, EyeOff, Loader2, Lock, Mail, User } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import { Logo, LogoMark } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLogin, useRegister } from '@/hooks/use-crm';

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

/** Subtle fade + rise entrance used across the screen (300-400ms, staggered by delay). */
function rise(delay = 0): MotionProps {
  return {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, ease: 'easeOut', delay },
  };
}

const formContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const formItem: Variants = {
  hidden: { opacity: 0, y: 12 },
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
    <div className="flex min-h-screen bg-white">
      {/* Left brand panel - desktop only, decorative pinwheel composition */}
      <aside className="ink-gradient relative hidden overflow-hidden lg:flex lg:w-[45%] lg:shrink-0">
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <div className="pinwheel-field absolute inset-0" />
          <div
            className="absolute left-1/2 top-1/2 size-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(56,75,254,0.35) 0%, rgba(56,75,254,0) 70%)' }}
          />
          <LogoMark size={380} className="absolute -right-24 -top-24 animate-spin-slow opacity-10" />
          <LogoMark size={230} className="absolute -left-14 bottom-[10%] animate-float-slow opacity-10 [animation-delay:-2.5s]" />
          <LogoMark size={150} className="absolute bottom-[30%] right-[16%] animate-float-slow opacity-[0.07] [animation-delay:-4.5s]" />
          <LogoMark size={110} className="absolute left-[16%] top-[24%] animate-spin-slow opacity-[0.06] [animation-delay:-8s]" />
        </motion.div>
        <motion.div {...rise(0.1)} className="relative z-10 p-8 xl:p-10">
          <Logo variant="white" size={40} />
        </motion.div>
      </aside>

      {/* Right panel - form column with sticky footer rule */}
      <div className="flex min-h-screen flex-1 flex-col bg-white">
        <motion.div {...rise(0)} className="ink-gradient flex items-center justify-center py-8 lg:hidden">
          <Logo variant="white" size={34} />
        </motion.div>

        <main className="flex flex-1 items-center justify-center px-6 py-12">
          <motion.div {...rise(0.05)} className="mx-auto w-full max-w-sm">
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={mode}
                variants={formContainer}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, y: -8, transition: { duration: 0.16, ease: 'easeIn' } }}
              >
                <motion.div variants={formItem}>
                  <LogoMark size={28} />
                  <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
                    {mode === 'login' ? 'Welcome back' : 'Create your account'}
                  </h1>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {mode === 'login' ? 'Sign in to your CRM workspace' : 'Join your CRM workspace'}
                  </p>
                </motion.div>

                <form noValidate onSubmit={handleSubmit} className="mt-8 space-y-5">
                  {mode === 'register' ? (
                    <motion.div variants={formItem} className="space-y-1.5">
                      <Label htmlFor="name">Full name</Label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="name"
                          type="text"
                          autoComplete="name"
                          value={name}
                          onChange={(e) => handleFieldChange('name', e.target.value)}
                          aria-invalid={Boolean(errors.name)}
                          className="pl-10"
                        />
                      </div>
                      {errors.name ? <p className="text-xs text-red-500">{errors.name}</p> : null}
                    </motion.div>
                  ) : null}

                  <motion.div variants={formItem} className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        aria-invalid={Boolean(errors.email)}
                        className="pl-10"
                      />
                    </div>
                    {errors.email ? <p className="text-xs text-red-500">{errors.email}</p> : null}
                  </motion.div>

                  <motion.div variants={formItem} className="space-y-1.5">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                        value={password}
                        onChange={(e) => handleFieldChange('password', e.target.value)}
                        aria-invalid={Boolean(errors.password)}
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={passwordToggleLabel}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {errors.password ? <p className="text-xs text-red-500">{errors.password}</p> : null}
                  </motion.div>

                  <motion.div variants={formItem}>
                    <Button type="submit" className="w-full" disabled={pending}>
                      {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
                      {mode === 'login' ? 'Sign In' : 'Create Account'}
                    </Button>
                  </motion.div>
                </form>

                <motion.p variants={formItem} className="mt-6 text-center text-sm text-muted-foreground">
                  {mode === 'login' ? 'New here? ' : 'Have an account? '}
                  <button
                    type="button"
                    onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                    className="font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    {mode === 'login' ? 'Create Account' : 'Sign In'}
                  </button>
                </motion.p>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </main>

        <footer className="mt-auto border-t border-border/70 px-6 py-5">
          <p className="text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Young10 Marketing</p>
        </footer>
      </div>
    </div>
  );
}
