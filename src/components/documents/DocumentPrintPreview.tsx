import { useEffect, useRef } from 'react';
import { Printer, X } from 'lucide-react';
import { Button } from '../ui/Button';
import type { PrintDocumentData } from '../../shared/types/documentPrint.types';
import { formatPrintDocumentTitle } from '../../shared/utils/documentPrintFormat';
import { DocumentPrintSheet } from './DocumentPrintSheet';

interface DocumentPrintPreviewProps {
  open: boolean;
  data: PrintDocumentData;
  onClose: () => void;
}

const buildPrintDocumentHtml = (title: string, bodyHtml: string) => `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${title.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</title>
    <style>
      @page { size: A4 portrait; margin: 12mm; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: Arial, Helvetica, sans-serif;
        color: #111827;
        background: #fff;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    </style>
  </head>
  <body>${bodyHtml}</body>
</html>`;

export const DocumentPrintPreview = ({ open, data, onClose }: DocumentPrintPreviewProps) => {
  const printRef = useRef<HTMLDivElement>(null);
  const printTitle = formatPrintDocumentTitle(data.documentTitle, data.documentNumber);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const previousTitle = document.title;
    document.title = printTitle;
    return () => {
      document.title = previousTitle;
    };
  }, [open, printTitle]);

  const handlePrint = () => {
    const sheet = printRef.current;
    if (!sheet) return;

    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
    document.body.appendChild(iframe);

    const frameWindow = iframe.contentWindow;
    const frameDoc = iframe.contentDocument ?? frameWindow?.document;
    if (!frameWindow || !frameDoc) {
      iframe.remove();
      return;
    }

    document.title = printTitle;
    frameDoc.open();
    frameDoc.write(buildPrintDocumentHtml(printTitle, sheet.innerHTML));
    frameDoc.close();

    const runPrint = () => {
      frameWindow.focus();
      frameWindow.print();
      const cleanup = () => iframe.remove();
      frameWindow.addEventListener('afterprint', cleanup, { once: true });
      window.setTimeout(cleanup, 60_000);
    };

    if (frameDoc.readyState === 'complete') {
      runPrint();
    } else {
      iframe.onload = runPrint;
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
      <div className="flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-sm border border-base bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-base px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-body">{printTitle}</h2>
            <p className="text-sm text-muted">A4 preview — Print to send to printer or save as PDF</p>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="default" onClick={handlePrint}>
              <Printer className="mr-2 inline h-4 w-4" />
              Print
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-base text-muted transition hover:bg-surface-2 hover:text-body"
              aria-label="Close preview"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-auto bg-[#e5e7eb] p-6 dark:bg-[#1f2937]">
          <div className="mx-auto w-full max-w-[210mm] shadow-lg">
            <DocumentPrintSheet ref={printRef} data={data} />
          </div>
        </div>
      </div>
    </div>
  );
};
