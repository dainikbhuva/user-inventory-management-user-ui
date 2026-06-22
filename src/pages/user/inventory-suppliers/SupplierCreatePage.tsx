import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Button } from '../../../components/ui/Button';
import {
  SupplierForm,
  emptySupplierForm,
  formValuesToPayload,
} from './SupplierForm';
import { inventorySupplierService } from '../../../services/supplier.service';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { getSupplierValidationSchema } from '../../../shared/validation/inventory.validation';
import { ModulePermissionGuard } from '../../../components/common/ModulePermissionGuard';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import type { SupplierFormValues } from '../../../shared/types/inventoryMaster.types';

const LIST_PATH = '/settings/inventory-suppliers';
const PERM = PORTAL_PERMISSION_MODULES.inventorySuppliers;

export const SupplierCreatePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<SupplierFormValues>(emptySupplierForm());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [autoSupplierCode, setAutoSupplierCode] = useState(true);
  const { errors, clearFieldError, clearErrors, validateFields, applyApiErrors } =
    useFormValidation<SupplierFormValues>();

  useEffect(() => {
    if (!autoSupplierCode) return;
    setIsGeneratingCode(true);
    inventorySupplierService
      .getNextSupplierCode()
      .then((code) => setForm((prev) => ({ ...prev, supplierCode: code })))
      .catch((err) => toast.error(getApiErrorMessage(err, 'Failed to generate supplier code')))
      .finally(() => setIsGeneratingCode(false));
  }, [autoSupplierCode]);

  const handleAutoGenerateCode = async () => {
    try {
      setIsGeneratingCode(true);
      setAutoSupplierCode(true);
      const code = await inventorySupplierService.getNextSupplierCode();
      setForm((prev) => ({ ...prev, supplierCode: code }));
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to generate supplier code'));
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    clearErrors();

    if (!validateFields(form, getSupplierValidationSchema({ requireCode: !autoSupplierCode }))) {
      toast.warning('Please fix the highlighted fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      await inventorySupplierService.create(
        formValuesToPayload(form, { autoGenerateSupplierCode: autoSupplierCode })
      );
      toast.success('Supplier created successfully.');
      navigate(LIST_PATH);
    } catch (err) {
      toast.error(applyApiErrors(err, 'Failed to create supplier'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModulePermissionGuard
      moduleCode={PERM.moduleCode}
      itemCode={PERM.itemCode}
      action="create"
      moduleLabel="Suppliers"
    >
      <UserLayout title="Add Supplier" subtitle="Create a new vendor or supplier record">
        <div className="mb-5">
          <Button type="button" variant="secondary" onClick={() => navigate(LIST_PATH)}>
            <ArrowLeft className="mr-2 inline h-4 w-4" />
            Back to suppliers
          </Button>
        </div>

        <SupplierForm
          mode="create"
          value={form}
          errors={errors}
          isSubmitting={isSubmitting}
          autoSupplierCode={autoSupplierCode}
          isGeneratingCode={isGeneratingCode}
          onChange={setForm}
          onClearFieldError={clearFieldError}
          onAutoGenerateCode={handleAutoGenerateCode}
          onSupplierCodeManualChange={() => setAutoSupplierCode(false)}
          onCancel={() => navigate(LIST_PATH)}
          onSubmit={handleSubmit}
          submitLabel="Create supplier"
        />
      </UserLayout>
    </ModulePermissionGuard>
  );
};
