import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { DataTable, type DataTableColumn } from '../../../components/common/DataTable';
import { SlideOver } from '../../../components/common/SlideOver';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { Button } from '../../../components/ui/Button';
import { userDocumentService } from '../../../services/userDocument.service';
import type { PortalUserDocumentRecord } from '../../../shared/types/userDocument.types';
import type { UserDocumentFormValues } from '../../../shared/types/userDocument.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import {
  UserDocumentForm,
  emptyDocumentForm,
  toDocumentFormValues,
} from './UserDocumentForm';

const formatDate = (value?: string) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const openBlob = (blob: Blob, fileName: string, mode: 'view' | 'download') => {
  const url = URL.createObjectURL(blob);
  if (mode === 'view') {
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    return;
  }
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

interface UserDocumentsTabProps {
  userId: string;
  userName: string;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export const UserDocumentsTab = ({
  userId,
  userName,
  canCreate = true,
  canEdit = true,
  canDelete = true,
}: UserDocumentsTabProps) => {
  const [documents, setDocuments] = useState<PortalUserDocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editing, setEditing] = useState<PortalUserDocumentRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PortalUserDocumentRecord | null>(null);
  const [formValues, setFormValues] = useState<UserDocumentFormValues>(emptyDocumentForm());

  const loadDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      setDocuments(await userDocumentService.getDocuments(userId));
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load documents'));
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const openCreateForm = () => {
    setFormMode('create');
    setEditing(null);
    setFormValues(emptyDocumentForm());
    setFormOpen(true);
  };

  const openEditForm = (document: PortalUserDocumentRecord) => {
    setFormMode('edit');
    setEditing(document);
    setFormValues(toDocumentFormValues(document));
    setFormOpen(true);
  };

  const closeForm = () => {
    if (isSubmitting) return;
    setFormOpen(false);
    setEditing(null);
    setFormValues(emptyDocumentForm());
  };

  const handleSave = async (values: UserDocumentFormValues) => {
    if (!values.documentType) {
      toast.error('Please select a document type.');
      return;
    }
    if (!values.title.trim()) {
      toast.error('Please enter a document title.');
      return;
    }
    if (formMode === 'create' && !values.file) {
      toast.error('Please choose a file to upload.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (formMode === 'create') {
        await userDocumentService.createDocument(userId, {
          documentType: values.documentType,
          title: values.title,
          notes: values.notes,
          file: values.file!,
        });
        toast.success('Document added successfully.');
      } else if (editing) {
        await userDocumentService.updateDocument(userId, editing.id, {
          documentType: values.documentType,
          title: values.title,
          notes: values.notes,
          file: values.file,
        });
        toast.success('Document updated successfully.');
      }
      closeForm();
      await loadDocuments();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to save document'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleView = async (document: PortalUserDocumentRecord) => {
    try {
      const blob = await userDocumentService.fetchFile(userId, document.id, 'view');
      openBlob(blob, document.fileName, 'view');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to open document'));
    }
  };

  const handleDownload = async (document: PortalUserDocumentRecord) => {
    try {
      const blob = await userDocumentService.fetchFile(userId, document.id, 'download');
      openBlob(blob, document.fileName, 'download');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to download document'));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await userDocumentService.deleteDocument(userId, deleteTarget.id);
      toast.success('Document deleted successfully.');
      setDeleteTarget(null);
      await loadDocuments();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete document'));
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: DataTableColumn<PortalUserDocumentRecord>[] = useMemo(
    () => [
      {
        header: '#',
        width: '4%',
        align: 'center',
        render: (_row, index) => <span className="text-muted tabular-nums">{index + 1}</span>,
      },
      {
        header: 'Type',
        render: (row) => <span className="text-sm text-body">{row.documentTypeLabel}</span>,
      },
      {
        header: 'Title',
        render: (row) => <span className="font-medium text-body">{row.title}</span>,
      },
      {
        header: 'File',
        render: (row) => (
          <span className="text-sm text-muted">
            {row.fileName} · {formatFileSize(row.fileSize)}
          </span>
        ),
      },
      {
        header: 'Uploaded',
        render: (row) => <span className="text-sm text-muted">{formatDate(row.createdAt)}</span>,
      },
      {
        header: 'Actions',
        width: '11rem',
        align: 'center',
        render: (row) => (
          <div className="inline-flex flex-nowrap items-center justify-center gap-1">
            <button
              type="button"
              title="View"
              onClick={() => handleView(row)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-base bg-surface text-muted transition hover:border-primary hover:text-primary"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              type="button"
              title="Download"
              onClick={() => handleDownload(row)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-base bg-surface text-muted transition hover:border-primary hover:text-primary"
            >
              <Download className="h-4 w-4" />
            </button>
            {canEdit ? (
              <button
                type="button"
                title="Edit"
                onClick={() => openEditForm(row)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-base bg-surface text-muted transition hover:border-primary hover:text-primary"
              >
                <Pencil className="h-4 w-4" />
              </button>
            ) : null}
            {canDelete ? (
              <button
                type="button"
                title="Delete"
                onClick={() => setDeleteTarget(row)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-base bg-surface text-muted transition hover:border-red-500 hover:bg-red-500/10 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        ),
      },
    ],
    [userId, canEdit, canDelete]
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-body">Employee documents</h2>
          <p className="mt-1 text-sm text-muted">
            Upload and manage documents for {userName}.
          </p>
        </div>
        {canCreate ? (
          <Button type="button" onClick={openCreateForm}>
            <Plus className="mr-2 h-4 w-4" />
            Add document
          </Button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-sm border border-base bg-surface shadow-sm">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-muted">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-muted">
            No documents yet. Click &quot;Add document&quot; to upload the first file.
          </div>
        ) : (
          <DataTable columns={columns} data={documents} rowKey={(row) => row.id} />
        )}
      </div>

      <SlideOver
        open={formOpen}
        onClose={closeForm}
        title={formMode === 'create' ? 'Add document' : 'Edit document'}
        description={
          formMode === 'create'
            ? 'Upload a new employee document.'
            : 'Update document details or replace the file.'
        }
        footer={
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={closeForm} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="user-document-form"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : formMode === 'create' ? 'Save document' : 'Update document'}
            </Button>
          </div>
        }
      >
        <UserDocumentForm
          mode={formMode}
          value={formValues}
          existingFileName={editing?.fileName}
          isSubmitting={isSubmitting}
          onSubmit={handleSave}
        />
      </SlideOver>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete document"
        message={
          deleteTarget
            ? `Delete "${deleteTarget.title}" (${deleteTarget.fileName})? This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => !isDeleting && setDeleteTarget(null)}
      />
    </div>
  );
};
