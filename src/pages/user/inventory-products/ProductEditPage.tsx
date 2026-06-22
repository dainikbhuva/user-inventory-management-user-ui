import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Button } from '../../../components/ui/Button';
import {
  ProductForm,
  emptyProductForm,
  formValuesToPayload,
  recordToFormValues,
} from './ProductForm';
import { inventoryProductService } from '../../../services/product.service';
import {
  inventoryBrandService,
  inventoryCategoryService,
  inventoryTaxService,
  inventoryUnitService,
  inventoryWarehouseService,
} from '../../../services/master.service';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { getProductValidationSchema } from '../../../shared/validation/inventory.validation';
import { ModulePermissionGuard } from '../../../components/common/ModulePermissionGuard';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import type { PortalMasterRecord } from '../../../shared/types/portal.types';
import type { InventoryTaxRecord, InventoryWarehouseRecord } from '../../../shared/types/inventoryMaster.types';
import type { ProductFormValues } from '../../../shared/types/inventoryProduct.types';

const LIST_PATH = '/products';
const PERM = PORTAL_PERMISSION_MODULES.products;

export const ProductEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<ProductFormValues>(emptyProductForm());
  const [categories, setCategories] = useState<PortalMasterRecord[]>([]);
  const [units, setUnits] = useState<PortalMasterRecord[]>([]);
  const [brands, setBrands] = useState<PortalMasterRecord[]>([]);
  const [taxes, setTaxes] = useState<InventoryTaxRecord[]>([]);
  const [warehouses, setWarehouses] = useState<InventoryWarehouseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { errors, clearFieldError, clearErrors, validateFields, applyApiErrors } =
    useFormValidation<ProductFormValues>();

  useEffect(() => {
    if (!id) return;
    Promise.all([
      inventoryProductService.getById(id),
      inventoryCategoryService.getActive(),
      inventoryUnitService.getActive(),
      inventoryBrandService.getActive(),
      inventoryTaxService.getActive(),
      inventoryWarehouseService.getActive(),
    ])
      .then(([product, cat, unit, brand, tax, wh]) => {
        setForm(recordToFormValues(product));
        setCategories(cat);
        setUnits(unit);
        setBrands(brand);
        setTaxes(tax);
        setWarehouses(wh);
      })
      .catch((err) => {
        toast.error(getApiErrorMessage(err, 'Failed to load product'));
        navigate(LIST_PATH);
      })
      .finally(() => setIsLoading(false));
  }, [id, navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!id) return;
    clearErrors();

    if (!validateFields(form, getProductValidationSchema({ requireCode: true }))) {
      toast.warning('Please fix the highlighted fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      await inventoryProductService.update(id, formValuesToPayload(form));
      toast.success('Product updated successfully.');
      navigate(LIST_PATH);
    } catch (err) {
      toast.error(applyApiErrors(err, 'Failed to update product'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <UserLayout title="Edit Product" subtitle="Loading…">
        <div className="text-muted">Loading product…</div>
      </UserLayout>
    );
  }

  return (
    <ModulePermissionGuard
      moduleCode={PERM.moduleCode}
      itemCode={PERM.itemCode}
      action="edit"
      moduleLabel="Products"
    >
      <UserLayout title="Edit Product" subtitle="Update product details">
        <div className="mb-5">
          <Button type="button" variant="secondary" onClick={() => navigate(LIST_PATH)}>
            <ArrowLeft className="mr-2 inline h-4 w-4" />
            Back to products
          </Button>
        </div>

        <ProductForm
          mode="edit"
          value={form}
          errors={errors}
          categories={categories}
          units={units}
          brands={brands}
          taxes={taxes}
          warehouses={warehouses}
          isSubmitting={isSubmitting}
          onChange={setForm}
          onClearFieldError={clearFieldError}
          onCancel={() => navigate(LIST_PATH)}
          onSubmit={handleSubmit}
          submitLabel="Save changes"
        />
      </UserLayout>
    </ModulePermissionGuard>
  );
};
