import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Mail,
  MapPin,
  Pencil,
  Phone,
  UserRound,
} from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { portalUserService } from '../../../services/user.service';
import type { PortalUserRecord } from '../../../shared/types/portal.types';
import { getEmployeeTypeLabel } from '../../../shared/constants/employeeType';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { UserDocumentsTab } from './UserDocumentsTab';
import { ModulePermissionGuard } from '../../../components/common/ModulePermissionGuard';
import { useModulePermissions } from '../../../shared/permissions/PermissionContext';

type ViewTab = 'overview' | 'documents';

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

const UserOverviewTab = ({ user }: { user: PortalUserRecord }) => (
  <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
    <div className="flex flex-col gap-6">
      <SectionCard
        icon={<UserRound className="h-4 w-4" />}
        title="Personal information"
        description="Contact and identity details."
      >
        <dl className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <DetailItem label="First name" value={user.firstName} />
          <DetailItem label="Last name" value={user.lastName} />
          <DetailItem label="Email" value={user.email} />
          <DetailItem label="Mobile" value={user.phone || '—'} />
          <DetailItem label="Gender" value={formatGender(user.gender)} />
          <DetailItem label="Date of birth" value={formatDate(user.dateOfBirth)} />
          <div className="sm:col-span-2 xl:col-span-3">
            <DetailItem label="Address" value={user.address || '—'} />
          </div>
        </dl>
      </SectionCard>

      <SectionCard
        icon={<Briefcase className="h-4 w-4" />}
        title="Employment details"
        description="Role, department, and reporting structure."
      >
        <dl className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <DetailItem label="Employee code" value={user.employeeCode} />
          <DetailItem label="Role" value={user.role.name} />
          <DetailItem label="Department" value={user.department || '—'} />
          <DetailItem label="Designation" value={user.designation || '—'} />
          <DetailItem label="Employee type" value={getEmployeeTypeLabel(user.employeeType)} />
          <DetailItem
            label="Reporting manager"
            value={
              user.reportingManager
                ? `${user.reportingManager.name} (${user.reportingManager.employeeCode})`
                : '—'
            }
          />
          <DetailItem label="Joining date" value={formatDate(user.joiningDate)} />
        </dl>
      </SectionCard>
    </div>

    <aside className="flex flex-col gap-6">
      <SectionCard icon={<Calendar className="h-4 w-4" />} title="Account" description="Portal access and record dates.">
        <dl className="space-y-5">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">Status</dt>
            <dd className="mt-2">
              <StatusBadge status={user.status} />
            </dd>
          </div>
          <DetailItem label="Created on" value={formatDate(user.createdAt)} />
          <DetailItem label="Last updated" value={formatDate(user.updatedAt)} />
        </dl>
      </SectionCard>
    </aside>
  </div>
);

export const UserViewPage = () => {
  const navigate = useNavigate();
  const { moduleCode, itemCode, userId } = useParams<{
    moduleCode: string;
    itemCode: string;
    userId: string;
  }>();
  const listPath = `/${moduleCode}/${itemCode}`;
  const editPath = `${listPath}/${userId}/edit`;
  const { canEdit, canCreate, canDelete } = useModulePermissions(moduleCode, itemCode);

  const [user, setUser] = useState<PortalUserRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ViewTab>('overview');

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      try {
        setIsLoading(true);
        setUser(await portalUserService.getUser(userId));
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Failed to load user'));
        navigate(listPath);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [userId, listPath, navigate]);

  if (isLoading || !user) {
    return (
      <UserLayout title="View User" subtitle="Loading user details...">
        <div className="flex h-48 w-full items-center justify-center text-muted">Loading...</div>
      </UserLayout>
    );
  }

  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <ModulePermissionGuard moduleCode={moduleCode!} itemCode={itemCode} action="view" moduleLabel="Users">
    <UserLayout title="View User" subtitle="Employee profile and documents">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" variant="secondary" onClick={() => navigate(listPath)}>
          <ArrowLeft className="mr-2 inline h-4 w-4" />
          Back to users
        </Button>
        {canEdit ? (
          <Button type="button" onClick={() => navigate(editPath)}>
            <Pencil className="mr-2 inline h-4 w-4" />
            Edit user
          </Button>
        ) : null}
      </div>

      <section className="mb-6 rounded-sm border border-base bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-sm text-2xl font-bold text-white"
              style={{
                background:
                  'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
              }}
            >
              {initials}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-xl font-semibold text-body">{user.name}</h1>
              <p className="mt-1 font-mono text-sm text-muted">{user.employeeCode}</p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                <StatusBadge status={user.status} />
                <span className="text-sm text-muted">{user.role.name}</span>
                {user.department ? (
                  <span className="text-sm text-muted">· {user.department}</span>
                ) : null}
              </div>
            </div>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2 lg:max-w-md">
            <div className="flex items-center gap-2 text-sm text-body">
              <Mail className="h-4 w-4 shrink-0 text-muted" />
              <span className="truncate">{user.email}</span>
            </div>
            {user.phone ? (
              <div className="flex items-center gap-2 text-sm text-body">
                <Phone className="h-4 w-4 shrink-0 text-muted" />
                <span>{user.phone}</span>
              </div>
            ) : null}
            {user.address ? (
              <div className="flex items-start gap-2 text-sm text-body sm:col-span-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                <span>{user.address}</span>
              </div>
            ) : null}
          </dl>
        </div>
      </section>

      <div className="mb-5 flex gap-2 border-b border-base">
        {([
          { key: 'overview' as const, label: 'Overview' },
          { key: 'documents' as const, label: 'Documents' },
        ]).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-body'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' ? (
        <UserOverviewTab user={user} />
      ) : (
        <UserDocumentsTab
          userId={user.id}
          userName={user.name}
          canCreate={canCreate}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      )}
    </UserLayout>
    </ModulePermissionGuard>
  );
};
