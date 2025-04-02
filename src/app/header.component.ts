import { Component, inject } from '@angular/core';
import { AuthService } from './shared/services';
import { RouterLink } from '@angular/router';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { AsyncPipe, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'dm-header',
  template: `
    <mat-toolbar color="primary" class="fixed top-0 left-0 right-0 z-10">
      <div class="container mx-auto flex justify-between items-center">
        <a routerLink="/documents" class="text-white no-underline">
          <span class="text-xl font-bold">Document Management System</span>
        </a>
        @let currentUser = currentUser$ | async;
        @if (currentUser) {
          <div class="flex">
            <div class="flex items-center">
              <div class="mr-4 text-white">
                <div class="text-sm">{{ currentUser?.fullName }}</div>
                <div class="text-xs opacity-80">{{ currentUser?.role | titlecase }}</div>
              </div>
            </div>
            <button class="cursor-pointer" mat-icon-button (click)="logout()">
              <mat-icon style="color: white;">logout</mat-icon>
            </button>
          </div>
        }
      </div>
    </mat-toolbar>
  `,
  imports: [
    RouterLink,
    MatToolbar,
    MatIconButton,
    MatIcon,
    AsyncPipe,
    TitleCasePipe,
  ],
  standalone: true
})
export class HeaderComponent {

  private authService = inject(AuthService);

  currentUser$ = this.authService.currentUser$;

  logout(): void {
    this.authService.logout();
  }
}
