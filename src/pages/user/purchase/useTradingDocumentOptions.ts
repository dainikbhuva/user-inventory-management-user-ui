import { useEffect, useState } from 'react';
import {
  deliveryChallanService,
  grnService,
  purchaseOrderService,
  salesInvoiceService,
  salesOrderService,
} from '../../../services/trading.service';
import type { TradingDocumentOption } from '../../../components/trading/TradingDocumentSelect';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';

const formatDoc = (number: string, date?: string, extra?: string) => {
  const datePart = date ? ` · ${date.slice(0, 10)}` : '';
  const extraPart = extra ? ` · ${extra}` : '';
  return `${number}${datePart}${extraPart}`;
};

export interface TradingDocumentOptions {
  purchaseOrders: TradingDocumentOption[];
  grns: TradingDocumentOption[];
  salesOrders: TradingDocumentOption[];
  deliveryChallans: TradingDocumentOption[];
  salesInvoices: TradingDocumentOption[];
  isLoading: boolean;
}

export const useTradingDocumentOptions = (): TradingDocumentOptions => {
  const [purchaseOrders, setPurchaseOrders] = useState<TradingDocumentOption[]>([]);
  const [grns, setGrns] = useState<TradingDocumentOption[]>([]);
  const [salesOrders, setSalesOrders] = useState<TradingDocumentOption[]>([]);
  const [deliveryChallans, setDeliveryChallans] = useState<TradingDocumentOption[]>([]);
  const [salesInvoices, setSalesInvoices] = useState<TradingDocumentOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [pos, grnList, sos, dcs, invoices] = await Promise.all([
          purchaseOrderService.getAll(),
          grnService.getAll(),
          salesOrderService.getAll(),
          deliveryChallanService.getAll(),
          salesInvoiceService.getAll(),
        ]);

        setPurchaseOrders(
          pos
            .filter((item) => item.status !== 'cancelled')
            .map((item) => ({
              id: item.id,
              label: formatDoc(item.poNumber, item.poDate, item.supplierName),
            }))
        );
        setGrns(
          grnList
            .filter((item) => item.status !== 'cancelled')
            .map((item) => ({
              id: item.id,
              label: formatDoc(item.grnNumber, item.grnDate, item.supplierName),
            }))
        );
        setSalesOrders(
          sos
            .filter((item) => item.status !== 'cancelled')
            .map((item) => ({
              id: item.id,
              label: formatDoc(item.soNumber, item.soDate, item.customerName),
            }))
        );
        setDeliveryChallans(
          dcs
            .filter((item) => item.status !== 'cancelled')
            .map((item) => ({
              id: item.id,
              label: formatDoc(item.dcNumber, item.dcDate, item.customerName),
            }))
        );
        setSalesInvoices(
          invoices
            .filter((item) => item.status !== 'cancelled')
            .map((item) => ({
              id: item.id,
              label: formatDoc(item.invoiceNumber, item.invoiceDate, item.customerName),
            }))
        );
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Failed to load related documents'));
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  return { purchaseOrders, grns, salesOrders, deliveryChallans, salesInvoices, isLoading };
};
