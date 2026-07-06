import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Button } from '../../../components/ui/Button';
import { PurchaseReturnForm, purchaseReturnToFormValues, formValuesToPurchaseReturnPayload } from './PurchaseReturnForm';
import { purchaseReturnService } from '../../../services/trading.service';
import { useTradingMasters } from './useTradingMasters';
import { useTradingDocumentOptions } from './useTradingDocumentOptions';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { ModulePermissionGuard } from '../../../components/common/ModulePermissionGuard';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import type { PurchaseReturnFormValues } from '../../../shared/types/trading.types';

const LIST_PATH = '/purchase/purchase-returns';
const PERM = PORTAL_PERMISSION_MODULES.purchaseReturns;

export const PurchaseReturnEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<PurchaseReturnFormValues | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { errors, clearFieldError, clearErrors, applyApiErrors } = useFormValidation<PurchaseReturnFormValues>();
  const masters = useTradingMasters();
  const docOptions = useTradingDocumentOptions();

  useEffect(() => {
    if (!id) return;
    purchaseReturnService.getById(id)
      .then((item) => {
        if (item.status !== 'draft') { toast.warning('Only draft returns can be edited.'); navigate(`${LIST_PATH}/${id}`); return; }
        setForm(purchaseReturnToFormValues(item));
      })
      .catch((err) => { toast.error(getApiErrorMessage(err, 'Failed to load purchase return')); navigate(LIST_PATH); })
      .finally(() => setIsLoading(false));
  }, [id, navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault(); if (!form || !id) return; clearErrors();
    if (!form.supplierId) { toast.warning('Please select a supplier.'); return; }
    if (!form.warehouseId) { toast.warning('Please select a warehouse.'); return; }
    if (form.lines.length === 0) { toast.warning('Please add at least one product line.'); return; }
    try {
      setIsSubmitting(true);
      await purchaseReturnService.update(id, formValuesToPurchaseReturnPayload(form));
      toast.success('Purchase return updated.');
      navigate(`${LIST_PATH}/${id}`);
    } catch (err) { toast.error(applyApiErrors(err, 'Failed to update purchase return')); }
    finally { setIsSubmitting(false); }
  };

  return (
    <ModulePermissionGuard moduleCode={PERM.moduleCode} itemCode={PERM.itemCode} action="edit" moduleLabel="Purchase Returns">
      <UserLayout title="Edit Purchase Return" subtitle="Update purchase return">
        <div className="mb-5">
          <Button type="button" variant="secondary" onClick={() => navigate(`${LIST_PATH}/${id}`)}>
            <ArrowLeft className="mr-2 inline h-4 w-4" />Back
          </Button>
        </div>
        {isLoading || masters.isLoading || docOptions.isLoading || !form ? (
          <div className="flex h-64 items-center justify-center text-muted">Loading...</div>
        ) : (
          <PurchaseReturnForm mode="edit" value={form} errors={errors} isSubmitting={isSubmitting}
            suppliers={masters.suppliers} warehouses={masters.warehouses} products={masters.products} taxes={masters.taxes}
            grnOptions={docOptions.grns}
            onChange={setForm} onClearFieldError={clearFieldError}
            onCancel={() => navigate(`${LIST_PATH}/${id}`)} onSubmit={handleSubmit} submitLabel="Update Return" />
        )}
      </UserLayout>
    </ModulePermissionGuard>
  );
};
