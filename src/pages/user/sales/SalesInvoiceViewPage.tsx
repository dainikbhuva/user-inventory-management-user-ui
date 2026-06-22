import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Send, XCircle } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Button } from '../../../components/ui/Button';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { salesInvoiceService } from '../../../services/trading.service';
import type { SalesInvoiceRecord } from '../../../shared/types/trading.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { TradingStatusBadge } from '../trading/TradingStatusBadge';
import { useModulePermissions } from '../../../shared/permissions/PermissionContext';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import { ModulePermissionGuard } from '../../../components/common/ModulePermissionGuard';

const LIST_PATH = '/sales/sales-invoices';
const PERM = PORTAL_PERMISSION_MODULES.salesInvoices;
const formatDate = (d?: string) => (d ? new Date(d).toLocaleDateString('en-IN') : '—');
const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);

const InfoRow = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
    <span className="min-w-[140px] text-sm text-muted">{label}</span>
    <span className="text-sm font-medium text-body">{value || '—'}</span>
  </div>
);

export const SalesInvoiceViewPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { canEdit } = useModulePermissions(PERM.moduleCode, PERM.itemCode);
  const [item, setItem] = useState<SalesInvoiceRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    salesInvoiceService.getById(id).then(setItem)
      .catch((err) => { toast.error(getApiErrorMessage(err, 'Failed to load invoice')); navigate(LIST_PATH); })
      .finally(() => setIsLoading(false));
  }, [id, navigate]);

  const handleSend = async () => {
    if (!id) return;
    try {
      setIsSending(true);
      const updated = await salesInvoiceService.send(id);
      setItem(updated); toast.success('Invoice marked as sent.');
    } catch (err) { toast.error(getApiErrorMessage(err, 'Failed to mark invoice as sent')); }
    finally { setIsSending(false); }
  };

  const handleCancel = async () => {
    if (!id) return;
    try {
      setIsCancelling(true);
      const updated = await salesInvoiceService.cancel(id);
      setItem(updated); setShowCancelModal(false);
      toast.success('Invoice cancelled.');
    } catch (err) { toast.error(getApiErrorMessage(err, 'Failed to cancel invoice')); }
    finally { setIsCancelling(false); }
  };

  return (
    <ModulePermissionGuard moduleCode={PERM.moduleCode} itemCode={PERM.itemCode} action="view" moduleLabel="Sales Invoices">
      <UserLayout title="Sales Invoice" subtitle="View invoice details">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(LIST_PATH)}>
            <ArrowLeft className="mr-2 inline h-4 w-4" />Back
          </Button>
          {item && canEdit && item.status === 'draft' ? (
            <>
              <Button type="button" variant="secondary" onClick={() => navigate(`${LIST_PATH}/${id}/edit`)}>
                <Pencil className="mr-2 inline h-4 w-4" />Edit
              </Button>
              <Button type="button" variant="default" isLoading={isSending} onClick={handleSend}>
                <Send className="mr-2 inline h-4 w-4" />Mark as Sent
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowCancelModal(true)}>
                <XCircle className="mr-2 inline h-4 w-4" />Cancel
              </Button>
            </>
          ) : null}
        </div>
        {isLoading || !item ? (
          <div className="flex h-64 items-center justify-center text-muted">Loading...</div>
        ) : (
          <div className="flex flex-col gap-6">
            <section className="rounded-sm border border-base bg-surface p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-body">{item.invoiceNumber}</h1>
                  <p className="text-sm text-muted">Sales Invoice</p>
                </div>
                <TradingStatusBadge status={item.status} className="text-sm" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <InfoRow label="Invoice Date" value={formatDate(item.invoiceDate)} />
                <InfoRow label="Due Date" value={formatDate(item.dueDate)} />
                <InfoRow label="Customer" value={item.customerName} />
                <InfoRow label="Warehouse" value={item.warehouseName} />
                <InfoRow label="Delivery Challan" value={item.dcNumber} />
                <InfoRow label="Sales Order" value={item.soNumber} />
                <InfoRow label="Reference No." value={item.referenceNo} />
                <InfoRow label="Notes" value={item.notes} />
              </div>
            </section>
            <section className="rounded-sm border border-base bg-surface shadow-sm">
              <div className="border-b border-base px-6 py-4"><h2 className="text-base font-semibold text-body">Invoice Items</h2></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-base bg-surface-2">
                      <th className="px-4 py-2.5 text-left font-medium text-muted">#</th>
                      <th className="px-4 py-2.5 text-left font-medium text-muted">Product</th>
                      <th className="px-4 py-2.5 text-right font-medium text-muted">Qty</th>
                      <th className="px-4 py-2.5 text-right font-medium text-muted">Unit Price</th>
                      <th className="px-4 py-2.5 text-right font-medium text-muted">Tax</th>
                      <th className="px-4 py-2.5 text-right font-medium text-muted">Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.lines.map((line, i) => (
                      <tr key={i} className="border-b border-base last:border-0">
                        <td className="px-4 py-3 text-muted">{i + 1}</td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-body">{line.productName}</span>
                          {line.productCode ? <span className="ml-2 font-mono text-xs text-muted">{line.productCode}</span> : null}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-body">{line.quantity}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-body">{formatCurrency(line.unitPrice)}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-muted">{line.taxRate ? `${line.taxRate}%` : '—'}</td>
                        <td className="px-4 py-3 text-right tabular-nums font-medium text-body">{formatCurrency(line.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-base px-6 py-4">
                <div className="ml-auto max-w-xs space-y-2">
                  <div className="flex justify-between text-sm text-muted">
                    <span>Subtotal</span><span className="tabular-nums">{formatCurrency(item.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted">
                    <span>Tax</span><span className="tabular-nums">{formatCurrency(item.taxAmount)}</span>
                  </div>
                  {item.discount > 0 ? (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span><span className="tabular-nums">-{formatCurrency(item.discount)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between border-t border-base pt-2 text-base font-semibold text-body">
                    <span>Total</span><span className="tabular-nums">{formatCurrency(item.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted">
                    <span>Paid</span><span className="tabular-nums text-green-600">{formatCurrency(item.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span>Balance</span><span className={`tabular-nums ${item.balanceAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(item.balanceAmount)}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
        <ConfirmModal open={showCancelModal} title="Cancel invoice" message={`Cancel "${item?.invoiceNumber}"?`}
          confirmLabel="Cancel Invoice" variant="danger" isLoading={isCancelling} onConfirm={handleCancel} onCancel={() => !isCancelling && setShowCancelModal(false)} />
      </UserLayout>
    </ModulePermissionGuard>
  );
};
