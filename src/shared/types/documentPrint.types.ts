export interface PrintDocumentColumn {
  key: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  width?: string;
}

export interface PrintDocumentLine {
  [key: string]: string | number | undefined;
}

export interface PrintDocumentParty {
  label: string;
  name: string;
  details?: string[];
}

export interface PrintDocumentMetaRow {
  label: string;
  value?: string;
}

export interface PrintDocumentTotal {
  label: string;
  value: string;
  emphasis?: boolean;
}

export interface PrintDocumentData {
  documentTitle: string;
  documentNumber: string;
  documentDate?: string;
  status?: string;
  companyName?: string;
  meta?: PrintDocumentMetaRow[];
  party?: PrintDocumentParty;
  columns: PrintDocumentColumn[];
  lines: PrintDocumentLine[];
  totals?: PrintDocumentTotal[];
  notes?: string;
  footerText?: string;
}
