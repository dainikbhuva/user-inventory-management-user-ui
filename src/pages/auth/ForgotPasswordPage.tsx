import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, AlertCircle, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      // TODO: call your API to send OTP/reset email
      await new Promise((res) => setTimeout(res, 1200)); // simulated delay
      navigate('/verify-otp', { state: { email } });
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
          <Mail className="w-5 h-5 text-primary" />
        </div>

        <h2 className="text-2xl font-bold text-body mb-1">Forgot your password?</h2>
        <p className="text-muted text-sm mb-7 leading-relaxed">
          Enter your email address and we'll send you a verification code to reset your password.
        </p>

        {error && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-sm px-4 py-3 mb-5">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-body mb-1.5">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="email"
                className="w-full h-11 pl-10 pr-4 bg-surface border border-base rounded-sm text-body text-sm placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all disabled:opacity-50"
                placeholder="you@example.com"
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
            className="w-full h-11 bg-primary hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed text-primary-foreground font-semibold text-sm rounded-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading && <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />}
            {isLoading ? 'Sending code...' : 'Send verification code'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => navigate('/login')}
          className="w-full mt-4 h-11 bg-surface border border-base hover:bg-surface-hover rounded-sm text-body text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </button>
      </div>
    </div>
  );
};