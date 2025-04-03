import { Component, effect, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { DocumentStatus } from '../../models';

@Component({
  selector: 'dm-status-badge',
  template: `
    <span [ngClass]="statusClass">
      {{ statusText }}
    </span>
  `,
  standalone: true,
  imports: [
    NgClass
  ],
})
export class StatusBadgeComponent {
  status = input.required<DocumentStatus>();

  statusText: string = '';
  statusClass: string = '';

  constructor() {
    effect(() => {
      if (this.status()) {
        this.statusClass = this.getStatusClass();
        this.statusText = this.getStatusText();
      }
    });
  }

  getStatusClass(): string {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';

    switch (this.status()) {
      case DocumentStatus.DRAFT:
        return `${baseClasses} bg-gray-200 text-gray-800`;
      case DocumentStatus.REVOKE:
        return `${baseClasses} bg-orange-200 text-orange-800`;
      case DocumentStatus.READY_FOR_REVIEW:
        return `${baseClasses} bg-blue-200 text-blue-800`;
      case DocumentStatus.UNDER_REVIEW:
        return `${baseClasses} bg-purple-200 text-purple-800`;
      case DocumentStatus.APPROVED:
        return `${baseClasses} bg-green-200 text-green-800`;
      case DocumentStatus.DECLINED:
        return `${baseClasses} bg-red-200 text-red-800`;
      default:
        return `${baseClasses} bg-gray-200 text-gray-800`;
    }
  }

  getStatusText(): string {
    switch (this.status()) {
      case DocumentStatus.DRAFT:
        return 'Draft';
      case DocumentStatus.REVOKE:
        return 'Revoked';
      case DocumentStatus.READY_FOR_REVIEW:
        return 'Ready for Review';
      case DocumentStatus.UNDER_REVIEW:
        return 'Under Review';
      case DocumentStatus.APPROVED:
        return 'Approved';
      case DocumentStatus.DECLINED:
        return 'Declined';
      default:
        return this.status();
    }
  }
}
