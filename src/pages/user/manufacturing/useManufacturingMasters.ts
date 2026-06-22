/**
 * Loads master data needed for manufacturing forms:
 * warehouses, products, active BOMs, and work orders.
 */
import { useEffect, useState } from 'react';
import { inventoryWarehouseService } from '../../../services/master.service';
import { inventoryProductService } from '../../../services/product.service';
import { bomService } from '../../../services/bom.service';
import { workOrderService } from '../../../services/workOrder.service';
import type { InventoryWarehouseRecord } from '../../../shared/types/inventoryMaster.types';
import type { InventoryProductRecord } from '../../../shared/types/inventoryProduct.types';
import type { BOMRecord, WorkOrderRecord } from '../../../shared/types/manufacturing.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';

interface ManufacturingMasters {
  warehouses: InventoryWarehouseRecord[];
  products: InventoryProductRecord[];
  boms: BOMRecord[];
  workOrders: WorkOrderRecord[];
  isLoading: boolean;
}

export const useManufacturingMasters = (loadWorkOrders = false): ManufacturingMasters => {
  const [warehouses, setWarehouses] = useState<InventoryWarehouseRecord[]>([]);
  const [products, setProducts] = useState<InventoryProductRecord[]>([]);
  const [boms, setBoms] = useState<BOMRecord[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const fetches: Promise<unknown>[] = [
          inventoryWarehouseService.getActive() as Promise<InventoryWarehouseRecord[]>,
          inventoryProductService.getActive(),
          bomService.getActive(),
        ];
        if (loadWorkOrders) fetches.push(workOrderService.getAll());

        const [wh, prod, bomsData, woData] = await Promise.all(fetches);
        setWarehouses(wh as InventoryWarehouseRecord[]);
        setProducts(prod as InventoryProductRecord[]);
        setBoms(bomsData as BOMRecord[]);
        if (woData) setWorkOrders(woData as WorkOrderRecord[]);
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Failed to load master data'));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [loadWorkOrders]);

  return { warehouses, products, boms, workOrders, isLoading };
};
