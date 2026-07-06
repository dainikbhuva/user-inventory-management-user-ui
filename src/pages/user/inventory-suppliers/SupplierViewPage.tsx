import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PartyDetailView, type PartyViewData } from '../../../components/common/PartyDetailView';
import { ModulePermissionGuard } from '../../../components/common/ModulePermissionGuard';
import { inventorySupplierService } from '../../../services/supplier.service';
import type { InventorySupplierRecord } from '../../../shared/types/inventoryMaster.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useModulePermissions } from '../../../shared/permissions/PermissionContext';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';

const LIST_PATH = '/settings/inventory-suppliers';
const PERM = PORTAL_PERMISSION_MODULES.inventorySuppliers;

const toPartyView = (item: InventorySupplierRecord): PartyViewData => ({
  code: item.supplierCode,
  name: item.supplierName,
  status: item.status,
  contactPerson: item.contactPerson,
  email: item.email,
  mobile: item.mobile,
  alternateMobile: item.alternateMobile,
  gstNumber: item.gstNumber,
  panNumber: item.panNumber,
  website: item.website,
  address1: item.address1,
  address2: item.address2,
  country: item.country,
  state: item.state,
  city: item.city,
  pincode: item.pincode,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

export const SupplierViewPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { canEdit } = useModulePermissions(PERM.moduleCode, PERM.itemCode);
  const [party, setParty] = useState<PartyViewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    inventorySupplierService
      .getById(id)
      .then((item) => setParty(toPartyView(item)))
      .catch((err) => {
        toast.error(getApiErrorMessage(err, 'Failed to load supplier'));
        navigate(LIST_PATH);
      })
      .finally(() => setIsLoading(false));
  }, [id, navigate]);

  return (
    <ModulePermissionGuard
      moduleCode={PERM.moduleCode}
      itemCode={PERM.itemCode}
      action="view"
      moduleLabel="Suppliers"
    >
      <PartyDetailView
        entityLabel="Supplier"
        listPath={LIST_PATH}
        editPath={id ? `${LIST_PATH}/${id}/edit` : undefined}
        canEdit={canEdit}
        isLoading={isLoading}
        party={party}
      />
    </ModulePermissionGuard>
  );
};
