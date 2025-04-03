import { HttpClient } from '@angular/common/http';
import { DocumentService } from './document.service';
import { Document, DocumentsResponse, DocumentStatus, DocumentUpdate, StatusUpdate } from '../models';
import { of, throwError } from 'rxjs';

describe('DocumentService', () => {
  let service: DocumentService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  const apiUrl = 'http://api.url/document';

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', [
      'get', 'post', 'patch', 'delete'
    ]);

    service = new DocumentService(httpClientSpy);
    (service as any).API_URL = apiUrl;
  });

  describe('getDocument', () => {
    it('should fetch single document', () => {
      const mockDoc = { id: '1', name: 'Test Doc' } as Document;
      httpClientSpy.get.and.returnValue(of(mockDoc));

      service.getDocument('1').subscribe(res => {
        expect(res).toEqual(mockDoc);
      });

      expect(httpClientSpy.get).toHaveBeenCalledWith(`${apiUrl}/1`);
    });
  });

  describe('createDocument', () => {
    it('should POST form data', () => {
      const formData = new FormData();
      formData.append('name', 'New Doc');
      httpClientSpy.post.and.returnValue(of({} as Document));

      service.createDocument(formData).subscribe();

      expect(httpClientSpy.post).toHaveBeenCalledWith(apiUrl, formData);
    });
  });

  describe('updateDocument', () => {
    it('should PATCH document', () => {
      const update: DocumentUpdate = { name: 'Updated Name' };
      httpClientSpy.patch.and.returnValue(of({} as Document));

      service.updateDocument('1', update).subscribe();

      expect(httpClientSpy.patch).toHaveBeenCalledWith(
        `${apiUrl}/1`,
        update
      );
    });
  });

  describe('deleteDocument', () => {
    it('should DELETE document', () => {
      httpClientSpy.delete.and.returnValue(of({} as Document));

      service.deleteDocument('1').subscribe();

      expect(httpClientSpy.delete).toHaveBeenCalledWith(`${apiUrl}/1`);
    });
  });

  describe('reviewActions', () => {
    it('should send to review', () => {
      httpClientSpy.post.and.returnValue(of({} as Document));

      service.sendToReview('1').subscribe();

      expect(httpClientSpy.post).toHaveBeenCalledWith(
        `${apiUrl}/1/send-to-review`,
        {}
      );
    });

    it('should revoke review', () => {
      httpClientSpy.post.and.returnValue(of({} as Document));

      service.revokeReview('1').subscribe();

      expect(httpClientSpy.post).toHaveBeenCalledWith(
        `${apiUrl}/1/revoke-review`,
        {}
      );
    });
  });

  describe('changeStatus', () => {
    it('should POST status update', () => {
      const statusUpdate: StatusUpdate = { status: DocumentStatus.APPROVED };
      httpClientSpy.post.and.returnValue(of({} as Document));

      service.changeStatus('1', statusUpdate).subscribe();

      expect(httpClientSpy.post).toHaveBeenCalledWith(
        `${apiUrl}/1/change-status`,
        statusUpdate
      );
    });
  });
});
