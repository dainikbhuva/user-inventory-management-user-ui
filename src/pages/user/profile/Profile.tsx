import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Building2,
  Calendar,
  Eye,
  KeyRound,
  Mail,
  Pencil,
  Phone,
  UserRound,
} from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { useAuth } from '../../../shared/auth/useAuth';
import { authService } from '../../../services/auth.service';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { toast } from '../../../shared/utils/toast';
import { getEmployeeTypeLabel } from '../../../shared/constants/employeeType';
import type { ProfileRecord } from '../../../shared/types/profile.types';
import { formValuesToPayload, profileToFormValues } from '../../../shared/types/profile.types';
import { ProfileEditForm } from './ProfileEditForm';

type ProfileMode = 'view' | 'edit';

const formatDate = (value?: string) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatGender = (value?: string) => {
  if (!value) return '—';
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-0">
    <dt className="text-xs font-medium uppercase tracking-wide text-muted">{label}</dt>
    <dd className="mt-1 text-sm font-medium text-body break-words">{value}</dd>
  </div>
);

const SectionCard = ({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
}) => (
  <section className="rounded-sm border border-base bg-surface shadow-sm">
    <div className="flex items-start gap-3 border-b border-base px-6 py-4">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <h2 className="text-base font-semibold text-body">{title}</h2>
        {description ? <p className="mt-0.5 text-sm text-muted">{description}</p> : null}
      </div>
    </div>
    <div className="p-6">{children}</div>
  </section>
);

