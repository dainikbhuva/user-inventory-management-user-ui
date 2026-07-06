import { useCallback } from 'react';
import type { DataTableColumn } from '../components/common/DataTable';
import { exportFromDataTableColumns } from '../shared/utils/tableCsvExport';
import { toast } from '../shared/utils/toast';

export const useListTableExport = <T,>(
  filenameBase: string,
  columns: DataTableColumn<T>[],
  rows: T[],
  canExport: boolean
) => {
  const handleExport = useCallback(() => {
    if (rows.length === 0) {
      toast.error('No records to export.');
      return;
    }
    exportFromDataTableColumns(filenameBase, columns, rows);
    toast.success('Export downloaded.');
  }, [filenameBase, columns, rows]);

  return {
    showExport: canExport,
    onExport: handleExport,
    exportDisabled: rows.length === 0,
  };
};
