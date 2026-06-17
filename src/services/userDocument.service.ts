import axiosClient from './api/axiosClient';
import { API_ENDPOINTS } from './api/endpoints';
import type { ApiResponse } from '../shared/types/api.types';
import type { PortalUserDocumentRecord } from '../shared/types/userDocument.types';
import type { UserDocumentType } from '../shared/constants/userDocumentType';

const FILE_REQUEST_TIMEOUT = 60000;

const buildFormData = (payload: {
  documentType: UserDocumentType;
  title: string;
  notes?: string;
  file?: File | null;
}) => {
  const formData = new FormData();
  formData.append('documentType', payload.documentType);
  formData.append('title', payload.title.trim());
  if (payload.notes?.trim()) {
    formData.append('notes', payload.notes.trim());
  }
  if (payload.file) {
    formData.append('file', payload.file);
  }
  return formData;
};

export const userDocumentService = {
  async getDocuments(userId: string): Promise<PortalUserDocumentRecord[]> {
    const response = await axiosClient.get<ApiResponse<{ items: PortalUserDocumentRecord[] }>>(
      API_ENDPOINTS.USERS.DOCUMENTS(userId)
    );
    return response.data.data?.items ?? [];
  },

  async createDocument(
    userId: string,
    payload: {
      documentType: UserDocumentType;
      title: string;
      notes?: string;
      file: File;
    }
  ): Promise<PortalUserDocumentRecord> {
    const response = await axiosClient.post<ApiResponse<{ document: PortalUserDocumentRecord }>>(
      API_ENDPOINTS.USERS.DOCUMENTS(userId),
      buildFormData(payload),
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: FILE_REQUEST_TIMEOUT,
      }
    );
    return response.data.data!.document;
  },

  async updateDocument(
    userId: string,
    documentId: string,
    payload: {
      documentType?: UserDocumentType;
      title?: string;
      notes?: string;
      file?: File | null;
    }
  ): Promise<PortalUserDocumentRecord> {
    const formData = new FormData();
    if (payload.documentType) {
      formData.append('documentType', payload.documentType);
    }
    if (payload.title !== undefined) {
      formData.append('title', payload.title.trim());
    }
    if (payload.notes !== undefined) {
      formData.append('notes', payload.notes.trim());
    }
    if (payload.file) {
      formData.append('file', payload.file);
    }

    const response = await axiosClient.put<ApiResponse<{ document: PortalUserDocumentRecord }>>(
      API_ENDPOINTS.USERS.DOCUMENT_BY_ID(userId, documentId),
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: FILE_REQUEST_TIMEOUT,
      }
    );
    return response.data.data!.document;
  },

  async deleteDocument(userId: string, documentId: string): Promise<void> {
    await axiosClient.delete(API_ENDPOINTS.USERS.DOCUMENT_BY_ID(userId, documentId));
  },

  async fetchFile(
    userId: string,
    documentId: string,
    mode: 'view' | 'download'
  ): Promise<Blob> {
    const url =
      mode === 'view'
        ? API_ENDPOINTS.USERS.DOCUMENT_VIEW(userId, documentId)
        : API_ENDPOINTS.USERS.DOCUMENT_DOWNLOAD(userId, documentId);
    const response = await axiosClient.get<Blob>(url, {
      responseType: 'blob',
      timeout: FILE_REQUEST_TIMEOUT,
    });
    return response.data;
  },
};
