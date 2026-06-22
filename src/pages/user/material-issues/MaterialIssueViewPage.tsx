import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Pencil, XCircle } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Button } from '../../../components/ui/Button';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { materialIssueService } from '../../../services/materialIssue.service';
import type { MaterialIssueRecord } from '../../../shared/types/manufacturing.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { ManufacturingStatusBadge } from '../manufacturing/ManufacturingStatusBadge';
import { useModulePermissions } from '../../../shared/permissions/PermissionContext';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import { ModulePermissionGuard } from '../../../components/common/ModulePermissionGuard';

const LIST_PATH = '/manufacturing/material-issues';
const PERM = PORTAL_PERMISSION_MODULES.materialIssues;
const formatDate = (d?: string) => (d ? new Date(d).toLocaleDateString('en-IN') : '—');
const InfoRow = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
    <span className="min-w-[140px] text-sm text-muted">{label}</span>
    <span className="text-sm font-medium text-body">{value || '—'}</span>
  </div>
);

export const MaterialIssueViewPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { canEdit } = useModulePermissions(PERM.moduleCode, PERM.itemCode);
  const [item, setItem] = useState<MaterialIssueRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isIssuing, setIsIssuing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    materialIssueService.getById(id)
      .then(setItem)
      .catch((err) => { toast.error(getApiErrorMessage(err, 'Failed to load')); navigate(LIST_PATH); })
      .finally(() => setIsLoading(false));
  }, [id, navigate]);

  const handleIssue = async () => {
    if (!id) return;
    try {
      setIsIssuing(true);
      setItem(await materialIssueService.issue(id));
      toast.success('Materials issued — stock reduced.');
    } catch (err) { toast.error(getApiErrorMessage(err, 'Failed to issue')); }
    finally { setIsIssuing(false); }
  };

  const handleCancel = async () => {
    if (!id) return;
    try {
      setIsCancelling(true);
      setItem(await materialIssueService.cancel(id));
      setShowCancelModal(false);
      toast.success('Material issue cancelled.');
    } catch (err) { toast.error(getApiErrorMessage(err, 'Failed to cancel')); }
    finally { setIsCancelling(false); }
  };

  return (
    <ModulePermissionGuard moduleCode={PERM.moduleCode} itemCode={PERM.itemCode} action="view" moduleLabel="Material Issues">
      <UserLayout title="Material Issue" subtitle="View material issue details">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(LIST_PATH)}>
            <ArrowLeft className="mr-2 inline h-4 w-4" /> Back
          </Button>
          {item && canEdit && item.status === 'draft' ? (
            <>
              <Button type="button" variant="secondary" onClick={() => navigate(`${LIST_PATH}/${id}/edit`)}>
                <Pencil className="mr-2 inline h-4 w-4" /> Edit
              </Button>
              <Button type="button" variant="default" isLoading={isIssuing} onClick={handleIssue}>
                <CheckCircle className="mr-2 inline h-4 w-4" /> Issue Materials
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
                  <h1 className="text-xl font-bold text-body">{item.issueNumber}</h1>
                  <p className="text-sm text-muted">Material Issue</p>
                </div>
                <ManufacturingStatusBadge status={item.status} className="text-sm" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <InfoRow label="Issue Date" value={formatDate(item.issueDate)} />
                <InfoRow label="Work Order" value={item.workOrderId} />
                <InfoRow label="Notes" value={item.notes} />
              </div>
            </section>

            <section className="rounded-sm border border-base bg-surface shadow-sm">
              <div className="border-b border-base px-6 py-4">
                <h2 className="text-base font-semibold text-body">Issued Materials</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-base bg-surface-2">
                      <th className="px-4 py-2.5 text-left font-medium text-muted">#</th>
                      <th className="px-4 py-2.5 text-left font-medium text-muted">Product</th>
                      <th className="px-4 py-2.5 text-right font-medium text-muted">Required Qty</th>
                      <th className="px-4 py-2.5 text-right font-medium text-muted">Issued Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.lines.map((line, i) => (
                      <tr key={i} className="border-b border-base last:border-0">
                        <td className="px-4 py-3 text-muted">{i + 1}</td>
                        <td className="px-4 py-3 font-mono text-xs text-body">{line.productId}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-muted">{line.requiredQty}</td>
                        <td className="px-4 py-3 text-right tabular-nums font-medium text-body">{line.issuedQty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        <ConfirmModal
          open={showCancelModal}
          title="Cancel Material Issue"
          message={`Cancel issue "${item?.issueNumber}"?`}
          confirmLabel="Cancel Issue"
          variant="danger"
          isLoading={isCancelling}
          onConfirm={handleCancel}
          onCancel={() => !isCancelling && setShowCancelModal(false)}
        />
      </UserLayout>
    </ModulePermissionGuard>
  );
};
