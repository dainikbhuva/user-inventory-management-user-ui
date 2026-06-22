import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Ban, CheckCircle2, Pencil } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Button } from '../../../components/ui/Button';
import { stockMovementService } from '../../../services/stockMovement.service';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { ModulePermissionGuard } from '../../../components/common/ModulePermissionGuard';
import { useModulePermissions } from '../../../shared/permissions/PermissionContext';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import type { StockMovementRecord, StockMovementType } from '../../../shared/types/inventoryProduct.types';
import { StockMovementStatusBadge } from './StockMovementStatusBadge';
import { ConfirmModal } from '../../../components/common/ConfirmModal';

const configFor = (movementType: StockMovementType) => {
  if (movementType === 'in') {
    return {
      listPath: '/stock-in',
      editPath: (id: string) => `/stock-in/${id}/edit`,
      perm: PORTAL_PERMISSION_MODULES.stockIn,
      title: 'Stock In',
      moduleLabel: 'Stock in',
    };
  }
  return {
    listPath: '/stock-out',
    editPath: (id: string) => `/stock-out/${id}/edit`,
    perm: PORTAL_PERMISSION_MODULES.stockOut,
    title: 'Stock Out',
    moduleLabel: 'Stock out',
  };
};

export const StockMovementViewPage = ({ movementType }: { movementType: StockMovementType }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const config = configFor(movementType);
  const { canEdit } = useModulePermissions(config.perm.moduleCode, config.perm.itemCode);
  const [item, setItem] = useState<StockMovementRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [confirmPost, setConfirmPost] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const loadItem = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setItem(await stockMovementService.getById(movementType, id));
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load document'));
      navigate(config.listPath);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItem();
  }, [id, movementType]);

  const handlePost = async () => {
    if (!id) return;
    try {
      setIsPosting(true);
      await stockMovementService.post(movementType, id);
      toast.success('Document posted. Product quantities updated.');
      setConfirmPost(false);
      await loadItem();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to post document'));
    } finally {
      setIsPosting(false);
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    try {
      setIsCancelling(true);
      await stockMovementService.cancel(movementType, id);
      toast.success('Document cancelled.');
      setConfirmCancel(false);
      await loadItem();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to cancel document'));
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading || !item) {
    return (
      <UserLayout title={config.title} subtitle="Loading document…">
        <div className="text-muted">Loading…</div>
      </UserLayout>
    );
  }

  const canPost = item.status === 'draft';
  const canCancel = item.status === 'draft' || item.status === 'posted';

  return (
    <ModulePermissionGuard
      moduleCode={config.perm.moduleCode}
      itemCode={config.perm.itemCode}
      action="view"
      moduleLabel={config.moduleLabel}
    >
      <UserLayout
        title={`${config.title} — ${item.documentNo}`}
        subtitle={`${item.movementDate} · ${item.warehouse.name}`}
      >
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(config.listPath)}>
            <ArrowLeft className="mr-2 inline h-4 w-4" />
            Back to list
          </Button>
          {canEdit && item.status === 'draft' ? (
            <Button type="button" variant="secondary" onClick={() => navigate(config.editPath(id!))}>
              <Pencil className="mr-2 inline h-4 w-4" />
              Edit draft
            </Button>
          ) : null}
          {canPost ? (
            <Button type="button" onClick={() => setConfirmPost(true)} disabled={isPosting}>
              <CheckCircle2 className="mr-2 inline h-4 w-4" />
              Post document
            </Button>
          ) : null}
          {canCancel ? (
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
              <StockMovementStatusBadge status={item.status} />
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-muted">Document no.</dt>
                <dd className="font-mono font-medium text-body">{item.documentNo}</dd>
              </div>
              <div>
                <dt className="text-muted">Date</dt>
                <dd className="text-body">{item.movementDate}</dd>
              </div>
              <div>
                <dt className="text-muted">Warehouse</dt>
                <dd className="text-body">{item.warehouse.name}</dd>
              </div>
              {item.supplier ? (
                <div>
                  <dt className="text-muted">Supplier</dt>
                  <dd className="text-body">{item.supplier.name}</dd>
                </div>
              ) : null}
              {item.referenceNo ? (
                <div>
                  <dt className="text-muted">Reference</dt>
                  <dd className="text-body">{item.referenceNo}</dd>
                </div>
              ) : null}
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
              {item.postedAt ? (
                <div>
                  <dt className="text-muted">Posted</dt>
                  <dd className="text-body">
                    {item.postedBy?.name ?? '—'} · {new Date(item.postedAt).toLocaleString()}
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section className="rounded-sm border border-base bg-surface p-6 shadow-sm lg:col-span-2">
            <h2 className="mb-4 text-base font-semibold text-body">Line items</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="border-b border-base text-left text-muted">
                    <th className="pb-2 pr-4 font-medium">#</th>
                    <th className="pb-2 pr-4 font-medium">Product</th>
                    <th className="pb-2 pr-4 font-medium">Code</th>
                    <th className="pb-2 pr-4 text-right font-medium">Qty</th>
                    {movementType === 'in' ? (
                      <th className="pb-2 text-right font-medium">Unit cost</th>
                    ) : null}
                  </tr>
                </thead>
                <tbody>
                  {item.lines.map((line, index) => (
                    <tr key={`${line.productId}-${index}`} className="border-b border-base/60">
                      <td className="py-3 pr-4 text-muted">{index + 1}</td>
                      <td className="py-3 pr-4 font-medium text-body">{line.productName}</td>
                      <td className="py-3 pr-4 font-mono text-muted">{line.productCode}</td>
                      <td className="py-3 pr-4 text-right tabular-nums text-body">{line.quantity}</td>
                      {movementType === 'in' ? (
                        <td className="py-3 text-right tabular-nums text-body">
                          {line.unitCost !== undefined ? line.unitCost.toFixed(2) : '—'}
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={movementType === 'in' ? 4 : 3} className="pt-3 text-right font-medium text-muted">
                      Total quantity
                    </td>
                    <td className="pt-3 text-right font-semibold tabular-nums text-body">
                      {item.totalQuantity}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        </div>

        <ConfirmModal
          open={confirmPost}
          title="Post document"
          message={`Post "${item.documentNo}"? This will ${movementType === 'in' ? 'increase' : 'decrease'} product stock quantities.`}
          confirmLabel="Post"
          isLoading={isPosting}
          onConfirm={handlePost}
          onCancel={() => !isPosting && setConfirmPost(false)}
        />

        <ConfirmModal
          open={confirmCancel}
          title="Cancel document"
          message={
            item.status === 'posted'
              ? `Cancel "${item.documentNo}"? Stock changes will be reversed.`
              : `Cancel draft "${item.documentNo}"?`
          }
          confirmLabel="Cancel document"
          variant="danger"
          isLoading={isCancelling}
          onConfirm={handleCancel}
          onCancel={() => !isCancelling && setConfirmCancel(false)}
        />
      </UserLayout>
    </ModulePermissionGuard>
  );
};

export const StockInViewPage = () => <StockMovementViewPage movementType="in" />;
export const StockOutViewPage = () => <StockMovementViewPage movementType="out" />;
