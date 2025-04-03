import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { DocumentsResponse, DocumentUpdate, StatusUpdate } from '../models';
import { environment } from '../../../shared';
import { Document } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private readonly API_URL = environment.apiUrl + '/document';

  documents = signal<Document[]>([]);
  totalCount = signal<number>(0);
  loading = signal<boolean>(false);

  constructor(private http: HttpClient) {}

  getDocuments(page: number = 1, size: number = 10, sort?: string, status?: string, creatorId?: string, creatorEmail?: string): Observable<DocumentsResponse> {
    this.loading.set(true);

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (status) params = params.set('status', status);
    if (creatorId) params = params.set('creatorId', creatorId);
    if (creatorEmail) params = params.set('creatorEmail', creatorEmail);

    return this.http.get<DocumentsResponse>(this.API_URL, { params }).pipe(
      tap(response => {
        this.documents.set(response.results);
        this.totalCount.set(response.count);
        this.loading.set(false);
      })
    );
  }

  getDocument(id: string): Observable<Document> {
    return this.http.get<Document>(`${this.API_URL}/${id}`);
  }

  createDocument(formData: FormData): Observable<Document> {
    return this.http.post<Document>(this.API_URL, formData);
  }

  updateDocument(id: string, update: DocumentUpdate): Observable<Document> {
    return this.http.patch(`${this.API_URL}/${id}`, update) as Observable<Document>;
  }

  deleteDocument(id: string): Observable<Document> {
    return this.http.delete(`${this.API_URL}/${id}`) as Observable<Document>;
  }

  sendToReview(id: string): Observable<Document> {
    return this.http.post(`${this.API_URL}/${id}/send-to-review`, {}) as Observable<Document>;
  }

  revokeReview(id: string): Observable<Document> {
    return this.http.post(`${this.API_URL}/${id}/revoke-review`, {}) as Observable<Document>;
  }

  changeStatus(id: string, statusUpdate: StatusUpdate): Observable<Document> {
    return this.http.post(`${this.API_URL}/${id}/change-status`, statusUpdate) as Observable<Document>;
  }
}
