import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Lock, AlertCircle, Check, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../shared/auth/useAuth';
import { AuthFlowLayout } from '../../components/auth/AuthFlowLayout';

function getStrength(pw: string): number {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const strengthMeta = [
  null,
  { label: 'Weak', bar: 'bg-red-500', text: 'text-red-600' },
  { label: 'Fair', bar: 'bg-orange-500', text: 'text-orange-600' },
  { label: 'Good', bar: 'bg-blue-500', text: 'text-blue-600' },
  { label: 'Strong', bar: 'bg-green-500', text: 'text-green-600' },
];

const requirements = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
  { label: 'One special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPassword } = useAuth();

  const state = location.state as { email?: string; resetToken?: string } | null;
  const email = state?.email ?? '';
  const resetToken = state?.resetToken ?? '';

  if (!email || !resetToken) {
    return <Navigate to="/forgot-password" replace />;
  }

  const strength = getStrength(password);
  const meta = strengthMeta[strength];
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await resetPassword(email, resetToken, password);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <AuthFlowLayout
        step={3}
        icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
        title="Password reset complete"
        description="Your password has been updated. Sign in with your new password to continue."
      >
        <div className="flex flex-col items-center py-4 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
          <button
            type="button"
            onClick={() => navigate('/login', { replace: true })}
            className="h-11 w-full rounded-sm bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark"
          >
            Go to sign in
          </button>
        </div>
      </AuthFlowLayout>
    );
  }

  return (
    <AuthFlowLayout
      step={3}
      icon={<Lock className="h-5 w-5 text-primary" />}
      title="Create a new password"
      description="Choose a strong password for your portal account."
    >
      {error ? (
        <div className="mb-5 flex items-center gap-2.5 rounded-sm border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-body">New password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="password"
              className="h-11 w-full rounded-sm border border-base bg-surface pl-10 pr-4 text-sm text-body placeholder:text-muted transition focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:opacity-50"
              placeholder="Create a new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              autoComplete="new-password"
            />
          </div>

          {password && meta ? (
            <div className="mt-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      strength >= level ? meta.bar : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
              <p className={`mt-1 text-xs ${meta.text}`}>{meta.label} password</p>
            </div>
          ) : null}

          {password ? (
            <div className="mt-3 space-y-1.5">
              {requirements.map(({ label, test }) => (
                <div key={label} className="flex items-center gap-2">
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                      test(password) ? 'bg-green-100' : 'bg-slate-100'
                    }`}
                  >
                    <Check
                      className={`h-2.5 w-2.5 ${test(password) ? 'text-green-600' : 'text-slate-300'}`}
                    />
                  </div>
                  <span className={`text-xs ${test(password) ? 'text-green-700' : 'text-slate-400'}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-body">Confirm new password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="password"
              className={`h-11 w-full rounded-sm border bg-surface pl-10 pr-10 text-sm text-body placeholder:text-muted transition focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:opacity-50 ${
                passwordsMatch ? 'border-green-400' : passwordsMismatch ? 'border-red-400' : 'border-base'
              }`}
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
              autoComplete="new-password"
            />
            {passwordsMatch ? (
              <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
            ) : null}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-sm bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
          ) : null}
          {isLoading ? 'Resetting password...' : 'Reset password'}
        </button>
      </form>
    </AuthFlowLayout>
  );
};
