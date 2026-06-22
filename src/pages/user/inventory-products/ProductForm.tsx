import type { FormEvent, ReactNode } from 'react';
import { Package, RefreshCw, Tag } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';
import { Select } from '../../../components/ui/Select';
import { StatusToggle } from '../../../components/common/StatusToggle';
import type { PortalMasterRecord } from '../../../shared/types/portal.types';
import type { InventoryTaxRecord, InventoryWarehouseRecord } from '../../../shared/types/inventoryMaster.types';
import type { ProductFormValues } from '../../../shared/types/inventoryProduct.types';
import type { ProductPayload } from '../../../services/product.service';

interface ProductFormProps {
  mode: 'create' | 'edit';
  value: ProductFormValues;
  errors?: Partial<Record<keyof ProductFormValues, string>>;
  categories: PortalMasterRecord[];
  units: PortalMasterRecord[];
  brands: PortalMasterRecord[];
  taxes: InventoryTaxRecord[];
  warehouses: InventoryWarehouseRecord[];
  isSubmitting?: boolean;
  isGeneratingCode?: boolean;
  onChange: (value: ProductFormValues) => void;
  onClearFieldError?: (field: keyof ProductFormValues) => void;
  onAutoGenerateCode?: () => void;
  onProductCodeManualChange?: () => void;
  onCancel: () => void;
  onSubmit: (event: FormEvent) => void;
  submitLabel?: string;
}

const SectionCard = ({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
}) => (
  <section className="w-full rounded-sm border border-base bg-surface shadow-sm">
    <div className="flex items-start gap-3 border-b border-base px-6 py-4">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <h2 className="text-base font-semibold text-body">{title}</h2>
        {description ? <p className="mt-0.5 text-sm text-muted">{description}</p> : null}
      </div>
    </div>
    <div className="p-6">{children}</div>
  </section>
);

const fieldGrid = 'grid w-full gap-5 sm:grid-cols-2 xl:grid-cols-3';
const fullWidthField = 'sm:col-span-2 xl:col-span-3';

