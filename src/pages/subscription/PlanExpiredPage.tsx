import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Calendar,
  Check,
  CreditCard,
  LogOut,
  RefreshCw,
  Users,
} from 'lucide-react';
import { useAuth } from '../../shared/auth/useAuth';
import { useSubscription } from '../../shared/subscription/SubscriptionContext';
import { usePermissions } from '../../shared/permissions/PermissionContext';
import {
  subscriptionService,
  type PortalPlanSummary,
  type PortalSubscriptionQuote,
} from '../../services/subscription.service';
import {
  computeBillingPeriodTotal,
  computeMonthlyTotal,
  getBillingPeriodConfig,
  getBillingPeriodLabel,
  PLAN_MIN_USERS,
} from '../../shared/utils/planBilling';
import { getApiErrorMessage } from '../../shared/utils/apiError';
import { toast } from '../../shared/utils/toast';

const formatDate = (value?: string) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatMoney = (amount: number) => (amount === 0 ? 'Free' : `₹${amount.toLocaleString()}`);

export const PlanExpiredPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { subscription, refresh, isLoading } = useSubscription();
  const { isSuperAdmin } = usePermissions();

  const [plans, setPlans] = useState<PortalPlanSummary[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [seatCount, setSeatCount] = useState(String(PLAN_MIN_USERS));
  const [autoRenew, setAutoRenew] = useState(true);
  const [quote, setQuote] = useState<PortalSubscriptionQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [renewLoading, setRenewLoading] = useState(false);

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);
  const seats = Number(seatCount) || PLAN_MIN_USERS;
  const minSeats = Math.max(
    selectedPlan?.minUsers ?? PLAN_MIN_USERS,
    subscription?.activeUserCount ?? PLAN_MIN_USERS
  );

  useEffect(() => {
    if (!isLoading && subscription && !subscription.isExpired && subscription.status === 'active') {
      navigate('/dashboard', { replace: true });
    }
  }, [subscription, isLoading, navigate]);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const response = await subscriptionService.getPlans();
        const items = response.data ?? [];
        setPlans(items);
        if (items.length > 0) {
          const previousId = subscription?.plan.id;
          const match = items.find((plan) => plan.id === previousId);
          setSelectedPlanId(match?.id ?? items[0]!.id);
        }
      } catch {
        toast.error('Failed to load available plans');
      }
    };
    void loadPlans();
  }, [subscription?.plan.id]);

  useEffect(() => {
    if (!subscription) return;
    setSeatCount(String(Math.max(subscription.seatCount, subscription.activeUserCount, PLAN_MIN_USERS)));
  }, [subscription]);

  useEffect(() => {
    if (!selectedPlanId || seats < minSeats) {
      setQuote(null);
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        setQuoteLoading(true);
        const response = await subscriptionService.quoteRenew({ planId: selectedPlanId, seatCount: seats });
        setQuote(response.data ?? null);
      } catch (err) {
        setQuote(null);
        toast.error(getApiErrorMessage(err, 'Could not calculate renewal price'));
      } finally {
        setQuoteLoading(false);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [selectedPlanId, seats, minSeats]);

  const planCards = useMemo(
    () =>
      plans.map((plan) => {
        const months = getBillingPeriodConfig(plan.billingPeriod).durationMonths;
        const periodTotal = computeBillingPeriodTotal(plan.finalPrice, seats, months);
        const monthly = computeMonthlyTotal(plan.finalPrice, seats);
        return { plan, periodTotal, monthly };
      }),
    [plans, seats]
  );

  const handleRenew = async () => {
    if (!selectedPlanId || !isSuperAdmin) return;
    try {
      setRenewLoading(true);
      await subscriptionService.renew({ planId: selectedPlanId, seatCount: seats, autoRenew });
      toast.success('Plan renewed successfully. Welcome back!');
      await refresh();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to renew plan'));
    } finally {
      setRenewLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-3 px-4 py-10">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-20 top-0 h-72 w-72 rounded-full bg-primary-soft blur-3xl" />
        <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-primary-soft blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-4xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary">
              <span className="text-sm font-bold text-primary-foreground">U</span>
            </div>
            <span className="font-semibold text-body">{user?.companyName || 'UserPortal'}</span>
          </div>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="inline-flex items-center gap-2 rounded-sm border border-base bg-surface px-3 py-2 text-sm text-muted transition hover:bg-surface-2 hover:text-body"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>

        <div className="mb-8 overflow-hidden rounded-sm border border-red-200 bg-red-50">
          <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-red-900">Your plan has expired</h1>
              <p className="mt-2 text-sm leading-relaxed text-red-800">
                {subscription?.plan.name ? (
                  <>
                    <strong>{subscription.plan.name}</strong> ended on{' '}
                    <strong>{formatDate(subscription.endDate)}</strong>. Renew to restore access to your
                    portal for all users.
                  </>
                ) : (
                  'Your company subscription has ended. Renew to continue using the portal.'
                )}
              </p>
              {subscription ? (
                <p className="mt-2 text-xs text-red-700">
                  {subscription.activeUserCount} active users · previous limit {subscription.seatCount} seats
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {!isSuperAdmin ? (
          <div className="rounded-sm border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            Only your company <strong>Super Admin</strong> can renew the plan. Please ask them to sign in and
            renew, or contact support.
          </div>
        ) : (
          <>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-body">Choose a plan to renew</h2>
              <p className="mt-1 text-sm text-muted">
                Select a plan and number of users. A new billing period starts today after renewal.
              </p>
            </div>

            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {planCards.map(({ plan, periodTotal, monthly }) => {
                const selected = plan.id === selectedPlanId;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`rounded-sm border p-5 text-left transition ${
                      selected
                        ? 'border-primary bg-primary-soft/40 shadow-sm ring-2 ring-primary/20'
                        : 'border-base bg-surface hover:border-primary/40'
                    }`}
                  >
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-primary/20 bg-primary-soft">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      {selected ? <Check className="h-5 w-5 text-primary" /> : null}
                    </div>
                    <p className="font-semibold text-body">{plan.name}</p>
                    <p className="mt-1 text-xs text-muted">
                      {getBillingPeriodLabel(plan.billingPeriod, plan.durationDays)}
                    </p>
                    <p className="mt-3 text-2xl font-bold text-body">{formatMoney(periodTotal)}</p>
                    <p className="mt-1 text-xs text-muted">{formatMoney(monthly)}/month · min {plan.minUsers} users</p>
                  </button>
                );
              })}
            </div>

            {plans.length === 0 ? (
              <div className="rounded-sm border border-base bg-surface p-6 text-center text-sm text-muted">
                No paid plans are available yet. Please contact support.
              </div>
            ) : (
              <div className="rounded-sm border border-base bg-surface shadow-sm">
                <div className="border-b border-base px-6 py-4">
                  <h3 className="text-base font-semibold text-body">Renewal details</h3>
                </div>

                <div className="space-y-5 p-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-body">
                        <Users className="h-4 w-4 text-muted" />
                        Number of users (seats)
                      </label>
                      <input
                        type="number"
                        min={minSeats}
                        value={seatCount}
                        onChange={(e) => setSeatCount(e.target.value)}
                        className="h-11 w-full rounded-sm border border-base bg-surface px-3 text-sm text-body"
                      />
                      <p className="mt-1 text-xs text-muted">Minimum {minSeats} seats required</p>
                    </div>

                    <div>
                      <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-body">
                        <Calendar className="h-4 w-4 text-muted" />
                        New period ends
                      </label>
                      <div className="flex h-11 items-center rounded-sm border border-base bg-surface-2/50 px-3 text-sm text-body">
                        {quoteLoading ? 'Calculating...' : formatDate(quote?.newEndDate)}
                      </div>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-sm text-body">
                    <input
                      type="checkbox"
                      checked={autoRenew}
                      onChange={(e) => setAutoRenew(e.target.checked)}
                      className="rounded border-base"
                    />
                    Auto-renew when this period ends
                  </label>

                  <div className="rounded-sm border border-base bg-surface-2/50 p-4">
                    <p className="text-sm font-semibold text-body">Payment summary</p>
                    {quote ? (
                      <div className="mt-3 space-y-2 text-sm">
                        <div className="flex justify-between gap-4">
                          <span className="text-muted">Plan</span>
                          <span className="font-medium text-body">{quote.planName}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted">Users</span>
                          <span className="font-medium text-body">{quote.seatCount}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted">Monthly total</span>
                          <span className="font-medium text-body">{formatMoney(quote.monthlyTotal)}</span>
                        </div>
                        <div className="flex justify-between gap-4 border-t border-base pt-2">
                          <span className="font-semibold text-body">Amount due</span>
                          <span className="text-lg font-bold text-primary">{formatMoney(quote.amountDue)}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-muted">Select a plan to see pricing.</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleRenew()}
                    disabled={renewLoading || quoteLoading || !quote || seats < minSeats}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-sm bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8"
                  >
                    {renewLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    {renewLoading ? 'Renewing...' : 'Renew plan & continue'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
