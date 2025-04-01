import {Injectable, signal} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import {DocumentsResponse, DocumentUpdate, StatusUpdate} from '../models';
import {environment} from '../../../shared';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private readonly API_URL = environment.apiUrl + '/document';

  // Using signals
  documents = signal<Document[]>([]);
  totalCount = signal<number>(0);
  loading = signal<boolean>(false);

  constructor(private http: HttpClient) {}

  getDocuments(page: number = 1, size: number = 10, sort?: string, status?: string, creatorId?: string, creatorEmail?: string): Observable<DocumentsResponse> {
    this.loading.set(true);

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    // if (sort) params = params.set('sort', sort);
    if (status) params = params.set('status', status);
    if (creatorId) params = params.set('creatorId', creatorId);
    if (creatorEmail) params = params.set('creatorEmail', creatorEmail);

    return this.http.get<DocumentsResponse>(this.API_URL, { params }).pipe(
      tap(response => {
        this.documents.set(response.results as any);
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

  updateDocument(id: string, update: DocumentUpdate): Observable<any> {
    return this.http.patch(`${this.API_URL}/${id}`, update);
  }

  deleteDocument(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }

  sendToReview(id: string): Observable<any> {
    return this.http.post(`${this.API_URL}/${id}/send-to-review`, {});
  }

  revokeReview(id: string): Observable<any> {
    return this.http.post(`${this.API_URL}/${id}/revoke-review`, {});
  }

  changeStatus(id: string, statusUpdate: StatusUpdate): Observable<any> {
    return this.http.post(`${this.API_URL}/${id}/change-status`, statusUpdate);
  }
}
