import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Play, XCircle } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Button } from '../../../components/ui/Button';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { workOrderService } from '../../../services/workOrder.service';
import type { WorkOrderRecord } from '../../../shared/types/manufacturing.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { ManufacturingStatusBadge } from '../manufacturing/ManufacturingStatusBadge';
import { useModulePermissions } from '../../../shared/permissions/PermissionContext';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import { ModulePermissionGuard } from '../../../components/common/ModulePermissionGuard';

const LIST_PATH = '/manufacturing/work-orders';
const PERM = PORTAL_PERMISSION_MODULES.workOrders;

const formatDate = (d?: string) => (d ? new Date(d).toLocaleDateString('en-IN') : '—');
const InfoRow = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
    <span className="min-w-[140px] text-sm text-muted">{label}</span>
    <span className="text-sm font-medium text-body">{value || '—'}</span>
  </div>
);

export const WorkOrderViewPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { canEdit } = useModulePermissions(PERM.moduleCode, PERM.itemCode);
  const [item, setItem] = useState<WorkOrderRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    workOrderService.getById(id)
      .then(setItem)
      .catch((err) => { toast.error(getApiErrorMessage(err, 'Failed to load work order')); navigate(LIST_PATH); })
      .finally(() => setIsLoading(false));
  }, [id, navigate]);

  const handleStart = async () => {
    if (!id) return;
    try {
      setIsStarting(true);
      setItem(await workOrderService.start(id));
      toast.success('Work order started — materials can now be issued.');
    } catch (err) { toast.error(getApiErrorMessage(err, 'Failed to start')); }
    finally { setIsStarting(false); }
  };

  const handleCancel = async () => {
    if (!id) return;
    try {
      setIsCancelling(true);
      setItem(await workOrderService.cancel(id));
      setShowCancelModal(false);
      toast.success('Work order cancelled.');
    } catch (err) { toast.error(getApiErrorMessage(err, 'Failed to cancel')); }
    finally { setIsCancelling(false); }
  };

  return (
    <ModulePermissionGuard moduleCode={PERM.moduleCode} itemCode={PERM.itemCode} action="view" moduleLabel="Work Orders">
      <UserLayout title="Work Order" subtitle="View work order details">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(LIST_PATH)}>
            <ArrowLeft className="mr-2 inline h-4 w-4" /> Back
          </Button>
          {item && canEdit && item.status === 'draft' ? (
            <>
              <Button type="button" variant="secondary" onClick={() => navigate(`${LIST_PATH}/${id}/edit`)}>
                <Pencil className="mr-2 inline h-4 w-4" /> Edit
              </Button>
              <Button type="button" variant="default" isLoading={isStarting} onClick={handleStart}>
                <Play className="mr-2 inline h-4 w-4" /> Start Production
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowCancelModal(true)}>
                <XCircle className="mr-2 inline h-4 w-4" /> Cancel
              </Button>
            </>
          ) : null}
          {item && canEdit && item.status === 'in_progress' ? (
            <Button type="button" variant="secondary" onClick={() => setShowCancelModal(true)}>
              <XCircle className="mr-2 inline h-4 w-4" /> Cancel WO
            </Button>
          ) : null}
        </div>

        {isLoading || !item ? (
          <div className="flex h-64 items-center justify-center text-muted">Loading...</div>
        ) : (
          <div className="flex flex-col gap-6">
            <section className="rounded-sm border border-base bg-surface p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-body">{item.workOrderNumber}</h1>
                  <p className="text-sm text-muted">Work Order</p>
                </div>
                <ManufacturingStatusBadge status={item.status} className="text-sm" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <InfoRow label="Date" value={formatDate(item.workOrderDate)} />
                <InfoRow label="Scheduled Date" value={formatDate(item.scheduledDate)} />
                <InfoRow label="Completed Date" value={formatDate(item.completedDate)} />
                <InfoRow label="Planned Qty" value={String(item.plannedQty)} />
                <InfoRow label="Produced Qty" value={String(item.producedQty)} />
                <InfoRow label="Notes" value={item.notes} />
              </div>
            </section>

            {/* Materials */}
            <section className="rounded-sm border border-base bg-surface shadow-sm">
              <div className="border-b border-base px-6 py-4">
                <h2 className="text-base font-semibold text-body">Material Requirements</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-base bg-surface-2">
                      <th className="px-4 py-2.5 text-left font-medium text-muted">#</th>
                      <th className="px-4 py-2.5 text-left font-medium text-muted">Material</th>
                      <th className="px-4 py-2.5 text-right font-medium text-muted">Required</th>
                      <th className="px-4 py-2.5 text-right font-medium text-muted">Issued</th>
                      <th className="px-4 py-2.5 text-right font-medium text-muted">Returned</th>
                      <th className="px-4 py-2.5 text-right font-medium text-muted">Net Used</th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.materials.map((mat, i) => {
                      const netUsed = mat.issuedQty - mat.returnedQty;
                      return (
                        <tr key={i} className="border-b border-base last:border-0">
                          <td className="px-4 py-3 text-muted">{i + 1}</td>
                          <td className="px-4 py-3 font-mono text-xs text-body">{mat.productId}</td>
                          <td className="px-4 py-3 text-right tabular-nums text-body">{mat.requiredQty}</td>
                          <td className="px-4 py-3 text-right tabular-nums text-blue-600">{mat.issuedQty}</td>
                          <td className="px-4 py-3 text-right tabular-nums text-green-600">{mat.returnedQty}</td>
                          <td className="px-4 py-3 text-right tabular-nums font-medium text-body">{netUsed}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        <ConfirmModal
          open={showCancelModal}
          title="Cancel Work Order"
          message={`Cancel "${item?.workOrderNumber}"? This action cannot be undone.`}
          confirmLabel="Cancel WO"
          variant="danger"
          isLoading={isCancelling}
          onConfirm={handleCancel}
          onCancel={() => !isCancelling && setShowCancelModal(false)}
        />
      </UserLayout>
    </ModulePermissionGuard>
  );
};
