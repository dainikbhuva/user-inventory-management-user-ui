import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Button } from '../../../components/ui/Button';
import {
  StockAdjustmentForm,
  emptyStockAdjustmentForm,
  formValuesToPayload,
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

export const StockAdjustmentCreatePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<StockAdjustmentFormValues>(emptyStockAdjustmentForm());
  const [warehouses, setWarehouses] = useState<InventoryWarehouseRecord[]>([]);
  const [products, setProducts] = useState<InventoryProductRecord[]>([]);
  const [warehouseStock, setWarehouseStock] = useState<CurrentStockRecord[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingNumber, setIsGeneratingNumber] = useState(false);
  const [autoAdjustmentNumber, setAutoAdjustmentNumber] = useState(true);
  const { errors, clearFieldError, clearErrors, validateFields, applyApiErrors } =
    useFormValidation<StockAdjustmentFormValues>();

  useEffect(() => {
    Promise.all([
      inventoryWarehouseService.getActive(),
      inventoryProductService.getActive(),
      inventoryStockService.getCurrentStock(),
    ])
      .then(([wh, prod, stock]) => {
        setWarehouses(wh);
        setProducts(prod);
        setWarehouseStock(stock);
      })
      .catch((err) => toast.error(getApiErrorMessage(err, 'Failed to load master data')));
  }, []);

  useEffect(() => {
    if (!autoAdjustmentNumber) return;
    setIsGeneratingNumber(true);
    inventoryStockService
      .getNextAdjustmentNumber()
      .then((adjustmentNumber) => setForm((prev) => ({ ...prev, adjustmentNumber })))
      .catch((err) => toast.error(getApiErrorMessage(err, 'Failed to generate document number')))
      .finally(() => setIsGeneratingNumber(false));
  }, [autoAdjustmentNumber]);

  const handleAutoGenerateNumber = async () => {
    try {
      setIsGeneratingNumber(true);
      setAutoAdjustmentNumber(true);
      const adjustmentNumber = await inventoryStockService.getNextAdjustmentNumber();
      setForm((prev) => ({ ...prev, adjustmentNumber }));
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to generate document number'));
    } finally {
      setIsGeneratingNumber(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    clearErrors();

    if (!validateFields(form, getStockAdjustmentValidationSchema({ requireNumber: !autoAdjustmentNumber }))) {
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
      const item = await inventoryStockService.createAdjustment(
        formValuesToPayload(form, { autoGenerateAdjustmentNumber: autoAdjustmentNumber })
      );
      toast.success('Draft saved. Approve the adjustment to update stock.');
      navigate(`${LIST_PATH}/${item.id}`);
    } catch (err) {
      toast.error(applyApiErrors(err, 'Failed to create adjustment'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModulePermissionGuard
      moduleCode={PERM.moduleCode}
      itemCode={PERM.itemCode}
      action="create"
      moduleLabel="Stock adjustment"
    >
      <UserLayout title="New Stock Adjustment" subtitle="Create a draft physical count correction">
        <div className="mb-5">
          <Button type="button" variant="secondary" onClick={() => navigate(LIST_PATH)}>
            <ArrowLeft className="mr-2 inline h-4 w-4" />
            Back to list
          </Button>
        </div>

        <StockAdjustmentForm
          mode="create"
          value={form}
          errors={errors}
          warehouses={warehouses}
          products={products}
          warehouseStock={warehouseStock}
          isSubmitting={isSubmitting}
          autoAdjustmentNumber={autoAdjustmentNumber}
          isGeneratingNumber={isGeneratingNumber}
          onChange={setForm}
          onClearFieldError={clearFieldError}
          onAutoGenerateNumber={handleAutoGenerateNumber}
          onAdjustmentNumberManualChange={() => setAutoAdjustmentNumber(false)}
          onCancel={() => navigate(LIST_PATH)}
          onSubmit={handleSubmit}
          submitLabel="Save draft"
        />
      </UserLayout>
    </ModulePermissionGuard>
  );
};
