import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Button } from '../../../components/ui/Button';
import {
  SupplierForm,
  formValuesToUpdatePayload,
  supplierToFormValues,
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

export const SupplierEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<SupplierFormValues | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { errors, clearFieldError, clearErrors, validateFields, applyApiErrors } =
    useFormValidation<SupplierFormValues>();

  useEffect(() => {
    if (!id) return;
    inventorySupplierService
      .getById(id)
      .then((item) => setForm(supplierToFormValues(item)))
      .catch((err) => {
        toast.error(getApiErrorMessage(err, 'Failed to load supplier'));
        navigate(LIST_PATH);
      })
      .finally(() => setIsLoading(false));
  }, [id, navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form || !id) return;
    clearErrors();

    if (!validateFields(form, getSupplierValidationSchema({ requireCode: true }))) {
      toast.warning('Please fix the highlighted fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      await inventorySupplierService.update(id, formValuesToUpdatePayload(form));
      toast.success('Supplier updated successfully.');
      navigate(LIST_PATH);
    } catch (err) {
      toast.error(applyApiErrors(err, 'Failed to update supplier'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModulePermissionGuard
      moduleCode={PERM.moduleCode}
      itemCode={PERM.itemCode}
      action="edit"
      moduleLabel="Suppliers"
    >
      <UserLayout title="Edit Supplier" subtitle="Update supplier details">
        <div className="mb-5">
          <Button type="button" variant="secondary" onClick={() => navigate(LIST_PATH)}>
            <ArrowLeft className="mr-2 inline h-4 w-4" />
            Back to suppliers
          </Button>
        </div>

        {isLoading || !form ? (
          <div className="flex h-64 items-center justify-center text-muted">Loading...</div>
        ) : (
          <SupplierForm
            mode="edit"
            value={form}
            errors={errors}
            isSubmitting={isSubmitting}
            onChange={setForm}
            onClearFieldError={clearFieldError}
            onCancel={() => navigate(LIST_PATH)}
            onSubmit={handleSubmit}
            submitLabel="Update supplier"
          />
        )}
      </UserLayout>
    </ModulePermissionGuard>
  );
};
