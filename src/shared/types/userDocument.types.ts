import type { UserDocumentType } from '../constants/userDocumentType';

export interface PortalUserDocumentRecord {
  id: string;
  userId: string;
  documentType: UserDocumentType;
  documentTypeLabel: string;
  title: string;
  notes?: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  uploadedBy?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserDocumentFormValues {
  documentType: UserDocumentType | '';
  title: string;
  notes: string;
  file: File | null;
}
