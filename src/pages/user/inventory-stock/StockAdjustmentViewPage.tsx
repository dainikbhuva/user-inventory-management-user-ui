import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Ban, CheckCircle2, Pencil } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Button } from '../../../components/ui/Button';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { DocumentViewPreview } from '../../../components/documents/DocumentPreviewActions';
import { buildStockAdjustmentPrintData } from '../../../shared/utils/documentPrintBuilders';
import { inventoryStockService } from '../../../services/inventoryStock.service';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { ModulePermissionGuard } from '../../../components/common/ModulePermissionGuard';
import { useModulePermissions } from '../../../shared/permissions/PermissionContext';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import type { StockAdjustmentRecord } from '../../../shared/types/inventoryStock.types';
import { ADJUSTMENT_REASON_OPTIONS } from './StockAdjustmentForm';
import { StockMovementStatusBadge } from '../stock-movements/StockMovementStatusBadge';

const LIST_PATH = '/stock-adjustment';
const PERM = PORTAL_PERMISSION_MODULES.stockAdjustment;

const statusMap = (status: StockAdjustmentRecord['status']) =>
  status === 'approved' ? 'posted' : status === 'cancelled' ? 'cancelled' : 'draft';

const reasonLabel = (reason: string) =>
  ADJUSTMENT_REASON_OPTIONS.find((item) => item.value === reason)?.label ??
  reason.replace('_', ' ');

export const StockAdjustmentViewPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { canEdit } = useModulePermissions(PERM.moduleCode, PERM.itemCode);
  const [item, setItem] = useState<StockAdjustmentRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const loadItem = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setItem(await inventoryStockService.getAdjustmentById(id));
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load adjustment'));
      navigate(LIST_PATH);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItem();
  }, [id]);

  const handleApprove = async () => {
    if (!id) return;
    try {
      setIsApproving(true);
      await inventoryStockService.approveAdjustment(id);
      toast.success('Adjustment approved. Stock quantities updated.');
      setConfirmApprove(false);
      await loadItem();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to approve adjustment'));
    } finally {
      setIsApproving(false);
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    try {
      setIsCancelling(true);
      await inventoryStockService.cancelAdjustment(id);
      toast.success('Adjustment cancelled.');
      setConfirmCancel(false);
      await loadItem();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to cancel adjustment'));
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading || !item) {
    return (
      <UserLayout title="Stock Adjustment" subtitle="Loading…">
        <div className="text-muted">Loading…</div>
      </UserLayout>
    );
  }

  const canApprove = item.status === 'draft';
  const canCancel = item.status === 'draft' || item.status === 'approved';

  return (
    <ModulePermissionGuard
      moduleCode={PERM.moduleCode}
      itemCode={PERM.itemCode}
      action="view"
      moduleLabel="Stock adjustment"
    >
      <UserLayout
        title={`Stock Adjustment — ${item.adjustmentNumber}`}
        subtitle={`${item.adjustmentDate} · ${item.warehouse.name}`}
      >
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(LIST_PATH)}>
            <ArrowLeft className="mr-2 inline h-4 w-4" />
            Back to list
          </Button>
          <DocumentViewPreview item={item} build={buildStockAdjustmentPrintData} />
          {canEdit && item.status === 'draft' ? (
            <Button type="button" variant="secondary" onClick={() => navigate(`${LIST_PATH}/${id}/edit`)}>
              <Pencil className="mr-2 inline h-4 w-4" />
              Edit draft
            </Button>
          ) : null}
          {canEdit && canApprove ? (
            <Button type="button" onClick={() => setConfirmApprove(true)} disabled={isApproving}>
              <CheckCircle2 className="mr-2 inline h-4 w-4" />
              Approve adjustment
            </Button>
          ) : null}
          {canEdit && canCancel ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setConfirmCancel(true)}
              disabled={isCancelling}
            >
              <Ban className="mr-2 inline h-4 w-4" />
              Cancel
            </Button>
          ) : null}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-sm border border-base bg-surface p-6 shadow-sm lg:col-span-1">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-body">Document</h2>
              <StockMovementStatusBadge status={statusMap(item.status)} />
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-muted">Document no.</dt>
                <dd className="font-mono font-medium text-body">{item.adjustmentNumber}</dd>
              </div>
              <div>
                <dt className="text-muted">Date</dt>
                <dd className="text-body">{item.adjustmentDate}</dd>
              </div>
              <div>
                <dt className="text-muted">Warehouse</dt>
                <dd className="text-body">{item.warehouse.name}</dd>
              </div>
              <div>
                <dt className="text-muted">Reason</dt>
                <dd className="text-body">{reasonLabel(item.reason)}</dd>
              </div>
              {item.notes ? (
                <div>
                  <dt className="text-muted">Notes</dt>
                  <dd className="text-body">{item.notes}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-muted">Created by</dt>
                <dd className="text-body">{item.createdBy.name}</dd>
              </div>
              {item.approvedAt ? (
                <div>
                  <dt className="text-muted">Approved</dt>
                  <dd className="text-body">
                    {item.approvedBy?.name ?? '—'} · {new Date(item.approvedAt).toLocaleString()}
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section className="rounded-sm border border-base bg-surface p-6 shadow-sm lg:col-span-2">
            <h2 className="mb-4 text-base font-semibold text-body">Product lines</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-base text-left text-muted">
                    <th className="pb-2 pr-4 font-medium">#</th>
                    <th className="pb-2 pr-4 font-medium">Product</th>
                    <th className="pb-2 pr-4 font-medium">Code</th>
                    <th className="pb-2 pr-4 text-right font-medium">System</th>
                    <th className="pb-2 pr-4 text-right font-medium">Physical</th>
                    <th className="pb-2 text-right font-medium">Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {item.lines.map((line, index) => (
                    <tr key={`${line.productId}-${index}`} className="border-b border-base/60">
                      <td className="py-3 pr-4 text-muted">{index + 1}</td>
                      <td className="py-3 pr-4 font-medium text-body">{line.productName}</td>
                      <td className="py-3 pr-4 font-mono text-muted">{line.productCode}</td>
                      <td className="py-3 pr-4 text-right tabular-nums text-body">{line.systemQty}</td>
                      <td className="py-3 pr-4 text-right tabular-nums text-body">{line.physicalQty}</td>
                      <td
                        className={`py-3 text-right font-medium tabular-nums ${
                          line.differenceQty > 0
                            ? 'text-green-600'
                            : line.differenceQty < 0
                              ? 'text-red-600'
                              : 'text-body'
                        }`}
                      >
                        {line.differenceQty > 0 ? `+${line.differenceQty}` : line.differenceQty}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <ConfirmModal
          open={confirmApprove}
          title="Approve adjustment"
          message={`Approve "${item.adjustmentNumber}"? Warehouse stock will be set to the physical quantities entered.`}
          confirmLabel="Approve"
          isLoading={isApproving}
          onConfirm={handleApprove}
          onCancel={() => !isApproving && setConfirmApprove(false)}
        />

        <ConfirmModal
          open={confirmCancel}
          title="Cancel adjustment"
          message={
            item.status === 'approved'
              ? `Cancel "${item.adjustmentNumber}"? Stock will be reverted to system quantities before approval.`
              : `Cancel draft "${item.adjustmentNumber}"?`
          }
          confirmLabel="Cancel adjustment"
          variant="danger"
          isLoading={isCancelling}
          onConfirm={handleCancel}
          onCancel={() => !isCancelling && setConfirmCancel(false)}
        />
      </UserLayout>
    </ModulePermissionGuard>
  );
};
