import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Button } from '../../../components/ui/Button';
import { inventoryProductService } from '../../../services/product.service';
import type { InventoryProductRecord } from '../../../shared/types/inventoryProduct.types';
import { PRODUCT_TYPE_OPTIONS } from '../../../shared/types/inventoryProduct.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useModulePermissions } from '../../../shared/permissions/PermissionContext';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import { ModulePermissionGuard } from '../../../components/common/ModulePermissionGuard';

const LIST_PATH = '/products';
const PERM = PORTAL_PERMISSION_MODULES.products;

const InfoRow = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
    <span className="min-w-[140px] text-sm text-muted">{label}</span>
    <span className="text-sm font-medium text-body">{value ?? '—'}</span>
  </div>
);

export const ProductViewPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { canEdit } = useModulePermissions(PERM.moduleCode, PERM.itemCode);
  const [item, setItem] = useState<InventoryProductRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    inventoryProductService
      .getById(id)
      .then(setItem)
      .catch((err) => {
        toast.error(getApiErrorMessage(err, 'Failed to load product'));
        navigate(LIST_PATH);
      })
      .finally(() => setIsLoading(false));
  }, [id, navigate]);

  const productTypeLabel =
    PRODUCT_TYPE_OPTIONS.find((option) => option.value === item?.productType)?.label ?? item?.productType;

  return (
    <ModulePermissionGuard moduleCode={PERM.moduleCode} itemCode={PERM.itemCode} action="view" moduleLabel="Products">
      <UserLayout title="Product details" subtitle={item?.productName ?? 'View product'}>
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <Button type="button" variant="secondary" onClick={() => navigate(LIST_PATH)}>
            <ArrowLeft className="mr-2 inline h-4 w-4" />
            Back to products
          </Button>
          {canEdit && id ? (
            <Button type="button" onClick={() => navigate(`/products/${id}/edit`)}>
              <Pencil className="mr-2 inline h-4 w-4" />
              Edit
            </Button>
          ) : null}
        </div>

        {isLoading || !item ? (
          <div className="flex h-64 items-center justify-center text-muted">Loading...</div>
        ) : (
          <div className="rounded-sm border border-base bg-surface p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-body">{item.productName}</h2>
              <p className="mt-1 font-mono text-sm text-muted">{item.productCode}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoRow label="Product type" value={productTypeLabel} />
              <InfoRow label="Category" value={item.category.name} />
              <InfoRow label="Unit" value={item.unit.name} />
              <InfoRow label="Brand" value={item.brand?.name} />
              <InfoRow label="Purchase price" value={item.purchasePrice} />
              <InfoRow label="Sale price" value={item.salePrice} />
              <InfoRow label="Quantity on hand" value={item.quantityOnHand} />
              <InfoRow label="Min stock" value={item.minStock} />
              <InfoRow label="Max stock" value={item.maxStock} />
              <InfoRow label="Default warehouse" value={item.defaultWarehouse?.name} />
              <InfoRow label="Tax / HSN" value={item.tax?.name} />
              <InfoRow label="Barcode" value={item.barcode} />
              <InfoRow label="Status" value={item.status} />
              <InfoRow label="Description" value={item.description} />
            </div>
          </div>
        )}
      </UserLayout>
    </ModulePermissionGuard>
  );
};
