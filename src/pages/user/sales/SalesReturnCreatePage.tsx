import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Button } from '../../../components/ui/Button';
import { SalesReturnForm, emptySalesReturnForm, formValuesToSalesReturnPayload } from './SalesReturnForm';
import { salesReturnService } from '../../../services/trading.service';
import { useTradingMasters } from '../purchase/useTradingMasters';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { ModulePermissionGuard } from '../../../components/common/ModulePermissionGuard';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import type { SalesReturnFormValues } from '../../../shared/types/trading.types';

const LIST_PATH = '/sales/sales-returns';
const PERM = PORTAL_PERMISSION_MODULES.salesReturns;

export const SalesReturnCreatePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<SalesReturnFormValues>(emptySalesReturnForm());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingNumber, setIsGeneratingNumber] = useState(false);
  const [autoReturnNumber, setAutoReturnNumber] = useState(true);
  const { errors, clearFieldError, clearErrors, applyApiErrors } = useFormValidation<SalesReturnFormValues>();
  const masters = useTradingMasters();

  useEffect(() => {
    if (!autoReturnNumber) return;
    setIsGeneratingNumber(true);
    salesReturnService.getNextReturnNumber()
      .then((returnNumber) => setForm((prev) => ({ ...prev, returnNumber })))
      .catch((err) => toast.error(getApiErrorMessage(err, 'Failed to generate return number')))
      .finally(() => setIsGeneratingNumber(false));
  }, [autoReturnNumber]);

  const handleAutoGenerateNumber = async () => {
    try {
      setIsGeneratingNumber(true); setAutoReturnNumber(true);
      const returnNumber = await salesReturnService.getNextReturnNumber();
      setForm((prev) => ({ ...prev, returnNumber }));
    } catch (err) { toast.error(getApiErrorMessage(err, 'Failed to generate return number')); }
    finally { setIsGeneratingNumber(false); }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault(); clearErrors();
    if (!form.customerId) { toast.warning('Please select a customer.'); return; }
    if (!form.warehouseId) { toast.warning('Please select a warehouse.'); return; }
    if (form.lines.length === 0) { toast.warning('Please add at least one product line.'); return; }
    try {
      setIsSubmitting(true);
      const record = await salesReturnService.create(formValuesToSalesReturnPayload(form, { autoGenerateReturnNumber: autoReturnNumber }));
      toast.success('Sales return created.');
      navigate(`${LIST_PATH}/${record.id}`);
    } catch (err) { toast.error(applyApiErrors(err, 'Failed to create sales return')); }
    finally { setIsSubmitting(false); }
  };

  return (
    <ModulePermissionGuard moduleCode={PERM.moduleCode} itemCode={PERM.itemCode} action="create" moduleLabel="Sales Returns">
      <UserLayout title="New Sales Return" subtitle="Handle a customer return">
        <div className="mb-5">
          <Button type="button" variant="secondary" onClick={() => navigate(LIST_PATH)}>
            <ArrowLeft className="mr-2 inline h-4 w-4" />Back to Returns
          </Button>
        </div>
        {masters.isLoading ? <div className="flex h-64 items-center justify-center text-muted">Loading...</div> : (
          <SalesReturnForm mode="create" value={form} errors={errors} isSubmitting={isSubmitting}
            autoReturnNumber={autoReturnNumber} isGeneratingNumber={isGeneratingNumber}
            customers={masters.customers} warehouses={masters.warehouses} products={masters.products} taxes={masters.taxes}
            onChange={setForm} onClearFieldError={clearFieldError} onAutoGenerateNumber={handleAutoGenerateNumber}
            onReturnNumberManualChange={() => setAutoReturnNumber(false)} onCancel={() => navigate(LIST_PATH)} onSubmit={handleSubmit} submitLabel="Save draft" />
        )}
      </UserLayout>
    </ModulePermissionGuard>
  );
};
