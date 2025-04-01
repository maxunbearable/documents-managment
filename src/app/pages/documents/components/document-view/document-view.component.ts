import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, finalize, of } from 'rxjs';
import {DocumentService} from '../../services';
import {AuthService} from '../../../auth/services';
import {CommonModule} from '@angular/common';

declare var PSPDFKit: any;

@Component({
  selector: 'app-document-view',
  templateUrl: './document-view.component.html',
  standalone: true,
  imports: [
    CommonModule,
  ]
})
export class DocumentViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private documentService = inject(DocumentService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  document = signal<Document | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  pdfInstance: any = null;
  currentUser = this.authService.currentUser$;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.loadDocument(id);
    } else {
      this.router.navigate(['/documents']);
    }
  }

  loadDocument(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.documentService.getDocument(id).pipe(
      catchError(err => {
        console.error('Error loading document:', err);
        this.error.set('Failed to load document. It may not exist or you may not have permission to view it.');
        return of(null as unknown as Document);
      }),
      finalize(() => this.loading.set(false))
    ).subscribe(doc => {
      if (doc) {
        this.document.set(doc);
        this.initPDFViewer((doc as any).fileUrl);
      }
    });
  }

  initPDFViewer(fileUrl: string): void {
    // Initialize the PSPDFKit viewer with the document URL
    const container = document.getElementById('pspdfkit-container');

    if (container) {
      // Load the document using PSPDFKit
      PSPDFKit.load({
        container,
        document: fileUrl,
        baseUrl: '/assets/pspdfkit/',
        // Additional configuration options can be added here
      }).then((instance: any) => {
        this.pdfInstance = instance;
      }).catch((error: any) => {
        console.error('Error loading PDF:', error);
        this.error.set('Failed to load document viewer.');
      });
    }
  }

  ngOnDestroy(): void {
    if (this.pdfInstance) {
      this.pdfInstance.dispose();
    }
  }

  // User actions
  sendToReview(id: string): void {
    this.documentService.sendToReview(id).subscribe({
      next: () => {
        this.snackBar.open('Document sent for review', 'Close', { duration: 3000 });
        this.loadDocument(id);
      },
      error: (err) => {
        console.error('Error sending to review:', err);
        this.snackBar.open('Failed to send document for review', 'Close', { duration: 3000 });
      }
    });
  }

  revokeReview(id: string): void {
    this.documentService.revokeReview(id).subscribe({
      next: () => {
        this.snackBar.open('Document review revoked', 'Close', { duration: 3000 });
        this.loadDocument(id);
      },
      error: (err) => {
        console.error('Error revoking review:', err);
        this.snackBar.open('Failed to revoke document review', 'Close', { duration: 3000 });
      }
    });
  }

  deleteDocument(id: string): void {
    if (confirm('Are you sure you want to delete this document?')) {
      this.documentService.deleteDocument(id).subscribe({
        next: () => {
          this.snackBar.open('Document deleted', 'Close', { duration: 3000 });
          this.router.navigate(['/documents']);
        },
        error: (err) => {
          console.error('Error deleting document:', err);
          this.snackBar.open('Failed to delete document', 'Close', { duration: 3000 });
        }
      });
    }
  }

  // Reviewer actions
  changeStatus(id: string, status: 'UNDER_REVIEW' | 'APPROVED' | 'DECLINED'): void {
    this.documentService.changeStatus(id, { status }).subscribe({
      next: () => {
        const statusText = status === 'UNDER_REVIEW' ? 'marked as under review' :
          status === 'APPROVED' ? 'approved' : 'declined';
        this.snackBar.open(`Document ${statusText}`, 'Close', { duration: 3000 });
        this.loadDocument(id);
      },
      error: (err) => {
        console.error('Error changing status:', err);
        this.snackBar.open('Failed to update document status', 'Close', { duration: 3000 });
      }
    });
  }
}
