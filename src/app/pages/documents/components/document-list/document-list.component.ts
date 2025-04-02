import { Component, OnInit, signal, ViewChild, computed, inject } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {AuthService} from '../../../../shared/services';
import {DocumentService} from '../../services';
import {MaterialModule} from '../../../../shared';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {StatusBadgeComponent} from '../status-badge/status-badge.component';
import {map} from 'rxjs';

@Component({
  selector: 'app-document-list',
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

  // Services
  private documentService = inject(DocumentService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  // Signals
  documents = this.documentService.documents;
  totalCount = this.documentService.totalCount;
  loading = this.documentService.loading;
  currentUser$ = this.authService.currentUser$;

  // Computed signals
  isReviewer$ = this.currentUser$.pipe(map(user => user?.role === 'REVIEWER'));

  // Filter form
  filterForm: FormGroup;

  // Pagination and sorting state
  pageSize = signal<number>(10);
  currentPage = signal<number>(0);
  sortActive = signal<string>('updatedAt');
  sortDirection = signal<'asc' | 'desc'>('desc');

  // Column definitions
  displayedColumns: string[] = [];

  constructor() {
    this.filterForm = this.fb.group({
      status: [''],
      creatorEmail: ['']
    });

    // Set columns based on user role
    this.setDisplayColumns();
  }

  ngOnInit(): void {
    this.loadDocuments();
  }

  setDisplayColumns(): void {
    const baseColumns = ['name', 'status', 'updatedAt'];

    if (this.isReviewer$) {
      this.displayedColumns = [...baseColumns, 'creator', 'actions'];
    } else {
      this.displayedColumns = [...baseColumns, 'actions'];
    }
  }

  loadDocuments(): void {
    const filters = this.filterForm.value;
    let creatorId, creatorEmail;

    if (this.isReviewer$) {
      creatorEmail = filters.creatorEmail;
    }

    // For USER role, we don't need to filter as the API only returns user's own documents

    this.documentService.getDocuments(
      this.currentPage() + 1,
      this.pageSize(),
      `${this.sortActive()}:${this.sortDirection()}`,
      filters.status,
      creatorId,
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
      // Default sort
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

  // Document actions
  sendToReview(id: string): void {
    this.documentService.sendToReview(id).subscribe(() => {
      this.loadDocuments();
    });
  }

  revokeReview(id: string): void {
    this.documentService.revokeReview(id).subscribe(() => {
      this.loadDocuments();
    });
  }

  deleteDocument(id: string): void {
    if (confirm('Are you sure you want to delete this document?')) {
      this.documentService.deleteDocument(id).subscribe(() => {
        this.loadDocuments();
      });
    }
  }

  changeStatus(id: string, status: 'UNDER_REVIEW' | 'APPROVED' | 'DECLINED'): void {
    this.documentService.changeStatus(id, { status }).subscribe(() => {
      this.loadDocuments();
    });
  }
}
