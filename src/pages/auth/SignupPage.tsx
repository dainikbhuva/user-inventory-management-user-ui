import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  AlertCircle,
  Check,
  Users,
  Package,
  Building2,
  Phone,
  MapPin,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../shared/auth/useAuth';

const slugifyCompanyCode = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

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
  { label: 'Weak', color: 'bg-red-500', text: 'text-red-600' },
  { label: 'Fair', color: 'bg-orange-500', text: 'text-orange-600' },
  { label: 'Good', color: 'bg-blue-500', text: 'text-blue-600' },
  { label: 'Strong', color: 'bg-green-500', text: 'text-green-600' },
];

const LeftPanel = () => (
  <aside className="relative hidden flex-col justify-between overflow-hidden bg-surface-3 p-12 lg:flex">
    <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-primary-soft blur-3xl" />
    <div className="pointer-events-none absolute bottom-0 left-0 h-56 w-56 rounded-full bg-primary-soft blur-3xl" />

    <div className="relative z-10">
      <div className="mb-16 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary">
          <span className="text-sm font-bold text-primary-foreground">U</span>
        </div>
        <span className="font-semibold tracking-tight text-body">UserPortal</span>
      </div>

      <p className="mb-4 text-xs font-bold uppercase tracking-widest text-primary">Get Started</p>
      <h1 className="mb-4 max-w-xs text-4xl font-bold leading-snug text-body">
        Set up your
        <br />
        <span className="text-primary">company workspace</span>
      </h1>
      <p className="max-w-xs text-sm leading-relaxed text-muted">
        Register your company and create the Super Admin account to manage users, HR, and operations.
      </p>

      <div className="mt-10 space-y-3">
        {[
          { icon: Building2, label: 'Company profile', sub: 'Name, code, and contact details' },
          { icon: Shield, label: 'Super Admin access', sub: 'Full control from day one' },
          { icon: Users, label: 'Team ready', sub: 'Invite users and assign roles later' },
        ].map(({ icon: Icon, label, sub }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-sm border border-base bg-surface-2 px-4 py-3"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-primary-soft">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-body">{label}</p>
              <p className="text-xs text-muted">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="relative z-10 flex gap-8 border-t border-base pt-8">
      {[
        ['1', 'Company'],
        ['2', 'Super Admin'],
        ['3', 'Dashboard'],
      ].map(([val, label]) => (
        <div key={label}>
          <p className="text-xl font-bold text-body">{val}</p>
          <p className="mt-0.5 text-xs text-muted">{label}</p>
        </div>
      ))}
    </div>
  </aside>
);

const SectionTitle = ({ icon: Icon, title, description }: { icon: typeof Building2; title: string; description: string }) => (
  <div className="mb-4 border-b border-base pb-4">
    <div className="mb-2 flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-sm border border-primary/20 bg-primary-soft">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <h3 className="text-base font-semibold text-body">{title}</h3>
    </div>
    <p className="text-xs text-muted">{description}</p>
  </div>
);

export const SignupPage = () => {
  const [companyName, setCompanyName] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [companyCodeTouched, setCompanyCodeTouched] = useState(false);
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');

  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
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

  const handleCompanyNameChange = (value: string) => {
    setCompanyName(value);
    if (!companyCodeTouched) {
      setCompanyCode(slugifyCompanyCode(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (companyEmail.trim().toLowerCase() === adminEmail.trim().toLowerCase()) {
      setError('Company email and super admin email must be different.');
      return;
    }

    setIsLoading(true);
    try {
      await signup({
        company: {
          name: companyName.trim(),
          code: companyCode.trim().toLowerCase(),
          email: companyEmail.trim().toLowerCase(),
          ...(companyPhone.trim() ? { phone: companyPhone.trim() } : {}),
          ...(companyAddress.trim() ? { address: companyAddress.trim() } : {}),
        },
        admin: {
          name: adminName.trim(),
          email: adminEmail.trim().toLowerCase(),
          password,
          ...(adminPhone.trim() ? { phone: adminPhone.trim() } : {}),
        },
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'h-11 w-full rounded-sm border border-base bg-surface pl-10 pr-4 text-sm text-body placeholder:text-muted transition focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:opacity-50';

  return (
    <div className="theme-scrollbar grid min-h-screen max-h-screen grid-cols-1 overflow-y-auto lg:grid-cols-[1.1fr_1fr]">
      <LeftPanel />

      <main className="flex min-h-screen items-start justify-center bg-surface p-6 sm:p-10 lg:items-center">
        <div className="w-full max-w-lg py-4">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-primary">
              <span className="text-xs font-bold text-primary-foreground">U</span>
            </div>
            <span className="text-sm font-semibold text-body">UserPortal</span>
          </div>

          <h2 className="mb-1 text-2xl font-bold text-body">Create your company account</h2>
          <p className="mb-7 text-sm text-muted">
            Add your company details and set up the Super Admin who will sign in to the portal.
          </p>

          {error ? (
            <div className="mb-5 flex items-center gap-2.5 rounded-sm border border-red-200 bg-red-50 px-4 py-3">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-8">
            <section className="rounded-sm border border-base bg-surface-2/30 p-5">
              <SectionTitle
                icon={Building2}
                title="Company details"
                description="Basic information about your organization."
              />

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-body">Company name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="Acme Corporation"
                      value={companyName}
                      onChange={(e) => handleCompanyNameChange(e.target.value)}
                      disabled={isLoading}
                      required
                      autoComplete="organization"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-body">Company code</label>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="acme-corp"
                      value={companyCode}
                      onChange={(e) => {
                        setCompanyCodeTouched(true);
                        setCompanyCode(slugifyCompanyCode(e.target.value));
                      }}
                      disabled={isLoading}
                      required
                      pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                      title="Lowercase letters, numbers, and hyphens only"
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted">Unique ID for your company (used internally)</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-body">Company email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                      <input
                        type="email"
                        className={inputClass}
                        placeholder="contact@company.com"
                        value={companyEmail}
                        onChange={(e) => setCompanyEmail(e.target.value)}
                        disabled={isLoading}
                        required
                        autoComplete="organization-email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-body">Company phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                      <input
                        type="tel"
                        className={inputClass}
                        placeholder="+91 98765 43210"
                        value={companyPhone}
                        onChange={(e) => setCompanyPhone(e.target.value)}
                        disabled={isLoading}
                        autoComplete="tel"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-body">Company address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted" />
                    <textarea
                      className="min-h-[72px] w-full rounded-sm border border-base bg-surface py-2.5 pl-10 pr-4 text-sm text-body placeholder:text-muted transition focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:opacity-50"
                      placeholder="Office address (optional)"
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                      disabled={isLoading}
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-sm border border-base bg-surface-2/30 p-5">
              <SectionTitle
                icon={Shield}
                title="Super Admin account"
                description="This user gets full access and will sign in to manage the portal."
              />

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-body">Full name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="Admin full name"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      disabled={isLoading}
                      required
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-body">Login email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                      <input
                        type="email"
                        className={inputClass}
                        placeholder="admin@company.com"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        disabled={isLoading}
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-body">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                      <input
                        type="tel"
                        className={inputClass}
                        placeholder="Optional"
                        value={adminPhone}
                        onChange={(e) => setAdminPhone(e.target.value)}
                        disabled={isLoading}
                        autoComplete="tel"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-body">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <input
                      type="password"
                      className={inputClass}
                      placeholder="Create a strong password"
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
                              strength >= level ? meta.color : 'bg-base'
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`mt-1 text-xs ${meta.text}`}>{meta.label} password</p>
                    </div>
                  ) : null}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-body">Confirm password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <input
                      type="password"
                      className={`${inputClass} pr-10 ${
                        passwordsMatch ? 'border-green-400' : passwordsMismatch ? 'border-red-400' : ''
                      }`}
                      placeholder="Re-enter password"
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
              </div>
            </section>

            <button
              type="submit"
              disabled={isLoading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-sm bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              ) : null}
              {isLoading ? 'Creating company...' : 'Create company & sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="cursor-pointer font-semibold text-primary hover:opacity-80"
            >
              Sign in
            </button>
          </p>
        </div>
      </main>
    </div>
  );
};
