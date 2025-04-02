import { User } from '../../../shared/models';

export interface Document {
  id: string;
  name: string;
  status: 'DRAFT' | 'REVOKE' | 'READY_FOR_REVIEW' | 'UNDER_REVIEW' | 'APPROVED' | 'DECLINED';
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
  status: 'UNDER_REVIEW' | 'APPROVED' | 'DECLINED';
}
