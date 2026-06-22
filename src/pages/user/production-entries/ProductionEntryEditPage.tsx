import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Button } from '../../../components/ui/Button';
import { ProductionEntryForm, emptyProductionEntryForm } from './ProductionEntryForm';
import { productionEntryService } from '../../../services/productionEntry.service';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { ModulePermissionGuard } from '../../../components/common/ModulePermissionGuard';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import { useManufacturingMasters } from '../manufacturing/useManufacturingMasters';
import type { ProductionEntryFormValues } from '../../../shared/types/manufacturing.types';

const LIST_PATH = '/manufacturing/production-entries';
const PERM = PORTAL_PERMISSION_MODULES.productionEntries;

export const ProductionEntryEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<ProductionEntryFormValues>(emptyProductionEntryForm());
  const [entryNumber, setEntryNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { warehouses, products, workOrders, isLoading: mastersLoading } = useManufacturingMasters(true);

  useEffect(() => {
    if (!id) return;
    productionEntryService.getById(id)
      .then((item) => {
        if (item.status !== 'draft') {
          toast.warning('Only draft entries can be edited');
          navigate(`${LIST_PATH}/${id}`);
          return;
        }
        setEntryNumber(item.entryNumber);
        setForm({
          entryDate: item.entryDate?.split('T')[0] ?? '',
          workOrderId: item.workOrderId,
          warehouseId: item.warehouseId,
          producedQty: item.producedQty,
          materialReturns: item.materialReturns.map((r) => ({ productId: r.productId, returnedQty: r.returnedQty, notes: r.notes ?? '' })),
          notes: item.notes ?? '',
        });
      })
      .catch((err) => { toast.error(getApiErrorMessage(err, 'Failed to load')); navigate(LIST_PATH); });
  }, [id, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setIsSubmitting(true);
      await productionEntryService.update(id, {
        entryDate: form.entryDate,
        warehouseId: form.warehouseId,
        producedQty: form.producedQty,
        materialReturns: form.materialReturns.filter((r) => r.productId && r.returnedQty > 0).map((r) => ({
          productId: r.productId,
          returnedQty: r.returnedQty,
          ...(r.notes ? { notes: r.notes } : {}),
        })),
        ...(form.notes ? { notes: form.notes } : {}),
      });
      toast.success('Production entry updated');
      navigate(`${LIST_PATH}/${id}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update'));
    } finally { setIsSubmitting(false); }
  };

  return (
    <ModulePermissionGuard moduleCode={PERM.moduleCode} itemCode={PERM.itemCode} action="edit" moduleLabel="Production Entries">
      <UserLayout title="Edit Production Entry" subtitle="Edit draft production entry">
        <div className="mb-5">
          <Button type="button" variant="secondary" onClick={() => navigate(`${LIST_PATH}/${id}`)}>
            <ArrowLeft className="mr-2 inline h-4 w-4" /> Back
          </Button>
        </div>
        <ProductionEntryForm
          value={form}
          onChange={setForm}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`${LIST_PATH}/${id}`)}
          submitLabel="Update Entry"
          isSubmitting={isSubmitting || mastersLoading}
          entryNumber={entryNumber}
          workOrders={workOrders}
          warehouses={warehouses}
          products={products}
        />
      </UserLayout>
    </ModulePermissionGuard>
  );
};
