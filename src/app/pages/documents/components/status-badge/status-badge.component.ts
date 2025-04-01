import { Component, Input } from '@angular/core';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-status-badge',
  template: `
    <span [ngClass]="getStatusClass()">
      {{ getStatusText() }}
    </span>
  `,
  standalone: true,
  imports: [
    NgClass
  ],
  styles: []
})
export class StatusBadgeComponent {
  @Input() status: string = '';

  getStatusClass(): string {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';

    switch (this.status) {
      case 'DRAFT':
        return `${baseClasses} bg-gray-200 text-gray-800`;
      case 'REVOKE':
        return `${baseClasses} bg-orange-200 text-orange-800`;
      case 'READY_FOR_REVIEW':
        return `${baseClasses} bg-blue-200 text-blue-800`;
      case 'UNDER_REVIEW':
        return `${baseClasses} bg-purple-200 text-purple-800`;
      case 'APPROVED':
        return `${baseClasses} bg-green-200 text-green-800`;
      case 'DECLINED':
        return `${baseClasses} bg-red-200 text-red-800`;
      default:
        return `${baseClasses} bg-gray-200 text-gray-800`;
    }
  }

  getStatusText(): string {
    switch (this.status) {
      case 'DRAFT':
        return 'Draft';
      case 'REVOKE':
        return 'Revoked';
      case 'READY_FOR_REVIEW':
        return 'Ready for Review';
      case 'UNDER_REVIEW':
        return 'Under Review';
      case 'APPROVED':
        return 'Approved';
      case 'DECLINED':
        return 'Declined';
      default:
        return this.status;
    }
  }
}
