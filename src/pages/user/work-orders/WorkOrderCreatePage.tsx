import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Button } from '../../../components/ui/Button';
import { WorkOrderForm, emptyWorkOrderForm } from './WorkOrderForm';
import { workOrderService } from '../../../services/workOrder.service';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { ModulePermissionGuard } from '../../../components/common/ModulePermissionGuard';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import { useManufacturingMasters } from '../manufacturing/useManufacturingMasters';
import type { WorkOrderFormValues } from '../../../shared/types/manufacturing.types';

const LIST_PATH = '/manufacturing/work-orders';
const PERM = PORTAL_PERMISSION_MODULES.workOrders;

export const WorkOrderCreatePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<WorkOrderFormValues>(emptyWorkOrderForm());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workOrderNumber, setWorkOrderNumber] = useState('');
  const { warehouses, boms, isLoading: mastersLoading } = useManufacturingMasters();

  useEffect(() => {
    workOrderService.getNextWorkOrderNumber()
      .then(setWorkOrderNumber)
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.bomId) { toast.warning('Please select a BOM'); return; }
    if (!form.warehouseId) { toast.warning('Please select a warehouse'); return; }
    try {
      setIsSubmitting(true);
      const record = await workOrderService.create({
        workOrderDate: form.workOrderDate,
        bomId: form.bomId,
        warehouseId: form.warehouseId,
        plannedQty: form.plannedQty,
        ...(form.scheduledDate ? { scheduledDate: form.scheduledDate } : {}),
        ...(form.notes ? { notes: form.notes } : {}),
      });
      toast.success('Work order created successfully');
      navigate(`${LIST_PATH}/${record.id}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to create work order'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModulePermissionGuard moduleCode={PERM.moduleCode} itemCode={PERM.itemCode} action="create" moduleLabel="Work Orders">
      <UserLayout title="New Work Order" subtitle="Create a production work order">
        <div className="mb-5">
          <Button type="button" variant="secondary" onClick={() => navigate(LIST_PATH)}>
            <ArrowLeft className="mr-2 inline h-4 w-4" /> Back to work orders
          </Button>
        </div>
        <WorkOrderForm
          value={form}
          onChange={setForm}
          onSubmit={handleSubmit}
          onCancel={() => navigate(LIST_PATH)}
          submitLabel="Create Work Order"
          isSubmitting={isSubmitting || mastersLoading}
          boms={boms}
          warehouses={warehouses}
          workOrderNumber={workOrderNumber}
        />
      </UserLayout>
    </ModulePermissionGuard>
  );
};
