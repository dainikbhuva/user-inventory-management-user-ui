import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Button } from '../../../components/ui/Button';
import {
  StockAdjustmentForm,
  formValuesToUpdatePayload,
  recordToFormValues,
} from './StockAdjustmentForm';
import { inventoryStockService } from '../../../services/inventoryStock.service';
import { inventoryProductService } from '../../../services/product.service';
import { inventoryWarehouseService } from '../../../services/master.service';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useFormValidation } from '../../../hooks/useFormValidation';
import {
  getStockAdjustmentValidationSchema,
  validateStockAdjustmentLines,
} from '../../../shared/validation/inventory.validation';
import { ModulePermissionGuard } from '../../../components/common/ModulePermissionGuard';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import type { InventoryWarehouseRecord } from '../../../shared/types/inventoryMaster.types';
import type { InventoryProductRecord } from '../../../shared/types/inventoryProduct.types';
import type { CurrentStockRecord, StockAdjustmentFormValues } from '../../../shared/types/inventoryStock.types';

const LIST_PATH = '/stock-adjustment';
const PERM = PORTAL_PERMISSION_MODULES.stockAdjustment;

export const StockAdjustmentEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<StockAdjustmentFormValues | null>(null);
  const [warehouses, setWarehouses] = useState<InventoryWarehouseRecord[]>([]);
  const [products, setProducts] = useState<InventoryProductRecord[]>([]);
  const [warehouseStock, setWarehouseStock] = useState<CurrentStockRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { errors, clearFieldError, clearErrors, validateFields, applyApiErrors } =
    useFormValidation<StockAdjustmentFormValues>();

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        setIsLoading(true);
        const [item, wh, prod, stock] = await Promise.all([
          inventoryStockService.getAdjustmentById(id),
          inventoryWarehouseService.getActive(),
          inventoryProductService.getActive(),
          inventoryStockService.getCurrentStock(),
        ]);

        if (item.status !== 'draft') {
          toast.warning('Only draft adjustments can be edited.');
          navigate(`${LIST_PATH}/${id}`);
          return;
        }

        setForm(recordToFormValues(item));
        setWarehouses(wh);
        setProducts(prod);
        setWarehouseStock(stock);
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Failed to load adjustment'));
        navigate(LIST_PATH);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [id, navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!id || !form) return;
    clearErrors();

    if (!validateFields(form, getStockAdjustmentValidationSchema({ requireNumber: true }))) {
      toast.warning('Please fix the highlighted fields.');
      return;
    }

    const lineError = validateStockAdjustmentLines(form.lines);
    if (lineError) {
      toast.warning(lineError);
      return;
    }

    try {
      setIsSubmitting(true);
      await inventoryStockService.updateAdjustment(id, formValuesToUpdatePayload(form));
      toast.success('Draft updated successfully.');
      navigate(`${LIST_PATH}/${id}`);
    } catch (err) {
      toast.error(applyApiErrors(err, 'Failed to update adjustment'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !form) {
    return (
      <UserLayout title="Edit Stock Adjustment" subtitle="Loading…">
        <div className="text-muted">Loading…</div>
      </UserLayout>
    );
  }

  return (
    <ModulePermissionGuard
      moduleCode={PERM.moduleCode}
      itemCode={PERM.itemCode}
      action="edit"
      moduleLabel="Stock adjustment"
    >
      <UserLayout title="Edit Stock Adjustment" subtitle="Update draft adjustment">
        <div className="mb-5">
          <Button type="button" variant="secondary" onClick={() => navigate(`${LIST_PATH}/${id}`)}>
            <ArrowLeft className="mr-2 inline h-4 w-4" />
            Back to document
          </Button>
        </div>

        <StockAdjustmentForm
          mode="edit"
          value={form}
          errors={errors}
          warehouses={warehouses}
          products={products}
          warehouseStock={warehouseStock}
          isSubmitting={isSubmitting}
          onChange={setForm}
          onClearFieldError={clearFieldError}
          onCancel={() => navigate(`${LIST_PATH}/${id}`)}
          onSubmit={handleSubmit}
          submitLabel="Save changes"
        />
      </UserLayout>
    </ModulePermissionGuard>
  );
};
