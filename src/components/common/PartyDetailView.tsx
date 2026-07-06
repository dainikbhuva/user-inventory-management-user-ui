import type { ReactNode } from 'react';
import {
  ArrowLeft,
  Building2,
  CreditCard,
  Globe,
  Mail,
  MapPin,
  Pencil,
  Phone,
  UserRound,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserLayout } from '../layout/Layout';
import { Button } from '../ui/Button';
import { StatusBadge } from './StatusBadge';

export interface PartyViewData {
  code: string;
  name: string;
  status: 'active' | 'inactive';
  contactPerson?: string;
  email?: string;
  mobile?: string;
  alternateMobile?: string;
  gstNumber?: string;
  panNumber?: string;
  website?: string;
  address1?: string;
  address2?: string;
  country?: string;
  state?: string;
  city?: string;
  pincode?: string;
  creditLimit?: number;
  paymentTerms?: string;
  createdAt?: string;
  updatedAt?: string;
}

const formatDate = (value?: string) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatCurrency = (value?: number) => {
  if (value === undefined || value === null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);
};

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-0">
    <dt className="text-xs font-medium uppercase tracking-wide text-muted">{label}</dt>
    <dd className="mt-1 text-sm font-medium text-body break-words">{value || '—'}</dd>
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

const formatAddress = (party: PartyViewData) => {
  const lines = [
    party.address1,
    party.address2,
    [party.city, party.state, party.pincode].filter(Boolean).join(', '),
    party.country,
  ].filter(Boolean);
  return lines.length > 0 ? lines.join('\n') : '—';
};

interface PartyDetailViewProps {
  entityLabel: string;
  listPath: string;
  editPath?: string;
  canEdit: boolean;
  isLoading: boolean;
  party: PartyViewData | null;
  showCommercial?: boolean;
}

export const PartyDetailView = ({
  entityLabel,
  listPath,
  editPath,
  canEdit,
  isLoading,
  party,
  showCommercial = false,
}: PartyDetailViewProps) => {
  const navigate = useNavigate();

  return (
    <UserLayout
      title={`${entityLabel} details`}
      subtitle={party?.name ?? `View ${entityLabel.toLowerCase()}`}
    >
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Button type="button" variant="secondary" onClick={() => navigate(listPath)}>
          <ArrowLeft className="mr-2 inline h-4 w-4" />
          Back to {entityLabel.toLowerCase()}s
        </Button>
        {canEdit && editPath ? (
          <Button type="button" onClick={() => navigate(editPath)}>
            <Pencil className="mr-2 inline h-4 w-4" />
            Edit
          </Button>
        ) : null}
      </div>

      {isLoading || !party ? (
        <div className="flex h-64 items-center justify-center text-muted">Loading...</div>
      ) : (
        <>
          <div className="mb-6 rounded-sm border border-base bg-surface p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary">
                  <Building2 className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-body">{party.name}</h1>
                  <p className="mt-1 font-mono text-sm text-muted">{party.code}</p>
                </div>
              </div>
              <StatusBadge status={party.status} />
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="flex flex-col gap-6">
              <SectionCard
                icon={<UserRound className="h-4 w-4" />}
                title="Contact information"
                description="Primary contact and communication details."
              >
                <dl className="grid gap-5 sm:grid-cols-2">
                  <DetailItem label="Contact person" value={party.contactPerson ?? '—'} />
                  <DetailItem label="Email" value={party.email ?? '—'} />
                  <DetailItem label="Mobile" value={party.mobile ?? '—'} />
                  <DetailItem label="Alternate mobile" value={party.alternateMobile ?? '—'} />
                  <div className="sm:col-span-2">
                    <DetailItem label="Website" value={party.website ?? '—'} />
                  </div>
                </dl>
              </SectionCard>

              <SectionCard
                icon={<MapPin className="h-4 w-4" />}
                title="Address"
                description="Billing and correspondence address."
              >
                <dl className="grid gap-5 sm:grid-cols-2">
                  <DetailItem label="Address line 1" value={party.address1 ?? '—'} />
                  <DetailItem label="Address line 2" value={party.address2 ?? '—'} />
                  <DetailItem label="City" value={party.city ?? '—'} />
                  <DetailItem label="State" value={party.state ?? '—'} />
                  <DetailItem label="Pincode" value={party.pincode ?? '—'} />
                  <DetailItem label="Country" value={party.country ?? '—'} />
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted">Full address</dt>
                    <dd className="mt-1 whitespace-pre-line text-sm font-medium text-body">{formatAddress(party)}</dd>
                  </div>
                </dl>
              </SectionCard>

              {showCommercial ? (
                <SectionCard
                  icon={<CreditCard className="h-4 w-4" />}
                  title="Commercial terms"
                  description="Credit and payment preferences."
                >
                  <dl className="grid gap-5 sm:grid-cols-2">
                    <DetailItem label="Credit limit" value={formatCurrency(party.creditLimit)} />
                    <DetailItem label="Payment terms" value={party.paymentTerms ?? '—'} />
                  </dl>
                </SectionCard>
              ) : null}
            </div>

            <aside className="flex flex-col gap-6">
              <SectionCard
                icon={<Globe className="h-4 w-4" />}
                title="Tax & compliance"
                description="GST and PAN details."
              >
                <dl className="space-y-5">
                  <DetailItem label="GST number" value={party.gstNumber ?? '—'} />
                  <DetailItem label="PAN number" value={party.panNumber ?? '—'} />
                </dl>
              </SectionCard>

              <SectionCard
                icon={<Phone className="h-4 w-4" />}
                title="Quick contact"
                description="Reach out directly."
              >
                <dl className="space-y-5">
                  <DetailItem label="Phone" value={party.mobile ?? '—'} />
                  <DetailItem label="Email" value={party.email ?? '—'} />
                </dl>
              </SectionCard>

              <SectionCard icon={<Mail className="h-4 w-4" />} title="Record" description="Created and last updated.">
                <dl className="space-y-5">
                  <DetailItem label="Created" value={formatDate(party.createdAt)} />
                  <DetailItem label="Last updated" value={formatDate(party.updatedAt)} />
                </dl>
              </SectionCard>
            </aside>
          </div>
        </>
      )}
    </UserLayout>
  );
};
