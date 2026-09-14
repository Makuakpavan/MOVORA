import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ApiError } from '@/types/api';
import type { LoginPayload } from '@/types/auth';

export default function LoginPage() {
  useDocumentTitle('Sign in');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState<string | null>(null);

  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? '/favorites';

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginPayload>();

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await login(values);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          setError(field as keyof LoginPayload, { message });
        }
      }
      setFormError(
        error instanceof ApiError ? error.message : 'Sign in failed. Try again.',
      );
    }
  });

  return (
    <AuthShell
      title="Sign in"
      subtitle="Your favourites are waiting."
      footer={
        <>
          New here?{' '}
          <Link to="/register" className="text-accent-soft hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {formError && (
          <p
            role="alert"
            className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent-soft"
          >
            {formError}
          </p>
        )}

        <Field
          label="Email"
          type="email"
          autoComplete="email"
          icon={<Mail className="size-4" />}
          error={errors.email?.message}
          {...register('email', {
            required: 'Enter your email address.',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'That email looks incomplete.' },
          })}
        />

        <Field
          label="Password"
          type="password"
          autoComplete="current-password"
          icon={<Lock className="size-4" />}
          error={errors.password?.message}
          {...register('password', { required: 'Enter your password.' })}
        />

        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-14">
      <div className="rounded-panel border border-hairline bg-surface p-7 sm:p-8">
        <h1 className="text-2xl">{title}</h1>
        <p className="mb-6 mt-1.5 text-sm text-muted">{subtitle}</p>
        {children}
      </div>
      <p className="mt-5 text-center text-sm text-muted">{footer}</p>
    </div>
  );
}
