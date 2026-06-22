import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Button } from '../../../components/ui/Button';
import {
  StockMovementForm,
  formValuesToUpdatePayload,
  recordToFormValues,
} from './StockMovementForm';
import { stockMovementService } from '../../../services/stockMovement.service';
import { inventoryProductService } from '../../../services/product.service';
import { inventorySupplierService } from '../../../services/supplier.service';
import { inventoryWarehouseService } from '../../../services/master.service';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useFormValidation } from '../../../hooks/useFormValidation';
import {
  getStockMovementValidationSchema,
  validateStockMovementLines,
} from '../../../shared/validation/inventory.validation';
import { ModulePermissionGuard } from '../../../components/common/ModulePermissionGuard';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import type { InventorySupplierRecord, InventoryWarehouseRecord } from '../../../shared/types/inventoryMaster.types';
import type { InventoryProductRecord, StockMovementFormValues, StockMovementType } from '../../../shared/types/inventoryProduct.types';

const configFor = (movementType: StockMovementType) => {
  if (movementType === 'in') {
    return {
      listPath: '/stock-in',
      viewPath: (id: string) => `/stock-in/${id}`,
      perm: PORTAL_PERMISSION_MODULES.stockIn,
      title: 'Edit Stock In',
      subtitle: 'Update draft stock in document',
      moduleLabel: 'Stock in',
    };
  }
  return {
    listPath: '/stock-out',
    viewPath: (id: string) => `/stock-out/${id}`,
    perm: PORTAL_PERMISSION_MODULES.stockOut,
    title: 'Edit Stock Out',
    subtitle: 'Update draft stock out document',
    moduleLabel: 'Stock out',
  };
};

export const StockMovementEditPage = ({ movementType }: { movementType: StockMovementType }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const config = configFor(movementType);
  const [form, setForm] = useState<StockMovementFormValues | null>(null);
  const [warehouses, setWarehouses] = useState<InventoryWarehouseRecord[]>([]);
  const [suppliers, setSuppliers] = useState<InventorySupplierRecord[]>([]);
  const [products, setProducts] = useState<InventoryProductRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { errors, clearFieldError, clearErrors, validateFields, applyApiErrors } =
    useFormValidation<StockMovementFormValues>();

  useEffect(() => {
    if (!id) return;

    const listPath = movementType === 'in' ? '/stock-in' : '/stock-out';
    const viewPath = `${listPath}/${id}`;

    const load = async () => {
      try {
        setIsLoading(true);
        const [item, wh, sup, prod] = await Promise.all([
          stockMovementService.getById(movementType, id),
          inventoryWarehouseService.getActive(),
          movementType === 'in' ? inventorySupplierService.getActive() : Promise.resolve([]),
          inventoryProductService.getActive(),
        ]);

        if (item.status !== 'draft') {
          toast.warning('Only draft documents can be edited.');
          navigate(viewPath);
          return;
        }

        setForm(recordToFormValues(item));
        setWarehouses(wh);
        setSuppliers(sup);
        setProducts(prod);
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Failed to load document'));
        navigate(listPath);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [id, movementType, navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!id || !form) return;
    clearErrors();

    if (!validateFields(form, getStockMovementValidationSchema({ requireDocumentNo: true }))) {
      toast.warning('Please fix the highlighted fields.');
      return;
    }

    const lineError = validateStockMovementLines(form.lines);
    if (lineError) {
      toast.warning(lineError);
      return;
    }

    try {
      setIsSubmitting(true);
      await stockMovementService.update(movementType, id, formValuesToUpdatePayload(form));
      toast.success('Draft updated successfully.');
      navigate(config.viewPath(id));
    } catch (err) {
      toast.error(applyApiErrors(err, 'Failed to update document'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !form) {
    return (
      <UserLayout title={config.title} subtitle="Loading document…">
        <div className="text-muted">Loading…</div>
      </UserLayout>
    );
  }

  return (
    <ModulePermissionGuard
      moduleCode={config.perm.moduleCode}
      itemCode={config.perm.itemCode}
      action="edit"
      moduleLabel={config.moduleLabel}
    >
      <UserLayout title={config.title} subtitle={config.subtitle}>
        <div className="mb-5">
          <Button type="button" variant="secondary" onClick={() => navigate(config.viewPath(id!))}>
            <ArrowLeft className="mr-2 inline h-4 w-4" />
            Back to document
          </Button>
        </div>

        <StockMovementForm
          mode="edit"
          movementType={movementType}
          value={form}
          errors={errors}
          warehouses={warehouses}
          suppliers={suppliers}
          products={products}
          isSubmitting={isSubmitting}
          onChange={setForm}
          onClearFieldError={clearFieldError}
          onCancel={() => navigate(config.viewPath(id!))}
          onSubmit={handleSubmit}
          submitLabel="Save changes"
        />
      </UserLayout>
    </ModulePermissionGuard>
  );
};

export const StockInEditPage = () => <StockMovementEditPage movementType="in" />;
export const StockOutEditPage = () => <StockMovementEditPage movementType="out" />;
