import { useEffect, useMemo, useState } from 'react';
import { CreditCard, RefreshCw, TrendingUp, Users, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useSubscription } from '../../../shared/subscription/SubscriptionContext';
import { usePermissions } from '../../../shared/permissions/PermissionContext';
import { useAuth } from '../../../shared/auth/useAuth';
import {
  subscriptionService,
  type PortalPlanSummary,
  type PortalSubscriptionQuote,
} from '../../../services/subscription.service';
import { paymentService } from '../../../services/payment.service';
import { loadRazorpayScript, openRazorpayCheckout } from '../../../shared/utils/razorpay';
import {
  computeBillingPeriodTotal,
  getBillingPeriodConfig,
  getBillingPeriodLabel,
  PLAN_MIN_USERS,
} from '../../../shared/utils/planBilling';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { toast } from '../../../shared/utils/toast';

const formatDate = (value?: string) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatMoney = (amount: number) => (amount === 0 ? 'Free' : `₹${amount.toLocaleString()}`);

export const SettingsBillingPage = () => {
  const { subscription, refresh, isLoading } = useSubscription();
  const { isSuperAdmin } = usePermissions();
  const { user } = useAuth();
  const [plans, setPlans] = useState<PortalPlanSummary[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [seatCount, setSeatCount] = useState(String(PLAN_MIN_USERS));
  const [autoRenew, setAutoRenew] = useState(true);
  const [quote, setQuote] = useState<PortalSubscriptionQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [mode, setMode] = useState<'upgrade' | 'renew'>('upgrade');

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);
  const seats = Number(seatCount) || PLAN_MIN_USERS;
  const minSeats = Math.max(
    selectedPlan?.minUsers ?? PLAN_MIN_USERS,
    subscription?.activeUserCount ?? PLAN_MIN_USERS,
    subscription?.seatCount ?? PLAN_MIN_USERS
  );

  const canUpgrade = subscription && !subscription.isExpired && subscription.status === 'active';
  const canRenew = subscription?.isExpired || subscription?.status === 'expired';

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const response = await subscriptionService.getPlans();
        const items = response.data ?? [];
        setPlans(items);
        if (items.length > 0) {
          const currentId = subscription?.plan.id;
          const match = items.find((plan) => plan.id === currentId);
          setSelectedPlanId(match?.id ?? items[0]!.id);
        }
      } catch {
        toast.error('Failed to load plans');
      }
    };
    void loadPlans();
  }, [subscription?.plan.id]);

  useEffect(() => {
    if (!subscription) return;
    setSeatCount(String(Math.max(subscription.seatCount, subscription.activeUserCount, PLAN_MIN_USERS)));
    setAutoRenew(subscription.autoRenew);
    setMode(subscription.isExpired ? 'renew' : 'upgrade');
  }, [subscription]);

  useEffect(() => {
    if (!selectedPlanId || !subscription) {
      setQuote(null);
      return;
    }

    const timer = window.setTimeout(async () => {
      if (seats < minSeats) {
        setQuote(null);
        return;
      }
      try {
        setQuoteLoading(true);
        const payload = { planId: selectedPlanId, seatCount: seats };
        const response =
          mode === 'renew' || canRenew
            ? await subscriptionService.quoteRenew(payload)
            : await subscriptionService.quoteUpgrade(payload);
        setQuote(response.data ?? null);
      } catch (err) {
        setQuote(null);
        toast.error(getApiErrorMessage(err, 'Could not calculate price'));
      } finally {
        setQuoteLoading(false);
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [selectedPlanId, seats, minSeats, mode, canRenew, subscription]);

  const listPricePreview = useMemo(() => {
    if (!selectedPlan) return 0;
    const months = getBillingPeriodConfig(selectedPlan.billingPeriod).durationMonths;
    return computeBillingPeriodTotal(selectedPlan.finalPrice, seats, months);
  }, [selectedPlan, seats]);

  const handlePay = async () => {
    if (!selectedPlanId || !isSuperAdmin || !quote) return;
    const action = mode === 'renew' || canRenew ? 'renew' : 'upgrade';

    try {
      setActionLoading(true);
      const checkoutRes = await paymentService.checkout({
        action,
        planId: selectedPlanId,
        seatCount: seats,
        ...(action === 'renew' ? { autoRenew } : {}),
      });
      const checkout = checkoutRes.data;
      if (!checkout) {
        throw new Error('Failed to start checkout');
      }

      if (checkout.amount <= 0 || !checkout.orderId) {
        toast.success(action === 'renew' ? 'Plan renewed successfully' : 'Plan updated successfully');
        await refresh();
        setQuote(null);
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error('Could not load Razorpay. Check your internet connection.');
      }

      const payment = await openRazorpayCheckout({
        keyId: checkout.keyId,
        orderId: checkout.orderId,
        amount: checkout.amount,
        currency: checkout.currency,
        description: `${checkout.quote.planName} · ${seats} users`,
        prefill: { name: user?.name, email: user?.email },
      });

      await paymentService.verify({
        transactionId: checkout.transactionId,
        razorpay_order_id: payment.razorpay_order_id,
        razorpay_payment_id: payment.razorpay_payment_id,
        razorpay_signature: payment.razorpay_signature,
      });

      toast.success(action === 'renew' ? 'Plan renewed successfully' : 'Plan updated successfully');
      await refresh();
      setQuote(null);
    } catch (err) {
      const message = getApiErrorMessage(err, 'Payment failed');
      if (message !== 'Payment cancelled') {
        toast.error(message);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleAutoRenewToggle = async () => {
    if (!isSuperAdmin || !subscription) return;
    const next = !subscription.autoRenew;
    try {
      await subscriptionService.setAutoRenew(next);
      toast.success(next ? 'Auto-renew enabled' : 'Auto-renew disabled');
      await refresh();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update auto-renew'));
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-sm border border-base bg-surface p-8 text-center text-sm text-muted">
        Loading subscription...
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="rounded-sm border border-base bg-surface p-8 text-center">
        <AlertCircle className="mx-auto mb-3 h-8 w-8 text-muted" />
        <p className="text-sm text-muted">No subscription found for this company.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-sm border border-base bg-surface shadow-sm">
        <div className="border-b border-base px-6 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-body">Current plan</h2>
              <p className="mt-1 text-sm text-muted">Your company subscription, seats, and renewal status.</p>
            </div>
            <span
              className={`rounded-sm px-2.5 py-1 text-xs font-semibold ${
                subscription.isExpired
                  ? 'bg-red-50 text-red-700'
                  : subscription.isExpiringSoon
                    ? 'bg-amber-50 text-amber-800'
                    : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {subscription.isExpired
                ? 'Expired'
                : subscription.isTrial
                  ? `Trial · ${subscription.daysRemaining} days left`
                  : subscription.isExpiringSoon
                    ? `Expires in ${subscription.daysRemaining} days`
                    : 'Active'}
            </span>
          </div>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-sm border border-base bg-surface-2/40 p-4">
            <div className="mb-2 flex items-center gap-2 text-muted">
              <CreditCard className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Plan</span>
            </div>
            <p className="text-base font-semibold text-body">{subscription.plan.name}</p>
            <p className="mt-1 text-xs text-muted">
              {getBillingPeriodLabel(subscription.plan.billingPeriod, subscription.plan.durationDays)}
            </p>
          </div>

          <div className="rounded-sm border border-base bg-surface-2/40 p-4">
            <div className="mb-2 flex items-center gap-2 text-muted">
              <Users className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Users</span>
            </div>
            <p className="text-base font-semibold text-body">
              {subscription.activeUserCount} / {subscription.seatCount}
            </p>
            <p className="mt-1 text-xs text-muted">{subscription.seatsRemaining} seats available</p>
          </div>

          <div className="rounded-sm border border-base bg-surface-2/40 p-4">
            <div className="mb-2 flex items-center gap-2 text-muted">
              <Calendar className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Validity</span>
            </div>
            <p className="text-sm font-semibold text-body">{formatDate(subscription.startDate)}</p>
            <p className="mt-1 text-xs text-muted">to {formatDate(subscription.endDate)}</p>
          </div>

          <div className="rounded-sm border border-base bg-surface-2/40 p-4">
            <div className="mb-2 flex items-center gap-2 text-muted">
              <RefreshCw className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Auto renew</span>
            </div>
            <p className="text-base font-semibold text-body">{subscription.autoRenew ? 'On' : 'Off'}</p>
            {isSuperAdmin ? (
              <button
                type="button"
                onClick={() => void handleAutoRenewToggle()}
                className="mt-2 text-xs font-semibold text-primary hover:opacity-80"
              >
                {subscription.autoRenew ? 'Turn off' : 'Turn on'}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {isSuperAdmin ? (
        <div className="rounded-sm border border-base bg-surface shadow-sm">
          <div className="border-b border-base px-6 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setMode('upgrade')}
                disabled={!canUpgrade}
                className={`rounded-sm px-3 py-1.5 text-sm font-medium ${
                  mode === 'upgrade' && canUpgrade
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-surface-2 text-muted'
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4" />
                  Upgrade / add users
                </span>
              </button>
              <button
                type="button"
                onClick={() => setMode('renew')}
                className={`rounded-sm px-3 py-1.5 text-sm font-medium ${
                  mode === 'renew' || canRenew ? 'bg-primary text-primary-foreground' : 'bg-surface-2 text-muted'
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <RefreshCw className="h-4 w-4" />
                  Renew plan
                </span>
              </button>
            </div>
            <p className="mt-3 text-sm text-muted">
              {subscription.isTrial
                ? `Free trial: ${subscription.activeUserCount} of ${subscription.seatCount} seats used. Pay to add more users or continue with a paid plan.`
                : mode === 'renew' || canRenew
                  ? 'Start a new billing period after expiry. Full plan price applies for the selected term.'
                  : 'Change plan or add users mid-term. You only pay the prorated difference for the remaining days.'}
            </p>
          </div>

          <div className="space-y-5 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-body">Plan</label>
                <select
                  className="h-11 w-full rounded-sm border border-base bg-surface px-3 text-sm text-body"
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                >
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} · {getBillingPeriodLabel(plan.billingPeriod, plan.durationDays)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-body">Number of users (seats)</label>
                <input
                  type="number"
                  min={minSeats}
                  className="h-11 w-full rounded-sm border border-base bg-surface px-3 text-sm text-body"
                  value={seatCount}
                  onChange={(e) => setSeatCount(e.target.value)}
                />
                <p className="mt-1 text-xs text-muted">Minimum {minSeats} seats for this plan</p>
              </div>
            </div>

            {mode === 'renew' || canRenew ? (
              <label className="flex items-center gap-2 text-sm text-body">
                <input
                  type="checkbox"
                  checked={autoRenew}
                  onChange={(e) => setAutoRenew(e.target.checked)}
                  className="rounded border-base"
                />
                Auto-renew when this period ends
              </label>
            ) : null}

            <div className="rounded-sm border border-base bg-surface-2/50 p-4">
              <p className="text-sm font-semibold text-body">Price calculation</p>
              {quoteLoading ? (
                <p className="mt-2 text-sm text-muted">Calculating...</p>
              ) : quote ? (
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted">Plan list price</span>
                    <span className="font-medium text-body">{formatMoney(listPricePreview)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted">Monthly total</span>
                    <span className="font-medium text-body">{formatMoney(quote.monthlyTotal)}</span>
                  </div>
                  {quote.action === 'upgrade' && quote.remainingDays !== undefined ? (
                    <>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted">Remaining days in current period</span>
                        <span className="font-medium text-body">{quote.remainingDays}</span>
                      </div>
                      {quote.seatDelta && quote.seatDelta > 0 ? (
                        <div className="flex justify-between gap-4">
                          <span className="text-muted">Additional seats</span>
                          <span className="font-medium text-body">+{quote.seatDelta}</span>
                        </div>
                      ) : null}
                      {quote.isPlanChange ? (
                        <div className="flex justify-between gap-4">
                          <span className="text-muted">Plan change proration</span>
                          <span className="font-medium text-body">
                            {formatMoney(quote.currentRemainingValue ?? 0)} credit →{' '}
                            {formatMoney(quote.nextRemainingValue ?? 0)} new value
                          </span>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div className="flex justify-between gap-4">
                      <span className="text-muted">New period ends</span>
                      <span className="font-medium text-body">{formatDate(quote.newEndDate)}</span>
                    </div>
                  )}
                  <div className="flex justify-between gap-4 border-t border-base pt-2">
                    <span className="font-semibold text-body">Amount due now</span>
                    <span className="text-lg font-bold text-primary">{formatMoney(quote.amountDue)}</span>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted">Select plan and seats to see pricing.</p>
              )}
            </div>

            <Button
              type="button"
              onClick={() => void handlePay()}
              disabled={actionLoading || quoteLoading || !quote || seats < minSeats}
              className="w-full sm:w-auto"
            >
              {actionLoading
                ? 'Processing...'
                : quote && quote.amountDue <= 0
                  ? mode === 'renew' || canRenew
                    ? 'Renew plan'
                    : 'Apply upgrade'
                  : `Pay ${quote ? formatMoney(quote.amountDue) : ''}`}
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Only Super Admin can renew or upgrade the company plan. Contact your administrator.
        </div>
      )}
    </div>
  );
};
