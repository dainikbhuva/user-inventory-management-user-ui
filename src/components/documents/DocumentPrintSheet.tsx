import { forwardRef } from 'react';
import type { PrintDocumentData } from '../../shared/types/documentPrint.types';

interface DocumentPrintSheetProps {
  data: PrintDocumentData;
}

export const DocumentPrintSheet = forwardRef<HTMLDivElement, DocumentPrintSheetProps>(({ data }, ref) => (
  <div
    ref={ref}
    style={{
      width: '210mm',
      minHeight: '297mm',
      background: '#ffffff',
      color: '#111827',
      padding: '14mm 12mm',
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '12px',
      lineHeight: 1.45,
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '18px' }}>
      <div>
        <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>
          {data.companyName || 'Company'}
        </div>
        <div style={{ fontSize: '13px', color: '#4b5563' }}>{data.documentTitle}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '16px', fontWeight: 700 }}>{data.documentNumber}</div>
        {data.documentDate ? (
          <div style={{ marginTop: '4px', color: '#4b5563' }}>Date: {data.documentDate}</div>
        ) : null}
        {data.status ? (
          <div style={{ marginTop: '4px', color: '#4b5563' }}>Status: {data.status}</div>
        ) : null}
      </div>
    </div>

    {data.meta?.length || data.party ? (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: data.party ? '1fr 1fr' : '1fr',
          gap: '16px',
          marginBottom: '18px',
          padding: '12px',
          border: '1px solid #e5e7eb',
          borderRadius: '4px',
          background: '#f9fafb',
        }}
      >
        {data.meta?.length ? (
          <div>
            {data.meta.map((row) => (
              <div key={row.label} style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                <span style={{ minWidth: '110px', color: '#6b7280' }}>{row.label}</span>
                <span style={{ fontWeight: 600 }}>{row.value || '—'}</span>
              </div>
            ))}
          </div>
        ) : null}
        {data.party ? (
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#6b7280', marginBottom: '6px' }}>
              {data.party.label}
            </div>
            <div style={{ fontWeight: 700, marginBottom: '4px' }}>{data.party.name}</div>
            {data.party.details?.map((line) => (
              <div key={line} style={{ color: '#374151' }}>{line}</div>
            ))}
          </div>
        ) : null}
      </div>
    ) : null}

    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
      <thead>
        <tr>
          {data.columns.map((col) => (
            <th
              key={col.key}
              style={{
                border: '1px solid #d1d5db',
                padding: '8px 6px',
                background: '#f3f4f6',
                fontSize: '11px',
                textTransform: 'uppercase',
                width: col.width,
                textAlign: col.align ?? 'left',
              }}
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.lines.length === 0 ? (
          <tr>
            <td
              colSpan={data.columns.length}
              style={{ border: '1px solid #d1d5db', padding: '12px', textAlign: 'center', color: '#6b7280' }}
            >
              No line items
            </td>
          </tr>
        ) : (
          data.lines.map((line, index) => (
            <tr key={index}>
              {data.columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    border: '1px solid #d1d5db',
                    padding: '8px 6px',
                    verticalAlign: 'top',
                    textAlign: col.align ?? 'left',
                  }}
                >
                  {line[col.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>

    {data.totals?.length ? (
      <div style={{ marginLeft: 'auto', width: '280px', marginBottom: '16px' }}>
        {data.totals.map((total) => (
          <div
            key={total.label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '12px',
              padding: '6px 0',
              borderBottom: '1px solid #e5e7eb',
              fontWeight: total.emphasis ? 700 : 500,
              fontSize: total.emphasis ? '14px' : '12px',
            }}
          >
            <span>{total.label}</span>
            <span>{total.value}</span>
          </div>
        ))}
      </div>
    ) : null}

    {data.notes ? (
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontWeight: 700, marginBottom: '4px' }}>Notes</div>
        <div style={{ color: '#374151', whiteSpace: 'pre-wrap' }}>{data.notes}</div>
      </div>
    ) : null}

    {data.footerText ? (
      <div
        style={{
          marginTop: '24px',
          paddingTop: '12px',
          borderTop: '1px solid #e5e7eb',
          color: '#6b7280',
          fontSize: '11px',
        }}
      >
        {data.footerText}
      </div>
    ) : null}
  </div>
));

DocumentPrintSheet.displayName = 'DocumentPrintSheet';
