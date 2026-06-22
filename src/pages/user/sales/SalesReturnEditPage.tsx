import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Button } from '../../../components/ui/Button';
import { SalesReturnForm, salesReturnToFormValues, formValuesToSalesReturnPayload } from './SalesReturnForm';
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

export const SalesReturnEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<SalesReturnFormValues | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { errors, clearFieldError, clearErrors, applyApiErrors } = useFormValidation<SalesReturnFormValues>();
  const masters = useTradingMasters();

  useEffect(() => {
    if (!id) return;
    salesReturnService.getById(id)
      .then((item) => {
        if (item.status !== 'draft') { toast.warning('Only draft returns can be edited.'); navigate(`${LIST_PATH}/${id}`); return; }
        setForm(salesReturnToFormValues(item));
      })
      .catch((err) => { toast.error(getApiErrorMessage(err, 'Failed to load sales return')); navigate(LIST_PATH); })
      .finally(() => setIsLoading(false));
  }, [id, navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault(); if (!form || !id) return; clearErrors();
    if (!form.customerId) { toast.warning('Please select a customer.'); return; }
    if (!form.warehouseId) { toast.warning('Please select a warehouse.'); return; }
    if (form.lines.length === 0) { toast.warning('Please add at least one product line.'); return; }
    try {
      setIsSubmitting(true);
      await salesReturnService.update(id, formValuesToSalesReturnPayload(form));
      toast.success('Sales return updated.');
      navigate(`${LIST_PATH}/${id}`);
    } catch (err) { toast.error(applyApiErrors(err, 'Failed to update return')); }
    finally { setIsSubmitting(false); }
  };

  return (
    <ModulePermissionGuard moduleCode={PERM.moduleCode} itemCode={PERM.itemCode} action="edit" moduleLabel="Sales Returns">
      <UserLayout title="Edit Sales Return" subtitle="Update sales return">
        <div className="mb-5">
          <Button type="button" variant="secondary" onClick={() => navigate(`${LIST_PATH}/${id}`)}>
            <ArrowLeft className="mr-2 inline h-4 w-4" />Back
          </Button>
        </div>
        {isLoading || masters.isLoading || !form ? (
          <div className="flex h-64 items-center justify-center text-muted">Loading...</div>
        ) : (
          <SalesReturnForm mode="edit" value={form} errors={errors} isSubmitting={isSubmitting}
            customers={masters.customers} warehouses={masters.warehouses} products={masters.products} taxes={masters.taxes}
            onChange={setForm} onClearFieldError={clearFieldError}
            onCancel={() => navigate(`${LIST_PATH}/${id}`)} onSubmit={handleSubmit} submitLabel="Update Return" />
        )}
      </UserLayout>
    </ModulePermissionGuard>
  );
};
