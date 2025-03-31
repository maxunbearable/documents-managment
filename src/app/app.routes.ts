import { Routes } from '@angular/router';
import {LoginComponent, RegisterComponent} from './pages/auth/components';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '**', redirectTo: '/login' }
];
