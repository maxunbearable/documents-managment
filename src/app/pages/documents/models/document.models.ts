import { User } from '../../../shared/models';

export enum DocumentStatus {
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  DRAFT = 'DRAFT',
  REVOKE = 'REVOKE',
  READY_FOR_REVIEW = 'READY_FOR_REVIEW',
  UNDER_REVIEW = 'UNDER_REVIEW',
}

export interface Document {
  id: string;
  name: string;
  status: DocumentStatus;
  fileUrl: string;
  updatedAt: string;
  createdAt: string;
  creator: User;
}

export interface DocumentsResponse {
  results: Document[];
  count: number;
}

export interface DocumentUpdate {
  name: string;
}

export interface StatusUpdate {
  status: DocumentStatus;
}
