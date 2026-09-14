import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User } from 'lucide-react';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { AuthShell } from './LoginPage';
import { useAuth } from '@/hooks/useAuth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ApiError } from '@/types/api';
import type { RegisterPayload } from '@/types/auth';

interface RegisterForm extends RegisterPayload {
  confirmPassword: string;
}

export default function RegisterPage() {
  useDocumentTitle('Create account');

  const { register: signUp } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>();

  const password = watch('password');

  const onSubmit = handleSubmit(async ({ confirmPassword: _ignored, ...values }) => {
    setFormError(null);
    try {
      await signUp(values);
      navigate('/favorites', { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          setError(field as keyof RegisterForm, { message });
        }
      }
      setFormError(
        error instanceof ApiError
          ? error.message
          : "We couldn't create that account. Try again.",
      );
    }
  });

  return (
    <AuthShell
      title="Create your account"
      subtitle="Save films to a watchlist you can come back to."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="text-accent-soft hover:underline">
            Sign in
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
          label="Name"
          autoComplete="name"
          icon={<User className="size-4" />}
          error={errors.name?.message}
          {...register('name', {
            required: 'Enter your name.',
            minLength: { value: 2, message: 'Use at least 2 characters.' },
          })}
        />

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
          autoComplete="new-password"
          hint="At least 8 characters."
          icon={<Lock className="size-4" />}
          error={errors.password?.message}
          {...register('password', {
            required: 'Choose a password.',
            minLength: { value: 8, message: 'Use at least 8 characters.' },
          })}
        />

        <Field
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          icon={<Lock className="size-4" />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Repeat your password.',
            validate: (value) => value === password || "Passwords don't match.",
          })}
        />

        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}
