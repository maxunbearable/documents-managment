import { Component, OnInit, signal, ViewChild, inject, DestroyRef, computed } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../shared/services';
import { DocumentService } from '../../services';
import { MaterialModule } from '../../../../shared';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { map } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { DocumentStatus } from '../../models';

@Component({
  selector: 'dm-document-list',
  templateUrl: './document-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    RouterLink,
    StatusBadgeComponent
  ],
  styles: [`
    :host {
      display: flex;
      flex: 1;
    }
  `]
})
export class DocumentListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private documentService = inject(DocumentService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  documents = this.documentService.documents;
  totalCount = this.documentService.totalCount;
  loading = this.documentService.loading;
  currentUser$ = this.authService.currentUser$;
  isReviewer = toSignal(this.currentUser$.pipe(map(user => user?.role === 'REVIEWER')));

  filterForm: FormGroup;

  pageSize = signal<number>(10);
  currentPage = signal<number>(0);
  sortActive = signal<string>('updatedAt');
  sortDirection = signal<'asc' | 'desc'>('desc');

  private readonly defaultColumns = ['name', 'status', 'updatedAt'];
  readonly DocumentStatus = DocumentStatus;

  displayedColumns = computed<string[]>(() => {
    return this.isReviewer() ? [...this.defaultColumns, 'creator', 'actions'] : [...this.defaultColumns, 'actions'];
  });

  constructor() {
    this.filterForm = this.fb.group({
      status: [''],
      creatorEmail: ['']
    });
  }

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    const filters = this.filterForm.value;
    let creatorEmail;

    if (this.isReviewer()) {
      creatorEmail = filters.creatorEmail;
    }

    this.documentService.getDocuments(
      this.currentPage() + 1,
      this.pageSize(),
      `${this.sortActive()}:${this.sortDirection()}`,
      filters.status,
      creatorEmail
    ).subscribe();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadDocuments();
  }

  onSortChange(sort: Sort): void {
    if (sort.direction) {
      this.sortActive.set(sort.active);
      this.sortDirection.set(sort.direction as 'asc' | 'desc');
    } else {
      this.sortActive.set('updatedAt');
      this.sortDirection.set('desc');
    }

    this.loadDocuments();
  }

  applyFilter(): void {
    this.currentPage.set(0);
    this.loadDocuments();
  }

  resetFilter(): void {
    this.filterForm.reset();
    this.currentPage.set(0);
    this.loadDocuments();
  }

  sendToReview(id: string): void {
    this.documentService.sendToReview(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.loadDocuments());
  }

  revokeReview(id: string): void {
    this.documentService.revokeReview(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.loadDocuments());
  }

  deleteDocument(id: string): void {
    if (confirm('Are you sure you want to delete this document?')) {
      this.documentService.deleteDocument(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.loadDocuments());
    }
  }

  changeStatus(id: string, status: DocumentStatus): void {
    this.documentService.changeStatus(id, { status }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.loadDocuments());
  }
}