const mapProfile = (user: ProfileResponseUser): ProfileRecord => ({
  id: user.id,
  employeeCode: user.employeeCode,
  firstName: user.firstName,
  lastName: user.lastName,
  name: user.name,
  email: user.email,
  phone: user.phone,
  status: user.status as ProfileRecord['status'],
  companyId: user.companyId ?? '',
  companyName: user.companyName ?? '',
  companyCode: user.companyCode ?? '',
  role: user.role ?? { id: '', name: '—', code: '' },
  department: user.department,
  designation: user.designation,
  employeeType: user.employeeType as ProfileRecord['employeeType'],
  reportingManager: user.reportingManager,
  joiningDate: user.joiningDate,
  gender: user.gender,
  dateOfBirth: user.dateOfBirth,
  address: user.address,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

type ProfileResponseUser = NonNullable<
  Awaited<ReturnType<typeof authService.getProfile>>['data']
>['user'];

export const ProfilePage = () => {
  const { updateSessionUser } = useAuth();
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [form, setForm] = useState(profileToFormValues({
    id: '',
    employeeCode: '',
    firstName: '',
    lastName: '',
    name: '',
    email: '',
    status: 'active',
    companyId: '',
    companyName: '',
    companyCode: '',
    role: { id: '', name: '', code: '' },
  }));
  const [mode, setMode] = useState<ProfileMode>('view');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await authService.getProfile();
      if (response.success && response.data?.user) {
        const next = mapProfile(response.data.user);
        setProfile(next);
        setForm(profileToFormValues(next));
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load profile'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const startEdit = () => {
    if (profile) {
      setForm(profileToFormValues(profile));
    }
    setMode('edit');
  };

  const cancelEdit = () => {
    if (profile) {
      setForm(profileToFormValues(profile));
    }
    setMode('view');
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error('First name and last name are required.');
      return;
    }

    try {
      setIsSaving(true);
      const response = await authService.updateProfile(formValuesToPayload(form));
      if (response.success && response.data?.user) {
        const next = mapProfile(response.data.user);
        setProfile(next);
        setForm(profileToFormValues(next));
        setMode('view');
        updateSessionUser({ name: next.name });
        toast.success('Profile updated successfully.');
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update profile'));
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = profile?.name || 'User';
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <UserLayout title="My Profile" subtitle="View and update your personal information">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-sm border border-base p-0.5">
          <button
            type="button"
            onClick={() => setMode('view')}
            className={`inline-flex items-center gap-2 rounded-sm px-4 py-2 text-sm font-semibold transition ${
              mode === 'view' ? 'bg-primary text-white' : 'text-muted hover:bg-surface-2 hover:text-body'
            }`}
          >
            <Eye className="h-4 w-4" />
            View
          </button>
          <button
            type="button"
            onClick={startEdit}
            className={`inline-flex items-center gap-2 rounded-sm px-4 py-2 text-sm font-semibold transition ${
              mode === 'edit' ? 'bg-primary text-white' : 'text-muted hover:bg-surface-2 hover:text-body'
            }`}
          >
            <Pencil className="h-4 w-4" />
            Edit
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/change-password"
            className="inline-flex h-10 items-center justify-center rounded-sm border border-base bg-surface-2 px-4 text-sm font-medium text-body transition hover:bg-surface-3"
          >
            <KeyRound className="mr-2 h-4 w-4" />
            Change password
          </Link>
          {mode === 'view' ? (
            <Button type="button" onClick={startEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit profile
            </Button>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="mb-6 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-sm border border-base bg-surface text-muted">
          Loading profile...
        </div>
      ) : !profile ? null : (
        <div className="space-y-6">
          <section
            className="overflow-hidden rounded-sm border border-base bg-surface shadow-sm"
            style={{
              background:
                'linear-gradient(135deg, var(--color-primary-soft) 0%, var(--color-surface) 45%, var(--color-surface) 100%)',
            }}
          >
            <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
                <div
                  className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-sm text-2xl font-bold text-white shadow-sm"
                  style={{
                    background:
                      'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                  }}
                >
                  {initials}
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-xl font-semibold text-body">{displayName}</h2>
                  <p className="mt-1 text-sm text-muted">{profile.email}</p>
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <StatusBadge status={profile.status} />
                    <span className="inline-flex items-center rounded-full border border-base bg-surface px-3 py-1 text-xs font-medium text-body">
                      {profile.role.name}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-base bg-surface px-3 py-1 font-mono text-xs text-muted">
                      {profile.employeeCode}
                    </span>
                  </div>
                </div>
              </div>
              <div className="rounded-sm border border-base bg-surface/80 px-4 py-3 text-center sm:text-right">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Company</p>
                <p className="mt-1 text-sm font-semibold text-body">{profile.companyName}</p>
                {profile.companyCode ? (
                  <p className="text-xs text-muted">{profile.companyCode}</p>
                ) : null}
              </div>
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="flex flex-col gap-6">
              <SectionCard
                icon={<UserRound className="h-4 w-4" />}
                title="Personal information"
                description={
                  mode === 'edit'
                    ? 'Update your contact and personal details.'
                    : 'Contact and identity details.'
                }
              >
                {mode === 'edit' ? (
                  <ProfileEditForm
                    value={form}
                    isSubmitting={isSaving}
                    onChange={setForm}
                    onCancel={cancelEdit}
                    onSubmit={handleSubmit}
                  />
                ) : (
                  <dl className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    <DetailItem label="First name" value={profile.firstName} />
                    <DetailItem label="Last name" value={profile.lastName} />
                    <DetailItem label="Email" value={profile.email} />
                    <DetailItem label="Mobile" value={profile.phone || '—'} />
                    <DetailItem label="Gender" value={formatGender(profile.gender)} />
                    <DetailItem label="Date of birth" value={formatDate(profile.dateOfBirth)} />
                    <div className="sm:col-span-2 xl:col-span-3">
                      <DetailItem label="Address" value={profile.address || '—'} />
                    </div>
                  </dl>
                )}
              </SectionCard>

              {mode === 'view' ? (
                <SectionCard
                  icon={<Briefcase className="h-4 w-4" />}
                  title="Employment details"
                  description="Managed by your company admin."
                >
                  <dl className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    <DetailItem label="Employee code" value={profile.employeeCode} />
                    <DetailItem label="Role" value={profile.role.name} />
                    <DetailItem label="Department" value={profile.department || '—'} />
                    <DetailItem label="Designation" value={profile.designation || '—'} />
                    <DetailItem
                      label="Employee type"
                      value={getEmployeeTypeLabel(profile.employeeType)}
                    />
                    <DetailItem
                      label="Reporting manager"
                      value={
                        profile.reportingManager
                          ? `${profile.reportingManager.name} (${profile.reportingManager.employeeCode})`
                          : '—'
                      }
                    />
                    <DetailItem label="Joining date" value={formatDate(profile.joiningDate)} />
                  </dl>
                </SectionCard>
              ) : null}
            </div>

            {mode === 'view' ? (
              <aside className="flex flex-col gap-6">
                <SectionCard
                  icon={<Building2 className="h-4 w-4" />}
                  title="Quick contact"
                  description="Your primary contact details."
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Mail className="mt-0.5 h-4 w-4 text-muted" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted">Email</p>
                        <p className="text-sm font-medium text-body break-all">{profile.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="mt-0.5 h-4 w-4 text-muted" />
                      <div>
                        <p className="text-xs text-muted">Mobile</p>
                        <p className="text-sm font-medium text-body">{profile.phone || '—'}</p>
                      </div>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard
                  icon={<Calendar className="h-4 w-4" />}
                  title="Account"
                  description="Portal access and record dates."
                >
                  <dl className="space-y-5">
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-muted">Status</dt>
                      <dd className="mt-2">
                        <StatusBadge status={profile.status} />
                      </dd>
                    </div>
                    <DetailItem label="Member since" value={formatDate(profile.createdAt)} />
                    <DetailItem label="Last updated" value={formatDate(profile.updatedAt)} />
                  </dl>
                </SectionCard>
              </aside>
            ) : null}
          </div>
        </div>
      )}
    </UserLayout>
  );
};
