/** Services for all Phase 1 trading document modules. */
import axiosClient from './api/axiosClient';
import { API_ENDPOINTS } from './api/endpoints';
import type { ApiResponse } from '../shared/types/api.types';
import type {
  PurchaseOrderRecord,
  GRNRecord,
  PurchaseReturnRecord,
  SalesOrderRecord,
  DeliveryChallanRecord,
  SalesInvoiceRecord,
  SalesReturnRecord,
} from '../shared/types/trading.types';

// ─── Purchase Order ───────────────────────────────────────────────────────────

export const purchaseOrderService = {
  async getAll(): Promise<PurchaseOrderRecord[]> {
    const res = await axiosClient.get<ApiResponse<{ items: PurchaseOrderRecord[] }>>(API_ENDPOINTS.PURCHASE_ORDERS.LIST);
    return res.data.data?.items ?? [];
  },
  async getById(id: string): Promise<PurchaseOrderRecord> {
    const res = await axiosClient.get<ApiResponse<{ item: PurchaseOrderRecord }>>(API_ENDPOINTS.PURCHASE_ORDERS.BY_ID(id));
    return res.data.data!.item;
  },
  async getNextPoNumber(): Promise<string> {
    const res = await axiosClient.get<ApiResponse<{ poNumber: string }>>(API_ENDPOINTS.PURCHASE_ORDERS.NEXT_NUMBER);
    return res.data.data!.poNumber;
  },
  async create(payload: object): Promise<PurchaseOrderRecord> {
    const res = await axiosClient.post<ApiResponse<{ item: PurchaseOrderRecord }>>(API_ENDPOINTS.PURCHASE_ORDERS.LIST, payload);
    return res.data.data!.item;
  },
  async update(id: string, payload: object): Promise<PurchaseOrderRecord> {
    const res = await axiosClient.put<ApiResponse<{ item: PurchaseOrderRecord }>>(API_ENDPOINTS.PURCHASE_ORDERS.BY_ID(id), payload);
    return res.data.data!.item;
  },
  async approve(id: string): Promise<PurchaseOrderRecord> {
    const res = await axiosClient.post<ApiResponse<{ item: PurchaseOrderRecord }>>(API_ENDPOINTS.PURCHASE_ORDERS.APPROVE(id));
    return res.data.data!.item;
  },
  async cancel(id: string): Promise<PurchaseOrderRecord> {
    const res = await axiosClient.post<ApiResponse<{ item: PurchaseOrderRecord }>>(API_ENDPOINTS.PURCHASE_ORDERS.CANCEL(id));
    return res.data.data!.item;
  },
  async delete(id: string): Promise<void> {
    await axiosClient.delete(API_ENDPOINTS.PURCHASE_ORDERS.BY_ID(id));
  },
};

// ─── GRN ─────────────────────────────────────────────────────────────────────

export const grnService = {
  async getAll(): Promise<GRNRecord[]> {
    const res = await axiosClient.get<ApiResponse<{ items: GRNRecord[] }>>(API_ENDPOINTS.GRNS.LIST);
    return res.data.data?.items ?? [];
  },
  async getById(id: string): Promise<GRNRecord> {
    const res = await axiosClient.get<ApiResponse<{ item: GRNRecord }>>(API_ENDPOINTS.GRNS.BY_ID(id));
    return res.data.data!.item;
  },
  async getNextGrnNumber(): Promise<string> {
    const res = await axiosClient.get<ApiResponse<{ grnNumber: string }>>(API_ENDPOINTS.GRNS.NEXT_NUMBER);
    return res.data.data!.grnNumber;
  },
  async create(payload: object): Promise<GRNRecord> {
    const res = await axiosClient.post<ApiResponse<{ item: GRNRecord }>>(API_ENDPOINTS.GRNS.LIST, payload);
    return res.data.data!.item;
  },
  async update(id: string, payload: object): Promise<GRNRecord> {
    const res = await axiosClient.put<ApiResponse<{ item: GRNRecord }>>(API_ENDPOINTS.GRNS.BY_ID(id), payload);
    return res.data.data!.item;
  },
  async post(id: string): Promise<GRNRecord> {
    const res = await axiosClient.post<ApiResponse<{ item: GRNRecord }>>(API_ENDPOINTS.GRNS.POST(id));
    return res.data.data!.item;
  },
  async cancel(id: string): Promise<GRNRecord> {
    const res = await axiosClient.post<ApiResponse<{ item: GRNRecord }>>(API_ENDPOINTS.GRNS.CANCEL(id));
    return res.data.data!.item;
  },
  async delete(id: string): Promise<void> {
    await axiosClient.delete(API_ENDPOINTS.GRNS.BY_ID(id));
  },
};