export const ProductForm = ({
  mode,
  value,
  errors,
  categories,
  units,
  brands,
  taxes,
  warehouses,
  isSubmitting = false,
  isGeneratingCode = false,
  onChange,
  onClearFieldError,
  onAutoGenerateCode,
  onProductCodeManualChange,
  onCancel,
  onSubmit,
  submitLabel = 'Save product',
}: ProductFormProps) => {
  const set = <K extends keyof ProductFormValues>(key: K, val: ProductFormValues[K]) =>
    onChange({ ...value, [key]: val });

  const touch = <K extends keyof ProductFormValues>(key: K, val: ProductFormValues[K]) => {
    onClearFieldError?.(key);
    set(key, val);
  };

  const fieldError = (key: keyof ProductFormValues) => errors?.[key];

  return (
    <form onSubmit={onSubmit} className="mx-auto flex w-full flex-col gap-6">
      <SectionCard
        icon={<Package className="h-4 w-4" />}
        title="Product details"
        description="Basic identification, category, and unit of measure."
      >
        <div className={fieldGrid}>
          <FormField label="Product code" required error={fieldError('productCode')}>
            <div className="flex gap-2">
              <Input
                value={value.productCode}
                onChange={(e) => {
                  onProductCodeManualChange?.();
                  touch('productCode', e.target.value.toUpperCase());
                }}
                placeholder="e.g. PRD0001"
                disabled={isSubmitting}
                className="font-mono"
                error={Boolean(fieldError('productCode'))}
              />
              {mode === 'create' && onAutoGenerateCode ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onAutoGenerateCode}
                  disabled={isSubmitting || isGeneratingCode}
                  className="shrink-0"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isGeneratingCode ? 'animate-spin' : ''}`} />
                  Auto
                </Button>
              ) : null}
            </div>
            {mode === 'create' ? (
              <p className="mt-1.5 text-xs text-muted">
                Auto-generated on load, or enter your own code manually.
              </p>
            ) : null}
          </FormField>

          <FormField label="Product name" required className={fullWidthField} error={fieldError('productName')}>
            <Input
              value={value.productName}
              onChange={(e) => touch('productName', e.target.value)}
              placeholder="Product name"
              error={Boolean(fieldError('productName'))}
            />
          </FormField>

          <FormField label="Category" required error={fieldError('categoryId')}>
            <Select
              value={value.categoryId}
              onChange={(e) => touch('categoryId', e.target.value)}
              error={Boolean(fieldError('categoryId'))}
            >
              <option value="">Select category</option>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Unit" required error={fieldError('unitId')}>
            <Select
              value={value.unitId}
              onChange={(e) => touch('unitId', e.target.value)}
              error={Boolean(fieldError('unitId'))}
            >
              <option value="">Select unit</option>
              {units.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Brand">
            <Select value={value.brandId} onChange={(e) => set('brandId', e.target.value)}>
              <option value="">None</option>
              {brands.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Barcode" error={fieldError('barcode')}>
            <Input
              value={value.barcode}
              onChange={(e) => touch('barcode', e.target.value)}
              placeholder="Optional barcode / SKU"
              error={Boolean(fieldError('barcode'))}
            />
          </FormField>

          <FormField label="Description" className={fullWidthField}>
            <Input
              value={value.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Short description"
            />
          </FormField>

          <div className={fullWidthField}>
            <StatusToggle
              checked={value.status === 'active'}
              onChange={(checked) => set('status', checked ? 'active' : 'inactive')}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        icon={<Tag className="h-4 w-4" />}
        title="Pricing & stock levels"
        description="Purchase and sale prices. Min/max stock for low-stock alerts. Quantity is updated via stock in/out."
      >
        <div className={fieldGrid}>
          <FormField label="Purchase price" error={fieldError('purchasePrice')}>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={value.purchasePrice}
              onChange={(e) => touch('purchasePrice', e.target.value)}
              error={Boolean(fieldError('purchasePrice'))}
            />
          </FormField>

          <FormField label="Sale price" error={fieldError('salePrice')}>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={value.salePrice}
              onChange={(e) => touch('salePrice', e.target.value)}
              error={Boolean(fieldError('salePrice'))}
            />
          </FormField>

          <FormField label="Tax / HSN" error={fieldError('taxId')}>
            <Select
              value={value.taxId}
              onChange={(e) => touch('taxId', e.target.value)}
              error={Boolean(fieldError('taxId'))}
            >
              <option value="">None</option>
              {taxes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.hsnCode} — {item.taxRate}%)
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Default warehouse" error={fieldError('defaultWarehouseId')}>
            <Select
              value={value.defaultWarehouseId}
              onChange={(e) => touch('defaultWarehouseId', e.target.value)}
              error={Boolean(fieldError('defaultWarehouseId'))}
            >
              <option value="">None</option>
              {warehouses.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Min stock (reorder level)" error={fieldError('minStock')}>
            <Input
              type="number"
              min="0"
              step="1"
              value={value.minStock}
              onChange={(e) => touch('minStock', e.target.value)}
              error={Boolean(fieldError('minStock'))}
            />
          </FormField>

          <FormField label="Max stock" error={fieldError('maxStock')}>
            <Input
              type="number"
              min="0"
              step="1"
              value={value.maxStock}
              onChange={(e) => touch('maxStock', e.target.value)}
              error={Boolean(fieldError('maxStock'))}
            />
          </FormField>
        </div>
      </SectionCard>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  );
};

export const emptyProductForm = (): ProductFormValues => ({
  productCode: '',
  productName: '',
  description: '',
  categoryId: '',
  unitId: '',
  brandId: '',
  taxId: '',
  defaultWarehouseId: '',
  purchasePrice: '0',
  salePrice: '0',
  minStock: '0',
  maxStock: '0',
  barcode: '',
  status: 'active',
});

export const recordToFormValues = (item: {
  productCode: string;
  productName: string;
  description?: string;
  category: { id: string };
  unit: { id: string };
  brand?: { id: string };
  tax?: { id: string };
  defaultWarehouse?: { id: string };
  purchasePrice: number;
  salePrice: number;
  minStock: number;
  maxStock: number;
  barcode?: string;
  status: 'active' | 'inactive';
}): ProductFormValues => ({
  productCode: item.productCode,
  productName: item.productName,
  description: item.description ?? '',
  categoryId: item.category.id,
  unitId: item.unit.id,
  brandId: item.brand?.id ?? '',
  taxId: item.tax?.id ?? '',
  defaultWarehouseId: item.defaultWarehouse?.id ?? '',
  purchasePrice: String(item.purchasePrice),
  salePrice: String(item.salePrice),
  minStock: String(item.minStock),
  maxStock: String(item.maxStock),
  barcode: item.barcode ?? '',
  status: item.status,
});

export const formValuesToPayload = (
  form: ProductFormValues,
  options?: { autoGenerateProductCode?: boolean }
): ProductPayload => ({
  ...(options?.autoGenerateProductCode
    ? { autoGenerateProductCode: true }
    : form.productCode.trim()
      ? { productCode: form.productCode.trim().toUpperCase() }
      : {}),
  productName: form.productName.trim(),
  description: form.description.trim() || undefined,
  categoryId: form.categoryId,
  unitId: form.unitId,
  brandId: form.brandId || undefined,
  taxId: form.taxId || undefined,
  defaultWarehouseId: form.defaultWarehouseId || undefined,
  purchasePrice: Number.parseFloat(form.purchasePrice) || 0,
  salePrice: Number.parseFloat(form.salePrice) || 0,
  minStock: Number.parseFloat(form.minStock) || 0,
  maxStock: Number.parseFloat(form.maxStock) || 0,
  barcode: form.barcode.trim() || undefined,
  status: form.status,
});
