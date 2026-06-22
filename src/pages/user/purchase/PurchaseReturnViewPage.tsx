import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Pencil, XCircle } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Button } from '../../../components/ui/Button';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { purchaseReturnService } from '../../../services/trading.service';
import type { PurchaseReturnRecord } from '../../../shared/types/trading.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { TradingStatusBadge } from '../trading/TradingStatusBadge';
import { useModulePermissions } from '../../../shared/permissions/PermissionContext';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import { ModulePermissionGuard } from '../../../components/common/ModulePermissionGuard';

const LIST_PATH = '/purchase/purchase-returns';
const PERM = PORTAL_PERMISSION_MODULES.purchaseReturns;
const formatDate = (d?: string) => (d ? new Date(d).toLocaleDateString('en-IN') : '—');
const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);

const InfoRow = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
    <span className="min-w-[140px] text-sm text-muted">{label}</span>
    <span className="text-sm font-medium text-body">{value || '—'}</span>
  </div>
);

export const PurchaseReturnViewPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { canEdit } = useModulePermissions(PERM.moduleCode, PERM.itemCode);
  const [item, setItem] = useState<PurchaseReturnRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    purchaseReturnService.getById(id).then(setItem)
      .catch((err) => { toast.error(getApiErrorMessage(err, 'Failed to load purchase return')); navigate(LIST_PATH); })
      .finally(() => setIsLoading(false));
  }, [id, navigate]);

  const handlePost = async () => {
    if (!id) return;
    try {
      setIsPosting(true);
      const updated = await purchaseReturnService.post(id);
      setItem(updated);
      toast.success('Return posted. Stock updated.');
    } catch (err) { toast.error(getApiErrorMessage(err, 'Failed to post return')); }
    finally { setIsPosting(false); }
  };

  const handleCancel = async () => {
    if (!id) return;
    try {
      setIsCancelling(true);
      const updated = await purchaseReturnService.cancel(id);
      setItem(updated); setShowCancelModal(false);
      toast.success('Purchase return cancelled.');
    } catch (err) { toast.error(getApiErrorMessage(err, 'Failed to cancel return')); }
    finally { setIsCancelling(false); }
  };

  return (
    <ModulePermissionGuard moduleCode={PERM.moduleCode} itemCode={PERM.itemCode} action="view" moduleLabel="Purchase Returns">
      <UserLayout title="Purchase Return" subtitle="View purchase return details">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(LIST_PATH)}>
            <ArrowLeft className="mr-2 inline h-4 w-4" />Back
          </Button>
          {item && canEdit && item.status === 'draft' ? (
            <>
              <Button type="button" variant="secondary" onClick={() => navigate(`${LIST_PATH}/${id}/edit`)}>
                <Pencil className="mr-2 inline h-4 w-4" />Edit
              </Button>
              <Button type="button" variant="default" isLoading={isPosting} onClick={handlePost}>
                <CheckCircle className="mr-2 inline h-4 w-4" />Post Return
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowCancelModal(true)}>
                <XCircle className="mr-2 inline h-4 w-4" />Cancel
              </Button>
            </>
          ) : null}
        </div>
        {isLoading || !item ? (
          <div className="flex h-64 items-center justify-center text-muted">Loading...</div>
        ) : (
          <div className="flex flex-col gap-6">
            <section className="rounded-sm border border-base bg-surface p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-body">{item.returnNumber}</h1>
                  <p className="text-sm text-muted">Purchase Return</p>
                </div>
                <TradingStatusBadge status={item.status} className="text-sm" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <InfoRow label="Return Date" value={formatDate(item.returnDate)} />
                <InfoRow label="Supplier" value={item.supplierName} />
                <InfoRow label="Warehouse" value={item.warehouseName} />
                <InfoRow label="GRN Reference" value={item.grnNumber} />
                <InfoRow label="Reference No." value={item.referenceNo} />
                <InfoRow label="Notes" value={item.notes} />
              </div>
            </section>
            <section className="rounded-sm border border-base bg-surface shadow-sm">
              <div className="border-b border-base px-6 py-4"><h2 className="text-base font-semibold text-body">Returned Items</h2></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-base bg-surface-2">
                      <th className="px-4 py-2.5 text-left font-medium text-muted">#</th>
                      <th className="px-4 py-2.5 text-left font-medium text-muted">Product</th>
                      <th className="px-4 py-2.5 text-left font-medium text-muted">Reason</th>
                      <th className="px-4 py-2.5 text-right font-medium text-muted">Qty</th>
                      <th className="px-4 py-2.5 text-right font-medium text-muted">Unit Cost</th>
                      <th className="px-4 py-2.5 text-right font-medium text-muted">Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.lines.map((line, i) => (
                      <tr key={i} className="border-b border-base last:border-0">
                        <td className="px-4 py-3 text-muted">{i + 1}</td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-body">{line.productName}</span>
                          {line.productCode ? <span className="ml-2 font-mono text-xs text-muted">{line.productCode}</span> : null}
                        </td>
                        <td className="px-4 py-3 text-muted">{line.reason || '—'}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-body">{line.quantity}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-body">{formatCurrency(line.unitCost)}</td>
                        <td className="px-4 py-3 text-right tabular-nums font-medium text-body">{formatCurrency(line.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-base bg-surface-2">
                      <td colSpan={5} className="px-4 py-2.5 text-right text-sm font-semibold text-body">Total</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-lg font-semibold text-body">{formatCurrency(item.totalAmount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>
          </div>
        )}
        <ConfirmModal open={showCancelModal} title="Cancel return" message={`Cancel "${item?.returnNumber}"?`}
          confirmLabel="Cancel Return" variant="danger" isLoading={isCancelling} onConfirm={handleCancel} onCancel={() => !isCancelling && setShowCancelModal(false)} />
      </UserLayout>
    </ModulePermissionGuard>
  );
};
