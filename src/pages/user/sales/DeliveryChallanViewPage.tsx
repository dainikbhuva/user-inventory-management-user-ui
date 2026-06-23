import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, PackageCheck, Pencil, XCircle } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Button } from '../../../components/ui/Button';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { deliveryChallanService } from '../../../services/trading.service';
import type { DeliveryChallanRecord } from '../../../shared/types/trading.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { TradingStatusBadge } from '../trading/TradingStatusBadge';
import { useModulePermissions } from '../../../shared/permissions/PermissionContext';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import { ModulePermissionGuard } from '../../../components/common/ModulePermissionGuard';
import { DocumentViewPreview } from '../../../components/documents/DocumentPreviewActions';
import { buildDeliveryChallanPrintData } from '../../../shared/utils/documentPrintBuilders';

const LIST_PATH = '/sales/delivery-challans';
const PERM = PORTAL_PERMISSION_MODULES.deliveryChallans;
const formatDate = (d?: string) => (d ? new Date(d).toLocaleDateString('en-IN') : '—');
const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);

const InfoRow = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
    <span className="min-w-[140px] text-sm text-muted">{label}</span>
    <span className="text-sm font-medium text-body">{value || '—'}</span>
  </div>
);

export const DeliveryChallanViewPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { canEdit } = useModulePermissions(PERM.moduleCode, PERM.itemCode);
  const [item, setItem] = useState<DeliveryChallanRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDispatching, setIsDispatching] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    deliveryChallanService.getById(id).then(setItem)
      .catch((err) => { toast.error(getApiErrorMessage(err, 'Failed to load challan')); navigate(LIST_PATH); })
      .finally(() => setIsLoading(false));
  }, [id, navigate]);

  const handleDispatch = async () => {
    if (!id) return;
    try {
      setIsDispatching(true);
      const updated = await deliveryChallanService.dispatch(id);
      setItem(updated); toast.success('Challan dispatched. Stock updated.');
    } catch (err) { toast.error(getApiErrorMessage(err, 'Failed to dispatch')); }
    finally { setIsDispatching(false); }
  };

  const handleCancel = async () => {
    if (!id) return;
    try {
      setIsCancelling(true);
      const updated = await deliveryChallanService.cancel(id);
      setItem(updated); setShowCancelModal(false);
      toast.success('Challan cancelled.');
    } catch (err) { toast.error(getApiErrorMessage(err, 'Failed to cancel challan')); }
    finally { setIsCancelling(false); }
  };

  return (
    <ModulePermissionGuard moduleCode={PERM.moduleCode} itemCode={PERM.itemCode} action="view" moduleLabel="Delivery Challans">
      <UserLayout title="Delivery Challan" subtitle="View challan details">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(LIST_PATH)}>
            <ArrowLeft className="mr-2 inline h-4 w-4" />Back
          </Button>
          <DocumentViewPreview item={item} build={buildDeliveryChallanPrintData} />
          {item && canEdit && item.status === 'draft' ? (
            <>
              <Button type="button" variant="secondary" onClick={() => navigate(`${LIST_PATH}/${id}/edit`)}>
                <Pencil className="mr-2 inline h-4 w-4" />Edit
              </Button>
              <Button type="button" variant="default" isLoading={isDispatching} onClick={handleDispatch}>
                <PackageCheck className="mr-2 inline h-4 w-4" />Mark Dispatched
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
                  <h1 className="text-xl font-bold text-body">{item.dcNumber}</h1>
                  <p className="text-sm text-muted">Delivery Challan</p>
                </div>
                <TradingStatusBadge status={item.status} className="text-sm" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <InfoRow label="Challan Date" value={formatDate(item.dcDate)} />
                <InfoRow label="Customer" value={item.customerName} />
                <InfoRow label="Warehouse" value={item.warehouseName} />
                <InfoRow label="Sales Order" value={item.soNumber} />
                <InfoRow label="Reference No." value={item.referenceNo} />
                <InfoRow label="Notes" value={item.notes} />
              </div>
            </section>
            <section className="rounded-sm border border-base bg-surface shadow-sm">
              <div className="border-b border-base px-6 py-4"><h2 className="text-base font-semibold text-body">Dispatched Items</h2></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-base bg-surface-2">
                      <th className="px-4 py-2.5 text-left font-medium text-muted">#</th>
                      <th className="px-4 py-2.5 text-left font-medium text-muted">Product</th>
                      <th className="px-4 py-2.5 text-right font-medium text-muted">Dispatched Qty</th>
                      <th className="px-4 py-2.5 text-right font-medium text-muted">Unit Price</th>
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
                        <td className="px-4 py-3 text-right tabular-nums text-body">{line.dispatchedQty}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-body">{formatCurrency(line.unitPrice)}</td>
                        <td className="px-4 py-3 text-right tabular-nums font-medium text-body">{formatCurrency(line.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-base bg-surface-2">
                      <td colSpan={4} className="px-4 py-2.5 text-right text-sm font-semibold text-body">Total</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-lg font-semibold text-body">{formatCurrency(item.totalAmount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>
          </div>
        )}
        <ConfirmModal open={showCancelModal} title="Cancel challan" message={`Cancel "${item?.dcNumber}"?`}
          confirmLabel="Cancel Challan" variant="danger" isLoading={isCancelling} onConfirm={handleCancel} onCancel={() => !isCancelling && setShowCancelModal(false)} />
      </UserLayout>
    </ModulePermissionGuard>
  );
};
