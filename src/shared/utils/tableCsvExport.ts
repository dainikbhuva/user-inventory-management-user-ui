import type { DataTableColumn } from '../../components/common/DataTable';
import { buildExportFilename, downloadCsv } from './exportCsv';

export type CsvColumnDef<T> = {
  header: string;
  getValue: (row: T, index: number) => string | number | null | undefined;
};

export const exportTableCsv = <T>(
  filenameBase: string,
  columns: CsvColumnDef<T>[],
  rows: T[]
): void => {
  if (rows.length === 0) return;
  downloadCsv(
    buildExportFilename(filenameBase),
    columns.map((col) => col.header),
    rows.map((row, index) => columns.map((col) => col.getValue(row, index)))
  );
};

export const exportFromDataTableColumns = <T>(
  filenameBase: string,
  columns: DataTableColumn<T>[],
  rows: T[]
): void => {
  const exportColumns = columns.filter(
    (col) => col.csvValue && col.header !== 'Actions' && col.header !== '#'
  );
  if (exportColumns.length === 0 || rows.length === 0) return;

  downloadCsv(
    buildExportFilename(filenameBase),
    exportColumns.map((col) => col.header),
    rows.map((row, index) =>
      exportColumns.map((col) => col.csvValue!(row, index))
    )
  );
};
