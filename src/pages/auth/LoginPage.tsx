import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Users, Package } from 'lucide-react';
import { useAuth } from '../../shared/auth/useAuth';

const LeftPanel = () => (
  <aside className="hidden lg:flex flex-col justify-between p-12 bg-surface-3 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-80 h-80 bg-primary-soft rounded-full blur-3xl pointer-events-none" />
    <div className="absolute bottom-0 left-0 w-56 h-56 bg-primary-soft rounded-full blur-3xl pointer-events-none" />

    <div className="relative z-10">
      <div className="flex items-center gap-2.5 mb-16">
        <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">U</span>
        </div>
        <span className="text-body font-semibold tracking-tight">UserPortal</span>
      </div>

      <p className="text-primary text-xs font-bold uppercase tracking-widest mb-4">User Platform</p>
      <h1 className="text-body text-4xl font-bold leading-snug mb-4 max-w-xs">
        Manage your<br />
        <span className="text-primary">inventory</span> easily.
      </h1>
      <p className="text-muted text-sm leading-relaxed max-w-xs">
        Your personal workspace for stock, orders, and daily operations.
      </p>

      <div className="mt-10 space-y-3">
        {[
          { icon: Package, label: 'Inventory', sub: 'Stock, SKUs & order tracking' },
          { icon: Users, label: 'Your Account', sub: 'Profile & secure access' },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex items-center gap-3 bg-surface-2 border border-base rounded-sm px-4 py-3">
            <div className="w-8 h-8 bg-primary-soft rounded-sm flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-body text-sm font-medium">{label}</p>
              <p className="text-muted text-xs">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* <div className="relative z-10 flex gap-8 pt-8 border-t border-base">
      {[['8M+', 'Businesses'], ['100+', 'Integrations'], ['99.9%', 'Uptime']].map(([val, label]) => (
        <div key={label}>
          <p className="text-body font-bold text-xl">{val}</p>
          <p className="text-muted text-xs mt-0.5">{label}</p>
        </div>
      ))}
    </div> */}
  </aside>
);

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
      <LeftPanel />

      <main className="flex items-center justify-center p-6 sm:p-10 min-h-screen bg-surface">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 bg-primary rounded-sm flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">U</span>
            </div>
            <span className="text-body font-semibold text-sm">UserPortal</span>
          </div>

          <h2 className="text-2xl font-bold text-body mb-1">Welcome back</h2>
          <p className="text-muted text-sm mb-7">Sign in to your user dashboard</p>

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
                  className="w-full h-11 pl-10 pr-4 bg-surface border border-base rounded-sm text-body text-sm placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all disabled:opacity-50"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-body">Password</label>
                
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="password"
                  className="w-full h-11 pl-10 pr-4 bg-surface border border-base rounded-sm text-body text-sm placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all disabled:opacity-50"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  autoComplete="current-password"
                />
              </div>
              <div className="flex items-center justify-end mb-1.5">
                <button
                  type="button"
                  className="text-xs text-primary hover:text-primary font-medium cursor-pointer"
                  onClick={() => navigate('/forgot-password')}
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-primary hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed text-primary-foreground font-semibold text-sm rounded-sm transition-colors flex items-center justify-center gap-2 mt-1 cursor-pointer"
            >
              {isLoading && <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />}
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-base" />
            <span className="text-muted text-xs">or</span>
            <div className="flex-1 h-px bg-base" />
          </div>

          <button
            type="button"
            className="w-full h-11 bg-surface border border-base hover:bg-surface-2 rounded-sm text-body text-sm font-medium flex items-center justify-center gap-2.5 transition-colors"
          >
            <GoogleIcon />
            Continue with Google
          </button> */}

          {/* <p className="text-center text-muted text-xs mt-5 leading-relaxed">
            By continuing you agree to our{' '}
            <a href="#" className="text-primary hover:underline">privacy policy</a>
            {' '}and{' '}
            <a href="#" className="text-primary hover:underline">terms of use</a>.
          </p> */}

          <p className="text-center text-sm text-muted mt-5">
            New here?{' '}
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="text-primary hover:text-primary font-semibold cursor-pointer"
            >
              Create an account
            </button>
          </p>
        </div>
      </main>
    </div>
  );
};