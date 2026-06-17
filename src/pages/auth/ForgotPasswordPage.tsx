import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../shared/auth/useAuth';
import { AuthFlowLayout } from '../../components/auth/AuthFlowLayout';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setIsLoading(true);
    try {
      const result = await forgotPassword(email.trim());
      const debugHint = result.debugOtp
        ? ` Development code: ${result.debugOtp}`
        : '';
      setInfo(`Verification code sent. Check your email inbox.${debugHint}`);
      setTimeout(() => {
        navigate('/verify-otp', { state: { email: email.trim().toLowerCase(), debugOtp: result.debugOtp } });
      }, 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthFlowLayout
      step={1}
      icon={<Mail className="h-5 w-5 text-primary" />}
      title="Forgot your password?"
      description="Enter the email linked to your portal account. We will send a 6-digit verification code."
      footer={
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="flex w-full items-center justify-center gap-2 text-sm font-medium text-muted transition hover:text-body"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </button>
      }
    >
      {error ? (
        <div className="mb-5 flex items-center gap-2.5 rounded-sm border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      ) : null}

      {info ? (
        <div className="mb-5 rounded-sm border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {info}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-body">Email address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="email"
              className="h-11 w-full rounded-sm border border-base bg-surface pl-10 pr-4 text-sm text-body placeholder:text-muted transition focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:opacity-50"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              autoComplete="email"
            />
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
          {isLoading ? 'Sending code...' : 'Send verification code'}
        </button>
      </form>
    </AuthFlowLayout>
  );
};
