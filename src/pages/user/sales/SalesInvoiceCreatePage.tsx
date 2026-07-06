import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Button } from '../../../components/ui/Button';
import { SalesInvoiceForm, emptySalesInvoiceForm, formValuesToSalesInvoicePayload } from './SalesInvoiceForm';
import { salesInvoiceService } from '../../../services/trading.service';
import { useTradingMasters } from '../purchase/useTradingMasters';
import { useTradingDocumentOptions } from '../purchase/useTradingDocumentOptions';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { ModulePermissionGuard } from '../../../components/common/ModulePermissionGuard';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import type { SalesInvoiceFormValues } from '../../../shared/types/trading.types';

const LIST_PATH = '/sales/sales-invoices';
const PERM = PORTAL_PERMISSION_MODULES.salesInvoices;

export const SalesInvoiceCreatePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<SalesInvoiceFormValues>(emptySalesInvoiceForm());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingNumber, setIsGeneratingNumber] = useState(false);
  const [autoInvoiceNumber, setAutoInvoiceNumber] = useState(true);
  const { errors, clearFieldError, clearErrors, applyApiErrors } = useFormValidation<SalesInvoiceFormValues>();
  const masters = useTradingMasters();
  const docOptions = useTradingDocumentOptions();

  useEffect(() => {
    if (!autoInvoiceNumber) return;
    setIsGeneratingNumber(true);
    salesInvoiceService.getNextInvoiceNumber()
      .then((invoiceNumber) => setForm((prev) => ({ ...prev, invoiceNumber })))
      .catch((err) => toast.error(getApiErrorMessage(err, 'Failed to generate invoice number')))
      .finally(() => setIsGeneratingNumber(false));
  }, [autoInvoiceNumber]);

  const handleAutoGenerateNumber = async () => {
    try {
      setIsGeneratingNumber(true); setAutoInvoiceNumber(true);
      const invoiceNumber = await salesInvoiceService.getNextInvoiceNumber();
      setForm((prev) => ({ ...prev, invoiceNumber }));
    } catch (err) { toast.error(getApiErrorMessage(err, 'Failed to generate invoice number')); }
    finally { setIsGeneratingNumber(false); }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault(); clearErrors();
    if (!form.customerId) { toast.warning('Please select a customer.'); return; }
    if (!form.warehouseId) { toast.warning('Please select a warehouse.'); return; }
    if (form.lines.length === 0) { toast.warning('Please add at least one product line.'); return; }
    try {
      setIsSubmitting(true);
      const record = await salesInvoiceService.create(formValuesToSalesInvoicePayload(form, { autoGenerateInvoiceNumber: autoInvoiceNumber }));
      toast.success('Sales invoice created.');
      navigate(`${LIST_PATH}/${record.id}`);
    } catch (err) { toast.error(applyApiErrors(err, 'Failed to create invoice')); }
    finally { setIsSubmitting(false); }
  };

  return (
    <ModulePermissionGuard moduleCode={PERM.moduleCode} itemCode={PERM.itemCode} action="create" moduleLabel="Sales Invoices">
      <UserLayout title="New Sales Invoice" subtitle="Create a customer invoice">
        <div className="mb-5">
          <Button type="button" variant="secondary" onClick={() => navigate(LIST_PATH)}>
            <ArrowLeft className="mr-2 inline h-4 w-4" />Back to Invoices
          </Button>
        </div>
        {masters.isLoading || docOptions.isLoading ? <div className="flex h-64 items-center justify-center text-muted">Loading...</div> : (
          <SalesInvoiceForm mode="create" value={form} errors={errors} isSubmitting={isSubmitting}
            autoInvoiceNumber={autoInvoiceNumber} isGeneratingNumber={isGeneratingNumber}
            customers={masters.customers} warehouses={masters.warehouses} products={masters.products} taxes={masters.taxes}
            deliveryChallanOptions={docOptions.deliveryChallans} salesOrderOptions={docOptions.salesOrders}
            onChange={setForm} onClearFieldError={clearFieldError} onAutoGenerateNumber={handleAutoGenerateNumber}
            onInvoiceNumberManualChange={() => setAutoInvoiceNumber(false)} onCancel={() => navigate(LIST_PATH)} onSubmit={handleSubmit} submitLabel="Save draft" />
        )}
      </UserLayout>
    </ModulePermissionGuard>
  );
};