// ─── Purchase Return ──────────────────────────────────────────────────────────

export const purchaseReturnService = {
  async getAll(): Promise<PurchaseReturnRecord[]> {
    const res = await axiosClient.get<ApiResponse<{ items: PurchaseReturnRecord[] }>>(API_ENDPOINTS.PURCHASE_RETURNS.LIST);
    return res.data.data?.items ?? [];
  },
  async getById(id: string): Promise<PurchaseReturnRecord> {
    const res = await axiosClient.get<ApiResponse<{ item: PurchaseReturnRecord }>>(API_ENDPOINTS.PURCHASE_RETURNS.BY_ID(id));
    return res.data.data!.item;
  },
  async getNextReturnNumber(): Promise<string> {
    const res = await axiosClient.get<ApiResponse<{ returnNumber: string }>>(API_ENDPOINTS.PURCHASE_RETURNS.NEXT_NUMBER);
    return res.data.data!.returnNumber;
  },
  async create(payload: object): Promise<PurchaseReturnRecord> {
    const res = await axiosClient.post<ApiResponse<{ item: PurchaseReturnRecord }>>(API_ENDPOINTS.PURCHASE_RETURNS.LIST, payload);
    return res.data.data!.item;
  },
  async update(id: string, payload: object): Promise<PurchaseReturnRecord> {
    const res = await axiosClient.put<ApiResponse<{ item: PurchaseReturnRecord }>>(API_ENDPOINTS.PURCHASE_RETURNS.BY_ID(id), payload);
    return res.data.data!.item;
  },
  async post(id: string): Promise<PurchaseReturnRecord> {
    const res = await axiosClient.post<ApiResponse<{ item: PurchaseReturnRecord }>>(API_ENDPOINTS.PURCHASE_RETURNS.POST(id));
    return res.data.data!.item;
  },
  async cancel(id: string): Promise<PurchaseReturnRecord> {
    const res = await axiosClient.post<ApiResponse<{ item: PurchaseReturnRecord }>>(API_ENDPOINTS.PURCHASE_RETURNS.CANCEL(id));
    return res.data.data!.item;
  },
  async delete(id: string): Promise<void> {
    await axiosClient.delete(API_ENDPOINTS.PURCHASE_RETURNS.BY_ID(id));
  },
};

// ─── Sales Order ──────────────────────────────────────────────────────────────

