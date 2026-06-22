import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Pencil, XCircle } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Button } from '../../../components/ui/Button';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { productionEntryService } from '../../../services/productionEntry.service';
import type { ProductionEntryRecord } from '../../../shared/types/manufacturing.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { ManufacturingStatusBadge } from '../manufacturing/ManufacturingStatusBadge';
import { useModulePermissions } from '../../../shared/permissions/PermissionContext';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import { ModulePermissionGuard } from '../../../components/common/ModulePermissionGuard';

const LIST_PATH = '/manufacturing/production-entries';
const PERM = PORTAL_PERMISSION_MODULES.productionEntries;
const formatDate = (d?: string) => (d ? new Date(d).toLocaleDateString('en-IN') : '—');
const InfoRow = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
    <span className="min-w-[140px] text-sm text-muted">{label}</span>
    <span className="text-sm font-medium text-body">{value || '—'}</span>
  </div>
);

export const ProductionEntryViewPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { canEdit } = useModulePermissions(PERM.moduleCode, PERM.itemCode);
  const [item, setItem] = useState<ProductionEntryRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    productionEntryService.getById(id)
      .then(setItem)
      .catch((err) => { toast.error(getApiErrorMessage(err, 'Failed to load')); navigate(LIST_PATH); })
      .finally(() => setIsLoading(false));
  }, [id, navigate]);

  const handlePost = async () => {
    if (!id) return;
    try {
      setIsPosting(true);
      setItem(await productionEntryService.post(id));
      toast.success('Production entry posted — finished goods added to stock.');
    } catch (err) { toast.error(getApiErrorMessage(err, 'Failed to post')); }
    finally { setIsPosting(false); }
  };

  const handleCancel = async () => {
    if (!id) return;
    try {
      setIsCancelling(true);
      setItem(await productionEntryService.cancel(id));
      setShowCancelModal(false);
      toast.success('Production entry cancelled.');
    } catch (err) { toast.error(getApiErrorMessage(err, 'Failed to cancel')); }
    finally { setIsCancelling(false); }
  };

  return (
    <ModulePermissionGuard moduleCode={PERM.moduleCode} itemCode={PERM.itemCode} action="view" moduleLabel="Production Entries">
      <UserLayout title="Production Entry" subtitle="View production entry details">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(LIST_PATH)}>
            <ArrowLeft className="mr-2 inline h-4 w-4" /> Back
          </Button>
          {item && canEdit && item.status === 'draft' ? (
            <>
              <Button type="button" variant="secondary" onClick={() => navigate(`${LIST_PATH}/${id}/edit`)}>
                <Pencil className="mr-2 inline h-4 w-4" /> Edit
              </Button>
              <Button type="button" variant="default" isLoading={isPosting} onClick={handlePost}>
                <CheckCircle className="mr-2 inline h-4 w-4" /> Post Entry
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowCancelModal(true)}>
                <XCircle className="mr-2 inline h-4 w-4" /> Cancel
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
                  <h1 className="text-xl font-bold text-body">{item.entryNumber}</h1>
                  <p className="text-sm text-muted">Production Entry</p>
                </div>
                <ManufacturingStatusBadge status={item.status} className="text-sm" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <InfoRow label="Entry Date" value={formatDate(item.entryDate)} />
                <InfoRow label="Work Order" value={item.workOrderId} />
                <InfoRow label="Produced Qty" value={String(item.producedQty)} />
                <InfoRow label="Notes" value={item.notes} />
              </div>
            </section>

            {item.materialReturns.length > 0 ? (
              <section className="rounded-sm border border-base bg-surface shadow-sm">
                <div className="border-b border-base px-6 py-4">
                  <h2 className="text-base font-semibold text-body">Material Returns</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-base bg-surface-2">
                        <th className="px-4 py-2.5 text-left font-medium text-muted">#</th>
                        <th className="px-4 py-2.5 text-left font-medium text-muted">Material</th>
                        <th className="px-4 py-2.5 text-right font-medium text-muted">Returned Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {item.materialReturns.map((ret, i) => (
                        <tr key={i} className="border-b border-base last:border-0">
                          <td className="px-4 py-3 text-muted">{i + 1}</td>
                          <td className="px-4 py-3 font-mono text-xs text-body">{ret.productId}</td>
                          <td className="px-4 py-3 text-right tabular-nums text-green-600">{ret.returnedQty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ) : null}
          </div>
        )}

        <ConfirmModal
          open={showCancelModal}
          title="Cancel Production Entry"
          message={`Cancel entry "${item?.entryNumber}"?`}
          confirmLabel="Cancel Entry"
          variant="danger"
          isLoading={isCancelling}
          onConfirm={handleCancel}
          onCancel={() => !isCancelling && setShowCancelModal(false)}
        />
      </UserLayout>
    </ModulePermissionGuard>
  );
};
