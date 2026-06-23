import { useCallback, useState } from 'react';
import { DocumentPrintPreview } from './DocumentPrintPreview';
import type { PrintDocumentData } from '../../shared/types/documentPrint.types';

export const useDocumentPrintPreview = () => {
  const [previewData, setPreviewData] = useState<PrintDocumentData | null>(null);

  const openPreview = useCallback((data: PrintDocumentData) => {
    setPreviewData(data);
  }, []);

  const closePreview = useCallback(() => {
    setPreviewData(null);
  }, []);

  const PreviewModal = () =>
    previewData ? (
      <DocumentPrintPreview open data={previewData} onClose={closePreview} />
    ) : null;

  return { openPreview, closePreview, PreviewModal };
};
