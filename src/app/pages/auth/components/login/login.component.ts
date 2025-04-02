import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../../shared/services';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MaterialModule } from '../../../../shared';
import { LoginRequest } from '../../../../shared/models';

@Component({
  selector: 'dm-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
  ],
  providers: [
    HttpClient,
  ],
  styles: [`
    :host {
      display: flex;
      flex: 1;
      justify-content: center;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    const loginData: LoginRequest = this.loginForm.value;

    this.authService.login(loginData).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/documents']);
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open(error.error?.message || 'Login failed. Please try again.', 'Close', {
          duration: 5000
        });
      }
    });
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }
}
