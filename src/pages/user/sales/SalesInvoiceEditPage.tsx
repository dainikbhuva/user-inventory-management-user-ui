import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Button } from '../../../components/ui/Button';
import { SalesInvoiceForm, salesInvoiceToFormValues, formValuesToSalesInvoicePayload } from './SalesInvoiceForm';
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

export const SalesInvoiceEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<SalesInvoiceFormValues | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { errors, clearFieldError, clearErrors, applyApiErrors } = useFormValidation<SalesInvoiceFormValues>();
  const masters = useTradingMasters();
  const docOptions = useTradingDocumentOptions();

  useEffect(() => {
    if (!id) return;
    salesInvoiceService.getById(id)
      .then((item) => {
        if (item.status !== 'draft') { toast.warning('Only draft invoices can be edited.'); navigate(`${LIST_PATH}/${id}`); return; }
        setForm(salesInvoiceToFormValues(item));
      })
      .catch((err) => { toast.error(getApiErrorMessage(err, 'Failed to load invoice')); navigate(LIST_PATH); })
      .finally(() => setIsLoading(false));
  }, [id, navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault(); if (!form || !id) return; clearErrors();
    if (!form.customerId) { toast.warning('Please select a customer.'); return; }
    if (!form.warehouseId) { toast.warning('Please select a warehouse.'); return; }
    if (form.lines.length === 0) { toast.warning('Please add at least one product line.'); return; }
    try {
      setIsSubmitting(true);
      await salesInvoiceService.update(id, formValuesToSalesInvoicePayload(form));
      toast.success('Invoice updated.');
      navigate(`${LIST_PATH}/${id}`);
    } catch (err) { toast.error(applyApiErrors(err, 'Failed to update invoice')); }
    finally { setIsSubmitting(false); }
  };

  return (
    <ModulePermissionGuard moduleCode={PERM.moduleCode} itemCode={PERM.itemCode} action="edit" moduleLabel="Sales Invoices">
      <UserLayout title="Edit Invoice" subtitle="Update sales invoice">
        <div className="mb-5">
          <Button type="button" variant="secondary" onClick={() => navigate(`${LIST_PATH}/${id}`)}>
            <ArrowLeft className="mr-2 inline h-4 w-4" />Back
          </Button>
        </div>
        {isLoading || masters.isLoading || docOptions.isLoading || !form ? (
          <div className="flex h-64 items-center justify-center text-muted">Loading...</div>
        ) : (
          <SalesInvoiceForm mode="edit" value={form} errors={errors} isSubmitting={isSubmitting}
            customers={masters.customers} warehouses={masters.warehouses} products={masters.products} taxes={masters.taxes}
            deliveryChallanOptions={docOptions.deliveryChallans} salesOrderOptions={docOptions.salesOrders}
            onChange={setForm} onClearFieldError={clearFieldError}
            onCancel={() => navigate(`${LIST_PATH}/${id}`)} onSubmit={handleSubmit} submitLabel="Update Invoice" />
        )}
      </UserLayout>
    </ModulePermissionGuard>
  );
};