export const salesOrderService = {
  async getAll(): Promise<SalesOrderRecord[]> {
    const res = await axiosClient.get<ApiResponse<{ items: SalesOrderRecord[] }>>(API_ENDPOINTS.SALES_ORDERS.LIST);
    return res.data.data?.items ?? [];
  },
  async getById(id: string): Promise<SalesOrderRecord> {
    const res = await axiosClient.get<ApiResponse<{ item: SalesOrderRecord }>>(API_ENDPOINTS.SALES_ORDERS.BY_ID(id));
    return res.data.data!.item;
  },
  async getNextSoNumber(): Promise<string> {
    const res = await axiosClient.get<ApiResponse<{ soNumber: string }>>(API_ENDPOINTS.SALES_ORDERS.NEXT_NUMBER);
    return res.data.data!.soNumber;
  },
  async create(payload: object): Promise<SalesOrderRecord> {
    const res = await axiosClient.post<ApiResponse<{ item: SalesOrderRecord }>>(API_ENDPOINTS.SALES_ORDERS.LIST, payload);
    return res.data.data!.item;
  },
  async update(id: string, payload: object): Promise<SalesOrderRecord> {
    const res = await axiosClient.put<ApiResponse<{ item: SalesOrderRecord }>>(API_ENDPOINTS.SALES_ORDERS.BY_ID(id), payload);
    return res.data.data!.item;
  },
  async confirm(id: string): Promise<SalesOrderRecord> {
    const res = await axiosClient.post<ApiResponse<{ item: SalesOrderRecord }>>(API_ENDPOINTS.SALES_ORDERS.CONFIRM(id));
    return res.data.data!.item;
  },
  async cancel(id: string): Promise<SalesOrderRecord> {
    const res = await axiosClient.post<ApiResponse<{ item: SalesOrderRecord }>>(API_ENDPOINTS.SALES_ORDERS.CANCEL(id));
    return res.data.data!.item;
  },
  async delete(id: string): Promise<void> {
    await axiosClient.delete(API_ENDPOINTS.SALES_ORDERS.BY_ID(id));
  },
};

// ─── Delivery Challan ─────────────────────────────────────────────────────────

export const deliveryChallanService = {
  async getAll(): Promise<DeliveryChallanRecord[]> {
    const res = await axiosClient.get<ApiResponse<{ items: DeliveryChallanRecord[] }>>(API_ENDPOINTS.DELIVERY_CHALLANS.LIST);
    return res.data.data?.items ?? [];
  },
  async getById(id: string): Promise<DeliveryChallanRecord> {
    const res = await axiosClient.get<ApiResponse<{ item: DeliveryChallanRecord }>>(API_ENDPOINTS.DELIVERY_CHALLANS.BY_ID(id));
    return res.data.data!.item;
  },
  async getNextDcNumber(): Promise<string> {
    const res = await axiosClient.get<ApiResponse<{ dcNumber: string }>>(API_ENDPOINTS.DELIVERY_CHALLANS.NEXT_NUMBER);
    return res.data.data!.dcNumber;
  },
  async create(payload: object): Promise<DeliveryChallanRecord> {
    const res = await axiosClient.post<ApiResponse<{ item: DeliveryChallanRecord }>>(API_ENDPOINTS.DELIVERY_CHALLANS.LIST, payload);
    return res.data.data!.item;
  },
  async update(id: string, payload: object): Promise<DeliveryChallanRecord> {
    const res = await axiosClient.put<ApiResponse<{ item: DeliveryChallanRecord }>>(API_ENDPOINTS.DELIVERY_CHALLANS.BY_ID(id), payload);
    return res.data.data!.item;
  },
  async dispatch(id: string): Promise<DeliveryChallanRecord> {
    const res = await axiosClient.post<ApiResponse<{ item: DeliveryChallanRecord }>>(API_ENDPOINTS.DELIVERY_CHALLANS.DISPATCH(id));
    return res.data.data!.item;
  },
  async cancel(id: string): Promise<DeliveryChallanRecord> {
    const res = await axiosClient.post<ApiResponse<{ item: DeliveryChallanRecord }>>(API_ENDPOINTS.DELIVERY_CHALLANS.CANCEL(id));
    return res.data.data!.item;
  },
  async delete(id: string): Promise<void> {
    await axiosClient.delete(API_ENDPOINTS.DELIVERY_CHALLANS.BY_ID(id));
  },
};

// ─── Sales Invoice ────────────────────────────────────────────────────────────

