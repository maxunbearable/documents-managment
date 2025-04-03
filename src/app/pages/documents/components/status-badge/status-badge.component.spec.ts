import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { StatusBadgeComponent } from './status-badge.component';
import { DocumentStatus } from '../../models';
import { Component } from '@angular/core';

describe('StatusBadgeComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let testHost: TestHostComponent;
  let component: StatusBadgeComponent;

  @Component({
    imports: [
      StatusBadgeComponent
    ],
    template: `
      <dm-status-badge [status]="status"></dm-status-badge>`
  })
  class TestHostComponent {
    status!: DocumentStatus;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    testHost = fixture.componentInstance;
    const debugElement = fixture.debugElement.query(By.directive(StatusBadgeComponent));
    component = debugElement.componentInstance;
  });

  const testCases = [
    {
      status: DocumentStatus.DRAFT,
      expectedText: 'Draft',
      expectedClass: 'px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800'
    },
    {
      status: DocumentStatus.REVOKE,
      expectedText: 'Revoked',
      expectedClass: 'px-2 py-1 rounded-full text-xs font-medium bg-orange-200 text-orange-800'
    },
    {
      status: DocumentStatus.READY_FOR_REVIEW,
      expectedText: 'Ready for Review',
      expectedClass: 'px-2 py-1 rounded-full text-xs font-medium bg-blue-200 text-blue-800'
    },
    {
      status: DocumentStatus.UNDER_REVIEW,
      expectedText: 'Under Review',
      expectedClass: 'px-2 py-1 rounded-full text-xs font-medium bg-purple-200 text-purple-800'
    },
    {
      status: DocumentStatus.APPROVED,
      expectedText: 'Approved',
      expectedClass: 'px-2 py-1 rounded-full text-xs font-medium bg-green-200 text-green-800'
    },
    {
      status: DocumentStatus.DECLINED,
      expectedText: 'Declined',
      expectedClass: 'px-2 py-1 rounded-full text-xs font-medium bg-red-200 text-red-800'
    },
    {
      status: 'UNKNOWN' as DocumentStatus,
      expectedText: 'UNKNOWN',
      expectedClass: 'px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800'
    }
  ];

  testCases.forEach(({ status, expectedText, expectedClass }) => {
    it(`should set statusText and statusClass for ${status}`, () => {
      testHost.status = status;
      fixture.detectChanges();
      expect(component.statusText).toBe(expectedText);
      expect(component.statusClass).toBe(expectedClass);
    });
  });

  it('should update statusText and statusClass when status changes', () => {
    testHost.status = DocumentStatus.DRAFT;
    fixture.detectChanges();
    expect(component.statusText).toBe('Draft');
    expect(component.statusClass).toBe('px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800');

    testHost.status = DocumentStatus.APPROVED;
    fixture.detectChanges();
    expect(component.statusText).toBe('Approved');
    expect(component.statusClass).toBe('px-2 py-1 rounded-full text-xs font-medium bg-green-200 text-green-800');
  });

  it('should render correct text and classes', () => {
    testHost.status = DocumentStatus.DRAFT;
    fixture.detectChanges();
    let spanElement = fixture.debugElement.query(By.css('span')).nativeElement;
    expect(spanElement.textContent.trim()).toBe('Draft');
    expect(spanElement.className).toContain('bg-gray-200');

    testHost.status = DocumentStatus.APPROVED;
    fixture.detectChanges();
    spanElement = fixture.debugElement.query(By.css('span')).nativeElement;
    expect(spanElement.textContent.trim()).toBe('Approved');
    expect(spanElement.className).toContain('bg-green-200');
  });
});
