export const formatCsvDate = (value?: string | null): string =>
  value ? new Date(value).toLocaleDateString('en-IN') : '';

export const formatCsvCurrency = (value: number): string => String(value);

export const formatCsvStatus = (value: string): string => value;
