import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Button } from '../../../components/ui/Button';
import { GRNForm, emptyGRNForm, formValuesToGrnPayload } from './GRNForm';
import { grnService, purchaseOrderService } from '../../../services/trading.service';
import { useTradingMasters } from './useTradingMasters';
import { useTradingDocumentOptions } from './useTradingDocumentOptions';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { ModulePermissionGuard } from '../../../components/common/ModulePermissionGuard';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import type { GRNFormValues } from '../../../shared/types/trading.types';

const LIST_PATH = '/purchase/grns';
const PERM = PORTAL_PERMISSION_MODULES.grns;

export const GRNCreatePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<GRNFormValues>(emptyGRNForm());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingNumber, setIsGeneratingNumber] = useState(false);
  const [autoGrnNumber, setAutoGrnNumber] = useState(true);
  const { errors, clearFieldError, clearErrors, applyApiErrors } = useFormValidation<GRNFormValues>();
  const masters = useTradingMasters();
  const docOptions = useTradingDocumentOptions();

  const handlePurchaseOrderSelect = async (purchaseOrderId: string) => {
    if (!purchaseOrderId) return;
    try {
      const po = await purchaseOrderService.getById(purchaseOrderId);
      setForm((prev) => ({
        ...prev,
        purchaseOrderId,
        supplierId: po.supplierId,
        warehouseId: po.warehouseId,
        lines: po.lines.map((line) => ({
          productId: line.productId,
          productName: line.productName,
          productCode: line.productCode,
          quantity: String(line.quantity),
          unitPrice: String(line.unitPrice),
          unitCost: String(line.unitPrice),
          taxId: line.taxId ?? '',
          notes: line.notes ?? '',
        })),
      }));
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load purchase order'));
    }
  };

  useEffect(() => {
    if (!autoGrnNumber) return;
    setIsGeneratingNumber(true);
    grnService.getNextGrnNumber()
      .then((grnNumber) => setForm((prev) => ({ ...prev, grnNumber })))
      .catch((err) => toast.error(getApiErrorMessage(err, 'Failed to generate GRN number')))
      .finally(() => setIsGeneratingNumber(false));
  }, [autoGrnNumber]);

  const handleAutoGenerateNumber = async () => {
    try {
      setIsGeneratingNumber(true); setAutoGrnNumber(true);
      const grnNumber = await grnService.getNextGrnNumber();
      setForm((prev) => ({ ...prev, grnNumber }));
    } catch (err) { toast.error(getApiErrorMessage(err, 'Failed to generate GRN number')); }
    finally { setIsGeneratingNumber(false); }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault(); clearErrors();
    if (!form.supplierId) { toast.warning('Please select a supplier.'); return; }
    if (!form.warehouseId) { toast.warning('Please select a warehouse.'); return; }
    if (form.lines.length === 0) { toast.warning('Please add at least one product line.'); return; }
    try {
      setIsSubmitting(true);
      const record = await grnService.create(formValuesToGrnPayload(form, { autoGenerateGrnNumber: autoGrnNumber }));
      toast.success('GRN created successfully.');
      navigate(`${LIST_PATH}/${record.id}`);
    } catch (err) { toast.error(applyApiErrors(err, 'Failed to create GRN')); }
    finally { setIsSubmitting(false); }
  };

  return (
    <ModulePermissionGuard moduleCode={PERM.moduleCode} itemCode={PERM.itemCode} action="create" moduleLabel="GRNs">
      <UserLayout title="New GRN" subtitle="Record goods received from a supplier">
        <div className="mb-5">
          <Button type="button" variant="secondary" onClick={() => navigate(LIST_PATH)}>
            <ArrowLeft className="mr-2 inline h-4 w-4" />Back to GRNs
          </Button>
        </div>
        {masters.isLoading || docOptions.isLoading ? <div className="flex h-64 items-center justify-center text-muted">Loading...</div> : (
          <GRNForm mode="create" value={form} errors={errors} isSubmitting={isSubmitting} autoGrnNumber={autoGrnNumber} isGeneratingNumber={isGeneratingNumber}
            suppliers={masters.suppliers} warehouses={masters.warehouses} products={masters.products} taxes={masters.taxes}
            purchaseOrderOptions={docOptions.purchaseOrders} onPurchaseOrderChange={handlePurchaseOrderSelect}
            onChange={setForm} onClearFieldError={clearFieldError} onAutoGenerateNumber={handleAutoGenerateNumber}
            onGrnNumberManualChange={() => setAutoGrnNumber(false)} onCancel={() => navigate(LIST_PATH)} onSubmit={handleSubmit} submitLabel="Save draft" />
        )}
      </UserLayout>
    </ModulePermissionGuard>
  );
};
