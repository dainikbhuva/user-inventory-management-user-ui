import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Button } from '../../../components/ui/Button';
import { PurchaseReturnForm, emptyPurchaseReturnForm, formValuesToPurchaseReturnPayload } from './PurchaseReturnForm';
import { purchaseReturnService } from '../../../services/trading.service';
import { useTradingMasters } from './useTradingMasters';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { ModulePermissionGuard } from '../../../components/common/ModulePermissionGuard';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import type { PurchaseReturnFormValues } from '../../../shared/types/trading.types';

const LIST_PATH = '/purchase/purchase-returns';
const PERM = PORTAL_PERMISSION_MODULES.purchaseReturns;

export const PurchaseReturnCreatePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<PurchaseReturnFormValues>(emptyPurchaseReturnForm());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingNumber, setIsGeneratingNumber] = useState(false);
  const [autoReturnNumber, setAutoReturnNumber] = useState(true);
  const { errors, clearFieldError, clearErrors, applyApiErrors } = useFormValidation<PurchaseReturnFormValues>();
  const masters = useTradingMasters();

  useEffect(() => {
    if (!autoReturnNumber) return;
    setIsGeneratingNumber(true);
    purchaseReturnService.getNextReturnNumber()
      .then((returnNumber) => setForm((prev) => ({ ...prev, returnNumber })))
      .catch((err) => toast.error(getApiErrorMessage(err, 'Failed to generate return number')))
      .finally(() => setIsGeneratingNumber(false));
  }, [autoReturnNumber]);

  const handleAutoGenerateNumber = async () => {
    try {
      setIsGeneratingNumber(true); setAutoReturnNumber(true);
      const returnNumber = await purchaseReturnService.getNextReturnNumber();
      setForm((prev) => ({ ...prev, returnNumber }));
    } catch (err) { toast.error(getApiErrorMessage(err, 'Failed to generate return number')); }
    finally { setIsGeneratingNumber(false); }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault(); clearErrors();
    if (!form.supplierId) { toast.warning('Please select a supplier.'); return; }
    if (!form.warehouseId) { toast.warning('Please select a warehouse.'); return; }
    if (form.lines.length === 0) { toast.warning('Please add at least one product line.'); return; }
    try {
      setIsSubmitting(true);
      const record = await purchaseReturnService.create(formValuesToPurchaseReturnPayload(form, { autoGenerateReturnNumber: autoReturnNumber }));
      toast.success('Purchase return created.');
      navigate(`${LIST_PATH}/${record.id}`);
    } catch (err) { toast.error(applyApiErrors(err, 'Failed to create purchase return')); }
    finally { setIsSubmitting(false); }
  };

  return (
    <ModulePermissionGuard moduleCode={PERM.moduleCode} itemCode={PERM.itemCode} action="create" moduleLabel="Purchase Returns">
      <UserLayout title="New Purchase Return" subtitle="Return goods to a supplier">
        <div className="mb-5">
          <Button type="button" variant="secondary" onClick={() => navigate(LIST_PATH)}>
            <ArrowLeft className="mr-2 inline h-4 w-4" />Back to Purchase Returns
          </Button>
        </div>
        {masters.isLoading ? <div className="flex h-64 items-center justify-center text-muted">Loading...</div> : (
          <PurchaseReturnForm mode="create" value={form} errors={errors} isSubmitting={isSubmitting}
            autoReturnNumber={autoReturnNumber} isGeneratingNumber={isGeneratingNumber}
            suppliers={masters.suppliers} warehouses={masters.warehouses} products={masters.products} taxes={masters.taxes}
            onChange={setForm} onClearFieldError={clearFieldError} onAutoGenerateNumber={handleAutoGenerateNumber}
            onReturnNumberManualChange={() => setAutoReturnNumber(false)} onCancel={() => navigate(LIST_PATH)} onSubmit={handleSubmit} submitLabel="Save draft" />
        )}
      </UserLayout>
    </ModulePermissionGuard>
  );
};
