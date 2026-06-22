import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Button } from '../../../components/ui/Button';
import { CustomerForm, emptyCustomerForm, formValuesToPayload } from './CustomerForm';
import { customerService } from '../../../services/customer.service';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { ModulePermissionGuard } from '../../../components/common/ModulePermissionGuard';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import type { CustomerFormValues } from '../../../shared/types/trading.types';

const LIST_PATH = '/settings/customers';
const PERM = PORTAL_PERMISSION_MODULES.customers;

export const CustomerCreatePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<CustomerFormValues>(emptyCustomerForm());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [autoCustomerCode, setAutoCustomerCode] = useState(true);
  const { errors, clearFieldError, clearErrors, applyApiErrors } =
    useFormValidation<CustomerFormValues>();

  useEffect(() => {
    if (!autoCustomerCode) return;
    setIsGeneratingCode(true);
    customerService
      .getNextCustomerCode()
      .then((code) => setForm((prev) => ({ ...prev, customerCode: code })))
      .catch((err) => toast.error(getApiErrorMessage(err, 'Failed to generate customer code')))
      .finally(() => setIsGeneratingCode(false));
  }, [autoCustomerCode]);

  const handleAutoGenerateCode = async () => {
    try {
      setIsGeneratingCode(true);
      setAutoCustomerCode(true);
      const code = await customerService.getNextCustomerCode();
      setForm((prev) => ({ ...prev, customerCode: code }));
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to generate customer code'));
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    clearErrors();

    if (!form.customerName.trim()) {
      toast.warning('Please enter customer name.');
      return;
    }

    try {
      setIsSubmitting(true);
      await customerService.create(
        formValuesToPayload(form, { autoGenerateCustomerCode: autoCustomerCode })
      );
      toast.success('Customer created successfully.');
      navigate(LIST_PATH);
    } catch (err) {
      toast.error(applyApiErrors(err, 'Failed to create customer'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModulePermissionGuard
      moduleCode={PERM.moduleCode}
      itemCode={PERM.itemCode}
      action="create"
      moduleLabel="Customers"
    >
      <UserLayout title="Add Customer" subtitle="Create a new customer record">
        <div className="mb-5">
          <Button type="button" variant="secondary" onClick={() => navigate(LIST_PATH)}>
            <ArrowLeft className="mr-2 inline h-4 w-4" />
            Back to customers
          </Button>
        </div>

        <CustomerForm
          mode="create"
          value={form}
          errors={errors}
          isSubmitting={isSubmitting}
          autoCustomerCode={autoCustomerCode}
          isGeneratingCode={isGeneratingCode}
          onChange={setForm}
          onClearFieldError={clearFieldError}
          onAutoGenerateCode={handleAutoGenerateCode}
          onCustomerCodeManualChange={() => setAutoCustomerCode(false)}
          onCancel={() => navigate(LIST_PATH)}
          onSubmit={handleSubmit}
          submitLabel="Create customer"
        />
      </UserLayout>
    </ModulePermissionGuard>
  );
};
