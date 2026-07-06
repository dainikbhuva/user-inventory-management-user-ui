export const formatPrintDate = (value?: string | Date | null) => {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatPrintCurrency = (value?: number | null) => {
  const amount = value ?? 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatPrintNumber = (value?: number | null, fractionDigits = 2) => {
  const num = value ?? 0;
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  }).format(num);
};

/** Browser PDF save uses document.title — keep it readable and filename-safe. */
export const formatPrintDocumentTitle = (documentTitle: string, documentNumber?: string) => {
  const parts = [documentTitle, documentNumber?.trim()].filter(Boolean);
  return parts
    .join(' - ')
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
};
