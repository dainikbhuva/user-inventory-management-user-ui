import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
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

export const ProductionEntryCreatePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<ProductionEntryFormValues>(emptyProductionEntryForm());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [entryNumber, setEntryNumber] = useState('');
  const { warehouses, products, workOrders, isLoading: mastersLoading } = useManufacturingMasters(true);

  useEffect(() => {
    productionEntryService.getNextEntryNumber().then(setEntryNumber).catch(() => {});
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.workOrderId) { toast.warning('Please select a work order'); return; }
    if (!form.warehouseId) { toast.warning('Please select a warehouse'); return; }
    if (form.producedQty <= 0) { toast.warning('Produced quantity must be greater than 0'); return; }
    try {
      setIsSubmitting(true);
      const record = await productionEntryService.create({
        entryDate: form.entryDate,
        workOrderId: form.workOrderId,
        warehouseId: form.warehouseId,
        producedQty: form.producedQty,
        materialReturns: form.materialReturns.filter((r) => r.productId && r.returnedQty > 0).map((r) => ({
          productId: r.productId,
          returnedQty: r.returnedQty,
          ...(r.notes ? { notes: r.notes } : {}),
        })),
        ...(form.notes ? { notes: form.notes } : {}),
      });
      toast.success('Production entry created');
      navigate(`${LIST_PATH}/${record.id}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to create production entry'));
    } finally { setIsSubmitting(false); }
  };

  return (
    <ModulePermissionGuard moduleCode={PERM.moduleCode} itemCode={PERM.itemCode} action="create" moduleLabel="Production Entries">
      <UserLayout title="New Production Entry" subtitle="Record finished goods produced">
        <div className="mb-5">
          <Button type="button" variant="secondary" onClick={() => navigate(LIST_PATH)}>
            <ArrowLeft className="mr-2 inline h-4 w-4" /> Back
          </Button>
        </div>
        <ProductionEntryForm
          value={form}
          onChange={setForm}
          onSubmit={handleSubmit}
          onCancel={() => navigate(LIST_PATH)}
          submitLabel="Save Draft"
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
