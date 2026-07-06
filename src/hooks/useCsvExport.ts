import { useCallback } from 'react';
import { exportTableCsv, type CsvColumnDef } from '../shared/utils/tableCsvExport';
import { toast } from '../shared/utils/toast';

export const useCsvExport = <T,>(
  filenameBase: string,
  columns: CsvColumnDef<T>[],
  rows: T[],
  canExport: boolean
) => {
  const handleExport = useCallback(() => {
    if (rows.length === 0) {
      toast.error('No records to export.');
      return;
    }
    exportTableCsv(filenameBase, columns, rows);
    toast.success('Export downloaded.');
  }, [filenameBase, columns, rows]);

  return {
    showExport: canExport,
    onExport: handleExport,
    exportDisabled: rows.length === 0,
  };
};
