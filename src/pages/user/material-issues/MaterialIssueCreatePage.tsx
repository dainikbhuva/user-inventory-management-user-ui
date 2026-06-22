import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Button } from '../../../components/ui/Button';
import { MaterialIssueForm, emptyMaterialIssueForm } from './MaterialIssueForm';
import { materialIssueService } from '../../../services/materialIssue.service';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { ModulePermissionGuard } from '../../../components/common/ModulePermissionGuard';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import { useManufacturingMasters } from '../manufacturing/useManufacturingMasters';
import type { MaterialIssueFormValues } from '../../../shared/types/manufacturing.types';

const LIST_PATH = '/manufacturing/material-issues';
const PERM = PORTAL_PERMISSION_MODULES.materialIssues;

export const MaterialIssueCreatePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<MaterialIssueFormValues>(emptyMaterialIssueForm());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issueNumber, setIssueNumber] = useState('');
  const { warehouses, products, workOrders, isLoading: mastersLoading } = useManufacturingMasters(true);

  useEffect(() => {
    materialIssueService.getNextIssueNumber().then(setIssueNumber).catch(() => {});
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.workOrderId) { toast.warning('Please select a work order'); return; }
    if (!form.warehouseId) { toast.warning('Please select a warehouse'); return; }
    if (form.lines.some((l) => !l.productId || l.issuedQty <= 0)) {
      toast.warning('All lines must have a product and issued quantity > 0'); return;
    }
    try {
      setIsSubmitting(true);
      const record = await materialIssueService.create({
        issueDate: form.issueDate,
        workOrderId: form.workOrderId,
        warehouseId: form.warehouseId,
        ...(form.notes ? { notes: form.notes } : {}),
        lines: form.lines.map((l) => ({
          productId: l.productId,
          requiredQty: l.requiredQty,
          issuedQty: l.issuedQty,
          ...(l.notes ? { notes: l.notes } : {}),
        })),
      });
      toast.success('Material issue created');
      navigate(`${LIST_PATH}/${record.id}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to create material issue'));
    } finally { setIsSubmitting(false); }
  };

  return (
    <ModulePermissionGuard moduleCode={PERM.moduleCode} itemCode={PERM.itemCode} action="create" moduleLabel="Material Issues">
      <UserLayout title="New Material Issue" subtitle="Issue raw materials for a work order">
        <div className="mb-5">
          <Button type="button" variant="secondary" onClick={() => navigate(LIST_PATH)}>
            <ArrowLeft className="mr-2 inline h-4 w-4" /> Back
          </Button>
        </div>
        <MaterialIssueForm
          value={form}
          onChange={setForm}
          onSubmit={handleSubmit}
          onCancel={() => navigate(LIST_PATH)}
          submitLabel="Save Draft"
          isSubmitting={isSubmitting || mastersLoading}
          issueNumber={issueNumber}
          workOrders={workOrders}
          warehouses={warehouses}
          products={products}
        />
      </UserLayout>
    </ModulePermissionGuard>
  );
};
