import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

export const WorkOrderEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<WorkOrderFormValues>(emptyWorkOrderForm());
  const [workOrderNumber, setWorkOrderNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { warehouses, boms, isLoading: mastersLoading } = useManufacturingMasters();

  useEffect(() => {
    if (!id) return;
    workOrderService.getById(id)
      .then((item) => {
        if (item.status !== 'draft') {
          toast.warning('Only draft work orders can be edited');
          navigate(`${LIST_PATH}/${id}`);
          return;
        }
        setWorkOrderNumber(item.workOrderNumber);
        setForm({
          workOrderDate: item.workOrderDate?.split('T')[0] ?? '',
          bomId: item.bomId,
          warehouseId: item.warehouseId,
          plannedQty: item.plannedQty,
          scheduledDate: item.scheduledDate?.split('T')[0] ?? '',
          notes: item.notes ?? '',
        });
      })
      .catch((err) => { toast.error(getApiErrorMessage(err, 'Failed to load work order')); navigate(LIST_PATH); });
  }, [id, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setIsSubmitting(true);
      await workOrderService.update(id, {
        workOrderDate: form.workOrderDate,
        warehouseId: form.warehouseId,
        plannedQty: form.plannedQty,
        ...(form.scheduledDate ? { scheduledDate: form.scheduledDate } : {}),
        ...(form.notes ? { notes: form.notes } : {}),
      });
      toast.success('Work order updated');
      navigate(`${LIST_PATH}/${id}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update work order'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModulePermissionGuard moduleCode={PERM.moduleCode} itemCode={PERM.itemCode} action="edit" moduleLabel="Work Orders">
      <UserLayout title="Edit Work Order" subtitle="Edit draft work order details">
        <div className="mb-5">
          <Button type="button" variant="secondary" onClick={() => navigate(`${LIST_PATH}/${id}`)}>
            <ArrowLeft className="mr-2 inline h-4 w-4" /> Back
          </Button>
        </div>
        <WorkOrderForm
          value={form}
          onChange={setForm}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`${LIST_PATH}/${id}`)}
          submitLabel="Update Work Order"
          isSubmitting={isSubmitting || mastersLoading}
          boms={boms}
          warehouses={warehouses}
          workOrderNumber={workOrderNumber}
        />
      </UserLayout>
    </ModulePermissionGuard>
  );
};
