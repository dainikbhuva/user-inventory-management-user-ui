import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Button } from '../../../components/ui/Button';
import {
  ProductForm,
  emptyProductForm,
  formValuesToPayload,
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
import {
  getProductValidationSchema,
} from '../../../shared/validation/inventory.validation';
import { ModulePermissionGuard } from '../../../components/common/ModulePermissionGuard';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import type { PortalMasterRecord } from '../../../shared/types/portal.types';
import type { InventoryTaxRecord, InventoryWarehouseRecord } from '../../../shared/types/inventoryMaster.types';
import type { ProductFormValues } from '../../../shared/types/inventoryProduct.types';

const LIST_PATH = '/products';
const PERM = PORTAL_PERMISSION_MODULES.products;

export const ProductCreatePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<ProductFormValues>(emptyProductForm());
  const [categories, setCategories] = useState<PortalMasterRecord[]>([]);
  const [units, setUnits] = useState<PortalMasterRecord[]>([]);
  const [brands, setBrands] = useState<PortalMasterRecord[]>([]);
  const [taxes, setTaxes] = useState<InventoryTaxRecord[]>([]);
  const [warehouses, setWarehouses] = useState<InventoryWarehouseRecord[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [autoProductCode, setAutoProductCode] = useState(true);
  const { errors, clearFieldError, clearErrors, validateFields, applyApiErrors } =
    useFormValidation<ProductFormValues>();

  useEffect(() => {
    Promise.all([
      inventoryCategoryService.getActive(),
      inventoryUnitService.getActive(),
      inventoryBrandService.getActive(),
      inventoryTaxService.getActive(),
      inventoryWarehouseService.getActive(),
    ])
      .then(([cat, unit, brand, tax, wh]) => {
        setCategories(cat);
        setUnits(unit);
        setBrands(brand);
        setTaxes(tax);
        setWarehouses(wh);
      })
      .catch((err) => toast.error(getApiErrorMessage(err, 'Failed to load master data')));
  }, []);

  useEffect(() => {
    if (!autoProductCode) return;
    setIsGeneratingCode(true);
    inventoryProductService
      .getNextProductCode()
      .then((code) => setForm((prev) => ({ ...prev, productCode: code })))
      .catch((err) => toast.error(getApiErrorMessage(err, 'Failed to generate product code')))
      .finally(() => setIsGeneratingCode(false));
  }, [autoProductCode]);

  const handleAutoGenerateCode = async () => {
    try {
      setIsGeneratingCode(true);
      setAutoProductCode(true);
      const code = await inventoryProductService.getNextProductCode();
      setForm((prev) => ({ ...prev, productCode: code }));
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to generate product code'));
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    clearErrors();

    if (!validateFields(form, getProductValidationSchema({ requireCode: !autoProductCode }))) {
      toast.warning('Please fix the highlighted fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      await inventoryProductService.create(
        formValuesToPayload(form, { autoGenerateProductCode: autoProductCode })
      );
      toast.success('Product created successfully.');
      navigate(LIST_PATH);
    } catch (err) {
      toast.error(applyApiErrors(err, 'Failed to create product'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModulePermissionGuard
      moduleCode={PERM.moduleCode}
      itemCode={PERM.itemCode}
      action="create"
      moduleLabel="Products"
    >
      <UserLayout title="Add Product" subtitle="Create a new product in your catalog">
        <div className="mb-5">
          <Button type="button" variant="secondary" onClick={() => navigate(LIST_PATH)}>
            <ArrowLeft className="mr-2 inline h-4 w-4" />
            Back to products
          </Button>
        </div>

        <ProductForm
          mode="create"
          value={form}
          errors={errors}
          categories={categories}
          units={units}
          brands={brands}
          taxes={taxes}
          warehouses={warehouses}
          isSubmitting={isSubmitting}
          isGeneratingCode={isGeneratingCode}
          onChange={setForm}
          onClearFieldError={clearFieldError}
          onAutoGenerateCode={handleAutoGenerateCode}
          onProductCodeManualChange={() => setAutoProductCode(false)}
          onCancel={() => navigate(LIST_PATH)}
          onSubmit={handleSubmit}
          submitLabel="Create product"
        />
      </UserLayout>
    </ModulePermissionGuard>
  );
};
