import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/auth/useAuth';
import { Mail, Lock, User, AlertCircle, Check, Users, Package } from 'lucide-react';

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const LeftPanel = () => (
  <aside className="hidden lg:flex flex-col justify-between p-12 bg-base-300 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
    <div className="absolute bottom-0 left-0 w-56 h-56 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

    <div className="relative z-10">
      <div className="flex items-center gap-2.5 mb-16">
        <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
          <span className="text-primary-content font-bold text-sm">U</span>
        </div>
        <span className="text-base-content font-semibold tracking-tight">UserPortal</span>
      </div>

      <p className="text-primary text-xs font-bold uppercase tracking-widest mb-4">Get Started</p>
      <h1 className="text-base-content text-4xl font-bold leading-snug mb-4 max-w-xs">
        Your user<br />
        <span className="text-primary">journey</span> begins.
      </h1>
      <p className="text-base-content/70 text-sm leading-relaxed max-w-xs">
        Set up your account and start managing users, inventory, and orders in minutes.
      </p>

      <div className="mt-10 space-y-3">
        {[
          { icon: Users, label: 'User Management', sub: 'Roles, permissions & activity' },
          { icon: Package, label: 'Inventory Control', sub: 'Stock, SKUs & order tracking' },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex items-center gap-3 bg-base-200 border border-base-300 rounded-sm px-4 py-3">
            <div className="w-8 h-8 bg-primary/10 rounded-sm flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-base-content text-sm font-medium">{label}</p>
              <p className="text-base-content/70 text-xs">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="relative z-10 flex gap-8 pt-8 border-t border-base-300">
      {[['8M+', 'Businesses'], ['₹2T+', 'Processed'], ['4.9★', 'Rated']].map(([val, label]) => (
        <div key={label}>
          <p className="text-primary-content font-bold text-xl">{val}</p>
          <p className="text-base-content/70 text-xs mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  </aside>
);

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
  { label: 'Weak', color: 'bg-red-500', text: 'text-red-600' },
  { label: 'Fair', color: 'bg-orange-500', text: 'text-orange-600' },
  { label: 'Good', color: 'bg-blue-500', text: 'text-blue-600' },
  { label: 'Strong', color: 'bg-green-500', text: 'text-green-600' },
];

export const SignupPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const strength = getStrength(password);
  const meta = strengthMeta[strength];
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (strength < 2) { setError('Please choose a stronger password.'); return; }
    setIsLoading(true);
    try {
      await signup(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
      <LeftPanel />

      <main className="flex items-center justify-center p-6 sm:p-10 min-h-screen bg-base-100">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 bg-primary rounded-sm flex items-center justify-center">
              <span className="text-primary-content font-bold text-xs">U</span>
            </div>
            <span className="text-base-content font-semibold text-sm">UserPortal</span>
          </div>

          <h2 className="text-2xl font-bold text-base-content mb-1">Create your account</h2>
          <p className="text-base-content/70 text-sm mb-7">Set up your user profile to get started</p>

          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-sm px-4 py-3 mb-5">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-base-content mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/50" />
                <input
                  type="text"
                  className="input input-bordered w-full pl-10 focus:input-primary disabled:input-disabled"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-base-content mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/50" />
                <input
                  type="email"
                  className="input input-bordered w-full pl-10 focus:input-primary disabled:input-disabled"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-base-content mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/50" />
                <input
                  type="password"
                  className="input input-bordered w-full pl-10 focus:input-primary disabled:input-disabled"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  autoComplete="new-password"
                />
              </div>
              {password && meta && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${strength >= i ? meta.color : 'bg-base-300'} transition-colors`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs mt-1 ${meta.text}`}>{meta.label} password</p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-base-content mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/50" />
                <input
                  type="password"
                  className={`input input-bordered w-full pl-10 pr-10 focus:input-primary disabled:input-disabled ${
                    passwordsMatch ? 'input-success' : passwordsMismatch ? 'input-error' : ''
                  }`}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  autoComplete="new-password"
                />
                {passwordsMatch && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-success" />
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full"
            >
              {isLoading && <div className="w-4 h-4 border-2 border-primary-content/30 border-t-primary-content rounded-full animate-spin" />}
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="divider text-base-content/70">or</div>

          <button
            type="button"
            className="btn btn-outline w-full"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <p className="text-center text-base-content/70 text-xs mt-5 leading-relaxed">
            By continuing you agree to our{' '}
            <a href="#" className="text-primary hover:underline">privacy policy</a>
            {' '}and{' '}
            <a href="#" className="text-primary hover:underline">terms of use</a>.
          </p>

          <p className="text-center text-sm text-base-content/70 mt-5">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-primary hover:text-primary-focus font-semibold cursor-pointer"
            >
              Sign in
            </button>
          </p>
        </div>
      </main>
    </div>
  );
};