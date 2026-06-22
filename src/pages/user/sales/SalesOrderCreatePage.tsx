import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Button } from '../../../components/ui/Button';
import { SalesOrderForm, emptySalesOrderForm, formValuesToSalesOrderPayload } from './SalesOrderForm';
import { salesOrderService } from '../../../services/trading.service';
import { useTradingMasters } from '../purchase/useTradingMasters';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { ModulePermissionGuard } from '../../../components/common/ModulePermissionGuard';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import type { SalesOrderFormValues } from '../../../shared/types/trading.types';

const LIST_PATH = '/sales/sales-orders';
const PERM = PORTAL_PERMISSION_MODULES.salesOrders;

export const SalesOrderCreatePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<SalesOrderFormValues>(emptySalesOrderForm());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingNumber, setIsGeneratingNumber] = useState(false);
  const [autoSoNumber, setAutoSoNumber] = useState(true);
  const { errors, clearFieldError, clearErrors, applyApiErrors } = useFormValidation<SalesOrderFormValues>();
  const masters = useTradingMasters();

  useEffect(() => {
    if (!autoSoNumber) return;
    setIsGeneratingNumber(true);
    salesOrderService.getNextSoNumber()
      .then((soNumber) => setForm((prev) => ({ ...prev, soNumber })))
      .catch((err) => toast.error(getApiErrorMessage(err, 'Failed to generate SO number')))
      .finally(() => setIsGeneratingNumber(false));
  }, [autoSoNumber]);

  const handleAutoGenerateNumber = async () => {
    try {
      setIsGeneratingNumber(true); setAutoSoNumber(true);
      const soNumber = await salesOrderService.getNextSoNumber();
      setForm((prev) => ({ ...prev, soNumber }));
    } catch (err) { toast.error(getApiErrorMessage(err, 'Failed to generate SO number')); }
    finally { setIsGeneratingNumber(false); }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault(); clearErrors();
    if (!form.customerId) { toast.warning('Please select a customer.'); return; }
    if (!form.warehouseId) { toast.warning('Please select a warehouse.'); return; }
    if (form.lines.length === 0) { toast.warning('Please add at least one product line.'); return; }
    try {
      setIsSubmitting(true);
      const record = await salesOrderService.create(formValuesToSalesOrderPayload(form, { autoGenerateSoNumber: autoSoNumber }));
      toast.success('Sales order created.');
      navigate(`${LIST_PATH}/${record.id}`);
    } catch (err) { toast.error(applyApiErrors(err, 'Failed to create sales order')); }
    finally { setIsSubmitting(false); }
  };

  return (
    <ModulePermissionGuard moduleCode={PERM.moduleCode} itemCode={PERM.itemCode} action="create" moduleLabel="Sales Orders">
      <UserLayout title="New Sales Order" subtitle="Create a customer sales order">
        <div className="mb-5">
          <Button type="button" variant="secondary" onClick={() => navigate(LIST_PATH)}>
            <ArrowLeft className="mr-2 inline h-4 w-4" />Back to Orders
          </Button>
        </div>
        {masters.isLoading ? <div className="flex h-64 items-center justify-center text-muted">Loading...</div> : (
          <SalesOrderForm mode="create" value={form} errors={errors} isSubmitting={isSubmitting}
            autoSoNumber={autoSoNumber} isGeneratingNumber={isGeneratingNumber}
            customers={masters.customers} warehouses={masters.warehouses} products={masters.products} taxes={masters.taxes}
            onChange={setForm} onClearFieldError={clearFieldError} onAutoGenerateNumber={handleAutoGenerateNumber}
            onSoNumberManualChange={() => setAutoSoNumber(false)} onCancel={() => navigate(LIST_PATH)} onSubmit={handleSubmit} submitLabel="Save draft" />
        )}
      </UserLayout>
    </ModulePermissionGuard>
  );
};
