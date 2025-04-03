import { Routes } from '@angular/router';
import { LoginComponent, RegisterComponent } from './pages/auth/components';
import { AuthGuard } from './shared/services';
import {
  DocumentViewEditComponent,
  DocumentListComponent,
  DocumentUploadComponent,
} from './pages/documents/components';
import { RoleGuard } from './pages/documents/services';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'documents', component: DocumentListComponent, canActivate: [AuthGuard] },
  { path: 'documents/upload', component: DocumentUploadComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['USER'] } },
  { path: 'documents/:id', component: DocumentViewEditComponent, canActivate: [AuthGuard] },
  { path: 'documents/:id/edit', component: DocumentViewEditComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['USER'] } },
  { path: '**', redirectTo: '/documents' }
];
