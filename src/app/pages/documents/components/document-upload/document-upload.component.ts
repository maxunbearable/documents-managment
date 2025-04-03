import { Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DocumentService } from '../../services';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../../shared';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DocumentStatus } from '../../models';
import { EMPTY, switchMap, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'dm-document-upload',
  templateUrl: './document-upload.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    RouterLink
  ],
  styles: [`
    :host {
      display: flex;
      flex: 1;

      .cloud-icon {
        width: 40px;
        height: 40px;
      }
    }
  `]
})
export class DocumentUploadComponent {
  private fb = inject(FormBuilder);
  private documentService = inject(DocumentService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);

  uploadForm: FormGroup;
  selectedFile: File | null = null;
  uploading = false;

  constructor() {
    this.uploadForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      file: [null, Validators.required]
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
      this.uploadForm.patchValue({ file: this.selectedFile });
    }
  }

  saveAsDraft(): void {
    if (this.uploadForm.invalid || !this.selectedFile) {
      return;
    }

    this.uploadDocument(DocumentStatus.DRAFT);
  }

  sendToReview(): void {
    if (this.uploadForm.invalid || !this.selectedFile) {
      return;
    }

    this.uploadDocument(DocumentStatus.READY_FOR_REVIEW);
  }

  private uploadDocument(status: DocumentStatus): void {
    this.uploading = true;

    const formData = new FormData();
    formData.append('name', this.uploadForm.get('name')?.value);
    formData.append('file', this.selectedFile as File);
    formData.append('status', status);

    this.documentService.createDocument(formData).pipe(
      takeUntilDestroyed(this.destroyRef),
      switchMap(response => {
        this.uploading = false;
        this.snackBar.open('Document uploaded successfully', 'Close', { duration: 3000 });

        if (status === DocumentStatus.READY_FOR_REVIEW) {
          return this.documentService.sendToReview(response.id).pipe(
            tap(() => this.router.navigate(['/documents'])),
            catchError(error => {
              console.error('Error sending to review:', error);
              this.snackBar.open('Error sending document for review', 'Close', { duration: 3000 });
              return EMPTY;
            })
          );
        }
        this.router.navigate(['/documents']);
        return EMPTY;
      }),
      catchError(error => {
        this.uploading = false;
        console.error('Upload error:', error);
        this.snackBar.open('Error uploading document', 'Close', { duration: 3000 });
        return EMPTY;
      })
    ).subscribe();
  }
}
