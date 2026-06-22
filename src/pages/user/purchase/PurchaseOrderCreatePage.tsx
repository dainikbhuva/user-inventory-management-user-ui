import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Button } from '../../../components/ui/Button';
import {
  PurchaseOrderForm,
  emptyPurchaseOrderForm,
  formValuesToPoPayload,
} from './PurchaseOrderForm';
import { purchaseOrderService } from '../../../services/trading.service';
import { useTradingMasters } from './useTradingMasters';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { ModulePermissionGuard } from '../../../components/common/ModulePermissionGuard';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import type { PurchaseOrderFormValues } from '../../../shared/types/trading.types';

const LIST_PATH = '/purchase/purchase-orders';
const PERM = PORTAL_PERMISSION_MODULES.purchaseOrders;

export const PurchaseOrderCreatePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<PurchaseOrderFormValues>(emptyPurchaseOrderForm());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingNumber, setIsGeneratingNumber] = useState(false);
  const [autoPoNumber, setAutoPoNumber] = useState(true);
  const { errors, clearFieldError, clearErrors, applyApiErrors } =
    useFormValidation<PurchaseOrderFormValues>();
  const masters = useTradingMasters();

  useEffect(() => {
    if (!autoPoNumber) return;
    setIsGeneratingNumber(true);
    purchaseOrderService
      .getNextPoNumber()
      .then((poNumber) => setForm((prev) => ({ ...prev, poNumber })))
      .catch((err) => toast.error(getApiErrorMessage(err, 'Failed to generate PO number')))
      .finally(() => setIsGeneratingNumber(false));
  }, [autoPoNumber]);

  const handleAutoGenerateNumber = async () => {
    try {
      setIsGeneratingNumber(true);
      setAutoPoNumber(true);
      const poNumber = await purchaseOrderService.getNextPoNumber();
      setForm((prev) => ({ ...prev, poNumber }));
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to generate PO number'));
    } finally {
      setIsGeneratingNumber(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    clearErrors();

    if (!form.supplierId) { toast.warning('Please select a supplier.'); return; }
    if (!form.warehouseId) { toast.warning('Please select a warehouse.'); return; }
    if (!form.poDate) { toast.warning('Please enter a PO date.'); return; }
    if (form.lines.length === 0) { toast.warning('Please add at least one product line.'); return; }
    const invalidLine = form.lines.find((l) => !l.productId || !l.quantity);
    if (invalidLine) { toast.warning('Please fill in all required line fields (product, quantity).'); return; }

    try {
      setIsSubmitting(true);
      const record = await purchaseOrderService.create(
        formValuesToPoPayload(form, { autoGeneratePoNumber: autoPoNumber })
      );
      toast.success('Purchase order created successfully.');
      navigate(`${LIST_PATH}/${record.id}`);
    } catch (err) {
      toast.error(applyApiErrors(err, 'Failed to create purchase order'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModulePermissionGuard
      moduleCode={PERM.moduleCode}
      itemCode={PERM.itemCode}
      action="create"
      moduleLabel="Purchase Orders"
    >
      <UserLayout title="New Purchase Order" subtitle="Create a purchase order for supplier">
        <div className="mb-5">
          <Button type="button" variant="secondary" onClick={() => navigate(LIST_PATH)}>
            <ArrowLeft className="mr-2 inline h-4 w-4" />
            Back to purchase orders
          </Button>
        </div>

        {masters.isLoading ? (
          <div className="flex h-64 items-center justify-center text-muted">Loading...</div>
        ) : (
          <PurchaseOrderForm
            mode="create"
            value={form}
            errors={errors}
            isSubmitting={isSubmitting}
            autoPoNumber={autoPoNumber}
            isGeneratingNumber={isGeneratingNumber}
            suppliers={masters.suppliers}
            warehouses={masters.warehouses}
            products={masters.products}
            taxes={masters.taxes}
            onChange={setForm}
            onClearFieldError={clearFieldError}
            onAutoGenerateNumber={handleAutoGenerateNumber}
            onPoNumberManualChange={() => setAutoPoNumber(false)}
            onCancel={() => navigate(LIST_PATH)}
            onSubmit={handleSubmit}
            submitLabel="Save draft"
          />
        )}
      </UserLayout>
    </ModulePermissionGuard>
  );
};
