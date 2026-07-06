import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PartyDetailView, type PartyViewData } from '../../../components/common/PartyDetailView';
import { ModulePermissionGuard } from '../../../components/common/ModulePermissionGuard';
import { customerService } from '../../../services/customer.service';
import type { CustomerRecord } from '../../../shared/types/trading.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useModulePermissions } from '../../../shared/permissions/PermissionContext';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';

const LIST_PATH = '/settings/customers';
const PERM = PORTAL_PERMISSION_MODULES.customers;

const toPartyView = (item: CustomerRecord): PartyViewData => ({
  code: item.customerCode,
  name: item.customerName,
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
  creditLimit: item.creditLimit,
  paymentTerms: item.paymentTerms,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

export const CustomerViewPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { canEdit } = useModulePermissions(PERM.moduleCode, PERM.itemCode);
  const [party, setParty] = useState<PartyViewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    customerService
      .getById(id)
      .then((item) => setParty(toPartyView(item)))
      .catch((err) => {
        toast.error(getApiErrorMessage(err, 'Failed to load customer'));
        navigate(LIST_PATH);
      })
      .finally(() => setIsLoading(false));
  }, [id, navigate]);

  return (
    <ModulePermissionGuard moduleCode={PERM.moduleCode} itemCode={PERM.itemCode} action="view" moduleLabel="Customers">
      <PartyDetailView
        entityLabel="Customer"
        listPath={LIST_PATH}
        editPath={id ? `${LIST_PATH}/${id}/edit` : undefined}
        canEdit={canEdit}
        isLoading={isLoading}
        party={party}
        showCommercial
      />
    </ModulePermissionGuard>
  );
};
