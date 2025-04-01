import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DocumentService } from '../../services/document.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-document-upload',
  templateUrl: './document-upload.component.html'
})
export class DocumentUploadComponent {
  private fb = inject(FormBuilder);
  private documentService = inject(DocumentService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

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
      // Update form control value
      this.uploadForm.patchValue({ file: this.selectedFile });
    }
  }

  saveAsDraft(): void {
    if (this.uploadForm.invalid || !this.selectedFile) {
      return;
    }

    this.uploadDocument('DRAFT');
  }

  sendToReview(): void {
    if (this.uploadForm.invalid || !this.selectedFile) {
      return;
    }

    this.uploadDocument('READY_FOR_REVIEW');
  }

  private uploadDocument(status: 'DRAFT' | 'READY_FOR_REVIEW'): void {
    this.uploading = true;

    const formData = new FormData();
    formData.append('name', this.uploadForm.get('name')?.value);
    formData.append('file', this.selectedFile as File);
    formData.append('status', status);

    this.documentService.createDocument(formData).subscribe({
      next: (response) => {
        this.uploading = false;
        this.snackBar.open('Document uploaded successfully', 'Close', { duration: 3000 });

        if (status === 'READY_FOR_REVIEW') {
          // If sending to review, send additional request
          this.documentService.sendToReview((response as any).id).subscribe({
            next: () => this.router.navigate(['/documents']),
            error: (error) => {
              console.error('Error sending to review:', error);
              this.snackBar.open('Error sending document for review', 'Close', { duration: 3000 });
            }
          });
        } else {
          this.router.navigate(['/documents']);
        }
      },
      error: (error) => {
        this.uploading = false;
        console.error('Upload error:', error);
        this.snackBar.open('Error uploading document', 'Close', { duration: 3000 });
      }
    });
  }
}
