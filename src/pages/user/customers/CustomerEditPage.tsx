import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Button } from '../../../components/ui/Button';
import { CustomerForm, customerToFormValues, formValuesToUpdatePayload } from './CustomerForm';
import { customerService } from '../../../services/customer.service';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { ModulePermissionGuard } from '../../../components/common/ModulePermissionGuard';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import type { CustomerFormValues } from '../../../shared/types/trading.types';

const LIST_PATH = '/settings/customers';
const PERM = PORTAL_PERMISSION_MODULES.customers;

export const CustomerEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<CustomerFormValues | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { errors, clearFieldError, clearErrors, applyApiErrors } =
    useFormValidation<CustomerFormValues>();

  useEffect(() => {
    if (!id) return;
    customerService
      .getById(id)
      .then((item) => setForm(customerToFormValues(item)))
      .catch((err) => {
        toast.error(getApiErrorMessage(err, 'Failed to load customer'));
        navigate(LIST_PATH);
      })
      .finally(() => setIsLoading(false));
  }, [id, navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form || !id) return;
    clearErrors();

    if (!form.customerName.trim()) {
      toast.warning('Please enter customer name.');
      return;
    }

    try {
      setIsSubmitting(true);
      await customerService.update(id, formValuesToUpdatePayload(form));
      toast.success('Customer updated successfully.');
      navigate(LIST_PATH);
    } catch (err) {
      toast.error(applyApiErrors(err, 'Failed to update customer'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModulePermissionGuard
      moduleCode={PERM.moduleCode}
      itemCode={PERM.itemCode}
      action="edit"
      moduleLabel="Customers"
    >
      <UserLayout title="Edit Customer" subtitle="Update customer details">
        <div className="mb-5">
          <Button type="button" variant="secondary" onClick={() => navigate(LIST_PATH)}>
            <ArrowLeft className="mr-2 inline h-4 w-4" />
            Back to customers
          </Button>
        </div>

        {isLoading || !form ? (
          <div className="flex h-64 items-center justify-center text-muted">Loading...</div>
        ) : (
          <CustomerForm
            mode="edit"
            value={form}
            errors={errors}
            isSubmitting={isSubmitting}
            onChange={setForm}
            onClearFieldError={clearFieldError}
            onCancel={() => navigate(LIST_PATH)}
            onSubmit={handleSubmit}
            submitLabel="Update customer"
          />
        )}
      </UserLayout>
    </ModulePermissionGuard>
  );
};
