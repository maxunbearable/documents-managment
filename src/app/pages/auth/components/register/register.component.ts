import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../shared/services';
import { MaterialModule } from '../../../../shared';
import { RegisterRequest } from '../../../../shared/models';

@Component({
  selector: 'dm-register',
  templateUrl: './register.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule
  ],
  styles: [`
    :host {
      display: flex;
      flex: 1;
      justify-content: center;
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['USER', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.checkPasswords });
  }

  checkPasswords(group: FormGroup) {
    const pass = group.get('password')?.value;
    const confirmPass = group.get('confirmPassword')?.value;
    return pass === confirmPass ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    const registerData: RegisterRequest = {
      username: this.registerForm.get('username')?.value,
      email: this.registerForm.get('email')?.value,
      password: this.registerForm.get('password')?.value,
      fullName: this.registerForm.get('fullName')?.value,
      role: this.registerForm.get('role')?.value,
    };

    this.authService.register(registerData).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('Registration successful!', 'Close', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open(error.error?.message || 'Registration failed. Please try again.', 'Close', {
          duration: 5000
        });
      }
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
