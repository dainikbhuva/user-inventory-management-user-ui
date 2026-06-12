import { useEffect, useState } from 'react';
import { Mail, User as UserIcon, Shield, Calendar, Building2, BadgeCheck } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { useAuth } from '../../../shared/auth/useAuth';
import { authService } from '../../../services/auth.service';
import { getApiErrorMessage } from '../../../shared/utils/apiError';

interface ProfileData {
  name: string;
  email: string;
  phone?: string;
  status: string;
  companyName?: string;
  companyCode?: string;
  role?: { name: string; code: string };
  createdAt?: string;
  updatedAt?: string;
}

export const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const loadProfile = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await authService.getProfile(controller.signal);
        if (response.success && response.data?.user) {
          const u = response.data.user;
          setProfile({
            name: u.name,
            email: u.email,
            phone: u.phone,
            status: u.status,
            companyName: u.companyName,
            companyCode: u.companyCode,
            role: u.role,
            createdAt: u.createdAt,
            updatedAt: u.updatedAt,
          });
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(getApiErrorMessage(err, 'Failed to load profile'));
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();
    return () => controller.abort();
  }, []);

  const displayName = profile?.name || user?.name || 'User';
  const displayEmail = profile?.email || user?.email || '';
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const formatDate = (value?: string) => {
    if (!value) return '—';
    return new Date(value).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <UserLayout title="Profile" subtitle="View your account information">
      <div className="grid gap-6 max-w-2xl">
        {error && (
          <div className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <section className="rounded-sm border border-base bg-surface p-6 shadow-soft">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div
              className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-sm text-2xl font-bold text-white"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
              }}
            >
              {initials}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-semibold text-body">{displayName}</h2>
              <p className="text-sm text-muted mt-1">{displayEmail}</p>
              {profile?.status && (
                <span
                  className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                    profile.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {profile.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-sm border border-base bg-surface p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-body mb-6">Account details</h3>

          {isLoading ? (
            <p className="text-sm text-muted">Loading profile...</p>
          ) : (
            <dl className="grid gap-5">
              {[
                { icon: UserIcon, label: 'Full name', value: displayName },
                { icon: Mail, label: 'Email address', value: displayEmail },
                {
                  icon: Building2,
                  label: 'Company',
                  value: profile?.companyName
                    ? `${profile.companyName}${profile.companyCode ? ` (${profile.companyCode})` : ''}`
                    : '—',
                },
                {
                  icon: BadgeCheck,
                  label: 'Role',
                  value: profile?.role?.name || '—',
                },
                {
                  icon: Shield,
                  label: 'Account status',
                  value: profile?.status === 'active' ? 'Active' : profile?.status || '—',
                },
                { icon: Calendar, label: 'Member since', value: formatDate(profile?.createdAt) },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-4">
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm"
                    style={{
                      backgroundColor: 'var(--color-surface-2)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <Icon className="h-4 w-4 text-muted" />
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted">{label}</dt>
                    <dd className="mt-1 text-sm font-medium text-body">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          )}
        </section>
      </div>
    </UserLayout>
  );
};
