import { useEffect, useState, type FormEvent } from 'react';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { FormField } from '../../../components/ui/FormField';
import {
  USER_DOCUMENT_TYPES,
  USER_DOCUMENT_TYPE_LABELS,
} from '../../../shared/constants/userDocumentType';
import type { UserDocumentFormValues } from '../../../shared/types/userDocument.types';
import type { PortalUserDocumentRecord } from '../../../shared/types/userDocument.types';

const emptyForm = (): UserDocumentFormValues => ({
  documentType: '',
  title: '',
  notes: '',
  file: null,
});

const toFormValues = (document: PortalUserDocumentRecord): UserDocumentFormValues => ({
  documentType: document.documentType,
  title: document.title,
  notes: document.notes ?? '',
  file: null,
});

interface UserDocumentFormProps {
  mode: 'create' | 'edit';
  value?: UserDocumentFormValues;
  existingFileName?: string;
  isSubmitting?: boolean;
  onSubmit: (values: UserDocumentFormValues) => void | Promise<void>;
}

export const UserDocumentForm = ({
  mode,
  value,
  existingFileName,
  isSubmitting = false,
  onSubmit,
}: UserDocumentFormProps) => {
  const [form, setForm] = useState<UserDocumentFormValues>(value ?? emptyForm());

  useEffect(() => {
    setForm(value ?? emptyForm());
  }, [value]);

  const set = <K extends keyof UserDocumentFormValues>(key: K, val: UserDocumentFormValues[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit(form);
  };

  const isCreate = mode === 'create';

  return (
    <form id="user-document-form" onSubmit={handleSubmit} className="space-y-5">
      <FormField label="Document type" required>
        <Select
          value={form.documentType}
          onChange={(e) => set('documentType', e.target.value as UserDocumentFormValues['documentType'])}
          disabled={isSubmitting}
        >
          <option value="">Select document type</option>
          {USER_DOCUMENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {USER_DOCUMENT_TYPE_LABELS[type]}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="Title" required>
        <Input
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="e.g. Aadhaar card"
          disabled={isSubmitting}
        />
      </FormField>

      <FormField label="Notes">
        <textarea
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="Optional notes about this document"
          disabled={isSubmitting}
          rows={3}
          className="w-full rounded-sm border border-base bg-surface px-3 py-2 text-sm text-body outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
        />
      </FormField>

      <FormField label={isCreate ? 'File' : 'Replace file'} required={isCreate}>
        <Input
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,application/pdf,image/*"
          onChange={(e) => set('file', e.target.files?.[0] ?? null)}
          disabled={isSubmitting}
        />
        <p className="mt-1.5 text-xs text-muted">
          PDF, Word, JPEG, PNG, or WebP. Max 5 MB.
          {!isCreate && existingFileName ? ` Current file: ${existingFileName}` : ''}
        </p>
      </FormField>
    </form>
  );
};

export { emptyForm as emptyDocumentForm, toFormValues as toDocumentFormValues };
