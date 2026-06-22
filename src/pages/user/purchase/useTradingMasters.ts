/**
 * Hook that loads master data needed for trading document forms:
 * warehouses, suppliers, customers, products, taxes.
 */
import { useEffect, useState } from 'react';
import { inventorySupplierService } from '../../../services/supplier.service';
import { customerService } from '../../../services/customer.service';
import { inventoryWarehouseService, inventoryTaxService } from '../../../services/master.service';
import { inventoryProductService } from '../../../services/product.service';
import type { InventorySupplierRecord, InventoryWarehouseRecord, InventoryTaxRecord } from '../../../shared/types/inventoryMaster.types';
import type { CustomerRecord } from '../../../shared/types/trading.types';
import type { InventoryProductRecord } from '../../../shared/types/inventoryProduct.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';

interface TradingMasters {
  warehouses: InventoryWarehouseRecord[];
  suppliers: InventorySupplierRecord[];
  customers: CustomerRecord[];
  products: InventoryProductRecord[];
  taxes: InventoryTaxRecord[];
  isLoading: boolean;
}

export const useTradingMasters = (): TradingMasters => {
  const [warehouses, setWarehouses] = useState<InventoryWarehouseRecord[]>([]);
  const [suppliers, setSuppliers] = useState<InventorySupplierRecord[]>([]);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [products, setProducts] = useState<InventoryProductRecord[]>([]);
  const [taxes, setTaxes] = useState<InventoryTaxRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [wh, sup, cust, prod, tax] = await Promise.all([
          inventoryWarehouseService.getActive() as Promise<InventoryWarehouseRecord[]>,
          inventorySupplierService.getActive(),
          customerService.getActive(),
          inventoryProductService.getActive(),
          inventoryTaxService.getActive() as Promise<InventoryTaxRecord[]>,
        ]);
        setWarehouses(wh);
        setSuppliers(sup);
        setCustomers(cust);
        setProducts(prod);
        setTaxes(tax);
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Failed to load master data'));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return { warehouses, suppliers, customers, products, taxes, isLoading };
};
