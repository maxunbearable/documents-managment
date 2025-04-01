import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentService } from '../../services';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-document-edit',
  templateUrl: './document-edit.component.html'
})
export class DocumentEditComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private documentService = inject(DocumentService);
  private snackBar = inject(MatSnackBar);

  document = signal<any>(null);
  loading = signal<boolean>(true);
  saving = signal<boolean>(false);
  error = signal<string | null>(null);

  editForm: FormGroup;

  constructor() {
    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]]
    });
  }

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
        this.error.set('Failed to load document. It may not exist or you may not have permission to edit it.');
        return of(null as unknown as Document);
      }),
      finalize(() => this.loading.set(false))
    ).subscribe((doc: any) => {
      if (doc) {
        // Check if document is editable (DRAFT or REVOKE status)
        if (doc.status !== 'DRAFT' && doc.status !== 'REVOKE') {
          this.error.set('This document cannot be edited in its current status.');
          return;
        }

        this.document.set(doc);
        this.editForm.patchValue({
          name: doc.name
        });
      }
    });
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
        this.router.navigate(['/documents', this.document()!.id]);
      }
    });
  }
}
