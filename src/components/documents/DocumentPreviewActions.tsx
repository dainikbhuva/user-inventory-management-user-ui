import { DocumentPreviewButton } from './DocumentPreviewButton';
import { useDocumentPrintPreview } from './useDocumentPrintPreview';
import { useAuth } from '../../shared/auth/useAuth';
import type { PrintDocumentData } from '../../shared/types/documentPrint.types';

interface DocumentViewPreviewProps<T> {
  item: T | null;
  build: (item: T, ctx: { companyName?: string }) => PrintDocumentData;
}

export const DocumentViewPreview = <T,>({ item, build }: DocumentViewPreviewProps<T>) => {
  const { user } = useAuth();
  const { openPreview, PreviewModal } = useDocumentPrintPreview();

  if (!item) return <PreviewModal />;

  return (
    <>
      <DocumentPreviewButton
        onClick={() => openPreview(build(item, { companyName: user?.companyName }))}
      />
      <PreviewModal />
    </>
  );
};

