import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, finalize, map, of, EMPTY } from 'rxjs';
import { DocumentService } from '../../services';
import { AuthService } from '../../../../shared/services';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../../shared';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { Document, DocumentStatus } from '../../models';
import { PdfViewerComponent } from '../pdf-viewer/pdf-viewer.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'dm-document-view-edit',
  templateUrl: './document-view-edit.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    StatusBadgeComponent,
    RouterLink,
    PdfViewerComponent,
    ReactiveFormsModule
  ]
})
export class DocumentViewEditComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private documentService = inject(DocumentService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);

  document = signal<Document>({} as Document);
  loading = signal<boolean>(true);
  saving = signal<boolean>(false);
  error = signal<string | null>(null);
  editMode = signal<boolean>(false);

  currentUser$ = this.authService.currentUser$;
  isReviewer$ = this.currentUser$.pipe(map(user => user?.role === 'REVIEWER'));

  editForm: FormGroup;
  readonly DocumentStatus = DocumentStatus;

  constructor() {
    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.editMode.set(this.route.snapshot.url.some(segment => segment.path === 'edit'));

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
      takeUntilDestroyed(this.destroyRef),
      catchError(err => {
        console.error('Error loading document:', err);
        this.error.set('Failed to load document. It may not exist or you may not have permission to access it.');
        return of(null as unknown as Document);
      }),
      finalize(() => this.loading.set(false))
    ).subscribe(doc => {
      if (doc) {
        this.document.set(doc as any);

        if (this.editMode()) {
          if (doc.status !== 'DRAFT' && doc.status !== DocumentStatus.REVOKE) {
            this.error.set('This document cannot be edited in its current status.');
            this.editMode.set(false);
            return;
          }

          this.editForm.patchValue({
            name: doc.name
          });
        }
      }
    });
  }

  toggleEditMode(): void {
    const newEditMode = !this.editMode();
    this.editMode.set(newEditMode);

    if (newEditMode) {
      this.editForm.patchValue({
        name: this.document().name
      });
    }
  }

  onSubmit(): void {
    if (this.editForm.invalid || !this.document()) {
      return;
    }

    this.saving.set(true);

    const update = {
      name: this.editForm.get('name')?.value
    };

    this.documentService.updateDocument(this.document()!.id, update).pipe(
      catchError(err => {
        console.error('Error updating document:', err);
        this.snackBar.open('Failed to update document', 'Close', { duration: 3000 });
        return of(null);
      }),
      finalize(() => this.saving.set(false))
    ).subscribe(response => {
      if (response !== null) {
        this.snackBar.open('Document updated successfully', 'Close', { duration: 3000 });
        this.editMode.set(false);
        this.loadDocument(this.document()!.id);
      }
    });
  }

  sendToReview(id: string): void {
    this.documentService.sendToReview(id).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError((err) => {
        console.error('Error sending to review:', err);
        this.snackBar.open('Failed to send document for review', 'Close', { duration: 3000 });
        return EMPTY;
      })
    ).subscribe(() => {
      this.snackBar.open('Document sent for review', 'Close', { duration: 3000 });
      this.loadDocument(id);
    });
  }

  revokeReview(id: string): void {
    this.documentService.revokeReview(id).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError((err) => {
        console.error('Error revoking review:', err);
        this.snackBar.open('Failed to revoke document review', 'Close', { duration: 3000 });
        return EMPTY;
      })
    ).subscribe(() => {
      this.snackBar.open('Document review revoked', 'Close', { duration: 3000 });
      this.loadDocument(id);
    });
  }

  deleteDocument(id: string): void {
    if (confirm('Are you sure you want to delete this document?')) {
      this.documentService.deleteDocument(id).pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((err) => {
          console.error('Error deleting document:', err);
          this.snackBar.open('Failed to delete document', 'Close', { duration: 3000 });
          return EMPTY;
        })
      ).subscribe(() => {
        this.snackBar.open('Document deleted', 'Close', { duration: 3000 });
        this.router.navigate(['/documents']);
      });
    }
  }

  changeStatus(id: string, status: DocumentStatus): void {
    this.documentService.changeStatus(id, { status }).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError((err) => {
        console.error('Error changing status:', err);
        this.snackBar.open('Failed to update document status', 'Close', { duration: 3000 });
        return EMPTY;
      })
    ).subscribe(() => {
      const statusText = status === DocumentStatus.UNDER_REVIEW ? 'marked as under review' :
        status === DocumentStatus.APPROVED ? 'approved' : 'declined';
      this.snackBar.open(`Document ${statusText}`, 'Close', { duration: 3000 });
      this.loadDocument(id);
    });
  }

  cancelEdit(): void {
    this.editMode.set(false);
  }
}