export const salesInvoiceService = {
  async getAll(): Promise<SalesInvoiceRecord[]> {
    const res = await axiosClient.get<ApiResponse<{ items: SalesInvoiceRecord[] }>>(API_ENDPOINTS.SALES_INVOICES.LIST);
    return res.data.data?.items ?? [];
  },
  async getById(id: string): Promise<SalesInvoiceRecord> {
    const res = await axiosClient.get<ApiResponse<{ item: SalesInvoiceRecord }>>(API_ENDPOINTS.SALES_INVOICES.BY_ID(id));
    return res.data.data!.item;
  },
  async getNextInvoiceNumber(): Promise<string> {
    const res = await axiosClient.get<ApiResponse<{ invoiceNumber: string }>>(API_ENDPOINTS.SALES_INVOICES.NEXT_NUMBER);
    return res.data.data!.invoiceNumber;
  },
  async create(payload: object): Promise<SalesInvoiceRecord> {
    const res = await axiosClient.post<ApiResponse<{ item: SalesInvoiceRecord }>>(API_ENDPOINTS.SALES_INVOICES.LIST, payload);
    return res.data.data!.item;
  },
  async update(id: string, payload: object): Promise<SalesInvoiceRecord> {
    const res = await axiosClient.put<ApiResponse<{ item: SalesInvoiceRecord }>>(API_ENDPOINTS.SALES_INVOICES.BY_ID(id), payload);
    return res.data.data!.item;
  },
  async send(id: string): Promise<SalesInvoiceRecord> {
    const res = await axiosClient.post<ApiResponse<{ item: SalesInvoiceRecord }>>(API_ENDPOINTS.SALES_INVOICES.SEND(id));
    return res.data.data!.item;
  },
  async cancel(id: string): Promise<SalesInvoiceRecord> {
    const res = await axiosClient.post<ApiResponse<{ item: SalesInvoiceRecord }>>(API_ENDPOINTS.SALES_INVOICES.CANCEL(id));
    return res.data.data!.item;
  },
  async delete(id: string): Promise<void> {
    await axiosClient.delete(API_ENDPOINTS.SALES_INVOICES.BY_ID(id));
  },
};

// ─── Sales Return ─────────────────────────────────────────────────────────────

export const salesReturnService = {
  async getAll(): Promise<SalesReturnRecord[]> {
    const res = await axiosClient.get<ApiResponse<{ items: SalesReturnRecord[] }>>(API_ENDPOINTS.SALES_RETURNS.LIST);
    return res.data.data?.items ?? [];
  },
  async getById(id: string): Promise<SalesReturnRecord> {
    const res = await axiosClient.get<ApiResponse<{ item: SalesReturnRecord }>>(API_ENDPOINTS.SALES_RETURNS.BY_ID(id));
    return res.data.data!.item;
  },
  async getNextReturnNumber(): Promise<string> {
    const res = await axiosClient.get<ApiResponse<{ returnNumber: string }>>(API_ENDPOINTS.SALES_RETURNS.NEXT_NUMBER);
    return res.data.data!.returnNumber;
  },
  async create(payload: object): Promise<SalesReturnRecord> {
    const res = await axiosClient.post<ApiResponse<{ item: SalesReturnRecord }>>(API_ENDPOINTS.SALES_RETURNS.LIST, payload);
    return res.data.data!.item;
  },
  async update(id: string, payload: object): Promise<SalesReturnRecord> {
    const res = await axiosClient.put<ApiResponse<{ item: SalesReturnRecord }>>(API_ENDPOINTS.SALES_RETURNS.BY_ID(id), payload);
    return res.data.data!.item;
  },
  async post(id: string): Promise<SalesReturnRecord> {
    const res = await axiosClient.post<ApiResponse<{ item: SalesReturnRecord }>>(API_ENDPOINTS.SALES_RETURNS.POST(id));
    return res.data.data!.item;
  },
  async cancel(id: string): Promise<SalesReturnRecord> {
    const res = await axiosClient.post<ApiResponse<{ item: SalesReturnRecord }>>(API_ENDPOINTS.SALES_RETURNS.CANCEL(id));
    return res.data.data!.item;
  },
  async delete(id: string): Promise<void> {
    await axiosClient.delete(API_ENDPOINTS.SALES_RETURNS.BY_ID(id));
  },
};
