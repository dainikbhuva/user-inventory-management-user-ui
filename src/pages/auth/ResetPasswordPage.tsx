import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, Check, CheckCircle2 } from 'lucide-react';

function getStrength(pw: string): number {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
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

  const strength = getStrength(password);
  const meta = strengthMeta[strength];
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (strength < 2) { setError('Please choose a stronger password.'); return; }
    setError('');
    setIsLoading(true);
    try {
      // TODO: call your API to reset password with state.email + state.otp + new password
      await new Promise((res) => setTimeout(res, 1200));
      setSuccess(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <div className="flex items-center gap-2 mb-10 justify-center">
            <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">U</span>
            </div>
            <span className="text-body font-semibold tracking-tight">UserPortal</span>
          </div>

          <div className="w-16 h-16 bg-green-50 border border-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>

          <h2 className="text-2xl font-bold text-body mb-2">Password reset!</h2>
          <p className="text-muted text-sm mb-8 leading-relaxed">
            Your password has been successfully reset. You can now sign in with your new password.
          </p>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full h-11 bg-primary hover:bg-primary-dark text-primary-foreground font-semibold text-sm rounded-sm transition-colors cursor-pointer"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">U</span>
          </div>
          <span className="text-body font-semibold tracking-tight">UserPortal</span>
        </div>

        {/* Icon */}
        <div className="w-12 h-12 bg-primary-soft border border-primary-soft rounded-sm flex items-center justify-center mb-6">
          <Lock className="w-5 h-5 text-primary" />
        </div>

        <h2 className="text-2xl font-bold text-body mb-1">Set new password</h2>
        <p className="text-muted text-sm mb-7 leading-relaxed">
          Create a strong password for your account.
        </p>

        {error && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-sm px-4 py-3 mb-5">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New password */}
          <div>
            <label className="block text-sm font-medium text-body mb-1.5">New password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="password"
                className="w-full h-11 pl-10 pr-4 bg-surface border border-base rounded-sm text-body text-sm placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all disabled:opacity-50"
                placeholder="Create a new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="new-password"
              />
            </div>

            {/* Strength indicator */}
            {password && meta && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full ${strength >= i ? meta.bar : 'bg-slate-200'} transition-colors`}
                    />
                  ))}
                </div>
                <p className={`text-xs mt-1 ${meta.text}`}>{meta.label} password</p>
              </div>
            )}

            {/* Requirements checklist */}
            {password && (
              <div className="mt-3 space-y-1.5">
                {requirements.map(({ label, test }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${test(password) ? 'bg-green-100' : 'bg-slate-100'}`}>
                      <Check className={`w-2.5 h-2.5 ${test(password) ? 'text-green-600' : 'text-slate-300'}`} />
                    </div>
                    <span className={`text-xs ${test(password) ? 'text-green-700' : 'text-slate-400'}`}>{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-sm font-medium text-body mb-1.5">Confirm new password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="password"
                className={`w-full h-11 pl-10 pr-10 bg-surface border rounded-sm text-body text-sm placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all disabled:opacity-50 ${
                  passwordsMatch ? 'border-green-400' : passwordsMismatch ? 'border-red-400' : 'border-base'
                }`}
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="new-password"
              />
              {passwordsMatch && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-primary hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed text-primary-foreground font-semibold text-sm rounded-sm transition-colors flex items-center justify-center gap-2 mt-1 cursor-pointer"
          >
            {isLoading && <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />}
            {isLoading ? 'Resetting password...' : 'Reset password'}
          </button>
        </form>
      </div>
    </div>
  );
};