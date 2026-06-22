import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

export const MaterialIssueEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<MaterialIssueFormValues>(emptyMaterialIssueForm());
  const [issueNumber, setIssueNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { warehouses, products, workOrders, isLoading: mastersLoading } = useManufacturingMasters(true);

  useEffect(() => {
    if (!id) return;
    materialIssueService.getById(id)
      .then((item) => {
        if (item.status !== 'draft') {
          toast.warning('Only draft issues can be edited');
          navigate(`${LIST_PATH}/${id}`);
          return;
        }
        setIssueNumber(item.issueNumber);
        setForm({
          issueDate: item.issueDate?.split('T')[0] ?? '',
          workOrderId: item.workOrderId,
          warehouseId: item.warehouseId,
          notes: item.notes ?? '',
          lines: item.lines.map((l) => ({
            productId: l.productId,
            requiredQty: l.requiredQty,
            issuedQty: l.issuedQty,
            notes: l.notes ?? '',
          })),
        });
      })
      .catch((err) => { toast.error(getApiErrorMessage(err, 'Failed to load')); navigate(LIST_PATH); });
  }, [id, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setIsSubmitting(true);
      await materialIssueService.update(id, {
        issueDate: form.issueDate,
        warehouseId: form.warehouseId,
        ...(form.notes ? { notes: form.notes } : {}),
        lines: form.lines.map((l) => ({
          productId: l.productId,
          requiredQty: l.requiredQty,
          issuedQty: l.issuedQty,
          ...(l.notes ? { notes: l.notes } : {}),
        })),
      });
      toast.success('Material issue updated');
      navigate(`${LIST_PATH}/${id}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update'));
    } finally { setIsSubmitting(false); }
  };

  return (
    <ModulePermissionGuard moduleCode={PERM.moduleCode} itemCode={PERM.itemCode} action="edit" moduleLabel="Material Issues">
      <UserLayout title="Edit Material Issue" subtitle="Edit draft material issue">
        <div className="mb-5">
          <Button type="button" variant="secondary" onClick={() => navigate(`${LIST_PATH}/${id}`)}>
            <ArrowLeft className="mr-2 inline h-4 w-4" /> Back
          </Button>
        </div>
        <MaterialIssueForm
          value={form}
          onChange={setForm}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`${LIST_PATH}/${id}`)}
          submitLabel="Update Issue"
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
